import * as AuthSession from 'expo-auth-session';

export const GOOGLE_OAUTH_CONFIG = {
  // For development - you'll replace this with your actual client ID
  clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',

  // OAuth endpoints
  endpoints: {
    authorizationEndpoint: 'https://accounts.google.com/oauth/authorize',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    userInfoEndpoint: 'https://www.googleapis.com/oauth2/v2/userinfo',
  },

  // Scopes we need
  scopes: ['openid', 'profile', 'email'],

  // Additional parameters
  additionalParameters: {
    prompt: 'select_account',
  },
};

// Create redirect URI for Expo
export const getRedirectUri = () => {
  return AuthSession.makeRedirectUri({
    useProxy: true, // Use Expo's proxy for development
  });
};
