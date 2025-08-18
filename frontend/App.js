import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  NavigationContainer,
  NavigationIndependentTree,
} from '@react-navigation/native';
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
    return (
      <ErrorScreen
        error={`Network Error: ${networkError}`}
        onRetry={retryNetwork}
      />
    );
  }

  // Handle tenant errors
  if (tenantError) {
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

    return <LoadingScreen message={loadingMessage} />;
  }

  // App is ready - show main navigation
  console.log('✅ App initialized successfully');
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

  return (
    <SafeAreaProvider>
      <ContextProviders>
        <NavigationIndependentTree>
          <NavigationContainer
            onReady={() => console.log('🧭 Navigation ready')}
            fallback={<LoadingScreen message="Initializing navigation..." />}
          >
            <AppContent />
            <StatusBar style="auto" backgroundColor="transparent" translucent />
          </NavigationContainer>
        </NavigationIndependentTree>
      </ContextProviders>
    </SafeAreaProvider>
  );
}

// Development logging
if (__DEV__) {
  console.log('🔧 Development Mode');
  console.log('📱 App Version: 1.0.0');
  console.log('📅 Build:', new Date().toISOString());
}











// import React, { useEffect, useState } from 'react';
// import { StatusBar } from 'expo-status-bar';
// import { NavigationContainer } from '@react-navigation/native';
// import { ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';

// // Context Providers
// import { AuthProvider, useAuth } from './src/context/AuthContext';
// import { TenantProvider, useTenant } from './src/context/TenantContext';
// import { RoleProvider, useRole } from './src/context/RoleContext';

// // Navigation Components
// import { AuthStackNavigator, getRoleBasedNavigator } from './src/navigation/AppNavigator';

// // Screen Components
// import RoleSelectionScreen from './src/screens/Common/RoleSelectionScreen';

// // ✅ ADD: Network Detection
// import { getDynamicBaseUrl } from './src/constants/config';

// const Stack = createNativeStackNavigator();

// // Loading Screen with Tenant Branding and Network Detection
// const LoadingScreen = ({ message }) => {
//   const { tenantBranding, isLoading: tenantLoading } = useTenant();

//   return (
//     <View style={{
//       flex: 1,
//       justifyContent: 'center',
//       alignItems: 'center',
//       backgroundColor: tenantBranding?.primaryColor || '#667eea'
//     }}>
//       <ActivityIndicator
//         size="large"
//         color="#FFFFFF"
//       />
//       <Text style={{
//         marginTop: 16,
//         fontSize: 16,
//         color: '#FFFFFF',
//         fontWeight: '600',
//         textAlign: 'center',
//         paddingHorizontal: 20
//       }}>
//         {message || (tenantLoading ? 'Initializing...' : `Loading ${tenantBranding?.schoolName || 'SchoolBridge'}...`)}
//       </Text>
//     </View>
//   );
// };

// // ✅ Error Screen Component
// const ErrorScreen = ({ error, onRetry }) => {
//   const { tenantBranding } = useTenant();

//   return (
//     <View style={{
//       flex: 1,
//       justifyContent: 'center',
//       alignItems: 'center',
//       backgroundColor: '#F8FAFB',
//       padding: 20
//     }}>
//       <Text style={{
//         fontSize: 24,
//         marginBottom: 16,
//         textAlign: 'center'
//       }}>
//         ⚠️ Initialization Error
//       </Text>
//       <Text style={{
//         fontSize: 16,
//         color: '#718096',
//         textAlign: 'center',
//         marginBottom: 24,
//         lineHeight: 24
//       }}>
//         {error || 'Something went wrong while starting the app.'}
//       </Text>
//       {onRetry && (
//         <TouchableOpacity
//           style={{
//             backgroundColor: tenantBranding?.primaryColor || '#667eea',
//             paddingHorizontal: 20,
//             paddingVertical: 12,
//             borderRadius: 8
//           }}
//           onPress={onRetry}
//         >
//           <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
//             🔄 Try Again
//           </Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// };

// // Role Selection Navigator with Tenant Branding
// const RoleSelectionNavigator = () => {
//   const { tenantBranding } = useTenant();

//   return (
//     <Stack.Navigator
//       screenOptions={{
//         headerStyle: {
//           backgroundColor: tenantBranding?.primaryColor || '#667eea'
//         },
//         headerTintColor: '#FFFFFF',
//         headerTitleStyle: {
//           fontWeight: 'bold',
//           fontSize: 18
//         },
//       }}
//       initialRouteName="RoleSelection"
//     >
//       <Stack.Screen
//         name="RoleSelection"
//         component={RoleSelectionScreen}
//         options={{
//           title: `Choose Your Role - ${tenantBranding?.schoolName || 'SchoolBridge'}`,
//           headerLeft: () => null,
//           gestureEnabled: false,
//         }}
//       />
//     </Stack.Navigator>
//   );
// };

// // ✅ Network Detection Hook
// const useNetworkInitialization = () => {
//   const [isNetworkReady, setIsNetworkReady] = useState(false);
//   const [networkError, setNetworkError] = useState(null);
//   const [detectedUrl, setDetectedUrl] = useState(null);

//   const initializeNetwork = async () => {
//     try {
//       console.log('🔍 Initializing network detection...');
//       setNetworkError(null);

//       const workingServer = await getDynamicBaseUrl();
//       setDetectedUrl(workingServer);
//       console.log('🌐 Using backend server:', workingServer);

//       setIsNetworkReady(true);
//     } catch (error) {
//       console.error('❌ Network initialization failed:', error);
//       setNetworkError(error.message);
//       setIsNetworkReady(true); // Continue with fallback
//     }
//   };

//   useEffect(() => {
//     initializeNetwork();
//   }, []);

//   return {
//     isNetworkReady,
//     networkError,
//     detectedUrl,
//     retryNetwork: initializeNetwork
//   };
// };

// // Main App Content with Enhanced State Management
// const AppContent = () => {
//   const { isAuthenticated, isLoading: authLoading, role, user } = useAuth();
//   const { isLoading: tenantLoading, error: tenantError, initializeTenant } = useTenant();
//   const { isLoading: roleLoading, currentRole } = useRole();

//   // ✅ ADD: Network initialization
//   const { isNetworkReady, networkError, detectedUrl, retryNetwork } = useNetworkInitialization();

//   // Comprehensive loading state
//   const isLoading = authLoading || tenantLoading || roleLoading || !isNetworkReady;

//   // Enhanced debugging logs
//   console.log('🔍 App State Debug:', {
//     auth: {
//       isAuthenticated,
//       isLoading: authLoading,
//       hasUser: !!user,
//       userEmail: user?.email || 'none',
//       roleFromAuth: role || 'none',
//     },
//     tenant: {
//       isLoading: tenantLoading,
//       hasError: !!tenantError,
//       error: tenantError,
//     },
//     role: {
//       isLoading: roleLoading,
//       currentRole: currentRole || 'none',
//       roleFromContext: currentRole || 'none',
//     },
//     network: {
//       isReady: isNetworkReady,
//       hasError: !!networkError,
//       detectedUrl: detectedUrl,
//     },
//     navigation: {
//       shouldShowAuth: !isAuthenticated,
//       shouldShowRoleSelection: user && !role && !isAuthenticated,
//       shouldShowRoleBasedNav: isAuthenticated && (role || currentRole),
//     }
//   });

//   // ✅ Network errors
//   if (networkError && !isNetworkReady) {
//     console.error('❌ Network error:', networkError);
//     return (
//       <ErrorScreen
//         error={`Network initialization failed: ${networkError}`}
//         onRetry={retryNetwork}
//       />
//     );
//   }

//   // Tenant errors
//   if (tenantError) {
//     console.error('❌ Tenant error:', tenantError);
//     return (
//       <ErrorScreen
//         error={`Tenant initialization failed: ${tenantError}`}
//         onRetry={initializeTenant}
//       />
//     );
//   }

//   // Loading state with dynamic messages
//   if (isLoading) {
//     const loadingMessage = !isNetworkReady
//       ? '🔍 Detecting backend server...'
//       : tenantLoading
//         ? '🏫 Initializing tenant...'
//         : authLoading
//           ? '🔐 Checking authentication...'
//           : roleLoading
//             ? '👤 Loading user role...'
//             : 'Loading...';

//     console.log('⏳ App is loading...', {
//       authLoading,
//       tenantLoading,
//       roleLoading,
//       networkReady: isNetworkReady
//     });

//     return <LoadingScreen message={loadingMessage} />;
//   }

//   // ✅ Fully authenticated user with role
//   const effectiveRole = role || currentRole;
//   if (isAuthenticated && effectiveRole) {
//     console.log('✅ User fully authenticated with role:', effectiveRole);
//     console.log('🌐 Connected to server:', detectedUrl);
//     const RoleBasedNavigator = getRoleBasedNavigator(effectiveRole);
//     return <RoleBasedNavigator />;
//   }

//   // ✅ User exists but needs role selection
//   if (user && !effectiveRole && !isAuthenticated) {
//     console.log('⚠️ User exists but needs role selection');
//     return <RoleSelectionNavigator />;
//   }

//   // ✅ Not authenticated - show auth stack
//   console.log('❌ User not authenticated, showing auth stack');
//   console.log('🌐 Connected to server:', detectedUrl);
//   return <AuthStackNavigator />;
// };

// // ✅ Context Provider Wrapper with Error Boundaries
// const ContextProviders = ({ children }) => {
//   return (
//     <AuthProvider>
//       <TenantProvider>
//         <RoleProvider>
//           {children}
//         </RoleProvider>
//       </TenantProvider>
//     </AuthProvider>
//   );
// };

// // ✅ Main App Component - Clean and Organized with Network Detection
// export default function App() {
//   console.log('🚀 SchoolBridge App Starting...');
//   console.log('📅 Build Date:', new Date().toISOString());
//   console.log('🏗️ Environment:', __DEV__ ? 'Development' : 'Production');

//   return (
//     <ContextProviders>
//       <NavigationContainer
//         onReady={() => console.log('🧭 Navigation ready')}
//         onStateChange={(state) => console.log('🧭 Navigation state changed:', state?.routeNames || 'unknown')}
//       >
//         <AppContent />
//         <StatusBar
//           style="auto"
//           backgroundColor="transparent"
//           translucent={true}
//         />
//       </NavigationContainer>
//     </ContextProviders>
//   );
// }

// // ✅ Development Helper - Remove in production
// if (__DEV__) {
//   console.log('🔧 Development Mode Active');
//   console.log('📱 App Component Loaded Successfully');
//   console.log('🎯 Phase 1 Complete: TenantService & RoleService Integrated');
//   console.log('🚀 Ready for Phase 2: Role-Based Navigation Implementation');
//   console.log('🌐 Network Detection: Enabled');
// }
