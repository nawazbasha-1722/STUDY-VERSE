import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide task title'],
      trim: true,
    },
    description: String,
    status: {
      type: String,
      enum: ['todo', 'doing', 'done'],
      default: 'todo',
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    dueDate: Date,
  },
  {
    timestamps: true,
  }
);

const ProjectMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  senderName: String,
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide project name'],
      trim: true,
    },
    description: String,
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
    tasks: [TaskSchema],
    messages: [ProjectMessageSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Project', ProjectSchema);
