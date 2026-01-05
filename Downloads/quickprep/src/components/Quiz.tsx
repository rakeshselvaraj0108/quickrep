'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quiz as QuizType, QuizQuestion } from '../types/ai';

interface QuizProps {
  quiz: QuizType;
}

const Quiz: React.FC<QuizProps> = ({ quiz }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState<Set<string>>(new Set());

  // Safety check
  if (!quiz || !quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    return (
      <div style={{
        padding: '60px 40px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
        borderRadius: '24px',
        border: '1px solid rgba(6, 182, 212, 0.2)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
        <h3 style={{ color: '#22d3ee', fontSize: '20px', marginBottom: '8px', fontWeight: 600 }}>No Quiz Yet</h3>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Enter your notes and click Generate to create a quiz</p>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];
  const progress = ((currentIndex + 1) / quiz.questions.length) * 100;
  const isAnswered = selectedAnswers[currentQuestion?.id] !== undefined;
  const isRevealed = revealedAnswers.has(currentQuestion?.id);

  const handleSelect = (answerIndex: number) => {
    if (isRevealed) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answerIndex
    }));
  };

  const handleReveal = () => {
    if (!isAnswered) return;
    setRevealedAnswers(prev => new Set([...prev, currentQuestion.id]));
  };

  const handleNext = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch(diff) {
      case 'easy': return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' };
      case 'medium': return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' };
      case 'hard': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' };
      default: return { bg: 'rgba(6, 182, 212, 0.15)', text: '#06b6d4', border: 'rgba(6, 182, 212, 0.3)' };
    }
  };

  const stats = useMemo(() => {
    let correct = 0;
    let answered = 0;
    quiz.questions.forEach((q: QuizQuestion) => {
      if (selectedAnswers[q.id] !== undefined) {
        answered++;
        if (selectedAnswers[q.id] === q.correctAnswer) {
          correct++;
        }
      }
    });
    return { correct, answered, total: quiz.questions.length };
  }, [selectedAnswers, quiz.questions]);

  // Results View
  if (showResults) {
    const score = Math.round((stats.correct / stats.total) * 100);
    const getGrade = () => {
      if (score >= 90) return { emoji: '🏆', label: 'Excellent!', color: '#10b981' };
      if (score >= 70) return { emoji: '🌟', label: 'Great Job!', color: '#22d3ee' };
      if (score >= 50) return { emoji: '💪', label: 'Keep Going!', color: '#f59e0b' };
      return { emoji: '📚', label: 'Keep Learning!', color: '#ef4444' };
    };
    const grade = getGrade();

    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Results Header */}
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'rgba(15, 15, 35, 0.6)',
          borderRadius: '24px',
          border: '1px solid rgba(6, 182, 212, 0.2)',
          marginBottom: '24px'
        }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            style={{ fontSize: '72px', marginBottom: '16px' }}
          >
            {grade.emoji}
          </motion.div>
          <h2 style={{ color: grade.color, fontSize: '28px', marginBottom: '8px' }}>{grade.label}</h2>
          <div style={{
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: '8px',
            padding: '16px 32px',
            background: `${grade.color}20`,
            borderRadius: '16px',
            marginTop: '16px'
          }}>
            <span style={{ fontSize: '48px', fontWeight: 700, color: grade.color }}>{score}</span>
            <span style={{ fontSize: '24px', color: 'rgba(255,255,255,0.5)' }}>%</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '16px' }}>
            {stats.correct} out of {stats.total} questions correct
          </p>
        </div>

        {/* Question Review */}
        <div style={{
          background: 'rgba(15, 15, 35, 0.4)',
          borderRadius: '20px',
          border: '1px solid rgba(6, 182, 212, 0.1)',
          padding: '24px'
        }}>
          <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '18px' }}>📋 Review Answers</h3>
          {quiz.questions.map((q: QuizQuestion, idx: number) => {
            const userAnswer = selectedAnswers[q.id];
            const isCorrect = userAnswer === q.correctAnswer;
            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                style={{
                  padding: '20px',
                  marginBottom: '12px',
                  background: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '14px',
                  border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    background: isCorrect ? '#10b981' : '#ef4444',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 600
                  }}>
                    {isCorrect ? '✓' : '✗'}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Question {idx + 1}</span>
                </div>
                <p style={{ color: 'white', fontSize: '15px', marginBottom: '12px', lineHeight: 1.5 }}>{q.question}</p>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                  <p style={{ marginBottom: '4px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Your answer:</span>{' '}
                    <span style={{ color: isCorrect ? '#10b981' : '#ef4444' }}>{q.options[userAnswer] || 'Not answered'}</span>
                  </p>
                  {!isCorrect && (
                    <p>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>Correct answer:</span>{' '}
                      <span style={{ color: '#10b981' }}>{q.options[q.correctAnswer]}</span>
                    </p>
                  )}
                </div>
                {q.explanation && (
                  <p style={{
                    marginTop: '12px',
                    padding: '12px',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.6)',
                    fontStyle: 'italic'
                  }}>
                    💡 {q.explanation}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Retry Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setShowResults(false);
            setCurrentIndex(0);
            setSelectedAnswers({});
            setRevealedAnswers(new Set());
          }}
          style={{
            width: '100%',
            marginTop: '20px',
            padding: '16px',
            borderRadius: '14px',
            border: 'none',
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            color: 'white',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(6, 182, 212, 0.3)'
          }}
        >
          🔄 Retake Quiz
        </motion.button>
      </div>
    );
  }

  // Quiz View
  const diffColors = getDifficultyColor(currentQuestion?.difficulty || 'medium');

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '20px',
        padding: '16px 20px',
        background: 'rgba(15, 15, 35, 0.6)',
        borderRadius: '16px',
        border: '1px solid rgba(6, 182, 212, 0.15)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px', fontWeight: 700, color: '#22d3ee' }}>{currentIndex + 1}</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '18px' }}>/</span>
          <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)' }}>{quiz.questions.length}</span>
        </div>

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
                background: 'linear-gradient(90deg, #06b6d4, #3b82f6)',
                borderRadius: '4px'
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#10b981' }}>{stats.correct}</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Correct</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#f59e0b' }}>{stats.answered}</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Answered</div>
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
          {currentQuestion?.difficulty || 'medium'}
        </span>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          style={{
            background: 'rgba(15, 15, 35, 0.6)',
            borderRadius: '20px',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            padding: '28px',
            marginBottom: '20px'
          }}
        >
          <h3 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: 'white',
            marginBottom: '24px',
            lineHeight: 1.5
          }}>
            {currentQuestion?.question}
          </h3>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {currentQuestion?.options?.map((option: string, idx: number) => {
              const isSelected = selectedAnswers[currentQuestion.id] === idx;
              const isCorrectAnswer = idx === currentQuestion.correctAnswer;
              const showCorrect = isRevealed && isCorrectAnswer;
              const showWrong = isRevealed && isSelected && !isCorrectAnswer;

              let bgColor = 'rgba(255,255,255,0.03)';
              let borderColor = 'rgba(255,255,255,0.1)';
              let textColor = 'rgba(255,255,255,0.8)';

              if (isSelected && !isRevealed) {
                bgColor = 'rgba(6, 182, 212, 0.15)';
                borderColor = 'rgba(6, 182, 212, 0.4)';
                textColor = '#22d3ee';
              } else if (showCorrect) {
                bgColor = 'rgba(16, 185, 129, 0.15)';
                borderColor = 'rgba(16, 185, 129, 0.4)';
                textColor = '#10b981';
              } else if (showWrong) {
                bgColor = 'rgba(239, 68, 68, 0.15)';
                borderColor = 'rgba(239, 68, 68, 0.4)';
                textColor = '#ef4444';
              }

              return (
                <motion.button
                  key={idx}
                  whileHover={!isRevealed ? { scale: 1.01, x: 4 } : {}}
                  whileTap={!isRevealed ? { scale: 0.99 } : {}}
                  onClick={() => handleSelect(idx)}
                  disabled={isRevealed}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '16px 18px',
                    borderRadius: '12px',
                    border: `1px solid ${borderColor}`,
                    background: bgColor,
                    cursor: isRevealed ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                >
                  <span style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    background: isSelected || showCorrect || showWrong 
                      ? (showCorrect ? '#10b981' : showWrong ? '#ef4444' : '#06b6d4')
                      : 'rgba(255,255,255,0.1)',
                    color: isSelected || showCorrect || showWrong ? 'white' : 'rgba(255,255,255,0.6)',
                    fontSize: '14px',
                    fontWeight: 600,
                    flexShrink: 0
                  }}>
                    {showCorrect ? '✓' : showWrong ? '✗' : String.fromCharCode(65 + idx)}
                  </span>
                  <span style={{ color: textColor, fontSize: '15px', flex: 1 }}>
                    {option.replace(/^[A-D]\)\s*/, '')}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Explanation */}
          {isRevealed && currentQuestion?.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: '20px',
                padding: '16px',
                background: 'rgba(139, 92, 246, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}
            >
              <p style={{ color: '#a78bfa', fontSize: '13px', margin: 0 }}>
                💡 <strong>Explanation:</strong> {currentQuestion.explanation}
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePrev}
          disabled={currentIndex === 0}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            background: currentIndex === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(6, 182, 212, 0.1)',
            color: currentIndex === 0 ? 'rgba(255,255,255,0.3)' : '#22d3ee',
            fontSize: '24px',
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          ←
        </motion.button>

        {!isRevealed ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReveal}
            disabled={!isAnswered}
            style={{
              padding: '0 32px',
              height: '56px',
              borderRadius: '16px',
              border: 'none',
              background: isAnswered ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255,255,255,0.1)',
              color: isAnswered ? 'white' : 'rgba(255,255,255,0.3)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isAnswered ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>👁️</span> Check Answer
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            style={{
              padding: '0 32px',
              height: '56px',
              borderRadius: '16px',
              border: 'none',
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 20px rgba(6, 182, 212, 0.4)'
            }}
          >
            {currentIndex === quiz.questions.length - 1 ? (
              <><span>🏁</span> See Results</>
            ) : (
              <><span>→</span> Next Question</>
            )}
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          disabled={currentIndex === quiz.questions.length - 1 && !isRevealed}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            background: currentIndex === quiz.questions.length - 1 ? 'rgba(255,255,255,0.05)' : 'rgba(6, 182, 212, 0.1)',
            color: currentIndex === quiz.questions.length - 1 ? 'rgba(255,255,255,0.3)' : '#22d3ee',
            fontSize: '24px',
            cursor: currentIndex === quiz.questions.length - 1 ? 'not-allowed' : 'pointer'
          }}
        >
          →
        </motion.button>
      </div>

      {/* Question Navigator */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '6px',
        marginTop: '24px',
        flexWrap: 'wrap',
        maxWidth: '500px',
        margin: '24px auto 0'
      }}>
        {quiz.questions.map((q: QuizQuestion, idx: number) => {
          const isAnsweredQ = selectedAnswers[q.id] !== undefined;
          const isRevealedQ = revealedAnswers.has(q.id);
          const isCorrectQ = selectedAnswers[q.id] === q.correctAnswer;
          
          let dotColor = 'rgba(255,255,255,0.2)';
          if (isRevealedQ) {
            dotColor = isCorrectQ ? '#10b981' : '#ef4444';
          } else if (isAnsweredQ) {
            dotColor = '#06b6d4';
          } else if (idx === currentIndex) {
            dotColor = '#22d3ee';
          }

          return (
            <motion.button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
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
    </div>
  );
};

export default Quiz;
