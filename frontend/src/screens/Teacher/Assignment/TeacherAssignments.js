import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import SimpleHeader from '../../../components/navigation/SimpleHeader';
import { useAuth } from '../../../context/AuthContext';
import teacherService from '../../../api/services/teacherService';

import {
  COLORS,
  TEACHER_COLORS,
  TEACHER_THEME,
  SPACING,
  BORDER_RADIUS,
} from '../../../constants/theme';

const TeacherAssignments = ({ navigation }) => {
  // ✅ Professional State Management
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { user } = useAuth();

  // ✅ API Integration (Real Backend)
  const loadAssignments = async (isRefresh = false) => {
    if (!user || !user.id) {
      setAssignments([]);
      setLoading(false);
      setRefreshing(false);
      console.log('[TeacherAssignments] No user or user.id:', user);
      return;
    }
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      // Fetch assignments from /api/teachers/:teacherId/assignments
      const response = await teacherService.getTeacherAssignments(user.id);
      console.log('[TeacherAssignments] API response:', response);
      // API returns { success, count, data: [assignments] }
      let assignmentsArr = Array.isArray(response?.data) ? response.data : [];
      console.log(
        '[TeacherAssignments] assignmentsArr after API:',
        assignmentsArr,
      );
      // Map backend fields to frontend expected fields
      assignmentsArr = assignmentsArr.map((a) => ({
        id: a._id,
        title: a.title,
        description: a.description,
        dueDate: a.dueDate,
        className: a.class?.name || 'Unknown',
        classId: a.class?._id || a.class || 'Unknown',
        type: a.type || 'assignment',
        totalPoints: a.maxPoints || a.totalPoints || 100,
        submissionsCount: Array.isArray(a.submissions)
          ? a.submissions.length
          : 0,
        gradedCount: Array.isArray(a.submissions)
          ? a.submissions.filter((s) => typeof s.grade === 'number').length
          : 0,
        averageGrade:
          Array.isArray(a.submissions) && a.submissions.length > 0
            ? a.submissions.reduce((sum, s) => sum + (s.grade || 0), 0) /
                a.submissions.filter((s) => typeof s.grade === 'number')
                  .length || 1
            : 0,
        status: a.isPublished ? 'active' : 'draft',
        createdDate: a.createdAt,
        instructions: a.instructions || '',
      }));
      console.log(
        '[TeacherAssignments] assignmentsArr after mapping:',
        assignmentsArr,
      );
      setAssignments(assignmentsArr);
    } catch (error) {
      console.error('❌ Error loading assignments:', error);
      Alert.alert('Error', 'Failed to load assignments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Professional Navigation Handlers
  const navigateToCreateAssignment = useCallback(() => {
    navigation.navigate('CreateAssignment');
  }, [navigation]);

  const navigateToAssignmentDetails = useCallback(
    (assignment) => {
      navigation.navigate('AssignmentDetails', {
        assignmentId: assignment.id,
        assignment: assignment,
      });
    },
    [navigation],
  );

  // ✅ Professional Utility Functions
  const formatDueDate = useCallback((dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due Today';
    if (diffDays === 1) return 'Due Tomorrow';
    return `Due in ${diffDays} days`;
  }, []);

  const getStatusColor = useCallback((assignment) => {
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();

    if (assignment.status === 'completed') return TEACHER_COLORS.success;
    if (dueDate < now) return TEACHER_COLORS.error;
    if (assignment.gradedCount < assignment.submissionsCount)
      return TEACHER_COLORS.warning;
    return TEACHER_COLORS.primary;
  }, []);

  const getTypeIcon = useCallback((type) => {
    const icons = {
      quiz: 'help-circle-outline',
      homework: 'book-outline',
      test: 'document-text-outline',
      project: 'briefcase-outline',
      lab: 'flask-outline',
    };
    return icons[type] || 'document-outline';
  }, []);

  const getTypeColor = useCallback((type) => {
    const colors = {
      quiz: COLORS.teacherPalette.subjects.mathematics,
      homework: COLORS.teacherPalette.subjects.english,
      test: COLORS.teacherPalette.subjects.science,
      project: COLORS.teacherPalette.subjects.computer,
      lab: COLORS.teacherPalette.subjects.science,
    };
    return colors[type] || TEACHER_COLORS.primary;
  }, []);

  // ✅ Professional Filter Logic
  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.className.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterType === 'all') return matchesSearch;
    if (filterType === 'active')
      return matchesSearch && assignment.status === 'active';
    if (filterType === 'overdue')
      return matchesSearch && new Date(assignment.dueDate) < new Date();
    if (filterType === 'pending')
      return (
        matchesSearch && assignment.gradedCount < assignment.submissionsCount
      );
    if (filterType === 'completed')
      return matchesSearch && assignment.status === 'completed';

    return matchesSearch;
  });

  // ✅ Professional Filter Configuration
  const getFilterData = useCallback(
    () => [
      {
        key: 'all',
        label: 'All',
        count: assignments.length,
        icon: 'list-outline',
      },
      {
        key: 'active',
        label: 'Active',
        count: assignments.filter((a) => a.status === 'active').length,
        icon: 'play-circle-outline',
      },
      {
        key: 'pending',
        label: 'Pending',
        count: assignments.filter((a) => a.gradedCount < a.submissionsCount)
          .length,
        icon: 'time-outline',
      },
      {
        key: 'overdue',
        label: 'Overdue',
        count: assignments.filter((a) => new Date(a.dueDate) < new Date())
          .length,
        icon: 'warning-outline',
      },
      {
        key: 'completed',
        label: 'Completed',
        count: assignments.filter((a) => a.status === 'completed').length,
        icon: 'checkmark-circle-outline',
      },
    ],
    [assignments],
  );

  // ✅ Professional Header Actions
  const HeaderRightComponent = () => (
    <TouchableOpacity
      style={styles.headerButton}
      onPress={navigateToCreateAssignment}
      activeOpacity={0.8}
    >
      <Ionicons name="add" size={24} color={TEACHER_COLORS.textWhite} />
    </TouchableOpacity>
  );

  // ✅ Initialize Data
  useFocusEffect(
    useCallback(() => {
      loadAssignments();
    }, []),
  );

  const onRefresh = useCallback(() => {
    loadAssignments(true);
  }, []);

  // ✅ Professional Loading State
  if (loading) {
    return (
      <View style={styles.container}>
        <SimpleHeader
          title="Assignments"
          subtitle="Loading..."
          navigation={navigation}
          primaryColor={TEACHER_COLORS.primary}
          rightAction={<HeaderRightComponent />}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={TEACHER_COLORS.primary} />
          <Text style={styles.loadingText}>Loading assignments...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ✅ Professional Header */}
      <SimpleHeader
        title="Assignments"
        subtitle={`${assignments.length} assignments`}
        navigation={navigation}
        primaryColor={TEACHER_COLORS.primary}
        rightAction={<HeaderRightComponent />}
      />

      {/* ✅ Professional Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={20}
            color={TEACHER_COLORS.textMuted}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search assignments or classes..."
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
      </View>

      {/* ✅ Professional Filter Chips */}
      <ScrollView
        style={styles.filterContainer}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContent}
      >
        {getFilterData().map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  filterType === filter.key
                    ? TEACHER_COLORS.primary
                    : TEACHER_COLORS.surface,
                borderColor:
                  filterType === filter.key
                    ? TEACHER_COLORS.primary
                    : COLORS.teacherPalette.neutral.lighter,
              },
            ]}
            onPress={() => setFilterType(filter.key)}
            activeOpacity={0.8}
          >
            <View style={styles.filterChipContent}>
              <Ionicons
                name={filter.icon}
                size={16}
                color={
                  filterType === filter.key
                    ? TEACHER_COLORS.textWhite
                    : TEACHER_COLORS.textMuted
                }
              />
              <Text
                style={[
                  styles.filterText,
                  {
                    color:
                      filterType === filter.key
                        ? TEACHER_COLORS.textWhite
                        : TEACHER_COLORS.text,
                  },
                ]}
              >
                {filter.label}
              </Text>
              {filter.count > 0 && (
                <View
                  style={[
                    styles.filterBadge,
                    {
                      backgroundColor:
                        filterType === filter.key
                          ? TEACHER_COLORS.textWhite
                          : TEACHER_COLORS.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterBadgeText,
                      {
                        color:
                          filterType === filter.key
                            ? TEACHER_COLORS.primary
                            : TEACHER_COLORS.textWhite,
                      },
                    ]}
                  >
                    {filter.count}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
      >
        {/* ✅ Professional Quick Create Button */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={navigateToCreateAssignment}
          activeOpacity={0.8}
        >
          <View style={styles.createButtonIcon}>
            <Ionicons
              name="add-circle-outline"
              size={28}
              color={TEACHER_COLORS.primary}
            />
          </View>
          <View style={styles.createButtonContent}>
            <Text style={styles.createButtonTitle}>Create New Assignment</Text>
            <Text style={styles.createButtonSubtitle}>
              Add homework, quizzes, tests & projects
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={TEACHER_COLORS.textMuted}
          />
        </TouchableOpacity>

        {/* ✅ Professional Assignments List */}
        {filteredAssignments.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Ionicons
                name={searchQuery ? 'search-outline' : 'document-text-outline'}
                size={48}
                color={TEACHER_COLORS.textMuted}
              />
            </View>
            <Text style={styles.emptyStateTitle}>
              {searchQuery ? 'No assignments found' : 'No assignments yet'}
            </Text>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? 'Try adjusting your search or filter'
                : 'Create your first assignment to get started'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={navigateToCreateAssignment}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyStateButtonText}>
                  Create Assignment
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.assignmentsList}>
            {filteredAssignments.map((assignment) => (
              <TouchableOpacity
                key={assignment.id}
                style={styles.assignmentCard}
                onPress={() => navigateToAssignmentDetails(assignment)}
                activeOpacity={0.8}
              >
                <View style={styles.assignmentCardContent}>
                  {/* ✅ Assignment Header */}
                  <View style={styles.assignmentHeader}>
                    <View
                      style={[
                        styles.assignmentTypeIcon,
                        {
                          backgroundColor: `${getTypeColor(assignment.type)}15`,
                        },
                      ]}
                    >
                      <Ionicons
                        name={getTypeIcon(assignment.type)}
                        size={20}
                        color={getTypeColor(assignment.type)}
                      />
                    </View>
                    <View style={styles.assignmentInfo}>
                      <Text style={styles.assignmentTitle} numberOfLines={1}>
                        {assignment.title}
                      </Text>
                      <View style={styles.assignmentMeta}>
                        <Text style={styles.assignmentClass}>
                          {assignment.className}
                        </Text>
                        <Text style={styles.assignmentSeparator}>•</Text>
                        <Text style={styles.assignmentType}>
                          {assignment.type.charAt(0).toUpperCase() +
                            assignment.type.slice(1)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.assignmentPoints}>
                      <Text style={styles.pointsValue}>
                        {assignment.totalPoints}
                      </Text>
                      <Text style={styles.pointsLabel}>pts</Text>
                    </View>
                  </View>

                  {/* ✅ Assignment Details */}
                  <View style={styles.assignmentDetails}>
                    <View style={styles.dueDateContainer}>
                      <Ionicons
                        name="time-outline"
                        size={14}
                        color={getStatusColor(assignment)}
                      />
                      <Text
                        style={[
                          styles.assignmentDue,
                          { color: getStatusColor(assignment) },
                        ]}
                      >
                        {formatDueDate(assignment.dueDate)}
                      </Text>
                    </View>

                    <View style={styles.progressContainer}>
                      <View style={styles.progressInfo}>
                        <Text style={styles.progressText}>
                          Progress: {assignment.gradedCount}/
                          {assignment.submissionsCount}
                        </Text>
                        <Text style={styles.progressPercentage}>
                          {assignment.submissionsCount > 0
                            ? Math.round(
                                (assignment.gradedCount /
                                  assignment.submissionsCount) *
                                  100,
                              )
                            : 0}
                          %
                        </Text>
                      </View>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width:
                                assignment.submissionsCount > 0
                                  ? `${
                                      (assignment.gradedCount /
                                        assignment.submissionsCount) *
                                      100
                                    }%`
                                  : '0%',
                              backgroundColor: getStatusColor(assignment),
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>

                  {/* ✅ Status Indicators */}
                  <View style={styles.assignmentFooter}>
                    <View style={styles.statusIndicators}>
                      {assignment.status === 'completed' && (
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: TEACHER_COLORS.success },
                          ]}
                        >
                          <Ionicons
                            name="checkmark"
                            size={12}
                            color={TEACHER_COLORS.textWhite}
                          />
                          <Text style={styles.statusBadgeText}>Completed</Text>
                        </View>
                      )}
                      {new Date(assignment.dueDate) < new Date() &&
                        assignment.status !== 'completed' && (
                          <View
                            style={[
                              styles.statusBadge,
                              { backgroundColor: TEACHER_COLORS.error },
                            ]}
                          >
                            <Ionicons
                              name="warning"
                              size={12}
                              color={TEACHER_COLORS.textWhite}
                            />
                            <Text style={styles.statusBadgeText}>Overdue</Text>
                          </View>
                        )}
                      {assignment.gradedCount < assignment.submissionsCount &&
                        assignment.status === 'active' && (
                          <View
                            style={[
                              styles.statusBadge,
                              { backgroundColor: TEACHER_COLORS.warning },
                            ]}
                          >
                            <Ionicons
                              name="time"
                              size={12}
                              color={TEACHER_COLORS.textWhite}
                            />
                            <Text style={styles.statusBadgeText}>Pending</Text>
                          </View>
                        )}
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={TEACHER_COLORS.textMuted}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.bottomPadding} />
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
  },
  searchInput: {
    flex: 1,
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
  },
  filterContainer: {
    backgroundColor: TEACHER_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.teacherPalette.neutral.lighter,
    maxHeight: 60,
  },
  filterContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
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
  filterBadge: {
    borderRadius: BORDER_RADIUS.round,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs / 2,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  createButton: {
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
  createButtonIcon: {
    marginRight: SPACING.md,
  },
  createButtonContent: {
    flex: 1,
  },
  createButtonTitle: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
    fontWeight: '600',
  },
  createButtonSubtitle: {
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
  assignmentsList: {
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  assignmentCard: {
    backgroundColor: TEACHER_COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
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
  assignmentCardContent: {
    padding: SPACING.md,
  },
  assignmentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  assignmentTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentTitle: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs / 2,
  },
  assignmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  assignmentClass: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textSecondary,
    fontWeight: '500',
  },
  assignmentSeparator: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
  },
  assignmentType: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
  },
  assignmentPoints: {
    alignItems: 'center',
  },
  pointsValue: {
    ...TEACHER_THEME.typography.h4,
    color: TEACHER_COLORS.text,
    fontWeight: '700',
  },
  pointsLabel: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
  },
  assignmentDetails: {
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  assignmentDue: {
    ...TEACHER_THEME.typography.caption,
    fontWeight: '500',
  },
  progressContainer: {
    gap: SPACING.xs,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
  },
  progressPercentage: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.text,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.teacherPalette.neutral.lighter,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  assignmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusIndicators: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.xs / 2,
  },
  statusBadgeText: {
    fontSize: 10,
    color: TEACHER_COLORS.textWhite,
    fontWeight: '600',
  },
  bottomPadding: {
    height: SPACING.xl,
  },
});

export default TeacherAssignments;
