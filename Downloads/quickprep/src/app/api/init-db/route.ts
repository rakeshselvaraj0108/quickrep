import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

export async function GET(request: NextRequest) {
  try {
    const dbUrl = process.env.DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!dbUrl || !authToken) {
      return NextResponse.json(
        { error: 'DATABASE_URL or TURSO_AUTH_TOKEN not configured' },
        { status: 500 }
      );
    }

    const client = createClient({
      url: dbUrl,
      authToken: authToken,
    });

    console.log('🔧 Initializing Turso database tables...');

    // Create users table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        avatar TEXT,
        resetToken TEXT,
        resetTokenExpiry TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);
    console.log('✅ Users table created');

    // Create indexes
    await client.execute('CREATE INDEX IF NOT EXISTS idx_email ON users(email)');
    console.log('✅ Email index created');

    // Create user_stats table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS user_stats (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        mode TEXT NOT NULL,
        success INTEGER NOT NULL,
        duration_ms INTEGER NOT NULL,
        created_at TEXT NOT NULL
      )
    `);
    console.log('✅ User stats table created');

    await client.execute('CREATE INDEX IF NOT EXISTS idx_stats_user_id ON user_stats(user_id)');
    await client.execute('CREATE INDEX IF NOT EXISTS idx_stats_created_at ON user_stats(created_at)');
    console.log('✅ Stats indexes created');

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      tables: ['users', 'user_stats'],
      indexes: ['idx_email', 'idx_stats_user_id', 'idx_stats_created_at']
    });

  } catch (error: any) {
    console.error('❌ Database initialization error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initialize database',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    );
  }
}
