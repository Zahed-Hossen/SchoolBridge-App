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
  KeyboardAvoidingView,
  Platform,
  Linking,
  Image,
  SafeAreaView,
  ToastAndroid,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';
import { apiCall } from '../../api/client';
import { TEACHER_THEME } from '../../constants/theme';
import SimpleHeader from '../../components/navigation/SimpleHeader';
import { LinearGradient } from 'expo-linear-gradient';

const ActivationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { activateAccount, login } = useAuth();

  const [token, setToken] = useState(route.params?.token || '');
  const [formData, setFormData] = useState({
    fullName: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(!!route.params?.token);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [invitationInfo, setInvitationInfo] = useState(null);

  // Handle deep linking for activation
  useEffect(() => {
    const handleDeepLink = (event) => {
      const url = event.url || event;
      const tokenMatch = url.match(/[?&]token=([^&]+)/);
      if (tokenMatch && tokenMatch[1]) {
        const newToken = decodeURIComponent(tokenMatch[1]);
        setToken(newToken);
        validateInvitationToken(newToken);
      }
    };

    // Check if app was opened from a URL
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    // Listen for URL events when app is running in the background
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // If we have a token from route params, validate it
    if (token) {
      validateInvitationToken(token);
    }

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  const validateInvitationToken = async (tokenToValidate) => {
    try {
      setValidating(true);
      const data = await apiCall(
        'GET',
        `/invitations/validate-token/${tokenToValidate}`,
      );
      if (data && data.success) {
        setInvitationInfo(data.data);
        setFormData((prev) => ({
          ...prev,
          email: data.data.email,
          role: data.data.role,
        }));
      } else {
        Alert.alert(
          'Invalid Token',
          data.message || 'Token invalid or expired',
        );
        navigation.goBack();
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to validate token');
      navigation.goBack();
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async () => {
    // Validation logic
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8)
      newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    try {
      setLoading(true);

      const activationData = await apiCall('POST', '/auth/activate', {
        token,
        fullName: formData.fullName,
        password: formData.password,
      });

      // If activation is successful, log the user in automatically
      const loginResponse = login(
        formData.email,
        formData.password,
        formData.role,
      );

      if (loginResponse && loginResponse.success) {
        showSuccess(
          'Account activated',
          'Your account has been activated successfully!',
        );
        // Navigate to appropriate dashboard based on role
        navigation.reset({
          index: 0,
          routes: [
            {
              name:
                formData.role === 'teacher'
                  ? 'TeacherDashboard'
                  : 'ParentDashboard',
            },
          ],
        });
      } else {
        // If auto-login fails, redirect to login screen with success message
        showSuccess(
          'Account activated',
          'Your account has been activated! Please log in to continue.',
        );
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Activation error:', error);
      showError(
        'Activation Failed',
        error.message || 'An error occurred while activating your account',
      );
    } finally {
      setLoading(false);
    }
  };
  // Helper function to show error messages
  const showError = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid?.show?.(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Error', message);
    }
  };

  // Helper function to show success messages
  const showSuccess = (title, message) => {
    if (Platform.OS === 'android') {
      ToastAndroid?.show?.(message || title, ToastAndroid.SHORT);
    } else {
      Alert.alert(title || 'Success', message || '');
    }
  };
  // Manual token entry UI if no token or invalid token
  if (!token || (!invitationInfo && !validating)) {
    return (
      <SafeAreaView style={styles.container}>
        <SimpleHeader
          title="Activate Your Account"
          subtitle="Enter your activation token from the email to continue."
          navigation={navigation}
          primaryColor={TEACHER_THEME.colors.primary}
          userRole="Teacher"
        />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.card}>
            <View style={styles.headerContainer}>
              <Ionicons
                name="key-outline"
                size={48}
                color={TEACHER_THEME.colors.primary}
              />
              <Text style={styles.title}>Activate Your Account</Text>
              <Text style={styles.subtitle}>
                Enter your activation token from the email to continue.
              </Text>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Activation Token</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Paste your activation token"
                  value={token}
                  onChangeText={setToken}
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
            </View>
            <TouchableOpacity
              style={[
                {
                  borderRadius: 8,
                  overflow: 'hidden',
                  marginTop: 8,
                  shadowColor: '#2E86AB',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.18,
                  shadowRadius: 6,
                  elevation: 3,
                },
                (!token || loading) && { opacity: 0.6 },
              ]}
              onPress={() => validateInvitationToken(token)}
              disabled={!token || loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#2E86AB', '#43cea2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 16,
                  alignItems: 'center',
                  borderRadius: 8,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text
                    style={{
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: 17,
                      letterSpacing: 0.5,
                      textShadowColor: 'rgba(0,0,0,0.08)',
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 2,
                    }}
                  >
                    Validate Token
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
            <View style={styles.footer}>
              <View style={{ alignItems: 'center', marginTop: 24 }}>
                <Text
                  style={[
                    styles.footerText,
                    { fontSize: 15, color: '#444', textAlign: 'center' },
                  ]}
                >
                  Already have an account?
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  activeOpacity={0.7}
                  style={{ marginTop: 4 }}
                >
                  <Text
                    style={{
                      color: '#2E86AB',
                      fontWeight: 'bold',
                      textDecorationLine: 'underline',
                      fontSize: 16,
                      letterSpacing: 0.2,
                    }}
                  >
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Defensive: Only render registration form if invitationInfo is not null
  if (!invitationInfo) return null;

  return (
    <SafeAreaView style={styles.container}>
      <SimpleHeader
        title="Complete Your Registration"
        navigation={navigation}
        primaryColor="#2E86AB"
        // userRole={invitationInfo?.role || 'Teacher'}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.card}>
            <View style={styles.headerContainer}>
              <Ionicons
                name="person-add"
                size={48}
                color={TEACHER_THEME.colors.primary}
              />
              <Text style={styles.title}>Complete Your Registration</Text>
              <Text style={styles.subtitle}>
                {invitationInfo?.schoolName
                  ? `You're joining ${invitationInfo.schoolName} as a ${invitationInfo.role}`
                  : `You've been invited as a ${invitationInfo?.role || ''}`}
              </Text>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={formData.email}
                  editable={false}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.fullName && styles.inputError,
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, fullName: text })
                  }
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
              {errors.fullName && (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Create Password</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.password && styles.inputError,
                  { position: 'relative' },
                ]}
              >
                <TextInput
                  style={[styles.input, { paddingRight: 40 }]}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChangeText={(text) =>
                    setFormData({ ...formData, password: text })
                  }
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIconAbsolute}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.helperText}>
                Must be at least 8 characters with a number and special
                character
              </Text>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.confirmPassword && styles.inputError,
                  { position: 'relative' },
                ]}
              >
                <TextInput
                  style={[styles.input, { paddingRight: 40 }]}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChangeText={(text) =>
                    setFormData({ ...formData, confirmPassword: text })
                  }
                  secureTextEntry={!showConfirmPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIconAbsolute}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                {
                  borderRadius: 8,
                  overflow: 'hidden',
                  marginTop: 8,
                  shadowColor: '#2E86AB',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.18,
                  shadowRadius: 6,
                  elevation: 3,
                },
                (loading ||
                  !formData.fullName ||
                  !formData.password ||
                  !formData.confirmPassword) && { opacity: 0.6 },
              ]}
              onPress={handleSubmit}
              disabled={
                loading ||
                !formData.fullName ||
                !formData.password ||
                !formData.confirmPassword
              }
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#2E86AB', '#43cea2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 16,
                  alignItems: 'center',
                  borderRadius: 8,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text
                    style={{
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: 17,
                      letterSpacing: 0.5,
                      textShadowColor: 'rgba(0,0,0,0.08)',
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 2,
                    }}
                  >
                    Activate Account
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.footer}>
              <View style={{ alignItems: 'center', marginTop: 24 }}>
                <Text
                  style={[
                    styles.footerText,
                    { fontSize: 15, color: '#444', textAlign: 'center' },
                  ]}
                >
                  Already have an account?
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  activeOpacity={0.7}
                  style={{ marginTop: 4 }}
                >
                  <Text
                    style={{
                      color: '#2E86AB',
                      fontWeight: 'bold',
                      textDecorationLine: 'underline',
                      fontSize: 16,
                      letterSpacing: 0.2,
                    }}
                  >
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b2c3c9ff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#81b2ceff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3748',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#fbfcfdff',
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#c8e2eeff',
  },
  passwordFieldWrapper: { position: 'relative', justifyContent: 'center' },
  passwordInput: { paddingRight: 40 },
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
  inputError: { borderColor: '#E74C3C' },
  errorText: { fontSize: 14, color: '#E74C3C', marginTop: 4 },
  activateButton: {
    backgroundColor: '#2E86AB',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2E86AB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  activateButtonDisabled: { opacity: 0.6 },
  activateButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default ActivationScreen;
