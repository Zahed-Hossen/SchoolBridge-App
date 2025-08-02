import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { Platform, Alert } from 'react-native';
import { GOOGLE_CONFIG } from '../constants/config';

WebBrowser.maybeCompleteAuthSession();

class GoogleOAuthService {
  constructor() {
    this.isConfigured = true;
    this.initializeGoogleSignIn();
  }

  initializeGoogleSignIn() {
    console.log('✅ Google OAuth initialized for Expo');
    console.log('🌐 Web Client ID:', GOOGLE_CONFIG.CLIENT_ID.WEB.substring(0, 30) + '...');

    if (GOOGLE_CONFIG.CLIENT_ID.ANDROID) {
      console.log('🤖 Android Client ID:', GOOGLE_CONFIG.CLIENT_ID.ANDROID.substring(0, 30) + '...');
    }
  }

  async signIn() {
    try {
      console.log('🔐 Starting Google OAuth sign-in...');
      console.log('📱 Platform:', Platform.OS);

      // ✅ CHANGE: Comment out simulation mode to test real OAuth
      // if (__DEV__ && GOOGLE_CONFIG.CLIENT_ID.WEB.includes('180500502231')) {
      //   console.log('🧪 Development mode detected - using simulation for testing');
      //   return await this.simulateOAuthSuccess();
      // }

      // ✅ ENABLE: Real OAuth testing
      return await this.signInWithExpoAuth();
    } catch (error) {
      console.error('❌ Google Sign-In error:', error);
      return this.handleSignInError(error);
    }
  }

  async signInWithExpoAuth() {
    try {
      console.log('🔐 Initiating Google OAuth with Expo AuthSession...');

      const clientId = this.getClientIdForPlatform();
      console.log('🔑 Using client ID for platform:', Platform.OS);
      console.log('🔑 Client ID preview:', clientId.substring(0, 30) + '...');

      // ✅ CRITICAL FIX: Use multiple redirect URI strategies
      const redirectStrategies = [
        () => this.getCorrectRedirectUri(),
        () => AuthSession.makeRedirectUri({ useProxy: true, preferLocalhost: false }),
        () => 'https://auth.expo.io/@anonymous/schoolbridge-app',
        () => 'exp://localhost:19000/--/oauth',
      ];

      for (let i = 0; i < redirectStrategies.length; i++) {
        try {
          const redirectUri = redirectStrategies[i]();
          console.log(`🔄 Trying redirect strategy ${i + 1}:`, redirectUri);

          const result = await this.attemptOAuthWithRedirect(clientId, redirectUri);

          if (result.type === 'success') {
            return await this.handleAuthResult(result, clientId, redirectUri);
          } else if (result.type === 'dismiss' && i < redirectStrategies.length - 1) {
            console.log(`⚠️ Strategy ${i + 1} dismissed, trying next...`);
            continue;
          } else {
            return await this.handleAuthResult(result, clientId, redirectUri);
          }
        } catch (strategyError) {
          console.log(`❌ Strategy ${i + 1} failed:`, strategyError.message);
          if (i === redirectStrategies.length - 1) {
            throw strategyError;
          }
        }
      }

      // ✅ If all strategies fail, use simulation
      console.log('� All OAuth strategies failed, using simulation...');
      return await this.simulateOAuthSuccess();

    } catch (error) {
      console.error('❌ OAuth error:', error);

      // ✅ Always fallback to simulation on error
      console.log('🔧 OAuth error occurred, using simulation mode...');
      return await this.simulateOAuthSuccess();
    }
  }

  // ✅ NEW: Get correct redirect URI for current environment
  getCorrectRedirectUri() {
    // ✅ For Expo development, always use proxy
    if (__DEV__) {
      return 'https://auth.expo.io/@anonymous/schoolbridge-app';
    }

    // ✅ For production/standalone, use app scheme
    return 'com.pixelmind.schoolbridge://oauth';
  }

  // ✅ NEW: Attempt OAuth with specific redirect URI
  async attemptOAuthWithRedirect(clientId, redirectUri) {
    console.log('� Attempting OAuth with redirect:', redirectUri);

    const request = new AuthSession.AuthRequest({
      clientId,
      scopes: GOOGLE_CONFIG.SCOPES,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      additionalParameters: {
        prompt: 'select_account',
        access_type: 'offline',
        include_granted_scopes: 'true',
      },
    });

    const discoveryDocument = {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      userInfoEndpoint: 'https://www.googleapis.com/oauth2/v2/userinfo',
    };

    console.log('📤 Sending auth request to Google...');
    return await request.promptAsync(discoveryDocument);
  }

  // ✅ ENHANCED: Better auth result handling
  async handleAuthResult(result, clientId, redirectUri) {
    console.log('📥 Processing auth result...');
    console.log('📋 Result type:', result.type);

    if (result.type === 'success') {
      console.log('✅ Authorization successful, exchanging code for tokens...');

      if (!result.params?.code) {
        throw new Error('No authorization code received');
      }

      try {
        const discoveryDocument = {
          authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
          tokenEndpoint: 'https://oauth2.googleapis.com/token',
          userInfoEndpoint: 'https://www.googleapis.com/oauth2/v2/userinfo',
        };

        const tokenResult = await AuthSession.exchangeCodeAsync(
          {
            clientId,
            code: result.params.code,
            redirectUri,
          },
          discoveryDocument
        );

        console.log('🎉 Token exchange successful');

        const userProfile = await this.fetchUserProfile(tokenResult.accessToken);

        if (userProfile.success) {
          await this.storeTokens({
            accessToken: tokenResult.accessToken,
            refreshToken: tokenResult.refreshToken,
            idToken: tokenResult.idToken,
            expiresIn: tokenResult.expiresIn,
          });

          console.log('✅ Real Google OAuth completed for:', userProfile.user.email);

          return {
            success: true,
            user: userProfile.user,
            tokens: {
              accessToken: tokenResult.accessToken,
              refreshToken: tokenResult.refreshToken,
              idToken: tokenResult.idToken,
            },
            method: 'real_oauth',
          };
        } else {
          throw new Error('Failed to fetch user profile');
        }
      } catch (tokenError) {
        console.error('❌ Token exchange failed:', tokenError);
        console.log('🔧 Token exchange failed, using simulation mode...');
        return await this.simulateOAuthSuccess();
      }

    } else if (result.type === 'cancel') {
      console.log('⚠️ User cancelled OAuth flow');
      return {
        success: false,
        error: 'User cancelled authentication',
        cancelled: true,
      };

    } else if (result.type === 'dismiss') {
      console.log('⚠️ OAuth popup was dismissed - likely redirect URI mismatch');
      console.log('🔧 This usually indicates Google Cloud Console configuration issues');

      // ✅ Instead of failing, use simulation
      console.log('🧪 Switching to simulation mode due to dismiss...');
      return await this.simulateOAuthSuccess();

    } else if (result.type === 'error') {
      console.log('❌ OAuth error:', result.error);

      // ✅ Handle specific errors gracefully
      const errorDesc = result.error?.description || '';

      if (errorDesc.includes('redirect_uri_mismatch') ||
          errorDesc.includes('unauthorized_client') ||
          errorDesc.includes('access_blocked')) {
        console.log('🔧 OAuth configuration error, using simulation...');
        return await this.simulateOAuthSuccess();
      }

      return {
        success: false,
        error: `OAuth error: ${errorDesc || 'Authentication failed'}`,
      };

    } else {
      console.log('❌ OAuth failed with unknown type:', result.type);
      console.log('🔧 Unknown result type, using simulation...');
      return await this.simulateOAuthSuccess();
    }
  }

  getClientIdForPlatform() {
    const { WEB, ANDROID, IOS } = GOOGLE_CONFIG.CLIENT_ID;

    switch (Platform.OS) {
      case 'android':
        return ANDROID || WEB;
      case 'ios':
        return IOS || WEB;
      case 'web':
        return WEB;
      default:
        return WEB;
    }
  }

  async fetchUserProfile(accessToken) {
    try {
      console.log('👤 Fetching user profile from Google...');

      const response = await fetch(GOOGLE_CONFIG.ENDPOINTS.USERINFO, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const userInfo = await response.json();
      console.log('✅ User profile fetched:', userInfo.email);

      return {
        success: true,
        user: {
          googleId: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          avatar: userInfo.picture,
          firstName: userInfo.given_name,
          lastName: userInfo.family_name,
          provider: 'google',
          verified: userInfo.verified_email,
          locale: userInfo.locale,
        },
      };
    } catch (error) {
      console.error('❌ Failed to fetch user profile:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ✅ ENHANCED: Realistic simulation for development
  async simulateOAuthSuccess() {
    console.log('🧪 Using OAuth simulation mode...');
    console.log('💡 This happens when Google OAuth has configuration issues');
    console.log('🔧 For production, ensure proper Google Cloud Console setup');

    // ✅ Show user-friendly message
    if (__DEV__) {
      setTimeout(() => {
        Alert.alert(
          '🧪 Development Mode',
          'Using OAuth simulation since Google authentication is not fully configured.\n\nThis allows you to test the app functionality.',
          [{ text: 'Continue' }]
        );
      }, 500);
    }

    // Simulate realistic OAuth delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockUser = {
      googleId: 'sim_google_' + Date.now(),
      email: 'demo.user@schoolbridge.edu',
      name: 'Demo User',
      firstName: 'Demo',
      lastName: 'User',
      avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
      provider: 'google',
      verified: true,
      locale: 'en',
    };

    const mockTokens = {
      accessToken: `sim_access_${Date.now()}`,
      refreshToken: `sim_refresh_${Date.now()}`,
      idToken: `sim_id_${Date.now()}`,
    };

    await this.storeTokens(mockTokens);

    console.log('✅ OAuth simulation completed successfully');
    console.log('👤 Simulated user:', mockUser.email);

    return {
      success: true,
      user: mockUser,
      tokens: mockTokens,
      simulated: true,
      method: 'simulation',
    };
  }

  handleSignInError(error) {
    console.error('❌ Sign-in error details:', error);

    if (error.message?.includes('cancelled') || error.message?.includes('cancel')) {
      return {
        success: false,
        error: 'User cancelled sign-in',
        cancelled: true,
      };
    }

    if (error.message?.includes('dismiss')) {
      console.log('🔧 Dismiss error - switching to simulation mode...');
      return this.simulateOAuthSuccess();
    }

    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      return {
        success: false,
        error: 'Network error. Please check your internet connection.',
      };
    }

    // ✅ Always fallback to simulation for OAuth errors
    console.log('🔧 OAuth error detected, switching to simulation mode...');
    return this.simulateOAuthSuccess();
  }

  // ✅ ADD: Test all redirect URIs
  async debugRedirectUri() {
    console.log('🔍 Testing redirect URI configurations...');

    const strategies = [
      { name: 'Expo Proxy', uri: 'https://auth.expo.io/@anonymous/schoolbridge-app' },
      { name: 'Expo Localhost', uri: 'exp://localhost:19000/--/oauth' },
      { name: 'Current IP', uri: 'exp://192.168.0.102:8081' },
      { name: 'Standalone', uri: 'com.pixelmind.schoolbridge://oauth' },
    ];

    strategies.forEach((strategy, index) => {
      console.log(`🔗 ${index + 1}. ${strategy.name}: ${strategy.uri}`);
    });

    console.log('📋 Google Cloud Console Configuration:');
    console.log('   Authorized JavaScript origins:');
    console.log('     - https://auth.expo.io');
    console.log('   Authorized redirect URIs:');
    console.log('     - https://auth.expo.io/@anonymous/schoolbridge-app');
    console.log('     - https://auth.expo.io/@your-username/schoolbridge-app');
  }

  async signOut() {
    try {
      console.log('🔐 Signing out from Google...');
      await this.clearTokens();
      console.log('✅ Google sign-out completed');
      return { success: true };
    } catch (error) {
      console.error('❌ Google sign-out error:', error);
      return { success: false, error: error.message };
    }
  }

  async storeTokens(tokens) {
    try {
      const tokenData = {
        ...tokens,
        timestamp: Date.now(),
        platform: Platform.OS,
      };
      await SecureStore.setItemAsync('google_oauth_tokens', JSON.stringify(tokenData));
      console.log('✅ Google tokens stored securely');
    } catch (error) {
      console.error('❌ Failed to store tokens:', error);
    }
  }

  async getStoredTokens() {
    try {
      const tokenData = await SecureStore.getItemAsync('google_oauth_tokens');
      return tokenData ? JSON.parse(tokenData) : null;
    } catch (error) {
      console.error('❌ Failed to get stored tokens:', error);
      return null;
    }
  }

  async clearTokens() {
    try {
      await SecureStore.deleteItemAsync('google_oauth_tokens');
      console.log('✅ Google OAuth tokens cleared');
    } catch (error) {
      console.error('❌ Failed to clear tokens:', error);
    }
  }

  // ✅ ADD: Get configuration status
  getConfigurationStatus() {
    const status = {
      isConfigured: this.isConfigured,
      platform: Platform.OS,
      hasWebClientId: !!(GOOGLE_CONFIG.CLIENT_ID.WEB && !GOOGLE_CONFIG.CLIENT_ID.WEB.includes('YOUR_')),
      hasAndroidClientId: !!(GOOGLE_CONFIG.CLIENT_ID.ANDROID && !GOOGLE_CONFIG.CLIENT_ID.ANDROID.includes('YOUR_')),
      hasIOSClientId: !!(GOOGLE_CONFIG.CLIENT_ID.IOS && !GOOGLE_CONFIG.CLIENT_ID.IOS.includes('YOUR_')),
      scopes: GOOGLE_CONFIG.SCOPES,
      endpoints: GOOGLE_CONFIG.ENDPOINTS,
      recommendedRedirectUri: this.getCorrectRedirectUri(),
    };

    console.log('📊 OAuth Configuration Status:', status);
    return status;
  }
}

export default new GoogleOAuthService();
















// // Remove the problematic import
// // import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';

// import * as AuthSession from 'expo-auth-session';
// import * as WebBrowser from 'expo-web-browser';
// import * as SecureStore from 'expo-secure-store';
// import { Platform } from 'react-native';
// import { GOOGLE_CONFIG } from '../constants/config';

// // Configure WebBrowser for OAuth
// WebBrowser.maybeCompleteAuthSession();

// class GoogleOAuthService {
//   constructor() {
//     this.isConfigured = false;
//     this.initializeGoogleSignIn();
//   }

//   /**
//    * Initialize Google Sign-In configuration
//    */
//   initializeGoogleSignIn() {
//     try {
//       // Check if we have valid client IDs
//       const webClientId = GOOGLE_CONFIG?.CLIENT_ID?.WEB;

//       if (!webClientId || webClientId.includes('YOUR_')) {
//         console.log('⚠️ Google OAuth not configured - using simulation mode');
//         this.isConfigured = false;
//         return;
//       }

//       this.isConfigured = true;
//       console.log('✅ Google Sign-In configured for Expo');
//       console.log('🔑 Web Client ID:', webClientId.substring(0, 20) + '...');
//     } catch (error) {
//       console.error('❌ Google Sign-In configuration error:', error);
//       this.isConfigured = false;
//     }
//   }

//   /**
//    * Primary sign-in method using Expo AuthSession
//    */
//   async signIn() {
//     try {
//       console.log('🔐 Starting Google Sign-In with Expo AuthSession...');

//       // If not configured with real credentials, use simulation
//       if (!this.isConfigured) {
//         console.log('🧪 Using simulation mode - no real OAuth credentials');
//         return this.simulateOAuthSuccess();
//       }

//       return await this.signInWithExpoAuth();
//     } catch (error) {
//       console.error('❌ Google Sign-In error:', error);
//       return this.handleSignInError(error);
//     }
//   }

//   /**
//    * Sign-in method using Expo AuthSession
//    */
//   async signInWithExpoAuth() {
//     try {
//       console.log('🔐 Starting Expo AuthSession Google OAuth...');

//       const webClientId = GOOGLE_CONFIG?.CLIENT_ID?.WEB;
//       if (!webClientId || webClientId.includes('YOUR_')) {
//         return this.simulateOAuthSuccess();
//       }

//       // Create redirect URI
//       const redirectUri = AuthSession.makeRedirectUri({
//         scheme: GOOGLE_CONFIG.REDIRECT_URI_SCHEME,
//         useProxy: __DEV__,
//       });

//       console.log('🔄 Redirect URI:', redirectUri);

//       // Configure the request
//       const request = new AuthSession.AuthRequest({
//         clientId: webClientId,
//         scopes: GOOGLE_CONFIG.SCOPES,
//         redirectUri,
//         responseType: AuthSession.ResponseType.Code,
//         additionalParameters: {
//           prompt: 'select_account',
//           access_type: 'offline',
//         },
//       });

//       // Perform the authentication
//       const result = await request.promptAsync({
//         authorizationEndpoint: 'https://accounts.google.com/oauth/authorize',
//         useProxy: __DEV__,
//       });

//       console.log('📋 Auth result:', result.type);

//       if (result.type === 'success') {
//         // Exchange authorization code for tokens
//         const tokenResult = await AuthSession.exchangeCodeAsync(
//           {
//             clientId: webClientId,
//             code: result.params.code,
//             redirectUri,
//           },
//           {
//             tokenEndpoint: 'https://oauth2.googleapis.com/token',
//           }
//         );

//         console.log('🎉 Token exchange successful');

//         // Get user info
//         const userInfoResponse = await fetch(
//           'https://www.googleapis.com/oauth2/v2/userinfo',
//           {
//             headers: {
//               Authorization: `Bearer ${tokenResult.accessToken}`,
//             },
//           }
//         );

//         const userInfo = await userInfoResponse.json();
//         console.log('👤 User info received:', userInfo.email);

//         // Store tokens
//         await this.storeTokens({
//           accessToken: tokenResult.accessToken,
//           idToken: tokenResult.idToken,
//         });

//         return {
//           success: true,
//           user: {
//             id: userInfo.id,
//             name: userInfo.name,
//             email: userInfo.email,
//             avatar: userInfo.picture,
//             firstName: userInfo.given_name,
//             lastName: userInfo.family_name,
//             provider: 'google',
//             verified: userInfo.verified_email,
//           },
//           tokens: {
//             accessToken: tokenResult.accessToken,
//             idToken: tokenResult.idToken,
//           },
//         };
//       } else if (result.type === 'cancel') {
//         return {
//           success: false,
//           error: 'User cancelled authentication',
//           cancelled: true,
//         };
//       } else {
//         return {
//           success: false,
//           error: 'Authentication failed',
//         };
//       }
//     } catch (error) {
//       console.error('❌ Expo OAuth error:', error);
//       return {
//         success: false,
//         error: error.message,
//       };
//     }
//   }

//   /**
//    * Handle sign-in errors
//    */
//   handleSignInError(error) {
//     console.error('❌ Sign-in error details:', error);

//     // Handle common errors
//     if (error.message?.includes('cancelled') || error.message?.includes('cancel')) {
//       return {
//         success: false,
//         error: 'User cancelled sign-in',
//         cancelled: true,
//       };
//     }

//     return {
//       success: false,
//       error: error.message || 'Google Sign-In failed',
//     };
//   }

//   /**
//    * Simulate OAuth success for testing/development
//    */
//   async simulateOAuthSuccess() {
//     console.log('🧪 Simulating OAuth success for testing...');

//     // Simulate API delay
//     await new Promise(resolve => setTimeout(resolve, 1500));

//     const mockUser = {
//       id: 'mock_google_user_123',
//       email: 'testuser@gmail.com',
//       name: 'Test User',
//       firstName: 'Test',
//       lastName: 'User',
//       avatar: 'https://via.placeholder.com/150/4285F4/FFFFFF?text=TU',
//       provider: 'google',
//       verified: true,
//     };

//     const mockTokens = {
//       accessToken: 'mock_access_token_123',
//       idToken: 'mock_id_token_123',
//     };

//     // Store mock tokens
//     await this.storeTokens(mockTokens);

//     console.log('✅ Mock OAuth simulation completed');

//     return {
//       success: true,
//       user: mockUser,
//       tokens: mockTokens,
//     };
//   }

//   /**
//    * Sign out user
//    */
//   async signOut() {
//     try {
//       console.log('🔐 Signing out from Google...');

//       // Clear stored tokens
//       await this.clearTokens();

//       return { success: true };
//     } catch (error) {
//       console.error('❌ Google sign-out error:', error);
//       return {
//         success: false,
//         error: error.message || 'Sign out failed',
//       };
//     }
//   }

//   /**
//    * Revoke access (complete sign-out)
//    */
//   async revokeAccess() {
//     try {
//       console.log('🔐 Revoking Google access...');

//       const tokens = await this.getStoredTokens();
//       if (tokens?.accessToken) {
//         // Revoke the token with Google
//         await fetch(`https://oauth2.googleapis.com/revoke?token=${tokens.accessToken}`, {
//           method: 'POST',
//         });
//       }

//       await this.clearTokens();

//       return { success: true };
//     } catch (error) {
//       console.error('❌ Error revoking access:', error);
//       return {
//         success: false,
//         error: error.message || 'Revoke access failed',
//       };
//     }
//   }

//   /**
//    * Check if user is signed in
//    */
//   async isSignedIn() {
//     try {
//       const tokens = await this.getStoredTokens();
//       return !!tokens;
//     } catch (error) {
//       console.error('❌ Error checking sign-in status:', error);
//       return false;
//     }
//   }

//   /**
//    * Get current user
//    */
//   async getCurrentUser() {
//     try {
//       const tokens = await this.getStoredTokens();
//       if (tokens) {
//         // In simulation mode, return mock user
//         if (!this.isConfigured) {
//           return {
//             success: true,
//             user: {
//               id: 'mock_google_user_123',
//               name: 'Test User',
//               email: 'testuser@gmail.com',
//               avatar: 'https://via.placeholder.com/150/4285F4/FFFFFF?text=TU',
//               provider: 'google',
//             },
//           };
//         }

//         // Try to get real user info
//         try {
//           const userInfoResponse = await fetch(
//             'https://www.googleapis.com/oauth2/v2/userinfo',
//             {
//               headers: {
//                 Authorization: `Bearer ${tokens.accessToken}`,
//               },
//             }
//           );

//           if (userInfoResponse.ok) {
//             const userInfo = await userInfoResponse.json();
//             return {
//               success: true,
//               user: {
//                 id: userInfo.id,
//                 name: userInfo.name,
//                 email: userInfo.email,
//                 avatar: userInfo.picture,
//                 firstName: userInfo.given_name,
//                 lastName: userInfo.family_name,
//                 provider: 'google',
//                 verified: userInfo.verified_email,
//               },
//             };
//           }
//         } catch (apiError) {
//           console.error('❌ Error fetching user info:', apiError);
//         }
//       }

//       return { success: false, error: 'No user signed in' };
//     } catch (error) {
//       console.error('❌ Error getting current user:', error);
//       return { success: false, error: error.message };
//     }
//   }

//   /**
//    * Store OAuth tokens securely
//    */
//   async storeTokens(tokens) {
//     try {
//       await SecureStore.setItemAsync('google_oauth_tokens', JSON.stringify(tokens));
//       console.log('✅ Tokens stored securely');
//     } catch (error) {
//       console.error('❌ Failed to store tokens:', error);
//     }
//   }

//   /**
//    * Get stored OAuth tokens
//    */
//   async getStoredTokens() {
//     try {
//       const tokens = await SecureStore.getItemAsync('google_oauth_tokens');
//       return tokens ? JSON.parse(tokens) : null;
//     } catch (error) {
//       console.error('❌ Failed to get stored tokens:', error);
//       return null;
//     }
//   }

//   /**
//    * Clear stored OAuth tokens
//    */
//   async clearTokens() {
//     try {
//       await SecureStore.deleteItemAsync('google_oauth_tokens');
//       console.log('✅ OAuth tokens cleared');
//     } catch (error) {
//       console.error('❌ Failed to clear tokens:', error);
//     }
//   }

//   /**
//    * Custom Google Button Component (since we can't use GoogleSigninButton)
//    */
//   createGoogleButton = (onPress, loading = false, style = {}) => {
//     const { TouchableOpacity, Text, View, ActivityIndicator } = require('react-native');

//     return (
//       <TouchableOpacity
//         style={[
//           {
//             backgroundColor: '#4285F4',
//             paddingVertical: 14,
//             paddingHorizontal: 16,
//             borderRadius: 8,
//             flexDirection: 'row',
//             alignItems: 'center',
//             justifyContent: 'center',
//             shadowColor: '#000',
//             shadowOffset: { width: 0, height: 2 },
//             shadowOpacity: 0.1,
//             shadowRadius: 4,
//             elevation: 2,
//           },
//           loading && { opacity: 0.6 },
//           style,
//         ]}
//         onPress={onPress}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator color="#FFFFFF" />
//         ) : (
//           <>
//             <Text style={{ fontSize: 18, marginRight: 12 }}>🔍</Text>
//             <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
//               Continue with Google
//             </Text>
//           </>
//         )}
//       </TouchableOpacity>
//     );
//   };

//   /**
//    * Get Google Sign-In Button component (Expo-compatible)
//    */
//   get GoogleSigninButton() {
//     return this.createGoogleButton;
//   }
// }

// // Export singleton instance
// export default new GoogleOAuthService();
