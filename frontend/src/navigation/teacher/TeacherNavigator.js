import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// ✅ Import Tab Navigator (contains ScrollableTabBar)
import TeacherTabNavigator from './TeacherTabNavigator';

// ✅ Import Detail Screens
import ClassDetails from '../../screens/Teacher/Class/ClassDetails';
import AssignmentDetails from '../../screens/Teacher/Assignment/AssignmentDetails';
import CreateAssignment from '../../screens/Teacher/Assignment/CreateAssignment';
import CreateClass from '../../screens/Teacher/Class/CreateClass';
import LandingScreen from '../../screens/Common/LandingScreen';
import LoginScreen from '../../screens/Common/LoginScreen';

const Stack = createNativeStackNavigator();

const TeacherNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* ✅ Main Teacher Tabs Screen */}
      <Stack.Screen
        name="TeacherTabs"
        component={TeacherTabNavigator}
        options={{ headerShown: false }}
      />

      {/* ✅ Authentication Screens */}
      <Stack.Screen
        name="Landing"
        component={LandingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />

      {/* ✅ Teacher Detail Screens */}
      <Stack.Screen
        name="ClassDetails"
        component={ClassDetails}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="CreateAssignment"
        component={CreateAssignment}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="AssignmentDetails"
        component={AssignmentDetails}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="CreateClass"
        component={CreateClass}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default TeacherNavigator;
