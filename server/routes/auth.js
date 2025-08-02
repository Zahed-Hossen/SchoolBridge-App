import express from 'express';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { generateTokens, verifyToken } from '../config/jwt.js';
import { userValidation, validate } from '../middleware/validation.js';
import { sanitizeUser, createResponse, handleError } from '../utils/helpers.js';
import { HTTP_STATUS, MESSAGES, RATE_LIMITS, ROLES } from '../utils/constants.js';

const router = express.Router();

// ✅ Rate limiting for auth routes
const authLimiter = rateLimit(RATE_LIMITS.AUTH);

// ✅ POST /api/auth/signup - Register new user
router.post('/signup', authLimiter, userValidation.signup, validate, async (req, res) => {
  try {
    const { email, password, fullName, role, phone } = req.body;

    console.log('📝 New signup attempt:', { email, fullName, role });

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(HTTP_STATUS.CONFLICT).json(
        createResponse(false, MESSAGES.AUTH.USER_EXISTS)
      );
    }

    // Create new user
    const newUser = new User({
      email: email.toLowerCase(),
      password,
      fullName,
      role,
      phone,
      provider: 'email',
      verified: false, // Set to true for development
    });

    const savedUser = await newUser.save();
    console.log('✅ User created successfully:', savedUser.email);

    // Generate JWT tokens
    const tokens = generateTokens(savedUser);

    // Store refresh token
    savedUser.refreshTokens.push(tokens.refreshToken);
    await savedUser.updateLastLogin();

    res.status(HTTP_STATUS.CREATED).json(
      createResponse(true, MESSAGES.AUTH.SIGNUP_SUCCESS, {
        user: sanitizeUser(savedUser),
        ...tokens,
      })
    );

  } catch (error) {
    const errorInfo = handleError(error, 'Signup');
    res.status(errorInfo.status).json(
      createResponse(false, errorInfo.message, null, errorInfo.details)
    );
  }
});

// ✅ POST /api/auth/login - Login user
router.post('/login', authLimiter, userValidation.login, validate, async (req, res) => {
  try {
    const { email, password, role } = req.body;

    console.log('🔐 Login attempt:', { email, role });

    // Find user by email (include password for comparison)
    const user = await User.findByEmail(email.toLowerCase());
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        createResponse(false, MESSAGES.AUTH.USER_NOT_FOUND)
      );
    }

    // Check if account is active
    if (!user.isActive) {
      console.log('❌ Account deactivated:', email);
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        createResponse(false, MESSAGES.AUTH.ACCOUNT_DEACTIVATED)
      );
    }

    // Verify role matches
    if (user.role !== role) {
      console.log('❌ Role mismatch:', { expected: role, actual: user.role });
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createResponse(false, `${MESSAGES.AUTH.ROLE_MISMATCH}. Please select ${user.role} role.`)
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createResponse(false, MESSAGES.AUTH.INVALID_CREDENTIALS)
      );
    }

    // Generate JWT tokens
    const tokens = generateTokens(user);

    // Store refresh token and update last login
    user.refreshTokens.push(tokens.refreshToken);
    await user.updateLastLogin();

    // Get clean user data
    const userData = await User.findById(user._id);
    console.log('✅ Login successful:', userData.email);

    res.status(HTTP_STATUS.OK).json(
      createResponse(true, MESSAGES.AUTH.LOGIN_SUCCESS, {
        user: sanitizeUser(userData),
        ...tokens,
      })
    );

  } catch (error) {
    const errorInfo = handleError(error, 'Login');
    res.status(errorInfo.status).json(
      createResponse(false, errorInfo.message, null, errorInfo.details)
    );
  }
});

// ✅ POST /api/auth/google - Google OAuth
router.post('/google', authLimiter, userValidation.googleAuth, validate, async (req, res) => {
  try {
    const { user: googleUser, role } = req.body;

    console.log('🔐 Google OAuth attempt:', {
      email: googleUser.email,
      googleId: googleUser.googleId,
      role
    });

    // Check if user exists by Google ID or email
    let user = await User.findByEmailOrGoogleId(googleUser.email, googleUser.googleId);

    if (user) {
      // Existing user
      if (user.role !== role) {
        console.log('❌ Google user role mismatch:', { expected: role, actual: user.role });
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createResponse(false, `Account exists as ${user.role}. Please select ${user.role} role.`)
        );
      }

      // Update Google ID if missing
      if (!user.googleId && googleUser.googleId) {
        user.googleId = googleUser.googleId;
        user.provider = 'google';
      }

      // Update profile info
      if (googleUser.avatar) user.avatar = googleUser.avatar;
      if (googleUser.verified !== undefined) user.verified = googleUser.verified;

      await user.save();
      console.log('✅ Existing Google user updated:', user.email);

    } else {
      // Create new Google user
      user = new User({
        email: googleUser.email.toLowerCase(),
        googleId: googleUser.googleId,
        fullName: googleUser.fullName || googleUser.name || `${googleUser.firstName} ${googleUser.lastName}`,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        avatar: googleUser.avatar,
        role,
        provider: 'google',
        verified: googleUser.verified || true,
      });

      await user.save();
      console.log('✅ New Google user created:', user.email);
    }

    // Generate JWT tokens
    const tokens = generateTokens(user);

    // Store refresh token and update last login
    user.refreshTokens.push(tokens.refreshToken);
    await user.updateLastLogin();

    console.log('✅ Google OAuth successful:', user.email);

    res.status(HTTP_STATUS.OK).json(
      createResponse(true, MESSAGES.AUTH.GOOGLE_SUCCESS, {
        user: sanitizeUser(user),
        ...tokens,
      })
    );

  } catch (error) {
    const errorInfo = handleError(error, 'Google OAuth');
    res.status(errorInfo.status).json(
      createResponse(false, errorInfo.message, null, errorInfo.details)
    );
  }
});

// ✅ POST /api/auth/logout - Logout user
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Remove refresh token from user's tokens array
      try {
        const decoded = verifyToken(refreshToken, true);
        await User.findByIdAndUpdate(decoded.userId, {
          $pull: { refreshTokens: refreshToken }
        });
      } catch (error) {
        // Token might be invalid, but logout should still succeed
        console.log('Warning: Invalid refresh token during logout');
      }
    }

    console.log('🚪 User logged out successfully');

    res.status(HTTP_STATUS.OK).json(
      createResponse(true, MESSAGES.AUTH.LOGOUT_SUCCESS)
    );

  } catch (error) {
    const errorInfo = handleError(error, 'Logout');
    res.status(errorInfo.status).json(
      createResponse(false, errorInfo.message, null, errorInfo.details)
    );
  }
});

// ✅ POST /api/auth/refresh - Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createResponse(false, 'Refresh token is required')
      );
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken, true);

    // Find user and verify refresh token
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive || !user.refreshTokens.includes(refreshToken)) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createResponse(false, 'Invalid refresh token')
      );
    }

    // Generate new tokens
    const newTokens = generateTokens(user);

    // Replace old refresh token with new one
    const tokenIndex = user.refreshTokens.indexOf(refreshToken);
    user.refreshTokens[tokenIndex] = newTokens.refreshToken;
    await user.save();

    console.log('✅ Token refreshed for user:', user.email);

    res.status(HTTP_STATUS.OK).json(
      createResponse(true, 'Token refreshed successfully', {
        user: sanitizeUser(user),
        ...newTokens,
      })
    );

  } catch (error) {
    console.error('❌ Token refresh error:', error);
    res.status(HTTP_STATUS.UNAUTHORIZED).json(
      createResponse(false, 'Token refresh failed')
    );
  }
});

// ✅ GET /api/auth/validate - Validate current session
router.get('/validate', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createResponse(false, MESSAGES.AUTH.TOKEN_REQUIRED)
      );
    }

    // Verify token
    const decoded = verifyToken(token);

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        createResponse(false, 'User not found or deactivated')
      );
    }

    res.status(HTTP_STATUS.OK).json(
      createResponse(true, 'Session is valid', {
        valid: true,
        user: sanitizeUser(user),
      })
    );

  } catch (error) {
    console.error('❌ Token validation error:', error);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createResponse(false, MESSAGES.AUTH.INVALID_TOKEN)
      );
    }

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createResponse(false, 'Session validation failed')
    );
  }
});

// ✅ GET /api/auth/me - Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createResponse(false, MESSAGES.AUTH.TOKEN_REQUIRED)
      );
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        createResponse(false, MESSAGES.USER.PROFILE_NOT_FOUND)
      );
    }

    res.status(HTTP_STATUS.OK).json(
      createResponse(true, 'User profile retrieved successfully', {
        user: sanitizeUser(user),
      })
    );

  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(HTTP_STATUS.UNAUTHORIZED).json(
      createResponse(false, MESSAGES.AUTH.INVALID_TOKEN)
    );
  }
});

export default router;
