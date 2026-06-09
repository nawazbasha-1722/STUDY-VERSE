import express from 'express';
import { getSystemAnalytics } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/analytics', protect, authorize('admin'), getSystemAnalytics);

export default router;
