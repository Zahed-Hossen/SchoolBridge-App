import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';

console.log('🌐 API Base URL:', API_CONFIG.BASE_URL);

// ✅ ENHANCED: Create axios instance with proper configuration
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT || 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ✅ Enhanced debug logging
console.log('🔍 API_CONFIG:', API_CONFIG);
console.log('🔍 BASE_URL:', API_CONFIG?.BASE_URL);
console.log('🔍 STORAGE_KEYS:', STORAGE_KEYS);

// ✅ ENHANCED: Request interceptor with better error handling
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Add auth token if available
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Enhanced logging with request details
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
      console.log(`🔗 Full URL: ${config.baseURL}${config.url}`);

      // Log request body for non-GET requests
      if (config.method !== 'get' && config.data) {
        console.log('📦 Request Data:', config.data);
      }

      return config;
    } catch (error) {
      console.error('❌ Request interceptor error:', error);
      return config;
    }
  },
  (error) => {
    console.error('❌ Request setup error:', error);
    return Promise.reject(error);
  }
);

// ✅ ENHANCED: Response interceptor with comprehensive error handling
apiClient.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toUpperCase() || 'REQUEST';
    const url = response.config.url || 'UNKNOWN';

    console.log(`✅ ${method} ${url} - ${response.status}`);
    console.log('📥 Response Data:', response.data);

    return response.data; // Return only the data portion
  },
  async (error) => {
    const originalRequest = error.config;
    const method = error.config?.method?.toUpperCase() || 'REQUEST';
    const url = error.config?.url || 'UNKNOWN';

    // ✅ ENHANCED: Handle token refresh on 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (refreshToken) {
          console.log('🔄 Attempting token refresh...');

          // Make refresh request with proper headers
          const refreshResponse = await axios.post(
            `${API_CONFIG.BASE_URL}/auth/refresh`,
            { refreshToken },
            {
              timeout: 10000,
              headers: { 'Content-Type': 'application/json' }
            }
          );

          const newToken = refreshResponse.data?.accessToken || refreshResponse.data?.access_token;

          if (newToken) {
            // Store new token
            await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newToken);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            console.log('✅ Token refreshed, retrying request...');
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);

        // Clear all auth data on refresh failure
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

    // ✅ ENHANCED: Comprehensive error logging
    if (error.response) {
      console.error(`❌ ${method} ${url} - ${error.response.status}:`, error.response.data);
      console.error('📋 Response Headers:', error.response.headers);
    } else if (error.request) {
      console.error(`❌ ${method} ${url} - Network Error`);
      console.error('🌐 Check if backend server is running and accessible');
      console.error('📡 Request details:', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        timeout: error.config?.timeout
      });
    } else {
      console.error(`❌ ${method} ${url} - ${error.message}`);
    }

    return Promise.reject(error);
  }
);

// ✅ COMPLETE ENHANCED API SERVICE
export const apiService = {
  // ✅ ENHANCED: Test endpoints with better error handling
  test: {
    ping: async () => {
      try {
        console.log('🏓 Testing API connection...');
        const response = await apiClient.get('/test');
        console.log('✅ API ping successful:', response);
        return response;
      } catch (error) {
        console.error('❌ API ping failed:', error.message);
        throw error;
      }
    },

    health: async () => {
      try {
        console.log('🔍 Checking API health...');
        const response = await apiClient.get('/health');
        console.log('✅ API health check successful:', response);
        return response;
      } catch (error) {
        console.error('❌ API health check failed:', error.message);
        throw error;
      }
    },

    // ✅ NEW: Connection test with detailed info
    connection: async () => {
      try {
        console.log('🌐 Testing full connection...');
        const startTime = Date.now();
        const response = await apiClient.get('/test');
        const endTime = Date.now();

        const connectionInfo = {
          ...response,
          responseTime: endTime - startTime,
          baseURL: API_CONFIG.BASE_URL,
          timestamp: new Date().toISOString(),
        };

        console.log('✅ Connection test successful:', connectionInfo);
        return connectionInfo;
      } catch (error) {
        console.error('❌ Connection test failed:', error.message);
        return {
          success: false,
          error: error.message,
          baseURL: API_CONFIG.BASE_URL,
          timestamp: new Date().toISOString(),
        };
      }
    },
  },

  // ✅ ENHANCED: Auth endpoints with comprehensive error handling
  auth: {
    login: async (credentials) => {
      try {
        console.log('🔐 Attempting login for:', credentials.email);
        console.log('📋 Login data:', { email: credentials.email, role: credentials.role });

        const response = await apiClient.post('/auth/login', credentials);

        // ✅ ENHANCED: Handle different response structures
        const tokens = {
          accessToken: response.accessToken || response.access_token || response.token,
          refreshToken: response.refreshToken || response.refresh_token,
        };

        const userData = response.user || response.data?.user || response;

        // Store tokens after successful login
        if (tokens.accessToken) {
          await AsyncStorage.multiSet([
            [STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken],
            [STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken || ''],
            [STORAGE_KEYS.USER_DATA, JSON.stringify(userData)],
            [STORAGE_KEYS.USER_ROLE, userData.role || credentials.role],
            [STORAGE_KEYS.LOGIN_METHOD, 'email'],
          ]);
          console.log('✅ Login tokens stored successfully');
        }

        console.log('✅ Login successful for:', userData.email);
        return response;
      } catch (error) {
        console.error('❌ Login error:', error.response?.data || error.message);

        // ✅ ENHANCED: Provide user-friendly error messages
        if (error.response?.status === 401) {
          throw new Error('Invalid email or password. Please check your credentials.');
        } else if (error.response?.status === 404) {
          throw new Error('No account found with this email. Please sign up first.');
        } else if (error.code === 'NETWORK_ERROR' || !error.response) {
          throw new Error('Network error. Please check your internet connection and try again.');
        }

        throw error;
      }
    },

    register: async (userData) => {
      try {
        console.log('📝 Attempting registration for:', userData.email);
        console.log('📋 Registration data:', {
          email: userData.email,
          fullName: userData.fullName,
          role: userData.role
        });

        const response = await apiClient.post('/auth/signup', userData);
        console.log('✅ Registration successful:', response);
        return response;
      } catch (error) {
        console.error('❌ Registration error:', error.response?.data || error.message);

        // ✅ ENHANCED: User-friendly error messages
        if (error.response?.status === 409) {
          throw new Error('An account with this email already exists. Please try logging in.');
        } else if (error.response?.status === 400) {
          throw new Error(error.response.data?.message || 'Please check your registration details.');
        }

        throw error;
      }
    },

    googleAuth: async (googleData) => {
      try {
        console.log('🔐 Attempting Google OAuth with backend...');
        console.log('📤 Google OAuth data:', {
          email: googleData.user?.email,
          name: googleData.user?.name,
          role: googleData.role
        });

        // ✅ ENHANCED: Prepare OAuth payload
        const payload = {
          user: {
            googleId: googleData.user.googleId,
            email: googleData.user.email,
            firstName: googleData.user.firstName,
            lastName: googleData.user.lastName,
            fullName: googleData.user.name,
            avatar: googleData.user.avatar,
            verified: googleData.user.verified,
          },
          role: googleData.role,
          tokens: googleData.tokens,
          idToken: googleData.tokens?.idToken,
        };

        const response = await apiClient.post('/auth/google', payload);

        // ✅ ENHANCED: Handle OAuth response
        const tokens = {
          accessToken: response.accessToken || response.access_token || response.tokens?.accessToken,
          refreshToken: response.refreshToken || response.refresh_token || response.tokens?.refreshToken,
        };

        const userData = response.user || response.data?.user;

        // Store tokens after successful OAuth
        if (tokens.accessToken) {
          await AsyncStorage.multiSet([
            [STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken],
            [STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken || ''],
            [STORAGE_KEYS.USER_DATA, JSON.stringify(userData)],
            [STORAGE_KEYS.USER_ROLE, userData.role || googleData.role],
            [STORAGE_KEYS.LOGIN_METHOD, 'google'],
          ]);
          console.log('✅ Google OAuth tokens stored successfully');
        }

        console.log('✅ Google OAuth successful for:', userData.email);
        return response;
      } catch (error) {
        console.error('❌ Google OAuth error:', error.response?.data || error.message);

        // ✅ ENHANCED: Fallback for development
        if (error.code === 'NETWORK_ERROR' || !error.response) {
          console.log('🔧 Network error in OAuth, check if backend is running');
        }

        throw error;
      }
    },

    refresh: async (refreshToken) => {
      try {
        console.log('🔄 Refreshing authentication token...');
        const response = await apiClient.post('/auth/refresh', { refreshToken });
        console.log('✅ Token refresh successful');
        return response;
      } catch (error) {
        console.error('❌ Token refresh error:', error.response?.data || error.message);
        throw error;
      }
    },

    logout: async () => {
      try {
        console.log('🚪 Attempting logout...');
        const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

        // Send logout request to server if we have a refresh token
        if (refreshToken) {
          try {
            await apiClient.post('/auth/logout', { refreshToken });
            console.log('✅ Server logout successful');
          } catch (serverError) {
            console.log('⚠️ Server logout failed, proceeding with local logout');
          }
        }

        // Clear all stored data
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.ACCESS_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER_DATA,
          STORAGE_KEYS.USER_ROLE,
          STORAGE_KEYS.LOGIN_METHOD,
        ]);

        console.log('✅ Logout successful - all data cleared');
        return { success: true, message: 'Logged out successfully' };
      } catch (error) {
        console.error('❌ Logout error:', error);

        // Still clear local data even if server request fails
        try {
          await AsyncStorage.multiRemove([
            STORAGE_KEYS.ACCESS_TOKEN,
            STORAGE_KEYS.REFRESH_TOKEN,
            STORAGE_KEYS.USER_DATA,
            STORAGE_KEYS.USER_ROLE,
            STORAGE_KEYS.LOGIN_METHOD,
          ]);
          console.log('✅ Local data cleared despite logout error');
        } catch (clearError) {
          console.error('❌ Failed to clear local data:', clearError);
        }

        return { success: true, message: 'Logged out locally' };
      }
    },

    forgotPassword: async (email) => {
      try {
        console.log('📧 Requesting password reset for:', email);
        const response = await apiClient.post('/auth/forgot-password', { email });
        console.log('✅ Password reset email sent');
        return response;
      } catch (error) {
        console.error('❌ Forgot password error:', error.response?.data || error.message);
        throw error;
      }
    },

    resetPassword: async (token, password) => {
      try {
        console.log('🔑 Resetting password with token...');
        const response = await apiClient.post('/auth/reset-password', { token, password });
        console.log('✅ Password reset successful');
        return response;
      } catch (error) {
        console.error('❌ Reset password error:', error.response?.data || error.message);
        throw error;
      }
    },

    getCurrentUser: async () => {
      try {
        console.log('👤 Getting current user...');
        const response = await apiClient.get('/auth/me');
        console.log('✅ Current user retrieved');
        return response;
      } catch (error) {
        console.error('❌ Get current user error:', error.response?.data || error.message);
        throw error;
      }
    },

    // ✅ NEW: Validate current session
    validateSession: async () => {
      try {
        console.log('🔍 Validating current session...');
        const response = await apiClient.get('/auth/validate');
        console.log('✅ Session is valid');
        return response;
      } catch (error) {
        console.error('❌ Session validation failed:', error.response?.data || error.message);
        throw error;
      }
    },
  },

  // ✅ ENHANCED: Announcements endpoints with full CRUD operations
  announcements: {
    getAll: async (filters = {}) => {
      try {
        console.log('📢 Fetching announcements with filters:', filters);
        const queryParams = new URLSearchParams();

        // ✅ ENHANCED: Support all filter types
        if (filters.category && filters.category !== 'All') {
          queryParams.append('category', filters.category);
        }
        if (filters.search) {
          queryParams.append('search', filters.search);
        }
        if (filters.priority) {
          queryParams.append('priority', filters.priority);
        }
        if (filters.page !== undefined) {
          queryParams.append('page', filters.page);
        }
        if (filters.limit !== undefined) {
          queryParams.append('limit', filters.limit);
        }
        if (filters.read !== undefined) {
          queryParams.append('read', filters.read);
        }
        if (filters.author) {
          queryParams.append('author', filters.author);
        }

        const url = `/announcements${queryParams.toString() ? `?${queryParams}` : ''}`;
        const response = await apiClient.get(url);
        console.log('✅ Announcements fetched successfully');
        return response;
      } catch (error) {
        console.error('❌ Get announcements error:', error.response?.data || error.message);
        throw error;
      }
    },

    getById: async (id) => {
      try {
        console.log('📢 Fetching announcement by ID:', id);
        const response = await apiClient.get(`/announcements/${id}`);
        console.log('✅ Announcement fetched successfully');
        return response;
      } catch (error) {
        console.error('❌ Get announcement error:', error.response?.data || error.message);
        throw error;
      }
    },

    markAsRead: async (id) => {
      try {
        console.log('✅ Marking announcement as read:', id);
        const response = await apiClient.post(`/announcements/${id}/read`);
        console.log('✅ Announcement marked as read');
        return response;
      } catch (error) {
        console.error('❌ Mark as read error:', error.response?.data || error.message);
        throw error;
      }
    },

    markAsUnread: async (id) => {
      try {
        console.log('📝 Marking announcement as unread:', id);
        const response = await apiClient.post(`/announcements/${id}/unread`);
        console.log('✅ Announcement marked as unread');
        return response;
      } catch (error) {
        console.error('❌ Mark as unread error:', error.response?.data || error.message);
        throw error;
      }
    },

    downloadAttachment: async (announcementId, attachmentId) => {
      try {
        console.log('📎 Downloading attachment:', attachmentId);
        const response = await apiClient.get(
          `/announcements/${announcementId}/attachments/${attachmentId}`,
          { responseType: 'blob' }
        );
        console.log('✅ Attachment downloaded successfully');
        return response;
      } catch (error) {
        console.error('❌ Download attachment error:', error.response?.data || error.message);
        throw error;
      }
    },

    getCategories: async () => {
      try {
        console.log('🏷️ Fetching announcement categories...');
        const response = await apiClient.get('/announcements/categories');
        console.log('✅ Categories fetched successfully');
        return response;
      } catch (error) {
        console.error('❌ Get categories error:', error.response?.data || error.message);
        throw error;
      }
    },

    // ✅ NEW: Create announcement (for teachers/admins)
    create: async (announcementData) => {
      try {
        console.log('📢 Creating new announcement...');
        const response = await apiClient.post('/announcements', announcementData);
        console.log('✅ Announcement created successfully');
        return response;
      } catch (error) {
        console.error('❌ Create announcement error:', error.response?.data || error.message);
        throw error;
      }
    },

    // ✅ NEW: Update announcement
    update: async (id, announcementData) => {
      try {
        console.log('✏️ Updating announcement:', id);
        const response = await apiClient.put(`/announcements/${id}`, announcementData);
        console.log('✅ Announcement updated successfully');
        return response;
      } catch (error) {
        console.error('❌ Update announcement error:', error.response?.data || error.message);
        throw error;
      }
    },

    // ✅ NEW: Delete announcement
    delete: async (id) => {
      try {
        console.log('🗑️ Deleting announcement:', id);
        const response = await apiClient.delete(`/announcements/${id}`);
        console.log('✅ Announcement deleted successfully');
        return response;
      } catch (error) {
        console.error('❌ Delete announcement error:', error.response?.data || error.message);
        throw error;
      }
    },
  },

  // ✅ ENHANCED: User management endpoints
  user: {
    getProfile: async () => {
      try {
        console.log('👤 Fetching user profile...');
        const response = await apiClient.get('/user/profile');
        console.log('✅ Profile fetched successfully');
        return response;
      } catch (error) {
        console.error('❌ Get profile error:', error.response?.data || error.message);
        throw error;
      }
    },

    updateProfile: async (data) => {
      try {
        console.log('✏️ Updating user profile...');
        const response = await apiClient.put('/user/profile', data);

        // Update stored user data
        const updatedUser = response.user || response.data?.user;
        if (updatedUser) {
          await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
          console.log('✅ Profile updated in storage');
        }

        console.log('✅ Profile updated successfully');
        return response;
      } catch (error) {
        console.error('❌ Update profile error:', error.response?.data || error.message);
        throw error;
      }
    },

    uploadAvatar: async (formData) => {
      try {
        console.log('📸 Uploading avatar...');
        const response = await apiClient.post('/user/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('✅ Avatar uploaded successfully');
        return response;
      } catch (error) {
        console.error('❌ Upload avatar error:', error.response?.data || error.message);
        throw error;
      }
    },

    changePassword: async (data) => {
      try {
        console.log('🔑 Changing password...');
        const response = await apiClient.post('/user/change-password', data);
        console.log('✅ Password changed successfully');
        return response;
      } catch (error) {
        console.error('❌ Change password error:', error.response?.data || error.message);
        throw error;
      }
    },

    deleteAccount: async () => {
      try {
        console.log('🗑️ Deleting user account...');
        const response = await apiClient.delete('/user/account');

        // Clear all stored data after successful deletion
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.ACCESS_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER_DATA,
          STORAGE_KEYS.USER_ROLE,
          STORAGE_KEYS.LOGIN_METHOD,
        ]);

        console.log('✅ Account deleted successfully');
        return response;
      } catch (error) {
        console.error('❌ Delete account error:', error.response?.data || error.message);
        throw error;
      }
    },
  },

  // ✅ ENHANCED: Student endpoints with comprehensive features
  student: {
    getDashboard: async () => {
      try {
        console.log('📊 Fetching student dashboard...');
        const response = await apiClient.get('/student/dashboard');
        console.log('✅ Student dashboard fetched successfully');
        return response;
      } catch (error) {
        console.error('❌ Get dashboard error:', error.response?.data || error.message);
        throw error;
      }
    },

    getGrades: async (filters = {}) => {
      try {
        console.log('📚 Fetching student grades with filters:', filters);
        const queryParams = new URLSearchParams();

        if (filters.subject) queryParams.append('subject', filters.subject);
        if (filters.semester) queryParams.append('semester', filters.semester);
        if (filters.year) queryParams.append('year', filters.year);
        if (filters.gradeType) queryParams.append('gradeType', filters.gradeType);

        const url = `/student/grades${queryParams.toString() ? `?${queryParams}` : ''}`;
        const response = await apiClient.get(url);
        console.log('✅ Grades fetched successfully');
        return response;
      } catch (error) {
        console.error('❌ Get grades error:', error.response?.data || error.message);
        throw error;
      }
    },

    getAssignments: async (filters = {}) => {
      try {
        console.log('📝 Fetching student assignments with filters:', filters);
        const queryParams = new URLSearchParams();

        if (filters.subject) queryParams.append('subject', filters.subject);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.dueDate) queryParams.append('dueDate', filters.dueDate);
        if (filters.priority) queryParams.append('priority', filters.priority);

        const url = `/student/assignments${queryParams.toString() ? `?${queryParams}` : ''}`;
        const response = await apiClient.get(url);
        console.log('✅ Assignments fetched successfully');
        return response;
      } catch (error) {
        console.error('❌ Get assignments error:', error.response?.data || error.message);
        throw error;
      }
    },

    getAssignmentById: async (assignmentId) => {
      try {
        console.log('📝 Fetching assignment details:', assignmentId);
        const response = await apiClient.get(`/student/assignments/${assignmentId}`);
        console.log('✅ Assignment details fetched successfully');
        return response;
      } catch (error) {
        console.error('❌ Get assignment details error:', error.response?.data || error.message);
        throw error;
      }
    },

    submitAssignment: async (assignmentId, formData) => {
      try {
        console.log('📤 Submitting assignment:', assignmentId);
        const response = await apiClient.post(
          `/student/assignments/${assignmentId}/submit`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 30000, // Extended timeout for file uploads
          }
        );
        console.log('✅ Assignment submitted successfully');
        return response;
      } catch (error) {
        console.error('❌ Submit assignment error:', error.response?.data || error.message);
        throw error;
      }
    },

    getAttendance: async (filters = {}) => {
      try {
        console.log('📅 Fetching student attendance with filters:', filters);
        const queryParams = new URLSearchParams();

        if (filters.subject) queryParams.append('subject', filters.subject);
        if (filters.month) queryParams.append('month', filters.month);
        if (filters.year) queryParams.append('year', filters.year);
        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);

        const url = `/student/attendance${queryParams.toString() ? `?${queryParams}` : ''}`;
        const response = await apiClient.get(url);
        console.log('✅ Attendance fetched successfully');
        return response;
      } catch (error) {
        console.error('❌ Get attendance error:', error.response?.data || error.message);
        throw error;
      }
    },

    getSchedule: async (filters = {}) => {
      try {
        console.log('🗓️ Fetching student schedule with filters:', filters);
        const queryParams = new URLSearchParams();

        if (filters.date) queryParams.append('date', filters.date);
        if (filters.week) queryParams.append('week', filters.week);
        if (filters.month) queryParams.append('month', filters.month);

        const url = `/student/schedule${queryParams.toString() ? `?${queryParams}` : ''}`;
        const response = await apiClient.get(url);
        console.log('✅ Schedule fetched successfully');
        return response;
      } catch (error) {
        console.error('❌ Get schedule error:', error.response?.data || error.message);
        throw error;
      }
    },

    getExams: async (filters = {}) => {
      try {
        console.log('📋 Fetching student exams with filters:', filters);
        const queryParams = new URLSearchParams();

        if (filters.subject) queryParams.append('subject', filters.subject);
        if (filters.type) queryParams.append('type', filters.type);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.upcoming) queryParams.append('upcoming', filters.upcoming);

        const url = `/student/exams${queryParams.toString() ? `?${queryParams}` : ''}`;
        const response = await apiClient.get(url);
        console.log('✅ Exams fetched successfully');
        return response;
      } catch (error) {
        console.error('❌ Get exams error:', error.response?.data || error.message);
        throw error;
      }
    },

    getPerformance: async (filters = {}) => {
      try {
        console.log('📈 Fetching student performance with filters:', filters);
        const queryParams = new URLSearchParams();

        if (filters.subject) queryParams.append('subject', filters.subject);
        if (filters.period) queryParams.append('period', filters.period);
        if (filters.type) queryParams.append('type', filters.type);

        const url = `/student/performance${queryParams.toString() ? `?${queryParams}` : ''}`;
        const response = await apiClient.get(url);
        console.log('✅ Performance data fetched successfully');
        return response;
      } catch (error) {
        console.error('❌ Get performance error:', error.response?.data || error.message);
        throw error;
      }
    },

    // ✅ NEW: Get student timetable
    getTimetable: async (filters = {}) => {
      try {
        console.log('🕐 Fetching student timetable...');
        const queryParams = new URLSearchParams();

        if (filters.week) queryParams.append('week', filters.week);
        if (filters.date) queryParams.append('date', filters.date);

        const url = `/student/timetable${queryParams.toString() ? `?${queryParams}` : ''}`;
        const response = await apiClient.get(url);
        console.log('✅ Timetable fetched successfully');
        return response;
      } catch (error) {
        console.error('❌ Get timetable error:', error.response?.data || error.message);
        throw error;
      }
    },
  },

  // ✅ ENHANCED: Common endpoints for all roles
  common: {
    getNotifications: async (filters = {}) => {
      try {
        console.log('🔔 Fetching notifications with filters:', filters);
        const queryParams = new URLSearchParams();

        if (filters.type) queryParams.append('type', filters.type);
        if (filters.read !== undefined) queryParams.append('read', filters.read);
        if (filters.limit) queryParams.append('limit', filters.limit);
        if (filters.page) queryParams.append('page', filters.page);

        const url = `/notifications${queryParams.toString() ? `?${queryParams}` : ''}`;
        const response = await apiClient.get(url);
        console.log('✅ Notifications fetched successfully');
        return response;
      } catch (error) {
        console.error('❌ Get notifications error:', error.response?.data || error.message);
        throw error;
      }
    },

    markNotificationRead: async (notificationId) => {
      try {
        console.log('✅ Marking notification as read:', notificationId);
        const response = await apiClient.post(`/notifications/${notificationId}/read`);
        console.log('✅ Notification marked as read');
        return response;
      } catch (error) {
        console.error('❌ Mark notification read error:', error.response?.data || error.message);
        throw error;
      }
    },

    getSettings: async () => {
      try {
        console.log('⚙️ Fetching user settings...');
        const response = await apiClient.get('/settings');
        console.log('✅ Settings fetched successfully');
        return response;
      } catch (error) {
        console.error('❌ Get settings error:', error.response?.data || error.message);
        throw error;
      }
    },

    updateSettings: async (data) => {
      try {
        console.log('⚙️ Updating user settings...');
        const response = await apiClient.put('/settings', data);
        console.log('✅ Settings updated successfully');
        return response;
      } catch (error) {
        console.error('❌ Update settings error:', error.response?.data || error.message);
        throw error;
      }
    },

    uploadFile: async (formData) => {
      try {
        console.log('📁 Uploading file...');
        const response = await apiClient.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000, // Extended timeout for file uploads
        });
        console.log('✅ File uploaded successfully');
        return response;
      } catch (error) {
        console.error('❌ Upload file error:', error.response?.data || error.message);
        throw error;
      }
    },

    downloadFile: async (fileId) => {
      try {
        console.log('📥 Downloading file:', fileId);
        const response = await apiClient.get(`/files/${fileId}`, {
          responseType: 'blob',
        });
        console.log('✅ File downloaded successfully');
        return response;
      } catch (error) {
        console.error('❌ Download file error:', error.response?.data || error.message);
        throw error;
      }
    },
  },

  // ✅ ENHANCED: Utility functions with comprehensive helpers
  utils: {
    // Check if user is authenticated
    isAuthenticated: async () => {
      try {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        console.log('🔍 Authentication check:', !!token);
        return !!token;
      } catch (error) {
        console.error('❌ Authentication check error:', error);
        return false;
      }
    },

    // Get stored user data
    getStoredUser: async () => {
      try {
        const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
        const user = userData ? JSON.parse(userData) : null;
        console.log('👤 Stored user:', user ? user.email : 'none');
        return user;
      } catch (error) {
        console.error('❌ Error getting stored user:', error);
        return null;
      }
    },

    // Get stored user role
    getStoredRole: async () => {
      try {
        const role = await AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE);
        console.log('👥 Stored role:', role);
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
        console.log('🔑 Token exists:', !!token);
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
        console.log('✅ All auth data cleared');
      } catch (error) {
        console.error('❌ Error clearing auth data:', error);
      }
    },

    // Get login method
    getLoginMethod: async () => {
      try {
        const method = await AsyncStorage.getItem(STORAGE_KEYS.LOGIN_METHOD);
        console.log('🔐 Login method:', method);
        return method || 'unknown';
      } catch (error) {
        console.error('❌ Error getting login method:', error);
        return 'unknown';
      }
    },

    // ✅ ENHANCED: Check network connectivity with detailed info
    checkConnectivity: async () => {
      try {
        console.log('🌐 Checking network connectivity...');
        const startTime = Date.now();
        const response = await apiClient.get('/health', { timeout: 5000 });
        const endTime = Date.now();

        const connectivity = {
          connected: true,
          responseTime: endTime - startTime,
          serverStatus: response.message || 'OK',
          timestamp: new Date().toISOString(),
          baseURL: API_CONFIG.BASE_URL,
        };

        console.log('✅ Connectivity check successful:', connectivity);
        return connectivity;
      } catch (error) {
        const connectivity = {
          connected: false,
          error: error.message,
          timestamp: new Date().toISOString(),
          baseURL: API_CONFIG.BASE_URL,
        };

        console.log('❌ Connectivity check failed:', connectivity);
        return connectivity;
      }
    },

    // ✅ ENHANCED: Validate token with user data
    validateToken: async () => {
      try {
        console.log('🔍 Validating authentication token...');
        const response = await apiClient.get('/auth/validate');
        console.log('✅ Token validation successful');
        return { valid: true, user: response.user || response.data };
      } catch (error) {
        console.log('❌ Token validation failed:', error.message);
        return { valid: false, error: error.message };
      }
    },

    // ✅ ENHANCED: Get comprehensive app info
    getAppInfo: async () => {
      try {
        console.log('📱 Fetching app information...');
        const response = await apiClient.get('/app-info');
        console.log('✅ App info fetched successfully');
        return response;
      } catch (error) {
        console.error('❌ Get app info error:', error.response?.data || error.message);
        throw error;
      }
    },

    // ✅ NEW: Get authentication status with details
    getAuthStatus: async () => {
      try {
        const [token, user, role, method] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
          AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
          AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE),
          AsyncStorage.getItem(STORAGE_KEYS.LOGIN_METHOD),
        ]);

        const authStatus = {
          isAuthenticated: !!token,
          hasUser: !!user,
          role: role,
          loginMethod: method,
          tokenExists: !!token,
        };

        console.log('🔍 Auth status:', authStatus);
        return authStatus;
      } catch (error) {
        console.error('❌ Error getting auth status:', error);
        return {
          isAuthenticated: false,
          hasUser: false,
          role: null,
          loginMethod: null,
          tokenExists: false,
        };
      }
    },

    // ✅ NEW: Debug storage contents
    debugStorage: async () => {
      try {
        const storageData = {};

        for (const key of Object.values(STORAGE_KEYS)) {
          try {
            const value = await AsyncStorage.getItem(key);
            storageData[key] = value ? (key.includes('TOKEN') ? '***EXISTS***' : value) : null;
          } catch (err) {
            storageData[key] = 'ERROR';
          }
        }

        console.log('🔍 Storage debug:', storageData);
        return storageData;
      } catch (error) {
        console.error('❌ Storage debug error:', error);
        return {};
      }
    },
  },
};

// ✅ ENHANCED: Legacy exports for backward compatibility
export default apiClient;
export { apiService as ApiService };

// ✅ NEW: Export individual service modules for selective imports
export const authService = apiService.auth;
export const announcementsService = apiService.announcements;
export const studentService = apiService.student;
export const userService = apiService.user;
export const commonService = apiService.common;
export const utilsService = apiService.utils;
export const testService = apiService.test;

console.log('✅ Enhanced API Service loaded successfully');
console.log('🔗 Base URL:', API_CONFIG.BASE_URL);
console.log('⚙️ Available services:', Object.keys(apiService));










