import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';

const GoogleOAuthButton = ({
  onPress,
  loading = false,
  disabled = false,
  style,
  isLogin = false
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, style, (disabled || loading) && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {loading ? (
          <>
            <ActivityIndicator color="#4285F4" size="small" />
            <Text style={[styles.text, { marginLeft: 10 }]}>
              {isLogin ? 'Signing in...' : 'Signing up...'}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.icon}>🌐</Text>
            <Text style={styles.text}>
              {isLogin ? 'Sign in with Google' : 'Continue with Google'}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  disabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
    marginRight: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3C4043',
  },
});

export default GoogleOAuthButton;
