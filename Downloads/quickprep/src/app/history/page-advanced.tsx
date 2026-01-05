'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface HistoryItem {
  id: string;
  mode: string;
  content: string;
  timestamp: number;
  preview: string;
  isFavorite?: boolean;
  wordCount?: number;
  charCount?: number;
}

const modeIcons: Record<string, string> = {
  summary: '📝',
  flashcards: '🎴',
  quiz: '❓',
  mindmap: '🧠',
  questions: '❔',
  plan: '📅'
};

const modeColors: Record<string, string> = {
  summary: 'from-blue-600 to-cyan-600',
  flashcards: 'from-purple-600 to-pink-600',
  quiz: 'from-orange-600 to-red-600',
  mindmap: 'from-green-600 to-emerald-600',
  questions: 'from-indigo-600 to-blue-600',
  plan: 'from-amber-600 to-yellow-600'
};

export default function HistoryPage() {
  // State Management
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [viewingItem, setViewingItem] = useState<HistoryItem | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'mode' | 'favorites' | 'wordcount'>('newest');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'analytics' | 'manage'>('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Load history
  useEffect(() => {
    loadHistory();
    window.addEventListener('storage', loadHistory);
    return () => window.removeEventListener('storage', loadHistory);
  }, []);

  const loadHistory = () => {
    const savedHistory = localStorage.getItem('generationHistory');
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory) as HistoryItem[];
      // Add word/char counts
      const enhanced = parsed.map(item => ({
        ...item,
        wordCount: item.content.split(/\s+/).length,
        charCount: item.content.length,
      }));
      setHistory(enhanced);
    }
  };

  // Date filtering logic
  const getDateFilter = (item: HistoryItem) => {
    const now = Date.now();
    const itemDate = item.timestamp;
    const dayMs = 24 * 60 * 60 * 1000;

    switch (dateRange) {
      case 'today':
        return now - itemDate < dayMs;
      case 'week':
        return now - itemDate < 7 * dayMs;
      case 'month':
        return now - itemDate < 30 * dayMs;
      default:
        return true;
    }
  };

  // Filtered and sorted history
  const filteredHistory = useMemo(() => {
    let filtered = history.filter(item => 
      (filterMode === 'all' || item.mode === filterMode) &&
      (searchQuery === '' || item.content.toLowerCase().includes(searchQuery.toLowerCase())) &&
      getDateFilter(item)
    );

    if (activeTab === 'favorites') {
      filtered = filtered.filter(item => item.isFavorite);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return a.timestamp - b.timestamp;
        case 'mode':
          return a.mode.localeCompare(b.mode);
        case 'favorites':
          return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
        case 'wordcount':
          return (b.wordCount || 0) - (a.wordCount || 0);
        case 'newest':
        default:
          return b.timestamp - a.timestamp;
      }
    });

    return filtered;
  }, [history, filterMode, searchQuery, dateRange, sortBy, activeTab]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const stats = {
      total: history.length,
      byMode: {} as Record<string, number>,
      favorites: history.filter(h => h.isFavorite).length,
      today: history.filter(h => Date.now() - h.timestamp < 24 * 60 * 60 * 1000).length,
      thisWeek: history.filter(h => Date.now() - h.timestamp < 7 * 24 * 60 * 60 * 1000).length,
      totalWords: history.reduce((sum, h) => sum + (h.wordCount || 0), 0),
      mostUsedMode: '',
    };

    history.forEach(item => {
      stats.byMode[item.mode] = (stats.byMode[item.mode] || 0) + 1;
    });

    const sorted = Object.entries(stats.byMode).sort((a, b) => b[1] - a[1]);
    stats.mostUsedMode = sorted[0]?.[0] || 'N/A';

    return stats;
  }, [history]);

  // Utility functions
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const toggleFavorite = (id: string) => {
    const updated = history.map(item =>
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    );
    setHistory(updated);
    localStorage.setItem('generationHistory', JSON.stringify(updated));
    showNotification(updated.find(h => h.id === id)?.isFavorite ? '⭐ Favorited!' : '☆ Removed from favorites', 'success');
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const selectAll = () => {
    if (selectedItems.size === filteredHistory.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredHistory.map(h => h.id)));
    }
  };

  const deleteSelected = () => {
    if (selectedItems.size === 0) return;
    if (confirm(`Delete ${selectedItems.size} items?`)) {
      const updated = history.filter(item => !selectedItems.has(item.id));
      setHistory(updated);
      localStorage.setItem('generationHistory', JSON.stringify(updated));
      setSelectedItems(new Set());
      showNotification(`🗑️ Deleted ${selectedItems.size} items!`, 'success');
    }
  };

  const exportSelected = () => {
    const itemsToExport = filteredHistory.filter(item => selectedItems.has(item.id));
    if (itemsToExport.length === 0) return;

    const exportData = {
      exportDate: new Date().toISOString(),
      totalItems: itemsToExport.length,
      items: itemsToExport.map(item => ({
        mode: item.mode,
        content: item.content,
        wordCount: item.wordCount,
        charCount: item.charCount,
        timestamp: new Date(item.timestamp).toLocaleString(),
      }))
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quickprep-export-${Date.now()}.json`;
    link.click();
    showNotification(`📤 Exported ${itemsToExport.length} items!`, 'success');
  };

  const deleteItem = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('generationHistory', JSON.stringify(updated));
    showNotification('Item deleted!', 'success');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showNotification('📋 Copied to clipboard!', 'success');
    }).catch(() => {
      showNotification('Failed to copy', 'error');
    });
  };

  const clearHistory = () => {
    if (confirm('⚠️ Clear all history? This cannot be undone.')) {
      setHistory([]);
      localStorage.removeItem('generationHistory');
      showNotification('History cleared!', 'success');
    }
  };

  const modes = ['all', 'summary', 'flashcards', 'quiz', 'mindmap', 'questions', 'plan'];
  const tabs = [
    { id: 'all', label: '📚 All Items', icon: '📚' },
    { id: 'favorites', label: '⭐ Favorites', icon: '⭐' },
    { id: 'analytics', label: '📊 Analytics', icon: '📊' },
    { id: 'manage', label: '⚙️ Manage', icon: '⚙️' },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 20 }}
            className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl font-bold text-white border shadow-2xl backdrop-blur-sm ${
              notification.type === 'success'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 border-green-400 shadow-green-500/40'
                : 'bg-gradient-to-r from-red-600 to-rose-600 border-red-400 shadow-red-500/40'
            }`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Content Modal */}
      <AnimatePresence>
        {viewingItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingItem(null)}
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
            >
              <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto border border-white/10 shadow-2xl backdrop-blur-xl">
                {/* Modal Header */}
                <div className="sticky top-0 bg-gradient-to-r from-slate-800/80 to-slate-900/80 border-b border-white/10 px-8 py-6 flex items-center justify-between backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{modeIcons[viewingItem.mode] || '📄'}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-white capitalize">{viewingItem.mode}</h2>
                      <p className="text-sm text-gray-300 mt-1">
                        {new Date(viewingItem.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewingItem(null)}
                    className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl transition-all"
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Stats */}
                <div className="px-8 py-4 border-b border-white/10 flex gap-6">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Words</p>
                    <p className="text-2xl font-bold text-white">{viewingItem.wordCount || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Characters</p>
                    <p className="text-2xl font-bold text-white">{viewingItem.charCount || 0}</p>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-8">
                  <p className="text-base md:text-lg text-gray-200 leading-relaxed whitespace-pre-wrap font-medium">
                    {viewingItem.content}
                  </p>

                  {/* Modal Actions */}
                  <div className="flex gap-3 mt-8 flex-wrap">
                    <button
                      onClick={() => {
                        copyToClipboard(viewingItem.content);
                        setTimeout(() => setViewingItem(null), 500);
                      }}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-blue-500/40"
                    >
                      📋 Copy Content
                    </button>
                    <button
                      onClick={() => {
                        toggleFavorite(viewingItem.id);
                      }}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-yellow-500/40"
                    >
                      {viewingItem.isFavorite ? '⭐ Unfavorite' : '☆ Favorite'}
                    </button>
                    <button
                      onClick={() => setViewingItem(null)}
                      className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-white/10 sticky top-0 z-40 bg-gradient-to-b from-slate-950/80 to-transparent backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/dashboard"
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105"
            >
              ←
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">📚 History</h1>
          <p className="text-gray-400 text-lg">Smart content management & analytics</p>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-white/10 bg-slate-950/50 backdrop-blur-sm sticky top-[140px] z-30">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSelectedItems(new Set());
                }}
                className={`px-4 py-4 font-semibold whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-white bg-white/5'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab.icon} {tab.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        {/* TAB: All Items */}
        {activeTab === 'all' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-6 md:p-8 backdrop-blur-xl hover:border-white/30 transition-all group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Total Records</p>
                  <p className="text-5xl md:text-6xl font-black text-white mb-2">{history.length}</p>
                  <p className="text-xs md:text-sm text-gray-400">All generated content</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-6 md:p-8 backdrop-blur-xl hover:border-white/30 transition-all group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Filtered Results</p>
                  <p className="text-5xl md:text-6xl font-black text-white mb-2">{filteredHistory.length}</p>
                  <p className="text-xs md:text-sm text-gray-400">{filterMode === 'all' ? 'All modes' : `${filterMode} mode`}</p>
                </div>
              </motion.div>
            </div>

            {/* Search & Filters */}
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-xl">
                  🔍
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your generations…"
                  className="w-full bg-white/5 border border-white/20 rounded-lg pl-12 pr-4 py-3 md:py-4 text-white text-sm md:text-base placeholder-gray-500 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-all backdrop-blur-sm hover:border-white/30"
                />
              </div>

              {/* Filter Controls */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/40 hover:border-white/30 transition-all"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="mode">By Mode</option>
                  <option value="wordcount">Word Count</option>
                  <option value="favorites">Favorites First</option>
                </select>

                {/* Date Filter */}
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/40 hover:border-white/30 transition-all"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-400 hover:text-white'}`}
                  >
                    ☰ List
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-400 hover:text-white'}`}
                  >
                    ⊞ Grid
                  </button>
                </div>
              </div>

              {/* Mode Filter Tabs */}
              <div className="flex gap-2 flex-wrap">
                {modes.map((mode, idx) => (
                  <motion.button
                    key={mode}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setFilterMode(mode)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 md:px-5 py-2 md:py-2.5 rounded-full text-sm md:text-base font-semibold whitespace-nowrap transition-all ${
                      filterMode === mode
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400/50'
                        : 'bg-white/10 text-gray-300 border border-white/20 hover:bg-white/15 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {mode === 'all' ? '⭐ All' : modeIcons[mode] + ' ' + mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* History List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
              {filteredHistory.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="col-span-full flex flex-col items-center justify-center py-20 md:py-32"
                >
                  <div className="text-8xl md:text-9xl mb-6 opacity-40">📭</div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">No history yet</h2>
                  <p className="text-gray-400 text-center text-base md:text-lg max-w-md">
                    {searchQuery || filterMode !== 'all' || dateRange !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'Your generated content will appear here'}
                  </p>
                </motion.div>
              ) : (
                filteredHistory.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-6 md:p-7 transition-all hover:border-white/40 hover:bg-gradient-to-br hover:from-white/15 hover:to-white/8 hover:shadow-lg hover:shadow-black/20 backdrop-blur-sm"
                  >
                    {/* Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="absolute top-4 right-4 w-5 h-5 cursor-pointer opacity-0 group-hover:opacity-100 transition-all"
                    />

                    {/* Top Row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <span className="text-4xl flex-shrink-0">{modeIcons[item.mode] || '📄'}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg md:text-xl font-semibold text-white capitalize">{item.mode}</h3>
                          <p className="text-xs md:text-sm text-gray-400 mt-1">
                            {new Date(item.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className="flex-shrink-0 text-2xl hover:scale-125 transition-all"
                      >
                        {item.isFavorite ? '⭐' : '☆'}
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 mb-4 text-xs text-gray-400">
                      <span>{item.wordCount || 0} words</span>
                      <span>•</span>
                      <span>{item.charCount || 0} chars</span>
                    </div>

                    {/* Preview */}
                    <p className="text-sm md:text-base text-gray-300 mb-5 line-clamp-2 leading-relaxed">
                      {item.preview}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => copyToClipboard(item.content)}
                        className="flex-1 py-2 px-3 md:py-2.5 md:px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-sm md:text-base font-semibold rounded-lg transition-all shadow-lg hover:shadow-blue-500/40"
                      >
                        📋 Copy
                      </button>
                      <button
                        onClick={() => setViewingItem(item)}
                        className="flex-1 py-2 px-3 md:py-2.5 md:px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm md:text-base font-semibold rounded-lg transition-all shadow-lg hover:shadow-purple-500/40"
                      >
                        👁️ View
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="py-2 px-3 md:py-2.5 md:px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-sm md:text-base font-semibold rounded-lg transition-all"
                      >
                        🗑️
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Clear History */}
            {history.length > 0 && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={clearHistory}
                className="w-full py-3 md:py-4 px-6 bg-gradient-to-r from-red-600/20 to-rose-600/20 hover:from-red-600/30 hover:to-rose-600/30 border border-red-400/30 hover:border-red-400/50 text-red-300 hover:text-red-200 font-semibold rounded-lg transition-all"
              >
                🗑️ Clear All History
              </motion.button>
            )}
          </motion.div>
        )}

        {/* TAB: Favorites */}
        {activeTab === 'favorites' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="text-center py-12">
              <p className="text-5xl mb-4">⭐</p>
              <h2 className="text-2xl font-bold text-white mb-2">Your Favorite Items</h2>
              <p className="text-gray-400">{analytics.favorites} favorited items</p>
            </div>

            {history.filter(h => h.isFavorite).length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No favorites yet. Star your favorite items!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history
                  .filter(h => h.isFavorite)
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-400/30 p-6 md:p-7 transition-all hover:border-yellow-400/50 backdrop-blur-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl">{modeIcons[item.mode]}</span>
                            <h3 className="text-lg font-semibold text-white capitalize">{item.mode}</h3>
                          </div>
                          <p className="text-sm text-gray-300 line-clamp-2">{item.preview}</p>
                        </div>
                        <button
                          onClick={() => {
                            copyToClipboard(item.content);
                          }}
                          className="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-all"
                        >
                          📋 Copy
                        </button>
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB: Analytics */}
        {activeTab === 'analytics' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-400/30 p-6 text-center"
              >
                <p className="text-4xl font-black text-blue-400">{history.length}</p>
                <p className="text-sm text-gray-300 mt-2">Total Items</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-lg bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-400/30 p-6 text-center"
              >
                <p className="text-4xl font-black text-yellow-400">{analytics.favorites}</p>
                <p className="text-sm text-gray-300 mt-2">Favorited</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-lg bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-400/30 p-6 text-center"
              >
                <p className="text-4xl font-black text-green-400">{analytics.today}</p>
                <p className="text-sm text-gray-300 mt-2">Today</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-400/30 p-6 text-center"
              >
                <p className="text-4xl font-black text-purple-400">{analytics.thisWeek}</p>
                <p className="text-sm text-gray-300 mt-2">This Week</p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* By Mode */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-white/5 border border-white/10 p-8 backdrop-blur-sm"
              >
                <h3 className="text-xl font-bold text-white mb-6">📊 Content by Mode</h3>
                <div className="space-y-4">
                  {Object.entries(analytics.byMode)
                    .sort((a, b) => b[1] - a[1])
                    .map(([mode, count], idx) => (
                      <div key={mode} className="flex items-center gap-4">
                        <span className="text-2xl">{modeIcons[mode]}</span>
                        <div className="flex-1">
                          <p className="text-white capitalize font-semibold">{mode}</p>
                          <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${(count / history.length) * 100}%`
                              }}
                              transition={{ delay: 0.5 + idx * 0.1 }}
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                            />
                          </div>
                        </div>
                        <span className="text-white font-bold">{count}</span>
                      </div>
                    ))}
                </div>
              </motion.div>

              {/* Summary Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-lg bg-white/5 border border-white/10 p-8 backdrop-blur-sm space-y-4"
              >
                <h3 className="text-xl font-bold text-white mb-6">📈 Summary</h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-gray-300">Most Used Mode</span>
                    <span className="text-white font-bold capitalize">{analytics.mostUsedMode}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-gray-300">Total Words</span>
                    <span className="text-white font-bold">{analytics.totalWords.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-gray-300">Average Words</span>
                    <span className="text-white font-bold">{Math.round(analytics.totalWords / Math.max(history.length, 1))}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-gray-300">Oldest Item</span>
                    <span className="text-white font-bold text-sm">
                      {history.length > 0 ? new Date(Math.min(...history.map(h => h.timestamp))).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* TAB: Manage */}
        {activeTab === 'manage' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {selectedItems.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-400/30 rounded-lg p-6 flex items-center justify-between backdrop-blur-sm"
              >
                <div>
                  <p className="text-white font-bold text-lg">{selectedItems.size} items selected</p>
                  <p className="text-gray-300 text-sm">Perform bulk actions on selected items</p>
                </div>
                <button
                  onClick={() => setSelectedItems(new Set())}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                >
                  Clear Selection
                </button>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Selection Controls */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-white/5 border border-white/10 p-8 backdrop-blur-sm space-y-4"
              >
                <h3 className="text-xl font-bold text-white mb-6">📋 Selection</h3>

                <button
                  onClick={selectAll}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-lg transition-all"
                >
                  {selectedItems.size === filteredHistory.length ? '☐ Deselect All' : '☑️ Select All'}
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedItems(new Set())}
                    className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => {
                      const newSelected = new Set(
                        filteredHistory
                          .filter(h => h.isFavorite)
                          .map(h => h.id)
                      );
                      setSelectedItems(newSelected);
                    }}
                    className="flex-1 py-3 px-4 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 font-semibold rounded-lg transition-all border border-yellow-400/30"
                  >
                    ⭐ Favorites
                  </button>
                </div>
              </motion.div>

              {/* Bulk Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-lg bg-white/5 border border-white/10 p-8 backdrop-blur-sm space-y-4"
              >
                <h3 className="text-xl font-bold text-white mb-6">⚙️ Actions</h3>

                <button
                  onClick={exportSelected}
                  disabled={selectedItems.size === 0}
                  className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
                >
                  📤 Export ({selectedItems.size})
                </button>

                <button
                  onClick={deleteSelected}
                  disabled={selectedItems.size === 0}
                  className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
                >
                  🗑️ Delete ({selectedItems.size})
                </button>

                <button
                  onClick={clearHistory}
                  className="w-full py-3 px-4 bg-red-600/20 hover:bg-red-600/30 text-red-300 font-semibold rounded-lg transition-all border border-red-400/30"
                >
                  🔥 Clear All History
                </button>
              </motion.div>
            </div>

            {/* Item List for Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-lg bg-white/5 border border-white/10 p-8 backdrop-blur-sm"
            >
              <h3 className="text-xl font-bold text-white mb-6">📝 Items</h3>

              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <span className="text-2xl">{modeIcons[item.mode]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold capitalize">{item.mode}</p>
                      <p className="text-xs text-gray-400 truncate">{item.preview}</p>
                    </div>
                    <button
                      onClick={() => toggleFavorite(item.id)}
                      className="text-lg"
                    >
                      {item.isFavorite ? '⭐' : '☆'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
