// Color palette for SchoolBridge App
export const COLORS = {
  // Primary colors (keep existing)
  primary: '#2E86AB',
  secondary: '#F24236',
  accent: '#F6AE2D',

  // ✅ UPDATED: Enhanced Role-based colors with professional teacher palette
  student: '#3498DB',
  teacher: '#2E7D8F',        // 🎨 New professional teal
  parent: '#F39C12',
  admin: '#9B59B6',

  // ✅ NEW: Detailed Teacher Color Palette
  teacherPalette: {
    // Primary Colors - Main brand colors for teacher section
    primary: {
      main: '#2E7D8F',        // Deep Teal - Professional & trustworthy
      light: '#4A9BAE',       // Light Teal - Hover states
      dark: '#1E5A6B',        // Dark Teal - Active states
      gradient: ['#2E7D8F', '#4A9BAE'], // Gradient for headers
    },

    // Secondary Colors - Accent and supporting colors
    secondary: {
      main: '#E67E22',        // Warm Orange - Energy & creativity
      light: '#F39C12',       // Golden Orange - Highlights
      dark: '#D35400',        // Deep Orange - Emphasis
      muted: '#F4D03F',       // Soft Yellow - Gentle accents
    },

    // Success Colors - Positive actions, grades, achievements
    success: {
      main: '#27AE60',        // Forest Green - Accomplishments
      light: '#58D68D',       // Light Green - Positive feedback
      dark: '#1E8449',        // Dark Green - Confirmed actions
      bg: '#D5F5E3',          // Light green background
    },

    // Warning Colors - Attention, pending items
    warning: {
      main: '#F39C12',        // Amber - Needs attention
      light: '#F7DC6F',       // Light amber - Mild warnings
      dark: '#E67E22',        // Orange - Important warnings
      bg: '#FEF9E7',          // Light yellow background
    },

    // Error Colors - Issues, overdue, critical
    error: {
      main: '#E74C3C',        // Coral Red - Problems
      light: '#F1948A',       // Light red - Mild errors
      dark: '#C0392B',        // Dark red - Critical issues
      bg: '#FADBD8',          // Light red background
    },

    // Background Colors - Different surface levels
    background: {
      primary: '#F8F9FA',     // Main background
      secondary: '#FFFFFF',   // Card backgrounds
      accent: '#EBF4F6',      // Subtle teal background
      warm: '#FDF8F0',        // Warm background for highlights
    },

    // Text Colors - Hierarchy and readability
    text: {
      primary: '#1A1A1A',     // Main text
      secondary: '#4A5568',   // Secondary text
      muted: '#718096',       // Muted text
      light: '#A0AEC0',       // Light text
      white: '#FFFFFF',       // White text on dark backgrounds
      accent: '#2E7D8F',      // Accent text (links, etc.)
    },

    // Grade Colors - Academic performance visualization
    grades: {
      excellent: '#27AE60',   // A+ grades
      good: '#58D68D',        // A/B grades
      average: '#F39C12',     // C grades
      poor: '#E67E22',        // D grades
      failing: '#E74C3C',     // F grades
    },

    // Status Colors - Various states and indicators
    status: {
      active: '#27AE60',      // Active/online
      inactive: '#95A5A6',    // Inactive/offline
      pending: '#F39C12',     // Pending review
      completed: '#2E7D8F',   // Completed tasks
      draft: '#9B59B6',       // Draft content
    },

    // Interactive Colors - Buttons, links, hover states
    interactive: {
      primary: '#2E7D8F',     // Primary buttons
      primaryHover: '#1E5A6B', // Primary button hover
      secondary: '#E67E22',   // Secondary buttons
      secondaryHover: '#D35400', // Secondary button hover
      link: '#2E7D8F',        // Links
      linkHover: '#4A9BAE',   // Link hover
    },

    // Subject Colors - Different academic subjects
    subjects: {
      mathematics: '#9B59B6', // Purple
      science: '#3498DB',     // Blue
      english: '#E67E22',     // Orange
      history: '#8D6E63',     // Brown
      arts: '#E91E63',        // Pink
      sports: '#4CAF50',      // Green
      music: '#FF9800',       // Amber
      computer: '#607D8B',    // Blue Gray
    },

    // Shadow Colors - Depth and elevation
    shadow: {
      light: 'rgba(46, 125, 143, 0.08)',   // Light shadow
      medium: 'rgba(46, 125, 143, 0.12)',  // Medium shadow
      heavy: 'rgba(46, 125, 143, 0.16)',   // Heavy shadow
      dark: 'rgba(26, 26, 26, 0.2)',       // Dark shadow
    },

    // Overlay Colors - Modals, dropdowns
    overlay: {
      light: 'rgba(248, 249, 250, 0.8)',   // Light overlay
      medium: 'rgba(108, 117, 125, 0.6)',  // Medium overlay
      dark: 'rgba(26, 26, 26, 0.7)',       // Dark overlay
    },

    // ✅ FIXED: Added neutral colors
    neutral: {
      white: '#FFFFFF',       // Pure white
      light: '#F8F9FA',       // Light gray background
      lighter: '#E9ECEF',     // Lighter gray - cards
      medium: '#6C757D',      // Medium gray - secondary text
      dark: '#343A40',        // Dark gray - primary text
      black: '#1A1A1A',       // Near black - headings
    },
  },

  // Grey scale (keep existing)
  grey: {
    light: '#F8F9FA',
    medium: '#8E8E93',
    dark: '#48484A',
  },

  // Background colors (keep existing)
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
  },

  // Text colors (keep existing)
  text: {
    primary: '#333333',
    secondary: '#666666',
    light: '#999999',
    white: '#FFFFFF',
  },

  // Basic colors (keep existing)
  white: '#FFFFFF',
  black: '#000000',
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  info: '#17A2B8',
};

// ✅ FIXED: Quick access teacher colors (for easy usage)
export const TEACHER_COLORS = {
  // Most commonly used colors
  primary: COLORS.teacherPalette.primary.main,
  primaryLight: COLORS.teacherPalette.primary.light,
  primaryDark: COLORS.teacherPalette.primary.dark,

  secondary: COLORS.teacherPalette.secondary.main,
  secondaryLight: COLORS.teacherPalette.secondary.light,

  success: COLORS.teacherPalette.success.main,
  warning: COLORS.teacherPalette.warning.main,
  error: COLORS.teacherPalette.error.main,

  background: COLORS.teacherPalette.background.primary,
  surface: COLORS.teacherPalette.background.secondary,
  accent: COLORS.teacherPalette.background.accent,

  text: COLORS.teacherPalette.text.primary,
  textSecondary: COLORS.teacherPalette.text.secondary,
  textMuted: COLORS.teacherPalette.text.muted,
  textWhite: COLORS.teacherPalette.text.white,

  // Grade colors
  gradeA: COLORS.teacherPalette.grades.excellent,
  gradeB: COLORS.teacherPalette.grades.good,
  gradeC: COLORS.teacherPalette.grades.average,
  gradeD: COLORS.teacherPalette.grades.poor,
  gradeF: COLORS.teacherPalette.grades.failing,
};

// ✅ FIXED: Font definitions
export const FONTS = {
  // Font family names
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',

  sizes: {
    xs: 10,
    sm: 12,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    // Additional sizes
    caption: 10,
    body4: 12,
    body3: 14,
    body2: 16,
    body1: 18,
    h4: 20,
    h3: 22,
    h2: 24,
    h1: 28,
  },
  weights: {
    normal: 'normal',
    bold: 'bold',
    '100': '100',
    '200': '200',
    '300': '300',
    '400': '400',
    '500': '500',
    '600': '600',
    '700': '700',
    '800': '800',
    '900': '900',
  },
};

// ✅ FIXED: Spacing definitions
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  // Alternative names
  base: 8,
  padding: 16,
};

// ✅ FIXED: Sizes definitions
export const SIZES = {
  base: 8,
  padding: 16,
  radius: 8,
  // Font sizes (alternative access pattern)
  caption: 10,
  body4: 12,
  body3: 14,
  body2: 16,
  body1: 18,
  h4: 20,
  h3: 22,
  h2: 24,
  h1: 28,
};

// ✅ FIXED: Border Radius definitions
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
};

// ✅ FIXED: Screen Dimensions
export const SCREEN = {
  width: '100%',
  height: '100%',
};

// ✅ FIXED: Teacher Theme Object (complete theme for teacher components)
export const TEACHER_THEME = {
  colors: COLORS.teacherPalette,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  fonts: FONTS,
  typography: {
    h1: { fontSize: 28, fontWeight: '700', color: COLORS.teacherPalette.text.primary },
    h2: { fontSize: 24, fontWeight: '600', color: COLORS.teacherPalette.text.primary },
    h3: { fontSize: 20, fontWeight: '600', color: COLORS.teacherPalette.text.primary },
    h4: { fontSize: 18, fontWeight: '500', color: COLORS.teacherPalette.text.primary },
    body: { fontSize: 16, fontWeight: '400', color: COLORS.teacherPalette.text.primary },
    caption: { fontSize: 14, fontWeight: '400', color: COLORS.teacherPalette.text.secondary },
    small: { fontSize: 12, fontWeight: '400', color: COLORS.teacherPalette.text.muted },
  },
};

// ✅ FIXED: Helper function to get role-specific colors
export const getRoleColors = (role) => {
  switch (role?.toLowerCase()) {
    case 'teacher':
      return TEACHER_COLORS;
    case 'student':
      return { primary: COLORS.student };
    case 'parent':
      return { primary: COLORS.parent };
    case 'admin':
      return { primary: COLORS.admin };
    default:
      return { primary: COLORS.primary };
  }
};

// ✅ FIXED: Export everything for easy access
export default {
  COLORS,
  TEACHER_COLORS,
  TEACHER_THEME,
  FONTS,
  SPACING,
  SIZES,
  BORDER_RADIUS,
  SCREEN,
  getRoleColors,
};
