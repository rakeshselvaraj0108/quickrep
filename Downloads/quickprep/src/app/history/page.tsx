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
  result?: any;
}

const modeIcons: Record<string, string> = {
  summary: '📝',
  flashcards: '🎴',
  quiz: '❓',
  mindmap: '🧠',
  questions: '❔',
  plan: '📅'
};

const modeColors: Record<string, { gradient: string; hover: string; glow: string }> = {
  summary: { gradient: 'from-blue-500 to-cyan-500', hover: 'from-blue-600 to-cyan-600', glow: 'shadow-blue-500/50' },
  flashcards: { gradient: 'from-purple-500 to-pink-500', hover: 'from-purple-600 to-pink-600', glow: 'shadow-purple-500/50' },
  quiz: { gradient: 'from-orange-500 to-red-500', hover: 'from-orange-600 to-red-600', glow: 'shadow-orange-500/50' },
  mindmap: { gradient: 'from-green-500 to-emerald-500', hover: 'from-green-600 to-emerald-600', glow: 'shadow-green-500/50' },
  questions: { gradient: 'from-indigo-500 to-blue-500', hover: 'from-indigo-600 to-blue-600', glow: 'shadow-indigo-500/50' },
  plan: { gradient: 'from-amber-500 to-yellow-500', hover: 'from-amber-600 to-yellow-600', glow: 'shadow-amber-500/50' }
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [viewingItem, setViewingItem] = useState<HistoryItem | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadHistory();
    loadFavorites();
  }, []);

  const loadHistory = () => {
    const savedHistory = localStorage.getItem('generationHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed);
      } catch (e) {
        console.error('Error loading history');
      }
    }
  };

  const loadFavorites = () => {
    const savedFavorites = localStorage.getItem('favoritedItems');
    if (savedFavorites) {
      try {
        setFavorites(new Set(JSON.parse(savedFavorites)));
      } catch (e) {
        console.error('Error loading favorites');
      }
    }
  };

  const filteredHistory = useMemo(() => {
    let result = history;

    if (filterMode !== 'all') {
      result = result.filter(item => item.mode === filterMode);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.content.toLowerCase().includes(query) || 
        item.mode.toLowerCase().includes(query)
      );
    }

    return result.sort((a, b) => b.timestamp - a.timestamp);
  }, [history, searchQuery, filterMode]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const deleteItem = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('generationHistory', JSON.stringify(updated));
    showNotification('Item deleted successfully!', 'success');
  };

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
      showNotification('Removed from favorites', 'success');
    } else {
      newFavorites.add(id);
      showNotification('Added to favorites!', 'success');
    }
    setFavorites(newFavorites);
    localStorage.setItem('favoritedItems', JSON.stringify(Array.from(newFavorites)));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showNotification('Copied to clipboard! ✓', 'success');
    }).catch(() => {
      showNotification('Failed to copy', 'error');
    });
  };

  const clearHistory = () => {
    if (confirm('Clear all history? This cannot be undone.')) {
      setHistory([]);
      localStorage.setItem('generationHistory', JSON.stringify([]));
      showNotification('History cleared successfully!', 'success');
    }
  };

  const modes = ['all', 'summary', 'flashcards', 'quiz', 'mindmap', 'questions', 'plan'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-64 -right-64 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-64 -left-64 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl font-bold text-white shadow-2xl backdrop-blur-xl border-2 ${
              notification.type === 'success'
                ? 'bg-gradient-to-r from-green-600/90 to-emerald-600/90 border-green-400/50 shadow-green-500/50'
                : 'bg-gradient-to-r from-red-600/90 to-rose-600/90 border-red-400/50 shadow-red-500/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{notification.type === 'success' ? '✓' : '✕'}</span>
              <span>{notification.message}</span>
            </div>
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
              className="fixed inset-0 bg-black/70 z-40 backdrop-blur-lg"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-gradient-to-br from-slate-900/95 via-purple-900/20 to-slate-900/95 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden border-2 border-white/10 shadow-2xl backdrop-blur-xl">
                {/* Modal Header */}
                <div className={`bg-gradient-to-r ${modeColors[viewingItem.mode]?.gradient || 'from-gray-600 to-gray-700'} px-8 py-6 flex items-center justify-between border-b border-white/10`}>
                  <div className="flex items-center gap-4">
                    <motion.span 
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                      className="text-6xl drop-shadow-lg"
                    >
                      {modeIcons[viewingItem.mode] || '📄'}
                    </motion.span>
                    <div>
                      <h2 className="text-3xl font-black text-white capitalize drop-shadow-lg">
                        {viewingItem.mode}
                      </h2>
                      <p className="text-sm text-white/80 mt-1 font-semibold">
                        {new Date(viewingItem.timestamp).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setViewingItem(null)}
                    className="w-12 h-12 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-2xl font-bold backdrop-blur-sm transition-all shadow-lg"
                  >
                    ✕
                  </motion.button>
                </div>

                {/* Modal Content */}
                <div className="p-8 max-h-[calc(90vh-180px)] overflow-y-auto custom-scrollbar">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-800/30 rounded-2xl p-6 border border-white/10 backdrop-blur-sm"
                  >
                    <p className="text-lg text-gray-200 leading-relaxed whitespace-pre-wrap font-medium">
                      {viewingItem.content}
                    </p>
                  </motion.div>

                  {/* Modal Actions */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyToClipboard(viewingItem.content)}
                      className="py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30"
                    >
                      📋 Copy
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleFavorite(viewingItem.id)}
                      className={`py-3 px-4 font-bold rounded-xl transition-all shadow-lg ${
                        favorites.has(viewingItem.id)
                          ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-amber-500/30'
                          : 'bg-slate-700/50 text-amber-300 shadow-slate-700/30 hover:bg-slate-600/50'
                      }`}
                    >
                      {favorites.has(viewingItem.id) ? '⭐ Saved' : '☆ Save'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        deleteItem(viewingItem.id);
                        setViewingItem(null);
                      }}
                      className="py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/30"
                    >
                      🗑️ Delete
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewingItem(null)}
                      className="py-3 px-4 bg-slate-700/50 hover:bg-slate-600/50 text-white font-bold rounded-xl transition-all shadow-lg"
                    >
                      ✕ Close
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-white/10 sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold transition-all hover:scale-110 shadow-lg shadow-purple-500/30"
              >
                ←
              </Link>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  📚 History
                </h1>
                <p className="text-gray-400 text-sm mt-1">Your learning journey</p>
              </div>
            </div>
            {history.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearHistory}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-all"
              >
                🗑️ Clear All
              </motion.button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-2xl p-4 border border-blue-500/30 backdrop-blur-sm"
            >
              <p className="text-gray-400 text-sm font-semibold">Total Items</p>
              <p className="text-3xl font-black text-cyan-300 mt-1">{history.length}</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl p-4 border border-purple-500/30 backdrop-blur-sm"
            >
              <p className="text-gray-400 text-sm font-semibold">Favorites</p>
              <p className="text-3xl font-black text-purple-300 mt-1">{favorites.size}</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-2xl p-4 border border-green-500/30 backdrop-blur-sm"
            >
              <p className="text-gray-400 text-sm font-semibold">This Week</p>
              <p className="text-3xl font-black text-green-300 mt-1">
                {history.filter(h => Date.now() - h.timestamp <= 7 * 24 * 60 * 60 * 1000).length}
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-gradient-to-br from-amber-600/20 to-yellow-600/20 rounded-2xl p-4 border border-amber-500/30 backdrop-blur-sm"
            >
              <p className="text-gray-400 text-sm font-semibold">Filtered</p>
              <p className="text-3xl font-black text-amber-300 mt-1">{filteredHistory.length}</p>
            </motion.div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Search your history..."
                className="w-full px-6 py-4 bg-slate-800/50 border-2 border-purple-500/30 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 transition-all backdrop-blur-sm font-semibold"
              />
            </div>
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="px-6 py-4 bg-slate-800/50 border-2 border-cyan-500/30 rounded-2xl text-white focus:outline-none focus:border-cyan-500/60 transition-all backdrop-blur-sm font-semibold cursor-pointer"
            >
              {modes.map(mode => (
                <option key={mode} value={mode} className="bg-slate-900">
                  {mode === 'all' ? '📂 All Types' : `${modeIcons[mode]} ${mode.charAt(0).toUpperCase() + mode.slice(1)}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.header>

      {/* History Items */}
      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {filteredHistory.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-9xl mb-6"
            >
              📭
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-400 mb-4">
              {searchQuery || filterMode !== 'all' ? 'No matching items' : 'No history yet'}
            </h2>
            <p className="text-gray-500 text-lg">
              {searchQuery || filterMode !== 'all' ? 'Try adjusting your filters' : 'Start generating content to build your history!'}
            </p>
            {(searchQuery || filterMode !== 'all') && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearchQuery('');
                  setFilterMode('all');
                }}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Clear Filters
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredHistory.map((item, index) => {
              const colors = modeColors[item.mode] || { gradient: 'from-gray-600 to-gray-700', hover: 'from-gray-700 to-gray-800', glow: 'shadow-gray-500/50' };
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  onClick={() => setViewingItem(item)}
                  className="relative group cursor-pointer"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-20 rounded-3xl blur-xl transition-opacity`} />
                  
                  <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-3xl p-6 border-2 border-white/10 hover:border-white/20 transition-all backdrop-blur-sm shadow-xl overflow-hidden">
                    {/* Favorite indicator */}
                    {favorites.has(item.id) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 right-4 text-2xl drop-shadow-lg"
                      >
                        ⭐
                      </motion.div>
                    )}

                    {/* Mode Icon */}
                    <motion.div 
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${colors.gradient} text-4xl mb-4 shadow-lg ${colors.glow}`}
                      whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {modeIcons[item.mode] || '📄'}
                    </motion.div>

                    {/* Mode Title */}
                    <h3 className="text-xl font-black text-white capitalize mb-2">
                      {item.mode}
                    </h3>

                    {/* Date */}
                    <p className="text-sm text-gray-400 mb-4 font-semibold">
                      {new Date(item.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>

                    {/* Preview */}
                    <p className="text-gray-300 line-clamp-3 leading-relaxed">
                      {item.preview || item.content.substring(0, 150) + '...'}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.id);
                        }}
                        className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all ${
                          favorites.has(item.id)
                            ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-lg shadow-amber-500/30'
                            : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600/50'
                        }`}
                      >
                        {favorites.has(item.id) ? '⭐' : '☆'}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(item.content);
                        }}
                        className="flex-1 py-2 px-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30"
                      >
                        📋
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this item?')) {
                            deleteItem(item.id);
                          }
                        }}
                        className="py-2 px-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/30"
                      >
                        🗑️
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #8b5cf6, #ec4899);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #a78bfa, #f472b6);
        }
      `}</style>
    </div>
  );
}
