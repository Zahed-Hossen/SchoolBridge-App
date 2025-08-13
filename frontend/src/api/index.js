// Main API exports
export { initializeApiClient, apiCall } from './client';

// Service exports
export { authService } from './services/authService';
export { studentService } from './services/studentService';
export { testService } from './services/testService';

// Utility exports
export { StorageUtils } from './utils/storage';

// Legacy compatibility (if needed)
import { initializeApiClient } from './client';

// Create legacy apiClient wrapper
export const apiClient = {
  get: async (url, config) => {
    const client = await initializeApiClient();
    return client.get(url, config);
  },
  post: async (url, data, config) => {
    const client = await initializeApiClient();
    return client.post(url, data, config);
  },
  put: async (url, data, config) => {
    const client = await initializeApiClient();
    return client.put(url, data, config);
  },
  delete: async (url, config) => {
    const client = await initializeApiClient();
    return client.delete(url, config);
  },
  patch: async (url, data, config) => {
    const client = await initializeApiClient();
    return client.patch(url, data, config);
  },
};

// Main API service object (for backward compatibility)
export const apiService = {
  auth: authService,
  student: studentService,
  test: testService,
  // Add other services as you create them
};

// Default export
export default apiClient;

console.log('✅ Modular API Services loaded successfully');
