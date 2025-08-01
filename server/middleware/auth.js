import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password -refreshTokens');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token. User not found.',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated.',
      });
    }

    req.user = decoded;
    req.userDoc = user;
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token.',
    });
  }
};

export default auth;
