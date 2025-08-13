import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GoogleOAuthService from '../services/GoogleOAuthService';
import { authService } from '../api/services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('🔍 Checking auth status...');
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const userData = await AsyncStorage.getItem('userData');
      const userRole = await AsyncStorage.getItem('userRole');
      const loginMethod = await AsyncStorage.getItem('loginMethod');

      console.log('📦 Stored tokens:', {
        accessToken: !!accessToken,
        refreshToken: !!refreshToken,
        loginMethod,
        hasUserData: !!userData,
        hasUserRole: !!userRole,
      });

      if (userData) {
        const parsedUser = JSON.parse(userData);

        // ✅ FIXED: Always set user data first
        setUser(parsedUser);

        // ✅ FIXED: For Google OAuth users, check if they need role selection
        if (loginMethod === 'google') {
          if (userRole && parsedUser.role) {
            // User has completed role selection
            setRole(parsedUser.role);
            setIsAuthenticated(true);
            console.log('✅ Google OAuth user authenticated:', parsedUser.email, 'Role:', parsedUser.role);
          } else {
            // Google OAuth user needs role selection
            console.log('⚠️ Google OAuth user needs role selection:', parsedUser.email);
            setRole(null);
            setIsAuthenticated(false);
          }
        } else if (loginMethod === 'email') {
          // For email login, check normal authentication
          if (userRole && (parsedUser.role || userRole)) {
            setRole(parsedUser.role || userRole);
            setIsAuthenticated(true);
            console.log('✅ Email user authenticated:', parsedUser.email, 'Role:', parsedUser.role || userRole);
          } else {
            console.log('⚠️ Email user missing role data');
            setRole(null);
            setIsAuthenticated(false);
          }
        } else {
          // No login method or unknown method - clear partial data
          console.log('⚠️ Unknown login method, clearing data');
          await AsyncStorage.multiRemove(['userData', 'userRole', 'loginMethod']);
          setUser(null);
          setRole(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log('❌ No user data found');
        // Clear any orphaned data
        if (userRole || loginMethod) {
          console.log('🧹 Clearing orphaned data...');
          await AsyncStorage.multiRemove(['userRole', 'loginMethod', 'accessToken', 'refreshToken']);
        }
        setUser(null);
        setRole(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
      setUser(null);
      setRole(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
      console.log('✅ Auth check completed');
    }
  };

const login = async (email, password, role) => {
  setIsLoading(true);
  console.log('📝 Starting login process...');
  console.log('📝 Attempting login for:', email);
  console.log('📋 Login data:', { email, role });

  try {
    // ✅ FIXED: Use the auth.login method from your apiService
    const response = await authService.login({
      email,
      password,
      role,
    });

    console.log('📨 Login response:', response);

    // ✅ Your API service already handles token storage, so check the response
    if (response.success && response.data) {
      const { user, accessToken, refreshToken } = response.data;

      console.log('✅ Login successful for:', user.email);
      console.log('🔑 Tokens received:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
      });

      // ✅ Update state (tokens already stored by apiService)
      setUser(user);
      setRole(user.role);
      setIsAuthenticated(true);

      console.log('✅ Login completed successfully');
      console.log('👤 User set:', user.fullName);
      console.log('🎭 Role set:', user.role);

      return {
        success: true,
        user,
        message: 'Login successful',
      };
    } else {
      // ✅ Handle API error responses
      const errorMessage = response.message || response.error || 'Login failed';
      console.log('❌ Login failed:', errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  } catch (error) {
    console.error('❌ Login error:', error);

    // ✅ Your apiService already provides user-friendly error messages
    return {
      success: false,
      error: error.message || 'Login failed',
    };
  } finally {
    setIsLoading(false);
  }
};

  const signup = async (userData) => {
    try {
      setIsLoading(true);
      console.log('📝 Starting signup process...');

      // ✅ Use the updated API service
      const response = await authService.register(userData);

      console.log('✅ Registration successful:', response);

      // ✅ FIXED: Handle different response formats
      if (response.success !== false) {
        return {
          success: true,
          message: response.message || 'Account created successfully',
          user: response.user || response.data?.user,
        };
      } else {
        throw new Error(response.message || response.error || 'Registration failed');
      }
    } catch (error) {
      console.error('❌ Registration error:', error);

      // ✅ Better error handling for different error types
      let errorMessage = 'Registration failed';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (googleResult = null) => {
    try {
      console.log('🔐 Processing Google OAuth sign-in...');
      setIsLoading(true);

      let result;

      if (googleResult) {
        // ✅ Use the result passed from the screen
        result = googleResult;
      } else {
        // ✅ Fallback: call GoogleOAuthService directly
        result = await GoogleOAuthService.signIn();
      }

      if (result.success && result.user) {
        console.log('✅ Google OAuth successful for:', result.user.email);

        // Store user data temporarily (before role selection)
        await AsyncStorage.setItem('userData', JSON.stringify(result.user));
        await AsyncStorage.setItem('loginMethod', 'google');

        // Store Google tokens for backend authentication
        if (result.tokens?.idToken) {
          await AsyncStorage.setItem('googleIdToken', result.tokens.idToken);
        }

        setUser(result.user);

        return {
          success: true,
          user: result.user,
          needsRoleSelection: true,
          tokens: result.tokens,
        };
      } else if (result.cancelled) {
        console.log('ℹ️ User cancelled Google sign-in');
        return {
          success: false,
          error: 'Sign-in cancelled',
          cancelled: true,
        };
      } else {
        throw new Error(result.error || 'Google sign-in failed');
      }
    } catch (error) {
      console.error('❌ Google OAuth error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  // ✅ Add new method to complete OAuth setup after role selection
  const completeOAuthSetup = async (userRole) => {
    try {
      console.log('🔧 Completing OAuth setup with role:', userRole);

      if (!user) {
        throw new Error('No user data found');
      }

      // ✅ FIXED: Update user with selected role
      const updatedUser = { ...user, role: userRole };

      // ✅ FIXED: Store complete user data with role
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      await AsyncStorage.setItem('userRole', userRole);

      // ✅ FIXED: Now set authentication state
      setUser(updatedUser);
      setRole(userRole);
      setIsAuthenticated(true);

      console.log('✅ OAuth setup completed for role:', userRole);
      console.log('✅ Updated user object:', updatedUser);
      return { success: true };
    } catch (error) {
      console.error('❌ Error completing OAuth setup:', error);
      throw error;
    }
  };

  // ✅ Add method to clear authentication data
  const clearAuthData = async () => {
    try {
      console.log('🧹 Clearing all authentication data...');

      // Clear all stored data
      await AsyncStorage.multiRemove([
        'accessToken',
        'refreshToken',
        'userData',
        'userRole',
        'loginMethod',
      ]);

      // Clear state
      setUser(null);
      setRole(null);
      setIsAuthenticated(false);

      console.log('✅ Authentication data cleared');
    } catch (error) {
      console.error('❌ Error clearing auth data:', error);
    }
  };

  // Update the logout method in AuthContext:

  const logout = async () => {
    try {
      console.log('🚪 Starting comprehensive logout...');
      setIsLoading(true);

      // Check login method to clear appropriate tokens
      const loginMethod = await AsyncStorage.getItem('loginMethod');
      console.log('🔍 Login method detected:', loginMethod);

      // ✅ Enhanced logout for different login methods
      if (loginMethod === 'google') {
        try {
          console.log('🔐 Signing out from Google services...');
          await GoogleOAuthService.signOut();
          console.log('✅ Google sign-out completed');
        } catch (googleError) {
          console.warn('⚠️ Google sign-out error:', googleError.message);
          // Continue with local logout even if Google sign-out fails
        }
      }

      // ✅ Call backend logout endpoint if available
      try {
        console.log('🌐 Notifying backend of logout...');
        const refreshToken = await AsyncStorage.getItem('refreshToken');

        if (refreshToken) {
          await apiService.auth.logout();
          console.log('✅ Backend logout notification sent');
        }
      } catch (backendError) {
        console.warn('⚠️ Backend logout error:', backendError.message);
        // Continue with local logout even if backend fails
      }

      // ✅ Clear all stored authentication data
      console.log('🧹 Clearing all authentication data...');
      await AsyncStorage.multiRemove([
        'accessToken',
        'refreshToken',
        'userData',
        'userRole',
        'loginMethod',
        'googleIdToken', // Clear Google ID token if exists
      ]);

      // ✅ Clear application state
      setUser(null);
      setRole(null);
      setIsAuthenticated(false);

      console.log('✅ Logout completed successfully');
      console.log('🔄 User will be redirected to login screen');

    } catch (error) {
      console.error('❌ Logout error:', error);

      // ✅ Even if there's an error, clear local state for security
      try {
        await AsyncStorage.multiRemove([
          'accessToken',
          'refreshToken',
          'userData',
          'userRole',
          'loginMethod',
          'googleIdToken',
        ]);

        setUser(null);
        setRole(null);
        setIsAuthenticated(false);

        console.log('✅ Local cleanup completed despite errors');
      } catch (cleanupError) {
        console.error('❌ Critical: Local cleanup failed:', cleanupError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    role,
    login,
    signup,
    logout,
    signInWithGoogle,
    completeOAuthSetup,
    clearAuthData,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
