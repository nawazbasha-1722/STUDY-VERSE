import express from 'express';
import { addSemesterRecord, getMyGPADetails } from '../controllers/gpaController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Only students manage their GPA records in StudyVerse ⭐
router.post('/semester', protect, authorize('student'), addSemesterRecord);
router.get('/history', protect, authorize('student'), getMyGPADetails);

export default router;
