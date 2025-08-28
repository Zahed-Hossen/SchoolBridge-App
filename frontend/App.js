import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  NavigationContainer,
  NavigationIndependentTree,
} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';

// Context Providers
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { TenantProvider, useTenant } from './src/context/TenantContext';
import { RoleProvider, useRole } from './src/context/RoleContext';

// Main Navigation
import Navigation from './src/navigation';

// Network Detection
import { getDynamicBaseUrl } from './src/constants/config';

// ✅ Loading Screen Component
const LoadingScreen = ({ message }) => {
  const { tenantBranding } = useTenant();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: tenantBranding?.primaryColor || '#3498DB',
      }}
    >
      <ActivityIndicator size="large" color="#FFFFFF" />
      <Text
        style={{
          marginTop: 16,
          fontSize: 16,
          color: '#FFFFFF',
          fontWeight: '600',
          textAlign: 'center',
          paddingHorizontal: 20,
        }}
      >
        {message ||
          `Loading ${tenantBranding?.schoolName || 'SchoolBridge'}...`}
      </Text>
    </View>
  );
};

// ✅ Error Screen Component
const ErrorScreen = ({ error, onRetry }) => {
  const { tenantBranding } = useTenant();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFB',
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 24, marginBottom: 16, textAlign: 'center' }}>
        ⚠️ Connection Error
      </Text>
      <Text
        style={{
          fontSize: 16,
          color: '#718096',
          textAlign: 'center',
          marginBottom: 24,
          lineHeight: 24,
        }}
      >
        {error || 'Unable to connect to the server.'}
      </Text>
      {onRetry && (
        <TouchableOpacity
          style={{
            backgroundColor: tenantBranding?.primaryColor || '#3498DB',
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 8,
          }}
          onPress={onRetry}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
            🔄 Try Again
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ✅ Network Initialization Hook
const useNetworkInitialization = () => {
  const [isNetworkReady, setIsNetworkReady] = useState(false);
  const [networkError, setNetworkError] = useState(null);
  const [detectedUrl, setDetectedUrl] = useState(null);

  const initializeNetwork = async () => {
    try {
      console.log('🔍 Detecting backend server...');
      setNetworkError(null);

      const workingServer = await getDynamicBaseUrl();
      setDetectedUrl(workingServer);
      console.log('✅ Backend server detected:', workingServer);

      setIsNetworkReady(true);
    } catch (error) {
      console.error('❌ Network detection failed:', error);
      setNetworkError(error.message);
      setIsNetworkReady(true);
    }
  };

  useEffect(() => {
    initializeNetwork();
  }, []);

  return {
    isNetworkReady,
    networkError,
    detectedUrl,
    retryNetwork: initializeNetwork,
  };
};

// ✅ Main App Content
const AppContent = () => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const {
    isLoading: tenantLoading,
    error: tenantError,
    initializeTenant,
  } = useTenant();
  const { isLoading: roleLoading, currentRole } = useRole();
  const { isNetworkReady, networkError, detectedUrl, retryNetwork } =
    useNetworkInitialization();

  // Calculate loading state
  const isLoading =
    authLoading || tenantLoading || roleLoading || !isNetworkReady;

  // Debug logging
  console.log('🔍 App State:', {
    isAuthenticated,
    currentRole,
    isLoading,
    hasUser: !!user,
    networkReady: isNetworkReady,
    detectedUrl,
  });

  // Handle network errors
  if (networkError && !detectedUrl) {
    console.log('🛑 Rendering ErrorScreen: Network Error', networkError);
    return (
      <ErrorScreen
        error={`Network Error: ${networkError}`}
        onRetry={retryNetwork}
      />
    );
  }

  // Handle tenant errors
  if (tenantError) {
    console.log('🛑 Rendering ErrorScreen: Tenant Error', tenantError);
    return (
      <ErrorScreen
        error={`Initialization Error: ${tenantError}`}
        onRetry={initializeTenant}
      />
    );
  }

  // Show loading screen
  if (isLoading) {
    const loadingMessage = !isNetworkReady
      ? '🔍 Detecting server...'
      : tenantLoading
      ? '🏫 Loading school data...'
      : authLoading
      ? '🔐 Checking authentication...'
      : '👤 Loading user profile...';
    console.log('⏳ Rendering LoadingScreen:', loadingMessage);
    return <LoadingScreen message={loadingMessage} />;
  }

  // App is ready - show main navigation
  console.log('✅ Rendering Navigation (App ready)');
  console.log('🌐 Server:', detectedUrl);
  console.log('👤 Role:', currentRole || 'guest');

  return <Navigation />;
};

// ✅ Context Provider Wrapper
const ContextProviders = ({ children }) => {
  return (
    <TenantProvider>
      <AuthProvider>
        <RoleProvider>{children}</RoleProvider>
      </AuthProvider>
    </TenantProvider>
  );
};

// ✅ Main App Component - Clean and Simple
export default function App() {
  console.log('🚀 SchoolBridge App Starting...');

  // Navigation state persistence
  const PERSISTENCE_KEY = 'NAVIGATION_STATE_V1';
  const [isNavReady, setIsNavReady] = useState(false);
  const [initialState, setInitialState] = useState();
  const isMounted = useRef(false);

  useEffect(() => {
    const restoreState = async () => {
      try {
        const savedStateString = await AsyncStorage.getItem(PERSISTENCE_KEY);
        const state = savedStateString
          ? JSON.parse(savedStateString)
          : undefined;
        if (state) {
          setInitialState(state);
        }
      } catch (e) {
        console.error('Failed to load navigation state', e);
      } finally {
        setIsNavReady(true);
      }
    };
    if (!isMounted.current) {
      restoreState();
      isMounted.current = true;
    }
  }, []);

  const handleStateChange = async (state) => {
    try {
      if (state === undefined || state === null) {
        await AsyncStorage.removeItem(PERSISTENCE_KEY);
      } else {
        await AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
      }
    } catch (e) {
      console.error('Failed to persist navigation state', e);
    }
  };

  return (
    <SafeAreaProvider>
      <ContextProviders>
        {!isNavReady ? (
          <LoadingScreen message="Restoring navigation..." />
        ) : (
          <NavigationIndependentTree>
            <NavigationContainer
              initialState={initialState}
              onStateChange={handleStateChange}
              onReady={() => console.log('🧭 Navigation ready')}
              fallback={<LoadingScreen message="Initializing navigation..." />}
            >
              <AppContent />
              <StatusBar
                style="auto"
                backgroundColor="transparent"
                translucent
              />
            </NavigationContainer>
          </NavigationIndependentTree>
        )}
      </ContextProviders>
    </SafeAreaProvider>
  );
}
