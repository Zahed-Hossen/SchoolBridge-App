import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const testimonials = [
  {
    name: 'Samaira Shen',
    role: 'Teacher',
    text: 'SchoolBridge has transformed how I manage my class. Its intuitive and saves me so much time!',
    image: require('../../../assets/sarahL.png'),
  },
  {
    name: 'Anwar Sheikh',
    role: 'Parent',
    text: 'As a parent, I appreciate the seamless communication with teachers and administrators. Highly recommended!',
    image: require('../../../assets/MarkP.avif'),
  },
  {
    name: 'Jewel Ansari',
    role: 'Administrator',
    text: 'SchoolBridge has streamlined our school management processes like never before. A true game-changer!',
    image: require('../../../assets/EmilyR.avif'),
  },
];

const TestimonialCard = ({ name, role, text, image, onPress }) => (
  <TouchableOpacity style={styles.testimonialCard} onPress={onPress}>
    <View style={styles.imageContainer}>
      <Image source={image} style={styles.testimonialImage} />
    </View>
    <Text style={styles.testimonialName}>{name}</Text>
    <Text style={styles.testimonialRole}>{role}</Text>
    <Text style={styles.testimonialText}>"{text}"</Text>
  </TouchableOpacity>
);

const TestimonialsSection = ({ onTestimonialPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>What Our Users Say</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.testimonialsContainer}
      >
        {testimonials.map((testimonial, index) => (
          <TestimonialCard
            key={index}
            name={testimonial.name}
            role={testimonial.role}
            text={testimonial.text}
            image={testimonial.image}
            onPress={() => onTestimonialPress(testimonial)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e6f4ff',
    paddingVertical: SIZES.padding * 3,
    paddingHorizontal: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.h1,
    fontFamily: FONTS.bold,
    color: COLORS.primaryDark,
    textAlign: 'center',
    marginBottom: SIZES.padding * 2,
  },
  testimonialsContainer: {
    paddingHorizontal: SIZES.base,
  },
  testimonialCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 1.5,
    padding: SIZES.padding * 1.5,
    marginHorizontal: SIZES.base,
    width: 280,
    alignItems: 'center',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e6f0fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.padding,
    overflow: 'hidden',
  },
  testimonialImage: {
    width: '100%',
    height: '100%',
  },
  testimonialName: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SIZES.base / 2,
  },
  testimonialRole: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: SIZES.base,
  },
  testimonialText: {
    fontSize: SIZES.body3,
    fontFamily: FONTS.regular,
    color: COLORS.darkGray,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default TestimonialsSection;
