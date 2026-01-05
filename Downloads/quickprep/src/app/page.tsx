'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import PixelBlast from '@/components/PixelBlast';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="home-container">
      {/* PixelBlast Background */}
      <div className="pixel-blast-wrapper">
        <PixelBlast
          variant="square"
          pixelSize={3}
          color="#667EEA"
          patternScale={2}
          patternDensity={1}
          enableRipples={true}
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.2}
          edgeFade={0.6}
          noiseAmount={0.15}
          transparent={true}
        />
      </div>

      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="logo">
            <span className="logo-icon">📚</span>
            <span className="logo-text">QuickPrep</span>
          </div>
          <div className="nav-links">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="nav-link">Dashboard</Link>
                <button onClick={() => {
                  localStorage.removeItem('token');
                  setIsLoggedIn(false);
                  router.push('/');
                }} className="nav-button logout">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="nav-link">Login</Link>
                <Link href="/register" className="nav-button signup">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-left">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="hero-title">
              Learn Smarter, Not Harder
            </h1>
            <p className="hero-subtitle">
              AI-powered study companion that transforms your notes into interactive flashcards, quizzes, and personalized learning paths.
            </p>
            <div className="hero-buttons">
              {isLoggedIn ? (
                <Link href="/dashboard" className="btn-primary">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/register" className="btn-primary">
                    Get Started Free
                  </Link>
                  <Link href="/login" className="btn-secondary">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>

        <div className="hero-right">
          <motion.div
            className="floating-card card-1"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="card-icon">🎴</span>
            <span className="card-text">Flashcards</span>
          </motion.div>
          <motion.div
            className="floating-card card-2"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <span className="card-icon">🧠</span>
            <span className="card-text">AI Learning</span>
          </motion.div>
          <motion.div
            className="floating-card card-3"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <span className="card-icon">📊</span>
            <span className="card-text">Analytics</span>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title">Powerful Features</h2>
        <div className="features-grid">
          <FeatureCard
            icon="🎴"
            title="Smart Flashcards"
            description="Convert your notes into flashcards using AI. Perfect spaced repetition algorithm helps you remember better."
          />
          <FeatureCard
            icon="🧪"
            title="Interactive Quizzes"
            description="Test your knowledge with AI-generated quizzes. Get instant feedback and understand your weak areas."
          />
          <FeatureCard
            icon="🗺️"
            title="Mind Maps"
            description="Visualize your learning with intelligent mind maps. See connections between concepts."
          />
          <FeatureCard
            icon="📊"
            title="Analytics & Stats"
            description="Track your progress with detailed analytics. Monitor your learning streaks and improvement."
          />
          <FeatureCard
            icon="🤝"
            title="Collaborative Learning"
            description="Study with friends in real-time. Share notes and learn together with our study buddy feature."
          />
          <FeatureCard
            icon="⚡"
            title="Quick Summaries"
            description="Get concise summaries of your notes. Save time and focus on what matters."
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <Step number={1} title="Upload Notes" description="Paste your notes or upload study materials" />
          <Step number={2} title="Choose Mode" description="Select flashcards, quiz, or mind map" />
          <Step number={3} title="Study Smart" description="Learn with AI-powered interactive tools" />
          <Step number={4} title="Track Progress" description="Monitor your learning journey" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <motion.div
          className="cta-content"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2>Ready to Transform Your Learning?</h2>
          <p>Join thousands of students who are already learning smarter with QuickPrep</p>
          {!isLoggedIn && (
            <Link href="/register" className="btn-primary btn-large">
              Start Free Trial
            </Link>
          )}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>QuickPrep</h4>
            <p>AI-powered study companion for smarter learning</p>
          </div>
          <div className="footer-section">
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#about">About</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 QuickPrep. All rights reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .home-container {
          background: var(--bg-gradient);
          color: var(--text-primary);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        .pixel-blast-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: all;
        }

        .home-container::before {
          content: '';
          position: fixed;
          top: -50%;
          right: -50%;
          width: 1000px;
          height: 1000px;
          background: radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 1;
        }

        .home-container::after {
          content: '';
          position: fixed;
          bottom: -50%;
          left: -50%;
          width: 1000px;
          height: 1000px;
          background: radial-gradient(circle, rgba(118, 75, 162, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 1;
        }

        .loading {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
        }

        /* Navbar */
        .navbar {
          background: rgba(15, 15, 35, 0.6);
          backdrop-filter: blur(30px);
          border-bottom: 1px solid rgba(102, 126, 234, 0.15);
          position: sticky;
          top: 0;
          z-index: 1000;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
        }

        .navbar-content {
          width: 100%;
          padding: 20px 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 1;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 24px;
          font-weight: 800;
          color: white;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .logo:hover {
          transform: scale(1.05);
        }

        .logo-icon {
          font-size: 32px;
          display: flex;
          align-items: center;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .nav-link {
          color: #e0e7ff;
          text-decoration: none;
          font-weight: 500;
          font-size: 15px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          transition: width 0.3s ease;
        }

        .nav-link:hover {
          color: #8b5cf6;
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .nav-button {
          padding: 10px 24px;
          border-radius: 12px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 14px;
        }

        .nav-button.signup {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .nav-button.signup:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(102, 126, 234, 0.5);
        }

        .nav-button.logout {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #ffffff;
          border: 1px solid #ef4444;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
          font-weight: 700;
        }

        .nav-button.logout:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(239, 68, 68, 0.6);
          background: linear-gradient(135deg, #dc2626, #b91c1c);
        }

        /* Hero Section */
        .hero {
          width: 100%;
          height: calc(100vh - 80px);
          display: grid;
          grid-template-columns: 1fr 1fr;
          position: relative;
          z-index: 1;
          overflow: hidden;
          gap: 0;
          margin: 0;
          padding: 0;
        }

        .hero-left {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: 0 60px;
          background: transparent;
          position: relative;
          z-index: 2;
        }

        .hero-content {
          display: flex;
          flex-direction: column;
          gap: 32px;
          max-width: 550px;
        }

        .hero-title {
          font-size: 72px;
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -2px;
          color: var(--text-primary);
          transition: color 0.3s ease;
        }

        .hero-subtitle {
          font-size: 20px;
          color: var(--text-secondary);
          line-height: 1.8;
          font-weight: 400;
          transition: color 0.3s ease;
        }

        .hero-buttons {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        .btn-primary {
          padding: 16px 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 700;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: none;
          cursor: pointer;
          font-size: 16px;
          display: inline-block;
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.35);
          position: relative;
          overflow: hidden;
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .btn-primary:hover::before {
          left: 100%;
        }

        .btn-primary:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(102, 126, 234, 0.5);
        }

        .btn-secondary {
          padding: 16px 40px;
          background: rgba(139, 92, 246, 0.12);
          color: #c4b5fd;
          text-decoration: none;
          border: 2px solid rgba(139, 92, 246, 0.4);
          border-radius: 12px;
          font-weight: 700;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
          font-size: 16px;
          display: inline-block;
        }

        .btn-secondary:hover {
          background: rgba(139, 92, 246, 0.25);
          border-color: rgba(139, 92, 246, 0.7);
          transform: translateY(-4px);
        }

        .btn-large {
          padding: 18px 48px;
          font-size: 18px;
        }

        .hero-right {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 60px;
          background: transparent;
          z-index: 2;
        }

        .floating-card {
          position: absolute;
          padding: 24px 32px;
          background: rgba(102, 126, 234, 0.08);
          border: 1px solid rgba(102, 126, 234, 0.25);
          border-radius: 16px;
          backdrop-filter: blur(30px);
          font-weight: 700;
          font-size: 16px;
          animation: float 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.15);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .floating-card:hover {
          background: rgba(102, 126, 234, 0.15);
          border-color: rgba(102, 126, 234, 0.4);
          box-shadow: 0 12px 40px rgba(102, 126, 234, 0.25);
          transform: scale(1.05);
        }

        .card-icon {
          font-size: 28px;
        }

        .card-text {
          font-size: 15px;
          color: #e0e7ff;
        }

        .card-1 {
          top: 80px;
          left: 20px;
          animation-delay: 0s;
        }

        .card-2 {
          top: 240px;
          right: 60px;
          animation-delay: 0.8s;
        }

        .card-3 {
          bottom: 100px;
          left: 80px;
          animation-delay: 1.6s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(2deg); }
        }

        /* Features Section */
        .features {
          width: 100%;
          padding: 120px 80px;
          position: relative;
          z-index: 1;
        }

        .section-title {
          font-size: 50px;
          font-weight: 900;
          text-align: center;
          margin-bottom: 80px;
          background: linear-gradient(135deg, #e0e7ff 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -1px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }

        /* How It Works */
        .how-it-works {
          width: 100%;
          padding: 120px 80px;
          position: relative;
          z-index: 1;
        }

        .steps-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
          position: relative;
        }

        /* CTA Section */
        .cta {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.08) 100%);
          border-top: 1px solid rgba(102, 126, 234, 0.2);
          border-bottom: 1px solid rgba(102, 126, 234, 0.2);
          padding: 120px 80px;
          position: relative;
          z-index: 1;
          backdrop-filter: blur(10px);
          width: 100%;
        }

        .cta-content {
          max-width: 700px;
          margin: 0 auto;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .cta-content h2 {
          font-size: 50px;
          font-weight: 900;
          letter-spacing: -1px;
          background: linear-gradient(135deg, #e0e7ff 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .cta-content p {
          font-size: 20px;
          color: rgba(226, 232, 240, 0.8);
          font-weight: 400;
        }

        /* Footer */
        .footer {
          background: rgba(15, 15, 35, 0.9);
          border-top: 1px solid rgba(102, 126, 234, 0.15);
          padding: 80px 80px 40px;
          position: relative;
          z-index: 1;
          width: 100%;
        }

        .footer-content {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 60px;
          margin-bottom: 50px;
          width: 100%;
        }

        .footer-section h4 {
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 20px;
          color: white;
          letter-spacing: 0.5px;
        }

        .footer-section p,
        .footer-section a {
          font-size: 14px;
          color: rgba(226, 232, 240, 0.6);
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .footer-section ul {
          list-style: none;
        }

        .footer-section li {
          margin-bottom: 12px;
        }

        .footer-section a:hover {
          color: #8b5cf6;
        }

        .footer-bottom {
          padding-top: 40px;
          border-top: 1px solid rgba(102, 126, 234, 0.15);
          text-align: center;
          font-size: 13px;
          color: rgba(226, 232, 240, 0.5);
          width: 100%;
        }

        @media (max-width: 1200px) {
          .navbar-content {
            padding: 16px 60px;
          }

          .hero-left {
            padding: 0 60px;
          }

          .hero-right {
            padding: 0 60px;
          }

          .hero-title {
            font-size: 56px;
          }

          .features {
            padding: 100px 60px;
          }

          .how-it-works {
            padding: 100px 60px;
          }

          .cta {
            padding: 100px 60px;
          }

          .footer {
            padding: 60px 60px 30px;
          }

          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .steps-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .navbar-content {
            padding: 16px 24px;
            flex-direction: column;
            gap: 12px;
          }

          .nav-links {
            width: 100%;
            justify-content: space-between;
            gap: 12px;
          }

          .hero {
            grid-template-columns: 1fr;
            height: auto;
            min-height: 100vh;
          }

          .hero-left {
            padding: 60px 24px;
            justify-content: center;
          }

          .hero-right {
            display: none;
          }

          .hero-title {
            font-size: 40px;
            letter-spacing: -1px;
          }

          .hero-subtitle {
            font-size: 16px;
          }

          .features {
            padding: 60px 24px;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .how-it-works {
            padding: 60px 24px;
          }

          .steps-container {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .cta {
            padding: 60px 24px;
          }

          .footer {
            padding: 50px 24px 25px;
          }

          .footer-content {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .section-title {
            font-size: 32px;
            margin-bottom: 50px;
          }

          .cta-content h2 {
            font-size: 32px;
          }

          .cta-content p {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <motion.div
      className="feature-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      <style jsx>{`
        .feature-card {
          padding: 40px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
          border: 1px solid rgba(102, 126, 234, 0.2);
          border-radius: 20px;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.5), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .feature-card:hover {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
          border-color: rgba(102, 126, 234, 0.4);
          box-shadow: 0 20px 50px rgba(102, 126, 234, 0.2);
          backdrop-filter: blur(10px);
        }

        .feature-card:hover::before {
          opacity: 1;
        }

        .feature-icon {
          font-size: 48px;
          margin-bottom: 24px;
          display: inline-block;
          transition: transform 0.3s ease;
        }

        .feature-card:hover .feature-icon {
          transform: scale(1.15) rotate(5deg);
        }

        .feature-card h3 {
          font-size: 22px;
          font-weight: 800;
          margin-bottom: 14px;
          color: white;
          letter-spacing: -0.3px;
        }

        .feature-card p {
          font-size: 15px;
          color: rgba(226, 232, 240, 0.75);
          line-height: 1.8;
          font-weight: 400;
        }
      `}</style>
    </motion.div>
  );
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <motion.div
      className="step"
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: number * 0.15, duration: 0.4 }}
      whileHover={{ y: -6 }}
    >
      <div className="step-number">{number}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      <style jsx>{`
        .step {
          padding: 40px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
          border: 1px solid rgba(102, 126, 234, 0.2);
          border-radius: 20px;
          text-align: center;
          position: relative;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .step:hover {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
          border-color: rgba(102, 126, 234, 0.4);
          box-shadow: 0 20px 50px rgba(102, 126, 234, 0.2);
        }

        .step-number {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 28px;
          margin: 0 auto 24px;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
          transition: all 0.3s ease;
        }

        .step:hover .step-number {
          transform: scale(1.1);
          box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5);
        }

        .step h3 {
          font-size: 20px;
          font-weight: 800;
          margin-bottom: 12px;
          color: white;
          letter-spacing: -0.3px;
        }

        .step p {
          font-size: 15px;
          color: rgba(226, 232, 240, 0.75);
          font-weight: 400;
          line-height: 1.7;
        }
      `}</style>
    </motion.div>
  );
}
