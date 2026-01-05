'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'study' | 'streak' | 'time' | 'social' | 'special';
}

interface GamificationProps {
  studyTime: number; // in minutes
  studyStreak: number;
  completedTasks: number;
  voiceInputs: number;
  filesUploaded: number;
  exportsGenerated: number;
  onAchievementUnlock?: (achievement: Achievement) => void;
}

const Gamification: React.FC<GamificationProps> = ({
  studyTime,
  studyStreak,
  completedTasks,
  voiceInputs,
  filesUploaded,
  exportsGenerated,
  onAchievementUnlock
}) => {
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [dailyChallenges, setDailyChallenges] = useState<any[]>([]);

  // Initialize achievements
  useEffect(() => {
    const initialAchievements: Achievement[] = [
      // Study Time Achievements
      {
        id: 'first-study',
        title: 'First Steps',
        description: 'Complete your first study session',
        icon: '🎓',
        unlocked: studyTime > 0,
        progress: Math.min(studyTime, 1),
        maxProgress: 1,
        rarity: 'common',
        category: 'study'
      },
      {
        id: 'study-warrior',
        title: 'Study Warrior',
        description: 'Study for 10 hours total',
        icon: '⚔️',
        unlocked: studyTime >= 600,
        progress: Math.min(studyTime, 600),
        maxProgress: 600,
        rarity: 'rare',
        category: 'time'
      },
      {
        id: 'marathon-learner',
        title: 'Marathon Learner',
        description: 'Study for 50 hours total',
        icon: '🏃',
        unlocked: studyTime >= 3000,
        progress: Math.min(studyTime, 3000),
        maxProgress: 3000,
        rarity: 'epic',
        category: 'time'
      },

      // Streak Achievements
      {
        id: 'streak-starter',
        title: 'Streak Starter',
        description: 'Maintain a 3-day study streak',
        icon: '🔥',
        unlocked: studyStreak >= 3,
        progress: Math.min(studyStreak, 3),
        maxProgress: 3,
        rarity: 'common',
        category: 'streak'
      },
      {
        id: 'dedication-master',
        title: 'Dedication Master',
        description: 'Maintain a 30-day study streak',
        icon: '👑',
        unlocked: studyStreak >= 30,
        progress: Math.min(studyStreak, 30),
        maxProgress: 30,
        rarity: 'legendary',
        category: 'streak'
      },

      // Task Achievements
      {
        id: 'task-ninja',
        title: 'Task Ninja',
        description: 'Complete 50 study tasks',
        icon: '🥷',
        unlocked: completedTasks >= 50,
        progress: Math.min(completedTasks, 50),
        maxProgress: 50,
        rarity: 'rare',
        category: 'study'
      },

      // Voice Input Achievements
      {
        id: 'voice-learner',
        title: 'Voice Learner',
        description: 'Use voice input 10 times',
        icon: '🎤',
        unlocked: voiceInputs >= 10,
        progress: Math.min(voiceInputs, 10),
        maxProgress: 10,
        rarity: 'common',
        category: 'special'
      },

      // File Upload Achievements
      {
        id: 'data-collector',
        title: 'Data Collector',
        description: 'Upload 5 files',
        icon: '📁',
        unlocked: filesUploaded >= 5,
        progress: Math.min(filesUploaded, 5),
        maxProgress: 5,
        rarity: 'common',
        category: 'special'
      },

      // Export Achievements
      {
        id: 'knowledge-sharer',
        title: 'Knowledge Sharer',
        description: 'Generate 10 exports',
        icon: '📤',
        unlocked: exportsGenerated >= 10,
        progress: Math.min(exportsGenerated, 10),
        maxProgress: 10,
        rarity: 'rare',
        category: 'special'
      }
    ];

    setAchievements(initialAchievements);
  }, [studyTime, studyStreak, completedTasks, voiceInputs, filesUploaded, exportsGenerated]);

  // Calculate points and level
  useEffect(() => {
    const totalPoints = achievements.filter(a => a.unlocked).length * 100 +
                       studyTime * 2 +
                       studyStreak * 10 +
                       completedTasks * 50;

    setPoints(totalPoints);
    setLevel(Math.floor(totalPoints / 1000) + 1);
  }, [achievements, studyTime, studyStreak, completedTasks]);

  // Check for new achievements
  useEffect(() => {
    achievements.forEach(achievement => {
      if (achievement.unlocked && !achievement.unlocked) {
        // This achievement was just unlocked
        setNewAchievement(achievement);
        setShowAchievementModal(true);
        onAchievementUnlock?.(achievement);

        // Auto-hide modal after 3 seconds
        setTimeout(() => {
          setShowAchievementModal(false);
          setNewAchievement(null);
        }, 3000);
      }
    });
  }, [achievements, onAchievementUnlock]);

  // Generate daily challenges
  useEffect(() => {
    const challenges = [
      {
        id: 'daily-study',
        title: 'Study Session',
        description: 'Study for 30 minutes today',
        progress: Math.min(studyTime % 1440, 30), // Reset daily
        maxProgress: 30,
        completed: (studyTime % 1440) >= 30,
        reward: 50
      },
      {
        id: 'daily-tasks',
        title: 'Task Master',
        description: 'Complete 3 study tasks',
        progress: Math.min(completedTasks % 10, 3), // Rough daily estimate
        maxProgress: 3,
        completed: (completedTasks % 10) >= 3,
        reward: 75
      },
      {
        id: 'daily-voice',
        title: 'Voice Explorer',
        description: 'Use voice input 2 times',
        progress: Math.min(voiceInputs % 5, 2),
        maxProgress: 2,
        completed: (voiceInputs % 5) >= 2,
        reward: 25
      }
    ];

    setDailyChallenges(challenges);
  }, [studyTime, completedTasks, voiceInputs]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#6b7280';
      case 'rare': return '#3b82f6';
      case 'epic': return '#8b5cf6';
      case 'legendary': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const totalAchievements = achievements.length;

  return (
    <div className="gamification-container">
      {/* Achievement Modal */}
      <AnimatePresence>
        {showAchievementModal && newAchievement && (
          <motion.div
            className="achievement-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="achievement-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="achievement-icon">{newAchievement.icon}</div>
              <h3>Achievement Unlocked!</h3>
              <h4>{newAchievement.title}</h4>
              <p>{newAchievement.description}</p>
              <div
                className="rarity-badge"
                style={{ backgroundColor: getRarityColor(newAchievement.rarity) }}
              >
                {newAchievement.rarity.toUpperCase()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Gamification Panel */}
      <div className="gamification-panel">
        <div className="stats-header">
          <div className="level-display">
            <span className="level-number">Level {level}</span>
            <div className="level-progress">
              <div
                className="level-progress-bar"
                style={{ width: `${(points % 1000) / 10}%` }}
              ></div>
            </div>
          </div>
          <div className="points-display">
            <span className="points-icon">⭐</span>
            <span className="points-number">{points.toLocaleString()}</span>
          </div>
        </div>

        <div className="achievements-section">
          <h3>Achievements ({unlockedAchievements.length}/{totalAchievements})</h3>
          <div className="achievements-grid">
            {achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-info">
                  <h4>{achievement.title}</h4>
                  <p>{achievement.description}</p>
                  {!achievement.unlocked && (
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                      ></div>
                      <span className="progress-text">
                        {achievement.progress}/{achievement.maxProgress}
                      </span>
                    </div>
                  )}
                </div>
                <div
                  className="rarity-indicator"
                  style={{ backgroundColor: getRarityColor(achievement.rarity) }}
                ></div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="daily-challenges-section">
          <h3>Daily Challenges</h3>
          <div className="challenges-list">
            {dailyChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className={`challenge-item ${challenge.completed ? 'completed' : ''}`}
              >
                <div className="challenge-icon">
                  {challenge.completed ? '✅' : '⏳'}
                </div>
                <div className="challenge-info">
                  <h4>{challenge.title}</h4>
                  <p>{challenge.description}</p>
                  <div className="challenge-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${(challenge.progress / challenge.maxProgress) * 100}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {challenge.progress}/{challenge.maxProgress}
                    </span>
                  </div>
                </div>
                <div className="challenge-reward">
                  +{challenge.reward} ⭐
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gamification;