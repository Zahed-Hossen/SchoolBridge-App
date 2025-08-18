import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SuperAdminTabNavigator from './SuperAdminTabNavigator';
import SchoolDetailScreen from '../screens/SuperAdmin/SchoolsScreen';
import PermissionSettingsScreen from '../screens/SuperAdmin/SettingsScreen';

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
        name="SchoolDetails"
        component={SchoolDetailScreen}
        options={{ title: 'School Details' }}
      />
      <Stack.Screen
        name="PermissionSettings"
        component={PermissionSettingsScreen}
        options={{ title: 'Permission Settings' }}
      />
    </Stack.Navigator>
  );
};

export default SuperAdminNavigator;
