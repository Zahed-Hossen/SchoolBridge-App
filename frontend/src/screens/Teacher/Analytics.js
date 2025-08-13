import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SimpleHeader from '../../components/navigation/SimpleHeader';
import { TEACHER_COLORS } from '../../constants/theme';

const Analytics = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <SimpleHeader
        title="Analytics"
        subtitle="Performance insights"
        navigation={navigation}
        primaryColor={TEACHER_COLORS.primary}
      />
      <View style={styles.content}>
        <Text style={styles.title}>Analytics Dashboard</Text>
        <Text style={styles.subtitle}>Coming Soon...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TEACHER_COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEACHER_COLORS.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: TEACHER_COLORS.textMuted,
  },
});

export default Analytics;
