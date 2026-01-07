import db from './sqlite';
import { v4 as uuidv4 } from 'uuid';

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress: number;
  total: number;
  unlockedAt?: string;
  category: 'generation' | 'streak' | 'exploration';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xp: number;
}

// Define all achievements
export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlocked' | 'progress' | 'unlockedAt'>[] = [
  {
    id: 'first-gen',
    icon: '🎉',
    title: 'First Steps',
    description: 'Generate your first content',
    total: 1,
    category: 'generation',
    rarity: 'common',
    xp: 10,
  },
  {
    id: 'ten-gen',
    icon: '🔥',
    title: 'Getting Started',
    description: 'Generate 10 contents',
    total: 10,
    category: 'generation',
    rarity: 'common',
    xp: 50,
  },
  {
    id: 'fifty-gen',
    icon: '⚡',
    title: 'Power User',
    description: 'Generate 50 contents',
    total: 50,
    category: 'generation',
    rarity: 'rare',
    xp: 200,
  },
  {
    id: 'hundred-gen',
    icon: '💯',
    title: 'Century Club',
    description: 'Generate 100 contents',
    total: 100,
    category: 'generation',
    rarity: 'epic',
    xp: 500,
  },
  {
    id: 'five-hundred-gen',
    icon: '🌟',
    title: 'Legend',
    description: 'Generate 500 contents',
    total: 500,
    category: 'generation',
    rarity: 'legendary',
    xp: 2000,
  },
  {
    id: 'streak-3',
    icon: '📅',
    title: '3-Day Streak',
    description: 'Study 3 days in a row',
    total: 3,
    category: 'streak',
    rarity: 'common',
    xp: 30,
  },
  {
    id: 'streak-7',
    icon: '🔥',
    title: 'Week Warrior',
    description: 'Study 7 days in a row',
    total: 7,
    category: 'streak',
    rarity: 'rare',
    xp: 100,
  },
  {
    id: 'streak-30',
    icon: '👑',
    title: 'Study Champion',
    description: 'Study 30 days in a row',
    total: 30,
    category: 'streak',
    rarity: 'epic',
    xp: 500,
  },
  {
    id: 'streak-100',
    icon: '💎',
    title: 'Century Streak',
    description: 'Study 100 days in a row',
    total: 100,
    category: 'streak',
    rarity: 'legendary',
    xp: 2500,
  },
  {
    id: 'all-modes',
    icon: '🎨',
    title: 'Explorer',
    description: 'Try all generation modes',
    total: 6,
    category: 'exploration',
    rarity: 'rare',
    xp: 150,
  },
  {
    id: 'night-owl',
    icon: '🦉',
    title: 'Night Owl',
    description: 'Generate content after midnight',
    total: 1,
    category: 'exploration',
    rarity: 'common',
    xp: 25,
  },
  {
    id: 'early-bird',
    icon: '🐦',
    title: 'Early Bird',
    description: 'Generate content before 6 AM',
    total: 1,
    category: 'exploration',
    rarity: 'common',
    xp: 25,
  },
];

export class AchievementsService {
  // Initialize user achievements
  static initializeUserAchievements(userId: string) {
    const now = new Date().toISOString();
    
    for (const achievementDef of ACHIEVEMENT_DEFINITIONS) {
      try {
        db.prepare(`
          INSERT OR IGNORE INTO user_achievements (id, user_id, achievement_id, unlocked, progress, created_at, updated_at)
          VALUES (?, ?, ?, 0, 0, ?, ?)
        `).run(uuidv4(), userId, achievementDef.id, now, now);
      } catch (error) {
        console.error('Error initializing achievement:', achievementDef.id, error);
      }
    }
  }

  // Get user achievements
  static getUserAchievements(userId: string): Achievement[] {
    // Initialize if not exists
    this.initializeUserAchievements(userId);

    const userAchievements = db.prepare(`
      SELECT * FROM user_achievements WHERE user_id = ?
    `).all(userId) as any[];

    return ACHIEVEMENT_DEFINITIONS.map(def => {
      const userAchievement = userAchievements.find(ua => ua.achievement_id === def.id);
      return {
        ...def,
        unlocked: userAchievement?.unlocked === 1,
        progress: userAchievement?.progress || 0,
        unlockedAt: userAchievement?.unlocked_at,
      };
    });
  }

  // Update achievement progress
  static updateAchievementProgress(userId: string, achievementId: string, progress: number): boolean {
    const achievement = ACHIEVEMENT_DEFINITIONS.find(a => a.id === achievementId);
    if (!achievement) return false;

    const unlocked = progress >= achievement.total ? 1 : 0;
    const unlockedAt = unlocked ? new Date().toISOString() : null;
    const now = new Date().toISOString();

    const existingAchievement = db.prepare(`
      SELECT unlocked FROM user_achievements WHERE user_id = ? AND achievement_id = ?
    `).get(userId, achievementId) as any;

    const wasUnlocked = existingAchievement?.unlocked === 1;
    const newlyUnlocked = unlocked === 1 && !wasUnlocked;

    db.prepare(`
      UPDATE user_achievements
      SET progress = ?, unlocked = ?, unlocked_at = ?, updated_at = ?
      WHERE user_id = ? AND achievement_id = ?
    `).run(progress, unlocked, unlockedAt, now, userId, achievementId);

    // Log activity if newly unlocked
    if (newlyUnlocked) {
      this.logActivity(userId, 'achievement_unlocked', JSON.stringify({
        achievementId,
        title: achievement.title,
        xp: achievement.xp,
      }));
    }

    return newlyUnlocked;
  }

  // Check and update achievements based on user stats
  static checkAndUpdateAchievements(userId: string): string[] {
    const newlyUnlocked: string[] = [];

    // Get total generations
    const totalGenerations = db.prepare(`
      SELECT COUNT(*) as count FROM user_stats WHERE user_id = ?
    `).get(userId) as { count: number };

    // Get unique modes used
    const modesUsed = db.prepare(`
      SELECT COUNT(DISTINCT mode) as count FROM user_stats WHERE user_id = ?
    `).get(userId) as { count: number };

    // Get streak
    const streak = this.calculateStreak(userId);

    // Check time-based achievements
    const hasNightOwl = this.checkTimeBasedGeneration(userId, 0, 6);
    const hasEarlyBird = this.checkTimeBasedGeneration(userId, 4, 6);

    // Update generation achievements
    const genAchievements = ['first-gen', 'ten-gen', 'fifty-gen', 'hundred-gen', 'five-hundred-gen'];
    for (const achievementId of genAchievements) {
      const achievement = ACHIEVEMENT_DEFINITIONS.find(a => a.id === achievementId);
      if (achievement) {
        const progress = Math.min(totalGenerations.count, achievement.total);
        const unlocked = this.updateAchievementProgress(userId, achievementId, progress);
        if (unlocked) newlyUnlocked.push(achievementId);
      }
    }

    // Update streak achievements
    const streakAchievements = ['streak-3', 'streak-7', 'streak-30', 'streak-100'];
    for (const achievementId of streakAchievements) {
      const achievement = ACHIEVEMENT_DEFINITIONS.find(a => a.id === achievementId);
      if (achievement) {
        const progress = Math.min(streak, achievement.total);
        const unlocked = this.updateAchievementProgress(userId, achievementId, progress);
        if (unlocked) newlyUnlocked.push(achievementId);
      }
    }

    // Update exploration achievements
    const modesProgress = Math.min(modesUsed.count, 6);
    const allModesUnlocked = this.updateAchievementProgress(userId, 'all-modes', modesProgress);
    if (allModesUnlocked) newlyUnlocked.push('all-modes');

    // Update time-based achievements
    if (hasNightOwl) {
      const nightOwlUnlocked = this.updateAchievementProgress(userId, 'night-owl', 1);
      if (nightOwlUnlocked) newlyUnlocked.push('night-owl');
    }

    if (hasEarlyBird) {
      const earlyBirdUnlocked = this.updateAchievementProgress(userId, 'early-bird', 1);
      if (earlyBirdUnlocked) newlyUnlocked.push('early-bird');
    }

    return newlyUnlocked;
  }

  // Calculate user streak
  private static calculateStreak(userId: string): number {
    const activities = db.prepare(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM user_stats
      WHERE user_id = ?
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) DESC
      LIMIT 100
    `).all(userId) as { date: string; count: number }[];

    if (activities.length === 0) return 0;

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let currentDate = new Date(today);

    for (const activity of activities) {
      const activityDate = activity.date.split('T')[0];
      const expectedDate = currentDate.toISOString().split('T')[0];

      if (activityDate === expectedDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  // Check time-based generation
  private static checkTimeBasedGeneration(userId: string, startHour: number, endHour: number): boolean {
    const stats = db.prepare(`
      SELECT created_at FROM user_stats
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 100
    `).all(userId) as { created_at: string }[];

    for (const stat of stats) {
      const hour = new Date(stat.created_at).getHours();
      if (hour >= startHour && hour < endHour) {
        return true;
      }
    }

    return false;
  }

  // Log user activity
  static logActivity(userId: string, activityType: string, activityData: string) {
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO user_activity (id, user_id, activity_type, activity_data, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(uuidv4(), userId, activityType, activityData, now);
  }

  // Get user stats
  static getUserStats(userId: string) {
    const totalGenerations = db.prepare(`
      SELECT COUNT(*) as count FROM user_stats WHERE user_id = ?
    `).get(userId) as { count: number };

    const modesUsed = db.prepare(`
      SELECT COUNT(DISTINCT mode) as count FROM user_stats WHERE user_id = ?
    `).get(userId) as { count: number };

    const streak = this.calculateStreak(userId);

    const achievements = this.getUserAchievements(userId);
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalXP = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.xp, 0);

    return {
      totalGenerations: totalGenerations.count,
      modesUsed: modesUsed.count,
      streak,
      unlockedCount,
      totalAchievements: ACHIEVEMENT_DEFINITIONS.length,
      totalXP,
      level: Math.floor(totalXP / 100) + 1,
    };
  }

  // Get leaderboard
  static getLeaderboard(limit: number = 10) {
    const leaderboard = db.prepare(`
      SELECT 
        u.id,
        u.name,
        u.avatar,
        COUNT(DISTINCT ua.id) as achievements_unlocked,
        COUNT(DISTINCT us.id) as total_generations
      FROM users u
      LEFT JOIN user_achievements ua ON u.id = ua.user_id AND ua.unlocked = 1
      LEFT JOIN user_stats us ON u.id = us.user_id
      GROUP BY u.id
      ORDER BY achievements_unlocked DESC, total_generations DESC
      LIMIT ?
    `).all(limit);

    return leaderboard;
  }
}
