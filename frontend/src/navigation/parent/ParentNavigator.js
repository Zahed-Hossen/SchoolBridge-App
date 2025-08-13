import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useRole } from '../../context/RoleContext';
import { useTenant } from '../../context/TenantContext';
import { getTabBarIcon } from '../helpers/tabBarIcons';

import ParentDashboard from '../../screens/Parent/Dashboard';
import PlaceholderScreen from '../../components/PlaceholderScreen';

const Tab = createBottomTabNavigator();

const ParentNavigator = () => {
  const { roleTheme } = useRole();
  const { tenantBranding } = useTenant();

  const primaryColor = roleTheme?.primary || tenantBranding?.primaryColor || '#F39C12';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) =>
          getTabBarIcon(route.name, focused, color, size),
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: { backgroundColor: primaryColor },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen
        name="ParentDashboard"
        component={ParentDashboard}
        options={{
          title: '👨‍👩‍👧‍👦 Dashboard',
          headerShown: false
        }}
      />
      <Tab.Screen
        name="Children"
        options={{ title: 'Children' }}
      >
        {() => <PlaceholderScreen title="👧👦 My Children" />}
      </Tab.Screen>
      <Tab.Screen
        name="ChildGrades"
        options={{ title: 'Grades' }}
      >
        {() => <PlaceholderScreen title="🎯 Child Grades" />}
      </Tab.Screen>
      <Tab.Screen
        name="Payments"
        options={{ title: 'Payments' }}
      >
        {() => <PlaceholderScreen title="💳 Fee Payments" />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default ParentNavigator;
