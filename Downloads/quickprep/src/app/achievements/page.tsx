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
  progress?: number;
  total?: number;
  unlockedAt?: number;
}

export default function AchievementsPage() {
  const [streak, setStreak] = useState(0);
  const [totalGenerations, setTotalGenerations] = useState(0);
  const [notification, setNotification] = useState<{ message: string; icon: string } | null>(null);
  const [hoveredAchievement, setHoveredAchievement] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 'first-gen', icon: '🎉', title: 'First Steps', description: 'Generate your first content', unlocked: false },
    { id: 'ten-gen', icon: '🔥', title: 'Getting Started', description: 'Generate 10 contents', unlocked: false, progress: 0, total: 10 },
    { id: 'fifty-gen', icon: '⚡', title: 'Power User', description: 'Generate 50 contents', unlocked: false, progress: 0, total: 50 },
    { id: 'hundred-gen', icon: '💯', title: 'Century Club', description: 'Generate 100 contents', unlocked: false, progress: 0, total: 100 },
    { id: 'five-hundred-gen', icon: '🌟', title: 'Legend', description: 'Generate 500 contents', unlocked: false, progress: 0, total: 500 },
    { id: 'streak-3', icon: '📅', title: '3-Day Streak', description: 'Study 3 days in a row', unlocked: false, progress: 0, total: 3 },
    { id: 'streak-7', icon: '🌟', title: 'Week Warrior', description: 'Study 7 days in a row', unlocked: false, progress: 0, total: 7 },
    { id: 'streak-30', icon: '👑', title: 'Study Champion', description: 'Study 30 days in a row', unlocked: false, progress: 0, total: 30 },
    { id: 'streak-100', icon: '💎', title: 'Century Streak', description: 'Study 100 days in a row', unlocked: false, progress: 0, total: 100 },
    { id: 'all-modes', icon: '🎨', title: 'Explorer', description: 'Try all generation modes', unlocked: false, progress: 0, total: 6 },
  ]);

  useEffect(() => {
    // Load from localStorage
    const savedStreak = localStorage.getItem('studyStreak');
    const savedTotal = localStorage.getItem('totalGenerations');
    const savedLastStudy = localStorage.getItem('lastStudyDate');
    const savedAchievements = localStorage.getItem('achievements');

    if (savedStreak) setStreak(parseInt(savedStreak));
    if (savedTotal) setTotalGenerations(parseInt(savedTotal));
    if (savedAchievements) setAchievements(JSON.parse(savedAchievements));

    // Check streak
    const today = new Date().toDateString();
    if (savedLastStudy !== today) {
      const lastDate = savedLastStudy ? new Date(savedLastStudy) : new Date();
      const diffDays = Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem('studyStreak', newStreak.toString());
      } else if (diffDays > 1) {
        setStreak(0);
        localStorage.setItem('studyStreak', '0');
      }
      
      localStorage.setItem('lastStudyDate', today);
    }
  }, []);

  useEffect(() => {
    // Update achievements based on progress
    const updated = achievements.map(achievement => {
      if (achievement.id === 'first-gen' && totalGenerations >= 1) {
        return { ...achievement, unlocked: true };
      }
      if (achievement.id === 'ten-gen') {
        return { ...achievement, unlocked: totalGenerations >= 10, progress: Math.min(totalGenerations, 10) };
      }
      if (achievement.id === 'fifty-gen') {
        return { ...achievement, unlocked: totalGenerations >= 50, progress: Math.min(totalGenerations, 50) };
      }
      if (achievement.id === 'hundred-gen') {
        return { ...achievement, unlocked: totalGenerations >= 100, progress: Math.min(totalGenerations, 100) };
      }
      if (achievement.id === 'five-hundred-gen') {
        return { ...achievement, unlocked: totalGenerations >= 500, progress: Math.min(totalGenerations, 500) };
      }
      if (achievement.id === 'streak-3') {
        return { ...achievement, unlocked: streak >= 3, progress: Math.min(streak, 3) };
      }
      if (achievement.id === 'streak-7') {
        return { ...achievement, unlocked: streak >= 7, progress: Math.min(streak, 7) };
      }
      if (achievement.id === 'streak-30') {
        return { ...achievement, unlocked: streak >= 30, progress: Math.min(streak, 30) };
      }
      if (achievement.id === 'streak-100') {
        return { ...achievement, unlocked: streak >= 100, progress: Math.min(streak, 100) };
      }
      return achievement;
    });

    setAchievements(updated);
    localStorage.setItem('achievements', JSON.stringify(updated));
  }, [totalGenerations, streak]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header with Back Button */}
      <div className="border-b border-purple-500/20 sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 transition-all"
              title="Back to Dashboard"
            >
              ←
            </Link>
            <div>
              <h1 className="text-4xl font-black text-yellow-300 flex items-center gap-3 drop-shadow-lg">
                <span className="text-5xl">🏆</span>
                Achievements
              </h1>
              <p className="text-cyan-300 text-sm font-bold mt-1">Track your study progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600 to-red-600 p-8 shadow-2xl shadow-orange-500/20 border border-orange-400/40 group hover:shadow-2xl hover:shadow-orange-500/40 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <p className="text-yellow-200 text-sm font-bold uppercase tracking-wider mb-3">Current Streak</p>
              <p className="text-6xl font-black text-white mb-3">{streak}</p>
              <div className="flex items-center gap-2">
                <span className="text-4xl">🔥</span>
                <p className="text-orange-100 font-semibold">Days Active</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 p-8 shadow-2xl shadow-purple-500/20 border border-purple-400/40 group hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <p className="text-cyan-200 text-sm font-bold uppercase tracking-wider mb-3">Progress</p>
              <p className="text-6xl font-black text-white mb-3">{unlockedCount}/{achievements.length}</p>
              <div className="flex items-center gap-2">
                <span className="text-4xl">🎯</span>
                <p className="text-purple-100 font-semibold">Unlocked</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Achievements Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-black text-cyan-300 mb-8 flex items-center gap-3 drop-shadow-lg">
            <span className="w-1.5 h-10 bg-gradient-to-b from-yellow-400 to-orange-400 rounded-full"></span>
            All Achievements
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, idx) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                onMouseEnter={() => setHoveredAchievement(achievement.id)}
                onMouseLeave={() => setHoveredAchievement(null)}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`group relative rounded-2xl border-3 p-8 transition-all duration-300 cursor-pointer ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-purple-900/60 to-pink-900/60 border-purple-400/70 shadow-lg shadow-purple-500/30 hover:border-purple-200 hover:shadow-2xl hover:shadow-purple-500/50'
                    : 'bg-slate-800/60 border-slate-700/60 hover:border-cyan-500/70 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="text-center">
                  <motion.div
                    animate={achievement.unlocked ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                    className={`text-7xl mb-6 filter transition-all duration-300 ${
                      achievement.unlocked ? 'drop-shadow-lg scale-100' : 'grayscale opacity-40 scale-75'
                    }`}
                  >
                    {achievement.icon}
                  </motion.div>
                  
                  <div className="mb-4">
                    <h3 className={`text-2xl font-bold transition-colors mb-2 ${
                      achievement.unlocked 
                        ? 'text-yellow-300 drop-shadow-lg' 
                        : 'text-gray-400'
                    }`}>
                      {achievement.title}
                    </h3>
                    {achievement.unlocked && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-4xl mb-2 inline-block"
                      >
                        ✓
                      </motion.span>
                    )}
                  </div>
                  
                  <p className={`text-sm mb-6 font-medium ${
                    achievement.unlocked ? 'text-cyan-200' : 'text-gray-400'
                  }`}>
                    {achievement.description}
                  </p>
                  
                  {achievement.progress !== undefined && achievement.total && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center text-sm font-bold gap-2">
                        <span className="text-purple-300">Progress</span>
                        <motion.span
                          key={`${achievement.id}-progress`}
                          initial={{ scale: 1.2 }}
                          animate={{ scale: 1 }}
                          className="text-yellow-300 drop-shadow-lg text-lg"
                        >
                          {achievement.progress}/{achievement.total}
                        </motion.span>
                      </div>
                      <div className="h-3 bg-slate-700/60 rounded-full overflow-hidden border-2 border-slate-600/50">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.08 }}
                          className="h-full bg-gradient-to-r from-cyan-500 via-yellow-500 to-orange-500 shadow-lg shadow-cyan-500/50"
                        />
                      </div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: hoveredAchievement === achievement.id ? 1 : 0 }}
                        className="text-xs font-bold text-cyan-300 mt-2"
                      >
                        {Math.floor((achievement.progress / achievement.total) * 100)}% Complete
                      </motion.div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Achievement Unlock Notification */}
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

        {/* Motivational Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/60 via-pink-900/60 to-purple-900/60 border-2 border-purple-400/40 p-12 shadow-2xl shadow-purple-500/20"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-pink-500/10 to-purple-500/0"></div>
          <div className="relative z-10 text-center">
            <p className="text-2xl font-bold text-cyan-300 leading-relaxed drop-shadow-lg">
              {unlockedCount === 0 && "🌟 Start your journey! Generate content to unlock achievements."}
              {unlockedCount > 0 && unlockedCount < 3 && "🚀 Great momentum! Keep going!"}
              {unlockedCount >= 3 && unlockedCount < 6 && "💪 You're crushing it!"}
              {unlockedCount >= 6 && unlockedCount < achievements.length && "⭐ Nearly there!"}
              {unlockedCount === achievements.length && "👑 Champion achieved!"}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
