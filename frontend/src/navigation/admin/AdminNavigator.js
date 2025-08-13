import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useRole } from '../../context/RoleContext';
import { useTenant } from '../../context/TenantContext';
import { getTabBarIcon } from '../helpers/tabBarIcons';

import AdminDashboard from '../../screens/Admin/Dashboard';
import PlaceholderScreen from '../../components/PlaceholderScreen';

const Tab = createBottomTabNavigator();

const AdminNavigator = () => {
  const { roleTheme } = useRole();
  const { tenantBranding } = useTenant();

  const primaryColor = roleTheme?.primary || tenantBranding?.primaryColor || '#9B59B6';

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
        name="AdminDashboard"
        component={AdminDashboard}
        options={{
          title: '👨‍💼 Dashboard',
          headerShown: false
        }}
      />
      <Tab.Screen
        name="UserManagement"
        options={{ title: 'Users' }}
      >
        {() => <PlaceholderScreen title="👥 User Management" />}
      </Tab.Screen>
      <Tab.Screen
        name="ClassManagement"
        options={{ title: 'Classes' }}
      >
        {() => <PlaceholderScreen title="🏫 Class Management" />}
      </Tab.Screen>
      <Tab.Screen
        name="Analytics"
        options={{ title: 'Analytics' }}
      >
        {() => <PlaceholderScreen title="📊 Analytics & Reports" />}
      </Tab.Screen>
      <Tab.Screen
        name="Settings"
        options={{ title: 'Settings' }}
      >
        {() => <PlaceholderScreen title="⚙️ System Settings" />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default AdminNavigator;
