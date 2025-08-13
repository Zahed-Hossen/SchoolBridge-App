import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Alert,
  Dimensions,
  Modal,
  Animated,
  ScrollView,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';

// ✅ Import Professional Theme System
import {
  COLORS,
  TEACHER_COLORS,
  TEACHER_THEME,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  getRoleColors
} from '../../constants/theme';

import HamburgerMenu from './HamburgerMenu';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AppHeader = ({
  title = "SchoolBridge",
  subtitle = "Welcome back",
  navigation,
  userRole = 'Teacher',
  showNotificationBadge = false,
  notificationCount = 0,
  userInfo = {
    name: 'Zahed Hossen',
    email: 'zahed.hossen@schoolbridge.edu',
    avatar: null,
    department: 'Mathematics Department',
    employeeId: 'TCH-2024-001',
    joinDate: 'September 2019',
    phoneNumber: '+1 (555) 123-4567',
    address: '123 Education Ave, Learning City, LC 12345',
    emergencyContact: 'John Johnson - +1 (555) 987-6543',
    qualifications: ['Ph.D. in Mathematics', 'M.Ed. in Education', 'B.S. in Applied Mathematics'],
    subjects: ['Algebra II', 'Calculus AP', 'Statistics', 'Geometry'],
    experience: '12 years',
    rating: 4.8,
    studentsCount: 156,
    completedCourses: 8,
  }
}) => {
  const { logout, isLoading, user } = useAuth();
    const actualUserInfo = user
      ? {
          ...userInfo,
          name: user.name || user.fullName || userInfo.name,
          email: user.email || userInfo.email,
          avatar: user.avatar || userInfo.avatar,
        }
      : userInfo;

  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [modalAvatarError, setModalAvatarError] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // ✅ Get role-specific colors from theme
  const roleColors = getRoleColors(userRole);
  const primaryColor = roleColors.primary || TEACHER_COLORS.primary;

  // Animation values
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(screenHeight)).current;

  const headerHeight = 65 + insets.top;

  // ✅ Professional gradient colors using theme
  const gradientColors = useMemo(() => {
    if (userRole?.toLowerCase() === 'teacher') {
      return COLORS.teacherPalette.primary.gradient;
    }
    return [primaryColor, `${primaryColor}DD`, `${primaryColor}BB`];
  }, [primaryColor, userRole]);

  // ✅ Optimized Profile Modal Animation
  const showProfileModal = useCallback(() => {
    if (isAnimating) return;

    console.log('🔧 Opening Profile Modal...');
    setIsAnimating(true);
    setProfileModalVisible(true);

    modalOpacity.setValue(0);
    slideY.setValue(screenHeight);

    requestAnimationFrame(() => {
      Animated.parallel([
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideY, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsAnimating(false);
      });
    });
  }, [isAnimating, modalOpacity, slideY]);

  const hideProfileModal = useCallback(() => {
    if (isAnimating) return;

    console.log('🔧 Closing Profile Modal...');
    setIsAnimating(true);

    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideY, {
        toValue: screenHeight,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setProfileModalVisible(false);
      setIsAnimating(false);
    });
  }, [isAnimating, modalOpacity, slideY]);

  const profileActions = useMemo(
    () => [
      {
        id: 'editProfile',
        title: 'Edit Profile',
        icon: 'person-outline',
        color: TEACHER_COLORS.primary,
        action: () => {
          hideProfileModal();
          setTimeout(() => {
            Alert.alert(
              '👤 Edit Profile',
              'Edit Profile feature will be available soon!\n\nThis will allow you to:\n• Update personal information\n• Change profile picture\n• Modify contact details\n• Update preferences',
              [{ text: 'Got it!', style: 'default' }],
            );
          }, 200);
        },
      },
      {
        id: 'notifications',
        title: 'Notifications',
        icon: 'notifications-outline',
        color: TEACHER_COLORS.warning,
        badge: notificationCount > 0 ? notificationCount : null,
        action: () => {
          hideProfileModal();
          setTimeout(() => {
            navigation?.navigate?.('Notifications') ||
              Alert.alert(
                '🔔 Notifications',
                `You have ${
                  notificationCount || 0
                } new notifications.\n\nNotification Center will include:\n• Assignment updates\n• Grade notifications\n• System announcements\n• Meeting reminders`,
                [{ text: 'OK', style: 'default' }],
              );
          }, 200);
        },
      },
      {
        id: 'settings',
        title: 'Settings & Preferences',
        icon: 'settings-outline',
        color: COLORS.teacherPalette.subjects.computer,
        action: () => {
          hideProfileModal();
          setTimeout(() => {
            navigation?.navigate?.('Settings') ||
              Alert.alert(
                '⚙️ Settings',
                'Settings screen coming soon!\n\nFeatures will include:\n• App preferences\n• Notification settings\n• Privacy controls\n• Theme customization',
                [{ text: 'Understood', style: 'default' }],
              );
          }, 200);
        },
      },
      {
        id: 'security',
        title: 'Security & Privacy',
        icon: 'shield-checkmark-outline',
        color: TEACHER_COLORS.success,
        action: () => {
          hideProfileModal();
          setTimeout(() => {
            Alert.alert(
              '🔒 Security & Privacy',
              'Security settings coming soon!\n\nFeatures will include:\n• Password management\n• Two-factor authentication\n• Privacy controls\n• Account activity log',
              [{ text: 'Understood', style: 'default' }],
            );
          }, 200);
        },
      },
      {
        id: 'help',
        title: 'Help & Support',
        icon: 'help-circle-outline',
        color: COLORS.teacherPalette.subjects.mathematics,
        action: () => {
          hideProfileModal();
          setTimeout(() => {
            Alert.alert(
              '💬 Help & Support',
              "Need assistance? We're here to help!\n\nSupport options:\n• Knowledge base\n• Video tutorials\n• Live chat support\n• Contact technical team",
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Contact Support',
                  style: 'default',
                  onPress: () => {
                    Linking.openURL(
                      'mailto:support@schoolbridge.edu?subject=Support Request',
                    ).catch(() => {
                      Alert.alert('Error', 'Could not open email app');
                    });
                  },
                },
              ],
            );
          }, 200);
        },
      },
      {
        id: 'about',
        title: 'About SchoolBridge',
        icon: 'information-circle-outline',
        color: COLORS.teacherPalette.subjects.science,
        action: () => {
          Alert.alert(
            '📚 About SchoolBridge',
            'SchoolBridge Education Platform\n\nVersion: 1.2.5\nBuild: 2024.08.06\n\nBuilt with ❤️ for educators worldwide\n\n© 2024 SchoolBridge Inc.\nAll rights reserved.',
            [
              { text: 'Close', style: 'cancel' },
              {
                text: 'Visit Website',
                style: 'default',
                onPress: () => {
                  Linking.openURL('https://schoolbridge.edu').catch(() => {
                    Alert.alert('Error', 'Could not open website');
                  });
                },
              },
            ],
          );
        },
      },
      {
        id: 'signOut',
        title: 'Sign Out',
        icon: 'log-out-outline',
        color: TEACHER_COLORS.error,
        destructive: true,
        action: handleSignOut, // ✅ Use the enhanced logout function
      },
    ],
    [hideProfileModal, notificationCount, handleSignOut, navigation],
  );

  // ✅ Add loading state indicator to user info
  const renderUserName = useMemo(() => {
    if (isLoading) {
      return 'Signing out...';
    }
    return actualUserInfo.name;
  }, [isLoading, actualUserInfo.name]);

  // ✅ Professional Stats Component using theme
  const renderStats = useMemo(() => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{userInfo.studentsCount || '0'}</Text>
        <Text style={styles.statLabel}>Students</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{userInfo.completedCourses || '0'}</Text>
        <Text style={styles.statLabel}>Courses</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{userInfo.experience || 'N/A'}</Text>
        <Text style={styles.statLabel}>Experience</Text>
      </View>
    </View>
  ), [userInfo.studentsCount, userInfo.completedCourses, userInfo.experience]);

  // ✅ Professional Action Item Renderer
  const renderActionItem = useCallback((action) => (
    <TouchableOpacity
      key={action.id}
      style={[
        styles.actionItem,
        action.destructive && styles.destructiveAction
      ]}
      onPress={action.action}
      activeOpacity={0.7}
    >
      <View style={styles.actionLeft}>
        <View style={[
          styles.actionIcon,
          { backgroundColor: `${action.color}15` }
        ]}>
          <Ionicons
            name={action.icon}
            size={22}
            color={action.destructive ? TEACHER_COLORS.error : action.color}
          />
        </View>
        <Text style={[
          styles.actionTitle,
          action.destructive && styles.destructiveText
        ]}>
          {action.title}
        </Text>
      </View>
      <View style={styles.actionRight}>
        {action.badge && (
          <View style={styles.actionBadge}>
            <Text style={styles.actionBadgeText}>
              {action.badge > 9 ? '9+' : action.badge}
            </Text>
          </View>
        )}
        <Ionicons
          name="chevron-forward"
          size={18}
          color={action.destructive ? TEACHER_COLORS.error : TEACHER_COLORS.textMuted}
        />
      </View>
    </TouchableOpacity>
  ), []);

  // Avatar Error Handlers
  const handleAvatarError = useCallback(() => {
    console.log('⚠️ Header avatar failed to load, using default');
    setAvatarError(true);
  }, []);

  const handleModalAvatarError = useCallback(() => {
    console.log('⚠️ Modal avatar failed to load, using default');
    setModalAvatarError(true);
  }, []);
const handleSignOut = useCallback(async () => {
  try {
    console.log('🚪 Starting enhanced logout process...');

    Alert.alert(
      '🚪 Sign Out',
      `Are you sure you want to sign out?\n\n• Your data will be saved\n• You'll need to log in again\n• Any unsaved work may be lost`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => console.log('❌ Enhanced logout cancelled'),
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              hideProfileModal(); // Close modal first

              console.log('🔄 Processing enhanced logout...');

              // Show loading toast/alert
              const loadingToast = Alert.alert(
                '🔄 Signing Out',
                'Securely logging you out...\n\n• Clearing session data\n• Saving preferences\n• Disconnecting services',
                [],
                { cancelable: false },
              );

              // Add a small delay for better UX
              await new Promise((resolve) => setTimeout(resolve, 1000));

              // Call logout from AuthContext
              await logout();

              console.log('✅ Enhanced logout completed successfully');

              // Success feedback
              setTimeout(() => {
                Alert.alert(
                  '✅ Signed Out Successfully',
                  'You have been securely signed out. Thank you for using SchoolBridge!',
                  [{ text: 'OK', style: 'default' }],
                );
              }, 500);
            } catch (error) {
              console.error('❌ Enhanced logout error:', error);
              Alert.alert(
                '❌ Logout Error',
                'There was an issue signing you out securely. Please try again or contact support if the problem persists.',
                [
                  { text: 'Try Again', onPress: handleSignOut },
                  { text: 'Cancel', style: 'cancel' },
                ],
              );
            }
          },
        },
      ],
    );
  } catch (error) {
    console.error('❌ Enhanced logout confirmation error:', error);
  }
}, [logout, hideProfileModal]);


  return (
    <>
      {/* ✅ Professional Status Bar */}
      <StatusBar
        backgroundColor={primaryColor}
        barStyle="light-content"
        translucent={Platform.OS === 'android'}
        hidden={false}
      />

      {/* ✅ Professional Header with Theme Gradient */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.container,
          {
            height: headerHeight,
            paddingTop: insets.top,
          },
        ]}
      >
        {/* Left - Hamburger Menu */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            console.log('🍔 Hamburger menu pressed');
            setMenuVisible(true);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.actionButtonInner}>
            <Ionicons name="menu" size={24} color={TEACHER_COLORS.textWhite} />
          </View>
        </TouchableOpacity>

        {/* Center - Professional Title Section */}
        <View style={styles.centerSection}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {/* Right - Professional Profile Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            console.log('👤 Profile button pressed');
            if (!isAnimating) {
              showProfileModal();
            }
          }}
          activeOpacity={0.7}
        >
          <View style={styles.profileButtonContainer}>
            {userInfo.avatar && !avatarError ? (
              <Image
                source={{ uri: userInfo.avatar }}
                style={styles.profileAvatar}
                onError={handleAvatarError}
                onLoad={() =>
                  console.log('✅ Header avatar loaded successfully')
                }
              />
            ) : (
              <View style={styles.defaultAvatar}>
                <Ionicons
                  name="person"
                  size={20}
                  color={TEACHER_COLORS.textWhite}
                />
              </View>
            )}
            {showNotificationBadge && notificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Professional Bottom Shadow */}
        <LinearGradient
          colors={['transparent', COLORS.teacherPalette.shadow.light]}
          style={styles.bottomShadow}
        />
      </LinearGradient>

      {/* ✅ Professional Profile Modal */}
      {profileModalVisible && (
        <Modal
          visible={true}
          transparent={true}
          animationType="none"
          statusBarTranslucent={false}
          onRequestClose={hideProfileModal}
          hardwareAccelerated={true}
        >
          <Animated.View
            style={[
              styles.modalOverlay,
              {
                opacity: modalOpacity,
              },
            ]}
          >
            {/* Professional Backdrop */}
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              activeOpacity={1}
              onPress={() => {
                console.log('🎯 Backdrop pressed - closing modal');
                hideProfileModal();
              }}
            >
              <LinearGradient
                colors={[
                  COLORS.teacherPalette.overlay.light,
                  COLORS.teacherPalette.overlay.medium,
                  COLORS.teacherPalette.overlay.dark,
                ]}
                locations={[0, 0.5, 1]}
                style={StyleSheet.absoluteFillObject}
              />
            </TouchableOpacity>

            {/* ✅ Professional Modal Content */}
            <Animated.View
              style={[
                styles.modalContent,
                {
                  transform: [{ translateY: slideY }],
                },
              ]}
            >
              <View style={styles.modalContainer}>
                <ScrollView
                  style={styles.modalScrollView}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                  bounces={true}
                  scrollEventThrottle={16}
                  removeClippedSubviews={true}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* ✅ Professional Header Section */}
                  <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.modalHeader}
                  >
                    {/* Close Button */}
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => {
                        console.log('❌ Close button pressed');
                        hideProfileModal();
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="close"
                        size={24}
                        color={TEACHER_COLORS.textWhite}
                      />
                    </TouchableOpacity>

                    {/* Professional Profile Section */}
                    <View style={styles.profileSection}>
                      {/* Professional Avatar */}
                      <View style={styles.avatarContainer}>
                        {userInfo.avatar && !modalAvatarError ? (
                          <Image
                            source={{ uri: userInfo.avatar }}
                            style={styles.modalAvatar}
                            onError={handleModalAvatarError}
                            onLoad={() =>
                              console.log('✅ Modal avatar loaded successfully')
                            }
                          />
                        ) : (
                          <View style={styles.modalDefaultAvatar}>
                            <Ionicons
                              name="person"
                              size={40}
                              color={TEACHER_COLORS.textWhite}
                            />
                          </View>
                        )}
                        <View style={styles.ratingContainer}>
                          <Ionicons
                            name="star"
                            size={12}
                            color={TEACHER_COLORS.warning}
                          />
                          <Text style={styles.ratingText}>
                            {userInfo.rating || '5.0'}
                          </Text>
                        </View>
                      </View>

                      {/* Professional User Details */}
                      <View style={styles.userDetails}>
                        <Text style={styles.userName}>{userInfo.name}</Text>
                        <Text style={styles.userRole}>{userRole}</Text>
                        <Text style={styles.userDepartment}>
                          {userInfo.department}
                        </Text>
                        <Text style={styles.userEmployeeId}>
                          ID: {userInfo.employeeId}
                        </Text>
                      </View>
                    </View>

                    {/* Professional Stats */}
                    {renderStats}
                  </LinearGradient>

                  {/* ✅ Professional Contact Information */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      📞 Contact Information
                    </Text>
                    <View style={styles.contactContainer}>
                      <TouchableOpacity
                        style={styles.contactItem}
                        onPress={() => handleContactAction('email')}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="mail-outline"
                          size={20}
                          color={COLORS.teacherPalette.subjects.science}
                        />
                        <Text style={styles.contactText}>{userInfo.email}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.contactItem}
                        onPress={() => handleContactAction('phone')}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="call-outline"
                          size={20}
                          color={TEACHER_COLORS.success}
                        />
                        <Text style={styles.contactText}>
                          {userInfo.phoneNumber}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.contactItem}
                        onPress={() => handleContactAction('address')}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="location-outline"
                          size={20}
                          color={TEACHER_COLORS.error}
                        />
                        <Text style={[styles.contactText, styles.addressText]}>
                          {userInfo.address}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* ✅ Professional Information */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      🎓 Professional Information
                    </Text>
                    <View style={styles.infoGrid}>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Join Date</Text>
                        <Text style={styles.infoValue}>
                          {userInfo.joinDate}
                        </Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Experience</Text>
                        <Text style={styles.infoValue}>
                          {userInfo.experience}
                        </Text>
                      </View>
                    </View>

                    {/* Professional Subjects */}
                    <View style={styles.subjectsContainer}>
                      <Text style={styles.infoLabel}>Teaching Subjects</Text>
                      <View style={styles.subjectsList}>
                        {userInfo.subjects &&
                          userInfo.subjects.map((subject, index) => (
                            <View key={index} style={styles.subjectTag}>
                              <Text style={styles.subjectText}>{subject}</Text>
                            </View>
                          ))}
                      </View>
                    </View>

                    {/* Professional Qualifications */}
                    <View style={styles.qualificationsContainer}>
                      <Text style={styles.infoLabel}>Qualifications</Text>
                      {userInfo.qualifications &&
                        userInfo.qualifications.map((qual, index) => (
                          <View key={index} style={styles.qualificationItem}>
                            <Ionicons
                              name="school-outline"
                              size={16}
                              color={COLORS.teacherPalette.subjects.mathematics}
                            />
                            <Text style={styles.qualificationText}>{qual}</Text>
                          </View>
                        ))}
                    </View>
                  </View>

                  {/* ✅ Professional Actions Section */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>⚙️ Actions</Text>
                    <View style={styles.actionsContainer}>
                      {profileActions.map(renderActionItem)}
                    </View>
                  </View>

                  {/* Emergency Contact */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      🚨 Emergency Contact
                    </Text>
                    <Text style={styles.emergencyContact}>
                      {userInfo.emergencyContact}
                    </Text>
                  </View>

                  {/* Bottom Padding */}
                  <View style={{ height: SPACING.xl }} />
                </ScrollView>
              </View>
            </Animated.View>
          </Animated.View>
        </Modal>
      )}

      {/* Professional Hamburger Menu */}
      <HamburgerMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        navigation={navigation}
        userRole={userRole}
      />
    </>
  );
};

// ✅ Professional Styles using Theme System
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm + 4,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.teacherPalette.overlay.light,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  defaultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.teacherPalette.overlay.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 4,
  },
  title: {
    ...TEACHER_THEME.typography.h3,
    color: TEACHER_COLORS.textWhite,
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: COLORS.teacherPalette.shadow.dark,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textWhite,
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: TEACHER_COLORS.error,
    borderRadius: BORDER_RADIUS.sm + 6,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: TEACHER_COLORS.textWhite,
  },
  badgeText: {
    color: TEACHER_COLORS.textWhite,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
  },
  bottomShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },

  // ✅ Professional Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: TEACHER_COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl + 8,
    borderTopRightRadius: BORDER_RADIUS.xl + 8,
    maxHeight: screenHeight * 0.9,
    minHeight: screenHeight * 0.5,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  modalContainer: {
    flex: 1,
    backgroundColor: TEACHER_COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl + 8,
    borderTopRightRadius: BORDER_RADIUS.xl + 8,
  },
  modalScrollView: {
    flex: 1,
    backgroundColor: TEACHER_COLORS.surface,
  },
  scrollContent: {
    flexGrow: 1,
  },
  modalHeader: {
    paddingTop: SPACING.lg - 4,
    paddingHorizontal: SPACING.lg - 4,
    paddingBottom: SPACING.xl - 8,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.lg - 4,
    right: SPACING.lg - 4,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.teacherPalette.overlay.light,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  profileSection: {
    alignItems: 'center',
    marginTop: SPACING.lg - 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  modalAvatar: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 4,
    borderColor: TEACHER_COLORS.textWhite,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalDefaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.teacherPalette.overlay.light,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: TEACHER_COLORS.textWhite,
  },
  ratingContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: TEACHER_COLORS.surface,
    borderRadius: 15,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: TEACHER_COLORS.warning,
    ...Platform.select({
      ios: {
        shadowColor: TEACHER_COLORS.warning,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  ratingText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights['700'],
    color: TEACHER_COLORS.warning,
    marginLeft: 2,
  },
  userDetails: {
    alignItems: 'center',
  },
  userName: {
    ...TEACHER_THEME.typography.h2,
    color: TEACHER_COLORS.textWhite,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    textShadowColor: COLORS.teacherPalette.shadow.dark,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  userRole: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.textWhite,
    opacity: 0.9,
    marginBottom: 2,
    fontWeight: FONTS.weights['600'],
  },
  userDepartment: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textWhite,
    opacity: 0.8,
    marginBottom: SPACING.xs + 2,
  },
  userEmployeeId: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textWhite,
    opacity: 0.7,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: SPACING.xl - 8,
    paddingTop: SPACING.lg - 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEACHER_THEME.typography.h3,
    color: TEACHER_COLORS.textWhite,
    textShadowColor: COLORS.teacherPalette.shadow.dark,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  statLabel: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textWhite,
    opacity: 0.8,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  section: {
    padding: SPACING.lg - 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.teacherPalette.background.accent,
    backgroundColor: TEACHER_COLORS.surface,
  },
  sectionTitle: {
    ...TEACHER_THEME.typography.h4,
    color: TEACHER_COLORS.text,
    marginBottom: SPACING.md,
  },
  contactContainer: {
    marginTop: SPACING.sm,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.md,
    backgroundColor: TEACHER_COLORS.accent,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  contactText: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textSecondary,
    marginLeft: SPACING.sm + 4,
    flex: 1,
  },
  addressText: {
    lineHeight: 18,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  infoItem: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  infoLabel: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textMuted,
    marginBottom: SPACING.xs,
    fontWeight: FONTS.weights['600'],
  },
  infoValue: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
    fontWeight: FONTS.weights['500'],
  },
  subjectsContainer: {
    marginTop: SPACING.md,
  },
  subjectsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
  },
  subjectTag: {
    backgroundColor: COLORS.teacherPalette.background.accent,
    borderRadius: BORDER_RADIUS.md + 8,
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs + 2,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: TEACHER_COLORS.primaryLight,
  },
  subjectText: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.primary,
    fontWeight: FONTS.weights['600'],
  },
  qualificationsContainer: {
    marginTop: SPACING.md,
  },
  qualificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  qualificationText: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  actionsContainer: {
    marginTop: SPACING.sm,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: TEACHER_COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.teacherPalette.background.accent,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  destructiveAction: {
    borderColor: COLORS.teacherPalette.error.bg,
    backgroundColor: COLORS.teacherPalette.error.bg,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm + 4,
  },
  actionTitle: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
    fontWeight: FONTS.weights['600'],
  },
  destructiveText: {
    color: TEACHER_COLORS.error,
  },
  actionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBadge: {
    backgroundColor: TEACHER_COLORS.error,
    borderRadius: BORDER_RADIUS.sm + 6,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  actionBadgeText: {
    color: TEACHER_COLORS.textWhite,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
  },
  emergencyContact: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.error,
    fontWeight: FONTS.weights['600'],
    padding: SPACING.md,
    backgroundColor: COLORS.teacherPalette.error.bg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.teacherPalette.error.light,
  },
});

export default AppHeader;
