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
  FlatList,
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

const GradeBook = ({ navigation, route }) => {
  // ✅ Professional State Management
  const { classId: routeClassId, className: routeClassName } = route?.params || {};

  // Core Data States
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState({});

  // UI States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showClassSelector, setShowClassSelector] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Enhanced States
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [viewMode, setViewMode] = useState('overview'); // overview, detailed, analytics
  const [sortBy, setSortBy] = useState('name'); // name, average, total
  const [filterPeriod, setFilterPeriod] = useState('all'); // all, quarter1, quarter2, etc.

  // Animation References
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // ✅ Grade Scale Configuration
  const gradeScale = [
    { min: 90, max: 100, letter: 'A+', color: TEACHER_COLORS.success, gpa: 4.0 },
    { min: 85, max: 89, letter: 'A', color: TEACHER_COLORS.success, gpa: 3.7 },
    { min: 80, max: 84, letter: 'A-', color: COLORS.teacherPalette.grades.good, gpa: 3.3 },
    { min: 75, max: 79, letter: 'B+', color: COLORS.teacherPalette.grades.good, gpa: 3.0 },
    { min: 70, max: 74, letter: 'B', color: COLORS.teacherPalette.grades.average, gpa: 2.7 },
    { min: 65, max: 69, letter: 'B-', color: COLORS.teacherPalette.grades.average, gpa: 2.3 },
    { min: 60, max: 64, letter: 'C+', color: TEACHER_COLORS.warning, gpa: 2.0 },
    { min: 55, max: 59, letter: 'C', color: TEACHER_COLORS.warning, gpa: 1.7 },
    { min: 50, max: 54, letter: 'C-', color: COLORS.teacherPalette.grades.poor, gpa: 1.3 },
    { min: 0, max: 49, letter: 'F', color: TEACHER_COLORS.error, gpa: 0.0 },
  ];

  // ✅ View Mode Options
  const viewModeOptions = [
    { key: 'overview', label: 'Overview', icon: 'grid' },
    { key: 'detailed', label: 'Detailed', icon: 'list' },
    { key: 'analytics', label: 'Analytics', icon: 'bar-chart' },
  ];

  // ✅ Professional Data Loading
  const loadGradeBookData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      // 🔄 API calls commented out for development
      /*
      const [classesResponse, gradesResponse, assignmentsResponse] = await Promise.all([
        fetch('/api/teacher/classes', {
          headers: { 'Authorization': `Bearer ${userToken}` }
        }),
        selectedClass ? fetch(`/api/teacher/grades/${selectedClass.id}`, {
          headers: { 'Authorization': `Bearer ${userToken}` }
        }) : Promise.resolve(null),
        selectedClass ? fetch(`/api/teacher/assignments/${selectedClass.id}`, {
          headers: { 'Authorization': `Bearer ${userToken}` }
        }) : Promise.resolve(null)
      ]);

      const classesData = await classesResponse.json();
      setClasses(classesData);

      if (gradesResponse && gradesResponse.ok) {
        const gradesData = await gradesResponse.json();
        setStudents(gradesData.students);
        setGrades(gradesData.grades);
      }

      if (assignmentsResponse && assignmentsResponse.ok) {
        const assignmentsData = await assignmentsResponse.json();
        setAssignments(assignmentsData);
      }
      */

      // ✅ Enhanced Mock Data
      setTimeout(() => {
        const mockClasses = [
          {
            id: 1,
            name: 'Mathematics 10A',
            subject: 'Mathematics',
            totalStudents: 28,
            grade: '10',
            section: 'A',
            term: 'Fall 2024',
          },
          {
            id: 2,
            name: 'Physics 12B',
            subject: 'Science',
            totalStudents: 25,
            grade: '12',
            section: 'B',
            term: 'Fall 2024',
          },
          {
            id: 3,
            name: 'Chemistry 11C',
            subject: 'Science',
            totalStudents: 22,
            grade: '11',
            section: 'C',
            term: 'Fall 2024',
          },
        ];

        const mockAssignments = [
          {
            id: 1,
            title: 'Algebra Quiz - Chapter 5',
            type: 'Quiz',
            totalPoints: 50,
            weight: 15,
            dueDate: '2024-08-15T23:59:00Z',
            category: 'Assessment',
          },
          {
            id: 2,
            title: 'Homework Set 1',
            type: 'Homework',
            totalPoints: 25,
            weight: 10,
            dueDate: '2024-08-12T23:59:00Z',
            category: 'Practice',
          },
          {
            id: 3,
            title: 'Mid-term Exam',
            type: 'Exam',
            totalPoints: 100,
            weight: 30,
            dueDate: '2024-08-20T23:59:00Z',
            category: 'Major Assessment',
          },
          {
            id: 4,
            title: 'Class Participation',
            type: 'Participation',
            totalPoints: 20,
            weight: 15,
            dueDate: '2024-08-25T23:59:00Z',
            category: 'Engagement',
          },
        ];

        const mockStudents = [
          {
            id: 1,
            name: 'Emma Thompson',
            rollNumber: '001',
            email: 'emma.thompson@school.edu',
            currentGrade: 'A',
            percentage: 92.5,
            gpa: 3.8,
            trend: 'up',
          },
          {
            id: 2,
            name: 'James Wilson',
            rollNumber: '002',
            email: 'james.wilson@school.edu',
            currentGrade: 'B+',
            percentage: 87.3,
            gpa: 3.2,
            trend: 'stable',
          },
          {
            id: 3,
            name: 'Sofia Rodriguez',
            rollNumber: '003',
            email: 'sofia.rodriguez@school.edu',
            currentGrade: 'A-',
            percentage: 89.7,
            gpa: 3.5,
            trend: 'up',
          },
          {
            id: 4,
            name: 'Michael Chen',
            rollNumber: '004',
            email: 'michael.chen@school.edu',
            currentGrade: 'B',
            percentage: 82.1,
            gpa: 2.9,
            trend: 'down',
          },
          {
            id: 5,
            name: 'Isabella Garcia',
            rollNumber: '005',
            email: 'isabella.garcia@school.edu',
            currentGrade: 'A+',
            percentage: 96.2,
            gpa: 4.0,
            trend: 'up',
          },
        ];

        // Mock grades data structure
        const mockGrades = {};
        mockStudents.forEach(student => {
          mockGrades[student.id] = {};
          mockAssignments.forEach(assignment => {
            // Generate realistic grades
            const baseGrade = student.percentage;
            const variation = (Math.random() - 0.5) * 20; // ±10 points variation
            const grade = Math.max(0, Math.min(100, baseGrade + variation));
            const earnedPoints = Math.round((grade / 100) * assignment.totalPoints);

            mockGrades[student.id][assignment.id] = {
              earnedPoints,
              totalPoints: assignment.totalPoints,
              percentage: grade,
              letterGrade: getLetterGrade(grade).letter,
              feedback: grade > 85 ? 'Excellent work!' : grade > 70 ? 'Good effort!' : 'Needs improvement',
              submittedAt: new Date(assignment.dueDate).toISOString(),
              gradedAt: new Date().toISOString(),
            };
          });
        });

        setClasses(mockClasses);
        setAssignments(mockAssignments);
        setStudents(mockStudents);
        setGrades(mockGrades);

        // Auto-select class from route or first class
        const targetClass = routeClassId
          ? mockClasses.find(c => c.id === routeClassId)
          : mockClasses[0];

        if (targetClass) {
          setSelectedClass(targetClass);
        }

        setLoading(false);
        setRefreshing(false);
      }, 1000);

    } catch (error) {
      console.error('❌ Error loading gradebook data:', error);
      Alert.alert('Error', 'Failed to load gradebook data');
      setLoading(false);
      setRefreshing(false);
    }
  }, [routeClassId, selectedClass]);

  // ✅ Professional Utility Functions
  const getLetterGrade = useCallback((percentage) => {
    return gradeScale.find(g => percentage >= g.min && percentage <= g.max) || gradeScale[gradeScale.length - 1];
  }, [gradeScale]);

  const calculateStudentAverage = useCallback((studentId) => {
    const studentGrades = grades[studentId] || {};
    let totalPoints = 0;
    let earnedPoints = 0;
    let weightedScore = 0;
    let totalWeight = 0;

    assignments.forEach(assignment => {
      const grade = studentGrades[assignment.id];
      if (grade && grade.earnedPoints !== undefined) {
        const percentage = (grade.earnedPoints / grade.totalPoints) * 100;
        weightedScore += percentage * (assignment.weight / 100);
        totalWeight += assignment.weight / 100;

        totalPoints += grade.totalPoints;
        earnedPoints += grade.earnedPoints;
      }
    });

    const average = totalWeight > 0 ? weightedScore / totalWeight : 0;
    const letterGrade = getLetterGrade(average);

    return {
      percentage: average.toFixed(1),
      letterGrade: letterGrade.letter,
      color: letterGrade.color,
      gpa: letterGrade.gpa,
      totalPoints,
      earnedPoints,
    };
  }, [grades, assignments, getLetterGrade]);

  const getClassStatistics = useCallback(() => {
    if (students.length === 0) return null;

    const averages = students.map(student =>
      parseFloat(calculateStudentAverage(student.id).percentage)
    );

    const classAverage = averages.reduce((sum, avg) => sum + avg, 0) / averages.length;
    const highest = Math.max(...averages);
    const lowest = Math.min(...averages);

    const gradeDistribution = {};
    gradeScale.forEach(grade => {
      gradeDistribution[grade.letter] = averages.filter(avg =>
        avg >= grade.min && avg <= grade.max
      ).length;
    });

    return {
      classAverage: classAverage.toFixed(1),
      highest: highest.toFixed(1),
      lowest: lowest.toFixed(1),
      gradeDistribution,
      totalStudents: students.length,
    };
  }, [students, calculateStudentAverage, gradeScale]);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }, []);

  const getTrendIcon = useCallback((trend) => {
    switch (trend) {
      case 'up': return { name: 'trending-up', color: TEACHER_COLORS.success };
      case 'down': return { name: 'trending-down', color: TEACHER_COLORS.error };
      case 'stable': return { name: 'remove', color: TEACHER_COLORS.warning };
      default: return { name: 'remove', color: TEACHER_COLORS.textMuted };
    }
  }, []);

  // ✅ Professional Actions
  const openGradeModal = useCallback((student, assignment) => {
    setSelectedStudent(student);
    setSelectedAssignment(assignment);

    const currentGrade = grades[student.id]?.[assignment.id];
    setGradeInput(currentGrade?.earnedPoints?.toString() || '');
    setFeedbackInput(currentGrade?.feedback || '');
    setShowGradeModal(true);
  }, [grades]);

  const saveGrade = useCallback(async () => {
    if (!selectedStudent || !selectedAssignment || !gradeInput.trim()) {
      Alert.alert('Error', 'Please enter a grade');
      return;
    }

    const earnedPoints = parseFloat(gradeInput);
    if (isNaN(earnedPoints) || earnedPoints < 0 || earnedPoints > selectedAssignment.totalPoints) {
      Alert.alert('Error', `Grade must be between 0 and ${selectedAssignment.totalPoints}`);
      return;
    }

    try {
      setSaving(true);

      // 🔄 API call commented out
      /*
      const response = await fetch('/api/teacher/grades', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          assignmentId: selectedAssignment.id,
          earnedPoints,
          totalPoints: selectedAssignment.totalPoints,
          feedback: feedbackInput.trim(),
        }),
      });

      if (!response.ok) throw new Error('Failed to save grade');
      */

      // ✅ Mock save simulation
      await new Promise(resolve => setTimeout(resolve, 800));

      // Update local state
      const percentage = (earnedPoints / selectedAssignment.totalPoints) * 100;
      const letterGrade = getLetterGrade(percentage);

      setGrades(prev => ({
        ...prev,
        [selectedStudent.id]: {
          ...prev[selectedStudent.id],
          [selectedAssignment.id]: {
            earnedPoints,
            totalPoints: selectedAssignment.totalPoints,
            percentage,
            letterGrade: letterGrade.letter,
            feedback: feedbackInput.trim(),
            gradedAt: new Date().toISOString(),
          },
        },
      }));

      setShowGradeModal(false);
      Alert.alert('Success!', 'Grade saved successfully');

    } catch (error) {
      console.error('❌ Error saving grade:', error);
      Alert.alert('Error', 'Failed to save grade. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [selectedStudent, selectedAssignment, gradeInput, feedbackInput, getLetterGrade]);

  const exportGradebook = useCallback((format) => {
    Alert.alert(
      'Export Gradebook',
      `Export ${selectedClass?.name || 'gradebook'} as ${format.toUpperCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            // TODO: Implement actual export functionality
            setShowExportModal(false);
            Alert.alert('Success!', `Gradebook exported as ${format.toUpperCase()}`);
          }
        }
      ]
    );
  }, [selectedClass]);

  // ✅ Filtered and Sorted Data
  const getFilteredStudents = useCallback(() => {
    let filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort students
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'average':
          const avgA = parseFloat(calculateStudentAverage(a.id).percentage);
          const avgB = parseFloat(calculateStudentAverage(b.id).percentage);
          return avgB - avgA; // Descending order
        case 'total':
          const totalA = calculateStudentAverage(a.id).earnedPoints;
          const totalB = calculateStudentAverage(b.id).earnedPoints;
          return totalB - totalA; // Descending order
        default:
          return 0;
      }
    });

    return filtered;
  }, [students, searchQuery, sortBy, calculateStudentAverage]);

  // ✅ Header Component
  const HeaderRightComponent = () => (
    <View style={styles.headerActions}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => setShowExportModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="download" size={20} color={TEACHER_COLORS.textWhite} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => navigation.navigate('GradingDashboard')}
        activeOpacity={0.8}
      >
        <Ionicons name="create" size={20} color={TEACHER_COLORS.textWhite} />
      </TouchableOpacity>
    </View>
  );

  // ✅ Initialize Data
  useFocusEffect(
    useCallback(() => {
      loadGradeBookData();
    }, [loadGradeBookData])
  );

  const onRefresh = useCallback(() => {
    loadGradeBookData(true);
  }, [loadGradeBookData]);

  const filteredStudents = getFilteredStudents();
  const classStats = getClassStatistics();

  // ✅ Professional Loading State
  if (loading) {
    return (
      <View style={styles.container}>
        <SimpleHeader
          title="Grade Book"
          subtitle="Loading..."
          navigation={navigation}
          primaryColor={TEACHER_COLORS.primary}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={TEACHER_COLORS.primary} />
          <Text style={styles.loadingText}>Loading gradebook data...</Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* ✅ Professional Header */}
      <SimpleHeader
        title="Grade Book"
        subtitle={selectedClass ? `${selectedClass.name} • ${selectedClass.term}` : 'Select a class'}
        navigation={navigation}
        primaryColor={TEACHER_COLORS.primary}
        rightComponent={<HeaderRightComponent />}
      />

      {/* ✅ Class Statistics */}
      {classStats && (
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { borderLeftColor: TEACHER_COLORS.primary }]}>
            <Text style={styles.statValue}>{classStats.classAverage}%</Text>
            <Text style={styles.statLabel}>Class Average</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: TEACHER_COLORS.success }]}>
            <Text style={styles.statValue}>{classStats.highest}%</Text>
            <Text style={styles.statLabel}>Highest</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: TEACHER_COLORS.error }]}>
            <Text style={styles.statValue}>{classStats.lowest}%</Text>
            <Text style={styles.statLabel}>Lowest</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: TEACHER_COLORS.warning }]}>
            <Text style={styles.statValue}>{classStats.totalStudents}</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
        </View>
      )}

      {/* ✅ Assignments Header */}
      <View style={styles.assignmentsHeader}>
        <Text style={styles.assignmentsTitle}>📚 Assignments</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.assignmentsContainer}>
          {assignments.map((assignment) => (
            <View key={assignment.id} style={styles.assignmentChip}>
              <Text style={styles.assignmentChipTitle} numberOfLines={1}>
                {assignment.title}
              </Text>
              <Text style={styles.assignmentChipPoints}>
                {assignment.totalPoints}pts • {assignment.weight}%
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* ✅ Controls */}
      <View style={styles.controlsContainer}>
        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={TEACHER_COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search students..."
            placeholderTextColor={TEACHER_COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Sort Options */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortContainer}>
          {[
            { key: 'name', label: 'Name', icon: 'person' },
            { key: 'average', label: 'Average', icon: 'bar-chart' },
            { key: 'total', label: 'Total', icon: 'calculator' },
          ].map((sort) => (
            <TouchableOpacity
              key={sort.key}
              style={[
                styles.sortChip,
                sortBy === sort.key && styles.sortChipActive
              ]}
              onPress={() => setSortBy(sort.key)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={sort.icon}
                size={16}
                color={sortBy === sort.key ? TEACHER_COLORS.textWhite : TEACHER_COLORS.primary}
              />
              <Text style={[
                styles.sortChipText,
                sortBy === sort.key && styles.sortChipTextActive
              ]}>
                {sort.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ✅ Students Gradebook */}
      <ScrollView
        style={styles.gradebookContainer}
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
        {filteredStudents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="school-outline" size={64} color={TEACHER_COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No students found</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Try adjusting your search terms' : 'No students enrolled in this class'}
            </Text>
          </View>
        ) : (
          filteredStudents.map((student) => {
            const studentAverage = calculateStudentAverage(student.id);
            const trendIcon = getTrendIcon(student.trend);

            return (
              <View key={student.id} style={styles.studentCard}>
                {/* Student Header */}
                <View style={styles.studentHeader}>
                  <View style={styles.studentInfo}>
                    <View style={[styles.studentAvatar, { backgroundColor: studentAverage.color }]}>
                      <Text style={styles.studentInitials}>
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </Text>
                    </View>
                    <View style={styles.studentDetails}>
                      <Text style={styles.studentName}>{student.name}</Text>
                      <Text style={styles.studentMeta}>Roll: {student.rollNumber}</Text>
                    </View>
                  </View>

                  <View style={styles.studentStats}>
                    <View style={styles.gradeDisplay}>
                      <Text style={[styles.letterGrade, { color: studentAverage.color }]}>
                        {studentAverage.letterGrade}
                      </Text>
                      <Text style={styles.percentage}>{studentAverage.percentage}%</Text>
                    </View>
                    <Ionicons
                      name={trendIcon.name}
                      size={20}
                      color={trendIcon.color}
                    />
                  </View>
                </View>

                {/* Assignment Grades */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gradesScroll}>
                  {assignments.map((assignment) => {
                    const grade = grades[student.id]?.[assignment.id];
                    const hasGrade = grade && grade.earnedPoints !== undefined;

                    return (
                      <TouchableOpacity
                        key={assignment.id}
                        style={[
                          styles.gradeCell,
                          hasGrade && { backgroundColor: TEACHER_COLORS.accent }
                        ]}
                        onPress={() => openGradeModal(student, assignment)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.gradeCellTitle} numberOfLines={1}>
                          {assignment.title}
                        </Text>
                        {hasGrade ? (
                          <>
                            <Text style={[styles.gradeCellScore, { color: getLetterGrade(grade.percentage).color }]}>
                              {grade.earnedPoints}/{assignment.totalPoints}
                            </Text>
                            <Text style={styles.gradeCellPercentage}>
                              {grade.percentage.toFixed(0)}%
                            </Text>
                          </>
                        ) : (
                          <Text style={styles.gradeCellEmpty}>Not Graded</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Student Summary */}
                <View style={styles.studentSummary}>
                  <Text style={styles.summaryText}>
                    Total: {studentAverage.earnedPoints}/{studentAverage.totalPoints} pts
                  </Text>
                  <Text style={styles.summaryGPA}>GPA: {studentAverage.gpa}</Text>
                </View>
              </View>
            );
          })
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* ✅ Grade Edit Modal */}
      <Modal
        visible={showGradeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGradeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Grade</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowGradeModal(false)}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={24} color={TEACHER_COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {selectedStudent && selectedAssignment && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.gradeEditDetails}>
                  <Text style={styles.modalStudentName}>{selectedStudent.name}</Text>
                  <Text style={styles.modalAssignmentName}>{selectedAssignment.title}</Text>
                  <Text style={styles.modalAssignmentInfo}>
                    Out of {selectedAssignment.totalPoints} points • Weight: {selectedAssignment.weight}%
                  </Text>
                </View>

                <View style={styles.gradeInputSection}>
                  <Text style={styles.gradeInputLabel}>Points Earned</Text>
                  <View style={styles.gradeInputContainer}>
                    <TextInput
                      style={styles.gradeInput}
                      value={gradeInput}
                      onChangeText={setGradeInput}
                      placeholder="0"
                      placeholderTextColor={TEACHER_COLORS.textMuted}
                      keyboardType="numeric"
                    />
                    <Text style={styles.gradeInputMax}>/{selectedAssignment.totalPoints}</Text>
                  </View>

                  {gradeInput && !isNaN(parseFloat(gradeInput)) && (
                    <View style={styles.gradePreview}>
                      {(() => {
                        const percentage = (parseFloat(gradeInput) / selectedAssignment.totalPoints) * 100;
                        const grade = getLetterGrade(percentage);
                        return (
                          <>
                            <View style={[styles.letterGradeBadge, { backgroundColor: grade.color }]}>
                              <Text style={styles.letterGradeText}>{grade.letter}</Text>
                            </View>
                            <Text style={styles.percentageText}>
                              {percentage.toFixed(1)}%
                            </Text>
                          </>
                        );
                      })()}
                    </View>
                  )}
                </View>

                <View style={styles.feedbackSection}>
                  <Text style={styles.feedbackLabel}>Feedback (Optional)</Text>
                  <TextInput
                    style={styles.feedbackInput}
                    value={feedbackInput}
                    onChangeText={setFeedbackInput}
                    placeholder="Provide feedback for the student..."
                    placeholderTextColor={TEACHER_COLORS.textMuted}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.saveGradeButton,
                    { backgroundColor: TEACHER_COLORS.primary },
                    saving && styles.saveGradeButtonDisabled
                  ]}
                  onPress={saveGrade}
                  disabled={saving}
                  activeOpacity={0.8}
                >
                  {saving ? (
                    <ActivityIndicator color={TEACHER_COLORS.textWhite} />
                  ) : (
                    <View style={styles.saveButtonContent}>
                      <Ionicons name="save" size={20} color={TEACHER_COLORS.textWhite} />
                      <Text style={styles.saveGradeButtonText}>Save Grade</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ✅ Export Modal */}
      <Modal
        visible={showExportModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.exportModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Export Gradebook</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowExportModal(false)}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={24} color={TEACHER_COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.exportOptions}>
              {[
                { format: 'csv', label: 'CSV Spreadsheet', icon: 'document-text', description: 'For Excel, Google Sheets' },
                { format: 'pdf', label: 'PDF Report', icon: 'document', description: 'Formatted report for printing' },
                { format: 'json', label: 'JSON Data', icon: 'code', description: 'Raw data for developers' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.format}
                  style={styles.exportOption}
                  onPress={() => exportGradebook(option.format)}
                  activeOpacity={0.8}
                >
                  <View style={styles.exportOptionIcon}>
                    <Ionicons name={option.icon} size={24} color={TEACHER_COLORS.primary} />
                  </View>
                  <View style={styles.exportOptionInfo}>
                    <Text style={styles.exportOptionLabel}>{option.label}</Text>
                    <Text style={styles.exportOptionDescription}>{option.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={TEACHER_COLORS.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
};

// ✅ Professional Styles
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
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
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
  assignmentsHeader: {
    backgroundColor: TEACHER_COLORS.surface,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.teacherPalette.neutral.lighter,
  },
  assignmentsTitle: {
    ...TEACHER_THEME.typography.h4,
    color: TEACHER_COLORS.text,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  assignmentsContainer: {
    paddingHorizontal: SPACING.md,
  },
  assignmentChip: {
    backgroundColor: TEACHER_COLORS.accent,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginRight: SPACING.sm,
    minWidth: 120,
    alignItems: 'center',
  },
  assignmentChipTitle: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.text,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.xs / 2,
  },
  assignmentChipPoints: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
    fontSize: 10,
  },
  controlsContainer: {
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
  sortContainer: {
    flexDirection: 'row',
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: TEACHER_COLORS.accent,
    marginRight: SPACING.sm,
    gap: SPACING.xs,
  },
  sortChipActive: {
    backgroundColor: TEACHER_COLORS.primary,
  },
  sortChipText: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.primary,
    fontWeight: '500',
  },
  sortChipTextActive: {
    color: TEACHER_COLORS.textWhite,
    fontWeight: '600',
  },
  gradebookContainer: {
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
  studentCard: {
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
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  studentAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  studentInitials: {
    ...TEACHER_THEME.typography.body,
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
    marginBottom: SPACING.xs / 2,
  },
  studentMeta: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
  },
  studentStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  gradeDisplay: {
    alignItems: 'center',
  },
  letterGrade: {
    ...TEACHER_THEME.typography.h3,
    fontWeight: '700',
  },
  percentage: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
  },
  gradesScroll: {
    marginBottom: SPACING.md,
  },
  gradeCell: {
    backgroundColor: TEACHER_COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginRight: SPACING.sm,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.teacherPalette.neutral.lighter,
  },
  gradeCellTitle: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  gradeCellScore: {
    ...TEACHER_THEME.typography.body,
    fontWeight: '600',
    marginBottom: SPACING.xs / 2,
  },
  gradeCellPercentage: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
    fontSize: 11,
  },
  gradeCellEmpty: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
    fontStyle: 'italic',
  },
  studentSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.teacherPalette.neutral.lighter,
  },
  summaryText: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textSecondary,
    fontWeight: '500',
  },
  summaryGPA: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.primary,
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
    maxHeight: '80%',
  },
  exportModalContent: {
    backgroundColor: TEACHER_COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '60%',
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
  gradeEditDetails: {
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
  modalAssignmentInfo: {
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
  letterGradeBadge: {
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
    minHeight: 80,
  },
  saveGradeButton: {
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveGradeButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  saveGradeButtonText: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.textWhite,
    fontWeight: '600',
  },
  exportOptions: {
    padding: SPACING.lg,
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    backgroundColor: TEACHER_COLORS.accent,
  },
  exportOptionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: TEACHER_COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  exportOptionInfo: {
    flex: 1,
  },
  exportOptionLabel: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs / 2,
  },
  exportOptionDescription: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
  },
  bottomPadding: {
    height: SPACING.xl,
  },
});

export default GradeBook;
