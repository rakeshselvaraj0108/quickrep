'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

export default function Toast({ id, message, type, duration = 4000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(22, 163, 74, 0.95) 100%)',
          border: 'rgba(134, 239, 172, 0.5)',
          shadow: 'rgba(34, 197, 94, 0.4)',
        };
      case 'error':
        return {
          bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%)',
          border: 'rgba(252, 165, 165, 0.5)',
          shadow: 'rgba(239, 68, 68, 0.4)',
        };
      case 'warning':
        return {
          bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.95) 0%, rgba(217, 119, 6, 0.95) 100%)',
          border: 'rgba(253, 224, 71, 0.5)',
          shadow: 'rgba(245, 158, 11, 0.4)',
        };
      case 'info':
        return {
          bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(37, 99, 235, 0.95) 100%)',
          border: 'rgba(147, 197, 253, 0.5)',
          shadow: 'rgba(59, 130, 246, 0.4)',
        };
    }
  };

  const colors = getColors();

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="toast"
      onClick={() => onClose(id)}
    >
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={() => onClose(id)}>✕</button>
      
      <style jsx>{`
        .toast {
          background: ${colors.bg};
          border: 1px solid ${colors.border};
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 300px;
          max-width: 500px;
          box-shadow: 0 10px 40px ${colors.shadow}, 0 0 0 1px rgba(255, 255, 255, 0.1);
          cursor: pointer;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .toast::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: rgba(255, 255, 255, 0.4);
          animation: progress ${duration}ms linear;
        }

        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        .toast-icon {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          font-weight: 900;
          font-size: 16px;
          color: white;
          flex-shrink: 0;
        }

        .toast-message {
          flex: 1;
          color: white;
          font-weight: 600;
          font-size: 14px;
          line-height: 1.5;
        }

        .toast-close {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #06b6d4, #0891b2);
          border: 2px solid #06b6d4;
          border-radius: 6px;
          color: white;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
        }

        .toast-close:hover {
          background: linear-gradient(135deg, #0891b2, #0e7490);
          transform: scale(1.15);
          box-shadow: 0 6px 16px rgba(6, 182, 212, 0.6);
        }
      `}</style>
    </motion.div>
  );
}
