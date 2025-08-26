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

const { width: screenWidth } = Dimensions.get('window');

const ClassDetails = ({ navigation, route }) => {
  const { user } = useAuth();
  // ✅ Professional State Management
  const { classId, className, classData: passedClassData } = route.params || {};

  const [classData, setClassData] = useState(null);
  // Students state
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentData, setNewStudentData] = useState({
    fullName: '',
    email: '',
    rollNumber: '',
  });

  // ✅ Enhanced Tab Animation References
  const tabScrollRef = useRef(null);
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;
  const tabOpacityAnim = useRef(new Animated.Value(1)).current;

  // ✅ Enhanced Tab Configuration
  // API Integration: Only real API call for class details
  // Load class details and students
  const loadClassDetails = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      // Use real API call for class details
      const response = await teacherService.getClass(classId);
      setClassData(response?.data || null);

      // Fetch students for this class
      const studentsRes = await teacherService.getClassStudents(classId);
      // Normalize student objects (add fallback fields if missing)
      const studentsList = (studentsRes?.data || []).map((s) => ({
        id: s._id || s.id,
        name: s.name || s.fullName || s.firstName || s.lastName || 'Unnamed',
        email: s.email,
        rollNumber: s.rollNumber || '',
        averageGrade: s.averageGrade || 0,
        attendancePercentage: s.attendancePercentage || 100,
        status: s.status || 'active',
      }));
      setStudents(studentsList);

      // Fetch all assignments for the teacher, then filter for this class
      if (user?._id || user?.id) {
        const teacherId = user._id || user.id;
        const assignmentsRes = await teacherService.getTeacherAssignments(
          teacherId,
        );
        const allAssignments = assignmentsRes?.data || [];
        // Filter assignments for this class
        const classAssignments = allAssignments.filter(
          (a) => a.class === classId || a.class?._id === classId,
        );
        setAssignments(classAssignments);
      } else {
        setAssignments([]);
      }

      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('❌ Error loading class details:', error);
      Alert.alert('Error', 'Failed to load class details');
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Tab configuration (restored)
  const tabs = [
    {
      key: 'overview',
      label: 'Overview',
      icon: 'analytics-outline',
      activeIcon: 'analytics',
      color: TEACHER_COLORS.primary,
      width: 110,
    },
    {
      key: 'students',
      label: 'Students',
      icon: 'people-outline',
      activeIcon: 'people',
      badge: students.length,
      color: COLORS.teacherPalette.subjects.english || TEACHER_COLORS.secondary,
      width: 105,
    },
    {
      key: 'assignments',
      label: 'Assignments',
      icon: 'document-text-outline',
      activeIcon: 'document-text',
      badge: assignments.length,
      color: COLORS.teacherPalette.subjects.science || TEACHER_COLORS.accent,
      width: 125,
    },
    {
      key: 'attendance',
      label: 'Attendance',
      icon: 'calendar-outline',
      activeIcon: 'calendar',
      color: TEACHER_COLORS.success,
      width: 120,
    },
  ];

  // Replace the handleTabChange function:
  const handleTabChange = useCallback(
    (tabKey) => {
      if (tabKey === activeTab) return;

      const tabIndex = tabs.findIndex((tab) => tab.key === tabKey);

      if (tabScrollRef.current && tabIndex >= 0) {
        const tabPosition = tabs
          .slice(0, tabIndex)
          .reduce((acc, tab) => acc + tab.width, 0);
        const scrollPosition = Math.max(
          0,
          tabPosition - screenWidth / 2 + tabs[tabIndex].width / 2,
        );

        tabScrollRef.current.scrollTo({
          x: scrollPosition,
          animated: true,
        });
      }

      setActiveTab(tabKey);
    },
    [activeTab, tabs],
  );

  // ✅ Navigation Handlers (same as before)
  const navigateToAttendance = useCallback(() => {
    navigation.navigate('AttendanceTracker', {
      classId: classId,
      className: classData?.name,
    });
  }, [navigation, classId, classData]);

  const navigateToCreateAssignment = useCallback(() => {
    navigation.navigate('CreateAssignment', {
      classId: classId,
      className: classData?.name,
    });
  }, [navigation, classId, classData]);

  const navigateToAssignmentDetails = useCallback(
    (assignment) => {
      navigation.navigate('AssignmentDetails', {
        assignmentId: assignment.id,
        assignment: assignment,
        classId: classId,
      });
    },
    [navigation, classId],
  );

  const navigateToStudentProfile = useCallback(
    (student) => {
      navigation.navigate('StudentProfile', {
        studentId: student.id,
        studentName: student.name,
        classId: classId,
      });
    },
    [navigation, classId],
  );

  // ✅ Professional Student Management (same as before)
  // Add student using API
  const addStudent = useCallback(async () => {
    if (
      !newStudentData.fullName.trim() ||
      !newStudentData.email.trim() ||
      !newStudentData.rollNumber.trim()
    ) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    try {
      const payload = {
        fullName: newStudentData.fullName,
        email: newStudentData.email,
        rollNumber: newStudentData.rollNumber,
      };
      const res = await teacherService.addStudentToClass(classId, payload);
      const student = res?.data;
      if (student) {
        setStudents((prev) => [
          ...prev,
          {
            id: student._id || student.id,
            name: student.fullName || student.name,
            email: student.email,
            rollNumber: student.rollNumber || '',
            averageGrade: student.averageGrade || 0,
            attendancePercentage: student.attendancePercentage || 100,
            status: student.status || 'active',
          },
        ]);
        setNewStudentData({ fullName: '', email: '', rollNumber: '' });
        setShowAddStudentModal(false);
        Alert.alert('Success', 'Student added successfully!');
      } else {
        throw new Error('No student returned');
      }
    } catch (error) {
      console.error('❌ Error adding student:', error);
      Alert.alert('Error', 'Failed to add student');
    }
  }, [newStudentData, classId]);

  // ✅ Utility Functions (same as before)
  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }, []);

  const getGradeColor = useCallback((grade) => {
    if (grade >= 90) return TEACHER_COLORS.gradeA || TEACHER_COLORS.success;
    if (grade >= 80)
      return (
        TEACHER_COLORS.gradeB ||
        COLORS.teacherPalette.secondary?.main ||
        TEACHER_COLORS.primary
      );
    if (grade >= 70) return TEACHER_COLORS.gradeC || TEACHER_COLORS.warning;
    if (grade >= 60) return TEACHER_COLORS.gradeD || TEACHER_COLORS.warning;
    return TEACHER_COLORS.gradeF || TEACHER_COLORS.error;
  }, []);

  const getAttendanceColor = useCallback((percentage) => {
    if (percentage >= 95) return TEACHER_COLORS.success;
    if (percentage >= 85) return TEACHER_COLORS.warning;
    return TEACHER_COLORS.error;
  }, []);

  const getAssignmentTypeIcon = useCallback((type) => {
    const icons = {
      homework: 'book-outline',
      quiz: 'help-circle-outline',
      test: 'document-text-outline',
      project: 'briefcase-outline',
      lab: 'flask-outline',
    };
    return icons[type] || 'document-outline';
  }, []);

  const getSubjectColor = useCallback((subject) => {
    if (!subject || typeof subject !== 'string') return TEACHER_COLORS.primary;
    return (
      COLORS.teacherPalette?.subjects?.[subject.toLowerCase()] ||
      TEACHER_COLORS.primary
    );
  }, []);

  // ✅ Professional Filter Logic
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ✅ Professional Header Component
  const HeaderRightComponent = () => (
    <TouchableOpacity
      style={styles.headerButton}
      onPress={navigateToCreateAssignment}
      activeOpacity={0.8}
    >
      <Ionicons name="add" size={24} color={TEACHER_COLORS.textWhite} />
    </TouchableOpacity>
  );

  // Scrollable Tab Bar Component
  const EnhancedTabBar = () => {
    const activeTabData = tabs.find((tab) => tab.key === activeTab);
    const indicatorWidth = activeTabData?.width || 100;

    return (
      <View style={styles.tabBarContainer}>
        <View style={styles.tabBarGradient}>
          <ScrollView
            ref={tabScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScrollContent}
            style={styles.tabScrollView}
            bounces={false}
            decelerationRate="fast"
            scrollEventThrottle={16}
          >
            {/* ✅ Tab Items */}
            {tabs.map((tab, index) => {
              const isActive = activeTab === tab.key;
              const tabColor = isActive ? tab.color : TEACHER_COLORS.textMuted;

              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[
                    styles.enhancedTab,
                    { width: tab.width },
                    isActive && [
                      styles.enhancedActiveTab,
                      { borderBottomColor: tab.color },
                    ],
                  ]}
                  onPress={() => handleTabChange(tab.key)}
                  activeOpacity={0.7}
                >
                  <View style={styles.tabItemContent}>
                    {/* ✅ Tab Icon */}
                    <View
                      style={[
                        styles.tabIconContainer,
                        isActive && { backgroundColor: `${tab.color}20` },
                      ]}
                    >
                      <Ionicons
                        name={isActive ? tab.activeIcon : tab.icon}
                        size={isActive ? 20 : 18}
                        color={tabColor}
                      />
                    </View>

                    {/* ✅ Tab Label */}
                    <Text
                      style={[
                        styles.enhancedTabText,
                        {
                          color: tabColor,
                          fontWeight: isActive ? '700' : '500',
                        },
                      ]}
                    >
                      {tab.label}
                    </Text>

                    {/* ✅ Tab Badge */}
                    {tab.badge > 0 && (
                      <View
                        style={[
                          styles.enhancedTabBadge,
                          {
                            backgroundColor: isActive
                              ? tab.color
                              : TEACHER_COLORS.error,
                          },
                        ]}
                      >
                        <Text style={styles.enhancedTabBadgeText}>
                          {tab.badge > 99 ? '99+' : tab.badge}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ✅ Tab Bar Border */}
          <View style={styles.tabBarBorder} />
        </View>
      </View>
    );
  };

  // ✅ Initialize Data
  useFocusEffect(
    useCallback(() => {
      loadClassDetails();
    }, [classId]),
  );

  const onRefresh = useCallback(() => {
    loadClassDetails(true);
  }, []);

  // ✅ Professional Loading State
  if (loading) {
    return (
      <View style={styles.container}>
        <SimpleHeader
          title="Class Details"
          subtitle="Loading..."
          navigation={navigation}
          primaryColor={TEACHER_COLORS.primary}
          rightComponent={<HeaderRightComponent />}
        />
        <EnhancedTabBar />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={TEACHER_COLORS.primary} />
          <Text style={styles.loadingText}>Loading class details...</Text>
        </View>
      </View>
    );
  }

  // ✅ Professional Error State
  if (!classData) {
    return (
      <View style={styles.container}>
        <SimpleHeader
          title="Class Not Found"
          navigation={navigation}
          primaryColor={TEACHER_COLORS.primary}
        />
        <View style={styles.loadingContainer}>
          <Ionicons
            name="school-outline"
            size={64}
            color={TEACHER_COLORS.textMuted}
          />
          <Text style={styles.errorText}>Class not found</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadClassDetails()}
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
        title={classData.name}
        subtitle={`${classData.subject} • ${classData.totalStudents} students`}
        navigation={navigation}
        primaryColor={getSubjectColor(classData.subject)}
        rightComponent={<HeaderRightComponent />}
      />

      {/* ✅ Enhanced Scrollable Tab Bar */}
      <EnhancedTabBar />

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
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <View>
            {/* ✅ Professional Class Info */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color={TEACHER_COLORS.primary}
                />
                <Text style={styles.sectionTitle}>Class Information</Text>
              </View>

              <View style={styles.classCard}>
                <LinearGradient
                  colors={[
                    getSubjectColor(classData.subject),
                    `${getSubjectColor(classData.subject)}DD`,
                  ]}
                  style={styles.classCardHeader}
                >
                  <View style={styles.classIcon}>
                    <Ionicons
                      name="school"
                      size={28}
                      color={TEACHER_COLORS.textWhite}
                    />
                  </View>
                  <View style={styles.classHeaderInfo}>
                    <Text style={styles.classTitle}>{classData.name}</Text>
                    <Text style={styles.classSubtitle}>
                      {classData.subject} • Grade {classData.grade}
                      {classData.section}
                    </Text>
                  </View>
                </LinearGradient>

                <View style={styles.classCardContent}>
                  <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                      <Ionicons
                        name="location-outline"
                        size={16}
                        color={TEACHER_COLORS.primary}
                      />
                      <Text style={styles.infoLabel}>Room:</Text>
                      <Text style={styles.infoValue}>{classData.room}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons
                        name="time-outline"
                        size={16}
                        color={TEACHER_COLORS.textMuted}
                      />
                      <Text style={styles.infoLabel}>Schedule:</Text>
                      <Text style={styles.infoValue}>
                        {classData.schedule &&
                        Array.isArray(classData.schedule.days)
                          ? `${classData.schedule.days.join(', ')} ${
                              classData.schedule.time || ''
                            }`
                          : typeof classData.schedule === 'string'
                          ? classData.schedule
                          : '-'}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons
                        name="people-outline"
                        size={16}
                        color={TEACHER_COLORS.success}
                      />
                      <Text style={styles.infoLabel}>Students:</Text>
                      <Text style={styles.infoValue}>
                        {classData.totalStudents}
                      </Text>
                    </View>
                  </View>

                  {classData.description && (
                    <View style={styles.descriptionContainer}>
                      <Text style={styles.descriptionTitle}>Description</Text>
                      <Text style={styles.description}>
                        {classData.description}
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
                <Text style={styles.sectionTitle}>Quick Stats</Text>
              </View>

              <View style={styles.statsGrid}>
                <View
                  style={[
                    styles.statCard,
                    { borderLeftColor: TEACHER_COLORS.primary },
                  ]}
                >
                  <Text style={styles.statValue}>{students.length}</Text>
                  <Text style={styles.statLabel}>Students</Text>
                </View>
                <View
                  style={[
                    styles.statCard,
                    {
                      borderLeftColor:
                        COLORS.teacherPalette?.subjects?.science ||
                        TEACHER_COLORS.secondary,
                    },
                  ]}
                >
                  <Text style={styles.statValue}>{assignments.length}</Text>
                  <Text style={styles.statLabel}>Assignments</Text>
                </View>
                <View
                  style={[
                    styles.statCard,
                    { borderLeftColor: TEACHER_COLORS.success },
                  ]}
                >
                  <Text style={styles.statValue}>
                    {attendanceStats.averageAttendance}%
                  </Text>
                  <Text style={styles.statLabel}>Attendance</Text>
                </View>
                <View
                  style={[
                    styles.statCard,
                    { borderLeftColor: TEACHER_COLORS.warning },
                  ]}
                >
                  <Text style={styles.statValue}>
                    {students.length > 0
                      ? Math.round(
                          students.reduce((sum, s) => sum + s.averageGrade, 0) /
                            students.length,
                        )
                      : 0}
                    %
                  </Text>
                  <Text style={styles.statLabel}>Avg Grade</Text>
                </View>
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
                    { backgroundColor: TEACHER_COLORS.success },
                  ]}
                  onPress={navigateToAttendance}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="calendar"
                    size={24}
                    color={TEACHER_COLORS.textWhite}
                  />
                  <Text style={styles.actionButtonText}>Take Attendance</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor:
                        COLORS.teacherPalette?.subjects?.science ||
                        TEACHER_COLORS.secondary,
                    },
                  ]}
                  onPress={navigateToCreateAssignment}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="add-circle"
                    size={24}
                    color={TEACHER_COLORS.textWhite}
                  />
                  <Text style={styles.actionButtonText}>New Assignment</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: TEACHER_COLORS.primary },
                  ]}
                  onPress={() => handleTabChange('students')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="people"
                    size={24}
                    color={TEACHER_COLORS.textWhite}
                  />
                  <Text style={styles.actionButtonText}>View Students</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: TEACHER_COLORS.warning },
                  ]}
                  onPress={() => handleTabChange('assignments')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="create"
                    size={24}
                    color={TEACHER_COLORS.textWhite}
                  />
                  <Text style={styles.actionButtonText}>Manage Work</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <View>
            {/* Search and Add */}
            <View style={styles.section}>
              <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                  <Ionicons
                    name="search-outline"
                    size={20}
                    color={TEACHER_COLORS.textMuted}
                  />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search students..."
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
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    { backgroundColor: TEACHER_COLORS.primary },
                  ]}
                  onPress={() => setShowAddStudentModal(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="add"
                    size={20}
                    color={TEACHER_COLORS.textWhite}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Students List */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="people-outline"
                  size={24}
                  color={TEACHER_COLORS.primary}
                />
                <Text style={styles.sectionTitle}>
                  Students ({filteredStudents.length})
                </Text>
              </View>

              {filteredStudents.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons
                    name={searchQuery ? 'search-outline' : 'people-outline'}
                    size={48}
                    color={TEACHER_COLORS.textMuted}
                  />
                  <Text style={styles.emptyStateText}>
                    {searchQuery ? 'No students found' : 'No students enrolled'}
                  </Text>
                </View>
              ) : (
                filteredStudents.map((student) => (
                  <View key={student.id} style={styles.studentCard}>
                    <TouchableOpacity
                      style={{ flex: 1 }}
                      onPress={() => navigateToStudentProfile(student)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.studentInfo}>
                        <Text style={styles.studentName}>{student.name}</Text>
                        <Text style={styles.studentMeta}>
                          Roll: {student.rollNumber} • {student.email}
                        </Text>
                      </View>
                      <View style={styles.studentStats}>
                        <View style={styles.studentStat}>
                          <Text
                            style={[
                              styles.studentStatValue,
                              { color: getGradeColor(student.averageGrade) },
                            ]}
                          >
                            {student.averageGrade.toFixed(0)}%
                          </Text>
                          <Text style={styles.studentStatLabel}>Grade</Text>
                        </View>
                        <View style={styles.studentStat}>
                          <Text
                            style={[
                              styles.studentStatValue,
                              {
                                color: getAttendanceColor(
                                  student.attendancePercentage,
                                ),
                              },
                            ]}
                          >
                            {student.attendancePercentage}%
                          </Text>
                          <Text style={styles.studentStatLabel}>
                            Attendance
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                    {/* View Button */}
                    <TouchableOpacity
                      style={{ marginHorizontal: 8 }}
                      onPress={() => navigateToStudentProfile(student)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="eye-outline"
                        size={22}
                        color={TEACHER_COLORS.primary}
                      />
                    </TouchableOpacity>
                    {/* Delete Button */}
                    <TouchableOpacity
                      style={{ marginHorizontal: 4 }}
                      onPress={async () => {
                        Alert.alert(
                          'Remove Student',
                          `Are you sure you want to remove ${student.name} from this class?`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Remove',
                              style: 'destructive',
                              onPress: async () => {
                                try {
                                  await teacherService.removeStudentFromClass(
                                    classId,
                                    student.id,
                                  );
                                  setStudents((prev) =>
                                    prev.filter((s) => s.id !== student.id),
                                  );
                                  Alert.alert(
                                    'Removed',
                                    'Student removed from class.',
                                  );
                                } catch (err) {
                                  Alert.alert(
                                    'Error',
                                    'Failed to remove student.',
                                  );
                                }
                              },
                            },
                          ],
                          { cancelable: true },
                        );
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={22}
                        color={TEACHER_COLORS.error}
                      />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <View>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="document-text-outline"
                  size={24}
                  color={TEACHER_COLORS.primary}
                />
                <Text style={styles.sectionTitle}>
                  Assignments ({assignments.length})
                </Text>
                <TouchableOpacity
                  style={[
                    styles.createButton,
                    { backgroundColor: TEACHER_COLORS.primary },
                  ]}
                  onPress={navigateToCreateAssignment}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="add"
                    size={16}
                    color={TEACHER_COLORS.textWhite}
                  />
                  <Text style={styles.createButtonText}>Create</Text>
                </TouchableOpacity>
              </View>

              {assignments.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="document-text-outline"
                    size={48}
                    color={TEACHER_COLORS.textMuted}
                  />
                  <Text style={styles.emptyStateText}>
                    No assignments created
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyStateButton}
                    onPress={navigateToCreateAssignment}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.emptyStateButtonText}>
                      Create Assignment
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                assignments.map((assignment) => (
                  <TouchableOpacity
                    key={assignment.id}
                    style={styles.assignmentCard}
                    onPress={() => navigateToAssignmentDetails(assignment)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.assignmentHeader}>
                      <View style={styles.assignmentInfo}>
                        <View style={styles.assignmentTitleRow}>
                          <Ionicons
                            name={getAssignmentTypeIcon(assignment.type)}
                            size={16}
                            color={TEACHER_COLORS.primary}
                          />
                          <Text style={styles.assignmentTitle}>
                            {assignment.title}
                          </Text>
                        </View>
                        <Text style={styles.assignmentDue}>
                          Due: {formatDate(assignment.dueDate)}
                        </Text>
                      </View>
                      <Text style={styles.assignmentPoints}>
                        {assignment.totalPoints} pts
                      </Text>
                    </View>

                    <View style={styles.assignmentProgress}>
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
                              backgroundColor:
                                assignment.gradedCount ===
                                assignment.submissionsCount
                                  ? TEACHER_COLORS.success
                                  : TEACHER_COLORS.primary,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <View>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="calendar-outline"
                  size={24}
                  color={TEACHER_COLORS.primary}
                />
                <Text style={styles.sectionTitle}>Attendance Overview</Text>
              </View>

              <View style={styles.attendanceStats}>
                <View
                  style={[
                    styles.statCard,
                    { borderLeftColor: TEACHER_COLORS.success },
                  ]}
                >
                  <Text style={styles.statValue}>
                    {attendanceStats.averageAttendance}%
                  </Text>
                  <Text style={styles.statLabel}>Average</Text>
                </View>
                <View
                  style={[
                    styles.statCard,
                    { borderLeftColor: TEACHER_COLORS.primary },
                  ]}
                >
                  <Text style={styles.statValue}>
                    {attendanceStats.totalClasses}
                  </Text>
                  <Text style={styles.statLabel}>Total Classes</Text>
                </View>
                <View
                  style={[
                    styles.statCard,
                    { borderLeftColor: TEACHER_COLORS.success },
                  ]}
                >
                  <Text style={styles.statValue}>
                    {attendanceStats.presentToday}
                  </Text>
                  <Text style={styles.statLabel}>Present Today</Text>
                </View>
                <View
                  style={[
                    styles.statCard,
                    { borderLeftColor: TEACHER_COLORS.error },
                  ]}
                >
                  <Text style={styles.statValue}>
                    {attendanceStats.absentToday}
                  </Text>
                  <Text style={styles.statLabel}>Absent Today</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.attendanceButton,
                  { backgroundColor: TEACHER_COLORS.primary },
                ]}
                onPress={navigateToAttendance}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="calendar"
                  size={20}
                  color={TEACHER_COLORS.textWhite}
                />
                <Text style={styles.attendanceButtonText}>Take Attendance</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* ✅ Professional Add Student Modal */}
      <Modal
        visible={showAddStudentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddStudentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Student</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowAddStudentModal(false)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={TEACHER_COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newStudentData.fullName}
                  onChangeText={(value) =>
                    setNewStudentData((prev) => ({ ...prev, fullName: value }))
                  }
                  placeholder="Enter full name"
                  placeholderTextColor={TEACHER_COLORS.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newStudentData.email}
                  onChangeText={(value) =>
                    setNewStudentData((prev) => ({ ...prev, email: value }))
                  }
                  placeholder="student@school.edu"
                  placeholderTextColor={TEACHER_COLORS.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Roll Number *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newStudentData.rollNumber}
                  onChangeText={(value) =>
                    setNewStudentData((prev) => ({
                      ...prev,
                      rollNumber: value,
                    }))
                  }
                  placeholder="e.g., 001"
                  placeholderTextColor={TEACHER_COLORS.textMuted}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.addStudentButton,
                  { backgroundColor: TEACHER_COLORS.primary },
                ]}
                onPress={addStudent}
                activeOpacity={0.8}
              >
                <Text style={styles.addStudentButtonText}>Add Student</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ✅ Enhanced Styles with New Tab Bar Components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TEACHER_COLORS.background,
  },

  // ✅ Enhanced Tab Bar Styles
  tabBarContainer: {
    position: 'relative',
    backgroundColor: TEACHER_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.teacherPalette?.neutral?.lighter || '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.teacherPalette?.shadow?.light || '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  tabScrollView: {
    flex: 1,
  },
  tabItemContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabScrollContent: {
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    borderRadius: 2,
    zIndex: 1,
  },
  enhancedTab: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabItemContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: SPACING.xs,
  },
  enhancedActiveTab: {
    borderBottomWidth: 3,
    borderBottomColor: TEACHER_COLORS.primary,
  },
  tabBarGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TEACHER_COLORS.surface,
  },
  tabIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs / 2,
  },
  enhancedTabText: {
    ...TEACHER_THEME.typography.caption,
    fontSize: 12,
    textAlign: 'center',
  },
  enhancedTabBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  enhancedTabBadgeText: {
    fontSize: 10,
    color: TEACHER_COLORS.textWhite,
    fontWeight: '700',
  },
  tabBarBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.teacherPalette?.neutral?.lighter || '#E5E7EB',
  },
  quickActionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    gap: SPACING.xs,
    minWidth: 60,
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.teacherPalette?.shadow?.medium || '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  quickActionText: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textWhite,
    fontWeight: '600',
    fontSize: 12, // Increased font size
    textAlign: 'center', // Center text
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
  errorText: {
    ...TEACHER_THEME.typography.h4,
    color: TEACHER_COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
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
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
        shadowColor: COLORS.teacherPalette?.shadow?.light || '#000000',
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs / 2,
  },
  createButtonText: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textWhite,
    fontWeight: '600',
  },
  classCard: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.teacherPalette?.neutral?.lighter || '#E5E7EB',
  },
  classCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
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
  classTitle: {
    ...TEACHER_THEME.typography.h3,
    color: TEACHER_COLORS.textWhite,
    fontWeight: '700',
  },
  classSubtitle: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textWhite,
    opacity: 0.9,
    marginTop: SPACING.xs / 2,
  },
  classCardContent: {
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: TEACHER_COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderLeftWidth: 4,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.teacherPalette?.shadow?.light || '#000000',
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
        shadowColor: COLORS.teacherPalette?.shadow?.medium || '#000000',
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
  quickActionContainer: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TEACHER_COLORS.accent,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.sm,
  },
  emptyStateText: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.textMuted,
    textAlign: 'center',
  },
  emptyStateButton: {
    backgroundColor: TEACHER_COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.sm,
  },
  emptyStateButtonText: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.textWhite,
    fontWeight: '600',
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.teacherPalette?.neutral?.lighter || '#E5E7EB',
  },
  studentInfo: {
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
    marginRight: SPACING.sm,
    gap: SPACING.md,
  },
  studentStat: {
    alignItems: 'center',
  },
  studentStatValue: {
    ...TEACHER_THEME.typography.body,
    fontWeight: '700',
  },
  studentStatLabel: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
  },
  assignmentCard: {
    backgroundColor: TEACHER_COLORS.accent,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.teacherPalette?.neutral?.lighter || '#E5E7EB',
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs / 2,
  },
  assignmentTitle: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
    fontWeight: '600',
    flex: 1,
  },
  assignmentDue: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
  },
  assignmentPoints: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
    fontWeight: '700',
  },
  assignmentProgress: {
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
    backgroundColor: COLORS.teacherPalette?.neutral?.lighter || '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  attendanceStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  attendanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  attendanceButtonText: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.textWhite,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor:
      COLORS.teacherPalette?.overlay?.dark || 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: TEACHER_COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    width: '100%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.teacherPalette?.shadow?.heavy || '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.teacherPalette?.neutral?.lighter || '#E5E7EB',
  },
  modalTitle: {
    ...TEACHER_THEME.typography.h3,
    color: TEACHER_COLORS.text,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: SPACING.xs,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
    fontWeight: '500',
    marginBottom: SPACING.sm,
  },
  textInput: {
    ...TEACHER_THEME.typography.body,
    backgroundColor: TEACHER_COLORS.accent,
    borderWidth: 1,
    borderColor: COLORS.teacherPalette?.neutral?.lighter || '#E5E7EB',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    color: TEACHER_COLORS.text,
  },
  addStudentButton: {
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  addStudentButtonText: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.textWhite,
    fontWeight: '600',
  },
  bottomPadding: {
    height: SPACING.xl,
  },
});

export default ClassDetails;
