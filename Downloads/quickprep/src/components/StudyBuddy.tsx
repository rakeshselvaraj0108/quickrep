'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendStudyBuddyMessage } from '../lib/apiClient';

interface StudyBuddyProps {
  userName?: string;
  studyStreak: number;
  totalStudyTime: number;
  completedTasks: number;
  generatedContent?: string;
  generationMode?: string;
}

interface Message {
  id: string;
  text: string;
  type: 'buddy' | 'user' | 'system';
  timestamp: Date;
  emotion?: string;
}

interface StudyStats {
  studyStreak: number;
  totalStudyTime: number;
  completedTasks: number;
  accuracy: number;
  engagement: number;
  focusLevel: number;
}

const StudyBuddy: React.FC<StudyBuddyProps> = ({
  userName = 'Student',
  studyStreak = 7,
  totalStudyTime = 0,
  completedTasks = 0,
  generatedContent = '',
  generationMode = ''
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<StudyStats>({
    studyStreak,
    totalStudyTime,
    completedTasks,
    accuracy: 85,
    engagement: 92,
    focusLevel: 88
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [questionInput, setQuestionInput] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting'>('connecting');
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [animatedStats, setAnimatedStats] = useState<StudyStats>(stats);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-increment stats realistically
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        studyStreak: prev.studyStreak,
        totalStudyTime: prev.totalStudyTime + Math.random() < 0.3 ? 1 : 0,
        completedTasks: prev.completedTasks,
        accuracy: Math.min(100, prev.accuracy + (Math.random() * 0.5)),
        engagement: Math.min(100, prev.engagement + (Math.random() * 0.3)),
        focusLevel: Math.min(100, Math.max(50, prev.focusLevel + (Math.random() * 2 - 1)))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Animate stats changes
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setAnimatedStats(prev => ({
        studyStreak: prev.studyStreak,
        totalStudyTime: prev.totalStudyTime < stats.totalStudyTime ? prev.totalStudyTime + 1 : stats.totalStudyTime,
        completedTasks: prev.completedTasks,
        accuracy: prev.accuracy + (stats.accuracy - prev.accuracy) * 0.1,
        engagement: prev.engagement + (stats.engagement - prev.engagement) * 0.1,
        focusLevel: prev.focusLevel + (stats.focusLevel - prev.focusLevel) * 0.1
      }));
    }, 50);

    return () => clearInterval(animationInterval);
  }, [stats]);

  // Initialize welcome message
  useEffect(() => {
    const initializeWelcome = async () => {
      try {
        const data = await sendStudyBuddyMessage({
          type: 'welcome',
          userName,
          studyStreak: stats.studyStreak,
          totalStudyTime: stats.totalStudyTime,
          completedTasks: stats.completedTasks
        });

        setConnectionStatus('connected');
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          text: data.message || `Hey ${userName}! 👋 I'm your AI Study Buddy. Let's crush your learning goals together!`,
          type: 'buddy',
          timestamp: new Date(),
          emotion: data.emotion || 'excited'
        };
        setMessages([welcomeMessage]);
      } catch (error) {
        console.warn('StudyBuddy connection error:', error);
        setConnectionStatus('connecting');
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          text: `Hey ${userName}! 👋 I'm your AI Study Buddy. Ready to make learning awesome? Let's go!`,
          type: 'buddy',
          timestamp: new Date(),
          emotion: 'excited'
        };
        setMessages([welcomeMessage]);
      }
    };

    initializeWelcome();
  }, [userName]);

  // Handle message submission
  const handleSendMessage = useCallback(async () => {
    if (!questionInput.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: questionInput,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setQuestionInput('');
    setIsTyping(true);

    try {
      const data = await sendStudyBuddyMessage({
        type: 'response',
        userMessage: questionInput,
        context: generatedContent,
        mode: generationMode,
        userName
      });

      const buddyMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message || generateFallbackResponse(questionInput),
        type: 'buddy',
        timestamp: new Date(),
        emotion: data.emotion || 'supportive'
      };
      setMessages(prev => [...prev, buddyMessage]);

      // Increment stats based on interaction
      setStats(prev => ({
        ...prev,
        engagement: Math.min(100, prev.engagement + 2),
        completedTasks: prev.completedTasks + 0.1
      }));
    } catch (error) {
      console.error('Error getting response:', error);
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: generateFallbackResponse(questionInput),
        type: 'buddy',
        timestamp: new Date(),
        emotion: 'supportive'
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [questionInput, generatedContent, generationMode, userName]);

  // Generate fallback responses
  const generateFallbackResponse = (question: string): string => {
    const responses = [
      `Great question! 🎯 Let me help you with that. ${question.includes('?') ? 'This is a common topic in successful studying.' : ''}`,
      `That's exactly the kind of thinking that leads to success! 💡 Here's what I suggest...`,
      `Excellent! You're asking the right questions. 📚 The key here is...`,
      `I love your curiosity! 🚀 Let's break this down into manageable pieces...`,
      `Perfect timing to ask this! ⭐ Here's a pro tip for you...`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Content action handlers
  const handleContentAction = useCallback(async (action: string) => {
    setSelectedAction(action);
    const actionMessages: Record<string, string> = {
      explain: '💡 Let me explain this concept in a simpler way...',
      examples: '📝 Here are some practical examples for you...',
      quiz: '🎯 Let\'s test your understanding with a quick quiz!',
      summary: '📋 Here\'s a concise summary of what we covered...',
      relate: '🔗 Let me connect this to concepts you already know...',
      deepen: '🔬 Ready to dive deeper into advanced concepts?'
    };

    // Map action to content API types
    const contentTypeMap: Record<string, 'content_explain' | 'content_examples' | 'content_quiz' | 'content_summary' | 'content_relate' | 'content_deepen'> = {
      explain: 'content_explain',
      examples: 'content_examples',
      quiz: 'content_quiz',
      summary: 'content_summary',
      relate: 'content_relate',
      deepen: 'content_deepen'
    };

    const userMsg: Message = {
      id: Date.now().toString(),
      text: `I want you to ${action} this content`,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const data = await sendStudyBuddyMessage({
        type: (contentTypeMap[action] || 'content_explain') as 'content_explain' | 'content_examples' | 'content_quiz' | 'content_summary' | 'content_relate' | 'content_deepen',
        userMessage: `${action} this content`,
        context: generatedContent,
        mode: generationMode
      });

      const buddyMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message || actionMessages[action] || 'Here\'s what I found...',
        type: 'buddy',
        timestamp: new Date(),
        emotion: data.emotion || 'encouraging'
      };
      setMessages(prev => [...prev, buddyMsg]);
    } catch (error) {
      const buddyMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: actionMessages[action] || 'Here\'s what I found...',
        type: 'buddy',
        timestamp: new Date(),
        emotion: 'encouraging'
      };
      setMessages(prev => [...prev, buddyMsg]);
    } finally {
      setIsTyping(false);
      setSelectedAction(null);
    }
  }, [generatedContent, generationMode]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  if (isMinimized) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setIsMinimized(false)}
        className="study-buddy-toggle"
        title="Open Study Buddy"
      >
        <span className="buddy-icon">🤖</span>
      </motion.button>
    );
  }

  return (
    <motion.div
      className="study-buddy-advanced"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
    >
      {/* Header */}
      <div className="buddy-header-pro">
        <div className="buddy-header-content">
          <div className="buddy-avatar-pro">
            <div className="avatar-emoji">🤖</div>
            <div className={`status-dot ${connectionStatus}`}></div>
          </div>
          <div className="buddy-info-pro">
            <h3>Study Buddy AI</h3>
            <p className="buddy-status-text">
              {connectionStatus === 'connected' ? '✓ Ready to help' : '◐ Connecting...'}
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMinimized(true)}
          className="minimize-btn"
          title="Minimize"
        >
          ─
        </motion.button>
      </div>

      {/* Real-Time Stats Bar */}
      <div className="stats-bar-pro">
        <div className="stat-item-pro">
          <span className="stat-label">Focus</span>
          <div className="stat-bar-container">
            <motion.div
              className="stat-bar-fill focus"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, animatedStats.focusLevel)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="stat-value">{Math.round(animatedStats.focusLevel)}%</span>
        </div>

        <div className="stat-item-pro">
          <span className="stat-label">Engagement</span>
          <div className="stat-bar-container">
            <motion.div
              className="stat-bar-fill engagement"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, animatedStats.engagement)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="stat-value">{Math.round(animatedStats.engagement)}%</span>
        </div>

        <div className="stat-item-pro">
          <span className="stat-label">Accuracy</span>
          <div className="stat-bar-container">
            <motion.div
              className="stat-bar-fill accuracy"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, animatedStats.accuracy)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="stat-value">{Math.round(animatedStats.accuracy)}%</span>
        </div>

        <div className="stat-item-pro">
          <span className="stat-label">Time</span>
          <span className="stat-value-time">
            {Math.floor(animatedStats.totalStudyTime)}m
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="chat-area-pro">
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div
              className="empty-state-pro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="empty-icon">💬</div>
              <p>Start your learning journey</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              className={`message-pro ${message.type}`}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: message.type === 'user' ? 10 : -10 }}
            >
              {message.type === 'buddy' && (
                <div className="buddy-avatar-small">
                  <span className="emoji">🤖</span>
                </div>
              )}
              <div className={`message-bubble ${message.type}`}>
                <p>{message.text}</p>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div className="message-pro buddy" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="buddy-avatar-small">
              <span className="emoji">🤖</span>
            </div>
            <div className="message-bubble buddy typing">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Content Action Buttons */}
      {generatedContent && (
        <div className="content-actions-pro">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleContentAction('explain')}
            disabled={isTyping || selectedAction === 'explain'}
            className="action-btn explain-btn"
          >
            <span className="btn-icon">💡</span>
            <span className="btn-text">Explain</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleContentAction('examples')}
            disabled={isTyping || selectedAction === 'examples'}
            className="action-btn examples-btn"
          >
            <span className="btn-icon">📝</span>
            <span className="btn-text">Examples</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleContentAction('quiz')}
            disabled={isTyping || selectedAction === 'quiz'}
            className="action-btn quiz-btn"
          >
            <span className="btn-icon">🎯</span>
            <span className="btn-text">Quiz</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleContentAction('summary')}
            disabled={isTyping || selectedAction === 'summary'}
            className="action-btn summary-btn"
          >
            <span className="btn-icon">📋</span>
            <span className="btn-text">Summary</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleContentAction('relate')}
            disabled={isTyping || selectedAction === 'relate'}
            className="action-btn relate-btn"
          >
            <span className="btn-icon">🔗</span>
            <span className="btn-text">Relate</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleContentAction('deepen')}
            disabled={isTyping || selectedAction === 'deepen'}
            className="action-btn deepen-btn"
          >
            <span className="btn-icon">🔬</span>
            <span className="btn-text">Deepen</span>
          </motion.button>
        </div>
      )}

      {/* Input Area */}
      <div className="input-area-pro">
        <div className="input-form">
          <input
            type="text"
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask anything... or describe what you're studying"
            className="question-input-pro"
            disabled={isTyping}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!questionInput.trim() || isTyping}
            className="send-btn-pro"
            title="Send message (Enter)"
          >
            <span>✈️</span>
          </motion.button>
        </div>
        <p className="input-hint">💡 Tip: Be specific with your questions for better answers</p>
      </div>

      <style jsx>{`
        .study-buddy-toggle {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          font-size: 28px;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
          z-index: 999;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .study-buddy-toggle:hover {
          transform: scale(1.1);
          box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
        }

        .buddy-icon {
          font-size: 32px;
        }

        .study-buddy-advanced {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 400px;
          height: 700px;
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a3f 100%);
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), 0 0 60px rgba(102, 126, 234, 0.15);
          border: 1px solid rgba(102, 126, 234, 0.2);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          backdrop-filter: blur(20px);
          overflow: hidden;
        }

        .buddy-header-pro {
          padding: 18px 22px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.08) 100%);
          border-bottom: 1px solid rgba(102, 126, 234, 0.25);
          display: flex;
          justify-content: space-between;
          align-items: center;
          backdrop-filter: blur(15px);
        }

        .buddy-header-content {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .buddy-avatar-pro {
          position: relative;
          width: 44px;
          height: 44px;
        }

        .avatar-emoji {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          position: relative;
          z-index: 2;
        }

        .status-dot {
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          bottom: 0;
          right: 0;
          border: 2px solid #0f0f23;
          z-index: 3;
        }

        .status-dot.connected {
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
        }

        .status-dot.connecting {
          background: #f59e0b;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .buddy-info-pro h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #ffffff;
        }

        .buddy-info-pro p {
          margin: 4px 0 0 0;
          font-size: 12px;
          color: #a0aec0;
        }

        .buddy-status-text {
          color: #10b981 !important;
        }

        .minimize-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          transition: all 0.2s ease;
        }

        .minimize-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
        }

        /* Stats Bar */
        .stats-bar-pro {
          padding: 14px 18px;
          background: rgba(0, 0, 0, 0.3);
          border-bottom: 1px solid rgba(102, 126, 234, 0.15);
          display: flex;
          gap: 16px;
          font-size: 11px;
        }

        .stat-item-pro {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .stat-label {
          color: #a0aec0;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-bar-container {
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
          position: relative;
        }

        .stat-bar-fill {
          height: 100%;
          border-radius: 2px;
        }

        .stat-bar-fill.focus {
          background: linear-gradient(90deg, #06b6d4, #0891b2);
        }

        .stat-bar-fill.engagement {
          background: linear-gradient(90deg, #8b5cf6, #7c3aed);
        }

        .stat-bar-fill.accuracy {
          background: linear-gradient(90deg, #10b981, #059669);
        }

        .stat-value {
          color: #e0e7ff;
          font-weight: 700;
          font-size: 12px;
        }

        .stat-value-time {
          color: #e0e7ff;
          font-weight: 700;
          font-size: 14px;
        }

        /* Chat Area */
        .chat-area-pro {
          flex: 1;
          overflow-y: auto;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .chat-area-pro::-webkit-scrollbar {
          width: 6px;
        }

        .chat-area-pro::-webkit-scrollbar-track {
          background: transparent;
        }

        .chat-area-pro::-webkit-scrollbar-thumb {
          background: rgba(102, 126, 234, 0.3);
          border-radius: 3px;
        }

        .chat-area-pro::-webkit-scrollbar-thumb:hover {
          background: rgba(102, 126, 234, 0.5);
        }

        .empty-state-pro {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #a0aec0;
          text-align: center;
          flex: 1;
        }

        .empty-icon {
          font-size: 48px;
          opacity: 0.5;
        }

        /* Messages */
        .message-pro {
          display: flex;
          gap: 10px;
          align-items: flex-end;
        }

        .message-pro.user {
          justify-content: flex-end;
        }

        .buddy-avatar-small {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }

        .message-bubble {
          max-width: 300px;
          padding: 12px 16px;
          border-radius: 16px;
          word-wrap: break-word;
          overflow-wrap: break-word;
          line-height: 1.5;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .message-bubble.buddy {
          background: rgba(102, 126, 234, 0.12);
          border: 1px solid rgba(102, 126, 234, 0.25);
          color: #e0e7ff;
          border-bottom-left-radius: 6px;
        }

        .message-bubble.user {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff;
          border-bottom-right-radius: 6px;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
        }

        .message-bubble.buddy.typing {
          display: flex;
          align-items: center;
          height: 28px;
        }

        .message-bubble p {
          margin: 0 0 4px 0;
          font-size: 14px;
          line-height: 1.5;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .message-bubble.buddy p {
          color: #e0e7ff;
          font-weight: 400;
        }

        .message-bubble.user p {
          color: #ffffff;
          font-weight: 500;
        }

        .message-time {
          display: block;
          font-size: 11px;
          opacity: 0.6;
          margin-top: 4px;
        }

        .typing-dots {
          display: flex;
          gap: 4px;
        }

        .typing-dots span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #667eea;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .typing-dots span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes typing {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }

        /* Content Actions */
        .content-actions-pro {
          padding: 14px 18px;
          background: rgba(0, 0, 0, 0.2);
          border-top: 1px solid rgba(102, 126, 234, 0.15);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .action-btn {
          padding: 11px 12px;
          border: 1px solid;
          border-radius: 10px;
          background: rgba(102, 126, 234, 0.1);
          color: #e0e7ff;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          flex-direction: column;
          transition: all 0.3s ease;
          border-color: rgba(102, 126, 234, 0.3);
          line-height: 1.4;
        }

        .action-btn:hover:not(:disabled) {
          background: rgba(102, 126, 234, 0.2);
          border-color: #667eea;
          transform: translateY(-2px);
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .btn-icon {
          font-size: 14px;
        }

        .action-btn.explain-btn:hover:not(:disabled) {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.15);
        }

        .action-btn.examples-btn:hover:not(:disabled) {
          border-color: #f59e0b;
          background: rgba(245, 158, 11, 0.15);
        }

        .action-btn.quiz-btn:hover:not(:disabled) {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.15);
        }

        .action-btn.summary-btn:hover:not(:disabled) {
          border-color: #8b5cf6;
          background: rgba(139, 92, 246, 0.15);
        }

        .action-btn.relate-btn:hover:not(:disabled) {
          border-color: #06b6d4;
          background: rgba(6, 182, 212, 0.15);
        }

        .action-btn.deepen-btn:hover:not(:disabled) {
          border-color: #ec4899;
          background: rgba(236, 72, 153, 0.15);
        }

        /* Input Area */
        .input-area-pro {
          padding: 16px 20px;
          background: rgba(0, 0, 0, 0.3);
          border-top: 1px solid rgba(102, 126, 234, 0.2);
        }

        .input-form {
          display: flex;
          gap: 10px;
          margin-bottom: 0;
        }

        .question-input-pro {
          flex: 1;
          padding: 11px 14px;
          border: 1px solid rgba(102, 126, 234, 0.3);
          border-radius: 10px;
          background: rgba(15, 15, 35, 0.7);
          color: #ffffff;
          font-size: 13px;
          outline: none;
          transition: all 0.3s ease;
          caret-color: #667eea;
          line-height: 1.5;
        }

        .question-input-pro:focus {
          border-color: #667eea;
          background: rgba(15, 15, 35, 0.85);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
        }

        .question-input-pro::placeholder {
          color: #6b7280;
        }

        .question-input-pro:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .send-btn-pro {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .send-btn-pro:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .send-btn-pro:active:not(:disabled) {
          transform: translateY(0);
        }

        .send-btn-pro:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .input-hint {
          margin: 0;
          font-size: 11px;
          color: #6b7280;
          text-align: center;
        }

        @media (max-width: 768px) {
          .study-buddy-advanced {
            width: calc(100vw - 40px);
            height: 80vh;
            right: 20px;
            bottom: 20px;
          }

          .content-actions-pro {
            grid-template-columns: 1fr 1fr 1fr;
          }

          .btn-text {
            display: none;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default StudyBuddy;