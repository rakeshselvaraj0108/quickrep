import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as ServerIO } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.io
  const io = new ServerIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Store active rooms and participants
  const rooms = new Map();
  const participants = new Map();

  io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);

    // Join room
    socket.on('join-room', ({ roomId, userData }) => {
      socket.join(roomId);

      // Add participant to room
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId).add(socket.id);

      // Store participant data
      participants.set(socket.id, {
        ...userData,
        roomId,
        socketId: socket.id,
        joinedAt: Date.now(),
      });

      // Notify others in room
      socket.to(roomId).emit('user-joined', {
        userId: socket.id,
        userData,
      });

      // Send current participants to new user
      const roomParticipants = Array.from(rooms.get(roomId))
        .map(id => participants.get(id))
        .filter(Boolean);

      socket.emit('room-participants', roomParticipants);
    });

    // Handle WebRTC signaling
    socket.on('offer', ({ to, offer }) => {
      socket.to(to).emit('offer', { from: socket.id, offer });
    });

    socket.on('answer', ({ to, answer }) => {
      socket.to(to).emit('answer', { from: socket.id, answer });
    });

    socket.on('ice-candidate', ({ to, candidate }) => {
      socket.to(to).emit('ice-candidate', { from: socket.id, candidate });
    });

    // Handle chat messages
    socket.on('send-message', ({ roomId, message }) => {
      socket.to(roomId).emit('new-message', message);
    });

    // Handle reactions
    socket.on('send-reaction', ({ roomId, reaction }) => {
      socket.to(roomId).emit('new-reaction', reaction);
    });

    // Handle participant updates
    socket.on('update-participant', ({ roomId, updates }) => {
      if (participants.has(socket.id)) {
        const participant = participants.get(socket.id);
        participants.set(socket.id, { ...participant, ...updates });
        socket.to(roomId).emit('participant-updated', {
          userId: socket.id,
          updates,
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('🔌 User disconnected:', socket.id);

      // Remove from all rooms
      rooms.forEach((roomParticipants, roomId) => {
        if (roomParticipants.has(socket.id)) {
          roomParticipants.delete(socket.id);
          socket.to(roomId).emit('user-left', {
            userId: socket.id,
          });

          // If room is empty, clean it up
          if (roomParticipants.size === 0) {
            rooms.delete(roomId);
          }
        }
      });

      participants.delete(socket.id);
    });
  });

  server.listen(3000, (err?: any) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});