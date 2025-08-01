import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import auth from '../middleware/auth.js'; // We'll create this next

const router = express.Router();

// ✅ GET /api/users/profile - Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password -refreshTokens')
      .populate('studentInfo.parentIds', 'firstName lastName email')
      .populate('parentInfo.children', 'firstName lastName email studentInfo.grade');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile',
    });
  }
});

// ✅ PUT /api/users/profile - Update user profile
router.put('/profile', auth, [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('profile.phone').optional().isMobilePhone(),
  body('profile.dateOfBirth').optional().isISO8601().toDate(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
    });
  }
});

// ✅ GET /api/users/dashboard - Get role-specific dashboard data
router.get('/dashboard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    let dashboardData = {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
      },
      stats: {},
      recentActivity: [],
    };

    // Role-specific dashboard data
    switch (user.role) {
      case 'Student':
        dashboardData.stats = {
          totalCourses: 6,
          upcomingAssignments: 3,
          currentGPA: 3.7,
          attendanceRate: '95%',
        };
        dashboardData.recentActivity = [
          { id: 1, type: 'grade', message: 'New grade posted for Math Quiz', time: '2 hours ago' },
          { id: 2, type: 'assignment', message: 'Science project due tomorrow', time: '1 day ago' },
        ];
        break;

      case 'Teacher':
        dashboardData.stats = {
          totalClasses: 4,
          totalStudents: 120,
          pendingGrades: 15,
          upcomingLessons: 8,
        };
        dashboardData.recentActivity = [
          { id: 1, type: 'submission', message: '5 new assignment submissions', time: '1 hour ago' },
          { id: 2, type: 'message', message: 'Parent message from John\'s mother', time: '3 hours ago' },
        ];
        break;

      case 'Parent':
        const children = await User.find({
          _id: { $in: user.parentInfo?.children || [] }
        }).select('firstName lastName studentInfo.grade');

        dashboardData.stats = {
          totalChildren: children.length,
          upcomingEvents: 2,
          pendingFees: 1,
          recentGrades: 3,
        };
        dashboardData.children = children;
        dashboardData.recentActivity = [
          { id: 1, type: 'grade', message: 'Sarah received A- in Math', time: '4 hours ago' },
          { id: 2, type: 'attendance', message: 'Mike was absent today', time: '1 day ago' },
        ];
        break;

      case 'Admin':
        const totalUsers = await User.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'Student' });
        const totalTeachers = await User.countDocuments({ role: 'Teacher' });

        dashboardData.stats = {
          totalUsers,
          totalStudents,
          totalTeachers,
          systemHealth: 'Good',
        };
        dashboardData.recentActivity = [
          { id: 1, type: 'user', message: '3 new users registered', time: '2 hours ago' },
          { id: 2, type: 'system', message: 'System backup completed', time: '6 hours ago' },
        ];
        break;
    }

    res.status(200).json({
      success: true,
      dashboard: dashboardData,
    });

  } catch (error) {
    console.error('❌ Get dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard data',
    });
  }
});

export default router;
