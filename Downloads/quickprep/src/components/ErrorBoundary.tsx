'use client';

import React, { ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/logger';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  level?: 'page' | 'component';
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component for React Error Handling
 * Catches errors in child components and displays fallback UI
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      errorInfo
    });

    // Log the error
    logger.error(
      `Error caught by boundary (${this.props.level || 'component'})`,
      error,
      {
        componentStack: errorInfo.componentStack,
        level: this.props.level
      }
    );

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <ErrorFallback
          error={this.state.error}
          level={this.props.level}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  level?: 'page' | 'component';
  resetError: () => void;
}

function ErrorFallback({ error, level = 'component', resetError }: ErrorFallbackProps): JSX.Element {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (level === 'page') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="space-y-3">
            <div className="text-5xl">💥</div>
            <h1 className="text-4xl font-bold text-white">Oops!</h1>
            <p className="text-slate-400">Something went wrong</p>
          </div>

          {isDevelopment && error && (
            <div className="bg-slate-800/50 rounded-lg p-4 text-left space-y-2">
              <p className="text-sm font-mono text-red-400 break-all">
                {error.message}
              </p>
              {error.stack && (
                <details className="text-xs text-slate-300">
                  <summary className="cursor-pointer hover:text-slate-200">
                    Stack trace
                  </summary>
                  <pre className="mt-2 overflow-auto max-h-48 text-red-300">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}

          <div className="space-y-3 pt-4">
            <button
              onClick={resetError}
              className="w-full py-2 px-4 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold text-white transition"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="block py-2 px-4 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold text-white transition"
            >
              Go Home
            </Link>
          </div>

          {!isDevelopment && (
            <p className="text-sm text-slate-500">
              Error ID: {crypto.randomUUID()}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 space-y-3">
      <div className="flex items-start space-x-3">
        <div className="text-2xl">⚠️</div>
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-red-600">Something went wrong</h3>
          {isDevelopment && error && (
            <p className="text-sm text-slate-600 font-mono break-all">
              {error.message}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={resetError}
        className="text-sm px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-700 rounded transition"
      >
        Try Again
      </button>
    </div>
  );
}

/**
 * HOC to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: ReactNode;
    level?: 'page' | 'component';
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
  }
) {
  const Wrapped = (props: P) => (
    <ErrorBoundary
      fallback={options?.fallback}
      level={options?.level}
      onError={options?.onError}
    >
      <Component {...props} />
    </ErrorBoundary>
  );

  Wrapped.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return Wrapped;
}
