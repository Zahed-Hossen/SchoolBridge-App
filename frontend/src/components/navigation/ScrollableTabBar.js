import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  Vibration,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

const ScrollableTabBar = ({
  state,
  descriptors,
  navigation,
  theme = {},
  config = {},
  badges = {},
  customIcons = {},
  customLabels = {},
  onTabPress = null,
  enableHaptics = true,
  enableAnimations = true,
  style = {},
}) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [lastScrollX, setLastScrollX] = useState(0);
  const scrollTimeoutRef = useRef(null);

  // ✅ Smooth Animations with Reduced Conflicts
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const elasticAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // ✅ Interactive Theme Configuration
  const themeConfig = useMemo(() => ({
    primaryColor: theme.primaryColor || '#2563EB',
    backgroundColor: theme.backgroundColor || '#FFFFFF',
    textColor: theme.textColor || '#1F2937',
    inactiveColor: theme.inactiveColor || '#9CA3AF',
    borderColor: theme.borderColor || '#E5E7EB',
    shadowColor: theme.shadowColor || '#000000',
    surfaceColor: theme.surfaceColor || '#F8FAFC',
    accentColor: theme.accentColor || '#3B82F6',
    ...theme,
  }), [theme]);

  // ✅ Optimized Configuration for Smooth Scrolling
  const tabBarConfig = useMemo(() => {
    const tabCount = state?.routes?.length || 0;
    const defaultConfig = {
      maxVisibleTabs: 4,
      tabWidth: 100,
      minTabWidth: 75,
      spacing: 2,
      padding: 8,
      height: 68,
      borderRadius: 12,
      iconSize: { focused: 24, unfocused: 20 },
      fontSize: { focused: 10, unfocused: 9 },
      elasticScale: 1.08,
      // ✅ Fixed scrolling parameters
      scrollDamping: 0.985,
      scrollThreshold: 2,
    };

    const mergedConfig = { ...defaultConfig, ...config };
    const shouldScroll = tabCount > mergedConfig.maxVisibleTabs;
    const calculatedTabWidth = shouldScroll ?
      mergedConfig.tabWidth :
      Math.max((screenWidth - (mergedConfig.padding * 2)) / tabCount, mergedConfig.minTabWidth);

    return {
      ...mergedConfig,
      tabCount,
      shouldScroll,
      tabWidth: calculatedTabWidth,
    };
  }, [state?.routes?.length, config, screenWidth]);

  // ✅ Early return with clean error handling
  if (!state || !navigation || !state.routes || tabBarConfig.tabCount === 0) {
    return null;
  }

  // ✅ Smooth Auto-scroll without Conflicts
  useEffect(() => {
    if (!tabBarConfig.shouldScroll || !scrollViewRef.current || state.index === undefined) {
      return;
    }

    const tabSpacing = tabBarConfig.tabWidth + tabBarConfig.spacing;
    const targetX = Math.max(0,
      Math.min(
        state.index * tabSpacing - (screenWidth / 2) + (tabBarConfig.tabWidth / 2),
        (tabBarConfig.tabCount * tabSpacing) - screenWidth + 20
      )
    );

    // ✅ Smooth scroll without animation conflicts
    const scrollToTarget = () => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          x: targetX,
          animated: true,
        });
      }
    };

    // ✅ Delay to prevent conflicts
    setTimeout(scrollToTarget, 50);

    // ✅ Selection glow animation
    if (enableAnimations) {
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
      });
    }

  }, [state.index, tabBarConfig, enableAnimations]);

  // ✅ Enhanced Tab Press with Clean Animation
  const handleTabPress = useCallback((route, index) => {
    if (state.index === index) {
      // ✅ Double-tap animation
      if (enableAnimations) {
        Animated.sequence([
          Animated.spring(elasticAnim, {
            toValue: 1.15,
            tension: 200,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.spring(elasticAnim, {
            toValue: 1,
            tension: 200,
            friction: 7,
            useNativeDriver: true,
          }),
        ]).start();
      }
      return;
    }

    if (onTabPress && typeof onTabPress === 'function') {
      const shouldContinue = onTabPress(route, index, state);
      if (shouldContinue === false) return;
    }

    // ✅ Haptic feedback
    if (enableHaptics) {
      try {
        if (Platform.OS === 'ios') {
          Vibration.vibrate([30, 20, 30]);
        } else {
          Vibration.vibrate([40, 30, 40]);
        }
      } catch (error) {
        // Silent fail
      }
    }

    // ✅ Clean press animation
    if (enableAnimations) {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        tension: 300,
        friction: 8,
        useNativeDriver: true,
      }).start(() => {
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 300,
          friction: 8,
          useNativeDriver: true,
        }).start();
      });
    }

    navigation.navigate(route.name);
  }, [state.index, navigation, onTabPress, enableHaptics, enableAnimations, scaleAnim, elasticAnim]);

  // ✅ Fixed Scroll Handling - No More Trembling
  const handleScroll = useCallback((event) => {
    const { contentOffset, velocity } = event.nativeEvent;
    const currentX = contentOffset.x;
    const currentVelocity = velocity?.x || 0;

    // ✅ Only update if significant movement
    if (Math.abs(currentX - lastScrollX) > tabBarConfig.scrollThreshold) {
      setLastScrollX(currentX);
      setScrollVelocity(Math.abs(currentVelocity));
      setIsScrolling(true);

      // ✅ Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // ✅ Set scrolling to false after movement stops
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        setScrollVelocity(0);
      }, 150);
    }
  }, [lastScrollX, tabBarConfig.scrollThreshold]);

  // ✅ Enhanced Icon System
  const getTabIcon = useCallback((routeName, isFocused) => {
    if (customIcons[routeName]) {
      const customIcon = customIcons[routeName];
      return {
        icon: isFocused ? (customIcon.focused || customIcon.icon) : (customIcon.unfocused || customIcon.icon),
        color: isFocused ? (customIcon.activeColor || themeConfig.primaryColor) : themeConfig.inactiveColor,
      };
    }

    const defaultIcons = {
      TeacherDashboard: { focused: 'home', unfocused: 'home-outline' },
      MyClasses: { focused: 'school', unfocused: 'school-outline' },
      TeacherAssignments: { focused: 'document-text', unfocused: 'document-text-outline' },
      Attendance: { focused: 'people', unfocused: 'people-outline' },
      GradingDashboard: { focused: 'star', unfocused: 'star-outline' },
      Analytics: { focused: 'analytics', unfocused: 'analytics-outline' },
      Settings: { focused: 'settings', unfocused: 'settings-outline' },
      Reports: { focused: 'document', unfocused: 'document-outline' },
    };

    const iconConfig = defaultIcons[routeName] || { focused: 'ellipse', unfocused: 'ellipse-outline' };

    return {
      icon: isFocused ? iconConfig.focused : iconConfig.unfocused,
      color: isFocused ? themeConfig.primaryColor : themeConfig.inactiveColor,
    };
  }, [customIcons, themeConfig]);

  // ✅ Clean Label System
  const getTabLabel = useCallback((routeName) => {
    if (customLabels[routeName]) {
      return customLabels[routeName];
    }

    const defaultLabels = {
      TeacherDashboard: 'Home',
      MyClasses: 'Classes',
      TeacherAssignments: 'Tasks',
      Attendance: 'Attendance',
      GradingDashboard: 'Grading',
      Analytics: 'Analytics',
      Settings: 'Settings',
      Reports: 'Reports',
    };

    return defaultLabels[routeName] || routeName.replace(/([A-Z])/g, ' $1').trim();
  }, [customLabels]);

  // ✅ Professional Badge System
  const getBadgeInfo = useCallback((routeName) => {
    return badges[routeName] || null;
  }, [badges]);

  // ✅ Smooth Tab Rendering without Conflicts
  const renderTab = useCallback((route, index) => {
    const isFocused = state.index === index;
    const iconConfig = getTabIcon(route.name, isFocused);
    const badgeInfo = getBadgeInfo(route.name);
    const label = getTabLabel(route.name);

    return (
      <Animated.View
        key={route.key}
        style={[
          styles.tabWrapper,
          {
            width: tabBarConfig.tabWidth,
            transform: [
              { scale: isFocused ? elasticAnim : 1 },
            ]
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.tab,
            {
              backgroundColor: isFocused ?
                `${themeConfig.primaryColor}08` :
                'transparent',
              borderRadius: tabBarConfig.borderRadius,
              minHeight: tabBarConfig.height - 16,
              borderWidth: isFocused ? 1 : 0,
              borderColor: isFocused ?
                `${themeConfig.primaryColor}30` :
                'transparent',
              shadowColor: isFocused ? themeConfig.primaryColor : 'transparent',
              shadowOffset: { width: 0, height: isFocused ? 4 : 2 },
              shadowOpacity: isFocused ? 0.15 : 0.05,
              shadowRadius: isFocused ? 8 : 4,
              elevation: isFocused ? 6 : 2,
            }
          ]}
          onPress={() => handleTabPress(route, index)}
          activeOpacity={0.8}
          accessibilityRole="tab"
          accessibilityState={{ selected: isFocused }}
          accessibilityLabel={`${label} tab`}
        >
          {/* ✅ Icon Container with Smooth Glow */}
          <Animated.View style={[
            styles.iconContainer,
            {
              transform: [
                {
                  scale: isFocused && enableAnimations ?
                    glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.1],
                    }) : 1
                }
              ]
            }
          ]}>
            {/* ✅ Clean glow background */}
            {isFocused && enableAnimations && (
              <Animated.View style={[
                styles.iconGlow,
                {
                  backgroundColor: themeConfig.primaryColor,
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.12],
                  }),
                  transform: [{
                    scale: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.3],
                    })
                  }]
                }
              ]} />
            )}

            <Ionicons
              name={iconConfig.icon}
              size={isFocused ? tabBarConfig.iconSize.focused : tabBarConfig.iconSize.unfocused}
              color={iconConfig.color}
            />

            {/* ✅ Smooth Pulsing Badge */}
            {badgeInfo && (
              <Animated.View style={[
                styles.badge,
                {
                  backgroundColor: badgeInfo.color || themeConfig.primaryColor,
                  transform: [
                    {
                      scale: enableAnimations && badgeInfo.pulse ?
                        pulseAnim.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [1, 1.15, 1],
                        }) : 1
                    }
                  ],
                }
              ]}>
                <Text style={styles.badgeText}>
                  {badgeInfo.count > 99 ? '99+' : badgeInfo.count}
                </Text>
              </Animated.View>
            )}
          </Animated.View>

          {/* ✅ Smooth Label Scaling */}
          <Animated.Text
            style={[
              styles.label,
              {
                color: iconConfig.color,
                fontWeight: isFocused ? '700' : '500',
                fontSize: isFocused ? tabBarConfig.fontSize.focused : tabBarConfig.fontSize.unfocused,
                transform: [{
                  scale: isFocused && enableAnimations ?
                    glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.04],
                    }) : 1
                }],
              }
            ]}
            numberOfLines={1}
          >
            {label}
          </Animated.Text>

          {/* ✅ Clean Active Indicator */}
          {isFocused && (
            <Animated.View style={[
              styles.activeIndicator,
              {
                backgroundColor: themeConfig.primaryColor,
                transform: enableAnimations ? [
                  {
                    scaleX: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2],
                    })
                  }
                ] : [],
              }
            ]} />
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }, [
    state.index,
    tabBarConfig,
    getTabIcon,
    getBadgeInfo,
    getTabLabel,
    handleTabPress,
    enableAnimations,
    pulseAnim,
    elasticAnim,
    glowAnim,
    themeConfig
  ]);

  // ✅ Smooth Badge Pulse Animation
  useEffect(() => {
    if (!enableAnimations) return;

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, [enableAnimations, pulseAnim]);

  // ✅ Cleanup animations and timeouts
  useEffect(() => {
    return () => {
      [scaleAnim, pulseAnim, elasticAnim, glowAnim].forEach(anim => {
        anim.stopAnimation();
      });
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Animated.View style={[
      styles.container,
      {
        backgroundColor: themeConfig.backgroundColor,
        borderTopColor: themeConfig.borderColor,
        minHeight: tabBarConfig.height,
        paddingBottom: Math.max(insets.bottom, 4),
        transform: enableAnimations ? [{ scale: scaleAnim }] : [],
      },
      style,
    ]}>
      {/* ✅ Clean Top Border */}
      <View style={[
        styles.topBorder,
        {
          backgroundColor: themeConfig.primaryColor,
          opacity: isScrolling ? 0.3 : 0.1,
          height: isScrolling ? 2 : 1,
        }
      ]} />

      {/* ✅ Smooth Scroll Container - Fixed Trembling */}
      <ScrollView
        ref={scrollViewRef}
        horizontal={tabBarConfig.shouldScroll}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: tabBarConfig.padding,
            minHeight: tabBarConfig.height - 8,
          },
          !tabBarConfig.shouldScroll && styles.centeredContent,
        ]}
        onScroll={handleScroll}
        scrollEventThrottle={16} // Reduced frequency for stability
        bounces={true}
        scrollEnabled={tabBarConfig.shouldScroll}
        decelerationRate={tabBarConfig.scrollDamping}
        directionalLockEnabled={true}
        style={styles.scrollView}
        contentInsetAdjustmentBehavior="automatic"
        automaticallyAdjustContentInsets={false}
        removeClippedSubviews={false}
        pagingEnabled={false}
        // ✅ Removed conflicting scroll properties
        overScrollMode="auto"
        alwaysBounceHorizontal={false}
        scrollsToTop={false}
      >
        {state.routes.map((route, index) => renderTab(route, index))}
        {tabBarConfig.shouldScroll && <View style={{ width: 12 }} />}
      </ScrollView>

      {/* ✅ Clean Scroll Indicator */}
      {tabBarConfig.shouldScroll && isScrolling && (
        <View style={[
          styles.scrollIndicator,
          {
            backgroundColor: themeConfig.primaryColor,
            opacity: 0.6,
          }
        ]} />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  topBorder: {
    height: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'space-evenly',
  },
  tabWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 1,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 3,
    height: 28,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 22,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  label: {
    textAlign: 'center',
    lineHeight: 11,
    marginTop: 2,
    letterSpacing: 0.1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 2,
    left: '20%',
    right: '20%',
    height: 3,
    borderRadius: 2,
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '40%',
    right: '40%',
    height: 2,
    borderRadius: 1,
  },
});

export default React.memo(ScrollableTabBar);
