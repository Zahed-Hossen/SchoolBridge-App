import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { GOOGLE_CONFIG } from '../constants/config';

WebBrowser.maybeCompleteAuthSession();

class GoogleOAuthService {
  constructor() {
    this.isConfigured = false;
    this.initializeGoogleSignIn();
  }

  /**
   * ✅ ENHANCED: Initialize with real credential validation
   */
  initializeGoogleSignIn() {
    try {
      const { WEB, ANDROID, IOS } = GOOGLE_CONFIG?.CLIENT_ID || {};

      // ✅ UPDATED: Check for real credentials
      const hasRealCredentials = WEB && !WEB.includes('YOUR_') &&
                                ANDROID && !ANDROID.includes('YOUR_') &&
                                IOS && !IOS.includes('YOUR_');

      if (!hasRealCredentials) {
        console.log('⚠️ Google OAuth not configured - add real client IDs to config.js');
        console.log('📋 Required credentials:');
        console.log('  - WEB: YOUR_WEB_CLIENT_ID.apps.googleusercontent.com');
        console.log('  - ANDROID: YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com');
        console.log('  - IOS: YOUR_IOS_CLIENT_ID.apps.googleusercontent.com');
        this.isConfigured = false;
        return;
      }

      this.isConfigured = true;
      console.log('✅ Google OAuth configured with real credentials');
      console.log('🌐 Web Client ID:', WEB.substring(0, 20) + '...');
      console.log('🤖 Android Client ID:', ANDROID.substring(0, 20) + '...');
      console.log('🍎 iOS Client ID:', IOS.substring(0, 20) + '...');
    } catch (error) {
      console.error('❌ Google OAuth configuration error:', error);
      this.isConfigured = false;
    }
  }

  /**
   * ✅ ENHANCED: Production-ready sign-in with platform detection
   */
  async signIn() {
    try {
      console.log('🔐 Starting Google OAuth sign-in...');
      console.log('📱 Platform:', Platform.OS);

      if (!this.isConfigured) {
        console.log('🧪 No real credentials - using simulation mode');
        return this.simulateOAuthSuccess();
      }

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
      if (!clientId) {
        throw new Error('No client ID configured for current platform');
      }

      console.log('🔑 Using client ID:', clientId.substring(0, 20) + '...');

      // ✅ FORCE: Use Expo proxy for better compatibility
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: GOOGLE_CONFIG.REDIRECT_URI_SCHEME,
        useProxy: true, // Always use proxy to avoid local URI issues
      });

      console.log('🔄 Redirect URI:', redirectUri);

      // ✅ ENHANCED: Force consent screen
      const request = new AuthSession.AuthRequest({
        clientId,
        scopes: GOOGLE_CONFIG.SCOPES,
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        additionalParameters: {
          // Force consent screen to show app details
          prompt: 'consent',
          access_type: 'offline',
          include_granted_scopes: 'true',
        },
      });

      console.log('📤 Sending auth request to Google...');

      // ✅ FORCE: Always use Expo proxy
      const result = await request.promptAsync({
        authorizationEndpoint: GOOGLE_CONFIG.ENDPOINTS.AUTHORIZATION,
        useProxy: true, // Force proxy usage
        showInRecents: false,
      });

      console.log('📥 Auth result type:', result.type);

      if (result.type === 'success') {
        console.log('✅ Authorization successful, exchanging code for tokens...');

        const tokenResult = await AuthSession.exchangeCodeAsync(
          {
            clientId,
            code: result.params.code,
            redirectUri,
          },
          {
            tokenEndpoint: GOOGLE_CONFIG.ENDPOINTS.TOKEN,
          }
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
          };
        } else {
          throw new Error('Failed to fetch user profile');
        }
      } else if (result.type === 'cancel') {
        console.log('⚠️ User cancelled OAuth flow');
        return {
          success: false,
          error: 'User cancelled authentication',
          cancelled: true,
        };
      } else if (result.type === 'error') {
        console.log('❌ OAuth error:', result.error);
        return {
          success: false,
          error: `OAuth error: ${result.error?.description || 'Access blocked by Google'}`,
        };
      } else {
        console.log('❌ OAuth failed with type:', result.type);
        return {
          success: false,
          error: `Authentication failed: ${result.type}`,
        };
      }
    } catch (error) {
      console.error('❌ OAuth error:', error);
      return {
        success: false,
        error: error.message || 'OAuth authentication failed',
      };
    }
  }

  /**
   * ✅ NEW: Get platform-specific client ID
   */
  getClientIdForPlatform() {
    const { WEB, ANDROID, IOS } = GOOGLE_CONFIG.CLIENT_ID;

    switch (Platform.OS) {
      case 'android':
        return ANDROID;
      case 'ios':
        return IOS;
      case 'web':
        return WEB;
      default:
        // Fallback to web client ID for unknown platforms
        return WEB;
    }
  }

  /**
   * ✅ NEW: Fetch user profile from Google API
   */
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
          id: userInfo.id,
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

  /**
   * ✅ ENHANCED: Better error handling
   */
  handleSignInError(error) {
    console.error('❌ Sign-in error details:', error);

    // Handle specific error types
    if (error.message?.includes('cancelled') || error.message?.includes('cancel')) {
      return {
        success: false,
        error: 'User cancelled sign-in',
        cancelled: true,
      };
    }

    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      return {
        success: false,
        error: 'Network error. Please check your internet connection.',
      };
    }

    if (error.message?.includes('client_id') || error.message?.includes('credentials')) {
      return {
        success: false,
        error: 'OAuth configuration error. Please contact support.',
      };
    }

    return {
      success: false,
      error: error.message || 'Google Sign-In failed',
    };
  }

  /**
   * ✅ ENHANCED: Improved simulation with more realistic data
   */
  async simulateOAuthSuccess() {
    console.log('🧪 Simulating Google OAuth for development...');

    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockUser = {
      id: 'mock_google_' + Date.now(),
      email: 'developer@gmail.com',
      name: 'Development User',
      firstName: 'Development',
      lastName: 'User',
      avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
      provider: 'google',
      verified: true,
      locale: 'en',
    };

    const mockTokens = {
      accessToken: `mock_access_${Date.now()}`,
      refreshToken: `mock_refresh_${Date.now()}`,
      idToken: `mock_id_${Date.now()}`,
    };

    await this.storeTokens(mockTokens);

    console.log('✅ Mock OAuth simulation completed');
    return {
      success: true,
      user: mockUser,
      tokens: mockTokens,
    };
  }

  /**
   * ✅ ENHANCED: Sign out with token revocation
   */
  async signOut() {
    try {
      console.log('🔐 Signing out from Google...');

      if (this.isConfigured) {
        // Revoke tokens with Google
        const tokens = await this.getStoredTokens();
        if (tokens?.accessToken) {
          try {
            await fetch(`${GOOGLE_CONFIG.ENDPOINTS.REVOKE}?token=${tokens.accessToken}`, {
              method: 'POST',
            });
            console.log('✅ Google tokens revoked');
          } catch (revokeError) {
            console.warn('⚠️ Failed to revoke Google tokens:', revokeError.message);
          }
        }
      }

      // Clear local tokens
      await this.clearTokens();
      console.log('✅ Local tokens cleared');

      return { success: true };
    } catch (error) {
      console.error('❌ Google sign-out error:', error);
      return {
        success: false,
        error: error.message || 'Sign out failed',
      };
    }
  }

  /**
   * ✅ ENHANCED: Get current user with token validation
   */
  async getCurrentUser() {
    try {
      const tokens = await this.getStoredTokens();
      if (!tokens) {
        return { success: false, error: 'No tokens stored' };
      }

      if (!this.isConfigured) {
        // Return mock user in simulation mode
        return {
          success: true,
          user: {
            id: 'mock_google_123',
            name: 'Development User',
            email: 'developer@gmail.com',
            avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
            provider: 'google',
          },
        };
      }

      // Fetch real user profile
      const userProfile = await this.fetchUserProfile(tokens.accessToken);
      return userProfile;
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ✅ ENHANCED: Secure token storage with metadata
   */
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

  /**
   * ✅ ENHANCED: Get stored tokens with validation
   */
  async getStoredTokens() {
    try {
      const tokenData = await SecureStore.getItemAsync('google_oauth_tokens');
      if (!tokenData) return null;

      const tokens = JSON.parse(tokenData);

      // ✅ Check if tokens are expired (basic check)
      if (tokens.expiresIn && tokens.timestamp) {
        const expirationTime = tokens.timestamp + (tokens.expiresIn * 1000);
        if (Date.now() > expirationTime) {
          console.log('⚠️ Google tokens expired');
          await this.clearTokens();
          return null;
        }
      }

      return tokens;
    } catch (error) {
      console.error('❌ Failed to get stored tokens:', error);
      return null;
    }
  }

  /**
   * ✅ ENHANCED: Clear tokens with confirmation
   */
  async clearTokens() {
    try {
      await SecureStore.deleteItemAsync('google_oauth_tokens');
      console.log('✅ Google OAuth tokens cleared');
    } catch (error) {
      console.error('❌ Failed to clear tokens:', error);
    }
  }

  /**
   * ✅ ENHANCED: Check configuration status
   */
  isProperlyConfigured() {
    return this.isConfigured;
  }

  /**
   * ✅ ENHANCED: Get configuration details
   */
  getConfigurationStatus() {
    const { WEB, ANDROID, IOS } = GOOGLE_CONFIG?.CLIENT_ID || {};

    return {
      isConfigured: this.isConfigured,
      hasWebClientId: WEB && !WEB.includes('YOUR_'),
      hasAndroidClientId: ANDROID && !ANDROID.includes('YOUR_'),
      hasIOSClientId: IOS && !IOS.includes('YOUR_'),
      platform: Platform.OS,
      redirectScheme: GOOGLE_CONFIG.REDIRECT_URI_SCHEME,
    };
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
