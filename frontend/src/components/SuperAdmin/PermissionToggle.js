import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TEACHER_THEME } from '../../constants/theme'; // Direct import

const PermissionToggle = ({ isActive, onToggle }) => {
  const styles = getStyles(TEACHER_THEME);

  return (
    <TouchableOpacity
      style={[styles.toggle, isActive && styles.toggleActive]}
      onPress={onToggle}
    >
      {isActive && <Ionicons name="checkmark" size={16} color="white" />}
    </TouchableOpacity>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    toggle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.neutral.medium,
      justifyContent: 'center',
      alignItems: 'center',
    },
    toggleActive: {
      backgroundColor: theme.colors.primary.main,
      borderColor: theme.colors.primary.main,
    },
  });

export default PermissionToggle;
