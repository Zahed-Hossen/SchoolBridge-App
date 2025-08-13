import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// ✅ Import Professional Theme System
import {
  COLORS,
  TEACHER_COLORS,
  TEACHER_THEME,
  SPACING,
  BORDER_RADIUS,
  getRoleColors
} from '../../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

const SimpleHeader = ({
  title,
  subtitle,
  navigation,
  primaryColor = TEACHER_COLORS.primary, // ✅ Use theme default
  onBackPress,
  rightAction,
  showShadow = true,
  style,
  userRole = 'Teacher', // ✅ Add role support
}) => {
  const insets = useSafeAreaInsets();
  const headerHeight = 65 + insets.top;

  // ✅ Get role-specific colors
  const roleColors = getRoleColors(userRole);
  const themeColor = roleColors.primary || primaryColor;

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  // ✅ Professional gradient colors using theme
  const gradientColors = [
    themeColor,
    `${themeColor}DD`, // Slight transparency
    `${themeColor}BB`, // More transparency
  ];

  return (
    <>
      {/* ✅ Professional Status Bar */}
      <StatusBar
        backgroundColor={themeColor}
        barStyle="light-content"
        translucent={Platform.OS === 'android'}
      />

      {/* ✅ Professional Header with Theme */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.container,
          {
            height: headerHeight,
            paddingTop: insets.top,
          },
          showShadow && styles.shadowStyle,
          style,
        ]}
      >
        {/* ✅ Professional Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <View style={styles.backButtonInner}>
            <Ionicons name="arrow-back" size={24} color={TEACHER_COLORS.textWhite} />
          </View>
        </TouchableOpacity>

        {/* ✅ Professional Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* ✅ Professional Right Action Section */}
        <View style={styles.rightSection}>
          {rightAction ? (
            <View style={styles.rightActionButton}>
              {rightAction}
            </View>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>

        {/* ✅ Professional Bottom Gradient */}
        <LinearGradient
          colors={['transparent', COLORS.teacherPalette.shadow.light]}
          style={styles.bottomGradient}
        />
      </LinearGradient>
    </>
  );
};

// ✅ Professional Styles using Theme System
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm + 4,
    position: 'relative',
  },
  shadowStyle: {
    ...Platform.select({
      ios: {
        shadowColor: COLORS.teacherPalette.shadow.dark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.teacherPalette.overlay.light,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  titleSection: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  title: {
    ...TEACHER_THEME.typography.h3,
    color: TEACHER_COLORS.textWhite,
    textAlign: 'center',
    letterSpacing: 0.3,
    textShadowColor: COLORS.teacherPalette.shadow.dark,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textWhite,
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  rightSection: {
    width: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rightActionButton: {
    borderRadius: 22,
    backgroundColor: COLORS.teacherPalette.overlay.light,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  placeholder: {
    width: 44,
    height: 44,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
});

export default SimpleHeader;
