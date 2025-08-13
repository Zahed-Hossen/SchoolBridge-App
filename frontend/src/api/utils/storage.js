import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants/config';

export const StorageUtils = {
  // Auth-related storage
  auth: {
    async saveTokens(accessToken, refreshToken = '') {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
      ]);
    },

    async getAccessToken() {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    },

    async getRefreshToken() {
      return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    },

    async saveUserData(userData, role, loginMethod = 'email') {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.USER_DATA, JSON.stringify(userData)],
        [STORAGE_KEYS.USER_ROLE, role],
        [STORAGE_KEYS.LOGIN_METHOD, loginMethod],
      ]);
    },

    async getUserData() {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    },

    async getUserRole() {
      return await AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE);
    },

    async getLoginMethod() {
      return await AsyncStorage.getItem(STORAGE_KEYS.LOGIN_METHOD) || 'unknown';
    },

    async clearAll() {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.USER_ROLE,
        STORAGE_KEYS.LOGIN_METHOD,
      ]);
    },

    async getAuthStatus() {
      try {
        const [token, user, role, method] = await Promise.all([
          this.getAccessToken(),
          this.getUserData(),
          this.getUserRole(),
          this.getLoginMethod(),
        ]);

        return {
          isAuthenticated: !!token,
          hasUser: !!user,
          role,
          loginMethod: method,
          tokenExists: !!token,
        };
      } catch (error) {
        return {
          isAuthenticated: false,
          hasUser: false,
          role: null,
          loginMethod: null,
          tokenExists: false,
        };
      }
    },
  },

  // Debug utilities
  async debugStorage() {
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
      return storageData;
    } catch (error) {
      return {};
    }
  },
};
