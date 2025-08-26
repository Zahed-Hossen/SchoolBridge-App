import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SuperAdminTabNavigator from './SuperAdminTabNavigator';
import PermissionSettingsScreen from '../screens/SuperAdmin/SettingsScreen';
import AddSchoolScreen from '../screens/SuperAdmin/AddSchoolScreen';
 import SchoolDetailsScreen from '../../screens/SuperAdmin/SchoolDetailsScreen';

const Stack = createNativeStackNavigator();

const SuperAdminNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4F8EF7',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="SuperAdminTabs"
        component={SuperAdminTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PermissionSettings"
        component={PermissionSettingsScreen}
        options={{ title: 'Permission Settings' }}
      />
      <Stack.Screen
        name="AddSchool"
        component={AddSchoolScreen}
        options={{ title: 'Add School', headerShown: false }}
      />
      <Stack.Screen
        name="SchoolDetails"
        component={SchoolDetailsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default SuperAdminNavigator;
