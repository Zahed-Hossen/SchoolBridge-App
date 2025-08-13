import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import AppHeader from '../../components/navigation/AppHeader';
// ✅ Import Professional Theme System
import {
  COLORS,
  TEACHER_COLORS,
  TEACHER_THEME,
  SPACING,
  BORDER_RADIUS
} from '../../constants/theme';

const TeacherDashboard = ({ navigation }) => {
  // ✅ Professional State Management
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    recentClasses: [],
    upcomingAssignments: [],
    notifications: [],
  });

  // ✅ API Integration (Commented for Backend Development)
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 🔄 TODO: Replace with actual API calls
      /*
      const response = await fetch('/api/teacher/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setDashboardData(data);
      */

      // ✅ Minimal Mock Data (for development)
      setTimeout(() => {
        setDashboardData({
          stats: {
            totalClasses: 4,
            totalStudents: 89,
            pendingGrading: 12,
            todayAttendance: 94.2,
          },
          recentClasses: [
            {
              id: 1,
              name: 'Calculus AP',
              subject: 'Mathematics',
              students: 28,
              nextClass: 'Today, 10:00 AM',
              room: 'Room 204',
            },
            {
              id: 2,
              name: 'Algebra II',
              subject: 'Mathematics',
              students: 24,
              nextClass: 'Tomorrow, 2:00 PM',
              room: 'Room 201',
            },
          ],
          upcomingAssignments: [
            {
              id: 1,
              title: 'Quadratic Functions Quiz',
              dueDate: '2025-08-08',
              submissions: 18,
              totalStudents: 28,
            },
          ],
          notifications: [
            {
              id: 1,
              type: 'assignment',
              message: 'New assignment submissions ready for review',
              count: 5,
            },
          ],
        });
        setLoading(false);
      }, 800);

    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
      setLoading(false);
    }
  };

  // ✅ Professional Data Fetching
  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  // ✅ Professional Refresh Handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  }, []);

  // ✅ Professional Quick Actions
  const handleQuickAction = useCallback((action) => {
    const actions = {
      assignments: () => navigation.navigate('TeacherAssignments'),
      grading: () => navigation.navigate('GradingDashboard'),
      classes: () => navigation.navigate('MyClasses'),
      attendance: () => navigation.navigate('AttendanceTracker'),
      analytics: () => navigation.navigate('Analytics'),
      schedule: () => navigation.navigate('Schedule'),
    };

    if (actions[action]) {
      actions[action]();
    } else {
      console.log(`Action: ${action}`);
    }
  }, [navigation]);

  // ✅ Professional Loading State
  if (loading && !dashboardData.stats) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={TEACHER_COLORS.primary} barStyle="light-content" translucent={false} />
        <AppHeader title="SchoolBridge" subtitle="Welcome back" navigation={navigation} userRole="Teacher" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={TEACHER_COLORS.primary} />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ✅ Professional Status Bar */}
      <StatusBar
        backgroundColor={TEACHER_COLORS.primary}
        barStyle="light-content"
        translucent={false}
      />

      {/* ✅ Professional Header */}
      <AppHeader
        title="SchoolBridge"
        subtitle="Welcome back"
        navigation={navigation}
        userRole="Teacher"
      />

      {/* ✅ Professional Dashboard Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={TEACHER_COLORS.primary}
            colors={[TEACHER_COLORS.primary]}
            progressBackgroundColor={TEACHER_COLORS.surface}
          />
        }
      >
        {/* ✅ Professional Stats Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="analytics-outline" size={24} color={TEACHER_COLORS.primary} />
            <Text style={styles.sectionTitle}>Today's Overview</Text>
          </View>

          <View style={styles.statsContainer}>
            <TouchableOpacity
              style={[styles.statCard, styles.primaryStatCard]}
              onPress={() => handleQuickAction('classes')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[TEACHER_COLORS.primary, TEACHER_COLORS.primaryLight]}
                style={styles.statGradient}
              >
                <View style={styles.statIcon}>
                  <Ionicons name="school" size={28} color={TEACHER_COLORS.textWhite} />
                </View>
                <Text style={styles.primaryStatValue}>{dashboardData.stats?.totalClasses || 0}</Text>
                <Text style={styles.primaryStatLabel}>Active Classes</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.statsGrid}>
              <TouchableOpacity
                style={[styles.statCard, styles.secondaryStatCard, { borderLeftColor: TEACHER_COLORS.success }]}
                onPress={() => handleQuickAction('attendance')}
                activeOpacity={0.8}
              >
                <Text style={styles.statValue}>{dashboardData.stats?.totalStudents || 0}</Text>
                <Text style={styles.statLabel}>Total Students</Text>
                <View style={styles.statTrend}>
                  <Ionicons name="trending-up" size={16} color={TEACHER_COLORS.success} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statCard, styles.secondaryStatCard, { borderLeftColor: TEACHER_COLORS.warning }]}
                onPress={() => handleQuickAction('grading')}
                activeOpacity={0.8}
              >
                <Text style={styles.statValue}>{dashboardData.stats?.pendingGrading || 0}</Text>
                <Text style={styles.statLabel}>Pending Grading</Text>
                {(dashboardData.stats?.pendingGrading || 0) > 0 && (
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentText}>!</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statCard, styles.secondaryStatCard, { borderLeftColor: COLORS.teacherPalette.subjects.science }]}
                onPress={() => handleQuickAction('analytics')}
                activeOpacity={0.8}
              >
                <Text style={styles.statValue}>{dashboardData.stats?.todayAttendance || 0}%</Text>
                <Text style={styles.statLabel}>Attendance Rate</Text>
                <View style={styles.statTrend}>
                  <Ionicons name="checkmark-circle" size={16} color={TEACHER_COLORS.success} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ✅ Professional Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash-outline" size={24} color={TEACHER_COLORS.primary} />
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>

          <View style={styles.quickActionsGrid}>
            {[
              {
                action: 'assignments',
                icon: 'document-text-outline',
                label: 'Assignments',
                color: COLORS.teacherPalette.subjects.science,
                description: 'Create & manage'
              },
              {
                action: 'grading',
                icon: 'star-outline',
                label: 'Grading',
                color: TEACHER_COLORS.warning,
                description: 'Review submissions'
              },
              {
                action: 'attendance',
                icon: 'people-outline',
                label: 'Attendance',
                color: TEACHER_COLORS.success,
                description: 'Track presence'
              },
              {
                action: 'analytics',
                icon: 'bar-chart-outline',
                label: 'Analytics',
                color: COLORS.teacherPalette.subjects.mathematics,
                description: 'View insights'
              },
            ].map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickActionCard}
                onPress={() => handleQuickAction(item.action)}
                activeOpacity={0.8}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${item.color}15` }]}>
                  <Ionicons name={item.icon} size={28} color={item.color} />
                </View>
                <Text style={styles.quickActionLabel}>{item.label}</Text>
                <Text style={styles.quickActionDescription}>{item.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ✅ Professional Recent Classes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time-outline" size={24} color={TEACHER_COLORS.primary} />
            <Text style={styles.sectionTitle}>Today's Classes</Text>
            <TouchableOpacity onPress={() => handleQuickAction('classes')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {dashboardData.recentClasses?.map((classItem) => (
            <TouchableOpacity
              key={classItem.id}
              style={styles.classCard}
              onPress={() =>
                navigation.navigate('ClassDetails', {
                  classId: classItem.id,
                  className: classItem.name,
                })
              }
              activeOpacity={0.8}
            >
              <View style={styles.classCardContent}>
                <View style={styles.classInfo}>
                  <View style={styles.classHeader}>
                    <Text style={styles.className}>{classItem.name}</Text>
                    <View style={styles.classStudentCount}>
                      <Ionicons name="people" size={14} color={TEACHER_COLORS.textMuted} />
                      <Text style={styles.studentCount}>{classItem.students}</Text>
                    </View>
                  </View>
                  <Text style={styles.classSubject}>{classItem.subject}</Text>
                  <View style={styles.classDetails}>
                    <View style={styles.classTime}>
                      <Ionicons name="time" size={14} color={TEACHER_COLORS.primary} />
                      <Text style={styles.classSchedule}>{classItem.nextClass}</Text>
                    </View>
                    <View style={styles.classRoom}>
                      <Ionicons name="location" size={14} color={TEACHER_COLORS.textMuted} />
                      <Text style={styles.roomText}>{classItem.room}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.classAction}>
                  <Ionicons name="chevron-forward" size={20} color={TEACHER_COLORS.textMuted} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ✅ Professional Upcoming Assignments */}
        {dashboardData.upcomingAssignments?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar-outline" size={24} color={TEACHER_COLORS.primary} />
              <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>
              <TouchableOpacity onPress={() => handleQuickAction('assignments')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {dashboardData.upcomingAssignments.map((assignment) => (
              <TouchableOpacity
                key={assignment.id}
                style={styles.assignmentCard}
                onPress={() => navigation.navigate('AssignmentDetails', { assignmentId: assignment.id })}
                activeOpacity={0.8}
              >
                <View style={styles.assignmentInfo}>
                  <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                  <Text style={styles.assignmentDue}>Due: {new Date(assignment.dueDate).toLocaleDateString()}</Text>
                  <View style={styles.submissionProgress}>
                    <Text style={styles.submissionText}>
                      {assignment.submissions}/{assignment.totalStudents} submitted
                    </Text>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${(assignment.submissions / assignment.totalStudents) * 100}%`,
                            backgroundColor: TEACHER_COLORS.success
                          }
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Bottom padding for tab bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

// ✅ Professional Styles using Theme System
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TEACHER_COLORS.primary,
  },
  content: {
    flex: 1,
    backgroundColor: TEACHER_COLORS.background,
    paddingHorizontal: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: TEACHER_COLORS.background,
  },
  loadingText: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.textMuted,
    marginTop: SPACING.md,
  },
  section: {
    marginVertical: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEACHER_THEME.typography.h4,
    color: TEACHER_COLORS.text,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  viewAllText: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.primary,
    fontWeight: '600',
  },
  statsContainer: {
    gap: SPACING.md,
  },
  primaryStatCard: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: TEACHER_COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  statGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  statIcon: {
    marginBottom: SPACING.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statCard: {
    backgroundColor: TEACHER_COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
  },
  secondaryStatCard: {
    flex: 1,
    minWidth: '45%',
    padding: SPACING.md,
    borderLeftWidth: 4,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.teacherPalette.shadow.light,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statValue: {
    ...TEACHER_THEME.typography.h2,
    color: TEACHER_COLORS.text,
    fontWeight: '700',
  },
  statLabel: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.text,
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  primaryStatValue: {
    ...TEACHER_THEME.typography.h2,
    color: TEACHER_COLORS.textWhite,
    fontWeight: '700',
  },
  primaryStatLabel: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textWhite,
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  statTrend: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  urgentBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: TEACHER_COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  urgentText: {
    color: TEACHER_COLORS.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: TEACHER_COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.teacherPalette.neutral.lighter,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.teacherPalette.shadow.light,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionLabel: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  quickActionDescription: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  classCard: {
    backgroundColor: TEACHER_COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.teacherPalette.neutral.lighter,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.teacherPalette.shadow.light,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  classCardContent: {
    flexDirection: 'row',
    padding: SPACING.md,
    alignItems: 'center',
  },
  classInfo: {
    flex: 1,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  className: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
    fontWeight: '600',
    flex: 1,
  },
  classStudentCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs / 2,
  },
  studentCount: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
    fontWeight: '500',
  },
  classSubject: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  classDetails: {
    gap: SPACING.xs,
  },
  classTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  classSchedule: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.primary,
    fontWeight: '500',
  },
  classRoom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  roomText: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textMuted,
  },
  classAction: {
    padding: SPACING.xs,
  },
  assignmentCard: {
    backgroundColor: TEACHER_COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeft: `4px solid ${TEACHER_COLORS.warning}`,
    borderWidth: 1,
    borderColor: COLORS.teacherPalette.neutral.lighter,
  },
  assignmentInfo: {
    gap: SPACING.xs,
  },
  assignmentTitle: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
    fontWeight: '600',
  },
  assignmentDue: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.warning,
    fontWeight: '500',
  },
  submissionProgress: {
    marginTop: SPACING.xs,
  },
  submissionText: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.teacherPalette.neutral.lighter,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  bottomPadding: {
    height: SPACING.xl,
  },
});

export default TeacherDashboard;
