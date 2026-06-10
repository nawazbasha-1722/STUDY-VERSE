import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5000'
  ].filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const isAllowed = allowedOrigins.includes(origin) || 
                          origin.endsWith('.vercel.app') || 
                          origin.startsWith('http://localhost:');
        if (isAllowed) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Room joins
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
      // Notify other room members that a new user joined
      socket.to(roomId).emit('user_joined_room', { socketId: socket.id });
    });

    socket.on('join_user_room', (userId) => {
      socket.join(userId);
      console.log(`Socket ${socket.id} joined user room: ${userId}`);
    });

    // Live group messaging
    socket.on('send_message', (data) => {
      // Broadcast to room
      socket.to(data.roomId).emit('receive_message', data);
    });

    // Typing Indicators
    socket.on('typing', (data) => {
      socket.to(data.roomId).emit('user_typing', data);
    });

    // Whiteboard Sync
    socket.on('draw_line', (data) => {
      socket.to(data.roomId).emit('draw_line', data);
    });

    socket.on('clear_whiteboard', (roomId) => {
      socket.to(roomId).emit('clear_whiteboard');
    });

    // WebRTC Signaling Events
    socket.on('join_voice', (data) => {
      socket.to(data.roomId).emit('user_joined_voice', {
        socketId: socket.id,
        userId: data.userId,
        name: data.name
      });
    });

    socket.on('voice_signal', (data) => {
      // Send signal directly to targeted peer
      io.to(data.to).emit('voice_signal', {
        signal: data.signal,
        from: socket.id
      });
    });

    // Screen Share Signaling Events
    socket.on('join_screen', (data) => {
      socket.to(data.roomId).emit('user_joined_screen', {
        socketId: socket.id,
        userId: data.userId,
        name: data.name
      });
    });

    socket.on('screen_signal', (data) => {
      io.to(data.to).emit('screen_signal', {
        signal: data.signal,
        from: socket.id
      });
    });

    socket.on('stop_screen', (data) => {
      socket.to(data.roomId).emit('user_stopped_screen', {
        socketId: socket.id,
        name: data.name
      });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized!');
  }
  return io;
};
