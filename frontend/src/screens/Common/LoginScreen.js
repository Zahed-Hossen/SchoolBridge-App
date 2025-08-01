import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES } from '../../constants/config';
import GoogleOAuthService from '../../services/GoogleOAuthService';
const LoginScreen = ({ navigation }) => {
  const { login, signInWithGoogle, isLoading, user, role, isAuthenticated } =
    useAuth();
  const [formData, setFormData] = useState({
    email: 'test@schoolbridge.com', // Pre-filled for easy testing
    password: 'password123', // Pre-filled for easy testing
    role: USER_ROLES.STUDENT,
  });
  const [googleLoading, setGoogleLoading] = useState(false);

  // ✅ Auto-navigate OAuth users to role selection
  useEffect(() => {
    // Only navigate if we have a user but no role and we're not loading
    if (user && !role && !isAuthenticated && !googleLoading && !isLoading) {
      console.log(
        '🎯 Auto-navigating OAuth user to role selection from LoginScreen',
      );
      navigation.navigate('RoleSelection', { user });
    }
  }, [user, role, isAuthenticated, googleLoading, isLoading, navigation]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    console.log('Attempting login with:', {
      email: formData.email,
      role: formData.role,
    });

    try {
      const result = await login(
        formData.email,
        formData.password,
        formData.role,
      );

      console.log('Login result:', result);

      if (result.success) {
        Alert.alert('Success', 'Login successful!');
      } else {
        Alert.alert('Login Failed', result.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Error',
        error.message || 'Something went wrong. Please try again.',
      );
    }
  };

  // ✅ UPDATED: Use GoogleOAuthService directly
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);

    try {
      console.log('🔐 Starting Google OAuth sign-in...');

      // ✅ Call GoogleOAuthService directly instead of AuthContext
      const result = await GoogleOAuthService.signIn();

      if (result.success) {
        console.log('✅ Google OAuth successful:', result.user.email);

        // ✅ Now call AuthContext to handle the OAuth result
        const authResult = await signInWithGoogle(result);

        if (authResult.success && authResult.needsRoleSelection) {
          console.log('🎯 User needs role selection, waiting for auto-navigation...');
          // Navigation will be handled by useEffect
        }
      } else if (result.cancelled) {
        console.log('ℹ️ User cancelled Google sign-in');
        // Don't show error for cancelled sign-in
      } else {
        throw new Error(result.error || 'Google sign-in failed');
      }
    } catch (error) {
      console.error('❌ Google OAuth error:', error);

      let errorMessage = 'Failed to sign in with Google';

      if (error.message.includes('cancelled')) {
        errorMessage = 'Sign-in was cancelled';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message.includes('PLAY_SERVICES_NOT_AVAILABLE')) {
        errorMessage = 'Google Play Services not available. Please update Google Play Services.';
      }

      Alert.alert('Google Sign In Failed', errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  const navigateToSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.appTitle}>🎓 SchoolBridge</Text>
          <Text style={styles.subtitle}>
            Welcome back! Please sign in to continue.
          </Text>
        </View>

        {/* Login Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading && !googleLoading}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
              placeholder="Enter your password"
              secureTextEntry
              editable={!isLoading && !googleLoading}
            />
          </View>

          {/* Role Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Role:</Text>
            <View style={styles.roleContainer}>
              {Object.values(USER_ROLES).map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleOption,
                    formData.role === role && styles.selectedRole,
                  ]}
                  onPress={() => handleInputChange('role', role)}
                  disabled={isLoading || googleLoading}
                >
                  <View
                    style={[
                      styles.radioButton,
                      formData.role === role && styles.radioButtonSelected,
                    ]}
                  >
                    {formData.role === role && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.roleText,
                      formData.role === role && styles.selectedRoleText,
                    ]}
                  >
                    {role}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              (isLoading || googleLoading) && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading || googleLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Or</Text>
            <View style={styles.divider} />
          </View>

          {/* ✅ UPDATED: Use native GoogleSigninButton */}
          <TouchableOpacity
            style={[
              styles.googleButton,
              googleLoading && styles.googleButtonDisabled,
            ]}
            onPress={handleGoogleSignIn}
            disabled={isLoading || googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.googleButtonIcon}>🔍</Text>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={navigateToSignUp}
              disabled={isLoading || googleLoading}
            >
              <Text style={styles.linkButton}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E86AB',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#FFFFFF',
  },
  roleContainer: {
    gap: 8,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedRole: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2E86AB',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioButtonSelected: {
    borderColor: '#2E86AB',
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2E86AB',
  },
  roleText: {
    fontSize: 16,
    color: '#333333',
  },
  selectedRoleText: {
    color: '#2E86AB',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#2E86AB',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  // ✅ UPDATED: Custom Google button styles
  googleButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleButtonIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 16,
    color: '#666666',
  },
  linkButton: {
    fontSize: 16,
    color: '#2E86AB',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
