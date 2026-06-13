import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    trim: true,
  },
  courseName: {
    type: String,
    required: true,
    trim: true,
  },
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 6,
  },
  grade: {
    type: String,
    enum: ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F'],
    required: true,
  },
  points: {
    type: Number,
    required: true,
    min: 0,
    max: 10,
  },
});

const AcademicRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    courses: [CourseSchema],
    sgpa: {
      type: Number,
      default: 0,
    },
    totalCredits: {
      type: Number,
      default: 0,
    },
    isDirectSGPA: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique key to make sure a student has only one record per semester
AcademicRecordSchema.index({ student: 1, semester: 1 }, { unique: true });

export default mongoose.model('AcademicRecord', AcademicRecordSchema);
