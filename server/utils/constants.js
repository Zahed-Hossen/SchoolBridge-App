// Application constants
export const ROLES = {
  STUDENT: 'Student',
  TEACHER: 'Teacher',
  PARENT: 'Parent',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'SuperAdmin',
  VISITOR: 'Visitor',
  PLATFORM_USER: 'PlatformUser',
  GUEST: 'Guest',
};

export const PROVIDERS = {
  EMAIL: 'email',
  GOOGLE: 'google',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

export const MESSAGES = {
  AUTH: {
    SIGNUP_SUCCESS: 'Account created successfully',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    GOOGLE_SUCCESS: 'Google authentication successful',
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_EXISTS: 'User with this email already exists',
    USER_NOT_FOUND: 'No account found with this email address',
    ACCOUNT_DEACTIVATED:
      'Account has been deactivated. Please contact support.',
    ROLE_MISMATCH: 'Account exists but not with the selected role',
    TOKEN_EXPIRED: 'Access token expired',
    INVALID_TOKEN: 'Invalid access token',
    TOKEN_REQUIRED: 'Access token is required',
  },
  USER: {
    PROFILE_UPDATED: 'Profile updated successfully',
    PROFILE_NOT_FOUND: 'User profile not found',
  },
  VALIDATION: {
    FAILED: 'Validation failed',
    EMAIL_INVALID: 'Please provide a valid email address',
    PASSWORD_WEAK: 'Password must be at least 6 characters long',
    ROLE_INVALID: 'Please select a valid role',
  },
};

export const RATE_LIMITS = {
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per window
    message: {
      error: 'Too many authentication attempts, please try again later.',
    },
  },
  GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: { error: 'Too many requests, please try again later.' },
  },
};
