import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { createResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../utils/constants.js';

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createResponse(false, 'Access denied. No token provided.')
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createResponse(false, 'Token is not valid - user not found.')
      );
    }

    if (!user.isActive) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        createResponse(false, 'Account has been deactivated.')
      );
    }

    // Add user to request object
    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      isActive: user.isActive
    };

    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createResponse(false, 'Invalid token.')
      );
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createResponse(false, 'Token has expired.')
      );
    }

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createResponse(false, 'Authentication error.')
    );
  }
};

export default auth;
