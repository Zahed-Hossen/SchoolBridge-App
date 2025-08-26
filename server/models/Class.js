import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a class name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    subject: {
      type: String,
      required: [true, 'Please add a subject'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    schedule: {
      days: [{
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      }],
      startTime: String,
      endTime: String
    },
    room: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Cascade delete assignments when a class is deleted
classSchema.pre('remove', async function(next) {
  console.log(`Assignments being removed from class ${this._id}`);
  await this.model('Assignment').deleteMany({ class: this._id });
  next();
});

// Reverse populate with virtuals
classSchema.virtual('assignments', {
  ref: 'Assignment',
  localField: '_id',
  foreignField: 'class',
  justOne: false
});

const Class = mongoose.model('Class', classSchema);

export default Class;
