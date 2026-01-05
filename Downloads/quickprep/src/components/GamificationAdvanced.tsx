'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

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
  reward: number;
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
  difficulty: 'easy' | 'medium' | 'hard';
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

interface StatCard {
  label: string;
  value: string | number;
  icon: string;
  gradient: string;
  shadowColor: string;
  change?: { value: number; direction: 'up' | 'down' };
}

// ============================================================================
// CONSTANTS
// ============================================================================

const RARITY_CONFIG = {
  common: { color: '#6b7280', glow: 'shadow-gray-500/40', gradient: 'from-gray-600 to-gray-700' },
  rare: { color: '#3b82f6', glow: 'shadow-blue-500/40', gradient: 'from-blue-600 to-blue-700' },
  epic: { color: '#8b5cf6', glow: 'shadow-purple-500/40', gradient: 'from-purple-600 to-purple-700' },
  legendary: { color: '#f59e0b', glow: 'shadow-yellow-500/40', gradient: 'from-yellow-500 to-orange-600' }
};

const POINT_MULTIPLIERS = {
  achievementUnlock: 100,
  studyTime: 2,
  streakDay: 10,
  taskCompletion: 5,
  challengeCompletion: 50
} as const;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const GamificationAdvanced: React.FC<GamificationProps> = ({
  studyTime,
  studyStreak,
  completedTasks,
  voiceInputs,
  filesUploaded,
  exportsGenerated,
  onAchievementUnlock
}) => {
  // State Management
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [notification, setNotification] = useState<{ message: string; icon: string; type: 'success' | 'warning' } | null>(null);
  const [celebrationParticles, setCelebrationParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [streakMilestone, setStreakMilestone] = useState(false);
  const [expandedSection, setExpandedSection] = useState<'achievements' | 'challenges' | null>(null);

  // Refs for tracking
  const previousAchievementsRef = useRef<Set<string>>(new Set());
  const lastStreakMilestoneRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  // =========================================================================
  // AUDIO MANAGEMENT
  // =========================================================================

  const initializeAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.warn('Audio context unavailable');
      }
    }
    return audioContextRef.current;
  }, []);

  const playSound = useCallback(
    (frequencies: number[], duration: number = 0.3, timeBetween: number = 100) => {
      const ctx = initializeAudioContext();
      if (!ctx) return;

      frequencies.forEach((freq, idx) => {
        setTimeout(() => {
          try {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + duration);
          } catch (e) {
            // Silent fail
          }
        }, idx * timeBetween);
      });
    },
    [initializeAudioContext]
  );

  const playAchievementSound = useCallback(() => {
    playSound([800], 0.5);
  }, [playSound]);

  const playStreakSound = useCallback(() => {
    playSound([600, 800, 1000], 0.3, 100);
  }, [playSound]);

  // =========================================================================
  // ANIMATION FUNCTIONS
  // =========================================================================

  const triggerCelebration = useCallback(() => {
    const particles = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100
    }));
    setCelebrationParticles(particles);
    setTimeout(() => setCelebrationParticles([]), 2000);
  }, []);

  const showNotification = useCallback((message: string, icon: string, type: 'success' | 'warning' = 'success') => {
    setNotification({ message, icon, type });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  // =========================================================================
  // ACHIEVEMENT INITIALIZATION & MANAGEMENT
  // =========================================================================

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
        category: 'study',
        reward: 50
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
        category: 'time',
        reward: 100
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
        category: 'time',
        reward: 250
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
        category: 'time',
        reward: 500
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
        category: 'streak',
        reward: 75
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
        category: 'streak',
        reward: 150
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
        category: 'streak',
        reward: 300
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
        category: 'streak',
        reward: 1000
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
        category: 'study',
        reward: 100
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
        category: 'study',
        reward: 200
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
        category: 'study',
        reward: 400
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
        category: 'special',
        reward: 75
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
        category: 'special',
        reward: 150
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
        category: 'special',
        reward: 50
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
        category: 'special',
        reward: 150
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
        category: 'special',
        reward: 125
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
        category: 'special',
        reward: 300
      }
    ];

    setAchievements(initialAchievements);
  }, [studyTime, studyStreak, completedTasks, voiceInputs, filesUploaded, exportsGenerated]);

  // =========================================================================
  // POINTS & LEVEL CALCULATION
  // =========================================================================

  useEffect(() => {
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalPoints =
      unlockedCount * POINT_MULTIPLIERS.achievementUnlock +
      studyTime * POINT_MULTIPLIERS.studyTime +
      studyStreak * POINT_MULTIPLIERS.streakDay +
      completedTasks * POINT_MULTIPLIERS.taskCompletion;

    setPoints(totalPoints);
    setLevel(Math.floor(totalPoints / 1000) + 1);
  }, [achievements, studyTime, studyStreak, completedTasks]);

  // =========================================================================
  // ACHIEVEMENT UNLOCK DETECTION
  // =========================================================================

  useEffect(() => {
    achievements.forEach(achievement => {
      if (achievement.unlocked && !previousAchievementsRef.current.has(achievement.id)) {
        setNewAchievement(achievement);
        setShowAchievementModal(true);
        triggerCelebration();
        playAchievementSound();
        showNotification(`🎉 ${achievement.title} Unlocked!`, '🏆', 'success');
        previousAchievementsRef.current.add(achievement.id);
        onAchievementUnlock?.(achievement);

        setTimeout(() => {
          setShowAchievementModal(false);
          setNewAchievement(null);
        }, 4000);
      }
    });
  }, [achievements, onAchievementUnlock, triggerCelebration, playAchievementSound, showNotification]);

  // =========================================================================
  // STREAK MILESTONE DETECTION
  // =========================================================================

  useEffect(() => {
    if (studyStreak > 0 && studyStreak % 5 === 0 && studyStreak !== lastStreakMilestoneRef.current) {
      lastStreakMilestoneRef.current = studyStreak;
      setStreakMilestone(true);
      showNotification(`🔥 ${studyStreak} Day Streak!`, '🌟', 'success');
      playStreakSound();
      triggerCelebration();

      setTimeout(() => setStreakMilestone(false), 3000);
    }
  }, [studyStreak, showNotification, playStreakSound, triggerCelebration]);

  // =========================================================================
  // DAILY CHALLENGES
  // =========================================================================

  useEffect(() => {
    const challenges: DailyChallenge[] = [
      {
        id: 'daily-study',
        title: 'Study Session',
        description: 'Study for 30 minutes',
        progress: Math.min(studyTime, 30),
        maxProgress: 30,
        completed: studyTime >= 30,
        reward: 50,
        icon: '📚',
        difficulty: 'easy'
      },
      {
        id: 'daily-tasks',
        title: 'Task Master',
        description: 'Complete 3 tasks',
        progress: Math.min(completedTasks, 3),
        maxProgress: 3,
        completed: completedTasks >= 3,
        reward: 75,
        icon: '✅',
        difficulty: 'medium'
      },
      {
        id: 'daily-voice',
        title: 'Voice Explorer',
        description: 'Use voice input 2x',
        progress: Math.min(voiceInputs, 2),
        maxProgress: 2,
        completed: voiceInputs >= 2,
        reward: 25,
        icon: '🎤',
        difficulty: 'easy'
      },
      {
        id: 'daily-export',
        title: 'Share Knowledge',
        description: 'Generate 1 export',
        progress: Math.min(exportsGenerated, 1),
        maxProgress: 1,
        completed: exportsGenerated >= 1,
        reward: 40,
        icon: '📤',
        difficulty: 'easy'
      }
    ];

    setDailyChallenges(challenges);
  }, [studyTime, completedTasks, voiceInputs, exportsGenerated]);

  // =========================================================================
  // MEMOIZED CALCULATIONS
  // =========================================================================

  const stats = useMemo<StatCard[]>(() => [
    {
      label: 'Level',
      value: level,
      icon: '🎮',
      gradient: 'from-purple-600 to-pink-600',
      shadowColor: 'shadow-purple-500/40',
      change: { value: 1, direction: 'up' }
    },
    {
      label: 'Points',
      value: points.toLocaleString(),
      icon: '⭐',
      gradient: 'from-yellow-500 to-orange-600',
      shadowColor: 'shadow-yellow-500/40'
    },
    {
      label: 'Streak',
      value: studyStreak,
      icon: '🔥',
      gradient: 'from-red-600 to-orange-600',
      shadowColor: 'shadow-red-500/40'
    },
    {
      label: 'Achievements',
      value: `${achievements.filter(a => a.unlocked).length}/${achievements.length}`,
      icon: '🏆',
      gradient: 'from-cyan-600 to-blue-600',
      shadowColor: 'shadow-cyan-500/40'
    }
  ], [level, points, studyStreak, achievements]);

  const unlockedAchievements = useMemo(() => achievements.filter(a => a.unlocked), [achievements]);
  const completedChallenges = useMemo(() => dailyChallenges.filter(c => c.completed), [dailyChallenges]);
  const totalDailyReward = useMemo(() => completedChallenges.reduce((sum, c) => sum + c.reward, 0), [completedChallenges]);

  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    unlockedAchievements.forEach(a => {
      breakdown[a.category] = (breakdown[a.category] || 0) + 1;
    });
    return breakdown;
  }, [unlockedAchievements]);

  // =========================================================================
  // HELPER FUNCTIONS
  // =========================================================================

  const getRarityConfig = (rarity: string) => RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG];

  const getMotivationalMessage = () => {
    const unlocked = unlockedAchievements.length;
    const total = achievements.length;
    const percentage = (unlocked / total) * 100;

    if (percentage === 0) return { text: "🌟 Start your journey! Begin generating content.", emoji: '🌟' };
    if (percentage < 25) return { text: '🚀 Great momentum! Keep going!', emoji: '🚀' };
    if (percentage < 50) return { text: '💪 You\'re crushing it! Don\'t stop now!', emoji: '💪' };
    if (percentage < 75) return { text: '⭐ Nearly there! Just a few more to go!', emoji: '⭐' };
    if (percentage < 100) return { text: '🏅 Almost a champion!', emoji: '🏅' };
    return { text: '👑 CHAMPION! You\'ve unlocked everything!', emoji: '👑' };
  };

  const nextLevelPoints = (level * 1000);
  const currentLevelPoints = ((level - 1) * 1000);
  const xpProgress = ((points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;

  // =========================================================================
  // RENDER FUNCTIONS
  // =========================================================================

  const motivational = getMotivationalMessage();

  return (
    <div className="space-y-8">
      {/* NOTIFICATION TOAST */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 20 }}
            className={`fixed top-6 right-6 z-50 px-8 py-4 rounded-xl font-black text-white text-lg border-2 shadow-2xl backdrop-blur-sm ${
              notification.type === 'success'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-400 shadow-green-500/50'
                : 'bg-gradient-to-r from-orange-500 to-yellow-600 border-orange-400 shadow-orange-500/50'
            }`}
          >
            <span className="mr-3">{notification.icon}</span>
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* STREAK MILESTONE CELEBRATION */}
      <AnimatePresence>
        {streakMilestone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 px-16 py-12 rounded-3xl font-black text-white text-5xl border-4 border-yellow-300 shadow-2xl shadow-orange-500/60">
              🔥 MILESTONE! 🔥
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACHIEVEMENT UNLOCK MODAL */}
      <AnimatePresence>
        {showAchievementModal && newAchievement && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotateZ: -10 }}
              animate={{ scale: 1, opacity: 1, rotateZ: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotateZ: 10 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4"
            >
              <div className={`bg-gradient-to-br ${getRarityConfig(newAchievement.rarity).gradient} rounded-3xl p-12 border-4 border-white shadow-2xl text-center relative overflow-hidden`}>
                {/* Celebration Particles */}
                {celebrationParticles.map(particle => (
                  <motion.div
                    key={particle.id}
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 0, y: -100 }}
                    transition={{ duration: 1, delay: particle.id * 0.02 }}
                    className="fixed text-4xl pointer-events-none"
                    style={{ left: `${particle.x}%`, top: `${particle.y}%` }}
                  >
                    ✨
                  </motion.div>
                ))}

                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.5 }}
                  className="text-9xl mb-6"
                >
                  {newAchievement.icon}
                </motion.div>
                
                <h3 className="text-4xl font-black text-white mb-2 drop-shadow-lg">Achievement Unlocked!</h3>
                <h4 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">{newAchievement.title}</h4>
                <p className="text-lg text-white/90 mb-6">{newAchievement.description}</p>
                
                <div className="inline-block px-6 py-3 bg-white/20 rounded-xl border-2 border-white/40 font-black text-white text-xl mb-6">
                  {newAchievement.rarity.toUpperCase()}
                </div>
                
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-3xl font-black text-white drop-shadow-lg"
                >
                  +{newAchievement.reward} ⭐ Points
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* STATS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
            className={`relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-br ${stat.gradient} p-6 lg:p-8 border-3 border-white/20 shadow-2xl ${stat.shadowColor} group hover:border-white/40 transition-all duration-300`}
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl lg:text-4xl">{stat.icon}</span>
                {stat.change && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-sm font-bold text-white/80 bg-white/20 rounded-full px-2 py-1"
                  >
                    {stat.change.direction === 'up' ? '📈' : '📉'}
                  </motion.span>
                )}
              </div>
              
              <p className="text-sm lg:text-base font-bold uppercase tracking-wider text-white/80 mb-2">{stat.label}</p>
              <motion.p
                key={`${stat.label}-${stat.value}`}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-4xl lg:text-5xl font-black text-white drop-shadow-lg"
              >
                {stat.value}
              </motion.p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ACHIEVEMENTS SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl lg:rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-3 border-cyan-400/50 p-6 lg:p-8 overflow-hidden"
      >
        <motion.button
          onClick={() => setExpandedSection(expandedSection === 'achievements' ? null : 'achievements')}
          className="w-full flex items-center justify-between mb-6 group"
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl lg:text-5xl">🏆</span>
            <div className="text-left">
              <h3 className="text-2xl lg:text-3xl font-black text-cyan-300">Achievements</h3>
              <p className="text-sm text-cyan-300/60 font-bold">{unlockedAchievements.length}/{achievements.length} Unlocked</p>
            </div>
          </div>
          <motion.span
            animate={{ rotate: expandedSection === 'achievements' ? 180 : 0 }}
            className="text-3xl text-cyan-400"
          >
            ▼
          </motion.span>
        </motion.button>

        <AnimatePresence>
          {expandedSection === 'achievements' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              {/* Achievement Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement, idx) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    className={`group relative rounded-xl lg:rounded-2xl border-3 p-4 lg:p-6 transition-all cursor-pointer ${
                      achievement.unlocked
                        ? 'bg-gradient-to-br from-purple-900/60 to-pink-900/60 border-purple-400/70 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50'
                        : 'bg-slate-900/40 border-slate-600/50 hover:border-cyan-500/70 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="text-center">
                      <motion.div
                        animate={achievement.unlocked ? { scale: [1, 1.15, 1] } : {}}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                        className={`text-5xl lg:text-6xl mb-4 filter transition-all ${
                          achievement.unlocked ? 'drop-shadow-lg scale-100' : 'grayscale opacity-40 scale-75'
                        }`}
                      >
                        {achievement.icon}
                      </motion.div>

                      <h4 className={`text-lg lg:text-xl font-bold mb-2 ${
                        achievement.unlocked ? 'text-yellow-300' : 'text-gray-400'
                      }`}>
                        {achievement.title}
                      </h4>

                      {achievement.unlocked && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-2xl inline-block mb-2"
                        >
                          ✓
                        </motion.span>
                      )}

                      <p className={`text-xs lg:text-sm mb-4 font-medium ${
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

                      {achievement.unlocked && (
                        <div className="text-xs font-bold text-yellow-300 mt-2">+{achievement.reward} XP</div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Category Breakdown */}
              <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <p className="text-sm font-black text-cyan-300 mb-3 uppercase">Category Breakdown</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(categoryBreakdown).map(([category, count]) => (
                    <div key={category} className="text-center">
                      <p className="text-sm text-cyan-300/60 capitalize font-bold">{category}</p>
                      <p className="text-2xl font-black text-yellow-300">{count}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* DAILY CHALLENGES SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl lg:rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-3 border-yellow-400/50 p-6 lg:p-8 overflow-hidden"
      >
        <motion.button
          onClick={() => setExpandedSection(expandedSection === 'challenges' ? null : 'challenges')}
          className="w-full flex items-center justify-between mb-6 group"
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl lg:text-5xl">⚡</span>
            <div className="text-left">
              <h3 className="text-2xl lg:text-3xl font-black text-yellow-300">Daily Challenges</h3>
              <p className="text-sm text-yellow-300/60 font-bold">{completedChallenges.length}/{dailyChallenges.length} Completed</p>
            </div>
          </div>
          <motion.span
            animate={{ rotate: expandedSection === 'challenges' ? 180 : 0 }}
            className="text-3xl text-yellow-400"
          >
            ▼
          </motion.span>
        </motion.button>

        <AnimatePresence>
          {expandedSection === 'challenges' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              {dailyChallenges.map((challenge, idx) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ x: 8 }}
                  className={`relative rounded-xl lg:rounded-2xl border-3 p-4 lg:p-6 transition-all ${
                    challenge.completed
                      ? 'bg-gradient-to-r from-green-900/60 to-emerald-900/60 border-green-400/70 shadow-lg shadow-green-500/30'
                      : 'bg-slate-800/60 border-slate-600/50 hover:border-slate-500/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <motion.div
                        animate={challenge.completed ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                        className="text-3xl lg:text-4xl flex-shrink-0"
                      >
                        {challenge.completed ? '✅' : challenge.icon}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-base lg:text-lg font-black mb-1 ${
                          challenge.completed ? 'text-green-300' : 'text-cyan-300'
                        }`}>
                          {challenge.title}
                        </h4>
                        <p className="text-xs lg:text-sm text-gray-300 font-medium truncate">{challenge.description}</p>
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
                      className="text-center flex-shrink-0"
                    >
                      <div className="text-xl lg:text-2xl font-black text-yellow-400 mb-1">
                        +{challenge.reward}
                      </div>
                      <div className="text-xs font-bold text-yellow-400">⭐</div>
                      {challenge.completed && (
                        <span className="text-xs font-bold text-green-300 block mt-1">✓</span>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              ))}

              {/* Daily Bonus */}
              {totalDailyReward > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl lg:rounded-2xl bg-gradient-to-r from-yellow-600 to-orange-600 border-3 border-yellow-300 p-6 lg:p-8 text-center mt-6"
                >
                  <p className="text-2xl lg:text-3xl font-black text-white mb-2">🎁 Daily Bonus</p>
                  <p className="text-4xl lg:text-5xl font-black text-yellow-100">
                    +{totalDailyReward} ⭐ Points
                  </p>
                  {completedChallenges.length === dailyChallenges.length && (
                    <p className="text-sm text-yellow-50 font-bold mt-3">All challenges completed! 🎉</p>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* MOTIVATIONAL SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl lg:rounded-3xl bg-gradient-to-r from-purple-900/60 via-pink-900/60 to-purple-900/60 border-3 border-purple-400/60 p-8 lg:p-12 text-center shadow-2xl shadow-purple-500/20"
      >
        <p className="text-3xl lg:text-4xl font-black text-cyan-300 mb-6 leading-relaxed">
          {motivational.emoji} {motivational.text}
        </p>
        <div className="flex flex-wrap justify-center gap-4 lg:gap-6">
          <div className="text-center">
            <p className="text-sm text-purple-200 font-bold uppercase mb-1">Level</p>
            <p className="text-3xl lg:text-4xl font-black text-yellow-300">{level}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-purple-200 font-bold uppercase mb-1">Points</p>
            <p className="text-3xl lg:text-4xl font-black text-yellow-300">{points.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-purple-200 font-bold uppercase mb-1">Streak</p>
            <p className="text-3xl lg:text-4xl font-black text-yellow-300">{studyStreak} 🔥</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-purple-200 font-bold uppercase mb-1">Unlocked</p>
            <p className="text-3xl lg:text-4xl font-black text-yellow-300">{unlockedAchievements.length}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GamificationAdvanced;
