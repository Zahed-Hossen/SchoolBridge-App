import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';

const HEADER_COLOR = '#3498DB';
// Placeholder data and images
const teacherProfilePic = 'https://randomuser.me/api/portraits/men/32.jpg';
const classmates = [];

const initialLayout = { width: Dimensions.get('window').width };

// --- Tab Scenes (placeholders, connect to real screens as needed) ---
const LessonsMaterials = () => (
  <View style={styles.tabContent}>
    <Text>Lessons & Materials (PDFs, Videos, etc.)</Text>
  </View>
);
const Assignments = () => (
  <View style={styles.tabContent}>
    <Text>Assignments for this class</Text>
  </View>
);
const Grades = () => (
  <View style={styles.tabContent}>
    <Text>Grades & Performance Chart</Text>
  </View>
);
const Attendance = () => (
  <View style={styles.tabContent}>
    <Text>Attendance Calendar</Text>
  </View>
);
const Announcements = () => (
  <View style={styles.tabContent}>
    <Text>Class Announcements</Text>
  </View>
);
const NewsUpdates = () => (
  <View style={styles.tabContent}>
    <Text>News & Updates</Text>
  </View>
);
const LibraryResources = () => (
  <View style={styles.tabContent}>
    <Text>Library & Resources</Text>
  </View>
);

export default function StudentClassDetails({ navigation, route }) {
  // Get class data from navigation params (sync with dashboard)
  const classData = route?.params?.classData || {
    id: 'MATH10A',
    name: 'Mathematics – Grade 10',
    subject: 'Mathematics',
    grade: '10',
    section: 'A',
    teacher: 'Mr. John Doe',
    schedule: 'Mon, Wed, Fri - 10:00 AM',
    room: 'Room 204',
    nextClass: 'Wed, Aug 20, 10:00 AM',
    averageGrade: 87.5,
    attendanceRate: 92.8,
    description:
      'This course covers algebra, geometry, and basic trigonometry. Syllabus includes equations, graphs, and problem-solving skills.',
    students: [],
  };

  // Tab state
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'materials', title: 'Materials' },
    { key: 'assignments', title: 'Assignments' },
    { key: 'grades', title: 'Grades' },
    { key: 'attendance', title: 'Attendance' },
    { key: 'announcements', title: 'Announcements' },
    { key: 'news', title: 'News' },
    { key: 'library', title: 'Library' },
  ]);

  const renderScene = SceneMap({
    materials: LessonsMaterials,
    assignments: Assignments,
    grades: Grades,
    attendance: Attendance,
    announcements: Announcements,
    news: NewsUpdates,
    library: LibraryResources,
  });

  // --- UI ---
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Section */}
      <View style={[styles.header, { backgroundColor: HEADER_COLOR }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={styles.classTitle}>{classData.name}</Text>
            <Text style={styles.classCode}>
              Class Code: {classData.id || classData.code}
            </Text>
          </View>
        </View>
        <View style={styles.teacherInfo}>
          <Ionicons
            name="person-circle"
            size={28}
            color="#fff"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.teacherName}>{classData.teacher}</Text>
        </View>
      </View>
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionBtn}>
          <Ionicons name="videocam" size={20} color="#fff" />
          <Text style={styles.quickActionText}>Join Live</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionBtn}>
          <Ionicons name="folder" size={20} color="#fff" />
          <Text style={styles.quickActionText}>Materials</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionBtn}>
          <Ionicons name="notifications" size={20} color="#fff" />
          <Text style={styles.quickActionText}>Settings</Text>
        </TouchableOpacity>
      </View>
      {/* Class Overview */}
      <View style={styles.overviewCard}>
        <Text style={styles.classDescription}>{classData.description}</Text>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Avg. Grade</Text>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${classData.averageGrade || 0}%`,
                  backgroundColor: '#F39C12',
                },
              ]}
            />
          </View>
          <Text style={styles.progressPercent}>
            {classData.averageGrade || '--'}%
          </Text>
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Attendance</Text>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${classData.attendanceRate || 0}%`,
                  backgroundColor: '#27AE60',
                },
              ]}
            />
          </View>
          <Text style={styles.progressPercent}>
            {classData.attendanceRate || '--'}%
          </Text>
        </View>
        {/* Enrolled Students Section */}
        <View style={styles.studentsSection}>
          <Text style={styles.studentsSectionTitle}>Enrolled Students</Text>
          <View style={styles.studentsList}>
            {/* Placeholder: Replace with real student list */}
            <Text style={styles.studentsCount}>
              {classData.students?.length || 0} students enrolled
            </Text>
            {/* You can map avatars or names here if available */}
          </View>
        </View>
      </View>
      {/* Tabbed Sections */}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            scrollEnabled
            indicatorStyle={{ backgroundColor: COLORS.primary }}
            style={styles.tabBar}
            labelStyle={styles.tabLabel}
            activeColor={COLORS.primary}
            inactiveColor={COLORS.text.secondary}
          />
        )}
        style={styles.tabView}
      />
      {/* Footer Actions */}
      <View style={styles.footerActions}>
        <TouchableOpacity
          style={styles.footerBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={18} color={COLORS.primary} />
          <Text style={styles.footerBtnText}>Back to All Classes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerBtn}>
          <Ionicons name="alert-circle" size={18} color={COLORS.error} />
          <Text style={[styles.footerBtnText, { color: COLORS.error }]}>
            Report an Issue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: HEADER_COLOR,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    // borderBottomLeftRadius: 18,
    // borderBottomRightRadius: 18,
  },
  studentsSection: {
    marginTop: 14,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  studentsSectionTitle: {
    fontSize: FONTS.sizes.body2,
    fontWeight: '700',
    color: HEADER_COLOR,
    marginBottom: 4,
  },
  studentsList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 12,
    backgroundColor: '#2563EB44',
    borderRadius: 16,
    padding: 6,
  },
  classTitle: {
    color: '#fff',
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
  },
  classCode: {
    color: '#fff',
    fontSize: FONTS.sizes.body3,
    opacity: 0.85,
  },
  teacherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff2',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  teacherAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#fff',
  },
  teacherName: {
    color: '#fff',
    fontWeight: '600',
    fontSize: FONTS.sizes.body3,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    marginHorizontal: SPACING.lg,
    marginTop: -18,
    borderRadius: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 2,
  },
  quickActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  quickActionText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    marginTop: 2,
    fontWeight: '600',
  },
  overviewCard: {
    backgroundColor: '#fff',
    margin: SPACING.lg,
    marginTop: 12,
    borderRadius: 14,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  classDescription: {
    color: COLORS.text.primary,
    fontSize: FONTS.sizes.body2,
    marginBottom: 10,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    color: COLORS.text.secondary,
    fontSize: FONTS.sizes.sm,
    marginRight: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressPercent: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: FONTS.sizes.sm,
  },
  studentsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  studentsCount: {
    color: COLORS.text.primary,
    fontSize: FONTS.sizes.body3,
    marginRight: 8,
    fontWeight: '500',
  },
  avatarsScroll: {
    marginLeft: 8,
  },
  studentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: -8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  moreAvatars: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  moreAvatarsText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  tabView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  tabBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 0,
  },
  tabLabel: {
    fontWeight: '600',
    fontSize: FONTS.sizes.sm,
    textTransform: 'capitalize',
  },
  tabContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerBtnText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: FONTS.sizes.body3,
    marginLeft: 4,
  },
});
