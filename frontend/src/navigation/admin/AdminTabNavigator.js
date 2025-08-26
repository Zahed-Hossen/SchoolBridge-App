import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useRole } from '../../context/RoleContext';
import { useTenant } from '../../context/TenantContext';
import ScrollableTabBar from '../../components/navigation/ScrollableTabBar';
import SchoolAdminScreen from '../../screens/Admin/SchoolAdminScreen';
import AdminInvitationsScreen from '../../screens/Admin/AdminInvitationsScreen';
import PlaceholderScreen from '../../components/PlaceholderScreen';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Dashboard', component: SchoolAdminScreen },
  { name: 'User Management', placeholder: 'User Management' },
  { name: 'Permissions', placeholder: 'Permissions' },
  { name: 'Classes & Sections', placeholder: 'Classes & Sections' },
  { name: 'Announcements', placeholder: 'Announcements' },
  { name: 'Reports', placeholder: 'Reports' },
];

const AdminTabNavigator = () => {
  const { roleTheme } = useRole();
  const { tenantBranding } = useTenant();
  const primaryColor =
    roleTheme?.primary || tenantBranding?.primaryColor || '#9B59B6';

  return (
    <Tab.Navigator
      tabBar={(props) => (
        <ScrollableTabBar {...props} role="admin" theme={{ primaryColor }} />
      )}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Dashboard" component={SchoolAdminScreen} />
      <Tab.Screen name="Invitations" component={AdminInvitationsScreen} />
      <Tab.Screen name="User Management">
        {() => <PlaceholderScreen title="User Management" />}
      </Tab.Screen>
      <Tab.Screen name="Permissions">
        {() => <PlaceholderScreen title="Permissions" />}
      </Tab.Screen>
      <Tab.Screen name="Classes & Sections">
        {() => <PlaceholderScreen title="Classes & Sections" />}
      </Tab.Screen>
      <Tab.Screen name="Announcements">
        {() => <PlaceholderScreen title="Announcements" />}
      </Tab.Screen>
      <Tab.Screen name="Reports">
        {() => <PlaceholderScreen title="Reports" />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default AdminTabNavigator;
