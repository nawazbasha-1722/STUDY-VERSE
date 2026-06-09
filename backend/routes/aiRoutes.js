import express from 'express';
import { analyzeFile, askQuestion } from '../controllers/aiController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Only students access AI Study Workspace in this version
router.post('/analyze-file', protect, authorize('student'), upload.single('file'), analyzeFile);
router.post('/ask', protect, authorize('student'), askQuestion);

export default router;
