import express from 'express';
import {
  uploadNote,
  getNotes,
  downloadNote,
  toggleFavoriteNote,
  rateNote,
  getSubjects,
} from '../controllers/noteController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', protect, getNotes);
router.get('/subjects', protect, getSubjects);
router.post('/', protect, upload.single('file'), uploadNote);
router.post('/:id/download', protect, downloadNote);
router.post('/:id/favorite', protect, toggleFavoriteNote);
router.post('/:id/rate', protect, rateNote);

export default router;
