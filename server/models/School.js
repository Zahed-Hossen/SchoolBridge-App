import mongoose from 'mongoose';

const schoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    contact: {
      phone: String,
      email: String,
      website: String,
    },
    settings: {
      academicYearStart: Date,
      academicYearEnd: Date,
      gradeSystem: {
        type: String,
        enum: ['letter', 'percentage', 'points'],
        default: 'letter',
      },
      timezone: {
        type: String,
        default: 'America/New_York',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('School', schoolSchema);
