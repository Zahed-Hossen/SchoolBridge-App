import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TEACHER_THEME } from '../../constants/theme'; // Direct import

const SchoolCard = ({ school, onPress }) => {
  const styles = getStyles(TEACHER_THEME);

  const statusColors = {
    Active: TEACHER_THEME.colors.success.main,
    Pending: TEACHER_THEME.colors.warning.main,
    Suspended: TEACHER_THEME.colors.error.main,
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <Ionicons
          name="business"
          size={24}
          color={TEACHER_THEME.colors.primary.main}
        />
        <View style={styles.details}>
          <Text style={styles.name}>{school.name}</Text>
          <Text style={styles.location}>{school.location}</Text>
        </View>
        <Text style={styles.users}>{school.users} users</Text>
      </View>
      <View
        style={[
          styles.status,
          { backgroundColor: statusColors[school.status] + '20' },
        ]}
      >
        <Text
          style={[styles.statusText, { color: statusColors[school.status] }]}
        >
          {school.status}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    details: {
      marginLeft: theme.spacing.md,
      flex: 1,
    },
    name: {
      fontSize: theme.fonts.sizes.body2,
      fontWeight: theme.fonts.weights.semiBold,
      color: theme.colors.text.primary,
    },
    location: {
      fontSize: theme.fonts.sizes.body3,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xs,
    },
    users: {
      fontSize: theme.fonts.sizes.body3,
      color: theme.colors.text.secondary,
      marginLeft: theme.spacing.sm,
    },
    status: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.md,
      marginLeft: theme.spacing.sm,
    },
    statusText: {
      fontSize: theme.fonts.sizes.caption,
      fontWeight: theme.fonts.weights.semiBold,
    },
  });

export default SchoolCard;
