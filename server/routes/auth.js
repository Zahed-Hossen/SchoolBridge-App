import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { error: 'Too many authentication attempts, please try again later.' },
});     

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );

  return { accessToken, refreshToken };
};

// ✅ POST /api/auth/google - Google OAuth
router.post('/google', authLimiter, [
  body('user.email').isEmail().normalizeEmail(),
  body('user.googleId').notEmpty(),
  body('user.firstName').trim().notEmpty(),
  body('user.lastName').trim().notEmpty(),
  body('role').isIn(['Student', 'Teacher', 'Parent', 'Admin']),
], async (req, res) => {
  try {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { user: googleUser, role, tokens: googleTokens } = req.body;

    console.log('🔐 Processing Google OAuth for:', googleUser.email);

    // Check if user exists
    let user = await User.findByEmailOrGoogleId(googleUser.email, googleUser.googleId);

    if (user) {
      // Update existing user
      console.log('👤 Existing user found, updating...');

      // Update Google ID if it was missing
      if (!user.googleId && googleUser.googleId) {
        user.googleId = googleUser.googleId;
      }

      // Update last login and profile info
      user.lastLogin = new Date();
      user.avatar = googleUser.avatar || user.avatar;
      user.emailVerified = googleUser.verified || user.emailVerified;

      // Update role if provided and user doesn't have one
      if (role && (!user.role || user.role === 'none')) {
        user.role = role;
        console.log(`📝 Updated user role to: ${role}`);
      }

      await user.save();
    } else {
      // Create new user
      console.log('👤 Creating new user...');

      user = new User({
        googleId: googleUser.googleId,
        email: googleUser.email,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        avatar: googleUser.avatar,
        role: role,
        provider: 'google',
        emailVerified: googleUser.verified || false,
        lastLogin: new Date(),
      });

      await user.save();
      console.log(`✅ New user created with role: ${role}`);
    }

    // Generate JWT tokens
    const jwtTokens = generateTokens(user._id);

    // Store refresh token
    user.refreshTokens.push(jwtTokens.refreshToken);
    await user.save();

    // Remove sensitive information
    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      avatar: user.avatar,
      role: user.role,
      provider: user.provider,
      emailVerified: user.emailVerified,
      lastLogin: user.lastLogin,
    };

    console.log(`✅ Google OAuth completed successfully for: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      user: userResponse,
      tokens: {
        accessToken: jwtTokens.accessToken,
        refreshToken: jwtTokens.refreshToken,
      },
    });

  } catch (error) {
    console.error('❌ Google OAuth error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      message: error.message,
    });
  }
});

// ✅ POST /api/auth/logout - Logout
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Remove refresh token from user's tokens array
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      await User.findByIdAndUpdate(decoded.userId, {
        $pull: { refreshTokens: refreshToken }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
    });
  }
});

// ✅ POST /api/auth/refresh - Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token required',
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
      });
    }

    // Generate new tokens
    const newTokens = generateTokens(user._id);

    // Replace old refresh token with new one
    const tokenIndex = user.refreshTokens.indexOf(refreshToken);
    user.refreshTokens[tokenIndex] = newTokens.refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      tokens: newTokens,
    });

  } catch (error) {
    console.error('❌ Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: 'Token refresh failed',
    });
  }
});

// ✅ GET /api/auth/me - Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password -refreshTokens');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        avatar: user.avatar,
        role: user.role,
        provider: user.provider,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
      },
    });

  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }
});

export default router;
