
// import React, { useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Image,
//   Dimensions,
//   TouchableOpacity,
//   Linking,
//   Platform,
//   Animated,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { COLORS, FONTS, SPACING } from '../../constants/theme';

// const { width, height } = Dimensions.get('window');
// const isTablet = width > 768;

// // ✅ Interactive Card Component with Hover Effects
// const InteractiveCard = ({ children, style, onPress, scaleValue = 0.98 }) => {
//   const animatedValue = useRef(new Animated.Value(1)).current;

//   const handlePressIn = () => {
//     Animated.spring(animatedValue, {
//       toValue: scaleValue,
//       useNativeDriver: true,
//       tension: 150,
//       friction: 4,
//     }).start();
//   };

//   const handlePressOut = () => {
//     Animated.spring(animatedValue, {
//       toValue: 1,
//       useNativeDriver: true,
//       tension: 150,
//       friction: 4,
//     }).start();
//   };

//   return (
//     <TouchableOpacity
//       activeOpacity={0.9}
//       onPressIn={handlePressIn}
//       onPressOut={handlePressOut}
//       onPress={onPress}
//     >
//       <Animated.View
//         style={[
//           style,
//           {
//             transform: [{ scale: animatedValue }],
//           },
//         ]}
//       >
//         {children}
//       </Animated.View>
//     </TouchableOpacity>
//   );
// };

// // ✅ Floating Animation Component
// const FloatingCard = ({ children, style, delay = 0 }) => {
//   const floatValue = useRef(new Animated.Value(0)).current;

//   React.useEffect(() => {
//     const floating = Animated.loop(
//       Animated.sequence([
//         Animated.timing(floatValue, {
//           toValue: 1,
//           duration: 3000 + delay,
//           useNativeDriver: true,
//         }),
//         Animated.timing(floatValue, {
//           toValue: 0,
//           duration: 3000 + delay,
//           useNativeDriver: true,
//         }),
//       ])
//     );
//     floating.start();
//     return () => floating.stop();
//   }, []);

//   const translateY = floatValue.interpolate({
//     inputRange: [0, 1],
//     outputRange: [0, -8],
//   });

//   return (
//     <Animated.View
//       style={[
//         style,
//         {
//           transform: [{ translateY }],
//         },
//       ]}
//     >
//       {children}
//     </Animated.View>
//   );
// };

// // ✅ Pulse Animation Component for Icons
// const PulseIcon = ({ children, style, color }) => {
//   const pulseValue = useRef(new Animated.Value(1)).current;

//   React.useEffect(() => {
//     const pulse = Animated.loop(
//       Animated.sequence([
//         Animated.timing(pulseValue, {
//           toValue: 1.2,
//           duration: 1500,
//           useNativeDriver: true,
//         }),
//         Animated.timing(pulseValue, {
//           toValue: 1,
//           duration: 1500,
//           useNativeDriver: true,
//         }),
//       ])
//     );
//     pulse.start();
//     return () => pulse.stop();
//   }, []);

//   return (
//     <Animated.View
//       style={[
//         style,
//         {
//           transform: [{ scale: pulseValue }],
//         },
//       ]}
//     >
//       {children}
//     </Animated.View>
//   );
// };

// const FeaturesScreen = ({ navigation }) => {
//   const handleButtonPress = (action) => {
//     switch (action) {
//       case 'getStarted':
//         navigation.navigate('SignUp');
//         break;
//       case 'learnMore':
//         Linking.openURL('https://schoolbridge.com/features');
//         break;
//       case 'demo':
//         navigation.navigate('Demo');
//         break;
//       case 'pricing':
//         navigation.navigate('Pricing');
//         break;
//       case 'contact':
//         navigation.navigate('Contact');
//         break;
//       default:
//         break;
//     }
//   };

//   return (
//     <ScrollView
//       style={styles.container}
//       showsVerticalScrollIndicator={false}
//       bounces={true}
//     >
//       {/* ✅ Enhanced Hero Section */}
//       <LinearGradient
//         colors={['#667eea', '#764ba2', '#f093fb']}
//         style={styles.heroSection}
//       >
//         <View style={styles.heroContent}>
//           <Text style={styles.heroTitle}>Discover Our Features</Text>
//           <Text style={styles.heroSubtitle}>
//             Powerful tools designed to transform your school's digital experience
//           </Text>
//           <View style={styles.heroBadge}>
//             <Text style={styles.heroBadgeText}>🚀 50+ Amazing Features</Text>
//           </View>

//           <View style={styles.heroButtons}>
//             <InteractiveCard
//               style={styles.primaryHeroButton}
//               onPress={() => handleButtonPress('getStarted')}
//               scaleValue={0.96}
//             >
//               <LinearGradient
//                 colors={['#FF6B6B', '#FF8E8E']}
//                 style={styles.heroButtonGradient}
//               >
//                 <Text style={styles.primaryButtonText}>🎯 Get Started Free</Text>
//               </LinearGradient>
//             </InteractiveCard>

//             <InteractiveCard
//               style={styles.secondaryHeroButton}
//               onPress={() => handleButtonPress('demo')}
//               scaleValue={0.96}
//             >
//               <Text style={styles.secondaryButtonText}>📱 View Demo</Text>
//             </InteractiveCard>
//           </View>
//         </View>
//       </LinearGradient>

//       {/* ✅ Key Stats Section */}
//       <View style={styles.statsSection}>
//         <Text style={styles.statsTitle}>Trusted by Educators Worldwide</Text>
//         <View style={styles.statsGrid}>
//           {[
//             { number: '50+', label: 'Features', icon: '⚡', color: '#FF6B6B' },
//             { number: '10K+', label: 'Schools', icon: '🏫', color: '#4ECDC4' },
//             { number: '99.9%', label: 'Uptime', icon: '🔒', color: '#45B7D1' },
//             { number: '24/7', label: 'Support', icon: '🛟', color: '#96CEB4' }
//           ].map((stat, index) => (
//             <FloatingCard
//               key={index}
//               style={[styles.statCard, { borderTopColor: stat.color }]}
//               delay={index * 300}
//             >
//               <InteractiveCard
//                 onPress={() => console.log(`Stat ${stat.label} pressed`)}
//                 scaleValue={0.95}
//               >
//                 <View style={styles.statContent}>
//                   <PulseIcon color={stat.color}>
//                     <Text style={styles.statIcon}>{stat.icon}</Text>
//                   </PulseIcon>
//                   <Text style={[styles.statNumber, { color: stat.color }]}>{stat.number}</Text>
//                   <Text style={styles.statLabel}>{stat.label}</Text>
//                 </View>
//               </InteractiveCard>
//             </FloatingCard>
//           ))}
//         </View>
//       </View>

//       {/* ✅ Core Features Section */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Core Features</Text>
//         <Text style={styles.sectionSubtitle}>Everything you need to manage your school efficiently</Text>

//         <View style={styles.featuresGrid}>
//           {[
//             {
//               icon: '👥',
//               title: 'Student Management',
//               description: 'Complete student profiles, attendance tracking, and academic progress monitoring',
//               color: '#FF6B6B',
//               features: ['Profile Management', 'Attendance Tracking', 'Grade Monitoring', 'Parent Communication']
//             },
//             {
//               icon: '📚',
//               title: 'Academic Tools',
//               description: 'Powerful tools for curriculum management, assignments, and assessments',
//               color: '#4ECDC4',
//               features: ['Curriculum Planning', 'Assignment Creation', 'Online Assessments', 'Grade Book']
//             },
//             {
//               icon: '💬',
//               title: 'Communication Hub',
//               description: 'Seamless communication between teachers, students, and parents',
//               color: '#45B7D1',
//               features: ['Instant Messaging', 'Announcements', 'Parent Notifications', 'Discussion Forums']
//             },
//             {
//               icon: '📊',
//               title: 'Analytics & Reports',
//               description: 'Comprehensive analytics and customizable reports for data-driven decisions',
//               color: '#96CEB4',
//               features: ['Performance Analytics', 'Custom Reports', 'Data Visualization', 'Export Options']
//             },
//             {
//               icon: '🗓️',
//               title: 'Schedule Management',
//               description: 'Smart scheduling system for classes, events, and school activities',
//               color: '#FFD93D',
//               features: ['Class Scheduling', 'Event Planning', 'Resource Booking', 'Calendar Integration']
//             },
//             {
//               icon: '💰',
//               title: 'Financial Management',
//               description: 'Complete fee management system with online payment integration',
//               color: '#FF9FF3',
//               features: ['Fee Collection', 'Payment Gateway', 'Financial Reports', 'Invoice Generation']
//             }
//           ].map((feature, index) => (
//             <View key={index} style={styles.featureCardWrapper}>
//               <InteractiveCard
//                 onPress={() => console.log(`Feature ${feature.title} pressed`)}
//                 scaleValue={0.97}
//               >
//                 <LinearGradient
//                   colors={['#FFFFFF', '#F8F9FA']}
//                   style={[styles.featureCard, { borderTopColor: feature.color }]}
//                 >
//                   <View style={[styles.featureIconContainer, { backgroundColor: feature.color + '20' }]}>
//                     <Text style={styles.featureIcon}>{feature.icon}</Text>
//                   </View>

//                   <Text style={styles.featureTitle}>{feature.title}</Text>
//                   <Text style={styles.featureDescription}>{feature.description}</Text>

//                   <View style={styles.featuresList}>
//                     {feature.features.map((item, idx) => (
//                       <View key={idx} style={styles.featureItem}>
//                         <Text style={[styles.featureBullet, { color: feature.color }]}>✓</Text>
//                         <Text style={styles.featureItemText}>{item}</Text>
//                       </View>
//                     ))}
//                   </View>

//                   <TouchableOpacity style={[styles.featureButton, { backgroundColor: feature.color }]}>
//                     <Text style={styles.featureButtonText}>Learn More</Text>
//                   </TouchableOpacity>
//                 </LinearGradient>
//               </InteractiveCard>
//             </View>
//           ))}
//         </View>
//       </View>

//       {/* ✅ Advanced Features Section */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Advanced Features</Text>
//         <Text style={styles.sectionSubtitle}>Next-generation tools for modern education</Text>

//         <View style={styles.advancedFeaturesGrid}>
//           {[
//             {
//               icon: '🤖',
//               title: 'AI-Powered Insights',
//               description: 'Machine learning algorithms provide personalized recommendations and predictive analytics',
//               color: '#667eea',
//               badge: 'NEW'
//             },
//             {
//               icon: '☁️',
//               title: 'Cloud Integration',
//               description: 'Seamless cloud storage and synchronization across all devices',
//               color: '#764ba2',
//               badge: 'POPULAR'
//             },
//             {
//               icon: '🔐',
//               title: 'Enterprise Security',
//               description: 'Bank-level security with encryption, backup, and compliance features',
//               color: '#f093fb',
//               badge: 'SECURE'
//             },
//             {
//               icon: '📱',
//               title: 'Mobile First',
//               description: 'Native mobile apps for iOS and Android with offline capabilities',
//               color: '#a8edea',
//               badge: 'MOBILE'
//             }
//           ].map((feature, index) => (
//             <InteractiveCard
//               key={index}
//               style={styles.advancedFeatureCard}
//               onPress={() => console.log(`Advanced feature ${feature.title} pressed`)}
//               scaleValue={0.98}
//             >
//               <LinearGradient
//                 colors={[feature.color + '20', '#FFFFFF']}
//                 style={styles.advancedFeatureContent}
//               >
//                 <View style={styles.advancedFeatureHeader}>
//                   <View style={[styles.advancedIconContainer, { backgroundColor: feature.color }]}>
//                     <Text style={styles.advancedIcon}>{feature.icon}</Text>
//                   </View>
//                   <View style={[styles.featureBadge, { backgroundColor: feature.color }]}>
//                     <Text style={styles.featureBadgeText}>{feature.badge}</Text>
//                   </View>
//                 </View>

//                 <Text style={styles.advancedFeatureTitle}>{feature.title}</Text>
//                 <Text style={styles.advancedFeatureDescription}>{feature.description}</Text>
//               </LinearGradient>
//             </InteractiveCard>
//           ))}
//         </View>
//       </View>

//       {/* ✅ Interactive Testimonials */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>What Users Love</Text>
//         <Text style={styles.sectionSubtitle}>Real feedback from our amazing community</Text>

//         {[
//           {
//             text: "SchoolBridge has revolutionized how we manage our school. The features are comprehensive and user-friendly!",
//             author: "Dr. Sarah Chen",
//             role: "Principal",
//             school: "Greenwood High School",
//             rating: 5,
//             color: '#FF6B6B',
//             avatar: '👩‍💼'
//           },
//           {
//             text: "The student management system is incredible! It saves us hours of administrative work every week.",
//             author: "Michael Rodriguez",
//             role: "Administrator",
//             school: "Oak Valley Elementary",
//             rating: 5,
//             color: '#4ECDC4',
//             avatar: '👨‍💼'
//           },
//           {
//             text: "Communication with parents has never been easier. The notification system is a game-changer!",
//             author: "Emma Thompson",
//             role: "Teacher",
//             school: "Riverside Academy",
//             rating: 5,
//             color: '#45B7D1',
//             avatar: '👩‍🏫'
//           }
//         ].map((testimonial, index) => (
//           <InteractiveCard
//             key={index}
//             style={styles.testimonialWrapper}
//             onPress={() => console.log(`Testimonial ${testimonial.author} pressed`)}
//             scaleValue={0.98}
//           >
//             <LinearGradient
//               colors={['#FFFFFF', '#F8F9FA']}
//               style={[styles.testimonialCard, { borderLeftColor: testimonial.color }]}
//             >
//               <View style={styles.testimonialHeader}>
//                 <View style={[styles.avatarContainer, { backgroundColor: testimonial.color + '20' }]}>
//                   <Text style={styles.avatarIcon}>{testimonial.avatar}</Text>
//                 </View>

//                 <View style={styles.testimonialInfo}>
//                   <Text style={styles.testimonialAuthor}>{testimonial.author}</Text>
//                   <Text style={styles.testimonialRole}>{testimonial.role}</Text>
//                   <Text style={styles.testimonialSchool}>{testimonial.school}</Text>
//                 </View>

//                 <View style={styles.ratingContainer}>
//                   {[...Array(testimonial.rating)].map((_, i) => (
//                     <Text key={i} style={styles.star}>⭐</Text>
//                   ))}
//                 </View>
//               </View>

//               <Text style={styles.testimonialText}>"{testimonial.text}"</Text>

//               <View style={[styles.testimonialAccent, { backgroundColor: testimonial.color }]} />
//             </LinearGradient>
//           </InteractiveCard>
//         ))}
//       </View>

//       {/* ✅ FAQ Section */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
//         <Text style={styles.sectionSubtitle}>Get answers to common questions</Text>

//         {[
//           {
//             question: "Is there a free trial available?",
//             answer: "Yes! We offer a 30-day free trial with full access to all features. No credit card required.",
//             icon: "❓",
//             color: "#FF6B6B"
//           },
//           {
//             question: "How secure is our school data?",
//             answer: "We use bank-level encryption and comply with all education data privacy regulations including FERPA and COPPA.",
//             icon: "🔒",
//             color: "#4ECDC4"
//           },
//           {
//             question: "Can we integrate with existing systems?",
//             answer: "Absolutely! We support integration with popular SIS, LMS, and other education platforms through our API.",
//             icon: "🔌",
//             color: "#45B7D1"
//           },
//           {
//             question: "What support options are available?",
//             answer: "We provide 24/7 customer support, comprehensive documentation, training materials, and dedicated account managers.",
//             icon: "🛟",
//             color: "#96CEB4"
//           }
//         ].map((faq, index) => (
//           <InteractiveCard
//             key={index}
//             style={styles.faqWrapper}
//             onPress={() => console.log(`FAQ ${index + 1} pressed`)}
//             scaleValue={0.98}
//           >
//             <View style={[styles.faqCard, { borderLeftColor: faq.color }]}>
//               <View style={styles.faqHeader}>
//                 <View style={[styles.faqIconContainer, { backgroundColor: faq.color + '20' }]}>
//                   <Text style={styles.faqIcon}>{faq.icon}</Text>
//                 </View>
//                 <Text style={styles.faqQuestion}>{faq.question}</Text>
//               </View>
//               <Text style={styles.faqAnswer}>{faq.answer}</Text>
//             </View>
//           </InteractiveCard>
//         ))}
//       </View>

//       {/* ✅ Call to Action Section */}
//       <View style={styles.ctaSection}>
//         <LinearGradient
//           colors={['#667eea', '#764ba2']}
//           style={styles.ctaContainer}
//         >
//           <Text style={styles.ctaTitle}>Ready to Get Started?</Text>
//           <Text style={styles.ctaSubtitle}>
//             Join thousands of schools already using SchoolBridge to transform education
//           </Text>

//           <View style={styles.ctaStats}>
//             <View style={styles.ctaStat}>
//               <Text style={styles.ctaStatNumber}>10,000+</Text>
//               <Text style={styles.ctaStatLabel}>Schools Trust Us</Text>
//             </View>
//             <View style={styles.ctaStat}>
//               <Text style={styles.ctaStatNumber}>98%</Text>
//               <Text style={styles.ctaStatLabel}>Satisfaction Rate</Text>
//             </View>
//           </View>

//           <View style={styles.ctaButtons}>
//             <InteractiveCard
//               style={styles.ctaPrimaryButton}
//               onPress={() => handleButtonPress('getStarted')}
//               scaleValue={0.96}
//             >
//               <LinearGradient
//                 colors={['#FF6B6B', '#FF8E8E']}
//                 style={styles.ctaButtonGradient}
//               >
//                 <Text style={styles.ctaPrimaryButtonText}>🚀 Start Free Trial</Text>
//               </LinearGradient>
//             </InteractiveCard>

//             <View style={styles.ctaSecondaryButtons}>
//               <InteractiveCard
//                 style={styles.ctaSecondaryButton}
//                 onPress={() => handleButtonPress('demo')}
//                 scaleValue={0.96}
//               >
//                 <Text style={styles.ctaSecondaryButtonText}>📱 View Demo</Text>
//               </InteractiveCard>

//               <InteractiveCard
//                 style={styles.ctaSecondaryButton}
//                 onPress={() => handleButtonPress('pricing')}
//                 scaleValue={0.96}
//               >
//                 <Text style={styles.ctaSecondaryButtonText}>💰 See Pricing</Text>
//               </InteractiveCard>
//             </View>
//           </View>
//         </LinearGradient>
//       </View>

//       {/* ✅ Footer */}
//       <View style={styles.footer}>
//         <Text style={styles.footerTitle}>Need Help Getting Started?</Text>
//         <Text style={styles.footerSubtitle}>Our team is here to help you succeed</Text>

//         <View style={styles.footerButtons}>
//           <InteractiveCard
//             style={styles.footerButton}
//             onPress={() => handleButtonPress('contact')}
//             scaleValue={0.95}
//           >
//             <Text style={styles.footerButtonText}>📞 Contact Sales</Text>
//           </InteractiveCard>

//           <InteractiveCard
//             style={styles.footerButton}
//             onPress={() => handleButtonPress('learnMore')}
//             scaleValue={0.95}
//           >
//             <Text style={styles.footerButtonText}>📚 Documentation</Text>
//           </InteractiveCard>
//         </View>

//         <Text style={styles.footerText}>© 2024 SchoolBridge. All rights reserved.</Text>
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8FAFB',
//   },

//   // ✅ Hero Section
//   heroSection: {
//     paddingVertical: 60,
//     paddingHorizontal: 20,
//     alignItems: 'center',
//     minHeight: height * 0.4,
//     justifyContent: 'center',
//   },
//   heroContent: {
//     alignItems: 'center',
//     maxWidth: 600,
//   },
//   heroTitle: {
//     fontSize: isTablet ? 36 : 30,
//     fontWeight: '800',
//     color: '#FFFFFF',
//     textAlign: 'center',
//     marginBottom: 16,
//     textShadowColor: 'rgba(0, 0, 0, 0.3)',
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 3,
//   },
//   heroSubtitle: {
//     fontSize: isTablet ? 22 : 18,
//     color: '#FFFFFF',
//     textAlign: 'center',
//     marginBottom: 20,
//     opacity: 0.95,
//     lineHeight: 26,
//   },
//   heroBadge: {
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 25,
//     marginBottom: 30,
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.3)',
//   },
//   heroBadgeText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   heroButtons: {
//     width: '100%',
//     gap: 16,
//   },
//   primaryHeroButton: {
//     borderRadius: 16,
//     overflow: 'hidden',
//     shadowColor: '#FF6B6B',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   heroButtonGradient: {
//     paddingVertical: 18,
//     paddingHorizontal: 32,
//     alignItems: 'center',
//   },
//   primaryButtonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   secondaryHeroButton: {
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     borderRadius: 16,
//     paddingVertical: 18,
//     paddingHorizontal: 32,
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: 'rgba(255, 255, 255, 0.3)',
//   },
//   secondaryButtonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: '600',
//   },

//   // ✅ Stats Section
//   statsSection: {
//     backgroundColor: '#FFFFFF',
//     marginHorizontal: 16,
//     marginTop: -30,
//     borderRadius: 20,
//     padding: 24,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.12,
//     shadowRadius: 16,
//     elevation: 8,
//     zIndex: 10,
//   },
//   statsTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: '#1A202C',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   statsGrid: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     flexWrap: 'wrap',
//     gap: 12,
//   },
//   statCard: {
//     backgroundColor: '#F8F9FA',
//     borderRadius: 16,
//     padding: 16,
//     alignItems: 'center',
//     minWidth: (width - 100) / 4,
//     borderTopWidth: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   statContent: {
//     alignItems: 'center',
//   },
//   statIcon: {
//     fontSize: 24,
//     marginBottom: 8,
//   },
//   statNumber: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 4,
//   },
//   statLabel: {
//     fontSize: 12,
//     color: '#666',
//     textAlign: 'center',
//     fontWeight: '500',
//   },

//   // ✅ Section Styles
//   section: {
//     backgroundColor: '#FFFFFF',
//     marginHorizontal: 16,
//     marginTop: 20,
//     borderRadius: 20,
//     padding: 24,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.08,
//     shadowRadius: 12,
//     elevation: 6,
//   },
//   sectionTitle: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#1A202C',
//     textAlign: 'center',
//     marginBottom: 12,
//   },
//   sectionSubtitle: {
//     fontSize: 16,
//     color: '#718096',
//     textAlign: 'center',
//     marginBottom: 32,
//     lineHeight: 24,
//   },

//   // ✅ Features Grid
//   featuresGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//     gap: 16,
//   },
//   featureCardWrapper: {
//     width: isTablet ? '48%' : '100%',
//     marginBottom: 20,
//   },
//   featureCard: {
//     borderRadius: 20,
//     padding: 24,
//     borderTopWidth: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 6,
//     minHeight: 320,
//   },
//   featureIconContainer: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   featureIcon: {
//     fontSize: 28,
//   },
//   featureTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1A202C',
//     marginBottom: 12,
//   },
//   featureDescription: {
//     fontSize: 14,
//     color: '#4A5568',
//     lineHeight: 22,
//     marginBottom: 16,
//   },
//   featuresList: {
//     marginBottom: 20,
//   },
//   featureItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   featureBullet: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginRight: 8,
//   },
//   featureItemText: {
//     fontSize: 13,
//     color: '#4A5568',
//     flex: 1,
//   },
//   featureButton: {
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 25,
//     alignItems: 'center',
//     marginTop: 'auto',
//   },
//   featureButtonText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontWeight: '600',
//   },

//   // ✅ Advanced Features
//   advancedFeaturesGrid: {
//     gap: 16,
//   },
//   advancedFeatureCard: {
//     marginBottom: 16,
//   },
//   advancedFeatureContent: {
//     borderRadius: 16,
//     padding: 24,
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//   },
//   advancedFeatureHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   advancedIconContainer: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   advancedIcon: {
//     fontSize: 24,
//     color: '#FFFFFF',
//   },
//   featureBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 15,
//   },
//   featureBadgeText: {
//     color: '#FFFFFF',
//     fontSize: 10,
//     fontWeight: '700',
//   },
//   advancedFeatureTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1A202C',
//     marginBottom: 8,
//   },
//   advancedFeatureDescription: {
//     fontSize: 14,
//     color: '#4A5568',
//     lineHeight: 22,
//   },

//   // ✅ Testimonials
//   testimonialWrapper: {
//     marginBottom: 20,
//   },
//   testimonialCard: {
//     borderRadius: 16,
//     padding: 24,
//     borderLeftWidth: 6,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   testimonialHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   avatarContainer: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 16,
//   },
//   avatarIcon: {
//     fontSize: 24,
//   },
//   testimonialInfo: {
//     flex: 1,
//   },
//   testimonialAuthor: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1A202C',
//   },
//   testimonialRole: {
//     fontSize: 13,
//     color: '#718096',
//     marginTop: 2,
//   },
//   testimonialSchool: {
//     fontSize: 12,
//     color: '#A0AEC0',
//     marginTop: 1,
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//   },
//   star: {
//     fontSize: 16,
//   },
//   testimonialText: {
//     fontSize: 15,
//     color: '#4A5568',
//     lineHeight: 24,
//     fontStyle: 'italic',
//   },
//   testimonialAccent: {
//     position: 'absolute',
//     top: 20,
//     right: 20,
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     opacity: 0.3,
//   },

//   // ✅ FAQ Section
//   faqWrapper: {
//     marginBottom: 16,
//   },
//   faqCard: {
//     backgroundColor: '#F7FAFC',
//     borderRadius: 16,
//     padding: 20,
//     borderLeftWidth: 4,
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//   },
//   faqHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   faqIconContainer: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 16,
//   },
//   faqIcon: {
//     fontSize: 20,
//   },
//   faqQuestion: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1A202C',
//     flex: 1,
//   },
//   faqAnswer: {
//     fontSize: 14,
//     color: '#4A5568',
//     lineHeight: 22,
//     marginLeft: 56,
//   },

//   // ✅ CTA Section
//   ctaSection: {
//     marginHorizontal: 16,
//     marginTop: 20,
//   },
//   ctaContainer: {
//     borderRadius: 20,
//     padding: 32,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.15,
//     shadowRadius: 16,
//     elevation: 10,
//   },
//   ctaTitle: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#FFFFFF',
//     textAlign: 'center',
//     marginBottom: 12,
//   },
//   ctaSubtitle: {
//     fontSize: 16,
//     color: '#FFFFFF',
//     textAlign: 'center',
//     marginBottom: 24,
//     opacity: 0.9,
//     lineHeight: 24,
//   },
//   ctaStats: {
//     flexDirection: 'row',
//     gap: 40,
//     marginBottom: 32,
//   },
//   ctaStat: {
//     alignItems: 'center',
//   },
//   ctaStatNumber: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//   },
//   ctaStatLabel: {
//     fontSize: 12,
//     color: '#FFFFFF',
//     opacity: 0.8,
//     marginTop: 4,
//   },
//   ctaButtons: {
//     width: '100%',
//     gap: 16,
//   },
//   ctaPrimaryButton: {
//     borderRadius: 16,
//     overflow: 'hidden',
//     shadowColor: '#FF6B6B',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   ctaButtonGradient: {
//     paddingVertical: 18,
//     paddingHorizontal: 32,
//     alignItems: 'center',
//   },
//   ctaPrimaryButtonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   ctaSecondaryButtons: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   ctaSecondaryButton: {
//     flex: 1,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     borderRadius: 16,
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: 'rgba(255, 255, 255, 0.3)',
//   },
//   ctaSecondaryButtonText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontWeight: '600',
//   },

//   // ✅ Footer
//   footer: {
//     backgroundColor: '#FFFFFF',
//     margin: 16,
//     borderRadius: 20,
//     padding: 32,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.08,
//     shadowRadius: 12,
//     elevation: 6,
//   },
//   footerTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#1A202C',
//     textAlign: 'center',
//     marginBottom: 8,
//   },
//   footerSubtitle: {
//     fontSize: 14,
//     color: '#718096',
//     textAlign: 'center',
//     marginBottom: 24,
//   },
//   footerButtons: {
//     flexDirection: 'row',
//     gap: 16,
//     marginBottom: 20,
//   },
//   footerButton: {
//     backgroundColor: '#F7FAFC',
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//   },
//   footerButtonText: {
//     fontSize: 14,
//     color: '#4A5568',
//     fontWeight: '500',
//   },
//   footerText: {
//     fontSize: 12,
//     color: '#A0AEC0',
//     textAlign: 'center',
//   },
// });

// export default FeaturesScreen;













import React, { useRef, useState } from 'react';
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

// ✅ Pulse Animation Component for Icons
const PulseIcon = ({ children, style, color }) => {
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

const FeaturesScreen = ({ navigation }) => {
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);

  const handleButtonPress = (action) => {
    switch (action) {
      case 'getStarted':
        navigation.navigate('SignUp');
        break;
      case 'learnMore':
        Linking.openURL('https://schoolbridge.com/features');
        break;
      case 'demo':
        navigation.navigate('Demo');
        break;
      case 'pricing':
        navigation.navigate('Pricing');
        break;
      case 'contact':
        navigation.navigate('Contact');
        break;
      default:
        break;
    }
  };

  const featuresData = [
    {
      icon: '👥',
      title: 'Student Management',
      description: 'Complete student profiles, attendance tracking, and academic progress monitoring',
      color: '#FF6B6B',
      features: ['Profile Management', 'Attendance Tracking', 'Grade Monitoring', 'Parent Communication']
    },
    {
      icon: '📚',
      title: 'Academic Tools',
      description: 'Powerful tools for curriculum management, assignments, and assessments',
      color: '#4ECDC4',
      features: ['Curriculum Planning', 'Assignment Creation', 'Online Assessments', 'Grade Book']
    },
    {
      icon: '💬',
      title: 'Communication Hub',
      description: 'Seamless communication between teachers, students, and parents',
      color: '#45B7D1',
      features: ['Instant Messaging', 'Announcements', 'Parent Notifications', 'Discussion Forums']
    },
    {
      icon: '📊',
      title: 'Analytics & Reports',
      description: 'Comprehensive analytics and customizable reports for data-driven decisions',
      color: '#96CEB4',
      features: ['Performance Analytics', 'Custom Reports', 'Data Visualization', 'Export Options']
    },
    {
      icon: '🗓️',
      title: 'Schedule Management',
      description: 'Smart scheduling system for classes, events, and school activities',
      color: '#FFD93D',
      features: ['Class Scheduling', 'Event Planning', 'Resource Booking', 'Calendar Integration']
    },
    {
      icon: '💰',
      title: 'Financial Management',
      description: 'Complete fee management system with online payment integration',
      color: '#FF9FF3',
      features: ['Fee Collection', 'Payment Gateway', 'Financial Reports', 'Invoice Generation']
    }
  ];

  const testimonialsData = [
    {
      text: "SchoolBridge has revolutionized how we manage our school. The features are comprehensive and user-friendly!",
      author: "Dr. Sarah Chen",
      role: "Principal",
      school: "Greenwood High School",
      rating: 5,
      color: '#FF6B6B',
      avatar: '👩‍💼'
    },
    {
      text: "The student management system is incredible! It saves us hours of administrative work every week.",
      author: "Michael Rodriguez",
      role: "Administrator",
      school: "Oak Valley Elementary",
      rating: 5,
      color: '#4ECDC4',
      avatar: '👨‍💼'
    },
    {
      text: "Communication with parents has never been easier. The notification system is a game-changer!",
      author: "Emma Thompson",
      role: "Teacher",
      school: "Riverside Academy",
      rating: 5,
      color: '#45B7D1',
      avatar: '👩‍🏫'
    },
    {
      text: "The analytics dashboard provides insights we never had before. Data-driven decisions are now easy!",
      author: "James Wilson",
      role: "IT Director",
      school: "Summit International",
      rating: 5,
      color: '#96CEB4',
      avatar: '👨‍💻'
    },
    {
      text: "Our parents love the real-time updates and easy communication. Engagement has increased dramatically!",
      author: "Lisa Anderson",
      role: "Parent Coordinator",
      school: "Pine Valley School",
      rating: 5,
      color: '#FFD93D',
      avatar: '👩‍🏫'
    }
  ];

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
          <Text style={styles.heroTitle}>Discover Our Features</Text>
          <Text style={styles.heroSubtitle}>
            Powerful tools designed to transform your school's digital experience
          </Text>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>🚀 50+ Amazing Features</Text>
          </View>

          <View style={styles.heroButtons}>
            <InteractiveCard
              style={styles.primaryHeroButton}
              onPress={() => handleButtonPress('getStarted')}
              scaleValue={0.96}
            >
              <LinearGradient
                colors={['#FF6B6B', '#FF8E8E']}
                style={styles.heroButtonGradient}
              >
                <Text style={styles.primaryButtonText}>🎯 Get Started Free</Text>
              </LinearGradient>
            </InteractiveCard>

            <InteractiveCard
              style={styles.secondaryHeroButton}
              onPress={() => handleButtonPress('demo')}
              scaleValue={0.96}
            >
              <Text style={styles.secondaryButtonText}>📱 View Demo</Text>
            </InteractiveCard>
          </View>
        </View>
      </LinearGradient>

      {/* ✅ Key Stats Section */}
      <View style={styles.statsSection}>
        <Text style={styles.statsTitle}>Trusted by Educators Worldwide</Text>
        <View style={styles.statsGrid}>
          {[
            { number: '50+', label: 'Features', icon: '⚡', color: '#FF6B6B' },
            { number: '10K+', label: 'Schools', icon: '🏫', color: '#4ECDC4' },
            { number: '99.9%', label: 'Uptime', icon: '🔒', color: '#45B7D1' },
            { number: '24/7', label: 'Support', icon: '🛟', color: '#96CEB4' }
          ].map((stat, index) => (
            <FloatingCard
              key={index}
              style={[styles.statCard, { borderTopColor: stat.color }]}
              delay={index * 300}
            >
              <InteractiveCard
                onPress={() => console.log(`Stat ${stat.label} pressed`)}
                scaleValue={0.95}
              >
                <View style={styles.statContent}>
                  <PulseIcon color={stat.color}>
                    <Text style={styles.statIcon}>{stat.icon}</Text>
                  </PulseIcon>
                  <Text style={[styles.statNumber, { color: stat.color }]}>{stat.number}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              </InteractiveCard>
            </FloatingCard>
          ))}
        </View>
      </View>

      {/* ✅ ENHANCED: Horizontal Core Features Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Core Features</Text>
        <Text style={styles.sectionSubtitle}>Everything you need to manage your school efficiently</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalFeaturesContainer}
          decelerationRate="fast"
          snapToInterval={width * 0.85}
          snapToAlignment="start"
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / (width * 0.85));
            setActiveFeatureIndex(index);
          }}
        >
          {featuresData.map((feature, index) => (
            <InteractiveCard
              key={index}
              style={styles.horizontalFeatureCard}
              onPress={() => console.log(`Feature ${feature.title} pressed`)}
              scaleValue={0.97}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F8F9FA']}
                style={[styles.featureCard, { borderTopColor: feature.color }]}
              >
                <View style={styles.featureHeader}>
                  <View style={[styles.featureIconContainer, { backgroundColor: feature.color + '20' }]}>
                    <Text style={styles.featureIcon}>{feature.icon}</Text>
                  </View>
                  <View style={[styles.featureBadge, { backgroundColor: feature.color }]}>
                    <Text style={styles.featureBadgeText}>POPULAR</Text>
                  </View>
                </View>

                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>

                <View style={styles.featuresList}>
                  {feature.features.map((item, idx) => (
                    <View key={idx} style={styles.featureItem}>
                      <Text style={[styles.featureBullet, { color: feature.color }]}>✓</Text>
                      <Text style={styles.featureItemText}>{item}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity style={[styles.featureButton, { backgroundColor: feature.color }]}>
                  <Text style={styles.featureButtonText}>Learn More →</Text>
                </TouchableOpacity>
              </LinearGradient>
            </InteractiveCard>
          ))}
        </ScrollView>

        {/* ✅ Features Scroll Indicator */}
        <View style={styles.scrollIndicator}>
          {featuresData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicatorDot,
                index === activeFeatureIndex && styles.activeDot
              ]}
            />
          ))}
        </View>
      </View>

      {/* ✅ Advanced Features Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Advanced Features</Text>
        <Text style={styles.sectionSubtitle}>Next-generation tools for modern education</Text>

        <View style={styles.advancedFeaturesGrid}>
          {[
            {
              icon: '🤖',
              title: 'AI-Powered Insights',
              description: 'Machine learning algorithms provide personalized recommendations and predictive analytics',
              color: '#667eea',
              badge: 'NEW'
            },
            {
              icon: '☁️',
              title: 'Cloud Integration',
              description: 'Seamless cloud storage and synchronization across all devices',
              color: '#764ba2',
              badge: 'POPULAR'
            },
            {
              icon: '🔐',
              title: 'Enterprise Security',
              description: 'Bank-level security with encryption, backup, and compliance features',
              color: '#f093fb',
              badge: 'SECURE'
            },
            {
              icon: '📱',
              title: 'Mobile First',
              description: 'Native mobile apps for iOS and Android with offline capabilities',
              color: '#a8edea',
              badge: 'MOBILE'
            }
          ].map((feature, index) => (
            <InteractiveCard
              key={index}
              style={styles.advancedFeatureCard}
              onPress={() => console.log(`Advanced feature ${feature.title} pressed`)}
              scaleValue={0.98}
            >
              <LinearGradient
                colors={[feature.color + '20', '#FFFFFF']}
                style={styles.advancedFeatureContent}
              >
                <View style={styles.advancedFeatureHeader}>
                  <View style={[styles.advancedIconContainer, { backgroundColor: feature.color }]}>
                    <Text style={styles.advancedIcon}>{feature.icon}</Text>
                  </View>
                  <View style={[styles.featureBadge, { backgroundColor: feature.color }]}>
                    <Text style={styles.featureBadgeText}>{feature.badge}</Text>
                  </View>
                </View>

                <Text style={styles.advancedFeatureTitle}>{feature.title}</Text>
                <Text style={styles.advancedFeatureDescription}>{feature.description}</Text>
              </LinearGradient>
            </InteractiveCard>
          ))}
        </View>
      </View>

      {/* ✅ ENHANCED: Horizontal Testimonials Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What Users Love</Text>
        <Text style={styles.sectionSubtitle}>Real feedback from our amazing community</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalTestimonialsContainer}
          decelerationRate="fast"
          snapToInterval={width * 0.9}
          snapToAlignment="center"
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / (width * 0.9));
            setActiveTestimonialIndex(index);
          }}
        >
          {testimonialsData.map((testimonial, index) => (
            <InteractiveCard
              key={index}
              style={styles.horizontalTestimonialCard}
              onPress={() => console.log(`Testimonial ${testimonial.author} pressed`)}
              scaleValue={0.98}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F8F9FA']}
                style={[styles.testimonialCard, { borderLeftColor: testimonial.color }]}
              >
                <View style={styles.testimonialHeader}>
                  <View style={[styles.avatarContainer, { backgroundColor: testimonial.color + '20' }]}>
                    <Text style={styles.avatarIcon}>{testimonial.avatar}</Text>
                  </View>

                  <View style={styles.testimonialInfo}>
                    <Text style={styles.testimonialAuthor}>{testimonial.author}</Text>
                    <Text style={styles.testimonialRole}>{testimonial.role}</Text>
                    <Text style={styles.testimonialSchool}>{testimonial.school}</Text>
                  </View>

                  <View style={styles.ratingContainer}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Text key={i} style={styles.star}>⭐</Text>
                    ))}
                  </View>
                </View>

                <Text style={styles.testimonialText}>"{testimonial.text}"</Text>

                <View style={[styles.testimonialAccent, { backgroundColor: testimonial.color }]} />

                {/* ✅ Quote decoration */}
                <View style={styles.quoteDecoration}>
                  <Text style={[styles.quoteIcon, { color: testimonial.color }]}>"</Text>
                </View>
              </LinearGradient>
            </InteractiveCard>
          ))}
        </ScrollView>

        {/* ✅ Testimonial Navigation */}
        <View style={styles.testimonialNavigation}>
          <View style={styles.navigationDots}>
            {testimonialsData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.navDot,
                  index === activeTestimonialIndex && styles.activeNavDot
                ]}
              />
            ))}
          </View>
          <Text style={styles.swipeHint}>← Swipe to see more testimonials →</Text>
        </View>
      </View>

      {/* ✅ FAQ Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <Text style={styles.sectionSubtitle}>Get answers to common questions</Text>

        {[
          {
            question: "Is there a free trial available?",
            answer: "Yes! We offer a 30-day free trial with full access to all features. No credit card required.",
            icon: "❓",
            color: "#FF6B6B"
          },
          {
            question: "How secure is our school data?",
            answer: "We use bank-level encryption and comply with all education data privacy regulations including FERPA and COPPA.",
            icon: "🔒",
            color: "#4ECDC4"
          },
          {
            question: "Can we integrate with existing systems?",
            answer: "Absolutely! We support integration with popular SIS, LMS, and other education platforms through our API.",
            icon: "🔌",
            color: "#45B7D1"
          },
          {
            question: "What support options are available?",
            answer: "We provide 24/7 customer support, comprehensive documentation, training materials, and dedicated account managers.",
            icon: "🛟",
            color: "#96CEB4"
          }
        ].map((faq, index) => (
          <InteractiveCard
            key={index}
            style={styles.faqWrapper}
            onPress={() => console.log(`FAQ ${index + 1} pressed`)}
            scaleValue={0.98}
          >
            <View style={[styles.faqCard, { borderLeftColor: faq.color }]}>
              <View style={styles.faqHeader}>
                <View style={[styles.faqIconContainer, { backgroundColor: faq.color + '20' }]}>
                  <Text style={styles.faqIcon}>{faq.icon}</Text>
                </View>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
              </View>
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            </View>
          </InteractiveCard>
        ))}
      </View>

      {/* ✅ Call to Action Section */}
      <View style={styles.ctaSection}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.ctaContainer}
        >
          <Text style={styles.ctaTitle}>Ready to Get Started?</Text>
          <Text style={styles.ctaSubtitle}>
            Join thousands of schools already using SchoolBridge to transform education
          </Text>

          <View style={styles.ctaStats}>
            <View style={styles.ctaStat}>
              <Text style={styles.ctaStatNumber}>10,000+</Text>
              <Text style={styles.ctaStatLabel}>Schools Trust Us</Text>
            </View>
            <View style={styles.ctaStat}>
              <Text style={styles.ctaStatNumber}>98%</Text>
              <Text style={styles.ctaStatLabel}>Satisfaction Rate</Text>
            </View>
          </View>

          <View style={styles.ctaButtons}>
            <InteractiveCard
              style={styles.ctaPrimaryButton}
              onPress={() => handleButtonPress('getStarted')}
              scaleValue={0.96}
            >
              <LinearGradient
                colors={['#FF6B6B', '#FF8E8E']}
                style={styles.ctaButtonGradient}
              >
                <Text style={styles.ctaPrimaryButtonText}>🚀 Start Free Trial</Text>
              </LinearGradient>
            </InteractiveCard>

            <View style={styles.ctaSecondaryButtons}>
              <InteractiveCard
                style={styles.ctaSecondaryButton}
                onPress={() => handleButtonPress('demo')}
                scaleValue={0.96}
              >
                <Text style={styles.ctaSecondaryButtonText}>📱 View Demo</Text>
              </InteractiveCard>

              <InteractiveCard
                style={styles.ctaSecondaryButton}
                onPress={() => handleButtonPress('pricing')}
                scaleValue={0.96}
              >
                <Text style={styles.ctaSecondaryButtonText}>💰 See Pricing</Text>
              </InteractiveCard>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* ✅ Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerTitle}>Need Help Getting Started?</Text>
        <Text style={styles.footerSubtitle}>Our team is here to help you succeed</Text>

        <View style={styles.footerButtons}>
          <InteractiveCard
            style={styles.footerButton}
            onPress={() => handleButtonPress('contact')}
            scaleValue={0.95}
          >
            <Text style={styles.footerButtonText}>📞 Contact Sales</Text>
          </InteractiveCard>

          <InteractiveCard
            style={styles.footerButton}
            onPress={() => handleButtonPress('learnMore')}
            scaleValue={0.95}
          >
            <Text style={styles.footerButtonText}>📚 Documentation</Text>
          </InteractiveCard>
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

  // ✅ Hero Section
  heroSection: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    minHeight: height * 0.4,
    justifyContent: 'center',
  },
  heroContent: {
    alignItems: 'center',
    maxWidth: 600,
  },
  heroTitle: {
    fontSize: isTablet ? 36 : 30,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  heroSubtitle: {
    fontSize: isTablet ? 22 : 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.95,
    lineHeight: 26,
  },
  heroBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  heroButtons: {
    width: '100%',
    gap: 16,
  },
  primaryHeroButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  heroButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryHeroButton: {
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
    fontSize: 18,
    fontWeight: '600',
  },

  // ✅ Stats Section
  statsSection: {
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
  statsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minWidth: (width - 100) / 4,
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statContent: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
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
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },

  // ✅ NEW: Horizontal Features Styles
  horizontalFeaturesContainer: {
    paddingLeft: 4,
    paddingRight: 20,
  },
  horizontalFeatureCard: {
    width: width * 0.8,
    marginRight: 16,
    marginBottom: 10,
  },
  featureCard: {
    borderRadius: 20,
    padding: 24,
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    height: 380, // Fixed height for consistency
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 28,
  },
  featureBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featureBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 12,
  },
  featureDescription: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 22,
    marginBottom: 16,
  },
  featuresList: {
    marginBottom: 20,
    flex: 1,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureBullet: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  featureItemText: {
    fontSize: 13,
    color: '#4A5568',
    flex: 1,
  },
  featureButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  featureButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // ✅ NEW: Scroll Indicator Styles
  scrollIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  activeDot: {
    backgroundColor: '#00AAFF',
    width: 24,
  },

  // ✅ Advanced Features
  advancedFeaturesGrid: {
    gap: 16,
  },
  advancedFeatureCard: {
    marginBottom: 16,
  },
  advancedFeatureContent: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  advancedFeatureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  advancedIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  advancedIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  advancedFeatureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 8,
  },
  advancedFeatureDescription: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 22,
  },

  // ✅ NEW: Horizontal Testimonials Styles
  horizontalTestimonialsContainer: {
    paddingLeft: 4,
    paddingRight: 20,
  },
  horizontalTestimonialCard: {
    width: width * 0.85,
    marginRight: 16,
    marginBottom: 10,
  },
  testimonialCard: {
    borderRadius: 20,
    padding: 24,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    minHeight: 220,
    position: 'relative',
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarIcon: {
    fontSize: 24,
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
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
  },
  testimonialSchool: {
    fontSize: 12,
    color: '#A0AEC0',
    marginTop: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 16,
  },
  testimonialText: {
    fontSize: 15,
    color: '#4A5568',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  testimonialAccent: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    opacity: 0.3,
  },
  quoteDecoration: {
    position: 'absolute',
    bottom: 20,
    right: 24,
  },
  quoteIcon: {
    fontSize: 40,
    fontWeight: 'bold',
    opacity: 0.3,
  },

  // ✅ NEW: Testimonial Navigation Styles
  testimonialNavigation: {
    alignItems: 'center',
    marginTop: 20,
  },
  navigationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  navDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  activeNavDot: {
    backgroundColor: '#00AAFF',
    width: 24,
  },
  swipeHint: {
    fontSize: 12,
    color: '#A0AEC0',
    fontStyle: 'italic',
  },

  // ✅ FAQ Section
  faqWrapper: {
    marginBottom: 16,
  },
  faqCard: {
    backgroundColor: '#F7FAFC',
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
  faqAnswer: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 22,
    marginLeft: 56,
  },

  // ✅ CTA Section
  ctaSection: {
    marginHorizontal: 16,
    marginTop: 20,
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
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
    lineHeight: 24,
  },
  ctaStats: {
    flexDirection: 'row',
    gap: 40,
    marginBottom: 32,
  },
  ctaStat: {
    alignItems: 'center',
  },
  ctaStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  ctaStatLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 4,
  },
  ctaButtons: {
    width: '100%',
    gap: 16,
  },
  ctaPrimaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  ctaPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  ctaSecondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  ctaSecondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  ctaSecondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
  footerButtons: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  footerButton: {
    backgroundColor: '#F7FAFC',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  footerButtonText: {
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '500',
  },
  footerText: {
    fontSize: 12,
    color: '#A0AEC0',
    textAlign: 'center',
  },
});

export default FeaturesScreen;
