import { apiCall } from '../client';
import { API_CONFIG } from '../../constants/config';

export const testService = {
  async ping() {
    try {
      console.log('🏓 Testing API connection...');
      const response = await apiCall('GET', '/test');
      console.log('✅ API ping successful:', response);
      return response;
    } catch (error) {
      console.error('❌ API ping failed:', error.message);
      throw error;
    }
  },

  async health() {
    try {
      console.log('🔍 Checking API health...');
      const response = await apiCall('GET', '/health');
      console.log('✅ API health check successful:', response);
      return response;
    } catch (error) {
      console.error('❌ API health check failed:', error.message);
      throw error;
    }
  },

  async connection() {
    try {
      console.log('🌐 Testing full connection...');
      const startTime = Date.now();
      const response = await apiCall('GET', '/test');
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
};
