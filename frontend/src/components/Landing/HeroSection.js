import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Modal,
  Linking,
  Alert,
  ScrollView, 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

const HeroSection = ({ onLoginPress, onSignUpPress }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();

  // Toggle menu visibility
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  // Close menu
  const closeMenu = () => {
    setMenuVisible(false);
  };

  // ✅ ENHANCED: Menu item handlers with real navigation including Pricing
  const handleMenuPress = (item) => {
    closeMenu();

    switch (item) {
      case 'about':
        navigation.navigate('AboutUs');
        break;

      case 'features':
        navigation.navigate('Features');
        break;

      case 'pricing':
        navigation.navigate('Pricing');
        break;

      case 'contact':
        navigation.navigate('Contact');
        break;

      case 'support':
        navigation.navigate('Support');
        break;

      case 'privacy':
        navigation.navigate('Privacy');
        break;

      case 'terms':
        Linking.openURL('https://schoolbridge.com/terms-of-service');
        break;

      case 'help':
        Linking.openURL('https://help.schoolbridge.com');
        break;

      case 'website':
        Linking.openURL('https://www.schoolbridge.com');
        break;

      case 'social-facebook':
        Linking.openURL('https://facebook.com/schoolbridge');
        break;

      case 'social-twitter':
        Linking.openURL('https://twitter.com/schoolbridge');
        break;

      case 'email':
        Linking.openURL('mailto:info@schoolbridge.com?subject=Inquiry from SchoolBridge App');
        break;

      case 'phone':
        Linking.openURL('tel:+15550123');
        break;

      default:
        break;
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/hero-bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* Hamburger Menu Button */}
      <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
        <View style={styles.hamburgerLine} />
        <View style={styles.hamburgerLine} />
        <View style={styles.hamburgerLine} />
      </TouchableOpacity>

      {/* ✅ FIXED: Scrollable Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeMenu}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeMenu}
        >
          <View style={styles.menuContainer}>
            {/* ✅ FIXED: Header outside ScrollView */}
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>SchoolBridge</Text>
              <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* ✅ FIXED: Scrollable menu content */}
            <ScrollView
              style={styles.menuScrollView}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View style={styles.menuItems}>
                {/* ✅ INFORMATION SECTION */}
                <Text style={styles.sectionTitle}>Information</Text>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuPress('about')}
                >
                  <Text style={styles.menuItemIcon}>ℹ️</Text>
                  <Text style={styles.menuItemText}>About Us</Text>
                  <Text style={styles.menuItemArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuPress('features')}
                >
                  <Text style={styles.menuItemIcon}>⭐</Text>
                  <Text style={styles.menuItemText}>Features</Text>
                  <Text style={styles.menuItemArrow}>›</Text>
                </TouchableOpacity>

                {/* ✅ Pricing Menu Item */}
                <TouchableOpacity
                  style={[styles.menuItem, styles.highlightedMenuItem]}
                  onPress={() => handleMenuPress('pricing')}
                >
                  <Text style={styles.menuItemIcon}>💰</Text>
                  <Text style={[styles.menuItemText, styles.highlightedMenuText]}>Pricing & Plans</Text>
                  <Text style={styles.menuItemArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuPress('website')}
                >
                  <Text style={styles.menuItemIcon}>🌐</Text>
                  <Text style={styles.menuItemText}>Visit Website</Text>
                  <Text style={styles.menuItemArrow}>↗</Text>
                </TouchableOpacity>

                {/* ✅ CONTACT SECTION */}
                <Text style={styles.sectionTitle}>Contact</Text>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuPress('contact')}
                >
                  <Text style={styles.menuItemIcon}>📞</Text>
                  <Text style={styles.menuItemText}>Contact Us</Text>
                  <Text style={styles.menuItemArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuPress('email')}
                >
                  <Text style={styles.menuItemIcon}>✉️</Text>
                  <Text style={styles.menuItemText}>Send Email</Text>
                  <Text style={styles.menuItemArrow}>↗</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuPress('phone')}
                >
                  <Text style={styles.menuItemIcon}>📱</Text>
                  <Text style={styles.menuItemText}>Call Now</Text>
                  <Text style={styles.menuItemArrow}>↗</Text>
                </TouchableOpacity>

                {/* ✅ SUPPORT SECTION */}
                <Text style={styles.sectionTitle}>Support</Text>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuPress('support')}
                >
                  <Text style={styles.menuItemIcon}>🛠️</Text>
                  <Text style={styles.menuItemText}>Help Center</Text>
                  <Text style={styles.menuItemArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuPress('help')}
                >
                  <Text style={styles.menuItemIcon}>❓</Text>
                  <Text style={styles.menuItemText}>FAQ</Text>
                  <Text style={styles.menuItemArrow}>↗</Text>
                </TouchableOpacity>

                {/* ✅ SOCIAL MEDIA SECTION */}
                <Text style={styles.sectionTitle}>Follow Us</Text>

                <View style={styles.socialRow}>
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => handleMenuPress('social-facebook')}
                  >
                    <Text style={styles.socialIcon}>📘</Text>
                    <Text style={styles.socialText}>Facebook</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => handleMenuPress('social-twitter')}
                  >
                    <Text style={styles.socialIcon}>🐦</Text>
                    <Text style={styles.socialText}>Twitter</Text>
                  </TouchableOpacity>
                </View>

                {/* ✅ LEGAL SECTION */}
                <Text style={styles.sectionTitle}>Legal</Text>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuPress('privacy')}
                >
                  <Text style={styles.menuItemIcon}>🔒</Text>
                  <Text style={styles.menuItemText}>Privacy Policy</Text>
                  <Text style={styles.menuItemArrow}>↗</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuPress('terms')}
                >
                  <Text style={styles.menuItemIcon}>📄</Text>
                  <Text style={styles.menuItemText}>Terms of Service</Text>
                  <Text style={styles.menuItemArrow}>↗</Text>
                </TouchableOpacity>

                {/* ✅ DIVIDER */}
                <View style={styles.menuDivider} />

                {/* ✅ QUICK ACTIONS */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>

                <TouchableOpacity
                  style={[styles.menuItem, styles.menuActionItem]}
                  onPress={() => { closeMenu(); onLoginPress(); }}
                >
                  <Text style={styles.menuItemIcon}>🚀</Text>
                  <Text style={[styles.menuItemText, styles.menuActionText]}>Get Started</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.menuItem, styles.menuActionItem]}
                  onPress={() => { closeMenu(); onSignUpPress(); }}
                >
                  <Text style={styles.menuItemIcon}>📝</Text>
                  <Text style={[styles.menuItemText, styles.menuActionText]}>Sign Up</Text>
                </TouchableOpacity>

                {/* ✅ FOOTER SPACING */}
                <View style={styles.menuFooter} />
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Rest of your existing hero content */}
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Welcome to SchoolBridge</Text>
            <Text style={styles.subtitle}>
              Connecting Schools, Teachers, Students, and Parents
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={onLoginPress}
              >
                <Text style={styles.primaryButtonText}>Get Started</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={onSignUpPress}
              >
                <Text style={styles.secondaryButtonText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    minHeight: 400,
  },

  // ✅ HAMBURGER MENU BUTTON
  menuButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 10,
  },
  hamburgerLine: {
    width: 20,
    height: 2,
    backgroundColor: '#FFFFFF',
    marginVertical: 2,
    borderRadius: 1,
  },

  // ✅ MODAL OVERLAY
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    width: 320,
    height: '100%', // ✅ Full height
    paddingTop: 50,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 10,
  },

  // ✅ MENU HEADER (Fixed at top)
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#FFFFFF', // ✅ Ensure white background
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary || '#2E86AB',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },

  // ✅ SCROLLABLE MENU CONTENT
  menuScrollView: {
    flex: 1, // ✅ Takes remaining space
  },
  menuItems: {
    paddingTop: 10,
    paddingBottom: 30, // ✅ Extra bottom padding
  },

  // ✅ SECTION TITLES
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    paddingHorizontal: 20,
    paddingVertical: 15, // ✅ Increased padding
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    backgroundColor: '#F8F9FA', // ✅ Background for better separation
    marginTop: 5,
  },

  // ✅ MENU ITEMS
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    backgroundColor: '#FFFFFF', // ✅ Ensure white background
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 25,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  menuItemArrow: {
    fontSize: 18,
    color: '#999',
    fontWeight: 'bold',
  },

  // ✅ Highlighted menu item for Pricing
  highlightedMenuItem: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#FFD93D',
  },
  highlightedMenuText: {
    color: '#FF8C00',
    fontWeight: '600',
  },

  menuActionItem: {
    backgroundColor: 'rgba(46, 134, 171, 0.05)',
  },
  menuActionText: {
    color: COLORS.primary || '#2E86AB',
    fontWeight: 'bold',
  },
  menuDivider: {
    height: 15, // ✅ Increased height
    backgroundColor: '#F8F9FA',
    marginVertical: 10,
  },

  // ✅ SOCIAL MEDIA ROW
  socialRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
    backgroundColor: '#FFFFFF', // ✅ Ensure white background
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  socialIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  socialText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },

  // ✅ FOOTER SPACING
  menuFooter: {
    height: 50, // ✅ Extra space at bottom
    backgroundColor: '#FFFFFF',
  },

  // ... rest of existing styles ...
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  container: {
    flex: 1,
    paddingVertical: SPACING?.padding * 3 || 60,
    paddingHorizontal: SPACING?.padding || 20,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: FONTS?.sizes?.xxl || 28,
    fontWeight: FONTS?.weights?.bold || 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING?.base || 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: FONTS?.sizes?.lg || 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING?.padding || 30,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    paddingVertical: SPACING?.base || 12,
    paddingHorizontal: SPACING?.padding || 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  primaryButtonText: {
    fontSize: FONTS?.sizes?.md || 16,
    fontWeight: FONTS?.weights?.bold || 'bold',
    color: COLORS.primary || '#2E86AB',
  },
  secondaryButtonText: {
    fontSize: FONTS?.sizes?.md || 16,
    fontWeight: FONTS?.weights?.bold || 'bold',
    color: '#FFFFFF',
  },
});

export default HeroSection;










// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ImageBackground,
//   Modal,
//   Linking,
//   Alert,
// } from 'react-native';
// import { COLORS, FONTS, SPACING } from '../../constants/theme';

// const HeroSection = ({ onLoginPress, onSignUpPress }) => {
//   const [menuVisible, setMenuVisible] = useState(false);

//   // Toggle menu visibility
//   const toggleMenu = () => {
//     setMenuVisible(!menuVisible);
//   };

//   // Close menu
//   const closeMenu = () => {
//     setMenuVisible(false);
//   };

//   // Menu item handlers
//   const handleMenuPress = (item) => {
//     closeMenu();

//     switch (item) {
//       case 'about':
//         Alert.alert(
//           'About SchoolBridge',
//           'SchoolBridge is a comprehensive school management platform connecting students, teachers, parents, and administrators.',
//           [{ text: 'OK' }]
//         );
//         break;
//       case 'features':
//         Alert.alert(
//           'Features',
//           '• Student Management\n• Grade Tracking\n• Parent Communication\n• Assignment Submission\n• Attendance Monitoring',
//           [{ text: 'OK' }]
//         );
//         break;
//       case 'contact':
//         Alert.alert(
//           'Contact Us',
//           'Email: info@schoolbridge.com\nPhone: +1-555-0123\nWebsite: www.schoolbridge.com',
//           [
//             { text: 'Email', onPress: () => Linking.openURL('mailto:info@schoolbridge.com') },
//             { text: 'Call', onPress: () => Linking.openURL('tel:+15550123') },
//             { text: 'OK' }
//           ]
//         );
//         break;
//       case 'support':
//         Alert.alert(
//           'Support',
//           'Need help? Visit our support center or contact our team.',
//           [
//             { text: 'Help Center', onPress: () => Linking.openURL('https://schoolbridge.com/help') },
//             { text: 'OK' }
//           ]
//         );
//         break;
//       case 'privacy':
//         Alert.alert(
//           'Privacy Policy',
//           'Your privacy is important to us. View our complete privacy policy on our website.',
//           [
//             { text: 'View Policy', onPress: () => Linking.openURL('https://schoolbridge.com/privacy') },
//             { text: 'OK' }
//           ]
//         );
//         break;
//       default:
//         break;
//     }
//   };

//   return (
//     <ImageBackground
//       source={require('../../../assets/hero-bg.png')}
//       style={styles.backgroundImage}
//       resizeMode="cover"
//     >
//       {/* Hamburger Menu Button */}
//       <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
//         <View style={styles.hamburgerLine} />
//         <View style={styles.hamburgerLine} />
//         <View style={styles.hamburgerLine} />
//       </TouchableOpacity>

//       {/* Menu Modal */}
//       <Modal
//         visible={menuVisible}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={closeMenu}
//       >
//         <TouchableOpacity
//           style={styles.modalOverlay}
//           activeOpacity={1}
//           onPress={closeMenu}
//         >
//           <View style={styles.menuContainer}>
//             <View style={styles.menuHeader}>
//               <Text style={styles.menuTitle}>SchoolBridge</Text>
//               <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
//                 <Text style={styles.closeButtonText}>✕</Text>
//               </TouchableOpacity>
//             </View>

//             <View style={styles.menuItems}>
//               <TouchableOpacity
//                 style={styles.menuItem}
//                 onPress={() => handleMenuPress('about')}
//               >
//                 <Text style={styles.menuItemIcon}>ℹ️</Text>
//                 <Text style={styles.menuItemText}>About Us</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.menuItem}
//                 onPress={() => handleMenuPress('features')}
//               >
//                 <Text style={styles.menuItemIcon}>⭐</Text>
//                 <Text style={styles.menuItemText}>Features</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.menuItem}
//                 onPress={() => handleMenuPress('contact')}
//               >
//                 <Text style={styles.menuItemIcon}>📞</Text>
//                 <Text style={styles.menuItemText}>Contact Us</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.menuItem}
//                 onPress={() => handleMenuPress('support')}
//               >
//                 <Text style={styles.menuItemIcon}>🛠️</Text>
//                 <Text style={styles.menuItemText}>Support</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.menuItem}
//                 onPress={() => handleMenuPress('privacy')}
//               >
//                 <Text style={styles.menuItemIcon}>🔒</Text>
//                 <Text style={styles.menuItemText}>Privacy Policy</Text>
//               </TouchableOpacity>

//               {/* Divider */}
//               <View style={styles.menuDivider} />

//               {/* Quick Actions */}
//               <TouchableOpacity
//                 style={[styles.menuItem, styles.menuActionItem]}
//                 onPress={() => { closeMenu(); onLoginPress(); }}
//               >
//                 <Text style={styles.menuItemIcon}>🚀</Text>
//                 <Text style={[styles.menuItemText, styles.menuActionText]}>Get Started</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[styles.menuItem, styles.menuActionItem]}
//                 onPress={() => { closeMenu(); onSignUpPress(); }}
//               >
//                 <Text style={styles.menuItemIcon}>📝</Text>
//                 <Text style={[styles.menuItemText, styles.menuActionText]}>Sign Up</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </TouchableOpacity>
//       </Modal>

//       {/* Semi-transparent overlay for better text readability */}
//       <View style={styles.overlay}>
//         <View style={styles.container}>
//           <View style={styles.content}>
//             <Text style={styles.title}>Welcome to SchoolBridge</Text>
//             <Text style={styles.subtitle}>
//               Connecting Schools, Teachers, Students, and Parents
//             </Text>

//             <View style={styles.buttonContainer}>
//               <TouchableOpacity
//                 style={[styles.button, styles.primaryButton]}
//                 onPress={onLoginPress}
//               >
//                 <Text style={styles.primaryButtonText}>Get Started</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[styles.button, styles.secondaryButton]}
//                 onPress={onSignUpPress}
//               >
//                 <Text style={styles.secondaryButtonText}>Sign Up</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </View>
//     </ImageBackground>
//   );
// };

// const styles = StyleSheet.create({
//   backgroundImage: {
//     flex: 1,
//     width: '100%',
//     minHeight: 400,
//   },

//   // ✅ HAMBURGER MENU BUTTON
//   menuButton: {
//     position: 'absolute',
//     top: 50,
//     left: 20,
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.3)',
//     zIndex: 10,
//   },
//   hamburgerLine: {
//     width: 20,
//     height: 2,
//     backgroundColor: '#FFFFFF',
//     marginVertical: 2,
//     borderRadius: 1,
//   },

//   // ✅ MODAL OVERLAY
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'flex-start',
//   },
//   menuContainer: {
//     backgroundColor: '#FFFFFF',
//     width: 280,
//     minHeight: '100%',
//     paddingTop: 50,
//     shadowColor: '#000',
//     shadowOffset: { width: 2, height: 0 },
//     shadowOpacity: 0.25,
//     shadowRadius: 5,
//     elevation: 10,
//   },

//   // ✅ MENU HEADER
//   menuHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E5E5',
//   },
//   menuTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: COLORS.primary || '#2E86AB',
//   },
//   closeButton: {
//     width: 30,
//     height: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 15,
//     backgroundColor: '#F5F5F5',
//   },
//   closeButtonText: {
//     fontSize: 18,
//     color: '#666',
//     fontWeight: 'bold',
//   },

//   // ✅ MENU ITEMS
//   menuItems: {
//     paddingTop: 20,
//   },
//   menuItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: 'rgba(0, 0, 0, 0.05)',
//   },
//   menuItemIcon: {
//     fontSize: 20,
//     marginRight: 15,
//     width: 25,
//   },
//   menuItemText: {
//     fontSize: 16,
//     color: '#333',
//     fontWeight: '500',
//   },
//   menuActionItem: {
//     backgroundColor: 'rgba(46, 134, 171, 0.05)',
//   },
//   menuActionText: {
//     color: COLORS.primary || '#2E86AB',
//     fontWeight: 'bold',
//   },
//   menuDivider: {
//     height: 10,
//     backgroundColor: '#F8F9FA',
//     marginVertical: 10,
//   },

//   // ✅ EXISTING STYLES (keep as they were)
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.4)',
//   },
//   container: {
//     flex: 1,
//     paddingVertical: SPACING?.padding * 3 || 60,
//     paddingHorizontal: SPACING?.padding || 20,
//     justifyContent: 'center',
//   },
//   content: {
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: FONTS?.sizes?.xxl || 28,
//     fontWeight: FONTS?.weights?.bold || 'bold',
//     color: '#FFFFFF',
//     textAlign: 'center',
//     marginBottom: SPACING?.base || 10,
//     textShadowColor: 'rgba(0, 0, 0, 0.5)',
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 3,
//   },
//   subtitle: {
//     fontSize: FONTS?.sizes?.lg || 18,
//     color: '#FFFFFF',
//     textAlign: 'center',
//     marginBottom: SPACING?.padding || 30,
//     textShadowColor: 'rgba(0, 0, 0, 0.5)',
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 3,
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     gap: 15,
//     flexWrap: 'wrap',
//     justifyContent: 'center',
//   },
//   button: {
//     paddingVertical: SPACING?.base || 12,
//     paddingHorizontal: SPACING?.padding || 24,
//     borderRadius: 8,
//     minWidth: 120,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   primaryButton: {
//     backgroundColor: '#FFFFFF',
//   },
//   secondaryButton: {
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     borderWidth: 2,
//     borderColor: '#FFFFFF',
//   },
//   primaryButtonText: {
//     fontSize: FONTS?.sizes?.md || 16,
//     fontWeight: FONTS?.weights?.bold || 'bold',
//     color: COLORS.primary || '#2E86AB',
//   },
//   secondaryButtonText: {
//     fontSize: FONTS?.sizes?.md || 16,
//     fontWeight: FONTS?.weights?.bold || 'bold',
//     color: '#FFFFFF',
//   },
// });

// export default HeroSection;


