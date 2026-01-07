'use client';

import { useEffect, useState, useCallback } from 'react';
import AuthService from './authService';

export interface LiveStats {
  totalGenerations: number;
  successRate: number;
  avgResponseTime: number;
  activeToday: number;
  todayGenerations: number;
  recentRequests: Array<{ timestamp: number; mode: string; duration: number }>;
}

export const useLiveStats = () => {
  const [stats, setStats] = useState<LiveStats>({
    totalGenerations: 0,
    successRate: 100,
    avgResponseTime: 0,
    activeToday: 0,
    todayGenerations: 0,
    recentRequests: [],
  });

  // Fetch real stats from API
  useEffect(() => {
    const fetchStats = async () => {
      const token = AuthService.getToken();
      if (!token) {
        // No token, return early with default stats
        return;
      }

      try {
        const response = await fetch('/api/stats', {
          headers: {
            'Content-Type': 'application/json',
            ...AuthService.getAuthHeader(),
          },
          signal: AbortSignal.timeout(5000), // 5 second timeout
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else if (response.status === 401) {
          // Invalid token, clear it and stop fetching
          console.log('Invalid token, clearing authentication');
          AuthService.logout();
        }
      } catch (error: any) {
        // Silently fail on network errors or timeouts
        if (error?.name !== 'AbortError' && error?.name !== 'TimeoutError') {
          console.debug('Stats fetch skipped:', error.message);
        }
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const recordGeneration = useCallback(async (mode: string, duration: number, success: boolean) => {
    const token = AuthService.getToken();
    if (!token) return;

    try {
      await fetch('/api/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...AuthService.getAuthHeader(),
        },
        body: JSON.stringify({ mode, duration, success }),
      });

      // Update local stats immediately
      setStats(prev => ({
        totalGenerations: prev.totalGenerations + 1,
        successRate: Math.round(
          ((prev.totalGenerations * prev.successRate / 100) + (success ? 1 : 0)) / (prev.totalGenerations + 1) * 100
        ),
        avgResponseTime: prev.totalGenerations === 0 ? duration / 1000 : 
          ((prev.avgResponseTime * prev.totalGenerations) + (duration / 1000)) / (prev.totalGenerations + 1),
        activeToday: prev.activeToday + 1,
        todayGenerations: prev.todayGenerations + 1,
        recentRequests: [
          ...prev.recentRequests.slice(-9),
          { timestamp: Date.now(), mode, duration },
        ],
      }));
    } catch (error) {
      console.error('Failed to record stats:', error);
    }
  }, []);

  return { stats, recordGeneration };
};
