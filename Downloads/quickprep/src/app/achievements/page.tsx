'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress: number;
  total: number;
  unlockedAt?: number;
  category: 'generation' | 'streak' | 'exploration';
}

export default function AchievementsPage() {
  const [streak, setStreak] = useState(0);
  const [totalGenerations, setTotalGenerations] = useState(0);
  const [modesUsed, setModesUsed] = useState(0);
  const [notification, setNotification] = useState<{ message: string; icon: string } | null>(null);
  const [hoveredAchievement, setHoveredAchievement] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    loadAchievements();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadAchievements, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAchievements = async () => {
    setLoading(true);
    try {
      // Get user ID (for demo using guest, in production use auth)
      const userId = localStorage.getItem('userId') || 'guest';

      // Fetch achievements from API
      const response = await fetch('/api/achievements', {
        headers: {
          'x-user-id': userId,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAchievements(data.achievements);
          setTotalGenerations(data.stats.totalGenerations || 0);
          setStreak(data.stats.streak || 0);
          setModesUsed(data.stats.modesUsed || 0);
          
          // Check for newly unlocked achievements
          const savedAchievements = localStorage.getItem('savedAchievements');
          if (savedAchievements) {
            const oldAchievements = JSON.parse(savedAchievements);
            data.achievements.forEach((achievement: Achievement) => {
              const oldAchievement = oldAchievements.find((a: Achievement) => a.id === achievement.id);
              if (achievement.unlocked && (!oldAchievement || !oldAchievement.unlocked)) {
                // Newly unlocked!
                showNotification(`🎉 Achievement Unlocked: ${achievement.title}!`, achievement.icon);
              }
            });
          }
          
          // Save achievements
          localStorage.setItem('savedAchievements', JSON.stringify(data.achievements));
        }
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, icon: string) => {
    setNotification({ message, icon });
    setTimeout(() => setNotification(null), 5000);
  };

  const syncAchievements = async () => {
    try {
      const userId = localStorage.getItem('userId') || 'guest';
      const response = await fetch('/api/achievements', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAchievements(data.achievements);
          showNotification('✅ Achievements synced successfully!', '🔄');
          
          if (data.newlyUnlocked && data.newlyUnlocked.length > 0) {
            setTimeout(() => {
              data.newlyUnlocked.forEach((id: string) => {
                const achievement = data.achievements.find((a: Achievement) => a.id === id);
                if (achievement) {
                  showNotification(`🎉 ${achievement.title} unlocked!`, achievement.icon);
                }
              });
            }, 1000);
          }
        }
      }
    } catch (error) {
      console.error('Error syncing achievements:', error);
      showNotification('❌ Failed to sync achievements', '⚠️');
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const generationAchievements = achievements.filter(a => a.category === 'generation');
  const streakAchievements = achievements.filter(a => a.category === 'streak');
  const explorationAchievements = achievements.filter(a => a.category === 'exploration');

  const categoryColors = {
    generation: { gradient: 'from-blue-600 to-cyan-600', glow: 'shadow-blue-500/50', border: 'border-blue-400/50' },
    streak: { gradient: 'from-orange-600 to-red-600', glow: 'shadow-orange-500/50', border: 'border-orange-400/50' },
    exploration: { gradient: 'from-purple-600 to-pink-600', glow: 'shadow-purple-500/50', border: 'border-purple-400/50' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-64 -right-64 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-64 -left-64 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-6 right-6 z-50 px-8 py-4 rounded-2xl bg-gradient-to-r from-yellow-600/90 to-orange-600/90 border-2 border-yellow-400/50 font-bold text-white text-lg shadow-2xl shadow-yellow-500/50 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{notification.icon}</span>
              <span>{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-white/10 sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold transition-all hover:scale-110 shadow-lg shadow-purple-500/30"
              >
                ←
              </Link>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent flex items-center gap-3">
                  🏆 Achievements
                </h1>
                <p className="text-gray-400 text-sm mt-1">Track your study progress</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={syncAchievements}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
            >
              🔄 Sync
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="text-6xl"
            >
              ⚡
            </motion.div>
          </div>
        ) : (
          <>
        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03, y: -5 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600/20 to-red-600/20 border-2 border-orange-500/30 p-6 backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-orange-500/10 to-red-500/0"></div>
            <div className="relative z-10 text-center">
              <motion.p 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-3"
              >
                🔥
              </motion.p>
              <p className="text-orange-200 text-sm font-bold uppercase tracking-wider mb-2">Current Streak</p>
              <p className="text-5xl font-black text-white drop-shadow-lg">{streak}</p>
              <p className="text-orange-100 font-semibold mt-2">Days Active</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.03, y: -5 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-2 border-purple-500/30 p-6 backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/10 to-pink-500/0"></div>
            <div className="relative z-10 text-center">
              <motion.p 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-3"
              >
                🎯
              </motion.p>
              <p className="text-purple-200 text-sm font-bold uppercase tracking-wider mb-2">Progress</p>
              <p className="text-5xl font-black text-white drop-shadow-lg">{unlockedCount}/{achievements.length}</p>
              <p className="text-purple-100 font-semibold mt-2">Unlocked</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.03, y: -5 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-2 border-green-500/30 p-6 backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 via-green-500/10 to-emerald-500/0"></div>
            <div className="relative z-10 text-center">
              <motion.p 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-3"
              >
                📊
              </motion.p>
              <p className="text-green-200 text-sm font-bold uppercase tracking-wider mb-2">Total Generated</p>
              <p className="text-5xl font-black text-white drop-shadow-lg">{totalGenerations}</p>
              <p className="text-green-100 font-semibold mt-2">Contents</p>
            </div>
          </motion.div>
        </div>

        {/* Generation Achievements Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full"></div>
            <h2 className="text-3xl font-black text-blue-300 drop-shadow-lg">📈 Generation Milestones</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generationAchievements.map((achievement, idx) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                idx={idx}
                hoveredAchievement={hoveredAchievement}
                setHoveredAchievement={setHoveredAchievement}
                colors={categoryColors.generation}
              />
            ))}
          </div>
        </motion.div>

        {/* Streak Achievements Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-orange-400 to-red-400 rounded-full"></div>
            <h2 className="text-3xl font-black text-orange-300 drop-shadow-lg">🔥 Streak Achievements</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {streakAchievements.map((achievement, idx) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                idx={idx}
                hoveredAchievement={hoveredAchievement}
                setHoveredAchievement={setHoveredAchievement}
                colors={categoryColors.streak}
              />
            ))}
          </div>
        </motion.div>

        {/* Exploration Achievements Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full"></div>
            <h2 className="text-3xl font-black text-purple-300 drop-shadow-lg">🎨 Exploration Achievements</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {explorationAchievements.map((achievement, idx) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                idx={idx}
                hoveredAchievement={hoveredAchievement}
                setHoveredAchievement={setHoveredAchievement}
                colors={categoryColors.exploration}
              />
            ))}
          </div>
        </motion.div>

        {/* Motivational Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 border-2 border-purple-400/30 p-10 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-pink-500/10 to-purple-500/0"></div>
          <div className="relative z-10 text-center">
            <motion.p 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              {unlockedCount === 0 && "🌟"}
              {unlockedCount > 0 && unlockedCount < 3 && "🚀"}
              {unlockedCount >= 3 && unlockedCount < 6 && "💪"}
              {unlockedCount >= 6 && unlockedCount < achievements.length && "⭐"}
              {unlockedCount === achievements.length && "👑"}
            </motion.p>
            <p className="text-3xl font-black bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent leading-relaxed drop-shadow-lg">
              {unlockedCount === 0 && "Start your journey! Generate content to unlock achievements."}
              {unlockedCount > 0 && unlockedCount < 3 && "Great momentum! Keep going!"}
              {unlockedCount >= 3 && unlockedCount < 6 && "💪 You're crushing it!"}
              {unlockedCount >= 6 && unlockedCount < achievements.length && "Nearly there! Keep pushing!"}
              {unlockedCount === achievements.length && "Champion achieved! You're a legend! 👑"}
            </p>
          </div>
        </motion.div>
          </>
        )}
      </main>
    </div>
  );
}

// Achievement Card Component with 3D Effects
function AchievementCard({ 
  achievement, 
  idx, 
  hoveredAchievement, 
  setHoveredAchievement,
  colors
}: { 
  achievement: Achievement; 
  idx: number; 
  hoveredAchievement: string | null; 
  setHoveredAchievement: (id: string | null) => void;
  colors: { gradient: string; glow: string; border: string };
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setHoveredAchievement(achievement.id);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setHoveredAchievement(null);
    setMousePosition({ x: 0.5, y: 0.5 });
  };

  const rotateX = isHovered ? (mousePosition.y - 0.5) * -20 : 0;
  const rotateY = isHovered ? (mousePosition.x - 0.5) * 20 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: idx * 0.05, type: "spring", stiffness: 260, damping: 20 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      className="relative group cursor-pointer"
    >
      <motion.div
        animate={{
          rotateX,
          rotateY,
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{
          transformStyle: 'preserve-3d',
        }}
        className={`relative rounded-3xl p-6 transition-all duration-300 backdrop-blur-sm overflow-hidden ${
          achievement.unlocked
            ? `bg-gradient-to-br ${colors.gradient.replace('600', '900/60')} border-2 ${colors.border} shadow-2xl ${colors.glow}`
            : 'bg-slate-800/40 border-2 border-slate-700/50 opacity-70 hover:opacity-100 hover:border-cyan-500/50 shadow-xl'
        }`}
      >
        {/* 3D Depth Layer */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"
          style={{
            transform: 'translateZ(10px)',
            transformStyle: 'preserve-3d',
          }}
        />

        {/* Shine Effect */}
        {isHovered && achievement.unlocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(255,255,255,0.3), transparent 50%)`,
            }}
          />
        )}

        {/* Unlock checkmark overlay */}
        {achievement.unlocked && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 15 }}
            className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50 border-4 border-slate-900 z-10"
            style={{
              transform: 'translateZ(30px)',
              transformStyle: 'preserve-3d',
            }}
          >
            <span className="text-2xl font-bold">✓</span>
          </motion.div>
        )}

        <div 
          className="text-center relative"
          style={{
            transform: 'translateZ(20px)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Icon */}
          <motion.div
            animate={achievement.unlocked ? { 
              rotate: isHovered ? [0, 10, -10, 10, 0] : 0,
              scale: isHovered ? 1.2 : 1
            } : {}}
            transition={{ duration: 0.5 }}
            className={`text-7xl mb-4 transition-all duration-300 ${
              achievement.unlocked 
                ? 'drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] filter-none' 
                : 'grayscale opacity-30'
            }`}
            style={{
              transform: 'translateZ(40px)',
              transformStyle: 'preserve-3d',
            }}
          >
            {achievement.icon}
          </motion.div>

          {/* Title */}
          <h3 
            className={`text-xl font-black mb-2 transition-colors ${
              achievement.unlocked 
                ? 'text-yellow-300 drop-shadow-lg' 
                : 'text-gray-500'
            }`}
            style={{
              transform: 'translateZ(25px)',
              transformStyle: 'preserve-3d',
            }}
          >
            {achievement.title}
          </h3>

          {/* Description */}
          <p 
            className={`text-sm mb-4 font-medium leading-relaxed ${
              achievement.unlocked ? 'text-cyan-200' : 'text-gray-600'
            }`}
            style={{
              transform: 'translateZ(20px)',
              transformStyle: 'preserve-3d',
            }}
          >
            {achievement.description}
          </p>

          {/* Progress Bar */}
          <div 
            className="space-y-2 mt-4"
            style={{
              transform: 'translateZ(15px)',
              transformStyle: 'preserve-3d',
            }}
          >
            <div className="flex items-center justify-between text-sm font-bold">
              <span className={achievement.unlocked ? 'text-purple-300' : 'text-gray-500'}>
                Progress
              </span>
              <span className={achievement.unlocked ? 'text-yellow-300' : 'text-gray-500'}>
                {achievement.progress}/{achievement.total}
              </span>
            </div>
            
            <div className="h-2.5 bg-slate-900/50 rounded-full overflow-hidden border border-slate-700/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                transition={{ duration: 1, delay: idx * 0.05 }}
                className={`h-full bg-gradient-to-r ${colors.gradient} shadow-lg ${colors.glow} relative`}
              >
                {/* Shimmer effect */}
                {isHovered && achievement.progress < achievement.total && (
                  <motion.div
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                )}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: isHovered || achievement.unlocked ? 1 : 0 
              }}
              className={`text-xs font-bold ${achievement.unlocked ? 'text-green-300' : 'text-cyan-300'}`}
            >
              {Math.floor((achievement.progress / achievement.total) * 100)}% Complete
              {achievement.unlocked && ' 🎉'}
            </motion.div>
          </div>
        </div>

        {/* 3D Border Glow */}
        {achievement.unlocked && isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            className={`absolute -inset-1 bg-gradient-to-r ${colors.gradient} rounded-3xl blur-xl -z-10`}
            style={{
              transform: 'translateZ(-10px)',
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
