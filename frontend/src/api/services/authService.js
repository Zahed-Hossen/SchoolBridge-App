import { apiCall } from '../client';
import { StorageUtils } from '../utils/storage';

export const authService = {
  async login(credentials) {
    try {
      console.log('🔐 Attempting login for:', credentials.email);

      const response = await apiCall('POST', '/auth/login', credentials);

      const tokens = {
        accessToken: response.data?.accessToken || response.accessToken || response.token,
        refreshToken: response.data?.refreshToken || response.refreshToken,
      };

      const userData = response.data?.user || response.user || response.data || response;

      // Store authentication data
      if (tokens.accessToken) {
        await StorageUtils.auth.saveTokens(tokens.accessToken, tokens.refreshToken);
        await StorageUtils.auth.saveUserData(userData, userData.role || credentials.role, 'email');
        console.log('✅ Login tokens stored successfully');
      }

      console.log('✅ Login successful for:', userData.email);
      return response;
    } catch (error) {
      console.error('❌ Login error:', error.message);

      if (error.status === 401) {
        throw new Error('Invalid email or password. Please check your credentials.');
      } else if (error.status === 404) {
        throw new Error('No account found with this email. Please sign up first.');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      }

      throw error;
    }
  },

  async register(userData) {
    try {
      console.log('📝 Attempting registration for:', userData.email);
      const response = await apiCall('POST', '/auth/signup', userData);
      console.log('✅ Registration successful:', response);
      return response;
    } catch (error) {
      console.error('❌ Registration error:', error.message);

      if (error.status === 409) {
        throw new Error('An account with this email already exists. Please try logging in.');
      } else if (error.status === 400) {
        throw new Error(error.message || 'Please check your registration details.');
      }

      throw error;
    }
  },

  async googleAuth(googleData) {
    try {
      console.log('🔐 Attempting Google OAuth with backend...');

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

      const response = await apiCall('POST', '/auth/google', payload);

      const tokens = {
        accessToken: response.data?.accessToken || response.accessToken,
        refreshToken: response.data?.refreshToken || response.refreshToken,
      };

      const userData = response.data?.user || response.user;

      // Store OAuth data
      if (tokens.accessToken) {
        await StorageUtils.auth.saveTokens(tokens.accessToken, tokens.refreshToken);
        await StorageUtils.auth.saveUserData(userData, userData.role || googleData.role, 'google');
        console.log('✅ Google OAuth tokens stored successfully');
      }

      console.log('✅ Google OAuth successful for:', userData.email);
      return response;
    } catch (error) {
      console.error('❌ Google OAuth error:', error.message);
      throw error;
    }
  },

  async logout() {
    try {
      console.log('🚪 Attempting logout...');
      const refreshToken = await StorageUtils.auth.getRefreshToken();

      if (refreshToken) {
        try {
          await apiCall('POST', '/auth/logout', { refreshToken });
          console.log('✅ Server logout successful');
        } catch (serverError) {
          console.log('⚠️ Server logout failed, proceeding with local logout');
        }
      }

      await StorageUtils.auth.clearAll();
      console.log('✅ Logout successful - all data cleared');

      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('❌ Logout error:', error);
      return { success: true, message: 'Logged out locally' };
    }
  },

  async refresh(refreshToken) {
    return await apiCall('POST', '/auth/refresh', { refreshToken });
  },

  async forgotPassword(email) {
    return await apiCall('POST', '/auth/forgot-password', { email });
  },

  async resetPassword(token, password) {
    return await apiCall('POST', '/auth/reset-password', { token, password });
  },

  async getCurrentUser() {
    return await apiCall('GET', '/auth/me');
  },

  async validateSession() {
    return await apiCall('GET', '/auth/validate');
  },
};
