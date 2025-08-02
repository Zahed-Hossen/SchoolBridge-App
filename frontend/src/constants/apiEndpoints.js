import { API_CONFIG } from './config';

// ✅ Dynamic API Endpoint Registry
export const API_ENDPOINTS = {
  // ✅ System/Health Endpoints
  system: {
    health: {
      url: `${API_CONFIG.BASE_URL}/health`,
      method: 'GET',
      name: 'Health Check',
      description: 'Server health status',
      priority: 'critical',
      category: 'system',
      requiresAuth: false,
    },
    test: {
      url: `${API_CONFIG.BASE_URL}/test`,
      method: 'GET',
      name: 'API Test',
      description: 'Basic API functionality test',
      priority: 'critical',
      category: 'system',
      requiresAuth: false,
    },
    status: {
      url: `${API_CONFIG.BASE_URL}/status`,
      method: 'GET',
      name: 'Status Check',
      description: 'Service status information',
      priority: 'high',
      category: 'system',
      requiresAuth: false,
    },
    docs: {
      url: `${API_CONFIG.BASE_URL}/docs`,
      method: 'GET',
      name: 'API Documentation',
      description: 'API endpoint documentation',
      priority: 'low',
      category: 'system',
      requiresAuth: false,
    },
  },

  // ✅ Authentication Endpoints (that your app actually uses)
  auth: {
    login: {
      url: `${API_CONFIG.BASE_URL}/auth/login`,
      method: 'POST',
      name: 'User Login',
      description: 'Email/password authentication',
      priority: 'critical',
      category: 'auth',
      requiresAuth: false,
      testData: {
        email: 'test@example.com',
        password: 'TestPassword123',
        role: 'Student'
      },
      skipTest: true, // Don't test POST endpoints without proper data
    },
    signup: {
      url: `${API_CONFIG.BASE_URL}/auth/signup`,
      method: 'POST',
      name: 'User Registration',
      description: 'New user account creation',
      priority: 'critical',
      category: 'auth',
      requiresAuth: false,
      skipTest: true, // Don't test signup in connection test
    },
    google: {
      url: `${API_CONFIG.BASE_URL}/auth/google`,
      method: 'POST',
      name: 'Google OAuth',
      description: 'Google authentication',
      priority: 'high',
      category: 'auth',
      requiresAuth: false,
      skipTest: true,
    },
    validate: {
      url: `${API_CONFIG.BASE_URL}/auth/validate`,
      method: 'GET',
      name: 'Session Validation',
      description: 'Validate user session',
      priority: 'high',
      category: 'auth',
      requiresAuth: true,
    },
    refresh: {
      url: `${API_CONFIG.BASE_URL}/auth/refresh`,
      method: 'POST',
      name: 'Token Refresh',
      description: 'Refresh access token',
      priority: 'high',
      category: 'auth',
      requiresAuth: false,
      skipTest: true,
    },
    me: {
      url: `${API_CONFIG.BASE_URL}/auth/me`,
      method: 'GET',
      name: 'Current User',
      description: 'Get current user info',
      priority: 'high',
      category: 'auth',
      requiresAuth: true,
    },
  },

  // ✅ Content Endpoints
  content: {
    announcements: {
      url: `${API_CONFIG.BASE_URL}/announcements`,
      method: 'GET',
      name: 'Announcements',
      description: 'Get system announcements',
      priority: 'medium',
      category: 'content',
      requiresAuth: false,
    },
    devInfo: {
      url: `${API_CONFIG.BASE_URL}/dev/info`,
      method: 'GET',
      name: 'Development Info',
      description: 'Development environment details',
      priority: 'low',
      category: 'development',
      requiresAuth: false,
    },
  },

  // ✅ User Endpoints (add when you implement them)
  user: {
    profile: {
      url: `${API_CONFIG.BASE_URL}/users/profile`,
      method: 'GET',
      name: 'User Profile',
      description: 'Get user profile information',
      priority: 'high',
      category: 'user',
      requiresAuth: true,
    },
    dashboard: {
      url: `${API_CONFIG.BASE_URL}/users/dashboard`,
      method: 'GET',
      name: 'User Dashboard',
      description: 'Get user dashboard data',
      priority: 'medium',
      category: 'user',
      requiresAuth: true,
    },
  },

  // ✅ Student Endpoints (add when you implement them)
  student: {
    dashboard: {
      url: `${API_CONFIG.BASE_URL}/student/dashboard`,
      method: 'GET',
      name: 'Student Dashboard',
      description: 'Student-specific dashboard',
      priority: 'medium',
      category: 'student',
      requiresAuth: true,
    },
    grades: {
      url: `${API_CONFIG.BASE_URL}/student/grades`,
      method: 'GET',
      name: 'Student Grades',
      description: 'Get student grades',
      priority: 'medium',
      category: 'student',
      requiresAuth: true,
    },
    assignments: {
      url: `${API_CONFIG.BASE_URL}/student/assignments`,
      method: 'GET',
      name: 'Student Assignments',
      description: 'Get student assignments',
      priority: 'medium',
      category: 'student',
      requiresAuth: true,
    },
  },
};

// ✅ Helper functions for dynamic endpoint management
export const getEndpointsByCategory = (category) => {
  const endpoints = [];
  Object.values(API_ENDPOINTS).forEach(categoryEndpoints => {
    Object.values(categoryEndpoints).forEach(endpoint => {
      if (endpoint.category === category) {
        endpoints.push(endpoint);
      }
    });
  });
  return endpoints;
};

export const getTestableEndpoints = () => {
  const endpoints = [];
  Object.values(API_ENDPOINTS).forEach(categoryEndpoints => {
    Object.values(categoryEndpoints).forEach(endpoint => {
      if (!endpoint.skipTest) {
        endpoints.push(endpoint);
      }
    });
  });
  return endpoints.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
};

export const getEndpointsByPriority = (priority) => {
  const endpoints = [];
  Object.values(API_ENDPOINTS).forEach(categoryEndpoints => {
    Object.values(categoryEndpoints).forEach(endpoint => {
      if (endpoint.priority === priority && !endpoint.skipTest) {
        endpoints.push(endpoint);
      }
    });
  });
  return endpoints;
};

export const getCriticalEndpoints = () => {
  return getEndpointsByPriority('critical');
};

export const getAllCategories = () => {
  const categories = new Set();
  Object.values(API_ENDPOINTS).forEach(categoryEndpoints => {
    Object.values(categoryEndpoints).forEach(endpoint => {
      categories.add(endpoint.category);
    });
  });
  return Array.from(categories);
};
