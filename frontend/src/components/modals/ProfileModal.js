import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  Animated,
  ScrollView,
  Image,
  Linking,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  COLORS,
  TEACHER_COLORS,
  TEACHER_THEME,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  getRoleColors,
} from '../../constants/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ProfileModal = ({
  visible,
  onClose,
  userInfo = {},
  userRole = 'Student',
  notificationCount = 0,
  actions = [],
  theme,
}) => {
  const insets = useSafeAreaInsets();
  const [avatarError, setAvatarError] = useState(false);
  const [modalAvatarError, setModalAvatarError] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(screenHeight)).current;

  // Professional gradient colors using theme
  const roleColors = getRoleColors(userRole);
  const primaryColor = roleColors.primary || TEACHER_COLORS.primary;
  const gradientColors = useMemo(() => {
    if (userRole?.toLowerCase() === 'teacher') {
      return COLORS.teacherPalette.primary.gradient;
    }
    return [primaryColor, `${primaryColor}DD`, `${primaryColor}BB`];
  }, [primaryColor, userRole]);

  // Animate modal in/out
  React.useEffect(() => {
    if (visible) {
      setIsAnimating(true);
      modalOpacity.setValue(0);
      slideY.setValue(screenHeight);
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
      ]).start(() => setIsAnimating(false));
    } else {
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
      ]).start();
    }
    // eslint-disable-next-line
  }, [visible]);

  // Contact actions
  const handleContactAction = (type) => {
    if (type === 'email' && userInfo.email) {
      Linking.openURL(`mailto:${userInfo.email}`);
    } else if (type === 'phone' && userInfo.phoneNumber) {
      Linking.openURL(`tel:${userInfo.phoneNumber}`);
    } else if (type === 'address' && userInfo.address) {
      // Could open maps, for now just close
      onClose && onClose();
    }
  };

  // Professional Stats
  const renderStats = (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{userInfo.studentsCount || '0'}</Text>
        <Text style={styles.statLabel}>Students</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>
          {userInfo.completedCourses || '0'}
        </Text>
        <Text style={styles.statLabel}>Courses</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{userInfo.experience || 'N/A'}</Text>
        <Text style={styles.statLabel}>Experience</Text>
      </View>
    </View>
  );

  // Professional Action Item Renderer
  const renderActionItem = useCallback(
    (action) => (
      <TouchableOpacity
        key={action.id}
        style={[
          styles.actionItem,
          action.destructive && styles.destructiveAction,
        ]}
        onPress={action.action}
        activeOpacity={0.7}
      >
        <View style={styles.actionLeft}>
          <View
            style={[
              styles.actionIcon,
              { backgroundColor: `${action.color}15` },
            ]}
          >
            <Ionicons
              name={action.icon}
              size={22}
              color={action.destructive ? TEACHER_COLORS.error : action.color}
            />
          </View>
          <Text
            style={[
              styles.actionTitle,
              action.destructive && styles.destructiveText,
            ]}
          >
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
            color={
              action.destructive
                ? TEACHER_COLORS.error
                : TEACHER_COLORS.textMuted
            }
          />
        </View>
      </TouchableOpacity>
    ),
    [],
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent={false}
      onRequestClose={onClose}
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
        {/* Backdrop */}
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={onClose}
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
        {/* Modal Content */}
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
              {/* Header Section */}
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalHeader}
              >
                {/* Close Button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={TEACHER_COLORS.textWhite}
                  />
                </TouchableOpacity>
                {/* Profile Section */}
                <View style={styles.profileSection}>
                  <View style={styles.avatarContainer}>
                    {userInfo.avatar && !modalAvatarError ? (
                      <Image
                        source={{ uri: userInfo.avatar }}
                        style={styles.modalAvatar}
                        onError={() => setModalAvatarError(true)}
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
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{userInfo.name}</Text>
                    <Text style={styles.userRole}>{userRole}</Text>
                    {userInfo.department && (
                      <Text style={styles.userDepartment}>
                        {userInfo.department}
                      </Text>
                    )}
                    {userInfo.employeeId && (
                      <Text style={styles.userEmployeeId}>
                        ID: {userInfo.employeeId}
                      </Text>
                    )}
                  </View>
                </View>
                {renderStats}
              </LinearGradient>
              {/* Contact Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📞 Contact Information</Text>
                <View style={styles.contactContainer}>
                  {userInfo.email && (
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
                  )}
                  {userInfo.phoneNumber && (
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
                  )}
                  {userInfo.address && (
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
                  )}
                </View>
              </View>
              {/* Professional Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  🎓 Professional Information
                </Text>
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Join Date</Text>
                    <Text style={styles.infoValue}>{userInfo.joinDate}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Experience</Text>
                    <Text style={styles.infoValue}>{userInfo.experience}</Text>
                  </View>
                </View>
                {/* Subjects */}
                {userInfo.subjects && (
                  <View style={styles.subjectsContainer}>
                    <Text style={styles.infoLabel}>Subjects</Text>
                    <View style={styles.subjectsList}>
                      {userInfo.subjects.map((subject, idx) => (
                        <View key={idx} style={styles.subjectTag}>
                          <Text style={styles.subjectText}>{subject}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                {/* Qualifications */}
                {userInfo.qualifications && (
                  <View style={styles.qualificationsContainer}>
                    <Text style={styles.infoLabel}>Qualifications</Text>
                    {userInfo.qualifications.map((qual, idx) => (
                      <View key={idx} style={styles.qualificationItem}>
                        <Ionicons
                          name="school-outline"
                          size={16}
                          color={COLORS.teacherPalette.subjects.mathematics}
                        />
                        <Text style={styles.qualificationText}>{qual}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
              {/* Actions Section */}
              {actions && actions.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>⚙️ Actions</Text>
                  <View style={styles.actionsContainer}>
                    {actions.map(renderActionItem)}
                  </View>
                </View>
              )}
              {/* Emergency Contact */}
              {userInfo.emergencyContact && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🚨 Emergency Contact</Text>
                  <Text style={styles.emergencyContact}>
                    {userInfo.emergencyContact}
                  </Text>
                </View>
              )}
              <View style={{ height: SPACING.xl }} />
            </ScrollView>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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

export default ProfileModal;
