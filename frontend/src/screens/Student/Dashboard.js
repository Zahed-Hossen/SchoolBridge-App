import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import PlaceholderScreen from '../../components/PlaceholderScreen';
import AppHeader from '../../components/navigation/AppHeader';

const Tab = createBottomTabNavigator();

const AnnouncementTab = (props) => (
  <PlaceholderScreen
    {...props}
    title="Announcements"
    icon="megaphone-outline"
  />
);
const AssignmentTab = (props) => (
  <PlaceholderScreen
    {...props}
    title="Assignments"
    icon="document-text-outline"
  />
);
const AttendanceTab = (props) => (
  <PlaceholderScreen {...props} title="Attendance" icon="calendar-outline" />
);
const GradesTab = (props) => (
  <PlaceholderScreen {...props} title="Grades" icon="school-outline" />
);
const MyClassTab = (props) => (
  <PlaceholderScreen {...props} title="My Class" icon="people-outline" />
);
const SettingsTab = (props) => (
  <PlaceholderScreen {...props} title="Settings" icon="settings-outline" />
);

const StudentDashboard = () => {
  return (
    <>
      <AppHeader
        title="Student Dashboard"
        subtitle="Welcome back, Student!"
        userRole="Student"
      />
      <Tab.Navigator
        initialRouteName="AnnouncementTab"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            let iconName;
            switch (route.name) {
              case 'AnnouncementTab':
                iconName = 'megaphone-outline';
                break;
              case 'AssignmentTab':
                iconName = 'document-text-outline';
                break;
              case 'AttendanceTab':
                iconName = 'calendar-outline';
                break;
              case 'GradesTab':
                iconName = 'school-outline';
                break;
              case 'MyClassTab':
                iconName = 'people-outline';
                break;
              case 'SettingsTab':
                iconName = 'settings-outline';
                break;
              default:
                iconName = 'ellipse-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="AnnouncementTab"
          component={AnnouncementTab}
          options={{ title: 'Announcements' }}
        />
        <Tab.Screen
          name="AssignmentTab"
          component={AssignmentTab}
          options={{ title: 'Assignments' }}
        />
        <Tab.Screen
          name="AttendanceTab"
          component={AttendanceTab}
          options={{ title: 'Attendance' }}
        />
        <Tab.Screen
          name="GradesTab"
          component={GradesTab}
          options={{ title: 'Grades' }}
        />
        <Tab.Screen
          name="MyClassTab"
          component={MyClassTab}
          options={{ title: 'My Class' }}
        />
        <Tab.Screen
          name="SettingsTab"
          component={SettingsTab}
          options={{ title: 'Settings' }}
        />
      </Tab.Navigator>
    </>
  );
};

export default StudentDashboard;
