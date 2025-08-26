import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../../screens/SuperAdmin/DashboardScreen';
import SchoolsScreen from '../../screens/SuperAdmin/SchoolsScreen';
import RoleMatrixScreen from '../../screens/SuperAdmin/RoleMatrixScreen';
import LogsScreen from '../../screens/SuperAdmin/LogsScreen';
import SettingsScreen from '../../screens/SuperAdmin/SettingsScreen';
import InvitationsScreen from '../../screens/SuperAdmin/InvitationsScreen';
import { TEACHER_THEME } from '../../constants/theme';
import ScrollableTabBar from '../../components/navigation/ScrollableTabBar';
import { useAuth } from '../../context/AuthContext';


const Tab = createBottomTabNavigator();


const SuperAdminTabNavigator = () => {
    const { user } = useAuth();
    const token = user?.accessToken;

  return (
    <Tab.Navigator
      tabBar={(props) => (
        <ScrollableTabBar
          {...props}
          theme={{
            primaryColor: TEACHER_THEME.colors.primary.main,
            backgroundColor: TEACHER_THEME.colors.background.secondary,
            inactiveColor: TEACHER_THEME.colors.text.muted,
            borderColor: TEACHER_THEME.colors.border,
          }}
          role="SuperAdmin"
          token={token}
        />
      )}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Schools"
        component={SchoolsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="school" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Invitations"
        component={InvitationsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="mail" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="RoleMatrix"
        component={RoleMatrixScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="key" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Logs"
        component={LogsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default SuperAdminTabNavigator;
