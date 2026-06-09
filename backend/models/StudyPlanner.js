import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const CountdownSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  targetDate: {
    type: Date,
    required: true,
  },
});

const StudyLogSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  duration: {
    type: Number, // in minutes
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const StudyPlannerSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    goals: [GoalSchema],
    countdowns: [CountdownSchema],
    studyLogs: [StudyLogSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('StudyPlanner', StudyPlannerSchema);
