'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CollaborativeRooms from '@/components/CollaborativeRooms';

export default function MeetPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.roomId as string;
  
  const [userName, setUserName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch room details
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}`);
        const data = await response.json();
        
        if (data.room) {
          setRoom(data.room);
        } else {
          alert('Room not found');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching room:', error);
        alert('Failed to load room');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoom();
    }
  }, [roomId, router]);

  // Get or generate user info
  useEffect(() => {
    const storedUser = localStorage.getItem('meetUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.name);
      setHasJoined(false);
    }
  }, []);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }

    // Store user info
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const userData = {
      id: userId,
      name: userName.trim(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName.trim())}&background=random`
    };
    
    localStorage.setItem('meetUser', JSON.stringify(userData));
    setIsJoining(true);
    
    // Small delay for UX
    setTimeout(() => {
      setHasJoined(true);
      setIsJoining(false);
    }, 500);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '24px'
      }}>
        Loading meeting...
      </div>
    );
  }

  if (!room) {
    return null;
  }

  if (!hasJoined) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          maxWidth: '500px',
          width: '90%'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '10px'
            }}>
              Join Meeting
            </h1>
            <p style={{ color: '#666', fontSize: '16px' }}>
              {room.name}
            </p>
            <p style={{ color: '#999', fontSize: '14px', marginTop: '5px' }}>
              Topic: {room.topic}
            </p>
            <p style={{ color: '#999', fontSize: '14px' }}>
              Host: {room.host}
            </p>
          </div>

          <form onSubmit={handleJoinRoom}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#333',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.3s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isJoining || !userName.trim()}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isJoining || !userName.trim() ? 'not-allowed' : 'pointer',
                opacity: isJoining || !userName.trim() ? '0.6' : '1',
                transition: 'transform 0.2s, opacity 0.2s',
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e) => {
                if (!isJoining && userName.trim()) {
                  (e.target as HTMLElement).style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              {isJoining ? 'Joining...' : '🎥 Join Meeting'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '12px',
                background: 'transparent',
                color: '#667eea',
                border: '2px solid #667eea',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = '#667eea';
                (e.target as HTMLElement).style.color = 'white';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = 'transparent';
                (e.target as HTMLElement).style.color = '#667eea';
              }}
            >
              Back to Dashboard
            </button>
          </form>

          <div style={{
            marginTop: '30px',
            padding: '16px',
            background: '#f5f5f5',
            borderRadius: '10px',
            fontSize: '13px',
            color: '#666'
          }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
              Before joining:
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Make sure your camera and microphone are working</li>
              <li>Check your internet connection</li>
              <li>Close unnecessary apps for better performance</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Get user data from localStorage
  const storedUser = localStorage.getItem('meetUser');
  const currentUser = storedUser ? JSON.parse(storedUser) : {
    id: `user-${Date.now()}`,
    name: 'Guest',
    avatar: 'https://ui-avatars.com/api/?name=Guest&background=random'
  };

  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      <CollaborativeRooms
        currentUser={currentUser}
        onJoinRoom={(roomId) => {
          console.log('Joined room:', roomId);
        }}
      />
    </div>
  );
}
