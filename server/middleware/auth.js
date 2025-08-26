import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Named export for backward compatibility
export const protect = async (req, res, next) => {
  // Call the main auth function
  await auth(req, res, next);
};

// Main auth middleware function
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', ''); //Authorization: Bearer <token>

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    console.log('Fetched user in auth middleware:', user);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid - user not found.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated.',
      });
    }

    console.log(
      'school_id raw value:',
      user.school_id,
      'type:',
      typeof user.school_id,
    );
    let schoolIdString = null;
    if (
      user.school_id &&
      typeof user.school_id === 'object' &&
      typeof user.school_id.toString === 'function'
    ) {
      schoolIdString = user.school_id.toString();
    } else if (
      typeof user.school_id === 'string' &&
      user.school_id.trim() !== ''
    ) {
      schoolIdString = user.school_id;
    }
    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      isActive: user.isActive,
      school_id: schoolIdString,
    };
    console.log('req.user in auth middleware:', req.user);
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication error.',
    });
  }
};

// Default export for new code
export default auth;
