// ✅ ENHANCED: API Configuration with dynamic IP detection
export const API_CONFIG = {
  BASE_URL: (() => {
    if (__DEV__) {
      const possibleIPs = [
        'http://192.168.0.102:5000/api', // ✅ CORRECT IP from server logs
        'http://192.168.0.101:5000/api', // Previous IP (fallback)
        'http://192.168.0.106:5000/api', // Alternative IP
        'http://localhost:5000/api',     // Localhost fallback
      ];
      return possibleIPs[0]; // Use the first IP - can be enhanced to test connectivity
    }
    return 'https://your-production-api.com/api';
  })(),

  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,

  ENDPOINTS: {
    // ✅ ENHANCED: Authentication endpoints
    auth: {
      login: '/auth/login',
      register: '/auth/signup',
      signup: '/auth/signup', // Alias for register
      logout: '/auth/logout',
      refresh: '/auth/refresh',
      googleAuth: '/auth/google',
      googleSignup: '/auth/google/signup',
      googleLogin: '/auth/google/login',
      forgotPassword: '/auth/forgot-password',
      resetPassword: '/auth/reset-password',
      verifyEmail: '/auth/verify-email',
      resendVerification: '/auth/resend-verification',
      checkAuth: '/auth/check',
    },

    // ✅ ENHANCED: System endpoints
    system: {
      health: '/health',
      test: '/test',
      status: '/status',
      ping: '/ping',
      announcements: '/announcements',
      devInfo: '/dev/info', // For development debugging
      version: '/version',
    },

    // ✅ ENHANCED: User management
    user: {
      profile: '/user/profile',
      updateProfile: '/user/profile',
      uploadAvatar: '/user/avatar',
      changePassword: '/user/change-password',
      deleteAccount: '/user/delete',
      preferences: '/user/preferences',
      sessions: '/user/sessions',
    },

    // ✅ ENHANCED: Student endpoints
    student: {
      dashboard: '/student/dashboard',
      grades: '/student/grades',
      assignments: '/student/assignments',
      attendance: '/student/attendance',
      schedule: '/student/schedule',
      courses: '/student/courses',
      notifications: '/student/notifications',
      exams: '/student/exams',
      results: '/student/results',
      library: '/student/library',
    },

    // ✅ ENHANCED: Teacher endpoints
    teacher: {
      dashboard: '/teacher/dashboard',
      classes: '/teacher/classes',
      students: '/teacher/students',
      assignments: '/teacher/assignments',
      attendance: '/teacher/attendance',
      gradebook: '/teacher/gradebook',
      schedule: '/teacher/schedule',
      exams: '/teacher/exams',
      reports: '/teacher/reports',
      resources: '/teacher/resources',
    },

    // ✅ ENHANCED: Parent endpoints
    parent: {
      dashboard: '/parent/dashboard',
      children: '/parent/children',
      reports: '/parent/reports',
      notifications: '/parent/notifications',
      meetings: '/parent/meetings',
      payments: '/parent/payments',
      attendance: '/parent/attendance',
      progress: '/parent/progress',
    },

    // ✅ ENHANCED: Admin endpoints
    admin: {
      dashboard: '/admin/dashboard',
      users: '/admin/users',
      systemStats: '/admin/system-stats',
      schools: '/admin/schools',
      classes: '/admin/classes',
      reports: '/admin/reports',
      settings: '/admin/settings',
      backups: '/admin/backups',
      logs: '/admin/logs',
    },

    // ✅ NEW: Role selection endpoint
    role: {
      select: '/role/select',
      verify: '/role/verify',
      update: '/role/update',
    },
  },
};

// ✅ ENHANCED: User Roles with additional metadata
export const USER_ROLES = {
  STUDENT: 'Student',
  TEACHER: 'Teacher',
  PARENT: 'Parent',
  ADMIN: 'Admin',
};

// ✅ ENHANCED: Role metadata for UI customization
export const ROLE_CONFIG = {
  [USER_ROLES.STUDENT]: {
    color: '#3498DB',
    icon: 'school-outline',
    dashboardRoute: 'StudentDashboard',
    features: ['grades', 'assignments', 'attendance', 'schedule'],
    permissions: ['view_grades', 'view_assignments', 'view_attendance'],
  },
  [USER_ROLES.TEACHER]: {
    color: '#E74C3C',
    icon: 'person-outline',
    dashboardRoute: 'TeacherDashboard',
    features: ['classes', 'students', 'gradebook', 'attendance'],
    permissions: ['manage_classes', 'grade_assignments', 'mark_attendance'],
  },
  [USER_ROLES.PARENT]: {
    color: '#F39C12',
    icon: 'people-outline',
    dashboardRoute: 'ParentDashboard',
    features: ['children', 'reports', 'meetings', 'payments'],
    permissions: ['view_child_progress', 'schedule_meetings', 'make_payments'],
  },
  [USER_ROLES.ADMIN]: {
    color: '#9B59B6',
    icon: 'settings-outline',
    dashboardRoute: 'AdminDashboard',
    features: ['users', 'system', 'reports', 'schools'],
    permissions: ['manage_users', 'system_settings', 'view_all_reports'],
  },
};

// ✅ ENHANCED: Storage Keys with proper namespacing
export const STORAGE_KEYS = {
  // Authentication
  ACCESS_TOKEN: '@schoolbridge_access_token',
  REFRESH_TOKEN: '@schoolbridge_refresh_token',

  // User Data
  USER_DATA: '@schoolbridge_user_data',
  USER_ROLE: '@schoolbridge_user_role',
  LOGIN_METHOD: '@schoolbridge_login_method',

  // App Settings
  THEME: '@schoolbridge_theme',
  LANGUAGE: '@schoolbridge_language',
  NOTIFICATIONS: '@schoolbridge_notifications',

  // App State
  ONBOARDING_COMPLETED: '@schoolbridge_onboarding',
  FIRST_LAUNCH: '@schoolbridge_first_launch',
  LAST_SYNC: '@schoolbridge_last_sync',

  // Cached Data
  ANNOUNCEMENTS_CACHE: '@schoolbridge_announcements',
  DASHBOARD_CACHE: '@schoolbridge_dashboard',

  // OAuth Tokens
  GOOGLE_OAUTH_TOKENS: '@schoolbridge_google_tokens',

  // Legacy support (keep for backwards compatibility)
  USER_TOKEN: '@schoolbridge_access_token', // Maps to ACCESS_TOKEN
};

// ✅ ENHANCED: App Configuration with comprehensive settings
export const APP_CONFIG = {
  NAME: 'SchoolBridge',
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  ENVIRONMENT: __DEV__ ? 'development' : 'production',
  DEBUG_MODE: __DEV__,

  // ✅ ENHANCED: Network configuration
  NETWORK: {
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    CONNECTION_TIMEOUT: 15000,
    UPLOAD_TIMEOUT: 60000,
    MAX_CONCURRENT_REQUESTS: 5,
  },

  // ✅ ENHANCED: Security configuration
  SECURITY: {
    TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
    BIOMETRIC_TIMEOUT: 30 * 1000, // 30 seconds
  },

  // ✅ ENHANCED: Cache configuration
  CACHE: {
    ANNOUNCEMENTS_TTL: 5 * 60 * 1000, // 5 minutes
    DASHBOARD_TTL: 2 * 60 * 1000, // 2 minutes
    USER_DATA_TTL: 30 * 60 * 1000, // 30 minutes
    MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50MB
  },

  // ✅ ENHANCED: Feature flags
  FEATURES: {
    GOOGLE_AUTH: true,
    BIOMETRIC_AUTH: true,
    PUSH_NOTIFICATIONS: true,
    OFFLINE_MODE: true,
    DARK_MODE: true,
    MULTI_LANGUAGE: true,
    FILE_UPLOAD: true,
    VIDEO_CALLING: false,
    OAUTH_SIMULATION: __DEV__, // Enable simulation in development
  },
};

// ✅ FIXED: Google OAuth Configuration with proper structure
export const GOOGLE_CONFIG = {
  CLIENT_ID: {
    // ✅ CRITICAL: Your actual client IDs from Google Cloud Console
    ANDROID: '180500502231-k7g7otj3g2bafhaijntg044ldvq009kl.apps.googleusercontent.com',
    IOS: '180500502231-mfuon46n3bvj34u0dv2rm7s5feclgekt.apps.googleusercontent.com',
    WEB: '180500502231-ahps6va5050rs23oboniu290mho9l8sg.apps.googleusercontent.com',
  },

  SCOPES: [
    'openid',
    'profile',
    'email',
  ],

  // ✅ FIXED: OAuth settings
  OAUTH_SETTINGS: {
    responseType: 'code',
    prompt: 'select_account',
    accessType: 'offline',
    includeGrantedScopes: true,
  },

  // ✅ FIXED: Redirect URIs for different environments
  REDIRECT_URIS: {
    EXPO_DEV: 'exp://localhost:19000/--/oauth',
    EXPO_PROXY: 'https://auth.expo.io/@anonymous/schoolbridge-app',
    EXPO_TUNNEL: 'https://auth.expo.io/@your-username/schoolbridge-app',
    STANDALONE: 'com.pixelmind.schoolbridge://oauth',
  },

  // ✅ FIXED: OAuth endpoints with correct URLs
  ENDPOINTS: {
    AUTHORIZATION: 'https://accounts.google.com/o/oauth2/v2/auth',
    TOKEN: 'https://oauth2.googleapis.com/token',
    USERINFO: 'https://www.googleapis.com/oauth2/v2/userinfo',
    REVOKE: 'https://oauth2.googleapis.com/revoke',
  },

  // ✅ NEW: Configuration validation
  isConfigured: function() {
    return !!(
      this.CLIENT_ID.WEB &&
      !this.CLIENT_ID.WEB.includes('YOUR_') &&
      this.CLIENT_ID.WEB.includes('.apps.googleusercontent.com')
    );
  },
};

// ✅ ENHANCED: Theme Colors with comprehensive palette
export const THEME_COLORS = {
  // Role-specific colors
  roles: {
    student: '#3498DB',
    teacher: '#E74C3C',
    parent: '#F39C12',
    admin: '#9B59B6',
  },

  // Primary palette
  primary: {
    main: '#2C3E50',
    light: '#34495E',
    dark: '#1A252F',
    contrastText: '#FFFFFF',
  },

  // Secondary palette
  secondary: {
    main: '#3498DB',
    light: '#5DADE2',
    dark: '#2980B9',
    contrastText: '#FFFFFF',
  },

  // Semantic colors
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
  info: '#3498DB',

  // Neutral colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
    disabled: '#E9ECEF',
  },

  text: {
    primary: '#2C3E50',
    secondary: '#7F8C8D',
    disabled: '#BDC3C7',
    inverse: '#FFFFFF',
  },

  // Border and divider colors
  border: '#DEE2E6',
  divider: '#E9ECEF',

  // Status colors
  status: {
    online: '#27AE60',
    offline: '#95A5A6',
    busy: '#E74C3C',
    away: '#F39C12',
  },

  // OAuth specific colors
  oauth: {
    google: '#4285F4',
    facebook: '#1877F2',
    apple: '#000000',
    microsoft: '#00A4EF',
  },
};

// ✅ ENHANCED: Validation Rules with proper regex patterns
export const VALIDATION_RULES = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
    required: true,
    maxLength: 254,
  },

  password: {
    minLength: 6, // Reduced for better UX
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
    message: 'Password must be at least 6 characters with uppercase, lowercase, and number',
    required: true,
  },

  phone: {
    pattern: /^\+?[\d\s\-\(\)]+$/,
    minLength: 10,
    maxLength: 15,
    message: 'Please enter a valid phone number',
    required: false,
  },

  name: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/,
    message: 'Name should contain only letters, spaces, hyphens and apostrophes',
    required: true,
  },

  fullName: {
    minLength: 3,
    maxLength: 100,
    pattern: /^[a-zA-Z\s'-]+$/,
    message: 'Full name should contain only letters, spaces, hyphens and apostrophes',
    required: true,
  },

  studentId: {
    pattern: /^[A-Z0-9]{6,12}$/,
    message: 'Student ID should be 6-12 characters (letters and numbers)',
    required: false,
  },

  employeeId: {
    pattern: /^[A-Z0-9]{4,10}$/,
    message: 'Employee ID should be 4-10 characters (letters and numbers)',
    required: false,
  },
};

// ✅ ENHANCED: API Status Codes with descriptions
export const API_STATUS_CODES = {
  // Success
  SUCCESS: { code: 200, message: 'Success' },
  CREATED: { code: 201, message: 'Created' },
  ACCEPTED: { code: 202, message: 'Accepted' },

  // Client Errors
  BAD_REQUEST: { code: 400, message: 'Bad Request' },
  UNAUTHORIZED: { code: 401, message: 'Unauthorized' },
  FORBIDDEN: { code: 403, message: 'Forbidden' },
  NOT_FOUND: { code: 404, message: 'Not Found' },
  METHOD_NOT_ALLOWED: { code: 405, message: 'Method Not Allowed' },
  CONFLICT: { code: 409, message: 'Conflict' },
  VALIDATION_ERROR: { code: 422, message: 'Validation Error' },
  RATE_LIMITED: { code: 429, message: 'Too Many Requests' },

  // Server Errors
  INTERNAL_SERVER_ERROR: { code: 500, message: 'Internal Server Error' },
  BAD_GATEWAY: { code: 502, message: 'Bad Gateway' },
  SERVICE_UNAVAILABLE: { code: 503, message: 'Service Unavailable' },
  GATEWAY_TIMEOUT: { code: 504, message: 'Gateway Timeout' },
};

// ✅ ENHANCED: Error Messages
export const ERROR_MESSAGES = {
  NETWORK: {
    CONNECTION_FAILED: 'Unable to connect to server. Please check your internet connection.',
    TIMEOUT: 'Request timed out. Please try again.',
    OFFLINE: 'You are offline. Please check your internet connection.',
  },
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password.',
    ACCOUNT_LOCKED: 'Account temporarily locked due to multiple failed attempts.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    OAUTH_FAILED: 'OAuth authentication failed. Please try again.',
    OAUTH_CANCELLED: 'Authentication was cancelled.',
  },
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    WEAK_PASSWORD: 'Password is too weak. Please choose a stronger password.',
    PASSWORDS_DONT_MATCH: 'Passwords do not match.',
  },
  GENERAL: {
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    MAINTENANCE: 'System is under maintenance. Please try again later.',
  },
};

// ✅ ENHANCED: Helper Functions with additional utilities
export const CONFIG_HELPERS = {
  // Build complete API URL
  buildApiUrl: (endpoint) => {
    const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, ''); // Remove trailing slash
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanEndpoint}`;
  },

  // Get endpoint by category and action
  getEndpoint: (category, action) => {
    return API_CONFIG.ENDPOINTS[category]?.[action] || '';
  },

  // Get complete URL for endpoint
  getApiUrl: (category, action) => {
    const endpoint = CONFIG_HELPERS.getEndpoint(category, action);
    return endpoint ? CONFIG_HELPERS.buildApiUrl(endpoint) : '';
  },

  // Get role configuration
  getRoleConfig: (role) => {
    return ROLE_CONFIG[role] || ROLE_CONFIG[USER_ROLES.STUDENT];
  },

  // Get theme color by key path
  getThemeColor: (path) => {
    const keys = path.split('.');
    let color = THEME_COLORS;

    for (const key of keys) {
      color = color[key];
      if (!color) return THEME_COLORS.primary.main;
    }

    return color;
  },

  // Check if feature is enabled
  isFeatureEnabled: (feature) => {
    return APP_CONFIG.FEATURES[feature] || false;
  },

  // Get validation rule
  getValidationRule: (field) => {
    return VALIDATION_RULES[field] || {};
  },

  // Validate field against rules
  validateField: (field, value) => {
    const rule = VALIDATION_RULES[field];
    if (!rule) return { isValid: true };

    const errors = [];

    // Check if required
    if (rule.required && (!value || value.trim() === '')) {
      errors.push('This field is required');
    }

    if (value) {
      // Check min length
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`Minimum ${rule.minLength} characters required`);
      }

      // Check max length
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`Maximum ${rule.maxLength} characters allowed`);
      }

      // Check pattern
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(rule.message || 'Invalid format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      message: errors[0] || null,
    };
  },

  // Get Google OAuth client ID for current platform
  getGoogleClientId: () => {
    const { Platform } = require('react-native');
    const clientIds = GOOGLE_CONFIG.CLIENT_ID;

    switch (Platform.OS) {
      case 'android':
        return clientIds.ANDROID || clientIds.WEB;
      case 'ios':
        return clientIds.IOS || clientIds.WEB;
      case 'web':
        return clientIds.WEB;
      default:
        return clientIds.WEB;
    }
  },

  // Check Google OAuth configuration
  isGoogleOAuthConfigured: () => {
    return GOOGLE_CONFIG.isConfigured();
  },

  // Get appropriate redirect URI for current environment
  getGoogleRedirectUri: () => {
    if (__DEV__) {
      return GOOGLE_CONFIG.REDIRECT_URIS.EXPO_PROXY;
    }
    return GOOGLE_CONFIG.REDIRECT_URIS.STANDALONE;
  },
};

// ✅ ENHANCED: Development Configuration
export const DEV_CONFIG = {
  ENABLE_LOGGING: __DEV__,
  ENABLE_NETWORK_LOGGING: __DEV__,
  ENABLE_PERFORMANCE_MONITORING: __DEV__,
  ENABLE_MOCK_DATA: false,
  BYPASS_AUTH: false, // Set to true for testing without authentication
  SHOW_DEV_MENU: __DEV__,
  OAUTH_SIMULATION_MODE: __DEV__, // Enable OAuth simulation in development

  // ✅ Mock data for testing
  MOCK_USER: {
    id: 'mock-user-123',
    fullName: 'Demo Student',
    email: 'demo.student@schoolbridge.edu',
    role: USER_ROLES.STUDENT,
    avatar: null,
    grade: '10th Grade',
    section: 'A',
    provider: 'mock',
  },

  MOCK_GOOGLE_USER: {
    id: 'google-mock-456',
    fullName: 'Google Demo User',
    email: 'google.demo@schoolbridge.edu',
    role: null, // Will need role selection
    avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
    provider: 'google',
    verified: true,
  },

  // ✅ Alternative API URLs for testing
  ALTERNATIVE_APIS: [
    'http://192.168.0.101:5000/api',
    'http://192.168.0.106:5000/api',
    'http://localhost:5000/api',
    'http://10.0.2.2:5000/api', // Android emulator
  ],

  // ✅ Test endpoints
  TEST_ENDPOINTS: {
    connectivity: '/test/connectivity',
    echo: '/test/echo',
    auth: '/test/auth',
    roles: '/test/roles',
  },
};

// ✅ NEW: Export convenience functions
export const {
  buildApiUrl,
  getEndpoint,
  getApiUrl,
  getRoleConfig,
  getThemeColor,
  isFeatureEnabled,
  getValidationRule,
  validateField,
  getGoogleClientId,
  isGoogleOAuthConfigured,
  getGoogleRedirectUri,
} = CONFIG_HELPERS;

// ✅ ENHANCED: Configuration validation and logging
if (__DEV__) {
  console.log('📋 SchoolBridge Configuration Loaded:');
  console.log('🌐 API Base URL:', API_CONFIG.BASE_URL);
  console.log('🔐 Google Auth Enabled:', isFeatureEnabled('GOOGLE_AUTH'));
  console.log('� Google OAuth Configured:', isGoogleOAuthConfigured());
  console.log('�📱 Environment:', APP_CONFIG.ENVIRONMENT);
  console.log('🔍 Debug Mode:', APP_CONFIG.DEBUG_MODE);
  console.log('💾 Available Storage Keys:', Object.keys(STORAGE_KEYS).length);
  console.log('🎨 Theme Colors Loaded:', Object.keys(THEME_COLORS).length);
  console.log('📋 API Endpoints:', Object.keys(API_CONFIG.ENDPOINTS).length);

  // ✅ Validate Google OAuth configuration
  if (isFeatureEnabled('GOOGLE_AUTH')) {
    if (isGoogleOAuthConfigured()) {
      console.log('✅ Google OAuth properly configured');
      console.log('🔑 Client ID for platform:', getGoogleClientId().substring(0, 30) + '...');
      console.log('🔄 Redirect URI:', getGoogleRedirectUri());
    } else {
      console.warn('⚠️ Google OAuth configuration incomplete');
    }
  }

  // ✅ Test key configurations
  const testValidation = validateField('email', 'test@example.com');
  console.log('🧪 Validation test (email):', testValidation.isValid ? 'PASS' : 'FAIL');
}

// ✅ Export default configuration object with all configs
export default {
  API_CONFIG,
  USER_ROLES,
  ROLE_CONFIG,
  STORAGE_KEYS,
  APP_CONFIG,
  GOOGLE_CONFIG,
  THEME_COLORS,
  VALIDATION_RULES,
  API_STATUS_CODES,
  ERROR_MESSAGES,
  DEV_CONFIG,
  CONFIG_HELPERS,
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
