import express from 'express';
import {
  createRoom,
  joinRoom,
  getRooms,
  getRoomDetails,
  saveWhiteboard,
  addRoomMessage,
  endDiscussionSession,
} from '../controllers/discussionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getRooms);
router.post('/', protect, createRoom);
router.post('/join', protect, joinRoom);
router.get('/:id', protect, getRoomDetails);
router.post('/:id/message', protect, addRoomMessage);
router.post('/:id/whiteboard', protect, saveWhiteboard);
router.post('/:id/end', protect, endDiscussionSession);

export default router;
