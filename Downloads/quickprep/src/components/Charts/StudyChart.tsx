'use client';

import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  Legend,
  ComposedChart,
} from 'recharts';
import { useLiveStats } from '../../lib/stats';
import { motion } from 'framer-motion';

const StudyChart = () => {
  const { stats } = useLiveStats();
  const [chartType, setChartType] = useState<'line' | 'bar' | 'composed'>('line');
  const [timeRange, setTimeRange] = useState<5 | 10 | 15>(10);
  const [showTable, setShowTable] = useState(false);
  
  // Sample data for when no real data exists
  const sampleData = [
    { time: '10:00:00', response: 2.5, mode: 'summary', timestamp: Date.now() - 600000, avgMs: 2500 },
    { time: '10:05:00', response: 3.2, mode: 'flashcards', timestamp: Date.now() - 480000, avgMs: 3200 },
    { time: '10:10:00', response: 1.8, mode: 'quiz', timestamp: Date.now() - 360000, avgMs: 1800 },
    { time: '10:15:00', response: 2.1, mode: 'mindmap', timestamp: Date.now() - 240000, avgMs: 2100 },
    { time: '10:20:00', response: 2.9, mode: 'questions', timestamp: Date.now() - 120000, avgMs: 2900 },
    { time: '10:25:00', response: 2.3, mode: 'plan', timestamp: Date.now() - 60000, avgMs: 2300 },
    { time: '10:30:00', response: 1.9, mode: 'summary', timestamp: Date.now() - 30000, avgMs: 1900 },
    { time: '10:35:00', response: 3.5, mode: 'quiz', timestamp: Date.now() - 10000, avgMs: 3500 },
    { time: '10:40:00', response: 2.7, mode: 'flashcards', timestamp: Date.now() - 5000, avgMs: 2700 },
    { time: '10:45:00', response: 2.2, mode: 'mindmap', timestamp: Date.now(), avgMs: 2200 },
  ];

  // Format chart data with real values from database
  const hasRealData = stats.recentRequests.length > 0;
  
  const allData = hasRealData 
    ? stats.recentRequests.map((req, i) => ({
        time: new Date(req.timestamp).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        }),
        response: parseFloat((req.duration / 1000).toFixed(2)),
        mode: req.mode,
        timestamp: req.timestamp,
        avgMs: Math.round(req.duration),
      }))
    : sampleData;

  // Get the most recent data points based on timeRange
  const chartData = allData.slice(-timeRange);

  // Calculate statistics
  const avgResponse = chartData.length > 0 
    ? (chartData.reduce((sum, d) => sum + d.response, 0) / chartData.length).toFixed(2)
    : '0.00';
  
  const maxResponse = chartData.length > 0 
    ? Math.max(...chartData.map(d => d.response)).toFixed(2)
    : '0.00';
  
  const minResponse = chartData.length > 0 
    ? Math.min(...chartData.map(d => d.response)).toFixed(2)
    : '0.00';

  // Mode distribution
  const modeCount = chartData.reduce((acc, req) => {
    acc[req.mode] = (acc[req.mode] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 border-2 border-purple-500 rounded-lg p-3 shadow-lg"
        >
          <p className="text-white font-bold text-sm">{data.time}</p>
          <p className="text-purple-300 font-semibold">{data.response}s</p>
          <p className="text-gray-300 text-xs">{data.avgMs}ms</p>
          <p className="text-cyan-300 text-xs capitalize">{data.mode}</p>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-purple-500/30 p-6 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white mb-1">
            📊 Performance Analytics {!hasRealData && <span className="text-sm text-yellow-400">(Demo Data)</span>}
          </h3>
          <p className="text-sm text-gray-400">
            {hasRealData 
              ? `Real-time API response tracking from database • ${stats.totalGenerations} total generations`
              : 'Sample visualization - Generate content to see your real statistics!'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="flex gap-3 flex-wrap">
          <div className="bg-purple-900/40 border border-purple-500/30 rounded-lg px-4 py-2">
            <p className="text-xs text-gray-300">Average</p>
            <p className="text-lg font-bold text-purple-300">{avgResponse}s</p>
          </div>
          <div className="bg-green-900/40 border border-green-500/30 rounded-lg px-4 py-2">
            <p className="text-xs text-gray-300">Min</p>
            <p className="text-lg font-bold text-green-300">{minResponse}s</p>
          </div>
          <div className="bg-red-900/40 border border-red-500/30 rounded-lg px-4 py-2">
            <p className="text-xs text-gray-300">Max</p>
            <p className="text-lg font-bold text-red-300">{maxResponse}s</p>
          </div>
          <div className="bg-blue-900/40 border border-blue-500/30 rounded-lg px-4 py-2">
            <p className="text-xs text-gray-300">Success Rate</p>
            <p className="text-lg font-bold text-blue-300">{hasRealData ? stats.successRate : 100}%</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        {/* Chart Type Selector */}
        <div className="flex gap-2 bg-slate-800/50 rounded-lg p-1 border border-purple-500/30">
          {[
            { type: 'line' as const, icon: '📈', label: 'Line' },
            { type: 'bar' as const, icon: '📊', label: 'Bar' },
            { type: 'composed' as const, icon: '📉', label: 'Composed' },
          ].map(({ type, icon, label }) => (
            <motion.button
              key={type}
              onClick={() => setChartType(type)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                chartType === type
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-slate-700/50 text-gray-300 hover:text-white'
              }`}
            >
              <span className="mr-1">{icon}</span>
              {label}
            </motion.button>
          ))}
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 bg-slate-800/50 rounded-lg p-1 border border-purple-500/30">
          {[5, 10, 15].map((range) => (
            <motion.button
              key={range}
              onClick={() => setTimeRange(range as 5 | 10 | 15)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                timeRange === range
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                  : 'bg-slate-700/50 text-gray-300 hover:text-white'
              }`}
            >
              {range}
            </motion.button>
          ))}
        </div>

        {/* Live Indicator */}
        <div className={`flex items-center gap-2 ml-auto rounded-lg px-4 py-2 border ${
          hasRealData 
            ? 'bg-green-900/40 border-green-500/30' 
            : 'bg-yellow-900/40 border-yellow-500/30'
        }`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            hasRealData ? 'bg-green-400' : 'bg-yellow-400'
          }`}></div>
          <span className={`text-xs font-semibold ${
            hasRealData ? 'text-green-300' : 'text-yellow-300'
          }`}>
            {hasRealData ? 'LIVE • Updates every 10s' : 'DEMO MODE'}
          </span>
        </div>

        {/* Table Toggle */}
        <motion.button
          onClick={() => setShowTable(!showTable)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all border border-cyan-400/50 shadow-lg hover:shadow-cyan-500/40"
        >
          <span className="mr-1">{showTable ? '📊' : '📋'}</span>
          {showTable ? 'Show Chart' : 'Show Table'}
        </motion.button>
      </div>

      {/* Chart or Table */}
      {!showTable ? (
        <motion.div
          key={chartType}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-6 bg-slate-800/30 rounded-xl p-4 border border-purple-500/20"
        >
          {!hasRealData && (
            <div className="mb-3 bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-3 text-center">
              <p className="text-yellow-300 text-sm font-semibold">
                🎯 This is sample data. Generate content to see your real statistics!
              </p>
            </div>
          )}
          {chartData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center flex-col gap-4">
              <div className="text-6xl">📊</div>
              <p className="text-gray-400 text-center">
                No data yet. Generate content to see real-time statistics!
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              {chartType === 'line' ? (
                <LineChart data={chartData}>
                  <defs>
                    <linearGradient id="colorResponse" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#94a3b8" 
                    style={{ fontSize: '10px' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#94a3b8" unit="s" style={{ fontSize: '12px' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="response" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    fill="url(#colorResponse)"
                    dot={{ fill: '#8b5cf6', r: 5, strokeWidth: 2 }}
                    activeDot={{ r: 8, fill: '#a78bfa' }}
                    isAnimationActive={true}
                    animationDuration={500}
                    name="Response Time (s)"
                  />
                </LineChart>
              ) : chartType === 'bar' ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#94a3b8" 
                    style={{ fontSize: '10px' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#94a3b8" unit="s" style={{ fontSize: '12px' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="response" 
                    fill="#8b5cf6" 
                    radius={[8, 8, 0, 0]}
                    name="Response Time (s)"
                    isAnimationActive={true}
                    animationDuration={500}
                  />
                </BarChart>
              ) : (
                <ComposedChart data={chartData}>
                  <defs>
                    <linearGradient id="colorResponse2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#94a3b8" 
                    style={{ fontSize: '10px' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#94a3b8" unit="s" style={{ fontSize: '12px' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="response" 
                    fill="#a78bfa" 
                    radius={[8, 8, 0, 0]}
                    opacity={0.6}
                    name="Response Time (Bar)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="response" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', r: 4 }}
                    name="Response Time (Line)"
                  />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          )}
        </motion.div>
      ) : (
        /* Data Table */
        chartData.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-6 bg-slate-800/30 rounded-xl p-4 border border-purple-500/20 overflow-x-auto"
          >
            <h4 className="text-sm font-bold text-white mb-3">📊 Raw Data (Most Recent {chartData.length})</h4>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-purple-500/30">
                  <th className="text-left py-2 px-2 text-purple-300">Time</th>
                  <th className="text-left py-2 px-2 text-purple-300">Response (s)</th>
                  <th className="text-left py-2 px-2 text-purple-300">Duration (ms)</th>
                  <th className="text-left py-2 px-2 text-purple-300">Mode</th>
                </tr>
              </thead>
              <tbody>
                {chartData.reverse().map((row, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-slate-700/50 hover:bg-purple-900/20"
                  >
                    <td className="py-2 px-2 text-gray-300">{row.time}</td>
                    <td className="py-2 px-2 text-cyan-300 font-semibold">{row.response}</td>
                    <td className="py-2 px-2 text-orange-300">{row.avgMs}</td>
                    <td className="py-2 px-2 text-green-300 capitalize">{row.mode}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        ) : (
          <div className="mb-6 h-[300px] flex items-center justify-center flex-col gap-4 bg-slate-800/30 rounded-xl border border-purple-500/20">
            <div className="text-6xl">📋</div>
            <p className="text-gray-400 text-center">
              No data yet. Generate content to see detailed statistics!
            </p>
          </div>
        )
      )}

      {/* Mode Distribution */}
      {Object.keys(modeCount).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/30 rounded-xl p-4 border border-purple-500/20 mb-4"
        >
          <h4 className="text-sm font-bold text-white mb-3">📋 Generation Mode Distribution</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Object.entries(modeCount).map(([mode, count]) => {
              const modeIcons: Record<string, string> = {
                summary: '📝',
                flashcards: '🎴',
                quiz: '❓',
                mindmap: '🧠',
                questions: '❔',
                plan: '📅',
              };
              
              return (
                <motion.div
                  key={mode}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-purple-600/40 to-pink-600/40 rounded-lg p-3 border border-purple-500/30 text-center hover:border-purple-400/60 transition-all cursor-pointer"
                >
                  <p className="text-2xl mb-2">{modeIcons[mode] || '📋'}</p>
                  <p className="text-xs text-gray-300 capitalize">{mode}</p>
                  <p className="text-xl font-bold text-purple-300 mt-1">{count}</p>
                  <p className="text-xs text-gray-400">generations</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Summary Stats Banner */}
      {(stats.totalGenerations > 0 || !hasRealData) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-900/50 via-pink-900/50 to-purple-900/50 rounded-xl p-4 border border-purple-500/30"
        >
          {!hasRealData && (
            <div className="mb-3 text-center">
              <p className="text-yellow-300 text-xs font-semibold">
                📊 Sample Statistics - Your real data will appear here after generation
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-purple-300">
                {hasRealData ? stats.totalGenerations : '0'}
              </p>
              <p className="text-xs text-gray-300">Total Generations</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-300">
                {hasRealData ? stats.successRate : 100}%
              </p>
              <p className="text-xs text-gray-300">Success Rate</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-cyan-300">
                {hasRealData ? stats.avgResponseTime.toFixed(2) : '0.00'}s
              </p>
              <p className="text-xs text-gray-300">Avg Response</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-300">
                {hasRealData ? stats.todayGenerations : '0'}
              </p>
              <p className="text-xs text-gray-300">Today's Count</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StudyChart;
