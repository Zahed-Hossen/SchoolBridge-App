import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminTabNavigator from './AdminTabNavigator';
// Import additional admin screens here if needed

const Stack = createStackNavigator();

const AdminNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
      {/* Add more admin stack screens here as needed */}
    </Stack.Navigator>
  );
};

export default AdminNavigator;
