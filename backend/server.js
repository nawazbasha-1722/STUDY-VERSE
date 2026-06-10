import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import path from 'path';
import { fileURLToPath } from 'url';

// Load routes
import authRoutes from './routes/authRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import gpaRoutes from './routes/gpaRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import plannerRoutes from './routes/plannerRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import placementRoutes from './routes/placementRoutes.js';
import discussionRoutes from './routes/discussionRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Environment variables loaded at top level

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Resolve static path for file uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize Socket.io
initSocket(server);

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'StudyVerse ⭐ Backend is running smoothly.' });
});

// Routes mount
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/gpa', gpaRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/placement', placementRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`StudyVerse ⭐ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
