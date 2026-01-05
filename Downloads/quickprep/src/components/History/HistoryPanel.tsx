'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface HistoryItem {
  id: string;
  mode: string;
  content: string;
  timestamp: number;
  preview: string;
}

export default function HistoryPanel() {
  const router = useRouter();
  const [historyCount, setHistoryCount] = useState(0);

  useEffect(() => {
    // Load history count from localStorage
    const savedHistory = localStorage.getItem('generationHistory');
    if (savedHistory) {
      const history = JSON.parse(savedHistory);
      setHistoryCount(history.length);
    }
  }, []);

  return (
    <motion.button
      onClick={() => router.push('/history' as any)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-24 right-6 z-40 bg-gradient-to-r from-cyan-500 to-blue-500 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl hover:shadow-3xl transition-shadow"
      title="View History"
    >
      <span>📜</span>
      {historyCount > 0 && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
          {historyCount}
        </div>
      )}
    </motion.button>
  );
}
