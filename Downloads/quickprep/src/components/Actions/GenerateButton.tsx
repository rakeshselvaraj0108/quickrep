'use client';

import React from 'react';

interface GenerateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  ['data-action']?: string;
}

const GenerateButton: React.FC<GenerateButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  'data-action': dataAction,
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      className="primary-button"
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading}
      data-action={dataAction}
    >
      {loading && (
        <span className="spinner" aria-hidden="true" />
      )}
      <span>{loading ? 'Generating...' : 'Generate study material'}</span>
    </button>
  );
};

export default GenerateButton;
