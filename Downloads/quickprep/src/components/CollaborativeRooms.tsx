'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';

interface StudyRoom {
  id: string;
  name: string;
  topic: string;
  participants: number;
  maxParticipants: number;
  isPrivate: boolean;
  host: string;
  createdAt: Date;
  meetingId?: string;
}

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isMuted: boolean;
  isSharing: boolean;
}

interface ChatMessage {
  id: number;
  userId: string;
  userData: {
    name: string;
    avatar: string;
  };
  message: string;
  timestamp: Date;
}

interface CollaborativeRoomsProps {
  currentUser: {
    id: string;
    name: string;
    avatar: string;
  };
  onJoinRoom?: (roomId: string) => void;
}

const CollaborativeRooms: React.FC<CollaborativeRoomsProps> = ({
  currentUser,
  onJoinRoom
}) => {
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<StudyRoom | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isInRoom, setIsInRoom] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'spotlight'>('grid');
  const [reactions, setReactions] = useState<Array<{userId: string, reaction: string, timestamp: number}>>([]);
  const [handRaised, setHandRaised] = useState(false);
  const [meetingId, setMeetingId] = useState('');
  // Form state for creating rooms
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomTopic, setNewRoomTopic] = useState('');
  const [newRoomMaxParticipants, setNewRoomMaxParticipants] = useState(10);
  const [newRoomIsPrivate, setNewRoomIsPrivate] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStream = useRef<MediaStream | null>(null);

  // Fetch rooms from database
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('/api/rooms');
        const data = await response.json();
        if (data.rooms) {
          setRooms(data.rooms.map((room: any) => ({
            id: room.id,
            name: room.name,
            topic: room.topic,
            participants: room.participants || 0,
            maxParticipants: room.max_participants,
            isPrivate: room.is_private,
            host: room.host,
            createdAt: new Date(room.created_at),
            meetingId: room.meeting_id
          })));
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    fetchRooms();
    // Refresh rooms every 10 seconds
    const interval = setInterval(fetchRooms, 10000);
    return () => clearInterval(interval);
  }, []);

  // Initialize socket connection
  useEffect(() => {
    console.log('🔌 CollaborativeRooms component mounted');
    console.log('🔌 Creating socket connection...');
    const socketUrl = process.env.NODE_ENV === 'production' 
      ? (typeof window !== 'undefined' ? window.location.origin : '')
      : 'http://localhost:3000';
    console.log('🔌 Connecting to:', socketUrl);
    const socketConnection = io(socketUrl, {
      path: '/api/socketio',
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketConnection.on('connect', () => {
      console.log('🔌 Connected to socket server with ID:', socketConnection.id);
      setIsConnected(true);
      setSocket(socketConnection);
    });

    socketConnection.on('disconnect', () => {
      console.log('🔌 Disconnected from socket server');
      setIsConnected(false);
    });

    // Handle WebRTC signaling
    socketConnection.on('offer', async ({ from, offer }) => {
      console.log('Received offer from:', from);
      let peerConnection = peerConnections.current.get(from);

      if (!peerConnection) {
        peerConnection = await createPeerConnection(from);
      }

      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socketConnection.emit('answer', { to: from, answer });
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    });

    socketConnection.on('answer', async ({ from, answer }) => {
      console.log('Received answer from:', from);
      const peerConnection = peerConnections.current.get(from);
      if (peerConnection) {
        try {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (error) {
          console.error('Error setting remote description:', error);
        }
      }
    });

    socketConnection.on('ice-candidate', async ({ from, candidate }) => {
      const peerConnection = peerConnections.current.get(from);
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    // Handle room events
    socketConnection.on('user-joined', async ({ userId, userData }) => {
      console.log('User joined:', userId, userData);
      // Add to participants list
      setParticipants(prev => [...prev, {
        id: userId,
        name: userData.name,
        avatar: userData.avatar,
        isHost: userData.isHost,
        isMuted: userData.isMuted,
        isSharing: userData.isSharing
      }]);
      // Create peer connection for new user
      if (currentRoom && userId !== socketConnection.id) {
        await createPeerConnection(userId);
      }
    });

    socketConnection.on('user-left', ({ userId }) => {
      console.log('User left:', userId);
      // Remove from participants list
      setParticipants(prev => prev.filter(p => p.id !== userId));
      // Close peer connection
      const peerConnection = peerConnections.current.get(userId);
      if (peerConnection) {
        peerConnection.close();
        peerConnections.current.delete(userId);
      }
      const videoElement = remoteVideoRefs.current.get(userId);
      if (videoElement) {
        videoElement.remove();
        remoteVideoRefs.current.delete(userId);
      }
    });

    socketConnection.on('room-participants', async (participants: any[]) => {
      console.log('Room participants:', participants);
      // Update participants state for UI
      setParticipants(participants.map((p: any) => ({
        id: p.socketId,
        name: p.name,
        avatar: p.avatar,
        isHost: p.isHost,
        isMuted: p.isMuted,
        isSharing: p.isSharing
      })));
      // Create peer connections for existing participants
      for (const participant of participants) {
        if (participant.socketId !== socketConnection.id) {
          await createPeerConnection(participant.socketId);
        }
      }
    });

    socketConnection.on('new-message', (message) => {
      setChatMessages(prev => [...prev, message]);
    });

    socketConnection.on('new-reaction', (reaction) => {
      setReactions(prev => [...prev, { ...reaction, timestamp: Date.now() }]);
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.timestamp !== reaction.timestamp));
      }, 3000);
    });

    socketConnection.on('participant-updated', ({ userId, updates }) => {
      setParticipants(prev =>
        prev.map(p => p.id === userId ? { ...p, ...updates } : p)
      );
    });

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  // Auto-join room from URL parameter or path
  useEffect(() => {
    if (typeof window !== 'undefined' && rooms.length > 0 && !isInRoom) {
      // Check query parameter first (legacy support)
      const params = new URLSearchParams(window.location.search);
      let roomId = params.get('room');
      
      // Check URL path (/meet/[roomId])
      if (!roomId) {
        const pathMatch = window.location.pathname.match(/\/meet\/([^/]+)/);
        if (pathMatch) {
          roomId = pathMatch[1];
        }
      }
      
      if (roomId) {
        const room = rooms.find(r => r.id === roomId);
        if (room) {
          console.log('🎯 Auto-joining room from URL:', roomId);
          joinRoom(room);
        } else {
          console.warn('⚠️ Room not found:', roomId);
        }
      }
    }
  }, [rooms, isInRoom]);

  // Create WebRTC peer connection
  const createPeerConnection = async (userId: string) => {
    console.log('🔗 Creating peer connection for user:', userId);
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
      ],
    });

    peerConnections.current.set(userId, peerConnection);

    // Add local stream tracks
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => {
        console.log('➕ Adding track to peer connection:', track.kind);
        peerConnection.addTrack(track, localStream.current!);
      });
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('📹 Received remote track:', event.track.kind, 'from:', userId);
      const remoteStream = event.streams[0];
      let videoElement = remoteVideoRefs.current.get(userId);

      if (!videoElement) {
        videoElement = document.createElement('video');
        videoElement.autoplay = true;
        videoElement.playsInline = true;
        videoElement.className = 'remote-video';
        videoElement.id = `video-${userId}`;
        remoteVideoRefs.current.set(userId, videoElement);
        console.log('✅ Created video element for user:', userId);
      }

      videoElement.srcObject = remoteStream;
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket) {
        console.log('🧊 Sending ICE candidate to:', userId);
        socket.emit('ice-candidate', { to: userId, candidate: event.candidate });
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state for', userId, ':', peerConnection.connectionState);
      if (peerConnection.connectionState === 'failed') {
        console.log('❌ Connection failed, attempting to restart ICE');
        peerConnection.restartIce();
      }
    };

    // Create and send offer if we're the initiator (lower socket ID initiates)
    if (socket && socket.id && socket.id < userId) {
      console.log('📤 Initiating offer to:', userId);
      try {
        const offer = await peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        await peerConnection.setLocalDescription(offer);
        socket.emit('offer', { to: userId, offer });
      } catch (error) {
        console.error('Error creating offer:', error);
      }
    }

    return peerConnection;
  };

  // Join room
  const joinRoom = async (room: StudyRoom) => {
    try {
      console.log('🎥 Joining room:', room.id);
      console.log('🎥 Requesting camera/microphone access...');
      
      // Get user media with current settings
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      console.log('✅ Got media stream:', stream.id);
      console.log('📹 Video tracks:', stream.getVideoTracks().length);
      console.log('🎤 Audio tracks:', stream.getAudioTracks().length);

      localStream.current = stream;

      // Apply initial mute/video settings
      stream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
      stream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOn;
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        console.log('✅ Local video element updated');
      }

      setCurrentRoom(room);
      setIsInRoom(true);
      setMeetingId(room.meetingId || '');

      // Join room via socket
      if (socket) {
        console.log('🔌 Emitting join-room event');
        socket.emit('join-room', {
          roomId: room.id,
          userData: {
            id: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar,
            isHost: false,
            isMuted,
            isSharing: isScreenSharing
          }
        });
      } else {
        console.warn('⚠️ Socket not connected');
      }

      onJoinRoom?.(room.id);
      console.log('✅ Successfully joined room');
    } catch (error) {
      console.error('❌ Failed to join room:', error);
      alert('Failed to access camera/microphone. Please check permissions and try again.');
    }
  };

  // Create room
  const createRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newRoomName.trim() || !newRoomTopic.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Create room in database
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRoomName,
          topic: newRoomTopic,
          maxParticipants: newRoomMaxParticipants,
          isPrivate: newRoomIsPrivate,
          host: currentUser.name,
          hostId: currentUser.id
        })
      });

      const data = await response.json();
      if (data.room) {
        const newRoom: StudyRoom = {
          id: data.room.id,
          name: data.room.name,
          topic: data.room.topic,
          participants: 0,
          maxParticipants: data.room.max_participants,
          isPrivate: data.room.is_private,
          host: data.room.host,
          createdAt: new Date(data.room.created_at),
          meetingId: data.room.meeting_id
        };

        setRooms(prev => [newRoom, ...prev]);
        setShowCreateRoom(false);
        
        // Reset form
        setNewRoomName('');
        setNewRoomTopic('');
        setNewRoomMaxParticipants(10);
        setNewRoomIsPrivate(false);

        // Emit room creation to socket server
        if (socket) {
          socket.emit('create-room', {
            roomId: newRoom.id,
            roomData: newRoom
          });
        }

        // Auto-join the created room
        joinRoom(newRoom);
      }
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room. Please try again.');
    }
  };

  // Leave room
  const leaveRoom = () => {
    // Emit leave room event
    if (socket && currentRoom) {
      socket.emit('leave-room', { roomId: currentRoom.id });
    }

    // Stop media tracks
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }

    // Close all peer connections
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();
    remoteVideoRefs.current.clear();

    // Reset state
    setIsInRoom(false);
    setCurrentRoom(null);
    setParticipants([]);
    setChatMessages([]);
    setReactions([]);
    setIsScreenSharing(false);
    setHandRaised(false);
    setShowChat(false);
    setShowParticipants(false);
  };

  // Toggle mute
  const toggleMute = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted; // Toggle the enabled state
        setIsMuted(!isMuted);
        
        // Notify other participants
        if (socket && currentRoom) {
          socket.emit('update-participant', {
            roomId: currentRoom.id,
            updates: { isMuted: !isMuted }
          });
        }
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn; // Toggle the enabled state
        setIsVideoOn(!isVideoOn);
        
        // Notify other participants
        if (socket && currentRoom) {
          socket.emit('update-participant', {
            roomId: currentRoom.id,
            updates: { isVideoOn: !isVideoOn }
          });
        }
      }
    }
  };

  // Start screen sharing
  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always'
        } as any,
        audio: true,
      });

      const screenTrack = screenStream.getVideoTracks()[0];

      // Replace video track in local stream and update all peer connections
      if (localStream.current) {
        const videoTrack = localStream.current.getVideoTracks()[0];
        
        // Update local video element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        // Replace track in all peer connections
        peerConnections.current.forEach((pc) => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack).catch(err => {
              console.error('Error replacing track for screen share:', err);
            });
          }
        });
      }

      setIsScreenSharing(true);

      // Handle when user stops sharing via browser UI
      screenTrack.onended = () => {
        stopScreenShare();
      };
    } catch (error) {
      console.error('Error starting screen share:', error);
      alert('Failed to start screen sharing. Please make sure you granted permissions.');
    }
  };

  // Stop screen sharing
  const stopScreenShare = async () => {
    try {
      // Get camera stream again
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      const cameraTrack = cameraStream.getVideoTracks()[0];

      // Update local video element
      if (localVideoRef.current && localStream.current) {
        localVideoRef.current.srcObject = localStream.current;
      }

      // Replace track back to camera in all peer connections
      peerConnections.current.forEach((pc) => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(cameraTrack).catch(err => {
            console.error('Error replacing track back to camera:', err);
          });
        }
      });

      setIsScreenSharing(false);
    } catch (error) {
      console.error('Error stopping screen share:', error);
    }
  };

  // Send chat message
  const sendMessage = () => {
    if (chatInput.trim() && currentRoom && socket) {
      const message: ChatMessage = {
        id: Date.now(),
        userId: socket.id || currentUser.id,
        userData: currentUser,
        message: chatInput,
        timestamp: new Date(),
      };
      // Emit to all participants (including self via server broadcast)
      socket.emit('send-message', { roomId: currentRoom.id, message });
      setChatInput('');
    }
  };

  // Send reaction
  const sendReaction = (reaction: string) => {
    if (currentRoom && socket) {
      socket.emit('send-reaction', { roomId: currentRoom.id, reaction });
    }
  };

  // WebRTC configuration
  const rtcConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  // Update local media stream when settings change
  useEffect(() => {
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
      localStream.current.getVideoTracks().forEach(track => {
        track.enabled = isVideoOn;
      });
    }

    // Update participant status and emit to socket
    if (socket && currentRoom) {
      socket.emit('update-participant', {
        roomId: currentRoom.id,
        updates: { isMuted, isSharing: isScreenSharing }
      });
    }
  }, [isMuted, isVideoOn, socket, currentRoom]);

  return (
    <motion.div
      className="collaborative-rooms"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="rooms-header">
        <h2>🎓 Study Rooms</h2>
        <p>Join live study sessions with other students</p>
        <div className="header-actions">
          <button
            onClick={() => setShowCreateRoom(true)}
            className="create-room-btn"
          >
            ➕ Create Room
          </button>
        </div>
      </div>

      {/* Join Room Section */}
      <div className="join-room-section">
        <h3>Join a Meeting</h3>
        <div className="join-room-input-container">
          <input
            type="text"
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value)}
            placeholder="Paste meeting link or enter room ID (e.g., room-1)"
            className="join-room-input"
          />
          <button
            onClick={() => {
              let roomId = joinRoomId.trim();
              // Extract room ID from URL if full link is pasted
              if (roomId.includes('?room=')) {
                const urlParams = new URLSearchParams(roomId.split('?')[1]);
                roomId = urlParams.get('room') || '';
              }
              const room = rooms.find(r => r.id === roomId);
              if (room) {
                joinRoom(room);
                setJoinRoomId('');
              } else {
                alert('Room not found! Please check the room ID or link.');
              }
            }}
            className="join-room-submit-btn"
            disabled={!joinRoomId.trim()}
          >
            🚪 Join Meeting
          </button>
        </div>
      </div>

      <div className="rooms-grid">
        {rooms.map((room) => (
          <motion.div
            key={room.id}
            className="room-card"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="room-header">
              <h3>{room.name}</h3>
              <div className="room-status">
                <span className="participants">
                  👥 {room.participants}/{room.maxParticipants}
                </span>
                {room.isPrivate && <span className="private">🔒</span>}
              </div>
            </div>

            <div className="room-topic">
              {room.topic}
            </div>

            <div className="room-footer">
              <div className="host-info">
                Host: {room.host}
              </div>
              <div className="room-time">
                {room.createdAt.toLocaleTimeString()}
              </div>
              <button
                onClick={() => joinRoom(room)}
                className="join-btn"
                disabled={room.participants >= room.maxParticipants}
              >
                {room.participants >= room.maxParticipants ? 'Full' : 'Join'}
              </button>
              <button
                onClick={() => joinRoom(room)}
                className="join-video-btn"
                title="Join with Video"
              >
                📹 Start Video Meeting
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Meeting Interface */}
      <AnimatePresence>
        {isInRoom && currentRoom && (
          <motion.div
            className="meeting-interface"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className="meeting-header">
              <div className="meeting-info">
                <h3>{currentRoom.name}</h3>
                <p>{currentRoom.topic}</p>
                <div className="meeting-link-container">
                  <span className="meeting-id">
                    Meeting Link: {process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/meet/{currentRoom.id}
                  </span>
                  <button
                    onClick={() => {
                      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
                      const roomUrl = `${baseUrl}/meet/${currentRoom.id}`;
                      navigator.clipboard.writeText(roomUrl);
                      alert('Meeting link copied to clipboard!');
                    }}
                    className="copy-link-btn"
                    title="Copy Link"
                  >
                    📋
                  </button>
                </div>
              </div>
              <div className="meeting-controls">
                <button
                  onClick={() => {
                    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
                    const roomUrl = `${baseUrl}/meet/${currentRoom.id}`;
                    navigator.clipboard.writeText(roomUrl);
                    alert('Meeting link copied to clipboard!');
                  }}
                  className="share-link-btn"
                  title="Copy Meeting Link"
                >
                  🔗 Share Link
                </button>
                <button
                  onClick={toggleMute}
                  className={`control-btn ${isMuted ? 'muted' : ''}`}
                >
                  {isMuted ? '🔇' : '🎤'}
                </button>
                <button
                  onClick={toggleVideo}
                  className={`control-btn ${!isVideoOn ? 'off' : ''}`}
                >
                  {!isVideoOn ? '📷' : '📹'}
                </button>
                <button
                  onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                  className={`control-btn ${isScreenSharing ? 'active' : ''}`}
                >
                  🖥️
                </button>
                <button
                  onClick={() => setShowChat(!showChat)}
                  className={`control-btn ${showChat ? 'active' : ''}`}
                >
                  💬
                </button>
                <button
                  onClick={() => setShowParticipants(!showParticipants)}
                  className="control-btn"
                >
                  👥
                </button>
                <button onClick={leaveRoom} className="leave-btn">
                  🚪 Leave
                </button>
              </div>
            </div>

            <div className="meeting-content">
              <div className="video-area">
                <div className="video-grid">
                  {/* Local Video */}
                  <div className="video-container local">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="local-video"
                    />
                    <div className="video-label">
                      You {isMuted && '(Muted)'} {!isVideoOn && '(Video Off)'}
                    </div>
                  </div>

                  {/* Remote Videos Container */}
                  <div className="remote-videos" ref={(el) => {
                    if (el) {
                      // Clear existing videos
                      el.innerHTML = '';
                      // Add remote video elements
                      remoteVideoRefs.current.forEach((videoElement, userId) => {
                        const container = document.createElement('div');
                        container.className = 'video-container remote';
                        container.appendChild(videoElement);
                        const participant = participants.find(p => p.id === userId);
                        const label = document.createElement('div');
                        label.className = 'video-label';
                        label.textContent = participant ? participant.name : `User ${userId.slice(-4)}`;
                        container.appendChild(label);
                        el.appendChild(container);
                      });
                    }
                  }}>
                  </div>
                </div>
              </div>

              {/* Chat Panel */}
              <AnimatePresence>
                {showChat && (
                  <motion.div
                    className="chat-panel"
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 300, opacity: 0 }}
                  >
                    <div className="chat-header">
                      <h4>Chat</h4>
                      <button onClick={() => setShowChat(false)}>✕</button>
                    </div>
                    <div className="chat-messages">
                      {chatMessages.map((msg) => (
                        <div key={msg.id} className="chat-message">
                          <strong>{msg.userData.name}:</strong> {msg.message}
                        </div>
                      ))}
                    </div>
                    <div className="chat-input">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                      />
                      <button onClick={sendMessage}>Send</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Participants Panel */}
              <AnimatePresence>
                {showParticipants && (
                  <motion.div
                    className="participants-panel"
                    initial={{ x: -300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                  >
                    <div className="participants-header">
                      <h4>Participants ({participants.length})</h4>
                      <button onClick={() => setShowParticipants(false)}>✕</button>
                    </div>
                    <div className="participants-list">
                      {participants.map((participant) => (
                        <div key={participant.id} className="participant-item">
                          <img src={participant.avatar} alt={participant.name} />
                          <div className="participant-info">
                            <span>{participant.name}</span>
                            {participant.isHost && <span className="host-badge">Host</span>}
                            {participant.isMuted && <span className="muted-badge">🔇</span>}
                            {participant.isSharing && <span className="sharing-badge">🖥️</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Reactions */}
            <div className="reactions-container">
              {reactions.map((reaction, index) => (
                <motion.div
                  key={`${reaction.timestamp}-${index}`}
                  className="reaction"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -50, opacity: 0 }}
                >
                  {reaction.reaction}
                </motion.div>
              ))}
            </div>

            {/* Reaction Buttons */}
            <div className="reaction-buttons">
              {['👍', '👎', '❤️', '😂', '😮', '🤔'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => sendReaction(emoji)}
                  className="reaction-btn"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreateRoom && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateRoom(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Create Study Room</h3>
              <form onSubmit={createRoom}>
                <input
                  type="text"
                  placeholder="Room Name"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Topic"
                  value={newRoomTopic}
                  onChange={(e) => setNewRoomTopic(e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Max Participants"
                  value={newRoomMaxParticipants}
                  onChange={(e) => setNewRoomMaxParticipants(Number(e.target.value))}
                  min="2"
                  max="20"
                  required
                />
                <select
                  value={newRoomIsPrivate ? 'private' : 'public'}
                  onChange={(e) => setNewRoomIsPrivate(e.target.value === 'private')}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowCreateRoom(false)}>
                    Cancel
                  </button>
                  <button type="submit">Create Room</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .collaborative-rooms {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .rooms-header {
          text-align: center;
          margin-bottom: 20px;
        }

        .header-actions {
          margin-top: 15px;
        }

        .create-room-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .create-room-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
        }

        .join-room-section {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
          border: 2px solid rgba(99, 102, 241, 0.3);
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 30px;
        }

        .join-room-section h3 {
          margin: 0 0 16px 0;
          color: #6366f1;
          font-size: 20px;
        }

        .join-room-input-container {
          display: flex;
          gap: 12px;
        }

        .join-room-input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid rgba(99, 102, 241, 0.3);
          border-radius: 8px;
          font-size: 14px;
          background: white;
          transition: all 0.3s ease;
        }

        .join-room-input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .join-room-submit-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .join-room-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
        }

        .join-room-submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .join-video-btn {
          padding: 8px 12px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 6px;
          color: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-left: 8px;
          white-space: nowrap;
        }

        .join-video-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }

        .share-link-btn {
          padding: 10px 20px;
          background: linear-gradient(135deg, #10b981, #059669);
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-right: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .share-link-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
        }

        .meeting-link-container {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          padding: 8px 12px;
          background: rgba(99, 102, 241, 0.1);
          border-radius: 6px;
          border: 1px solid rgba(99, 102, 241, 0.2);
        }

        .meeting-id {
          font-size: 12px;
          color: #6366f1;
          font-family: monospace;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .copy-link-btn {
          padding: 4px 8px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 4px;
          color: white;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .copy-link-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
        }

        .room-footer {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
      `}</style>
    </motion.div>
  );
};

export default CollaborativeRooms;
