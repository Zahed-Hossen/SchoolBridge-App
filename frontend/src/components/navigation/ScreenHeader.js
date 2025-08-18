import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// ✅ Import Teacher Theme
import {
  TEACHER_COLORS,
  COLORS,
  TEACHER_THEME,
  SPACING,
  BORDER_RADIUS,
} from '../../constants/theme';

const ScreenHeader = ({
  title,
  primaryColor = TEACHER_COLORS.primary,
  showBackButton = false,
  onBackPress,
  rightComponent = null,
  headerStyle = {},
  titleStyle = {},
  backButtonStyle = {},
  // gradientColors = [primaryColor, `${primaryColor}DD`, `${primaryColor}BB`],
}) => {
  const insets = useSafeAreaInsets();

  return (
    <>
      {/* ✅ Professional Status Bar */}
      <StatusBar
        backgroundColor={primaryColor}
        barStyle="light-content"
        translucent={Platform.OS === 'android'}
      />

      {/* ✅ Professional Header with Theme Gradient */}
      <LinearGradient
        colors={[primaryColor, `${primaryColor}DD`, `${primaryColor}BB`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.container,
          {
            paddingTop: insets.top + SPACING.md,
            paddingBottom: SPACING.lg - 4,
          },
          headerStyle,
        ]}
      >
        <View style={styles.headerContent}>
          {/* Left - Back Button (if needed) */}
          {showBackButton && (
            <TouchableOpacity
              style={[styles.backButton, backButtonStyle]}
              onPress={onBackPress}
              activeOpacity={0.7}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={TEACHER_COLORS.textWhite}
              />
            </TouchableOpacity>
          )}

          {/* Center - Title */}
          <View
            style={[
              styles.titleContainer,
              !showBackButton && styles.titleCentered,
            ]}
          >
            <Text style={[styles.screenTitle, titleStyle]}>{title}</Text>
          </View>

          {/* Right - Custom Component */}
          {rightComponent && (
            <View style={styles.rightComponent}>{rightComponent}</View>
          )}
        </View>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    minHeight: 44,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.teacherPalette.overlay.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm + 4,
  },
  titleContainer: {
    flex: 1,
  },
  titleCentered: {
    alignItems: 'center',
  },
  screenTitle: {
    ...TEACHER_THEME.typography.h3,
    color: TEACHER_COLORS.textWhite,
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: COLORS.teacherPalette.shadow.dark,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  rightComponent: {
    marginLeft: SPACING.sm + 4,
  },
});

export default ScreenHeader;
