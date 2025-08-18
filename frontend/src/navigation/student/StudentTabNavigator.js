import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import { useRole } from '../../context/RoleContext';
import { useTenant } from '../../context/TenantContext';
import { getRoleColors } from '../../constants/theme';

import ScrollableTabBar from '../../components/navigation/ScrollableTabBar';
import StudentDashboard from '../../screens/Student/Dashboard';
import StudentAssignments from '../../screens/Student/StudentAssignments';
import StudentGrades from '../../screens/Student/Grades';
import StudentAnnouncements from '../../screens/Student/Announcements';
import StudentAttendance from '../../screens/Student/Attendance';
import PermissionGuard from '../guards/PermissionGuard';
import RoleService from '../../services/RoleService';
import StudentSettings from '../../screens/Student/Settings';
import StudentClassDetails from '../../screens/Student/StudentClassDetails';
import StudentMyClasses from '../../screens/Student/MyClasses';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Assignment Tab: Use StudentAssignments directly for now
const MyClassesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MyClassesHome" component={StudentMyClasses} />
    <Stack.Screen name="StudentClassDetails" component={StudentClassDetails} />
  </Stack.Navigator>
);

// Grades Stack (for future extensibility)
const Grades = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="StudentGrades" component={StudentGrades} />
    {/* Add more grades-related screens here if needed */}
  </Stack.Navigator>
);

// Announcements Stack (for future extensibility)
const Announcements = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen
      name="StudentAnnouncements"
      component={StudentAnnouncements}
    />
    {/* Add more announcement-related screens here if needed */}
  </Stack.Navigator>
);

// Attendance Stack (for future extensibility)
const Attendance = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="StudentAttendance" component={StudentAttendance} />
  </Stack.Navigator>
);

const StudentTabNavigator = () => {
  const { roleTheme } = useRole();
  const { tenantBranding } = useTenant();
  const roleColors = getRoleColors('Student');
  const primaryColor =
    roleTheme?.primary ||
    tenantBranding?.primaryColor ||
    roleColors.primary ||
    '#3498DB';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Dashboard"
      tabBar={(props) => (
        <ScrollableTabBar
          {...props}
          role="Student"
          theme={{
            primaryColor,
            backgroundColor: '#FFFFFF',
            surfaceColor: '#F8FAFC',
            textColor: '#1A1A1A',
            inactiveColor: '#8E8E93',
            borderColor: '#E5E5E5',
          }}
          config={{
            height: 60,
            tabWidth: 100,
            spacing: 2,
            borderRadius: 8,
            iconSize: { focused: 22, unfocused: 20 },
            fontSize: { focused: 10, unfocused: 9 },
          }}
          badges={{
            AssignmentStack: { count: 3, color: '#F39C12', pulse: true },
            GradesStack: { count: 1, color: '#27AE60', pulse: false },
          }}
          enableAnimations={true}
          enableHaptics={true}
        />
      )}
    >
      <Tab.Screen
        name="Dashboard"
        component={StudentDashboard}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="MyClasses"
        component={MyClassesStack}
        options={{ title: 'My Classes' }}
      />
      <Tab.Screen
        name="Assignment"
        component={StudentAssignments}
        options={{ title: 'Assignments' }}
      />
      <Tab.Screen
        name="Grades"
        component={Grades}
        options={{ title: 'Grades' }}
      />
      <Tab.Screen
        name="Announcements"
        component={Announcements}
        options={{ title: 'News' }}
      />
      <Tab.Screen
        name="Attendance"
        component={Attendance}
        options={{ title: 'Attendance' }}
      />
      <Tab.Screen
        name="Settings"
        component={StudentSettings}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

export default StudentTabNavigator;
