import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTenant } from '../../context/TenantContext';

const FeatureGuard = ({ children, requiredFeature, fallbackScreen = null }) => {
  const { isFeatureEnabled } = useTenant();

  if (requiredFeature && !isFeatureEnabled(requiredFeature)) {
    return (
      fallbackScreen || (
        <View style={styles.featureDisabled}>
          <Ionicons name="construct-outline" size={64} color="#F39C12" />
          <Text style={styles.featureDisabledTitle}>Feature Not Available</Text>
          <Text style={styles.featureDisabledText}>
            This feature is not enabled for your school.
          </Text>
        </View>
      )
    );
  }

  return children;
};

const styles = StyleSheet.create({
  featureDisabled: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFAF0',
    padding: 30,
  },
  featureDisabledTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F39C12',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  featureDisabledText: {
    fontSize: 16,
    color: '#8B5A2B',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
});

export default FeatureGuard;
