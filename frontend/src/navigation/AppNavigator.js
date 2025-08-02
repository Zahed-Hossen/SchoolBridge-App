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
import ConnectionTest from '../components/ConnectionTest';

// Student screens
import StudentDashboard from '../screens/Student/Dashboard';
import StudentAnnouncements from '../screens/Student/Announcements';

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

// ✅ ENHANCED: Student Stack Navigator with proper navigation
const StudentStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false, // We use custom headers in each screen
    }}
  >
    <Stack.Screen name="StudentTabs" component={StudentTabNavigator} />
    <Stack.Screen name="Announcements" component={StudentAnnouncements} />
    <Stack.Screen
      name="Assignments"
      component={PlaceholderScreen}
      initialParams={{ title: 'Student Assignments' }}
    />
    <Stack.Screen
      name="Grades"
      component={PlaceholderScreen}
      initialParams={{ title: 'Student Grades' }}
    />
    <Stack.Screen
      name="Schedule"
      component={PlaceholderScreen}
      initialParams={{ title: 'Student Schedule' }}
    />
    <Stack.Screen
      name="Profile"
      component={PlaceholderScreen}
      initialParams={{ title: 'Student Profile' }}
    />
  </Stack.Navigator>
);

// ✅ ENHANCED: Student Tab Navigator
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
          case 'More':
            iconName = focused ? 'ellipsis-horizontal' : 'ellipsis-horizontal-outline';
            break;
          default:
            iconName = 'help-outline';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: COLORS.student || '#3498DB',
      tabBarInactiveTintColor: '#8E8E93',
      headerStyle: { backgroundColor: COLORS.student || '#3498DB' },
      headerTintColor: '#FFFFFF',
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
        paddingBottom: 5,
        paddingTop: 5,
        height: 60,
      },
    })}
  >
    <Tab.Screen
      name="Dashboard"
      component={StudentDashboard}
      options={{
        title: 'Dashboard',
        headerShown: false, // Dashboard has custom header
      }}
    />
    <Tab.Screen
      name="Grades"
      component={PlaceholderScreen}
      initialParams={{ title: 'Student Grades' }}
      options={{ title: 'Grades' }}
    />
    <Tab.Screen
      name="Assignments"
      component={PlaceholderScreen}
      initialParams={{ title: 'Student Assignments' }}
      options={{ title: 'Assignments' }}
    />
    <Tab.Screen
      name="Schedule"
      component={PlaceholderScreen}
      initialParams={{ title: 'Student Schedule' }}
      options={{ title: 'Schedule' }}
    />
    <Tab.Screen
      name="More"
      component={PlaceholderScreen}
      initialParams={{ title: 'More Options' }}
      options={{ title: 'More' }}
    />
  </Tab.Navigator>
);

// ✅ ENHANCED: Teacher Stack Navigator
const TeacherStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="TeacherTabs" component={TeacherTabNavigator} />
    <Stack.Screen
      name="Classes"
      component={PlaceholderScreen}
      initialParams={{ title: 'My Classes' }}
    />
    <Stack.Screen
      name="CreateAssignment"
      component={PlaceholderScreen}
      initialParams={{ title: 'Create Assignment' }}
    />
    <Stack.Screen
      name="Attendance"
      component={PlaceholderScreen}
      initialParams={{ title: 'Mark Attendance' }}
    />
  </Stack.Navigator>
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
      tabBarInactiveTintColor: '#8E8E93',
      headerStyle: { backgroundColor: COLORS.teacher || '#E74C3C' },
      headerTintColor: '#FFFFFF',
    })}
  >
    <Tab.Screen
      name="Dashboard"
      component={TeacherDashboard}
      options={{
        title: 'Dashboard',
        headerShown: false,
      }}
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

// ✅ ENHANCED: Parent Stack Navigator
const ParentStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="ParentTabs" component={ParentTabNavigator} />
    <Stack.Screen
      name="Children"
      component={PlaceholderScreen}
      initialParams={{ title: 'My Children' }}
    />
    <Stack.Screen
      name="Reports"
      component={PlaceholderScreen}
      initialParams={{ title: 'Progress Reports' }}
    />
  </Stack.Navigator>
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
      options={{
        title: 'Dashboard',
        headerShown: false,
      }}
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

// ✅ ENHANCED: Admin Stack Navigator
const AdminStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
    <Stack.Screen
      name="Users"
      component={PlaceholderScreen}
      initialParams={{ title: 'User Management' }}
    />
    <Stack.Screen
      name="Classes"
      component={PlaceholderScreen}
      initialParams={{ title: 'Class Management' }}
    />
    <Stack.Screen
      name="Reports"
      component={PlaceholderScreen}
      initialParams={{ title: 'Reports & Analytics' }}
    />
    <Stack.Screen
      name="Settings"
      component={PlaceholderScreen}
      initialParams={{ title: 'System Settings' }}
    />
  </Stack.Navigator>
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
      component={AdminDashboard}
      options={{
        title: 'Dashboard',
        headerShown: false,
      }}
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

// ✅ UPDATED: Export the getRoleBasedNavigator function with Stack Navigators
export const getRoleBasedNavigator = (role) => {
  switch (role) {
    case 'Student':
      return StudentStackNavigator; // Changed to Stack Navigator
    case 'Teacher':
      return TeacherStackNavigator; // Changed to Stack Navigator
    case 'Parent':
      return ParentStackNavigator;   // Changed to Stack Navigator
    case 'Admin':
      return AdminStackNavigator;    // Changed to Stack Navigator
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
    <Stack.Group screenOptions={{ presentation: 'modal' }}>
      <Stack.Screen
        name="ConnectionTest"
        component={ConnectionTest}
        options={{
          title: 'Connection Test',
          headerShown: true,
        }}
      />
    </Stack.Group>
    <Stack.Screen
      name="Privacy"
      component={PrivacyScreen}
      options={{ title: 'Privacy Policy' }}
    />
  </Stack.Navigator>
);
