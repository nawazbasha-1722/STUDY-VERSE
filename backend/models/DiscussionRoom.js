import mongoose from 'mongoose';

const RoomMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  senderName: String,
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const DiscussionRoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide room name'],
      trim: true,
    },
    topic: {
      type: String,
      required: [true, 'Please provide discussion topic'],
      trim: true,
    },
    description: String,
    roomCode: {
      type: String,
      required: true,
      unique: true,
    },
    maxMembers: {
      type: Number,
      default: 10,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    messages: [RoomMessageSchema],
    whiteboardData: {
      type: Array, // Holds draw stroke coordinates
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // AI Summarization output
    aiSummary: {
      keyPoints: [String],
      decisions: [String],
      importantQuestions: [String],
      feedback: String,
      performanceScore: Number,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('DiscussionRoom', DiscussionRoomSchema);
