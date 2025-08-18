import React, { useState, useCallback } from 'react';
// import { SafeAreaView } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Platform,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';
import { useTenant } from '../../context/TenantContext';
import {
  COLORS,
  TEACHER_COLORS,
  TEACHER_THEME,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  getRoleColors,
} from '../../constants/theme';
import { studentService } from '../../api/services/studentService';

const StudentAssignments = ({ navigation }) => {
  const { user } = useAuth();
  const { roleTheme } = useRole();
  const { tenantBranding } = useTenant();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Load assignments
  const loadAssignments = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      // TODO: Replace with real API call
      const response = await studentService.getAssignments();
      if (response.success && response.data) {
        setAssignments(response.data.assignments);
      } else {
        setAssignments(getMockAssignments());
      }
    } catch (error) {
      setAssignments(getMockAssignments());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Mock assignments for development
  const getMockAssignments = () => [
    {
      id: 1,
      title: 'Calculus Problem Set 6',
      subject: 'Mathematics',
      dueDate: '2025-08-15T23:59:00Z',
      totalPoints: 100,
      status: 'pending',
      priority: 'high',
      submitted: false,
    },
    {
      id: 2,
      title: 'English Essay',
      subject: 'English',
      dueDate: '2025-08-18T23:59:00Z',
      totalPoints: 80,
      status: 'pending',
      priority: 'medium',
      submitted: true,
    },
    {
      id: 3,
      title: 'Science Project',
      subject: 'Physics',
      dueDate: '2025-08-20T23:59:00Z',
      totalPoints: 120,
      status: 'graded',
      priority: 'low',
      submitted: true,
      grade: 92,
    },
  ];

  // Filter and search logic
  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch = a.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'pending')
      return a.status === 'pending' && matchesSearch;
    if (filterType === 'submitted') return a.submitted && matchesSearch;
    if (filterType === 'graded') return a.status === 'graded' && matchesSearch;
    return matchesSearch;
  });

  // Filter config
  const filterData = [
    { key: 'all', label: 'All', icon: 'list-outline' },
    { key: 'pending', label: 'Pending', icon: 'time-outline' },
    { key: 'submitted', label: 'Submitted', icon: 'checkmark-done-outline' },
    { key: 'graded', label: 'Graded', icon: 'star-outline' },
  ];

  // Format date
  const formatDueDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  useFocusEffect(
    useCallback(() => {
      loadAssignments();
    }, []),
  );

  const onRefresh = useCallback(() => {
    loadAssignments(true);
  }, []);

  // Assignment card
  const AssignmentCard = ({ assignment }) => (
    <TouchableOpacity
      style={styles.assignmentCard}
      onPress={() =>
        navigation.navigate('AssignmentDetails', {
          assignmentId: assignment.id,
          assignment,
        })
      }
      activeOpacity={0.85}
    >
      <View style={styles.assignmentHeader}>
        <Ionicons
          name="book-outline"
          size={28}
          color={COLORS.student}
          style={styles.assignmentIcon}
        />
        <View style={styles.assignmentInfo}>
          <Text style={styles.assignmentTitle}>{assignment.title}</Text>
          <Text style={styles.assignmentMeta}>
            {assignment.subject} • {assignment.totalPoints} pts
          </Text>
        </View>
        <View style={styles.assignmentStatus}>
          {assignment.status === 'graded' ? (
            <View style={styles.gradeBadge}>
              <Ionicons name="star" size={16} color={COLORS.white} />
              <Text style={styles.gradeText}>{assignment.grade}%</Text>
            </View>
          ) : assignment.submitted ? (
            <View style={styles.submittedBadge}>
              <Ionicons name="checkmark-done" size={16} color={COLORS.white} />
              <Text style={styles.submittedText}>Submitted</Text>
            </View>
          ) : (
            <View style={styles.pendingBadge}>
              <Ionicons name="time" size={16} color={COLORS.white} />
              <Text style={styles.pendingText}>Pending</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.assignmentFooter}>
        <Ionicons name="calendar" size={16} color={COLORS.student} />
        <Text style={styles.dueDate}>
          Due {formatDueDate(assignment.dueDate)}
        </Text>
        <View
          style={[
            styles.priorityDot,
            { backgroundColor: getPriorityColor(assignment.priority) },
          ]}
        />
      </View>
    </TouchableOpacity>
  );

  // Priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#E74C3C';
      case 'medium':
        return '#F39C12';
      case 'low':
        return '#27AE60';
      default:
        return '#95A5A6';
    }
  };

  // Main render
  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: COLORS.student }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Assignments</Text>
        </View>
      </SafeAreaView>
      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={COLORS.grey.medium} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search assignments..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.grey.medium}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {filterData.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                filterType === filter.key && styles.activeFilterChip,
              ]}
              onPress={() => setFilterType(filter.key)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={filter.icon}
                size={16}
                color={
                  filterType === filter.key ? COLORS.white : COLORS.grey.medium
                }
              />
              <Text
                style={[
                  styles.filterText,
                  filterType === filter.key && styles.activeFilterText,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {/* Assignment List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.student} />
          <Text style={styles.loadingText}>Loading assignments...</Text>
        </View>
      ) : filteredAssignments.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="document-text-outline"
            size={64}
            color={COLORS.grey.medium}
          />
          <Text style={styles.emptyStateTitle}>No Assignments</Text>
          <Text style={styles.emptyStateText}>
            You have no assignments in this category.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.student}
            />
          }
        >
          {filteredAssignments.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))}
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: COLORS.student,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  searchContainer: {
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey.light,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.grey.light,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.primary,
    marginLeft: 8,
  },
  filterScroll: {
    flexGrow: 0,
    marginBottom: 4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.grey.light,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: COLORS.student,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.grey.medium,
    marginLeft: 6,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.grey.medium,
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: 16,
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 15,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  list: {
    flex: 1,
    paddingHorizontal: 8,
  },
  assignmentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  assignmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  assignmentIcon: {
    marginRight: 12,
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  assignmentMeta: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  assignmentStatus: {
    alignItems: 'flex-end',
  },
  gradeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27AE60',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  gradeText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 4,
    fontSize: 13,
  },
  submittedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.student,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  submittedText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 13,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F39C12',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pendingText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 13,
  },
  assignmentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dueDate: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginLeft: 6,
    marginRight: 8,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 'auto',
  },
  bottomPadding: {
    height: 32,
  },
});

export default StudentAssignments;
