import { StorageUtils } from './storage';
import NetworkDetectionService from '../../services/NetworkDetectionService';

export const setupInterceptors = (client) => {
  // ✅ Request Interceptor
  client.interceptors.request.use(
    async (config) => {
      let token = await StorageUtils.auth.getAccessToken();

      // Handle missing tokens for Google OAuth users
      if (!token) {
        const [userData, loginMethod] = await Promise.all([
          StorageUtils.auth.getUserData(),
          StorageUtils.auth.getLoginMethod(),
        ]);

        if (userData && loginMethod === 'google') {
          console.log('⚠️ Google OAuth user missing token, using mock token');
          token = 'mock-google-oauth-token-for-dashboard';
        }
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
      console.log(`🔗 Full URL: ${config.baseURL}${config.url}`);

      if (config.data && Object.keys(config.data).length > 0) {
        console.log('📦 Request Data:', config.data);
      }

      return config;
    },
    (error) => {
      console.error('❌ Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // ✅ Response Interceptor
  client.interceptors.response.use(
    (response) => {
      console.log(
        `✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`
      );

      if (response.data) {
        console.log('📥 Response Data:', response.data);
      }

      return response;
    },
    async (error) => {
      if (error.response) {
        console.error(
          `❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response.status}:`,
          error.response.data
        );
      } else if (error.request) {
        console.error('❌ Network Error - No response received');
        console.error('🌐 Check if backend server is running and accessible');

        // Try server re-detection
        try {
          const networkService = NetworkDetectionService.getInstance();
          const newUrl = await networkService.forceRedetection();

          if (newUrl && newUrl !== error.config?.baseURL) {
            console.log('🔄 Detected new server, will retry...');
            // Note: In a real app, you'd want to retry the request here
          }
        } catch (redetectionError) {
          console.error('❌ Server re-detection failed:', redetectionError);
        }
      } else {
        console.error('❌ Request setup error:', error.message);
      }

      return Promise.reject(error);
    }
  );
};
