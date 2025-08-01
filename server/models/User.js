import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Basic Information
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allows null values but ensures uniqueness when present
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: {
    type: String,
    default: null,
  },

  // Authentication
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password required only if not OAuth user
    },
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },

  // Role & Permissions
  role: {
    type: String,
    enum: ['Student', 'Teacher', 'Parent', 'Admin'],
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },

  // Profile Information
  profile: {
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'US',
      },
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    },
  },

  // Role-specific Information
  studentInfo: {
    studentId: String,
    grade: String,
    class: String,
    enrollmentDate: Date,
    parentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },

  teacherInfo: {
    employeeId: String,
    department: String,
    subjects: [String],
    hireDate: Date,
    qualifications: [String],
  },

  parentInfo: {
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
  },

  adminInfo: {
    employeeId: String,
    department: String,
    permissions: [String],
  },

  // Security & Tracking
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: Date,
  refreshTokens: [String],

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'studentInfo.studentId': 1 });
userSchema.index({ 'teacherInfo.employeeId': 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's been modified
  if (!this.isModified('password')) return next();

  // Hash password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Static method to find by email or Google ID
userSchema.statics.findByEmailOrGoogleId = function(email, googleId) {
  const query = { $or: [{ email }] };
  if (googleId) {
    query.$or.push({ googleId });
  }
  return this.findOne(query);
};

export default mongoose.model('User', userSchema);
