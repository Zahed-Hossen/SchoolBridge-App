import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { apiService } from '../../api/apiService'; // Updated import
import { API_CONFIG } from '../../constants/config'; // Import config
import { COLORS, FONTS, SPACING } from '../../constants/theme';

const TestScreen = () => {
  const [status, setStatus] = useState('Not tested');
  const [serverInfo, setServerInfo] = useState(null);

  const testConnection = async () => {
    try {
      setStatus('Testing...');
      console.log('Testing API connection...');

      // Create a simple test request
      const response = await fetch(`${API_CONFIG.BASE_URL.replace('/api', '')}/health`);
      const data = await response.json();

      setStatus('Connected ✅');
      setServerInfo(data);

      Alert.alert('Success', 'Server connection working!');
    } catch (error) {
      console.error('Connection test failed:', error);
      setStatus('Failed ❌');

      let errorMessage = 'Connection failed';
      if (error.message.includes('Network request failed')) {
        errorMessage = 'Network error - check if server is running and IP address is correct';
      } else if (error.response) {
        errorMessage = `Server error: ${error.response.status}`;
      }

      Alert.alert('Connection Failed', errorMessage);
    }
  };

  const testLogin = async () => {
    try {
      setStatus('Testing login...');
      console.log('Testing login...');

      const response = await apiService.auth.login({
        email: 'test@schoolbridge.com',
        password: 'password123',
        role: 'Teacher'
      });

      setStatus('Login Test ✅');
      Alert.alert('Success', 'Login test successful!');
      console.log('Login test response:', response.data);
    } catch (error) {
      console.error('Login test failed:', error);
      setStatus('Login Test ❌');
      Alert.alert('Login Test Failed', error.message);
    }
  };

  const resetAuth = async () => {
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.default.clear();
      Alert.alert('Success', 'Storage cleared! Restart the app.');
    } catch (error) {
      Alert.alert('Error', 'Failed to clear storage');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Debug Screen</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Server Connection</Text>
          <Text style={styles.status}>Status: {status}</Text>

          <TouchableOpacity style={styles.button} onPress={testConnection}>
            <Text style={styles.buttonText}>Test Connection</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={testLogin}>
            <Text style={styles.buttonText}>Test Login</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Configuration</Text>
          <Text style={styles.info}>Base URL: {API_CONFIG.BASE_URL}</Text>
          <Text style={styles.info}>Timeout: {API_CONFIG.TIMEOUT}ms</Text>
        </View>

        {serverInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Server Info</Text>
            <Text style={styles.info}>{JSON.stringify(serverInfo, null, 2)}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Credentials</Text>
          <Text style={styles.info}>📧 Email: test@schoolbridge.com</Text>
          <Text style={styles.info}>🔐 Password: password123</Text>
          <Text style={styles.info}>👤 Role: any (Teacher, Student, Parent, Admin)</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={resetAuth}>
            <Text style={styles.buttonText}>Clear Storage</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  content: {
    padding: SPACING.lg,
  },
  title: {
    ...FONTS.h1,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 8,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  status: {
    ...FONTS.body,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  info: {
    ...FONTS.caption,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  dangerButton: {
    backgroundColor: COLORS.error,
  },
  buttonText: {
    ...FONTS.button,
    color: COLORS.text.white,
  },
});

export default TestScreen;
