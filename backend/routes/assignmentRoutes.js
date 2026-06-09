import express from 'express';
import {
  createAssignment,
  getAssignments,
  submitAssignment,
  gradeSubmission,
} from '../controllers/assignmentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', protect, getAssignments);
router.post('/', protect, authorize('faculty', 'admin'), createAssignment);
router.post('/:id/submit', protect, authorize('student'), upload.single('file'), submitAssignment);
router.post('/:id/grade/:submissionId', protect, authorize('faculty', 'admin'), gradeSubmission);

export default router;
