import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';
import { USER_ROLES } from '../../constants/config';

const RoleSelectionScreen = ({ navigation, route }) => {
  const { user, completeOAuthSetup, logout } = useAuth();
  const { setRole, currentRole } = useRole();
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);

  // Get user data from route params or auth context
  const userData = route?.params?.user || user;
  const { error, showError } = route?.params || {};

  console.log('🎯 RoleSelectionScreen - User Data:', {
    userData: !!userData,
    userRole: userData?.role,
    currentRole,
    selectedRole,
    hasCompleteOAuthSetup: !!completeOAuthSetup,
  });

  // ✅ FIX: Auto-select role if user already has one
  useEffect(() => {
    if (userData?.role && !selectedRole) {
      console.log('🔄 Auto-selecting role from user:', userData.role);
      setSelectedRole(userData.role);
    }
  }, [userData?.role, selectedRole]);

  // ✅ FIX: Show error if there was a role issue
  useEffect(() => {
    if (showError && error) {
      Alert.alert('Role Selection Required', error);
    }
  }, [showError, error]);

  const roles = [
    {
      key: USER_ROLES.STUDENT,
      title: 'Student',
      description: 'Access courses, assignments, and grades',
      icon: '🎓',
      color: '#3498DB',
    },
    {
      key: USER_ROLES.TEACHER,
      title: 'Teacher',
      description: 'Manage classes, assignments, and students',
      icon: '👨‍🏫',
      color: '#E74C3C',
    },
    {
      key: USER_ROLES.PARENT,
      title: 'Parent',
      description: 'Monitor your children\'s progress',
      icon: '👨‍👩‍👧‍👦',
      color: '#F39C12',
    },
    {
      key: USER_ROLES.ADMIN,
      title: 'Admin',
      description: 'Manage school operations and users',
      icon: '⚙️',
      color: '#9B59B6',
    },
  ];

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      Alert.alert('Selection Required', 'Please select your role to continue.');
      return;
    }

    setLoading(true);
    try {
      console.log('🎯 Selected role:', selectedRole);

      // ✅ FIX: Check if this is OAuth flow or direct role selection
      if (completeOAuthSetup && userData && !userData.role) {
        // OAuth flow - complete setup with selected role
        console.log('🔐 Completing OAuth setup with role:', selectedRole);
        await completeOAuthSetup(selectedRole);
      } else {
        // Direct role selection - just set the role
        console.log('🎭 Setting role directly:', selectedRole);
        await setRole(selectedRole);
      }

      console.log('✅ Role selection completed, AppNavigator should redirect');

      // ✅ FIX: Don't navigate manually - let AppNavigator handle the redirect
      // The role context update will trigger AppNavigator re-render

    } catch (error) {
      console.error('❌ Role selection error:', error);
      Alert.alert('Error', 'Failed to set up your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    Alert.alert(
      'Go Back',
      'Are you sure you want to go back? You\'ll need to sign in again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Go Back',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🔄 Logging out and going back...');
              await logout();
              // AppNavigator will automatically show AuthStack when user is logged out
            } catch (error) {
              console.error('❌ Error during logout:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          {userData?.photo ? (
            <Image source={{ uri: userData.photo }} style={styles.userImage} />
          ) : (
            <View style={styles.userImagePlaceholder}>
              <Text style={styles.userImageText}>
                {userData?.name?.charAt(0)?.toUpperCase() || userData?.firstName?.charAt(0)?.toUpperCase() || '👤'}
              </Text>
            </View>
          )}
          <Text style={styles.title}>Choose Your Role</Text>
          <Text style={styles.subtitle}>
            Hi {userData?.firstName || userData?.name?.split(' ')[0] || 'there'}!
            {'\n'}
            {userData?.role ?
              `Your account role is: ${userData.role}. Confirm or change below:` :
              'Please select how you\'ll be using SchoolBridge:'
            }
          </Text>
        </View>

        {/* Role Options */}
        <View style={styles.rolesContainer}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.key}
              style={[
                styles.roleCard,
                selectedRole === role.key && styles.selectedRoleCard,
                { borderColor: role.color },
                selectedRole === role.key && { backgroundColor: `${role.color}15` },
              ]}
              onPress={() => setSelectedRole(role.key)}
              disabled={loading}
            >
              <View style={styles.roleContent}>
                <Text style={styles.roleIcon}>{role.icon}</Text>
                <View style={styles.roleTextContainer}>
                  <Text style={[
                    styles.roleTitle,
                    selectedRole === role.key && { color: role.color }
                  ]}>
                    {role.title}
                    {userData?.role === role.key && ' (Current)'}
                  </Text>
                  <Text style={styles.roleDescription}>{role.description}</Text>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedRole === role.key && styles.radioButtonSelected,
                  selectedRole === role.key && { borderColor: role.color }
                ]}>
                  {selectedRole === role.key && (
                    <View style={[styles.radioButtonInner, { backgroundColor: role.color }]} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.continueButton, !selectedRole && styles.continueButtonDisabled]}
          onPress={handleRoleSelection}
          disabled={!selectedRole || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.continueButtonText}>
              {userData?.role === selectedRole ? 'Continue' : 'Confirm Role'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Keep your existing styles...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 10,
  },
  userImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  userImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userImageText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#666666',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  rolesContainer: {
    gap: 16,
  },
  roleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedRoleCard: {
    borderWidth: 2,
  },
  roleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderWidth: 2,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  actionContainer: {
    backgroundColor: '#F8F9FA',
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  continueButton: {
    backgroundColor: '#2E86AB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  backButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
});

export default RoleSelectionScreen;
