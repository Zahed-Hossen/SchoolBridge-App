import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * ActivityLogItem component for SuperAdmin dashboard activity feed.
 * Props: { text: string, time: string, icon?: string }
 */
const ActivityLogItem = ({ text, time, icon = 'document-text-outline' }) => {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={22} color="#4F8EF7" style={styles.icon} />
      <View style={styles.textContainer}>
        <Text style={styles.text}>{text}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  text: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
  },
  time: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
});

export default ActivityLogItem;
