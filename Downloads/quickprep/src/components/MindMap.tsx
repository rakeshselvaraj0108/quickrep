'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
  description?: string;
  color?: string;
  icon?: string;
  expanded?: boolean;
  level?: number;
  x?: number;
  y?: number;
}

interface MindMapData {
  title: string;
  central: string;
  nodes: MindMapNode[];
}

interface MindMapProps {
  data: MindMapData | null;
}

// Enhanced color palette with HIGH CONTRAST WHITE TEXT
const LEVEL_COLORS = [
  { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: '#667eea', text: '#ffffff', shadow: 'rgba(102, 126, 234, 0.5)' },
  { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', border: '#f093fb', text: '#ffffff', shadow: 'rgba(240, 147, 251, 0.5)' },
  { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', border: '#4facfe', text: '#ffffff', shadow: 'rgba(79, 172, 254, 0.5)' },
  { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: '#10b981', text: '#ffffff', shadow: 'rgba(16, 185, 129, 0.5)' },
  { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', border: '#f59e0b', text: '#ffffff', shadow: 'rgba(245, 158, 11, 0.5)' },
  { bg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', border: '#8b5cf6', text: '#ffffff', shadow: 'rgba(139, 92, 246, 0.5)' },
  { bg: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', border: '#ec4899', text: '#ffffff', shadow: 'rgba(236, 72, 153, 0.5)' },
  { bg: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', border: '#06b6d4', text: '#ffffff', shadow: 'rgba(6, 182, 212, 0.5)' },
];

// Icons for different content types
const NODE_ICONS: { [key: string]: string } = {
  concept: '💡',
  definition: '📖',
  example: '✨',
  process: '⚙️',
  important: '⭐',
  warning: '⚠️',
  tip: '💎',
  default: '📌',
};

export default function MindMap({ data }: MindMapProps) {
  const [view, setView] = useState<'canvas' | 'tree' | 'outline'>('canvas');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize all nodes as expanded
  useEffect(() => {
    if (data?.nodes) {
      const allIds = new Set<string>();
      const collectIds = (nodes: MindMapNode[]) => {
        nodes.forEach(node => {
          allIds.add(node.id);
          if (node.children) collectIds(node.children);
        });
      };
      collectIds(data.nodes);
      setExpandedNodes(allIds);
    }
  }, [data]);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim() || !data?.nodes) {
      setHighlightedNodes(new Set());
      return;
    }

    const query = searchQuery.toLowerCase();
    const matching = new Set<string>();
    
    const searchNodes = (nodes: MindMapNode[]) => {
      nodes.forEach(node => {
        if (node.label.toLowerCase().includes(query) || 
            node.description?.toLowerCase().includes(query)) {
          matching.add(node.id);
        }
        if (node.children) searchNodes(node.children);
      });
    };
    
    searchNodes(data.nodes);
    setHighlightedNodes(matching);
  }, [searchQuery, data]);

  // Toggle node expansion
  const toggleNode = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  // Zoom controls
  const handleZoom = useCallback((delta: number) => {
    setZoom(prev => Math.max(0.3, Math.min(2, prev + delta)));
  }, []);

  // Pan controls
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-bg')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    handleZoom(e.deltaY > 0 ? -0.1 : 0.1);
  }, [handleZoom]);

  // Reset view
  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Expand/collapse all
  const expandAll = useCallback(() => {
    if (!data?.nodes) return;
    const allIds = new Set<string>();
    const collectIds = (nodes: MindMapNode[]) => {
      nodes.forEach(node => {
        allIds.add(node.id);
        if (node.children) collectIds(node.children);
      });
    };
    collectIds(data.nodes);
    setExpandedNodes(allIds);
  }, [data]);

  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Export as image (placeholder)
  const exportAsImage = useCallback(() => {
    alert('Export functionality would save the mind map as PNG/SVG');
  }, []);

  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-2xl border border-white/10">
        <div className="text-center">
          <div className="text-4xl mb-4">🧠</div>
          <p className="text-gray-400">No mind map data available</p>
          <p className="text-gray-500 text-sm mt-2">Generate a mind map from your notes</p>
        </div>
      </div>
    );
  }

  // Recursive node renderer for tree view - REDESIGNED FOR CLARITY
  const renderTreeNode = (node: MindMapNode, level: number = 0, path: string = '') => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const colorScheme = LEVEL_COLORS[level % LEVEL_COLORS.length];
    const isHighlighted = highlightedNodes.has(node.id);
    const isSelected = selectedNode?.id === node.id;
    const icon = node.icon ? NODE_ICONS[node.icon] || NODE_ICONS.default : NODE_ICONS.default;

    return (
      <motion.div
        key={node.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: level * 0.05 }}
        className="relative"
      >
        <motion.div
          onClick={() => {
            if (hasChildren) toggleNode(node.id);
            setSelectedNode(node);
          }}
          whileHover={{ scale: 1.02, x: 4 }}
          whileTap={{ scale: 0.98 }}
          className={`
            relative flex items-center gap-4 p-5 rounded-xl cursor-pointer mb-4 transition-all border-2
            ${isSelected ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-900' : ''}
            ${isHighlighted ? 'ring-2 ring-yellow-400 animate-pulse' : ''}
          `}
          style={{
            background: isSelected ? colorScheme.bg : 'linear-gradient(135deg, rgba(30,41,59,0.85) 0%, rgba(15,23,42,0.85) 100%)',
            borderColor: isSelected ? colorScheme.border : colorScheme.border + '40',
            boxShadow: isSelected ? `0 12px 40px ${colorScheme.shadow}` : '0 6px 20px rgba(0,0,0,0.4)',
          }}
        >
          {/* Expand/Collapse button */}
          {hasChildren && (
            <motion.button
              animate={{ rotate: isExpanded ? 90 : 0 }}
              className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-lg font-bold text-white"
              style={{ background: colorScheme.bg, boxShadow: `0 4px 12px ${colorScheme.shadow}` }}
            >
              ▶
            </motion.button>
          )}
          
          {/* Icon - larger */}
          <span className="text-3xl flex-shrink-0">{icon}</span>
          
          {/* Content - bigger and more prominent */}
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-lg leading-snug drop-shadow-lg">{node.label}</h4>
            {node.description && (
              <p className="text-sm text-gray-100 mt-2 drop-shadow-md line-clamp-2">{node.description}</p>
            )}
          </div>

          {/* Children count badge */}
          {hasChildren && (
            <span 
              className="flex-shrink-0 px-4 py-2 text-base font-bold rounded-lg text-white min-w-fit"
              style={{ background: colorScheme.bg, boxShadow: `0 4px 12px ${colorScheme.shadow}` }}
            >
              {node.children?.length}
            </span>
          )}
        </motion.div>

        {/* Children */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="ml-12 border-l-4 border-purple-500/40 pl-6"
            >
              {node.children?.map((child, idx) => 
                renderTreeNode(child, level + 1, `${path}-${idx}`)
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // Canvas view node renderer - REDESIGNED WITH BIGGER COMPONENTS & NO OVERLAP
  const renderCanvasNode = (node: MindMapNode, level: number, index: number, total: number, parentX: number = 0, parentY: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const colorScheme = LEVEL_COLORS[level % LEVEL_COLORS.length];
    const isHighlighted = highlightedNodes.has(node.id);
    const isSelected = selectedNode?.id === node.id;
    const icon = node.icon ? NODE_ICONS[node.icon] || NODE_ICONS.default : NODE_ICONS.default;

    // BIGGER SPACING TO PREVENT OVERLAP
    const radius = level === 1 ? 280 : level === 2 ? 450 : 600;
    const angleSpan = Math.PI * 1.8; // 324 degrees
    const startAngle = -Math.PI * 0.9; // Start from top-left
    const angle = total > 1 ? startAngle + (index / (total - 1)) * angleSpan : 0;
    
    const x = level === 0 ? 0 : Math.cos(angle) * radius;
    const y = level === 0 ? 0 : Math.sin(angle) * radius;

    // BIGGER NODE SIZES
    const nodeWidth = level === 0 ? 240 : level === 1 ? 200 : 180;
    const nodeHeight = level === 0 ? 120 : level === 1 ? 110 : 100;
    const offsetX = x - nodeWidth / 2;
    const offsetY = y - nodeHeight / 2;

    return (
      <g key={node.id}>
        {/* Connection line to parent */}
        {level > 0 && (
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: level * 0.1 }}
            d={`M ${parentX} ${parentY} Q ${(parentX + x) / 2} ${(parentY + y) / 2 + 40} ${x} ${y}`}
            fill="none"
            stroke={colorScheme.border}
            strokeWidth="4"
            strokeOpacity="0.9"
          />
        )}
        
        {/* Node */}
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: level * 0.1 + index * 0.05 }}
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) toggleNode(node.id);
            setSelectedNode(node);
          }}
        >
          {/* Shadow effect */}
          <filter id={`shadow-${node.id}`}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>

          {/* Node background - BIGGER & CLEARER */}
          <foreignObject
            x={offsetX}
            y={offsetY}
            width={nodeWidth}
            height={nodeHeight}
          >
            <div
              className={`
                h-full rounded-3xl flex flex-col items-center justify-center p-4 text-center
                transition-all duration-300
                ${isSelected ? 'ring-4 ring-yellow-300' : ''}
                ${isHighlighted ? 'ring-4 ring-yellow-400 animate-pulse' : ''}
              `}
              style={{
                background: colorScheme.bg,
                color: '#ffffff',
                boxShadow: `0 12px 40px ${colorScheme.shadow}, 0 0 80px ${colorScheme.shadow}`,
                border: `3px solid ${colorScheme.border}`,
              }}
            >
              {/* BIGGER ICON */}
              <span className={`drop-shadow-2xl ${level === 0 ? 'text-5xl mb-2' : 'text-4xl mb-1'}`}>
                {icon}
              </span>
              
              {/* BOLD TEXT WITH BETTER VISIBILITY */}
              <span className={`font-bold text-white drop-shadow-2xl ${level === 0 ? 'text-base' : level === 1 ? 'text-sm' : 'text-xs'} line-clamp-3`}>
                {node.label}
              </span>

              {/* CHILDREN COUNT */}
              {hasChildren && (
                <span className="text-xs font-bold opacity-90 mt-1 bg-white/20 px-2 py-1 rounded-full drop-shadow-lg">
                  {node.children?.length} child{node.children?.length !== 1 ? 'ren' : ''}
                </span>
              )}
            </div>
          </foreignObject>
        </motion.g>

        {/* Render children */}
        {hasChildren && isExpanded && node.children?.map((child, idx) =>
          renderCanvasNode(child, level + 1, idx, node.children!.length, x, y)
        )}
      </g>
    );
  };

  // Outline view - IMPROVED FOR VISIBILITY
  const renderOutlineItem = (node: MindMapNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const colorScheme = LEVEL_COLORS[level % LEVEL_COLORS.length];
    const isHighlighted = highlightedNodes.has(node.id);
    const icon = node.icon ? NODE_ICONS[node.icon] || NODE_ICONS.default : NODE_ICONS.default;

    return (
      <div key={node.id}>
        <div
          onClick={() => hasChildren && toggleNode(node.id)}
          className={`
            flex items-center gap-3 py-4 px-5 rounded-lg cursor-pointer transition-all border-l-4
            hover:bg-slate-700/40 ${isHighlighted ? 'bg-yellow-500/20 ring-2 ring-yellow-400' : 'bg-slate-800/30'}
          `}
          style={{ 
            paddingLeft: `${level * 28 + 16}px`,
            borderLeftColor: colorScheme.border,
          }}
        >
          {hasChildren ? (
            <motion.span
              animate={{ rotate: isExpanded ? 90 : 0 }}
              className="text-base font-bold flex-shrink-0"
              style={{ color: colorScheme.border }}
            >
              ▶
            </motion.span>
          ) : (
            <span className="w-5 flex-shrink-0" />
          )}
          <span className="text-2xl flex-shrink-0">{icon}</span>
          <div className="flex-1 min-w-0">
            <span className="text-base font-semibold text-white block">{node.label}</span>
            {node.description && (
              <span className="text-sm text-gray-300 mt-1 block">{node.description}</span>
            )}
          </div>
          {hasChildren && (
            <span className="text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 text-white" style={{ background: colorScheme.bg }}>
              {node.children?.length}
            </span>
          )}
        </div>
        
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {node.children?.map(child => renderOutlineItem(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`relative rounded-2xl overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
      style={{
        background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        minHeight: isFullscreen ? '100vh' : '600px',
      }}
    >
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-gradient-to-r from-slate-900/90 to-slate-800/90 border-b-2 border-purple-500/40 px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Title & Central Topic */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-2xl">🧠</span>
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-white drop-shadow-lg truncate">{data.title || 'Mind Map'}</h2>
              <p className="text-sm text-purple-200 font-medium drop-shadow-md">{data.central}</p>
            </div>
          </div>

          {/* Search Compact */}
          <div className="hidden sm:block w-48 flex-shrink-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-purple-400/50 text-white placeholder-gray-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/20 transition-all"
              />
              <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* View switcher */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-800/60 rounded-lg p-0.5 border border-purple-500/40">
            {[
              { id: 'canvas', icon: '🎯' },
              { id: 'tree', icon: '🌳' },
              { id: 'outline', icon: '📋' },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id as typeof view)}
                className={`px-3 py-1 rounded-md text-sm font-bold transition-all ${
                  view === v.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {v.icon}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={expandAll}
              className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-purple-600/70 text-gray-400 hover:text-white transition-all border border-purple-500/30"
              title="Expand All"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            <button
              onClick={collapseAll}
              className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-purple-600/70 text-gray-400 hover:text-white transition-all border border-purple-500/30"
              title="Collapse All"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
              </svg>
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-purple-600/70 text-gray-400 hover:text-white transition-all border border-purple-500/30"
              title="Fullscreen"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isFullscreen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative" style={{ minHeight: isFullscreen ? 'calc(100vh - 80px)' : '520px' }}>
        {/* Canvas View */}
        {view === 'canvas' && (
          <>
            {/* Zoom controls */}
            <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-slate-900/95 backdrop-blur-xl rounded-lg p-3 border-2 border-purple-500/30 shadow-xl">
              <button
                onClick={() => handleZoom(-0.1)}
                className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-purple-600 flex items-center justify-center text-white font-bold text-lg border border-purple-500/30"
              >
                −
              </button>
              <span className="text-sm text-white font-bold w-14 text-center">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => handleZoom(0.1)}
                className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-purple-600 flex items-center justify-center text-white font-bold text-lg border border-purple-500/30"
              >
                +
              </button>
              <button
                onClick={resetView}
                className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-purple-600 flex items-center justify-center text-white font-bold text-sm border border-purple-500/30"
                title="Reset View"
              >
                ⟲
              </button>
            </div>

            {/* SVG Canvas */}
            <div
              ref={canvasRef}
              className="canvas-bg w-full h-full overflow-hidden"
              style={{ 
                cursor: isDragging ? 'grabbing' : 'grab',
                minHeight: isFullscreen ? 'calc(100vh - 80px)' : '520px',
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              <svg
                width="100%"
                height="100%"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: 'center center',
                }}
              >
                {/* Grid pattern */}
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="200%" height="200%" x="-50%" y="-50%" fill="url(#grid)" />
                
                {/* Center the mind map - BIGGER SPACE TO PREVENT OVERLAP */}
                <g transform={`translate(${isFullscreen ? 800 : 550}, ${isFullscreen ? 450 : 350})`}>
                  {/* Central node - BIGGER */}
                  <motion.g
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  >
                    <foreignObject x="-130" y="-65" width="260" height="130">
                      <div
                        className="h-full rounded-3xl flex flex-col items-center justify-center p-6 text-center"
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          boxShadow: '0 16px 56px rgba(102, 126, 234, 0.7), 0 0 100px rgba(102, 126, 234, 0.5)',
                          border: '4px solid #667eea',
                        }}
                      >
                        <span className="text-5xl mb-3 drop-shadow-2xl">🎯</span>
                        <span className="font-extrabold text-white text-lg drop-shadow-2xl">{data.central}</span>
                      </div>
                    </foreignObject>
                  </motion.g>

                  {/* Branch nodes */}
                  {data.nodes.map((node, idx) => 
                    renderCanvasNode(node, 1, idx, data.nodes.length, 0, 0)
                  )}
                </g>
              </svg>
            </div>
          </>
        )}

        {/* Tree View */}
        {view === 'tree' && (
          <div className="p-8 overflow-auto" style={{ maxHeight: isFullscreen ? 'calc(100vh - 80px)' : '520px' }}>
            {/* Central topic */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 rounded-2xl text-center border-2"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 12px 48px rgba(102, 126, 234, 0.4)',
                borderColor: '#667eea',
              }}
            >
              <span className="text-5xl mb-3 block drop-shadow-lg">🎯</span>
              <h3 className="text-3xl font-bold text-white drop-shadow-lg">{data.central}</h3>
            </motion.div>

            {/* Tree nodes */}
            <div className="space-y-2">
              {data.nodes.map((node, idx) => renderTreeNode(node, 0, String(idx)))}
            </div>
          </div>
        )}

        {/* Outline View */}
        {view === 'outline' && (
          <div className="p-8 overflow-auto" style={{ maxHeight: isFullscreen ? 'calc(100vh - 80px)' : '520px' }}>
            {/* Central topic */}
            <div className="flex items-center gap-4 py-5 px-6 mb-8 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-purple-400 shadow-lg">
              <span className="text-4xl">🎯</span>
              <span className="font-bold text-white text-2xl">{data.central}</span>
            </div>

            {/* Outline items */}
            <div className="space-y-3">
              {data.nodes.map(node => renderOutlineItem(node))}
            </div>
          </div>
        )}
      </div>

      {/* Selected node detail panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-20 right-4 w-72 bg-slate-900/95 backdrop-blur-xl rounded-xl border-2 border-purple-500/30 p-4 shadow-2xl z-20"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-white text-base">Node Details</h4>
              <button
                onClick={() => setSelectedNode(null)}
                className="w-7 h-7 rounded-full bg-slate-800/80 hover:bg-red-500 flex items-center justify-center text-gray-300 hover:text-white text-sm font-bold transition-all"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-purple-400 uppercase tracking-wider font-bold">Label</label>
                <p className="text-white font-semibold mt-1">{selectedNode.label}</p>
              </div>
              
              {selectedNode.description && (
                <div>
                  <label className="text-xs text-purple-400 uppercase tracking-wider font-bold">Description</label>
                  <p className="text-gray-200 text-sm mt-1">{selectedNode.description}</p>
                </div>
              )}
              
              {selectedNode.children && selectedNode.children.length > 0 && (
                <div>
                  <label className="text-xs text-purple-400 uppercase tracking-wider font-bold">Children</label>
                  <p className="text-cyan-400 text-sm font-bold mt-1">{selectedNode.children.length} sub-nodes</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-slate-900/95 backdrop-blur-xl rounded-lg p-4 border-2 border-purple-500/30 shadow-xl">
        <p className="text-xs text-gray-300 mb-3 uppercase tracking-wider font-bold">Depth Levels</p>
        <div className="flex items-center gap-2">
          {LEVEL_COLORS.slice(0, 4).map((color, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div 
                className="w-5 h-5 rounded-full"
                style={{ background: color.bg, boxShadow: `0 2px 8px ${color.shadow}` }}
              />
              <span className="text-sm text-white font-semibold">L{idx + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="absolute top-20 left-4 bg-slate-900/95 backdrop-blur-xl rounded-lg p-4 border-2 border-purple-500/30 z-10 shadow-xl">
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-gray-300 font-semibold">Nodes</span>
            <span className="ml-2 text-white font-bold text-base">
              {(() => {
                let count = 0;
                const countNodes = (nodes: MindMapNode[]) => {
                  nodes.forEach(n => {
                    count++;
                    if (n.children) countNodes(n.children);
                  });
                };
                countNodes(data.nodes);
                return count;
              })()}
            </span>
          </div>
          <div>
            <span className="text-gray-300 font-semibold">Expanded</span>
            <span className="ml-2 text-purple-400 font-bold text-base">{expandedNodes.size}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
