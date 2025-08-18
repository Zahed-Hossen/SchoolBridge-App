import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, Dimensions } from 'react-native';
import PermissionToggle from '../../components/SuperAdmin/PermissionToggle';
import { BASE_THEME } from '../../constants/theme';
import SimpleHeader from '../../components/navigation/SimpleHeader';

const RoleMatrixScreen = ({ navigation }) => {
  const styles = getStyles();

  const features = [
    'Attendance',
    'Grades',
    'Library',
    'Payments',
    'Announcements',
    'Settings',
  ];
  const roles = ['Admin', 'Teacher', 'Student', 'Parent'];

  const [permissions, setPermissions] = useState(() => {
    const initialPermissions = {};
    roles.forEach((role) => {
      features.forEach((feature) => {
        initialPermissions[`${role}_${feature}`] = Math.random() > 0.5;
      });
    });
    return initialPermissions;
  });

  const togglePermission = (role, feature) => {
    setPermissions((prev) => ({
      ...prev,
      [`${role}_${feature}`]: !prev[`${role}_${feature}`],
    }));
  };

  const cellWidth =
    (Dimensions.get('window').width - BASE_THEME.spacing.xl - 100) /
    features.length;

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.headerWrapper}>
        <SimpleHeader
          title="Role Matrix"
          userRole="Admin"
          navigation={navigation}
          primaryColor="#2563EB"
          style={{ alignItems: 'center', justifyContent: 'center' }}
        />
      </View>
      {/* Content below header, with enough padding to avoid overlap */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 80 }}
      >
        <View>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={[styles.headerCell, { width: 100 }]}>
              <Text style={styles.headerText}>Role \ Feature</Text>
            </View>
            {features.map((feature) => (
              <View
                key={feature}
                style={[styles.headerCell, { width: cellWidth }]}
              >
                <Text style={styles.headerText} numberOfLines={2}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>

          {/* Data Rows */}
          {roles.map((role) => (
            <View key={role} style={styles.dataRow}>
              <View style={[styles.roleCell, { width: 100 }]}>
                <Text style={styles.roleText}>{role}</Text>
              </View>
              {features.map((feature) => (
                <View key={feature} style={[styles.cell, { width: cellWidth }]}>
                  <PermissionToggle
                    isActive={permissions[`${role}_${feature}`]}
                    onToggle={() => togglePermission(role, feature)}
                  />
                </View>
              ))}
            </View>
          ))}
        </View>
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
    headerRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#D1D5DB',
      paddingBottom: BASE_THEME.spacing.sm,
      marginBottom: BASE_THEME.spacing.sm,
    },
    headerCell: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: BASE_THEME.spacing.xs,
    },
    headerText: {
      fontWeight: BASE_THEME.fonts.weights.bold,
      color: BASE_THEME.colors.text.primary,
      textAlign: 'center',
      fontSize: BASE_THEME.fonts.sizes.body3,
    },
    dataRow: {
      flexDirection: 'row',
      paddingVertical: BASE_THEME.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: '#D1D5DB' + '50',
    },
    roleCell: {
      justifyContent: 'center',
    },
    roleText: {
      fontWeight: BASE_THEME.fonts.weights.semiBold,
      color: BASE_THEME.colors.text.primary,
      fontSize: BASE_THEME.fonts.sizes.body2,
    },
    cell: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default RoleMatrixScreen;
