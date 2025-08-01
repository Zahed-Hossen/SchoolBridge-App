import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Import screens
import LoginScreen from '../screens/Common/LoginScreen';
import LandingScreen from '../screens/Common/LandingScreen';
import SignUpScreen from '../screens/Common/SignUpScreen';
import AboutUsScreen from '../screens/Common/AboutUsScreen';
import FeaturesScreen from '../screens/Common/FeaturesScreen';
import ContactScreen from '../screens/Common/ContactScreen';
import SupportScreen from '../screens/Common/SupportScreen';
import PrivacyScreen from '../screens/Common/PrivacyScreen';
import PricingScreen from '../screens/Common/PricingScreen';
import RoleSelectionScreen from '../screens/Common/RoleSelectionScreen';

// Student screens
import StudentDashboard from '../screens/Student/Dashboard';

// Teacher screens
import TeacherDashboard from '../screens/Teacher/Dashboard';

// Parent Screens
import ParentDashboard from '../screens/Parent/Dashboard';

// Admin Screens
import AdminDashboard from '../screens/Admin/Dashboard';

import { COLORS } from '../constants/theme';
import { USER_ROLES } from '../constants/config';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ✅ FIXED: Define styles first, then use in component
const placeholderStyles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background?.secondary || '#F8F9FA',
    padding: 20,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary || '#2E86AB',
    marginBottom: 10,
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontSize: 16,
    color: COLORS.grey?.dark || '#48484A',
    textAlign: 'center',
  },
});

// ✅ FIXED: Placeholder screen using inline styles
const PlaceholderScreen = ({ route }) => {
  return (
    <View style={placeholderStyles.placeholder}>
      <Text style={placeholderStyles.placeholderText}>
        {route.params?.title || 'Coming Soon'}
      </Text>
      <Text style={placeholderStyles.placeholderSubtext}>
        This screen will be implemented next
      </Text>
    </View>
  );
};

// Student Tab Navigator
const StudentTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        switch (route.name) {
          case 'Dashboard':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'Grades':
            iconName = focused ? 'school' : 'school-outline';
            break;
          case 'Assignments':
            iconName = focused ? 'document-text' : 'document-text-outline';
            break;
          case 'Schedule':
            iconName = focused ? 'calendar' : 'calendar-outline';
            break;
          default:
            iconName = 'help-outline';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: COLORS.student || '#3498DB',
      tabBarInactiveTintColor: '#8E8E93', // ✅ FIXED: Direct color value
      headerStyle: { backgroundColor: COLORS.student || '#3498DB' },
      headerTintColor: '#FFFFFF', // ✅ FIXED: Direct color value
    })}
  >
    <Tab.Screen
      name="Dashboard"
      component={StudentDashboard}
      options={{ title: 'Dashboard' }}
    />
    <Tab.Screen
      name="Grades"
      component={PlaceholderScreen}
      initialParams={{ title: 'Student Grades' }}
    />
    <Tab.Screen
      name="Assignments"
      component={PlaceholderScreen}
      initialParams={{ title: 'Student Assignments' }}
    />
    <Tab.Screen
      name="Schedule"
      component={PlaceholderScreen}
      initialParams={{ title: 'Student Schedule' }}
    />
  </Tab.Navigator>
);

// Teacher Tab Navigator
const TeacherTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        switch (route.name) {
          case 'Dashboard':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'Classes':
            iconName = focused ? 'people' : 'people-outline';
            break;
          case 'Assignments':
            iconName = focused ? 'document-text' : 'document-text-outline';
            break;
          case 'Attendance':
            iconName = focused
              ? 'checkmark-circle'
              : 'checkmark-circle-outline';
            break;
          default:
            iconName = 'help-outline';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: COLORS.teacher || '#E74C3C',
      tabBarInactiveTintColor: '#8E8E93', // ✅ FIXED: Direct color value
      headerStyle: { backgroundColor: COLORS.teacher || '#E74C3C' },
      headerTintColor: '#FFFFFF', // ✅ FIXED: Direct color value
    })}
  >
    <Tab.Screen
      name="Dashboard"
      component={TeacherDashboard}
      options={{ title: 'Dashboard' }}
    />
    <Tab.Screen
      name="Classes"
      component={PlaceholderScreen}
      initialParams={{ title: 'My Classes' }}
    />
    <Tab.Screen
      name="Assignments"
      component={PlaceholderScreen}
      initialParams={{ title: 'Create Assignment' }}
    />
    <Tab.Screen
      name="Attendance"
      component={PlaceholderScreen}
      initialParams={{ title: 'Mark Attendance' }}
    />
  </Tab.Navigator>
);

// Parent Tab Navigator
const ParentTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        switch (route.name) {
          case 'Dashboard':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'Children':
            iconName = focused ? 'people' : 'people-outline';
            break;
          case 'Reports':
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
            break;
          case 'Notifications':
            iconName = focused ? 'notifications' : 'notifications-outline';
            break;
          default:
            iconName = 'help-outline';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: COLORS.parent || '#F39C12',
      tabBarInactiveTintColor: '#8E8E93',
      headerStyle: { backgroundColor: COLORS.parent || '#F39C12' },
      headerTintColor: '#FFFFFF',
    })}
  >
    <Tab.Screen
      name="Dashboard"
      component={ParentDashboard}
      initialParams={{ title: 'Parent Dashboard' }}
    />
    <Tab.Screen
      name="Children"
      component={PlaceholderScreen}
      initialParams={{ title: 'My Children' }}
    />
    <Tab.Screen
      name="Reports"
      component={PlaceholderScreen}
      initialParams={{ title: 'Progress Reports' }}
    />
    <Tab.Screen
      name="Notifications"
      component={PlaceholderScreen}
      initialParams={{ title: 'Notifications' }}
    />
  </Tab.Navigator>
);

// Admin Tab Navigator
const AdminTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        switch (route.name) {
          case 'Dashboard':
            iconName = focused ? 'speedometer' : 'speedometer-outline';
            break;
          case 'Users':
            iconName = focused ? 'people' : 'people-outline';
            break;
          case 'Classes':
            iconName = focused ? 'school' : 'school-outline';
            break;
          case 'Reports':
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
            break;
          case 'Settings':
            iconName = focused ? 'settings' : 'settings-outline';
            break;
          default:
            iconName = 'help-outline';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: COLORS.admin || '#9B59B6',
      tabBarInactiveTintColor: '#8E8E93',
      headerStyle: { backgroundColor: COLORS.admin || '#9B59B6' },
      headerTintColor: '#FFFFFF',
    })}
  >
    <Tab.Screen
      name="Dashboard"
      component={AdminDashboard} // ✅ Use actual AdminDashboard
      options={{ title: 'Dashboard' }}
    />
    <Tab.Screen
      name="Users"
      component={PlaceholderScreen}
      initialParams={{ title: 'User Management' }}
    />
    <Tab.Screen
      name="Classes"
      component={PlaceholderScreen}
      initialParams={{ title: 'Class Management' }}
    />
    <Tab.Screen
      name="Reports"
      component={PlaceholderScreen}
      initialParams={{ title: 'Reports & Analytics' }}
    />
    <Tab.Screen
      name="Settings"
      component={PlaceholderScreen}
      initialParams={{ title: 'System Settings' }}
    />
  </Tab.Navigator>
);

// ✅ FIXED: Export the getRoleBasedNavigator function
export const getRoleBasedNavigator = (role) => {
  switch (role) {
    case 'Student':
      return StudentTabNavigator;
    case 'Teacher':
      return TeacherTabNavigator;
    case 'Parent':
      return ParentTabNavigator;
    case 'Admin':
      return AdminTabNavigator;
    default:
      return AuthStackNavigator;
  }
};

// Auth Stack Navigator
export const AuthStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: COLORS.primary || '#2E86AB' },
      headerTintColor: '#ffffffff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
    initialRouteName="Landing"
  >
    <Stack.Screen
      name="Landing"
      component={LandingScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{ title: 'Login' }}
    />
    <Stack.Screen
      name="SignUp"
      component={SignUpScreen}
      options={{ title: 'Sign Up' }}
    />
    <Stack.Screen
      name="RoleSelection"
      component={RoleSelectionScreen}
      options={{
        title: 'Choose Role',
        headerLeft: () => null, // Disable back button
      }}
    />
    <Stack.Screen
      name="AboutUs"
      component={AboutUsScreen}
      options={{ title: 'About Us' }}
    />
    <Stack.Screen
      name="Features"
      component={FeaturesScreen}
      options={{ title: 'Features' }}
    />

    <Stack.Screen
      name="Pricing"
      component={PricingScreen}
      options={{ title: 'Pricing & Plans' }}
    />

    <Stack.Screen
      name="Contact"
      component={ContactScreen}
      options={{ title: 'Contact Us' }}
    />
    <Stack.Screen
      name="Support"
      component={SupportScreen}
      options={{ title: 'Support' }}
    />
    <Stack.Screen
      name="Privacy"
      component={PrivacyScreen}
      options={{ title: 'Privacy Policy' }}
    />
  </Stack.Navigator>
);









// import React from 'react';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { Ionicons } from '@expo/vector-icons';

// // Import screens
// import LoginScreen from '../screens/Common/LoginScreen';
// import LandingScreen from '../screens/Common/LandingScreen';
// import SignUpScreen from '../screens/Common/SignUpScreen';
// // import RegisterScreen from '../screens/Common/RegisterScreen';
// // import ForgotPasswordScreen from '../screens/Common/ForgotPasswordScreen';

// // Student screens
// import StudentDashboard from '../screens/Student/Dashboard';
// // import StudentGrades from '../screens/Student/Grades';
// // import StudentAssignments from '../screens/Student/Assignments';

// // Teacher screens
// import TeacherDashboard from '../screens/Teacher/Dashboard';
// // import TeacherClasses from '../screens/Teacher/Classes';

// // Parent screens (we'll create these)
// // import ParentDashboard from '../screens/Parent/Dashboard';
// // import ParentChildren from '../screens/Parent/Children';

// // Admin screens (we'll create these)
// // import AdminDashboard from '../screens/Admin/Dashboard';
// // import AdminUsers from '../screens/Admin/Users';

// import { COLORS } from '../constants/theme';
// import { USER_ROLES } from '../constants/config';

// const Stack = createNativeStackNavigator();
// const Tab = createBottomTabNavigator();

// // Temporary placeholder screens
// const PlaceholderScreen = ({ route }) => {
//   const { View, Text, StyleSheet } = require('react-native');
//   return (
//     <View style={styles.placeholder}>
//       <Text style={styles.placeholderText}>
//         {route.params?.title || 'Coming Soon'}
//       </Text>
//       <Text style={styles.placeholderSubtext}>
//         This screen will be implemented next
//       </Text>
//     </View>
//   );
// };

// // Student Tab Navigator
// const StudentTabNavigator = () => (
//   <Tab.Navigator
//     screenOptions={({ route }) => ({
//       tabBarIcon: ({ focused, color, size }) => {
//         let iconName;
//         switch (route.name) {
//           case 'Dashboard':
//             iconName = focused ? 'home' : 'home-outline';
//             break;
//           case 'Grades':
//             iconName = focused ? 'school' : 'school-outline';
//             break;
//           case 'Assignments':
//             iconName = focused ? 'document-text' : 'document-text-outline';
//             break;
//           case 'Schedule':
//             iconName = focused ? 'calendar' : 'calendar-outline';
//             break;
//           default:
//             iconName = 'help-outline';
//         }
//         return <Ionicons name={iconName} size={size} color={color} />;
//       },
//       tabBarActiveTintColor: COLORS.student,
//       tabBarInactiveTintColor: COLORS.grey.medium,
//       headerStyle: { backgroundColor: COLORS.student },
//       headerTintColor: COLORS.white,
//     })}
//   >
//     <Tab.Screen
//       name="Dashboard"
//       component={StudentDashboard}
//       options={{ title: 'Dashboard' }}
//     />
//     <Tab.Screen
//       name="Grades"
//       component={PlaceholderScreen}
//       initialParams={{ title: 'Student Grades' }}
//     />
//     <Tab.Screen
//       name="Assignments"
//       component={PlaceholderScreen}
//       initialParams={{ title: 'Student Assignments' }}
//     />
//     <Tab.Screen
//       name="Schedule"
//       component={PlaceholderScreen}
//       initialParams={{ title: 'Student Schedule' }}
//     />
//   </Tab.Navigator>
// );

// // Teacher Tab Navigator
// const TeacherTabNavigator = () => (
//   <Tab.Navigator
//     screenOptions={({ route }) => ({
//       tabBarIcon: ({ focused, color, size }) => {
//         let iconName;
//         switch (route.name) {
//           case 'Dashboard':
//             iconName = focused ? 'home' : 'home-outline';
//             break;
//           case 'Classes':
//             iconName = focused ? 'people' : 'people-outline';
//             break;
//           case 'Assignments':
//             iconName = focused ? 'document-text' : 'document-text-outline';
//             break;
//           case 'Attendance':
//             iconName = focused
//               ? 'checkmark-circle'
//               : 'checkmark-circle-outline';
//             break;
//           default:
//             iconName = 'help-outline';
//         }
//         return <Ionicons name={iconName} size={size} color={color} />;
//       },
//       tabBarActiveTintColor: COLORS.teacher,
//       tabBarInactiveTintColor: COLORS.grey.medium,
//       headerStyle: { backgroundColor: COLORS.teacher },
//       headerTintColor: COLORS.white,
//     })}
//   >
//     <Tab.Screen
//       name="Dashboard"
//       component={TeacherDashboard}
//       options={{ title: 'Dashboard' }}
//     />
//     <Tab.Screen
//       name="Classes"
//       component={PlaceholderScreen}
//       initialParams={{ title: 'My Classes' }}
//     />
//     <Tab.Screen
//       name="Assignments"
//       component={PlaceholderScreen}
//       initialParams={{ title: 'Create Assignment' }}
//     />
//     <Tab.Screen
//       name="Attendance"
//       component={PlaceholderScreen}
//       initialParams={{ title: 'Mark Attendance' }}
//     />
//   </Tab.Navigator>
// );

// // Parent Tab Navigator
// const ParentTabNavigator = () => (
//   <Tab.Navigator
//     screenOptions={({ route }) => ({
//       tabBarIcon: ({ focused, color, size }) => {
//         let iconName;
//         switch (route.name) {
//           case 'Dashboard':
//             iconName = focused ? 'home' : 'home-outline';
//             break;
//           case 'Children':
//             iconName = focused ? 'people' : 'people-outline';
//             break;
//           case 'Reports':
//             iconName = focused ? 'bar-chart' : 'bar-chart-outline';
//             break;
//           case 'Notifications':
//             iconName = focused ? 'notifications' : 'notifications-outline';
//             break;
//           default:
//             iconName = 'help-outline';
//         }
//         return <Ionicons name={iconName} size={size} color={color} />;
//       },
//       tabBarActiveTintColor: COLORS.parent,
//       tabBarInactiveTintColor: COLORS.grey.medium,
//       headerStyle: { backgroundColor: COLORS.parent },
//       headerTintColor: COLORS.white,
//     })}
//   >
//     <Tab.Screen
//       name="Dashboard"
//       component={PlaceholderScreen}
//       initialParams={{ title: 'Parent Dashboard' }}
//     />
//     <Tab.Screen
//       name="Children"
//       component={PlaceholderScreen}
//       initialParams={{ title: 'My Children' }}
//     />
//     <Tab.Screen
//       name="Reports"
//       component={PlaceholderScreen}
//       initialParams={{ title: 'Progress Reports' }}
//     />
//     <Tab.Screen
//       name="Notifications"
//       component={PlaceholderScreen}
//       initialParams={{ title: 'Notifications' }}
//     />
//   </Tab.Navigator>
// );

// // Admin Tab Navigator
// const AdminTabNavigator = () => (
//   <Tab.Navigator
//     screenOptions={({ route }) => ({
//       tabBarIcon: ({ focused, color, size }) => {
//         let iconName;
//         switch (route.name) {
//           case 'Dashboard':
//             iconName = focused ? 'home' : 'home-outline';
//             break;
//           case 'Users':
//             iconName = focused ? 'people' : 'people-outline';
//             break;
//           case 'Analytics':
//             iconName = focused ? 'analytics' : 'analytics-outline';
//             break;
//           case 'Settings':
//             iconName = focused ? 'settings' : 'settings-outline';
//             break;
//           default:
//             iconName = 'help-outline';
//         }
//         return <Ionicons name={iconName} size={size} color={color} />;
//       },
//       tabBarActiveTintColor: COLORS.admin,
//       tabBarInactiveTintColor: COLORS.grey.medium,
//       headerStyle: { backgroundColor: COLORS.admin },
//       headerTintColor: COLORS.white,
//     })}
//   >
//     <Tab.Screen
//       name="Dashboard"
//       component={PlaceholderScreen}
//       initialParams={{ title: 'Admin Dashboard' }}
//     />
//     <Tab.Screen
//       name="Users"
//       component={PlaceholderScreen}
//       initialParams={{ title: 'Manage Users' }}
//     />
//     <Tab.Screen
//       name="Analytics"
//       component={PlaceholderScreen}
//       initialParams={{ title: 'Analytics' }}
//     />
//     <Tab.Screen
//       name="Settings"
//       component={PlaceholderScreen}
//       initialParams={{ title: 'Settings' }}
//     />
//   </Tab.Navigator>
// );

// // Function to get the appropriate navigator based on user role
// export const getRoleBasedNavigator = (role) => {
//   switch (role) {
//     case USER_ROLES.STUDENT:
//       return StudentTabNavigator;
//     case USER_ROLES.TEACHER:
//       return TeacherTabNavigator;
//     case USER_ROLES.PARENT:
//       return ParentTabNavigator;
//     case USER_ROLES.ADMIN:
//       return AdminTabNavigator;
//     default:
//       return StudentTabNavigator;
//   }
// };

// // Auth Stack Navigator (for landing, login, register, etc.)
// export const AuthStackNavigator = () => (
//   <Stack.Navigator
//     screenOptions={{
//       headerStyle: { backgroundColor: COLORS.primary },
//       headerTintColor: COLORS.white,
//       headerTitleStyle: { fontWeight: 'bold' },
//     }}
//     initialRouteName="Landing"
//   >
//     <Stack.Screen
//       name="Landing"
//       component={LandingScreen}
//       options={{
//         headerShown: false, // Hide header for landing screen
//       }}
//     />
//     <Stack.Screen
//       name="Auth"
//       component={AuthTabNavigator}
//       options={{
//         headerShown: false, // Hide header for auth tabs
//       }}
//     />
//   </Stack.Navigator>
// );

// // Auth Tab Navigator (for login, register, forgot password)
// const AuthTabNavigator = () => (
//   <Stack.Navigator
//     screenOptions={{
//       headerStyle: { backgroundColor: COLORS.primary },
//       headerTintColor: COLORS.white,
//       headerTitleStyle: { fontWeight: 'bold' },
//     }}
//   >
//     <Stack.Screen
//       name="Login"
//       component={LoginScreen}
//       options={{
//         title: 'SchoolBridge Login',
//         headerShown: false, // Hide header for login screen
//       }}
//     />
//     <Stack.Screen
//       name="SignUp"
//       component={SignUpScreen}
//       options={{
//         title: 'Create Account',
//         headerShown: false, // Hide header for signup screen
//       }}
//     />
//     {/* Add more auth screens here */}
//     {/* <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} /> */}
//   </Stack.Navigator>
// );

// const styles = {
//   placeholder: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: COLORS.background.secondary,
//     padding: 20,
//   },
//   placeholderText: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: COLORS.primary,
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   placeholderSubtext: {
//     fontSize: 16,
//     color: COLORS.grey.dark,
//     textAlign: 'center',
//   },
// };
