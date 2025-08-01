import * as yup from 'yup';

// Common validation schemas
export const validationSchemas = {
  // Email validation
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),

  // Password validation
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    )
    .required('Password is required'),

  // Name validation
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .required('Name is required'),

  // Phone validation
  phone: yup
    .string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .required('Phone number is required'),

  // Required field
  required: (fieldName) => yup.string().required(`${fieldName} is required`),

  // Optional field with min/max
  optionalText: (min = 0, max = 500) =>
    yup
      .string()
      .min(min, `Must be at least ${min} characters`)
      .max(max, `Cannot exceed ${max} characters`),
};

// Authentication schemas
export const authSchemas = {
  // Login schema
  login: yup.object({
    email: validationSchemas.email,
    password: yup.string().required('Password is required'),
    role: yup.string().required('Please select a role'),
  }),

  // Registration schema
  register: yup.object({
    name: validationSchemas.name,
    email: validationSchemas.email,
    password: validationSchemas.password,
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords must match')
      .required('Please confirm your password'),
    role: yup.string().required('Please select a role'),
    phone: validationSchemas.phone,
  }),

  // Forgot password schema
  forgotPassword: yup.object({
    email: validationSchemas.email,
  }),

  // Reset password schema
  resetPassword: yup.object({
    password: validationSchemas.password,
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords must match')
      .required('Please confirm your password'),
  }),
};

// Profile schemas
export const profileSchemas = {
  // Update profile schema
  updateProfile: yup.object({
    name: validationSchemas.name,
    email: validationSchemas.email,
    phone: validationSchemas.phone,
    bio: validationSchemas.optionalText(0, 200),
  }),

  // Change password schema
  changePassword: yup.object({
    currentPassword: yup.string().required('Current password is required'),
    newPassword: validationSchemas.password,
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('newPassword')], 'Passwords must match')
      .required('Please confirm your new password'),
  }),
};

// Academic schemas
export const academicSchemas = {
  // Assignment schema
  createAssignment: yup.object({
    title: yup
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title cannot exceed 100 characters')
      .required('Assignment title is required'),
    description: validationSchemas.optionalText(10, 1000),
    dueDate: yup
      .date()
      .min(new Date(), 'Due date must be in the future')
      .required('Due date is required'),
    maxPoints: yup
      .number()
      .positive('Points must be positive')
      .max(1000, 'Points cannot exceed 1000')
      .required('Maximum points is required'),
    subject: yup.string().required('Subject is required'),
    class: yup.string().required('Class is required'),
  }),

  // Grade schema
  addGrade: yup.object({
    student: yup.string().required('Student is required'),
    assignment: yup.string().required('Assignment is required'),
    points: yup
      .number()
      .min(0, 'Points cannot be negative')
      .required('Points earned is required'),
    feedback: validationSchemas.optionalText(0, 500),
  }),

  // Class schema
  createClass: yup.object({
    name: yup
      .string()
      .min(3, 'Class name must be at least 3 characters')
      .max(50, 'Class name cannot exceed 50 characters')
      .required('Class name is required'),
    subject: yup.string().required('Subject is required'),
    description: validationSchemas.optionalText(0, 300),
    schedule: yup.array().min(1, 'At least one schedule slot is required'),
    maxStudents: yup
      .number()
      .positive('Maximum students must be positive')
      .max(200, 'Maximum students cannot exceed 200')
      .required('Maximum students is required'),
  }),
};

// Admin schemas
export const adminSchemas = {
  // Create user schema
  createUser: yup.object({
    name: validationSchemas.name,
    email: validationSchemas.email,
    role: yup.string().required('Role is required'),
    phone: validationSchemas.phone,
    password: validationSchemas.password,
  }),

  // School settings schema
  schoolSettings: yup.object({
    schoolName: yup
      .string()
      .min(3, 'School name must be at least 3 characters')
      .max(100, 'School name cannot exceed 100 characters')
      .required('School name is required'),
    address: yup
      .string()
      .min(10, 'Address must be at least 10 characters')
      .max(200, 'Address cannot exceed 200 characters')
      .required('Address is required'),
    phone: validationSchemas.phone,
    email: validationSchemas.email,
    website: yup.string().url('Please enter a valid website URL').optional(),
  }),
};

// Parent schemas
export const parentSchemas = {
  // Add child schema
  addChild: yup.object({
    studentId: yup.string().required('Student ID is required'),
    relationship: yup
      .string()
      .oneOf(
        ['father', 'mother', 'guardian'],
        'Please select a valid relationship',
      )
      .required('Relationship is required'),
  }),
};

// Utility functions for validation
export const validateField = async (schema, field, value) => {
  try {
    await schema.validateAt(field, { [field]: value });
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
};

export const validateForm = async (schema, values) => {
  try {
    await schema.validate(values, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    const errors = {};
    error.inner.forEach((err) => {
      errors[err.path] = err.message;
    });
    return { isValid: false, errors };
  }
};

// Custom validation rules
export const customValidators = {
  // Check if date is within academic year
  isAcademicYear: (date) => {
    const academicYearStart = new Date(new Date().getFullYear(), 8, 1); // September 1st
    const academicYearEnd = new Date(new Date().getFullYear() + 1, 5, 30); // June 30th
    const inputDate = new Date(date);
    return inputDate >= academicYearStart && inputDate <= academicYearEnd;
  },

  // Check if time slot doesn't conflict
  isValidTimeSlot: (startTime, endTime) => {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    return end > start;
  },

  // Check if grade is within valid range
  isValidGrade: (points, maxPoints) => {
    return points >= 0 && points <= maxPoints;
  },
};
