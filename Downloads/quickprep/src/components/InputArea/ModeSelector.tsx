'use client';

import React from 'react';
import { GenerationMode } from '../../types/ai';

interface ModeSelectorProps {
  value: GenerationMode;
  onChange: (mode: GenerationMode) => void;
  disabled?: boolean;
}

const modes: { id: GenerationMode; label: string; description: string }[] = [
  {
    id: 'summary',
    label: 'Summary',
    description: 'Concise overview with key takeaways.',
  },
  {
    id: 'questions',
    label: 'Questions',
    description: 'Quiz-style questions for self-testing.',
  },
  {
    id: 'plan',
    label: 'Study Plan',
    description: 'Structured plan for upcoming exams.',
  },
  {
    id: 'flashcards',
    label: 'Flashcards',
    description: 'Spaced repetition flashcards for memorization.',
  },
  {
    id: 'quiz',
    label: 'Quiz',
    description: 'Interactive multiple-choice quiz.',
  },
  {
    id: 'mindmap',
    label: 'Mind Map',
    description: 'Visual mind map of key concepts.',
  },
];

const ModeSelector: React.FC<ModeSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    mode: GenerationMode
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!disabled) {
        onChange(mode);
      }
    }
  };

  return (
    <div className="mode-selector">
      <span className="field-label">Generation mode</span>
      <div
        className="mode-toggle-group"
        role="radiogroup"
        aria-label="Choose generation mode"
      >
        {modes.map((mode) => {
          const isActive = value === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              className={`mode-toggle ${isActive ? 'mode-toggle--active' : ''}`}
              onClick={() => !disabled && onChange(mode.id)}
              onKeyDown={(e) => handleKeyDown(e, mode.id)}
              disabled={disabled}
            >
              <span className="mode-label">{mode.label}</span>
              <span className="mode-description">{mode.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ModeSelector;
