import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';

const PermissionGuard = ({
  children,
  requiredPermission,
  fallbackScreen = null,
}) => {
  const { hasPermission, currentRole, permissions } = useRole();
  const { isAuthenticated } = useAuth();

  console.log('🛡️ PermissionGuard Check:', {
    requiredPermission,
    currentRole,
    isAuthenticated,
    hasPermission: hasPermission(requiredPermission),
  });

  // Check authentication first
  if (!isAuthenticated) {
    return (
      fallbackScreen || (
        <View style={styles.accessDenied}>
          <Ionicons name="person-outline" size={64} color="#E74C3C" />
          <Text style={styles.accessDeniedTitle}>Authentication Required</Text>
          <Text style={styles.accessDeniedText}>
            Please log in to access this feature.
          </Text>
        </View>
      )
    );
  }

  // Check role-specific permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      fallbackScreen || (
        <View style={styles.accessDenied}>
          <Ionicons name="shield-outline" size={64} color="#E74C3C" />
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedText}>
            You don't have permission to access this feature.{'\n'}
            Required: {requiredPermission}
            {'\n'}
            Your role: {currentRole || 'None'}
          </Text>
        </View>
      )
    );
  }

  return children;
};

const styles = StyleSheet.create({
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFB',
    padding: 30,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
});

export default PermissionGuard;
