import os from 'os';

// Get network IP address
export const getNetworkIP = () => {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
};

// Remove sensitive data from user object
export const sanitizeUser = (user) => {
  if (!user) return null;

  const userObj = user.toObject ? user.toObject() : user;

  // Remove sensitive fields
  delete userObj.password;
  delete userObj.refreshTokens;
  delete userObj.__v;

  return {
    id: userObj._id,
    email: userObj.email,
    fullName: userObj.fullName,
    firstName: userObj.firstName,
    lastName: userObj.lastName,
    phone: userObj.phone,
    role: userObj.role,
    avatar: userObj.avatar,
    provider: userObj.provider,
    verified: userObj.verified,
    isActive: userObj.isActive,
    lastLogin: userObj.lastLogin,
    createdAt: userObj.createdAt,
    updatedAt: userObj.updatedAt,
  };
};

// Create API response format
export const createResponse = (success, message, data = null, error = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString(),
  };

  if (data) response.data = data;
  if (error) response.error = error;

  return response;
};

// Error handler
export const handleError = (error, context = 'Operation') => {
  console.error(`❌ ${context} error:`, error);

  // MongoDB duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return {
      status: 409,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
    };
  }

  // Validation error
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(err => err.message);
    return {
      status: 400,
      message: 'Validation failed',
      details: messages,
    };
  }

  // Default error
  return {
    status: 500,
    message: 'Internal server error',
  };
};
