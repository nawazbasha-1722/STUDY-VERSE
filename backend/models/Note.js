import mongoose from 'mongoose';

const RatingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
});

const NoteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please enter a notes title'],
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
    fileUrl: {
      type: String,
      required: [true, 'Please provide the file URL'],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ratings: [RatingSchema],
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    downloadsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Search indexes for notes
NoteSchema.index({ title: 'text', description: 'text' });
NoteSchema.index({ subject: 1 });

// Helper to compute average rating
NoteSchema.virtual('averageRating').get(function () {
  if (this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, curr) => acc + curr.score, 0);
  return parseFloat((sum / this.ratings.length).toFixed(1));
});

NoteSchema.set('toJSON', { virtuals: true });
NoteSchema.set('toObject', { virtuals: true });

export default mongoose.model('Note', NoteSchema);
