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
import AppHeader from '../../components/navigation/AppHeader';
import { getRoleColors } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

const SchoolAdminScreen = () => {
  const { user, logout } = useAuth();
  const adminColors = getRoleColors('admin');
  const primaryColor = adminColors.primary;

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data for admin dashboard
      const mockData = {
        totalUsers: 1247,
        totalStudents: 850,
        totalTeachers: 65,
        totalParents: 432,
        activeClasses: 38,
        pendingApprovals: 12,
        systemHealth: 'Good',
        recentActivities: [
          {
            id: 1,
            activity: 'New teacher registration: John Smith',
            time: '1 hour ago',
            type: 'user',
          },
          {
            id: 2,
            activity: 'Class schedule updated for Grade 10A',
            time: '2 hours ago',
            type: 'schedule',
          },
          {
            id: 3,
            activity: 'Payment received from Sarah Johnson',
            time: '3 hours ago',
            type: 'payment',
          },
          {
            id: 4,
            activity: 'System backup completed successfully',
            time: '6 hours ago',
            type: 'system',
          },
        ],
        pendingRequests: [
          {
            id: 1,
            request: 'Teacher registration approval',
            user: 'Dr. Emily Davis',
            type: 'teacher',
          },
          {
            id: 2,
            request: 'Grade change request',
            user: 'Math Class 10B',
            type: 'grade',
          },
          {
            id: 3,
            request: 'Fee waiver application',
            user: 'Student ID: 2024001',
            type: 'fee',
          },
        ],
        systemStats: {
          serverUptime: '99.9%',
          avgResponseTime: '120ms',
          storageUsed: '68%',
          activeConnections: 234,
        },
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

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user':
        return '👤';
      case 'schedule':
        return '📅';
      case 'payment':
        return '💰';
      case 'system':
        return '⚙️';
      default:
        return '📋';
    }
  };

  const getRequestIcon = (type) => {
    switch (type) {
      case 'teacher':
        return '👨‍🏫';
      case 'grade':
        return '📊';
      case 'fee':
        return '💳';
      default:
        return '📝';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading admin dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="School Admin"
        subtitle="Manage your school"
        userRole="admin"
        themeColor={primaryColor}
      />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: 48 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        {/* Top spacing for visual balance */}
        <View style={{ height: 8 }} />

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {dashboardData?.totalUsers || 0}
            </Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {dashboardData?.totalStudents || 0}
            </Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {dashboardData?.totalTeachers || 0}
            </Text>
            <Text style={styles.statLabel}>Teachers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {dashboardData?.activeClasses || 0}
            </Text>
            <Text style={styles.statLabel}>Classes</Text>
          </View>
        </View>

        {/* System Health */}
        <View style={styles.healthCard}>
          <Text style={styles.cardTitle}>🏥 System Health</Text>
          <View style={styles.healthStats}>
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>Server Uptime</Text>
              <Text style={styles.healthValue}>
                {dashboardData?.systemStats?.serverUptime}
              </Text>
            </View>
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>Response Time</Text>
              <Text style={styles.healthValue}>
                {dashboardData?.systemStats?.avgResponseTime}
              </Text>
            </View>
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>Storage Used</Text>
              <Text style={styles.healthValue}>
                {dashboardData?.systemStats?.storageUsed}
              </Text>
            </View>
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>Active Users</Text>
              <Text style={styles.healthValue}>
                {dashboardData?.systemStats?.activeConnections}
              </Text>
            </View>
          </View>
        </View>

        {/* Pending Requests */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            ⏳ Pending Approvals ({dashboardData?.pendingApprovals || 0})
          </Text>
          {dashboardData?.pendingRequests?.map((requestItem) => (
            <View key={requestItem.id} style={styles.requestItem}>
              <View style={styles.requestInfo}>
                <Text style={styles.requestIcon}>
                  {getRequestIcon(requestItem.type)}
                </Text>
                <View style={styles.requestDetails}>
                  <Text style={styles.requestTitle}>{requestItem.request}</Text>
                  <Text style={styles.requestUser}>
                    From: {requestItem.user}
                  </Text>
                </View>
              </View>
              <View style={styles.requestActions}>
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() =>
                    Alert.alert('Approve', `Approve ${requestItem.request}?`)
                  }
                >
                  <Text style={styles.approveButtonText}>✓</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() =>
                    Alert.alert('Reject', `Reject ${requestItem.request}?`)
                  }
                >
                  <Text style={styles.rejectButtonText}>✗</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() =>
              Alert.alert('Navigation', 'Approvals screen not implemented yet')
            }
          >
            <Text style={styles.viewAllButtonText}>
              View All Pending Requests
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activities */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Recent System Activities</Text>
          {dashboardData?.recentActivities?.map((activityItem) => (
            <View key={activityItem.id} style={styles.activityItem}>
              <Text style={styles.activityIcon}>
                {getActivityIcon(activityItem.type)}
              </Text>
              <View style={styles.activityDetails}>
                <Text style={styles.activityText}>{activityItem.activity}</Text>
                <Text style={styles.activityTime}>{activityItem.time}</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() =>
              Alert.alert(
                'Navigation',
                'Activity logs screen not implemented yet',
              )
            }
          >
            <Text style={styles.viewAllButtonText}>View All Activities</Text>
          </TouchableOpacity>
        </View>

        {/* Admin Actions */}
        <View style={[styles.card, styles.lastCard]}>
          <Text style={styles.cardTitle}>🛠️ Admin Actions</Text>

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                Alert.alert(
                  'User Management',
                  'User management feature coming soon!',
                )
              }
            >
              <Text style={styles.actionButtonText}>👥 Manage Users</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                Alert.alert(
                  'Class Management',
                  'Class management feature coming soon!',
                )
              }
            >
              <Text style={styles.actionButtonText}>📚 Manage Classes</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                Alert.alert(
                  'Fee Management',
                  'Fee management feature coming soon!',
                )
              }
            >
              <Text style={styles.actionButtonText}>💰 Fee Management</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                Alert.alert('Reports', 'Reports feature coming soon!')
              }
            >
              <Text style={styles.actionButtonText}>📊 Generate Reports</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                Alert.alert(
                  'System Settings',
                  'System settings feature coming soon!',
                )
              }
            >
              <Text style={styles.actionButtonText}>⚙️ System Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                Alert.alert('Backup', 'System backup feature coming soon!')
              }
            >
              <Text style={styles.actionButtonText}>💾 Backup System</Text>
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
  // Removed headerCard, headerContent, avatar, avatarText, headerText, welcomeText, subtitleText, logoutButton, logoutButtonText
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9B59B6',
  },
  statLabel: {
    fontSize: 11,
    color: '#666666',
    marginTop: 4,
    textAlign: 'center',
  },
  healthCard: {
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
    borderLeftWidth: 4,
    borderLeftColor: '#27AE60',
  },
  healthStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  healthItem: {
    flex: 1,
    minWidth: '40%',
  },
  healthLabel: {
    fontSize: 12,
    color: '#666666',
  },
  healthValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27AE60',
    marginTop: 2,
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
  requestItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  requestIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  requestDetails: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  requestUser: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  approveButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rejectButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  activityItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
  },
  activityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#333333',
  },
  activityTime: {
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
    backgroundColor: '#9B59B6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 12,
  },
  viewAllButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9B59B6',
    alignItems: 'center',
  },
  viewAllButtonText: {
    color: '#9B59B6',
    fontWeight: '500',
  },
});

export default SchoolAdminScreen;
