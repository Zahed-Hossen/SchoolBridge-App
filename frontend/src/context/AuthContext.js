import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GoogleOAuthService from '../services/GoogleOAuthService';
import authService from '../api/services/authService';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  role: null,
  login: () => {},
  signup: () => {},
  logout: () => {},
  signInWithGoogle: () => {},
  completeOAuthSetup: () => {},
  clearAuthData: () => {},
  checkAuthStatus: () => {},
  activateAccount: () => {},
  validateInvitation: () => {},
  resendVerificationEmail: () => {},
  forgotPassword: () => {},
  resetPassword: () => {},
});

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
  const [pendingInvitation, setPendingInvitation] = useState(null);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('🔍 Checking auth status...');
      const keys = await AsyncStorage.getAllKeys();
      console.log('🗝️ All AsyncStorage keys:', keys);
      const accessToken = await AsyncStorage.getItem(
        '@schoolbridge_access__token',
      );
      const refreshToken = await AsyncStorage.getItem(
        '@schoolbridge_refresh_token',
      );
      const userData = await AsyncStorage.getItem('@schoolbridge_user_data');
      const userRole = await AsyncStorage.getItem('@schoolbridge_user_role');
      const loginMethod = await AsyncStorage.getItem(
        '@schoolbridge_login_method',
      );

      console.log('📦 Stored tokens:', {
        accessToken,
        refreshToken,
        loginMethod,
        userData,
        userRole,
        accessTokenBool: !!accessToken,
        refreshTokenBool: !!refreshToken,
        hasUserData: !!userData,
        hasUserRole: !!userRole,
      });

      if (userData) {
        let parsedUser = null;
        try {
          parsedUser =
            typeof userData === 'string' ? JSON.parse(userData) : userData;
        } catch (err) {
          console.error('Failed to parse userData from storage:', err);
          parsedUser = null;
        }
        console.log('👤 Parsed userData:', parsedUser);

        // ✅ Always set user data first
        setUser(parsedUser);

        // ✅ For Google OAuth users, check if they need role selection
        if (loginMethod === 'google') {
          if (userRole && parsedUser?.role) {
            setRole(parsedUser.role);
            setIsAuthenticated(true);
            console.log(
              '✅ Google OAuth user authenticated:',
              parsedUser.email,
              'Role:',
              parsedUser.role,
            );
          } else {
            console.log(
              '⚠️ Google OAuth user needs role selection:',
              parsedUser?.email,
            );
            setRole(null);
            setIsAuthenticated(false);
          }
        } else if (loginMethod && loginMethod !== 'google') {
          // Accept any non-null loginMethod (including email addresses) as valid manual login
          if (userRole && (parsedUser?.role || userRole)) {
            setRole(parsedUser?.role || userRole);
            setIsAuthenticated(true);
            console.log(
              '✅ Manual/email user authenticated:',
              parsedUser?.email,
              'Role:',
              parsedUser?.role || userRole,
              'LoginMethod:',
              loginMethod,
            );
          } else {
            console.log('⚠️ Manual/email user missing role data');
            setRole(null);
            setIsAuthenticated(false);
          }
        } else {
          console.log('⚠️ Unknown login method, clearing data');
          await AsyncStorage.multiRemove([
            '@schoolbridge_user_data',
            '@schoolbridge_user_role',
            '@schoolbridge_login_method',
          ]);
          setUser(null);
          setRole(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log('❌ No user data found');
        if (userRole || loginMethod) {
          console.log('🧹 Clearing orphaned data...');
          await AsyncStorage.multiRemove([
            '@schoolbridge_user_role',
            '@schoolbridge_login_method',
            '@schoolbridge_access__token',
            '@schoolbridge_refresh_token',
          ]);
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

  // Activate user account with invitation
  const activateAccount = async (activationData) => {
    try {
      setIsLoading(true);

      // If there's an invitation token, include it in the activation
      const payload = { ...activationData };
      if (pendingInvitation?.token) {
        payload.invitationToken = pendingInvitation.token;
      }

      const response = await fetch(
        `${
          process.env.API_URL || 'http://localhost:5000/api'
        }/auth/activate-account`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to activate account');
      }

      // Clear pending invitation after successful activation
      if (pendingInvitation) {
        setPendingInvitation(null);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Activation error:', error);
      return {
        success: false,
        message: error.message || 'Failed to activate account',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password, role) => {
    setIsLoading(true);
    console.log('📝 Starting login process...');
    console.log('📝 Attempting login for:', email);
    console.log('📋 Login data:', { email, role });

    try {
      const response = await authService.login({
        email,
        password,
        role,
      });

      console.log('📨 Login response (raw):', response);
      if (typeof response !== 'object') {
        console.error('❌ Login response is not an object:', response);
      }
      if (response && response.success && response.data) {
        const { user, accessToken, refreshToken } = response.data;
        console.log('✅ Login successful for:', user?.email);
        console.log('🔑 Tokens received:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
        });
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
        // Debug: print all keys and values in response
        if (response && typeof response === 'object') {
          console.log(
            '❌ Login failed - response keys:',
            Object.keys(response),
          );
          for (const [k, v] of Object.entries(response)) {
            console.log(`❌ Login failed - response[${k}]:`, v);
          }
        }
        const errorMessage =
          (response && (response.message || response.error)) || 'Login failed';
        console.log('❌ Login failed:', errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error) {
      console.error('❌ Login error (exception):', error);
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
        throw new Error(
          response.message || response.error || 'Registration failed',
        );
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
        await AsyncStorage.setItem(
          '@schoolbridge_user_data',
          JSON.stringify(result.user),
        );
        await AsyncStorage.setItem('@schoolbridge_login_method', 'google');

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

      if (userData) {
        let parsedUser = null;
        try {
          parsedUser = JSON.parse(userData);
        } catch (err) {
          console.error('❌ Error parsing userData:', err, userData);
        }
        console.log('👤 Parsed userData:', parsedUser);

        // ✅ Always set user data first
        setUser(parsedUser);

        // ✅ Restore authentication if tokens and user data are present
        if (accessToken && refreshToken && parsedUser) {
          setIsAuthenticated(true);
          setRole(parsedUser.role);
        } else {
          setIsAuthenticated(false);
          setRole(null);
        }
      } else {
        console.log('❌ No user data found');
        setUser(null);
        setRole(null);
        setIsAuthenticated(false);
      }
      setIsAuthenticated(true);

      console.log('✅ OAuth setup completed for role:', userRole);
      // Remove reference to updatedUser if not defined
      // console.log('✅ Updated user object:', updatedUser);
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
        '@schoolbridge_access__token',
        '@schoolbridge_refresh_token',
        '@schoolbridge_user_data',
        '@schoolbridge_user_role',
        '@schoolbridge_login_method',
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
      const loginMethod = await AsyncStorage.getItem(
        '@schoolbridge_login_method',
      );
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
        '@schoolbridge_access__token',
        '@schoolbridge_refresh_token',
        '@schoolbridge_user_data',
        '@schoolbridge_user_role',
        '@schoolbridge_login_method',
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
          '@schoolbridge_access__token',
          '@schoolbridge_refresh_token',
          '@schoolbridge_user_data',
          '@schoolbridge_user_role',
          '@schoolbridge_login_method',
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

  // Validate an invitation token
  const validateInvitation = async (token) => {
    try {
      const response = await fetch(
        `${
          process.env.API_URL || 'http://localhost:5000/api'
        }/invitations/validate-token/${token}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setPendingInvitation(data.data);
        return { success: true, data: data.data };
      } else {
        return {
          success: false,
          message: data.message || 'Invalid or expired invitation',
        };
      }
    } catch (error) {
      console.error('Error validating invitation:', error);
      return { success: false, message: 'Failed to validate invitation' };
    }
  };

  // Resend verification email
  const resendVerificationEmail = async (email) => {
    try {
      const response = await fetch(
        `${
          process.env.API_URL || 'http://localhost:5000/api'
        }/auth/resend-verification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification email');
      }

      return { success: true, data };
    } catch (error) {
      console.error('Resend verification error:', error);
      return {
        success: false,
        message: error.message || 'Failed to resend verification email',
      };
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      const response = await fetch(
        `${
          process.env.API_URL || 'http://localhost:5000/api'
        }/auth/forgot-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to process forgot password request',
        );
      }

      return { success: true, data };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: error.message || 'Failed to process forgot password request',
      };
    }
  };

  // Reset password
  const resetPassword = async (token, newPassword) => {
    try {
      const response = await fetch(
        `${
          process.env.API_URL || 'http://localhost:5000/api'
        }/auth/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, newPassword }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      return { success: true, data };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: error.message || 'Failed to reset password',
      };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    role,
    pendingInvitation,
    login,
    signup,
    logout,
    signInWithGoogle,
    completeOAuthSetup,
    clearAuthData,
    checkAuthStatus,
    activateAccount,
    validateInvitation,
    resendVerificationEmail,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
