'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoLectureProps {
  onClose?: () => void;
}

interface VideoData {
  videoId: string;
  title: string;
  thumbnail: string;
  duration: string;
  author?: string;
  transcriptAvailable?: boolean;
  summary?: string;
  keyPoints?: Array<{ timestamp: string; point: string }>;
  notes?: string;
  formulas?: string[];
  definitions?: Array<{ term: string; definition: string }>;
}

export default function VideoLecture({ onClose }: VideoLectureProps) {
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'summary' | 'keypoints' | 'notes' | 'formulas'>('summary');

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleProcess = async () => {
    const videoId = extractVideoId(url);
    
    if (!videoId) {
      setError('Invalid YouTube URL. Please enter a valid YouTube video link.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const response = await fetch('/api/video-lecture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process video');
      }

      const data = await response.json();
      setVideoData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process video');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
      style={{ zIndex: 100000 }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
          >
            ✕
          </button>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            🎥 Video Lecture Assistant
          </h2>
          <p className="text-blue-100 mt-2">Transform YouTube lectures into comprehensive study materials</p>
        </div>

        {/* Input Section */}
        <div className="p-6 border-b border-white/10">
          <div className="flex gap-3">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube video URL (e.g., https://youtube.com/watch?v=...)"
              className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border-2 border-slate-700 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleProcess()}
            />
            <button
              onClick={handleProcess}
              disabled={isProcessing || !url}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⚙️</span> Processing...
                </span>
              ) : (
                '🚀 Analyze Video'
              )}
            </button>
          </div>
          {error && (
            <div className="mt-3 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 240px)' }}>
          {isProcessing && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative mb-6">
                <div className="w-24 h-24 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                <span className="absolute inset-0 flex items-center justify-center text-4xl">🎬</span>
              </div>
              <p className="text-2xl font-bold text-white mb-2">Analyzing Video Lecture...</p>
              <div className="space-y-2 text-center">
                <p className="text-sm text-gray-400 flex items-center gap-2 justify-center">
                  <span className="animate-pulse">📺</span> Fetching video information
                </p>
                <p className="text-sm text-gray-400 flex items-center gap-2 justify-center">
                  <span className="animate-pulse">📝</span> Extracting transcript & captions
                </p>
                <p className="text-sm text-gray-400 flex items-center gap-2 justify-center">
                  <span className="animate-pulse">🤖</span> AI analyzing content
                </p>
                <p className="text-sm text-gray-400 flex items-center gap-2 justify-center">
                  <span className="animate-pulse">✨</span> Generating study materials
                </p>
              </div>
              <div className="mt-6 px-6 py-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <p className="text-xs text-blue-300">This may take 10-30 seconds depending on video length</p>
              </div>
            </div>
          )}

          {!isProcessing && !videoData && (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="text-7xl mb-6">📺</div>
              <h3 className="text-2xl font-bold text-white mb-3">Ready to Learn from Videos!</h3>
              <p className="text-gray-400 max-w-2xl">
                Paste any YouTube educational video URL above and I'll:
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4 max-w-2xl">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                  <div className="text-3xl mb-2">📝</div>
                  <div className="font-bold text-white">Smart Summary</div>
                  <div className="text-sm text-gray-400 mt-1">Concise overview of key topics</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-cyan-500/20 border border-green-500/30">
                  <div className="text-3xl mb-2">⏱️</div>
                  <div className="font-bold text-white">Timestamped Points</div>
                  <div className="text-sm text-gray-400 mt-1">Jump to important moments</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30">
                  <div className="text-3xl mb-2">📚</div>
                  <div className="font-bold text-white">Auto-Generated Notes</div>
                  <div className="text-sm text-gray-400 mt-1">Complete study notes</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                  <div className="text-3xl mb-2">🔢</div>
                  <div className="font-bold text-white">Formulas & Definitions</div>
                  <div className="text-sm text-gray-400 mt-1">Key concepts extracted</div>
                </div>
              </div>
            </div>
          )}

          {videoData && (
            <div className="p-6">
              {/* Video Preview */}
              <div className="mb-6 rounded-xl overflow-hidden bg-black">
                <iframe
                  width="100%"
                  height="400"
                  src={`https://www.youtube.com/embed/${videoData.videoId}`}
                  title={videoData.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full"
                ></iframe>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{videoData.title}</h3>
              
              {/* Video metadata */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                {videoData.author && (
                  <span className="px-3 py-1 rounded-full bg-gray-700 text-gray-300 text-xs font-semibold">
                    🎥 {videoData.author}
                  </span>
                )}
                {videoData.transcriptAvailable !== undefined && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    videoData.transcriptAvailable 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/50' 
                      : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                  }`}>
                    {videoData.transcriptAvailable ? '✅ Transcript Available' : '⚠️ No Transcript - AI Generated'}
                  </span>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {[
                  { id: 'summary', label: '📝 Summary', icon: '📝' },
                  { id: 'keypoints', label: '⏱️ Key Points', icon: '⏱️' },
                  { id: 'notes', label: '📚 Study Notes', icon: '📚' },
                  { id: 'formulas', label: '🔢 Formulas & Definitions', icon: '🔢' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                        : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'summary' && videoData.summary && (
                    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/30">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-bold text-white">📝 Video Summary</h4>
                        <button
                          onClick={() => copyToClipboard(videoData.summary!)}
                          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold"
                        >
                          📋 Copy
                        </button>
                      </div>
                      <p className="text-gray-300 whitespace-pre-line leading-relaxed">{videoData.summary}</p>
                    </div>
                  )}

                  {activeTab === 'keypoints' && videoData.keyPoints && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-bold text-white">⏱️ Timestamped Key Points</h4>
                        <button
                          onClick={() => copyToClipboard(videoData.keyPoints!.map(kp => `${kp.timestamp}: ${kp.point}`).join('\n'))}
                          className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-bold"
                        >
                          📋 Copy All
                        </button>
                      </div>
                      {videoData.keyPoints.map((point, idx) => {
                        // Convert MM:SS to seconds
                        const timeToSeconds = (timestamp: string) => {
                          const parts = timestamp.split(':').map(Number);
                          if (parts.length === 2) return parts[0] * 60 + parts[1];
                          if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
                          return 0;
                        };
                        
                        return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex gap-4 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/30 hover:border-green-500/50 transition-all"
                        >
                          <a
                            href={`https://youtube.com/watch?v=${videoData.videoId}&t=${timeToSeconds(point.timestamp)}s`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-mono font-bold text-sm transition-all hover:scale-105"
                            title="Jump to this timestamp in video"
                          >
                            ⏯️ {point.timestamp}
                          </a>
                          <p className="flex-1 text-gray-300">{point.point}</p>
                        </motion.div>
                      )})}
                    </div>
                  )}

                  {activeTab === 'notes' && videoData.notes && (
                    <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-6 border border-orange-500/30">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-bold text-white">📚 Comprehensive Study Notes</h4>
                        <button
                          onClick={() => copyToClipboard(videoData.notes!)}
                          className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold"
                        >
                          📋 Copy
                        </button>
                      </div>
                      <div className="text-gray-300 whitespace-pre-line leading-relaxed prose prose-invert max-w-none">
                        {videoData.notes}
                      </div>
                    </div>
                  )}

                  {activeTab === 'formulas' && (
                    <div className="space-y-6">
                      {videoData.formulas && videoData.formulas.length > 0 ? (
                        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/30">
                          <h4 className="text-lg font-bold text-white mb-4">🔢 Formulas & Equations</h4>
                          <div className="space-y-3">
                            {videoData.formulas.map((formula, idx) => (
                              <div key={idx} className="p-4 rounded-lg bg-black/30 border border-purple-500/20 hover:border-purple-500/40 transition-all">
                                <code className="text-cyan-400 font-mono text-lg">{formula}</code>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-gray-500/10 to-gray-600/10 rounded-xl p-8 border border-gray-500/30 text-center">
                          <div className="text-5xl mb-4">🔍</div>
                          <p className="text-gray-400 text-lg">No formulas or equations detected in this video</p>
                          <p className="text-gray-500 text-sm mt-2">This video may not contain mathematical content</p>
                        </div>
                      )}

                      {videoData.definitions && videoData.definitions.length > 0 ? (
                        <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl p-6 border border-blue-500/30">
                          <h4 className="text-lg font-bold text-white mb-4">📖 Key Definitions</h4>
                          <div className="space-y-4">
                            {videoData.definitions.map((def, idx) => (
                              <div key={idx} className="p-4 rounded-lg bg-black/30 border border-blue-500/20 hover:border-blue-500/40 transition-all">
                                <div className="font-bold text-blue-400 mb-2 text-lg">{def.term}</div>
                                <div className="text-gray-300 leading-relaxed">{def.definition}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-gray-500/10 to-gray-600/10 rounded-xl p-8 border border-gray-500/30 text-center">
                          <div className="text-5xl mb-4">💭</div>
                          <p className="text-gray-400 text-lg">No key definitions extracted</p>
                          <p className="text-gray-500 text-sm mt-2">Check the notes tab for detailed content</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      <style jsx>{`
        .prose {
          color: rgb(209 213 219);
        }
      `}</style>
    </motion.div>
  );
}
