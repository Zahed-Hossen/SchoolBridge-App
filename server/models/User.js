import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, PROVIDERS } from '../utils/constants.js';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (email) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
        },
        message: 'Please enter a valid email address',
      },
    },

    password: {
      type: String,
      required: function () {
        return this.provider === PROVIDERS.EMAIL;
      },
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, //never fetch password in the response (frontend)
    },

    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },

    firstName: {
      type: String,
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },

    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },

    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (phone) {
          return !phone || /^[\+]?[1-9][\d]{0,15}$/.test(phone);
        },
        message: 'Please enter a valid phone number',
      },
    },

    role: {
      type: String,
      enum: [
        ROLES.STUDENT,
        ROLES.TEACHER,
        ROLES.PARENT,
        ROLES.ADMIN,
        ROLES.SUPER_ADMIN,
        ROLES.VISITOR,
        ROLES.PLATFORM_USER,
      ],
      default: ROLES.VISITOR,
      required: true,
    },

    avatar: {
      type: String,
      default: null,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true, //no problem if empty
    },

    provider: {
      type: String,
      enum: Object.values(PROVIDERS),
      default: PROVIDERS.EMAIL,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    // Token management
    tokenVersion: {
      type: Number,
      default: 0, //for token versioning (to invalidate old tokens)
    },

    refreshTokens: [
      {
        type: String,
      },
    ],

    // Student-specific fields
    studentId: {
      type: String,
      unique: true,
      sparse: true,
    },

    grade: {
      type: String,
      trim: true,
    },

    section: {
      type: String,
      trim: true,
    },

    // Teacher-specific fields
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
    },

    subjects: [
      {
        type: String,
        trim: true,
      },
    ],

    // Parent-specific fields
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // School reference
    school_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      default: null,
    },

    // Settings
    preferences: {
      language: {
        type: String,
        default: 'en',
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
      },
    },
  },
  {
    timestamps: true, //automatically add createdAt and updatedAt fields
    toJSON: {
      //when we convert the document to JSON (e.g., when sending a response)
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.tokenVersion;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Pre-save middleware for password hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to generate fullName from firstName/lastName
userSchema.pre('save', function (next) {
  if (this.firstName && this.lastName && !this.fullName) {
    this.fullName = `${this.firstName} ${this.lastName}`;
  } else if (this.fullName && !this.firstName && !this.lastName) {
    const names = this.fullName.split(' ');
    this.firstName = names[0];
    this.lastName = names.slice(1).join(' ');
  }
  next();
});

// ✅ Instance methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save();
};

userSchema.methods.incrementTokenVersion = function () {
  this.tokenVersion += 1;
  return this.save();
};

// Static methods
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

userSchema.statics.findByGoogleId = function (googleId) {
  return this.findOne({ googleId });
};

userSchema.statics.findByEmailOrGoogleId = function (email, googleId) {
  return this.findOne({
    $or: [{ email: email.toLowerCase() }, { googleId: googleId }],
  });
};

const User = mongoose.model('User', userSchema);

export default User;
