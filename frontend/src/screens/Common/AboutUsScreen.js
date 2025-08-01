import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  Linking,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

const { width, height } = Dimensions.get('window');
const isTablet = width > 768;

// ✅ Interactive Card Component with Hover Effects
const InteractiveCard = ({ children, style, onPress, scaleValue = 0.98 }) => {
  const animatedValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(animatedValue, {
      toValue: scaleValue,
      useNativeDriver: true,
      tension: 150,
      friction: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 150,
      friction: 4,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale: animatedValue }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

// ✅ Floating Animation Component
const FloatingCard = ({ children, style, delay = 0 }) => {
  const floatValue = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const floating = Animated.loop(
      Animated.sequence([
        Animated.timing(floatValue, {
          toValue: 1,
          duration: 2000 + delay,
          useNativeDriver: true,
        }),
        Animated.timing(floatValue, {
          toValue: 0,
          duration: 2000 + delay,
          useNativeDriver: true,
        }),
      ])
    );
    floating.start();
    return () => floating.stop();
  }, []);

  const translateY = floatValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  });

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const AboutUsScreen = ({ navigation }) => {
  const handleButtonPress = (action) => {
    switch (action) {
      case 'revolution':
        navigation.navigate('SignUp');
        break;
      case 'learnMore':
        Linking.openURL('https://schoolbridge.com/about');
        break;
      case 'social-facebook':
        Linking.openURL('https://facebook.com/schoolbridge');
        break;
      case 'social-twitter':
        Linking.openURL('https://twitter.com/schoolbridge');
        break;
      case 'social-linkedin':
        Linking.openURL('https://linkedin.com/company/schoolbridge');
        break;
      default:
        break;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      {/* Enhanced Hero Section with Gradient */}
      <View style={styles.heroSection}>
        <Image
          source={require('../../../assets/teamWork.webp')}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(29, 57, 70, 0.8)', 'rgba(0, 170, 255, 0.6)']}
          style={styles.heroOverlay}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>About SchoolBridge</Text>
            <Text style={styles.heroSubtitle}>Transforming Education Through Innovation</Text>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>🌟 Trusted by 10,000+ Schools</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* ✅ Interactive Stats Cards with Floating Animation */}
      <View style={styles.statsContainer}>
        {[
          { number: '10K+', label: 'Schools', color: '#FF6B6B' },
          { number: '500K+', label: 'Students', color: '#4ECDC4' },
          { number: '50K+', label: 'Teachers', color: '#45B7D1' },
          { number: '98%', label: 'Satisfaction', color: '#96CEB4' }
        ].map((stat, index) => (
          <FloatingCard
            key={index}
            style={[styles.statCard, { borderTopColor: stat.color, borderTopWidth: 3 }]}
            delay={index * 200}
          >
            <InteractiveCard
              onPress={() => console.log(`Stat ${stat.label} pressed`)}
              scaleValue={0.95}
            >
              <View style={styles.statContent}>
                <Text style={[styles.statNumber, { color: stat.color }]}>{stat.number}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            </InteractiveCard>
          </FloatingCard>
        ))}
      </View>

      {/* Mission & Vision Section with Enhanced Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mission & Vision</Text>

        {/* ✅ Interactive Mission Card */}
        <InteractiveCard
          style={styles.missionCardWrapper}
          onPress={() => console.log('Mission pressed')}
        >
          <LinearGradient
            colors={['#E3F2FD', '#FFFFFF']}
            style={styles.missionCard}
          >
            <View style={styles.missionHeader}>
              <Text style={styles.missionIcon}>🎯</Text>
              <Text style={styles.missionTitle}>Our Mission</Text>
            </View>
            <Text style={styles.missionText}>
              Provide seamless tools to simplify school operations and elevate education through innovative technology solutions.
            </Text>
          </LinearGradient>
        </InteractiveCard>

        {/* ✅ Interactive Vision Card */}
        <InteractiveCard
          style={styles.missionCardWrapper}
          onPress={() => console.log('Vision pressed')}
        >
          <LinearGradient
            colors={['#F0F7FF', '#FFFFFF']}
            style={styles.missionCard}
          >
            <View style={styles.missionHeader}>
              <Text style={styles.missionIcon}>🔮</Text>
              <Text style={styles.missionTitle}>Our Vision</Text>
            </View>
            <Text style={styles.missionText}>
              To become the worldwide most trusted platform connecting schools through cutting-edge technology.
            </Text>
          </LinearGradient>
        </InteractiveCard>

        {/* ✅ FIXED: Interactive User Types Grid */}
        <Text style={styles.subSectionTitle}>Who We Serve</Text>
        <View style={styles.userGrid}>
          {[
            { icon: '👨‍👩‍👧‍👦', title: 'Parents', count: '200K+', color: '#FF6B6B' },
            { icon: '🎓', title: 'Students', count: '500K+', color: '#4ECDC4' },
            { icon: '👨‍🏫', title: 'Teachers', count: '50K+', color: '#45B7D1' },
            { icon: '👨‍💼', title: 'Admins', count: '10K+', color: '#96CEB4' }
          ].map((user, index) => (
            <View key={index} style={styles.userCardWrapper}>
              <InteractiveCard
                onPress={() => console.log(`${user.title} pressed`)}
                scaleValue={0.95}
              >
                <View style={[styles.userCard, { borderTopColor: user.color }]}>
                  <View style={[styles.userIconContainer, { backgroundColor: user.color + '20' }]}>
                    <Text style={styles.userIcon}>{user.icon}</Text>
                  </View>
                  <Text style={styles.userTitle}>{user.title}</Text>
                  <Text style={[styles.userCount, { color: user.color }]}>{user.count}</Text>
                </View>
              </InteractiveCard>
            </View>
          ))}
        </View>
      </View>

      {/* ✅ Interactive Journey Timeline */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Journey</Text>
        <View style={styles.timelineContainer}>
          {[
            { year: '2024', text: 'Founded with a vision to revolutionize school management', status: 'completed' },
            { year: '2025', text: 'Launched core features and mobile app', status: 'current' },
            { year: '2026', text: 'Reached 10,000+ schools globally', status: 'future' },
            { year: '2027', text: 'AI-powered features and 1M+ users goal', status: 'future' }
          ].map((item, index) => (
            <InteractiveCard
              key={index}
              style={styles.timelineItemWrapper}
              onPress={() => console.log(`Timeline ${item.year} pressed`)}
              scaleValue={0.98}
            >
              <View style={styles.timelineItem}>
                <View style={[
                  styles.timelineDot,
                  item.status === 'completed' && styles.timelineDotCompleted,
                  item.status === 'current' && styles.timelineDotCurrent,
                  item.status === 'future' && styles.timelineDotFuture
                ]} />
                <View style={styles.timelineContent}>
                  <View style={styles.timelineHeader}>
                    <Text style={styles.timelineYear}>{item.year}</Text>
                    {item.status === 'current' && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>Current</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.timelineText}>{item.text}</Text>
                </View>
              </View>
            </InteractiveCard>
          ))}
        </View>
      </View>

      {/* ✅ FIXED: Interactive Values Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Core Values</Text>
        <View style={styles.valuesGrid}>
          {[
            { icon: '💡', title: 'Innovation', desc: 'Cutting-edge technology for modern education', color: '#FFD93D' },
            { icon: '🤝', title: 'Collaboration', desc: 'Working together for better outcomes', color: '#6BCF7F' },
            { icon: '🔍', title: 'Transparency', desc: 'Clear and honest communication', color: '#4D96FF' },
            { icon: '❤️', title: 'Empathy', desc: 'Understanding user needs deeply', color: '#FF6B9D' }
          ].map((value, index) => (
            <View key={index} style={styles.valueCardWrapper}>
              <InteractiveCard
                onPress={() => console.log(`Value ${value.title} pressed`)}
                scaleValue={0.96}
              >
                <View style={[styles.valueCard, { borderLeftColor: value.color }]}>
                  <View style={[styles.valueIconContainer, { backgroundColor: value.color + '20' }]}>
                    <Text style={styles.valueIcon}>{value.icon}</Text>
                  </View>
                  <Text style={styles.valueTitle}>{value.title}</Text>
                  <Text style={styles.valueDescription}>{value.desc}</Text>
                </View>
              </InteractiveCard>
            </View>
          ))}
        </View>
      </View>

      {/* ✅ Interactive Benefits Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Benefits for Everyone</Text>
        {[
          { icon: '👨‍👩‍👧‍👦', title: 'Parents', benefits: ['Real-time progress tracking', 'Event notifications', 'Direct teacher communication'], color: '#FF6B6B' },
          { icon: '🎓', title: 'Students', benefits: ['Easy assignment access', 'Grade monitoring', 'Interactive learning tools'], color: '#4ECDC4' },
          { icon: '👨‍🏫', title: 'Teachers', benefits: ['Streamlined classroom management', 'Efficient grading', 'Parent communication'], color: '#45B7D1' },
          { icon: '👨‍💼', title: 'Admins', benefits: ['Comprehensive analytics', 'System oversight', 'Data-driven insights'], color: '#96CEB4' }
        ].map((benefit, index) => (
          <InteractiveCard
            key={index}
            style={styles.benefitCardWrapper}
            onPress={() => console.log(`Benefit ${benefit.title} pressed`)}
            scaleValue={0.98}
          >
            <View style={[styles.benefitCard, { borderLeftColor: benefit.color }]}>
              <View style={styles.benefitHeader}>
                <View style={[styles.benefitIconContainer, { backgroundColor: benefit.color + '20' }]}>
                  <Text style={styles.benefitIcon}>{benefit.icon}</Text>
                </View>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
              </View>
              <View style={styles.benefitsList}>
                {benefit.benefits.map((item, idx) => (
                  <View key={idx} style={styles.benefitItem}>
                    <Text style={[styles.benefitBullet, { color: benefit.color }]}>✓</Text>
                    <Text style={styles.benefitText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          </InteractiveCard>
        ))}
      </View>

      {/* ✅ Interactive Testimonials */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What Users Say</Text>
        {[
          { icon: '👨‍👩‍👧‍👦', text: "SchoolBridge keeps me updated and engaged with my child's education like never before.", author: 'Sarah Johnson', role: 'Parent', rating: 5, color: '#FF6B6B' },
          { icon: '🎓', text: "Easy access to assignments and clear communication with teachers. Love it!", author: 'Alex Chen', role: 'Student', rating: 5, color: '#4ECDC4' },
          { icon: '👨‍🏫', text: "Simplified communication and efficient classroom management. Highly recommended!", author: 'Dr. Emily Davis', role: 'Teacher', rating: 5, color: '#45B7D1' }
        ].map((testimonial, index) => (
          <InteractiveCard
            key={index}
            style={styles.testimonialCardWrapper}
            onPress={() => console.log(`Testimonial ${testimonial.author} pressed`)}
            scaleValue={0.98}
          >
            <LinearGradient
              colors={['#FFFFFF', '#F8F9FA']}
              style={[styles.testimonialCard, { borderLeftColor: testimonial.color }]}
            >
              <View style={styles.testimonialHeader}>
                <View style={[styles.testimonialIconContainer, { backgroundColor: testimonial.color + '20' }]}>
                  <Text style={styles.testimonialIcon}>{testimonial.icon}</Text>
                </View>
                <View style={styles.testimonialInfo}>
                  <Text style={styles.testimonialAuthor}>{testimonial.author}</Text>
                  <Text style={styles.testimonialRole}>{testimonial.role}</Text>
                </View>
                <View style={styles.ratingContainer}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Text key={i} style={styles.star}>⭐</Text>
                  ))}
                </View>
              </View>
              <Text style={styles.testimonialText}>"{testimonial.text}"</Text>
            </LinearGradient>
          </InteractiveCard>
        ))}
      </View>

      {/* ✅ Interactive Call to Action */}
      <View style={styles.ctaSection}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.ctaContainer}
        >
          <Text style={styles.ctaTitle}>Ready to Transform Education?</Text>
          <Text style={styles.ctaSubtitle}>Join thousands of schools already using SchoolBridge</Text>

          <View style={styles.ctaButtons}>
            <InteractiveCard
              style={styles.primaryButtonWrapper}
              onPress={() => handleButtonPress('revolution')}
              scaleValue={0.96}
            >
              <LinearGradient
                colors={['#FF6B6B', '#FF8E8E']}
                style={styles.buttonGradient}
              >
                <Text style={styles.primaryButtonText}>🚀 Get Started Free</Text>
              </LinearGradient>
            </InteractiveCard>

            <InteractiveCard
              style={styles.secondaryButton}
              onPress={() => handleButtonPress('learnMore')}
              scaleValue={0.96}
            >
              <Text style={styles.secondaryButtonText}>📖 Learn More</Text>
            </InteractiveCard>
          </View>
        </LinearGradient>
      </View>

      {/* ✅ Interactive Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerTitle}>Stay Connected</Text>
        <View style={styles.socialRow}>
          {[
            { icon: '📘', name: 'Facebook', action: 'social-facebook', color: '#3B5998' },
            { icon: '🐦', name: 'Twitter', action: 'social-twitter', color: '#1DA1F2' },
            { icon: '💼', name: 'LinkedIn', action: 'social-linkedin', color: '#0077B5' }
          ].map((social, index) => (
            <InteractiveCard
              key={index}
              style={[styles.socialButton, { borderColor: social.color + '30' }]}
              onPress={() => handleButtonPress(social.action)}
              scaleValue={0.94}
            >
              <View style={styles.socialButtonContent}>
                <Text style={styles.socialIcon}>{social.icon}</Text>
                <Text style={[styles.socialText, { color: social.color }]}>{social.name}</Text>
              </View>
            </InteractiveCard>
          ))}
        </View>
        <Text style={styles.footerText}>© 2024 SchoolBridge. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },

  // Hero Section
  heroSection: {
    height: height * 0.35,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  heroSubtitle: {
    fontSize: isTablet ? 20 : 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.95,
  },
  heroBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // ✅ Stats Cards
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginTop: -30,
    marginBottom: 20,
    zIndex: 10,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    minWidth: (width - 80) / 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    borderTopWidth: 3,
  },
  statContent: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Section Styles
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 24,
    textAlign: 'center',
  },
  subSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
    marginTop: 28,
    marginBottom: 20,
    textAlign: 'center',
  },

  // Mission Cards
  missionCardWrapper: {
    marginBottom: 16,
  },
  missionCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 170, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  missionIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  missionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A202C',
  },
  missionText: {
    fontSize: 16,
    color: '#4A5568',
    lineHeight: 26,
  },

  // ✅ FIXED: User Grid
  userGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  userCardWrapper: {
    width: isTablet ? '23%' : '48%',
    marginBottom: 16,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 140,
    justifyContent: 'center',
  },
  userIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  userIcon: {
    fontSize: 24,
  },
  userTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 4,
    textAlign: 'center',
  },
  userCount: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Timeline
  timelineContainer: {
    paddingLeft: 20,
  },
  timelineItemWrapper: {
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E2E8F0',
  },
  timelineDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 16,
    marginTop: 4,
  },
  timelineDotCompleted: {
    backgroundColor: '#48BB78',
    shadowColor: '#48BB78',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  timelineDotCurrent: {
    backgroundColor: '#00AAFF',
    shadowColor: '#00AAFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  timelineDotFuture: {
    backgroundColor: '#CBD5E0',
  },
  timelineContent: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  timelineYear: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00AAFF',
    marginRight: 12,
  },
  currentBadge: {
    backgroundColor: '#00AAFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  timelineText: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 22,
  },

  // ✅ FIXED: Values Grid
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  valueCardWrapper: {
    width: isTablet ? '48%' : '100%',
    marginBottom: 16,
  },
  valueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 160,
  },
  valueIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  valueIcon: {
    fontSize: 24,
  },
  valueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 8,
  },
  valueDescription: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },

  // Benefits
  benefitCardWrapper: {
    marginBottom: 16,
  },
  benefitCard: {
    backgroundColor: '#F7FAFC',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  benefitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  benefitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  benefitIcon: {
    fontSize: 24,
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A202C',
  },
  benefitsList: {
    marginLeft: 64,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitBullet: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#4A5568',
    flex: 1,
    lineHeight: 20,
  },

  // Testimonials
  testimonialCardWrapper: {
    marginBottom: 16,
  },
  testimonialCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  testimonialIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  testimonialIcon: {
    fontSize: 20,
  },
  testimonialInfo: {
    flex: 1,
  },
  testimonialAuthor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
  },
  testimonialRole: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 14,
  },
  testimonialText: {
    fontSize: 14,
    color: '#4A5568',
    fontStyle: 'italic',
    lineHeight: 24,
  },

  // CTA Section
  ctaSection: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  ctaContainer: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  ctaTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.9,
  },
  ctaButtons: {
    width: '100%',
    gap: 16,
  },
  primaryButtonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Footer
  footer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  footerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 20,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  socialText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footerText: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
  },
});

export default AboutUsScreen;
