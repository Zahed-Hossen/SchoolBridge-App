import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';
import { useTenant } from '../../context/TenantContext';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Theme system
import {
  COLORS,
  TEACHER_COLORS,
  TEACHER_THEME,
  SPACING,
  BORDER_RADIUS,
  getRoleColors,
} from '../../constants/theme';

// Navigation components
import HamburgerMenu from '../../components/navigation/HamburgerMenu';
import ScrollableTabBar from '../../components/navigation/ScrollableTabBar';

import ProfileModal from '../../components/modals/ProfileModal';

// API services
import { studentService } from '../../api/services/studentService';

const { width: screenWidth } = Dimensions.get('window');

const StudentDashboard = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { currentRole, roleTheme } = useRole();
  const { tenantBranding } = useTenant();
  const insets = useSafeAreaInsets();

  // Hamburger menu state
  const [menuVisible, setMenuVisible] = useState(false);
  // Profile modal state
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  // Dashboard data state
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Load dashboard data
  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      // Simulate API call (replace with real API)
      const [dashboardResponse, announcementsResponse, notificationsResponse] =
        await Promise.allSettled([
          studentService.getDashboard(),
          studentService.getAnnouncements({ limit: 3 }),
          studentService.getNotifications({ limit: 5 }),
        ]);

      let dashboardResult = null;
      if (
        dashboardResponse.status === 'fulfilled' &&
        dashboardResponse.value.success
      ) {
        dashboardResult = dashboardResponse.value.data;
      } else {
        dashboardResult = getMockDashboardData();
      }

      let announcements = [];
      if (
        announcementsResponse.status === 'fulfilled' &&
        announcementsResponse.value.success
      ) {
        announcements = announcementsResponse.value.data.announcements || [];
      } else {
        announcements = getMockAnnouncements();
      }

      let notifications = [];
      if (
        notificationsResponse.status === 'fulfilled' &&
        notificationsResponse.value.success
      ) {
        notifications = notificationsResponse.value.data?.notifications || [];
      } else {
        notifications = [];
      }

      setDashboardData({
        ...dashboardResult,
        announcements: Array.isArray(announcements)
          ? announcements.slice(0, 3)
          : [],
        notifications: Array.isArray(notifications)
          ? notifications.slice(0, 5)
          : [],
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      setError(error.message);
      setDashboardData({
        ...getMockDashboardData(),
        announcements: getMockAnnouncements(),
        notifications: [],
        lastUpdated: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Mock data
  const getMockDashboardData = () => ({
    totalSubjects: 6,
    pendingAssignments: 8,
    attendanceRate: 92,
    currentGPA: 3.8,
    upcomingClasses: [
      {
        id: 1,
        subject: 'Mathematics',
        time: '09:00 AM',
        room: 'Room 101',
        teacher: 'Mr. Johnson',
      },
      {
        id: 2,
        subject: 'Physics',
        time: '11:00 AM',
        room: 'Lab 203',
        teacher: 'Dr. Smith',
      },
      {
        id: 3,
        subject: 'English Literature',
        time: '02:00 PM',
        room: 'Room 305',
        teacher: 'Ms. Davis',
      },
    ],
    recentGrades: [
      {
        id: 1,
        subject: 'Mathematics',
        grade: 'A',
        assignment: 'Quiz 5',
        date: '2 days ago',
      },
      {
        id: 2,
        subject: 'Physics',
        grade: 'B+',
        assignment: 'Lab Report',
        date: '3 days ago',
      },
      {
        id: 3,
        subject: 'Chemistry',
        grade: 'A-',
        assignment: 'Midterm',
        date: '1 week ago',
      },
    ],
    upcomingAssignments: [
      {
        id: 1,
        title: 'Math Problem Set 6',
        subject: 'Mathematics',
        dueDate: 'Tomorrow',
        priority: 'high',
      },
      {
        id: 2,
        title: 'English Essay',
        subject: 'English',
        dueDate: 'Friday',
        priority: 'medium',
      },
      {
        id: 3,
        title: 'Science Project',
        subject: 'Physics',
        dueDate: 'Next Week',
        priority: 'low',
      },
    ],
  });

  const getMockAnnouncements = () => [
    {
      id: 1,
      title: 'Exam Schedule Released',
      content: 'Mid-term exam schedule is now available',
      time: '1 hour ago',
    },
    {
      id: 2,
      title: 'Library Hours Extended',
      content: 'Library will be open until 10 PM during exam week',
      time: '3 hours ago',
    },
    {
      id: 3,
      title: 'Sports Day Event',
      content: 'Annual sports day scheduled for next Friday',
      time: '1 day ago',
    },
  ];

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, []),
  );

  const onRefresh = () => loadDashboardData(true);

  // Navigation helpers
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' },
    ]);
  };

  const navigateToScreen = (screenName, params = {}) => {
    try {
      if (navigation) navigation.navigate(screenName, params);
      else
        Alert.alert(
          'Coming Soon',
          `${screenName} screen will be available soon!`,
        );
    } catch (error) {
      Alert.alert(
        'Navigation Error',
        'Unable to navigate to the requested screen.',
      );
    }
  };

  // Theming
  const roleColors = getRoleColors('Student');
  const primaryColor =
    roleColors.primary || tenantBranding?.primaryColor || '#2563EB';
  const theme = {
    ...roleColors,
    ...roleTheme,
    primary: primaryColor,
  };

  // Utility
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#E74C3C';
      case 'medium':
        return '#F39C12';
      case 'low':
        return '#27AE60';
      default:
        return primaryColor;
    }
  };
  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return '#27AE60';
    if (grade.startsWith('B')) return '#3498DB';
    if (grade.startsWith('C')) return '#F39C12';
    return '#E74C3C';
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
        <Text style={styles.loadingSubtext}>Fetching latest updates</Text>
      </View>
    );
  }


  return (
    <View style={styles.root}>
      {/* StatusBar and Header */}
      <StatusBar
        backgroundColor={primaryColor}
        barStyle="light-content"
        translucent={Platform.OS === 'android'}
      />

      {/* Custom Header Row: Hamburger (left), Title (center), Profile (right) */}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 12,
          paddingTop: insets.top + 8,
          paddingBottom: 8,
          backgroundColor: primaryColor,
        }}
      >
        {/* Enhanced HamburgerMenu trigger (top left) */}
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={{
            backgroundColor: 'rgba(255,255,255,0.12)',
            borderRadius: 16,
            padding: 8,
            marginRight: 4,
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 4,
              },
              android: {
                elevation: 2,
              },
            }),
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="menu"
            size={32}
            color={roleColors.textWhite || '#fff'}
          />
        </TouchableOpacity>
        {/* Title (center) */}
        <Text
          style={{
            color: roleColors.textWhite || '#fff',
            fontSize: 20,
            fontWeight: '700',
            flex: 1,
            textAlign: 'center',
            marginLeft: -28,
          }}
        >
          {'Student Dashboard'}
        </Text>
        {/* Enhanced Profile button (top right) */}
        <TouchableOpacity
          onPress={() => setProfileModalVisible(true)}
          style={{
            backgroundColor: 'rgba(255,255,255,0.12)',
            borderRadius: 16,
            padding: 8,
            marginLeft: 4,
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 4,
              },
              android: {
                elevation: 2,
              },
            }),
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="person-circle"
            size={32}
            color={roleColors.textWhite || '#fff'}
          />
        </TouchableOpacity>
      </View>

      {/* Hamburger Menu */}
      <HamburgerMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        navigation={navigation}
        userRole="Student"
      />

      {/* Profile Modal */}
      <ProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        userInfo={user}
        userRole={currentRole || 'Student'}
        theme={theme}
      />

      {/* Main Content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={primaryColor}
            colors={[primaryColor]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={[styles.statCard, { backgroundColor: primaryColor }]}>
            ...
            <Text style={styles.statLabel}>Attendance</Text>
            <Text style={styles.statValue}>
              {dashboardData.attendanceRate}%
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>GPA</Text>
            <Text style={[styles.statValue, { color: '#27AE60' }]}>
              {dashboardData.currentGPA}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Subjects</Text>
            <Text style={styles.statValue}>{dashboardData.totalSubjects}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pending Assignments</Text>
            <Text style={[styles.statValue, { color: '#E74C3C' }]}>
              {dashboardData.pendingAssignments}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={[
                styles.quickAction,
                { backgroundColor: primaryColor + '22' },
              ]}
              onPress={() => navigateToScreen('Assignments')}
            >
              <MaterialIcons name="assignment" size={28} color={primaryColor} />
              <Text style={styles.quickActionLabel}>Assignments</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.quickAction,
                { backgroundColor: primaryColor + '22' },
              ]}
              onPress={() => navigateToScreen('Grades')}
            >
              <FontAwesome5
                name="clipboard-list"
                size={26}
                color={primaryColor}
              />
              <Text style={styles.quickActionLabel}>Grades</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.quickAction,
                { backgroundColor: primaryColor + '22' },
              ]}
              onPress={() => navigateToScreen('Attendance')}
            >
              <Ionicons name="calendar" size={28} color={primaryColor} />
              <Text style={styles.quickActionLabel}>Attendance</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.quickAction,
                { backgroundColor: primaryColor + '22' },
              ]}
              onPress={() => navigateToScreen('Schedule')}
            >
              <Ionicons name="ios-today" size={28} color={primaryColor} />
              <Text style={styles.quickActionLabel}>Schedule</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Classes */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Upcoming Classes</Text>
            <TouchableOpacity onPress={() => navigateToScreen('Classes')}>
              <Text style={[styles.viewAll, { color: primaryColor }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>
          {dashboardData.upcomingClasses &&
          dashboardData.upcomingClasses.length > 0 ? (
            dashboardData.upcomingClasses.map((cls) => (
              <View key={cls.id} style={styles.classCard}>
                <View style={styles.classCardRow}>
                  <View style={styles.classInfo}>
                    <Text style={styles.classSubject}>{cls.subject}</Text>
                    <Text style={styles.classTeacher}>{cls.teacher}</Text>
                  </View>
                  <View style={styles.classTimeBox}>
                    <Ionicons name="time" size={16} color={primaryColor} />
                    <Text style={[styles.classTime, { color: primaryColor }]}>
                      {cls.time}
                    </Text>
                  </View>
                </View>
                <Text style={styles.classRoom}>{cls.room}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No upcoming classes</Text>
          )}
        </View>

        {/* Recent Grades */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Grades</Text>
            <TouchableOpacity onPress={() => navigateToScreen('Grades')}>
              <Text style={[styles.viewAll, { color: primaryColor }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>
          {dashboardData.recentGrades &&
          dashboardData.recentGrades.length > 0 ? (
            dashboardData.recentGrades.map((g) => (
              <View key={g.id} style={styles.gradeCard}>
                <View style={styles.gradeInfo}>
                  <Text style={styles.gradeSubject}>{g.subject}</Text>
                  <Text
                    style={[
                      styles.gradeValue,
                      { color: getGradeColor(g.grade) },
                    ]}
                  >
                    {g.grade}
                  </Text>
                </View>
                <Text style={styles.gradeAssignment}>{g.assignment}</Text>
                <Text style={styles.gradeDate}>{g.date}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No recent grades</Text>
          )}
        </View>

        {/* Upcoming Assignments */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Upcoming Assignments</Text>
            <TouchableOpacity onPress={() => navigateToScreen('Assignments')}>
              <Text style={[styles.viewAll, { color: primaryColor }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>
          {dashboardData.upcomingAssignments &&
          dashboardData.upcomingAssignments.length > 0 ? (
            dashboardData.upcomingAssignments.map((a) => (
              <View key={a.id} style={styles.assignmentCard}>
                <View style={styles.assignmentInfo}>
                  <Text style={styles.assignmentTitle}>{a.title}</Text>
                  <Text style={styles.assignmentSubject}>{a.subject}</Text>
                </View>
                <View style={styles.assignmentMeta}>
                  <Text
                    style={[
                      styles.assignmentDue,
                      { color: getPriorityColor(a.priority) },
                    ]}
                  >
                    {a.dueDate}
                  </Text>
                  <View
                    style={[
                      styles.priorityDot,
                      { backgroundColor: getPriorityColor(a.priority) },
                    ]}
                  />
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No upcoming assignments</Text>
          )}
        </View>

        {/* Announcements */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Announcements</Text>
            <TouchableOpacity onPress={() => navigateToScreen('Announcements')}>
              <Text style={[styles.viewAll, { color: primaryColor }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>
          {dashboardData.announcements &&
          dashboardData.announcements.length > 0 ? (
            dashboardData.announcements.map((a) => (
              <View key={a.id} style={styles.announcementCard}>
                <Text style={styles.announcementTitle}>{a.title}</Text>
                <Text style={styles.announcementContent}>{a.content}</Text>
                <Text style={styles.announcementTime}>{a.time}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No announcements</Text>
          )}
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <TouchableOpacity onPress={() => navigateToScreen('Notifications')}>
              <Text style={[styles.viewAll, { color: primaryColor }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>
          {dashboardData.notifications &&
          dashboardData.notifications.length > 0 ? (
            dashboardData.notifications.map((n, idx) => (
              <View key={idx} style={styles.notificationCard}>
                <Text style={styles.notificationText}>
                  {n.title || n.content || 'Notification'}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No notifications</Text>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Removed manual ScrollableTabBar to prevent duplicate tab bars */}
    </View>
  );
};

// Profile Modal Styles (must be outside StyleSheet.create)
const profileModalStyles = {
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  content: {
    width: 320,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  close: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 18,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  body: {
    width: '100%',
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 8,
  },
  infoValue: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
    marginBottom: 2,
  },
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
    fontWeight: '600',
  },
  loadingSubtext: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 8,
    marginHorizontal: SPACING.md,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    marginHorizontal: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2563EB',
  },
  section: {
    marginTop: 18,
    marginHorizontal: SPACING.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: 2,
    backgroundColor: '#E0E7FF',
  },
  quickActionLabel: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '600',
    marginTop: 6,
  },
  classCard: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.lg,
    padding: 14,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  classCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  classInfo: {
    flex: 1,
  },
  classSubject: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
  },
  classTeacher: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  classTimeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E7FF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  classTime: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  classRoom: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 13,
    fontStyle: 'italic',
    marginVertical: 8,
    textAlign: 'center',
  },
  gradeCard: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.lg,
    padding: 14,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  gradeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  gradeSubject: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
  },
  gradeValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  gradeAssignment: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  gradeDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  assignmentCard: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.lg,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
  },
  assignmentSubject: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  assignmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  assignmentDue: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 6,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  announcementCard: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.lg,
    padding: 14,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  announcementTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
  },
  announcementContent: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  announcementTime: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.lg,
    padding: 14,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  notificationText: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '500',
  },
  tabBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 10,
    paddingBottom: Platform.OS === 'ios' ? 12 : 0,
  },
});

// Merge profile modal styles into main styles
Object.assign(styles, {
  profileModalOverlay: profileModalStyles.overlay,
  profileModalContent: profileModalStyles.content,
  profileModalClose: profileModalStyles.close,
  profileModalHeader: profileModalStyles.header,
  profileAvatarWrapper: profileModalStyles.avatarWrapper,
  profileAvatar: profileModalStyles.avatar,
  profileAvatarFallback: profileModalStyles.avatarFallback,
  profileName: profileModalStyles.name,
  profileEmail: profileModalStyles.email,
  profileModalBody: profileModalStyles.body,
  profileInfoLabel: profileModalStyles.infoLabel,
  profileInfoValue: profileModalStyles.infoValue,
});

export default StudentDashboard;
