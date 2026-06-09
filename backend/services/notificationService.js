import Notification from '../models/Notification.js';
import { getIO } from '../config/socket.js';

export const createNotification = async (userId, type, message) => {
  try {
    const notif = await Notification.create({
      user: userId,
      type,
      message,
    });

    // Real-time Socket.io dispatch
    try {
      const io = getIO();
      // Emits to room named after user's database ID
      io.to(userId.toString()).emit('new_notification', notif);
    } catch (socketErr) {
      // Offline fallback: saved to MongoDB and loaded on login refresh
      console.log('Socket not ready to push, saved to DB.');
    }

    return notif;
  } catch (error) {
    console.error('Failed to dispatch system notification', error);
    throw error;
  }
};
