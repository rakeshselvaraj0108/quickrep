'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  unlockedAt?: number;
}

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  reward: number;
  icon: string;
}

interface GamificationProps {
  studyTime: number;
  studyStreak: number;
  completedTasks: number;
  voiceInputs: number;
  filesUploaded: number;
  exportsGenerated: number;
  onAchievementUnlock?: (achievement: Achievement) => void;
}

const GamificationEnhanced: React.FC<GamificationProps> = ({
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
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [notification, setNotification] = useState<{ message: string; icon: string } | null>(null);
  const [celebrationParticles, setCelebrationParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [streakMilestone, setStreakMilestone] = useState(false);
  const previousAchievementsRef = useRef<Set<string>>(new Set());
  const lastStreakMilestoneRef = useRef<number>(0);

  // Define callbacks early to avoid dependency issues
  const triggerCelebration = useCallback(() => {
    const particles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100
    }));
    setCelebrationParticles(particles);
    setTimeout(() => setCelebrationParticles([]), 2000);
  }, []);

  const playAchievementSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      // Audio context might not be available
    }
  }, []);

  const playStreakSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const notes = [600, 800, 1000];

      notes.forEach((freq, idx) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.value = freq;
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
        }, idx * 100);
      });
    } catch (e) {
      // Audio context might not be available
    }
  }, []);

  const showNotification = useCallback((message: string, icon: string) => {
    setNotification({ message, icon });
    setTimeout(() => setNotification(null), 3000);
  }, []);

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
      {
        id: 'knowledge-master',
        title: 'Knowledge Master',
        description: 'Study for 100 hours total',
        icon: '🧙',
        unlocked: studyTime >= 6000,
        progress: Math.min(studyTime, 6000),
        maxProgress: 6000,
        rarity: 'legendary',
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
        id: 'week-warrior',
        title: 'Week Warrior',
        description: 'Maintain a 7-day study streak',
        icon: '💪',
        unlocked: studyStreak >= 7,
        progress: Math.min(studyStreak, 7),
        maxProgress: 7,
        rarity: 'rare',
        category: 'streak'
      },
      {
        id: 'monthly-master',
        title: 'Monthly Master',
        description: 'Maintain a 30-day study streak',
        icon: '👑',
        unlocked: studyStreak >= 30,
        progress: Math.min(studyStreak, 30),
        maxProgress: 30,
        rarity: 'epic',
        category: 'streak'
      },
      {
        id: 'dedication-master',
        title: 'Dedication Master',
        description: 'Maintain a 100-day study streak',
        icon: '💎',
        unlocked: studyStreak >= 100,
        progress: Math.min(studyStreak, 100),
        maxProgress: 100,
        rarity: 'legendary',
        category: 'streak'
      },

      // Task Achievements
      {
        id: 'task-starter',
        title: 'Task Starter',
        description: 'Complete 10 study tasks',
        icon: '✅',
        unlocked: completedTasks >= 10,
        progress: Math.min(completedTasks, 10),
        maxProgress: 10,
        rarity: 'common',
        category: 'study'
      },
      {
        id: 'task-master',
        title: 'Task Master',
        description: 'Complete 50 study tasks',
        icon: '🥷',
        unlocked: completedTasks >= 50,
        progress: Math.min(completedTasks, 50),
        maxProgress: 50,
        rarity: 'rare',
        category: 'study'
      },
      {
        id: 'task-legend',
        title: 'Task Legend',
        description: 'Complete 200 study tasks',
        icon: '🏅',
        unlocked: completedTasks >= 200,
        progress: Math.min(completedTasks, 200),
        maxProgress: 200,
        rarity: 'epic',
        category: 'study'
      },

      // Voice Input Achievements
      {
        id: 'voice-starter',
        title: 'Voice Explorer',
        description: 'Use voice input 5 times',
        icon: '🎤',
        unlocked: voiceInputs >= 5,
        progress: Math.min(voiceInputs, 5),
        maxProgress: 5,
        rarity: 'common',
        category: 'special'
      },
      {
        id: 'voice-master',
        title: 'Voice Master',
        description: 'Use voice input 50 times',
        icon: '🎙️',
        unlocked: voiceInputs >= 50,
        progress: Math.min(voiceInputs, 50),
        maxProgress: 50,
        rarity: 'rare',
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
      {
        id: 'data-master',
        title: 'Data Master',
        description: 'Upload 20 files',
        icon: '🗂️',
        unlocked: filesUploaded >= 20,
        progress: Math.min(filesUploaded, 20),
        maxProgress: 20,
        rarity: 'rare',
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
      },
      {
        id: 'export-master',
        title: 'Export Master',
        description: 'Generate 50 exports',
        icon: '📊',
        unlocked: exportsGenerated >= 50,
        progress: Math.min(exportsGenerated, 50),
        maxProgress: 50,
        rarity: 'epic',
        category: 'special'
      }
    ];

    setAchievements(initialAchievements);
  }, [studyTime, studyStreak, completedTasks, voiceInputs, filesUploaded, exportsGenerated]);

  // Calculate points and level with real-time updates
  useEffect(() => {
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalPoints = unlockedCount * 100 +
                       studyTime * 2 +
                       studyStreak * 10 +
                       completedTasks * 5;

    setPoints(totalPoints);
    setLevel(Math.floor(totalPoints / 1000) + 1);
  }, [achievements, studyTime, studyStreak, completedTasks]);

  // Check for new achievements and trigger celebrations
  useEffect(() => {
    achievements.forEach(achievement => {
      if (achievement.unlocked && !previousAchievementsRef.current.has(achievement.id)) {
        // New achievement unlocked
        setNewAchievement(achievement);
        setShowAchievementModal(true);
        triggerCelebration();
        playAchievementSound();
        showNotification(`🎉 ${achievement.title} Unlocked!`, '🏆');
        previousAchievementsRef.current.add(achievement.id);
        onAchievementUnlock?.(achievement);

        setTimeout(() => {
          setShowAchievementModal(false);
          setNewAchievement(null);
        }, 4000);
      }
    });
  }, [achievements, onAchievementUnlock, triggerCelebration, playAchievementSound, showNotification]);

  // Check for streak milestones
  useEffect(() => {
    if (studyStreak > 0 && studyStreak % 5 === 0 && studyStreak !== lastStreakMilestoneRef.current) {
      lastStreakMilestoneRef.current = studyStreak;
      setStreakMilestone(true);
      showNotification(`🔥 ${studyStreak} Day Streak!`, '🌟');
      playStreakSound();
      triggerCelebration();

      setTimeout(() => setStreakMilestone(false), 3000);
    }
  }, [studyStreak, showNotification, playStreakSound, triggerCelebration]);

  // Generate daily challenges with real-time progress
  useEffect(() => {
    const challenges: DailyChallenge[] = [
      {
        id: 'daily-study',
        title: 'Study Session',
        description: 'Study for 30 minutes today',
        progress: Math.min(studyTime, 30),
        maxProgress: 30,
        completed: studyTime >= 30,
        reward: 50,
        icon: '📚'
      },
      {
        id: 'daily-tasks',
        title: 'Task Master',
        description: 'Complete 3 study tasks',
        progress: Math.min(completedTasks, 3),
        maxProgress: 3,
        completed: completedTasks >= 3,
        reward: 75,
        icon: '✅'
      },
      {
        id: 'daily-voice',
        title: 'Voice Explorer',
        description: 'Use voice input 2 times',
        progress: Math.min(voiceInputs, 2),
        maxProgress: 2,
        completed: voiceInputs >= 2,
        reward: 25,
        icon: '🎤'
      },
      {
        id: 'daily-export',
        title: 'Share Knowledge',
        description: 'Generate 1 export',
        progress: Math.min(exportsGenerated, 1),
        maxProgress: 1,
        completed: exportsGenerated >= 1,
        reward: 40,
        icon: '📤'
      }
    ];

    setDailyChallenges(challenges);
  }, [studyTime, completedTasks, voiceInputs, exportsGenerated]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#6b7280';
      case 'rare': return '#3b82f6';
      case 'epic': return '#8b5cf6';
      case 'legendary': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-500 to-gray-600';
      case 'rare': return 'from-blue-500 to-blue-600';
      case 'epic': return 'from-purple-500 to-purple-600';
      case 'legendary': return 'from-yellow-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const totalAchievements = achievements.length;
  const completedChallenges = dailyChallenges.filter(c => c.completed).length;
  const dailyBonus = completedChallenges * 50;

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 px-8 py-4 rounded-xl font-black text-white text-lg border-2 border-yellow-300 shadow-2xl shadow-yellow-500/50"
          >
            {notification.icon} {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak Milestone Celebration */}
      <AnimatePresence>
        {streakMilestone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 px-12 py-8 rounded-3xl font-black text-white text-4xl border-4 border-yellow-300 shadow-2xl shadow-orange-500/50"
          >
            🔥 MILESTONE! 🔥
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement Unlock Modal */}
      <AnimatePresence>
        {showAchievementModal && newAchievement && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <div className={`bg-gradient-to-br ${getRarityGradient(newAchievement.rarity)} rounded-3xl p-8 border-4 border-white shadow-2xl text-center`}>
                {/* Celebration Particles */}
                {celebrationParticles.map(particle => (
                  <motion.div
                    key={particle.id}
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 0, y: -100 }}
                    transition={{ duration: 1 }}
                    className="fixed text-4xl pointer-events-none"
                    style={{ left: `${particle.x}%`, top: `${particle.y}%` }}
                  >
                    ✨
                  </motion.div>
                ))}

                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="text-9xl mb-6"
                >
                  {newAchievement.icon}
                </motion.div>
                <h3 className="text-4xl font-black text-white mb-2 drop-shadow-lg">
                  Achievement Unlocked!
                </h3>
                <h4 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">
                  {newAchievement.title}
                </h4>
                <p className="text-lg text-white/90 mb-6">
                  {newAchievement.description}
                </p>
                <div className="inline-block px-6 py-3 bg-white/20 rounded-xl border-2 border-white/40 font-black text-white text-xl">
                  {newAchievement.rarity.toUpperCase()}
                </div>
                <div className="mt-6 text-2xl font-black text-white drop-shadow-lg">
                  +100 ⭐ Points
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Level Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 to-pink-600 p-8 border-3 border-purple-400 shadow-2xl shadow-purple-500/40 group hover:shadow-purple-500/60 transition-all"
        >
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <p className="text-sm font-bold uppercase tracking-wider text-purple-100 mb-2">Level</p>
            <p className="text-6xl font-black text-white mb-4">{level}</p>
            <div className="bg-purple-900/40 rounded-full h-4 overflow-hidden border-2 border-purple-400">
              <motion.div
                animate={{ width: `${(points % 1000) / 10}%` }}
                className="h-full bg-gradient-to-r from-yellow-400 to-pink-400"
              />
            </div>
            <p className="text-xs text-purple-100 mt-2 font-bold">
              {points % 1000}/1000 XP
            </p>
          </div>
        </motion.div>

        {/* Points Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-500 to-orange-600 p-8 border-3 border-yellow-400 shadow-2xl shadow-yellow-500/40 group hover:shadow-yellow-500/60 transition-all"
        >
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <p className="text-sm font-bold uppercase tracking-wider text-yellow-100 mb-2">Total Points</p>
            <motion.p
              key={points}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-6xl font-black text-white mb-4"
            >
              {points.toLocaleString()}
            </motion.p>
            <div className="flex items-center gap-2">
              <span className="text-3xl">⭐</span>
              <p className="text-yellow-100 font-bold">Earned Points</p>
            </div>
          </div>
        </motion.div>

        {/* Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 to-orange-600 p-8 border-3 border-red-400 shadow-2xl shadow-red-500/40 group hover:shadow-red-500/60 transition-all"
        >
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <p className="text-sm font-bold uppercase tracking-wider text-red-100 mb-2">Streak</p>
            <p className="text-6xl font-black text-white mb-4">{studyStreak}</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl animate-bounce">🔥</span>
              <p className="text-red-100 font-bold">Days Active</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Achievements Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-3 border-cyan-400/50 p-8"
      >
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-black text-cyan-300 flex items-center gap-3">
            <span className="text-4xl">🏆</span>
            Achievements
          </h3>
          <div className="text-2xl font-black text-yellow-300">
            {unlockedAchievements.length}/{totalAchievements}
          </div>
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement, idx) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`group relative rounded-2xl border-3 p-6 transition-all cursor-pointer ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-purple-900/60 to-pink-900/60 border-purple-400/70 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50'
                  : 'bg-slate-900/40 border-slate-600/50 opacity-60'
              }`}
            >
              <div className="text-center">
                <motion.div
                  animate={achievement.unlocked ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  className={`text-5xl mb-4 filter transition-all ${
                    achievement.unlocked ? 'drop-shadow-lg scale-100' : 'grayscale opacity-40 scale-75'
                  }`}
                >
                  {achievement.icon}
                </motion.div>

                <h4 className={`text-xl font-bold mb-2 ${
                  achievement.unlocked ? 'text-yellow-300' : 'text-gray-400'
                }`}>
                  {achievement.title}
                </h4>

                {achievement.unlocked && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-3xl inline-block mb-2"
                  >
                    ✓
                  </motion.span>
                )}

                <p className={`text-sm mb-4 font-medium ${
                  achievement.unlocked ? 'text-cyan-200' : 'text-gray-400'
                }`}>
                  {achievement.description}
                </p>

                {!achievement.unlocked && (
                  <div className="space-y-2">
                    <div className="h-2 bg-slate-700/60 rounded-full overflow-hidden border border-slate-600">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-yellow-500"
                      />
                    </div>
                    <p className="text-xs font-bold text-cyan-300">
                      {Math.floor((achievement.progress / achievement.maxProgress) * 100)}%
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Daily Challenges Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-3 border-yellow-400/50 p-8"
      >
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-black text-yellow-300 flex items-center gap-3">
            <span className="text-4xl">⚡</span>
            Daily Challenges
          </h3>
          <div className="text-2xl font-black text-cyan-300">
            {completedChallenges}/{dailyChallenges.length}
          </div>
        </div>

        <div className="space-y-4">
          {dailyChallenges.map((challenge, idx) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ x: 8 }}
              className={`relative rounded-2xl border-3 p-6 transition-all ${
                challenge.completed
                  ? 'bg-gradient-to-r from-green-900/60 to-emerald-900/60 border-green-400/70 shadow-lg shadow-green-500/30'
                  : 'bg-slate-800/60 border-slate-600/50 hover:border-slate-500/70'
              }`}
            >
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-4 flex-1">
                  <motion.div
                    animate={challenge.completed ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                    className="text-4xl"
                  >
                    {challenge.completed ? '✅' : challenge.icon}
                  </motion.div>
                  <div className="flex-1">
                    <h4 className={`text-lg font-black mb-1 ${
                      challenge.completed ? 'text-green-300' : 'text-cyan-300'
                    }`}>
                      {challenge.title}
                    </h4>
                    <p className="text-sm text-gray-300 font-medium">{challenge.description}</p>
                    <div className="mt-2 h-2 bg-slate-700/60 rounded-full overflow-hidden border border-slate-600">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(challenge.progress / challenge.maxProgress) * 100}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                      />
                    </div>
                    <p className="text-xs text-cyan-300 font-bold mt-1">
                      {challenge.progress}/{challenge.maxProgress}
                    </p>
                  </div>
                </div>
                <motion.div
                  animate={challenge.completed ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                  className="text-center whitespace-nowrap"
                >
                  <div className="text-2xl font-black text-yellow-400 mb-1">
                    +{challenge.reward} ⭐
                  </div>
                  {challenge.completed && (
                    <span className="text-xs font-bold text-green-300">COMPLETED</span>
                  )}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Daily Bonus */}
        {dailyBonus > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl bg-gradient-to-r from-yellow-600 to-orange-600 border-3 border-yellow-300 p-6 text-center"
          >
            <p className="text-2xl font-black text-white mb-2">🎁 Daily Bonus</p>
            <p className="text-4xl font-black text-yellow-100">
              +{dailyBonus} ⭐ Points
            </p>
            <p className="text-sm text-yellow-50 font-bold mt-2">
              Complete all challenges to earn this bonus!
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Motivational Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-r from-purple-900/60 via-pink-900/60 to-purple-900/60 border-3 border-purple-400/60 p-8 text-center shadow-2xl shadow-purple-500/20"
      >
        <p className="text-3xl font-black text-cyan-300 mb-4">
          {unlockedAchievements.length === 0 && "🌟 Start your adventure! Begin generating content to unlock achievements."}
          {unlockedAchievements.length > 0 && unlockedAchievements.length < 5 && "🚀 Great momentum! Keep going!"}
          {unlockedAchievements.length >= 5 && unlockedAchievements.length < 10 && "💪 You're crushing it! Don't stop now!"}
          {unlockedAchievements.length >= 10 && unlockedAchievements.length < totalAchievements && "⭐ Nearly there! Just a few more to go!"}
          {unlockedAchievements.length === totalAchievements && "👑 CHAMPION! You've unlocked everything!"}
        </p>
        <p className="text-lg text-purple-200 font-bold">
          Level {level} • {points.toLocaleString()} Points • {studyStreak} Day Streak
        </p>
      </motion.div>
    </div>
  );
};

export default GamificationEnhanced;
