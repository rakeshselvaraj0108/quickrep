'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to process password reset request');
        return;
      }

      // Show success message whether email exists or not (for security)
      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="auth-title">Forgot Password?</h1>
          <p className="auth-subtitle">No problem! We'll help you reset it.</p>

          {error && <div className="auth-error">{error}</div>}

          {success ? (
            <div className="success-box">
              <div className="success-icon">✉️</div>
              <h2 className="success-title">Check Your Email</h2>
              <p className="success-message">
                If an account exists with this email, we've sent a password reset link. 
                Please check your inbox and follow the instructions.
              </p>
              <p className="success-hint">The link will expire in 1 hour.</p>
              <button 
                onClick={() => setSuccess(false)}
                className="reset-button"
              >
                Send Another Email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <p className="auth-footer">
            Remember your password?{' '}
            <Link href="/login" className="auth-link">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>

      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .auth-box {
          width: 100%;
          max-width: 480px;
          padding: 40px;
          background: rgba(15, 15, 35, 0.9);
          border-radius: 20px;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(102, 126, 234, 0.2);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .auth-title {
          font-size: 28px;
          font-weight: 700;
          color: white;
          margin: 0 0 8px 0;
          text-align: center;
        }

        .auth-subtitle {
          font-size: 14px;
          color: rgba(226, 232, 240, 0.7);
          text-align: center;
          margin: 0 0 24px 0;
        }

        .auth-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 13px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 600;
          color: #e0e7ff;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-group input {
          padding: 12px 14px;
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          color: white;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: #8b5cf6;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .form-group input::placeholder {
          color: rgba(226, 232, 240, 0.4);
        }

        .auth-button {
          padding: 14px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 8px;
          text-align: center;
          text-decoration: none;
          display: block;
        }

        .auth-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }

        .auth-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .reset-token-box {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .success-box {
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
          text-align: center;
          padding: 20px;
          background: rgba(16, 185, 129, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 12px;
        }

        .success-icon {
          font-size: 48px;
          line-height: 1;
        }

        .success-title {
          color: #4ade80;
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }

        .success-message {
          color: rgba(226, 232, 240, 0.9);
          font-size: 14px;
          margin: 0;
          line-height: 1.5;
        }

        .success-hint {
          color: rgba(226, 232, 240, 0.6);
          font-size: 12px;
          margin: 0;
        }

        .reset-button {
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .reset-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }

        .token-display {
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }

        .token-label {
          color: rgba(226, 232, 240, 0.9);
          font-size: 13px;
          font-weight: 600;
          margin: 0 0 12px 0;
        }

        .token-code {
          display: block;
          background: rgba(0, 0, 0, 0.3);
          padding: 16px;
          border-radius: 8px;
          color: #a78bfa;
          font-family: 'Courier New', monospace;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 1px;
          word-break: break-all;
          margin-bottom: 12px;
        }

        .token-hint {
          color: rgba(226, 232, 240, 0.6);
          font-size: 12px;
          margin: 0;
        }

        .auth-footer {
          text-align: center;
          font-size: 13px;
          color: rgba(226, 232, 240, 0.7);
          margin-top: 20px;
        }

        .auth-link {
          color: #8b5cf6;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .auth-link:hover {
          color: #a78bfa;
        }
      `}</style>
    </div>
  );
}
