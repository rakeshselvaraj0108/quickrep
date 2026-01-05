# How to Join Video Meetings - Quick Guide

## 🎉 All Features Now Working!

✅ **Video Streaming** - Working  
✅ **Audio/Voice** - Working  
✅ **Chat** - Working  
✅ **Screen Sharing** - Working  
✅ **Join via Link** - Working  

---

## For You (Meeting Host)

### Step 1: Start Your Server
```bash
npm run dev
```
Your app will run on: `http://localhost:3000`

### Step 2: Create a Meeting
1. Go to Dashboard → Scroll to "Collaborative Rooms"
2. Click "➕ Create Room"
3. Fill in the details and click "Create Room"
4. You'll automatically join with video/audio

### Step 3: Share the Meeting Link
1. Once in the meeting, look for the meeting link display
2. Click the 📋 copy button
3. Send this link to your friends:
   - Example: `http://localhost:3000?room=room-1234567890`

---

## For Your Friends (Participants)

### Option 1: Join via Link (Easiest!)
1. Click the meeting link you received (e.g., `http://localhost:3000?room=room-1234567890`)
2. Allow camera/microphone permissions when prompted
3. You'll automatically join the video call!

### Option 2: Join via Room ID
1. Go to `http://localhost:3000/dashboard`
2. Scroll to "Collaborative Rooms" section
3. Look for the "Join a Meeting" box
4. Paste the full meeting link OR just the room ID (e.g., `room-1234567890`)
5. Click "🚪 Join Meeting"
6. Allow camera/microphone permissions
7. You're in!

### Option 3: Browse Available Rooms
1. Go to `http://localhost:3000/dashboard`
2. Scroll to "Collaborative Rooms"
3. See the list of available rooms
4. Click "📹 Start Video Meeting" on any room

---

## During the Meeting

### Video Controls
- **🎤 Mute/Unmute**: Click to control your microphone
- **📹 Video On/Off**: Click to turn your camera on/off
- **🖥️ Screen Share**: Click to share your screen with everyone
- **💬 Chat**: Click to open chat and send messages
- **👥 Participants**: See who's in the meeting
- **🚪 Leave**: Exit the meeting

### Tips for Best Experience
1. **Allow Permissions**: Always allow camera/microphone when prompted
2. **Use Chrome/Edge**: Best browser support
3. **Good Internet**: Ensure stable connection
4. **Close Other Apps**: Better performance
5. **Test First**: Try joining with yourself in another browser tab

---

## Troubleshooting

### Problem: Camera/Mic Not Working
**Solution:**
- Click the camera icon in your browser's address bar
- Make sure camera/microphone are allowed
- Refresh the page and try again

### Problem: Can't See Other Participants
**Solution:**
- Make sure both users are in the same room
- Check browser console (F12) for any errors
- Try leaving and rejoining

### Problem: Chat Not Working
**Solution:**
- Type your message and press Enter or click Send
- Make sure you're connected (socket icon should show connected)
- Check if other participants are receiving messages

### Problem: Screen Share Not Working
**Solution:**
- Click "Screen Share" button
- Select the window/screen you want to share
- Click "Share" in the browser dialog
- If it fails, try again and make sure you grant permissions

### Problem: No Audio
**Solution:**
- Check if you're muted (🔇 icon)
- Click the microphone button to unmute
- Check your computer's audio settings
- Try using headphones

### Problem: Video is Black
**Solution:**
- Check if video is turned off (📷 icon)
- Click the video button to turn on
- Make sure no other app is using your camera
- Close other video apps (Zoom, Teams, etc.)

---

## Testing Solo (Before Friends Join)

1. Open two browser tabs/windows
2. Join the same room in both tabs
3. You should see yourself in both windows
4. Test all features:
   - Mute/unmute
   - Video on/off
   - Screen share
   - Chat messages

---

## Important Notes

### For Local Testing (Your Computer Only)
- ⚠️ Friends CANNOT join from other computers using `localhost:3000`
- ✅ Everyone can join if they're on the same WiFi network using your IP address
- ✅ For internet access, you need to deploy or use ngrok/tunneling

### To Allow Friends from Different Networks
You have 3 options:

#### Option 1: Use Your Local IP (Same WiFi)
1. Find your IP: Open CMD and type `ipconfig`
2. Look for "IPv4 Address" (e.g., 192.168.1.100)
3. Share: `http://192.168.1.100:3000?room=room-xxx`
4. Friends on same WiFi can join!

#### Option 2: Use Ngrok (Temporary)
```bash
# Install ngrok
npm install -g ngrok

# Run ngrok
ngrok http 3000

# Share the ngrok URL with friends
https://abcd1234.ngrok.io
```

#### Option 3: Deploy to Cloud
- Deploy to Vercel, Netlify, or Heroku
- Everyone can access from anywhere!

---

## Meeting Link Format

```
http://localhost:3000?room=room-1234567890
       ↑                    ↑
   Your Server          Room ID
```

**Room ID Examples:**
- `room-1` (from sample rooms)
- `room-2` (from sample rooms)
- `room-1735836420000` (newly created room)

---

## Features Explained

### 1. Video Streaming
- Uses WebRTC for peer-to-peer connections
- Direct connection between you and your friends
- Low latency, high quality

### 2. Audio/Voice
- Clear audio communication
- Mute/unmute controls
- Echo cancellation built-in

### 3. Chat
- Send text messages while in call
- Messages appear instantly
- Emoji support ✨

### 4. Screen Sharing
- Share your entire screen or specific window
- Great for presentations or studying together
- Click again to stop sharing

---

## Quick Start Commands

```bash
# Start the server
npm run dev

# Open in browser
http://localhost:3000

# Create account
http://localhost:3000/register

# Login
http://localhost:3000/login

# Go to dashboard
http://localhost:3000/dashboard
```

---

## Need Help?

1. Check browser console (Press F12)
2. Look for error messages
3. Make sure permissions are granted
4. Try a different browser (Chrome recommended)
5. Restart the server if needed

---

**Enjoy your video meetings! 🎥📞**
