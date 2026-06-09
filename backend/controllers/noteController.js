import Note from '../models/Note.js';
import { uploadFile } from '../services/cloudinary.js';

// @desc    Upload new study notes file
// @route   POST /api/notes
// @access  Private (Student/Faculty)
export const uploadNote = async (req, res) => {
  const { title, description, subject } = req.body;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload a file document',
    });
  }

  try {
    // Upload file (via Cloudinary or local path)
    const fileUrl = await uploadFile(req.file.path, 'notes');

    const note = await Note.create({
      title,
      description,
      subject,
      fileUrl,
      uploadedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Notes document uploaded successfully!',
      note,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error uploading notes',
    });
  }
};

// @desc    Get all notes / search / filter
// @route   GET /api/notes
// @access  Private
export const getNotes = async (req, res) => {
  const { search, subject, favoritesOnly } = req.query;
  const filter = {};

  if (subject) {
    filter.subject = subject;
  }

  if (favoritesOnly === 'true') {
    filter.favorites = req.user.id;
  }

  if (search) {
    filter.$text = { $search: search };
  }

  try {
    const notes = await Note.find(filter)
      .populate('uploadedBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error retrieving notes',
    });
  }
};

// @desc    Register a download event
// @route   POST /api/notes/:id/download
// @access  Private
export const downloadNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadsCount: 1 } },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Notes not found',
      });
    }

    res.status(200).json({
      success: true,
      fileUrl: note.fileUrl,
      downloadsCount: note.downloadsCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error tracking download',
    });
  }
};

// @desc    Toggle favorite status on a note
// @route   POST /api/notes/:id/favorite
// @access  Private
export const toggleFavoriteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Notes not found',
      });
    }

    const userId = req.user.id;
    const favIndex = note.favorites.indexOf(userId);

    if (favIndex > -1) {
      note.favorites.splice(favIndex, 1); // Remove
    } else {
      note.favorites.push(userId); // Add
    }

    await note.save();

    res.status(200).json({
      success: true,
      message: favIndex > -1 ? 'Removed from favorites' : 'Added to favorites',
      isFavorite: favIndex === -1,
      favorites: note.favorites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error toggling favorite status',
    });
  }
};

// @desc    Rate notes
// @route   POST /api/notes/:id/rate
// @access  Private
export const rateNote = async (req, res) => {
  const { score } = req.body;

  if (!score || score < 1 || score > 5) {
    return res.status(400).json({
      success: false,
      message: 'Please provide rating score between 1 and 5',
    });
  }

  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Notes not found',
      });
    }

    const userId = req.user.id;
    const ratingIndex = note.ratings.findIndex((r) => r.user.toString() === userId);

    if (ratingIndex > -1) {
      note.ratings[ratingIndex].score = score;
    } else {
      note.ratings.push({ user: userId, score });
    }

    await note.save();

    res.status(200).json({
      success: true,
      message: 'Rating registered successfully!',
      averageRating: note.averageRating,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error rating notes',
    });
  }
};

// @desc    Get all unique subjects
// @route   GET /api/notes/subjects
// @access  Private
export const getSubjects = async (req, res) => {
  try {
    const subjects = await Note.distinct('subject');
    res.status(200).json({
      success: true,
      subjects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error fetching subjects list',
    });
  }
};
