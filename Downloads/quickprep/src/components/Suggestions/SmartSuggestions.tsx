'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface SmartSuggestionsProps {
  currentNotes: string;
  lastMode?: string;
  onSelectMode: (mode: string) => void;
}

export default function SmartSuggestions({ currentNotes, lastMode, onSelectMode }: SmartSuggestionsProps) {
  const [showPanel, setShowPanel] = useState(true);

  const getSuggestions = () => {
    const suggestions = [];
    const noteLength = currentNotes.length;
    const hasQuestions = currentNotes.includes('?');
    const hasList = currentNotes.includes('\n- ') || currentNotes.includes('\n• ');
    const hasNumbers = /\d+/.test(currentNotes);

    if (noteLength < 100) {
      suggestions.push({
        mode: 'summary',
        reason: 'Quick overview',
        icon: '📝',
        confidence: 0.9
      });
    }

    if (noteLength > 200 && !lastMode) {
      suggestions.push({
        mode: 'flashcards',
        reason: 'Great for memorization',
        icon: '🎴',
        confidence: 0.85
      });
    }

    if (hasQuestions) {
      suggestions.push({
        mode: 'questions',
        reason: 'Contains questions to explore',
        icon: '❔',
        confidence: 0.8
      });
    }

    if (hasList || hasNumbers) {
      suggestions.push({
        mode: 'mindmap',
        reason: 'Structured content detected',
        icon: '🧠',
        confidence: 0.75
      });
    }

    if (noteLength > 300) {
      suggestions.push({
        mode: 'quiz',
        reason: 'Test your knowledge',
        icon: '❓',
        confidence: 0.7
      });
    }

    if (lastMode === 'summary') {
      suggestions.push({
        mode: 'quiz',
        reason: 'Next logical step after summary',
        icon: '❓',
        confidence: 0.9
      });
    }

    if (lastMode === 'flashcards') {
      suggestions.push({
        mode: 'quiz',
        reason: 'Test what you learned',
        icon: '❓',
        confidence: 0.85
      });
    }

    return suggestions.slice(0, 3);
  };

  const suggestions = getSuggestions();

  if (suggestions.length === 0 || !showPanel || currentNotes.length < 20) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-xl p-4 mb-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎯</span>
          <h3 className="text-sm font-bold text-white">Smart Suggestions</h3>
        </div>
        <button
          onClick={() => setShowPanel(false)}
          className="text-gray-400 hover:text-white text-sm"
        >
          ×
        </button>
      </div>

      <p className="text-xs text-gray-300 mb-3">
        Based on your content, we recommend:
      </p>

      <div className="space-y-2">
        {suggestions.map((suggestion, idx) => (
          <motion.button
            key={`${suggestion.mode}-${idx}-${suggestion.reason.slice(0, 10)}`}
            onClick={() => {
              onSelectMode(suggestion.mode);
              setShowPanel(false);
            }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 bg-slate-800/50 hover:bg-slate-700/50 border border-indigo-500/20 hover:border-indigo-500/40 rounded-lg p-3 transition-all text-left"
          >
            <span className="text-2xl">{suggestion.icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-white capitalize text-sm">
                  {suggestion.mode}
                </span>
                <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    style={{ width: `${suggestion.confidence * 100}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400">{suggestion.reason}</p>
            </div>
            <span className="text-indigo-400 text-xl">→</span>
          </motion.button>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-indigo-500/20">
        <p className="text-xs text-gray-500 text-center">
          💡 AI analyzes your notes to suggest the best generation mode
        </p>
      </div>
    </motion.div>
  );
}
