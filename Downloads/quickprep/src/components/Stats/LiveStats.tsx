'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useLiveStats } from '../../lib/stats';

// Create a client-only version to avoid hydration issues
const LiveStatsContent = () => {
  const { stats } = useLiveStats();

  return (
    <div className="stats-hero">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number" aria-label="Total generations">
            {stats.totalGenerations.toLocaleString()}
          </div>
          <div className="stat-label">Total Generations</div>
          <div className="stat-change">+{stats.todayGenerations || 1} today</div>
        </div>

        <div className="stat-card">
          <div className="stat-number">{stats.successRate.toFixed(1)}%</div>
          <div className="stat-label">Success Rate</div>
          <div className="stat-badge success">Live</div>
        </div>

        <div className="stat-card">
          <div className="stat-number">
            {stats.avgResponseTime > 0 ? stats.avgResponseTime.toFixed(1) : '0.0'}s
          </div>
          <div className="stat-label">Avg Response</div>
          <div className="stat-change">
            {stats.avgResponseTime > 0 
              ? `${Math.abs(stats.avgResponseTime - 1.5).toFixed(1)}s ${stats.avgResponseTime < 1.5 ? 'below' : 'from'} avg`
              : 'No data'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-number">{stats.activeToday}</div>
          <div className="stat-label">Active Today</div>
          <div className="stat-badge active">+{stats.todayGenerations || 0}</div>
        </div>
      </div>

      <div className="stats-footer">
        <span>🟢 Live • Updated every 10s • {stats.recentRequests.length} recent requests</span>
      </div>
    </div>
  );
};

// Export as dynamic component to prevent SSR
const LiveStats = dynamic(() => Promise.resolve(LiveStatsContent), {
  ssr: false,
  loading: () => (
    <div className="stats-hero">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">0</div>
          <div className="stat-label">Loading...</div>
        </div>
      </div>
    </div>
  ),
});

export default LiveStats;
