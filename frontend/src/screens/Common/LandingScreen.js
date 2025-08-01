import React from 'react';
import {
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';

// Import all section components
import HeroSection from '../../components/Landing/HeroSection';
import FeaturesSection from '../../components/Landing/FeaturesSection';
import UserRoleSection from '../../components/Landing/UserRoleSection';
import TestimonialsSection from '../../components/Landing/TestimonialsSection';
import CallToActionSection from '../../components/Landing/CallToActionSection';
import FooterSection from '../../components/Landing/FooterSection';

const LandingScreen = () => {
  const navigation = useNavigation();

  // ✅ HERO SECTION - Navigation handlers
  const handleLoginPress = () => {
    console.log('Navigating to Login...');
    navigation.navigate('Login');
  };

  const handleSignUpPress = () => {
    console.log('Navigating to SignUp...');
    navigation.navigate('SignUp');
  };

  // ✅ FEATURES SECTION - Feature interaction handler
  const handleFeaturePress = (feature) => {
    console.log('Feature pressed:', feature);
    Alert.alert(
      'Feature',
      `Learn more about ${feature.title || feature}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Up',
          onPress: () => navigation.navigate('SignUp'),
        },
      ]
    );
  };

  // ✅ USER ROLES SECTION - Role selection handler
  const handleRolePress = (role) => {
    console.log('Role pressed:', role);
    const roleName = role.role || role;
    Alert.alert(
      roleName,
      `Learn more about how ${roleName.toLowerCase()}s use SchoolBridge`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Get Started',
          onPress: () => navigation.navigate('SignUp'),
        },
        {
          text: 'Login',
          onPress: () => navigation.navigate('Login'),
        },
      ]
    );
  };

  // ✅ TESTIMONIALS SECTION - Testimonial interaction handler
  const handleTestimonialPress = (testimonial) => {
    console.log('Testimonial pressed:', testimonial);
    Alert.alert(
      'Testimonial',
      `"${testimonial.text}" - ${testimonial.name}, ${testimonial.role}`,
      [{ text: 'OK' }]
    );
  };

  // ✅ CALL TO ACTION SECTION - Final conversion handlers
  const handleGetStartedPress = () => {
    console.log('Get Started CTA pressed');
    navigation.navigate('Login');
  };

  const handleLearnMorePress = () => {
    console.log('Learn More pressed');
    Alert.alert(
      'Learn More',
      'Visit our website or contact us for more information about SchoolBridge.\n\n📧 info@schoolbridge.com\n🌐 www.schoolbridge.com\n📱 +1-555-0123',
      [
        { text: 'Contact Us', onPress: () => console.log('Contact pressed') },
        { text: 'OK' }
      ]
    );
  };

  // ✅ FOOTER SECTION - Footer link handlers
  const handleFooterLinkPress = (linkType) => {
    console.log('Footer link pressed:', linkType);
    Alert.alert(
      'Coming Soon',
      `${linkType} page will be available soon!`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={true}
        bouncesZoom={false}
      >

        {/* 🎨 HERO SECTION - Welcome banner with primary CTAs */}
        <HeroSection
          onLoginPress={handleLoginPress}
          onSignUpPress={handleSignUpPress}
        />

        {/* 📋 FEATURES SECTION - 4 key features in 2x2 grid */}
        <FeaturesSection
          onFeaturePress={handleFeaturePress}
        />

        {/* 👥 USER ROLES SECTION - Different user types */}
        <UserRoleSection
          onRolePress={handleRolePress}
        />

        {/* 💬 TESTIMONIALS SECTION - Social proof from users */}
        <TestimonialsSection
          onTestimonialPress={handleTestimonialPress}
        />

        {/* 🚀 CALL TO ACTION SECTION - Final conversion push */}
        <CallToActionSection
          onGetStartedPress={handleGetStartedPress}
          onLearnMorePress={handleLearnMorePress}
        />

        {/* 📞 FOOTER SECTION - Links, contact info, legal */}
        <FooterSection
          onLinkPress={handleFooterLinkPress}
        />

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
});

export default LandingScreen;
