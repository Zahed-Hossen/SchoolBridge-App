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
 * Generate random color
 * @param {string} seed - Seed for consistent color generation
 */
export const generateColor = (seed) => {
  if (!seed) return '#2E86AB';

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

/**
 * Calculate grade letter from percentage
 * @param {number} percentage - Grade percentage
 */
export const getGradeLetter = (percentage) => {
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
 * Calculate attendance percentage
 * @param {number} attended - Classes attended
 * @param {number} total - Total classes
 */
export const calculateAttendancePercentage = (attended, total) => {
  if (!total || total === 0) return 0;
  return Math.round((attended / total) * 100);
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
  return array.sort((a, b) => {
    const dateA = new Date(a[dateField]);
    const dateB = new Date(b[dateField]);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

/**
 * Group array by field
 * @param {Array} array - Array to group
 * @param {string} field - Field to group by
 */
export const groupBy = (array, field) => {
  return array.reduce((groups, item) => {
    const key = item[field];
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
 * Deep clone object
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
  if (!userRole || !allowedRoles) return false;
  return allowedRoles.includes(userRole);
};

/**
 * Generate random ID
 * @param {number} length - Length of ID (default: 8)
 */
export const generateId = (length = 8) => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
