import crypto from 'crypto';
import User from '../models/User.js';
import Invitation from '../models/Invitation.js';
import { sendInvitationEmail } from '../services/emailService.js';
import { generateTokens, verifyToken } from '../config/jwt.js';
import { sanitizeUser, createResponse, handleError } from '../utils/helpers.js';
import { HTTP_STATUS, MESSAGES, ROLES } from '../utils/constants.js';

// --- Auth Controller ---

export const createInvitations = async (req, res) => {
  try {
    console.log('Creating invitations...');
    const { users } = req.body; // Array of { school_id, email, role }
    const createdBy = req.user.userId;

    const credentials = await Promise.all(
      users.map(async (user) => {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

        const credential = new Invitation({
          token,
          school_id: user.school_id,
          email: user.email.toLowerCase(),
          role: user.role,
          expiresAt,
          createdBy,
        });

        await credential.save();
        await sendInvitationEmail(user.email, token);
        return credential;
      }),
    );

    res
      .status(HTTP_STATUS.CREATED)
      .json(
        createResponse(true, 'Invitations sent successfully', { credentials }),
      );
  } catch (error) {
    const errorInfo = handleError(error, 'Create Invitations');
    res
      .status(errorInfo.status)
      .json(createResponse(false, errorInfo.message, null, errorInfo.details));
  }
};

export const validateActivationToken = async (req, res) => {
  try {
    const { token } = req.query;
    const credential = await Invitation.findOne({
      token,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!credential) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(createResponse(false, 'Invalid or expired activation token'));
    }

    res.status(HTTP_STATUS.OK).json(
      createResponse(true, 'Token valid', {
        email: credential.email,
        role: credential.role,
        school_id: credential.school_id,
      }),
    );
  } catch (error) {
    const errorInfo = handleError(error, 'Validate Token');
    res
      .status(errorInfo.status)
      .json(createResponse(false, errorInfo.message, null, errorInfo.details));
  }
};

export const activateAccount = async (req, res) => {
  try {
    const { token, fullName, password } = req.body;
    const credential = await Invitation.findOne({
      token,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    });

    if (!credential) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(createResponse(false, 'Invalid or expired token'));
    }

    // Check for existing user
    const existingUser = await User.findOne({ email: credential.email });
    if (existingUser) {
      return res
        .status(HTTP_STATUS.CONFLICT)
        .json(createResponse(false, 'Account already activated'));
    }

    // Create new user
    const newUser = new User({
      email: credential.email.toLowerCase(),
      password,
      fullName,
      role: credential.role,
      school_id: credential.school_id,
      provider: 'email',
      verified: true,
      isActive: true,
    });

    const savedUser = await newUser.save();

    // Mark invitation as accepted
    credential.status = 'accepted';
    await credential.save();

    // Generate tokens
    const tokens = generateTokens(savedUser);
    savedUser.refreshTokens.push(tokens.refreshToken);
    await savedUser.save();

    res.status(HTTP_STATUS.CREATED).json(
      createResponse(true, 'Account activated successfully', {
        user: sanitizeUser(savedUser),
        ...tokens,
      }),
    );
  } catch (error) {
    const errorInfo = handleError(error, 'Account Activation');
    res
      .status(errorInfo.status)
      .json(createResponse(false, errorInfo.message, null, errorInfo.details));
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { user: googleUser, role } = req.body;

    // Check if user exists by Google ID or email
    let user = await User.findByEmailOrGoogleId(
      googleUser.email,
      googleUser.googleId,
    );

    if (user) {
      // Existing user
      if (user.role !== role) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createResponse(
              false,
              `Account exists as ${user.role}. Please select ${user.role} role.`,
            ),
          );
      }

      // Update Google ID if missing
      if (!user.googleId && googleUser.googleId) {
        user.googleId = googleUser.googleId;
        user.provider = 'google';
      }

      // Update profile info
      if (googleUser.avatar) user.avatar = googleUser.avatar;
      if (googleUser.verified !== undefined)
        user.verified = googleUser.verified;

      await user.save();
    } else {
      // Create new Google user
      user = new User({
        email: googleUser.email.toLowerCase(),
        googleId: googleUser.googleId,
        fullName:
          googleUser.fullName ||
          googleUser.name ||
          `${googleUser.firstName} ${googleUser.lastName}`,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        avatar: googleUser.avatar,
        role,
        provider: 'google',
        verified: googleUser.verified || true,
      });

      await user.save();
    }

    // Generate JWT tokens
    const tokens = generateTokens(user);

    // Store refresh token and update last login
    user.refreshTokens.push(tokens.refreshToken);
    await user.updateLastLogin();

    res.status(HTTP_STATUS.OK).json(
      createResponse(true, MESSAGES.AUTH.GOOGLE_SUCCESS, {
        user: sanitizeUser(user),
        ...tokens,
      }),
    );
  } catch (error) {
    const errorInfo = handleError(error, 'Google OAuth');
    res
      .status(errorInfo.status)
      .json(createResponse(false, errorInfo.message, null, errorInfo.details));
  }
};

export const signup = async (req, res) => {
  try {
    const { email, password, fullName, role, phone, signupType } = req.body;
    if (signupType !== 'visitor') {
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .json(createResponse(false, 'Platform users must be invited'));
    }
    const userRole = ROLES.VISITOR;
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res
        .status(HTTP_STATUS.CONFLICT)
        .json(createResponse(false, MESSAGES.AUTH.USER_EXISTS));
    }
    // Create new user
    const newUser = new User({
      email: email.toLowerCase(),
      password,
      fullName,
      role: userRole,
      phone,
      provider: 'email',
      verified: false,
    });
    const savedUser = await newUser.save();
    // Generate JWT tokens
    const tokens = generateTokens(savedUser);
    // Store refresh token
    savedUser.refreshTokens.push(tokens.refreshToken);
    await savedUser.updateLastLogin();
    res.status(HTTP_STATUS.CREATED).json(
      createResponse(true, MESSAGES.AUTH.SIGNUP_SUCCESS, {
        user: sanitizeUser(savedUser),
        ...tokens,
      }),
    );
  } catch (error) {
    const errorInfo = handleError(error, 'Signup');
    res
      .status(errorInfo.status)
      .json(createResponse(false, errorInfo.message, null, errorInfo.details));
  }
};

export const login = async (req, res) => {
  try {
    console.log("Login controller hit");
    const { email, password, role } = req.body;
    // Find user by email (include password for comparison)
    const user = await User.findByEmail(email.toLowerCase());
    if (!user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json(createResponse(false, MESSAGES.AUTH.USER_NOT_FOUND));
    }
    if (!user.isActive) {
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .json(createResponse(false, MESSAGES.AUTH.ACCOUNT_DEACTIVATED));
    }
    if (user.role !== role) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(
          createResponse(
            false,
            `${MESSAGES.AUTH.ROLE_MISMATCH}. Please select ${user.role} role.`,
          ),
        );
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(createResponse(false, MESSAGES.AUTH.INVALID_CREDENTIALS));
    }
    const tokens = generateTokens(user);
    user.refreshTokens.push(tokens.refreshToken);
    await user.updateLastLogin();
    const userData = await User.findById(user._id);
    res.status(HTTP_STATUS.OK).json(
      createResponse(true, MESSAGES.AUTH.LOGIN_SUCCESS, {
        user: sanitizeUser(userData),
        ...tokens,
      }),
    );
  } catch (error) {
    const errorInfo = handleError(error, 'Login');
    res
      .status(errorInfo.status)
      .json(createResponse(false, errorInfo.message, null, errorInfo.details));
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      try {
        const decoded = verifyToken(refreshToken, true);
        await User.findByIdAndUpdate(decoded.userId, {
          $pull: { refreshTokens: refreshToken },
        });
      } catch (error) {
        // Token might be invalid, but logout should still succeed
      }
    }
    res
      .status(HTTP_STATUS.OK)
      .json(createResponse(true, MESSAGES.AUTH.LOGOUT_SUCCESS));
  } catch (error) {
    const errorInfo = handleError(error, 'Logout');
    res
      .status(errorInfo.status)
      .json(createResponse(false, errorInfo.message, null, errorInfo.details));
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(createResponse(false, 'Refresh token is required'));
    }
    const decoded = verifyToken(refreshToken, true);
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive || !user.refreshTokens.includes(refreshToken)) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(createResponse(false, 'Invalid refresh token'));
    }
    const newTokens = generateTokens(user);
    const tokenIndex = user.refreshTokens.indexOf(refreshToken);
    user.refreshTokens[tokenIndex] = newTokens.refreshToken;
    await user.save();
    res.status(HTTP_STATUS.OK).json(
      createResponse(true, 'Token refreshed successfully', {
        user: sanitizeUser(user),
        ...newTokens,
      }),
    );
  } catch (error) {
    res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json(createResponse(false, 'Token refresh failed'));
  }
};

export const validateSession = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(createResponse(false, MESSAGES.AUTH.TOKEN_REQUIRED));
    }
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json(createResponse(false, 'User not found or deactivated'));
    }
    res.status(HTTP_STATUS.OK).json(
      createResponse(true, 'Session is valid', {
        valid: true,
        user: sanitizeUser(user),
      }),
    );
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(createResponse(false, MESSAGES.AUTH.INVALID_TOKEN));
    }
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(createResponse(false, 'Session validation failed'));
  }
};

export const getMe = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(createResponse(false, MESSAGES.AUTH.TOKEN_REQUIRED));
    }
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json(createResponse(false, MESSAGES.USER.PROFILE_NOT_FOUND));
    }
    res.status(HTTP_STATUS.OK).json(
      createResponse(true, 'User profile retrieved successfully', {
        user: sanitizeUser(user),
      }),
    );
  } catch (error) {
    res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json(createResponse(false, MESSAGES.AUTH.INVALID_TOKEN));
  }
};

// Add other handlers (activate, googleAuth, invitations, etc.) as needed, following the same pattern.
