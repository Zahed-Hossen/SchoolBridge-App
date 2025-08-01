import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const features = [
  {
    icon: '👨‍🎓',
    title: 'Student Management',
    description:
      'Easily manage student profiles, attendance, and grades in one place.',
  },
  {
    icon: '👩‍🏫',
    title: 'Teacher Collaboration',
    description: 'Facilitate communication and collaboration among teachers.',
  },
  {
    icon: '👨‍👩‍👧‍👦',
    title: 'Parent Engagement',
    description:
      'Keep parents informed with progress updates and school notifications.',
  },
  {
    icon: '⚙️',
    title: 'Administrative Efficiency',
    description: 'Streamline administrative tasks to save time and resources.',
  },
];

const FeatureCard = ({ icon, title, description, onPress }) => (
  <TouchableOpacity style={styles.featureCard} onPress={onPress}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureDescription}>{description}</Text>
    <View style={styles.featureButton}>
      <Text style={styles.featureButtonText}>Learn More</Text>
    </View>
  </TouchableOpacity>
);

const FeaturesSection = ({ onFeaturePress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Our Key Features</Text>

      {/* ✅ FIXED: Changed from horizontal ScrollView to 2x2 grid */}
      <View style={styles.featuresGrid}>
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            onPress={() => onFeaturePress && onFeaturePress(feature)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#c1e5f6',
    paddingVertical: SIZES.padding * 3,
    paddingHorizontal: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.h1,
    fontFamily: FONTS.bold,
    color: '#0f2f42',
    textAlign: 'center',
    marginBottom: SIZES.padding * 2,
  },

  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.base,
  },
  featureCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 1.5,
    marginBottom: SIZES.padding,
    width: '48%',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: SIZES.padding,
  },
  featureTitle: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.semiBold,
    color: '#155677',
    textAlign: 'center',
    marginBottom: SIZES.base,
  },
  featureDescription: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: '#174863',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SIZES.padding,
    minHeight: 40,
  },
  featureButton: {
    backgroundColor: '#007bff',
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  featureButtonText: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
});

export default FeaturesSection;

