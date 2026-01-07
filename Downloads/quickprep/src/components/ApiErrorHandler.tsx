'use client';

import React from 'react';
import { AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

interface ApiErrorHandlerProps {
  errorType: 'quota' | 'overload' | 'timeout' | 'network' | 'unknown';
  isRetrying?: boolean;
  onRetry?: () => void;
}

export default function ApiErrorHandler({
  errorType,
  isRetrying = false,
  onRetry
}: ApiErrorHandlerProps) {
  const getErrorConfig = () => {
    switch (errorType) {
      case 'quota':
        return {
          title: '📊 Daily API Limit Reached',
          description: 'Your free tier quota (20 requests/day) is exhausted.',
          solutions: [
            { icon: '⏰', text: 'Wait 24 hours for automatic reset', link: null },
            { icon: '💳', text: 'Upgrade your API plan for unlimited requests', link: 'https://aistudio.google.com/app/apikey' },
            { icon: '✅', text: 'Use fallback content generator (works offline)', link: null }
          ],
          color: 'bg-yellow-50 border-yellow-200'
        };
      case 'overload':
        return {
          title: '⚙️ API Server Busy',
          description: 'Google Gemini API is experiencing high load.',
          solutions: [
            { icon: '🔄', text: 'Wait 30 seconds and retry', link: null },
            { icon: '⚡', text: 'Try with shorter content (faster processing)', link: null },
            { icon: '📝', text: 'Use fallback local content generation', link: null }
          ],
          color: 'bg-blue-50 border-blue-200'
        };
      case 'timeout':
        return {
          title: '⏱️ Request Timeout',
          description: 'The API took too long to respond.',
          solutions: [
            { icon: '✂️', text: 'Reduce input length and try again', link: null },
            { icon: '🔄', text: 'Retry with a simpler request', link: null },
            { icon: '📝', text: 'Use fallback generation instead', link: null }
          ],
          color: 'bg-orange-50 border-orange-200'
        };
      default:
        return {
          title: '⚠️ Service Unavailable',
          description: 'Unable to connect to AI service.',
          solutions: [
            { icon: '🌐', text: 'Check your internet connection', link: null },
            { icon: '🔄', text: 'Refresh the page and try again', link: null },
            { icon: '📝', text: 'Use fallback content generation', link: null }
          ],
          color: 'bg-red-50 border-red-200'
        };
    }
  };

  const config = getErrorConfig();

  return (
    <div className={`${config.color} border rounded-lg p-6 my-4`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{config.title}</h3>
          <p className="text-gray-700 text-sm mb-4">{config.description}</p>
          
          <div className="space-y-2 mb-4">
            {config.solutions.map((solution, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-lg">{solution.icon}</span>
                {solution.link ? (
                  <a
                    href={solution.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    {solution.text}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-gray-700 text-sm">{solution.text}</span>
                )}
              </div>
            ))}
          </div>

          {onRetry && (
            <button
              onClick={onRetry}
              disabled={isRetrying}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md text-sm font-medium transition-colors"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
