import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BASE_THEME } from '../../constants/theme';
import SimpleHeader from '../../components/navigation/SimpleHeader';

const LogsScreen = ({ navigation }) => {
  const styles = getStyles();

  const logs = [
    {
      id: '1',
      action: 'Login',
      user: 'admin@example.com',
      time: '2023-05-15 09:30:45',
      icon: 'log-in',
    },
    {
      id: '2',
      action: 'School Created',
      user: 'admin@example.com',
      time: '2023-05-15 10:15:22',
      icon: 'school',
    },
    // Add more logs...
  ];

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.headerWrapper}>
        <SimpleHeader
          title="Logs"
          userRole="Admin"
          navigation={navigation}
          primaryColor="#2563EB"
          style={{ alignItems: 'center', justifyContent: 'center' }}
        />
      </View>
      <ScrollView contentContainerStyle={{ paddingTop: 80 }}>
        <View style={styles.filterContainer}>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Today</Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={BASE_THEME.colors.text.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>All Actions</Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={BASE_THEME.colors.text.primary}
            />
          </TouchableOpacity>
        </View>

        {logs.map((item) => (
          <View key={item.id} style={styles.logItem}>
            <View
              style={[
                styles.logIcon,
                { backgroundColor: BASE_THEME.colors.primary + '20' },
              ]}
            >
              <Ionicons
                name={item.icon}
                size={18}
                color={BASE_THEME.colors.primary}
              />
            </View>
            <View style={styles.logDetails}>
              <Text style={styles.logAction}>{item.action}</Text>
              <Text style={styles.logUser}>{item.user}</Text>
            </View>
            <Text style={styles.logTime}>{item.time}</Text>
          </View>
        ))}
        <View style={styles.listContent} />
      </ScrollView>
    </View>
  );
};

const getStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: BASE_THEME.colors.background.primary,
      padding: BASE_THEME.spacing.md,
    },
    headerWrapper: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterContainer: {
      flexDirection: 'row',
      marginBottom: BASE_THEME.spacing.md,
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: BASE_THEME.colors.card,
      borderRadius: BASE_THEME.borderRadius.sm,
      paddingHorizontal: BASE_THEME.spacing.sm,
      paddingVertical: BASE_THEME.spacing.xs,
      marginRight: BASE_THEME.spacing.sm,
    },
    filterText: {
      marginRight: BASE_THEME.spacing.xs,
      color: BASE_THEME.colors.text.primary,
      fontSize: BASE_THEME.fonts.sizes.body2,
    },
    logItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: BASE_THEME.colors.card,
      borderRadius: BASE_THEME.borderRadius.md,
      padding: BASE_THEME.spacing.md,
      marginBottom: BASE_THEME.spacing.sm,
    },
    logIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: BASE_THEME.spacing.sm,
    },
    logDetails: {
      flex: 1,
    },
    logAction: {
      fontWeight: BASE_THEME.fonts.weights.semiBold,
      color: BASE_THEME.colors.text.primary,
      marginBottom: 2,
      fontSize: BASE_THEME.fonts.sizes.body2,
    },
    logUser: {
      color: BASE_THEME.colors.text.secondary,
      fontSize: BASE_THEME.fonts.sizes.caption,
    },
    logTime: {
      color: BASE_THEME.colors.text.secondary,
      fontSize: BASE_THEME.fonts.sizes.caption,
    },
    listContent: {
      paddingBottom: BASE_THEME.spacing.lg,
    },
  });

export default LogsScreen;
