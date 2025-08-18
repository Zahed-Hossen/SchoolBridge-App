import React, { useState, useCallback } from 'react';
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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';
import { useTenant } from '../../context/TenantContext';
import {
  COLORS,
  TEACHER_COLORS,
  TEACHER_THEME,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  getRoleColors,
} from '../../constants/theme';

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
        throw new Error(
          response.message || 'Failed to load assignment details',
        );
      }
    } catch (error) {
      console.error('❌ Error loading assignment details:', error);

      // Use mock data as fallback
      setAssignment(getMockAssignmentDetails(assignmentId));

      Alert.alert('Connection Issue', 'Using offline data.', [{ text: 'OK' }]);
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
      const response = await studentService.submitAssignment(
        assignment.id,
        submissionData,
      );

      if (response.success) {
        Alert.alert('Success!', 'Assignment submitted successfully', [
          {
            text: 'OK',
            onPress: () => {
              setSubmissionModalVisible(false);
              setAssignment((prev) => ({
                ...prev,
                status: 'submitted',
                submittedAt: new Date().toISOString(),
              }));
              navigation.goBack();
            },
          },
        ]);
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
    description:
      'Complete problems 1-20 from Chapter 8. Focus on integration by parts and substitution methods. Show all work clearly and provide detailed explanations for each step.',
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
        type: assignment?.allowedFileTypes || [
          'application/pdf',
          'image/*',
          'application/msword',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];

        // Check file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
          Alert.alert(
            'File Too Large',
            'Please select a file smaller than 10MB',
          );
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
        return {
          color: '#27AE60',
          icon: 'checkmark-circle',
          label: 'Submitted',
        };
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
      case 'high':
        return '#E74C3C';
      case 'medium':
        return '#F39C12';
      case 'low':
        return '#27AE60';
      default:
        return '#95A5A6';
    }
  };

  // ✅ Initial load
  useFocusEffect(
    useCallback(() => {
      loadAssignmentDetails();
    }, [assignmentId]),
  );

  // Theme colors
  const primaryColor =
    roleTheme?.primary || tenantBranding?.primaryColor || '#3498DB';
  const statusInfo = assignment ? getStatusInfo(assignment.status) : null;

  // Loading state
  if (loading) {
    return (
      <View style={enhancedStyles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={enhancedStyles.loadingText}>
          Loading assignment details...
        </Text>
      </View>
    );
  }

  if (!assignment) {
    return (
      <View style={enhancedStyles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={TEACHER_COLORS.error} />
        <Text style={enhancedStyles.errorTitle}>Assignment Not Found</Text>
        <Text style={enhancedStyles.errorText}>
          The requested assignment could not be loaded.
        </Text>
        <TouchableOpacity
          style={[
            enhancedStyles.retryButton,
            { backgroundColor: primaryColor },
          ]}
          onPress={() => navigation.goBack()}
        >
          <Text style={enhancedStyles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- ENHANCED STRUCTURE ---
  // Modular header with back, title, and status badge
  const Header = () => (
    <SafeAreaView edges={['top']} style={{ backgroundColor: primaryColor }}>
      <View style={[enhancedStyles.header, { backgroundColor: primaryColor }]}>
        <TouchableOpacity
          style={enhancedStyles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={enhancedStyles.headerTitle} numberOfLines={1}>
          {assignment.title}
        </Text>
        <View style={enhancedStyles.headerActions}>
          {statusInfo && (
            <View
              style={[
                enhancedStyles.statusBadge,
                { backgroundColor: statusInfo.color },
              ]}
            >
              <Ionicons name={statusInfo.icon} size={16} color="#fff" />
              <Text style={enhancedStyles.statusBadgeText}>
                {statusInfo.label}
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );

  // Card section wrapper
  const SectionCard = ({ title, icon, children, style }) => (
    <View style={[enhancedStyles.sectionCard, style]}>
      <View style={enhancedStyles.sectionHeaderRow}>
        {icon && (
          <Ionicons
            name={icon}
            size={22}
            color={primaryColor}
            style={{ marginRight: 8 }}
          />
        )}
        <Text style={enhancedStyles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  // Resource link
  const ResourceLink = ({ resource }) => (
    <TouchableOpacity
      style={enhancedStyles.resourceItem}
      onPress={() => Alert.alert('Resource', `Opening: ${resource.name}`)}
      activeOpacity={0.7}
    >
      <Ionicons name="link" size={20} color={primaryColor} />
      <Text style={[enhancedStyles.resourceText, { color: primaryColor }]}>
        {resource.name}
      </Text>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  // Main render
  return (
    <View style={enhancedStyles.container}>
      <Header />
      <ScrollView
        style={enhancedStyles.content}
        showsVerticalScrollIndicator={false}
      >
        <SectionCard title="Assignment Overview" icon="clipboard-outline">
          <View style={enhancedStyles.overviewGrid}>
            <View style={enhancedStyles.overviewItem}>
              <Text style={enhancedStyles.overviewLabel}>Subject</Text>
              <Text style={enhancedStyles.overviewValue}>
                {assignment.subject}
              </Text>
            </View>
            <View style={enhancedStyles.overviewItem}>
              <Text style={enhancedStyles.overviewLabel}>Teacher</Text>
              <Text style={enhancedStyles.overviewValue}>
                {assignment.teacher}
              </Text>
            </View>
            <View style={enhancedStyles.overviewItem}>
              <Text style={enhancedStyles.overviewLabel}>Total Points</Text>
              <Text style={enhancedStyles.overviewValue}>
                {assignment.totalPoints} pts
              </Text>
            </View>
            <View style={enhancedStyles.overviewItem}>
              <Text style={enhancedStyles.overviewLabel}>Estimated Time</Text>
              <Text style={enhancedStyles.overviewValue}>
                {assignment.estimatedTime || 'N/A'}
              </Text>
            </View>
          </View>
        </SectionCard>

        <SectionCard title="Due Date & Priority" icon="calendar-outline">
          <View style={enhancedStyles.dueDateContainer}>
            <View style={enhancedStyles.dueDateInfo}>
              <Ionicons name="calendar" size={24} color={primaryColor} />
              <View style={enhancedStyles.dueDateText}>
                <Text style={enhancedStyles.dueDate}>
                  {formatDate(assignment.dueDate)}
                </Text>
                <Text style={enhancedStyles.dueDateHelper}>
                  {assignment.status === 'overdue'
                    ? 'This assignment is overdue'
                    : 'Submit before this time'}
                </Text>
              </View>
            </View>
            <View
              style={[
                enhancedStyles.priorityBadge,
                { backgroundColor: getPriorityColor(assignment.priority) },
              ]}
            >
              <Text style={enhancedStyles.priorityText}>
                {assignment.priority.toUpperCase()} PRIORITY
              </Text>
            </View>
          </View>
        </SectionCard>

        <SectionCard title="Description" icon="document-text-outline">
          <Text style={enhancedStyles.description}>
            {assignment.description}
          </Text>
        </SectionCard>

        {assignment.instructions && (
          <SectionCard title="Instructions" icon="book-outline">
            <View style={enhancedStyles.instructionsContainer}>
              <Text style={enhancedStyles.instructions}>
                {assignment.instructions}
              </Text>
            </View>
          </SectionCard>
        )}

        {assignment.resources && assignment.resources.length > 0 && (
          <SectionCard title="Resources" icon="library-outline">
            {assignment.resources.map((resource, idx) => (
              <ResourceLink key={idx} resource={resource} />
            ))}
          </SectionCard>
        )}

        {assignment.status === 'pending' && (
          <SectionCard title="Submit Assignment" icon="cloud-upload-outline">
            <View style={enhancedStyles.submissionInfo}>
              <Text style={enhancedStyles.submissionInfoText}>
                Accepted file types:{' '}
                {assignment.allowedFileTypes?.join(', ') || 'PDF, DOC, Images'}
              </Text>
              <Text style={enhancedStyles.submissionInfoText}>
                Maximum file size: {assignment.maxFileSize || '10MB'}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                enhancedStyles.submitButton,
                { backgroundColor: primaryColor },
              ]}
              onPress={() => setSubmissionModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="cloud-upload" size={20} color="#fff" />
              <Text style={enhancedStyles.submitButtonText}>
                Submit Assignment
              </Text>
            </TouchableOpacity>
          </SectionCard>
        )}

        {assignment.status === 'submitted' && (
          <SectionCard title="Submission Status" icon="checkmark-done-outline">
            <View style={enhancedStyles.submissionStatus}>
              <Ionicons
                name="checkmark-circle"
                size={48}
                color={TEACHER_COLORS.success}
              />
              <Text style={enhancedStyles.submissionStatusTitle}>
                Assignment Submitted
              </Text>
              <Text style={enhancedStyles.submissionStatusText}>
                Submitted on:{' '}
                {assignment.submittedAt
                  ? formatDate(assignment.submittedAt)
                  : 'N/A'}
              </Text>
              <Text style={enhancedStyles.submissionStatusText}>
                Your assignment is being reviewed by {assignment.teacher}
              </Text>
            </View>
          </SectionCard>
        )}

        {assignment.grade && (
          <SectionCard title="Grade" icon="star-outline">
            <View style={enhancedStyles.gradeContainer}>
              <Text style={enhancedStyles.gradeNumber}>
                {assignment.grade}%
              </Text>
              <Text style={enhancedStyles.gradeTotal}>
                out of {assignment.totalPoints} points
              </Text>
              {assignment.feedback && (
                <View style={enhancedStyles.feedbackContainer}>
                  <Text style={enhancedStyles.feedbackTitle}>
                    Teacher Feedback:
                  </Text>
                  <Text style={enhancedStyles.feedbackText}>
                    {assignment.feedback}
                  </Text>
                </View>
              )}
            </View>
          </SectionCard>
        )}
      </ScrollView>

      {/* Submission Modal (structure unchanged, but use enhancedStyles) */}
      <Modal
        visible={submissionModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSubmissionModalVisible(false)}
      >
        <View style={enhancedStyles.modalContainer}>
          <View style={enhancedStyles.modalHeader}>
            <TouchableOpacity onPress={() => setSubmissionModalVisible(false)}>
              <Text
                style={[
                  enhancedStyles.modalCancelText,
                  { color: primaryColor },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={enhancedStyles.modalTitle}>Submit Assignment</Text>
            <TouchableOpacity onPress={handleSubmission} disabled={submitting}>
              <Text
                style={[
                  enhancedStyles.modalSubmitText,
                  { color: primaryColor },
                ]}
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={enhancedStyles.modalContent}>
            <Text style={enhancedStyles.modalSectionTitle}>
              Submission Type
            </Text>
            <View style={enhancedStyles.submissionTypeContainer}>
              <TouchableOpacity
                style={[
                  enhancedStyles.submissionTypeButton,
                  submissionType === 'text' && {
                    backgroundColor: primaryColor,
                  },
                ]}
                onPress={() => setSubmissionType('text')}
              >
                <Ionicons
                  name="document-text"
                  size={20}
                  color={submissionType === 'text' ? '#fff' : '#666'}
                />
                <Text
                  style={[
                    enhancedStyles.submissionTypeText,
                    submissionType === 'text' && { color: '#fff' },
                  ]}
                >
                  Text Entry
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  enhancedStyles.submissionTypeButton,
                  submissionType === 'file' && {
                    backgroundColor: primaryColor,
                  },
                ]}
                onPress={() => setSubmissionType('file')}
              >
                <Ionicons
                  name="attach"
                  size={20}
                  color={submissionType === 'file' ? '#fff' : '#666'}
                />
                <Text
                  style={[
                    enhancedStyles.submissionTypeText,
                    submissionType === 'file' && { color: '#fff' },
                  ]}
                >
                  File Upload
                </Text>
              </TouchableOpacity>
            </View>

            {submissionType === 'text' && (
              <View style={enhancedStyles.textSubmissionContainer}>
                <Text style={enhancedStyles.modalSectionTitle}>
                  Your Submission
                </Text>
                <TextInput
                  style={enhancedStyles.textSubmissionInput}
                  placeholder="Enter your assignment submission here..."
                  value={textSubmission}
                  onChangeText={setTextSubmission}
                  multiline
                  numberOfLines={10}
                  textAlignVertical="top"
                />
                <Text style={enhancedStyles.characterCount}>
                  {textSubmission.length} characters
                </Text>
              </View>
            )}

            {submissionType === 'file' && (
              <View style={enhancedStyles.fileSubmissionContainer}>
                <Text style={enhancedStyles.modalSectionTitle}>
                  Select File
                </Text>

                {selectedFile ? (
                  <View style={enhancedStyles.selectedFileContainer}>
                    <View style={enhancedStyles.fileInfo}>
                      <Ionicons
                        name="document"
                        size={24}
                        color={primaryColor}
                      />
                      <View style={enhancedStyles.fileDetails}>
                        <Text style={enhancedStyles.fileName}>
                          {selectedFile.name}
                        </Text>
                        <Text style={enhancedStyles.fileSize}>
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={enhancedStyles.removeFileButton}
                      onPress={() => setSelectedFile(null)}
                    >
                      <Ionicons
                        name="close-circle"
                        size={24}
                        color={TEACHER_COLORS.error}
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      enhancedStyles.fileSelectionButton,
                      { borderColor: primaryColor },
                    ]}
                    onPress={handleFileSelection}
                  >
                    <Ionicons
                      name="cloud-upload"
                      size={32}
                      color={primaryColor}
                    />
                    <Text
                      style={[
                        enhancedStyles.fileSelectionText,
                        { color: primaryColor },
                      ]}
                    >
                      Tap to select file
                    </Text>
                    <Text style={enhancedStyles.fileSelectionSubtext}>
                      Supported: PDF, DOC, Images (Max 10MB)
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>

          {submitting && (
            <View style={enhancedStyles.submittingOverlay}>
              <ActivityIndicator size="large" color={primaryColor} />
              <Text style={enhancedStyles.submittingText}>
                Submitting assignment...
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

// --- ENHANCED STYLES ---
const { width: screenWidth } = Dimensions.get('window');
const enhancedStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
  },
  loadingText: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.textMuted,
    marginTop: SPACING.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
    padding: SPACING.lg,
  },
  errorTitle: {
    ...TEACHER_THEME.typography.h3,
    color: TEACHER_COLORS.error,
    marginTop: SPACING.md,
  },
  errorText: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.textMuted,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.md,
  },
  retryButtonText: {
    ...TEACHER_THEME.typography.body,
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'ios' ? 44 : 16,
    paddingBottom: SPACING.md,
    backgroundColor: TEACHER_COLORS.primary,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginRight: 8,
  },
  headerTitle: {
    ...TEACHER_THEME.typography.h3,
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TEACHER_COLORS.warning,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 4,
  },
  statusBadgeText: {
    ...TEACHER_THEME.typography.small,
    color: '#fff',
    marginLeft: 4,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  sectionCard: {
    backgroundColor: COLORS.teacherPalette.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    shadowColor: COLORS.teacherPalette.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEACHER_THEME.typography.h4,
    color: TEACHER_COLORS.text,
    fontWeight: '600',
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  overviewItem: {
    flexBasis: '48%',
    marginBottom: SPACING.md,
  },
  overviewLabel: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textMuted,
    marginBottom: 2,
  },
  overviewValue: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
    fontWeight: '500',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  dueDateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dueDateText: {
    marginLeft: SPACING.md,
  },
  dueDate: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
    fontWeight: '600',
  },
  dueDateHelper: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textMuted,
  },
  priorityBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginLeft: SPACING.md,
  },
  priorityText: {
    ...TEACHER_THEME.typography.small,
    color: '#fff',
    fontWeight: '700',
  },
  description: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
    lineHeight: 22,
  },
  instructionsContainer: {
    backgroundColor: COLORS.teacherPalette.background.accent,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  instructions: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
    lineHeight: 22,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.teacherPalette.background.accent,
  },
  resourceText: {
    ...TEACHER_THEME.typography.body,
    marginLeft: SPACING.md,
    flex: 1,
  },
  submissionInfo: {
    marginBottom: SPACING.md,
  },
  submissionInfoText: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textMuted,
    marginBottom: 2,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    marginTop: SPACING.md,
    backgroundColor: TEACHER_COLORS.primary,
  },
  submitButtonText: {
    ...TEACHER_THEME.typography.body,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  submissionStatus: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  submissionStatusTitle: {
    ...TEACHER_THEME.typography.h4,
    color: TEACHER_COLORS.success,
    marginTop: SPACING.md,
    fontWeight: '700',
  },
  submissionStatusText: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
    marginTop: 2,
  },
  gradeContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  gradeNumber: {
    ...TEACHER_THEME.typography.h2,
    color: TEACHER_COLORS.gradeA,
    fontWeight: '700',
  },
  gradeTotal: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.textMuted,
    marginTop: 2,
  },
  feedbackContainer: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.teacherPalette.background.accent,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    width: '100%',
  },
  feedbackTitle: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  feedbackText: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
  },
  // --- Modal ---
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'ios' ? 32 : 16,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.teacherPalette.background.accent,
  },
  modalCancelText: {
    ...TEACHER_THEME.typography.body,
    fontWeight: '600',
  },
  modalTitle: {
    ...TEACHER_THEME.typography.h4,
    color: TEACHER_COLORS.text,
    fontWeight: '700',
  },
  modalSubmitText: {
    ...TEACHER_THEME.typography.body,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: SPACING.md,
  },
  modalSectionTitle: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textMuted,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  submissionTypeContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  submissionTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.teacherPalette.background.accent,
    paddingVertical: SPACING.md,
    backgroundColor: '#fff',
  },
  submissionTypeText: {
    ...TEACHER_THEME.typography.body,
    marginLeft: 8,
    color: TEACHER_COLORS.text,
    fontWeight: '600',
  },
  textSubmissionContainer: {
    marginBottom: SPACING.md,
  },
  textSubmissionInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: COLORS.teacherPalette.background.accent,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    backgroundColor: '#fff',
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
  },
  characterCount: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textMuted,
    textAlign: 'right',
    marginTop: 2,
  },
  fileSubmissionContainer: {
    marginBottom: SPACING.md,
  },
  fileSelectionButton: {
    borderWidth: 1,
    borderColor: COLORS.teacherPalette.background.accent,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  fileSelectionText: {
    ...TEACHER_THEME.typography.body,
    fontWeight: '600',
    marginTop: 8,
  },
  fileSelectionSubtext: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textMuted,
    marginTop: 2,
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.teacherPalette.background.accent,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileDetails: {
    marginLeft: SPACING.md,
  },
  fileName: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
    fontWeight: '600',
  },
  fileSize: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textMuted,
  },
  removeFileButton: {
    marginLeft: SPACING.md,
  },
  submittingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  submittingText: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.text,
    marginTop: SPACING.md,
  },
});

export default AssignmentDetails;
