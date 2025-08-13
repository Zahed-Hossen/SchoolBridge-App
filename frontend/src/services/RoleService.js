import TenantService from './TenantService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';

class RoleService {
  // 👥 Define role hierarchies and permissions
  static ROLES = {
    ADMIN: 'admin',
    TEACHER: 'teacher',
    STUDENT: 'student',
    PARENT: 'parent',
  };

  static PERMISSIONS = {
    // 🔐 Admin permissions
    MANAGE_USERS: 'manage_users',
    MANAGE_CLASSES: 'manage_classes',
    MANAGE_FINANCES: 'manage_finances',
    MANAGE_EXAMS: 'manage_exams',
    MANAGE_EVENTS: 'manage_events',
    VIEW_ANALYTICS: 'view_analytics',
    SYSTEM_SETTINGS: 'system_settings',
    TENANT_MANAGEMENT: 'tenant_management',
    ROLE_ASSIGNMENT: 'role_assignment',
    BULK_OPERATIONS: 'bulk_operations',

    // 📚 Teacher permissions
    MANAGE_ASSIGNMENTS: 'manage_assignments',
    TRACK_ATTENDANCE: 'track_attendance',
    GRADE_STUDENTS: 'grade_students',
    COMMUNICATE_PARENTS: 'communicate_parents',
    ACCESS_RESOURCES: 'access_resources',
    MANAGE_CLASSROOM: 'manage_classroom',
    CREATE_CONTENT: 'create_content',
    VIEW_STUDENT_PERFORMANCE: 'view_student_performance',
    SCHEDULE_MANAGEMENT: 'schedule_management',

    // 🎓 Student permissions
    VIEW_ASSIGNMENTS: 'view_assignments',
    VIEW_GRADES: 'view_grades',
    VIEW_ATTENDANCE: 'view_attendance',
    ACCESS_LIBRARY: 'access_library',
    VIEW_ANNOUNCEMENTS: 'view_announcements',
    TAKE_EXAMS: 'take_exams',
    SUBMIT_ASSIGNMENTS: 'submit_assignments',
    VIEW_SCHEDULE: 'view_schedule',
    ACCESS_RESOURCES: 'access_student_resources',

    // 👨‍👩‍👧‍👦 Parent permissions
    VIEW_CHILD_GRADES: 'view_child_grades',
    VIEW_CHILD_ATTENDANCE: 'view_child_attendance',
    MAKE_PAYMENTS: 'make_payments',
    VIEW_FEES: 'view_fees',
    COMMUNICATE_TEACHERS: 'communicate_teachers',
    VIEW_CHILD_PERFORMANCE: 'view_child_performance',
    VIEW_CHILD_SCHEDULE: 'view_child_schedule',
    ACCESS_PARENT_PORTAL: 'access_parent_portal',
  };

  // 🎯 Role metadata with display information
  static ROLE_METADATA = {
    [this.ROLES.ADMIN]: {
      displayName: 'Administrator',
      description: 'Full system access and management',
      icon: '�‍💼',
      color: '#9B59B6',
      priority: 1,
      features: ['userManagement', 'analytics', 'systemSettings', 'finance'],
    },
    [this.ROLES.TEACHER]: {
      displayName: 'Teacher',
      description: 'Classroom and student management',
      icon: '👩‍🏫',
      color: '#E74C3C',
      priority: 2,
      features: ['classManagement', 'grading', 'attendance', 'communication'],
    },
    [this.ROLES.STUDENT]: {
      displayName: 'Student',
      description: 'Access to courses and assignments',
      icon: '🎓',
      color: '#3498DB',
      priority: 3,
      features: ['assignments', 'grades', 'schedule', 'library'],
    },
    [this.ROLES.PARENT]: {
      displayName: 'Parent',
      description: "Monitor child's progress",
      icon: '👨‍👩‍👧‍👦',
      color: '#F39C12',
      priority: 4,
      features: ['childProgress', 'communication', 'payments', 'attendance'],
    },
  };

  // �🔐 Role-permission mapping with tenant-aware permissions
  static getRolePermissions(role, tenantFeatures = {}) {
    // ✅ Handle different role formats
    const normalizedRole = typeof role === 'string' ? role.toLowerCase() : '';

    const basePermissions = {
      // ✅ Support both 'student' and 'Student' formats
      student: [
        this.PERMISSIONS.VIEW_ASSIGNMENTS,
        this.PERMISSIONS.VIEW_GRADES,
        this.PERMISSIONS.VIEW_ATTENDANCE,
        this.PERMISSIONS.ACCESS_LIBRARY,
        this.PERMISSIONS.VIEW_ANNOUNCEMENTS,
        this.PERMISSIONS.TAKE_EXAMS,
        this.PERMISSIONS.SUBMIT_ASSIGNMENTS,
        this.PERMISSIONS.VIEW_SCHEDULE,
        this.PERMISSIONS.ACCESS_RESOURCES,
      ],
      teacher: [
        this.PERMISSIONS.MANAGE_ASSIGNMENTS,
        this.PERMISSIONS.TRACK_ATTENDANCE,
        this.PERMISSIONS.GRADE_STUDENTS,
        this.PERMISSIONS.COMMUNICATE_PARENTS,
        this.PERMISSIONS.MANAGE_CLASSROOM,
        this.PERMISSIONS.CREATE_CONTENT,
        this.PERMISSIONS.VIEW_STUDENT_PERFORMANCE,
        this.PERMISSIONS.SCHEDULE_MANAGEMENT,
        this.PERMISSIONS.VIEW_ASSIGNMENTS,
        this.PERMISSIONS.VIEW_GRADES,
        this.PERMISSIONS.VIEW_ATTENDANCE,
        this.PERMISSIONS.ACCESS_LIBRARY,
      ],
      parent: [
        this.PERMISSIONS.VIEW_CHILD_GRADES,
        this.PERMISSIONS.VIEW_CHILD_ATTENDANCE,
        this.PERMISSIONS.MAKE_PAYMENTS,
        this.PERMISSIONS.VIEW_FEES,
        this.PERMISSIONS.COMMUNICATE_TEACHERS,
        this.PERMISSIONS.VIEW_CHILD_PERFORMANCE,
        this.PERMISSIONS.VIEW_CHILD_SCHEDULE,
        this.PERMISSIONS.ACCESS_PARENT_PORTAL,
      ],
      admin: [
        ...Object.values(this.PERMISSIONS), // Admin gets all permissions
      ],
    };

    let permissions = basePermissions[normalizedRole] || [];

    // ✅ Add tenant-specific permissions based on enabled features
    if (tenantFeatures?.advancedAnalytics) {
      if (normalizedRole === 'admin' || normalizedRole === 'teacher') {
        permissions.push('advanced_analytics');
      }
    }

    if (tenantFeatures?.iotIntegration) {
      if (normalizedRole === 'admin') {
        permissions.push('iot_management');
      }
      if (normalizedRole === 'teacher') {
        permissions.push('iot_classroom_control');
      }
    }

    if (tenantFeatures?.resourceSharing && normalizedRole === 'teacher') {
      permissions.push('inter_school_sharing');
    }

    console.log(`🔑 Permissions for ${role}:`, permissions);
    return permissions;
  }

  // ✅ Update hasPermission method with better role handling
  static hasPermission(userRole, requiredPermission, tenantFeatures = {}) {
    if (!userRole || !requiredPermission) return false;

    const rolePermissions = this.getRolePermissions(userRole, tenantFeatures);
    const hasPermission = rolePermissions.includes(requiredPermission);

    console.log(
      `🔍 Permission check: ${userRole} -> ${requiredPermission} = ${hasPermission}`,
    );
    return hasPermission;
  }

  // 🔍 Check if role has higher priority than another (for access control)
  static hasHigherPriority(role1, role2) {
    const priority1 = this.ROLE_METADATA[role1]?.priority || 999;
    const priority2 = this.ROLE_METADATA[role2]?.priority || 999;
    return priority1 < priority2; // Lower number = higher priority
  }

  // 🎯 Get role-based navigation structure with tenant-aware features
  static getRoleNavigation(role, tenantFeatures = {}) {
    const normalizedRole = typeof role === 'string' ? role.toLowerCase() : '';
    const baseNavigation = {
      admin: [
        {
          name: 'Dashboard',
          screen: 'AdminDashboard',
          icon: '📊',
          category: 'main',
        },
        {
          name: 'User Management',
          screen: 'AdminUserManagement',
          icon: '👥',
          category: 'management',
        },
        {
          name: 'Class Management',
          screen: 'AdminClassManagement',
          icon: '🏫',
          category: 'management',
        },
        {
          name: 'Finance',
          screen: 'AdminFinance',
          icon: '💰',
          category: 'management',
        },
        {
          name: 'Exam Control',
          screen: 'AdminExamControl',
          icon: '📝',
          category: 'academic',
        },
        {
          name: 'Events',
          screen: 'AdminEvent',
          icon: '📅',
          category: 'management',
        },
        {
          name: 'Settings',
          screen: 'AdminSettings',
          icon: '⚙️',
          category: 'system',
        },
      ],
      teacher: [
        {
          name: 'Dashboard',
          screen: 'TeacherDashboard',
          icon: '📚',
          category: 'main',
        },
        {
          name: 'My Classes',
          screen: 'ClassManagement',
          icon: '🏫',
          category: 'teaching',
        },
        {
          name: 'Assignments',
          screen: 'AssignmentHomework',
          icon: '📝',
          category: 'teaching',
        },
        {
          name: 'Attendance',
          screen: 'AttendanceManagement',
          icon: '✅',
          category: 'teaching',
        },
        {
          name: 'Grading',
          screen: 'TeacherGrading',
          icon: '🎯',
          category: 'teaching',
        },
        {
          name: 'Performance',
          screen: 'PerformanceTracking',
          icon: '📈',
          category: 'analytics',
        },
        {
          name: 'Communication',
          screen: 'TeacherCommunication',
          icon: '💬',
          category: 'communication',
        },
        {
          name: 'Resources',
          screen: 'TeacherResources',
          icon: '📖',
          category: 'resources',
        },
        {
          name: 'Schedule',
          screen: 'TeacherSchedule',
          icon: '🗓️',
          category: 'planning',
        },
      ],
      student: [
        {
          name: 'Dashboard',
          screen: 'StudentDashboard',
          icon: '🎓',
          category: 'main',
        },
        {
          name: 'Assignments',
          screen: 'Assignment',
          icon: '📝',
          category: 'academic',
        },
        {
          name: 'Attendance',
          screen: 'Attendance',
          icon: '✅',
          category: 'tracking',
        },
        { name: 'Exams', screen: 'Exam', icon: '📊', category: 'academic' },
        {
          name: 'Grades',
          screen: 'PerformanceAnalysis',
          icon: '🎯',
          category: 'tracking',
        },
        {
          name: 'Library',
          screen: 'Library',
          icon: '📚',
          category: 'resources',
        },
        {
          name: 'Announcements',
          screen: 'Announcement',
          icon: '📢',
          category: 'communication',
        },
        {
          name: 'Profile',
          screen: 'Profile',
          icon: '👤',
          category: 'personal',
        },
      ],
      parent: [
        {
          name: 'Dashboard',
          screen: 'ParentDashboard',
          icon: '👨‍👩‍👧‍👦',
          category: 'main',
        },
        {
          name: 'My Children',
          screen: 'StudentInfo',
          icon: '👤',
          category: 'family',
        },
        {
          name: 'Grades',
          screen: 'GradesChecking',
          icon: '🎯',
          category: 'tracking',
        },
        {
          name: 'Attendance',
          screen: 'AttendanceChecking',
          icon: '✅',
          category: 'tracking',
        },
        {
          name: 'Performance',
          screen: 'PerformanceChecking',
          icon: '📈',
          category: 'tracking',
        },
        { name: 'Fees', screen: 'Fees', icon: '💰', category: 'financial' },
        {
          name: 'Payments',
          screen: 'Payment',
          icon: '💳',
          category: 'financial',
        },
        {
          name: 'Profile',
          screen: 'Profile',
          icon: '⚙️',
          category: 'personal',
        },
      ],
    };

    let navigation = baseNavigation[role] || [];

    // Add tenant-specific navigation items
    if (tenantFeatures?.advancedAnalytics && normalizedRole === 'admin') {
      navigation.push({
        name: 'Analytics',
        screen: 'AdvancedAnalytics',
        icon: '📊',
        category: 'analytics',
        premium: true,
      });
    }

    return navigation;
  }

  // 📱 Get role-specific dashboard widgets
  static getRoleDashboardWidgets(role, tenantFeatures = {}) {
    const normalizedRole = typeof role === 'string' ? role.toLowerCase() : '';
    const dashboardWidgets = {
      admin: [
        {
          id: 'users_overview',
          title: 'Users Overview',
          type: 'stats',
          priority: 1,
        },
        {
          id: 'financial_summary',
          title: 'Financial Summary',
          type: 'chart',
          priority: 2,
        },
        {
          id: 'system_health',
          title: 'System Health',
          type: 'status',
          priority: 3,
        },
        {
          id: 'recent_activities',
          title: 'Recent Activities',
          type: 'list',
          priority: 4,
        },
      ],
      teacher: [
        { id: 'my_classes', title: 'My Classes', type: 'grid', priority: 1 },
        {
          id: 'pending_grading',
          title: 'Pending Grading',
          type: 'list',
          priority: 2,
        },
        {
          id: 'upcoming_classes',
          title: "Today's Schedule",
          type: 'timeline',
          priority: 3,
        },
        {
          id: 'student_performance',
          title: 'Student Performance',
          type: 'chart',
          priority: 4,
        },
      ],
      student: [
        {
          id: 'upcoming_assignments',
          title: 'Upcoming Assignments',
          type: 'list',
          priority: 1,
        },
        {
          id: 'recent_grades',
          title: 'Recent Grades',
          type: 'stats',
          priority: 2,
        },
        {
          id: 'class_schedule',
          title: "Today's Schedule",
          type: 'timeline',
          priority: 3,
        },
        {
          id: 'announcements',
          title: 'Announcements',
          type: 'feed',
          priority: 4,
        },
      ],
      parent: [
        {
          id: 'children_overview',
          title: 'Children Overview',
          type: 'cards',
          priority: 1,
        },
        {
          id: 'attendance_summary',
          title: 'Attendance Summary',
          type: 'chart',
          priority: 2,
        },
        { id: 'fee_status', title: 'Fee Status', type: 'stats', priority: 3 },
        {
          id: 'recent_communications',
          title: 'Communications',
          type: 'feed',
          priority: 4,
        },
      ],
    };

    let widgets = dashboardWidgets[role] || [];

    // Add tenant-specific widgets
    if (tenantFeatures?.iotIntegration && normalizedRole === 'admin') {
      widgets.push({
        id: 'iot_devices',
        title: 'IoT Devices',
        type: 'status',
        priority: 5,
        premium: true,
      });
    }

    return widgets.sort((a, b) => a.priority - b.priority);
  }

  // 🎨 Get role-specific theme colors
// ✅ Update getRoleTheme method
static getRoleTheme(role) {
  const normalizedRole = typeof role === 'string' ? role.toLowerCase() : '';

  const themeMap = {
    'admin': { primary: '#9B59B6', secondary: '#8E44AD' },
    'teacher': { primary: '#E74C3C', secondary: '#C0392B' },
    'student': { primary: '#3498DB', secondary: '#2980B9' },
    'parent': { primary: '#F39C12', secondary: '#E67E22' },
  };

  return themeMap[normalizedRole] || { primary: '#667eea', secondary: '#764ba2' };
}

  // 🔍 Validate role assignment
  static validateRoleAssignment(userRole, targetRole, targetUserId) {
    // Admin can assign any role
    if (userRole === this.ROLES.ADMIN) {
      return { valid: true };
    }

    // Teachers can only assign student roles and only to their students
    if (userRole === this.ROLES.TEACHER && targetRole === this.ROLES.STUDENT) {
      return { valid: true, requiresStudentVerification: true };
    }

    // Parents can only manage their children
    if (userRole === this.ROLES.PARENT && targetRole === this.ROLES.STUDENT) {
      return { valid: true, requiresParentVerification: true };
    }

    return {
      valid: false,
      error: `${userRole} cannot assign ${targetRole} role`,
    };
  }

  // 💾 Store user role with validation
  static async storeUserRole(role, userId = null) {
    try {
      if (!Object.values(this.ROLES).includes(role)) {
        throw new Error(`Invalid role: ${role}`);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, role);

      if (userId) {
        await AsyncStorage.setItem('currentUserId', userId);
      }

      console.log(`✅ Role stored: ${role}`);
      return { success: true, role };
    } catch (error) {
      console.error('❌ Failed to store role:', error);
      return { success: false, error: error.message };
    }
  }

  // 📖 Get stored user role
  static async getStoredUserRole() {
    try {
      const role = await AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE);
      console.log(`📖 Retrieved role: ${role}`);
      return role;
    } catch (error) {
      console.error('❌ Failed to get stored role:', error);
      return null;
    }
  }

  // 🔧 Get role-based feature access
  static getFeatureAccess(role, feature, tenantFeatures = {}) {
    const roleFeatures = this.ROLE_METADATA[role]?.features || [];
    const hasRoleAccess = roleFeatures.includes(feature);
    const tenantAllows = tenantFeatures[feature] !== false;

    return {
      hasAccess: hasRoleAccess && tenantAllows,
      reason: !hasRoleAccess
        ? 'Role not authorized'
        : !tenantAllows
        ? 'Feature disabled by tenant'
        : null,
    };
  }

  // 🎯 Get contextual permissions (tenant + role based)
  static getContextualPermissions(role) {
    const tenantFeatures = TenantService.getTenantFeatures();
    return this.getRolePermissions(role, tenantFeatures);
  }

  // 🔍 Debug role information
  static debugRoleInfo(role) {
    const tenantFeatures = TenantService.getTenantFeatures();
    const info = {
      role,
      metadata: this.ROLE_METADATA[role],
      permissions: this.getRolePermissions(role, tenantFeatures),
      navigation: this.getRoleNavigation(role, tenantFeatures),
      dashboardWidgets: this.getRoleDashboardWidgets(role, tenantFeatures),
      theme: this.getRoleTheme(role),
      tenantFeatures,
    };

    console.log('🔍 Role Debug Info:', info);
    return info;
  }
}

export default RoleService;
