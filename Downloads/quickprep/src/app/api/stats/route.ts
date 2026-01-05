import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';
import db from '@/lib/sqlite';
import { v4 as uuidv4 } from 'uuid';

// GET - Fetch user stats
export async function GET(request: NextRequest) {
  const decoded = withAuth(request);
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = decoded.userId;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Get total generations
    const totalResult = db.prepare(
      'SELECT COUNT(*) as count FROM user_stats WHERE user_id = ?'
    ).get(userId) as { count: number };

    // Get today's generations
    const todayResult = db.prepare(
      `SELECT COUNT(*) as count FROM user_stats 
       WHERE user_id = ? AND DATE(created_at) = ?`
    ).get(userId, today) as { count: number };

    // Get success rate
    const successResult = db.prepare(
      `SELECT 
        COUNT(*) as total,
        SUM(success) as successful
       FROM user_stats WHERE user_id = ?`
    ).get(userId) as { total: number; successful: number };

    const successRate = successResult.total > 0
      ? (successResult.successful / successResult.total) * 100
      : 100;

    // Get average response time
    const avgResult = db.prepare(
      'SELECT AVG(duration_ms) as avg FROM user_stats WHERE user_id = ?'
    ).get(userId) as { avg: number | null };

    const avgResponseTime = avgResult.avg ? avgResult.avg / 1000 : 0;

    // Get recent requests
    const recentRequests = db.prepare(
      `SELECT mode, duration_ms as duration, created_at as timestamp 
       FROM user_stats 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 10`
    ).all(userId) as Array<{ mode: string; duration: number; timestamp: string }>;

    return NextResponse.json({
      totalGenerations: totalResult.count,
      todayGenerations: todayResult.count,
      successRate: Math.round(successRate * 10) / 10,
      avgResponseTime: Math.round(avgResponseTime * 10) / 10,
      activeToday: todayResult.count,
      recentRequests: recentRequests.map(r => ({
        mode: r.mode,
        duration: r.duration,
        timestamp: new Date(r.timestamp).getTime(),
      })),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

// POST - Record a generation
export async function POST(request: NextRequest) {
  const decoded = withAuth(request);
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { mode, duration, success } = body;

    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare(
      `INSERT INTO user_stats (id, user_id, mode, success, duration_ms, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, decoded.userId, mode, success ? 1 : 0, duration, now);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording stats:', error);
    return NextResponse.json(
      { error: 'Failed to record stats' },
      { status: 500 }
    );
  }
}
