import jwt from 'jsonwebtoken';

// ✅ JWT Configuration
export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: process.env.JWT_EXPIRES_IN || '24h',
  REFRESH_TOKEN_EXPIRY: '7d',
  SECRET: process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
  REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change-in-production',
};

// ✅ Generate JWT tokens with user info
export const generateTokens = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
  };

  const accessToken = jwt.sign(
    payload,
    JWT_CONFIG.SECRET,
    {
      expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY,
      issuer: 'schoolbridge-api',
      audience: 'schoolbridge-app',
    }
  );

  const refreshToken = jwt.sign(
    {
      userId: user._id,
      type: 'refresh',
      tokenVersion: user.tokenVersion || 0,
    },
    JWT_CONFIG.REFRESH_SECRET,
    {
      expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRY,
      issuer: 'schoolbridge-api',
      audience: 'schoolbridge-app',
    }
  );

  return { accessToken, refreshToken };
};

// ✅ Verify JWT token
export const verifyToken = (token, isRefresh = false) => {
  const secret = isRefresh ? JWT_CONFIG.REFRESH_SECRET : JWT_CONFIG.SECRET;
  return jwt.verify(token, secret);
};
