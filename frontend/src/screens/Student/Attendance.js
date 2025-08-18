import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

const HEADER_COLOR = '#3498DB';

const StudentAttendance = () => {
  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: HEADER_COLOR }}>
        <View style={[styles.header, { backgroundColor: HEADER_COLOR }]}>
          <Ionicons
            name="calendar"
            size={32}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <View>
            <Text style={styles.headerTitle}>Attendance</Text>
            <Text style={styles.headerSubtitle}>
              Track your daily attendance
            </Text>
          </View>
        </View>
      </SafeAreaView>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#eaf6fd' }]}>
          <Ionicons
            name="checkmark-circle"
            size={28}
            color="#27AE60"
            style={{ marginBottom: 4 }}
          />
          <Text style={styles.statValue}>--</Text>
          <Text style={styles.statLabel}>Present</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#fdeaea' }]}>
          <Ionicons
            name="close-circle"
            size={28}
            color="#E74C3C"
            style={{ marginBottom: 4 }}
          />
          <Text style={styles.statValue}>--</Text>
          <Text style={styles.statLabel}>Absent</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#fdf6ea' }]}>
          <Ionicons
            name="time"
            size={28}
            color="#F39C12"
            style={{ marginBottom: 4 }}
          />
          <Text style={styles.statValue}>--%</Text>
          <Text style={styles.statLabel}>Attendance</Text>
        </View>
      </View>

      <View style={styles.calendarPreview}>
        <Ionicons
          name="calendar-outline"
          size={48}
          color={HEADER_COLOR}
          style={{ marginBottom: 12 }}
        />
        <Text style={styles.calendarTitle}>Calendar View Coming Soon</Text>
        <Text style={styles.calendarText}>
          You'll be able to view your attendance by date and see trends here.
        </Text>
      </View>

      <View style={styles.emptyState}>
        <Ionicons
          name="cloud-offline"
          size={40}
          color={COLORS.grey.medium}
          style={{ marginBottom: 8 }}
        />
        <Text style={styles.emptyTitle}>No Attendance Data</Text>
        <Text style={styles.emptyText}>
          Your attendance records will appear here once available.
        </Text>
      </View>
    </View>
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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 8,
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 18,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: FONTS.sizes.h2,
    fontWeight: '700',
    color: HEADER_COLOR,
  },
  statLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  calendarPreview: {
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: '#f4fafd',
    borderRadius: 16,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  calendarTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: HEADER_COLOR,
    marginBottom: 4,
  },
  calendarText: {
    fontSize: FONTS.sizes.body3,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginHorizontal: SPACING.lg,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  emptyText: {
    fontSize: FONTS.sizes.body3,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});

export default StudentAttendance;
