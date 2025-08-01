import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import GoogleOAuthService from '../../services/GoogleOAuthService';

const SignUpScreen = () => {
  const navigation = useNavigation();
  const { signup, signInWithGoogle, user, role, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);

  const roles = [
    { label: 'Teacher', value: 'Teacher' },
    { label: 'Student', value: 'Student' },
    { label: 'Parent', value: 'Parent' },
    { label: 'Admin', value: 'Admin' },
  ];

  useEffect(() => {
    if (user && !role && !isAuthenticated && !googleLoading && !loading) {
      console.log(
        '🎯 Auto-navigating OAuth user to role selection from SignUpScreen',
      );
      navigation.navigate('RoleSelection', { user });
    }
  }, [user, role, isAuthenticated, googleLoading, loading, navigation]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    if (!termsAccepted) {
      newErrors.terms = 'Please accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      console.log('📝 Submitting signup form...');

      const result = await signup({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      });

      // ✅ Enhanced success handling
      if (result.success) {
        Alert.alert(
          '🎉 Account Created!',
          'Your account has been created successfully! You can now log in with your email and password.',
          [{
            text: 'Go to Login',
            onPress: () => {
              // Reset form
              setFormData({
                fullName: '',
                email: '',
                phone: '',
                password: '',
                confirmPassword: '',
                role: '',
              });
              setTermsAccepted(false);
              setErrors({});
              navigation.navigate('Login');
            }
          }],
        );
      } else {
        throw new Error(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('❌ Signup error:', error);

      // ✅ Enhanced error messaging
      let errorMessage = 'Failed to create account';

      if (error.message.includes('email already exists') || error.message.includes('already registered')) {
        errorMessage = 'An account with this email already exists. Please use a different email or try logging in.';
      } else if (error.message.includes('validation')) {
        errorMessage = 'Please check your input and try again.';
      } else if (error.message.includes('Network Error') || error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Cannot connect to server. Please check your internet connection and try again.';
      } else {
        errorMessage = error.message || 'Failed to create account';
      }

      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);

    try {
      console.log('🔐 Starting Google OAuth sign-up...');

      const result = await GoogleOAuthService.signIn();

      if (result.success) {
        console.log('✅ Google OAuth successful:', result.user.email);

        const authResult = await signInWithGoogle(result);

        if (authResult.success && authResult.needsRoleSelection) {
          console.log('🎯 New user signup, waiting for auto-navigation...');
        }
      } else if (result.cancelled) {
        console.log('ℹ️ User cancelled Google sign-up');
      } else {
        throw new Error(result.error || 'Google sign-up failed');
      }
    } catch (error) {
      console.error('❌ Google OAuth error:', error);

      let errorMessage = 'Failed to sign up with Google';

      if (error.message.includes('cancelled')) {
        errorMessage = 'Sign-up was cancelled';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection.';
      }

      Alert.alert('Google Sign Up Failed', errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  const RolePicker = () => (
    <View style={styles.pickerContainer}>
      <Text style={styles.pickerTitle}>Select Role</Text>
      {roles.map((role) => (
        <TouchableOpacity
          key={role.value}
          style={styles.roleOption}
          onPress={() => {
            handleInputChange('role', role.value);
            setShowRolePicker(false);
          }}
        >
          <Text style={styles.roleOptionText}>{role.label}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => setShowRolePicker(false)}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join SchoolBridge today</Text>
        </View>

        <View style={styles.form}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, errors.fullName && styles.inputError]}
              value={formData.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
              placeholder="Enter your full name"
              placeholderTextColor="#999999"
              editable={!loading && !googleLoading}
            />
            {errors.fullName && (
              <Text style={styles.errorText}>{errors.fullName}</Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Enter your email"
              placeholderTextColor="#999999"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading && !googleLoading}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="Enter your phone number"
              placeholderTextColor="#999999"
              keyboardType="phone-pad"
              editable={!loading && !googleLoading}
            />
            {errors.phone && (
              <Text style={styles.errorText}>{errors.phone}</Text>
            )}
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              placeholder="Enter your password"
              placeholderTextColor="#999999"
              secureTextEntry
              editable={!loading && !googleLoading}
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={[
                styles.input,
                errors.confirmPassword && styles.inputError,
              ]}
              value={formData.confirmPassword}
              onChangeText={(value) =>
                handleInputChange('confirmPassword', value)
              }
              placeholder="Confirm your password"
              placeholderTextColor="#999999"
              secureTextEntry
              editable={!loading && !googleLoading}
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          {/* Role Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Role</Text>
            <TouchableOpacity
              style={[
                styles.input,
                styles.picker,
                errors.role && styles.inputError,
              ]}
              onPress={() => setShowRolePicker(true)}
              disabled={loading || googleLoading}
            >
              <Text
                style={[
                  styles.pickerText,
                  !formData.role && styles.placeholderText,
                ]}
              >
                {formData.role || 'Select your role'}
              </Text>
            </TouchableOpacity>
            {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}
          </View>

          {/* Terms and Conditions */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setTermsAccepted(!termsAccepted)}
            disabled={loading || googleLoading}
          >
            <View
              style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}
            >
              {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              I accept the terms and conditions
            </Text>
          </TouchableOpacity>
          {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (loading || googleLoading) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading || googleLoading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Or</Text>
            <View style={styles.divider} />
          </View>

          {/* ✅ FIXED: Google OAuth Button with proper ActivityIndicator */}
          <TouchableOpacity
            style={[
              styles.googleButton,
              googleLoading && styles.googleButtonDisabled,
            ]}
            onPress={handleGoogleSignUp}
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.googleButtonIcon}>🔍</Text>
                <Text style={styles.googleButtonText}>Sign up with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginLinkText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              disabled={loading || googleLoading}
            >
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Role Picker Modal */}
      {showRolePicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <RolePicker />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  form: {
    flex: 1,
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
  inputError: {
    borderColor: '#E74C3C',
  },
  picker: {
    justifyContent: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: '#333333',
  },
  placeholderText: {
    color: '#999999',
  },
  errorText: {
    fontSize: 14,
    color: '#E74C3C',
    marginTop: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2E86AB',
    borderColor: '#2E86AB',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#666666',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#2E86AB',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginLinkText: {
    fontSize: 16,
    color: '#666666',
  },
  loginLink: {
    fontSize: 16,
    color: '#2E86AB',
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 24,
    maxWidth: '90%',
  },
  pickerContainer: {
    minWidth: 250,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 20,
  },
  roleOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  roleOptionText: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
});

export default SignUpScreen;
