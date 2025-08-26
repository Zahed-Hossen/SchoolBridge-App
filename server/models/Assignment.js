import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      trim: true
    },
    dueDate: {
      type: Date,
      required: [true, 'Please add a due date']
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    submissions: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        submittedAt: {
          type: Date,
          default: Date.now
        },
        content: {
          type: String,
          required: [true, 'Please add submission content']
        },
        grade: {
          type: Number,
          min: 0,
          max: 100
        },
        feedback: {
          type: String,
          trim: true
        }
      }
    ],
    maxPoints: {
      type: Number,
      required: true,
      default: 100
    },
    attachments: [
      {
        url: String,
        name: String,
        type: String
      }
    ],
    isPublished: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Cascade delete submissions when an assignment is deleted
assignmentSchema.pre('remove', async function(next) {
  console.log(`Submissions being removed from assignment ${this._id}`);
  // Remove references from Class model
  await this.model('Class').updateMany(
    { assignments: this._id },
    { $pull: { assignments: this._id } }
  );
  next();
});

// Index for better query performance
assignmentSchema.index({ class: 1, dueDate: 1 });
assignmentSchema.index({ teacher: 1, dueDate: 1 });

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;
