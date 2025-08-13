import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid - user not found.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated.'
      });
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
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication error.'
    });
  }
};

export default auth;
