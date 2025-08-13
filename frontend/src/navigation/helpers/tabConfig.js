// ✅ Centralized Tab Configuration for All Roles

export const TAB_CONFIGS = {
  // 🎓 STUDENT TAB CONFIG
  STUDENT: {
    'Dashboard': {
      label: 'Home',
      activeIcon: 'home',
      inactiveIcon: 'home-outline',
      hasNotification: false,
      badge: null,
      order: 1,
    },
    'Assignments': {
      label: 'Tasks',
      activeIcon: 'document-text',
      inactiveIcon: 'document-text-outline',
      hasNotification: true,
      badge: 3, // 3 pending assignments
      order: 2,
    },
    'Grades': {
      label: 'Grades',
      activeIcon: 'school',
      inactiveIcon: 'school-outline',
      hasNotification: false,
      badge: null,
      order: 3,
    },
    'Announcements': {
      label: 'News',
      activeIcon: 'megaphone',
      inactiveIcon: 'megaphone-outline',
      hasNotification: true,
      badge: 2,
      order: 4,
    },
    'Attendance': {
      label: 'Attendance',
      activeIcon: 'calendar',
      inactiveIcon: 'calendar-outline',
      hasNotification: false,
      badge: null,
      order: 5,
    },
    'Library': {
      label: 'Library',
      activeIcon: 'library',
      inactiveIcon: 'library-outline',
      hasNotification: false,
      badge: null,
      order: 6,
    },
    'Profile': {
      label: 'Profile',
      activeIcon: 'person',
      inactiveIcon: 'person-outline',
      hasNotification: false,
      badge: null,
      order: 7,
    },
  },

  // 👨‍🏫 TEACHER TAB CONFIG
  TEACHER: {
    'TeacherDashboard': {
      label: 'Home',
      activeIcon: 'home',
      inactiveIcon: 'home-outline',
      hasNotification: false,
      badge: null,
      order: 1,
    },
    'MyClasses': {
      label: 'Classes',
      activeIcon: 'school',
      inactiveIcon: 'school-outline',
      hasNotification: false,
      badge: null,
      order: 2,
    },
    'TeacherAssignments': {
      label: 'Assignments',
      activeIcon: 'document-text',
      inactiveIcon: 'document-text-outline',
      hasNotification: true,
      badge: 12, // 12 submissions to grade
      order: 3,
    },
    'GradingDashboard': {
      label: 'Grading',
      activeIcon: 'star',
      inactiveIcon: 'star-outline',
      hasNotification: true,
      badge: 8,
      order: 4,
    },
    'AttendanceTracker': {
      label: 'Attendance',
      activeIcon: 'checkmark-circle',
      inactiveIcon: 'checkmark-circle-outline',
      hasNotification: false,
      badge: null,
      order: 5,
    },
    'TeacherAnnouncements': {
      label: 'Announce',
      activeIcon: 'megaphone',
      inactiveIcon: 'megaphone-outline',
      hasNotification: false,
      badge: null,
      order: 6,
    },
  },

  // 👨‍👩‍👧‍👦 PARENT TAB CONFIG
  PARENT: {
    'ParentDashboard': {
      label: 'Home',
      activeIcon: 'home',
      inactiveIcon: 'home-outline',
      hasNotification: false,
      badge: null,
      order: 1,
    },
    'Children': {
      label: 'Children',
      activeIcon: 'people',
      inactiveIcon: 'people-outline',
      hasNotification: true,
      badge: 1,
      order: 2,
    },
    'ChildGrades': {
      label: 'Grades',
      activeIcon: 'school',
      inactiveIcon: 'school-outline',
      hasNotification: false,
      badge: null,
      order: 3,
    },
    'ChildAttendance': {
      label: 'Attendance',
      activeIcon: 'calendar',
      inactiveIcon: 'calendar-outline',
      hasNotification: false,
      badge: null,
      order: 4,
    },
    'Payments': {
      label: 'Payments',
      activeIcon: 'card',
      inactiveIcon: 'card-outline',
      hasNotification: true,
      badge: 1,
      order: 5,
    },
    'ParentMessages': {
      label: 'Messages',
      activeIcon: 'chatbubbles',
      inactiveIcon: 'chatbubbles-outline',
      hasNotification: true,
      badge: 5,
      order: 6,
    },
  },

  // 👑 ADMIN TAB CONFIG
  ADMIN: {
    'AdminDashboard': {
      label: 'Dashboard',
      activeIcon: 'speedometer',
      inactiveIcon: 'speedometer-outline',
      hasNotification: false,
      badge: null,
      order: 1,
    },
    'UserManagement': {
      label: 'Users',
      activeIcon: 'people',
      inactiveIcon: 'people-outline',
      hasNotification: true,
      badge: 3,
      order: 2,
    },
    'ClassManagement': {
      label: 'Classes',
      activeIcon: 'school',
      inactiveIcon: 'school-outline',
      hasNotification: false,
      badge: null,
      order: 3,
    },
    'Finance': {
      label: 'Finance',
      activeIcon: 'cash',
      inactiveIcon: 'cash-outline',
      hasNotification: true,
      badge: 5,
      order: 4,
    },
    'Analytics': {
      label: 'Analytics',
      activeIcon: 'bar-chart',
      inactiveIcon: 'bar-chart-outline',
      hasNotification: false,
      badge: null,
      order: 5,
    },
    'Settings': {
      label: 'Settings',
      activeIcon: 'settings',
      inactiveIcon: 'settings-outline',
      hasNotification: false,
      badge: null,
      order: 6,
    },
  },
};

// ✅ Helper function to get tab config by role
export const getTabConfigByRole = (role) => {
  const roleKey = role?.toString().toUpperCase();
  return TAB_CONFIGS[roleKey] || TAB_CONFIGS.TEACHER;
};

// ✅ Helper function to get sorted tabs by order
export const getSortedTabsByRole = (role) => {
  const config = getTabConfigByRole(role);
  return Object.entries(config)
    .sort(([, a], [, b]) => (a.order || 0) - (b.order || 0))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
};

// ✅ Helper function to update badge count
export const updateTabBadge = (role, tabName, badgeCount) => {
  const roleKey = role?.toString().toUpperCase();
  if (TAB_CONFIGS[roleKey] && TAB_CONFIGS[roleKey][tabName]) {
    TAB_CONFIGS[roleKey][tabName].badge = badgeCount > 0 ? badgeCount : null;
    return true;
  }
  return false;
};

// ✅ Helper function to set notification status
export const setTabNotification = (role, tabName, hasNotification) => {
  const roleKey = role?.toString().toUpperCase();
  if (TAB_CONFIGS[roleKey] && TAB_CONFIGS[roleKey][tabName]) {
    TAB_CONFIGS[roleKey][tabName].hasNotification = Boolean(hasNotification);
    return true;
  }
  return false;
};

// ✅ Helper function to get tab count for role
export const getTabCountByRole = (role) => {
  const config = getTabConfigByRole(role);
  return Object.keys(config).length;
};

// ✅ Helper function to validate tab configuration
export const validateTabConfig = (role, tabName) => {
  const config = getTabConfigByRole(role);
  const tab = config[tabName];

  if (!tab) return false;

  return !!(
    tab.label &&
    tab.activeIcon &&
    tab.inactiveIcon &&
    typeof tab.hasNotification === 'boolean'
  );
};

// ✅ Helper function to get all notification tabs
export const getNotificationTabs = (role) => {
  const config = getTabConfigByRole(role);
  return Object.entries(config)
    .filter(([, tab]) => tab.hasNotification || tab.badge)
    .map(([tabName, tab]) => ({
      tabName,
      hasNotification: tab.hasNotification,
      badge: tab.badge,
    }));
};

// ✅ Helper function to clear all notifications for role
export const clearAllNotifications = (role) => {
  const roleKey = role?.toString().toUpperCase();
  if (!TAB_CONFIGS[roleKey]) return false;

  Object.keys(TAB_CONFIGS[roleKey]).forEach(tabName => {
    TAB_CONFIGS[roleKey][tabName].hasNotification = false;
    TAB_CONFIGS[roleKey][tabName].badge = null;
  });

  return true;
};

// ✅ Helper function to get total notification count
export const getTotalNotificationCount = (role) => {
  const config = getTabConfigByRole(role);
  return Object.values(config).reduce((total, tab) => {
    return total + (tab.badge || 0);
  }, 0);
};

// ✅ Export tab names as constants for type safety
export const TAB_NAMES = {
  STUDENT: {
    DASHBOARD: 'Dashboard',
    ASSIGNMENTS: 'Assignments',
    GRADES: 'Grades',
    ANNOUNCEMENTS: 'Announcements',
    ATTENDANCE: 'Attendance',
    LIBRARY: 'Library',
    PROFILE: 'Profile',
  },
  TEACHER: {
    DASHBOARD: 'TeacherDashboard',
    CLASSES: 'MyClasses',
    ASSIGNMENTS: 'TeacherAssignments',
    GRADING: 'GradingDashboard',
  },
  PARENT: {
    DASHBOARD: 'ParentDashboard',
    CHILDREN: 'Children',
    GRADES: 'ChildGrades',
    ATTENDANCE: 'ChildAttendance',
    PAYMENTS: 'Payments',
    MESSAGES: 'ParentMessages',
  },
  ADMIN: {
    DASHBOARD: 'AdminDashboard',
    USERS: 'UserManagement',
    CLASSES: 'ClassManagement',
    FINANCE: 'Finance',
    ANALYTICS: 'Analytics',
    SETTINGS: 'Settings',
  },
};

export default TAB_CONFIGS;
