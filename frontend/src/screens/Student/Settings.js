import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';
import { useTenant } from '../../context/TenantContext';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';

const STUDENT_COLORS = {
  primary: '#3498DB',
  secondary: '#6DD5FA',
  error: '#E74C3C',
  success: '#27AE60',
  warning: '#F39C12',
  text: '#1A202C',
  textWhite: '#fff',
  background: '#F8FAFB',
  surface: '#FFFFFF',
  shadow: '#000',
};

const settingsCategories = [
  {
    id: 'profile',
    title: 'Profile & Account',
    icon: 'person-circle',
    color: STUDENT_COLORS.primary,
    description: 'Manage your personal information and account',
    items: [
      {
        key: 'profileSettings',
        label: 'Profile Settings',
        type: 'navigate',
        icon: 'person',
        description: 'Update your profile information',
        color: STUDENT_COLORS.primary,
      },
      {
        key: 'changePassword',
        label: 'Change Password',
        type: 'action',
        icon: 'key',
        description: 'Change your account password',
        color: STUDENT_COLORS.primary,
      },
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: 'notifications',
    color: STUDENT_COLORS.secondary,
    description: 'Manage your notification preferences',
    items: [
      {
        key: 'pushNotifications',
        label: 'Push Notifications',
        type: 'switch',
        icon: 'notifications-outline',
        description: 'Receive important updates and alerts',
        color: STUDENT_COLORS.secondary,
      },
      {
        key: 'assignmentReminders',
        label: 'Assignment Reminders',
        type: 'switch',
        icon: 'alarm',
        description: 'Get reminders for upcoming assignments',
        color: STUDENT_COLORS.secondary,
      },
      {
        key: 'attendanceAlerts',
        label: 'Attendance Alerts',
        type: 'switch',
        icon: 'calendar',
        description: 'Be notified about attendance issues',
        color: STUDENT_COLORS.secondary,
      },
    ],
  },
  {
    id: 'appearance',
    title: 'Appearance',
    icon: 'color-palette',
    color: STUDENT_COLORS.primary,
    description: 'Customize your app experience',
    items: [
      {
        key: 'darkMode',
        label: 'Dark Mode',
        type: 'switch',
        icon: 'moon',
        description: 'Switch to dark theme',
        color: STUDENT_COLORS.primary,
      },
      {
        key: 'fontSize',
        label: 'Font Size',
        type: 'select',
        icon: 'text',
        value: 'Medium',
        options: ['Small', 'Medium', 'Large'],
        description: 'Adjust text size throughout the app',
        color: STUDENT_COLORS.primary,
      },
    ],
  },
  {
    id: 'support',
    title: 'Support',
    icon: 'help-circle',
    color: STUDENT_COLORS.success,
    description: 'Get help and support',
    items: [
      {
        key: 'helpCenter',
        label: 'Help Center',
        type: 'navigate',
        icon: 'library',
        description: 'Browse help articles and guides',
        color: STUDENT_COLORS.success,
      },
      {
        key: 'contactSupport',
        label: 'Contact Support',
        type: 'navigate',
        icon: 'chatbubbles',
        description: 'Get in touch with our support team',
        color: STUDENT_COLORS.success,
      },
    ],
  },
  {
    id: 'account',
    title: 'Account',
    icon: 'log-out',
    color: STUDENT_COLORS.error,
    description: 'Manage your account and sign out',
    items: [
      {
        key: 'signOut',
        label: 'Sign Out',
        type: 'action',
        icon: 'log-out',
        description: 'Sign out of your account',
        color: STUDENT_COLORS.error,
        destructive: true,
      },
    ],
  },
];

const StudentSettings = ({ navigation }) => {
  const { logout, user } = useAuth();
  const { currentRole } = useRole();
  const { tenantBranding } = useTenant();
  const [settings, setSettings] = useState({
    darkMode: false,
    pushNotifications: true,
    assignmentReminders: true,
    attendanceAlerts: true,
    fontSize: 'Medium',
  });

  // Handlers (implement as needed)
  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };
  const handleAction = (key) => {
    if (key === 'signOut') logout();
    // Add more actions as needed
  };
  const handleNavigation = (key) => {
    // Implement navigation for settings screens
  };

  // Render Setting Item
  const renderSettingItem = (item, categoryColor) => {
    return (
      <View
        key={item.key}
        style={[
          styles.settingItem,
          item.destructive && styles.settingItemDestructive,
        ]}
      >
        <View style={styles.settingLeft}>
          <View
            style={[
              styles.settingIcon,
              { backgroundColor: categoryColor + '22' },
            ]}
          >
            <Ionicons name={item.icon} size={22} color={categoryColor} />
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>{item.label}</Text>
            <Text style={styles.settingDescription}>{item.description}</Text>
          </View>
        </View>
        <View style={styles.settingRight}>
          {item.type === 'switch' && (
            <TouchableOpacity
              onPress={() => handleSettingChange(item.key, !settings[item.key])}
            >
              <Ionicons
                name={settings[item.key] ? 'toggle' : 'toggle-outline'}
                size={32}
                color={categoryColor}
              />
            </TouchableOpacity>
          )}
          {item.type === 'select' && (
            <Text style={styles.selectValueText}>{settings[item.key]}</Text>
          )}
          {item.type === 'action' && (
            <TouchableOpacity onPress={() => handleAction(item.key)}>
              <Ionicons
                name={item.icon}
                size={24}
                color={item.destructive ? STUDENT_COLORS.error : categoryColor}
              />
            </TouchableOpacity>
          )}
          {item.type === 'navigate' && (
            <TouchableOpacity onPress={() => handleNavigation(item.key)}>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={categoryColor}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Render Category
  const renderCategory = (category) => (
    <View key={category.id} style={styles.categoryContainer}>
      <LinearGradient
        colors={[category.color, category.color + 'DD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.categoryHeaderGradient}
      >
        <View style={styles.categoryHeaderLeft}>
          <View style={styles.categoryIconContainer}>
            <Ionicons
              name={category.icon}
              size={22}
              color={STUDENT_COLORS.textWhite}
            />
          </View>
          <View style={styles.categoryTitleContainer}>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            <Text style={styles.categoryDescription}>
              {category.description}
            </Text>
          </View>
        </View>
      </LinearGradient>
      <View style={styles.categoryItems}>
        {category.items.map((item) => renderSettingItem(item, category.color))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView
        edges={['top']}
        style={{ backgroundColor: STUDENT_COLORS.primary }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.screenTitle}>Settings</Text>
        {settingsCategories.map(renderCategory)}
        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>
            🏫 {tenantBranding?.schoolName || 'SchoolBridge'} - {currentRole}{' '}
            Portal
          </Text>
          <Text style={styles.footerSubtext}>
            Building the future of education management
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: STUDENT_COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: STUDENT_COLORS.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  categoryContainer: {
    marginBottom: SPACING.lg,
  },
  categoryHeaderGradient: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md + 4,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  categoryTitleContainer: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    color: STUDENT_COLORS.textWhite,
    fontWeight: '700',
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 13,
    color: STUDENT_COLORS.textWhite,
    opacity: 0.9,
    fontWeight: '500',
  },
  categoryItems: {
    backgroundColor: STUDENT_COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: STUDENT_COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
  },
  settingItemDestructive: {
    backgroundColor: '#E74C3C08',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    color: STUDENT_COLORS.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  settingRight: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  selectValueText: {
    fontSize: 14,
    color: STUDENT_COLORS.primary,
    fontWeight: '600',
  },
  footerInfo: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#A0AEC0',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default StudentSettings;
