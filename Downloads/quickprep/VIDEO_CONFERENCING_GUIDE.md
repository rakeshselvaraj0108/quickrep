# Video Conferencing Feature Guide

## Overview
Your QuickPrep app now has a built-in video conferencing system! Users can create and join study rooms with live video/audio without leaving your website.

## Key Features

### ✨ What's New
- **In-App Video Meetings**: No more redirects to external Google Meet
- **WebRTC Technology**: Peer-to-peer video/audio connections
- **Shareable Links**: Generate and copy meeting links instantly
- **Real-time Chat**: Chat while in video meetings
- **Screen Sharing**: Share your screen with participants
- **Video Controls**: Mute/unmute, turn video on/off
- **Auto-join**: Join rooms directly via URL

### 🎥 How It Works

#### Creating a Meeting
1. Go to Dashboard → Collaborative Rooms section
2. Click "Create Study Room"
3. Fill in room details:
   - Room Name
   - Topic
   - Max Participants
   - Privacy (Public/Private)
4. Click "Create Room"
5. You'll automatically join the room with video

#### Joining a Meeting
1. **From Room List**: Click "Start Video Meeting" on any available room
2. **From Link**: Share the meeting link (e.g., `http://localhost:3000?room=room-1`)
3. Allow camera/microphone permissions when prompted
4. You'll join the video call instantly!

#### Sharing Meeting Links
1. Once in a meeting, look for the meeting link display
2. Click the 📋 copy button
3. Share the link with anyone you want to join
4. They can paste it in their browser and join instantly

#### During the Meeting
- **Toggle Mute** 🎤: Click to mute/unmute your microphone
- **Toggle Video** 📹: Click to turn your camera on/off
- **Screen Share** 🖥️: Share your screen with others
- **Chat** 💬: Open the chat panel to send messages
- **Participants** 👥: View all participants in the room
- **Leave** 🚪: Exit the meeting

## Technical Details

### Architecture
```
┌─────────────┐         ┌─────────────┐
│   Client A  │◄────────┤   Client B  │
│  (Browser)  │  WebRTC │  (Browser)  │
└──────┬──────┘         └──────┬──────┘
       │                       │
       │    Socket.io          │
       │    (Signaling)        │
       │                       │
       └───────┬───────────────┘
               │
        ┌──────▼──────┐
        │   Server    │
        │ (Node.js +  │
        │  Socket.io) │
        └─────────────┘
```

### Technology Stack
- **WebRTC**: For peer-to-peer video/audio connections
- **Socket.io**: For signaling and real-time communication
- **React**: For the UI components
- **Next.js**: For the server-side rendering

### Key Components

#### Server (server.ts)
- Socket.io connection handling
- WebRTC signaling (offer, answer, ICE candidates)
- Room management (join, leave, participants)
- Chat and reactions broadcasting

#### Client (CollaborativeRooms.tsx)
- Media stream handling (getUserMedia)
- Peer connection management (RTCPeerConnection)
- Video display (local and remote streams)
- UI controls (mute, video, screen share)

### WebRTC Flow
1. **User joins room**: Request camera/microphone access
2. **Create peer connection**: Establish RTCPeerConnection with STUN servers
3. **Send offer**: Create and send SDP offer to other participants
4. **Receive answer**: Get SDP answer from other participants
5. **Exchange ICE candidates**: Share network information
6. **Stream established**: Video/audio flowing between peers

## Troubleshooting

### Camera/Microphone Not Working
- Check browser permissions (camera/microphone must be allowed)
- Ensure no other app is using the camera
- Try refreshing the page
- Check browser console for errors

### Video Not Showing
- Make sure your camera is enabled
- Check if video is turned on (not off)
- Try leaving and rejoining the room
- Clear browser cache and reload

### Can't Join Room
- Ensure you're using a supported browser (Chrome, Firefox, Edge)
- Check your internet connection
- Make sure the room hasn't reached max participants
- Try creating a new room

### Poor Video Quality
- Check your internet connection speed
- Reduce the number of participants
- Ask participants to turn off their video if not needed
- Close other bandwidth-heavy applications

## Browser Compatibility
✅ Chrome/Edge (Recommended)
✅ Firefox
✅ Safari (macOS/iOS)
❌ Internet Explorer (not supported)

## Security Notes
- All video/audio is encrypted via WebRTC DTLS/SRTP
- Connections are peer-to-peer (direct between users)
- The server only handles signaling, not media
- Meeting links are shareable but not password-protected
- Use private rooms for sensitive discussions

## Future Enhancements
- 🎯 Recording meetings
- 🎯 Virtual backgrounds
- 🎯 Breakout rooms
- 🎯 Hand raise notifications
- 🎯 Waiting room
- 🎯 Password-protected rooms

## Support
If you encounter any issues:
1. Check browser console for errors
2. Verify camera/microphone permissions
3. Test with a different browser
4. Ensure you're on a stable internet connection

---

**Enjoy your new video conferencing feature! 🎉**
