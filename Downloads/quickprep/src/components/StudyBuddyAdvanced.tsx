'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendStudyBuddyMessage } from '../lib/apiClient';

interface StudyBuddyAdvancedProps {
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

type SlideType = 'welcome' | 'chat' | 'content' | 'stats' | 'settings';

const StudyBuddyAdvanced: React.FC<StudyBuddyAdvancedProps> = ({
  userName = 'Student',
  studyStreak = 7,
  totalStudyTime = 0,
  completedTasks = 0,
  generatedContent = '',
  generationMode = ''
}) => {
  const [currentSlide, setCurrentSlide] = useState<SlideType>('welcome');
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
  const [questionInput, setQuestionInput] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting'>('connecting');
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [animatedStats, setAnimatedStats] = useState<StudyStats>(stats);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const slides: { id: SlideType; label: string; icon: string }[] = [
    { id: 'welcome', label: 'Welcome', icon: '👋' },
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'content', label: 'Learn', icon: '📚' },
    { id: 'stats', label: 'Stats', icon: '📊' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-increment stats
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        studyStreak: prev.studyStreak,
        totalStudyTime: prev.totalStudyTime + (Math.random() < 0.3 ? 1 : 0),
        completedTasks: prev.completedTasks,
        accuracy: Math.min(100, prev.accuracy + Math.random() * 0.5),
        engagement: Math.min(100, prev.engagement + Math.random() * 0.3),
        focusLevel: Math.min(100, Math.max(50, prev.focusLevel + (Math.random() * 2 - 1)))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Animate stats
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

  // Initialize welcome
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

  // Handle message
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

  const slideVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, type: 'spring' as const, stiffness: 300, damping: 30 }
    },
    exit: { opacity: 0, x: -100, transition: { duration: 0.3 } }
  } as const;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring' as const, stiffness: 300, damping: 30 }
    }
  } as const;

  // ============ WELCOME SLIDE ============
  const WelcomeSlide = () => (
    <motion.div
      variants={slideVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="h-full flex flex-col items-center justify-center px-6 py-8"
    >
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="text-8xl mb-6"
      >
        🤖
      </motion.div>

      <h2 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
        Study Buddy
      </h2>

      <p className="text-cyan-300/70 text-center text-lg mb-8 max-w-md">
        Your AI-powered learning companion, ready to help you master any subject
      </p>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 gap-4 mb-12 w-full max-w-md"
      >
        {[
          { icon: '⚡', label: 'Fast', desc: 'Instant answers' },
          { icon: '🧠', label: 'Smart', desc: 'AI-powered' },
          { icon: '🎯', label: 'Focused', desc: 'Goal-oriented' }
        ].map((feature, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            className="text-center p-4 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-cyan-400/20 hover:border-cyan-400/50 transition-all"
          >
            <div className="text-3xl mb-2">{feature.icon}</div>
            <p className="text-cyan-300 font-bold text-sm">{feature.label}</p>
            <p className="text-cyan-300/50 text-xs">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setCurrentSlide('chat')}
        className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/40 transition-all"
      >
        Start Chatting 💬
      </motion.button>
    </motion.div>
  );

  // ============ CHAT SLIDE ============
  const ChatSlide = () => (
    <motion.div
      variants={slideVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="h-full flex flex-col"
    >
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-6 px-4 py-4">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, idx) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-5 py-3 rounded-2xl ${
                  msg.type === 'user'
                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-br-none'
                    : 'bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-cyan-400/30 text-cyan-100 rounded-bl-none'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                {msg.emotion && msg.type === 'buddy' && (
                  <p className="text-xs mt-2 opacity-70">{msg.emotion}</p>
                )}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-cyan-400/30 px-5 py-3 rounded-2xl rounded-bl-none">
                <div className="flex gap-2">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                      className="w-2 h-2 bg-cyan-400 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 flex gap-3">
        <input
          type="text"
          value={questionInput}
          onChange={e => setQuestionInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask me anything..."
          className="flex-1 px-5 py-3 bg-slate-800/50 border border-cyan-400/30 rounded-xl text-cyan-100 placeholder-cyan-400/40 focus:outline-none focus:border-cyan-400/60 transition-all"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSendMessage}
          className="px-5 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl transition-all"
        >
          Send ✈️
        </motion.button>
      </div>
    </motion.div>
  );

  // ============ CONTENT SLIDE ============
  const ContentSlide = () => (
    <motion.div
      variants={slideVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="h-full flex flex-col overflow-y-auto px-4 py-6"
    >
      <h3 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-6">
        📚 Learn Together
      </h3>

      {generatedContent ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3 flex-1"
        >
          {[
            { icon: '💡', label: 'Explain', action: 'explain' },
            { icon: '📝', label: 'Examples', action: 'examples' },
            { icon: '🎯', label: 'Quiz', action: 'quiz' },
            { icon: '📋', label: 'Summary', action: 'summary' },
            { icon: '🔗', label: 'Relate', action: 'relate' },
            { icon: '🔬', label: 'Deepen', action: 'deepen' }
          ].map((item, idx) => (
            <motion.button
              key={idx}
              variants={itemVariants}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleContentAction(item.action)}
              disabled={selectedAction === item.action}
              className="w-full p-4 rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-cyan-400/30 hover:border-cyan-400/60 text-left transition-all disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-cyan-300 font-bold">{item.label}</p>
                  <p className="text-cyan-300/50 text-sm">AI-powered breakdown</p>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex items-center justify-center"
        >
          <div className="text-center">
            <div className="text-5xl mb-3">📚</div>
            <p className="text-cyan-300/70">Generate content first to unlock learning tools</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  // ============ STATS SLIDE ============
  const StatsSlide = () => (
    <motion.div
      variants={slideVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="h-full flex flex-col px-4 py-6"
    >
      <h3 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-6">
        📊 Your Progress
      </h3>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4 flex-1"
      >
        {[
          { label: 'Study Streak', value: Math.floor(animatedStats.studyStreak), icon: '🔥', color: 'from-orange-500 to-red-500' },
          { label: 'Study Time', value: Math.floor(animatedStats.totalStudyTime), icon: '⏱️', color: 'from-cyan-500 to-blue-500', unit: 'min' },
          { label: 'Accuracy', value: Math.floor(animatedStats.accuracy), icon: '🎯', color: 'from-green-500 to-emerald-500', unit: '%' },
          { label: 'Engagement', value: Math.floor(animatedStats.engagement), icon: '⚡', color: 'from-purple-500 to-pink-500', unit: '%' },
          { label: 'Focus Level', value: Math.floor(animatedStats.focusLevel), icon: '🧠', color: 'from-indigo-500 to-blue-500', unit: '%' }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            className="p-4 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-cyan-400/20"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{stat.icon}</span>
                <span className="text-cyan-300 font-bold">{stat.label}</span>
              </div>
              <span className={`text-2xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}{stat.unit || ''}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, stat.value)}%` }}
                transition={{ duration: 1, delay: idx * 0.1 }}
                className={`h-full bg-gradient-to-r ${stat.color}`}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );

  // ============ SETTINGS SLIDE ============
  const SettingsSlide = () => (
    <motion.div
      variants={slideVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="h-full flex flex-col px-4 py-6"
    >
      <h3 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-6">
        ⚙️ Settings
      </h3>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3 flex-1"
      >
        {[
          { icon: '🔔', label: 'Notifications', desc: 'Get reminders to study' },
          { icon: '🌙', label: 'Dark Mode', desc: 'Easy on the eyes' },
          { icon: '🎨', label: 'Theme', desc: 'Customize colors' },
          { icon: '🗣️', label: 'Language', desc: 'Change language' },
          { icon: '📤', label: 'Export Data', desc: 'Download your stats' }
        ].map((setting, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            className="p-4 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-cyan-400/20 hover:border-cyan-400/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl group-hover:scale-110 transition-transform">{setting.icon}</span>
                <div>
                  <p className="text-cyan-300 font-bold">{setting.label}</p>
                  <p className="text-cyan-300/50 text-sm">{setting.desc}</p>
                </div>
              </div>
              <span className="text-cyan-400">→</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="pt-4 border-t border-cyan-400/20">
        <p className="text-cyan-300/50 text-sm text-center">
          Connection Status: {connectionStatus === 'connected' ? '✅ Connected' : '⏳ Connecting...'}
        </p>
      </div>
    </motion.div>
  );

  return (
    <div className="w-full h-96 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-cyan-400/20 overflow-hidden shadow-2xl">
      <div className="flex h-full">
        {/* Sidebar Navigation */}
        <div className="w-24 bg-gradient-to-b from-slate-900/80 to-slate-950/80 border-r border-cyan-400/10 px-2 py-4 flex flex-col items-center gap-2">
          {slides.map((slide, idx) => (
            <motion.button
              key={slide.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentSlide(slide.id)}
              className={`w-full py-3 rounded-xl transition-all flex flex-col items-center gap-1 ${
                currentSlide === slide.id
                  ? 'bg-gradient-to-br from-cyan-600/50 to-blue-600/50 border border-cyan-400/50'
                  : 'hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <span className="text-2xl">{slide.icon}</span>
              <span className={`text-xs font-bold ${currentSlide === slide.id ? 'text-cyan-300' : 'text-cyan-300/50'}`}>
                {slide.label}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {currentSlide === 'welcome' && <WelcomeSlide key="welcome" />}
            {currentSlide === 'chat' && <ChatSlide key="chat" />}
            {currentSlide === 'content' && <ContentSlide key="content" />}
            {currentSlide === 'stats' && <StatsSlide key="stats" />}
            {currentSlide === 'settings' && <SettingsSlide key="settings" />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default StudyBuddyAdvanced;
