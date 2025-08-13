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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import SimpleHeader from '../../components/navigation/SimpleHeader';
// ✅ Import Professional Theme System
import {
  COLORS,
  TEACHER_COLORS,
  TEACHER_THEME,
  SPACING,
  BORDER_RADIUS
} from '../../constants/theme';

const AttendanceTracker = ({ navigation, route }) => {
  // ✅ Professional State Management
  const { classId: routeClassId, className: routeClassName } = route?.params || {};

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [showClassSelector, setShowClassSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ Animation References
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // ✅ Attendance Status Configuration
  const attendanceStatuses = [
    {
      key: 'present',
      label: 'Present',
      icon: 'checkmark-circle',
      color: TEACHER_COLORS.success,
    },
    {
      key: 'absent',
      label: 'Absent',
      icon: 'close-circle',
      color: TEACHER_COLORS.error,
    },
    {
      key: 'late',
      label: 'Late',
      icon: 'time',
      color: TEACHER_COLORS.warning,
    },
  ];

  // ✅ Professional Data Loading
  const loadAttendanceData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      // 🔄 All API calls commented out
      /*
      const [classesResponse, attendanceResponse] = await Promise.all([
        fetch('/api/teacher/classes', {
          headers: { 'Authorization': `Bearer ${userToken}` }
        }),
        selectedClass ? fetch(`/api/teacher/attendance/${selectedClass.id}/${selectedDate}`, {
          headers: { 'Authorization': `Bearer ${userToken}` }
        }) : Promise.resolve(null)
      ]);

      const classesData = await classesResponse.json();
      setClasses(classesData);

      if (attendanceResponse) {
        const attendanceResult = await attendanceResponse.json();
        setStudents(attendanceResult.students);
        setAttendanceData(attendanceResult.attendance);
      }
      */

      // ✅ Simplified Mock Data (for development)
      setTimeout(() => {
        const mockClasses = [
          {
            id: 1,
            name: 'Mathematics 10A',
            subject: 'Mathematics',
            totalStudents: 5,
          },
          {
            id: 2,
            name: 'Physics 12B',
            subject: 'Science',
            totalStudents: 5,
          },
        ];

        setClasses(mockClasses);

        // Auto-select first class
        const targetClass = mockClasses[0];
        setSelectedClass(targetClass);

        // Load mock students
        const mockStudents = [
          { id: 1, name: 'Emma Thompson', rollNumber: '001' },
          { id: 2, name: 'James Wilson', rollNumber: '002' },
          { id: 3, name: 'Sofia Rodriguez', rollNumber: '003' },
        ];

        setStudents(mockStudents);

        // Initialize attendance data
        const initialAttendance = {};
        mockStudents.forEach(student => {
          initialAttendance[student.id] = 'present';
        });
        setAttendanceData(initialAttendance);

        setLoading(false);
        setRefreshing(false);
      }, 500); // Reduced timeout

    } catch (error) {
      console.error('❌ Error loading attendance data:', error);
      Alert.alert('Error', 'Failed to load attendance data');
      setLoading(false);
      setRefreshing(false);
    }
  }, [routeClassId]);

  // ✅ Professional Attendance Actions
  const updateAttendance = useCallback((studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status,
    }));
  }, []);

  const markAllStatus = useCallback((status) => {
    const allStatus = {};
    students.forEach(student => {
      allStatus[student.id] = status;
    });
    setAttendanceData(allStatus);

    // ✅ Visual feedback animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 50,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }, 1500);
    });
  }, [students, fadeAnim, slideAnim]);

  const saveAttendance = useCallback(async () => {
    if (!selectedClass) {
      Alert.alert('Error', 'Please select a class first');
      return;
    }

    try {
      setSaving(true);

      // 🔄 TODO: Replace with actual API call
      /*
      const attendanceRecords = students.map(student => ({
        studentId: student.id,
        status: attendanceData[student.id] || 'present',
        date: selectedDate,
        classId: selectedClass.id,
      }));

      const response = await fetch('/api/teacher/attendance', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId: selectedClass.id,
          date: selectedDate,
          attendance: attendanceRecords,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save attendance');
      }
      */

      // ✅ Mock save simulation
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert('Success!', 'Attendance saved successfully');

    } catch (error) {
      console.error('❌ Error saving attendance:', error);
      Alert.alert('Error', 'Failed to save attendance. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [selectedClass, selectedDate, students, attendanceData]);

  // ✅ Professional Utility Functions
  const getAttendanceStats = useCallback(() => {
    const totalStudents = students.length;
    const statusCounts = attendanceStatuses.reduce((acc, status) => {
      acc[status.key] = Object.values(attendanceData).filter(s => s === status.key).length;
      return acc;
    }, {});

    const presentCount = statusCounts.present || 0;
    const attendancePercentage = totalStudents > 0
      ? ((presentCount / totalStudents) * 100).toFixed(1)
      : 0;

    return {
      total: totalStudents,
      ...statusCounts,
      percentage: attendancePercentage,
    };
  }, [students, attendanceData, attendanceStatuses]);

  const getStatusConfig = useCallback((status) => {
    return attendanceStatuses.find(s => s.key === status) || attendanceStatuses[0];
  }, [attendanceStatuses]);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  // Replace the handleClassChange function:
  const handleClassChange = useCallback(async (newClass) => {
    setSelectedClass(newClass);
    setShowClassSelector(false);

    const mockStudents = [
      { id: 1, name: 'Emma Thompson', rollNumber: '001' },
      { id: 2, name: 'James Wilson', rollNumber: '002' },
      { id: 3, name: 'Sofia Rodriguez', rollNumber: '003' },
    ];

    setStudents(mockStudents);

    // Initialize attendance
    const initialAttendance = {};
    mockStudents.forEach(student => {
      initialAttendance[student.id] = 'present';
    });
    setAttendanceData(initialAttendance);
  }, []);

  const handleDateChange = useCallback((newDate) => {
    setSelectedDate(newDate);
    // 🔄 API call for new date commented out
    /*
    if (selectedClass) {
      loadAttendanceData();
    }
    */
  }, []);

  // ✅ Professional Filter Logic
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ✅ Professional Header Component
  const HeaderRightComponent = () => (
    <TouchableOpacity
      style={styles.headerButton}
      onPress={saveAttendance}
      disabled={saving}
      activeOpacity={0.8}
    >
      {saving ? (
        <ActivityIndicator size="small" color={TEACHER_COLORS.textWhite} />
      ) : (
        <Ionicons name="save" size={20} color={TEACHER_COLORS.textWhite} />
      )}
    </TouchableOpacity>
  );

  // ✅ Initialize Data
  useFocusEffect(
    useCallback(() => {
      loadAttendanceData();
    }, [loadAttendanceData])
  );

  const onRefresh = useCallback(() => {
    loadAttendanceData(true);
  }, [loadAttendanceData]);

  const stats = getAttendanceStats();

  // ✅ Professional Loading State
  if (loading) {
    return (
      <View style={styles.container}>
        <SimpleHeader
          title="Attendance Tracker"
          subtitle="Loading..."
          navigation={navigation}
          primaryColor={TEACHER_COLORS.primary}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={TEACHER_COLORS.primary} />
          <Text style={styles.loadingText}>Loading attendance data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ✅ Professional Header */}
      <SimpleHeader
        title="Attendance Tracker"
        subtitle={selectedClass ? `${selectedClass.name} • ${formatDate(selectedDate)}` : 'Select a class'}
        navigation={navigation}
        primaryColor={TEACHER_COLORS.primary}
        rightComponent={<HeaderRightComponent />}
      />

      {/* ✅ Professional Class & Date Selector */}
      <View style={styles.selectorContainer}>
        <TouchableOpacity
          style={styles.classSelector}
          onPress={() => setShowClassSelector(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="school" size={20} color={TEACHER_COLORS.primary} />
          <Text style={styles.classSelectorText}>
            {selectedClass ? selectedClass.name : 'Select Class'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={TEACHER_COLORS.textMuted} />
        </TouchableOpacity>

        <View style={styles.dateSelector}>
          <Ionicons name="calendar" size={20} color={TEACHER_COLORS.textMuted} />
          <TextInput
            style={styles.dateInput}
            value={selectedDate}
            onChangeText={handleDateChange}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={TEACHER_COLORS.textMuted}
          />
        </View>
      </View>

      {/* ✅ Professional Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { borderLeftColor: TEACHER_COLORS.success }]}>
          <Text style={styles.statValue}>{stats.present || 0}</Text>
          <Text style={styles.statLabel}>Present</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: TEACHER_COLORS.error }]}>
          <Text style={styles.statValue}>{stats.absent || 0}</Text>
          <Text style={styles.statLabel}>Absent</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: TEACHER_COLORS.warning }]}>
          <Text style={styles.statValue}>{stats.late || 0}</Text>
          <Text style={styles.statLabel}>Late</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: TEACHER_COLORS.primary }]}>
          <Text style={styles.statValue}>{stats.percentage}%</Text>
          <Text style={styles.statLabel}>Rate</Text>
        </View>
      </View>

      {/* ✅ Professional Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: TEACHER_COLORS.success }]}
          onPress={() => markAllStatus('present')}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-done" size={18} color={TEACHER_COLORS.textWhite} />
          <Text style={styles.actionButtonText}>All Present</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: TEACHER_COLORS.error }]}
          onPress={() => markAllStatus('absent')}
          activeOpacity={0.8}
        >
          <Ionicons name="close-circle" size={18} color={TEACHER_COLORS.textWhite} />
          <Text style={styles.actionButtonText}>All Absent</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: TEACHER_COLORS.primary }]}
          onPress={saveAttendance}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator size="small" color={TEACHER_COLORS.textWhite} />
          ) : (
            <Ionicons name="save" size={18} color={TEACHER_COLORS.textWhite} />
          )}
          <Text style={styles.actionButtonText}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ✅ Professional Search */}
      {students.length > 0 && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={20} color={TEACHER_COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search students..."
              placeholderTextColor={TEACHER_COLORS.textMuted}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={TEACHER_COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* ✅ Professional Students List */}
      <ScrollView
        style={styles.studentsList}
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
            <Ionicons
              name={searchQuery ? "search-outline" : "people-outline"}
              size={64}
              color={TEACHER_COLORS.textMuted}
            />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No students found' : 'No students enrolled'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Try adjusting your search terms'
                : selectedClass
                  ? 'No students are enrolled in this class yet'
                  : 'Please select a class to view students'
              }
            </Text>
          </View>
        ) : (
          filteredStudents.map((student) => {
            const studentStatus = attendanceData[student.id] || 'present';
            const statusConfig = getStatusConfig(studentStatus);

            return (
              <View key={student.id} style={styles.studentCard}>
                <View style={styles.studentInfo}>
                  <View style={styles.studentAvatar}>
                    <Text style={styles.studentInitials}>
                      {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.studentDetails}>
                    <Text style={styles.studentName}>{student.name}</Text>
                    <Text style={styles.studentMeta}>Roll: {student.rollNumber}</Text>
                  </View>
                </View>

                <View style={styles.attendanceActions}>
                  {attendanceStatuses.map((status) => (
                    <TouchableOpacity
                      key={status.key}
                      style={[
                        styles.statusButton,
                        studentStatus === status.key && [
                          styles.statusButtonActive,
                          { backgroundColor: status.color }
                        ]
                      ]}
                      onPress={() => updateAttendance(student.id, status.key)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={status.icon}
                        size={20}
                        color={
                          studentStatus === status.key
                            ? TEACHER_COLORS.textWhite
                            : status.color
                        }
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
          })
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* ✅ Professional Class Selector Modal */}
      <Modal
        visible={showClassSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowClassSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Class</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowClassSelector(false)}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={24} color={TEACHER_COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.classOptions}>
              {classes.map((classItem) => (
                <TouchableOpacity
                  key={classItem.id}
                  style={[
                    styles.classOption,
                    selectedClass?.id === classItem.id && styles.selectedClassOption
                  ]}
                  onPress={() => handleClassChange(classItem)}
                  activeOpacity={0.8}
                >
                  <View style={styles.classIcon}>
                    <Ionicons name="school" size={20} color={TEACHER_COLORS.primary} />
                  </View>
                  <View style={styles.classOptionInfo}>
                    <Text style={styles.classOptionName}>{classItem.name}</Text>
                    <Text style={styles.classOptionDetails}>
                      {classItem.subject} • Grade {classItem.grade}{classItem.section} • {classItem.totalStudents} students
                    </Text>
                  </View>
                  {selectedClass?.id === classItem.id && (
                    <Ionicons name="checkmark-circle" size={20} color={TEACHER_COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ✅ Professional Success Animation */}
      <Animated.View
        style={[
          styles.successAnimation,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
        pointerEvents="none"
      >
        <View style={styles.successContent}>
          <Ionicons name="checkmark-circle" size={24} color={TEACHER_COLORS.success} />
          <Text style={styles.successText}>Attendance Updated!</Text>
        </View>
      </Animated.View>
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
  selectorContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: TEACHER_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.teacherPalette.neutral.lighter,
    gap: SPACING.sm,
  },
  classSelector: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TEACHER_COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  classSelectorText: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
    flex: 1,
  },
  dateSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TEACHER_COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  dateInput: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
    flex: 1,
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
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: TEACHER_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.teacherPalette.neutral.lighter,
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
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textWhite,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: TEACHER_COLORS.surface,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TEACHER_COLORS.accent,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  searchInput: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
    flex: 1,
  },
  studentsList: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  studentCard: {
    backgroundColor: TEACHER_COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginVertical: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  studentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: TEACHER_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: SPACING.xs / 2,
  },
  studentMeta: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
  },
  attendanceActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: TEACHER_COLORS.accent,
    borderWidth: 1,
    borderColor: COLORS.teacherPalette.neutral.lighter,
  },
  statusButtonActive: {
    borderColor: 'transparent',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.teacherPalette.overlay.dark,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: TEACHER_COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '70%',
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
  classOptions: {
    maxHeight: 400,
  },
  classOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.teacherPalette.neutral.lighter,
    gap: SPACING.sm,
  },
  selectedClassOption: {
    backgroundColor: TEACHER_COLORS.accent,
  },
  classIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: TEACHER_COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  classOptionInfo: {
    flex: 1,
  },
  classOptionName: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs / 2,
  },
  classOptionDetails: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
  },
  successAnimation: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  successContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TEACHER_COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.teacherPalette.shadow.medium,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  successText: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.success,
    fontWeight: '600',
  },
  bottomPadding: {
    height: SPACING.xl,
  },
});

export default AttendanceTracker;
