import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const CallToActionSection = ({ onGetStartedPress, onLearnMorePress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Ready to Transform Your School?</Text>
        <Text style={styles.subheading}>
          Join thousands of educators, parents, and administrators improving
          school management with SchoolBridge.
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={onGetStartedPress}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryButtonText}>Get Started Now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={onLearnMorePress}
            activeOpacity={0.9}
          >
            <Text style={styles.secondaryButtonText}>Learn More</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding * 4,
    paddingHorizontal: SIZES.padding,
  },
  content: {
    alignItems: 'center',
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  heading: {
    fontSize: SIZES.h1,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SIZES.padding,
    lineHeight: 40,
  },
  subheading: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.regular,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SIZES.padding * 2,
    maxWidth: 600,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SIZES.padding,
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding * 2,
    borderRadius: 30,
    minWidth: 180,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  primaryButton: {
    backgroundColor: COLORS.secondary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  primaryButtonText: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  secondaryButtonText: {
    fontSize: SIZES.body1,
    fontFamily: FONTS.semiBold,
    color: COLORS.secondary,
  },
});

export default CallToActionSection;







































// import React from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import { COLORS, FONTS, SIZES } from '../../constants/theme';

// const CallToActionSection = ({ onGetStartedPress, onLearnMorePress }) => {
//   return (
//     <View style={styles.container}>
//       <View style={styles.content}>
//         <Text style={styles.heading}>Ready to Transform Your School?</Text>
//         <Text style={styles.subheading}>
//           Join thousands of educators, parents, and administrators improving
//           school management with SchoolBridge.
//         </Text>

//         <View style={styles.buttonContainer}>
//           <TouchableOpacity
//             style={[styles.button, styles.primaryButton]}
//             onPress={onGetStartedPress}
//           >
//             <Text style={styles.primaryButtonText}>Get Started Now</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.button, styles.secondaryButton]}
//             onPress={onLearnMorePress}
//           >
//             <Text style={styles.secondaryButtonText}>Learn More</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#155677',
//     paddingVertical: SIZES.padding * 3,
//     paddingHorizontal: SIZES.padding,
//   },
//   content: {
//     alignItems: 'center',
//     maxWidth: 800,
//     alignSelf: 'center',
//   },
//   heading: {
//     fontSize: SIZES.h1,
//     fontFamily: FONTS.bold,
//     color: COLORS.white,
//     textAlign: 'center',
//     marginBottom: SIZES.padding,
//   },
//   subheading: {
//     fontSize: SIZES.body1,
//     fontFamily: FONTS.regular,
//     color: '#e3f1fb',
//     textAlign: 'center',
//     lineHeight: 24,
//     marginBottom: SIZES.padding * 2,
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     gap: SIZES.padding,
//     flexWrap: 'wrap',
//     justifyContent: 'center',
//   },
//   button: {
//     paddingVertical: SIZES.padding,
//     paddingHorizontal: SIZES.padding * 2,
//     borderRadius: 36,
//     minWidth: 140,
//     alignItems: 'center',
//   },
//   primaryButton: {
//     backgroundColor: '#4db7e3',
//   },
//   secondaryButton: {
//     backgroundColor: 'transparent',
//     borderWidth: 2,
//     borderColor: '#4db7e3',
//   },
//   primaryButtonText: {
//     fontSize: SIZES.body1,
//     fontFamily: FONTS.semiBold,
//     color: COLORS.white,
//   },
//   secondaryButtonText: {
//     fontSize: SIZES.body1,
//     fontFamily: FONTS.semiBold,
//     color: '#4db7e3',
//   },
// });

// export default CallToActionSection;
