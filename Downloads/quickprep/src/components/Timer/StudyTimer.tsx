'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function StudyTimer() {
  const [time, setTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && time > 0) {
      interval = setInterval(() => setTime(t => t - 1), 1000);
    } else if (time === 0 && isActive) {
      // Timer finished
      if (!isBreak) {
        setSessions(prev => prev + 1);
        setIsBreak(true);
        setTime(5 * 60); // 5 min break
        playNotification();
      } else {
        setIsBreak(false);
        setTime(selectedDuration * 60); // Back to study
      }
    }
    return () => clearInterval(interval);
  }, [isActive, time, isBreak, selectedDuration]);

  const playNotification = () => {
    if (typeof window !== 'undefined' && 'Audio' in window) {
      const audio = new Audio('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==');
      audio.play().catch(() => {});
    }
  };

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const percentage = ((selectedDuration * 60 - time) / (selectedDuration * 60)) * 100;

  const handleReset = () => {
    setIsActive(false);
    setTime(selectedDuration * 60);
    setIsBreak(false);
  };

  return (
    <motion.div 
      className="timer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="timer-content">
        <div className="timer-header">
          <h3>🎯 Pomodoro Timer</h3>
          <span className="session-badge">Session {sessions + 1}</span>
        </div>

        <div className="timer-circle">
          <svg className="progress-ring" width="200" height="200">
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="rgba(139, 92, 246, 0.2)"
              strokeWidth="8"
            />
            <motion.circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 90}
              strokeDashoffset={2 * Math.PI * 90 * (1 - percentage / 100)}
              strokeLinecap="round"
              initial={{ strokeDashoffset: 2 * Math.PI * 90 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 90 * (1 - percentage / 100) }}
              transition={{ duration: 1 }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <motion.div 
            className="timer-display"
            key={isBreak ? 'break' : 'study'}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <span className="timer-time">{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
            <span className="timer-label">{isBreak ? 'Break Time' : 'Study Time'}</span>
          </motion.div>
        </div>

        <div className="timer-controls">
          <motion.button 
            className="timer-btn primary"
            onClick={() => setIsActive(!isActive)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isActive ? '⏸️ Pause' : '▶️ Start'}
          </motion.button>
          <motion.button 
            className="timer-btn secondary"
            onClick={handleReset}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔄 Reset
          </motion.button>
        </div>

        <div className="timer-durations">
          {[15, 25, 45, 60].map(duration => (
            <motion.button
              key={duration}
              className={`duration-btn ${selectedDuration === duration ? 'active' : ''}`}
              onClick={() => {
                setSelectedDuration(duration);
                setTime(duration * 60);
                setIsActive(false);
                setIsBreak(false);
              }}
              whileHover={{ scale: 1.05 }}
            >
              {duration}m
            </motion.button>
          ))}
        </div>

        <div className="timer-stats">
          <div className="stat">
            <span className="stat-icon">✅</span>
            <span className="stat-text">Sessions: {sessions}</span>
          </div>
          <div className="stat">
            <span className="stat-icon">⏱️</span>
            <span className="stat-text">Total: {Math.floor((sessions * selectedDuration) / 60)}h {(sessions * selectedDuration) % 60}m</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
