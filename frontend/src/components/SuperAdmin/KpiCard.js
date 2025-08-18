import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TEACHER_THEME } from '../../constants/theme'; // Direct import

const KPICard = ({ label, value, icon, trend }) => {
  const styles = getStyles(TEACHER_THEME);

  const getTrendIcon = () => {
    if (trend === 'up') return 'trending-up';
    if (trend === 'down') return 'trending-down';
    return 'remove';
  };

  const getTrendColor = () => {
    if (trend === 'up') return TEACHER_THEME.colors.success.main;
    if (trend === 'down') return TEACHER_THEME.colors.error.main;
    return TEACHER_THEME.colors.text.muted;
  };

  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={icon}
          size={20}
          color={TEACHER_THEME.colors.primary.main}
        />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.trendContainer}>
        <Ionicons name={getTrendIcon()} size={16} color={getTrendColor()} />
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      width: '48%',
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.spacing.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      elevation: 2,
    },
    iconContainer: {
      backgroundColor: theme.colors.primary.main + '20',
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    value: {
      fontSize: theme.fonts.sizes.h3,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    label: {
      fontSize: theme.fonts.sizes.body3,
      color: theme.colors.text.secondary,
    },
    trendContainer: {
      position: 'absolute',
      top: theme.spacing.md,
      right: theme.spacing.md,
    },
  });

export default KPICard;
