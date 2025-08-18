import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const FooterSection = () => {
  const handleLinkPress = (url) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.contactInfo}>
          <Text style={styles.contactText}>
            Contact Us: support@schoolbridge.com
          </Text>
          <Text style={styles.contactText}>Phone: +880188227599</Text>
        </View>

        <View style={styles.socialIcons}>
          <TouchableOpacity
            style={styles.socialIcon}
            onPress={() => handleLinkPress('https://google.com')}
          >
            <Text style={styles.socialIconText}>G+</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialIcon}
            onPress={() => handleLinkPress('https://facebook.com')}
          >
            <Text style={styles.socialIconText}>FB</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialIcon}
            onPress={() => handleLinkPress('https://github.com')}
          >
            <Text style={styles.socialIconText}>GH</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialIcon}
            onPress={() => handleLinkPress('https://linkedin.com')}
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
    paddingVertical: SIZES.padding * 2,
    paddingHorizontal: SIZES.padding,
  },
  content: {
    alignItems: 'center',
    gap: SIZES.padding,
  },
  contactInfo: {
    alignItems: 'center',
  },
  contactText: {
    fontSize: SIZES.body2,
    fontFamily: FONTS.regular,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SIZES.base / 2,
  },
  socialIcons: {
    flexDirection: 'row',
    gap: SIZES.base,
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
    fontSize: SIZES.body3,
    fontFamily: FONTS.medium,
    color: '#4db7e3',
  },
  copyright: {
    alignItems: 'center',
    marginTop: SIZES.padding,
    paddingTop: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 208, 238, 0.3)',
  },
  copyrightText: {
    fontSize: SIZES.caption,
    fontFamily: FONTS.regular,
    color: '#8bd0ee',
    textAlign: 'center',
  },
});

export default FooterSection;
