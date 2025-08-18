// import React from 'react';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';

// import { useTenant } from '../context/TenantContext';

// // Import auth screens
// import LandingScreen from '../screens/Common/LandingScreen';
// import LoginScreen from '../screens/Common/LoginScreen';
// import SignUpScreen from '../screens/Common/SignUpScreen';
// import { useAuth } from '../context/AuthContext';
// import ScreenHeader from '../components/navigation/ScreenHeader';
// // import RoleSelectionScreen from '../screens/Common/RoleSelectionScreen';
// // import AboutUsScreen from '../screens/Common/AboutUsScreen';
// // import FeaturesScreen from '../screens/Common/FeaturesScreen';
// // import ContactScreen from '../screens/Common/ContactScreen';
// // import SupportScreen from '../screens/Common/SupportScreen';
// // import PrivacyScreen from '../screens/Common/PrivacyScreen';
// // import PricingScreen from '../screens/Common/PricingScreen';
// // import ConnectionTest from '../components/ConnectionTest';

// const Stack = createNativeStackNavigator();

// const AuthNavigator = () => {
//   const { tenantBranding } = useTenant();
//   const { isAuthenticated } = useAuth();

//   return (
//     <Stack.Navigator
//       // screenOptions={{
//       //   headerStyle: {
//       //     backgroundColor: tenantBranding?.primaryColor || '#667eea',
//       //   },
//       //   headerTintColor: '#FFFFFF',
//       //   headerTitleStyle: { fontWeight: 'bold' },
//       // }}
//       initialRouteName="Landing"
//     >
//       {/* Main Auth Flow */}
//       <Stack.Screen
//         name="Landing"
//         component={LandingScreen}
//         options={{ headerShown: false }}
//       />
//       <Stack.Screen
//         name="Login"
//         component={LoginScreen}
//         options={({ navigation }) => ({
//           headerShown: true,
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
//         options={({ navigation }) => ({
//           headerShown: true,
//           header: (props) => (
//             <ScreenHeader
//               {...props}
//               title="Sign Up"
//               showBackButton={true}
//               onBackPress={() => navigation.replace('Landing')}
//               primaryColor="#43cea2"
//               gradientColors={['#43cea2', '#185a9d']}
//               backButtonStyle={{ backgroundColor: '#43cea2' }}
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
//       {/* <Stack.Screen
//         name="RoleSelection"
//         component={RoleSelectionScreen}
//         options={{
//           title: 'Choose Your Role',
//           headerLeft: () => null,
//           gestureEnabled: false,
//         }}
//       />

//       Information Screens
//       <Stack.Screen
//         name="AboutUs"
//         component={(props) => {
//           if (!isAuthenticated) {
//             props.navigation.replace('SignUp');
//             return null;
//           }
//           return <AboutUsScreen {...props} />;
//         }}
//         options={{ title: 'About Us' }}
//       />
//       <Stack.Screen
//         name="Features"
//         component={(props) => {
//           if (!isAuthenticated) {
//             props.navigation.replace('SignUp');
//             return null;
//           }
//           return <FeaturesScreen {...props} />;
//         }}
//         options={{ title: 'Features' }}
//       />
//       <Stack.Screen
//         name="Pricing"
//         component={(props) => {
//           if (!isAuthenticated) {
//             props.navigation.replace('SignUp');
//             return null;
//           }
//           return <PricingScreen {...props} />;
//         }}
//         options={{ title: 'Pricing & Plans' }}
//       />
//       <Stack.Screen
//         name="Contact"
//         component={(props) => {
//           if (!isAuthenticated) {
//             props.navigation.replace('SignUp');
//             return null;
//           }
//           return <ContactScreen {...props} />;
//         }}
//         options={{ title: 'Contact Us' }}
//       />
//       <Stack.Screen
//         name="Support"
//         component={(props) => {
//           if (!isAuthenticated) {
//             props.navigation.replace('SignUp');
//             return null;
//           }
//           return <SupportScreen {...props} />;
//         }}
//         options={{ title: 'Support' }}
//       />
//       <Stack.Screen
//         name="Privacy"
//         component={(props) => {
//           if (!isAuthenticated) {
//             props.navigation.replace('SignUp');
//             return null;
//           }
//           return <PrivacyScreen {...props} />;
//         }}
//         options={{ title: 'Privacy Policy' }}
//       />

//       <Stack.Group screenOptions={{ presentation: 'modal' }}>
//         <Stack.Screen
//           name="ConnectionTest"
//           component={(props) => {
//             if (!isAuthenticated) {
//               props.navigation.replace('SignUp');
//               return null;
//             }
//             return <ConnectionTest {...props} />;
//           }}
//           options={{ title: 'Connection Test' }}
//         />
//       </Stack.Group> */}

//     </Stack.Navigator>
//   );
// };

// export default AuthNavigator;
