'use client';

import React from 'react';

interface AppContainerProps {
  children: React.ReactNode;
}

const AppContainer: React.FC<AppContainerProps> = ({ children }) => {
  return (
    <div className="app-container">
      <div className="app-max-width">{children}</div>
    </div>
  );
};

export default AppContainer;
