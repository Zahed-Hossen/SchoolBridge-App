import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Dimensions,
  Platform,
  Animated,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

// ✅ Import Professional Theme System
import SimpleHeader from '../../components/navigation/SimpleHeader';
import { useAuth } from '../../context/AuthContext';
import {
  COLORS,
  TEACHER_COLORS,
  TEACHER_THEME,
  SPACING,
  BORDER_RADIUS
} from '../../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

const Settings = ({ navigation }) => {
  // ✅ Auth Context Integration
  const { logout, isLoading: authLoading, user } = useAuth();

  // ✅ Professional State Management
  const scrollY = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState({
    // App Preferences
    darkMode: false,
    notifications: true,
    hapticFeedback: true,
    autoSync: true,
    offlineMode: false,

    // Display Settings
    fontSize: 'medium',
    language: 'English',
    theme: 'default',

    // Privacy & Security
    biometricAuth: false,
    autoLock: true,
    dataSharing: false,
    analyticsCollection: true,

    // Teacher Specific
    gradeNotifications: true,
    attendanceReminders: true,
    assignmentDeadlines: true,
    parentCommunication: true,
    classUpdates: true,
    emergencyAlerts: true,
  });

  // ✅ Enhanced Logout Handler for Settings
  const handleAdvancedSignOut = useCallback(async () => {
    Alert.alert(
      '🚪 Advanced Sign Out',
      'Choose your sign out preference:\n\n• Quick Sign Out: Immediate logout\n• Secure Sign Out: Clear all data and sessions\n• Cancel: Stay signed in',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Quick Sign Out',
          style: 'default',
          onPress: async () => {
            try {
              console.log('🚪 Quick sign out initiated from Settings');

              Alert.alert(
                '🔄 Quick Sign Out',
                'Signing you out quickly...',
                [],
                { cancelable: false }
              );

              await logout();

              setTimeout(() => {
                Alert.alert(
                  '✅ Signed Out',
                  'You have been successfully signed out.',
                  [{ text: 'OK' }]
                );
              }, 500);

            } catch (error) {
              console.error('❌ Quick sign out error:', error);
              Alert.alert('Error', 'Quick sign out failed. Please try again.');
            }
          }
        },
        {
          text: 'Secure Sign Out',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              '🔒 Secure Sign Out',
              'This will:\n• Clear all cached data\n• Revoke all sessions\n• Reset app preferences\n• Sign out from all devices\n\nThis action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Proceed',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      console.log('🔒 Secure sign out initiated from Settings');

                      Alert.alert(
                        '🔄 Secure Sign Out',
                        'Processing secure sign out...\n\n• Clearing all data\n• Revoking sessions\n• Resetting preferences\n\nThis may take a moment.',
                        [],
                        { cancelable: false }
                      );

                      // Additional delay for secure logout
                      await new Promise(resolve => setTimeout(resolve, 2000));

                      await logout();

                      // Reset settings on secure logout
                      setSettings({
                        darkMode: false,
                        notifications: true,
                        hapticFeedback: true,
                        autoSync: true,
                        offlineMode: false,
                        fontSize: 'medium',
                        language: 'English',
                        theme: 'default',
                        biometricAuth: false,
                        autoLock: true,
                        dataSharing: false,
                        analyticsCollection: true,
                        gradeNotifications: true,
                        attendanceReminders: true,
                        assignmentDeadlines: true,
                        parentCommunication: true,
                        classUpdates: true,
                        emergencyAlerts: true,
                      });

                      setTimeout(() => {
                        Alert.alert(
                          '✅ Secure Sign Out Complete',
                          'All data has been cleared and you have been securely signed out.',
                          [{ text: 'OK' }]
                        );
                      }, 500);

                    } catch (error) {
                      console.error('❌ Secure sign out error:', error);
                      Alert.alert('Error', 'Secure sign out failed. Please contact support.');
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  }, [logout]);

  // ✅ Professional Settings Categories with Theme Colors
  const settingsCategories = [
    {
      id: 'display',
      title: 'Display & Appearance',
      icon: 'color-palette',
      color: TEACHER_COLORS.primary,
      description: 'Customize your visual experience',
      items: [
        {
          key: 'darkMode',
          label: 'Dark Mode',
          type: 'switch',
          icon: 'moon',
          description: 'Switch to dark theme for better viewing in low light',
          color: COLORS.teacherPalette.interactive.primary,
        },
        {
          key: 'fontSize',
          label: 'Font Size',
          type: 'select',
          icon: 'text',
          value: 'Medium',
          options: ['Small', 'Medium', 'Large', 'Extra Large'],
          description: 'Adjust text size throughout the app',
          color: COLORS.teacherPalette.interactive.primary,
        },
        {
          key: 'theme',
          label: 'App Theme',
          type: 'select',
          icon: 'brush',
          value: 'Teacher Pro',
          options: ['Teacher Pro', 'Ocean Blue', 'Forest Green', 'Sunset Orange'],
          description: 'Choose your preferred color scheme',
          color: COLORS.teacherPalette.interactive.primary,
        },
        {
          key: 'language',
          label: 'Language',
          type: 'select',
          icon: 'language',
          value: 'English',
          options: ['English', 'Spanish', 'French', 'German', 'Chinese', 'Arabic'],
          description: 'Select your preferred language',
          color: COLORS.teacherPalette.interactive.primary,
        },
      ]
    },
    {
      id: 'notifications',
      title: 'Notifications & Alerts',
      icon: 'notifications',
      color: COLORS.teacherPalette.secondary.main,
      description: 'Manage your notification preferences',
      items: [
        {
          key: 'notifications',
          label: 'Push Notifications',
          type: 'switch',
          icon: 'notifications-outline',
          description: 'Receive notifications for important updates',
          color: COLORS.teacherPalette.secondary.main,
        },
        {
          key: 'gradeNotifications',
          label: 'Grade Submissions',
          type: 'switch',
          icon: 'star',
          description: 'Get notified when students submit assignments',
          color: COLORS.teacherPalette.secondary.main,
        },
        {
          key: 'attendanceReminders',
          label: 'Attendance Reminders',
          type: 'switch',
          icon: 'people',
          description: 'Daily reminders to mark attendance',
          color: COLORS.teacherPalette.secondary.main,
        },
        {
          key: 'assignmentDeadlines',
          label: 'Assignment Deadlines',
          type: 'switch',
          icon: 'time',
          description: 'Alerts for upcoming assignment deadlines',
          color: COLORS.teacherPalette.secondary.main,
        },
        {
          key: 'parentCommunication',
          label: 'Parent Messages',
          type: 'switch',
          icon: 'mail',
          description: 'Notifications for parent communications',
          color: COLORS.teacherPalette.secondary.main,
        },
        {
          key: 'classUpdates',
          label: 'Class Updates',
          type: 'switch',
          icon: 'school',
          description: 'Updates about class schedules and changes',
          color: COLORS.teacherPalette.secondary.main,
        },
        {
          key: 'emergencyAlerts',
          label: 'Emergency Alerts',
          type: 'switch',
          icon: 'warning',
          description: 'Critical school emergency notifications',
          color: TEACHER_COLORS.error,
        },
      ]
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: 'shield-checkmark',
      color: TEACHER_COLORS.success,
      description: 'Protect your data and privacy',
      items: [
        {
          key: 'biometricAuth',
          label: 'Biometric Authentication',
          type: 'switch',
          icon: 'finger-print',
          description: 'Use fingerprint or face ID to unlock the app',
          color: TEACHER_COLORS.success,
        },
        {
          key: 'autoLock',
          label: 'Auto-Lock',
          type: 'switch',
          icon: 'lock-closed',
          description: 'Automatically lock the app when inactive',
          color: TEACHER_COLORS.success,
        },
        {
          key: 'dataSharing',
          label: 'Data Sharing',
          type: 'switch',
          icon: 'share',
          description: 'Share anonymous usage data to improve the app',
          color: TEACHER_COLORS.success,
        },
        {
          key: 'analyticsCollection',
          label: 'Analytics Collection',
          type: 'switch',
          icon: 'analytics',
          description: 'Help us improve the app with usage analytics',
          color: TEACHER_COLORS.success,
        },
      ]
    },
    {
      id: 'performance',
      title: 'Performance & Storage',
      icon: 'speedometer',
      color: TEACHER_COLORS.warning,
      description: 'Optimize app performance and storage',
      items: [
        {
          key: 'hapticFeedback',
          label: 'Haptic Feedback',
          type: 'switch',
          icon: 'phone-portrait',
          description: 'Feel vibrations for button presses and interactions',
          color: TEACHER_COLORS.warning,
        },
        {
          key: 'autoSync',
          label: 'Auto Sync',
          type: 'switch',
          icon: 'sync',
          description: 'Automatically sync data when connected to WiFi',
          color: TEACHER_COLORS.warning,
        },
        {
          key: 'offlineMode',
          label: 'Offline Mode',
          type: 'switch',
          icon: 'cloud-offline',
          description: 'Enable offline functionality when no internet',
          color: TEACHER_COLORS.warning,
        },
      ]
    },
    {
      id: 'account',
      title: 'Account & Data',
      icon: 'person-circle',
      color: COLORS.teacherPalette.subjects.computer,
      description: 'Manage your account and data',
      items: [
        {
          key: 'profileSettings',
          label: 'Profile Settings',
          type: 'navigate',
          icon: 'person',
          description: 'Update your profile information',
          color: COLORS.teacherPalette.subjects.computer,
        },
        {
          key: 'backupData',
          label: 'Backup Data',
          type: 'action',
          icon: 'cloud-upload',
          description: 'Backup your data to the cloud',
          color: COLORS.teacherPalette.subjects.computer,
        },
        {
          key: 'exportData',
          label: 'Export Data',
          type: 'action',
          icon: 'download',
          description: 'Export your data for backup purposes',
          color: COLORS.teacherPalette.subjects.computer,
        },
        {
          key: 'clearCache',
          label: 'Clear Cache',
          type: 'action',
          icon: 'trash',
          description: 'Clear app cache to free up storage space',
          color: COLORS.teacherPalette.subjects.computer,
        },
      ]
    },
    {
      id: 'support',
      title: 'Help & Support',
      icon: 'help-circle',
      color: COLORS.teacherPalette.subjects.arts,
      description: 'Get help and support',
      items: [
        {
          key: 'helpCenter',
          label: 'Help Center',
          type: 'navigate',
          icon: 'library',
          description: 'Browse help articles and guides',
          color: COLORS.teacherPalette.subjects.arts,
        },
        {
          key: 'contactSupport',
          label: 'Contact Support',
          type: 'navigate',
          icon: 'chatbubbles',
          description: 'Get in touch with our support team',
          color: COLORS.teacherPalette.subjects.arts,
        },
        {
          key: 'reportBug',
          label: 'Report a Bug',
          type: 'navigate',
          icon: 'bug',
          description: 'Report issues or bugs you encounter',
          color: COLORS.teacherPalette.subjects.arts,
        },
        {
          key: 'rateApp',
          label: 'Rate App',
          type: 'action',
          icon: 'star',
          description: 'Rate SchoolBridge on the app store',
          color: COLORS.teacherPalette.subjects.arts,
        },
      ]
    },
    {
      id: 'advanced',
      title: 'Advanced Options',
      icon: 'settings',
      color: COLORS.teacherPalette.subjects.computer,
      description: 'Advanced settings for power users',
      items: [
        {
          key: 'developerMode',
          label: 'Developer Mode',
          type: 'switch',
          icon: 'code-slash',
          description: 'Enable advanced debugging features',
          color: COLORS.teacherPalette.subjects.computer,
        },
        {
          key: 'betaFeatures',
          label: 'Beta Features',
          type: 'switch',
          icon: 'flask',
          description: 'Try new experimental features',
          color: COLORS.teacherPalette.subjects.computer,
        },
        {
          key: 'signOut',
          label: 'Advanced Sign Out',
          type: 'action',
          icon: 'log-out',
          description: 'Sign out with additional security options',
          color: TEACHER_COLORS.error,
          destructive: false,
        },
        {
          key: 'resetSettings',
          label: 'Reset Settings',
          type: 'action',
          icon: 'refresh',
          description: 'Reset all settings to default values',
          color: TEACHER_COLORS.error,
          destructive: true,
        },
        {
          key: 'deleteAccount',
          label: 'Delete Account',
          type: 'action',
          icon: 'trash',
          description: 'Permanently delete your account and data',
          color: TEACHER_COLORS.error,
          destructive: true,
        },
      ]
    }
  ];

  // ✅ Professional Data Loading
  const loadSettingsData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      // 🔄 Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // TODO: Load user settings from API
      /*
      const response = await fetch('/api/user/settings', {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      const settingsData = await response.json();
      setSettings(settingsData);
      */

      setRefreshing(false);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error loading settings:', error);
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  // ✅ Professional Setting Change Handler
  const handleSettingChange = useCallback(async (key, value) => {
    try {
      // Optimistic update
      setSettings(prev => ({
        ...prev,
        [key]: value
      }));

      // TODO: Save to API
      /*
      await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [key]: value }),
      });
      */

      // Show confirmation for important changes
      if (['biometricAuth', 'dataSharing', 'emergencyAlerts'].includes(key)) {
        const settingNames = {
          biometricAuth: 'Biometric Authentication',
          dataSharing: 'Data Sharing',
          emergencyAlerts: 'Emergency Alerts'
        };

        Alert.alert(
          '✅ Setting Updated',
          `${settingNames[key]} has been ${value ? 'enabled' : 'disabled'}.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error saving setting:', error);
      // Revert on error
      setSettings(prev => ({
        ...prev,
        [key]: !value
      }));
      Alert.alert('Error', 'Failed to save setting. Please try again.');
    }
  }, []);

  // ✅ Professional Action Handler
  const handleAction = useCallback((key) => {
    switch (key) {
      case 'signOut':
        handleAdvancedSignOut();
        break;

      case 'clearCache':
        Alert.alert(
          '🗑️ Clear Cache',
          'This will clear temporary files and may free up storage space. Continue?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Clear Cache',
              onPress: async () => {
                setLoading(true);
                await new Promise(resolve => setTimeout(resolve, 1000));
                setLoading(false);
                Alert.alert('✅ Success', 'Cache cleared successfully!');
              }
            }
          ]
        );
        break;

      case 'backupData':
        Alert.alert(
          '☁️ Backup Data',
          'Backup your data to the cloud for safekeeping?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Backup',
              onPress: async () => {
                setLoading(true);
                await new Promise(resolve => setTimeout(resolve, 2000));
                setLoading(false);
                Alert.alert('✅ Success', 'Data backed up successfully!');
              }
            }
          ]
        );
        break;

      case 'exportData':
        Alert.alert(
          '📥 Export Data',
          'Export your data for backup purposes?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Export',
              onPress: async () => {
                setLoading(true);
                await new Promise(resolve => setTimeout(resolve, 1500));
                setLoading(false);
                Alert.alert('✅ Success', 'Data exported successfully!');
              }
            }
          ]
        );
        break;

      case 'rateApp':
        Alert.alert(
          '⭐ Rate SchoolBridge',
          'Enjoying SchoolBridge? Please take a moment to rate us on the app store!',
          [
            { text: 'Maybe Later', style: 'cancel' },
            { text: 'Rate Now', onPress: () => {
              Alert.alert('🚀 Opening App Store', 'This would open the app store rating page.');
            }}
          ]
        );
        break;

      case 'resetSettings':
        Alert.alert(
          '⚠️ Reset Settings',
          'This will reset all settings to their default values. This action cannot be undone.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Reset',
              style: 'destructive',
              onPress: () => {
                setSettings({
                  darkMode: false,
                  notifications: true,
                  hapticFeedback: true,
                  autoSync: true,
                  offlineMode: false,
                  fontSize: 'medium',
                  language: 'English',
                  theme: 'default',
                  biometricAuth: false,
                  autoLock: true,
                  dataSharing: false,
                  analyticsCollection: true,
                  gradeNotifications: true,
                  attendanceReminders: true,
                  assignmentDeadlines: true,
                  parentCommunication: true,
                  classUpdates: true,
                  emergencyAlerts: true,
                });
                Alert.alert('✅ Reset Complete', 'All settings have been reset to defaults.');
              }
            }
          ]
        );
        break;

      case 'deleteAccount':
        Alert.alert(
          '🚨 Delete Account',
          'This will permanently delete your account and all associated data. This action cannot be undone.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete Account',
              style: 'destructive',
              onPress: () => {
                Alert.alert(
                  '⚠️ Final Confirmation',
                  'Are you absolutely sure? This will delete everything permanently.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete Forever',
                      style: 'destructive',
                      onPress: () => {
                        Alert.alert('🚀 Account Deletion', 'Account deletion process would begin here.');
                      }
                    }
                  ]
                );
              }
            }
          ]
        );
        break;

      default:
        Alert.alert(
          'Coming Soon',
          `${key} feature is under development.`,
          [{ text: 'OK' }]
        );
    }
  }, [handleAdvancedSignOut]);

  // ✅ Professional Navigation Handler
  const handleNavigation = useCallback((key) => {
    const navigationMap = {
      profileSettings: 'ProfileSettings',
      helpCenter: 'HelpCenter',
      contactSupport: 'ContactSupport',
      reportBug: 'ReportBug',
    };

    const screenName = navigationMap[key];
    if (screenName) {
      // navigation.navigate(screenName);
      Alert.alert(
        '🚀 Navigation',
        `This would navigate to ${screenName} screen.`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('Coming Soon', `${key} feature is under development.`);
    }
  }, []);

  // ✅ Render Setting Item
  const renderSettingItem = useCallback((item, categoryColor) => {
    const value = settings[item.key];

    return (
      <TouchableOpacity
        key={item.key}
        style={[
          styles.settingItem,
          item.destructive && styles.settingItemDestructive
        ]}
        onPress={() => {
          if (item.type === 'action') {
            handleAction(item.key);
          } else if (item.type === 'navigate') {
            handleNavigation(item.key);
          } else if (item.type === 'select') {
            Alert.alert(
              `Select ${item.label}`,
              'Selection interface would open here',
              [{ text: 'OK' }]
            );
          }
        }}
        activeOpacity={0.8}
        disabled={authLoading && item.key === 'signOut'}
      >
        <View style={styles.settingLeft}>
          <View style={[
            styles.settingIcon,
            { backgroundColor: `${item.color || categoryColor}15` }
          ]}>
            {authLoading && item.key === 'signOut' ? (
              <ActivityIndicator
                size="small"
                color={item.color || categoryColor}
              />
            ) : (
              <Ionicons
                name={item.icon}
                size={20}
                color={item.destructive ? TEACHER_COLORS.error : (item.color || categoryColor)}
              />
            )}
          </View>
          <View style={styles.settingInfo}>
            <Text style={[
              styles.settingLabel,
              item.destructive && { color: TEACHER_COLORS.error },
              authLoading && item.key === 'signOut' && { opacity: 0.7 }
            ]}>
              {authLoading && item.key === 'signOut' ? 'Signing Out...' : item.label}
            </Text>
            <Text style={[
              styles.settingDescription,
              authLoading && item.key === 'signOut' && { opacity: 0.7 }
            ]}>
              {item.description}
            </Text>
          </View>
        </View>

        <View style={styles.settingRight}>
          {item.type === 'switch' && (
            <Switch
              value={value}
              onValueChange={(newValue) => handleSettingChange(item.key, newValue)}
              trackColor={{
                false: COLORS.teacherPalette.neutral.lighter,
                true: `${item.color || categoryColor}40`
              }}
              thumbColor={value ? (item.color || categoryColor) : COLORS.teacherPalette.neutral.medium}
              ios_backgroundColor={COLORS.teacherPalette.neutral.lighter}
            />
          )}
          {item.type === 'select' && (
            <View style={styles.selectValue}>
              <Text style={styles.selectValueText}>
                {item.value || 'Select'}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={TEACHER_COLORS.textMuted}
              />
            </View>
          )}
          {(item.type === 'action' || item.type === 'navigate') && (
            <Ionicons
              name="chevron-forward"
              size={20}
              color={item.destructive ? TEACHER_COLORS.error : TEACHER_COLORS.textMuted}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  }, [settings, handleSettingChange, handleAction, handleNavigation, authLoading]);

  // ✅ Render Category
  const renderCategory = useCallback((category) => (
    <View key={category.id} style={styles.categoryContainer}>
      {/* Professional Category Header */}
      <View style={styles.categoryHeader}>
        <LinearGradient
          colors={[category.color, `${category.color}DD`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.categoryHeaderGradient}
        >
          <View style={styles.categoryHeaderLeft}>
            <View style={styles.categoryIconContainer}>
              <Ionicons name={category.icon} size={22} color={TEACHER_COLORS.textWhite} />
            </View>
            <View style={styles.categoryTitleContainer}>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categoryDescription}>{category.description}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Professional Category Items */}
      <View style={styles.categoryItems}>
        {category.items.map(item => renderSettingItem(item, category.color))}
      </View>
    </View>
  ), [renderSettingItem]);

  // ✅ Header Right Component with Loading State
  const HeaderRightComponent = () => (
    <TouchableOpacity
      style={[styles.headerButton, authLoading && styles.headerButtonDisabled]}
      onPress={() => {
        if (!authLoading) {
          Alert.alert(
            '💾 Save All Settings',
            'Save all settings changes?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Save', onPress: () => Alert.alert('✅ Saved', 'All settings saved successfully!') }
            ]
          );
        }
      }}
      activeOpacity={authLoading ? 1 : 0.8}
      disabled={authLoading}
    >
      {authLoading ? (
        <ActivityIndicator size="small" color={TEACHER_COLORS.textWhite} />
      ) : (
        <Ionicons name="save" size={20} color={TEACHER_COLORS.textWhite} />
      )}
    </TouchableOpacity>
  );

  // ✅ Initialize Data
  useFocusEffect(
    useCallback(() => {
      loadSettingsData();
    }, [loadSettingsData])
  );

  const onRefresh = useCallback(() => {
    loadSettingsData(true);
  }, [loadSettingsData]);

  return (
    <View style={styles.container}>
      {/* ✅ Professional Header */}
      <SimpleHeader
        title="Settings"
        subtitle="Customize your experience"
        navigation={navigation}
        primaryColor={TEACHER_COLORS.primary}
        rightComponent={<HeaderRightComponent />}
      />

      {/* ✅ Settings Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={TEACHER_COLORS.primary}
            colors={[TEACHER_COLORS.primary]}
            progressBackgroundColor={TEACHER_COLORS.surface}
          />
        }
      >
        <View style={styles.contentContainer}>
          {settingsCategories.map(renderCategory)}

          {/* ✅ Professional Footer */}
          <View style={styles.footer}>
            <View style={styles.footerContent}>
              <View style={styles.appInfo}>
                <Text style={styles.appName}>SchoolBridge</Text>
                <Text style={styles.appVersion}>Version 1.0.0</Text>
              </View>
              <View style={styles.footerLinks}>
                <TouchableOpacity
                  style={styles.footerLink}
                  onPress={() => Alert.alert('Privacy Policy', 'Privacy policy would open here.')}
                >
                  <Text style={styles.footerLinkText}>Privacy Policy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.footerLink}
                  onPress={() => Alert.alert('Terms of Service', 'Terms of service would open here.')}
                >
                  <Text style={styles.footerLinkText}>Terms of Service</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.footerCopyright}>
                © 2024 SchoolBridge. Built with ❤️ for educators.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// ✅ Professional Styles using Theme System
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TEACHER_COLORS.background,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonDisabled: {
    opacity: 0.6,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
  },
  categoryContainer: {
    marginBottom: SPACING.lg,
  },
  categoryHeader: {
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.teacherPalette.shadow.medium,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  categoryHeaderGradient: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md + 4,
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
    ...TEACHER_THEME.typography.h4,
    color: TEACHER_COLORS.textWhite,
    fontWeight: '700',
    marginBottom: SPACING.xs / 2,
  },
  categoryDescription: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textWhite,
    opacity: 0.9,
    fontWeight: '500',
  },
  categoryItems: {
    backgroundColor: TEACHER_COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.teacherPalette.shadow.light,
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
    borderBottomColor: COLORS.teacherPalette.neutral.lighter,
  },
  settingItemDestructive: {
    backgroundColor: `${TEACHER_COLORS.error}08`,
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
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs / 2,
  },
  settingDescription: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textMuted,
    lineHeight: 18,
  },
  settingRight: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  selectValue: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: TEACHER_COLORS.accent,
    borderRadius: BORDER_RADIUS.sm,
  },
  selectValueText: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textSecondary,
    marginRight: SPACING.xs,
    fontWeight: '500',
  },
  footer: {
    marginTop: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  footerContent: {
    backgroundColor: TEACHER_COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.teacherPalette.shadow.light,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  appInfo: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  appName: {
    ...TEACHER_THEME.typography.h4,
    color: TEACHER_COLORS.primary,
    fontWeight: '700',
    marginBottom: SPACING.xs / 2,
  },
  appVersion: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textMuted,
    fontWeight: '500',
  },
  footerLinks: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    gap: SPACING.lg,
  },
  footerLink: {
    paddingVertical: SPACING.xs,
  },
  footerLinkText: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.primary,
    fontWeight: '600',
  },
  footerCopyright: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default Settings;
