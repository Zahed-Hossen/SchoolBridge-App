import { body, validationResult } from 'express-validator';

// ✅ Validation middleware
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  next();
};

export const userValidation = {
  signup: [
    body('signupType')
      .isIn(['platform', 'visitor'])
      .withMessage('Signup type must be either "platform" or "visitor"'),
    body('email')
      .isEmail()
      // .normalizeEmail() // Allow aliases for non-Google signups
      .withMessage('Please provide a valid email address'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      ),
    body('fullName')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters'),
    body('role')
      .if(body('signupType').equals('platform'))
      .notEmpty()
      .withMessage('Role is required for platform users')
      .isIn([
        'Student',
        'Teacher',
        'Parent',
        'Admin',
        'PlatformUser',
        'SuperAdmin',
      ])
      .withMessage('Please select a valid role'),

    body('phone')
      .optional()
      .custom((value) => {
        if (!value) return true;

        const cleanPhone = value.replace(/\D/g, '');

        if (cleanPhone.length < 10 || cleanPhone.length > 15) {
          throw new Error('Phone number must be between 10-15 digits');
        }

        const validFormats = [
          /^\+?[1-9]\d{1,14}$/, // E.164 international format
          /^[0-9]{10,11}$/, // Local format (10-11 digits)
          /^\+88[0-9]{11}$/, // Bangladesh format
          /^\+1[0-9]{10}$/, // US format
        ];

        const isValid = validFormats.some((format) =>
          format.test(value.replace(/[\s\-\(\)]/g, '')),
        );

        if (!isValid) {
          throw new Error(
            'Please enter a valid phone number (e.g., +8801234567890 or 01234567890)',
          );
        }

        return true;
      }),
  ],

  login: [
    body('email')
      .isEmail()
      // .normalizeEmail() // Allow aliases for non-Google logins
      .withMessage('Please provide a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
    body('role')
      .isIn([
        'Student',
        'Teacher',
        'Parent',
        'Admin',
        'SuperAdmin',
        'Visitor',
        'PlatformUser',
      ])
      .withMessage('Please select a valid role'),
  ],

  googleAuth: [
    body('user.email')
      .isEmail()
      .normalizeEmail() // Always normalize for Google OAuth
      .withMessage('Valid email is required'),
    body('user.googleId').notEmpty().withMessage('Google ID is required'),
    body('user.fullName')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Full name must be at least 2 characters'),
    body('role')
      .isIn([
        'Student',
        'Teacher',
        'Parent',
        'Admin',
        'SuperAdmin',
        'Visitor',
        'PlatformUser',
      ])
      .withMessage('Please select a valid role'),
  ],

  updateProfile: [
    body('fullName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters'),
    body('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Please provide a valid phone number'),
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('First name must be between 1 and 50 characters'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name must be between 1 and 50 characters'),
  ],

  activate: [
    body('token').notEmpty().withMessage('Activation token is required'),
    body('fullName')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2-100 characters'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number'),
  ],
};
