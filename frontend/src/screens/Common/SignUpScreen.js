import React, { useState, useEffect } from 'react';
import { Modal, Linking } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import GoogleOAuthService from '../../services/GoogleOAuthService';
import authService from '../../api/services/authService';
import { USER_ROLES, API_URL } from '../../constants/config';
import { showError, showSuccess } from '../../utils/helpers';

const SignUpScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { signup, signInWithGoogle, user, role, isAuthenticated } = useAuth();

  // Check for invitation token in URL params
  const [invitationToken, setInvitationToken] = useState(
    route.params?.token || '',
  );
  const [invitationData, setInvitationData] = useState(null);
  const [checkingInvitation, setCheckingInvitation] = useState(
    !!route.params?.token,
  );

  // Determine signup type based on invitation or default to visitor
  const signupType = invitationToken ? 'platform' : 'visitor';

  const [formData, setFormData] = useState({
    fullName: '',
    email: invitationData?.email || '',
    phone: '',
    password: '',
    confirmPassword: '',
    role:
      invitationData?.role ||
      (signupType === 'platform' ? '' : USER_ROLES.VISITOR),
  });
  const [showRolePicker, setShowRolePicker] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check invitation token on component mount
  useEffect(() => {
    const checkInvitation = async () => {
      if (!invitationToken) {
        setCheckingInvitation(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/invitations/validate-token/${invitationToken}`,
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Invalid or expired invitation');
        }

        setInvitationData(data.data.invitation);
        setFormData((prev) => ({
          ...prev,
          email: data.data.invitation.email,
          role: data.data.invitation.role,
        }));
      } catch (error) {
        showError(error.message || 'Failed to validate invitation');
        navigation.navigate('Login');
      } finally {
        setCheckingInvitation(false);
      }
    };

    if (invitationToken) {
      checkInvitation();
    } else {
      setCheckingInvitation(false);
    }
  }, [invitationToken, navigation]);

  // Handle role selection for non-invited users
  useEffect(() => {
    if (user && !role && !isAuthenticated && !googleLoading && !loading) {
      if (invitationToken) {
        // For invited users, we already have their role from the invitation
        // Just navigate to the appropriate screen
        navigation.navigate('App');
      } else {
        // For non-invited users, go to role selection
        navigation.navigate('RoleSelection', { user });
      }
    }
  }, [
    user,
    role,
    isAuthenticated,
    googleLoading,
    loading,
    navigation,
    invitationToken,
  ]);

  // Deep link handler for activation
  useEffect(() => {
    const handleDeepLink = (event) => {
      const { url } = event;
      if (url && url.includes('activate?token=')) {
        const token = url.split('activate?token=')[1];
        navigation.navigate('Activation', { token });
      }
    };

    const init = async () => {
      const url = await Linking.getInitialURL();
      if (url && url.includes('activate?token=')) {
        const token = url.split('activate?token=')[1];
        navigation.navigate('Activation', { token });
      }
    };

    const sub = Linking.addEventListener('url', handleDeepLink);
    init();
    return () => {
      sub && sub.remove && sub.remove();
    };
  }, [navigation]);

  const getPasswordStrength = (password) => {
    let strength = 0;
    const checks = {
      length: password.length >= 6,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    Object.values(checks).forEach((check) => {
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

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        newErrors.phone = 'Please enter a valid phone number (10-15 digits)';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Only require role for platform users
    if (signupType === 'platform' && !formData.role) {
      newErrors.role = 'Please select a role';
    }

    if (!termsAccepted) {
      newErrors.terms = 'Please accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    if (field === 'phone') {
      let cleanPhone = value.replace(/\D/g, '');
      if (cleanPhone.length > 15) cleanPhone = cleanPhone.substring(0, 15);

      let displayPhone = cleanPhone;
      if (cleanPhone.length >= 6) {
        if (cleanPhone.startsWith('01') && cleanPhone.length === 11) {
          displayPhone = cleanPhone.replace(
            /(\d{3})(\d{4})(\d{4})/,
            '$1-$2-$3',
          );
        } else if (cleanPhone.length >= 10) {
          displayPhone = cleanPhone.replace(
            /(\d{3})(\d{3})(\d{4})/,
            '$1-$2-$3',
          );
        } else if (cleanPhone.length >= 7) {
          displayPhone = cleanPhone.replace(/(\d{3})(\d{3})(\d+)/, '$1-$2-$3');
        } else if (cleanPhone.length >= 4) {
          displayPhone = cleanPhone.replace(/(\d{3})(\d+)/, '$1-$2');
        }
      }

      setFormData((prev) => ({ ...prev, [field]: displayPhone }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      let finalPhone = cleanPhone;

      if (cleanPhone.startsWith('01') && cleanPhone.length === 11) {
        finalPhone = '+88' + cleanPhone;
      } else if (cleanPhone.length === 10 && !cleanPhone.startsWith('1')) {
        finalPhone = '+1' + cleanPhone;
      } else if (cleanPhone.length >= 10 && !cleanPhone.startsWith('+')) {
        finalPhone = '+' + cleanPhone;
      }

      const signupPayload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: finalPhone,
        password: formData.password,
        role: USER_ROLES.VISITOR,
        signupType: 'visitor',
      };

      const result = await signup(signupPayload);

      if (result.success) {
        Alert.alert(
          'Account Created!',
          'Your account has been created successfully!',
          [{ text: 'Login', onPress: () => navigation.replace('Login') }],
          { cancelable: false },
        );
      } else {
        throw new Error(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      let errorMessage = 'Failed to create account';

      if (error.message.includes('email already exists')) {
        errorMessage = 'An account with this email already exists.';
      } else if (error.message.includes('phone number')) {
        errorMessage = 'Please enter a valid phone number';
      } else if (error.message.includes('validation')) {
        errorMessage = 'Please check your input and try again.';
      } else if (error.message.includes('Network Error')) {
        errorMessage =
          'Cannot connect to server. Please check your connection.';
      }

      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      const result = await GoogleOAuthService.signIn();
      if (result.success) {
        await signInWithGoogle(result);
      } else if (!result.cancelled) {
        throw new Error(result.error || 'Google sign-up failed');
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      let errorMessage = 'Failed to sign up with Google';
      if (error.message.includes('cancelled'))
        errorMessage = 'Sign-up was cancelled';
      else if (error.message.includes('network'))
        errorMessage = 'Network error. Please check your connection.';
      Alert.alert('Google Sign Up Failed', errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  // Show loading indicator while checking invitation
  if (checkingInvitation) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4F8EF7" />
        <Text style={styles.loadingText}>Validating your invitation...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>
          {invitationToken ? 'Complete Your Account' : ''}
        </Text>

        {invitationToken && (
          <View style={styles.invitationBanner}>
            <Ionicons
              name="mail"
              size={20}
              color="#fff"
              style={styles.invitationIcon}
            />
            <Text style={styles.invitationText}>
              You're joining as a {invitationData?.role || 'user'}
            </Text>
          </View>
        )}

        {/* Signup Form */}
        <LinearGradient
          colors={['#f5f7fa', '#c3cfe2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>Visitor Sign Up</Text>
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
                style={[
                  styles.input,
                  errors.email && styles.inputError,
                  invitationToken && styles.disabledInput,
                ]}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="Enter your email"
                placeholderTextColor="#999999"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!invitationToken}
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
              <Text style={styles.phoneHint}>
                Format: +8801234567890 or 01234567890
              </Text>
              {errors.phone && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}
            </View>
            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordFieldWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    errors.password && styles.inputError,
                  ]}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  placeholder="Enter your password"
                  placeholderTextColor="#999999"
                  secureTextEntry={!showPassword}
                  editable={!loading && !googleLoading}
                />
                <TouchableOpacity
                  style={styles.eyeIconAbsolute}
                  onPress={() => setShowPassword((prev) => !prev)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={22}
                    color="#888"
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.passwordHint}>
                Must contain: uppercase, lowercase, and number (min 6
                characters)
              </Text>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>
            {/* Password Strength Indicator */}
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
                          style={[
                            styles.strengthText,
                            { color: strengthColor },
                          ]}
                        >
                          {strengthText}
                        </Text>
                      </View>
                    </>
                  );
                })()}
              </View>
            )}
            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.passwordFieldWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    errors.confirmPassword && styles.inputError,
                  ]}
                  value={formData.confirmPassword}
                  onChangeText={(value) =>
                    handleInputChange('confirmPassword', value)
                  }
                  placeholder="Confirm your password"
                  placeholderTextColor="#999999"
                  secureTextEntry={!showConfirmPassword}
                  editable={!loading && !googleLoading}
                />
                <TouchableOpacity
                  style={styles.eyeIconAbsolute}
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={22}
                    color="#888"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>
            {/* Role */}
            {signupType === 'platform' && !invitationToken && (
              <View>
                <Text style={styles.label}>Select Your Role</Text>
                <View style={styles.roleContainer}>
                  {Object.entries(USER_ROLES)
                    .filter(([key]) => key !== 'VISITOR')
                    .map(([key, value]) => (
                      <TouchableOpacity
                        key={key}
                        style={[
                          styles.roleButton,
                          formData.role === value && styles.roleButtonSelected,
                        ]}
                        onPress={() =>
                          setFormData({ ...formData, role: value })
                        }
                      >
                        <Text
                          style={[
                            styles.roleButtonText,
                            formData.role === value &&
                              styles.roleButtonTextSelected,
                          ]}
                        >
                          {key.charAt(0) + key.slice(1).toLowerCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
                {errors.role && (
                  <Text style={styles.errorText}>{errors.role}</Text>
                )}
              </View>
            )}
            {invitationToken && formData.role && (
              <View style={styles.roleDisplay}>
                <Text style={styles.roleLabel}>Role:</Text>
                <View
                  style={[
                    styles.roleBadge,
                    formData.role === 'Admin' && styles.roleAdmin,
                    formData.role === 'Teacher' && styles.roleTeacher,
                    formData.role === 'Student' && styles.roleStudent,
                    formData.role === 'Parent' && styles.roleParent,
                  ]}
                >
                  <Text style={styles.roleBadgeText}>{formData.role}</Text>
                </View>
              </View>
            )}
            {/* Terms Acceptance */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setTermsAccepted(!termsAccepted)}
              disabled={loading || googleLoading}
            >
              <View
                style={[
                  styles.checkbox,
                  termsAccepted && styles.checkboxChecked,
                ]}
              >
                <Ionicons
                  name="checkmark"
                  size={14}
                  color={termsAccepted ? '#f7f8f8ff' : '#98b2b9ff'}
                />
              </View>
              <Text style={styles.checkboxLabel}>
                I accept the terms and conditions
              </Text>
            </TouchableOpacity>
            {errors.terms && (
              <Text style={styles.errorText}>{errors.terms}</Text>
            )}
            {/* Sign Up Button */}
            <TouchableOpacity
              style={[
                styles.signupButton,
                (loading || googleLoading) && styles.signupButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading || googleLoading || !termsAccepted}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.signupButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>
            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>Or</Text>
              <View style={styles.divider} />
            </View>
            {/* Google Sign Up */}
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
                  <Ionicons
                    name="logo-google"
                    size={20}
                    color="#FFFFFF"
                    style={styles.googleButtonIcon}
                  />
                  <Text style={styles.googleButtonText}>
                    Sign up with Google
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Info Section moved below card */}
            {!invitationToken && (
              <View style={styles.infoBox}>
                <Ionicons
                  name="information-circle"
                  size={20}
                  color="#2E86AB"
                  style={{ marginTop: 2 }}
                />
                <Text style={styles.infoText}>
                  Platform users (students, teachers, admins) must be invited by
                  their institution.
                  <Text
                    style={styles.linkText}
                    onPress={() => navigation.navigate('Activation')}
                  >
                    {' '}
                    Have an activation token?
                  </Text>
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
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
    marginBottom: 20,
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e8f4fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    color: '#2E86AB',
    fontSize: 14,
    lineHeight: 20,
  },
  linkText: {
    color: '#1a73e8',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  card: {
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    // backgroundColor removed for gradient
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 24,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
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
  passwordFieldWrapper: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIconAbsolute: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    zIndex: 2,
  },
  inputError: {
    borderColor: '#E74C3C',
  },
  errorText: {
    fontSize: 14,
    color: '#E74C3C',
    marginTop: 4,
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
  roleContainer: {
    gap: 8,
  },
  roleButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  roleButtonSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2E86AB',
  },
  roleButtonText: {
    fontSize: 16,
    color: '#333333',
  },
  roleButtonTextSelected: {
    color: '#2E86AB',
    fontWeight: '600',
  },
  roleDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  roleLabel: {
    fontSize: 16,
    marginRight: 10,
    color: '#333',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleBadgeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  roleAdmin: { backgroundColor: '#8e44ad' },
  roleTeacher: { backgroundColor: '#3498db' },
  roleStudent: { backgroundColor: '#2ecc71' },
  roleParent: { backgroundColor: '#e67e22' },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
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
  signupButton: {
    backgroundColor: '#2E86AB',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#2E86AB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
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
  googleButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
    marginRight: 12,
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  linkText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  linkButton: {
    fontSize: 16,
    color: '#2E86AB',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  invitationBanner: {
    flexDirection: 'row',
    backgroundColor: '#4F8EF7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  invitationIcon: {
    marginRight: 8,
  },
  invitationText: {
    color: '#fff',
    fontWeight: '500',
    flex: 1,
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
});

export default SignUpScreen;
