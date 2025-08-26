import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScrollableTabBar from '../../../components/navigation/ScrollableTabBar';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import SimpleHeader from '../../../components/navigation/SimpleHeader';
import teacherService from '../../../api/services/teacherService';
import { useAuth } from '../../../context/AuthContext';
// ✅ Import Professional Theme System
import {
  COLORS,
  TEACHER_COLORS,
  TEACHER_THEME,
  SPACING,
  BORDER_RADIUS,
} from '../../../constants/theme';

const MyClasses = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [error, setError] = useState(null);

  // Fetch classes from API
  const loadClasses = async (isRefresh = false) => {
    console.log('[MyClasses] user from useAuth:', user);
    const teacherId = user?._id || user?.id;
    if (!user || !teacherId) {
      setError('User not found. Please log in again.');
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const response = await teacherService.getTeacherClasses(teacherId);
      // The API returns { count, data, success }
      setClasses(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      setError(err.message || 'Failed to load classes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Professional Filter Logic
  const filteredClasses = classes.filter((classItem) => {
    // Defensive: skip if classItem is null/undefined
    if (!classItem) return false;
    const name = (classItem.name || '').toLowerCase();
    const subject = (classItem.subject || '').toLowerCase();
    const grade = (classItem.grade || '').toLowerCase();
    const matchesSearch =
      name.includes(searchQuery.toLowerCase()) ||
      subject.includes(searchQuery.toLowerCase()) ||
      grade.includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'morning')
      return (classItem.schedule || '').toLowerCase().includes('am');
    if (selectedFilter === 'afternoon')
      return (classItem.schedule || '').toLowerCase().includes('pm');
    if (selectedFilter === 'pending')
      return (classItem.pendingAssignments || 0) > 0;

    return true;
  });

  // ✅ Professional Navigation Handlers
  const navigateToClass = useCallback(
    (classItem) => {
      navigation.navigate('ClassDetails', {
        classId: classItem.id,
        className: classItem.name,
        classData: classItem,
      });
    },
    [navigation],
  );

  const navigateToAttendance = useCallback(
    (classItem) => {
      navigation.navigate('AttendanceTracker', {
        classId: classItem.id,
        className: classItem.name,
      });
    },
    [navigation],
  );

  const navigateToCreateAssignment = useCallback(
    (classItem) => {
      navigation.navigate('CreateAssignment', {
        classId: classItem.id,
        className: classItem.name,
      });
    },
    [navigation],
  );

  // ✅ Professional Utility Functions
  const getAttendanceColor = useCallback((percentage) => {
    if (percentage >= 95) return TEACHER_COLORS.success;
    if (percentage >= 85) return TEACHER_COLORS.warning;
    return TEACHER_COLORS.error;
  }, []);

  const getGradeColor = useCallback((grade) => {
    if (grade >= 90) return TEACHER_COLORS.gradeA;
    if (grade >= 80) return TEACHER_COLORS.gradeB;
    if (grade >= 70) return TEACHER_COLORS.gradeC;
    if (grade >= 60) return TEACHER_COLORS.gradeD;
    return TEACHER_COLORS.gradeF;
  }, []);

  const getSubjectIcon = useCallback((subject) => {
    const icons = {
      mathematics: 'calculator-outline',
      science: 'flask-outline',
      english: 'book-outline',
      history: 'library-outline',
      computer: 'desktop-outline',
    };
    return icons[subject.toLowerCase()] || 'school-outline';
  }, []);

  const getSubjectColor = useCallback((subject) => {
    return (
      COLORS.teacherPalette.subjects[subject.toLowerCase()] ||
      TEACHER_COLORS.primary
    );
  }, []);

  // ✅ Professional Header Component
  const HeaderRightComponent = () => (
    <TouchableOpacity
      style={styles.headerButton}
      onPress={() => navigation.navigate('CreateClass')}
      activeOpacity={0.8}
    >
      <Ionicons name="add" size={24} color={TEACHER_COLORS.textWhite} />
    </TouchableOpacity>
  );

  // ✅ Initialize Data
  useFocusEffect(
    useCallback(() => {
      loadClasses();
    }, [user]),
  );

  const onRefresh = useCallback(() => {
    loadClasses(true);
  }, [user]);

  // ✅ Professional Loading State
  if (loading) {
    return (
      <View style={styles.container}>
        <SimpleHeader
          title="My Classes"
          subtitle="Loading..."
          navigation={navigation}
          primaryColor={TEACHER_COLORS.primary}
          rightComponent={<HeaderRightComponent />}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={TEACHER_COLORS.primary} />
          <Text style={styles.loadingText}>Loading your classes...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <SimpleHeader
          title="My Classes"
          subtitle="Error"
          navigation={navigation}
          primaryColor={TEACHER_COLORS.primary}
          rightComponent={<HeaderRightComponent />}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{error}</Text>
          <TouchableOpacity
            onPress={() => loadClasses()}
            style={{ marginTop: 16 }}
          >
            <Text style={{ color: TEACHER_COLORS.primary, fontWeight: 'bold' }}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ✅ Professional Header */}
      <SimpleHeader
        title="My Classes"
        subtitle={`${classes.length} classes`}
        navigation={navigation}
        primaryColor={TEACHER_COLORS.primary}
        rightComponent={<HeaderRightComponent />}
      />

      {/* ✅ Professional Search and Filter */}
      <View style={styles.searchContainer}>
        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={20}
            color={TEACHER_COLORS.textMuted}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search classes, subjects, or grades..."
            placeholderTextColor={TEACHER_COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons
                name="close-circle"
                size={20}
                color={TEACHER_COLORS.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips */}
        <ScrollView
          style={styles.filterContainer}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {[
            { key: 'all', label: 'All Classes', icon: 'list-outline' },
            { key: 'morning', label: 'Morning', icon: 'sunny-outline' },
            {
              key: 'afternoon',
              label: 'Afternoon',
              icon: 'partly-sunny-outline',
            },
            { key: 'pending', label: 'Pending Work', icon: 'time-outline' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    selectedFilter === filter.key
                      ? TEACHER_COLORS.primary
                      : TEACHER_COLORS.surface,
                  borderColor:
                    selectedFilter === filter.key
                      ? TEACHER_COLORS.primary
                      : COLORS.teacherPalette.neutral.lighter,
                },
              ]}
              onPress={() => setSelectedFilter(filter.key)}
              activeOpacity={0.8}
            >
              <View style={styles.filterChipContent}>
                <Ionicons
                  name={filter.icon}
                  size={16}
                  color={
                    selectedFilter === filter.key
                      ? TEACHER_COLORS.textWhite
                      : TEACHER_COLORS.textMuted
                  }
                />
                <Text
                  style={[
                    styles.filterText,
                    {
                      color:
                        selectedFilter === filter.key
                          ? TEACHER_COLORS.textWhite
                          : TEACHER_COLORS.text,
                    },
                  ]}
                >
                  {filter.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ✅ Professional Content */}
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
        contentContainerStyle={{
          paddingBottom:
            (ScrollableTabBar.TAB_BAR_HEIGHT || 68) + (insets.bottom || 0) + 16,
        }}
      >
        {/* ✅ Professional Quick Create Button */}
        <TouchableOpacity
          style={styles.createClassButton}
          onPress={() => navigation.navigate('CreateClass')}
          activeOpacity={0.8}
        >
          <View style={styles.createClassIcon}>
            <Ionicons
              name="add-circle-outline"
              size={28}
              color={TEACHER_COLORS.primary}
            />
          </View>
          <View style={styles.createClassContent}>
            <Text style={styles.createClassTitle}>Create New Class</Text>
            <Text style={styles.createClassSubtitle}>
              Set up a new class with students and schedule
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={TEACHER_COLORS.textMuted}
          />
        </TouchableOpacity>

        {/* ✅ Professional Classes List */}
        {filteredClasses.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Ionicons
                name={searchQuery ? 'search-outline' : 'school-outline'}
                size={48}
                color={TEACHER_COLORS.textMuted}
              />
            </View>
            <Text style={styles.emptyStateTitle}>
              {searchQuery ? 'No classes found' : 'No classes yet'}
            </Text>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? 'Try adjusting your search or filter'
                : 'Create your first class to get started'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => navigation.navigate('CreateClass')}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyStateButtonText}>Create Class</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.classesList}>
            {filteredClasses.map((classItem) => (
              <TouchableOpacity
                key={classItem.id}
                style={styles.classCard}
                onPress={() => navigateToClass(classItem)}
                activeOpacity={0.8}
              >
                {/* ✅ Class Header */}
                <LinearGradient
                  colors={[
                    getSubjectColor(classItem.subject),
                    `${getSubjectColor(classItem.subject)}DD`,
                  ]}
                  style={styles.classCardHeader}
                >
                  <View style={styles.classHeaderContent}>
                    <View style={styles.classIcon}>
                      <Ionicons
                        name={getSubjectIcon(classItem.subject)}
                        size={24}
                        color={TEACHER_COLORS.textWhite}
                      />
                    </View>
                    <View style={styles.classHeaderInfo}>
                      <Text style={styles.className}>{classItem.name}</Text>
                      <Text style={styles.classSubject}>
                        {classItem.subject} • Grade {classItem.grade}
                        {classItem.section}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.quickActionButton}
                      onPress={() => navigateToAttendance(classItem)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={18}
                        color={TEACHER_COLORS.textWhite}
                      />
                    </TouchableOpacity>
                  </View>
                </LinearGradient>

                {/* ✅ Class Content */}
                <View style={styles.classCardContent}>
                  {/* Class Info */}
                  <View style={styles.classInfoSection}>
                    <View style={styles.classInfoItem}>
                      <Ionicons
                        name="people-outline"
                        size={16}
                        color={TEACHER_COLORS.primary}
                      />
                      <Text style={styles.classInfoText}>
                        {classItem.presentStudents}/{classItem.totalStudents}{' '}
                        present
                      </Text>
                    </View>
                    <View style={styles.classInfoItem}>
                      <Ionicons
                        name="time-outline"
                        size={16}
                        color={TEACHER_COLORS.textMuted}
                      />
                      <Text style={styles.classInfoText}>
                        {classItem.schedule &&
                        Array.isArray(classItem.schedule.days)
                          ? `${classItem.schedule.days.join(', ')} ${
                              classItem.schedule.time || ''
                            }`
                          : '-'}
                      </Text>
                    </View>
                    <View style={styles.classInfoItem}>
                      <Ionicons
                        name="location-outline"
                        size={16}
                        color={TEACHER_COLORS.textMuted}
                      />
                      <Text style={styles.classInfoText}>{classItem.room}</Text>
                    </View>
                  </View>

                  {/* Class Stats */}
                  <View style={styles.classStatsGrid}>
                    <View style={styles.classStatCard}>
                      <Text
                        style={[
                          styles.classStatValue,
                          {
                            color: getAttendanceColor(
                              typeof classItem.attendanceRate === 'number'
                                ? classItem.attendanceRate
                                : 0,
                            ),
                          },
                        ]}
                      >
                        {typeof classItem.attendanceRate === 'number'
                          ? `${classItem.attendanceRate.toFixed(0)}%`
                          : '-'}
                      </Text>
                      <Text style={styles.classStatLabel}>Attendance</Text>
                    </View>
                    <View style={styles.classStatCard}>
                      <Text
                        style={[
                          styles.classStatValue,
                          {
                            color: getGradeColor(
                              typeof classItem.averageGrade === 'number'
                                ? classItem.averageGrade
                                : 0,
                            ),
                          },
                        ]}
                      >
                        {typeof classItem.averageGrade === 'number'
                          ? `${classItem.averageGrade.toFixed(0)}%`
                          : '-'}
                      </Text>
                      <Text style={styles.classStatLabel}>Avg Grade</Text>
                    </View>
                    <View style={styles.classStatCard}>
                      <Text
                        style={[
                          styles.classStatValue,
                          {
                            color:
                              typeof classItem.pendingAssignments ===
                                'number' && classItem.pendingAssignments > 0
                                ? TEACHER_COLORS.warning
                                : TEACHER_COLORS.success,
                          },
                        ]}
                      >
                        {typeof classItem.pendingAssignments === 'number'
                          ? classItem.pendingAssignments
                          : 0}
                      </Text>
                      <Text style={styles.classStatLabel}>Pending</Text>
                    </View>
                  </View>

                  {/* Next Class Info */}
                  <View style={styles.nextClassContainer}>
                    <View style={styles.nextClassInfo}>
                      <Ionicons
                        name="clock-outline"
                        size={14}
                        color={TEACHER_COLORS.primary}
                      />
                      <Text style={styles.nextClassText}>
                        Next: {classItem.nextClass}
                      </Text>
                    </View>
                    {classItem.pendingAssignments > 0 && (
                      <View style={styles.pendingBadge}>
                        <Text style={styles.pendingBadgeText}>
                          {classItem.pendingAssignments} pending
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Quick Actions */}
                  <View style={styles.classActions}>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        { backgroundColor: TEACHER_COLORS.success },
                      ]}
                      onPress={() => navigateToAttendance(classItem)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="calendar"
                        size={16}
                        color={TEACHER_COLORS.textWhite}
                      />
                      <Text style={styles.actionButtonText}>Attendance</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        {
                          backgroundColor:
                            COLORS.teacherPalette.subjects.science,
                        },
                      ]}
                      onPress={() => navigateToCreateAssignment(classItem)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="add"
                        size={16}
                        color={TEACHER_COLORS.textWhite}
                      />
                      <Text style={styles.actionButtonText}>Assignment</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        { backgroundColor: TEACHER_COLORS.primary },
                      ]}
                      onPress={() => navigateToClass(classItem)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="eye"
                        size={16}
                        color={TEACHER_COLORS.textWhite}
                      />
                      <Text style={styles.actionButtonText}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* No need for static bottomPadding view anymore */}
      </ScrollView>
    </View>
  );
};

// ✅ Professional Styles using Theme System
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TEACHER_COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.textMuted,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    backgroundColor: TEACHER_COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.teacherPalette.neutral.lighter,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TEACHER_COLORS.accent,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
  },
  filterContainer: {
    maxHeight: 50,
  },
  filterContent: {
    gap: SPACING.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    minHeight: 36,
  },
  filterChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  filterText: {
    ...TEACHER_THEME.typography.caption,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  createClassButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TEACHER_COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginVertical: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.teacherPalette.neutral.lighter,
    borderStyle: 'dashed',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.teacherPalette.shadow.light,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  createClassIcon: {
    marginRight: SPACING.md,
  },
  createClassContent: {
    flex: 1,
  },
  createClassTitle: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
    fontWeight: '600',
  },
  createClassSubtitle: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
    marginTop: SPACING.xs / 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: TEACHER_COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyStateTitle: {
    ...TEACHER_THEME.typography.h3,
    color: TEACHER_COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  emptyStateButton: {
    backgroundColor: TEACHER_COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  emptyStateButtonText: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.textWhite,
    fontWeight: '600',
  },
  classesList: {
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  classCard: {
    backgroundColor: TEACHER_COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.teacherPalette.neutral.lighter,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.teacherPalette.shadow.medium,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  classCardHeader: {
    padding: SPACING.md,
  },
  classHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  classIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  classHeaderInfo: {
    flex: 1,
  },
  className: {
    ...TEACHER_THEME.typography.h4,
    color: TEACHER_COLORS.textWhite,
    fontWeight: '700',
    marginBottom: SPACING.xs / 2,
  },
  classSubject: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textWhite,
    opacity: 0.9,
  },
  quickActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  classCardContent: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  classInfoSection: {
    gap: SPACING.xs,
  },
  classInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  classInfoText: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textSecondary,
  },
  classStatsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  classStatCard: {
    flex: 1,
    backgroundColor: TEACHER_COLORS.accent,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  classStatValue: {
    ...TEACHER_THEME.typography.h4,
    fontWeight: '700',
  },
  classStatLabel: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
    marginTop: SPACING.xs / 2,
  },
  nextClassContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextClassInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  nextClassText: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.primary,
    fontWeight: '500',
  },
  pendingBadge: {
    backgroundColor: TEACHER_COLORS.warning,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.lg,
  },
  pendingBadgeText: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textWhite,
    fontWeight: '600',
  },
  classActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  actionButtonText: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textWhite,
    fontWeight: '600',
  },
  bottomPadding: {
    height: SPACING.xl,
  },
});

export default MyClasses;
