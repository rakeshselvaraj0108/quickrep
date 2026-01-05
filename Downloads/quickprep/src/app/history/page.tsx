'use client';

import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface HistoryItem {
  id: string;
  mode: string;
  content: string;
  timestamp: number;
  preview: string;
  isFavorite?: boolean;
  tags?: string[];
  category?: string;
}

interface Analytics {
  totalRecords: number;
  byMode: Record<string, number>;
  averageLength: number;
  oldestEntry: number;
  newestEntry: number;
  lastWeek: number;
  lastMonth: number;
  dailyStats: Record<string, number>;
}

interface UndoState {
  history: HistoryItem[];
  timestamp: number;
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

// Reactbit-style animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 30 }
  }
} as const;

const glowVariants = {
  initial: { boxShadow: '0 0 0px rgba(34, 197, 94, 0)' },
  hover: { boxShadow: '0 0 20px rgba(34, 197, 94, 0.6), 0 0 40px rgba(34, 197, 94, 0.3)' }
};

type TabType = 'overview' | 'analytics' | 'bulk' | 'favorites';

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [viewingItem, setViewingItem] = useState<HistoryItem | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'contentLength' | 'mode'>('newest');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [undoStack, setUndoStack] = useState<UndoState[]>([]);
  const [redoStack, setRedoStack] = useState<UndoState[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const undoTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadHistory();
    loadFavorites();
    window.addEventListener('storage', loadHistory);
    
    // Keyboard shortcuts
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          handleUndo();
        } else if (e.key === 'y') {
          e.preventDefault();
          handleRedo();
        } else if (e.key === 'f') {
          e.preventDefault();
          const searchInput = document.querySelector('input[placeholder="Search content…"]') as HTMLInputElement;
          searchInput?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('storage', loadHistory);
      window.removeEventListener('keydown', handleKeyPress);
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    };
  }, []);

  const loadHistory = () => {
    const savedHistory = localStorage.getItem('generationHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed);
      } catch (e) {
        showNotification('Error loading history', 'error');
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

  const saveToHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem('generationHistory', JSON.stringify(newHistory));
    
    // Add to undo stack
    setUndoStack(prev => [...prev.slice(-19), { history, timestamp: Date.now() }]);
    setRedoStack([]);
  };

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previousState = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, { history, timestamp: Date.now() }]);
    setHistory(previousState.history);
    localStorage.setItem('generationHistory', JSON.stringify(previousState.history));
    setUndoStack(prev => prev.slice(0, -1));
    showNotification('Undo successful', 'success');
  }, [undoStack, history]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, { history, timestamp: Date.now() }]);
    setHistory(nextState.history);
    localStorage.setItem('generationHistory', JSON.stringify(nextState.history));
    setRedoStack(prev => prev.slice(0, -1));
    showNotification('Redo successful', 'success');
  }, [redoStack, history]);

  // Calculate analytics data with daily stats
  const analytics = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;

    const dailyStats: Record<string, number> = {};
    history.forEach(item => {
      const date = new Date(item.timestamp).toISOString().split('T')[0];
      dailyStats[date] = (dailyStats[date] || 0) + 1;
    });

    return {
      totalRecords: history.length,
      byMode: Object.fromEntries(
        Array.from(new Set(history.map(h => h.mode))).map(mode => [
          mode,
          history.filter(h => h.mode === mode).length
        ])
      ),
      averageLength: history.length > 0 
        ? Math.round(history.reduce((sum, h) => sum + h.content.length, 0) / history.length)
        : 0,
      oldestEntry: history.length > 0 ? Math.min(...history.map(h => h.timestamp)) : 0,
      newestEntry: history.length > 0 ? Math.max(...history.map(h => h.timestamp)) : 0,
      lastWeek: history.filter(h => now - h.timestamp <= oneWeek).length,
      lastMonth: history.filter(h => now - h.timestamp <= oneMonth).length,
      dailyStats
    } as Analytics;
  }, [history]);

  // Filtered history with all filters applied
  const filteredHistory = useMemo(() => {
    let result = history;
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;

    // Apply date range filter
    if (dateRange === 'today') {
      result = result.filter(item => now - item.timestamp <= oneDay);
    } else if (dateRange === 'week') {
      result = result.filter(item => now - item.timestamp <= oneWeek);
    } else if (dateRange === 'month') {
      result = result.filter(item => now - item.timestamp <= oneMonth);
    }

    // Apply mode filter
    if (filterMode !== 'all') {
      result = result.filter(item => item.mode === filterMode);
    }

    // Apply tag filter
    if (selectedTags.size > 0) {
      result = result.filter(item => 
        item.tags && item.tags.some(tag => selectedTags.has(tag))
      );
    }

    // Apply search query with highlighting support
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.content.toLowerCase().includes(query) || 
        item.mode.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.timestamp - a.timestamp;
        case 'oldest':
          return a.timestamp - b.timestamp;
        case 'contentLength':
          return b.content.length - a.content.length;
        case 'mode':
          return a.mode.localeCompare(b.mode);
        default:
          return 0;
      }
    });

    return result;
  }, [history, searchQuery, filterMode, dateRange, sortBy, selectedTags]);

  // Pagination
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const deleteItem = useCallback((id: string) => {
    const updated = history.filter(item => item.id !== id);
    saveToHistory(updated);
    showNotification('Item deleted successfully!', 'success');
  }, [history]);

  const editItem = useCallback((id: string, content: string) => {
    setEditingId(id);
    setEditingContent(content);
  }, []);

  const saveEdit = useCallback(() => {
    if (!editingId) return;
    const updated = history.map(item =>
      item.id === editingId
        ? { ...item, content: editingContent, preview: editingContent.substring(0, 100) }
        : item
    );
    saveToHistory(updated);
    setEditingId(null);
    setEditingContent('');
    showNotification('Item updated successfully!', 'success');
  }, [editingId, editingContent, history]);

  const duplicateItem = useCallback((item: HistoryItem) => {
    const newItem: HistoryItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: Date.now()
    };
    const updated = [newItem, ...history];
    saveToHistory(updated);
    showNotification('Item duplicated!', 'success');
  }, [history]);

  const toggleFavorite = useCallback((id: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
    localStorage.setItem('favoritedItems', JSON.stringify(Array.from(newFavorites)));
  }, [favorites]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showNotification('Copied to clipboard! ✓', 'success');
    }).catch(() => {
      showNotification('Failed to copy', 'error');
    });
  };

  const toggleSelectItem = useCallback((id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  }, [selectedItems]);

  const selectAllFiltered = useCallback(() => {
    if (selectedItems.size === filteredHistory.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredHistory.map(item => item.id)));
    }
  }, [selectedItems, filteredHistory]);

  const deleteSelected = useCallback(() => {
    if (selectedItems.size === 0) return;
    if (!confirm(`Delete ${selectedItems.size} selected items?`)) return;

    const updated = history.filter(item => !selectedItems.has(item.id));
    saveToHistory(updated);
    setSelectedItems(new Set());
    showNotification(`${selectedItems.size} items deleted!`, 'success');
  }, [history, selectedItems]);

  const exportAsCSV = useCallback(() => {
    const headers = ['Mode', 'Content', 'Date', 'Length'];
    const rows = filteredHistory.map(item => [
      item.mode,
      `"${item.content.replace(/"/g, '""')}"`,
      new Date(item.timestamp).toISOString(),
      item.content.length
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showNotification('Exported to CSV!', 'success');
  }, [filteredHistory]);

  const exportAsJSON = useCallback(() => {
    const json = JSON.stringify(filteredHistory, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `history-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    showNotification('Exported to JSON!', 'success');
  }, [filteredHistory]);

  const clearHistory = () => {
    if (confirm('Clear all history? This cannot be undone.')) {
      saveToHistory([]);
      setSelectedItems(new Set());
      showNotification('History cleared successfully!', 'success');
    }
  };

  const modes = ['all', 'summary', 'flashcards', 'quiz', 'mindmap', 'questions', 'plan'];
  const favoriteItems = filteredHistory.filter(item => favorites.has(item.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 20 }}
            className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl font-bold text-white border-2 shadow-2xl backdrop-blur-sm ${
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
              <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-white/10 shadow-2xl backdrop-blur-xl">
                {/* Modal Header */}
                <div className="sticky top-0 bg-gradient-to-r from-slate-800/80 to-slate-900/80 border-b border-white/10 px-8 py-6 flex items-center justify-between backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{modeIcons[viewingItem.mode] || '📄'}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-cyan-300 capitalize">{viewingItem.mode}</h2>
                      <p className="text-sm text-cyan-300 mt-1">
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
                    className="w-10 h-10 rounded-lg bg-red-600/20 hover:bg-red-600/40 flex items-center justify-center text-red-400 text-xl transition-all"
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-8 space-y-6">
                  {editingId === viewingItem.id ? (
                    <div className="space-y-4">
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="w-full h-48 bg-slate-700/50 border border-cyan-500/30 rounded-lg p-4 text-cyan-300 placeholder-cyan-600 focus:outline-none focus:border-cyan-400/60"
                        placeholder="Edit content..."
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={saveEdit}
                          className="flex-1 py-2 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg transition-all"
                        >
                          ✓ Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex-1 py-2 px-4 bg-slate-700/50 text-cyan-300 font-semibold rounded-lg transition-all"
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-base md:text-lg text-gray-200 leading-relaxed whitespace-pre-wrap font-medium">
                        {viewingItem.content}
                      </p>

                      {/* Modal Actions */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <button
                          onClick={() => {
                            copyToClipboard(viewingItem.content);
                            setTimeout(() => setViewingItem(null), 500);
                          }}
                          className="py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-lg transition-all shadow-lg"
                          title="Copy to clipboard"
                        >
                          📋 Copy
                        </button>
                        <button
                          onClick={() => editItem(viewingItem.id, viewingItem.content)}
                          className="py-3 px-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-semibold rounded-lg transition-all"
                          title="Edit content"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => {
                            duplicateItem(viewingItem);
                            setViewingItem(null);
                          }}
                          className="py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-lg transition-all"
                          title="Duplicate item"
                        >
                          📋 Clone
                        </button>
                        <button
                          onClick={() => toggleFavorite(viewingItem.id)}
                          className={`py-3 px-4 font-semibold rounded-lg transition-all ${
                            favorites.has(viewingItem.id)
                              ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-lg'
                              : 'bg-slate-700/50 text-amber-300'
                          }`}
                        >
                          {favorites.has(viewingItem.id) ? '⭐ Saved' : '☆ Save'}
                        </button>
                        <button
                          onClick={() => {
                            deleteItem(viewingItem.id);
                            setViewingItem(null);
                          }}
                          className="py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold rounded-lg transition-all"
                          title="Delete item"
                        >
                          🗑️ Delete
                        </button>
                        <button
                          onClick={() => setViewingItem(null)}
                          className="py-3 px-4 bg-slate-700/50 text-cyan-300 font-semibold rounded-lg transition-all"
                        >
                          ✕ Close
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <header className="border-b border-cyan-500/30 sticky top-0 z-40 bg-gradient-to-b from-slate-950/80 to-transparent backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-400 transition-all hover:scale-105"
                title="Back to Dashboard"
              >
                ←
              </Link>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                className="px-3 py-2 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/40 disabled:opacity-30 disabled:cursor-not-allowed text-cyan-400 font-semibold text-sm transition-all"
                title="Undo (Ctrl+Z)"
              >
                ↶ Undo
              </button>
              <button
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className="px-3 py-2 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/40 disabled:opacity-30 disabled:cursor-not-allowed text-cyan-400 font-semibold text-sm transition-all"
                title="Redo (Ctrl+Y)"
              >
                ↷ Redo
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-cyan-300 mb-2">📚 History</h1>
            <p className="text-gray-400 text-lg">Your generation records and content library</p>
            <div className="mt-4 flex gap-3 flex-wrap text-xs text-gray-500">
              <span title="Keyboard shortcut">⌨️ Ctrl+F: Search</span>
              <span>•</span>
              <span title="Keyboard shortcut">⌨️ Ctrl+Z: Undo</span>
              <span>•</span>
              <span title="Keyboard shortcut">⌨️ Ctrl+Y: Redo</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        {/* Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex gap-3 overflow-x-auto pb-2 bg-gradient-to-r from-slate-900/30 to-purple-900/20 rounded-xl p-1 backdrop-blur-md border border-white/10"
        >
          {[
            { id: 'overview', label: '📋 Overview', icon: '📋' },
            { id: 'analytics', label: '📊 Analytics', icon: '📊' },
            { id: 'bulk', label: '✓ Bulk Actions', icon: '✓' },
            { id: 'favorites', label: '⭐ Favorites', icon: '⭐' }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              whileHover={{ y: -3, scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              variants={itemVariants}
              className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all relative ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/50 border border-blue-400/50'
                  : 'bg-slate-800/30 text-cyan-300 hover:bg-slate-700/50 border border-cyan-500/30 backdrop-blur-sm'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 -z-10"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Overview Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Stats Cards */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/20 via-cyan-900/10 to-slate-900/20 border border-cyan-400/30 p-8 backdrop-blur-xl group hover:border-cyan-400/60 transition-all"
                >
                  {/* Glow effect */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl blur-xl"
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  
                  {/* Animated border glow */}
                  <motion.div
                    className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-30 blur-lg -z-10"
                    animate={{ opacity: [0, 0.3, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  
                  <div className="relative z-10">
                    <p className="text-sm font-semibold text-cyan-300/70 uppercase tracking-widest">Total Records</p>
                    <p className="text-6xl font-black text-white mt-3 bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">{history.length}</p>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/20 via-pink-900/10 to-slate-900/20 border border-purple-400/30 p-8 backdrop-blur-xl group hover:border-purple-400/60 transition-all"
                >
                  {/* Glow effect */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl blur-xl"
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  />
                  
                  {/* Animated border glow */}
                  <motion.div
                    className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-30 blur-lg -z-10"
                    animate={{ opacity: [0, 0.3, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  />
                  
                  <div className="relative z-10">
                    <p className="text-sm font-semibold text-purple-300/70 uppercase tracking-widest">Filtered Results</p>
                    <p className="text-6xl font-black text-white mt-3 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">{filteredHistory.length}</p>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-900/20 via-yellow-900/10 to-slate-900/20 border border-amber-400/30 p-8 backdrop-blur-xl group hover:border-amber-400/60 transition-all"
                >
                  {/* Glow effect */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl blur-xl"
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 2 }}
                  />
                  
                  {/* Animated border glow */}
                  <motion.div
                    className="absolute -inset-0.5 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-2xl opacity-0 group-hover:opacity-30 blur-lg -z-10"
                    animate={{ opacity: [0, 0.3, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 2 }}
                  />
                  
                  <div className="relative z-10">
                    <p className="text-sm font-semibold text-amber-300/70 uppercase tracking-widest">Favorites</p>
                    <p className="text-6xl font-black text-white mt-3 bg-gradient-to-r from-amber-300 to-yellow-300 bg-clip-text text-transparent">{favorites.size}</p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Search and Filters */}
              <div className="space-y-6 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6 md:p-8 backdrop-blur-xl">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">Search</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-xl">
                      🔍
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search content…"
                      className="w-full bg-slate-800/50 border border-cyan-500/30 rounded-lg pl-12 pr-4 py-3 text-cyan-300 placeholder-cyan-600 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-3">Filter by Mode</label>
                  <div className="flex gap-2 flex-wrap">
                    {modes.map((mode) => (
                      <motion.button
                        key={mode}
                        onClick={() => setFilterMode(mode)}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                          filterMode === mode
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                          : 'bg-slate-800/50 text-cyan-300 border border-cyan-500/30 hover:bg-slate-700/50'
                        }`}
                      >
                        {mode === 'all' ? '⭐ All' : modeIcons[mode] + ' ' + mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-cyan-300 mb-3">Date Range</label>
                    <div className="flex gap-2 flex-wrap">
                      {['all', 'today', 'week', 'month'].map((range) => (
                        <motion.button
                          key={range}
                          onClick={() => setDateRange(range as any)}
                          whileHover={{ y: -2 }}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            dateRange === range
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                          : 'bg-slate-800/50 text-purple-300 border border-purple-500/30 hover:bg-slate-700/50'
                          }`}
                        >
                          {range === 'all' ? 'All Time' : range.charAt(0).toUpperCase() + range.slice(1)}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-cyan-300 mb-3">Sort By</label>
                    <div className="flex gap-2 flex-wrap">
                      {['newest', 'oldest', 'contentLength', 'mode'].map((sort) => (
                        <motion.button
                          key={sort}
                          onClick={() => setSortBy(sort as any)}
                          whileHover={{ y: -2 }}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            sortBy === sort
                              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                          : 'bg-slate-800/50 text-green-300 border border-green-500/30 hover:bg-slate-700/50'
                          }`}
                        >
                          {sort === 'newest' ? '🆕 Newest' : sort === 'oldest' ? '🕰️ Oldest' : sort === 'contentLength' ? '📏 Length' : '🏷️ Mode'}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-3">View</label>
                  <div className="flex gap-2">
                    {['list', 'grid'].map((view) => (
                      <motion.button
                        key={view}
                        onClick={() => setViewMode(view as any)}
                        whileHover={{ y: -2 }}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                          viewMode === view
                            ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                        : 'bg-slate-800/50 text-orange-300 border border-orange-500/30 hover:bg-slate-700/50'
                        }`}
                      >
                        {view === 'list' ? '📋 List' : '🔲 Grid'}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* History Display */}
              {filteredHistory.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <div className="text-8xl mb-6 opacity-40">📭</div>
                  <h2 className="text-2xl font-bold text-white text-center mb-2">No results found</h2>
                  <p className="text-gray-400 text-center max-w-md">Try adjusting your search or filters</p>
                </motion.div>
              ) : (
                <>
                  <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}`}>
                    {paginatedHistory.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        variants={itemVariants}
                        custom={idx}
                        whileHover={{ y: -6, scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/40 via-slate-800/20 to-slate-900/40 border border-cyan-400/20 p-6 transition-all hover:border-cyan-400/50 backdrop-blur-md"
                      >
                        {/* Animated glow background */}
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                        
                        {/* Border glow */}
                        <motion.div
                          className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-lg -z-10"
                          animate={{ opacity: [0, 0.2, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                        
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              <motion.span 
                                className="text-4xl flex-shrink-0"
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                              >
                                {modeIcons[item.mode] || '📄'}
                              </motion.span>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent capitalize">{item.mode}</h3>
                                <p className="text-sm text-cyan-300/60 mt-1">
                                  {new Date(item.timestamp).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <motion.button
                                onClick={() => toggleFavorite(item.id)}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-8 h-8 rounded-lg bg-amber-500/10 hover:bg-amber-500/30 text-amber-400 hover:text-amber-300 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                              >
                                {favorites.has(item.id) ? '⭐' : '☆'}
                              </motion.button>
                              <motion.button
                                onClick={() => deleteItem(item.id)}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/30 text-red-400 hover:text-red-300 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                              >
                                ✕
                              </motion.button>
                            </div>
                          </div>

                          <p className="text-sm text-cyan-100/80 mb-5 line-clamp-2">
                            {item.preview}
                          </p>

                          <div className="flex gap-3">
                            <motion.button
                              onClick={() => copyToClipboard(item.content)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex-1 py-2 px-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-semibold rounded-lg transition-all shadow-lg hover:shadow-cyan-500/40 border border-cyan-400/30"
                            >
                              📋 Copy
                            </motion.button>
                            <motion.button
                              onClick={() => setViewingItem(item)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex-1 py-2 px-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-semibold rounded-lg transition-all shadow-lg hover:shadow-purple-500/40 border border-purple-400/30"
                            >
                              👁️ View
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between mt-8 p-6 bg-slate-800/50 border border-cyan-500/30 rounded-lg"
                    >
                      <div className="text-cyan-300 text-sm font-semibold">
                        Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredHistory.length)} of {filteredHistory.length}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/40 disabled:opacity-50 disabled:cursor-not-allowed text-cyan-400 font-semibold rounded-lg transition-all"
                        >
                          ← Prev
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum = i + 1;
                          if (totalPages > 5 && currentPage > 3) {
                            pageNum = currentPage - 2 + i;
                          }
                          if (pageNum > totalPages) return null;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                                currentPage === pageNum
                                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                                  : 'bg-slate-700/50 text-cyan-300 hover:bg-slate-600/50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/40 disabled:opacity-50 disabled:cursor-not-allowed text-cyan-400 font-semibold rounded-lg transition-all"
                        >
                          Next →
                        </button>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Statistics Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-8 backdrop-blur-xl"
                >
                  <h3 className="text-xl font-bold text-white mb-6">📊 Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Records:</span>
                      <span className="text-2xl font-bold text-white">{analytics.totalRecords}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Last 7 Days:</span>
                      <span className="text-2xl font-bold text-blue-400">{analytics.lastWeek}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Last 30 Days:</span>
                      <span className="text-2xl font-bold text-purple-400">{analytics.lastMonth}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Avg Content Length:</span>
                      <span className="text-2xl font-bold text-green-400">{analytics.averageLength} chars</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-white/10">
                      <span className="text-gray-400">First Record:</span>
                      <span className="text-sm text-gray-300">
                        {analytics.oldestEntry ? new Date(analytics.oldestEntry).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Latest Record:</span>
                      <span className="text-sm text-gray-300">
                        {analytics.newestEntry ? new Date(analytics.newestEntry).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Mode Distribution */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-8 backdrop-blur-xl"
                >
                  <h3 className="text-xl font-bold text-white mb-6">🏷️ By Mode</h3>
                  <div className="space-y-4">
                    {Object.entries(analytics.byMode)
                      .sort(([, a], [, b]) => b - a)
                      .map(([mode, count]) => (
                        <div key={mode} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 capitalize">{modeIcons[mode]} {mode}</span>
                            <span className="font-semibold text-white">{count} items</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(count / analytics.totalRecords) * 100}%` }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                              className="h-full bg-gradient-to-r from-blue-600 to-cyan-600"
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Bulk Actions Tab */}
          {activeTab === 'bulk' && (
            <motion.div
              key="bulk"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="space-y-6 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-8 backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-white">Bulk Actions</h2>

                {/* Selection Controls */}
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <p className="text-white font-semibold">
                      {selectedItems.size > 0 ? `${selectedItems.size} selected` : 'No items selected'}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {filteredHistory.length} available in current filters
                    </p>
                  </div>
                  <button
                    onClick={selectAllFiltered}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-lg transition-all"
                  >
                    {selectedItems.size === filteredHistory.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={deleteSelected}
                    disabled={selectedItems.size === 0}
                    className="py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
                  >
                    🗑️ Delete Selected ({selectedItems.size})
                  </button>
                  <button
                    onClick={exportAsCSV}
                    className="py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-lg transition-all"
                  >
                    📊 Export as CSV
                  </button>
                  <button
                    onClick={exportAsJSON}
                    className="py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-lg transition-all"
                  >
                    📋 Export as JSON
                  </button>
                </div>
              </div>

              {/* Selectable List */}
              <div className="space-y-4">
                {filteredHistory.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20"
                  >
                    <div className="text-8xl mb-6 opacity-40">📭</div>
                    <h2 className="text-2xl font-bold text-white text-center mb-2">No items to select</h2>
                    <p className="text-gray-400 text-center">Try adjusting your filters</p>
                  </motion.div>
                ) : (
                  filteredHistory.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => toggleSelectItem(item.id)}
                      className={`p-6 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedItems.has(item.id)
                          ? 'bg-gradient-to-br from-white/10 to-white/5 border-blue-500'
                          : 'bg-gradient-to-br from-white/10 to-white/5 border-white/20 hover:border-white/40'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded border-2 border-white/30 flex items-center justify-center flex-shrink-0 mt-1">
                          {selectedItems.has(item.id) && (
                            <div className="w-4 h-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-semibold text-white capitalize">{item.mode}</h4>
                          <p className="text-sm text-gray-300 mt-2 line-clamp-2">{item.preview}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(item.timestamp).toLocaleDateString()} • {item.content.length} chars
                          </p>
                        </div>
                        <span className="text-3xl flex-shrink-0">{modeIcons[item.mode] || '📄'}</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {favoriteItems.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <div className="text-9xl mb-6 opacity-40">☆</div>
                  <h2 className="text-2xl font-bold text-white text-center mb-2">No favorites yet</h2>
                  <p className="text-gray-400 text-center max-w-md">Star items in your history to save them here for quick access</p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {favoriteItems.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-400/30 p-6 transition-all hover:border-amber-400/60 hover:from-amber-500/30 hover:to-yellow-500/20 backdrop-blur-sm"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <span className="text-4xl flex-shrink-0">{modeIcons[item.mode] || '📄'}</span>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-white capitalize">{item.mode}</h3>
                            <p className="text-sm text-gray-400 mt-1">
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
                          className="w-8 h-8 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                        >
                          ⭐
                        </button>
                      </div>

                      <p className="text-sm text-gray-300 mb-5 line-clamp-2">
                        {item.preview}
                      </p>

                      <div className="flex gap-3">
                        <button
                          onClick={() => copyToClipboard(item.content)}
                          className="flex-1 py-2 px-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-semibold rounded-lg transition-all"
                        >
                          📋 Copy
                        </button>
                        <button
                          onClick={() => setViewingItem(item)}
                          className="flex-1 py-2 px-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-semibold rounded-lg transition-all"
                        >
                          👁️ View
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clear History Button */}
        {history.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={clearHistory}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-12 py-4 px-6 bg-gradient-to-r from-red-600/20 to-rose-600/20 hover:from-red-600/30 hover:to-rose-600/30 border border-red-400/30 hover:border-red-400/50 text-red-300 hover:text-red-200 font-semibold rounded-lg transition-all"
          >
            🗑️ Clear All History
          </motion.button>
        )}
      </main>
    </div>
  );
}
