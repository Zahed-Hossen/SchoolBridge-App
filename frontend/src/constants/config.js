// API Configuration
export const API_CONFIG = {
  // ✅ UPDATED: Better URL handling for different environments
  BASE_URL: __DEV__
    ? 'http://192.168.0.106:5000/api'
    : 'https://your-production-api.com/api',

  TIMEOUT: 15000,

  ENDPOINTS: {
    auth: {
      login: '/auth/login',
      register: '/auth/signup',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
      googleAuth: '/auth/google',
      forgotPassword: '/auth/reset-password',
      resetPassword: '/auth/change-password',
    },
    test: '/test',
    health: '/health',

    user: {
      profile: '/user/profile',
      updateProfile: '/user/profile',
      uploadAvatar: '/user/avatar',
    },
    student: {
      dashboard: '/student/dashboard',
      grades: '/student/grades',
      assignments: '/student/assignments',
      attendance: '/student/attendance',
      schedule: '/student/schedule',
    },
    teacher: {
      dashboard: '/teacher/dashboard',
      classes: '/teacher/classes',
      students: '/teacher/students',
      assignments: '/teacher/assignments',
      attendance: '/teacher/attendance',
    },
    parent: {
      dashboard: '/parent/dashboard',
      children: '/parent/children',
      reports: '/parent/reports',
      notifications: '/parent/notifications',
    },
    admin: {
      dashboard: '/admin/dashboard',
      users: '/admin/users',
      systemStats: '/admin/system-stats',
    },
  },
};

// User Roles
export const USER_ROLES = {
  STUDENT: 'Student',
  TEACHER: 'Teacher',
  PARENT: 'Parent',
  ADMIN: 'Admin',
};

// ✅ ENHANCED: Storage Keys with better organization
export const STORAGE_KEYS = {
  // Authentication
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',

  // User Data
  USER_DATA: 'userData',
  USER_ROLE: 'userRole',

  // App Settings
  THEME: 'appTheme',
  LANGUAGE: 'appLanguage',

  // Temporary Data
  LOGIN_METHOD: 'loginMethod',
  ONBOARDING_COMPLETED: 'onboardingCompleted',

  // Legacy support (keep these for compatibility)
  USER_TOKEN: 'accessToken',
};

// ✅ ENHANCED: App Configuration with more details
export const APP_CONFIG = {
  NAME: 'SchoolBridge',
  VERSION: '1.0.0',
  ENVIRONMENT: __DEV__ ? 'development' : 'production',

  // ✅ ADDED: Network configuration
  NETWORK: {
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    CONNECTION_TIMEOUT: 10000,
  },

  // ✅ ADDED: Security configuration
  SECURITY: {
    TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  },
};

// ✅ NEW: Google OAuth Configuration
export const GOOGLE_CONFIG = {
  CLIENT_ID: {
    ANDROID:
      '180500502231-k7g7otj3g2bafhaijntg044ldvq009kl.apps.googleusercontent.com',
    IOS: '180500502231-mfuon46n3bvj34u0dv2rm7s5feclgekt.apps.googleusercontent.com',
    WEB: '180500502231-ahps6va5050rs23oboniu290mho9l8sg.apps.googleusercontent.com',
  },
  SCOPES: ['openid', 'profile', 'email'],
  REDIRECT_URI_SCHEME: 'com.pixelmind.schoolbridge',
  USE_EXPO_PROXY: __DEV__,

  // ✅ ADDED: Fallback redirect URIs
  REDIRECT_URIS: {
    EXPO_PROXY: 'https://auth.expo.io/@anonymous/schoolbridge-app',
    LOCAL_DEV: 'exp://localhost:19000/--/',
    PRODUCTION: 'com.pixelmind.schoolbridge://oauth',
  },
  ENDPOINTS: {
    AUTHORIZATION: 'https://accounts.google.com/o/oauth2/v2/auth',
    TOKEN: 'https://oauth2.googleapis.com/token',
    USERINFO: 'https://www.googleapis.com/oauth2/v2/userinfo',
    REVOKE: 'https://oauth2.googleapis.com/revoke',
  },
  // ✅ ADDED: Additional OAuth parameters
  OAUTH_PARAMS: {
    prompt: 'select_account',
    access_type: 'offline',
    include_granted_scopes: 'true',
  },
};

// ✅ NEW: Theme Colors (matching your existing colors)
export const THEME_COLORS = {
  student: '#3498DB',
  teacher: '#E74C3C',
  parent: '#F39C12',
  admin: '#9B59B6',

  // Common colors
  primary: '#2C3E50',
  secondary: '#34495E',
  success: '#27AE60',
  warning: '#F39C12',
  danger: '#E74C3C',
  info: '#3498DB',
  light: '#ECF0F1',
  dark: '#2C3E50',
};

// ✅ NEW: Validation Rules
export const VALIDATION_RULES = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
  },
  phone: {
    pattern: /^\+?[\d\s\-\(\)]+$/,
    message: 'Please enter a valid phone number',
  },
  name: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/,
    message: 'Name should contain only letters and spaces',
  },
};

// ✅ NEW: API Status Codes
export const API_STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// ✅ NEW: Helper function to build complete URL
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// ✅ NEW: Helper function to get endpoint
export const getEndpoint = (category, action) => {
  return API_CONFIG.ENDPOINTS[category]?.[action] || '';
};

// ✅ NEW: Development helpers
export const DEV_CONFIG = {
  ENABLE_LOGGING: __DEV__,
  ENABLE_MOCK_DATA: false,
  BYPASS_AUTH: false, // Set to true for testing without authentication
  MOCK_USER: {
    id: 'mock-user-123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'Student',
  },
};




// // API Configuration
// export const API_CONFIG = {
//   // Use your test server URL
//   BASE_URL: 'http://192.168.0.107:5000/api',
//   TIMEOUT: 10000,
//   ENDPOINTS: {
//     auth: {
//       login: '/auth/login',
//       register: '/auth/signup',
//       logout: '/auth/logout',
//       forgotPassword: '/auth/forgot-password',
//       resetPassword: '/auth/reset-password',
//     },
//     user: {
//       profile: '/user/profile',
//       updateProfile: '/user/profile',
//       uploadAvatar: '/user/avatar',
//     },
//     student: {
//       dashboard: '/student/dashboard',
//       grades: '/student/grades',
//       assignments: '/student/assignments',
//       attendance: '/student/attendance',
//       schedule: '/student/schedule',
//     },
//     teacher: {
//       dashboard: '/teacher/dashboard',
//       classes: '/teacher/classes',
//       students: '/teacher/students',
//       assignments: '/teacher/assignments',
//       attendance: '/teacher/attendance',
//     },
//     parent: {
//       dashboard: '/parent/dashboard',
//       children: '/parent/children',
//       reports: '/parent/reports',
//       notifications: '/parent/notifications',
//     },
//     admin: {
//       dashboard: '/admin/dashboard',
//       users: '/admin/users',
//     },
//   },
// };

// // User Roles - ADD THIS
// export const USER_ROLES = {
//   STUDENT: 'Student',
//   TEACHER: 'Teacher',
//   PARENT: 'Parent',
//   ADMIN: 'Admin',
// };

// // Storage Keys
// export const STORAGE_KEYS = {
//   USER_TOKEN: 'accessToken',
//   USER_DATA: 'userData',
//   USER_ROLE: 'userRole',
//   REFRESH_TOKEN: 'refreshToken',
// };

// // App Configuration
// export const APP_CONFIG = {
//   NAME: 'SchoolBridge',
//   VERSION: '1.0.0',
//   ENVIRONMENT: __DEV__ ? 'development' : 'production',
// };



// // Instead of hardcoding URLs everywhere:
// // ❌ fetch('http://192.168.0.107:5000/api/auth/login')

// // ✅ Use centralized config:
// //const loginUrl = API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.auth.login;
// // Result: 'http://192.168.0.107:5000/api/auth/login'
