import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data for now
      const mockData = {
        totalSubjects: 6,
        pendingAssignments: 8,
        attendanceRate: 92,
        currentGPA: 3.8,
        upcomingClasses: [
          {
            id: 1,
            subject: 'Mathematics',
            time: '09:00 AM',
            room: 'Room 101',
            teacher: 'Mr. Johnson',
          },
          {
            id: 2,
            subject: 'Physics',
            time: '11:00 AM',
            room: 'Lab 203',
            teacher: 'Dr. Smith',
          },
          {
            id: 3,
            subject: 'English Literature',
            time: '02:00 PM',
            room: 'Room 305',
            teacher: 'Ms. Davis',
          },
        ],
        recentGrades: [
          { id: 1, subject: 'Mathematics', grade: 'A', assignment: 'Quiz 5', date: '2 days ago' },
          { id: 2, subject: 'Physics', grade: 'B+', assignment: 'Lab Report', date: '3 days ago' },
          { id: 3, subject: 'Chemistry', grade: 'A-', assignment: 'Midterm', date: '1 week ago' },
        ],
        upcomingAssignments: [
          { id: 1, title: 'Math Problem Set 6', subject: 'Mathematics', dueDate: 'Tomorrow', priority: 'high' },
          { id: 2, title: 'English Essay', subject: 'English', dueDate: 'Friday', priority: 'medium' },
          { id: 3, title: 'Science Project', subject: 'Physics', dueDate: 'Next Week', priority: 'low' },
        ],
        announcements: [
          { id: 1, title: 'Exam Schedule Released', content: 'Mid-term exam schedule is now available', time: '1 hour ago' },
          { id: 2, title: 'Library Hours Extended', content: 'Library will be open until 10 PM during exam week', time: '3 hours ago' },
        ],
      };

      setDashboardData(mockData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' },
    ]);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#E74C3C';
      case 'medium': return '#F39C12';
      case 'low': return '#27AE60';
      default: return '#3498DB';
    }
  };

  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return '#27AE60';
    if (grade.startsWith('B')) return '#3498DB';
    if (grade.startsWith('C')) return '#F39C12';
    return '#E74C3C';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.headerCard}>
          <View style={styles.headerContent}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || 'S'}
              </Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.welcomeText}>
                Hi, {user?.name?.split(' ')[0] || 'Student'}! 👋
              </Text>
              <Text style={styles.subtitleText}>
                Ready to learn something amazing today?
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {dashboardData?.totalSubjects || 0}
            </Text>
            <Text style={styles.statLabel}>Subjects</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {dashboardData?.pendingAssignments || 0}
            </Text>
            <Text style={styles.statLabel}>Assignments</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {dashboardData?.attendanceRate || 0}%
            </Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {dashboardData?.currentGPA || 0}
            </Text>
            <Text style={styles.statLabel}>GPA</Text>
          </View>
        </View>

        {/* Today's Classes */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 Today's Schedule</Text>
          {dashboardData?.upcomingClasses?.map((classItem) => (
            <View key={classItem.id} style={styles.listItem}>
              <View style={styles.classTimeContainer}>
                <Text style={styles.classTime}>{classItem.time}</Text>
              </View>
              <View style={styles.classInfo}>
                <Text style={styles.listTitle}>{classItem.subject}</Text>
                <Text style={styles.listDescription}>
                  {classItem.teacher} • {classItem.room}
                </Text>
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation?.navigate('Schedule')}
          >
            <Text style={styles.viewAllButtonText}>View Full Schedule</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Assignments */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📝 Upcoming Assignments</Text>
          {dashboardData?.upcomingAssignments?.map((assignment) => (
            <View key={assignment.id} style={styles.assignmentItem}>
              <View style={styles.assignmentInfo}>
                <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                <Text style={styles.assignmentSubject}>{assignment.subject}</Text>
                <Text style={styles.assignmentDue}>Due: {assignment.dueDate}</Text>
              </View>
              <View
                style={[
                  styles.priorityIndicator,
                  { backgroundColor: getPriorityColor(assignment.priority) }
                ]}
              >
                <Text style={styles.priorityText}>
                  {assignment.priority.toUpperCase()}
                </Text>
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation?.navigate('Assignments')}
          >
            <Text style={styles.viewAllButtonText}>View All Assignments</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Grades */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎯 Recent Grades</Text>
          {dashboardData?.recentGrades?.map((grade) => (
            <View key={grade.id} style={styles.gradeItem}>
              <View style={styles.gradeInfo}>
                <Text style={styles.gradeSubject}>{grade.subject}</Text>
                <Text style={styles.gradeAssignment}>{grade.assignment}</Text>
                <Text style={styles.gradeDate}>{grade.date}</Text>
              </View>
              <View
                style={[
                  styles.gradeTag,
                  { backgroundColor: getGradeColor(grade.grade) }
                ]}
              >
                <Text style={styles.gradeText}>{grade.grade}</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation?.navigate('Grades')}
          >
            <Text style={styles.viewAllButtonText}>View All Grades</Text>
          </TouchableOpacity>
        </View>

        {/* Announcements */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📢 Announcements</Text>
          {dashboardData?.announcements?.map((announcement) => (
            <View key={announcement.id} style={styles.announcementItem}>
              <Text style={styles.announcementTitle}>{announcement.title}</Text>
              <Text style={styles.announcementContent}>{announcement.content}</Text>
              <Text style={styles.announcementTime}>{announcement.time}</Text>
            </View>
          ))}
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation?.navigate('Announcements')}
          >
            <Text style={styles.viewAllButtonText}>View All Announcements</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={[styles.card, styles.lastCard]}>
          <Text style={styles.cardTitle}>⚡ Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation?.navigate('Assignments')}
            >
              <Text style={styles.actionButtonText}>📝 Submit Assignment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation?.navigate('Grades')}
            >
              <Text style={styles.actionButtonText}>📊 Check Grades</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation?.navigate('Schedule')}
            >
              <Text style={styles.actionButtonText}>📅 View Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation?.navigate('Library')}
            >
              <Text style={styles.actionButtonText}>📚 Library Resources</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerText: {
    flex: 1,
    marginLeft: 16,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  subtitleText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3498DB',
  },
  logoutButtonText: {
    color: '#3498DB',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498DB',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lastCard: {
    marginBottom: 32,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
  },
  classTimeContainer: {
    width: 80,
    alignItems: 'center',
  },
  classTime: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3498DB',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  classInfo: {
    flex: 1,
    marginLeft: 12,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  listDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  assignmentItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  assignmentSubject: {
    fontSize: 14,
    color: '#3498DB',
    marginTop: 2,
  },
  assignmentDue: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  priorityIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  gradeItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gradeInfo: {
    flex: 1,
  },
  gradeSubject: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  gradeAssignment: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  gradeDate: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  gradeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 12,
  },
  gradeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  announcementItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  announcementContent: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
    lineHeight: 20,
  },
  announcementTime: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#3498DB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
  viewAllButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3498DB',
    alignItems: 'center',
  },
  viewAllButtonText: {
    color: '#3498DB',
    fontWeight: '500',
  },
});

export default StudentDashboard;
