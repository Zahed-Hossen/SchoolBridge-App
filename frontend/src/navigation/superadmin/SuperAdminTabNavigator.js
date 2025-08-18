
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../../screens/SuperAdmin/DashboardScreen';
import SchoolsScreen from '../../screens/SuperAdmin/SchoolsScreen';
import RoleMatrixScreen from '../../screens/SuperAdmin/RoleMatrixScreen';
import LogsScreen from '../../screens/SuperAdmin/LogsScreen';
import SettingsScreen from '../../screens/SuperAdmin/SettingsScreen';
import { TEACHER_THEME } from '../../constants/theme';
import ScrollableTabBar from '../../components/navigation/ScrollableTabBar';


const Tab = createBottomTabNavigator();


const SuperAdminTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => (
        <ScrollableTabBar
          {...props}
          theme={{
            primaryColor: TEACHER_THEME.colors.primary.main,
            backgroundColor: TEACHER_THEME.colors.background.secondary,
            inactiveColor: TEACHER_THEME.colors.text.muted,
            borderColor: TEACHER_THEME.colors.border,
          }}
          role="Admin"
        />
      )}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Schools" component={SchoolsScreen} />
      <Tab.Screen name="RoleMatrix" component={RoleMatrixScreen} />
      <Tab.Screen name="Logs" component={LogsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default SuperAdminTabNavigator;
