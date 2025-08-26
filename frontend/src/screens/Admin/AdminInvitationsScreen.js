import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';
import { apiCall } from '../../api/client';
import SimpleHeader from '../../components/navigation/SimpleHeader';
import { LinearGradient } from 'expo-linear-gradient';

const ROLES = [
  { label: 'Student', value: 'Student' },
  { label: 'Teacher', value: 'Teacher' },
  { label: 'Parent', value: 'Parent' },
  { label: 'Staff', value: 'Staff' },
];

const showError = (message) => {
  if (Platform.OS === 'android') {
    // eslint-disable-next-line no-undef
    ToastAndroid?.show?.(message, ToastAndroid.SHORT);
  } else {
    Alert.alert('Error', message);
  }
};

const showSuccess = (message) => {
  if (Platform.OS === 'android') {
    // eslint-disable-next-line no-undef
    ToastAndroid?.show?.(message, ToastAndroid.SHORT);
  } else {
    Alert.alert('Success', message);
  }
};

const AdminInvitationsScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Student');
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user, getToken } = useAuth();

  // Fetch invitations for this admin's school
  const fetchInvitations = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await apiCall('GET', '/invitations?scope=admin');
      if (data && data.success) {
        // Use data.invitations if present (pagination-aware backend)
        setInvitations(
          data.data && data.data.invitations
            ? data.data.invitations
            : data.data || [],
        );
      } else {
        showError(data.message || 'Failed to fetch invitations');
      }
    } catch (e) {
      showError('Failed to fetch invitations');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const handleCreateInvitation = async () => {
    if (!email) return showError('Email is required');
    if (!role) return showError('Role is required');
    setLoading(true);
    try {
      const payload = {
        users: [
          {
            email,
            role,
            // Optionally add school_id if needed
          },
        ],
      };
      const data = await apiCall('POST', '/invitations', payload);
      if (data && data.success) {
        showSuccess('Invitation sent!');
        setEmail('');
        fetchInvitations();
      } else {
        showError(data.message || 'Failed to send invitation');
      }
    } catch (e) {
      showError('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvitation = async (invitationId) => {
    setLoading(true);
    try {
      const data = await apiCall('POST', `/invitations/${invitationId}/resend`);
      if (data && data.success) {
        showSuccess('Invitation resent!');
        fetchInvitations();
      } else {
        showError(data.message || 'Failed to resend invitation');
      }
    } catch (e) {
      showError('Failed to resend invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeInvitation = async (invitationId) => {
    setLoading(true);
    try {
      const data = await apiCall('POST', `/invitations/${invitationId}/revoke`);
      if (data && data.success) {
        showSuccess('Invitation revoked!');
        fetchInvitations();
      } else {
        showError(data.message || 'Failed to revoke invitation');
      }
    } catch (e) {
      showError('Failed to revoke invitation');
    } finally {
      setLoading(false);
    }
  };

  const renderInvitationItem = ({ item }) => {
    // Color by role
    const roleColors = {
      Admin: '#8e44ad',
      Teacher: '#3498db',
      Student: '#2ecc71',
      Parent: '#e67e22',
      Staff: '#34495e',
    };
    const leftColor = roleColors[item.role] || '#7B2FF2';
    return (
      <LinearGradient
        colors={[leftColor + '22', '#fff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.invitationItem, { borderLeftColor: leftColor }]}
      >
        <View style={styles.invitationDetails}>
          <View style={styles.invitationHeaderRow}>
            <Text style={styles.invitationEmail}>{item.email}</Text>
            <View style={[styles.roleBadge, { backgroundColor: leftColor }]}>
              <Text style={styles.roleText}>{item.role}</Text>
            </View>
          </View>
          <View style={styles.invitationMetaRow}>
            <Text style={styles.invitationStatus}>
              {item.status === 'accepted'
                ? 'Activated'
                : new Date(item.expiresAt) < new Date()
                ? 'Expired'
                : 'Pending'}
            </Text>
            {item.createdAt && (
              <Text style={styles.invitationDate}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.actionButtons}>
          {item.status !== 'accepted' &&
            new Date(item.expiresAt) > new Date() && (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.resendButton]}
                  onPress={() => handleResendInvitation(item._id)}
                >
                  <Ionicons name="refresh" size={16} color="#fff" />
                  <Text style={styles.actionButtonText}>Resend</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.revokeButton]}
                  onPress={() => handleRevokeInvitation(item._id)}
                >
                  <Ionicons name="close-circle" size={16} color="#fff" />
                  <Text style={styles.actionButtonText}>Revoke</Text>
                </TouchableOpacity>
              </>
            )}
        </View>
      </LinearGradient>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header below SafeAreaView with purple gradient */}
      <SimpleHeader
        title="Invitations"
        primaryColor="#7B2FF2"
        userRole="Admin"
        showShadow={true}
        style={{ marginBottom: 0 }}
        onBackPress={() =>
          navigation && navigation.navigate
            ? navigation.navigate('Dashboard')
            : null
        }
      />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <LinearGradient
          colors={['#7B2FF2', '#F357A8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.formContainerGradient}
        >
          <Text style={styles.sectionTitleGradient}>Invite User</Text>
          <Text style={styles.labelGradient}>Email</Text>
          <TextInput
            style={styles.inputGradient}
            placeholder="Enter email address"
            placeholderTextColor="#e0d6f7"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Text style={styles.labelGradient}>Role</Text>
          <View style={styles.roleContainerGradient}>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r.value}
                style={[
                  styles.roleButtonGradient,
                  role === r.value && styles.roleButtonActiveGradient,
                ]}
                onPress={() => setRole(r.value)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.roleButtonTextGradient,
                    role === r.value && styles.roleButtonTextActiveGradient,
                  ]}
                >
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[
              styles.createButtonGradient,
              (!email || loading) && styles.buttonDisabledGradient,
            ]}
            onPress={handleCreateInvitation}
            disabled={!email || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.createButtonTextGradient}>
                Send Invitation
              </Text>
            )}
          </TouchableOpacity>
        </LinearGradient>
        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>Invitations</Text>
          {refreshing ? (
            <ActivityIndicator style={styles.loading} />
          ) : invitations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No invitations found.</Text>
            </View>
          ) : (
            <FlatList
              data={invitations}
              keyExtractor={(item) => item._id}
              renderItem={renderInvitationItem}
              style={styles.flatList}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 16,
  },
  formContainerGradient: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#7B2FF2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  sectionTitleGradient: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 18,
    letterSpacing: 0.5,
    textShadowColor: '#6a1bbd',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  labelGradient: {
    fontSize: 15,
    color: '#e0d6f7',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputGradient: {
    borderWidth: 1,
    borderColor: '#e0d6f7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: '#fff',
  },
  roleContainerGradient: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  roleButtonGradient: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.13)',
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  roleButtonActiveGradient: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  roleButtonTextGradient: {
    color: '#e0d6f7',
    fontWeight: '600',
    fontSize: 15,
  },
  roleButtonTextActiveGradient: {
    color: '#7B2FF2',
  },
  createButtonGradient: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 8,
    minHeight: 50,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  createButtonTextGradient: {
    color: '#7B2FF2',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  buttonDisabledGradient: {
    opacity: 0.6,
    backgroundColor: '#e0d6f7',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
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
  roleButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  roleButtonTextActive: {
    color: '#fff',
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
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
    backgroundColor: '#a0c0ff',
  },
  listContainer: {
    flex: 1,
    marginTop: 16,
  },
  flatList: {
    flex: 1,
    width: '100%',
  },
  listContent: {
    paddingBottom: 24,
  },
  invitationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 6,
    backgroundColor: '#fff',
    shadowColor: '#7B2FF2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  invitationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  invitationMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  invitationDetails: {
    flex: 1,
    marginRight: 12,
  },
  invitationEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  invitationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  roleAdmin: { backgroundColor: '#8e44ad' },
  roleTeacher: { backgroundColor: '#3498db' },
  roleStudent: { backgroundColor: '#2ecc71' },
  roleParent: { backgroundColor: '#e67e22' },
  roleStaff: { backgroundColor: '#34495e' },
  invitationStatus: {
    fontSize: 12,
    color: '#666',
  },
  invitationDate: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
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
    backgroundColor: '#3498db',
  },
  revokeButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  loading: {
    marginVertical: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    color: '#999',
    fontSize: 16,
  },
});

export default AdminInvitationsScreen;
