import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: [true, 'Please provide the subject name'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Please provide the attendance date'],
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      required: [true, 'Please provide attendance status'],
    },
    sessionType: {
      type: String,
      enum: ['Lecture', 'Lab', 'Tutorial'],
      default: 'Lecture',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to speed up student attendance lookups grouped by subject
AttendanceSchema.index({ student: 1, subject: 1 });
AttendanceSchema.index({ date: -1 });

export default mongoose.model('Attendance', AttendanceSchema);
