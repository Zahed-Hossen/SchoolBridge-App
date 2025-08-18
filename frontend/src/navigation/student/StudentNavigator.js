import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import StudentTabNavigator from './StudentTabNavigator.js';
import AssignmentDetails from '../../screens/Student/Assignments.js';
import AnnouncementDetails from '../../screens/Student/AnnouncementDetails.js';

const Stack = createNativeStackNavigator();

const StudentNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Main Student Tabs */}
      <Stack.Screen name="StudentTabs" component={StudentTabNavigator} />

      {/* Detail Screens */}
      <Stack.Screen
        name="AssignmentDetails"
        component={AssignmentDetails}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="AnnouncementDetails"
        component={AnnouncementDetails}
        options={{
          headerShown: false,
          title: 'Announcement Details',
        }}
      />
    </Stack.Navigator>
  );
};

export default StudentNavigator;
