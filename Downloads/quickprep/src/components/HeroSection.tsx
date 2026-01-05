'use client';

import React from 'react';
import { motion } from 'framer-motion';

const HeroSection: React.FC = () => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' as const },
    },
  };

  return (
    <section className="hero-section">
      {/* Animated Background */}
      <div className="hero-background">
        <motion.div 
          className="gradient-orb orb-1" 
          animate={{ y: [0, 50, 0], x: [0, 30, 0] }} 
          transition={{ duration: 8, repeat: Infinity }} 
        />
        <motion.div 
          className="gradient-orb orb-2" 
          animate={{ y: [0, -50, 0], x: [0, -30, 0] }} 
          transition={{ duration: 10, repeat: Infinity }} 
        />
        <motion.div 
          className="gradient-orb orb-3" 
          animate={{ y: [0, 30, 0], x: [0, -50, 0] }} 
          transition={{ duration: 12, repeat: Infinity }} 
        />
      </div>

      <div className="hero-content">
        <motion.div variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="hero-badge">
          <span className="badge-icon">✨</span>
          <span>AI-Powered Study Assistant</span>
        </motion.div>

        <motion.h1 variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="hero-title">
          Master <span className="gradient-text">Any Subject</span> in <span className="highlight">Minutes</span>
        </motion.h1>

        <motion.p variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="hero-subtitle">
          Transform your notes into personalized study materials. Get summaries, flashcards, quizzes, and mind maps powered by advanced AI—all tailored to your learning style.
        </motion.p>

        <motion.div variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="hero-features">
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <div>
              <h3>Lightning Fast</h3>
              <p>Generate content in seconds</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🎯</div>
            <div>
              <h3>Smart Learning</h3>
              <p>Adaptive study paths</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🤝</div>
            <div>
              <h3>Collaborative</h3>
              <p>Study with friends</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="hero-cta">
          <button className="cta-button primary">
            <span>Start Learning Now</span>
            <span className="arrow">→</span>
          </button>
          <button className="cta-button secondary">
            Watch Demo
          </button>
        </motion.div>

        <motion.div variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="hero-stats">
          <div className="stat">
            <span className="stat-value">10K+</span>
            <span className="stat-label">Students</span>
          </div>
          <div className="divider"></div>
          <div className="stat">
            <span className="stat-value">50K+</span>
            <span className="stat-label">Generated Materials</span>
          </div>
          <div className="divider"></div>
          <div className="stat">
            <span className="stat-value">4.9★</span>
            <span className="stat-label">Rating</span>
          </div>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <motion.div className="floating-element element-1" animate={{ y: [0, -30, 0] }} transition={{ duration: 6, repeat: Infinity }}>
        <div className="card-preview">
          <div className="preview-icon">📚</div>
          <div className="preview-text">Summaries</div>
        </div>
      </motion.div>
      <motion.div className="floating-element element-2" animate={{ y: [0, -30, 0] }} transition={{ duration: 8, repeat: Infinity, delay: 1 }}>
        <div className="card-preview">
          <div className="preview-icon">🧠</div>
          <div className="preview-text">Mind Maps</div>
        </div>
      </motion.div>
      <motion.div className="floating-element element-3" animate={{ y: [0, -30, 0] }} transition={{ duration: 7, repeat: Infinity, delay: 2 }}>
        <div className="card-preview">
          <div className="preview-icon">✅</div>
          <div className="preview-text">Quizzes</div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
