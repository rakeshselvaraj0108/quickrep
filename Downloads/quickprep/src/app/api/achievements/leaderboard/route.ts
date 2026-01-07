import { NextRequest, NextResponse } from 'next/server';
import { AchievementsService } from '@/lib/achievementsService';

// GET - Fetch leaderboard
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    const leaderboard = AchievementsService.getLeaderboard(limit);

    return NextResponse.json({
      success: true,
      leaderboard,
      total: leaderboard.length,
    });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard', success: false },
      { status: 500 }
    );
  }
}
