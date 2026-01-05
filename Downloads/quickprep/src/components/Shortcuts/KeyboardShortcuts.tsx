'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface KeyboardShortcut {
  keys: string[];
  description: string;
  action: () => void;
}

export default function KeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false);

  const shortcuts: Omit<KeyboardShortcut, 'action'>[] = [
    { keys: ['Ctrl', 'Enter'], description: 'Generate content' },
    { keys: ['Ctrl', 'S'], description: 'Save notes (auto-save)' },
    { keys: ['Ctrl', 'K'], description: 'Clear notes' },
    { keys: ['Ctrl', 'H'], description: 'Toggle history panel' },
    { keys: ['Ctrl', 'A'], description: 'Toggle achievements' },
    { keys: ['Ctrl', 'E'], description: 'Export last result' },
    { keys: ['Ctrl', '/'], description: 'Show shortcuts help' },
    { keys: ['Esc'], description: 'Close panels/dialogs' },
    { keys: ['1-6'], description: 'Quick select generation mode' },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show help
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        setShowHelp(!showHelp);
      }

      // Close panels
      if (e.key === 'Escape') {
        setShowHelp(false);
      }

      // Generate content
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        const generateBtn = document.querySelector('[data-action="generate"]') as HTMLButtonElement;
        generateBtn?.click();
      }

      // Clear notes
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        const clearBtn = document.querySelector('[data-action="clear"]') as HTMLButtonElement;
        clearBtn?.click();
      }

      // Toggle history
      if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        const historyBtn = document.querySelector('[data-panel="history"]') as HTMLButtonElement;
        historyBtn?.click();
      }

      // Toggle achievements
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        const achievementsBtn = document.querySelector('[data-panel="achievements"]') as HTMLButtonElement;
        achievementsBtn?.click();
      }

      // Export
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        const exportBtn = document.querySelector('[data-action="export"]') as HTMLButtonElement;
        exportBtn?.click();
      }

      // Quick mode selection (1-6)
      if (!e.ctrlKey && !e.shiftKey && !e.altKey && e.key >= '1' && e.key <= '6') {
        const modeButtons = document.querySelectorAll('[data-mode]');
        const index = parseInt(e.key) - 1;
        if (modeButtons[index]) {
          (modeButtons[index] as HTMLButtonElement).click();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showHelp]);

  return (
    <>
      {/* Help Button */}
      <motion.button
        onClick={() => setShowHelp(!showHelp)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 left-6 z-40 bg-gradient-to-r from-indigo-500 to-purple-500 text-white w-12 h-12 rounded-full shadow-2xl flex items-center justify-center text-xl"
        title="Keyboard Shortcuts (Ctrl + /)"
      >
        <span>⌨️</span>
      </motion.button>

      {/* Shortcuts Help Panel */}
      <AnimatePresence>
        {showHelp && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowHelp(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <span>⌨️</span>
                    Keyboard Shortcuts
                  </h2>
                  <button
                    onClick={() => setShowHelp(false)}
                    className="text-gray-400 hover:text-white text-3xl"
                  >
                    ×
                  </button>
                </div>

                <p className="text-gray-400 mb-6">
                  Use these shortcuts to navigate and work faster
                </p>

                {/* Shortcuts Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  {shortcuts.map((shortcut, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-slate-800/50 border border-indigo-500/20 rounded-xl p-4 hover:border-indigo-500/40 transition-all"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {shortcut.keys.map((key, keyIdx) => (
                          <React.Fragment key={keyIdx}>
                            <kbd className="px-3 py-1.5 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded-lg text-white font-mono text-sm shadow-lg">
                              {key}
                            </kbd>
                            {keyIdx < shortcut.keys.length - 1 && (
                              <span className="text-gray-500">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      <p className="text-sm text-gray-400">{shortcut.description}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Pro Tip */}
                <div className="mt-6 p-4 bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-indigo-900/40 border border-indigo-500/30 rounded-xl">
                  <p className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-lg">💡</span>
                    <span>
                      <strong className="text-indigo-300">Pro Tip:</strong> Press <kbd className="px-2 py-0.5 bg-slate-700 rounded text-xs">Ctrl + /</kbd> anytime to toggle this help panel!
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
