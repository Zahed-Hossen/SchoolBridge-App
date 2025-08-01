import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GoogleOAuthService from '../services/GoogleOAuthService';
import { apiService } from '../api/apiService';

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
          // For Google OAuth, we want to ensure proper role selection flow
          // Check if user has a proper role setup
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
    try {
      console.log('🔐 Attempting email login with:', { email, role });
      setIsLoading(true);

      const response = await apiService.auth.login({
        email,
        password,
        role,
      });

      console.log('📨 Login response:', response);

      // ✅ FIXED: Handle response format properly
      const userData = response.user;
      const accessToken = response.accessToken;
      const refreshToken = response.refreshToken;

      if (accessToken && userData) {
        // Store tokens and user data
        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken || '');
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        await AsyncStorage.setItem('userRole', userData.role || role);
        await AsyncStorage.setItem('loginMethod', 'email');

        setUser(userData);
        setRole(userData.role || role);
        setIsAuthenticated(true);

        console.log('✅ Email login successful for:', userData.email);
        return { success: true, user: userData };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('❌ Email login error:', error);

      // ✅ ENHANCED: Better error message handling
      let errorMessage = 'Login failed';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message?.includes('Network Error')) {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setIsLoading(true);
      console.log('📝 Starting signup process...');

      // ✅ Use the updated API service
      const response = await apiService.auth.register(userData);

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

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      setIsLoading(true);

      // Check login method to clear appropriate tokens
      const loginMethod = await AsyncStorage.getItem('loginMethod');

      if (loginMethod === 'google') {
        await GoogleOAuthService.signOut();
      }

      // Clear stored data
      await AsyncStorage.multiRemove([
        'accessToken',
        'refreshToken',
        'userData',
        'userRole',
        'loginMethod',
      ]);

      setUser(null);
      setRole(null);
      setIsAuthenticated(false);

      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
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
















// import React, { createContext, useContext, useState, useEffect } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { apiService } from '../api/apiService';

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [user, setUser] = useState(null);
//   const [role, setRole] = useState(null);

//   // Check authentication status on app start
//   useEffect(() => {
//     checkAuthStatus();
//   }, []);

//   const checkAuthStatus = async () => {
//     try {
//       console.log('Checking auth status...');
//       const accessToken = await AsyncStorage.getItem('accessToken');
//       const refreshToken = await AsyncStorage.getItem('refreshToken');
//       const userData = await AsyncStorage.getItem('userData');
//       const userRole = await AsyncStorage.getItem('userRole');

//       console.log('Stored tokens:', { accessToken: !!accessToken, refreshToken: !!refreshToken });

//       if (accessToken && refreshToken && userData && userRole) {
//         setUser(JSON.parse(userData));
//         setRole(userRole);
//         setIsAuthenticated(true);
//         console.log('User authenticated from storage');
//       } else {
//         console.log('No valid authentication found');
//         setIsAuthenticated(false);
//       }
//     } catch (error) {
//       console.error('Error checking auth status:', error);
//       setIsAuthenticated(false);
//     } finally {
//       setIsLoading(false);
//       console.log('Auth check completed');
//     }
//   };

//   const login = async (email, password, role) => {
//     try {
//       console.log('Attempting login with:', { email, role });
//       setIsLoading(true);

//       const response = await apiService.auth.login({
//         email,
//         password,
//         role,
//       });

//       console.log('Login response:', response.data);

//       const { accessToken, refreshToken, user: userData } = response.data;

//       if (accessToken && refreshToken && userData) {
//         // Store tokens and user data
//         await AsyncStorage.setItem('accessToken', accessToken);
//         await AsyncStorage.setItem('refreshToken', refreshToken);
//         await AsyncStorage.setItem('userData', JSON.stringify(userData));
//         await AsyncStorage.setItem('userRole', userData.role || role);

//         setUser(userData);
//         setRole(userData.role || role);
//         setIsAuthenticated(true);

//         console.log('Login successful');
//         return { success: true, user: userData };
//       } else {
//         throw new Error('Invalid response from server');
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       const errorMessage = error.response?.data?.message || error.message || 'Login failed';
//       throw new Error(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const signup = async (userData) => {
//     try {
//       console.log('Attempting signup with:', userData);
//       setIsLoading(true);

//       const response = await apiService.auth.register(userData);
//       console.log('Signup response:', response.data);

//       return { success: true, message: 'Account created successfully' };
//     } catch (error) {
//       console.error('Signup error:', error);
//       const errorMessage = error.response?.data?.message || error.message || 'Signup failed';
//       throw new Error(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const logout = async () => {
//     try {
//       console.log('Logging out...');
//       setIsLoading(true);

//       // Clear stored data
//       await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userData', 'userRole']);

//       setUser(null);
//       setRole(null);
//       setIsAuthenticated(false);

//       console.log('Logout successful');
//     } catch (error) {
//       console.error('Logout error:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const value = {
//     isAuthenticated,
//     isLoading,
//     user,
//     role,
//     login,
//     signup,
//     logout,
//     checkAuthStatus,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
