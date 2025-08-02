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












































































// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   KeyboardAvoidingView,
//   Platform,
//   Alert,
//   TouchableOpacity,
//   TextInput,
//   ActivityIndicator,
//   Animated,
//   PanGestureHandler,
//   State,
// } from 'react-native';
// import { useAuth } from '../../context/AuthContext';
// import { USER_ROLES } from '../../constants/config';
// import GoogleOAuthService from '../../services/GoogleOAuthService';
// import ConnectionTest from '../../components/ConnectionTest';

// const LoginScreen = ({ navigation }) => {
//   const { login, signInWithGoogle, isLoading, user, role, isAuthenticated } =
//     useAuth();
//   const [formData, setFormData] = useState({
//     email: 'test@schoolbridge.com', // Pre-filled for easy testing
//     password: 'password123', // Pre-filled for easy testing
//     role: USER_ROLES.STUDENT,
//   });
//   const [googleLoading, setGoogleLoading] = useState(false);
//   const [showConnectionTest, setShowConnectionTest] = useState(false);

//   // ✅ NEW: Hidden access states
//   const [secretTapCount, setSecretTapCount] = useState(0);
//   const [isDebugMode, setIsDebugMode] = useState(false);
//   const [shakeAnimation] = useState(new Animated.Value(0));
//   const secretTapTimeout = useRef(null);

//   // ✅ Auto-navigate OAuth users to role selection
//   useEffect(() => {
//     if (user && !role && !isAuthenticated && !googleLoading && !isLoading) {
//       console.log('🎯 Auto-navigating OAuth user to role selection from LoginScreen');
//       navigation.navigate('RoleSelection', { user });
//     }
//   }, [user, role, isAuthenticated, googleLoading, isLoading, navigation]);

//   // ✅ NEW: Secret tap sequence handler
//   const handleSecretTap = () => {
//     const newTapCount = secretTapCount + 1;
//     setSecretTapCount(newTapCount);

//     // Clear existing timeout
//     if (secretTapTimeout.current) {
//       clearTimeout(secretTapTimeout.current);
//     }

//     // Secret sequence: 7 taps on the app title
//     if (newTapCount >= 7) {
//       setIsDebugMode(true);
//       setSecretTapCount(0);

//       // Shake animation to indicate activation
//       Animated.sequence([
//         Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
//         Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
//         Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
//         Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true }),
//       ]).start();

//       console.log('🔧 Debug mode activated! Connection test unlocked.');

//       // Show subtle confirmation (only visible to those who know)
//       setTimeout(() => {
//         Alert.alert(
//           '🔧 Developer Mode',
//           'Connection test unlocked!\nTap the 🎓 again to access.',
//           [{ text: 'Got it!' }]
//         );
//       }, 500);
//     }

//     // Reset tap count after 3 seconds
//     secretTapTimeout.current = setTimeout(() => {
//       setSecretTapCount(0);
//     }, 3000);
//   };

//   // ✅ NEW: Alternative secret access methods

//   // Method 1: Long press on subtitle
//   const handleSubtitleLongPress = () => {
//     if (__DEV__) {
//       setIsDebugMode(true);
//       console.log('🔧 Debug mode activated via long press!');
//       Alert.alert('🔧 Dev Access', 'Connection test unlocked!', [{ text: 'OK' }]);
//     }
//   };

//   // Method 2: Swipe pattern on login card
//   const [swipeSequence, setSwipeSequence] = useState([]);
//   const requiredSwipePattern = ['right', 'left', 'right', 'down']; // Secret pattern

//   const handleSwipe = (direction) => {
//     const newSequence = [...swipeSequence, direction].slice(-4); // Keep last 4 swipes
//     setSwipeSequence(newSequence);

//     if (JSON.stringify(newSequence) === JSON.stringify(requiredSwipePattern)) {
//       setIsDebugMode(true);
//       setSwipeSequence([]);
//       console.log('🔧 Debug mode activated via swipe pattern!');
//       Alert.alert('🔧 Secret Access', 'Swipe pattern recognized!\nConnection test unlocked!');
//     }
//   };

//   // Method 3: Konami code style (tap password field in pattern)
//   const [konamiSequence, setKonamiSequence] = useState([]);
//   const konamiCode = ['up', 'up', 'down', 'down']; // Simplified for mobile

//   const handleKonamiTap = (direction) => {
//     const newSequence = [...konamiSequence, direction].slice(-4);
//     setKonamiSequence(newSequence);

//     if (JSON.stringify(newSequence) === JSON.stringify(konamiCode)) {
//       setIsDebugMode(true);
//       setKonamiSequence([]);
//       console.log('🔧 Debug mode activated via Konami code!');
//       Alert.alert('🔧 Konami Code', 'Classic cheat activated!\nConnection test unlocked!');
//     }
//   };

//   // ✅ NEW: Toggle connection test (only available when debug mode is active)
//   const toggleConnectionTest = () => {
//     if (isDebugMode || __DEV__) {
//       setShowConnectionTest(!showConnectionTest);
//     }
//   };

//   const handleInputChange = (field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleLogin = async () => {
//     if (!formData.email || !formData.password) {
//       Alert.alert('Error', 'Please fill in all fields');
//       return;
//     }

//     console.log('Attempting login with:', {
//       email: formData.email,
//       role: formData.role,
//     });

//     try {
//       const result = await login(formData.email, formData.password, formData.role);
//       console.log('Login result:', result);

//       if (result.success) {
//         Alert.alert('Success', 'Login successful!');
//       } else {
//         Alert.alert('Login Failed', result.error || 'Invalid credentials');
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       Alert.alert('Login Error', error.message || 'Something went wrong. Please try again.');
//     }
//   };

//   const handleGoogleSignIn = async () => {
//     setGoogleLoading(true);

//     try {
//       console.log('🔐 Starting Google OAuth sign-in...');
//       const result = await GoogleOAuthService.signIn();

//       if (result.success) {
//         console.log('✅ Google OAuth successful:', result.user.email);
//         const authResult = await signInWithGoogle(result);

//         if (authResult.success && authResult.needsRoleSelection) {
//           console.log('🎯 User needs role selection, waiting for auto-navigation...');
//         }
//       } else if (result.cancelled) {
//         console.log('ℹ️ User cancelled Google sign-in');
//       } else {
//         throw new Error(result.error || 'Google sign-in failed');
//       }
//     } catch (error) {
//       console.error('❌ Google OAuth error:', error);

//       let errorMessage = 'Failed to sign in with Google';
//       if (error.message.includes('cancelled')) {
//         errorMessage = 'Sign-in was cancelled';
//       } else if (error.message.includes('network')) {
//         errorMessage = 'Network error. Please check your connection.';
//       } else if (error.message.includes('PLAY_SERVICES_NOT_AVAILABLE')) {
//         errorMessage = 'Google Play Services not available. Please update Google Play Services.';
//       }

//       Alert.alert('Google Sign In Failed', errorMessage);
//     } finally {
//       setGoogleLoading(false);
//     }
//   };

//   const navigateToSignUp = () => {
//     navigation.navigate('SignUp');
//   };

//   // ✅ NEW: Connection test screen with hidden access
//   if (showConnectionTest) {
//     return (
//       <View style={styles.container}>
//         <View style={styles.connectionTestHeader}>
//           <TouchableOpacity
//             style={styles.backButton}
//             onPress={toggleConnectionTest}
//           >
//             <Text style={styles.backButtonText}>← Back to Login</Text>
//           </TouchableOpacity>
//           <Text style={styles.connectionTestTitle}>🔗 Connection Test</Text>

//           {/* ✅ NEW: Secret indicator */}
//           <View style={styles.secretIndicator}>
//             <Text style={styles.secretText}>🔧</Text>
//           </View>
//         </View>

//         <ConnectionTest />
//       </View>
//     );
//   }

//   return (
//     <KeyboardAvoidingView
//       style={styles.container}
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//     >
//       <ScrollView contentContainerStyle={styles.scrollContainer}>
//         {/* Header with Secret Access */}
//         <View style={styles.headerContainer}>

//           {/* ✅ NEW: Secret Method 1 - Multi-tap on title */}
//           <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
//             <TouchableOpacity
//               onPress={handleSecretTap}
//               activeOpacity={0.8}
//               style={styles.titleContainer}
//             >
//               <Text style={styles.appTitle}>
//                 🎓 SchoolBridge
//                 {secretTapCount > 0 && secretTapCount < 7 && (
//                   <Text style={styles.tapIndicator}> ({secretTapCount}/7)</Text>
//                 )}
//               </Text>
//             </TouchableOpacity>
//           </Animated.View>

//           {/* ✅ NEW: Secret Method 2 - Long press on subtitle */}
//           <TouchableOpacity
//             onLongPress={handleSubtitleLongPress}
//             delayLongPress={3000} // 3 second long press
//             activeOpacity={1}
//           >
//             <Text style={styles.subtitle}>
//               Welcome back! Please sign in to continue.
//             </Text>
//           </TouchableOpacity>

//           {/* ✅ NEW: Hidden debug mode indicator */}
//           {isDebugMode && (
//             <TouchableOpacity
//               style={styles.hiddenDebugButton}
//               onPress={toggleConnectionTest}
//             >
//               <Text style={styles.hiddenDebugText}>🔧 Test Connection</Text>
//             </TouchableOpacity>
//           )}
//         </View>

//         {/* ✅ NEW: Login Form with Secret Swipe Access */}
//         <View
//           style={styles.card}
//           onTouchEnd={(event) => {
//             // Simple swipe detection
//             const { locationX, locationY } = event.nativeEvent;
//             const cardWidth = 300; // Approximate card width
//             const cardHeight = 400; // Approximate card height

//             if (locationX < cardWidth * 0.3) handleSwipe('left');
//             else if (locationX > cardWidth * 0.7) handleSwipe('right');
//             else if (locationY < cardHeight * 0.3) handleSwipe('up');
//             else if (locationY > cardHeight * 0.7) handleSwipe('down');
//           }}
//         >
//           <Text style={styles.cardTitle}>Sign In</Text>

//           {/* Email Input */}
//           <View style={styles.inputGroup}>
//             <Text style={styles.label}>Email</Text>
//             <TextInput
//               style={styles.input}
//               value={formData.email}
//               onChangeText={(text) => handleInputChange('email', text)}
//               placeholder="Enter your email"
//               keyboardType="email-address"
//               autoCapitalize="none"
//               editable={!isLoading && !googleLoading}
//             />
//           </View>

//           {/* ✅ NEW: Password Input with Secret Konami Access */}
//           <View style={styles.inputGroup}>
//             <TouchableOpacity onPress={() => handleKonamiTap('up')}>
//               <Text style={styles.label}>Password</Text>
//             </TouchableOpacity>
//             <TextInput
//               style={styles.input}
//               value={formData.password}
//               onChangeText={(text) => handleInputChange('password', text)}
//               placeholder="Enter your password"
//               secureTextEntry
//               editable={!isLoading && !googleLoading}
//               onTouchStart={() => handleKonamiTap('down')}
//             />
//           </View>

//           {/* Role Selection */}
//           <View style={styles.inputGroup}>
//             <Text style={styles.label}>Select Role:</Text>
//             <View style={styles.roleContainer}>
//               {Object.values(USER_ROLES).map((role) => (
//                 <TouchableOpacity
//                   key={role}
//                   style={[
//                     styles.roleOption,
//                     formData.role === role && styles.selectedRole,
//                   ]}
//                   onPress={() => handleInputChange('role', role)}
//                   disabled={isLoading || googleLoading}
//                 >
//                   <View
//                     style={[
//                       styles.radioButton,
//                       formData.role === role && styles.radioButtonSelected,
//                     ]}
//                   >
//                     {formData.role === role && (
//                       <View style={styles.radioButtonInner} />
//                     )}
//                   </View>
//                   <Text
//                     style={[
//                       styles.roleText,
//                       formData.role === role && styles.selectedRoleText,
//                     ]}
//                   >
//                     {role}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </View>

//           {/* Login Button */}
//           <TouchableOpacity
//             style={[
//               styles.loginButton,
//               (isLoading || googleLoading) && styles.loginButtonDisabled,
//             ]}
//             onPress={handleLogin}
//             disabled={isLoading || googleLoading}
//           >
//             {isLoading ? (
//               <ActivityIndicator color="#FFFFFF" />
//             ) : (
//               <Text style={styles.loginButtonText}>Sign In</Text>
//             )}
//           </TouchableOpacity>

//           {/* Divider */}
//           <View style={styles.dividerContainer}>
//             <View style={styles.divider} />
//             <Text style={styles.dividerText}>Or</Text>
//             <View style={styles.divider} />
//           </View>

//           {/* Google Button */}
//           <TouchableOpacity
//             style={[
//               styles.googleButton,
//               googleLoading && styles.googleButtonDisabled,
//             ]}
//             onPress={handleGoogleSignIn}
//             disabled={isLoading || googleLoading}
//           >
//             {googleLoading ? (
//               <ActivityIndicator color="#FFFFFF" />
//             ) : (
//               <>
//                 <Text style={styles.googleButtonIcon}>🔍</Text>
//                 <Text style={styles.googleButtonText}>Continue with Google</Text>
//               </>
//             )}
//           </TouchableOpacity>

//           {/* Sign Up Link */}
//           <View style={styles.linkContainer}>
//             <Text style={styles.linkText}>Don't have an account? </Text>
//             <TouchableOpacity
//               onPress={navigateToSignUp}
//               disabled={isLoading || googleLoading}
//             >
//               <Text style={styles.linkButton}>Sign Up</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* ✅ NEW: Secret access instructions (only visible in debug mode) */}
//         {isDebugMode && __DEV__ && (
//           <View style={styles.debugInstructions}>
//             <Text style={styles.debugInstructionsTitle}>🔧 Developer Mode Active</Text>
//             <Text style={styles.debugInstructionsText}>
//               • Tap 🎓 (7 times) - Multi-tap access{'\n'}
//               • Long press subtitle (3s) - Hold access{'\n'}
//               • Swipe pattern: → ← → ↓ - Gesture access{'\n'}
//               • Tap "Password" label then input - Konami access
//             </Text>
//           </View>
//         )}
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8F9FA',
//   },
//   scrollContainer: {
//     flexGrow: 1,
//     justifyContent: 'center',
//     padding: 24,
//   },
//   headerContainer: {
//     alignItems: 'center',
//     marginBottom: 32,
//   },

//   // ✅ NEW: Secret access styles
//   titleContainer: {
//     alignItems: 'center',
//   },
//   appTitle: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: '#2E86AB',
//     marginBottom: 8,
//   },
//   tapIndicator: {
//     fontSize: 12,
//     color: '#F39C12',
//     fontWeight: 'normal',
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#666666',
//     textAlign: 'center',
//     marginBottom: 16,
//   },

//   // ✅ NEW: Hidden debug button (only appears when unlocked)
//   hiddenDebugButton: {
//     backgroundColor: '#27AE60',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 15,
//     marginTop: 8,
//     opacity: 0.8,
//   },
//   hiddenDebugText: {
//     color: '#FFFFFF',
//     fontSize: 12,
//     fontWeight: '600',
//   },

//   // ✅ NEW: Connection test header with secret indicator
//   connectionTestHeader: {
//     backgroundColor: '#2E86AB',
//     paddingTop: Platform.OS === 'ios' ? 50 : 30,
//     paddingBottom: 16,
//     paddingHorizontal: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   backButton: {
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 6,
//   },
//   backButtonText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   connectionTestTitle: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: 'bold',
//     flex: 1,
//     textAlign: 'center',
//   },
//   secretIndicator: {
//     width: 30,
//     alignItems: 'center',
//   },
//   secretText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//   },

//   // ✅ NEW: Debug instructions (only shown when debug mode is active)
//   debugInstructions: {
//     backgroundColor: '#2C3E50',
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 20,
//     opacity: 0.9,
//   },
//   debugInstructionsTitle: {
//     color: '#F39C12',
//     fontSize: 14,
//     fontWeight: 'bold',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   debugInstructionsText: {
//     color: '#ECF0F1',
//     fontSize: 11,
//     lineHeight: 16,
//     fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
//   },

//   // ... rest of existing styles remain the same
//   card: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 24,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   cardTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333333',
//     textAlign: 'center',
//     marginBottom: 24,
//   },
//   inputGroup: {
//     marginBottom: 20,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333333',
//     marginBottom: 8,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//     borderRadius: 8,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     fontSize: 16,
//     color: '#333333',
//     backgroundColor: '#FFFFFF',
//   },
//   roleContainer: {
//     gap: 8,
//   },
//   roleOption: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//   },
//   selectedRole: {
//     backgroundColor: '#E3F2FD',
//     borderColor: '#2E86AB',
//   },
//   radioButton: {
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     borderWidth: 2,
//     borderColor: '#E0E0E0',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//   },
//   radioButtonSelected: {
//     borderColor: '#2E86AB',
//   },
//   radioButtonInner: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: '#2E86AB',
//   },
//   roleText: {
//     fontSize: 16,
//     color: '#333333',
//   },
//   selectedRoleText: {
//     color: '#2E86AB',
//     fontWeight: '600',
//   },
//   loginButton: {
//     backgroundColor: '#2E86AB',
//     paddingVertical: 14,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 8,
//     marginBottom: 16,
//   },
//   loginButtonDisabled: {
//     opacity: 0.6,
//   },
//   loginButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   dividerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 16,
//   },
//   divider: {
//     flex: 1,
//     height: 1,
//     backgroundColor: '#E0E0E0',
//   },
//   dividerText: {
//     marginHorizontal: 16,
//     fontSize: 14,
//     color: '#666666',
//     fontWeight: '500',
//   },
//   googleButton: {
//     backgroundColor: '#4285F4',
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 24,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   googleButtonDisabled: {
//     opacity: 0.6,
//   },
//   googleButtonIcon: {
//     fontSize: 18,
//     marginRight: 12,
//   },
//   googleButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   linkContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   linkText: {
//     fontSize: 16,
//     color: '#666666',
//   },
//   linkButton: {
//     fontSize: 16,
//     color: '#2E86AB',
//     fontWeight: 'bold',
//   },
// });

// export default LoginScreen;
