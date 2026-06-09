import express from 'express';
import {
  getPlanner,
  addGoal,
  toggleGoal,
  deleteGoal,
  addCountdown,
  deleteCountdown,
  logStudyTime,
} from '../controllers/plannerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Planners are student-specific in StudyVerse ⭐
router.get('/', protect, authorize('student'), getPlanner);
router.post('/goals', protect, authorize('student'), addGoal);
router.put('/goals/:goalId', protect, authorize('student'), toggleGoal);
router.delete('/goals/:goalId', protect, authorize('student'), deleteGoal);
router.post('/countdowns', protect, authorize('student'), addCountdown);
router.delete('/countdowns/:countdownId', protect, authorize('student'), deleteCountdown);
router.post('/logs', protect, authorize('student'), logStudyTime);

export default router;
