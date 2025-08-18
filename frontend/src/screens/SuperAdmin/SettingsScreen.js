import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BASE_THEME } from '../../constants/theme';

import SimpleHeader from '../../components/navigation/SimpleHeader';

const SettingsScreen = ({ navigation }) => {
  const styles = getStyles();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const settingsItems = [
    {
      icon: 'notifications',
      title: 'Notifications',
      action: (
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{
            false: '#D1D5DB',
            true: BASE_THEME.colors.primary,
          }}
        />
      ),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.headerWrapper}>
        <SimpleHeader
          title="Settings"
          userRole="Admin"
          navigation={navigation}
          primaryColor="#2563EB"
          style={{ alignItems: 'center', justifyContent: 'center' }}
        />
      </View>
      <ScrollView contentContainerStyle={{ paddingTop: 80 }}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        {settingsItems.map((item, index) => (
          <View key={index} style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons
                name={item.icon}
                size={22}
                color={BASE_THEME.colors.primary}
                style={styles.settingIcon}
              />
              <Text style={styles.settingText}>{item.title}</Text>
            </View>
            {item.action}
          </View>
        ))}

        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons
              name="person"
              size={22}
              color={BASE_THEME.colors.primary}
              style={styles.settingIcon}
            />
            <Text style={styles.settingText}>Edit Profile</Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={BASE_THEME.colors.text.muted}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
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
    sectionTitle: {
      fontSize: BASE_THEME.fonts.sizes.body3,
      fontWeight: BASE_THEME.fonts.weights.semiBold,
      color: BASE_THEME.colors.text.muted,
      marginTop: BASE_THEME.spacing.lg,
      marginBottom: BASE_THEME.spacing.md,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: BASE_THEME.colors.background.secondary,
      borderRadius: BASE_THEME.borderRadius.md,
      padding: BASE_THEME.spacing.md,
      marginBottom: BASE_THEME.spacing.sm,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingIcon: {
      marginRight: BASE_THEME.spacing.md,
    },
    settingText: {
      fontSize: BASE_THEME.fonts.sizes.body2,
      color: BASE_THEME.colors.text.primary,
    },
    logoutButton: {
      backgroundColor: BASE_THEME.colors.error + '20',
      borderRadius: BASE_THEME.borderRadius.md,
      padding: BASE_THEME.spacing.md,
      alignItems: 'center',
      marginTop: BASE_THEME.spacing.xl,
    },
    logoutText: {
      color: BASE_THEME.colors.error,
      fontWeight: BASE_THEME.fonts.weights.semiBold,
      fontSize: BASE_THEME.fonts.sizes.body2,
    },
  });

export default SettingsScreen;
