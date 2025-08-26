import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export const generateTokens = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    tokenVersion: user.tokenVersion || 0
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'schoolbridge-api',
    audience: 'schoolbridge-app'
  });

  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'schoolbridge-api',
    audience: 'schoolbridge-app'
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: JWT_EXPIRES_IN
  };
};

export const verifyToken = (token, isRefreshToken = false) => {
  const secret = isRefreshToken ? JWT_REFRESH_SECRET : JWT_SECRET;

  return jwt.verify(token, secret, {
    issuer: 'schoolbridge-api',
    audience: 'schoolbridge-app'
  });
};

export default {
  generateTokens,
  verifyToken
};


// The final JWT is a string that consists of three parts (Header.Payload.Signature) encoded together.
