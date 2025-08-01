import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';

console.log('🌐 API Base URL:', API_CONFIG.BASE_URL);

// Create axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Debug logging to check configuration
console.log('🔍 API_CONFIG:', API_CONFIG);
console.log('🔍 BASE_URL:', API_CONFIG?.BASE_URL);
console.log('🔍 STORAGE_KEYS:', STORAGE_KEYS);

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    } catch (error) {
      console.error('❌ Request interceptor error:', error);
      return config;
    }
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with enhanced error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response.data; // Return only the data portion
  },
  async (error) => {
    const originalRequest = error.config;
    const method = error.config?.method?.toUpperCase() || 'REQUEST';
    const url = error.config?.url || 'UNKNOWN';

    // ✅ FIXED: Handle token refresh on 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (refreshToken) {
          console.log('🔄 Attempting token refresh...');

          // Make refresh request
          const refreshResponse = await axios.post(
            `${API_CONFIG.BASE_URL}/auth/refresh`,
            { refreshToken },
            { timeout: 10000 }
          );

          const { accessToken } = refreshResponse.data;

          // Store new token
          await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);

        // Clear all auth data
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.ACCESS_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER_DATA,
          STORAGE_KEYS.USER_ROLE,
          STORAGE_KEYS.LOGIN_METHOD,
        ]);

        // Notify app of auth failure
        if (global.handleAuthError) {
          global.handleAuthError('Session expired');
        }
      }
    }

    // Enhanced error logging
    if (error.response) {
      console.error(`❌ ${method} ${url} - ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      console.error(`❌ ${method} ${url} - Network Error`);
    } else {
      console.error(`❌ ${method} ${url} - ${error.message}`);
    }

    return Promise.reject(error);
  }
);

// ✅ COMPLETE FIXED: API Service with correct endpoints
export const apiService = {
  // Test endpoints
  test: {
    ping: () => apiClient.get('/test'),
    health: () => apiClient.get('/health'),
  },

  // ✅ FIXED: Auth endpoints matching your backend exactly
  auth: {
    login: async (credentials) => {
      try {
        console.log('🔐 Attempting login for:', credentials.email);
        const response = await apiClient.post('/auth/login', credentials);

        // Store tokens after successful login
        if (response.accessToken) {
          await AsyncStorage.multiSet([
            [STORAGE_KEYS.ACCESS_TOKEN, response.accessToken],
            [STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken || ''],
            [STORAGE_KEYS.USER_DATA, JSON.stringify(response.user)],
            [STORAGE_KEYS.USER_ROLE, response.user.role],
            [STORAGE_KEYS.LOGIN_METHOD, 'email'],
          ]);
          console.log('✅ Login tokens stored');
        }

        return response;
      } catch (error) {
        console.error('❌ Login error:', error.response?.data || error.message);
        throw error;
      }
    },

    register: async (userData) => {
      try {
        console.log('📝 Attempting registration for:', userData.email);
        // ✅ FIXED: Use /auth/signup to match your backend
        const response = await apiClient.post('/auth/signup', userData);
        console.log('✅ Registration successful');
        return response;
      } catch (error) {
        console.error('❌ Registration error:', error.response?.data || error.message);
        throw error;
      }
    },

    googleAuth: async (googleData) => {
      try {
        console.log('🔐 Attempting Google OAuth...');
        const response = await apiClient.post('/auth/google', googleData);

        // Store tokens after successful OAuth
        if (response.accessToken) {
          await AsyncStorage.multiSet([
            [STORAGE_KEYS.ACCESS_TOKEN, response.accessToken],
            [STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken || ''],
            [STORAGE_KEYS.USER_DATA, JSON.stringify(response.user)],
            [STORAGE_KEYS.USER_ROLE, response.user.role],
            [STORAGE_KEYS.LOGIN_METHOD, 'google'],
          ]);
          console.log('✅ Google OAuth tokens stored');
        }

        return response;
      } catch (error) {
        console.error('❌ Google auth error:', error.response?.data || error.message);
        throw error;
      }
    },

    refresh: async (refreshToken) => {
      try {
        console.log('🔄 Refreshing token...');
        const response = await apiClient.post('/auth/refresh', { refreshToken });
        return response;
      } catch (error) {
        console.error('❌ Token refresh error:', error.response?.data || error.message);
        throw error;
      }
    },

    logout: async () => {
      try {
        const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

        // Send logout request to server if we have a refresh token
        if (refreshToken) {
          await apiClient.post('/auth/logout', { refreshToken });
        }

        // Clear all stored data
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.ACCESS_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER_DATA,
          STORAGE_KEYS.USER_ROLE,
          STORAGE_KEYS.LOGIN_METHOD,
        ]);

        console.log('✅ Logout successful');
        return { success: true };
      } catch (error) {
        console.error('❌ Logout error:', error);

        // Still clear local data even if server request fails
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.ACCESS_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER_DATA,
          STORAGE_KEYS.USER_ROLE,
          STORAGE_KEYS.LOGIN_METHOD,
        ]);

        return { success: true }; // Consider local logout successful
      }
    },

    forgotPassword: async (email) => {
      try {
        console.log('📧 Requesting password reset for:', email);
        const response = await apiClient.post('/auth/reset-password', { email });
        return response;
      } catch (error) {
        console.error('❌ Forgot password error:', error.response?.data || error.message);
        throw error;
      }
    },

    resetPassword: async (token, password) => {
      try {
        console.log('🔑 Resetting password...');
        const response = await apiClient.post('/auth/change-password', { token, password });
        return response;
      } catch (error) {
        console.error('❌ Reset password error:', error.response?.data || error.message);
        throw error;
      }
    },
  },

  // User endpoints
  user: {
    getProfile: async () => {
      try {
        const response = await apiClient.get('/user/profile');
        return response;
      } catch (error) {
        console.error('❌ Get profile error:', error.response?.data || error.message);
        throw error;
      }
    },

    updateProfile: async (data) => {
      try {
        const response = await apiClient.put('/user/profile', data);

        // Update stored user data
        const updatedUser = response.user;
        if (updatedUser) {
          await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
          console.log('✅ Profile updated in storage');
        }

        return response;
      } catch (error) {
        console.error('❌ Update profile error:', error.response?.data || error.message);
        throw error;
      }
    },

    uploadAvatar: async (formData) => {
      try {
        const response = await apiClient.post('/user/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response;
      } catch (error) {
        console.error('❌ Upload avatar error:', error.response?.data || error.message);
        throw error;
      }
    },
  },

  // Student endpoints
  student: {
    getDashboard: () => apiClient.get('/student/dashboard'),
    getGrades: () => apiClient.get('/student/grades'),
    getAssignments: () => apiClient.get('/student/assignments'),
    getAttendance: () => apiClient.get('/student/attendance'),
    getSchedule: () => apiClient.get('/student/schedule'),
  },

  // Teacher endpoints
  teacher: {
    getDashboard: () => apiClient.get('/teacher/dashboard'),
    getClasses: () => apiClient.get('/teacher/classes'),
    getStudents: (classId) => apiClient.get(`/teacher/classes/${classId}/students`),
    createAssignment: (data) => apiClient.post('/teacher/assignments', data),
    markAttendance: (data) => apiClient.post('/teacher/attendance', data),
  },

  // Parent endpoints
  parent: {
    getDashboard: () => apiClient.get('/parent/dashboard'),
    getChildren: () => apiClient.get('/parent/children'),
    getChildGrades: (childId) => apiClient.get(`/parent/children/${childId}/grades`),
    getChildAttendance: (childId) => apiClient.get(`/parent/children/${childId}/attendance`),
    getNotifications: () => apiClient.get('/parent/notifications'),
  },

  // Admin endpoints
  admin: {
    getDashboard: () => apiClient.get('/admin/dashboard'),
    getUsers: () => apiClient.get('/admin/users'),
    createUser: (data) => apiClient.post('/admin/users', data),
    updateUser: (id, data) => apiClient.put(`/admin/users/${id}`, data),
    deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
    getSystemStats: () => apiClient.get('/admin/system-stats'),
  },

  // ✅ ENHANCED: Utility functions
  utils: {
    // Check if user is authenticated
    isAuthenticated: async () => {
      try {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        return !!token;
      } catch (error) {
        return false;
      }
    },

    // Get stored user data
    getStoredUser: async () => {
      try {
        const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
        return userData ? JSON.parse(userData) : null;
      } catch (error) {
        console.error('❌ Error getting stored user:', error);
        return null;
      }
    },

    // Get stored user role
    getStoredRole: async () => {
      try {
        const role = await AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE);
        return role;
      } catch (error) {
        console.error('❌ Error getting stored role:', error);
        return null;
      }
    },

    // Get stored access token
    getStoredToken: async () => {
      try {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        return token;
      } catch (error) {
        console.error('❌ Error getting stored token:', error);
        return null;
      }
    },

    // Clear all auth data
    clearAuthData: async () => {
      try {
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.ACCESS_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER_DATA,
          STORAGE_KEYS.USER_ROLE,
          STORAGE_KEYS.LOGIN_METHOD,
        ]);
        console.log('✅ Auth data cleared');
      } catch (error) {
        console.error('❌ Error clearing auth data:', error);
      }
    },

    // Get login method
    getLoginMethod: async () => {
      try {
        const method = await AsyncStorage.getItem(STORAGE_KEYS.LOGIN_METHOD);
        return method || 'unknown';
      } catch (error) {
        console.error('❌ Error getting login method:', error);
        return 'unknown';
      }
    },
  },
};

export default apiClient;
