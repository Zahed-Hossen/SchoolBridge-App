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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import SimpleHeader from '../../../components/navigation/SimpleHeader';
// ✅ Import Professional Theme System
import {
  COLORS,
  TEACHER_COLORS,
  TEACHER_THEME,
  SPACING,
  BORDER_RADIUS,
} from '../../../constants/theme';

const AssignmentDetails = ({ navigation, route }) => {
  const { assignmentId, assignment: passedAssignment } = route.params || {};

  // ✅ Professional State Management
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // ✅ API Integration (Commented for Backend Development)
  const loadAssignmentData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      // 🔄 TODO: Replace with actual API calls
      /*
      const [assignmentRes, submissionsRes] = await Promise.all([
        fetch(`/api/teacher/assignments/${assignmentId}`, {
          headers: { 'Authorization': `Bearer ${userToken}` }
        }),
        fetch(`/api/teacher/assignments/${assignmentId}/submissions`, {
          headers: { 'Authorization': `Bearer ${userToken}` }
        })
      ]);
      const assignmentData = await assignmentRes.json();
      const submissionsData = await submissionsRes.json();
      setAssignment(assignmentData);
      setSubmissions(submissionsData);
      */

      // ✅ Minimal Mock Data (for development)
      setTimeout(() => {
        const assignmentData =
          passedAssignment || createAssignmentFromId(assignmentId);
        setAssignment(assignmentData);
        setSubmissions(getMockSubmissions());
        setLoading(false);
        setRefreshing(false);
      }, 800);
    } catch (error) {
      console.error('❌ Error loading assignment:', error);
      Alert.alert('Error', 'Failed to load assignment details');
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Create assignment data from ID (if not passed)
  const createAssignmentFromId = (id) => {
    const assignments = {
      1: {
        id: 1,
        title: 'Quadratic Functions Quiz',
        description:
          'Complete exercises on quadratic equations and graphing. Show all work for partial credit.',
        type: 'Quiz',
        totalPoints: 100,
        dueDate: '2025-08-10T23:59:00Z',
        createdDate: '2025-08-01T10:00:00Z',
        className: 'Calculus AP',
        classId: 'calc-ap-001',
        submissionsCount: 28,
        gradedCount: 18,
        averageGrade: 82.5,
        status: 'active',
        instructions:
          'Answer all questions. Use graphing calculator where needed.',
      },
      2: {
        id: 2,
        title: 'Physics Lab Report',
        description:
          "Complete lab report on Newton's laws experiment conducted in class.",
        type: 'Lab Report',
        totalPoints: 150,
        dueDate: '2025-08-15T23:59:00Z',
        createdDate: '2025-08-05T14:30:00Z',
        className: 'Physics 11B',
        classId: 'phys-11b-002',
        submissionsCount: 24,
        gradedCount: 8,
        averageGrade: 88.2,
        status: 'active',
        instructions:
          'Include hypothesis, methodology, results, and conclusion.',
      },
    };

    return (
      assignments[id] || {
        id: id,
        title: 'Assignment Not Found',
        description: 'This assignment could not be loaded.',
        type: 'Unknown',
        totalPoints: 0,
        dueDate: new Date().toISOString(),
        createdDate: new Date().toISOString(),
        className: 'Unknown Class',
        classId: 'unknown',
        submissionsCount: 0,
        gradedCount: 0,
        averageGrade: 0,
        status: 'unknown',
        instructions: '',
      }
    );
  };

  // ✅ Minimal mock submissions
  const getMockSubmissions = () => [
    {
      id: 1,
      studentId: 'std-001',
      studentName: 'Emma Thompson',
      status: 'graded',
      grade: 94,
      submittedAt: '2025-08-08T15:30:00Z',
      gradedAt: '2025-08-09T10:15:00Z',
      isLate: false,
      feedback: 'Excellent work! Clear understanding of concepts.',
    },
    {
      id: 2,
      studentId: 'std-002',
      studentName: 'James Wilson',
      status: 'submitted',
      grade: null,
      submittedAt: '2025-08-09T20:15:00Z',
      gradedAt: null,
      isLate: true,
      feedback: null,
    },
    {
      id: 3,
      studentId: 'std-003',
      studentName: 'Sofia Rodriguez',
      status: 'not_submitted',
      grade: null,
      submittedAt: null,
      gradedAt: null,
      isLate: true,
      feedback: null,
    },
    {
      id: 4,
      studentId: 'std-004',
      studentName: 'Michael Chen',
      status: 'graded',
      grade: 87,
      submittedAt: '2025-08-07T14:20:00Z',
      gradedAt: '2025-08-08T16:45:00Z',
      isLate: false,
      feedback: 'Good work. Review quadratic formula applications.',
    },
  ];

  // ✅ Professional Action Handlers
  const navigateToEditAssignment = useCallback(() => {
    navigation.navigate('CreateAssignment', {
      assignmentId: assignment.id,
      assignment: assignment,
      isEditing: true,
    });
  }, [assignment, navigation]);

  const navigateToGradeSubmission = useCallback(
    (submission) => {
      if (submission.status === 'not_submitted') {
        Alert.alert(
          'No Submission',
          'This student has not submitted their assignment yet.',
        );
        return;
      }

      navigation.navigate('GradeSubmission', {
        submissionId: submission.id,
        submission: submission,
        assignment: assignment,
      });
    },
    [assignment, navigation],
  );

  const deleteAssignment = useCallback(() => {
    Alert.alert(
      'Delete Assignment',
      `Are you sure you want to delete "${assignment.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: API call to delete assignment
              // await apiService.teacher.deleteAssignment(assignment.id);

              Alert.alert('Success', 'Assignment deleted successfully.', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete assignment');
            }
          },
        },
      ],
    );
  }, [assignment, navigation]);

  const publishAssignment = useCallback(() => {
    Alert.alert('Publish Assignment', 'Assignment published to students!');
  }, []);

  // ✅ Professional Utility Functions
  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'graded':
        return TEACHER_COLORS.success;
      case 'submitted':
        return TEACHER_COLORS.warning;
      case 'not_submitted':
        return TEACHER_COLORS.error;
      default:
        return TEACHER_COLORS.textMuted;
    }
  }, []);

  const getStatusIcon = useCallback((status) => {
    switch (status) {
      case 'graded':
        return 'checkmark-circle';
      case 'submitted':
        return 'time';
      case 'not_submitted':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  }, []);

  const getProgressPercentage = useCallback(() => {
    if (!assignment || assignment.submissionsCount === 0) return 0;
    return (assignment.gradedCount / assignment.submissionsCount) * 100;
  }, [assignment]);

  const getGradeColor = useCallback((grade, totalPoints) => {
    if (!grade) return TEACHER_COLORS.textMuted;
    const percentage = (grade / totalPoints) * 100;
    if (percentage >= 90) return TEACHER_COLORS.gradeA;
    if (percentage >= 80) return TEACHER_COLORS.gradeB;
    if (percentage >= 70) return TEACHER_COLORS.gradeC;
    if (percentage >= 60) return TEACHER_COLORS.gradeD;
    return TEACHER_COLORS.gradeF;
  }, []);

  // ✅ Initialize
  useFocusEffect(
    useCallback(() => {
      loadAssignmentData();
    }, [assignmentId]),
  );

  // ✅ Professional Loading State
  if (loading) {
    return (
      <View style={styles.container}>
        <SimpleHeader
          title="Assignment Details"
          subtitle="Loading..."
          navigation={navigation}
          primaryColor={TEACHER_COLORS.primary}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={TEACHER_COLORS.primary} />
          <Text style={styles.loadingText}>Loading assignment details...</Text>
        </View>
      </View>
    );
  }

  // ✅ Professional Error State
  if (!assignment) {
    return (
      <View style={styles.container}>
        <SimpleHeader
          title="Assignment Not Found"
          navigation={navigation}
          primaryColor={TEACHER_COLORS.primary}
        />
        <View style={styles.loadingContainer}>
          <Ionicons
            name="document-text-outline"
            size={64}
            color={TEACHER_COLORS.textMuted}
          />
          <Text style={styles.errorText}>Assignment not found</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadAssignmentData()}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ✅ Professional Header */}
      <SimpleHeader
        title={assignment.title}
        subtitle={`${assignment.className} • Due: ${formatDate(
          assignment.dueDate,
        )}`}
        navigation={navigation}
        primaryColor={TEACHER_COLORS.primary}
      />

      {/* ✅ Professional Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          {
            key: 'overview',
            label: 'Overview',
            icon: 'information-circle-outline',
          },
          {
            key: 'submissions',
            label: 'Submissions',
            icon: 'document-outline',
            badge: submissions.filter((s) => s.status === 'submitted').length,
          },
          { key: 'analytics', label: 'Analytics', icon: 'bar-chart-outline' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.8}
          >
            <View style={styles.tabContent}>
              <Ionicons
                name={tab.icon}
                size={18}
                color={
                  activeTab === tab.key
                    ? TEACHER_COLORS.textWhite
                    : TEACHER_COLORS.textMuted
                }
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
              {tab.badge > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{tab.badge}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* ✅ Professional Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadAssignmentData(true)}
            tintColor={TEACHER_COLORS.primary}
            colors={[TEACHER_COLORS.primary]}
          />
        }
      >
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <View>
            {/* ✅ Professional Assignment Info */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color={TEACHER_COLORS.primary}
                />
                <Text style={styles.sectionTitle}>Assignment Details</Text>
              </View>

              <View style={styles.assignmentCard}>
                <LinearGradient
                  colors={[TEACHER_COLORS.primary, TEACHER_COLORS.primaryLight]}
                  style={styles.assignmentHeader}
                >
                  <View style={styles.assignmentIcon}>
                    <Ionicons
                      name="document-text"
                      size={28}
                      color={TEACHER_COLORS.textWhite}
                    />
                  </View>
                  <View style={styles.assignmentTitleSection}>
                    <Text style={styles.assignmentTitle}>
                      {assignment.title}
                    </Text>
                    <Text style={styles.assignmentType}>{assignment.type}</Text>
                  </View>
                  <View style={styles.assignmentPoints}>
                    <Text style={styles.pointsValue}>
                      {assignment.totalPoints}
                    </Text>
                    <Text style={styles.pointsLabel}>points</Text>
                  </View>
                </LinearGradient>

                <View style={styles.assignmentContent}>
                  <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color={TEACHER_COLORS.primary}
                      />
                      <Text style={styles.infoLabel}>Due Date:</Text>
                      <Text style={styles.infoValue}>
                        {formatDate(assignment.dueDate)}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons
                        name="school-outline"
                        size={16}
                        color={COLORS.teacherPalette.subjects.mathematics}
                      />
                      <Text style={styles.infoLabel}>Class:</Text>
                      <Text style={styles.infoValue}>
                        {assignment.className}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons
                        name="time-outline"
                        size={16}
                        color={TEACHER_COLORS.textMuted}
                      />
                      <Text style={styles.infoLabel}>Created:</Text>
                      <Text style={styles.infoValue}>
                        {formatDate(assignment.createdDate)}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={16}
                        color={TEACHER_COLORS.success}
                      />
                      <Text style={styles.infoLabel}>Status:</Text>
                      <Text
                        style={[
                          styles.infoValue,
                          { color: TEACHER_COLORS.success, fontWeight: '600' },
                        ]}
                      >
                        {assignment.status &&
                        typeof assignment.status === 'string'
                          ? assignment.status.charAt(0).toUpperCase() +
                            assignment.status.slice(1)
                          : 'Unknown'}
                      </Text>
                    </View>
                  </View>

                  {assignment.description && (
                    <View style={styles.descriptionContainer}>
                      <Text style={styles.descriptionTitle}>Description</Text>
                      <Text style={styles.description}>
                        {assignment.description}
                      </Text>
                    </View>
                  )}

                  {assignment.instructions && (
                    <View style={styles.instructionsContainer}>
                      <Text style={styles.instructionsTitle}>Instructions</Text>
                      <Text style={styles.instructions}>
                        {assignment.instructions}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* ✅ Professional Quick Stats */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="bar-chart-outline"
                  size={24}
                  color={TEACHER_COLORS.primary}
                />
                <Text style={styles.sectionTitle}>Submission Overview</Text>
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.primaryStatCard}>
                  <LinearGradient
                    colors={[
                      TEACHER_COLORS.primary,
                      TEACHER_COLORS.primaryLight,
                    ]}
                    style={styles.primaryStatGradient}
                  >
                    <Text style={styles.primaryStatValue}>
                      {assignment.submissionsCount}
                    </Text>
                    <Text style={styles.primaryStatLabel}>Total Students</Text>
                  </LinearGradient>
                </View>

                <View style={styles.statsGrid}>
                  <View
                    style={[
                      styles.statCard,
                      { borderLeftColor: TEACHER_COLORS.success },
                    ]}
                  >
                    <Text style={styles.statValue}>
                      {assignment.gradedCount}
                    </Text>
                    <Text style={styles.statLabel}>Graded</Text>
                  </View>
                  <View
                    style={[
                      styles.statCard,
                      { borderLeftColor: TEACHER_COLORS.warning },
                    ]}
                  >
                    <Text style={styles.statValue}>
                      {
                        submissions.filter((s) => s.status === 'submitted')
                          .length
                      }
                    </Text>
                    <Text style={styles.statLabel}>Pending</Text>
                  </View>
                  <View
                    style={[
                      styles.statCard,
                      { borderLeftColor: TEACHER_COLORS.error },
                    ]}
                  >
                    <Text style={styles.statValue}>
                      {
                        submissions.filter((s) => s.status === 'not_submitted')
                          .length
                      }
                    </Text>
                    <Text style={styles.statLabel}>Missing</Text>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Grading Progress</Text>
                    <Text style={styles.progressValue}>
                      {getProgressPercentage().toFixed(0)}%
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${getProgressPercentage()}%`,
                          backgroundColor: TEACHER_COLORS.success,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {assignment.gradedCount} of {assignment.submissionsCount}{' '}
                    submissions graded
                  </Text>
                </View>

                {assignment.averageGrade > 0 && (
                  <View style={styles.averageContainer}>
                    <Text style={styles.averageLabel}>Class Average</Text>
                    <Text
                      style={[
                        styles.averageValue,
                        { color: getGradeColor(assignment.averageGrade, 100) },
                      ]}
                    >
                      {assignment.averageGrade.toFixed(1)}%
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* ✅ Professional Quick Actions */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="flash-outline"
                  size={24}
                  color={TEACHER_COLORS.primary}
                />
                <Text style={styles.sectionTitle}>Quick Actions</Text>
              </View>

              <View style={styles.actionsGrid}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: COLORS.teacherPalette.subjects.science },
                  ]}
                  onPress={() => setActiveTab('submissions')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="document-outline"
                    size={24}
                    color={TEACHER_COLORS.textWhite}
                  />
                  <Text style={styles.actionButtonText}>View Submissions</Text>
                  <Text style={styles.actionButtonSubtext}>
                    Review student work
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: TEACHER_COLORS.success },
                  ]}
                  onPress={navigateToEditAssignment}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="create-outline"
                    size={24}
                    color={TEACHER_COLORS.textWhite}
                  />
                  <Text style={styles.actionButtonText}>Edit Assignment</Text>
                  <Text style={styles.actionButtonSubtext}>Modify details</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: TEACHER_COLORS.warning },
                  ]}
                  onPress={publishAssignment}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="send-outline"
                    size={24}
                    color={TEACHER_COLORS.textWhite}
                  />
                  <Text style={styles.actionButtonText}>Publish Update</Text>
                  <Text style={styles.actionButtonSubtext}>
                    Notify students
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: TEACHER_COLORS.error },
                  ]}
                  onPress={deleteAssignment}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="trash-outline"
                    size={24}
                    color={TEACHER_COLORS.textWhite}
                  />
                  <Text style={styles.actionButtonText}>Delete</Text>
                  <Text style={styles.actionButtonSubtext}>
                    Remove assignment
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="document-outline"
                size={24}
                color={TEACHER_COLORS.primary}
              />
              <Text style={styles.sectionTitle}>
                Student Submissions ({submissions.length})
              </Text>
            </View>

            {submissions.map((submission) => (
              <TouchableOpacity
                key={submission.id}
                style={styles.submissionCard}
                onPress={() => navigateToGradeSubmission(submission)}
                activeOpacity={0.8}
              >
                <View style={styles.submissionHeader}>
                  <View style={styles.submissionStudentInfo}>
                    <Text style={styles.studentName}>
                      {submission.studentName}
                    </Text>
                    {submission.submittedAt ? (
                      <Text style={styles.submissionDate}>
                        Submitted: {formatDate(submission.submittedAt)}
                      </Text>
                    ) : (
                      <Text
                        style={[
                          styles.submissionDate,
                          { color: TEACHER_COLORS.error },
                        ]}
                      >
                        Not submitted
                      </Text>
                    )}
                    {submission.gradedAt && (
                      <Text style={styles.gradedDate}>
                        Graded: {formatDate(submission.gradedAt)}
                      </Text>
                    )}
                  </View>

                  <View style={styles.submissionStatus}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(submission.status) },
                      ]}
                    >
                      <Ionicons
                        name={getStatusIcon(submission.status)}
                        size={14}
                        color={TEACHER_COLORS.textWhite}
                      />
                      <Text style={styles.statusText}>
                        {submission.status === 'not_submitted'
                          ? 'Missing'
                          : submission.status === 'submitted'
                          ? 'Pending'
                          : 'Graded'}
                      </Text>
                    </View>
                    {submission.isLate && (
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: TEACHER_COLORS.error },
                        ]}
                      >
                        <Ionicons
                          name="warning"
                          size={14}
                          color={TEACHER_COLORS.textWhite}
                        />
                        <Text style={styles.statusText}>Late</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.submissionDetails}>
                  <View style={styles.gradeSection}>
                    {submission.grade !== null ? (
                      <View style={styles.gradeDisplay}>
                        <Text
                          style={[
                            styles.gradeValue,
                            {
                              color: getGradeColor(
                                submission.grade,
                                assignment.totalPoints,
                              ),
                            },
                          ]}
                        >
                          {submission.grade}/{assignment.totalPoints}
                        </Text>
                        <Text style={styles.gradePercentage}>
                          (
                          {(
                            (submission.grade / assignment.totalPoints) *
                            100
                          ).toFixed(0)}
                          %)
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.notGradedText}>
                        {submission.status === 'not_submitted'
                          ? 'No submission'
                          : 'Not graded yet'}
                      </Text>
                    )}
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={TEACHER_COLORS.textMuted}
                  />
                </View>

                {submission.feedback && (
                  <View style={styles.feedbackPreview}>
                    <Text style={styles.feedbackText} numberOfLines={2}>
                      "{submission.feedback}"
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {submissions.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons
                  name="document-outline"
                  size={48}
                  color={TEACHER_COLORS.textMuted}
                />
                <Text style={styles.emptyStateText}>No submissions yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Students haven't submitted their work
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="bar-chart-outline"
                size={24}
                color={TEACHER_COLORS.primary}
              />
              <Text style={styles.sectionTitle}>Detailed Analytics</Text>
            </View>

            <View style={styles.analyticsGrid}>
              <View
                style={[
                  styles.analyticsCard,
                  { borderLeftColor: TEACHER_COLORS.success },
                ]}
              >
                <Text style={styles.analyticsValue}>
                  {submissions.filter((s) => s.status === 'graded').length}
                </Text>
                <Text style={styles.analyticsLabel}>Completed</Text>
                <Text style={styles.analyticsSubtext}>Graded submissions</Text>
              </View>

              <View
                style={[
                  styles.analyticsCard,
                  { borderLeftColor: TEACHER_COLORS.warning },
                ]}
              >
                <Text style={styles.analyticsValue}>
                  {submissions.filter((s) => s.status === 'submitted').length}
                </Text>
                <Text style={styles.analyticsLabel}>Pending Review</Text>
                <Text style={styles.analyticsSubtext}>Awaiting grading</Text>
              </View>

              <View
                style={[
                  styles.analyticsCard,
                  { borderLeftColor: TEACHER_COLORS.error },
                ]}
              >
                <Text style={styles.analyticsValue}>
                  {
                    submissions.filter((s) => s.status === 'not_submitted')
                      .length
                  }
                </Text>
                <Text style={styles.analyticsLabel}>Missing</Text>
                <Text style={styles.analyticsSubtext}>No submission</Text>
              </View>

              <View
                style={[
                  styles.analyticsCard,
                  {
                    borderLeftColor: COLORS.teacherPalette.subjects.mathematics,
                  },
                ]}
              >
                <Text style={styles.analyticsValue}>
                  {submissions.filter((s) => s.isLate).length}
                </Text>
                <Text style={styles.analyticsLabel}>Late Submissions</Text>
                <Text style={styles.analyticsSubtext}>Past due date</Text>
              </View>
            </View>

            <View style={styles.analyticsNote}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={TEACHER_COLORS.primary}
              />
              <Text style={styles.analyticsNoteText}>
                Advanced analytics including grade distribution, submission
                timeline, and performance trends will be available in the next
                update.
              </Text>
            </View>
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
    paddingHorizontal: SPACING.lg,
  },
  loadingText: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.textMuted,
  },
  errorText: {
    ...TEACHER_THEME.typography.h4,
    color: TEACHER_COLORS.textMuted,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: TEACHER_COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.md,
  },
  retryButtonText: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.textWhite,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: TEACHER_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.teacherPalette.neutral.lighter,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    backgroundColor: TEACHER_COLORS.primary,
    borderBottomColor: TEACHER_COLORS.primaryDark,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    position: 'relative',
  },
  tabText: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textMuted,
    fontWeight: '500',
  },
  activeTabText: {
    color: TEACHER_COLORS.textWhite,
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: TEACHER_COLORS.error,
    borderRadius: BORDER_RADIUS.round,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.xs / 2,
  },
  tabBadgeText: {
    fontSize: 10,
    color: TEACHER_COLORS.textWhite,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  section: {
    backgroundColor: TEACHER_COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
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
  assignmentCard: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.teacherPalette.neutral.lighter,
  },
  assignmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  assignmentIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  assignmentTitleSection: {
    flex: 1,
  },
  assignmentTitle: {
    ...TEACHER_THEME.typography.h3,
    color: TEACHER_COLORS.textWhite,
    fontWeight: '700',
  },
  assignmentType: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textWhite,
    opacity: 0.9,
    marginTop: SPACING.xs / 2,
  },
  assignmentPoints: {
    alignItems: 'center',
  },
  pointsValue: {
    ...TEACHER_THEME.typography.h2,
    color: TEACHER_COLORS.textWhite,
    fontWeight: '700',
  },
  pointsLabel: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textWhite,
    opacity: 0.8,
  },
  assignmentContent: {
    backgroundColor: TEACHER_COLORS.surface,
    padding: SPACING.md,
  },
  infoGrid: {
    gap: SPACING.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  infoLabel: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textSecondary,
    fontWeight: '500',
    minWidth: 70,
  },
  infoValue: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.text,
    fontWeight: '600',
    flex: 1,
  },
  descriptionContainer: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: TEACHER_COLORS.accent,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: TEACHER_COLORS.primary,
  },
  descriptionTitle: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  description: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.textSecondary,
    lineHeight: 22,
  },
  instructionsContainer: {
    marginTop: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.teacherPalette.background.warm,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: TEACHER_COLORS.secondary,
  },
  instructionsTitle: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  instructions: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.textSecondary,
    lineHeight: 22,
    fontStyle: 'italic',
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
  primaryStatGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  primaryStatValue: {
    ...TEACHER_THEME.typography.h1,
    color: TEACHER_COLORS.textWhite,
    fontWeight: '700',
  },
  primaryStatLabel: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textWhite,
    opacity: 0.9,
    marginTop: SPACING.xs,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: TEACHER_COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderLeftWidth: 4,
    alignItems: 'center',
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
    ...TEACHER_THEME.typography.h3,
    color: TEACHER_COLORS.text,
    fontWeight: '700',
  },
  statLabel: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  progressContainer: {
    gap: SPACING.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.text,
    fontWeight: '600',
  },
  progressValue: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.primary,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.teacherPalette.neutral.lighter,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
    textAlign: 'center',
  },
  averageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: TEACHER_COLORS.accent,
    borderRadius: BORDER_RADIUS.md,
  },
  averageLabel: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
    fontWeight: '600',
  },
  averageValue: {
    ...TEACHER_THEME.typography.h3,
    fontWeight: '700',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.xs,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.teacherPalette.shadow.medium,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  actionButtonText: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.textWhite,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionButtonSubtext: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textWhite,
    opacity: 0.9,
    textAlign: 'center',
  },
  submissionCard: {
    backgroundColor: TEACHER_COLORS.accent,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
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
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  submissionStudentInfo: {
    flex: 1,
  },
  studentName: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs / 2,
  },
  submissionDate: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
    marginBottom: SPACING.xs / 2,
  },
  gradedDate: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.success,
  },
  submissionStatus: {
    alignItems: 'flex-end',
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
  statusText: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textWhite,
    fontWeight: '600',
  },
  submissionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gradeSection: {
    flex: 1,
  },
  gradeDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.xs,
  },
  gradeValue: {
    ...TEACHER_THEME.typography.h4,
    fontWeight: '700',
  },
  gradePercentage: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textMuted,
    fontWeight: '500',
  },
  notGradedText: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textMuted,
    fontStyle: 'italic',
  },
  feedbackPreview: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: TEACHER_COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: TEACHER_COLORS.success,
  },
  feedbackText: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.sm,
  },
  emptyStateText: {
    ...TEACHER_THEME.typography.h4,
    color: TEACHER_COLORS.textMuted,
  },
  emptyStateSubtext: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textMuted,
    textAlign: 'center',
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  analyticsCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: TEACHER_COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderLeftWidth: 4,
    alignItems: 'center',
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
  analyticsValue: {
    ...TEACHER_THEME.typography.h2,
    color: TEACHER_COLORS.text,
    fontWeight: '700',
  },
  analyticsLabel: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.text,
    fontWeight: '600',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  analyticsSubtext: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs / 2,
  },
  analyticsNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: TEACHER_COLORS.accent,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  analyticsNoteText: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textSecondary,
    lineHeight: 18,
    flex: 1,
  },
  bottomPadding: {
    height: SPACING.xl,
  },
});

export default AssignmentDetails;
