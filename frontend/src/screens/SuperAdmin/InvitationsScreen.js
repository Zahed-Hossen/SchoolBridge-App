import React, { useState, useEffect, useCallback } from 'react';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
  ToastAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { apiCall } from '../../api/client';

// Helper function to show error messages
const showError = (message) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert('Error', message);
  }
};

// Helper function to show success messages
const showSuccess = (message) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert('Success', message);
  }
};

const InvitationsScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [role] = useState('Admin'); // Only allow Admin role
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user, getToken } = useAuth();
  const [token, setToken] = useState('');
  const [schools, setSchools] = useState([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');

  // Get the token and schools when the component mounts
  useEffect(() => {
    const initializeTokenAndSchools = async () => {
      try {
        // First try to get token from AsyncStorage
        const accessToken = await AsyncStorage.getItem(
          '@schoolbridge_aaccess_token',
        );
        console.log(
          '🔑 Token from storage:',
          accessToken ? 'Token exists' : 'No token',
        );

        if (accessToken) {
          setToken(accessToken);
          // Fetch invitations after setting the token
          fetchInvitations();
        } else {
          console.warn('⚠️ No access token found in storage');
          showError('Please log in again');
        }
        // Fetch schools for dropdown
        const response = await apiCall('GET', '/schools');
        setSchools(response.schools || []);
      } catch (error) {
        console.error(
          '❌ Error initializing token or fetching schools:',
          error,
        );
        showError('Failed to initialize authentication or load schools');
      } finally {
        setLoading(false);
      }
    };
    initializeTokenAndSchools();
  }, [user]);

  // Remove roles array, only Admin is allowed

  const fetchInvitations = useCallback(async () => {
    try {
      setRefreshing(true);
      console.log('📥 Fetching invitations...');
      const response = await apiCall('GET', '/invitations');
      console.log('📤 Invitations response:', response);
      if (response.success) {
        // If response.data is an array, use it. If it's an object with invitations, use that.
        if (Array.isArray(response.data)) {
          setInvitations(response.data);
        } else if (response.data && Array.isArray(response.data.invitations)) {
          setInvitations(response.data.invitations);
        } else {
          setInvitations([]);
        }
      } else {
        throw new Error(response.message || 'Failed to fetch invitations');
      }
    } catch (error) {
      console.error('❌ Error fetching invitations:', error);
      showError(error.message || 'Failed to load invitations');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchInvitations();
  }, [fetchInvitations]);

  const handleCreateInvitation = async () => {
    if (!email) {
      showError('Please enter an email address');
      return;
    }
    if (!selectedSchoolId) {
      showError('Please select a school');
      return;
    }
    try {
      setLoading(true);
      console.log(
        '📤 Creating invitation for:',
        email,
        'as',
        role,
        'for school',
        selectedSchoolId,
      );
      const payload = {
        users: [
          {
            email,
            role,
            school_id: selectedSchoolId,
          },
        ],
      };
      const response = await apiCall('POST', '/invitations', payload);
      console.log('📥 Create invitation response:', response);
      if (response.success) {
        showSuccess('Invitation sent successfully');
        setEmail('');
        setSelectedSchoolId('');
        fetchInvitations();
      } else {
        throw new Error(response.message || 'Failed to create invitation');
      }
    } catch (error) {
      console.error('❌ Error creating invitation:', error);
      showError(error.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvitation = async (invitationId) => {
    try {
      setLoading(true);
      console.log('🔄 Resending invitation:', invitationId);

      const response = await apiCall(
        'POST',
        `/invitations/${invitationId}/resend`,
      );
      console.log('📤 Resend invitation response:', response);

      if (response.success) {
        showSuccess('Invitation resent successfully');
        fetchInvitations();
      } else {
        throw new Error(response.message || 'Failed to resend invitation');
      }
    } catch (error) {
      console.error('❌ Error resending invitation:', error);
      showError(error.message || 'Failed to resend invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeInvitation = (invitationId) => {
    Alert.alert(
      'Revoke Invitation',
      'Are you sure you want to revoke this invitation?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              console.log('🗑️ Revoking invitation:', invitationId);
              const response = await apiCall(
                'DELETE',
                `/invitations/${invitationId}`,
              );
              console.log('📥 Revoke invitation response:', response);

              if (response.success) {
                showSuccess('Invitation revoked successfully');
                fetchInvitations();
              } else {
                throw new Error(
                  response.message || 'Failed to revoke invitation',
                );
              }
            } catch (error) {
              console.error('❌ Revoke invitation error:', error);
              showError(error.message || 'Failed to revoke invitation');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const [pressedId, setPressedId] = useState(null);
  const renderInvitationItem = ({ item }) => {
    const invitationId = item.id || item._id;
    const isPressed = pressedId === invitationId;
    return (
      <TouchableOpacity
        activeOpacity={0.93}
        style={[
          styles.invitationItem,
          isPressed && styles.invitationItemPressed,
        ]}
        onPressIn={() => setPressedId(invitationId)}
        onPressOut={() => setPressedId(null)}
        delayPressIn={0}
      >
        <View style={styles.invitationDetails}>
          <Text style={styles.invitationEmail}>{item.email}</Text>
          <View style={styles.invitationMeta}>
            <View
              style={[
                styles.roleBadge,
                item.role === 'Admin' && styles.roleAdmin,
                item.role === 'Teacher' && styles.roleTeacher,
                item.role === 'Student' && styles.roleStudent,
                item.role === 'Parent' && styles.roleParent,
              ]}
            >
              <Text style={styles.roleText}>{item.role}</Text>
            </View>
            <Text style={styles.invitationStatus}>
              {item.isUsed
                ? 'Activated'
                : new Date(item.expiresAt) < new Date()
                ? 'Expired'
                : 'Pending'}
            </Text>
          </View>
          {item.createdAt && (
            <Text style={styles.invitationDate}>
              Sent on {formatDate(item.createdAt)}
            </Text>
          )}
        </View>

        <View style={styles.actionButtons}>
          {!item.isUsed && new Date(item.expiresAt) > new Date() && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.resendButton]}
                onPress={() => handleResendInvitation(invitationId)}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Resend</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.revokeButton]}
                onPress={() => handleRevokeInvitation(invitationId)}
                activeOpacity={0.8}
              >
                <Ionicons name="close-circle" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Revoke</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#a347c7ff' }}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffffff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>Invitations</Text>
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.contentContainer}>
        <View style={styles.formCard}>
          <Text style={styles.formCardTitle}>Create New Invitation</Text>

          <TextInput
            style={styles.formInput}
            placeholder="Enter email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#b0a4c6"
          />

          <Text style={styles.formLabel}>Role</Text>
          <View style={styles.formRoleContainer}>
            <Text style={[styles.formRoleText, styles.formRoleTextActive]}>
              Admin
            </Text>
          </View>
          {/* School selection is required for SuperAdmin inviting Admins */}
          <View style={{ marginBottom: 18 }}>
            <Text style={styles.formLabel}>Select School</Text>
            <Picker
              selectedValue={selectedSchoolId}
              onValueChange={setSelectedSchoolId}
              style={styles.formPicker}
            >
              <Picker.Item label="Select a school" value="" />
              {schools.map((school) => (
                <Picker.Item
                  key={school._id}
                  label={school.name}
                  value={school._id}
                />
              ))}
            </Picker>
          </View>

          <TouchableOpacity
            style={[styles.formButton, loading && styles.formButtonDisabled]}
            onPress={handleCreateInvitation}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.formButtonText}>
              {loading ? 'Sending...' : 'Send Invitation'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentCard}>
          <Text style={styles.recentCardTitle}>Recent Invitations</Text>
          {loading && invitations.length === 0 ? (
            <ActivityIndicator
              size="large"
              color="#913fb8"
              style={styles.loading}
            />
          ) : invitations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="mail-open-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No invitations found</Text>
            </View>
          ) : (
            <FlatList
              data={invitations}
              renderItem={renderInvitationItem}
              keyExtractor={(item) => item.id || item._id}
              style={styles.recentList}
              contentContainerStyle={styles.recentListContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => {
                    setRefreshing(true);
                    fetchInvitations();
                  }}
                  colors={['#913fb8']}
                  tintColor="#913fb8"
                />
              }
              showsVerticalScrollIndicator={false}
              // Show at most 5 cards, then scroll
              initialNumToRender={5}
              maxToRenderPerBatch={7}
            />
          )}
        </View>
      </View>
    </View>
  );
};

// Helper function to format date
const formatDate = (dateString) => {
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#a347c7ff',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
    justifyContent: 'flex-start',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#913fb8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: '#e8d6f7',
  },
  formCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#913fb8',
    marginBottom: 18,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    color: '#1a202c',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  formInput: {
    backgroundColor: '#f6f2fa',
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    color: '#3d2466',
    borderWidth: 1,
    borderColor: '#e0c8f7',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4a5568',
    marginBottom: 8,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7c5fa3',
    marginBottom: 8,
  },
  roleContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  formRoleContainer: {
    backgroundColor: '#f6f2fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0c8f7',
    alignItems: 'center',
  },
  roleButtonText: {
    fontSize: 15,
    color: '#718096',
  },
  roleButtonTextActive: {
    color: '#2d3748',
    fontWeight: '500',
  },
  formRoleText: {
    fontSize: 15,
    color: '#b0a4c6',
  },
  formRoleTextActive: {
    color: '#913fb8',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#4F8EF7',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    flexDirection: 'row',
    elevation: 2,
  },
  formButton: {
    backgroundColor: '#913fb8',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#913fb8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  formButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  buttonDisabled: {
    backgroundColor: '#a0aec0',
    opacity: 0.8,
  },
  formButtonDisabled: {
    backgroundColor: '#c7b3d8',
    opacity: 0.7,
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  roleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  roleButtonActive: {
    backgroundColor: '#4F8EF7',
  },
  createButton: {
    backgroundColor: '#4F8EF7',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
    minHeight: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loading: {
    marginTop: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#edf2f7',
    marginTop: 16,
  },
  emptyText: {
    marginTop: 16,
    color: '#6b7280',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: '80%',
  },
  recentCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#913fb8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: '#e8d6f7',
  },
  recentCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#913fb8',
    marginBottom: 18,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  invitationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8faff',
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e3e8f0',
    shadowColor: 'rgba(145,63,184,0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1,
  },
  invitationItemPressed: {
    backgroundColor: '#f3e6fa',
    transform: [{ scale: 0.97 }],
    shadowOpacity: 0.13,
  },
  invitationDetails: {
    flex: 1,
    marginRight: 12,
  },
  invitationEmail: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    color: '#1a202c',
  },
  invitationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  roleAdmin: { backgroundColor: '#8e44ad' },
  roleTeacher: { backgroundColor: '#3498db' },
  roleStudent: { backgroundColor: '#2ecc71' },
  roleParent: { backgroundColor: '#e67e22' },
  invitationStatus: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  invitationDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 6,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginLeft: 8,
  },
  resendButton: {
    backgroundColor: '#4F8EF7',
  },
  revokeButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },
  recentList: {
    maxHeight: 420,
    // Remove card shadow from the list container
    backgroundColor: 'transparent',
    borderRadius: 0,
    elevation: 0,
    shadowColor: 'transparent',
  },
  recentListContent: {
    paddingBottom: 8,
    paddingTop: 4,
  },
});

export default InvitationsScreen;
