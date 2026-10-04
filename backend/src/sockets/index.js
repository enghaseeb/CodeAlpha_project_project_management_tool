import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Every socket authenticates with the same JWT the REST API uses, then joins
// a personal room (for notifications) and, per open board, a project room
// (for live task/list/comment updates).
export const initSockets = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.user._id}`);

    socket.on('project:join', (projectId) => {
      if (projectId) socket.join(`project:${projectId}`);
    });

    socket.on('project:leave', (projectId) => {
      if (projectId) socket.leave(`project:${projectId}`);
    });

    // Lightweight "someone is viewing / typing" signal for a task, rebroadcast
    // to everyone else on the board.
    socket.on('task:typing', ({ projectId, taskId }) => {
      socket.to(`project:${projectId}`).emit('task:typing', {
        taskId,
        user: { id: socket.user._id, name: socket.user.name },
      });
    });
  });
};
