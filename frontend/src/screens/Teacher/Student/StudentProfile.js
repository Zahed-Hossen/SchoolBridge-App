import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import {
  TEACHER_COLORS,
  TEACHER_THEME,
  SPACING,
  BORDER_RADIUS,
} from '../../../constants/theme';
import SimpleHeader from '../../../components/navigation/SimpleHeader';

const StudentProfile = ({ route }) => {
  const { studentId, studentName, classId, email, avatar } = route.params || {};

  // Helper to get initials if no avatar
  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <View style={styles.container}>
      <SimpleHeader
        title={studentName || 'Student Profile'}
        subtitle={studentId ? `ID: ${studentId}` : ''}
        navigation={navigation}
        primaryColor={TEACHER_COLORS.primary}
      />
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          {avatar ? (
            // If you fetch avatar, render <Image source={{ uri: avatar }} ... />
            <Ionicons
              name="person-circle"
              size={80}
              color={TEACHER_COLORS.primary}
            />
          ) : (
            <View style={styles.initialsCircle}>
              <Text style={styles.initialsText}>
                {getInitials(studentName || 'S')}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.name}>{studentName || 'Student'}</Text>
        <View style={styles.infoRow}>
          <Ionicons
            name="id-card-outline"
            size={18}
            color={TEACHER_COLORS.textMuted}
          />
          <Text style={styles.infoText}>
            ID: <Text style={styles.infoValue}>{studentId || '-'}</Text>
          </Text>
        </View>
        {classId && (
          <View style={styles.infoRow}>
            <Ionicons
              name="school-outline"
              size={18}
              color={TEACHER_COLORS.textMuted}
            />
            <Text style={styles.infoText}>
              Class: <Text style={styles.infoValue}>{classId}</Text>
            </Text>
          </View>
        )}
        {email && (
          <View style={styles.infoRow}>
            <MaterialIcons
              name="email"
              size={18}
              color={TEACHER_COLORS.textMuted}
            />
            <Text style={styles.infoText}>
              Email: <Text style={styles.infoValue}>{email}</Text>
            </Text>
          </View>
        )}
      </View>

      {/* Details Section - Placeholder for future data */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Student Details</Text>
        <View style={styles.detailRow}>
          <Ionicons
            name="calendar-outline"
            size={18}
            color={TEACHER_COLORS.primary}
            style={styles.detailIcon}
          />
          <Text style={styles.detailText}>
            Attendance, grades, and more will appear here.
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons
            name="call-outline"
            size={18}
            color={TEACHER_COLORS.primary}
            style={styles.detailIcon}
          />
          <Text style={styles.detailText}>
            Contact and guardian info coming soon.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TEACHER_COLORS.background,
    padding: SPACING.lg,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: TEACHER_COLORS.surface,
    borderRadius: BORDER_RADIUS.xl || 24,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  avatarContainer: {
    marginBottom: SPACING.md,
  },
  initialsCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: TEACHER_COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    ...TEACHER_THEME.typography.h2,
    color: TEACHER_COLORS.primary,
    fontWeight: '700',
  },
  name: {
    ...TEACHER_THEME.typography.h2,
    color: TEACHER_COLORS.text,
    fontWeight: '700',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: SPACING.xs,
  },
  infoText: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.textMuted,
    marginLeft: SPACING.xs,
  },
  infoValue: {
    color: TEACHER_COLORS.text,
    fontWeight: '600',
  },
  section: {
    backgroundColor: TEACHER_COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.md,
  },
  sectionTitle: {
    ...TEACHER_THEME.typography.h4,
    color: TEACHER_COLORS.primary,
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailIcon: {
    marginRight: SPACING.sm,
  },
  detailText: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
  },
});

export default StudentProfile;
