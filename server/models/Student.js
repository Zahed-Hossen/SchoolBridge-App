import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    studentId: {
      type: String,
      required: [true, 'Please add a student ID'],
      unique: true,
      trim: true
    },
    gradeLevel: {
      type: String,
      enum: ['Freshman', 'Sophomore', 'Junior', 'Senior'],
      required: [true, 'Please select a grade level']
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emergencyContact: {
      name: {
        type: String,
        trim: true
      },
      relationship: {
        type: String,
        trim: true
      },
      phone: {
        type: String,
        trim: true
      },
      email: {
        type: String,
        trim: true,
        lowercase: true
      }
    },
    medicalInfo: {
      allergies: [{
        type: String,
        trim: true
      }],
      conditions: [{
        type: String,
        trim: true
      }],
      medications: [{
        name: String,
        dosage: String,
        instructions: String
      }]
    },
    isActive: {
      type: Boolean,
      default: true
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot be more than 1000 characters']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for getting student's classes
studentSchema.virtual('classes', {
  ref: 'Class',
  localField: '_id',
  foreignField: 'students',
  justOne: false
});

// Virtual for getting student's assignments
studentSchema.virtual('assignments', {
  ref: 'Assignment',
  localField: '_id',
  foreignField: 'submissions.student',
  justOne: false
});

// Indexes for better query performance
studentSchema.index({ studentId: 1 }, { unique: true });
studentSchema.index({ user: 1 }, { unique: true });
studentSchema.index({ parent: 1 });

const Student = mongoose.model('Student', studentSchema);

export default Student;
