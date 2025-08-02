import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AuthStackNavigator, getRoleBasedNavigator } from './src/navigation/AppNavigator';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RoleSelectionScreen from './src/screens/Common/RoleSelectionScreen';
// import ConnectionTest from './src/components/ConnectionTest';

const Stack = createNativeStackNavigator();

// Simple loading screen
const LoadingScreen = () => (
  <View style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA'
  }}>
    <ActivityIndicator size="large" color="#2E86AB" />
  </View>
);

// ✅ NEW: Role Selection Navigator for OAuth users
const RoleSelectionNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#2E86AB' },
      headerTintColor: '#ffffff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
    initialRouteName="RoleSelection"
  >
    <Stack.Screen
      name="RoleSelection"
      component={RoleSelectionScreen}
      options={{
        title: 'Choose Your Role',
        headerLeft: () => null, // Disable back button
        gestureEnabled: false, // Disable swipe back gesture
      }}
    />
  </Stack.Navigator>
);

// ✅ FIXED: Updated main app content with proper role checking
const AppContent = () => {
  const { isAuthenticated, isLoading, role, user } = useAuth();

  console.log('🔍 App state:', {
    isAuthenticated,
    isLoading,
    hasRole: !!role,
    hasUser: !!user,
    userEmail: user?.email || 'none',
    userRole: role || 'none',
  });

  if (isLoading) {
    console.log('⏳ App is loading...');
    return <LoadingScreen />;
  }

  // ✅ FIXED: Check for both authentication AND role
  if (isAuthenticated && role) {
    console.log('✅ User fully authenticated with role:', role);
    const RoleBasedNavigator = getRoleBasedNavigator(role);
    return <RoleBasedNavigator />;
  }

  // ✅ FIXED: Handle case where user exists but no role selected
  if (user && !role && !isAuthenticated) {
    console.log('⚠️ User exists but needs role selection, navigating to RoleSelection');
    // Show role selection navigator directly
    return <RoleSelectionNavigator />;
  }

  // ✅ Default case: Not authenticated at all
  console.log('❌ User not authenticated, showing auth stack');
  return <AuthStackNavigator />;
};

// Main app component
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppContent />
        <StatusBar style="auto" />
      </NavigationContainer>
    </AuthProvider>
  );
}


// import React from 'react';
// import { StatusBar } from 'expo-status-bar';
// import { NavigationContainer } from '@react-navigation/native';
// import { AuthProvider, useAuth } from './src/context/AuthContext';
// import { AuthStackNavigator, getRoleBasedNavigator } from './src/navigation/AppNavigator';
// import { ActivityIndicator, View } from 'react-native';

// // Simple loading screen
// const LoadingScreen = () => (
//   <View style={{
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F8F9FA'
//   }}>
//     <ActivityIndicator size="large" color="#2E86AB" />
//   </View>
// );

// // Main app content
// const AppContent = () => {
//   const { isAuthenticated, isLoading, role } = useAuth();

//   if (isLoading) {
//     return <LoadingScreen />;
//   }

//   if (!isAuthenticated) {
//     return <AuthStackNavigator />;
//   }

//   // Get the appropriate navigator based on user role
//   const RoleBasedNavigator = getRoleBasedNavigator(role);
//   return <RoleBasedNavigator />;
// };

// // Main app component
// export default function App() {
//   return (
//     <AuthProvider>
//       <NavigationContainer>
//         <AppContent />
//         <StatusBar style="auto" />
//       </NavigationContainer>
//     </AuthProvider>
//   );
// }
