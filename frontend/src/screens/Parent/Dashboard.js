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

const ParentDashboard = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' },
    ]);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

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
                {user?.name?.charAt(0)?.toUpperCase() || 'P'}
              </Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.welcomeText}>
                Welcome, {user?.name || 'Parent'}! 👨‍👩‍👧‍👦
              </Text>
              <Text style={styles.subtitleText}>
                Stay connected with your children's progress
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
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statLabel}>Children</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>1</Text>
            <Text style={styles.statLabel}>Pending Fees</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>New Grades</Text>
          </View>
        </View>

        {/* Children Overview */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>👨‍👩‍👧‍👦 Your Children</Text>

          <View style={styles.childItem}>
            <View style={styles.childInfo}>
              <Text style={styles.childName}>Sarah Johnson</Text>
              <Text style={styles.childGrade}>9th Grade • Lincoln High School</Text>
              <Text style={styles.childDetails}>
                Attendance: 95% • Latest Grade: A-
              </Text>
            </View>
            <TouchableOpacity style={styles.childViewButton}>
              <Text style={styles.childViewText}>View Details</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.childItem}>
            <View style={styles.childInfo}>
              <Text style={styles.childName}>Jake Johnson</Text>
              <Text style={styles.childGrade}>6th Grade • Lincoln Middle School</Text>
              <Text style={styles.childDetails}>
                Attendance: 92% • Latest Grade: B+
              </Text>
            </View>
            <TouchableOpacity style={styles.childViewButton}>
              <Text style={styles.childViewText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Recent Activities</Text>

          <View style={styles.activityItem}>
            <Text style={styles.activityText}>Sarah scored A- in Math Quiz</Text>
            <Text style={styles.activityTime}>2 hours ago</Text>
          </View>

          <View style={styles.activityItem}>
            <Text style={styles.activityText}>Jake's attendance updated</Text>
            <Text style={styles.activityTime}>1 day ago</Text>
          </View>

          <View style={styles.activityItem}>
            <Text style={styles.activityText}>Fee payment reminder sent</Text>
            <Text style={styles.activityTime}>2 days ago</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={[styles.card, styles.lastCard]}>
          <Text style={styles.cardTitle}>⚡ Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('Quick Action', 'Pay Fees feature coming soon!')}
            >
              <Text style={styles.actionButtonText}>💳 Pay Fees</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('Quick Action', 'Check Attendance feature coming soon!')}
            >
              <Text style={styles.actionButtonText}>📊 Check Attendance</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('Quick Action', 'View Grades feature coming soon!')}
            >
              <Text style={styles.actionButtonText}>🎯 View Grades</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('Quick Action', 'Message Teachers feature coming soon!')}
            >
              <Text style={styles.actionButtonText}>💬 Message Teachers</Text>
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
    backgroundColor: '#F39C12',
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
    borderColor: '#F39C12',
  },
  logoutButtonText: {
    color: '#F39C12',
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
    color: '#F39C12',
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
  childItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  childGrade: {
    fontSize: 14,
    color: '#F39C12',
    marginTop: 2,
  },
  childDetails: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  childViewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F39C12',
  },
  childViewText: {
    fontSize: 12,
    color: '#F39C12',
    fontWeight: '500',
  },
  activityItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
    backgroundColor: '#F39C12',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
});

export default ParentDashboard;
