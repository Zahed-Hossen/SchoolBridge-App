import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTenant } from '../context/TenantContext';

// Import auth screens
import LandingScreen from '../screens/Common/LandingScreen';
import LoginScreen from '../screens/Common/LoginScreen';
import SignUpScreen from '../screens/Common/SignUpScreen';
import RoleSelectionScreen from '../screens/Common/RoleSelectionScreen';
import AboutUsScreen from '../screens/Common/AboutUsScreen';
import FeaturesScreen from '../screens/Common/FeaturesScreen';
import ContactScreen from '../screens/Common/ContactScreen';
import SupportScreen from '../screens/Common/SupportScreen';
import PrivacyScreen from '../screens/Common/PrivacyScreen';
import PricingScreen from '../screens/Common/PricingScreen';
import ConnectionTest from '../components/ConnectionTest';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  const { tenantBranding } = useTenant();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: tenantBranding?.primaryColor || '#667eea'
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
      initialRouteName="Landing"
    >
      {/* Main Auth Flow */}
      <Stack.Screen
        name="Landing"
        component={LandingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: `Login - ${tenantBranding?.schoolName || 'SchoolBridge'}`
        }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{
          title: `Sign Up - ${tenantBranding?.schoolName || 'SchoolBridge'}`
        }}
      />
      <Stack.Screen
        name="RoleSelection"
        component={RoleSelectionScreen}
        options={{
          title: 'Choose Your Role',
          headerLeft: () => null,
          gestureEnabled: false,
        }}
      />

      {/* Information Screens */}
      <Stack.Screen name="AboutUs" component={AboutUsScreen} options={{ title: 'About Us' }} />
      <Stack.Screen name="Features" component={FeaturesScreen} options={{ title: 'Features' }} />
      <Stack.Screen name="Pricing" component={PricingScreen} options={{ title: 'Pricing & Plans' }} />
      <Stack.Screen name="Contact" component={ContactScreen} options={{ title: 'Contact Us' }} />
      <Stack.Screen name="Support" component={SupportScreen} options={{ title: 'Support' }} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ title: 'Privacy Policy' }} />

      {/* Debug/Development */}
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen
          name="ConnectionTest"
          component={ConnectionTest}
          options={{ title: 'Connection Test' }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default AuthNavigator;
