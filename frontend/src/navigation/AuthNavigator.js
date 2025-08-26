// import React from 'react';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { useTenant } from '../context/TenantContext';

// // Import auth screens
// import LandingScreen from '../screens/Common/LandingScreen';
// import LoginScreen from '../screens/Common/LoginScreen';
// import SignUpScreen from '../screens/Common/SignUpScreen';
// import ActivationScreen from '../screens/Common/ActivationScreen';
// import { useAuth } from '../context/AuthContext';
// import ScreenHeader from '../components/navigation/ScreenHeader';

// const Stack = createNativeStackNavigator();

// const AuthNavigator = () => {
//   const { tenantBranding } = useTenant();
//   const { isAuthenticated } = useAuth();

//   return (
//     <Stack.Navigator
//       screenOptions={{
//         headerStyle: {
//           backgroundColor: tenantBranding?.primaryColor || '#667eea',
//           elevation: 0,
//           shadowOpacity: 0,
//           borderBottomWidth: 0,
//         },
//         headerTintColor: '#FFFFFF',
//         headerTitleStyle: {
//           fontWeight: '600',
//           fontSize: 18,
//         },
//         headerBackTitleVisible: false,
//         cardStyle: { backgroundColor: '#FFFFFF' },
//       }}
//       initialRouteName="Landing"
//     >
//       {/* Main Auth Flow */}
//       <Stack.Screen
//         name="Landing"
//         component={LandingScreen}
//         options={{ headerShown: false }}
//       />

//       <Stack.Screen
//         name="Activation"
//         component={ActivationScreen}
//         options={{
//           title: 'Complete Registration',
//           headerShown: true,
//           headerBackTitle: 'Back',
//         }}
//       />

//       <Stack.Screen
//         name="Login"
//         component={LoginScreen}
//         options={({ navigation }) => ({
//           headerShown: true,
//           title: 'Sign In',
//           header: (props) => (
//             <ScreenHeader
//               {...props}
//               title="Log In"
//               showBackButton={true}
//               onBackPress={() => navigation.replace('Landing')}
//               primaryColor="#208799fa"
//               gradientColors={['#208799fa', '#005c97']}
//               backButtonStyle={{ backgroundColor: '#208799fa' }}
//               titleStyle={{
//                 textAlign: '',
//                 color: '#fff',
//                 fontSize: 22,
//                 fontWeight: 'bold',
//                 letterSpacing: 1,
//               }}
//             />
//           ),
//         })}
//       />

//       <Stack.Screen
//         name="SignUp"
//         component={SignUpScreen}
//         options={{
//           title: 'Create Account',
//           headerShown: true,
//           header: (props) => (
//             <ScreenHeader
//               {...props}
//               title="Create Account"
//               showBackButton={true}
//             />
//           ),
//         }}
//       />

//       {/* Additional screens can be added here when needed */}
//     </Stack.Navigator>
//   );
// };

// export default AuthNavigator;
