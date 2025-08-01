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
  Platform,
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

const ContactScreen = ({ navigation }) => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general',
  });

  const handleContactAction = (action) => {
    switch (action) {
      case 'phone':
        Linking.openURL('tel:+1-555-SCHOOL');
        break;
      case 'email':
        Linking.openURL('mailto:info@schoolbridge.com?subject=General Inquiry');
        break;
      case 'address':
        const address = '123 Education Street, Learning City, LC 12345';
        const url = Platform.select({
          ios: `maps:0,0?q=${encodeURIComponent(address)}`,
          android: `geo:0,0?q=${encodeURIComponent(address)}`,
        });
        Linking.openURL(url);
        break;
      case 'website':
        Linking.openURL('https://www.schoolbridge.com');
        break;
      case 'support':
        navigation.navigate('Support');
        break;
      case 'whatsapp':
        Linking.openURL('https://wa.me/15555551234?text=Hi, I want to learn more about SchoolBridge');
        break;
      default:
        break;
    }
  };

  const handleSubmitContact = () => {
    if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    Alert.alert(
      'Message Sent',
      'Thank you for contacting us! We\'ll get back to you within 24 hours.',
      [{ text: 'OK', onPress: () => {
        setContactForm({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          inquiryType: 'general',
        });
      }}]
    );
  };

  const contactMethods = [
    {
      title: 'Call Us',
      subtitle: 'Speak with our team',
      icon: '📞',
      action: 'phone',
      info: '+1 (555) SCHOOL',
      availability: 'Mon-Fri 8AM-6PM EST',
      color: '#4ECDC4',
    },
    {
      title: 'Email Us',
      subtitle: 'Send us a message',
      icon: '✉️',
      action: 'email',
      info: 'info@schoolbridge.com',
      availability: 'Response within 24 hours',
      color: '#FF6B6B',
    },
    {
      title: 'Visit Us',
      subtitle: 'Our office location',
      icon: '📍',
      action: 'address',
      info: '123 Education Street',
      availability: 'Mon-Fri 9AM-5PM EST',
      color: '#9B59B6',
    },
    {
      title: 'WhatsApp',
      subtitle: 'Quick chat support',
      icon: '💬',
      action: 'whatsapp',
      info: '+1 (555) 551-234',
      availability: '24/7 Available',
      color: '#25D366',
    },
  ];

  const inquiryTypes = [
    { id: 'general', name: 'General Inquiry', icon: '❓' },
    { id: 'demo', name: 'Request Demo', icon: '🎯' },
    { id: 'pricing', name: 'Pricing Info', icon: '💰' },
    { id: 'partnership', name: 'Partnership', icon: '🤝' },
    { id: 'technical', name: 'Technical Support', icon: '⚙️' },
    { id: 'feedback', name: 'Feedback', icon: '💭' },
  ];

  const quickActions = [
    {
      title: 'Get Support',
      subtitle: 'Technical help & FAQs',
      icon: '🛠️',
      action: 'support',
      color: '#3498DB',
    },
    {
      title: 'Visit Website',
      subtitle: 'Learn more about us',
      icon: '🌐',
      action: 'website',
      color: '#E67E22',
    },
  ];

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
          <Text style={styles.heroIcon}>📞</Text>
          <Text style={styles.heroTitle}>Get in Touch</Text>
          <Text style={styles.heroSubtitle}>
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </Text>
        </View>
      </LinearGradient>

      {/* ✅ Contact Methods */}
      <View style={styles.contactMethodsSection}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
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
                  <Text style={styles.contactMethodInfo}>{method.info}</Text>
                  <Text style={styles.contactMethodAvailability}>
                    {method.availability}
                  </Text>
                </LinearGradient>
              </InteractiveCard>
            </FloatingCard>
          ))}
        </View>
      </View>

      {/* ✅ Contact Form */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Send us a Message</Text>
        <Text style={styles.sectionSubtitle}>
          Fill out the form below and we'll get back to you soon
        </Text>

        <View style={styles.contactForm}>
          {/* Inquiry Type Selector */}
          <View style={styles.formField}>
            <Text style={styles.formLabel}>Type of Inquiry *</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.inquiryTypeSelector}
            >
              {inquiryTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.inquiryTypeButton,
                    contactForm.inquiryType === type.id && styles.inquiryTypeButtonActive,
                  ]}
                  onPress={() => setContactForm({ ...contactForm, inquiryType: type.id })}
                >
                  <Text style={styles.inquiryTypeIcon}>{type.icon}</Text>
                  <Text
                    style={[
                      styles.inquiryTypeName,
                      contactForm.inquiryType === type.id && styles.inquiryTypeNameActive,
                    ]}
                  >
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Name and Email Row */}
          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Full Name *</Text>
              <TextInput
                style={styles.formInput}
                value={contactForm.name}
                onChangeText={(text) =>
                  setContactForm({ ...contactForm, name: text })
                }
                placeholder="Your full name"
                placeholderTextColor="#A0AEC0"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Email Address *</Text>
              <TextInput
                style={styles.formInput}
                value={contactForm.email}
                onChangeText={(text) =>
                  setContactForm({ ...contactForm, email: text })
                }
                placeholder="your.email@domain.com"
                placeholderTextColor="#A0AEC0"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Phone and Subject Row */}
          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Phone Number</Text>
              <TextInput
                style={styles.formInput}
                value={contactForm.phone}
                onChangeText={(text) =>
                  setContactForm({ ...contactForm, phone: text })
                }
                placeholder="(555) 123-4567"
                placeholderTextColor="#A0AEC0"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Subject *</Text>
              <TextInput
                style={styles.formInput}
                value={contactForm.subject}
                onChangeText={(text) =>
                  setContactForm({ ...contactForm, subject: text })
                }
                placeholder="Brief subject line"
                placeholderTextColor="#A0AEC0"
              />
            </View>
          </View>

          {/* Message Field */}
          <View style={styles.formField}>
            <Text style={styles.formLabel}>Message *</Text>
            <TextInput
              style={[styles.formInput, styles.formTextArea]}
              value={contactForm.message}
              onChangeText={(text) =>
                setContactForm({ ...contactForm, message: text })
              }
              placeholder="Tell us how we can help you..."
              placeholderTextColor="#A0AEC0"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <InteractiveCard
            style={styles.submitButton}
            onPress={handleSubmitContact}
            scaleValue={0.96}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.submitButtonGradient}
            >
              <Text style={styles.submitButtonText}>📧 Send Message</Text>
            </LinearGradient>
          </InteractiveCard>
        </View>
      </View>

      {/* ✅ Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Text style={styles.sectionSubtitle}>
          Need immediate assistance? Try these options
        </Text>

        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <InteractiveCard
              key={action.action}
              style={styles.quickActionCard}
              onPress={() => handleContactAction(action.action)}
              scaleValue={0.95}
            >
              <LinearGradient
                colors={[action.color, action.color + '90']}
                style={styles.quickActionContent}
              >
                <Text style={styles.quickActionIcon}>{action.icon}</Text>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
                <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
              </LinearGradient>
            </InteractiveCard>
          ))}
        </View>
      </View>

      {/* ✅ Office Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Office Information</Text>

        <View style={styles.officeInfo}>
          <View style={styles.officeInfoItem}>
            <Text style={styles.officeInfoIcon}>🏢</Text>
            <View style={styles.officeInfoContent}>
              <Text style={styles.officeInfoTitle}>Headquarters</Text>
              <Text style={styles.officeInfoText}>
                SchoolBridge Technologies{'\n'}
                123 Education Street{'\n'}
                Learning City, LC 12345{'\n'}
                United States
              </Text>
            </View>
          </View>

          <View style={styles.officeInfoItem}>
            <Text style={styles.officeInfoIcon}>🕒</Text>
            <View style={styles.officeInfoContent}>
              <Text style={styles.officeInfoTitle}>Business Hours</Text>
              <Text style={styles.officeInfoText}>
                Monday - Friday: 8:00 AM - 6:00 PM EST{'\n'}
                Saturday: 9:00 AM - 2:00 PM EST{'\n'}
                Sunday: Closed{'\n'}
                Holiday hours may vary
              </Text>
            </View>
          </View>
        </View>
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
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 140,
    justifyContent: 'center',
  },
  contactMethodIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  contactMethodTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  contactMethodSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 6,
    textAlign: 'center',
  },
  contactMethodInfo: {
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
  contactMethodAvailability: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontStyle: 'italic',
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

  // Contact Form
  contactForm: {},
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
    height: 120,
    textAlignVertical: 'top',
  },

  // Inquiry Type Selector
  inquiryTypeSelector: {
    marginBottom: 16,
  },
  inquiryTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inquiryTypeButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  inquiryTypeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  inquiryTypeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
  },
  inquiryTypeNameActive: {
    color: '#FFFFFF',
  },

  // Submit Button
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

  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionContent: {
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },

  // Office Information
  officeInfo: {},
  officeInfoItem: {
    flexDirection: 'row',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  officeInfoIcon: {
    fontSize: 24,
    marginRight: 16,
    marginTop: 4,
  },
  officeInfoContent: {
    flex: 1,
  },
  officeInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 8,
  },
  officeInfoText: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
});

export default ContactScreen;
