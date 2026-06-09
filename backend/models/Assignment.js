import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['submitted', 'late'],
    default: 'submitted',
  },
  grade: String,
  feedback: String,
});

const AssignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide assignment title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Please specify the subject'],
      trim: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Please provide due date'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    submissions: [SubmissionSchema],
  },
  {
    timestamps: true,
  }
);

AssignmentSchema.index({ dueDate: 1 });
AssignmentSchema.index({ subject: 1 });

export default mongoose.model('Assignment', AssignmentSchema);
