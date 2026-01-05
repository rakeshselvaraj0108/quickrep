import type { Metadata } from 'next';
import '../styles/globals.css';
import '../styles/theme.css';
import '../styles/polish.css';
import React from 'react';
import AppHeader from '../components/Layout/AppHeader';
import AppContainer from '../components/Layout/AppContainer';
import { ToastProvider } from '../components/Toast/ToastContainer';

export const metadata: Metadata = {
  title: 'QuickPrep – AI Study Assistant',
  description: 'Turn notes into instant study material with AI-powered summaries, questions, and study plans.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <ToastProvider>
          <div className="app-root">
            <AppHeader />
            <AppContainer>{children}</AppContainer>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
