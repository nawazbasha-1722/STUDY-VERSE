import express from 'express';
import {
  getPlacementQuizzes,
  getCodingChallenges,
  evaluateCode,
  startMockInterview,
  respondMockInterview,
} from '../controllers/placementController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/quizzes', protect, getPlacementQuizzes);
router.get('/coding', protect, getCodingChallenges);
router.post('/coding/evaluate', protect, evaluateCode);
router.post('/interview/start', protect, startMockInterview);
router.post('/interview/respond', protect, respondMockInterview);

export default router;
