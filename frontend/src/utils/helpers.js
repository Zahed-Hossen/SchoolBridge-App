import { Platform } from 'react-native';

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';

  const dateObj = new Date(date);
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return dateObj.toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

/**
 * Format time to readable string
 * @param {Date|string} time - Time to format
 * @param {boolean} use12Hour - Use 12-hour format (default: true)
 */
export const formatTime = (time, use12Hour = true) => {
  if (!time) return '';

  const timeObj = new Date(time);
  return timeObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: use12Hour,
  });
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {Date|string} date - Date to format
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';

  const now = new Date();
  const dateObj = new Date(date);
  const diffInSeconds = Math.floor((now - dateObj) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return formatDate(date);
};

/**
 * Capitalize first letter of each word
 * @param {string} str - String to capitalize
 */
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
  );
};

/**
 * Generate initials from name
 * @param {string} name - Full name
 * @param {number} maxInitials - Maximum number of initials (default: 2)
 */
export const getInitials = (name, maxInitials = 2) => {
  if (!name) return '';

  return name
    .split(' ')
    .slice(0, maxInitials)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

/**
 * Generate random color
 * @param {string} seed - Seed for consistent color generation
 */
export const generateColor = (seed) => {
  if (!seed) return '#2E86AB';

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

/**
 * Calculate grade letter from percentage
 * @param {number} percentage - Grade percentage
 */
export const getGradeLetter = (percentage) => {
  if (typeof percentage !== 'number') return 'N/A';

  if (percentage >= 97) return 'A+';
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 65) return 'D';
  return 'F';
};

/**
 * Get grade color based on percentage
 * @param {number} percentage - Grade percentage
 */
export const getGradeColor = (percentage) => {
  if (typeof percentage !== 'number') return '#718096';

  if (percentage >= 90) return '#22C55E'; // Green
  if (percentage >= 80) return '#84CC16'; // Light Green
  if (percentage >= 70) return '#EAB308'; // Yellow
  if (percentage >= 60) return '#F97316'; // Orange
  return '#EF4444'; // Red
};

/**
 * Calculate attendance percentage
 * @param {number} attended - Classes attended
 * @param {number} total - Total classes
 */
export const calculateAttendancePercentage = (attended, total) => {
  if (!total || total === 0) return 0;
  return Math.round((attended / total) * 100);
};

/**
 * Get attendance status color
 * @param {number} percentage - Attendance percentage
 */
export const getAttendanceColor = (percentage) => {
  if (percentage >= 90) return '#22C55E'; // Green
  if (percentage >= 75) return '#EAB308'; // Yellow
  if (percentage >= 60) return '#F97316'; // Orange
  return '#EF4444'; // Red
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Sort array by date field
 * @param {Array} array - Array to sort
 * @param {string} dateField - Date field name
 * @param {boolean} ascending - Sort order (default: false - newest first)
 */
export const sortByDate = (array, dateField, ascending = false) => {
  if (!Array.isArray(array)) return [];

  return array.sort((a, b) => {
    const dateA = new Date(a[dateField]);
    const dateB = new Date(b[dateField]);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

/**
 * Sort array by string field
 * @param {Array} array - Array to sort
 * @param {string} field - Field to sort by
 * @param {boolean} ascending - Sort order (default: true)
 */
export const sortByString = (array, field, ascending = true) => {
  if (!Array.isArray(array)) return [];

  return array.sort((a, b) => {
    const valueA = (a[field] || '').toString().toLowerCase();
    const valueB = (b[field] || '').toString().toLowerCase();

    if (ascending) {
      return valueA.localeCompare(valueB);
    }
    return valueB.localeCompare(valueA);
  });
};

/**
 * Group array by field
 * @param {Array} array - Array to group
 * @param {string} field - Field to group by
 */
export const groupBy = (array, field) => {
  if (!Array.isArray(array)) return {};

  return array.reduce((groups, item) => {
    const key = item[field] || 'Unknown';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Deep clone object (React Native compatible)
 * @param {Object} obj - Object to clone
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map((item) => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

/**
 * Check if user has permission for role-based access
 * @param {string} userRole - User's role
 * @param {Array} allowedRoles - Array of allowed roles
 */
export const hasPermission = (userRole, allowedRoles) => {
  if (!userRole || !Array.isArray(allowedRoles)) return false;
  return allowedRoles.includes(userRole);
};

/**
 * Generate random ID (React Native compatible)
 * @param {number} length - Length of ID (default: 8)
 */
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate unique ID with timestamp
 */
export const generateUniqueId = () => {
  return `${Date.now()}_${generateId(6)}`;
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get platform specific styles
 * @param {Object} iosStyle - iOS specific styles
 * @param {Object} androidStyle - Android specific styles
 */
export const platformStyles = (iosStyle = {}, androidStyle = {}) => {
  return Platform.select({
    ios: iosStyle,
    android: androidStyle,
  });
};

/**
 * Safe JSON parse
 * @param {string} jsonString - JSON string to parse
 * @param {*} defaultValue - Default value if parsing fails
 */
export const safeJsonParse = (jsonString, defaultValue = null) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('JSON parse error:', error);
    return defaultValue;
  }
};

/**
 * Calculate GPA from grades array
 * @param {Array} grades - Array of grade objects with gpa property
 */
export const calculateGPA = (grades) => {
  if (!Array.isArray(grades) || grades.length === 0) return 0;

  const validGrades = grades.filter(grade =>
    typeof grade.gpa === 'number' && !isNaN(grade.gpa)
  );

  if (validGrades.length === 0) return 0;

  const totalGPA = validGrades.reduce((sum, grade) => sum + grade.gpa, 0);
  return Math.round((totalGPA / validGrades.length) * 100) / 100;
};

/**
 * Get semester from date
 * @param {Date|string} date - Date to check
 */
export const getSemester = (date = new Date()) => {
  const dateObj = new Date(date);
  const month = dateObj.getMonth() + 1; // 0-indexed to 1-indexed
  const year = dateObj.getFullYear();

  if (month >= 8 && month <= 12) {
    return `Fall ${year}`;
  } else if (month >= 1 && month <= 5) {
    return `Spring ${year}`;
  } else {
    return `Summer ${year}`;
  }
};

/**
 * Validate required fields in object
 * @param {Object} obj - Object to validate
 * @param {Array} requiredFields - Array of required field names
 */
export const validateRequiredFields = (obj, requiredFields) => {
  const missing = [];

  requiredFields.forEach(field => {
    if (!obj[field] || (typeof obj[field] === 'string' && obj[field].trim() === '')) {
      missing.push(field);
    }
  });

  return {
    isValid: missing.length === 0,
    missingFields: missing,
  };
};

/**
 * Get age from birthday
 * @param {Date|string} birthday - Birthday date
 */
export const getAge = (birthday) => {
  if (!birthday) return null;

  const today = new Date();
  const birthDate = new Date(birthday);
  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

// Export default object with all functions
export default {
  formatDate,
  formatTime,
  formatRelativeTime,
  capitalizeWords,
  getInitials,
  isValidEmail,
  isValidPhone,
  generateColor,
  getGradeLetter,
  getGradeColor,
  calculateAttendancePercentage,
  getAttendanceColor,
  truncateText,
  sortByDate,
  sortByString,
  groupBy,
  debounce,
  deepClone,
  hasPermission,
  generateId,
  generateUniqueId,
  formatFileSize,
  platformStyles,
  safeJsonParse,
  calculateGPA,
  getSemester,
  validateRequiredFields,
  getAge,
};
