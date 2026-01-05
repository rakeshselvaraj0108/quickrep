import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import { Server as NetServer } from 'http';
// import { initSocket } from '../../lib/socket';

interface SocketServer extends NetServer {
  io?: ServerIO;
}

interface ApiResponse extends NextApiResponse {
  socket: any;
}

let io: ServerIO;

export default function handler(req: NextApiRequest, res: ApiResponse) {
  console.log('🔌 Socket.io API route called with method:', req.method);

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  console.log('🔌 Socket.io API route called');

  if (!res.socket.server.io) {
    console.log('🔌 Initializing Socket.io server...');
    const io = new ServerIO(res.socket.server, {
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
        console.log('💬 Received message for room:', roomId, 'from:', socket.id);
        // Broadcast to everyone in the room INCLUDING sender
        io.to(roomId).emit('new-message', message);
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

    res.socket.server.io = io;
  }

  res.status(200).json({ message: 'Socket.io server initialized' });
}

export const config = {
  api: {
    bodyParser: false,
  },
};