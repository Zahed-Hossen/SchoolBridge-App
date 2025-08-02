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

   const navigateToLogin = () => {
    try {
      console.log('🔄 Starting navigation to Login...');
      console.log('🔍 Navigation state before:', navigation.getState());

      // Reset form state
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
      setLoading(false);
      setGoogleLoading(false);

      console.log('🚀 Executing navigation...');

      // ✅ FIXED: Use replace to properly change screens
      navigation.replace('Login');

      console.log('✅ navigation.replace executed');

      // Check navigation state after a short delay
      setTimeout(() => {
        console.log('🔍 Navigation state after:', navigation.getState());
      }, 100);

    } catch (error) {
      console.error('❌ Navigation failed:', error);
      Alert.alert('Error', 'Navigation failed. Please go to Login manually.');
    }
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    const checks = {
      length: password.length >= 6,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    Object.values(checks).forEach(check => {
      if (check) strength++;
    });

    return { strength, checks };
  };

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

    // ✅ FIXED: Validate cleaned phone number
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      // Clean phone for validation
      const cleanPhone = formData.phone.replace(/\D/g, '');

      if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        newErrors.phone = 'Please enter a valid phone number (10-15 digits)';
      }
    }

    // ✅ Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
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

  // ✅ FIXED: Better phone formatting and validation
  const handleInputChange = (field, value) => {
    if (field === 'phone') {
      // Remove all non-digits for processing
      let cleanPhone = value.replace(/\D/g, '');

      // Limit length to prevent overly long numbers
      if (cleanPhone.length > 15) {
        cleanPhone = cleanPhone.substring(0, 15);
      }

      // Format for display (but keep clean version for submission)
      let displayPhone = cleanPhone;

      // Add formatting for better UX (only for display)
      if (cleanPhone.length >= 6) {
        if (cleanPhone.startsWith('01') && cleanPhone.length === 11) {
          // Bangladesh format: 01888227599 -> 018-8822-7599
          displayPhone = cleanPhone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
        } else if (cleanPhone.length >= 10) {
          // General format: 1234567890 -> 123-456-7890
          displayPhone = cleanPhone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        } else if (cleanPhone.length >= 7) {
          displayPhone = cleanPhone.replace(/(\d{3})(\d{3})(\d+)/, '$1-$2-$3');
        } else if (cleanPhone.length >= 4) {
          displayPhone = cleanPhone.replace(/(\d{3})(\d+)/, '$1-$2');
        }
      }

      setFormData((prev) => ({
        ...prev,
        [field]: displayPhone,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

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

      // ✅ FIXED: Clean phone number before sending
      const cleanPhone = formData.phone.replace(/\D/g, ''); // Remove all non-digits
      let finalPhone = cleanPhone;

      // ✅ Add country code if needed
      if (cleanPhone.startsWith('01') && cleanPhone.length === 11) {
        // Bangladesh format: 01888227599 -> +8801888227599
        finalPhone = '+88' + cleanPhone;
      } else if (cleanPhone.length === 10 && !cleanPhone.startsWith('1')) {
        // US format: add +1
        finalPhone = '+1' + cleanPhone;
      } else if (cleanPhone.length >= 10 && !cleanPhone.startsWith('+')) {
        // Generic international: add +
        finalPhone = '+' + cleanPhone;
      }

      console.log('📞 Original phone:', formData.phone);
      console.log('📞 Clean phone:', cleanPhone);
      console.log('📞 Final phone:', finalPhone);

      const result = await signup({
        fullName: formData.fullName,
        email: formData.email,
        phone: finalPhone, // ✅ Use cleaned phone
        password: formData.password,
        role: formData.role,
      });

      // ✅ FIXED: Enhanced success handling with better navigation
      if (result.success) {
        Alert.alert(
          '🎉 Account Created!',
          'Your account has been created successfully! You can now log in with your email and password.',
          [
            {
              text: 'Go to Login',
              onPress: navigateToLogin
            }
          ],
          { cancelable: false }
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
      } else if (error.message.includes('phone number')) {
        errorMessage = 'Please enter a valid phone number (e.g., 01888227599 or +8801888227599)';
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


// ✅ ADD: OAuth test function
const testOAuth = async () => {
  try {
    console.log('🧪 Testing OAuth configuration...');

    // Import GoogleOAuthService at the top if not already imported
    // import GoogleOAuthService from '../../services/GoogleOAuthService';

    // Debug redirect URIs
    await GoogleOAuthService.debugRedirectUri();

    // Get configuration status
    const status = GoogleOAuthService.getConfigurationStatus();
    console.log('📊 Configuration status:', status);

    // Test sign-in
    console.log('🚀 Testing OAuth sign-in...');
    const result = await GoogleOAuthService.signIn();

    console.log('📋 OAuth test result:', {
      success: result.success,
      hasUser: !!result.user,
      method: result.method,
      simulated: result.simulated,
      error: result.error
    });

    if (result.success) {
      Alert.alert(
        'OAuth Test Success! ✅',
        `Signed in as: ${result.user.email}\n` +
        `Method: ${result.method || 'unknown'}\n` +
        `Simulated: ${result.simulated ? 'Yes' : 'No'}`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'OAuth Test Failed ❌',
        result.error || 'Unknown error',
        [{ text: 'OK' }]
      );
    }

  } catch (error) {
    console.error('❌ OAuth test error:', error);
    Alert.alert(
      'Test Error ⚠️',
      `Error: ${error.message}\n\nCheck console for details.`,
      [{ text: 'OK' }]
    );
  }
};


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

            {/* ✅ Phone format helper */}
            <Text style={styles.phoneHint}>
              Format: +8801234567890 (with country code) or 01234567890
            </Text>

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

            <Text style={styles.passwordHint}>
              Must contain: uppercase letter, lowercase letter, and number
              (minimum 6 characters)
            </Text>

            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* ✅ Dynamic Password Strength Indicator */}
          {formData.password.length > 0 && (
            <View style={styles.passwordStrengthContainer}>
              {(() => {
                const { strength, checks } = getPasswordStrength(
                  formData.password,
                );
                const strengthText =
                  ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][strength] ||
                  'Very Strong';
                const strengthColor =
                  ['#E74C3C', '#E67E22', '#F39C12', '#27AE60', '#16A085'][
                    strength
                  ] || '#E74C3C';

                return (
                  <>
                    {/* Strength Bar */}
                    <View style={styles.strengthBarContainer}>
                      <Text style={styles.strengthLabel}>Strength: </Text>
                      <View style={styles.strengthBar}>
                        <View
                          style={[
                            styles.strengthFill,
                            {
                              width: `${(strength / 5) * 100}%`,
                              backgroundColor: strengthColor,
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[styles.strengthText, { color: strengthColor }]}
                      >
                        {strengthText}
                      </Text>
                    </View>

                    {/* Requirements Checklist */}
                    <View style={styles.requirementsContainer}>
                      <Text style={styles.requirementsTitle}>
                        Requirements:
                      </Text>
                      <View style={styles.requirementsList}>
                        <Text
                          style={[
                            styles.requirement,
                            checks.length
                              ? styles.requirementMet
                              : styles.requirementUnmet,
                          ]}
                        >
                          {checks.length ? '✅' : '❌'} At least 6 characters
                        </Text>
                        <Text
                          style={[
                            styles.requirement,
                            checks.lowercase
                              ? styles.requirementMet
                              : styles.requirementUnmet,
                          ]}
                        >
                          {checks.lowercase ? '✅' : '❌'} Lowercase letter
                        </Text>
                        <Text
                          style={[
                            styles.requirement,
                            checks.uppercase
                              ? styles.requirementMet
                              : styles.requirementUnmet,
                          ]}
                        >
                          {checks.uppercase ? '✅' : '❌'} Uppercase letter
                        </Text>
                        <Text
                          style={[
                            styles.requirement,
                            checks.number
                              ? styles.requirementMet
                              : styles.requirementUnmet,
                          ]}
                        >
                          {checks.number ? '✅' : '❌'} Number
                        </Text>
                        <Text
                          style={[
                            styles.requirement,
                            checks.symbol
                              ? styles.requirementMet
                              : styles.requirementUnmet,
                          ]}
                        >
                          {checks.symbol ? '🎯' : '⭕'} Special character
                          (optional)
                        </Text>
                      </View>
                    </View>
                  </>
                );
              })()}
            </View>
          )}

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

          {/* ✅ Google OAuth Button */}
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


      {/* ✅ NEW: Floating debug button (only in development) */}
      {__DEV__ && (
        <TouchableOpacity
          style={styles.floatingDebugButton}
          onPress={testOAuth}
          disabled={loading || googleLoading}
        >
          <Text style={styles.floatingDebugText}>🧪</Text>
        </TouchableOpacity>
      )}

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
  // ✅ Password Strength Styles
  passwordStrengthContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  strengthBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
    marginRight: 8,
  },
  strengthBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E9ECEF',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 8,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 3,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: 'bold',
    minWidth: 60,
  },
  requirementsContainer: {
    marginTop: 4,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 4,
  },
  requirementsList: {
    gap: 2,
  },
  requirement: {
    fontSize: 11,
    lineHeight: 16,
  },
  requirementMet: {
    color: '#27AE60',
    fontWeight: '600',
  },
  requirementUnmet: {
    color: '#6C757D',
  },
  phoneHint: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
    fontStyle: 'italic',
  },
  passwordHint: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
    fontStyle: 'italic',
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
    // ✅ Floating debug button styles
    floatingDebugButton: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#9B59B6',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 8,
      zIndex: 1000,
    },
    floatingDebugText: {
      fontSize: 20,
      color: '#FFFFFF',
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
