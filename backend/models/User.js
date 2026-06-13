import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please enter an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please enter a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Prevents password from being fetched by default queries
    },
    role: {
      type: String,
      enum: ['student', 'faculty', 'admin'],
      default: 'student',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    profile: {
      phone: String,
      department: String,
      year: {
        type: Number,
        min: 1,
        max: 4,
      },
      avatar: {
        type: String,
        default: 'https://res.cloudinary.com/placeholder-avatar.png',
      },
    },
    // Placements Readiness metrics & GPA caches
    gpaStats: {
      cgpa: { type: Number, default: 0 },
      previousCgpa: { type: Number, default: 0 },
      previousCredits: { type: Number, default: 0 },
      semesters: [
        {
          semester: Number,
          sgpa: Number,
        },
      ],
    },
    placementMetrics: {
      aptitudeSolved: { type: Number, default: 0 },
      codingSolved: { type: Number, default: 0 },
      mockInterviews: { type: Number, default: 0 },
      averageMockScore: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', UserSchema);
