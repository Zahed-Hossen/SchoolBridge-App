import React from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BASE_THEME } from '../../constants/theme';
import AppHeader from '../../components/navigation/AppHeader';

const DashboardScreen = () => {
  // Simple static UI with minimal dependencies
  return (
    <View
      style={{ flex: 1, backgroundColor: BASE_THEME.colors.background.primary }}
    >
      {/* App Header (fixed at top) */}
      <AppHeader
        title="Dashboard"
        subtitle="Welcome back, Admin"
        userRole="Admin"
      />
      {/* Scrollable content below header */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingTop: 8 }}
      >
        {/* KPI Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Overview</Text>
          <View style={styles.kpiGrid}>
            {/* KPI Card 1 */}
            <View style={styles.kpiCard}>
              <Ionicons
                name="business"
                size={24}
                color={BASE_THEME.colors.primary}
              />
              <Text style={styles.kpiValue}>12</Text>
              <Text style={styles.kpiLabel}>Total Schools</Text>
            </View>

            {/* KPI Card 2 */}
            <View style={styles.kpiCard}>
              <Ionicons
                name="people"
                size={24}
                color={BASE_THEME.colors.primary}
              />
              <Text style={styles.kpiValue}>2,540</Text>
              <Text style={styles.kpiLabel}>Active Users</Text>
            </View>

            {/* KPI Card 3 */}
            <View style={styles.kpiCard}>
              <Ionicons
                name="time"
                size={24}
                color={BASE_THEME.colors.primary}
              />
              <Text style={styles.kpiValue}>3</Text>
              <Text style={styles.kpiLabel}>Pending Schools</Text>
            </View>

            {/* KPI Card 4 */}
            <View style={styles.kpiCard}>
              <Ionicons
                name="pulse"
                size={24}
                color={BASE_THEME.colors.primary}
              />
              <Text style={styles.kpiValue}>100%</Text>
              <Text style={styles.kpiLabel}>System Health</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activityList}>
            {/* Activity Item 1 */}
            <View style={styles.activityItem}>
              <Ionicons
                name="library"
                size={20}
                color={BASE_THEME.colors.text.secondary}
              />
              <View style={styles.activityTextContainer}>
                <Text style={styles.activityText}>
                  Admin updated library module
                </Text>
                <Text style={styles.activityTime}>3m ago</Text>
              </View>
            </View>

            {/* Activity Item 2 */}
            <View style={styles.activityItem}>
              <Ionicons
                name="business"
                size={20}
                color={BASE_THEME.colors.text.secondary}
              />
              <View style={styles.activityTextContainer}>
                <Text style={styles.activityText}>New school registration</Text>
                <Text style={styles.activityTime}>1h ago</Text>
              </View>
            </View>

            {/* Activity Item 3 */}
            <View style={styles.activityItem}>
              <Ionicons
                name="construct"
                size={20}
                color={BASE_THEME.colors.text.secondary}
              />
              <View style={styles.activityTextContainer}>
                <Text style={styles.activityText}>
                  System maintenance completed
                </Text>
                <Text style={styles.activityTime}>2h ago</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Pending Approvals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending Approvals</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Manage All</Text>
            </TouchableOpacity>
          </View>

          {/* School Card 1 */}
          <View style={styles.schoolCard}>
            <Text style={styles.schoolName}>Sunrise School</Text>
            <Text style={styles.schoolLocation}>Sylhet</Text>
            <Text style={styles.schoolStatus}>Pending</Text>
          </View>

          {/* School Card 2 */}
          <View style={styles.schoolCard}>
            <Text style={styles.schoolName}>Golden Gate Academy</Text>
            <Text style={styles.schoolLocation}>Khulna</Text>
            <Text style={styles.schoolStatus}>Pending</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Define styles directly as a constant
const styles = {
  container: {
    flex: 1,
    backgroundColor: BASE_THEME.colors.background.primary,
    padding: 16,
  },
  // header styles removed (AppHeader used instead)
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: BASE_THEME.colors.text.primary,
  },
  seeAll: {
    color: BASE_THEME.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  kpiCard: {
    width: '48%',
    backgroundColor: BASE_THEME.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: BASE_THEME.colors.text.primary,
    marginTop: 8,
  },
  kpiLabel: {
    fontSize: 14,
    color: BASE_THEME.colors.text.secondary,
    marginTop: 4,
  },
  activityList: {
    backgroundColor: BASE_THEME.colors.card,
    borderRadius: 12,
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  activityText: {
    fontSize: 16,
    color: BASE_THEME.colors.text.primary,
  },
  activityTime: {
    fontSize: 12,
    color: BASE_THEME.colors.text.secondary,
    marginTop: 4,
  },
  schoolCard: {
    backgroundColor: BASE_THEME.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  schoolName: {
    fontSize: 18,
    fontWeight: '600',
    color: BASE_THEME.colors.text.primary,
  },
  schoolLocation: {
    fontSize: 14,
    color: BASE_THEME.colors.text.secondary,
    marginTop: 4,
  },
  schoolStatus: {
    fontSize: 14,
    color: BASE_THEME.colors.warning,
    marginTop: 4,
    fontWeight: 'bold',
  },
};

export default DashboardScreen;
