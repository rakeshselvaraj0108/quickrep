import { NextRequest, NextResponse } from 'next/server';
import { AchievementsService } from '@/lib/achievementsService';

// GET - Fetch achievements with current progress
export async function GET(request: NextRequest) {
  try {
    // Get user ID from localStorage or session (for demo, using a fixed guest ID)
    const userId = request.headers.get('x-user-id') || 'guest';

    // Initialize and get achievements
    const achievements = AchievementsService.getUserAchievements(userId);
    const stats = AchievementsService.getUserStats(userId);

    return NextResponse.json({
      success: true,
      achievements,
      stats,
    });
  } catch (error) {
    console.error('Achievements API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements', success: false },
      { status: 500 }
    );
  }
}

// POST - Check and update achievements after user action
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId = 'guest', action, data } = body;

    // Log the activity
    if (action) {
      AchievementsService.logActivity(userId, action, JSON.stringify(data || {}));
    }

    // Check and update all achievements
    const newlyUnlocked = AchievementsService.checkAndUpdateAchievements(userId);

    // Get updated achievements and stats
    const achievements = AchievementsService.getUserAchievements(userId);
    const stats = AchievementsService.getUserStats(userId);

    return NextResponse.json({
      success: true,
      achievements,
      stats,
      newlyUnlocked,
      message: newlyUnlocked.length > 0 
        ? `${newlyUnlocked.length} achievement(s) unlocked!` 
        : 'Achievements updated',
    });
  } catch (error) {
    console.error('Achievements update error:', error);
    return NextResponse.json(
      { error: 'Failed to update achievements', success: false },
      { status: 500 }
    );
  }
}

// PUT - Manually sync achievements (for migration or recovery)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId = 'guest' } = body;

    // Initialize user achievements if not exists
    AchievementsService.initializeUserAchievements(userId);

    // Check and update all achievements
    const newlyUnlocked = AchievementsService.checkAndUpdateAchievements(userId);

    // Get updated achievements and stats
    const achievements = AchievementsService.getUserAchievements(userId);
    const stats = AchievementsService.getUserStats(userId);

    return NextResponse.json({
      success: true,
      achievements,
      stats,
      newlyUnlocked,
      message: 'Achievements synced successfully',
    });
  } catch (error) {
    console.error('Achievements sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync achievements', success: false },
      { status: 500 }
    );
  }
}
