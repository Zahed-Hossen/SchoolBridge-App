import React, { useState, useEffect } from 'react';
import teacherService from '../../../api/services/teacherService';
import { useAuth } from '../../../context/AuthContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import SimpleHeader from '../../../components/navigation/SimpleHeader';
// ✅ Import Professional Theme System
import {
  COLORS,
  TEACHER_COLORS,
  TEACHER_THEME,
  SPACING,
  BORDER_RADIUS,
} from '../../../constants/theme';

const CreateAssignment = ({ navigation, route }) => {
  // --- Modal state and filter logic ---
  const [classSearchQuery, setClassSearchQuery] = useState('');
  // Remove filteredClassList from here; move logic into modal render below
  const { user } = useAuth();
  const {
    assignmentId,
    assignment: editingAssignment,
    isEditing = false,
  } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showClassSelector, setShowClassSelector] = useState(false);

  // ✅ Use Teacher Theme Colors
  const primaryColor = TEACHER_COLORS.secondary; // Warm orange for assignments

  // ✅ Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classId: null,
    type: 'homework',
    totalPoints: '100',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    submissionType: ['text'],
    allowLateSubmission: true,
    lateSubmissionPenalty: '10',
    priority: 'medium',
  });

  // Fetch teacher's classes from API
  const [classList, setClassList] = useState([]);
  const [classLoading, setClassLoading] = useState(true);

  useEffect(() => {
    // Fetch classes for the teacher using the real API endpoint
    const fetchClasses = async () => {
      const teacherId = user?._id || user?.id;
      if (!teacherId) {
        setClassLoading(false);
        console.warn('No user._id or user.id found, skipping class fetch.');
        return;
      }
      setClassLoading(true);
      try {
        const res = await teacherService.getTeacherClasses(teacherId);
        // Support both { data: [...] } and [...] shapes
        if (res && res.success && Array.isArray(res.data?.data)) {
          setClassList(res.data.data);
        } else if (res && res.success && Array.isArray(res.data)) {
          setClassList(res.data);
        } else {
          setClassList([]);
        }
      } catch (err) {
        setClassList([]);
        console.error('Error fetching teacher classes:', err);
      } finally {
        setClassLoading(false);
      }
    };
    fetchClasses();
  }, [user?._id, user?.id]);

  // ✅ Initialize form for editing
  useEffect(() => {
    if (isEditing && editingAssignment) {
      setFormData({
        title: editingAssignment.title || '',
        description: editingAssignment.description || '',
        classId: editingAssignment.classId || null,
        type: editingAssignment.type || 'homework',
        totalPoints: editingAssignment.totalPoints?.toString() || '100',
        dueDate: editingAssignment.dueDate
          ? new Date(editingAssignment.dueDate)
          : new Date(),
        submissionType: editingAssignment.submissionType || ['text'],
        allowLateSubmission: editingAssignment.allowLateSubmission || true,
        lateSubmissionPenalty:
          editingAssignment.lateSubmissionPenalty?.toString() || '10',
        priority: editingAssignment.priority || 'medium',
      });
    }
  }, [isEditing, editingAssignment]);

  // ✅ Form helpers
  const updateFormData = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmissionTypeToggle = (type) => {
    setFormData((prev) => ({
      ...prev,
      submissionType: prev.submissionType.includes(type)
        ? prev.submissionType.filter((t) => t !== type)
        : [...prev.submissionType, type],
    }));
  };

  const getSelectedClassName = () => {
    const selectedClass = classList.find((c) => c._id === formData.classId);
    return selectedClass ? selectedClass.name : 'Select a class';
  };

  // ✅ Validation
  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter an assignment title.');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a description.');
      return false;
    }
    if (!formData.classId) {
      Alert.alert('Error', 'Please select a class.');
      return false;
    }
    if (!formData.totalPoints || isNaN(formData.totalPoints)) {
      Alert.alert('Error', 'Please enter valid total points.');
      return false;
    }
    if (formData.submissionType.length === 0) {
      Alert.alert('Error', 'Please select at least one submission type.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const assignmentData = {
        ...formData,
        class: formData.classId,
        totalPoints: parseInt(formData.totalPoints),
        lateSubmissionPenalty: parseInt(formData.lateSubmissionPenalty),
        dueDate: formData.dueDate.toISOString(),
      };

      // Use robust teacherId
      const teacherId = user?._id || user?.id;
      if (!teacherId) {
        setLoading(false);
        Alert.alert('Error', 'User ID not found. Please re-login.');
        return;
      }

      let response;
      if (isEditing && assignmentId) {
        response = await teacherService.updateAssignment(
          teacherId,
          assignmentId,
          assignmentData,
        );
      } else {
        response = await teacherService.createAssignment(
          teacherId,
          assignmentData,
        );
      }

      setLoading(false);
      if (response && response.success) {
        Alert.alert(
          'Success',
          `Assignment ${isEditing ? 'updated' : 'created'} successfully!`,
          [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
      } else {
        throw new Error(response?.message || 'Failed to save assignment');
      }
    } catch (error) {
      console.error('❌ Error saving assignment:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to save assignment. Please try again.');
    }
  };

  const formatDueDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      {/* ✅ Professional Header with Theme */}
      <SimpleHeader
        title={isEditing ? 'Edit Assignment' : 'Create Assignment'}
        subtitle={
          isEditing
            ? 'Update assignment details'
            : 'Create new assignment for students'
        }
        navigation={navigation}
        primaryColor={primaryColor}
        userRole="Teacher"
      />

      {/* ✅ Professional Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="document-text-outline"
              size={24}
              color={primaryColor}
            />
            <Text style={styles.sectionTitle}>Basic Information</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Assignment Title *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(value) => updateFormData('title', value)}
              placeholder="e.g., Quadratic Functions Quiz"
              placeholderTextColor={TEACHER_COLORS.textMuted}
              maxLength={100}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              placeholder="Briefly describe what students need to do..."
              placeholderTextColor={TEACHER_COLORS.textMuted}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>
        </View>

        {/* Class & Type */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="school-outline" size={24} color={primaryColor} />
            <Text style={styles.sectionTitle}>Class & Assignment Type</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Class *</Text>
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => setShowClassSelector(true)}
              disabled={classLoading}
            >
              {classLoading ? (
                <ActivityIndicator size="small" color={primaryColor} />
              ) : (
                <>
                  <Text
                    style={[
                      styles.selectorButtonText,
                      !formData.classId && styles.placeholderText,
                    ]}
                  >
                    {getSelectedClassName()}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={TEACHER_COLORS.textMuted}
                  />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Assignment Type</Text>
            <View style={styles.chipContainer}>
              {[
                {
                  key: 'homework',
                  label: 'Homework',
                  icon: 'book-outline',
                  color: COLORS.teacherPalette.subjects.mathematics,
                },
                {
                  key: 'quiz',
                  label: 'Quiz',
                  icon: 'help-circle-outline',
                  color: COLORS.teacherPalette.subjects.science,
                },
                {
                  key: 'test',
                  label: 'Test',
                  icon: 'document-text-outline',
                  color: TEACHER_COLORS.warning,
                },
                {
                  key: 'project',
                  label: 'Project',
                  icon: 'briefcase-outline',
                  color: TEACHER_COLORS.success,
                },
              ].map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        formData.type === type.key
                          ? type.color
                          : TEACHER_COLORS.surface,
                      borderColor:
                        formData.type === type.key
                          ? type.color
                          : COLORS.teacherPalette.neutral.lighter,
                    },
                  ]}
                  onPress={() => updateFormData('type', type.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={type.icon}
                    size={16}
                    color={
                      formData.type === type.key
                        ? TEACHER_COLORS.textWhite
                        : type.color
                    }
                  />
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color:
                          formData.type === type.key
                            ? TEACHER_COLORS.textWhite
                            : TEACHER_COLORS.text,
                      },
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Points & Due Date */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star-outline" size={24} color={primaryColor} />
            <Text style={styles.sectionTitle}>Points & Due Date</Text>
          </View>

          <View style={styles.row}>
            <View
              style={[styles.inputGroup, { flex: 1, marginRight: SPACING.sm }]}
            >
              <Text style={styles.inputLabel}>Total Points *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.totalPoints}
                onChangeText={(value) => updateFormData('totalPoints', value)}
                placeholder="100"
                placeholderTextColor={TEACHER_COLORS.textMuted}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>

            <View
              style={[styles.inputGroup, { flex: 1, marginLeft: SPACING.sm }]}
            >
              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.priorityContainer}>
                {[
                  { key: 'low', color: TEACHER_COLORS.success, label: 'Low' },
                  {
                    key: 'medium',
                    color: TEACHER_COLORS.warning,
                    label: 'Medium',
                  },
                  { key: 'high', color: TEACHER_COLORS.error, label: 'High' },
                ].map((priority) => (
                  <TouchableOpacity
                    key={priority.key}
                    style={[
                      styles.priorityChip,
                      {
                        backgroundColor:
                          formData.priority === priority.key
                            ? priority.color
                            : TEACHER_COLORS.surface,
                        borderColor:
                          formData.priority === priority.key
                            ? priority.color
                            : COLORS.teacherPalette.neutral.lighter,
                      },
                    ]}
                    onPress={() => updateFormData('priority', priority.key)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        {
                          color:
                            formData.priority === priority.key
                              ? TEACHER_COLORS.textWhite
                              : TEACHER_COLORS.text,
                        },
                      ]}
                    >
                      {priority.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Due Date *</Text>
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.selectorButtonText}>
                {formatDueDate(formData.dueDate)}
              </Text>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={primaryColor}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Submission Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="cloud-upload-outline"
              size={24}
              color={primaryColor}
            />
            <Text style={styles.sectionTitle}>Submission Settings</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Submission Type</Text>
            <View style={styles.chipContainer}>
              {[
                {
                  key: 'text',
                  label: 'Text Entry',
                  icon: 'text-outline',
                  color: COLORS.teacherPalette.subjects.english,
                },
                {
                  key: 'file',
                  label: 'File Upload',
                  icon: 'attach-outline',
                  color: COLORS.teacherPalette.subjects.computer,
                },
              ].map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: formData.submissionType.includes(
                        type.key,
                      )
                        ? type.color
                        : TEACHER_COLORS.surface,
                      borderColor: formData.submissionType.includes(type.key)
                        ? type.color
                        : COLORS.teacherPalette.neutral.lighter,
                    },
                  ]}
                  onPress={() => handleSubmissionTypeToggle(type.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={type.icon}
                    size={16}
                    color={
                      formData.submissionType.includes(type.key)
                        ? TEACHER_COLORS.textWhite
                        : type.color
                    }
                  />
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: formData.submissionType.includes(type.key)
                          ? TEACHER_COLORS.textWhite
                          : TEACHER_COLORS.text,
                      },
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <Text style={styles.inputLabel}>Allow Late Submissions</Text>
                <Text style={styles.switchDescription}>
                  Students can submit after due date with penalty
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.switch,
                  {
                    backgroundColor: formData.allowLateSubmission
                      ? primaryColor
                      : COLORS.teacherPalette.neutral.lighter,
                  },
                ]}
                onPress={() =>
                  updateFormData(
                    'allowLateSubmission',
                    !formData.allowLateSubmission,
                  )
                }
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.switchThumb,
                    formData.allowLateSubmission && styles.switchThumbActive,
                  ]}
                />
              </TouchableOpacity>
            </View>

            {formData.allowLateSubmission && (
              <View style={styles.penaltyContainer}>
                <Text style={styles.penaltyLabel}>
                  Late Penalty (% per day)
                </Text>
                <TextInput
                  style={[styles.textInput, styles.penaltyInput]}
                  value={formData.lateSubmissionPenalty}
                  onChangeText={(value) =>
                    updateFormData('lateSubmissionPenalty', value)
                  }
                  placeholder="10"
                  placeholderTextColor={TEACHER_COLORS.textMuted}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
            )}
          </View>
        </View>

        {/* Submit Buttons */}
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: primaryColor }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color={TEACHER_COLORS.textWhite}
              />
            ) : (
              <>
                <Ionicons
                  name={
                    isEditing
                      ? 'checkmark-circle-outline'
                      : 'add-circle-outline'
                  }
                  size={20}
                  color={TEACHER_COLORS.textWhite}
                />
                <Text style={styles.submitButtonText}>
                  {isEditing ? 'Update Assignment' : 'Create Assignment'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* ✅ Professional Modals */}
      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="datetime"
        date={formData.dueDate}
        onConfirm={(date) => {
          updateFormData('dueDate', date);
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
        minimumDate={new Date()}
      />

      {/* Class Selector Modal - Enhanced UI/UX */}
      <Modal
        visible={showClassSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowClassSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
                elevation: 8,
              },
            ]}
          >
            <View
              style={[
                styles.modalHeader,
                { zIndex: 2, backgroundColor: TEACHER_COLORS.surface },
              ]}
            >
              <Text style={styles.modalTitle}>Select Class</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowClassSelector(false)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={TEACHER_COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View
              style={{
                paddingHorizontal: 24,
                paddingBottom: 8,
                backgroundColor: TEACHER_COLORS.surface,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: TEACHER_COLORS.accent,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  marginTop: 4,
                }}
              >
                <Ionicons
                  name="search-outline"
                  size={18}
                  color={TEACHER_COLORS.textMuted}
                />
                <TextInput
                  style={{
                    flex: 1,
                    marginLeft: 8,
                    color: TEACHER_COLORS.text,
                    fontSize: 16,
                    paddingVertical: 0,
                  }}
                  placeholder="Search by class or subject..."
                  placeholderTextColor={TEACHER_COLORS.textMuted}
                  value={classSearchQuery}
                  onChangeText={setClassSearchQuery}
                  returnKeyType="search"
                  autoFocus={false}
                />
                {classSearchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setClassSearchQuery('')}>
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color={TEACHER_COLORS.textMuted}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Filter classList inside modal render to always use latest classList */}
            <ScrollView
              style={styles.classOptions}
              keyboardShouldPersistTaps="handled"
            >
              {classLoading ? (
                <ActivityIndicator
                  size="large"
                  color={primaryColor}
                  style={{ marginTop: 20 }}
                />
              ) : (
                (() => {
                  let filteredClassList = Array.isArray(classList)
                    ? classList
                    : [];
                  if (classSearchQuery.trim()) {
                    const q = classSearchQuery.trim().toLowerCase();
                    filteredClassList = filteredClassList.filter(
                      (classItem) =>
                        (classItem.name &&
                          classItem.name.toLowerCase().includes(q)) ||
                        (classItem.subject &&
                          classItem.subject.toLowerCase().includes(q)),
                    );
                  }
                  if (filteredClassList.length === 0) {
                    return (
                      <View
                        style={{
                          alignItems: 'center',
                          marginTop: 32,
                          marginBottom: 32,
                        }}
                      >
                        <Ionicons
                          name="school-outline"
                          size={48}
                          color={TEACHER_COLORS.textMuted}
                          style={{ marginBottom: 8 }}
                        />
                        <Text
                          style={{
                            color: TEACHER_COLORS.textMuted,
                            fontSize: 16,
                            textAlign: 'center',
                            marginBottom: 4,
                          }}
                        >
                          {classSearchQuery.length > 0
                            ? 'No classes match your search.'
                            : 'No classes found. Please create a class first.'}
                        </Text>
                      </View>
                    );
                  }
                  return filteredClassList.map((classItem) => (
                    <TouchableOpacity
                      key={classItem._id}
                      style={[
                        styles.classOption,
                        formData.classId === classItem._id &&
                          styles.selectedClassOption,
                      ]}
                      onPress={() => {
                        updateFormData('classId', classItem._id);
                        setShowClassSelector(false);
                      }}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.classIconContainer,
                          {
                            backgroundColor: `${COLORS.teacherPalette.subjects.mathematics}15`,
                          },
                        ]}
                      >
                        <Ionicons
                          name="school"
                          size={20}
                          color={COLORS.teacherPalette.subjects.mathematics}
                        />
                      </View>
                      <View style={styles.classOptionInfo}>
                        <Text style={styles.classOptionName}>
                          {classItem.name}
                        </Text>
                        <Text style={styles.classOptionDetails}>
                          {classItem.subject || 'Class'}
                          {classItem.students
                            ? ` • ${classItem.students.length} students`
                            : ''}
                        </Text>
                      </View>
                      {formData.classId === classItem._id && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={primaryColor}
                        />
                      )}
                    </TouchableOpacity>
                  ));
                })()
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ✅ Professional Styles using Theme System
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TEACHER_COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  section: {
    backgroundColor: TEACHER_COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.teacherPalette.neutral.lighter,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.teacherPalette.shadow.light,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEACHER_THEME.typography.h4,
    color: TEACHER_COLORS.text,
    marginLeft: SPACING.sm,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    ...TEACHER_THEME.typography.body,
    fontWeight: '500',
    color: TEACHER_COLORS.text,
    marginBottom: SPACING.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.teacherPalette.neutral.lighter,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.sm + 4,
    fontSize: 16,
    color: TEACHER_COLORS.text,
    backgroundColor: TEACHER_COLORS.surface,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.teacherPalette.neutral.lighter,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.sm + 4,
    backgroundColor: TEACHER_COLORS.surface,
  },
  selectorButtonText: {
    fontSize: 16,
    color: TEACHER_COLORS.text,
    flex: 1,
  },
  placeholderText: {
    color: TEACHER_COLORS.textMuted,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    gap: SPACING.xs,
  },
  chipText: {
    ...TEACHER_THEME.typography.caption,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  priorityChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  priorityText: {
    ...TEACHER_THEME.typography.caption,
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm + 4,
  },
  switchInfo: {
    flex: 1,
  },
  switchDescription: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
    marginTop: 2,
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: TEACHER_COLORS.textWhite,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.teacherPalette.shadow.medium,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  penaltyContainer: {
    marginTop: SPACING.sm,
  },
  penaltyLabel: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  penaltyInput: {
    width: 80,
  },
  submitContainer: {
    gap: SPACING.sm + 4,
    marginVertical: SPACING.md,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.teacherPalette.shadow.medium,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  submitButtonText: {
    color: TEACHER_COLORS.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: SPACING.sm + 4,
  },
  cancelButtonText: {
    color: TEACHER_COLORS.textMuted,
    fontSize: 16,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: SPACING.lg,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 20,
    minWidth: 260,
    maxWidth: 340,
    width: '88%',
    maxHeight: 420,
    alignSelf: 'center',
    marginHorizontal: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.teacherPalette.neutral.lighter,
  },
  modalTitle: {
    ...TEACHER_THEME.typography.h3,
    color: TEACHER_COLORS.text,
  },
  modalCloseButton: {
    padding: SPACING.xs,
  },
  classOptions: {
    paddingHorizontal: SPACING.lg,
  },
  classOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.teacherPalette.neutral.lighter,
    gap: SPACING.sm + 4,
  },
  selectedClassOption: {
    backgroundColor: COLORS.teacherPalette.background.accent,
  },
  classIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  classOptionInfo: {
    flex: 1,
  },
  classOptionName: {
    ...TEACHER_THEME.typography.body,
    fontWeight: '500',
    color: TEACHER_COLORS.text,
  },
  classOptionDetails: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.textMuted,
    marginTop: 2,
  },
});

export default CreateAssignment;
