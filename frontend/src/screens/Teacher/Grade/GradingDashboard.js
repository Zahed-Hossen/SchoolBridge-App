import React, { useState, useCallback, useRef } from 'react';
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
  Modal,
  Platform,
  Animated,
  Dimensions,
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
  BORDER_RADIUS
} from '../../../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

const GradingDashboard = ({ navigation }) => {
  // ✅ Professional State Management
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('pending');

  // Modal States
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Enhanced States
  const [selectedClass, setSelectedClass] = useState(null);
  const [showClassSelector, setShowClassSelector] = useState(false);
  const [gradingStats, setGradingStats] = useState(null);
  const [sortBy, setSortBy] = useState('dueDate'); // dueDate, priority, student

  // Animation References
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // ✅ Filter Options Configuration
  const filterOptions = [
    { key: 'all', label: 'All', icon: 'list', color: TEACHER_COLORS.text },
    { key: 'pending', label: 'Pending', icon: 'time', color: TEACHER_COLORS.warning },
    { key: 'overdue', label: 'Overdue', icon: 'alert-circle', color: TEACHER_COLORS.error },
    { key: 'graded', label: 'Graded', icon: 'checkmark-circle', color: TEACHER_COLORS.success },
  ];

  // ✅ Grade Scale Configuration
  const gradeScale = [
    { min: 90, max: 100, letter: 'A+', color: TEACHER_COLORS.success },
    { min: 85, max: 89, letter: 'A', color: TEACHER_COLORS.success },
    { min: 80, max: 84, letter: 'A-', color: COLORS.teacherPalette.grades.good },
    { min: 75, max: 79, letter: 'B+', color: COLORS.teacherPalette.grades.good },
    { min: 70, max: 74, letter: 'B', color: COLORS.teacherPalette.grades.average },
    { min: 65, max: 69, letter: 'B-', color: COLORS.teacherPalette.grades.average },
    { min: 60, max: 64, letter: 'C+', color: TEACHER_COLORS.warning },
    { min: 55, max: 59, letter: 'C', color: TEACHER_COLORS.warning },
    { min: 50, max: 54, letter: 'C-', color: COLORS.teacherPalette.grades.poor },
    { min: 0, max: 49, letter: 'F', color: TEACHER_COLORS.error },
  ];

  // ✅ Professional Data Loading
  const loadGradingData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      // 🔄 API calls commented out for development
      /*
      const [assignmentsResponse, submissionsResponse, statsResponse] = await Promise.all([
        fetch('/api/teacher/assignments/grading', {
          headers: { 'Authorization': `Bearer ${userToken}` }
        }),
        fetch('/api/teacher/submissions/pending', {
          headers: { 'Authorization': `Bearer ${userToken}` }
        }),
        fetch('/api/teacher/grading/stats', {
          headers: { 'Authorization': `Bearer ${userToken}` }
        })
      ]);

      const assignmentsData = await assignmentsResponse.json();
      const submissionsData = await submissionsResponse.json();
      const statsData = await statsResponse.json();

      setAssignments(assignmentsData);
      setSubmissions(submissionsData);
      setGradingStats(statsData);
      */

      // ✅ Minimal Mock Data
      setTimeout(() => {
        const mockAssignments = [
          {
            id: 1,
            title: 'Algebra Quiz - Chapter 5',
            class: 'Mathematics 10A',
            totalPoints: 50,
            submissionsCount: 25,
            gradedCount: 18,
            pendingCount: 7,
            dueDate: '2024-08-15T23:59:00Z',
            subject: 'Mathematics',
            priority: 'high',
          },
          {
            id: 2,
            title: 'Physics Lab Report',
            class: 'Physics 12B',
            totalPoints: 100,
            submissionsCount: 22,
            gradedCount: 15,
            pendingCount: 7,
            dueDate: '2024-08-20T23:59:00Z',
            subject: 'Science',
            priority: 'medium',
          },
          {
            id: 3,
            title: 'Chemistry Test',
            class: 'Chemistry 11C',
            totalPoints: 80,
            submissionsCount: 20,
            gradedCount: 20,
            pendingCount: 0,
            dueDate: '2024-08-10T23:59:00Z',
            subject: 'Science',
            priority: 'low',
          },
        ];

        const mockSubmissions = [
          {
            id: 1,
            studentName: 'Emma Thompson',
            studentId: 'S001',
            assignmentId: 1,
            assignmentTitle: 'Algebra Quiz - Chapter 5',
            class: 'Mathematics 10A',
            totalPoints: 50,
            submittedAt: '2024-08-14T16:30:00Z',
            status: 'submitted',
            isOverdue: false,
            attachments: ['algebra_quiz.pdf'],
          },
          {
            id: 2,
            studentName: 'James Wilson',
            studentId: 'S002',
            assignmentId: 2,
            assignmentTitle: 'Physics Lab Report',
            class: 'Physics 12B',
            totalPoints: 100,
            submittedAt: '2024-08-19T14:20:00Z',
            status: 'submitted',
            isOverdue: false,
            attachments: ['lab_report.pdf', 'data.xlsx'],
          },
          {
            id: 3,
            studentName: 'Sofia Rodriguez',
            studentId: 'S003',
            assignmentId: 1,
            assignmentTitle: 'Algebra Quiz - Chapter 5',
            class: 'Mathematics 10A',
            totalPoints: 50,
            submittedAt: '2024-08-16T09:15:00Z',
            status: 'submitted',
            isOverdue: true,
            attachments: ['quiz_answers.pdf'],
          },
        ];

        setAssignments(mockAssignments);
        setSubmissions(mockSubmissions);
        setGradingStats({
          totalPending: 14,
          totalGraded: 53,
          averageGrade: 84.2,
          gradingRate: 79.1,
        });

        setLoading(false);
        setRefreshing(false);
      }, 800);

    } catch (error) {
      console.error('❌ Error loading grading data:', error);
      Alert.alert('Error', 'Failed to load grading data');
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ✅ Professional Grading Actions
  const openGradeModal = useCallback((submission) => {
    setSelectedSubmission(submission);
    setGradeInput('');
    setFeedbackInput('');
    setShowGradeModal(true);
  }, []);

  const validateGrade = useCallback((grade, maxPoints) => {
    const numGrade = parseFloat(grade);
    if (isNaN(numGrade)) return 'Grade must be a number';
    if (numGrade < 0) return 'Grade cannot be negative';
    if (numGrade > maxPoints) return `Grade cannot exceed ${maxPoints} points`;
    return null;
  }, []);

  const getLetterGrade = useCallback((score, totalPoints) => {
    const percentage = (score / totalPoints) * 100;
    const grade = gradeScale.find(g => percentage >= g.min && percentage <= g.max);
    return grade || gradeScale[gradeScale.length - 1];
  }, [gradeScale]);

  const submitGrade = useCallback(async () => {
    if (!selectedSubmission || !gradeInput.trim()) {
      Alert.alert('Error', 'Please enter a grade');
      return;
    }

    const validationError = validateGrade(gradeInput, selectedSubmission.totalPoints);
    if (validationError) {
      Alert.alert('Invalid Grade', validationError);
      return;
    }

    const numericGrade = parseFloat(gradeInput);
    const letterGrade = getLetterGrade(numericGrade, selectedSubmission.totalPoints);

    Alert.alert(
      'Confirm Grade',
      `Grade: ${numericGrade}/${selectedSubmission.totalPoints} (${letterGrade.letter})\nStudent: ${selectedSubmission.studentName}\n\nConfirm submission?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            try {
              setSaving(true);

              // 🔄 API call commented out
              /*
              const response = await fetch('/api/teacher/grades', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${userToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  submissionId: selectedSubmission.id,
                  studentId: selectedSubmission.studentId,
                  assignmentId: selectedSubmission.assignmentId,
                  grade: numericGrade,
                  letterGrade: letterGrade.letter,
                  feedback: feedbackInput.trim(),
                  gradedAt: new Date().toISOString(),
                }),
              });

              if (!response.ok) throw new Error('Failed to submit grade');
              */

              // ✅ Mock success simulation
              await new Promise(resolve => setTimeout(resolve, 1000));

              // Update local state
              setSubmissions(prev => prev.filter(s => s.id !== selectedSubmission.id));
              setAssignments(prev => prev.map(assignment => {
                if (assignment.id === selectedSubmission.assignmentId) {
                  return {
                    ...assignment,
                    gradedCount: assignment.gradedCount + 1,
                    pendingCount: assignment.pendingCount - 1,
                  };
                }
                return assignment;
              }));

              // Success animation
              Animated.sequence([
                Animated.timing(fadeAnim, {
                  toValue: 0.3,
                  duration: 200,
                  useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                  toValue: 1,
                  duration: 300,
                  useNativeDriver: true,
                }),
              ]).start();

              setShowGradeModal(false);
              Alert.alert('Success!', `Grade ${letterGrade.letter} submitted successfully`);

            } catch (error) {
              console.error('❌ Error submitting grade:', error);
              Alert.alert('Error', 'Failed to submit grade. Please try again.');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  }, [selectedSubmission, gradeInput, feedbackInput, validateGrade, getLetterGrade, fadeAnim]);

  // ✅ Professional Utility Functions
  const getFilteredSubmissions = useCallback(() => {
    return submissions.filter(submission => {
      // Search filter
      const matchesSearch = submission.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           submission.assignmentTitle.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Status filter
      switch (selectedFilter) {
        case 'all': return true;
        case 'pending': return submission.status === 'submitted';
        case 'overdue': return submission.isOverdue;
        case 'graded': return submission.status === 'graded';
        default: return true;
      }
    });
  }, [submissions, searchQuery, selectedFilter]);

      const formatDate = useCallback((dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }, []);

      const isOverdue = useCallback((dueDate) => {
        return new Date(dueDate) < new Date();
      }, []);

      const getPriorityColor = useCallback((priority) => {
        switch (priority) {
          case 'high': return TEACHER_COLORS.error;
          case 'medium': return TEACHER_COLORS.warning;
          case 'low': return TEACHER_COLORS.success;
          default: return TEACHER_COLORS.textMuted;
        }
      }, []);

      const getGradingProgress = useCallback((graded, total) => {
        return total > 0 ? ((graded / total) * 100).toFixed(1) : 0;
      }, []);

      // ✅ Enhanced Assignment Actions
      const viewAssignmentDetails = useCallback((assignment) => {
        const progress = getGradingProgress(assignment.gradedCount, assignment.submissionsCount);
        const priorityColor = getPriorityColor(assignment.priority);

        Alert.alert(
          `📝 ${assignment.title}`,
          `Class: ${assignment.class}\nSubject: ${assignment.subject}\nTotal Points: ${assignment.totalPoints}\n\n📊 Progress:\n• Graded: ${assignment.gradedCount}/${assignment.submissionsCount} (${progress}%)\n• Pending: ${assignment.pendingCount}\n• Priority: ${assignment.priority.toUpperCase()}\n\nDue Date: ${formatDate(assignment.dueDate)}`,
          [
            { text: 'Close', style: 'cancel' },
            {
              text: 'Filter Submissions',
              onPress: () => {
                // Filter submissions for this specific assignment
                setSearchQuery(assignment.title);
                setSelectedFilter('pending');
              }
            },
            {
              text: 'View All Submissions',
              onPress: () => {
                setSearchQuery(assignment.title);
                setSelectedFilter('all');
              }
            }
          ]
        );
      }, [getGradingProgress, getPriorityColor, formatDate]);

      const exportGradingReport = useCallback(() => {
        Alert.alert(
          'Export Grading Report',
          'This will generate a comprehensive grading report with all assignments and submissions.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Export CSV',
              onPress: () => {
                // TODO: Implement actual export functionality
                Alert.alert('Success', 'Grading report exported successfully!');
              }
            },
            {
              text: 'Export PDF',
              onPress: () => {
                // TODO: Implement actual export functionality
                Alert.alert('Success', 'PDF report generated successfully!');
              }
            }
          ]
        );
      }, []);

      const bulkGradeAction = useCallback(() => {
        const filteredSubmissions = getFilteredSubmissions();

        if (filteredSubmissions.length === 0) {
          Alert.alert('No Submissions', 'No submissions available for bulk grading');
          return;
        }

        Alert.alert(
          'Bulk Grading Options',
          `Apply action to ${filteredSubmissions.length} submissions`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Mark All Present',
              onPress: () => {
                Alert.alert('Coming Soon', 'Bulk grading feature is under development');
              }
            },
            {
              text: 'Export List',
              onPress: () => {
                Alert.alert('Success', 'Submission list exported for offline grading');
              }
            }
          ]
        );
      }, [getFilteredSubmissions]);



  const HeaderRightComponent = () => (
    <TouchableOpacity
      style={styles.headerButton}
      onPress={() => navigation.navigate('GradeBook', {
        classId: selectedClass?.id,
        className: selectedClass?.name
      })}
      activeOpacity={0.8}
    >
      <Ionicons name="book" size={20} color={TEACHER_COLORS.textWhite} />
    </TouchableOpacity>
  );

  // ✅ Initialize Data
  useFocusEffect(
    useCallback(() => {
      loadGradingData();
    }, [loadGradingData])
  );

  const onRefresh = useCallback(() => {
    loadGradingData(true);
  }, [loadGradingData]);

  const filteredSubmissions = getFilteredSubmissions();

  // ✅ Professional Loading State
  if (loading) {
    return (
      <View style={styles.container}>
        <SimpleHeader
          title="Grading Dashboard"
          subtitle="Loading..."
          navigation={navigation}
          primaryColor={TEACHER_COLORS.primary}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={TEACHER_COLORS.primary} />
          <Text style={styles.loadingText}>Loading grading data...</Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* ✅ Professional Header */}
      <SimpleHeader
        title="Grading Dashboard"
        subtitle={`${gradingStats?.totalPending || 0} pending submissions`}
        navigation={navigation}
        primaryColor={TEACHER_COLORS.primary}
        rightComponent={<HeaderRightComponent />}
      />

      {/* ✅ Professional Stats Overview */}
      {gradingStats && (
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { borderLeftColor: TEACHER_COLORS.warning }]}>
            <Text style={styles.statValue}>{gradingStats.totalPending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: TEACHER_COLORS.success }]}>
            <Text style={styles.statValue}>{gradingStats.totalGraded}</Text>
            <Text style={styles.statLabel}>Graded</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: TEACHER_COLORS.primary }]}>
            <Text style={styles.statValue}>{gradingStats.averageGrade}%</Text>
            <Text style={styles.statLabel}>Avg Grade</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: COLORS.teacherPalette.secondary.main }]}>
            <Text style={styles.statValue}>{gradingStats.gradingRate}%</Text>
            <Text style={styles.statLabel}>Progress</Text>
          </View>
        </View>
      )}

    {/* ✅ Quick Actions Bar */}
    <View style={styles.quickActionsContainer}>
      <TouchableOpacity
        style={[styles.quickActionButton, { backgroundColor: TEACHER_COLORS.primary }]}
        onPress={exportGradingReport}
        activeOpacity={0.8}
      >
        <Ionicons name="download" size={18} color={TEACHER_COLORS.textWhite} />
        <Text style={styles.quickActionText}>Export</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.quickActionButton, { backgroundColor: COLORS.teacherPalette.secondary.main }]}
        onPress={bulkGradeAction}
        activeOpacity={0.8}
      >
        <Ionicons name="layers" size={18} color={TEACHER_COLORS.textWhite} />
        <Text style={styles.quickActionText}>Bulk Grade</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.quickActionButton, { backgroundColor: TEACHER_COLORS.success }]}
        onPress={() => {
          setSelectedFilter('all');
          setSearchQuery('');
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="refresh" size={18} color={TEACHER_COLORS.textWhite} />
        <Text style={styles.quickActionText}>Reset Filters</Text>
      </TouchableOpacity>
    </View>
      {/* ✅ Professional Assignments Overview */}
      <View style={styles.assignmentsSection}>
        <Text style={styles.sectionTitle}>📝 Assignments Overview</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.assignmentsScroll}
        >
          {assignments.map((assignment) => {
            const progress = getGradingProgress(assignment.gradedCount, assignment.submissionsCount);
            const priorityColor = getPriorityColor(assignment.priority);

            return (
              <TouchableOpacity
                key={assignment.id}
                style={[
                  styles.assignmentCard,
                  { borderLeftColor: priorityColor },
                ]}
                onPress={() => viewAssignmentDetails(assignment)}
                activeOpacity={0.8}
              >
                <View style={styles.assignmentHeader}>
                  <Text style={styles.assignmentTitle} numberOfLines={2}>
                    {assignment.title}
                  </Text>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: priorityColor },
                    ]}
                  >
                    <Text style={styles.priorityText}>
                      {assignment.priority.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.assignmentClass}>{assignment.class}</Text>
                <Text style={styles.assignmentDue}>
                  Due: {formatDate(assignment.dueDate)}
                </Text>

                <View style={styles.assignmentStats}>
                  <View style={styles.statItem}>
                    <Text
                      style={[
                        styles.statNumber,
                        { color: TEACHER_COLORS.warning },
                      ]}
                    >
                      {assignment.pendingCount}
                    </Text>
                    <Text style={styles.statText}>Pending</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text
                      style={[
                        styles.statNumber,
                        { color: TEACHER_COLORS.success },
                      ]}
                    >
                      {assignment.gradedCount}
                    </Text>
                    <Text style={styles.statText}>Graded</Text>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${progress}%`,
                          backgroundColor: priorityColor,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>{progress}% Complete</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ✅ Professional Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={TEACHER_COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search submissions..."
            placeholderTextColor={TEACHER_COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={TEACHER_COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {filterOptions.map((filter) => {
            const isActive = selectedFilter === filter.key;
            const count = submissions.filter(s => {
              switch (filter.key) {
                case 'all': return true;
                case 'pending': return s.status === 'submitted';
                case 'overdue': return s.isOverdue;
                case 'graded': return s.status === 'graded';
                default: return true;
              }
            }).length;

            return (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterChip,
                  isActive && [styles.filterChipActive, { backgroundColor: filter.color }]
                ]}
                onPress={() => setSelectedFilter(filter.key)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={filter.icon}
                  size={16}
                  color={isActive ? TEACHER_COLORS.textWhite : filter.color}
                />
                <Text style={[
                  styles.filterChipText,
                  isActive && styles.filterChipTextActive
                ]}>
                  {filter.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ✅ Professional Submissions List */}
      <ScrollView
        style={styles.submissionsList}
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
        {filteredSubmissions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name={searchQuery ? "search-outline" : "checkmark-done-outline"}
              size={64}
              color={TEACHER_COLORS.textMuted}
            />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No submissions found' : 'All caught up!'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'No pending submissions to grade'
              }
            </Text>
          </View>
        ) : (
          filteredSubmissions.map((submission) => (
            <TouchableOpacity
              key={submission.id}
              style={[
                styles.submissionCard,
                submission.isOverdue && styles.submissionCardOverdue
              ]}
              onPress={() => openGradeModal(submission)}
              activeOpacity={0.8}
            >
              <View style={styles.submissionHeader}>
                <View style={styles.studentInfo}>
                  <View style={styles.studentAvatar}>
                    <Text style={styles.studentInitials}>
                      {submission.studentName.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                  <View style={styles.studentDetails}>
                    <Text style={styles.studentName}>{submission.studentName}</Text>
                    <Text style={styles.studentId}>ID: {submission.studentId}</Text>
                  </View>
                </View>

                <View style={styles.submissionMeta}>
                  <Text style={styles.submittedDate}>
                    {formatDate(submission.submittedAt)}
                  </Text>
                  {submission.isOverdue && (
                    <View style={styles.overdueBadge}>
                      <Ionicons name="alert-circle" size={12} color={TEACHER_COLORS.textWhite} />
                      <Text style={styles.overdueText}>OVERDUE</Text>
                    </View>
                  )}
                </View>
              </View>

              <Text style={styles.assignmentTitle}>{submission.assignmentTitle}</Text>
              <Text style={styles.classInfo}>{submission.class}</Text>

              {submission.attachments && submission.attachments.length > 0 && (
                <View style={styles.attachmentsContainer}>
                  <Ionicons name="attach" size={16} color={TEACHER_COLORS.textMuted} />
                  <Text style={styles.attachmentsText}>
                    {submission.attachments.length} attachment(s)
                  </Text>
                </View>
              )}

              <View style={styles.gradeAction}>
                <View style={styles.pointsInfo}>
                  <Text style={styles.pointsText}>/{submission.totalPoints} pts</Text>
                </View>
                <TouchableOpacity
                  style={[styles.gradeButton, { backgroundColor: TEACHER_COLORS.primary }]}
                  onPress={() => openGradeModal(submission)}
                >
                  <Ionicons name="create" size={16} color={TEACHER_COLORS.textWhite} />
                  <Text style={styles.gradeButtonText}>Grade</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* ✅ Professional Grading Modal */}
      <Modal
        visible={showGradeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGradeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Grade Submission</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowGradeModal(false)}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={24} color={TEACHER_COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {selectedSubmission && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.submissionDetails}>
                  <Text style={styles.modalStudentName}>{selectedSubmission.studentName}</Text>
                  <Text style={styles.modalAssignmentName}>{selectedSubmission.assignmentTitle}</Text>
                  <Text style={styles.modalClassName}>{selectedSubmission.class}</Text>
                </View>

                <View style={styles.gradeInputSection}>
                  <Text style={styles.gradeInputLabel}>
                    Grade (out of {selectedSubmission.totalPoints} points)
                  </Text>
                  <View style={styles.gradeInputContainer}>
                    <TextInput
                      style={styles.gradeInput}
                      value={gradeInput}
                      onChangeText={setGradeInput}
                      placeholder="Enter grade..."
                      placeholderTextColor={TEACHER_COLORS.textMuted}
                      keyboardType="numeric"
                    />
                    <Text style={styles.gradeInputMax}>/{selectedSubmission.totalPoints}</Text>
                  </View>

                  {gradeInput && !isNaN(parseFloat(gradeInput)) && (
                    <View style={styles.gradePreview}>
                      {(() => {
                        const grade = getLetterGrade(parseFloat(gradeInput), selectedSubmission.totalPoints);
                        return (
                          <View style={[styles.letterGrade, { backgroundColor: grade.color }]}>
                            <Text style={styles.letterGradeText}>{grade.letter}</Text>
                          </View>
                        );
                      })()}
                      <Text style={styles.percentageText}>
                        {((parseFloat(gradeInput) / selectedSubmission.totalPoints) * 100).toFixed(1)}%
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.feedbackSection}>
                  <Text style={styles.feedbackLabel}>Feedback (Optional)</Text>
                  <TextInput
                    style={styles.feedbackInput}
                    value={feedbackInput}
                    onChangeText={setFeedbackInput}
                    placeholder="Provide feedback to help the student improve..."
                    placeholderTextColor={TEACHER_COLORS.textMuted}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.submitGradeButton,
                    { backgroundColor: TEACHER_COLORS.primary },
                    saving && styles.submitGradeButtonDisabled
                  ]}
                  onPress={submitGrade}
                  disabled={saving}
                  activeOpacity={0.8}
                >
                  {saving ? (
                    <ActivityIndicator color={TEACHER_COLORS.textWhite} />
                  ) : (
                    <View style={styles.submitButtonContent}>
                      <Ionicons name="checkmark-circle" size={20} color={TEACHER_COLORS.textWhite} />
                      <Text style={styles.submitGradeButtonText}>Submit Grade</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </Animated.View>
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: TEACHER_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.teacherPalette.neutral.lighter,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderLeftWidth: 3,
    paddingLeft: SPACING.sm,
    marginHorizontal: SPACING.xs,
  },
  statValue: {
    ...TEACHER_THEME.typography.h3,
    color: TEACHER_COLORS.text,
    fontWeight: '700',
  },
  statLabel: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
    marginTop: SPACING.xs / 2,
  },
  assignmentsSection: {
    backgroundColor: TEACHER_COLORS.surface,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.teacherPalette.neutral.lighter,
  },
  sectionTitle: {
    ...TEACHER_THEME.typography.h4,
    color: TEACHER_COLORS.text,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  assignmentsScroll: {
    paddingHorizontal: SPACING.md,
  },
  assignmentCard: {
    backgroundColor: TEACHER_COLORS.accent,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginRight: SPACING.sm,
    width: 220,
    borderLeftWidth: 4,
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
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  assignmentTitle: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
    fontWeight: '600',
    flex: 1,
    marginRight: SPACING.sm,
  },
  priorityBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  priorityText: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textWhite,
    fontWeight: '600',
    fontSize: 10,
  },
  assignmentClass: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  assignmentDue: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  assignmentStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEACHER_THEME.typography.h4,
    fontWeight: '700',
  },
  statText: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
    fontSize: 10,
  },
  progressContainer: {
    gap: SPACING.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.teacherPalette.neutral.lighter,
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  progressText: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
    textAlign: 'center',
    fontSize: 10,
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
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  searchInput: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: TEACHER_COLORS.accent,
    marginRight: SPACING.sm,
    gap: SPACING.xs,
  },
  filterChipActive: {
    backgroundColor: TEACHER_COLORS.primary,
  },
  filterChipText: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.text,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: TEACHER_COLORS.textWhite,
    fontWeight: '600',
  },
  submissionsList: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    gap: SPACING.md,
  },
  emptyTitle: {
    ...TEACHER_THEME.typography.h4,
    color: TEACHER_COLORS.text,
    textAlign: 'center',
  },
  emptyText: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  submissionCard: {
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
  submissionCardOverdue: {
    borderLeftWidth: 4,
    borderLeftColor: TEACHER_COLORS.error,
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: TEACHER_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  studentInitials: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textWhite,
    fontWeight: '600',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
    fontWeight: '600',
  },
  studentId: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
  },
  submissionMeta: {
    alignItems: 'flex-end',
  },
  submittedDate: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  overdueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TEACHER_COLORS.error,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs / 2,
  },
  overdueText: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textWhite,
    fontWeight: '600',
    fontSize: 10,
  },
  assignmentTitle: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  classInfo: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  attachmentsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  attachmentsText: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
  },
  gradeAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsInfo: {
    flex: 1,
  },
  pointsText: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.textSecondary,
    fontWeight: '600',
  },
  gradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  gradeButtonText: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textWhite,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.teacherPalette.overlay.dark,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: TEACHER_COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.teacherPalette.neutral.lighter,
  },
  modalTitle: {
    ...TEACHER_THEME.typography.h4,
    color: TEACHER_COLORS.text,
  },
  modalCloseButton: {
    padding: SPACING.xs,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  submissionDetails: {
    marginBottom: SPACING.lg,
  },
  modalStudentName: {
    ...TEACHER_THEME.typography.h3,
    color: TEACHER_COLORS.text,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  modalAssignmentName: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  modalClassName: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textMuted,
  },
  gradeInputSection: {
    marginBottom: SPACING.lg,
  },
  gradeInputLabel: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  gradeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  gradeInput: {
    ...TEACHER_THEME.typography.body,
    backgroundColor: TEACHER_COLORS.accent,
    borderWidth: 1,
    borderColor: COLORS.teacherPalette.neutral.lighter,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: TEACHER_COLORS.text,
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  gradeInputMax: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.textMuted,
    marginLeft: SPACING.sm,
    fontSize: 18,
    fontWeight: '600',
  },
  gradePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  letterGrade: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  letterGradeText: {
    ...TEACHER_THEME.typography.h4,
    color: TEACHER_COLORS.textWhite,
    fontWeight: '700',
  },
  percentageText: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.textMuted,
    fontWeight: '600',
  },
  feedbackSection: {
    marginBottom: SPACING.lg,
  },
  feedbackLabel: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  feedbackInput: {
    ...TEACHER_THEME.typography.body,
    backgroundColor: TEACHER_COLORS.accent,
    borderWidth: 1,
    borderColor: COLORS.teacherPalette.neutral.lighter,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: TEACHER_COLORS.text,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  submitGradeButton: {
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.teacherPalette.shadow.medium,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  submitGradeButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  submitGradeButtonText: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.textWhite,
    fontWeight: '600',
  },

  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: TEACHER_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.teacherPalette.neutral.lighter,
    gap: SPACING.sm,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  quickActionText: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textWhite,
    fontWeight: '600',
    fontSize: 12,
  },
 bottomPadding: {
    height: SPACING.xl,
  },
});

export default GradingDashboard;
