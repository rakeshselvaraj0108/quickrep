'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useToast } from '@/components/Toast/ToastContainer';

function LoginContent() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  useEffect(() => {
    if (searchParams?.get('registered')) {
      toast.success('Account created successfully! Please log in.');
    }
    if (searchParams?.get('reset') === 'success') {
      toast.success('Password reset successful! You can now log in.');
    }
  }, [searchParams, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Login failed');
        return;
      }

      // Store token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Welcome back! Redirecting...');
      
      // Force navigation to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      toast.error('An error occurred. Please try again.');
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
          <div className="auth-header">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to continue your learning journey</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <Link href="/forgot-password" className="forgot-password">Forgot password?</Link>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? (
                <span className="button-loading">
                  <span className="spinner"></span>
                  Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account?{' '}
            <Link href="/register" className="auth-link">
              Sign Up
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
          max-width: 420px;
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

        .auth-success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #86efac;
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

        .forgot-password {
          font-size: 13px;
          color: #8b5cf6;
          text-decoration: none;
          transition: color 0.3s ease;
          align-self: flex-end;
        }

        .forgot-password:hover {
          color: #a78bfa;
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
          position: relative;
          overflow: hidden;
        }

        .auth-button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .auth-button:hover:not(:disabled)::before {
          width: 300px;
          height: 300px;
        }

        .auth-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }

        .auth-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .button-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .auth-header {
          margin-bottom: 32px;
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

export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
