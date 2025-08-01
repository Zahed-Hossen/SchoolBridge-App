import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Linking,
  Animated,
  Image,
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

// ✅ Pulse Animation Component
const PulseIcon = ({ children, style }) => {
  const pulseValue = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: pulseValue }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const PricingScreen = ({ navigation }) => {
  const [selectedPlan, setSelectedPlan] = useState('standard');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const handleButtonPress = (action) => {
    switch (action) {
      case 'contact':
        navigation.navigate('Contact');
        break;
      case 'demo':
        navigation.navigate('Demo');
        break;
      case 'getStarted':
        navigation.navigate('SignUp');
        break;
      case 'call':
        Linking.openURL('tel:+15550123');
        break;
      case 'email':
        Linking.openURL('mailto:sales@schoolbridge.com?subject=Pricing Inquiry');
        break;
      case 'chat':
        console.log('Opening chat...');
        break;
      default:
        break;
    }
  };

  const pricingPlans = [
    {
      id: 'starter',
      name: 'Starter',
      subtitle: 'Perfect for small schools',
      description: 'Designed for small schools or trial implementations',
      icon: '🎯',
      color: '#4ECDC4',
      gradientColors: ['#4ECDC4', '#44A08D'],
      monthlyPrice: 49,
      yearlyPrice: 490,
      students: 'Up to 100',
      features: [
        'Student Management',
        'Basic Communication',
        'Grade Tracking',
        'Parent Portal',
        'Email Support',
        'Basic Reports'
      ],
      popular: false
    },
    {
      id: 'standard',
      name: 'Standard',
      subtitle: 'Most popular choice',
      description: 'Tailored for mid-sized schools with comprehensive needs',
      icon: '⭐',
      color: '#FF6B6B',
      gradientColors: ['#FF6B6B', '#FF8E8E'],
      monthlyPrice: 99,
      yearlyPrice: 990,
      students: 'Up to 500',
      features: [
        'Everything in Starter',
        'Advanced Analytics',
        'Custom Reports',
        'Mobile Apps',
        'Priority Support',
        'Integration APIs',
        'Attendance Tracking',
        'Assignment Management'
      ],
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      subtitle: 'For large institutions',
      description: 'Enterprise-grade solution for large schools and districts',
      icon: '👑',
      color: '#9B59B6',
      gradientColors: ['#9B59B6', '#8E44AD'],
      monthlyPrice: 199,
      yearlyPrice: 1990,
      students: 'Unlimited',
      features: [
        'Everything in Standard',
        'AI-Powered Insights',
        'White-label Solution',
        'Dedicated Account Manager',
        '24/7 Phone Support',
        'Custom Integrations',
        'Advanced Security',
        'Training & Onboarding'
      ],
      popular: false
    }
  ];

  const getPlanPrice = (plan) => {
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const getSavingsPercentage = () => {
    return Math.round(((12 - 10) / 12) * 100); // 17% savings for yearly
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      {/* ✅ Enhanced Hero Section */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.heroSection}
      >
        <View style={styles.heroContent}>
          <PulseIcon>
            <Text style={styles.heroIcon}>💰</Text>
          </PulseIcon>
          <Text style={styles.heroTitle}>Flexible Pricing for Every School</Text>
          <Text style={styles.heroSubtitle}>
            Choose a plan that fits your school's size and goals—simple, transparent, and scalable
          </Text>

          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>🎉 30-Day Free Trial Available</Text>
          </View>
        </View>
      </LinearGradient>

      {/* ✅ Billing Toggle Section */}
      <View style={styles.billingSection}>
        <Text style={styles.billingTitle}>Choose Your Billing Cycle</Text>
        <View style={styles.billingToggle}>
          <TouchableOpacity
            style={[
              styles.billingOption,
              billingCycle === 'monthly' && styles.billingOptionActive
            ]}
            onPress={() => setBillingCycle('monthly')}
          >
            <Text style={[
              styles.billingOptionText,
              billingCycle === 'monthly' && styles.billingOptionTextActive
            ]}>
              Monthly
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.billingOption,
              billingCycle === 'yearly' && styles.billingOptionActive
            ]}
            onPress={() => setBillingCycle('yearly')}
          >
            <Text style={[
              styles.billingOptionText,
              billingCycle === 'yearly' && styles.billingOptionTextActive
            ]}>
              Yearly
            </Text>
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>Save {getSavingsPercentage()}%</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ✅ NEW: Horizontal Pricing Plans Section */}
      <View style={styles.plansSection}>
        <Text style={styles.sectionTitle}>Choose Your Plan</Text>
        <Text style={styles.sectionSubtitle}>
          All plans include our core features with no setup fees
        </Text>

        {/* ✅ NEW: Horizontal Scrollable Pricing Table */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalPricingContainer}
          decelerationRate="fast"
          snapToInterval={width * 0.85}
          snapToAlignment="center"
          pagingEnabled={false}
        >
          {pricingPlans.map((plan, index) => (
            <FloatingCard
              key={plan.id}
              style={styles.horizontalPlanWrapper}
              delay={index * 200}
            >
              <InteractiveCard
                onPress={() => setSelectedPlan(plan.id)}
                scaleValue={0.98}
              >
                <LinearGradient
                  colors={plan.gradientColors}
                  style={[
                    styles.horizontalPlanCard,
                    selectedPlan === plan.id && styles.selectedHorizontalPlanCard,
                    plan.popular && styles.popularHorizontalPlan
                  ]}
                >
                  {plan.popular && (
                    <View style={styles.popularHorizontalBadge}>
                      <Text style={styles.popularBadgeText}>🔥 MOST POPULAR</Text>
                    </View>
                  )}

                  <View style={styles.horizontalPlanHeader}>
                    <View style={styles.horizontalPlanIconContainer}>
                      <Text style={styles.horizontalPlanIcon}>{plan.icon}</Text>
                    </View>
                    <Text style={styles.horizontalPlanName}>{plan.name}</Text>
                    <Text style={styles.horizontalPlanSubtitle}>{plan.subtitle}</Text>
                  </View>

                  <View style={styles.horizontalPlanPricing}>
                    <Text style={styles.horizontalPlanCurrency}>$</Text>
                    <Text style={styles.horizontalPlanPrice}>
                      {getPlanPrice(plan)}
                    </Text>
                    <Text style={styles.horizontalPlanPeriod}>
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </Text>
                  </View>

                  <Text style={styles.horizontalPlanDescription}>{plan.description}</Text>

                  <View style={styles.horizontalPlanStudents}>
                    <Text style={styles.horizontalPlanStudentsIcon}>👥</Text>
                    <Text style={styles.horizontalPlanStudentsText}>{plan.students} Students</Text>
                  </View>

                  <View style={styles.horizontalPlanFeatures}>
                    {plan.features.slice(0, 4).map((feature, idx) => (
                      <View key={idx} style={styles.horizontalPlanFeature}>
                        <Text style={styles.horizontalPlanFeatureIcon}>✓</Text>
                        <Text style={styles.horizontalPlanFeatureText}>{feature}</Text>
                      </View>
                    ))}
                    {plan.features.length > 4 && (
                      <Text style={styles.horizontalPlanMoreFeatures}>
                        +{plan.features.length - 4} more features
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.horizontalPlanButton}
                    onPress={() => handleButtonPress('getStarted')}
                  >
                    <LinearGradient
                      colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,1)']}
                      style={styles.horizontalPlanButtonInner}
                    >
                      <Text style={[styles.horizontalPlanButtonText, { color: plan.color }]}>
                        {plan.id === 'starter' ? 'Start Free Trial' : 'Get Started'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </InteractiveCard>
            </FloatingCard>
          ))}
        </ScrollView>
      </View>

      {/* ✅ ENHANCED: Interactive Comparison Table Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compare Plans</Text>
        <Text style={styles.sectionSubtitle}>
          See what's included in each plan at a glance
        </Text>

        <View style={styles.enhancedComparisonTable}>
          {/* ✅ Header Row */}
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.comparisonHeader}
          >
            <Text style={styles.comparisonHeaderFeature}>Features</Text>
            <View style={styles.comparisonHeaderPlans}>
              <Text style={styles.comparisonHeaderPlan}>Starter</Text>
              <Text style={styles.comparisonHeaderPlan}>Standard</Text>
              <Text style={styles.comparisonHeaderPlan}>Premium</Text>
            </View>
          </LinearGradient>

          {/* ✅ Feature Rows */}
          {[
            { feature: 'Student Management', starter: true, standard: true, premium: true, category: 'Core' },
            { feature: 'Parent Portal', starter: true, standard: true, premium: true, category: 'Core' },
            { feature: 'Basic Reports', starter: true, standard: true, premium: true, category: 'Core' },
            { feature: 'Mobile Apps', starter: false, standard: true, premium: true, category: 'Advanced' },
            { feature: 'Advanced Analytics', starter: false, standard: true, premium: true, category: 'Advanced' },
            { feature: 'Custom Integrations', starter: false, standard: false, premium: true, category: 'Premium' },
            { feature: 'AI-Powered Insights', starter: false, standard: false, premium: true, category: 'Premium' },
            { feature: '24/7 Phone Support', starter: false, standard: false, premium: true, category: 'Premium' }
          ].map((row, index) => (
            <InteractiveCard
              key={index}
              style={styles.comparisonRowWrapper}
              onPress={() => console.log(`Feature ${row.feature} info`)}
              scaleValue={0.99}
            >
              <View style={[
                styles.enhancedComparisonRow,
                index % 2 === 0 && styles.evenRow
              ]}>
                <View style={styles.comparisonFeatureCell}>
                  <Text style={styles.enhancedComparisonFeature}>{row.feature}</Text>
                  <Text style={styles.featureCategory}>{row.category}</Text>
                </View>
                <View style={styles.enhancedComparisonPlans}>
                  <View style={[styles.checkContainer, { backgroundColor: row.starter ? '#4ECDC4' + '20' : '#F5F5F5' }]}>
                    <Text style={[styles.enhancedComparisonCheck, { color: row.starter ? '#4ECDC4' : '#E0E0E0' }]}>
                      {row.starter ? '✓' : '✗'}
                    </Text>
                  </View>
                  <View style={[styles.checkContainer, { backgroundColor: row.standard ? '#FF6B6B' + '20' : '#F5F5F5' }]}>
                    <Text style={[styles.enhancedComparisonCheck, { color: row.standard ? '#FF6B6B' : '#E0E0E0' }]}>
                      {row.standard ? '✓' : '✗'}
                    </Text>
                  </View>
                  <View style={[styles.checkContainer, { backgroundColor: row.premium ? '#9B59B6' + '20' : '#F5F5F5' }]}>
                    <Text style={[styles.enhancedComparisonCheck, { color: row.premium ? '#9B59B6' : '#E0E0E0' }]}>
                      {row.premium ? '✓' : '✗'}
                    </Text>
                  </View>
                </View>
              </View>
            </InteractiveCard>
          ))}
        </View>
      </View>

      {/* ✅ FAQ Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <Text style={styles.sectionSubtitle}>Get answers to common pricing questions</Text>

        {[
          {
            question: "Is there a free trial available?",
            answer: "Yes! We offer a 30-day free trial with full access to all features. No credit card required.",
            icon: "❓",
            color: "#4ECDC4"
          },
          {
            question: "Can I change plans anytime?",
            answer: "Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately.",
            icon: "🔄",
            color: "#FF6B6B"
          },
          {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards, PayPal, and bank transfers for annual plans.",
            icon: "💳",
            color: "#9B59B6"
          },
          {
            question: "Is there a setup fee?",
            answer: "No setup fees ever! What you see is what you pay. We believe in transparent pricing.",
            icon: "💰",
            color: "#FFD93D"
          }
        ].map((faq, index) => (
          <InteractiveCard
            key={index}
            style={styles.faqWrapper}
            onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
            scaleValue={0.98}
          >
            <LinearGradient
              colors={expandedFaq === index ? [faq.color + '10', '#FFFFFF'] : ['#FFFFFF', '#F8F9FA']}
              style={[styles.faqCard, { borderLeftColor: faq.color }]}
            >
              <View style={styles.faqHeader}>
                <View style={[styles.faqIconContainer, { backgroundColor: faq.color + '20' }]}>
                  <Text style={styles.faqIcon}>{faq.icon}</Text>
                </View>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Text style={[styles.faqArrow, { color: faq.color }]}>
                  {expandedFaq === index ? '▼' : '▶'}
                </Text>
              </View>
              {expandedFaq === index && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </LinearGradient>
          </InteractiveCard>
        ))}
      </View>

      {/* ✅ ENHANCED: Centered Help Section */}
      <View style={styles.helpSection}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.helpContainer}
        >
          <Text style={styles.helpTitle}>Need Help Choosing the Right Plan?</Text>
          <Text style={styles.helpSubtitle}>
            Our team is here to assist you in selecting the best plan for your school.
            Whether you need more information or a personalized demo, we are ready to help.
          </Text>

          {/* ✅ FIXED: Centered Help Buttons */}
          <View style={styles.centeredHelpButtons}>
            <InteractiveCard
              style={styles.centeredHelpButton}
              onPress={() => handleButtonPress('contact')}
              scaleValue={0.96}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F8F9FA']}
                style={styles.centeredHelpButtonGradient}
              >
                <Text style={styles.centeredHelpButtonIcon}>📞</Text>
                <Text style={styles.centeredHelpButtonText}>Contact Sales</Text>
              </LinearGradient>
            </InteractiveCard>

            <InteractiveCard
              style={styles.centeredHelpButton}
              onPress={() => handleButtonPress('demo')}
              scaleValue={0.96}
            >
              <LinearGradient
                colors={['#FF6B6B', '#FF8E8E']}
                style={styles.centeredHelpButtonGradient}
              >
                <Text style={styles.centeredHelpButtonIcon}>🎯</Text>
                <Text style={[styles.centeredHelpButtonText, { color: '#FFFFFF' }]}>Book Demo</Text>
              </LinearGradient>
            </InteractiveCard>
          </View>

          {/* ✅ FIXED: Centered Contact Methods */}
          <View style={styles.centeredContactMethods}>
            <TouchableOpacity
              style={styles.centeredContactMethod}
              onPress={() => handleButtonPress('call')}
            >
              <Text style={styles.centeredContactMethodIcon}>📱</Text>
              <Text style={styles.centeredContactMethodText}>Call Now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.centeredContactMethod}
              onPress={() => handleButtonPress('email')}
            >
              <Text style={styles.centeredContactMethodIcon}>✉️</Text>
              <Text style={styles.centeredContactMethodText}>Send Email</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.centeredContactMethod}
              onPress={() => handleButtonPress('chat')}
            >
              <Text style={styles.centeredContactMethodIcon}>💬</Text>
              <Text style={styles.centeredContactMethodText}>Live Chat</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* ✅ Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerTitle}>Ready to Get Started?</Text>
        <Text style={styles.footerSubtitle}>
          Join thousands of schools already using SchoolBridge
        </Text>

        <InteractiveCard
          style={styles.footerButton}
          onPress={() => handleButtonPress('getStarted')}
          scaleValue={0.95}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.footerButtonGradient}
          >
            <Text style={styles.footerButtonText}>🚀 Start Your Free Trial</Text>
          </LinearGradient>
        </InteractiveCard>

        <Text style={styles.footerText}>
          Need Help? Contact us anytime!
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

  // ✅ Hero Section
  heroSection: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    minHeight: height * 0.35,
    justifyContent: 'center',
  },
  heroContent: {
    alignItems: 'center',
    maxWidth: 600,
  },
  heroIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  heroSubtitle: {
    fontSize: isTablet ? 20 : 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.95,
    lineHeight: 24,
  },
  heroBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // ✅ Billing Section
  billingSection: {
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
    alignItems: 'center',
  },
  billingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 16,
  },
  billingToggle: {
    flexDirection: 'row',
    backgroundColor: '#F7FAFC',
    borderRadius: 25,
    padding: 4,
  },
  billingOption: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    position: 'relative',
  },
  billingOptionActive: {
    backgroundColor: '#667eea',
  },
  billingOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
  },
  billingOptionTextActive: {
    color: '#FFFFFF',
  },
  savingsBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  savingsText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  // ✅ NEW: Horizontal Pricing Plans
  plansSection: {
    marginTop: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 20,
  },

  // ✅ NEW: Horizontal Pricing Container
  horizontalPricingContainer: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  horizontalPlanWrapper: {
    width: width * 0.8,
    marginRight: 16,
  },
  horizontalPlanCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
    minHeight: 520,
    width: '100%',
  },
  selectedHorizontalPlanCard: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowOpacity: 0.25,
    transform: [{ scale: 1.02 }],
  },
  popularHorizontalPlan: {
    borderWidth: 3,
    borderColor: '#FFD93D',
  },
  popularHorizontalBadge: {
    position: 'absolute',
    top: -15,
    left: 20,
    right: 20,
    backgroundColor: '#FFD93D',
    borderRadius: 15,
    paddingVertical: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  popularBadgeText: {
    color: '#1A202C',
    fontSize: 12,
    fontWeight: 'bold',
  },
  horizontalPlanHeader: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  horizontalPlanIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  horizontalPlanIcon: {
    fontSize: 28,
  },
  horizontalPlanName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  horizontalPlanSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  horizontalPlanPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 16,
  },
  horizontalPlanCurrency: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  horizontalPlanPrice: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginHorizontal: 4,
  },
  horizontalPlanPeriod: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  horizontalPlanDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  horizontalPlanStudents: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  horizontalPlanStudentsIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  horizontalPlanStudentsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  horizontalPlanFeatures: {
    marginBottom: 24,
    flex: 1,
  },
  horizontalPlanFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  horizontalPlanFeatureIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
    color: '#FFFFFF',
    width: 20,
  },
  horizontalPlanFeatureText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
  },
  horizontalPlanMoreFeatures: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  horizontalPlanButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  horizontalPlanButtonInner: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  horizontalPlanButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  // ✅ Section Styles
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

  // ✅ ENHANCED: Comparison Table
  enhancedComparisonTable: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  comparisonHeaderFeature: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  comparisonHeaderPlans: {
    flexDirection: 'row',
    gap: 24,
  },
  comparisonHeaderPlan: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    width: 60,
    textAlign: 'center',
  },
  comparisonRowWrapper: {
    // Wrapper for interactive card
  },
  enhancedComparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  evenRow: {
    backgroundColor: '#F8F9FA',
  },
  comparisonFeatureCell: {
    flex: 1,
  },
  enhancedComparisonFeature: {
    fontSize: 14,
    color: '#1A202C',
    fontWeight: '600',
  },
  featureCategory: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  enhancedComparisonPlans: {
    flexDirection: 'row',
    gap: 24,
  },
  checkContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  enhancedComparisonCheck: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  // ✅ FAQ Section
  faqWrapper: {
    marginBottom: 16,
  },
  faqCard: {
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  faqIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  faqIcon: {
    fontSize: 20,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    flex: 1,
  },
  faqArrow: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 22,
    marginLeft: 56,
    marginTop: 8,
  },

  // ✅ FIXED: Centered Help Section
  helpSection: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  helpContainer: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  helpTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  helpSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.9,
    lineHeight: 24,
  },

  // ✅ FIXED: Centered Help Buttons
  centeredHelpButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
    width: '100%',
  },
  centeredHelpButton: {
    flex: 1,
    maxWidth: 150,
    borderRadius: 16,
    overflow: 'hidden',
  },
  centeredHelpButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredHelpButtonIcon: {
    fontSize: 18,
    marginBottom: 8,
  },
  centeredHelpButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    textAlign: 'center',
  },

  // ✅ FIXED: Centered Contact Methods
  centeredContactMethods: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    flexWrap: 'wrap',
  },
  centeredContactMethod: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minWidth: 80,
  },
  centeredContactMethodIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  centeredContactMethodText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },

  // ✅ Footer
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
    marginBottom: 8,
  },
  footerSubtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
  },
  footerButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  footerButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  footerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    fontSize: 12,
    color: '#A0AEC0',
    textAlign: 'center',
  },
});

export default PricingScreen;
