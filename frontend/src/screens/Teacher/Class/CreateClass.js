import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import SimpleHeader from '../../../components/navigation/SimpleHeader';
// ✅ Import Professional Theme System
import {
  COLORS,
  TEACHER_COLORS,
  TEACHER_THEME,
  SPACING,
  BORDER_RADIUS
} from '../../../constants/theme';

const CreateClass = ({ navigation }) => {
  // ✅ Professional State Management
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    grade: '',
    section: '',
    room: '',
    description: '',
    schedule: {
      days: [],
      time: '',
    },
    maxStudents: '30',
  });

  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ Subject Options with Colors
  const subjects = [
    { key: 'mathematics', label: 'Mathematics', icon: 'calculator', color: COLORS.teacherPalette.subjects.mathematics },
    { key: 'science', label: 'Science', icon: 'flask', color: COLORS.teacherPalette.subjects.science },
    { key: 'english', label: 'English', icon: 'book', color: COLORS.teacherPalette.subjects.english },
    { key: 'history', label: 'History', icon: 'library', color: COLORS.teacherPalette.subjects.history },
    { key: 'arts', label: 'Arts', icon: 'color-palette', color: COLORS.teacherPalette.subjects.arts },
    { key: 'sports', label: 'Physical Education', icon: 'fitness', color: COLORS.teacherPalette.subjects.sports },
    { key: 'music', label: 'Music', icon: 'musical-notes', color: COLORS.teacherPalette.subjects.music },
    { key: 'computer', label: 'Computer Science', icon: 'desktop', color: COLORS.teacherPalette.subjects.computer },
  ];

  // ✅ Grade Options
  const grades = [
    { key: '1', label: 'Grade 1' },
    { key: '2', label: 'Grade 2' },
    { key: '3', label: 'Grade 3' },
    { key: '4', label: 'Grade 4' },
    { key: '5', label: 'Grade 5' },
    { key: '6', label: 'Grade 6' },
    { key: '7', label: 'Grade 7' },
    { key: '8', label: 'Grade 8' },
    { key: '9', label: 'Grade 9' },
    { key: '10', label: 'Grade 10' },
    { key: '11', label: 'Grade 11' },
    { key: '12', label: 'Grade 12' },
  ];

  // ✅ Days of Week
  const daysOfWeek = [
    { key: 'monday', label: 'Mon', fullLabel: 'Monday' },
    { key: 'tuesday', label: 'Tue', fullLabel: 'Tuesday' },
    { key: 'wednesday', label: 'Wed', fullLabel: 'Wednesday' },
    { key: 'thursday', label: 'Thu', fullLabel: 'Thursday' },
    { key: 'friday', label: 'Fri', fullLabel: 'Friday' },
    { key: 'saturday', label: 'Sat', fullLabel: 'Saturday' },
    { key: 'sunday', label: 'Sun', fullLabel: 'Sunday' },
  ];

  // ✅ Form Validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Class name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Class name must be at least 3 characters';
    }

    if (!selectedSubject) {
      newErrors.subject = 'Please select a subject';
    }

    if (!selectedGrade) {
      newErrors.grade = 'Please select a grade';
    }

    if (!formData.section.trim()) {
      newErrors.section = 'Section is required';
    }

    if (!formData.room.trim()) {
      newErrors.room = 'Room number is required';
    }

    if (selectedDays.length === 0) {
      newErrors.days = 'Please select at least one day';
    }

    if (!formData.schedule.time.trim()) {
      newErrors.time = 'Class time is required';
    }

    const maxStudents = parseInt(formData.maxStudents);
    if (isNaN(maxStudents) || maxStudents < 1 || maxStudents > 100) {
      newErrors.maxStudents = 'Max students must be between 1 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, selectedSubject, selectedGrade, selectedDays]);

  // ✅ Form Handlers
  const updateFormData = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null,
      }));
    }
  }, [errors]);

  const handleSubjectSelect = useCallback((subject) => {
    setSelectedSubject(subject.key);
    updateFormData('subject', subject.label);
    setErrors(prev => ({ ...prev, subject: null }));
  }, [updateFormData]);

  const handleGradeSelect = useCallback((grade) => {
    setSelectedGrade(grade.key);
    updateFormData('grade', grade.key);
    setErrors(prev => ({ ...prev, grade: null }));
  }, [updateFormData]);

  const handleDayToggle = useCallback((day) => {
    const newSelectedDays = selectedDays.includes(day.key)
      ? selectedDays.filter(d => d !== day.key)
      : [...selectedDays, day.key];

    setSelectedDays(newSelectedDays);
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        days: newSelectedDays,
      },
    }));
    setErrors(prev => ({ ...prev, days: null }));
  }, [selectedDays]);

  // ✅ Create Class Handler
  const handleCreateClass = useCallback(async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting');
      return;
    }

    try {
      setLoading(true);

      // 🔄 TODO: Replace with actual API call
      /*
      const response = await fetch('/api/teacher/classes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          subject: selectedSubject,
          grade: selectedGrade,
          schedule: {
            days: selectedDays,
            time: formData.schedule.time,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create class');
      }

      const newClass = await response.json();
      */

      // ✅ Mock success simulation
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        'Success!',
        'Class created successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
              // TODO: Refresh classes list or navigate to new class
            },
          },
        ]
      );

    } catch (error) {
      console.error('❌ Error creating class:', error);
      Alert.alert('Error', 'Failed to create class. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [formData, selectedSubject, selectedGrade, selectedDays, validateForm, navigation]);

  // ✅ Get selected subject data
  const getSelectedSubject = useCallback(() => {
    return subjects.find(s => s.key === selectedSubject);
  }, [selectedSubject, subjects]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* ✅ Professional Header */}
      <SimpleHeader
        title="Create New Class"
        subtitle="Set up your class details"
        navigation={navigation}
        primaryColor={TEACHER_COLORS.primary}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ✅ Class Basic Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={24} color={TEACHER_COLORS.primary} />
            <Text style={styles.sectionTitle}>Basic Information</Text>
          </View>

          {/* Class Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Class Name *</Text>
            <TextInput
              style={[
                styles.textInput,
                errors.name && styles.inputError
              ]}
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              placeholder="e.g., Advanced Calculus, Biology 101"
              placeholderTextColor={TEACHER_COLORS.textMuted}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Section *</Text>
            <TextInput
              style={[
                styles.textInput,
                errors.section && styles.inputError
              ]}
              value={formData.section}
              onChangeText={(value) => updateFormData('section', value.toUpperCase())}
              placeholder="e.g., A, B, C"
              placeholderTextColor={TEACHER_COLORS.textMuted}
              maxLength={2}
            />
            {errors.section && <Text style={styles.errorText}>{errors.section}</Text>}
          </View>

          {/* Room */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Room Number *</Text>
            <TextInput
              style={[
                styles.textInput,
                errors.room && styles.inputError
              ]}
              value={formData.room}
              onChangeText={(value) => updateFormData('room', value)}
              placeholder="e.g., Room 204, Lab A"
              placeholderTextColor={TEACHER_COLORS.textMuted}
            />
            {errors.room && <Text style={styles.errorText}>{errors.room}</Text>}
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              placeholder="Brief description of the class..."
              placeholderTextColor={TEACHER_COLORS.textMuted}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* ✅ Subject Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="school-outline" size={24} color={TEACHER_COLORS.primary} />
            <Text style={styles.sectionTitle}>Subject *</Text>
          </View>

          <View style={styles.subjectGrid}>
            {subjects.map((subject) => (
              <TouchableOpacity
                key={subject.key}
                style={[
                  styles.subjectCard,
                  selectedSubject === subject.key && [
                    styles.subjectCardSelected,
                    { borderColor: subject.color }
                  ]
                ]}
                onPress={() => handleSubjectSelect(subject)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={selectedSubject === subject.key
                    ? [subject.color, `${subject.color}DD`]
                    : ['transparent', 'transparent']
                  }
                  style={styles.subjectCardGradient}
                >
                  <View style={[
                    styles.subjectIcon,
                    { backgroundColor: selectedSubject === subject.key ? 'rgba(255,255,255,0.2)' : subject.color }
                  ]}>
                    <Ionicons
                      name={subject.icon}
                      size={24}
                      color={selectedSubject === subject.key ? TEACHER_COLORS.textWhite : TEACHER_COLORS.textWhite}
                    />
                  </View>
                  <Text style={[
                    styles.subjectText,
                    { color: selectedSubject === subject.key ? TEACHER_COLORS.textWhite : TEACHER_COLORS.text }
                  ]}>
                    {subject.label}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
          {errors.subject && <Text style={styles.errorText}>{errors.subject}</Text>}
        </View>

        {/* ✅ Grade Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="library-outline" size={24} color={TEACHER_COLORS.primary} />
            <Text style={styles.sectionTitle}>Grade Level *</Text>
          </View>

          <View style={styles.gradeGrid}>
            {grades.map((grade) => (
              <TouchableOpacity
                key={grade.key}
                style={[
                  styles.gradeChip,
                  selectedGrade === grade.key && styles.gradeChipSelected
                ]}
                onPress={() => handleGradeSelect(grade)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.gradeText,
                  selectedGrade === grade.key && styles.gradeTextSelected
                ]}>
                  {grade.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.grade && <Text style={styles.errorText}>{errors.grade}</Text>}
        </View>

        {/* ✅ Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={24} color={TEACHER_COLORS.primary} />
            <Text style={styles.sectionTitle}>Schedule *</Text>
          </View>

          {/* Days Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Class Days *</Text>
            <View style={styles.daysGrid}>
              {daysOfWeek.map((day) => (
                <TouchableOpacity
                  key={day.key}
                  style={[
                    styles.dayChip,
                    selectedDays.includes(day.key) && styles.dayChipSelected
                  ]}
                  onPress={() => handleDayToggle(day)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.dayText,
                    selectedDays.includes(day.key) && styles.dayTextSelected
                  ]}>
                    {day.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.days && <Text style={styles.errorText}>{errors.days}</Text>}
          </View>

          {/* Time Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Class Time *</Text>
            <TextInput
              style={[
                styles.textInput,
                errors.time && styles.inputError
              ]}
              value={formData.schedule.time}
              onChangeText={(value) => setFormData(prev => ({
                ...prev,
                schedule: { ...prev.schedule, time: value }
              }))}
              placeholder="e.g., 9:00 AM - 10:30 AM"
              placeholderTextColor={TEACHER_COLORS.textMuted}
            />
            {errors.time && <Text style={styles.errorText}>{errors.time}</Text>}
          </View>
        </View>

        {/* ✅ Class Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings-outline" size={24} color={TEACHER_COLORS.primary} />
            <Text style={styles.sectionTitle}>Class Settings</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Maximum Students</Text>
            <TextInput
              style={[
                styles.textInput,
                errors.maxStudents && styles.inputError
              ]}
              value={formData.maxStudents}
              onChangeText={(value) => updateFormData('maxStudents', value)}
              placeholder="30"
              placeholderTextColor={TEACHER_COLORS.textMuted}
              keyboardType="numeric"
              maxLength={3}
            />
            {errors.maxStudents && <Text style={styles.errorText}>{errors.maxStudents}</Text>}
          </View>
        </View>

        {/* ✅ Preview Card */}
        {selectedSubject && selectedGrade && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="eye-outline" size={24} color={TEACHER_COLORS.primary} />
              <Text style={styles.sectionTitle}>Preview</Text>
            </View>

            <View style={styles.previewCard}>
              <LinearGradient
                colors={[getSelectedSubject()?.color || TEACHER_COLORS.primary, `${getSelectedSubject()?.color || TEACHER_COLORS.primary}DD`]}
                style={styles.previewHeader}
              >
                <View style={styles.previewIcon}>
                  <Ionicons
                    name={getSelectedSubject()?.icon || 'school'}
                    size={28}
                    color={TEACHER_COLORS.textWhite}
                  />
                </View>
                <View style={styles.previewInfo}>
                  <Text style={styles.previewTitle}>
                    {formData.name || 'Class Name'}
                  </Text>
                  <Text style={styles.previewSubtitle}>
                    {formData.subject} • Grade {selectedGrade}{formData.section && formData.section}
                  </Text>
                </View>
              </LinearGradient>

              <View style={styles.previewContent}>
                <View style={styles.previewDetail}>
                  <Ionicons name="location-outline" size={16} color={TEACHER_COLORS.textMuted} />
                  <Text style={styles.previewDetailText}>{formData.room || 'Room TBD'}</Text>
                </View>
                <View style={styles.previewDetail}>
                  <Ionicons name="time-outline" size={16} color={TEACHER_COLORS.textMuted} />
                  <Text style={styles.previewDetailText}>
                    {selectedDays.length > 0
                      ? `${selectedDays.map(d => daysOfWeek.find(day => day.key === d)?.label).join(', ')} - ${formData.schedule.time || 'Time TBD'}`
                      : 'Schedule TBD'
                    }
                  </Text>
                </View>
                <View style={styles.previewDetail}>
                  <Ionicons name="people-outline" size={16} color={TEACHER_COLORS.textMuted} />
                  <Text style={styles.previewDetailText}>Max {formData.maxStudents} students</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* ✅ Create Button */}
      <View style={styles.createButtonContainer}>
        <TouchableOpacity
          style={[
            styles.createButton,
            { backgroundColor: getSelectedSubject()?.color || TEACHER_COLORS.primary },
            loading && styles.createButtonDisabled
          ]}
          onPress={handleCreateClass}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={TEACHER_COLORS.textWhite} />
          ) : (
            <View style={styles.createButtonContent}>
              <Ionicons name="checkmark-circle" size={20} color={TEACHER_COLORS.textWhite} />
              <Text style={styles.createButtonText}>Create Class</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// ✅ Professional Styles
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
    ...Platform.select({
      ios: {
        shadowColor: COLORS.teacherPalette.shadow.light,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
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
    color: TEACHER_COLORS.text,
    fontWeight: '500',
    marginBottom: SPACING.sm,
  },
  textInput: {
    ...TEACHER_THEME.typography.body,
    backgroundColor: TEACHER_COLORS.accent,
    borderWidth: 1,
    borderColor: COLORS.teacherPalette.neutral.lighter,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    color: TEACHER_COLORS.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: TEACHER_COLORS.error,
    borderWidth: 2,
  },
  errorText: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.error,
    marginTop: SPACING.xs,
  },
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  subjectCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.teacherPalette.neutral.lighter,
    overflow: 'hidden',
  },
  subjectCardSelected: {
    borderWidth: 2,
  },
  subjectCardGradient: {
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  subjectIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subjectText: {
    ...TEACHER_THEME.typography.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  gradeChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.teacherPalette.neutral.lighter,
    backgroundColor: TEACHER_COLORS.accent,
    minWidth: 80,
    alignItems: 'center',
  },
  gradeChipSelected: {
    backgroundColor: TEACHER_COLORS.primary,
    borderColor: TEACHER_COLORS.primary,
  },
  gradeText: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.text,
    fontWeight: '500',
  },
  gradeTextSelected: {
    color: TEACHER_COLORS.textWhite,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  dayChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.teacherPalette.neutral.lighter,
    backgroundColor: TEACHER_COLORS.accent,
    minWidth: 40,
    alignItems: 'center',
  },
  dayChipSelected: {
    backgroundColor: TEACHER_COLORS.primary,
    borderColor: TEACHER_COLORS.primary,
  },
  dayText: {
    ...TEACHER_THEME.typography.small,
    color: TEACHER_COLORS.text,
    fontWeight: '500',
  },
  dayTextSelected: {
    color: TEACHER_COLORS.textWhite,
    fontWeight: '600',
  },
  previewCard: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.teacherPalette.neutral.lighter,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  previewIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  previewInfo: {
    flex: 1,
  },
  previewTitle: {
    ...TEACHER_THEME.typography.h4,
    color: TEACHER_COLORS.textWhite,
    fontWeight: '700',
  },
  previewSubtitle: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textWhite,
    opacity: 0.9,
    marginTop: SPACING.xs / 2,
  },
  previewContent: {
    backgroundColor: TEACHER_COLORS.surface,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  previewDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  previewDetailText: {
    ...TEACHER_THEME.typography.caption,
    color: TEACHER_COLORS.textSecondary,
  },
  createButtonContainer: {
    padding: SPACING.md,
    backgroundColor: TEACHER_COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.teacherPalette.neutral.lighter,
  },
  createButton: {
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.teacherPalette.shadow.medium,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  createButtonText: {
    ...TEACHER_THEME.typography.body,
    color: TEACHER_COLORS.textWhite,
    fontWeight: '600',
  },
  bottomPadding: {
    height: SPACING.xl,
  },
});

export default CreateClass;
