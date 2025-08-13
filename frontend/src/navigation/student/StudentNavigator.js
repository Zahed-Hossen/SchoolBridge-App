import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import StudentTabNavigator from './StudentTabNavigator.js';
import AssignmentDetails from '../../screens/Student/Assignments.js';
import AnnouncementDetails from '../../screens/Student/Announcements.js';

const Stack = createNativeStackNavigator();

const StudentNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      {/* Main Student Tabs */}
      <Stack.Screen
        name="StudentTabs"
        component={StudentTabNavigator}
      />

      {/* Detail Screens */}
      <Stack.Screen
        name="AssignmentDetails"
        component={AssignmentDetails}
        options={{
          headerShown: true,
          title: 'Assignment Details'
        }}
      />

      <Stack.Screen
        name="AnnouncementDetails"
        component={AnnouncementDetails}
        options={{
          headerShown: true,
          title: 'Announcement Details'
        }}
      />
    </Stack.Navigator>
  );
};

export default StudentNavigator;
