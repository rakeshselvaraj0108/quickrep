'use client';

import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export default function Skeleton({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '8px',
  className = ''
}: SkeletonProps) {
  return (
    <div className={`skeleton ${className}`}>
      <style jsx>{`
        .skeleton {
          width: ${width};
          height: ${height};
          border-radius: ${borderRadius};
          background: linear-gradient(
            90deg,
            rgba(102, 126, 234, 0.08) 0%,
            rgba(118, 75, 162, 0.12) 50%,
            rgba(102, 126, 234, 0.08) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
          position: relative;
          overflow: hidden;
        }

        .skeleton::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 100%
          );
          animation: slide 1.5s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        @keyframes slide {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card-skeleton">
      <Skeleton height="200px" borderRadius="16px" />
      <div style={{ marginTop: '16px' }}>
        <Skeleton height="24px" width="80%" />
      </div>
      <div style={{ marginTop: '12px' }}>
        <Skeleton height="16px" width="60%" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton">
      <div className="skeleton-header">
        <Skeleton height="40px" width="250px" borderRadius="12px" />
      </div>
      <div className="skeleton-stats">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} height="120px" borderRadius="16px" />
        ))}
      </div>
      <div className="skeleton-content">
        <Skeleton height="400px" borderRadius="20px" />
      </div>
      <style jsx>{`
        .dashboard-skeleton {
          padding: 40px;
        }

        .skeleton-header {
          margin-bottom: 32px;
        }

        .skeleton-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }

        .skeleton-content {
          width: 100%;
        }

        @media (max-width: 768px) {
          .skeleton-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
