import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const TeacherDashboard = ({ navigation }) => {
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
        totalClasses: 5,
        totalStudents: 147,
        pendingAssignments: 12,
        todaysClasses: [
          {
            id: 1,
            className: 'Mathematics 10A',
            time: '09:00 AM',
            room: 'Room 201',
          },
          {
            id: 2,
            className: 'Mathematics 10B',
            time: '11:00 AM',
            room: 'Room 201',
          },
          {
            id: 3,
            className: 'Advanced Math',
            time: '02:00 PM',
            room: 'Room 203',
          },
        ],
        recentActivities: [
          { id: 1, activity: 'Graded Quiz 5 - Math 10A', time: '2 hours ago' },
          {
            id: 2,
            activity: 'Posted Assignment - Math 10B',
            time: '1 day ago',
          },
          {
            id: 3,
            activity: 'Updated Attendance - Advanced Math',
            time: '2 days ago',
          },
        ],
        pendingTasks: [
          { id: 1, task: 'Grade Math Quiz - 10A', priority: 'high' },
          { id: 2, task: 'Prepare Assignment - 10B', priority: 'medium' },
          { id: 3, task: 'Update Progress Reports', priority: 'low' },
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
                {user?.name?.charAt(0)?.toUpperCase() || 'T'}
              </Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.welcomeText}>
                Welcome, {user?.name || 'Teacher'}!
              </Text>
              <Text style={styles.subtitleText}>
                Ready to inspire young minds today?
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
              {dashboardData?.totalClasses || 0}
            </Text>
            <Text style={styles.statLabel}>Classes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {dashboardData?.totalStudents || 0}
            </Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {dashboardData?.pendingAssignments || 0}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Today's Classes */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 Today's Classes</Text>
          {dashboardData?.todaysClasses?.map((classItem) => (
            <View key={classItem.id} style={styles.listItem}>
              <Text style={styles.listTitle}>{classItem.className}</Text>
              <Text style={styles.listDescription}>
                {classItem.time} • {classItem.room}
              </Text>
            </View>
          ))}
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation?.navigate('Classes')}
          >
            <Text style={styles.viewAllButtonText}>View All Classes</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={[styles.card, styles.lastCard]}>
          <Text style={styles.cardTitle}>⚡ Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation?.navigate('Attendance')}
            >
              <Text style={styles.actionButtonText}>Mark Attendance</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation?.navigate('Assignments')}
            >
              <Text style={styles.actionButtonText}>Create Assignment</Text>
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
    backgroundColor: '#E74C3C',
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
    borderColor: '#E74C3C',
  },
  logoutButtonText: {
    color: '#E74C3C',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
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
    color: '#E74C3C',
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#E74C3C',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  viewAllButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E74C3C',
    alignItems: 'center',
  },
  viewAllButtonText: {
    color: '#E74C3C',
    fontWeight: '500',
  },
});

export default TeacherDashboard;
