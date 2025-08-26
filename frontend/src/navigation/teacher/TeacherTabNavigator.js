import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import ScrollableTabBar from '../../components/navigation/ScrollableTabBar';
import TeacherDashboard from '../../screens/Teacher/Dashboard';
import MyClasses from '../../screens/Teacher/Class/MyClasses';
import TeacherAssignments from '../../screens/Teacher/Assignment/TeacherAssignments';
import GradingDashboard from '../../screens/Teacher/Grade/GradingDashboard';
import GradeBook from '../../screens/Teacher/Grade/GradeBook';
import Analytics from '../../screens/Teacher/Analytics';
import Settings from '../../screens/Teacher/Settings';
import Reports from '../../screens/Teacher/Reports';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const GradingStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="GradingDashboard" component={GradingDashboard} />
    <Stack.Screen name="GradeBook" component={GradeBook} />
  </Stack.Navigator>
);

const AssignmentStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TeacherAssignments" component={TeacherAssignments} />
    {/* Add more assignment-related screens here when needed */}
  </Stack.Navigator>
);

// StudentProfile was previously incorrectly placed here. It should be a Tab.Screen for direct access.

const TeacherTabNavigator = () => {
  console.log('👩‍🏫 Loading Teacher Navigator');

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="TeacherDashboard"
      tabBar={(props) => (
        <ScrollableTabBar
          {...props}
          theme={{
            primaryColor: '#2E7D8F',
            backgroundColor: '#FFFFFF',
            surfaceColor: '#EBF4F6',
            textColor: '#1A1A1A',
            inactiveColor: '#718096',
            borderColor: '#E9ECEF',
          }}
          config={{
            height: 64,
            tabWidth: 100,
            spacing: 2,
            borderRadius: 8,
            iconSize: { focused: 22, unfocused: 20 },
            fontSize: { focused: 10, unfocused: 9 },
          }}
          badges={{
            AssignmentStack: { count: 12, color: '#E67E22', pulse: true },
            GradingStack: { count: 8, color: '#F39C12', pulse: false },
            Analytics: { count: 3, color: '#9B59B6', pulse: false },
          }}
          enableAnimations={true}
          enableHaptics={true}
        />
      )}
    >
      <Tab.Screen
        name="TeacherDashboard"
        component={TeacherDashboard}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="MyClasses"
        component={MyClasses}
        options={{ title: 'Classes' }}
      />
      <Tab.Screen
        name="AssignmentStack"
        component={AssignmentStack}
        options={{ title: 'Tasks' }}
      />

      <Tab.Screen
        name="GradingStack"
        component={GradingStack}
        options={{ title: 'Grading' }}
      />
      <Tab.Screen
        name="Analytics"
        component={Analytics}
        options={{ title: 'Analytics' }}
      />
      <Tab.Screen
        name="Reports"
        component={Reports}
        options={{ title: 'Reports' }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{ title: 'Settings' }}
      />

      {/* Student Profile Tab (for direct access) */}
    </Tab.Navigator>
  );
};

export default TeacherTabNavigator;
