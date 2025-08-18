import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';
import { useTenant } from '../../context/TenantContext';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import StudentClassDetails from './StudentClassDetails';
import JoinClassModal from '../../components/modals/JoinClassModal';

const HEADER_COLOR = '#3498DB';

const StudentMyClasses = ({ navigation }) => {
  // Handler for joining a class
  const handleJoinClass = () => {
    if (!joinCode.trim()) {
      setJoinError('Please enter a class code.');
      return;
    }
    // Simulate join (replace with real API call)
    setJoinError('');
    setShowJoinModal(false);
    setJoinCode('');
    // Optionally show a toast or add to classes
  };
  const { user } = useAuth();
  const { roleTheme } = useRole();
  const { tenantBranding } = useTenant();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');

  // Mock: Fetch classes for the student (replace with API call)
  const loadClasses = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      // Mock data: In real app, fetch from API using user.id
      const mockClasses = [
        {
          id: 1,
          name: 'Calculus AP',
          subject: 'Mathematics',
          grade: '12',
          section: 'A',
          teacher: 'Mr. Johnson',
          schedule: 'Mon, Wed, Fri - 9:00 AM',
          room: 'Room 204',
          nextClass: 'Today, 9:00 AM',
          averageGrade: 87.5,
          attendanceRate: 92.8,
        },
        {
          id: 2,
          name: 'English Literature',
          subject: 'English',
          grade: '12',
          section: 'B',
          teacher: 'Ms. Smith',
          schedule: 'Tue, Thu - 11:00 AM',
          room: 'Room 210',
          nextClass: 'Tomorrow, 11:00 AM',
          averageGrade: 91.2,
          attendanceRate: 95.4,
        },
      ];
      setClasses(mockClasses);
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadClasses();
    }, []),
  );

  const onRefresh = useCallback(() => {
    loadClasses(true);
  }, []);

  // --- UI ---
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, { backgroundColor: HEADER_COLOR }]}>
        <Ionicons
          name="school"
          size={32}
          color="#fff"
          style={{ marginRight: 12 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>My Classes</Text>
          <Text style={styles.headerSubtitle}>
            All your enrolled classes in one place
          </Text>
        </View>
        <TouchableOpacity
          style={styles.headerAction}
          activeOpacity={0.7}
          onPress={() => setShowJoinModal(true)}
        >
          <Ionicons name="add-circle" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Join Class Modal */}
      <JoinClassModal
        visible={showJoinModal}
        onClose={() => {
          setShowJoinModal(false);
          setJoinError('');
          setJoinCode('');
        }}
        onJoin={handleJoinClass}
        joinCode={joinCode}
        setJoinCode={setJoinCode}
        joinError={joinError}
      />

      {/* Dashboard Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Ionicons name="school-outline" size={22} color={HEADER_COLOR} />
          <Text style={styles.summaryValue}>{classes.length}</Text>
          <Text style={styles.summaryLabel}>Classes</Text>
        </View>
        <View style={styles.summaryItem}>
          <Ionicons name="star" size={22} color="#F39C12" />
          <Text style={styles.summaryValue}>
            {classes.length
              ? Math.round(
                  classes.reduce((a, c) => a + (c.averageGrade || 0), 0) /
                    classes.length,
                )
              : '--'}
          </Text>
          <Text style={styles.summaryLabel}>Avg. Grade</Text>
        </View>
        <View style={styles.summaryItem}>
          <Ionicons name="checkmark-circle" size={22} color="#27AE60" />
          <Text style={styles.summaryValue}>
            {classes.length
              ? Math.round(
                  classes.reduce((a, c) => a + (c.attendanceRate || 0), 0) /
                    classes.length,
                )
              : '--'}
            %
          </Text>
          <Text style={styles.summaryLabel}>Attendance</Text>
        </View>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={HEADER_COLOR} />
          <Text style={styles.loadingText}>Loading classes...</Text>
        </View>
      ) : classes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="school-outline"
            size={64}
            color={HEADER_COLOR}
            style={{ marginBottom: 12 }}
          />
          <Text style={styles.emptyStateTitle}>No Classes Found</Text>
          <Text style={styles.emptyStateText}>
            You are not enrolled in any classes yet.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={HEADER_COLOR}
            />
          }
        >
          {classes.map((classItem) => (
            <TouchableOpacity
              key={classItem.id}
              style={styles.classCard}
              activeOpacity={0.88}
              onPress={() =>
                navigation.navigate('StudentClassDetails', {
                  classData: classItem,
                })
              }
            >
              <View style={styles.classCardTop}>
                <View style={styles.classIconWrap}>
                  <Ionicons name="book" size={28} color={HEADER_COLOR} />
                </View>
                <View style={styles.classCardInfo}>
                  <Text style={styles.className}>{classItem.name}</Text>
                  <Text style={styles.classMeta}>
                    {classItem.subject} • Grade {classItem.grade} • Section{' '}
                    {classItem.section}
                  </Text>
                  <View style={styles.teacherRow}>
                    <Ionicons
                      name="person-circle"
                      size={18}
                      color="#888"
                      style={{ marginRight: 2 }}
                    />
                    <Text style={styles.teacherName}>{classItem.teacher}</Text>
                  </View>
                </View>
                <View style={styles.nextClassWrap}>
                  <Ionicons name="calendar" size={18} color={HEADER_COLOR} />
                  <Text style={styles.nextClassText}>
                    {classItem.nextClass}
                  </Text>
                </View>
              </View>
              <View style={styles.classCardBottom}>
                <View style={styles.statItem}>
                  <Ionicons name="star" size={16} color="#F39C12" />
                  <Text style={styles.statValue}>
                    {classItem.averageGrade || '--'}%
                  </Text>
                  <Text style={styles.statLabel}>Grade</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
                  <Text style={styles.statValue}>
                    {classItem.attendanceRate || '--'}%
                  </Text>
                  <Text style={styles.statLabel}>Attendance</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="location" size={16} color={HEADER_COLOR} />
                  <Text style={styles.statValue}>{classItem.room}</Text>
                  <Text style={styles.statLabel}>Room</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    marginBottom: 8,
  },
  headerAction: {
    marginLeft: 8,
    backgroundColor: '#ffffff33',
    borderRadius: 16,
    padding: 4,
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: SPACING.lg,
    marginBottom: 10,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: HEADER_COLOR,
    marginTop: 2,
  },
  summaryLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  classCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  classIconWrap: {
    backgroundColor: '#eaf1fb',
    borderRadius: 16,
    padding: 8,
    marginRight: 10,
  },
  classCardInfo: {
    flex: 1,
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  teacherName: {
    fontSize: FONTS.sizes.body3,
    color: '#555',
    fontWeight: '500',
  },
  nextClassWrap: {
    alignItems: 'center',
    marginLeft: 8,
  },
  nextClassText: {
    fontSize: FONTS.sizes.sm,
    color: HEADER_COLOR,
    fontWeight: '600',
    marginTop: 2,
  },
  classCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 6,
  },
  headerTitle: {
    fontSize: FONTS.sizes.h2,
    color: '#fff',
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.md,
    color: '#fff',
    opacity: 0.9,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
    marginTop: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  emptyStateTitle: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.text.primary,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: FONTS.sizes.body3,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  classCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  classHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  classIcon: {
    marginRight: 12,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  classMeta: {
    fontSize: FONTS.sizes.body3,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  classStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: HEADER_COLOR,
    marginTop: 2,
  },
  statLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: HEADER_COLOR,
    marginBottom: 10,
  },
  modalLabel: {
    fontSize: FONTS.sizes.body3,
    color: COLORS.text.secondary,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f6fa',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 8,
    width: '100%',
  },
  modalInput: {
    flex: 1,
    fontSize: FONTS.sizes.body2,
    color: COLORS.text.primary,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  modalError: {
    color: COLORS.error,
    fontSize: FONTS.sizes.sm,
    marginBottom: 6,
    marginTop: 2,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
    gap: 10,
  },
  modalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEADER_COLOR,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 18,
    gap: 6,
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FONTS.sizes.body3,
  },
});

export default StudentMyClasses;
