import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io = null;
const activeSockets = new Map(); // Maps userId -> socket.id

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Verify JWT on connection handshake
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    
    if (!token) {
      return next(new Error('Authentication failed: Missing token'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      return next(new Error('Authentication failed: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket Connected: User [${socket.userId}] -> Socket [${socket.id}]`);
    activeSockets.set(socket.userId, socket.id);

    // Join a self-named private room for custom direct alerts
    socket.join(socket.userId);

    // Bind event handlers dynamically
    import('../sockets/chat.socket.js').then((m) => m.default(io, socket, activeSockets));
    import('../sockets/booking.socket.js').then((m) => m.default(io, socket, activeSockets));

    socket.on('disconnect', () => {
      console.log(`Socket Disconnected: User [${socket.userId}]`);
      activeSockets.delete(socket.userId);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized yet');
  }
  return io;
};
