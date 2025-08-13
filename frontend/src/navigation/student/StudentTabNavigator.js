import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useRole } from '../../context/RoleContext';
import { useTenant } from '../../context/TenantContext';
import { getTabBarIcon } from '../helpers/tabBarIcons';

// Import Student Screens
import StudentDashboard from '../../screens/Student/Dashboard';
import StudentAssignments from '../../screens/Student/Assignments';
import StudentGrades from '../../screens/Student/Grades';
import StudentAnnouncements from '../../screens/Student/Announcements';
import PlaceholderScreen from '../../components/PlaceholderScreen';

// Import Guards
import PermissionGuard from '../guards/PermissionGuard';
import FeatureGuard from '../guards/FeatureGuard';
import RoleService from '../../services/RoleService';

const Tab = createBottomTabNavigator();

const StudentTabNavigator = () => {
  const { roleTheme } = useRole();
  const { tenantBranding } = useTenant();

  const primaryColor = roleTheme?.primary || tenantBranding?.primaryColor || '#3498DB';

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
        headerStyle: {
          backgroundColor: primaryColor
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      {/* ✅ Dashboard - Always Available */}
      <Tab.Screen
        name="Dashboard"
        component={StudentDashboard}
        options={{
          title: '🎓 Home',
          headerShown: false
        }}
      />

      {/* ✅ Assignments - With Permission Guard */}
      <Tab.Screen
        name="Assignments"
        options={{ title: '📝 Assignments' }}
      >
        {() => (
          <PermissionGuard requiredPermission={RoleService.PERMISSIONS.VIEW_ASSIGNMENTS}>
            <StudentAssignments />
          </PermissionGuard>
        )}
      </Tab.Screen>

      {/* ✅ Grades - With Permission Guard */}
      <Tab.Screen
        name="Grades"
        options={{ title: '📊 Grades' }}
      >
        {() => (
          <PermissionGuard requiredPermission={RoleService.PERMISSIONS.VIEW_GRADES}>
            <StudentGrades />
          </PermissionGuard>
        )}
      </Tab.Screen>

      {/* ✅ NEW: Announcements Tab - Always Available */}
      <Tab.Screen
        name="Announcements"
        component={StudentAnnouncements}
        options={{
          title: '📢 News'
        }}
      />

      {/* ✅ Attendance - With Permission Guard */}
      <Tab.Screen
        name="Attendance"
        options={{ title: '📅 Attendance' }}
      >
        {() => (
          <PermissionGuard requiredPermission={RoleService.PERMISSIONS.VIEW_ATTENDANCE}>
            <PlaceholderScreen
              title="📅 Student Attendance"
              subtitle="Track your attendance record"
              features={[
                'View attendance percentage',
                'See subject-wise attendance',
                'View attendance history',
                'Get attendance alerts'
              ]}
            />
          </PermissionGuard>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default StudentTabNavigator;
