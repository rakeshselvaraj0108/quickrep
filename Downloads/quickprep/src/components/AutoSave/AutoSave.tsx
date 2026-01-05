'use client';

import React, { useEffect, useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';

interface AutoSaveProps {
  value: string;
  onRestore: (value: string) => void;
}

export default function AutoSave({ value, onRestore }: AutoSaveProps) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const debouncedValue = useDebounce(value, 2000);

  useEffect(() => {
    // Check for unsaved content on mount
    const savedContent = localStorage.getItem('autosave_notes');
    const savedTime = localStorage.getItem('autosave_time');
    
    if (savedContent && savedContent !== value && savedContent.length > 10) {
      setShowRestorePrompt(true);
    }
  }, []);

  useEffect(() => {
    // Auto-save when value changes
    if (debouncedValue && debouncedValue.length > 0) {
      localStorage.setItem('autosave_notes', debouncedValue);
      localStorage.setItem('autosave_time', new Date().toISOString());
      setLastSaved(new Date());
    }
  }, [debouncedValue]);

  const handleRestore = () => {
    const savedContent = localStorage.getItem('autosave_notes');
    if (savedContent) {
      onRestore(savedContent);
      setShowRestorePrompt(false);
    }
  };

  const handleDiscard = () => {
    localStorage.removeItem('autosave_notes');
    localStorage.removeItem('autosave_time');
    setShowRestorePrompt(false);
  };

  return (
    <>
      {/* Auto-save Indicator */}
      {lastSaved && (
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <span className="text-green-400">💾</span>
          Auto-saved {lastSaved.toLocaleTimeString()}
        </div>
      )}

      {/* Restore Prompt */}
      {showRestorePrompt && (
        <div className="fixed top-20 right-6 z-50 bg-gradient-to-br from-yellow-900/90 to-orange-900/90 backdrop-blur-md border border-yellow-500/50 rounded-xl p-4 shadow-2xl max-w-sm">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💾</span>
            <div className="flex-1">
              <h4 className="font-bold text-white mb-1">Unsaved Work Found!</h4>
              <p className="text-sm text-gray-300 mb-3">
                We found notes you were working on. Would you like to restore them?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleRestore}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
                >
                  ✓ Restore
                </button>
                <button
                  onClick={handleDiscard}
                  className="flex-1 bg-slate-700 text-gray-300 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-600 transition-all"
                >
                  × Discard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
