'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StudyBuddyAdvanced from '@/components/StudyBuddyAdvanced';

export default function StudyBuddyShowcase() {
  const [stats, setStats] = useState({
    studyStreak: 7,
    totalStudyTime: 480,
    completedTasks: 42
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        studyStreak: Math.max(1, prev.studyStreak + Math.floor(Math.random() * 3 - 1)),
        totalStudyTime: prev.totalStudyTime + Math.floor(Math.random() * 20),
        completedTasks: prev.completedTasks + Math.floor(Math.random() * 2)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: '👋', title: 'Welcome Slide', desc: 'Stunning introduction with animated buddy' },
    { icon: '💬', title: 'Chat Interface', desc: 'Real-time conversations with AI' },
    { icon: '📚', title: 'Content Learning', desc: 'Explain, quiz, examples, and more' },
    { icon: '📊', title: 'Progress Stats', desc: 'Real-time stats with smooth animations' },
    { icon: '⚙️', title: 'Settings', desc: 'Customize your experience' },
    { icon: '✨', title: 'Reactbit UI', desc: 'Modern glassmorphism design' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Study Buddy
            </span>
          </h1>
          <p className="text-cyan-300/70 text-xl max-w-2xl mx-auto">
            Advanced AI-powered learning companion with stunning modern UI and separate interactive slides
          </p>
        </motion.div>

        {/* Main Demo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-20 max-w-4xl mx-auto"
        >
          <StudyBuddyAdvanced
            userName="Awesome Learner"
            studyStreak={stats.studyStreak}
            totalStudyTime={stats.totalStudyTime}
            completedTasks={stats.completedTasks}
            generatedContent="Understanding Photosynthesis: The process by which plants convert light energy into chemical energy. This involves two main stages: the light-dependent reactions in the thylakoid membranes and the light-independent reactions (Calvin cycle) in the stroma."
            generationMode="summary"
          />
        </motion.div>

        {/* Features Grid */}
        <div className="mb-20">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-bold text-center bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-12"
          >
            ✨ Advanced Features
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-6 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-cyan-400/20 hover:border-cyan-400/50 transition-all"
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="text-cyan-300 font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-cyan-300/60 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Slide Details */}
        <div className="mb-20">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-bold text-center bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-12"
          >
            🎯 Explore Each Slide
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.15, delayChildren: 0.3 }}
            className="space-y-6"
          >
            {[
              {
                icon: '👋',
                slide: 'Welcome',
                desc: 'Beautiful introduction with animated Study Buddy character, showing key features and quick action buttons to get started',
                features: ['Animated buddy emoji', 'Feature highlights', 'Quick start button']
              },
              {
                icon: '💬',
                slide: 'Chat',
                desc: 'Real-time chat interface with smooth message animations, typing indicators, and seamless integration with Gemini AI',
                features: ['Message history', 'Typing animations', 'Emotion indicators']
              },
              {
                icon: '📚',
                slide: 'Learn',
                desc: 'Advanced content interaction tools - explain concepts, generate examples, create quizzes, summarize content, relate topics, and deepen knowledge',
                features: ['6 interaction modes', 'AI-powered responses', 'Content-aware assistance']
              },
              {
                icon: '📊',
                slide: 'Stats',
                desc: 'Real-time progress visualization with smooth animated progress bars, study streaks, accuracy metrics, and engagement tracking',
                features: ['Live metrics', 'Progress bars', 'Achievement tracking']
              },
              {
                icon: '⚙️',
                slide: 'Settings',
                desc: 'Customization options for notifications, theme, language, data export, and other personalization preferences',
                features: ['Notifications', 'Theme options', 'Data export']
              }
            ].map((slide, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.15 }}
                className="p-8 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-cyan-400/20 hover:border-cyan-400/50 transition-all"
              >
                <div className="flex items-start gap-6">
                  <div className="text-5xl">{slide.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent mb-2">
                      {slide.slide}
                    </h3>
                    <p className="text-cyan-300/70 mb-4">{slide.desc}</p>
                    <div className="flex gap-2 flex-wrap">
                      {slide.features.map((feature, fidx) => (
                        <span
                          key={fidx}
                          className="px-3 py-1 text-xs font-semibold bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-400/30"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto p-8 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-cyan-400/20 text-center"
        >
          <h3 className="text-2xl font-bold text-cyan-300 mb-4">🛠️ Built With</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {['React', 'Framer Motion', 'Tailwind CSS', 'Gemini AI', 'TypeScript', 'Next.js'].map((tech, idx) => (
              <motion.span
                key={idx}
                whileHover={{ scale: 1.1 }}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 text-cyan-300 rounded-lg border border-cyan-400/50 font-semibold"
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
