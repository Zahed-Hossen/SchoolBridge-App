// Redirect component for unauthenticated access to marketing/public screens
import React, { useEffect } from 'react';
import { View } from 'react-native';

function RedirectToSignUp({ navigation }) {
  useEffect(() => {
    navigation.replace('SignUp');
  }, [navigation]);
  return <View />;
}

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createStackNavigator } from '@react-navigation/stack';

import { useAuth } from '../context/AuthContext';
import { useRole } from '../context/RoleContext';

// Import your navigators
import LandingScreen from '../screens/Common/LandingScreen';
import LoginScreen from '../screens/Common/LoginScreen';
import SignUpScreen from '../screens/Common/SignUpScreen';
import ScreenHeader from '../components/navigation/ScreenHeader';
import { getInfoScreenOptions } from './infoScreenOptions';
import StudentTabNavigator from './student/StudentNavigator';
import TeacherTabNavigator from './teacher/TeacherNavigator';
import ParentTabNavigator from './parent/ParentNavigator';
import AdminTabNavigator from './admin/AdminTabNavigator';
import SuperAdminTabNavigator from './superadmin/SuperAdminTabNavigator';
import RoleSelectionScreen from '../screens/Common/RoleSelectionScreen';
import AboutUsScreen from '../screens/Common/AboutUsScreen';
import FeaturesScreen from '../screens/Common/FeaturesScreen';
import ContactScreen from '../screens/Common/ContactScreen';
import SupportScreen from '../screens/Common/SupportScreen';
import PrivacyScreen from '../screens/Common/PrivacyScreen';
import PricingScreen from '../screens/Common/PricingScreen';
import ConnectionTest from '../components/ConnectionTest';

const Stack = createNativeStackNavigator();
const RootStack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { currentRole, isLoading: roleLoading, setRole } = useRole();

  console.log('🎭 AppNavigator - Auth Status:', {
    isAuthenticated,
    currentRole,
    hasUser: !!user,
    authLoading,
    roleLoading,
    userRole: user?.role,
  });

  useEffect(() => {
    if (isAuthenticated && user?.role && !currentRole && setRole) {
      console.log('🔄 Auto-setting role from user object:', user.role);
      setRole(user.role);
    }
  }, [isAuthenticated, user?.role, currentRole, setRole]);

  if (authLoading || roleLoading) {
    return null;
  }

  if (!isAuthenticated ) {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="Landing"
          component={LandingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={({ navigation }) => ({
            headerShown: true,
            header: (props) => (
              <ScreenHeader
                {...props}
                title="Log In"
                showBackButton={true}
                onBackPress={() => navigation.replace('Landing')}
                primaryColor="#43cea2"
                gradientColors={['#43cea2', '#185a9d']}
                backButtonStyle={{ backgroundColor: '#43cea2' }}
                titleStyle={{
                  textAlign: '',
                  color: '#fff',
                  fontSize: 22,
                  fontWeight: 'bold',
                  letterSpacing: 1,
                }}
              />
            ),
          })}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={({ navigation }) => ({
            headerShown: true,
            header: (props) => (
              <ScreenHeader
                {...props}
                title="Sign Up"
                showBackButton={true}
                onBackPress={() => navigation.replace('Landing')}
                primaryColor="#43cea2"
                gradientColors={['#43cea2', '#185a9d']}
                backButtonStyle={{ backgroundColor: '#43cea2' }}
                titleStyle={{
                  textAlign: '',
                  color: '#fff',
                  fontSize: 22,
                  fontWeight: 'bold',
                  letterSpacing: 1,
                }}
              />
            ),
          })}
        />
        <Stack.Screen name="AboutUs" component={RedirectToSignUp} />
        <Stack.Screen name="Features" component={RedirectToSignUp} />
        <Stack.Screen name="Pricing" component={RedirectToSignUp} />
        <Stack.Screen name="Contact" component={RedirectToSignUp} />
        <Stack.Screen name="Support" component={RedirectToSignUp} />
        <Stack.Screen name="Privacy" component={RedirectToSignUp} />
        <Stack.Screen name="ConnectionTest" component={RedirectToSignUp} />
      </Stack.Navigator>
    );
  }

  // Authenticated user with role - show role-based navigation
  if (isAuthenticated && (currentRole || user?.role)) {
    const userRole = currentRole || user?.role;
    const normalizedRole = userRole?.toLowerCase().trim();
    let MainNavigator = null;
    switch (normalizedRole) {
      case 'student':
        MainNavigator = StudentTabNavigator;
        break;
      case 'teacher':
        MainNavigator = TeacherTabNavigator;
        break;
      case 'parent':
        MainNavigator = ParentTabNavigator;
        break;
      case 'admin':
      case 'administrator':
      case 'schooladmin':
      case 'school_admin':
        MainNavigator = AdminTabNavigator;
        break;
      case 'superadmin':
      case 'super_admin':
        MainNavigator = SuperAdminTabNavigator;
        break;
      case 'visitor':
        MainNavigator = null;
        break;
      default:
        MainNavigator = null;
    }

    if (normalizedRole === 'visitor') {
      return (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {/* Landing screen - hidden header */}
          <RootStack.Screen
            name="Landing"
            component={LandingScreen}
            options={{ headerShown: false }}
          />

          {/* Login Screen - added header */}
          <RootStack.Screen
            name="Login"
            component={LoginScreen}
            options={({ navigation }) => ({
              headerShown: true,
              header: (props) => (
                <ScreenHeader
                  {...props}
                  title="Log In"
                  showBackButton={true}
                  onBackPress={() => navigation.replace('Landing')}
                  primaryColor="#2E86AB"
                  backButtonStyle={{ backgroundColor: '#2E86AB' }}
                  titleStyle={{
                    textAlign: '',
                    color: '#fff',
                    fontSize: 22,
                    fontWeight: 'bold',
                    letterSpacing: 1,
                  }}
                />
              ),
            })}
          />

          {/* SignUp Screen - added header */}
          <RootStack.Screen
            name="SignUp"
            component={SignUpScreen}
            options={({ navigation }) => ({
              headerShown: true,
              header: (props) => (
                <ScreenHeader
                  {...props}
                  title="Sign Up"
                  showBackButton={true}
                  onBackPress={() => navigation.replace('Landing')}
                  primaryColor="#2E86AB"
                  backButtonStyle={{ backgroundColor: '#2E86AB' }}
                  titleStyle={{
                    textAlign: '',
                    color: '#fff',
                    fontSize: 22,
                    fontWeight: 'bold',
                    letterSpacing: 1,
                  }}
                />
              ),
            })}
          />
          <RootStack.Screen
            name="AboutUs"
            component={AboutUsScreen}
            options={({ navigation }) =>
              getInfoScreenOptions({
                title: 'About Us',
                navigation,
                gradientColors: ['#6d41b6ff', '#f357a8'],
              })
            }
          />
          <RootStack.Screen
            name="Features"
            component={FeaturesScreen}
            options={({ navigation }) =>
              getInfoScreenOptions({ title: 'Features', navigation })
            }
          />
          <RootStack.Screen
            name="Pricing"
            component={PricingScreen}
            options={({ navigation }) =>
              getInfoScreenOptions({ title: 'Pricing & Plans', navigation })
            }
          />
          <RootStack.Screen
            name="Contact"
            component={ContactScreen}
            options={({ navigation }) =>
              getInfoScreenOptions({ title: 'Contact Us', navigation })
            }
          />
          <RootStack.Screen
            name="Support"
            component={SupportScreen}
            options={({ navigation }) =>
              getInfoScreenOptions({ title: 'Support', navigation })
            }
          />
          <RootStack.Screen
            name="Privacy"
            component={PrivacyScreen}
            options={({ navigation }) =>
              getInfoScreenOptions({ title: 'Privacy Policy', navigation })
            }
          />
          <RootStack.Screen
            name="ConnectionTest"
            component={ConnectionTest}
            options={({ navigation }) =>
              getInfoScreenOptions({ title: 'Connection Test', navigation })
            }
          />
        </RootStack.Navigator>
      );
    }

    if (!MainNavigator) {
      return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="RoleSelection"
            component={RoleSelectionScreen}
            initialParams={{
              error: `Unknown role: ${userRole}`,
              showError: true,
              user: user,
            }}
          />
        </Stack.Navigator>
      );
    }

    return (
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Main" component={MainNavigator} />
        <RootStack.Screen
          name="AboutUs"
          component={AboutUsScreen}
          options={({ navigation }) =>
            getInfoScreenOptions({
              title: 'About Us',
              navigation,
              gradientColors: ['#6d41b6ff', '#f357a8'],
            })
          }
        />
        <RootStack.Screen
          name="Features"
          component={FeaturesScreen}
          options={({ navigation }) =>
            getInfoScreenOptions({ title: 'Features', navigation })
          }
        />
        <RootStack.Screen
          name="Pricing"
          component={PricingScreen}
          options={({ navigation }) =>
            getInfoScreenOptions({ title: 'Pricing & Plans', navigation })
          }
        />
        <RootStack.Screen
          name="Contact"
          component={ContactScreen}
          options={({ navigation }) =>
            getInfoScreenOptions({ title: 'Contact Us', navigation })
          }
        />
        <RootStack.Screen
          name="Support"
          component={SupportScreen}
          options={({ navigation }) =>
            getInfoScreenOptions({ title: 'Support', navigation })
          }
        />
        <RootStack.Screen
          name="Privacy"
          component={PrivacyScreen}
          options={({ navigation }) =>
            getInfoScreenOptions({ title: 'Privacy Policy', navigation })
          }
        />
        <RootStack.Screen
          name="ConnectionTest"
          component={ConnectionTest}
          options={({ navigation }) =>
            getInfoScreenOptions({ title: 'Connection Test', navigation })
          }
        />
      </RootStack.Navigator>
    );
  }

  // Authenticated user without role - show role selection
  console.log('👤 Authenticated user needs role selection');
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="RoleSelection"
        component={RoleSelectionScreen}
        options={{
          title: 'Select Your Role',
          headerShown: true,
          headerLeft: () => null,
          gestureEnabled: false,
        }}
        initialParams={{
          user: user,
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;




















// // Redirect component for unauthenticated access to marketing/public screens
// import React, { useEffect } from 'react';
// import { View } from 'react-native';

// function RedirectToSignUp({ navigation }) {
//   useEffect(() => {
//     navigation.replace('SignUp');
//   }, [navigation]);
//   return <View />;
// }

// import { createNativeStackNavigator } from '@react-navigation/native-stack';

// import { useAuth } from '../context/AuthContext';
// import { useRole } from '../context/RoleContext';

// // Import your navigators
// import LandingScreen from '../screens/Common/LandingScreen';
// import LoginScreen from '../screens/Common/LoginScreen';
// import SignUpScreen from '../screens/Common/SignUpScreen';
// import ScreenHeader from '../components/navigation/ScreenHeader';
// import StudentTabNavigator from './student/StudentNavigator';
// import TeacherTabNavigator from './teacher/TeacherNavigator';
// import ParentTabNavigator from './parent/ParentNavigator';
// import AdminTabNavigator from './admin/AdminTabNavigator';
// import SuperAdminTabNavigator from './superadmin/SuperAdminTabNavigator';
// import RoleSelectionScreen from '../screens/Common/RoleSelectionScreen';
// import AboutUsScreen from '../screens/Common/AboutUsScreen';
// import FeaturesScreen from '../screens/Common/FeaturesScreen';
// import ContactScreen from '../screens/Common/ContactScreen';
// import SupportScreen from '../screens/Common/SupportScreen';
// import PrivacyScreen from '../screens/Common/PrivacyScreen';
// import PricingScreen from '../screens/Common/PricingScreen';
// import ConnectionTest from '../components/ConnectionTest';

// const Stack = createNativeStackNavigator();

// const AppNavigator = () => {
//   const { isAuthenticated, user, isLoading: authLoading } = useAuth();
//   const { currentRole, isLoading: roleLoading, setRole } = useRole();

//   console.log('🎭 AppNavigator - Auth Status:', {
//     isAuthenticated,
//     currentRole,
//     hasUser: !!user,
//     authLoading,
//     roleLoading,
//     userRole: user?.role,
//   });

//   useEffect(() => {
//     if (isAuthenticated && user?.role && !currentRole && setRole) {
//       console.log('🔄 Auto-setting role from user object:', user.role);
//       setRole(user.role);
//     }
//   }, [isAuthenticated, user?.role, currentRole, setRole]);

//   if (authLoading || roleLoading) {
//     return null;
//   }

//   if (!isAuthenticated) {
//     return (
//       <Stack.Navigator>
//         <Stack.Screen
//           name="Landing"
//           component={LandingScreen}
//           options={{ headerShown: false }}
//         />
//         <Stack.Screen
//           name="Login"
//           component={LoginScreen}
//           options={({ navigation }) => ({
//             header: (props) => (
//               <ScreenHeader
//                 {...props}
//                 title="Log In"
//                 showBackButton={true}
//                 onBackPress={() => navigation.replace('Landing')}
//                 titleStyle={{
//                   textAlign: '',
//                   color: '#fff',
//                   fontSize: 22,
//                   fontWeight: 'bold',
//                   letterSpacing: 1,
//                 }}
//                 backButtonStyle={{ backgroundColor: '#031c2cff' }}
//               />
//             ),
//           })}
//         />
//         <Stack.Screen
//           name="SignUp"
//           component={SignUpScreen}
//           options={({ navigation }) => ({
//             header: (props) => (
//               <ScreenHeader
//                 {...props}
//                 title="Sign Up"
//                 showBackButton={true}
//                 onBackPress={() => navigation.replace('Landing')}
//                 titleStyle={{
//                   textAlign: '',
//                   color: '#fff',
//                   fontSize: 22,
//                   fontWeight: 'bold',
//                   letterSpacing: 1,
//                 }}
//                 backButtonStyle={{ backgroundColor: '#031c2cff' }}
//               />
//             ),
//           })}
//         />
//         <Stack.Screen name="AboutUs" component={RedirectToSignUp} />
//         <Stack.Screen name="Features" component={RedirectToSignUp} />
//         <Stack.Screen name="Pricing" component={RedirectToSignUp} />
//         <Stack.Screen name="Contact" component={RedirectToSignUp} />
//         <Stack.Screen name="Support" component={RedirectToSignUp} />
//         <Stack.Screen name="Privacy" component={RedirectToSignUp} />
//         <Stack.Screen name="ConnectionTest" component={RedirectToSignUp} />
//       </Stack.Navigator>
//     );
//   }

//   // Authenticated user with role - show role-based navigation
//   if (isAuthenticated && (currentRole || user?.role)) {
//     const userRole = currentRole || user?.role;
//     console.log('✅ Showing role-based navigation for:', userRole);

//     const normalizedRole = userRole?.toLowerCase().trim();
//     console.log(
//       '🔄 Normalized role:',
//       normalizedRole,
//       'from original:',
//       userRole,
//     );

//     switch (normalizedRole) {
//       case 'student':
//         console.log('📚 Loading Student Navigator');
//         return <StudentTabNavigator />;

//       case 'teacher':
//         console.log('👩‍🏫 Loading Teacher Navigator');
//         return <TeacherTabNavigator />;

//       case 'parent':
//         console.log('👨‍👩‍👧‍👦 Loading Parent Navigator');
//         return <ParentTabNavigator />;

//       case 'admin':
//       case 'administrator':
//       case 'schooladmin':
//       case 'school_admin':
//         console.log('🏫 Loading SchoolAdmin Screen');
//         return <AdminTabNavigator />;

//       case 'superadmin':
//       case 'super_admin':
//         console.log('🦸‍♂️ Loading SuperAdmin Navigator');
//         return <SuperAdminTabNavigator />;

//       case 'visitor':
//         console.log('👤 Loading Visitor Navigation');
//         return (
//           <Stack.Navigator initialRouteName="Landing">
//             <Stack.Screen
//               name="Landing"
//               component={LandingScreen}
//               options={{ headerShown: false }}
//             />
//             <Stack.Screen
//               name="Login"
//               component={LoginScreen}
//               options={({ navigation }) => ({
//                 header: (props) => (
//                   <ScreenHeader
//                     {...props}
//                     title="Log In"
//                     showBackButton={true}
//                     onBackPress={() => navigation.goBack()}
//                     titleStyle={{
//                       textAlign: '',
//                       color: '#fff',
//                       fontSize: 22,
//                       fontWeight: 'bold',
//                       letterSpacing: 1,
//                     }}
//                     backButtonStyle={{ backgroundColor: '#208799fa' }}
//                   />
//                 ),
//               })}
//             />
//             <Stack.Screen
//               name="SignUp"
//               component={SignUpScreen}
//               options={({ navigation }) => ({
//                 header: (props) => (
//                   <ScreenHeader
//                     {...props}
//                     title="Sign Up"
//                     showBackButton={true}
//                     onBackPress={() => navigation.goBack()}
//                     titleStyle={{
//                       textAlign: '',
//                       color: '#fff',
//                       fontSize: 22,
//                       fontWeight: 'bold',
//                       letterSpacing: 1,
//                     }}
//                     backButtonStyle={{ backgroundColor: '#208799fa' }}
//                   />
//                 ),
//               })}
//             />
//             <Stack.Screen
//               name="AboutUs"
//               component={AboutUsScreen}
//               options={({ navigation }) => ({
//                 header: (props) => (
//                   <ScreenHeader
//                     {...props}
//                     title="About Us"
//                     showBackButton={true}
//                     onBackPress={() => navigation.goBack()}
//                     primaryColor="#7b2ff2"
//                     gradientColors={['#6d41b6ff', '#f357a8']}
//                     backButtonStyle={{ backgroundColor: '#7b2ff2' }}
//                   />
//                 ),
//               })}
//             />
//             <Stack.Screen
//               name="Features"
//               component={FeaturesScreen}
//               options={({ navigation }) => ({
//                 header: (props) => (
//                   <ScreenHeader
//                     {...props}
//                     title="Features"
//                     showBackButton={true}
//                     onBackPress={() => navigation.goBack()}
//                     primaryColor="#7b2ff2"
//                     gradientColors={['#7b2ff2', '#f357a8']}
//                     backButtonStyle={{ backgroundColor: '#7b2ff2' }}
//                   />
//                 ),
//               })}
//             />
//             <Stack.Screen
//               name="Pricing"
//               component={PricingScreen}
//               options={({ navigation }) => ({
//                 header: (props) => (
//                   <ScreenHeader
//                     {...props}
//                     title="Pricing & Plans"
//                     showBackButton={true}
//                     onBackPress={() => navigation.goBack()}
//                     primaryColor="#7b2ff2"
//                     gradientColors={['#7b2ff2', '#f357a8']}
//                     backButtonStyle={{ backgroundColor: '#7b2ff2' }}
//                   />
//                 ),
//               })}
//             />
//             <Stack.Screen
//               name="Contact"
//               component={ContactScreen}
//               options={({ navigation }) => ({
//                 header: (props) => (
//                   <ScreenHeader
//                     {...props}
//                     title="Contact Us"
//                     showBackButton={true}
//                     onBackPress={() => navigation.goBack()}
//                     primaryColor="#7b2ff2"
//                     gradientColors={['#7b2ff2', '#f357a8']}
//                     backButtonStyle={{ backgroundColor: '#7b2ff2' }}
//                   />
//                 ),
//               })}
//             />
//             <Stack.Screen
//               name="Support"
//               component={SupportScreen}
//               options={({ navigation }) => ({
//                 header: (props) => (
//                   <ScreenHeader
//                     {...props}
//                     title="Support"
//                     showBackButton={true}
//                     onBackPress={() => navigation.goBack()}
//                     primaryColor="#7b2ff2"
//                     gradientColors={['#7b2ff2', '#f357a8']}
//                     backButtonStyle={{ backgroundColor: '#7b2ff2' }}
//                   />
//                 ),
//               })}
//             />
//             <Stack.Screen
//               name="Privacy"
//               component={PrivacyScreen}
//               options={({ navigation }) => ({
//                 header: (props) => (
//                   <ScreenHeader
//                     {...props}
//                     title="Privacy Policy"
//                     showBackButton={true}
//                     onBackPress={() => navigation.goBack()}
//                     primaryColor="#7b2ff2"
//                     gradientColors={['#7b2ff2', '#f357a8']}
//                     backButtonStyle={{ backgroundColor: '#7b2ff2' }}
//                   />
//                 ),
//               })}
//             />
//             <Stack.Screen
//               name="ConnectionTest"
//               component={ConnectionTest}
//               options={({ navigation }) => ({
//                 header: (props) => (
//                   <ScreenHeader
//                     {...props}
//                     title="Connection Test"
//                     showBackButton={true}
//                     onBackPress={() => navigation.goBack()}
//                     primaryColor="#7b2ff2"
//                     gradientColors={['#7b2ff2', '#f357a8']}
//                     backButtonStyle={{ backgroundColor: '#7b2ff2' }}
//                   />
//                 ),
//               })}
//             />
//           </Stack.Navigator>
//         );
//       default:
//         console.warn(
//           '⚠️ Unknown role:',
//           userRole,
//           'normalized:',
//           normalizedRole,
//           '- falling back to role selection',
//         );
//         return (
//           <Stack.Navigator screenOptions={{ headerShown: false }}>
//             <Stack.Screen
//               name="RoleSelection"
//               component={RoleSelectionScreen}
//               initialParams={{
//                 error: `Unknown role: ${userRole}`,
//                 showError: true,
//                 user: user,
//               }}
//             />
//           </Stack.Navigator>
//         );
//     }
//   }

//   // Authenticated user without role - show role selection
//   console.log('👤 Authenticated user needs role selection');
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       <Stack.Screen
//         name="RoleSelection"
//         component={RoleSelectionScreen}
//         options={{
//           title: 'Select Your Role',
//           headerShown: true,
//           headerLeft: () => null,
//           gestureEnabled: false,
//         }}
//         initialParams={{
//           user: user,
//         }}
//       />
//     </Stack.Navigator>
//   );
// };

// export default AppNavigator;
