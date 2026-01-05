'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress?: number;
  total?: number;
}

export default function AchievementsPanel() {
  const router = useRouter();
  const [unlockedCount, setUnlockedCount] = useState(0);

  useEffect(() => {
    // Load from localStorage to get unlocked count
    const savedAchievements = localStorage.getItem('achievements');
    if (savedAchievements) {
      const achievements = JSON.parse(savedAchievements);
      const unlockedCount = achievements.filter((a: Achievement) => a.unlocked).length;
      setUnlockedCount(unlockedCount);
    }
  }, []);

  return (
    <motion.button
      onClick={() => router.push('/achievements' as any)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-yellow-500 to-orange-500 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl hover:shadow-3xl transition-shadow"
      title="View Achievements"
    >
      <span>🏆</span>
      {unlockedCount > 0 && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
          {unlockedCount}
        </div>
      )}
    </motion.button>
  );
}
