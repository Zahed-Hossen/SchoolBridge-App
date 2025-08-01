// import React from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Linking,
// } from 'react-native';
// import { COLORS, FONTS, SIZES } from '../../constants/theme';

// const FooterSection = () => {
//   const handleLinkPress = (url) => {
//     Linking.openURL(url);
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.content}>
//         <View style={styles.contactInfo}>
//           <Text style={styles.contactText}>
//             Contact Us: support@schoolbridge.com
//           </Text>
//           <Text style={styles.contactText}>Phone: +123 456 7890</Text>
//         </View>

//         <View style={styles.socialIcons}>
//           <TouchableOpacity
//             style={styles.socialIcon}
//             onPress={() => handleLinkPress('https://google.com')}
//           >
//             <Text style={styles.socialIconText}>G+</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.socialIcon}
//             onPress={() => handleLinkPress('https://facebook.com')}
//           >
//             <Text style={styles.socialIconText}>FB</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.socialIcon}
//             onPress={() => handleLinkPress('https://github.com')}
//           >
//             <Text style={styles.socialIconText}>GH</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.socialIcon}
//             onPress={() => handleLinkPress('https://linkedin.com')}
//           >
//             <Text style={styles.socialIconText}>LI</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       <View style={styles.copyright}>
//         <Text style={styles.copyrightText}>
//           © {new Date().getFullYear()} SchoolBridge. All rights reserved.
//         </Text>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#0f2f42',
//     paddingVertical: SIZES.padding * 2,
//     paddingHorizontal: SIZES.padding,
//   },
//   content: {
//     alignItems: 'center',
//     gap: SIZES.padding,
//   },
//   contactInfo: {
//     alignItems: 'center',
//   },
//   contactText: {
//     fontSize: SIZES.body2,
//     fontFamily: FONTS.regular,
//     color: COLORS.white,
//     textAlign: 'center',
//     marginBottom: SIZES.base / 2,
//   },
//   socialIcons: {
//     flexDirection: 'row',
//     gap: SIZES.base,
//   },
//   socialIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'transparent',
//   },
//   socialIconText: {
//     fontSize: SIZES.body3,
//     fontFamily: FONTS.medium,
//     color: '#4db7e3',
//   },
//   copyright: {
//     alignItems: 'center',
//     marginTop: SIZES.padding,
//     paddingTop: SIZES.padding,
//     borderTopWidth: 1,
//     borderTopColor: 'rgba(139, 208, 238, 0.3)',
//   },
//   copyrightText: {
//     fontSize: SIZES.caption,
//     fontFamily: FONTS.regular,
//     color: '#8bd0ee',
//     textAlign: 'center',
//   },
// });

// export default FooterSection;










import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const FooterSection = ({ onLinkPress }) => {
  const handleLinkPress = (url) => {
    if (onLinkPress) {
      onLinkPress(url);
    } else {
      Linking.openURL(url);
    }
  };

  const handleSocialPress = (platform) => {
    const urls = {
      google: 'https://google.com',
      facebook: 'https://facebook.com',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
    };

    if (onLinkPress) {
      onLinkPress(platform);
    } else {
      Linking.openURL(urls[platform]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.contactInfo}>
          <Text style={styles.contactText}>
            Contact Us: support@schoolbridge.com
          </Text>
          <Text style={styles.contactText}>Phone: +123 456 7890</Text>
        </View>

        <View style={styles.socialIcons}>
          <TouchableOpacity
            style={styles.socialIcon}
            onPress={() => handleSocialPress('google')}
          >
            <Text style={styles.socialIconText}>G+</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialIcon}
            onPress={() => handleSocialPress('facebook')}
          >
            <Text style={styles.socialIconText}>FB</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialIcon}
            onPress={() => handleSocialPress('github')}
          >
            <Text style={styles.socialIconText}>GH</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialIcon}
            onPress={() => handleSocialPress('linkedin')}
          >
            <Text style={styles.socialIconText}>LI</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.copyright}>
        <Text style={styles.copyrightText}>
          © {new Date().getFullYear()} SchoolBridge. All rights reserved.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f2f42',
    paddingVertical: SIZES?.padding * 2 || 32,
    paddingHorizontal: SIZES?.padding || 16,
  },
  content: {
    alignItems: 'center',
    gap: SIZES?.padding || 16,
  },
  contactInfo: {
    alignItems: 'center',
  },
  contactText: {
    fontSize: SIZES?.body2 || 14,
    fontFamily: FONTS?.regular || 'System',
    color: COLORS?.white || '#FFFFFF',
    textAlign: 'center',
    marginBottom: SIZES?.base / 2 || 4,
  },
  socialIcons: {
    flexDirection: 'row',
    gap: SIZES?.base || 8,
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  socialIconText: {
    fontSize: SIZES?.body3 || 12,
    fontFamily: FONTS?.medium || 'System',
    color: '#4db7e3',
  },
  copyright: {
    alignItems: 'center',
    marginTop: SIZES?.padding || 16,
    paddingTop: SIZES?.padding || 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 208, 238, 0.3)',
  },
  copyrightText: {
    fontSize: SIZES?.caption || 10,
    fontFamily: FONTS?.regular || 'System',
    color: '#8bd0ee',
    textAlign: 'center',
  },
});

export default FooterSection;
