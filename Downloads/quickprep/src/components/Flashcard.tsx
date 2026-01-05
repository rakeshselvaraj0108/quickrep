'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlashcardData {
  id: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  reviewCount?: number;
}

interface FlashcardProps {
  flashcards: FlashcardData[];
}

const Flashcard: React.FC<FlashcardProps> = ({ flashcards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteryLevels, setMasteryLevels] = useState<Record<string, number>>({});
  const [showConfetti, setShowConfetti] = useState(false);

  // Safety check
  if (!flashcards || !Array.isArray(flashcards) || flashcards.length === 0) {
    return (
      <div style={{
        padding: '60px 40px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
        borderRadius: '24px',
        border: '1px solid rgba(139, 92, 246, 0.2)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
        <h3 style={{ color: '#a78bfa', fontSize: '20px', marginBottom: '8px', fontWeight: 600 }}>No Flashcards Yet</h3>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Enter your notes and click Generate to create flashcards</p>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  const handleFlip = useCallback(() => setIsFlipped(prev => !prev), []);

  const handleNext = useCallback(() => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, flashcards.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const handleMastery = useCallback((level: number) => {
    setMasteryLevels(prev => ({
      ...prev,
      [currentCard.id]: level
    }));
    
    if (level === 3) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
    }
    
    // Auto advance after rating
    setTimeout(() => {
      if (currentIndex < flashcards.length - 1) {
        handleNext();
      }
    }, 500);
  }, [currentCard?.id, currentIndex, flashcards.length, handleNext]);

  const stats = useMemo(() => {
    const reviewed = Object.keys(masteryLevels).length;
    const mastered = Object.values(masteryLevels).filter(v => v === 3).length;
    return { reviewed, mastered };
  }, [masteryLevels]);

  const getDifficultyColor = (diff: string) => {
    switch(diff) {
      case 'easy': return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' };
      case 'medium': return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' };
      case 'hard': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' };
      default: return { bg: 'rgba(139, 92, 246, 0.15)', text: '#a78bfa', border: 'rgba(139, 92, 246, 0.3)' };
    }
  };

  const diffColors = getDifficultyColor(currentCard.difficulty);

  return (
    <div style={{
      maxWidth: '720px',
      margin: '0 auto',
      padding: '0'
    }}>
      {/* Header Stats Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '20px',
        padding: '16px 20px',
        background: 'rgba(15, 15, 35, 0.6)',
        borderRadius: '16px',
        border: '1px solid rgba(139, 92, 246, 0.15)',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Card Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '28px', fontWeight: 700, color: '#a78bfa' }}>{currentIndex + 1}</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '18px' }}>/</span>
          <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)' }}>{flashcards.length}</span>
        </div>

        {/* Progress Bar */}
        <div style={{ flex: 1, maxWidth: '300px' }}>
          <div style={{
            height: '8px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <motion.div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
                borderRadius: '4px'
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#10b981' }}>{stats.mastered}</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mastered</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#f59e0b' }}>{stats.reviewed}</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reviewed</div>
          </div>
        </div>
      </div>

      {/* Difficulty Badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <span style={{
          padding: '6px 16px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          background: diffColors.bg,
          color: diffColors.text,
          border: `1px solid ${diffColors.border}`
        }}>
          {currentCard.difficulty}
        </span>
      </div>

      {/* Flashcard */}
      <div style={{ perspective: '1500px', marginBottom: '24px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={handleFlip}
            style={{
              cursor: 'pointer',
              height: '340px',
              position: 'relative',
              transformStyle: 'preserve-3d'
            }}
          >
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 100, damping: 15 }}
              style={{
                width: '100%',
                height: '100%',
                transformStyle: 'preserve-3d',
                position: 'relative'
              }}
            >
              {/* Front Face */}
              <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                borderRadius: '24px',
                background: 'linear-gradient(145deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.4), 0 0 0 1px rgba(255,255,255,0.1) inset',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                overflow: 'hidden'
              }}>
                {/* Decorative Elements */}
                <div style={{
                  position: 'absolute',
                  top: '-50px',
                  right: '-50px',
                  width: '150px',
                  height: '150px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '50%'
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: '-30px',
                  left: '-30px',
                  width: '100px',
                  height: '100px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '50%'
                }} />

                <div style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.7)',
                  marginBottom: '20px'
                }}>
                  Question
                </div>
                <p style={{
                  fontSize: '22px',
                  fontWeight: 500,
                  color: 'white',
                  textAlign: 'center',
                  lineHeight: 1.5,
                  margin: 0,
                  maxHeight: '180px',
                  overflow: 'auto'
                }}>
                  {currentCard.front}
                </p>
                <div style={{
                  position: 'absolute',
                  bottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '13px'
                }}>
                  <span style={{ fontSize: '18px' }}>👆</span>
                  <span>Tap to reveal answer</span>
                </div>
              </div>

              {/* Back Face */}
              <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                borderRadius: '24px',
                background: 'linear-gradient(145deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)',
                boxShadow: '0 25px 50px -12px rgba(6, 182, 212, 0.4), 0 0 0 1px rgba(255,255,255,0.1) inset',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                overflow: 'hidden'
              }}>
                {/* Decorative Elements */}
                <div style={{
                  position: 'absolute',
                  top: '-50px',
                  left: '-50px',
                  width: '150px',
                  height: '150px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '50%'
                }} />

                <div style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.7)',
                  marginBottom: '20px'
                }}>
                  Answer
                </div>
                <p style={{
                  fontSize: '18px',
                  fontWeight: 500,
                  color: 'white',
                  textAlign: 'center',
                  lineHeight: 1.6,
                  margin: 0,
                  maxHeight: '140px',
                  overflow: 'auto'
                }}>
                  {currentCard.back}
                </p>

                {/* Mastery Rating */}
                <div style={{
                  position: 'absolute',
                  bottom: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>How well did you know this?</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                      { level: 1, emoji: '😕', label: 'Again', color: '#ef4444' },
                      { level: 2, emoji: '🤔', label: 'Hard', color: '#f59e0b' },
                      { level: 3, emoji: '😊', label: 'Easy', color: '#10b981' }
                    ].map(({ level, emoji, label, color }) => (
                      <motion.button
                        key={level}
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { e.stopPropagation(); handleMastery(level); }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '12px',
                          border: 'none',
                          background: `${color}20`,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span style={{ fontSize: '20px' }}>{emoji}</span>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: 'white', textTransform: 'uppercase' }}>{label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '12px'
      }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePrev}
          disabled={currentIndex === 0}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            background: currentIndex === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(139, 92, 246, 0.1)',
            color: currentIndex === 0 ? 'rgba(255,255,255,0.3)' : '#a78bfa',
            fontSize: '24px',
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
        >
          ←
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsFlipped(prev => !prev)}
          style={{
            padding: '0 32px',
            height: '56px',
            borderRadius: '16px',
            border: 'none',
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            color: 'white',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)'
          }}
        >
          <span style={{ fontSize: '18px' }}>↻</span>
          Flip Card
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            background: currentIndex === flashcards.length - 1 ? 'rgba(255,255,255,0.05)' : 'rgba(139, 92, 246, 0.1)',
            color: currentIndex === flashcards.length - 1 ? 'rgba(255,255,255,0.3)' : '#a78bfa',
            fontSize: '24px',
            cursor: currentIndex === flashcards.length - 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
        >
          →
        </motion.button>
      </div>

      {/* Card Navigator Dots */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '6px',
        marginTop: '24px',
        flexWrap: 'wrap',
        maxWidth: '400px',
        margin: '24px auto 0'
      }}>
        {flashcards.map((_, idx) => {
          const mastery = masteryLevels[flashcards[idx].id];
          let dotColor = 'rgba(255,255,255,0.2)';
          if (mastery === 3) dotColor = '#10b981';
          else if (mastery === 2) dotColor = '#f59e0b';
          else if (mastery === 1) dotColor = '#ef4444';
          else if (idx === currentIndex) dotColor = '#a78bfa';

          return (
            <motion.button
              key={idx}
              onClick={() => { setCurrentIndex(idx); setIsFlipped(false); }}
              whileHover={{ scale: 1.3 }}
              style={{
                width: idx === currentIndex ? '24px' : '10px',
                height: '10px',
                borderRadius: '5px',
                background: dotColor,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            />
          );
        })}
      </div>

      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '64px',
              pointerEvents: 'none',
              zIndex: 100
            }}
          >
            🎉
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Flashcard;
