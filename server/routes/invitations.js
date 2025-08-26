import express from 'express';
import { randomBytes } from 'crypto';
import { createResponse } from '../utils/helpers.js';
import authenticate from '../middleware/auth.js';
import Invitation from '../models/Invitation.js';

const router = express.Router();

// Middleware to ensure user is SuperAdmin
const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'SuperAdmin') {
    return res
      .status(403)
      .json(createResponse(false, 'Access denied. SuperAdmin only.'));
  }
  next();
};

// Middleware to ensure user is School Admin
const requireSchoolAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res
      .status(403)
      .json(createResponse(false, 'Access denied. School Admin only.'));
  }
  next();
};

// Get invitations (SuperAdmin: all admins, School Admin: their school only)
router.get('/', authenticate, async (req, res) => {
  try {
    console.log('📥 Fetching invitations...');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const query = {};

    if (req.user.role === 'SuperAdmin') {
      // SuperAdmin: only Admin invitations
      query.role = 'Admin';
    } else if (req.user.role === 'Admin') {
      // School Admin: only their school, and not Admin role
      if (!req.user.school_id) {
        return res
          .status(400)
          .json(createResponse(false, 'School ID missing for admin.'));
      }
      query.school_id = req.user.school_id;
      query.role = { $in: ['Student', 'Teacher', 'Parent', 'Staff'] };
    } else {
      return res.status(403).json(createResponse(false, 'Access denied.'));
    }

    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.search) {
      query.email = { $regex: req.query.search, $options: 'i' };
    }

    const total = await Invitation.countDocuments(query);
    const invitations = await Invitation.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'fullName email');

    console.log(`✅ Found ${invitations.length} invitations`);
    res.json(
      createResponse(true, 'Invitations retrieved successfully', {
        invitations,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      }),
    );
  } catch (error) {
    console.error('❌ Error fetching invitations:', error);
    res.status(500).json(
      createResponse(false, 'Failed to fetch invitations', {
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      }),
    );
  }
});

// Create new invitation (SuperAdmin: only Admin, School Admin: only their school, only Student/Teacher/Parent/Staff)
router.post('/', authenticate, async (req, res) => {
  console.log('🔔 POST /invitations received:', req.body);
  try {
    const { users } = req.body;
    if (!users || !Array.isArray(users) || users.length === 0) {
      console.error('❌ No users array provided');
      return res
        .status(400)
        .json(createResponse(false, 'Users array is required'));
    }
    const createdInvitations = [];
    for (const user of users) {
      console.log('📝 Processing invitation for:', user.email);
      if (!user.email || !user.role) {
        console.warn('⚠️ Skipping invalid user:', user);
        continue;
      }
      // SuperAdmin can only invite Admins
      let invitationEmail = user.email;
      let emailForSending = user.email;
      if (req.user.role === 'SuperAdmin') {
        if (user.role !== 'Admin') {
          console.warn(
            '⚠️ SuperAdmin can only invite Admins. Skipping:',
            user.email,
          );
          continue;
        }
        // Extract base email for sending (before any + or - alias)
        // e.g. pixelmindschoolbridge-admin1@gmail.com => pixelmindschoolbridge@gmail.com
        const match = user.email.match(
          /^([\w.-]+?)(?:[-+][\w.-]+)?(@gmail\.com)$/i,
        );
        if (match) {
          emailForSending = match[1] + match[2];
        }
        // Save the alias as-is (no trailing dot)
        invitationEmail = user.email;
      } else if (req.user.role === 'Admin') {
        // School Admin can only invite Student, Teacher, Parent, Staff for their school
        if (!['Student', 'Teacher', 'Parent', 'Staff'].includes(user.role)) {
          console.warn(
            '⚠️ School Admin can only invite school roles. Skipping:',
            user.email,
          );
          continue;
        }
        if (!req.user.school_id) {
          console.error('❌ School Admin missing school_id');
          continue;
        }
        user.school_id = req.user.school_id;
        // Extract base email for sending (before any + or - alias)
        // e.g. pixelmindschoolbridge-student1@gmail.com => pixelmindschoolbridge@gmail.com
        const match = user.email.match(
          /^([\w.-]+?)(?:[-+][\w.-]+)?(@gmail\.com)$/i,
        );
        if (match) {
          emailForSending = match[1] + match[2];
        }
        // Save the alias as-is (no trailing dot)
        invitationEmail = user.email;
      } else {
        // Not allowed
        continue;
      }
      try {
        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours
        const invitation = new Invitation({
          email: invitationEmail.toLowerCase(),
          role: user.role,
          school_id: user.school_id || undefined,
          token,
          status: 'pending',
          expiresAt,
          createdBy: req.user.userId,
        });
        const savedInvitation = await invitation.save();
        console.log('✅ Invitation saved to database:', savedInvitation._id);
        try {
          console.log('📧 Sending invitation email to:', emailForSending);
          const { sendInvitationEmail } = await import(
            '../services/emailService.js'
          );
          await sendInvitationEmail(emailForSending, token);
          console.log('✅ Invitation email sent to', emailForSending);
          createdInvitations.push(savedInvitation);
        } catch (emailError) {
          console.error('❌ Error sending invitation email:', emailError);
          await Invitation.findByIdAndUpdate(savedInvitation._id, {
            status: 'failed',
            error: emailError.message,
          });
        }
      } catch (dbError) {
        console.error('❌ Database error:', dbError);
      }
    }
    if (createdInvitations.length === 0) {
      console.error('❌ No invitations were created successfully');
      return res
        .status(400)
        .json(createResponse(false, 'Failed to create any invitations'));
    }
    console.log(
      `🎉 Successfully created ${createdInvitations.length} invitations`,
    );
    res.status(201).json(
      createResponse(true, 'Invitations created successfully', {
        invitations: createdInvitations.map((invite) => ({
          id: invite._id,
          email: invite.email,
          role: invite.role,
          status: invite.status,
          expiresAt: invite.expiresAt,
        })),
      }),
    );
  } catch (error) {
    console.error('🔥 Error in POST /invitations:', error);
    res.status(500).json(
      createResponse(false, 'Failed to create invitations', {
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      }),
    );
  }
});

// Resend invitation
router.post(
  '/:id/resend',
  authenticate,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      // TODO: Implement actual resend logic
      res.json(createResponse(true, `Invitation ${id} resent successfully`));
    } catch (error) {
      console.error('Error resending invitation:', error);
      res
        .status(500)
        .json(createResponse(false, 'Failed to resend invitation'));
    }
  },
);

// Get invitation by ID
router.get('/:id', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    // TODO: Implement actual get logic
    res.json(createResponse(true, `Invitation ${id} retrieved successfully`));
  } catch (error) {
    console.error('Error retrieving invitation:', error);
    res
      .status(500)
      .json(createResponse(false, 'Failed to retrieve invitation'));
  }
});

// Revoke invitation
router.delete('/:id', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    // TODO: Implement actual delete logic
    res.json(createResponse(true, `Invitation ${id} revoked successfully`));
  } catch (error) {
    console.error('Error revoking invitation:', error);
    res.status(500).json(createResponse(false, 'Failed to revoke invitation'));
  }
});
// Validate invitation token for activation
router.get('/validate-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    // Find invitation by token, not expired, not used/accepted
    const invitation = await Invitation.findOne({
      token,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    });
    if (!invitation) {
      return res
        .status(404)
        .json(createResponse(false, 'Invalid or expired invitation token'));
    }
    // Optionally, populate school name if needed
    let schoolName = undefined;
    if (invitation.school_id) {
      try {
        const School = (await import('../models/School.js')).default;
        const school = await School.findById(invitation.school_id);
        schoolName = school ? school.name : undefined;
      } catch (e) {}
    }
    res.json(
      createResponse(true, 'Token valid', {
        email: invitation.email,
        role: invitation.role,
        school_id: invitation.school_id,
        schoolName,
      }),
    );
  } catch (error) {
    res.status(500).json(
      createResponse(false, 'Failed to validate invitation token', {
        error: error.message,
      }),
    );
  }
});
export default router;
