import React, { useState, useEffect } from 'react';
import { Modal } from 'react-native';
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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES } from '../../constants/config';
import GoogleOAuthService from '../../services/GoogleOAuthService';
import { LinearGradient } from 'expo-linear-gradient';

const LoginScreen = ({ navigation }) => {
  const { login, signInWithGoogle, isLoading, user, role, isAuthenticated } =
    useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: USER_ROLES.VISITOR,
  });
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState('visitor');
  const [showRolePicker, setShowRolePicker] = useState(false);

 
  useEffect(() => {
    if (
      user &&
      !role &&
      !isAuthenticated &&
      !googleLoading &&
      !isLoading &&
      loginType === 'platform'
    ) {
      console.log(
        'Auto-navigating OAuth platform user to role selection from LoginScreen',
      );
      navigation.navigate('RoleSelection', { user });
    }
  }, [
    user,
    role,
    isAuthenticated,
    googleLoading,
    isLoading,
    navigation,
    loginType,
  ]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogin = async () => {
    // Input validation
    if (!formData.email.trim() || !formData.password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    // Determine role
    const loginRole =
      loginType === 'platform' ? formData.role : USER_ROLES.VISITOR;
    if (loginType === 'platform' && !formData.role) {
      Alert.alert('Error', 'Please select your role.');
      return;
    }

    try {
      const result = await login(formData.email, formData.password, loginRole);
      console.log('Login result:', result);
      if (result.success) {
        // Navigation handled by AuthContext
      } else {
        let errorMessage = result.error || 'Invalid credentials';
        if (errorMessage.includes('No account found')) {
          errorMessage = 'No account found with this email address.';
        } else if (
          errorMessage.includes('Network Error') ||
          errorMessage.includes('Unable to connect')
        ) {
          errorMessage =
            'Cannot connect to server. Please check your connection.';
        }
        Alert.alert('Login Failed', errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage =
        error.message || 'Something went wrong. Please try again.';
      if (
        errorMessage.includes('Network Error') ||
        errorMessage.includes('Unable to connect')
      ) {
        errorMessage =
          'Cannot connect to server. Please check your connection.';
      }
      Alert.alert('Login Error', errorMessage);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      console.log('Starting Google OAuth sign-in...');
      const result = await GoogleOAuthService.signIn();
      if (result.success) {
        console.log('Google OAuth successful:', result.user.email);
        const authResult = await signInWithGoogle(result);
        if (authResult.success && authResult.needsRoleSelection) {
          // Navigation handled by AuthContext
        }
      } else if (result.cancelled) {
        console.log('User cancelled Google sign-in');
      } else {
        throw new Error(result.error || 'Google sign-in failed');
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      let errorMessage = 'Failed to sign in with Google';
      if (error.message.includes('cancelled')) {
        errorMessage = 'Sign-in was cancelled';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection.';
      }
      Alert.alert('Google Sign In Failed', errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  const navigateToSignUp = (type) => {
    navigation.navigate('SignUp', { signupType: type });
    setFormData({
      email: '',
      password: '',
      role: type === 'platform' ? USER_ROLES.PLATFORM_USER : USER_ROLES.VISITOR,
    });
    setLoginType(type);
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
            Welcome back! Please Log in to continue.
          </Text>
        </View>

        {/* Login Type Toggle */}
        <View style={styles.loginTypeContainer}>
          <TouchableOpacity
            style={[
              styles.loginTypeButton,
              loginType === 'platform' && styles.loginTypeActive,
            ]}
            onPress={() => setLoginType('platform')}
          >
            <Text
              style={[
                styles.loginTypeText,
                loginType === 'platform' && styles.loginTypeTextActive,
              ]}
            >
              Platform User
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.loginTypeButton,
              loginType === 'visitor' && styles.loginTypeActive,
            ]}
            onPress={() => setLoginType('visitor')}
          >
            <Text
              style={[
                styles.loginTypeText,
                loginType === 'visitor' && styles.loginTypeTextActive,
              ]}
            >
              Visitor
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Form */}
        <LinearGradient
          colors={['#f5f7fa', '#c3cfe2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>
            {loginType === 'platform' ? 'Platform User Login' : 'Visitor Login'}
          </Text>

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
            <View style={styles.passwordFieldWrapper}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                editable={!isLoading && !googleLoading}
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
          </View>

          {/* Role Selection - Only for platform users */}
          {loginType === 'platform' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Select Role:</Text>
              <TouchableOpacity
                style={[styles.input, { justifyContent: 'center' }]}
                onPress={() => setShowRolePicker(true)}
                disabled={isLoading || googleLoading}
              >
                <Text style={{ color: formData.role ? '#333' : '#999' }}>
                  {formData.role || 'Select your role'}
                </Text>
              </TouchableOpacity>
              <Modal
                visible={showRolePicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowRolePicker(false)}
              >
                <View
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <LinearGradient
                    colors={['#f5f7fa', '#c3cfe2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      borderRadius: 12,
                      padding: 24,
                      minWidth: 250,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: 'bold',
                        marginBottom: 20,
                        textAlign: 'center',
                      }}
                    >
                      Select Role
                    </Text>
                    {Object.values(USER_ROLES)
                      .filter((role) => role !== USER_ROLES.VISITOR)
                      .map((role) => (
                        <TouchableOpacity
                          key={role}
                          style={{
                            paddingVertical: 12,
                            borderBottomWidth: 1,
                            borderBottomColor: '#eee',
                          }}
                          onPress={() => {
                            handleInputChange('role', role);
                            setShowRolePicker(false);
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 16,
                              color: '#333',
                              textAlign: 'center',
                            }}
                          >
                            {role}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    <TouchableOpacity
                      style={{
                        paddingVertical: 12,
                        alignItems: 'center',
                        marginTop: 8,
                      }}
                      onPress={() => setShowRolePicker(false)}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          color: '#d62323ff',
                          fontWeight: 'bold',
                        }}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              </Modal>
            </View>
          )}

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

          {/* Google Sign In */}
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
                <Ionicons
                  name="logo-google"
                  size={20}
                  color="#FFFFFF"
                  style={styles.googleButtonIcon}
                />
                <Text style={styles.googleButtonText}>
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Sign Up Links */}
          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>Don't have an account? </Text>
            <View style={styles.signupLinks}>
              <TouchableOpacity
                onPress={() => navigateToSignUp('platform')}
                disabled={isLoading || googleLoading}
              >
                <Text style={styles.linkButton}>Platform User</Text>
              </TouchableOpacity>
              <Text style={styles.linkText}> or </Text>
              <TouchableOpacity
                onPress={() => navigateToSignUp('visitor')}
                disabled={isLoading || googleLoading}
              >
                <Text style={styles.linkButton}>Visitor</Text>
              </TouchableOpacity>
            </View>
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
  loginTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loginTypeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  loginTypeActive: {
    backgroundColor: '#2E86AB',
  },
  loginTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  loginTypeTextActive: {
    color: '#FFFFFF',
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
  passwordFieldWrapper: {
    position: 'relative',
    justifyContent: 'center',
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
    shadowColor: '#2E86AB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
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
  },
  linkText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  signupLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
  },
  linkButton: {
    fontSize: 16,
    color: '#2E86AB',
    fontWeight: 'bold',
    marginHorizontal: 4,
  },
});

export default LoginScreen;
