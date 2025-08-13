import { Ionicons } from '@expo/vector-icons';
import { getTabConfigByRole } from './tabConfig';

// ✅ Efficient function that works with specific role
export const getTabBarIcon = (routeName, focused, color, size, role = 'student') => {
  // Get configuration for specific role only
  const config = getTabConfigByRole(role);

  if (config[routeName]) {
    const iconName = focused ? config[routeName].activeIcon : config[routeName].inactiveIcon;
    return <Ionicons name={iconName} size={size} color={color} />;
  }

  // Fallback to default icons if not found in config
  return <Ionicons name="help-outline" size={size} color={color} />;
};

// ✅ Get just the icon name (for use in custom tab bars)
export const getTabIconName = (routeName, focused, role = 'student') => {
  const config = getTabConfigByRole(role);

  if (config[routeName]) {
    return focused ? config[routeName].activeIcon : config[routeName].inactiveIcon;
  }

  // ✅ ADD: Fallback icon mapping for teacher tabs
  const fallbackIcons = {
    TeacherDashboard: focused ? 'home' : 'home-outline',
    MyClasses: focused ? 'people' : 'people-outline',
    TeacherAssignments: focused ? 'document-text' : 'document-text-outline',
    GradingDashboard: focused ? 'checkmark-circle' : 'checkmark-circle-outline',
  };

  return fallbackIcons[routeName] || 'help-outline';
};

// ✅ Get tab label
export const getTabLabel = (routeName, role = 'student') => {
  const config = getTabConfigByRole(role);

  if (config[routeName]) {
    return config[routeName].label;
  }

  // ✅ ADD: Fallback labels for teacher tabs
  const fallbackLabels = {
    TeacherDashboard: 'Home',
    MyClasses: 'Classes',
    TeacherAssignments: 'Assignments',
    GradingDashboard: 'Grading',
  };

  return fallbackLabels[routeName] || routeName;
};

// ✅ Get tab badge
export const getTabBadge = (routeName, role = 'student') => {
  const config = getTabConfigByRole(role);
  return config[routeName]?.badge || null;
};

// ✅ Check if tab has notifications
export const hasTabNotification = (routeName, role = 'student') => {
  const config = getTabConfigByRole(role);
  return config[routeName]?.hasNotification || false;
};

// ✅ Legacy function for backward compatibility (DEPRECATED)
export const getTabBarIconLegacy = (routeName, focused, color, size) => {
  console.warn('getTabBarIconLegacy is deprecated. Use getTabBarIcon with role parameter instead.');

  // Fallback mapping for legacy usage
  const iconMap = {
    // Student Icons
    'Dashboard': focused ? 'home' : 'home-outline',
    'Assignments': focused ? 'document-text' : 'document-text-outline',
    'Grades': focused ? 'school' : 'school-outline',
    'Announcements': focused ? 'megaphone' : 'megaphone-outline',
    'Attendance': focused ? 'calendar' : 'calendar-outline',
    'Library': focused ? 'library' : 'library-outline',
    'Profile': focused ? 'person' : 'person-outline',

    // Teacher Icons
    'TeacherDashboard': focused ? 'home' : 'home-outline',
    'MyClasses': focused ? 'school' : 'school-outline',
    'TeacherAssignments': focused ? 'document-text' : 'document-text-outline',
    'GradingDashboard': focused ? 'star' : 'star-outline',

    // Parent Icons
    'ParentDashboard': focused ? 'home' : 'home-outline',
    'Children': focused ? 'people' : 'people-outline',
    'ChildGrades': focused ? 'school' : 'school-outline',
    'ChildAttendance': focused ? 'calendar' : 'calendar-outline',
    'Payments': focused ? 'card' : 'card-outline',

    // Admin Icons
    'AdminDashboard': focused ? 'speedometer' : 'speedometer-outline',
    'UserManagement': focused ? 'people' : 'people-outline',
    'ClassManagement': focused ? 'school' : 'school-outline',
    'Finance': focused ? 'cash' : 'cash-outline',
    'Analytics': focused ? 'bar-chart' : 'bar-chart-outline',
    'Settings': focused ? 'settings' : 'settings-outline',
  };

  return <Ionicons name={iconMap[routeName] || 'help-outline'} size={size} color={color} />;
};

export default getTabBarIcon;
