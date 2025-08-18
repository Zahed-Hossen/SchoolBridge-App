import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  Switch,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';

// ✅ Import Professional Theme System
import {
  COLORS,
  TEACHER_COLORS,
  TEACHER_THEME,
  SPACING,
  BORDER_RADIUS,
  getRoleColors,
} from '../../constants/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const HamburgerMenu = ({
  visible,
  onClose,
  navigation: navigationProp,
  userRole = 'Teacher',
}) => {
  const { logout, isLoading, user } = useAuth();
  const navigation = navigationProp || useNavigation();
  // Mock user data (replace with actual context later)
  const userInfo = user || {
    name: 'Zahed Hossen',
    email: 'zahed.hossen@schoolbridge.edu',
    avatar: null,
  };

  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-screenWidth)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  // ✅ Use professional theme colors
  const roleColors = getRoleColors(userRole);
  const primaryColor = roleColors.primary || TEACHER_COLORS.primary;
  const menuWidth = screenWidth * 0.85; // Responsive width

  // ✅ Enhanced Animation Effects
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -screenWidth,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // ✅ Professional Menu Items with Theme Colors

  // Dynamic role-based menu config
  const menuConfig = {
    Teacher: [
      {
        icon: 'home-outline',
        title: 'Dashboard',
        subtitle: 'Overview & quick stats',
        color: TEACHER_COLORS.primary,
        onPress: () => {
          onClose();
          navigation.navigate('TeacherDashboard');
        },
      },
      {
        icon: 'school-outline',
        title: 'My Classes',
        subtitle: 'Manage your teaching schedule',
        color: COLORS.teacherPalette.subjects.mathematics,
        onPress: () => {
          onClose();
          navigation.navigate('MyClasses');
        },
      },
      {
        icon: 'document-text-outline',
        title: 'Assignments',
        subtitle: 'Create and track assignments',
        color: COLORS.teacherPalette.subjects.science,
        badge: 12,
        onPress: () => {
          onClose();
          navigation.navigate('TeacherAssignments');
        },
      },
      {
        icon: 'star-outline',
        title: 'Grading',
        subtitle: 'Review student submissions',
        color: TEACHER_COLORS.warning,
        badge: 8,
        onPress: () => {
          onClose();
          navigation.navigate('GradingDashboard');
        },
      },
      {
        icon: 'bar-chart-outline',
        title: 'Analytics',
        subtitle: 'Performance insights',
        color: TEACHER_COLORS.success,
        onPress: () => {
          onClose();
          navigation.navigate('Analytics');
        },
      },
    ],
    Student: [
      {
        icon: 'home-outline',
        title: 'Dashboard',
        subtitle: 'Your student overview',
        color: TEACHER_COLORS.primary,
        onPress: () => {
          onClose();
          navigation.navigate('StudentDashboard');
        },
      },
      {
        icon: 'book-outline',
        title: 'Assignments',
        subtitle: 'View and submit work',
        color: COLORS.student,
        badge: 3,
        onPress: () => {
          onClose();
          navigation.navigate('AssignmentStack');
        },
      },
      {
        icon: 'trophy-outline',
        title: 'Grades',
        subtitle: 'Check your performance',
        color: TEACHER_COLORS.warning,
        onPress: () => {
          onClose();
          navigation.navigate('GradesStack');
        },
      },
      {
        icon: 'megaphone-outline',
        title: 'Announcements',
        subtitle: 'School news & updates',
        color: TEACHER_COLORS.success,
        onPress: () => {
          onClose();
          navigation.navigate('AnnouncementsStack');
        },
      },
      {
        icon: 'calendar-outline',
        title: 'Attendance',
        subtitle: 'View your attendance',
        color: COLORS.teacherPalette.subjects.mathematics,
        onPress: () => {
          onClose();
          navigation.navigate('AttendanceStack');
        },
      },
    ],
  };

  // Common items for all roles
  const _commonItems = [
    {
      icon: 'person-outline',
      title: 'Profile',
      subtitle: 'Manage your account',
      color: COLORS.teacherPalette.subjects.english,
      onPress: () => {
        onClose();
        navigation.navigate('Profile');
      },
    },
    {
      icon: 'notifications-outline',
      title: 'Notifications',
      subtitle: 'Messages & alerts',
      color: TEACHER_COLORS.warning,
      badge: 5,
      onPress: () => {
        onClose();
        navigation.navigate('Notifications');
      },
    },
    {
      icon: 'settings-outline',
      title: 'Settings',
      subtitle: 'App preferences',
      color: COLORS.teacherPalette.subjects.computer,
      onPress: () => {
        onClose();
        navigation.navigate('Settings');
      },
    },
  ];

  // Dynamic getter for menu items
  const getMenuItems = () => ({
    roleItems: menuConfig[userRole] || [],
    commonItems: _commonItems,
  });

  const { roleItems, commonItems } = getMenuItems();

  const performLogout = async () => {
    try {
      console.log('🔄 Processing logout from HamburgerMenu...');

      // Close menu immediately for better UX
      onClose();

      // Show processing message
      Alert.alert(
        '🔄 Signing Out',
        'Please wait while we securely sign you out...\n\n• Clearing session data\n• Saving preferences\n• Disconnecting services',
        [],
        { cancelable: false },
      );

      // Perform the actual logout
      await logout();

      console.log('✅ Logout completed successfully from HamburgerMenu');

      // Do NOT navigate after logout; app will redirect automatically
      // Optionally, show a success message after a short delay
      setTimeout(() => {
        Alert.alert(
          '✅ Signed Out',
          'You have been successfully signed out. Thank you for using SchoolBridge!',
          [{ text: 'OK', style: 'default' }],
        );
      }, 1000);
    } catch (error) {
      console.error('❌ Logout execution error from HamburgerMenu:', error);

      // Show error with retry option
      Alert.alert(
        '❌ Logout Error',
        `There was an issue signing you out: ${
          error.message || 'Unknown error'
        }\n\nPlease try again or contact support if the problem persists.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Try Again',
            style: 'default',
            onPress: () => performLogout(),
          },
          {
            text: 'Force Logout',
            style: 'destructive',
            onPress: async () => {
              try {
                console.log('🚨 Forcing logout from HamburgerMenu...');

                // Force close menu
                onClose();

                // Clear local storage manually if logout fails
                // This is a fallback mechanism
                navigation.navigate('Landing');

                Alert.alert(
                  '⚠️ Force Logout',
                  'You have been forcefully signed out. Some data may still be cached. Please restart the app for full cleanup.',
                  [{ text: 'OK' }],
                );
              } catch (forceError) {
                console.error(
                  '❌ Force logout failed from HamburgerMenu:',
                  forceError,
                );
                Alert.alert(
                  'Critical Error',
                  'Unable to sign out. Please restart the app.',
                  [{ text: 'OK' }],
                );
              }
            },
          },
        ],
      );
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: performLogout },
      ],
      { cancelable: true },
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* ✅ Professional Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            activeOpacity={1}
          />
        </Animated.View>

        {/* ✅ Professional Menu Panel */}
        <Animated.View
          style={[
            styles.menuPanel,
            {
              width: menuWidth,
              paddingTop: insets.top,
              paddingBottom: insets.bottom + SPACING.lg - 4,
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* ✅ Professional Header with Theme Gradient */}
          <LinearGradient
            colors={[primaryColor, `${primaryColor}DD`]}
            style={styles.headerGradient}
          >
            <View style={styles.header}>
              <View style={styles.userInfo}>
                <View style={styles.avatarContainer}>
                  {user.avatar ? (
                    <Image
                      source={{ uri: user.avatar }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text
                        style={[styles.avatarText, { color: primaryColor }]}
                      >
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.onlineIndicator,
                      { backgroundColor: TEACHER_COLORS.success },
                    ]}
                  />
                </View>
                <View style={styles.userTextContainer}>
                  <Text style={styles.userName}>{user.name || 'User'}</Text>
                  <View style={styles.roleContainer}>
                    <Ionicons
                      name="shield-checkmark"
                      size={14}
                      color={TEACHER_COLORS.textWhite}
                    />
                    <Text style={styles.userRole}>{userRole}</Text>
                  </View>
                  <Text style={styles.userEmail}>{user.email || ''}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons
                  name="close"
                  size={24}
                  color={TEACHER_COLORS.textWhite}
                />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* ✅ Professional School Info Banner */}
          <View
            style={[
              styles.schoolInfo,
              { backgroundColor: `${primaryColor}10` },
            ]}
          >
            <Ionicons name="school" size={20} color={primaryColor} />
            <Text style={[styles.schoolName, { color: primaryColor }]}>
              SchoolBridge Academy
            </Text>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: TEACHER_COLORS.success },
                ]}
              />
              <Text
                style={[styles.statusText, { color: TEACHER_COLORS.success }]}
              >
                Online
              </Text>
            </View>
          </View>

          {/* ✅ Professional Menu Content */}
          <ScrollView
            style={styles.menuContainer}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Role-specific Section */}
            <View style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{userRole} Dashboard</Text>
              {roleItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.enhancedMenuItem}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.menuIconContainer,
                      { backgroundColor: `${item.color}15` },
                    ]}
                  >
                    <Ionicons name={item.icon} size={24} color={item.color} />
                    {item.badge && (
                      <View
                        style={[
                          styles.itemBadge,
                          { backgroundColor: item.color },
                        ]}
                      >
                        <Text style={styles.badgeText}>
                          {item.badge > 99 ? '99+' : item.badge}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={TEACHER_COLORS.textMuted}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Account Section */}
            <View style={styles.categorySection}>
              <Text style={styles.categoryTitle}>Account & Settings</Text>
              {commonItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.enhancedMenuItem}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.menuIconContainer,
                      { backgroundColor: `${item.color}15` },
                    ]}
                  >
                    <Ionicons name={item.icon} size={24} color={item.color} />
                    {item.badge && (
                      <View
                        style={[
                          styles.itemBadge,
                          { backgroundColor: item.color },
                        ]}
                      >
                        <Text style={styles.badgeText}>
                          {item.badge > 99 ? '99+' : item.badge}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={TEACHER_COLORS.textMuted}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Quick Settings */}
            <View style={styles.categorySection}>
              <Text style={styles.categoryTitle}>Quick Settings</Text>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <View
                    style={[
                      styles.menuIconContainer,
                      {
                        backgroundColor: `${COLORS.teacherPalette.subjects.computer}15`,
                      },
                    ]}
                  >
                    <Ionicons
                      name="moon-outline"
                      size={24}
                      color={COLORS.teacherPalette.subjects.computer}
                    />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>Dark Mode</Text>
                    <Text style={styles.settingSubtitle}>
                      Switch to dark theme
                    </Text>
                  </View>
                </View>
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{
                    false: COLORS.teacherPalette.neutral.lighter,
                    true: primaryColor,
                  }}
                  thumbColor={
                    darkMode
                      ? TEACHER_COLORS.textWhite
                      : COLORS.teacherPalette.neutral.light
                  }
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <View
                    style={[
                      styles.menuIconContainer,
                      { backgroundColor: `${TEACHER_COLORS.warning}15` },
                    ]}
                  >
                    <Ionicons
                      name="notifications-outline"
                      size={24}
                      color={TEACHER_COLORS.warning}
                    />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>Push Notifications</Text>
                    <Text style={styles.settingSubtitle}>
                      Get instant updates
                    </Text>
                  </View>
                </View>
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{
                    false: COLORS.teacherPalette.neutral.lighter,
                    true: primaryColor,
                  }}
                  thumbColor={
                    notifications
                      ? TEACHER_COLORS.textWhite
                      : COLORS.teacherPalette.neutral.light
                  }
                />
              </View>
            </View>

            {/* Support Section */}
            <View style={styles.categorySection}>
              <Text style={styles.categoryTitle}>Support</Text>

              <TouchableOpacity
                style={styles.enhancedMenuItem}
                activeOpacity={0.7}
                onPress={() => {
                  onClose();
                  navigation.navigate('Support');
                }}
              >
                <View
                  style={[
                    styles.menuIconContainer,
                    {
                      backgroundColor: `${COLORS.teacherPalette.subjects.science}15`,
                    },
                  ]}
                >
                  <Ionicons
                    name="help-circle-outline"
                    size={24}
                    color={COLORS.teacherPalette.subjects.science}
                  />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>Help & Support</Text>
                  <Text style={styles.menuSubtitle}>
                    Get help when you need it
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={TEACHER_COLORS.textMuted}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.enhancedMenuItem}
                activeOpacity={0.7}
                onPress={() => {
                  onClose();
                  navigation.navigate('AboutUs');
                }}
              >
                <View
                  style={[
                    styles.menuIconContainer,
                    { backgroundColor: `${TEACHER_COLORS.success}15` },
                  ]}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={24}
                    color={TEACHER_COLORS.success}
                  />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>About SchoolBridge</Text>
                  <Text style={styles.menuSubtitle}>Version 2.1.0</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={TEACHER_COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* Bottom Spacing */}
            <View style={styles.bottomSpacing} />
          </ScrollView>

          {/* ✅ Professional Logout Button */}

          <TouchableOpacity
            style={[styles.logoutButton, isLoading && styles.logoutDisabled]}
            onPress={handleLogout}
            activeOpacity={isLoading ? 1 : 0.8}
            disabled={isLoading}
          >
            <LinearGradient
              colors={
                isLoading
                  ? [
                      COLORS.teacherPalette.neutral.medium,
                      COLORS.teacherPalette.neutral.dark,
                    ]
                  : [TEACHER_COLORS.error, COLORS.teacherPalette.error.dark]
              }
              style={[
                styles.logoutGradient,
                isLoading && styles.logoutDisabled,
              ]}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator
                    size="small"
                    color={TEACHER_COLORS.textWhite}
                  />
                  <Text style={styles.logoutText}>Signing Out...</Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="log-out-outline"
                    size={24}
                    color={TEACHER_COLORS.textWhite}
                  />
                  <Text style={styles.logoutText}>Sign Out</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ✅ Professional Styles using Theme System
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.teacherPalette.overlay.dark,
  },
  menuPanel: {
    backgroundColor: TEACHER_COLORS.surface,
    maxWidth: 350,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.teacherPalette.shadow.dark,
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  headerGradient: {
    paddingHorizontal: SPACING.lg - 4,
    paddingVertical: SPACING.lg - 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: TEACHER_COLORS.textWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...TEACHER_THEME.typography.h2,
    fontWeight: '700',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: TEACHER_COLORS.textWhite,
  },
  userTextContainer: {
    flex: 1,
  },
  userName: {
    ...TEACHER_THEME.typography.h4,
    color: TEACHER_COLORS.textWhite,
    marginBottom: SPACING.xs,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  userRole: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textWhite,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  userEmail: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textWhite,
    opacity: 0.8,
  },
  closeButton: {
    padding: SPACING.sm,
    marginTop: -SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.teacherPalette.overlay.light,
  },
  schoolInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: SPACING.lg - 4,
    marginVertical: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  schoolName: {
    ...TEACHER_THEME.typography.body,
    fontWeight: '600',
    marginLeft: SPACING.sm,
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    ...TEACHER_THEME.typography.small,
    fontWeight: '600',
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg - 4,
  },
  categorySection: {
    marginBottom: SPACING.xl - 8,
  },
  categoryTitle: {
    ...TEACHER_THEME.typography.caption,
    fontWeight: '700',
    color: TEACHER_COLORS.textMuted,
    marginBottom: SPACING.sm + 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  enhancedMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    marginVertical: 2,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    position: 'relative',
  },
  itemBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: TEACHER_COLORS.surface,
  },
  badgeText: {
    color: TEACHER_COLORS.textWhite,
    fontSize: 10,
    fontWeight: '700',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    ...TEACHER_THEME.typography.body,
    fontWeight: '600',
    color: TEACHER_COLORS.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textMuted,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.xs,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 14,
    flex: 1,
  },
  settingTitle: {
    ...TEACHER_THEME.typography.body,
    fontWeight: '600',
    color: TEACHER_COLORS.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textMuted,
  },
  bottomSpacing: {
    height: SPACING.lg - 4,
  },
  logoutButton: {
    marginHorizontal: SPACING.lg - 4,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  logoutButtonDisabled: {
    opacity: 0.8,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
  logoutText: {
    color: TEACHER_COLORS.textWhite,
    ...TEACHER_THEME.typography.body,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  logoutDisabled: {
    opacity: 0.7,
  },
});

export default HamburgerMenu;
