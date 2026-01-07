import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import { Server as NetServer } from 'http';
import { createClient } from '@supabase/supabase-js';

interface SocketServer extends NetServer {
  io?: ServerIO;
}

interface ApiResponse extends NextApiResponse {
  socket: any;
}

let io: ServerIO;

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

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
      socket.on('join-room', async ({ roomId, userData }) => {
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

        // Update participant count in database
        const participantCount = rooms.get(roomId).size;
        try {
          await supabase
            .from('rooms')
            .update({ participants: participantCount })
            .eq('id', roomId);
        } catch (error) {
          console.error('Error updating participant count:', error);
        }

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
        
        console.log(`✅ ${userData.name} joined room ${roomId} (${participantCount} participants)`);
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

      // Handle leave room
      socket.on('leave-room', async ({ roomId }) => {
        console.log(`🚪 User ${socket.id} leaving room ${roomId}`);
        
        // Leave the socket room
        socket.leave(roomId);

        // Remove from room participants
        if (rooms.has(roomId)) {
          const roomParticipants = rooms.get(roomId);
          roomParticipants.delete(socket.id);

          // Notify others
          socket.to(roomId).emit('user-left', {
            userId: socket.id,
          });

          // Update participant count in database
          const participantCount = roomParticipants.size;
          try {
            await supabase
              .from('rooms')
              .update({ participants: participantCount })
              .eq('id', roomId);
          } catch (error) {
            console.error('Error updating participant count on leave:', error);
          }

          // Clean up empty room
          if (roomParticipants.size === 0) {
            rooms.delete(roomId);
            console.log(`🧹 Room ${roomId} is now empty and cleaned up`);
          }
        }

        // Remove participant data if not in any other rooms
        const participant = participants.get(socket.id);
        if (participant && participant.roomId === roomId) {
          participants.delete(socket.id);
        }
      });

      // Handle disconnect
      socket.on('disconnect', async () => {
        console.log('🔌 User disconnected:', socket.id);

        // Remove from all rooms
        for (const [roomId, roomParticipants] of rooms.entries()) {
          if (roomParticipants.has(socket.id)) {
            roomParticipants.delete(socket.id);
            socket.to(roomId).emit('user-left', {
              userId: socket.id,
            });

            // Update participant count in database
            const participantCount = roomParticipants.size;
            try {
              await supabase
                .from('rooms')
                .update({ participants: participantCount })
                .eq('id', roomId);
            } catch (error) {
              console.error('Error updating participant count on disconnect:', error);
            }

            // If room is empty, clean it up
            if (roomParticipants.size === 0) {
              rooms.delete(roomId);
              console.log(`🧹 Room ${roomId} is now empty and cleaned up`);
            }
          }
        }

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