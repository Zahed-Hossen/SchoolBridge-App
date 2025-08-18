import React from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

// Import all section components
import HeroSection from '../../components/Landing/HeroSection';
import FeaturesSection from '../../components/Landing/FeaturesSection';
import UserRoleSection from '../../components/Landing/UserRoleSection';
import TestimonialsSection from '../../components/Landing/TestimonialsSection';
import CallToActionSection from '../../components/Landing/CallToActionSection';
import FooterSection from '../../components/Landing/FooterSection';

const LandingScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const isVisitor = !user || user?.role?.toLowerCase() === 'visitor';

  // ✅ HERO SECTION - Navigation handlers
  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  const handleSignUpPress = () => {
    navigation.navigate('SignUp');
  };

  // ✅ FEATURES SECTION - Feature interaction handler
  const handleFeaturePress = (feature) => {
    if (isVisitor) {
      Alert.alert(
        'Sign Up Required',
        'You need to create an account to access this feature',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Up',
            onPress: () => navigation.navigate('SignUp'),
          },
        ],
      );
    } else {
      navigation.navigate('Features');
    }
  };

  // ✅ USER ROLES SECTION - Role selection handler
  const handleRolePress = (role) => {
    const roleName = role.role || role;
    if (isVisitor) {
      navigation.navigate('AboutUs');
    } else {
      Alert.alert(
        'Sign Up Required',
        `Sign up to learn more about ${roleName} features`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Up',
            onPress: () => navigation.navigate('SignUp'),
          },
        ],
      );
    }
  };

  // ✅ TESTIMONIALS SECTION - Testimonial interaction handler
  const handleTestimonialPress = (testimonial) => {
    Alert.alert(
      'Testimonial',
      `"${testimonial.text}" - ${testimonial.name}, ${testimonial.role}`,
      [{ text: 'OK' }],
    );
  };

  // ✅ CALL TO ACTION SECTION - Final conversion handlers
  const handleGetStartedPress = () => {
    navigation.navigate('SignUp');
  };

  const handleLearnMorePress = () => {
    if (isVisitor) {
      Alert.alert(
        'Sign Up Required',
        'Create an account to learn more about our features',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Up',
            onPress: () => navigation.navigate('SignUp'),
          },
        ],
      );
    } else {
      navigation.navigate('Features');
    }
  };

  // ✅ FOOTER SECTION - Footer link handlers
  const handleFooterLinkPress = (linkType) => {
    switch (linkType) {
      case 'about':
      case 'features':
      case 'pricing':
      case 'contact':
      case 'privacy':
      case 'terms':
        navigation.navigate(
          linkType.charAt(0).toUpperCase() + linkType.slice(1),
        );
        break;
      case 'facebook':
      case 'twitter':
      case 'linkedin':
        Alert.alert(
          'Social Media',
          `Would you like to visit our ${linkType} page?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Continue',
              onPress: () => {
                // In a real app, you would use Linking.openURL()
                console.log(`Opening ${linkType} page`);
              },
            },
          ],
        );
        break;
      default:
        navigation.navigate('Features');
    }
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
          navigation={navigation}
          onFeaturePress={handleFeaturePress}
        />

        {/* 👥 USER ROLES SECTION - Different user types */}
        <UserRoleSection onRolePress={handleRolePress} />

        {/* 💬 TESTIMONIALS SECTION - Social proof from users */}
        <TestimonialsSection onTestimonialPress={handleTestimonialPress} />

        {/* 🚀 CALL TO ACTION SECTION - Final conversion push */}
        <CallToActionSection
          onGetStartedPress={handleGetStartedPress}
          onLearnMorePress={handleLearnMorePress}
        />

        {/* 📞 FOOTER SECTION - Links, contact info, legal */}
        <FooterSection onLinkPress={handleFooterLinkPress} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.landing,
  },
  scrollView: {
    flex: 1,
  },
});

export default LandingScreen;
