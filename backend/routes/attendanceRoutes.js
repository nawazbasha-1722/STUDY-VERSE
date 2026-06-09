import express from 'express';
import {
  logAttendance,
  getMyAttendance,
  predictAttendance,
  getLowAttendanceAlerts,
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Student routes
router.get('/my', protect, getMyAttendance);
router.post('/predict', protect, predictAttendance);

// Faculty & Admin routes
router.post('/', protect, authorize('faculty', 'admin'), logAttendance);
router.get('/low-alerts', protect, authorize('faculty', 'admin'), getLowAttendanceAlerts);

export default router;
