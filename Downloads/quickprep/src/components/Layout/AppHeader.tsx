'use client';

import React, { useState, useEffect } from 'react';

const AppHeader = () => {
  const [theme, setTheme] = useState('cosmic');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="brand">
          <div className="brand-mark" />
          <div className="brand-text">
            <h1 className="brand-name">QuickPrep</h1>
            <span>AI Study Assistant</span>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={() => setTheme('cosmic')}>🌌</button>
          <button onClick={() => setTheme('light')}>☀️</button>
          <button onClick={() => setTheme('dark')}>🌙</button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
