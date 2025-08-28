import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, 'Please enter a valid email address'],
    },
    role: {
      type: String,
      required: true,
      enum: ['Teacher', 'Student', 'Parent', 'Admin','staff'],
      validate: {
        validator: function (role) {
          if (
            role === 'Admin' &&
            this.populated('createdBy') &&
            this.createdBy.role !== 'SuperAdmin'
          ) {
            return false;
          }
          return true;
        },
        message: 'Only SuperAdmin can create Admin invitations',
      },
    },
    school_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [
        function () {
          return this.role !== 'SuperAdmin' && this.role !== 'Admin';
        },
        'School is required for non-admin roles',
      ],
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'expired', 'failed'],
      default: 'pending',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    error: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.token;
        return ret;
      },
    },
  },
);

// Index for faster querying
invitationSchema.index({ email: 1, status: 1 });
invitationSchema.index({ token: 1 }, { unique: true });
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save hook to ensure email is lowercase
invitationSchema.pre('save', function (next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  next();
});

// Static method to find valid invitation by token
invitationSchema.statics.findValidByToken = async function (token) {
  return this.findOne({
    token,
    status: 'pending',
    expiresAt: { $gt: new Date() },
  });
};

const Invitation = mongoose.model('Invitation', invitationSchema);

export default Invitation;
