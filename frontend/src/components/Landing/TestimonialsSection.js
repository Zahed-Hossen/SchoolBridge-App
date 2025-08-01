import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const testimonials = [
  {
    name: 'Sarah L.',
    role: 'Teacher',
    text: 'SchoolBridge has transformed how I manage my class. Its intuitive and saves me so much time!',
    image: require('../../../assets/sarahL.png'),
  },
  {
    name: 'Mark P.',
    role: 'Parent',
    text: 'As a parent, I appreciate the seamless communication with teachers and administrators. Highly recommended!',
    image: require('../../../assets/MarkP.avif'),
  },
  {
    name: 'Emily R.',
    role: 'Administrator',
    text: 'SchoolBridge has streamlined our school management processes like never before. A true game-changer!',
    image: require('../../../assets/EmilyR.avif'),
  },
];

const TestimonialCard = ({ name, role, text, image }) => (
  <View style={styles.testimonialCard}>
    <Image source={image} style={styles.testimonialImage} />
    <Text style={styles.testimonialName}>{name}</Text>
    <Text style={styles.testimonialRole}>{role}</Text>
    <Text style={styles.testimonialText}>"{text}"</Text>
  </View>
);

const TestimonialsSection = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>What Our Users Are Saying</Text>

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
          />
        ))}
      </ScrollView>
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
    color: '#155677',
    textAlign: 'center',
    marginBottom: SIZES.padding * 2,
  },
  testimonialsContainer: {
    paddingHorizontal: SIZES.base,
  },
  testimonialCard: {
    backgroundColor: '#e3f1fb',
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 1.5,
    marginHorizontal: SIZES.base,
    width: 280,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c1e5f6',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testimonialImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: SIZES.padding,
  },
  testimonialName: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.semiBold,
    color: '#155677',
    textAlign: 'center',
    marginBottom: SIZES.base / 2,
  },
  testimonialRole: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.regular,
    color: '#155677',
    textAlign: 'center',
    marginBottom: SIZES.base,
  },
  testimonialText: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.regular,
    color: '#155677',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default TestimonialsSection;
