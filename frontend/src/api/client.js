import axios from 'axios';
import { API_CONFIG } from '../constants/config';
import { getDynamicBaseUrl } from '../constants/config';
import NetworkDetectionService from '../services/NetworkDetectionService';
import { setupInterceptors } from './utils/interceptors';

let dynamicApiClient = null;
let isInitializing = false;

// ✅ Initialize API client with dynamic URL detection
export const initializeApiClient = async () => {
  if (dynamicApiClient && !isInitializing) {
    return dynamicApiClient;
  }

  if (isInitializing) {
    return new Promise((resolve) => {
      const checkInit = () => {
        if (!isInitializing && dynamicApiClient) {
          resolve(dynamicApiClient);
        } else {
          setTimeout(checkInit, 100);
        }
      };
      checkInit();
    });
  }

  isInitializing = true;

  try {
    console.log('🔧 Initializing API client with dynamic detection...');

    const baseURL = await getDynamicBaseUrl();
    console.log('🌐 Using detected API Base URL:', baseURL);

    dynamicApiClient = axios.create({
      baseURL,
      timeout: API_CONFIG.TIMEOUT || 15000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Setup interceptors
    setupInterceptors(dynamicApiClient);

    console.log('✅ API client initialized successfully');
    return dynamicApiClient;
  } catch (error) {
    console.error('❌ Failed to initialize API client:', error);
    throw error;
  } finally {
    isInitializing = false;
  }
};

// ✅ Generic API call wrapper
export const apiCall = async (method, endpoint, data = null, params = null) => {
  try {
    const client = await initializeApiClient();

    const config = {
      method: method.toLowerCase(),
      url: endpoint,
    };

    if (data) config.data = data;
    if (params) config.params = params;

    const response = await client(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw {
        status: error.response.status,
        message: error.response.data?.message || 'API Error',
        data: error.response.data,
      };
    } else if (error.request) {
      throw {
        status: 0,
        message: 'Network error. Please check your internet connection.',
        code: 'NETWORK_ERROR',
      };
    } else {
      throw {
        status: 0,
        message: error.message || 'Unknown error occurred',
        code: 'UNKNOWN_ERROR',
      };
    }
  }
};

export default dynamicApiClient;
