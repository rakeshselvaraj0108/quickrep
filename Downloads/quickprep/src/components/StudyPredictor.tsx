'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface StudyPredictorProps {
  studyStreak: number;
  totalStudyTime: number;
  completedTasks: number;
  recentActivity: number[]; // hours studied in last 7 days
}

interface Prediction {
  risk: 'low' | 'medium' | 'high';
  message: string;
  suggestions: string[];
  motivationalQuote: string;
}

const StudyPredictor: React.FC<StudyPredictorProps> = ({
  studyStreak,
  totalStudyTime,
  completedTasks,
  recentActivity
}) => {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    // Simulate AI analysis
    const analyzeStreak = () => {
      setIsAnalyzing(true);

      setTimeout(() => {
        let risk: 'low' | 'medium' | 'high' = 'low';
        let message = '';
        let suggestions: string[] = [];
        let motivationalQuote = '';

        // Calculate streak risk based on various factors
        const avgDailyTime = totalStudyTime / Math.max(studyStreak, 1);
        const recentAvg = recentActivity.reduce((a, b) => a + b, 0) / recentActivity.length;
        const consistency = recentActivity.filter(h => h > 0).length / recentActivity.length;

        if (studyStreak < 3) {
          risk = 'high';
          message = 'Your study streak is just beginning! Building momentum is key.';
          suggestions = [
            'Set a specific study time each day',
            'Start with 25-minute focused sessions',
            'Track your progress daily'
          ];
          motivationalQuote = '"The journey of a thousand miles begins with a single step." - Lao Tzu';
        } else if (studyStreak < 7) {
          risk = 'medium';
          message = 'You\'re building a solid foundation. Keep the momentum going!';
          suggestions = [
            'Maintain your current routine',
            'Add one new study technique',
            'Celebrate small wins'
          ];
          motivationalQuote = '"Success is not final, failure is not fatal: It is the courage to continue that counts." - Winston Churchill';
        } else if (studyStreak >= 7 && consistency > 0.7) {
          risk = 'low';
          message = 'Excellent consistency! You\'re in a strong study rhythm.';
          suggestions = [
            'Consider increasing study intensity',
            'Help others with study tips',
            'Set long-term goals'
          ];
          motivationalQuote = '"The only way to do great work is to love what you do." - Steve Jobs';
        } else if (consistency < 0.5) {
          risk = 'high';
          message = 'Your streak is at risk due to inconsistent study patterns.';
          suggestions = [
            'Create a fixed study schedule',
            'Use reminders and alarms',
            'Find an accountability partner'
          ];
          motivationalQuote = '"Discipline is the bridge between goals and accomplishment." - Jim Rohn';
        } else {
          risk = 'medium';
          message = 'Your study habits are developing well. Stay consistent!';
          suggestions = [
            'Review and adjust your study methods',
            'Ensure adequate rest and breaks',
            'Track what works best for you'
          ];
          motivationalQuote = '"The future depends on what you do today." - Mahatma Gandhi';
        }

        setPrediction({ risk, message, suggestions, motivationalQuote });
        setIsAnalyzing(false);
      }, 2000); // Simulate analysis time
    };

    analyzeStreak();
  }, [studyStreak, totalStudyTime, completedTasks, recentActivity]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🔴';
      default: return '⚪';
    }
  };

  if (isAnalyzing) {
    return (
      <div className="study-predictor analyzing">
        <div className="analyzing-content">
          <div className="spinner"></div>
          <p>Analyzing your study patterns...</p>
        </div>
      </div>
    );
  }

  if (!prediction) return null;

  return (
    <motion.div
      className="study-predictor"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="predictor-header">
        <h3>📊 Study Pattern Analysis</h3>
        <div className="risk-indicator">
          <span className="risk-icon">{getRiskIcon(prediction.risk)}</span>
          <span className="risk-level" style={{ color: getRiskColor(prediction.risk) }}>
            {prediction.risk.toUpperCase()} RISK
          </span>
        </div>
      </div>

      <div className="prediction-content">
        <p className="prediction-message">{prediction.message}</p>

        <div className="stats-overview">
          <div className="stat-item">
            <span className="stat-label">Current Streak</span>
            <span className="stat-value">{studyStreak} days</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Study Time</span>
            <span className="stat-value">{Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Tasks Completed</span>
            <span className="stat-value">{completedTasks}</span>
          </div>
        </div>

        <div className="suggestions">
          <h4>💡 Recommendations</h4>
          <ul>
            {prediction.suggestions.map((suggestion, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {suggestion}
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="motivational-quote">
          <blockquote>{prediction.motivationalQuote}</blockquote>
        </div>
      </div>

      <style jsx>{`
        .study-predictor {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 24px;
          color: white;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        }

        .analyzing {
          background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
          color: #1f2937;
        }

        .analyzing-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #4f46e5;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .predictor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .predictor-header h3 {
          margin: 0;
          font-size: 20px;
        }

        .risk-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .risk-icon {
          font-size: 18px;
        }

        .risk-level {
          font-weight: 600;
          font-size: 14px;
        }

        .prediction-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .prediction-message {
          font-size: 16px;
          line-height: 1.6;
          margin: 0;
          font-weight: 500;
        }

        .stats-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 16px;
          background: rgba(255, 255, 255, 0.1);
          padding: 16px;
          border-radius: 8px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-label {
          display: block;
          font-size: 12px;
          opacity: 0.8;
          margin-bottom: 4px;
        }

        .stat-value {
          display: block;
          font-size: 18px;
          font-weight: 700;
        }

        .suggestions {
          background: rgba(255, 255, 255, 0.1);
          padding: 16px;
          border-radius: 8px;
        }

        .suggestions h4 {
          margin: 0 0 12px 0;
          font-size: 16px;
        }

        .suggestions ul {
          margin: 0;
          padding-left: 20px;
        }

        .suggestions li {
          margin: 6px 0;
          line-height: 1.5;
        }

        .motivational-quote {
          text-align: center;
          background: rgba(255, 255, 255, 0.1);
          padding: 16px;
          border-radius: 8px;
          font-style: italic;
        }

        .motivational-quote blockquote {
          margin: 0;
          font-size: 14px;
          border-left: 3px solid rgba(255, 255, 255, 0.3);
          padding-left: 12px;
        }
      `}</style>
    </motion.div>
  );
};

export default StudyPredictor;