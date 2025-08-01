import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

const { width, height } = Dimensions.get('window');
const isTablet = width > 768;

// ✅ Interactive Card Component
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
          duration: 3000 + delay,
          useNativeDriver: true,
        }),
        Animated.timing(floatValue, {
          toValue: 0,
          duration: 3000 + delay,
          useNativeDriver: true,
        }),
      ])
    );
    floating.start();
    return () => floating.stop();
  }, []);

  const translateY = floatValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
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

const PrivacyScreen = ({ navigation }) => {
  const [expandedSection, setExpandedSection] = useState(null);

  const privacySections = [
    {
      id: 'information-collection',
      title: 'Information We Collect',
      icon: '📊',
      color: '#4ECDC4',
      content: `We collect information you provide directly to us, such as:

• Personal information (name, email, phone number)
• Educational data (grades, assignments, attendance)
• Communication data (messages, feedback)
• Usage data (how you interact with our app)
• Device information (browser type, operating system)

We only collect information that is necessary to provide our educational services and improve your experience.`,
    },
    {
      id: 'how-we-use',
      title: 'How We Use Your Information',
      icon: '⚙️',
      color: '#FF6B6B',
      content: `We use the collected information to:

• Provide and maintain our educational services
• Process transactions and send related information
• Send administrative information and updates
• Respond to your comments and questions
• Improve our services and user experience
• Comply with legal obligations
• Protect against fraudulent or illegal activity

We never sell your personal information to third parties.`,
    },
    {
      id: 'data-sharing',
      title: 'Information Sharing and Disclosure',
      icon: '🤝',
      color: '#9B59B6',
      content: `We may share your information only in the following circumstances:

• With your consent or at your direction
• With educational institutions you're affiliated with
• With service providers who assist in our operations
• To comply with laws, regulations, or legal requests
• To protect rights, property, or safety
• In connection with a merger or acquisition

We implement strict data protection measures with all third parties.`,
    },
    {
      id: 'data-security',
      title: 'Data Security',
      icon: '🔒',
      color: '#FFD93D',
      content: `We take data security seriously and implement:

• Industry-standard encryption (SSL/TLS)
• Regular security audits and monitoring
• Access controls and authentication measures
• Secure data storage and backup systems
• Employee training on data protection
• Incident response procedures

While we strive to protect your information, no security system is impenetrable.`,
    },
    {
      id: 'your-rights',
      title: 'Your Privacy Rights',
      icon: '⚖️',
      color: '#17A2B8',
      content: `You have the right to:

• Access your personal information
• Correct inaccurate information
• Delete your account and data
• Export your data in a portable format
• Opt-out of certain communications
• Restrict processing of your data
• File a complaint with supervisory authorities

Contact us to exercise any of these rights.`,
    },
    {
      id: 'children-privacy',
      title: 'Children\'s Privacy',
      icon: '👶',
      color: '#28A745',
      content: `We are committed to protecting children's privacy:

• We comply with COPPA (Children's Online Privacy Protection Act)
• We require parental consent for users under 13
• We limit data collection from minors
• Parents can review and delete their child's information
• We don't knowingly collect unnecessary personal information from children
• Educational data is protected under FERPA guidelines

Parents have full control over their child's privacy settings.`,
    },
    {
      id: 'cookies',
      title: 'Cookies and Tracking',
      icon: '🍪',
      color: '#DC3545',
      content: `We use cookies and similar technologies to:

• Remember your preferences and settings
• Analyze app usage and performance
• Provide personalized content
• Improve security and prevent fraud
• Enable essential app functionality

You can control cookie settings in your browser, but some features may not work properly if disabled.`,
    },
    {
      id: 'updates',
      title: 'Policy Updates',
      icon: '🔄',
      color: '#6C757D',
      content: `We may update this privacy policy to reflect:

• Changes in our services or practices
• Legal or regulatory requirements
• User feedback and improvements
• Industry best practices

We will notify you of significant changes via:
• Email notification
• In-app announcements
• Website notices

Continued use of our services indicates acceptance of updates.`,
    },
  ];

  const handleContactPrivacy = () => {
    Alert.alert(
      'Privacy Contact',
      'For privacy-related questions, please contact:\n\nprivacy@schoolbridge.com\n\nOr use our support form for detailed inquiries.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Contact Support', onPress: () => navigation.navigate('Support') },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      {/* ✅ Hero Section */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.heroSection}
      >
        <View style={styles.heroContent}>
          <Text style={styles.heroIcon}>🔒</Text>
          <Text style={styles.heroTitle}>Privacy Policy</Text>
          <Text style={styles.heroSubtitle}>
            Your privacy matters to us. Learn how we protect and use your information.
          </Text>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>Last Updated: January 2025</Text>
          </View>
        </View>
      </LinearGradient>

      {/* ✅ Quick Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>Privacy at a Glance</Text>
        <Text style={styles.sectionSubtitle}>Here's what you need to know</Text>

        <View style={styles.summaryGrid}>
          <FloatingCard style={styles.summaryCard} delay={0}>
            <Text style={styles.summaryIcon}>🛡️</Text>
            <Text style={styles.summaryTitle}>We Protect</Text>
            <Text style={styles.summaryText}>Your data with industry-leading security</Text>
          </FloatingCard>

          <FloatingCard style={styles.summaryCard} delay={100}>
            <Text style={styles.summaryIcon}>🚫</Text>
            <Text style={styles.summaryTitle}>We Don't Sell</Text>
            <Text style={styles.summaryText}>Your information to third parties</Text>
          </FloatingCard>

          <FloatingCard style={styles.summaryCard} delay={200}>
            <Text style={styles.summaryIcon}>✋</Text>
            <Text style={styles.summaryTitle}>You Control</Text>
            <Text style={styles.summaryText}>Your privacy settings and data</Text>
          </FloatingCard>

          <FloatingCard style={styles.summaryCard} delay={300}>
            <Text style={styles.summaryIcon}>📖</Text>
            <Text style={styles.summaryTitle}>Transparent</Text>
            <Text style={styles.summaryText}>Clear policies, no hidden terms</Text>
          </FloatingCard>
        </View>
      </View>

      {/* ✅ Privacy Sections */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detailed Privacy Information</Text>
        <Text style={styles.sectionSubtitle}>
          Tap any section below to learn more about our privacy practices
        </Text>

        {privacySections.map((section, index) => (
          <FloatingCard
            key={section.id}
            style={styles.privacyWrapper}
            delay={index * 50}
          >
            <InteractiveCard
              onPress={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
              scaleValue={0.98}
            >
              <LinearGradient
                colors={expandedSection === section.id ? [section.color + '15', '#FFFFFF'] : ['#FFFFFF', '#F8F9FA']}
                style={[styles.privacyCard, { borderLeftColor: section.color }]}
              >
                <View style={styles.privacyHeader}>
                  <View style={[styles.privacyIconContainer, { backgroundColor: section.color + '20' }]}>
                    <Text style={styles.privacyIcon}>{section.icon}</Text>
                  </View>
                  <Text style={styles.privacyTitle}>{section.title}</Text>
                  <Text style={[styles.privacyArrow, { color: section.color }]}>
                    {expandedSection === section.id ? '▼' : '▶'}
                  </Text>
                </View>
                {expandedSection === section.id && (
                  <Text style={styles.privacyContent}>{section.content}</Text>
                )}
              </LinearGradient>
            </InteractiveCard>
          </FloatingCard>
        ))}
      </View>

      {/* ✅ Contact Section */}
      <View style={styles.contactSection}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.contactContainer}
        >
          <Text style={styles.contactTitle}>Questions About Privacy?</Text>
          <Text style={styles.contactSubtitle}>
            Our privacy team is here to help you understand how we protect your information.
          </Text>

          <InteractiveCard
            style={styles.contactButton}
            onPress={handleContactPrivacy}
            scaleValue={0.96}
          >
            <LinearGradient
              colors={['#FFFFFF', '#F8F9FA']}
              style={styles.contactButtonGradient}
            >
              <Text style={styles.contactButtonIcon}>📧</Text>
              <Text style={styles.contactButtonText}>Contact Privacy Team</Text>
            </LinearGradient>
          </InteractiveCard>

          <View style={styles.contactInfo}>
            <Text style={styles.contactInfoText}>📧 privacy@schoolbridge.com</Text>
            <Text style={styles.contactInfoText}>📞 1-555-PRIVACY (1-555-774-8229)</Text>
            <Text style={styles.contactInfoText}>📍 123 Education St, Learning City, LC 12345</Text>
          </View>
        </LinearGradient>
      </View>

      {/* ✅ Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerTitle}>Commitment to Privacy</Text>
        <Text style={styles.footerText}>
          We are committed to maintaining the highest standards of privacy protection.
          This policy is designed to be transparent and easy to understand.
        </Text>
        <Text style={styles.footerSubtext}>
          SchoolBridge • Privacy Policy • Version 2.1 • Effective January 1, 2025
        </Text>
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
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    minHeight: height * 0.3,
    justifyContent: 'center',
  },
  heroContent: {
    alignItems: 'center',
    maxWidth: 600,
  },
  heroIcon: {
    fontSize: 50,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  heroSubtitle: {
    fontSize: isTablet ? 18 : 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.95,
    lineHeight: 24,
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
    fontSize: 12,
    fontWeight: '600',
  },

  // Summary Section
  summarySection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -30,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 10,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryText: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 16,
  },

  // Section Styles
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },

  // Privacy Sections
  privacyWrapper: {
    marginBottom: 16,
  },
  privacyCard: {
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  privacyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  privacyIcon: {
    fontSize: 18,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    flex: 1,
  },
  privacyArrow: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  privacyContent: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 22,
    marginLeft: 56,
    marginTop: 8,
  },

  // Contact Section
  contactSection: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  contactContainer: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  contactTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  contactSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
    lineHeight: 24,
  },
  contactButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  contactButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactButtonIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
  },
  contactInfo: {
    alignItems: 'center',
    gap: 8,
  },
  contactInfoText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
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
    textAlign: 'center',
    marginBottom: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#A0AEC0',
    textAlign: 'center',
  },
});

export default PrivacyScreen;
