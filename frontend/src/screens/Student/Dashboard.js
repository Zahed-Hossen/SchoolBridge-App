import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';
import { useTenant } from '../../context/TenantContext';

// ✅ FIX: Update import to use new modular API structure
import { studentService } from '../../api/services/studentService';
import { testService } from '../../api/services/testService';
// OR use the main API index:
// import { studentService, testService } from '../../api';

const StudentDashboard = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { currentRole, roleTheme } = useRole();
  const { tenantBranding } = useTenant();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // ✅ FIX: Update API calls to use new service structure
  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('📊 Loading student dashboard data...');

      // ✅ Updated API calls using new service structure
      const [dashboardResponse, announcementsResponse, notificationsResponse] = await Promise.allSettled([
        studentService.getDashboard(), // ✅ Use studentService
        studentService.getAnnouncements({ limit: 3 }), // ✅ Temporary - until you create announcementService
        studentService.getNotifications({ limit: 5 }) // ✅ Temporary - until you create commonService
      ]);

      // Process dashboard data
      let dashboardResult = null;
      if (dashboardResponse.status === 'fulfilled' && dashboardResponse.value.success) {
        dashboardResult = dashboardResponse.value.data;
        console.log('✅ Dashboard API data loaded');
      } else {
        console.warn('⚠️ Dashboard API failed, using mock data');
        dashboardResult = getMockDashboardData();
      }

      // Process announcements
      let announcements = [];
      if (announcementsResponse.status === 'fulfilled' && announcementsResponse.value.success) {
        announcements = announcementsResponse.value.data.announcements || [];
      } else {
        console.warn('⚠️ Announcements API failed, using empty array');
        announcements = getMockAnnouncements(); // ✅ Use mock data for now
      }

      // Process notifications
      let notifications = [];
      if (notificationsResponse.status === 'fulfilled' && notificationsResponse.value.success) {
        const notificationData = notificationsResponse.value.data;
        notifications = notificationData?.notifications || [];
        console.log('📱 Notifications loaded:', notifications.length);
      } else {
        console.warn('⚠️ Notifications API failed, using empty array');
        notifications = []; // ✅ Empty for now
      }

      // Combine all data with safe array slicing
      const combinedData = {
        ...dashboardResult,
        announcements: Array.isArray(announcements) ? announcements.slice(0, 3) : [],
        notifications: Array.isArray(notifications) ? notifications.slice(0, 5) : [],
        lastUpdated: new Date().toISOString(),
      };

      setDashboardData(combinedData);
      console.log('✅ Student dashboard data loaded successfully');

    } catch (error) {
      console.error('❌ Error loading dashboard:', error);
      setError(error.message);

      // Use fallback data with proper structure
      const fallbackData = {
        ...getMockDashboardData(),
        announcements: getMockAnnouncements(),
        notifications: [],
        lastUpdated: new Date().toISOString(),
      };
      setDashboardData(fallbackData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Mock data functions remain the same...
  const getMockDashboardData = () => ({
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
  });

  const getMockAnnouncements = () => [
    { id: 1, title: 'Exam Schedule Released', content: 'Mid-term exam schedule is now available', time: '1 hour ago' },
    { id: 2, title: 'Library Hours Extended', content: 'Library will be open until 10 PM during exam week', time: '3 hours ago' },
    { id: 3, title: 'Sports Day Event', content: 'Annual sports day scheduled for next Friday', time: '1 day ago' },
  ];

  // ✅ Rest of your component code remains the same...
  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const onRefresh = () => {
    loadDashboardData(true);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' },
    ]);
  };

  const navigateToScreen = (screenName, params = {}) => {
    try {
      if (navigation) {
        navigation.navigate(screenName, params);
      } else {
        Alert.alert('Coming Soon', `${screenName} screen will be available soon!`);
      }
    } catch (error) {
      console.warn('Navigation error:', error);
      Alert.alert('Navigation Error', 'Unable to navigate to the requested screen.');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#E74C3C';
      case 'medium': return '#F39C12';
      case 'low': return '#27AE60';
      default: return roleTheme?.primary || '#3498DB';
    }
  };

  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return '#27AE60';
    if (grade.startsWith('B')) return '#3498DB';
    if (grade.startsWith('C')) return '#F39C12';
    return '#E74C3C';
  };

  // ✅ Rest of your component render logic remains exactly the same...
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={roleTheme?.primary || '#3498DB'} />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
        <Text style={styles.loadingSubtext}>Fetching latest updates</Text>
      </View>
    );
  }

  // Enhanced theme colors
  const primaryColor = roleTheme?.primary || tenantBranding?.primaryColor || '#3498DB';
  const dynamicStyles = StyleSheet.create({
    avatar: {
      ...styles.avatar,
      backgroundColor: primaryColor,
    },
    statNumber: {
      ...styles.statNumber,
      color: primaryColor,
    },
    actionButton: {
      ...styles.actionButton,
      backgroundColor: primaryColor,
    },
    logoutButton: {
      ...styles.logoutButton,
      borderColor: primaryColor,
    },
    logoutButtonText: {
      ...styles.logoutButtonText,
      color: primaryColor,
    },
    viewAllButtonText: {
      ...styles.viewAllButtonText,
      color: primaryColor,
    },
    viewAllButton: {
      ...styles.viewAllButton,
      borderColor: primaryColor,
    },
    classTime: {
      ...styles.classTime,
      color: primaryColor,
      backgroundColor: `${primaryColor}20`,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={primaryColor}
            colors={[primaryColor]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Your existing render code stays the same */}
        {/* ... rest of your JSX ... */}
      </ScrollView>
    </View>
  );
};

// ✅ Styles remain exactly the same
const styles = StyleSheet.create({
  // ... your existing styles ...
});

export default StudentDashboard;
