import express from 'express';
import {
  createProject,
  getProjects,
  getProjectDetails,
  createTask,
  updateTaskStatus,
  addProjectMessage,
} from '../controllers/projectController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorize('student'), getProjects);
router.post('/', protect, authorize('student'), createProject);
router.get('/:id', protect, authorize('student'), getProjectDetails);
router.post('/:id/tasks', protect, authorize('student'), createTask);
router.put('/:id/tasks/:taskId', protect, authorize('student'), updateTaskStatus);
router.post('/:id/message', protect, authorize('student'), addProjectMessage);

export default router;
