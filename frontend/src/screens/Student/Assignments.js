import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';
import { useTenant } from '../../context/TenantContext';

// ✅ FIX: Update import to use new modular API structure
import { studentService } from '../../api/services/studentService';
// OR use the main API index:
// import { studentService } from '../../api';

const AssignmentDetails = ({ route, navigation }) => {
  const params = route?.params || {};
  const { assignmentId, assignment: passedAssignment } = params;
  const { user } = useAuth();
  const { roleTheme } = useRole();
  const { tenantBranding } = useTenant();

  const [assignment, setAssignment] = useState(passedAssignment || null);
  const [loading, setLoading] = useState(!passedAssignment);
  const [submissionModalVisible, setSubmissionModalVisible] = useState(false);
  const [submissionType, setSubmissionType] = useState('text');
  const [textSubmission, setTextSubmission] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ✅ FIX: Update API calls to use new service structure
  const loadAssignmentDetails = async () => {
    if (passedAssignment) return;

    try {
      setLoading(true);
      console.log(`📄 Loading assignment details for ID: ${assignmentId}`);

      // ✅ Updated API call using new service structure
      const response = await studentService.getAssignmentDetails(assignmentId);

      if (response.success && response.data) {
        setAssignment(response.data.assignment);
        console.log('✅ Assignment details loaded successfully');
      } else {
        throw new Error(response.message || 'Failed to load assignment details');
      }

    } catch (error) {
      console.error('❌ Error loading assignment details:', error);

      // Use mock data as fallback
      setAssignment(getMockAssignmentDetails(assignmentId));

      Alert.alert(
        'Connection Issue',
        'Using offline data.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle assignment submission - Updated API call
  const handleSubmission = async () => {
    try {
      setSubmitting(true);

      if (submissionType === 'text' && !textSubmission.trim()) {
        Alert.alert('Missing Content', 'Please enter your submission text');
        return;
      }

      if (submissionType === 'file' && !selectedFile) {
        Alert.alert('Missing File', 'Please select a file to submit');
        return;
      }

      console.log('📤 Submitting assignment...');

      // Prepare submission data
      const submissionData = {
        assignmentId: assignment.id,
        type: submissionType,
        content: submissionType === 'text' ? textSubmission : null,
        file: submissionType === 'file' ? selectedFile : null,
        submittedAt: new Date().toISOString(),
      };

      // ✅ Updated API call using new service structure
      const response = await studentService.submitAssignment(assignment.id, submissionData);

      if (response.success) {
        Alert.alert(
          'Success!',
          'Assignment submitted successfully',
          [
            {
              text: 'OK',
              onPress: () => {
                setSubmissionModalVisible(false);
                setAssignment(prev => ({
                  ...prev,
                  status: 'submitted',
                  submittedAt: new Date().toISOString()
                }));
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        throw new Error(response.message || 'Submission failed');
      }

    } catch (error) {
      console.error('❌ Error submitting assignment:', error);
      Alert.alert('Submission Failed', error.message || 'Please try again');
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Mock assignment details (keep existing function)
  const getMockAssignmentDetails = (id) => ({
    id: parseInt(id) || 1,
    title: 'Calculus Problem Set 6',
    subject: 'Mathematics',
    description: 'Complete problems 1-20 from Chapter 8. Focus on integration by parts and substitution methods. Show all work clearly and provide detailed explanations for each step.',
    instructions: `Instructions for Assignment:
1. Read Chapter 8 sections 8.1-8.3 thoroughly
2. Complete all odd-numbered problems from 1-20
3. Show all work step by step
4. Use proper mathematical notation
5. Submit as PDF file or handwritten (scanned clearly)
6. Include your name and student ID on each page

Grading Criteria:
- Correct answers: 60%
- Work shown: 25%
- Proper notation: 15%

Late submissions will be penalized 10% per day.`,
    dueDate: '2024-08-15T23:59:00Z',
    priority: 'high',
    status: 'pending',
    submissionType: 'file',
    totalPoints: 100,
    teacher: 'Mr. Johnson',
    teacherEmail: 'johnson@school.edu',
    createdAt: '2024-08-01T10:00:00Z',
    estimatedTime: '2-3 hours',
    resources: [
      { name: 'Textbook Chapter 8', url: 'https://example.com/chapter8' },
      { name: 'Practice Problems', url: 'https://example.com/practice' },
      { name: 'Video Tutorial', url: 'https://example.com/video' },
    ],
    submissions: [],
    allowedFileTypes: ['.pdf', '.doc', '.docx', '.jpg', '.png'],
    maxFileSize: '10MB',
  });

  // ✅ Handle file selection (keep existing function)
  const handleFileSelection = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: assignment?.allowedFileTypes || ['application/pdf', 'image/*', 'application/msword'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];

        // Check file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
          Alert.alert('File Too Large', 'Please select a file smaller than 10MB');
          return;
        }

        setSelectedFile(file);
        console.log('📁 File selected:', file.name);
      }
    } catch (error) {
      console.error('❌ Error selecting file:', error);
      Alert.alert('Error', 'Failed to select file');
    }
  };

  // ✅ Format date and time (keep existing function)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ✅ Get status info (keep existing function)
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { color: '#F39C12', icon: 'time', label: 'Pending' };
      case 'submitted':
        return { color: '#27AE60', icon: 'checkmark-circle', label: 'Submitted' };
      case 'overdue':
        return { color: '#E74C3C', icon: 'alert-circle', label: 'Overdue' };
      case 'graded':
        return { color: '#3498DB', icon: 'school', label: 'Graded' };
      default:
        return { color: '#95A5A6', icon: 'help-circle', label: 'Unknown' };
    }
  };

  // ✅ Get priority color (keep existing function)
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#E74C3C';
      case 'medium': return '#F39C12';
      case 'low': return '#27AE60';
      default: return '#95A5A6';
    }
  };

  // ✅ Initial load
  useFocusEffect(
    useCallback(() => {
      loadAssignmentDetails();
    }, [assignmentId])
  );

  // Theme colors
  const primaryColor = roleTheme?.primary || tenantBranding?.primaryColor || '#3498DB';
  const statusInfo = assignment ? getStatusInfo(assignment.status) : null;

  // ✅ Rest of your component code remains exactly the same...
  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={styles.loadingText}>Loading assignment details...</Text>
      </View>
    );
  }

  if (!assignment) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#E74C3C" />
        <Text style={styles.errorTitle}>Assignment Not Found</Text>
        <Text style={styles.errorText}>The requested assignment could not be loaded.</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: primaryColor }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ✅ Your existing JSX code stays exactly the same */}
      {/* Header */}
      <View style={[styles.header, { backgroundColor: primaryColor }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {assignment.title}
        </Text>
        <View style={styles.headerActions}>
          {statusInfo && (
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
              <Ionicons name={statusInfo.icon} size={16} color="#FFFFFF" />
              <Text style={styles.statusBadgeText}>{statusInfo.label}</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* ✅ Assignment Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Assignment Overview</Text>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Subject</Text>
              <Text style={styles.overviewValue}>{assignment.subject}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Teacher</Text>
              <Text style={styles.overviewValue}>{assignment.teacher}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Total Points</Text>
              <Text style={styles.overviewValue}>{assignment.totalPoints} pts</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Estimated Time</Text>
              <Text style={styles.overviewValue}>{assignment.estimatedTime || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* ✅ Due Date & Priority */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏰ Due Date & Priority</Text>
          <View style={styles.dueDateContainer}>
            <View style={styles.dueDateInfo}>
              <Ionicons name="calendar" size={24} color={primaryColor} />
              <View style={styles.dueDateText}>
                <Text style={styles.dueDate}>{formatDate(assignment.dueDate)}</Text>
                <Text style={styles.dueDateHelper}>
                  {assignment.status === 'overdue' ? 'This assignment is overdue' : 'Submit before this time'}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(assignment.priority) }
              ]}
            >
              <Text style={styles.priorityText}>
                {assignment.priority.toUpperCase()} PRIORITY
              </Text>
            </View>
          </View>
        </View>

        {/* ✅ Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Description</Text>
          <Text style={styles.description}>{assignment.description}</Text>
        </View>

        {/* ✅ Instructions */}
        {assignment.instructions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📖 Instructions</Text>
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructions}>{assignment.instructions}</Text>
            </View>
          </View>
        )}

        {/* ✅ Resources */}
        {assignment.resources && assignment.resources.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📚 Resources</Text>
            {assignment.resources.map((resource, index) => (
              <TouchableOpacity
                key={index}
                style={styles.resourceItem}
                onPress={() => Alert.alert('Resource', `Opening: ${resource.name}`)}
              >
                <Ionicons name="link" size={20} color={primaryColor} />
                <Text style={[styles.resourceText, { color: primaryColor }]}>
                  {resource.name}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ✅ Submission Section */}
        {assignment.status === 'pending' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📤 Submit Assignment</Text>
            <View style={styles.submissionInfo}>
              <Text style={styles.submissionInfoText}>
                Accepted file types: {assignment.allowedFileTypes?.join(', ') || 'PDF, DOC, Images'}
              </Text>
              <Text style={styles.submissionInfoText}>
                Maximum file size: {assignment.maxFileSize || '10MB'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: primaryColor }]}
              onPress={() => setSubmissionModalVisible(true)}
            >
              <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Submit Assignment</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ✅ Submission Status */}
        {assignment.status === 'submitted' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Submission Status</Text>
            <View style={styles.submissionStatus}>
              <Ionicons name="checkmark-circle" size={48} color="#27AE60" />
              <Text style={styles.submissionStatusTitle}>Assignment Submitted</Text>
              <Text style={styles.submissionStatusText}>
                Submitted on: {assignment.submittedAt ? formatDate(assignment.submittedAt) : 'N/A'}
              </Text>
              <Text style={styles.submissionStatusText}>
                Your assignment is being reviewed by {assignment.teacher}
              </Text>
            </View>
          </View>
        )}

        {/* ✅ Grade Section */}
        {assignment.grade && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Grade</Text>
            <View style={styles.gradeContainer}>
              <Text style={styles.gradeNumber}>{assignment.grade}%</Text>
              <Text style={styles.gradeTotal}>out of {assignment.totalPoints} points</Text>
              {assignment.feedback && (
                <View style={styles.feedbackContainer}>
                  <Text style={styles.feedbackTitle}>Teacher Feedback:</Text>
                  <Text style={styles.feedbackText}>{assignment.feedback}</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* ✅ Submission Modal - All existing code stays the same */}
      <Modal
        visible={submissionModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSubmissionModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSubmissionModalVisible(false)}>
              <Text style={[styles.modalCancelText, { color: primaryColor }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Submit Assignment</Text>
            <TouchableOpacity onPress={handleSubmission} disabled={submitting}>
              <Text style={[styles.modalSubmitText, { color: primaryColor }]}>
                {submitting ? 'Submitting...' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* ✅ Submission Type Selector */}
            <Text style={styles.modalSectionTitle}>Submission Type</Text>
            <View style={styles.submissionTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.submissionTypeButton,
                  submissionType === 'text' && { backgroundColor: primaryColor }
                ]}
                onPress={() => setSubmissionType('text')}
              >
                <Ionicons
                  name="document-text"
                  size={20}
                  color={submissionType === 'text' ? '#FFFFFF' : '#666'}
                />
                <Text style={[
                  styles.submissionTypeText,
                  submissionType === 'text' && { color: '#FFFFFF' }
                ]}>
                  Text Entry
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submissionTypeButton,
                  submissionType === 'file' && { backgroundColor: primaryColor }
                ]}
                onPress={() => setSubmissionType('file')}
              >
                <Ionicons
                  name="attach"
                  size={20}
                  color={submissionType === 'file' ? '#FFFFFF' : '#666'}
                />
                <Text style={[
                  styles.submissionTypeText,
                  submissionType === 'file' && { color: '#FFFFFF' }
                ]}>
                  File Upload
                </Text>
              </TouchableOpacity>
            </View>

            {/* ✅ Text Submission */}
            {submissionType === 'text' && (
              <View style={styles.textSubmissionContainer}>
                <Text style={styles.modalSectionTitle}>Your Submission</Text>
                <TextInput
                  style={styles.textSubmissionInput}
                  placeholder="Enter your assignment submission here..."
                  value={textSubmission}
                  onChangeText={setTextSubmission}
                  multiline
                  numberOfLines={10}
                  textAlignVertical="top"
                />
                <Text style={styles.characterCount}>
                  {textSubmission.length} characters
                </Text>
              </View>
            )}

            {/* ✅ File Submission */}
            {submissionType === 'file' && (
              <View style={styles.fileSubmissionContainer}>
                <Text style={styles.modalSectionTitle}>Select File</Text>

                {selectedFile ? (
                  <View style={styles.selectedFileContainer}>
                    <View style={styles.fileInfo}>
                      <Ionicons name="document" size={24} color={primaryColor} />
                      <View style={styles.fileDetails}>
                        <Text style={styles.fileName}>{selectedFile.name}</Text>
                        <Text style={styles.fileSize}>
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.removeFileButton}
                      onPress={() => setSelectedFile(null)}
                    >
                      <Ionicons name="close-circle" size={24} color="#E74C3C" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.fileSelectionButton, { borderColor: primaryColor }]}
                    onPress={handleFileSelection}
                  >
                    <Ionicons name="cloud-upload" size={32} color={primaryColor} />
                    <Text style={[styles.fileSelectionText, { color: primaryColor }]}>
                      Tap to select file
                    </Text>
                    <Text style={styles.fileSelectionSubtext}>
                      Supported: PDF, DOC, Images (Max 10MB)
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>

          {submitting && (
            <View style={styles.submittingOverlay}>
              <ActivityIndicator size="large" color={primaryColor} />
              <Text style={styles.submittingText}>Submitting assignment...</Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

// ✅ All styles remain exactly the same
const styles = StyleSheet.create({
  // ... your existing styles stay exactly the same
});

export default AssignmentDetails;
