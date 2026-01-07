'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import NotesTextArea from '../../components/InputArea/NotesTextArea';
import ModeSelector from '../../components/InputArea/ModeSelector';
import GenerateButton from '../../components/Actions/GenerateButton';
import Flashcard from '../../components/Flashcard';
import Quiz from '../../components/Quiz';
import MindMap from '../../components/MindMap';
import ResultPanel from '../../components/Output/ResultPanel';
import LiveStats from '../../components/Stats/LiveStats';
import StudyTimer from '../../components/Timer/StudyTimer';
import StudyBuddy from '../../components/StudyBuddy';
import GamificationAdvanced from '../../components/GamificationAdvanced';
import CollaborativeRooms from '../../components/CollaborativeRooms';
import StudyChart from '../../components/Charts/StudyChart';
import GradientBlinds from '../../components/GradientBlinds';
import ExportButton from '../../components/Export/ExportButton';
import AchievementsPanel from '../../components/Achievements/AchievementsPanel';
import HistoryPanel from '../../components/History/HistoryPanel';
import AutoSave from '../../components/AutoSave/AutoSave';
import SmartSuggestions from '../../components/Suggestions/SmartSuggestions';
import VideoLecture from '../../components/VideoLecture';
import { useToast } from '@/components/Toast/ToastContainer';
import { useLiveStats } from '../../lib/stats';
import { GenerationMode, Flashcard as FlashcardType, Quiz as QuizType, MindMap as MindMapType } from '../../types/ai';
import { generateContent } from '../../lib/apiClient';

const MIN_NOTE_LENGTH = 10;

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [notes, setNotes] = useState<string>('');
  const [mode, setMode] = useState<GenerationMode>('summary');
  const [theme, setTheme] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [quiz, setQuiz] = useState<QuizType | null>(null);
  const [mindmap, setMindmap] = useState<MindMapType | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [studyStreak, setStudyStreak] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [showStudyBuddy, setShowStudyBuddy] = useState(false);
  const [showCollabRooms, setShowCollabRooms] = useState(false);
  const [showVideoLecture, setShowVideoLecture] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const { recordGeneration } = useLiveStats();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || '';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (theme === '') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    setIsLoggedIn(true);
    // In a real app, fetch user data here
    setUser({ name: 'User', email: 'user@example.com' });
  }, [router]);

  const isNotesValid = notes.trim().length >= MIN_NOTE_LENGTH;

  const handleGenerate = async () => {
    if (!isNotesValid) {
      toast.error('Please provide at least 10 characters of notes');
      return;
    }

    setIsLoading(true);
    setError(null);
    setShowResult(false);
    
    // Clear previous results when generating new content
    setFlashcards([]);
    setQuiz(null);
    setMindmap(null);
    setResult('');

    toast.info('Generating content...');
    const startTime = Date.now();

    try {
      const response = await generateContent({
        content: notes,
        mode: mode
      });
      
      const duration = Date.now() - startTime;
      const success = !!response.result || !!response.flashcards || !!response.quiz || !!response.mindmap;
      
      console.log('📦 API Response:', response);
      
      if (mode === 'flashcards') {
        if (response.flashcards && Array.isArray(response.flashcards)) {
          setFlashcards(response.flashcards);
          setResult('');
          toast.success(`Generated ${response.flashcards.length} flashcards!`);
        } else {
          setResult(response.result || 'Failed to parse flashcards. Please try again.');
          toast.warning('Failed to generate flashcards');
        }
      } else if (mode === 'quiz') {
        if (response.quiz && response.quiz.questions) {
          setQuiz(response.quiz);
          setResult('');
          toast.success(`Generated quiz with ${response.quiz.questions.length} questions!`);
        } else {
          setResult(response.result || 'Failed to parse quiz. Please try again.');
          toast.warning('Failed to generate quiz');
        }
      } else if (mode === 'mindmap') {
        if (response.mindmap && response.mindmap.nodes && Array.isArray(response.mindmap.nodes)) {
          setMindmap(response.mindmap);
          setResult('');
          toast.success('Mind map generated successfully!');
        } else {
          setResult('Failed to generate mind map structure. Please try again with different notes.');
          toast.warning('Failed to generate mind map');
        }
      } else {
        setResult(response.result || 'No content generated. Please try again.');
        toast.success('Content generated successfully!');
      }
      setShowResult(true);

      // Save to history
      const historyItem = {
        id: Date.now().toString(),
        mode,
        content: response.result || JSON.stringify(response),
        timestamp: Date.now(),
        preview: notes.slice(0, 100) + '...'
      };
      const existingHistory = JSON.parse(localStorage.getItem('generationHistory') || '[]');
      localStorage.setItem('generationHistory', JSON.stringify([historyItem, ...existingHistory].slice(0, 50)));

      // Update achievements
      const totalGens = parseInt(localStorage.getItem('totalGenerations') || '0') + 1;
      localStorage.setItem('totalGenerations', totalGens.toString());
      
      // Record stats
      await recordGeneration(mode, duration, success);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate content';
      setError(errorMessage);
      
      // Show user-friendly error messages with solutions
      if (errorMessage.includes('quota exceeded') || errorMessage.includes('429')) {
        toast.error('📊 Daily API limit reached (20 requests/day free tier). Your fallback content is ready!', {
          duration: 5000,
          description: 'Upgrade at https://aistudio.google.com to get unlimited requests'
        });
      } else if (errorMessage.includes('503') || errorMessage.includes('overloaded') || errorMessage.includes('Unavailable')) {
        toast.error('🔄 Gemini API is temporarily busy. Retrying...', {
          duration: 3000,
          description: 'Try again in 30 seconds'
        });
      } else if (errorMessage.includes('timeout')) {
        toast.error('⏱️ Request timed out. Try with shorter content.', {
          duration: 4000
        });
      } else {
        toast.error('Error: ' + errorMessage.slice(0, 100));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <>
      {/* GradientBlinds Background - Full Page (outside container) */}
      <GradientBlinds
        gradientColors={['#FF9FFC', '#5227FF', '#140D46']}
        blindCount={16}
        blindMinWidth={8}
        spotlightRadius={150}
        spotlightSoftness={2.5}
        spotlightOpacity={0.4}
        angle={-25}
        noise={0.15}
        distortAmount={0.08}
        mouseDampening={0.1}
        mirrorGradient={true}
        shineDirection="right"
        depth3D={0.8}
        parallaxStrength={1.2}
        volumetricScale={0.6}
      />
      
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <Link href="/" className="logo">
            <span>📚</span> QuickPrep
          </Link>
          <div className="feature-badges">
            <span className="feature-badge" title="AI Study Buddy Available">
              🤖 AI Buddy
            </span>
            <span className="feature-badge google-meet" title="Google Meet Integration">
              📹 Google Meet
            </span>
          </div>
          <div className="header-actions">
            <div className="theme-toggle">
              <button onClick={() => setTheme('')} className={`theme-btn ${theme === '' ? 'active' : ''}`} title="Cosmic Theme">
                🌌
              </button>
              <button onClick={() => setTheme('light')} className={`theme-btn ${theme === 'light' ? 'active' : ''}`} title="Light Theme">
                ☀️
              </button>
              <button onClick={() => setTheme('dark')} className={`theme-btn ${theme === 'dark' ? 'active' : ''}`} title="Dark Theme">
                🌙
              </button>
            </div>
            <div className="user-info">
              <span className="user-name">Welcome, {user?.name}!</span>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                router.push('/');
              }}
              className="logout-btn"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="content-wrapper">
        {/* Left Panel - Input */}
        <motion.div
          className="input-section"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
            <div className="section-card">
              <h2>📝 Your Study Material</h2>
              
              {/* Auto-save Component */}
              <AutoSave value={notes} onRestore={setNotes} />
              
              <NotesTextArea value={notes} onChange={setNotes} />
              
              {/* Smart Suggestions */}
              {notes.length >= 20 && (
                <SmartSuggestions 
                  currentNotes={notes}
                  lastMode={mode}
                  onSelectMode={(suggestedMode) => setMode(suggestedMode as GenerationMode)}
                />
              )}
              
              <h3 style={{ marginTop: '24px' }}>Select Mode</h3>
              <ModeSelector value={mode} onChange={setMode} />

              {error && <div className="error-message">{error}</div>}

              <GenerateButton
                onClick={handleGenerate}
                disabled={!isNotesValid || isLoading}
                loading={isLoading}
                data-action="generate"
              />

              {/* Export Button (shown when there's result) */}
              {showResult && result && (
                <div style={{ marginTop: '16px' }}>
                  <ExportButton 
                    content={result}
                    mode={mode}
                    filename={`quickprep-${mode}-${Date.now()}`}
                  />
                </div>
              )}
              
              <div className="quick-actions">
                <button 
                  className="action-btn buddy-btn"
                  onClick={() => setShowStudyBuddy(!showStudyBuddy)}
                >
                  <span className="btn-icon">🤖</span>
                  <div className="btn-text">
                    <strong>AI Study Buddy</strong>
                    <small>Get instant help & guidance</small>
                  </div>
                </button>
                <button 
                  className="action-btn rooms-btn"
                  onClick={() => setShowCollabRooms(!showCollabRooms)}
                >
                  <span className="btn-icon">📹</span>
                  <div className="btn-text">
                    <strong>Google Meet Rooms</strong>
                    <small>Study with friends online</small>
                  </div>
                </button>
                <button 
                  className="action-btn video-btn"
                  onClick={() => setShowVideoLecture(true)}
                >
                  <span className="btn-icon">🎥</span>
                  <div className="btn-text">
                    <strong>Video Lectures</strong>
                    <small>Learn from YouTube videos</small>
                  </div>
                </button>
              </div>
            </div>

            {/* Study Timer */}
            <div className="section-card" style={{ marginTop: '16px' }}>
              <h2>⏱️ Study Timer</h2>
              <StudyTimer />
            </div>

            {/* Gamification */}
            <div className="section-card" style={{ marginTop: '16px' }}>
              <GamificationAdvanced
                studyTime={totalStudyTime}
                studyStreak={studyStreak}
                completedTasks={completedTasks}
                voiceInputs={0}
                filesUploaded={0}
                exportsGenerated={0}
              />
            </div>
          </motion.div>

          {/* Right Panel - Output */}
          <motion.div
            className="output-section"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Study Chart */}
            <div className="section-card" style={{ marginBottom: '16px' }}>
              <StudyChart />
            </div>

            {showResult ? (
              <div className="result-container">
                {mode === 'flashcards' && flashcards.length > 0 ? (
                  <Flashcard 
                    flashcards={flashcards}
                  />
                ) : mode === 'quiz' && quiz && quiz.questions ? (
                  <Quiz 
                    quiz={quiz}
                  />
                ) : mode === 'mindmap' && mindmap && mindmap.nodes && mindmap.nodes.length > 0 ? (
                  <MindMap data={mindmap} />
                ) : (
                  <ResultPanel 
                    mode={mode}
                    content={result}
                    isLoading={isLoading}
                  />
                )}
              </div>
            ) : (
              <div className="stats-section">
                <h2>📊 Your Stats</h2>
                <LiveStats />
              </div>
            )}
          </motion.div>
        </div>

        {/* AI Study Buddy Modal */}
        {showStudyBuddy && (
          <div className="modal-overlay" onClick={() => setShowStudyBuddy(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowStudyBuddy(false)}>×</button>
              <StudyBuddy 
                userName={user?.name || 'Student'}
                studyStreak={studyStreak}
                totalStudyTime={totalStudyTime}
                completedTasks={completedTasks}
                generatedContent={result}
                generationMode={mode}
              />
            </div>
          </div>
        )}

        {/* Collaborative Rooms Modal */}
        {showCollabRooms && (
          <div className="modal-overlay" onClick={() => setShowCollabRooms(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowCollabRooms(false)}>×</button>
              <CollaborativeRooms 
                currentUser={{ 
                  id: user?.email || 'user', 
                  name: user?.name || 'User',
                  avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=667eea&color=fff`
                }}
                onJoinRoom={(roomId) => console.log('Joined room:', roomId)}
              />
            </div>
          </div>
        )}

        {/* Video Lecture Modal */}
        {showVideoLecture && (
          <VideoLecture onClose={() => setShowVideoLecture(false)} />
        )}
      </main>

      <style jsx global>{`
        /* Hide global AppHeader on dashboard */
        .app-header {
          display: none !important;
        }
        .app-container {
          padding-top: 0 !important;
        }
        
        .dashboard-container {
          position: relative;
          width: 100%;
          min-height: 100vh;
          background: transparent;
          color: #e0e7ff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        .dashboard-header {
          background: #0f0f23;
          backdrop-filter: blur(15px);
          border-bottom: 1px solid rgba(102, 126, 234, 0.2);
          padding: 16px 24px;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.8);
          width: 100%;
          height: 70px;
          display: flex;
          align-items: center;
        }

        .header-content {
          max-width: 1600px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .feature-badges {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .feature-badge {
          padding: 6px 12px;
          background: rgba(139, 92, 246, 0.2);
          border: 1px solid rgba(139, 92, 246, 0.4);
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: #c4b5fd;
          display: flex;
          align-items: center;
          gap: 6px;
          animation: pulse 2s ease-in-out infinite;
        }

        .feature-badge.google-meet {
          background: rgba(59, 130, 246, 0.2);
          border-color: rgba(59, 130, 246, 0.4);
          color: #93c5fd;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .logo {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logo:hover {
          color: #8b5cf6;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .theme-toggle {
          display: flex;
          gap: 8px;
          padding: 4px;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 12px;
          border: 1px solid rgba(102, 126, 234, 0.2);
        }

        .theme-btn {
          padding: 8px 12px;
          background: rgba(102, 126, 234, 0.2);
          border: 1px solid rgba(102, 126, 234, 0.3);
          border-radius: 8px;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .theme-btn:hover {
          background: rgba(102, 126, 234, 0.4);
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .theme-btn:active {
          transform: scale(0.95);
        }

        .theme-btn.active {
          background: rgba(102, 126, 234, 0.6);
          box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
          border-color: rgba(102, 126, 234, 0.6);
        }

        .user-name {
          font-size: 14px;
          color: rgba(226, 232, 240, 0.8);
        }

        .logout-btn {
          padding: 8px 16px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: var(--text-primary);
          border: 1px solid #ef4444;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }

        .logout-btn:hover {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          box-shadow: 0 6px 16px rgba(239, 68, 68, 0.6);
          transform: translateY(-2px);
        }

        .dashboard-main {
          position: relative;
          z-index: 10;
          max-width: 1600px;
          margin: 0 auto;
          padding: 24px;
          padding-top: 100px;
        }

        .content-wrapper {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .section-card {
          background: rgba(15, 15, 35, 0.4);
          border: 1px solid rgba(102, 126, 234, 0.3);
          border-radius: 16px;
          padding: 24px;
          backdrop-filter: blur(15px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
        }

        .section-card:hover {
          background: rgba(15, 15, 35, 0.5);
          border-color: rgba(139, 92, 246, 0.4);
          box-shadow: 0 12px 40px rgba(139, 92, 246, 0.2);
        }

        .section-card h2 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 16px;
          color: var(--text-primary);
        }

        .section-card h3 {
          font-size: 16px;
          font-weight: 600;
          color: #e0e7ff;
          margin-bottom: 12px;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          padding: 12px;
          border-radius: 8px;
          margin: 16px 0;
          font-size: 13px;
        }

        .output-section {
          min-height: 400px;
        }

        .result-container {
          animation: fadeIn 0.3s ease;
        }

        .stats-section {
          background: rgba(15, 15, 35, 0.5);
          border: 1px solid rgba(102, 126, 234, 0.2);
          border-radius: 16px;
          padding: 24px;
          backdrop-filter: blur(20px);
        }

        .stats-section h2 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 20px;
          color: var(--text-primary);
        }

        .quick-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 20px;
        }

        .action-btn {
          padding: 16px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: 1px solid #667eea;
          border-radius: 12px;
          color: var(--text-primary);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 12px;
          text-align: left;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .action-btn:hover {
          background: linear-gradient(135deg, #5568d3, #6a3d96);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.6);
        }

        .buddy-btn:hover {
          background: linear-gradient(135deg, #8b5cf6, #a855f7);
          box-shadow: 0 8px 24px rgba(139, 92, 246, 0.6);
        }

        .rooms-btn {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border: 1px solid #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .rooms-btn:hover {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.6);
        }

        .video-btn {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          border: 1px solid #8b5cf6;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        }

        .video-btn:hover {
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          box-shadow: 0 8px 24px rgba(139, 92, 246, 0.6);
        }
        }

        .btn-icon {
          font-size: 32px;
          flex-shrink: 0;
        }

        .btn-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .btn-text strong {
          font-size: 15px;
          color: var(--text-primary);
          display: block;
        }

        .btn-text small {
          font-size: 12px;
          color: rgba(226, 232, 240, 0.7);
          font-weight: 400;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
        }

        .modal-content {
          background: rgba(15, 15, 35, 0.95);
          border: 1px solid rgba(102, 126, 234, 0.3);
          border-radius: 20px;
          padding: 32px;
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }

        .modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border: 2px solid #ef4444;
          color: var(--text-primary);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          font-size: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5);
          font-weight: 700;
        }

        .modal-close:hover {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          transform: scale(1.15);
          box-shadow: 0 6px 16px rgba(239, 68, 68, 0.7);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @media (max-width: 1024px) {
          .content-wrapper {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .dashboard-main {
            padding: 12px;
          }

          .section-card {
            padding: 16px;
          }

          .header-content {
            gap: 12px;
          }

          .header-actions {
            gap: 12px;
          }
        }
      `}</style>

      {/* Floating Features */}
      <AchievementsPanel />
      <HistoryPanel />
    </div>
    </>
  );
}
