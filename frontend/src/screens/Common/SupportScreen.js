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
  TextInput,
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

const SupportScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [ticketForm, setTicketForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium',
  });
  const [expandedFaq, setExpandedFaq] = useState(null);

  const handleContactAction = (action) => {
    switch (action) {
      case 'phone':
        Linking.openURL('tel:+1-555-SCHOOL');
        break;
      case 'email':
        Linking.openURL('mailto:support@schoolbridge.com?subject=Support Request');
        break;
      case 'chat':
        Alert.alert('Live Chat', 'Live chat feature will be available soon!');
        break;
      case 'whatsapp':
        Linking.openURL('https://wa.me/15555551234?text=Hi, I need support with SchoolBridge');
        break;
      default:
        break;
    }
  };

  // ✅ NEW: Handle Connection Test Navigation
  const handleConnectionTest = () => {
    // Navigate to Connection Test screen or show as modal
    navigation.navigate('ConnectionTest'); // Adjust this based on your navigation structure
  };

  const handleSubmitTicket = () => {
    if (!ticketForm.name || !ticketForm.email || !ticketForm.subject || !ticketForm.message) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    Alert.alert(
      'Ticket Submitted',
      'Your support ticket has been submitted successfully! We\'ll get back to you within 24 hours.',
      [{ text: 'OK', onPress: () => {
        setTicketForm({
          name: '',
          email: '',
          subject: '',
          message: '',
          priority: 'medium',
        });
      }}]
    );
  };

  const supportCategories = [
    { id: 'general', name: 'General', icon: '❓', color: '#4ECDC4' },
    { id: 'technical', name: 'Technical', icon: '⚙️', color: '#FF6B6B' },
    { id: 'billing', name: 'Billing', icon: '💳', color: '#9B59B6' },
    { id: 'account', name: 'Account', icon: '👤', color: '#FFD93D' },
  ];

  const contactMethods = [
    {
      title: 'Phone Support',
      subtitle: 'Talk to our experts',
      icon: '📞',
      action: 'phone',
      availability: 'Mon-Fri 9AM-6PM EST',
      color: '#4ECDC4',
    },
    {
      title: 'Email Support',
      subtitle: 'Get detailed help',
      icon: '✉️',
      action: 'email',
      availability: 'Response within 24 hours',
      color: '#FF6B6B',
    },
    {
      title: 'Live Chat',
      subtitle: 'Quick assistance',
      icon: '💬',
      action: 'chat',
      availability: 'Mon-Fri 9AM-6PM EST',
      color: '#9B59B6',
    },
    {
      title: 'WhatsApp',
      subtitle: 'Message us directly',
      icon: '📱',
      action: 'whatsapp',
      availability: '24/7 Available',
      color: '#25D366',
    },
  ];

  const faqData = [
    {
      question: 'How do I reset my password?',
      answer: 'Go to the login screen and click "Forgot Password". Follow the instructions sent to your email.',
      category: 'account',
    },
    {
      question: 'Why can\'t I access my grades?',
      answer: 'Grades are updated by teachers. If you don\'t see recent grades, contact your teacher or check back later.',
      category: 'technical',
    },
    {
      question: 'How do I change my billing information?',
      answer: 'Go to Settings > Billing > Payment Methods to update your billing information.',
      category: 'billing',
    },
    {
      question: 'Can I download the mobile app?',
      answer: 'Yes! Our mobile app is available on both iOS and Android. Search for "SchoolBridge" in your app store.',
      category: 'general',
    },
    {
      question: 'How do I contact my teacher?',
      answer: 'Use the messaging feature in your dashboard or check the contact information in your class details.',
      category: 'general',
    },
    {
      question: 'What should I do if the app crashes?',
      answer: 'Try restarting the app. If the problem persists, update to the latest version or contact support.',
      category: 'technical',
    },
    // ✅ NEW: Connection-related FAQ
    {
      question: 'The app won\'t connect to the server. What should I do?',
      answer: 'First, check your internet connection. Then use our Connection Test tool to diagnose the issue. You can find it in the Additional Resources section below.',
      category: 'technical',
    },
  ];

  const filteredFaqs = faqData.filter(faq => faq.category === selectedCategory);

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
          <Text style={styles.heroIcon}>🎧</Text>
          <Text style={styles.heroTitle}>How Can We Help You?</Text>
          <Text style={styles.heroSubtitle}>
            Get the support you need, when you need it. We're here to help!
          </Text>
        </View>
      </LinearGradient>

      {/* ✅ Quick Contact Methods */}
      <View style={styles.contactMethodsSection}>
        <Text style={styles.sectionTitle}>Contact Support</Text>
        <Text style={styles.sectionSubtitle}>
          Choose your preferred way to reach us
        </Text>

        <View style={styles.contactMethodsGrid}>
          {contactMethods.map((method, index) => (
            <FloatingCard
              key={method.action}
              style={styles.contactMethodWrapper}
              delay={index * 100}
            >
              <InteractiveCard
                onPress={() => handleContactAction(method.action)}
                scaleValue={0.95}
              >
                <LinearGradient
                  colors={[method.color, method.color + '90']}
                  style={styles.contactMethodCard}
                >
                  <Text style={styles.contactMethodIcon}>{method.icon}</Text>
                  <Text style={styles.contactMethodTitle}>{method.title}</Text>
                  <Text style={styles.contactMethodSubtitle}>
                    {method.subtitle}
                  </Text>
                  <Text style={styles.contactMethodAvailability}>
                    {method.availability}
                  </Text>
                </LinearGradient>
              </InteractiveCard>
            </FloatingCard>
          ))}
        </View>
      </View>

      {/* ✅ NEW: Connection Test Quick Access */}
      <View style={styles.connectionTestSection}>
        <Text style={styles.connectionTestTitle}>Having Connection Issues?</Text>
        <Text style={styles.connectionTestSubtitle}>
          Test your connection to our servers and get instant troubleshooting help
        </Text>

        <InteractiveCard
          style={styles.connectionTestButton}
          onPress={handleConnectionTest}
          scaleValue={0.96}
        >
          <LinearGradient
            colors={['#4ECDC4', '#44A08D']}
            style={styles.connectionTestGradient}
          >
            <Text style={styles.connectionTestIcon}>🔗</Text>
            <View style={styles.connectionTestContent}>
              <Text style={styles.connectionTestButtonTitle}>Connection Test</Text>
              <Text style={styles.connectionTestButtonSubtitle}>
                Diagnose & Fix Connection Problems
              </Text>
            </View>
            <Text style={styles.connectionTestArrow}>▶</Text>
          </LinearGradient>
        </InteractiveCard>
      </View>

      {/* ✅ FAQ Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <Text style={styles.sectionSubtitle}>
          Find quick answers to common questions
        </Text>

        {/* Category Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categorySelector}
          contentContainerStyle={styles.categorySelectorContent}
        >
          {supportCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive,
                {
                  backgroundColor:
                    selectedCategory === category.id
                      ? category.color
                      : '#F8F9FA',
                },
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text
                style={[
                  styles.categoryName,
                  {
                    color:
                      selectedCategory === category.id ? '#FFFFFF' : '#4A5568',
                  },
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FAQ Items */}
        {filteredFaqs.map((faq, index) => (
          <InteractiveCard
            key={index}
            style={styles.faqWrapper}
            onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
            scaleValue={0.98}
          >
            <View
              style={[
                styles.faqCard,
                {
                  borderLeftColor: supportCategories.find(
                    (c) => c.id === selectedCategory,
                  )?.color,
                },
              ]}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Text
                  style={[
                    styles.faqArrow,
                    {
                      color: supportCategories.find(
                        (c) => c.id === selectedCategory,
                      )?.color,
                    },
                  ]}
                >
                  {expandedFaq === index ? '▼' : '▶'}
                </Text>
              </View>
              {expandedFaq === index && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </View>
          </InteractiveCard>
        ))}
      </View>

      {/* ✅ Support Ticket Form */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Submit a Support Ticket</Text>
        <Text style={styles.sectionSubtitle}>
          Can't find what you're looking for? Send us a detailed message
        </Text>

        <View style={styles.ticketForm}>
          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Name *</Text>
              <TextInput
                style={styles.formInput}
                value={ticketForm.name}
                onChangeText={(text) =>
                  setTicketForm({ ...ticketForm, name: text })
                }
                placeholder="Your full name"
                placeholderTextColor="#A0AEC0"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Email *</Text>
              <TextInput
                style={styles.formInput}
                value={ticketForm.email}
                onChangeText={(text) =>
                  setTicketForm({ ...ticketForm, email: text })
                }
                placeholder="your.email@domain.com"
                placeholderTextColor="#A0AEC0"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.formField}>
            <Text style={styles.formLabel}>Subject *</Text>
            <TextInput
              style={styles.formInput}
              value={ticketForm.subject}
              onChangeText={(text) =>
                setTicketForm({ ...ticketForm, subject: text })
              }
              placeholder="Brief description of your issue"
              placeholderTextColor="#A0AEC0"
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.formLabel}>Priority</Text>
            <View style={styles.prioritySelector}>
              {['low', 'medium', 'high'].map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityButton,
                    ticketForm.priority === priority &&
                      styles.priorityButtonActive,
                  ]}
                  onPress={() => setTicketForm({ ...ticketForm, priority })}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      ticketForm.priority === priority &&
                        styles.priorityTextActive,
                    ]}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formField}>
            <Text style={styles.formLabel}>Message *</Text>
            <TextInput
              style={[styles.formInput, styles.formTextArea]}
              value={ticketForm.message}
              onChangeText={(text) =>
                setTicketForm({ ...ticketForm, message: text })
              }
              placeholder="Please describe your issue in detail..."
              placeholderTextColor="#A0AEC0"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <InteractiveCard
            style={styles.submitButton}
            onPress={handleSubmitTicket}
            scaleValue={0.96}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.submitButtonGradient}
            >
              <Text style={styles.submitButtonText}>🎫 Submit Ticket</Text>
            </LinearGradient>
          </InteractiveCard>
        </View>
      </View>

      {/* ✅ Enhanced Additional Resources with Connection Test */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Resources</Text>
        <Text style={styles.sectionSubtitle}>
          Explore more ways to get help and diagnostic tools
        </Text>

        <View style={styles.resourcesContainer}>
          {/* ✅ First Row with Connection Test */}
          <View style={styles.resourceRow}>
            <InteractiveCard
              style={styles.resourceCardWrapper}
              onPress={handleConnectionTest}
              scaleValue={0.95}
            >
              <View style={[styles.resourceCardContent, styles.connectionTestResource]}>
                <Text style={styles.resourceIcon}>🔗</Text>
                <Text style={styles.resourceTitle}>Connection Test</Text>
                <Text style={styles.resourceSubtitle}>
                  Diagnose connection issues
                </Text>
                <View style={styles.connectionTestBadge}>
                  <Text style={styles.connectionTestBadgeText}>DIAGNOSTIC</Text>
                </View>
              </View>
            </InteractiveCard>

            <InteractiveCard
              style={styles.resourceCardWrapper}
              onPress={() =>
                Alert.alert('User Guide', 'User guide will be available soon!')
              }
              scaleValue={0.95}
            >
              <View style={styles.resourceCardContent}>
                <Text style={styles.resourceIcon}>📖</Text>
                <Text style={styles.resourceTitle}>User Guide</Text>
                <Text style={styles.resourceSubtitle}>
                  Step-by-step tutorials
                </Text>
              </View>
            </InteractiveCard>
          </View>

          {/* ✅ Second Row */}
          <View style={styles.resourceRow}>
            <InteractiveCard
              style={styles.resourceCardWrapper}
              onPress={() =>
                Alert.alert('Video Tutorials', 'Video tutorials coming soon!')
              }
              scaleValue={0.95}
            >
              <View style={styles.resourceCardContent}>
                <Text style={styles.resourceIcon}>🎥</Text>
                <Text style={styles.resourceTitle}>Video Tutorials</Text>
                <Text style={styles.resourceSubtitle}>
                  Visual learning guides
                </Text>
              </View>
            </InteractiveCard>

            <InteractiveCard
              style={styles.resourceCardWrapper}
              onPress={() =>
                Alert.alert(
                  'Community Forum',
                  'Community forum launching soon!',
                )
              }
              scaleValue={0.95}
            >
              <View style={styles.resourceCardContent}>
                <Text style={styles.resourceIcon}>👥</Text>
                <Text style={styles.resourceTitle}>Community</Text>
                <Text style={styles.resourceSubtitle}>Connect with users</Text>
              </View>
            </InteractiveCard>
          </View>

          {/* ✅ Third Row */}
          <View style={styles.resourceRow}>
            <InteractiveCard
              style={styles.resourceCardWrapper}
              onPress={() =>
                Alert.alert('System Status', 'All systems operational!')
              }
              scaleValue={0.95}
            >
              <View style={styles.resourceCardContent}>
                <Text style={styles.resourceIcon}>⚡</Text>
                <Text style={styles.resourceTitle}>System Status</Text>
                <Text style={styles.resourceSubtitle}>
                  Check service health
                </Text>
              </View>
            </InteractiveCard>

            <InteractiveCard
              style={styles.resourceCardWrapper}
              onPress={() =>
                Alert.alert('Download Logs', 'Log download feature coming soon!')
              }
              scaleValue={0.95}
            >
              <View style={styles.resourceCardContent}>
                <Text style={styles.resourceIcon}>📋</Text>
                <Text style={styles.resourceTitle}>Download Logs</Text>
                <Text style={styles.resourceSubtitle}>
                  Get diagnostic data
                </Text>
              </View>
            </InteractiveCard>
          </View>
        </View>
      </View>

      {/* ✅ Bottom spacing */}
      <View style={{ height: 40 }} />
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
    minHeight: height * 0.25,
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
    opacity: 0.95,
    lineHeight: 24,
  },

  // Contact Methods Section
  contactMethodsSection: {
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
  contactMethodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  contactMethodWrapper: {
    width: '48%',
    marginBottom: 12,
  },
  contactMethodCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  contactMethodIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  contactMethodTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  contactMethodSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    textAlign: 'center',
  },
  contactMethodAvailability: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // ✅ NEW: Connection Test Section
  connectionTestSection: {
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
  connectionTestTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 8,
  },
  connectionTestSubtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  connectionTestButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  connectionTestGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  connectionTestIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  connectionTestContent: {
    flex: 1,
  },
  connectionTestButtonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  connectionTestButtonSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  connectionTestArrow: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
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

  // Category Selector
  categorySelector: {
    marginBottom: 20,
  },
  categorySelectorContent: {
    paddingHorizontal: 0,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
  },
  categoryButtonActive: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
  },

  // FAQ Styles
  faqWrapper: {
    marginBottom: 12,
  },
  faqCard: {
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    flex: 1,
    marginRight: 12,
  },
  faqArrow: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    marginTop: 12,
  },

  // Ticket Form
  ticketForm: {},
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  formField: {
    flex: 1,
    marginHorizontal: 4,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A202C',
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  formTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  prioritySelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
  },
  priorityButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
  },
  priorityTextActive: {
    color: '#FFFFFF',
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // ✅ Enhanced Resources Grid
  resourcesContainer: {
    width: '100%',
  },
  resourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  resourceCardWrapper: {
    width: '48%',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  resourceCardContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 130,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  // ✅ NEW: Connection Test Resource Special Styling
  connectionTestResource: {
    borderColor: '#4ECDC4',
    borderWidth: 2,
    backgroundColor: '#F7FFFE',
  },
  connectionTestBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  connectionTestBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  resourceIcon: {
    fontSize: 36,
    marginBottom: 12,
    textAlign: 'center',
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 6,
    textAlign: 'center',
  },
  resourceSubtitle: {
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 4,
  },
});

export default SupportScreen;
