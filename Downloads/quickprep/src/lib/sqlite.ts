import Database from 'better-sqlite3';
import path from 'path';

// Always use local SQLite for operations
// In production on Vercel, we'll use Turso via environment-based routing in API routes
const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const db = new Database(dbPath);

// Disable foreign keys since we're tracking stats independently
db.pragma('foreign_keys = OFF');

// Initialize database tables
function initializeDatabase() {
  try {
    // Create users table if it doesn't exist
    db.exec(`
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
      );

      CREATE INDEX IF NOT EXISTS idx_email ON users(email);

      CREATE TABLE IF NOT EXISTS user_stats (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        mode TEXT NOT NULL,
        success INTEGER NOT NULL,
        duration_ms INTEGER NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_stats_user_id ON user_stats(user_id);
      CREATE INDEX IF NOT EXISTS idx_stats_created_at ON user_stats(created_at);

      CREATE TABLE IF NOT EXISTS user_achievements (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        achievement_id TEXT NOT NULL,
        unlocked INTEGER DEFAULT 0,
        progress INTEGER DEFAULT 0,
        unlocked_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(user_id, achievement_id)
      );

      CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON user_achievements(user_id);
      CREATE INDEX IF NOT EXISTS idx_achievements_achievement_id ON user_achievements(achievement_id);
      CREATE INDEX IF NOT EXISTS idx_achievements_unlocked ON user_achievements(unlocked);

      CREATE TABLE IF NOT EXISTS user_activity (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        activity_type TEXT NOT NULL,
        activity_data TEXT,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_activity_user_id ON user_activity(user_id);
      CREATE INDEX IF NOT EXISTS idx_activity_created_at ON user_activity(created_at);
      CREATE INDEX IF NOT EXISTS idx_activity_type ON user_activity(activity_type);
    `);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

// Initialize on module load
try {
  initializeDatabase();
} catch (error) {
  console.error('Failed to initialize database on startup:', error);
}

export { initializeDatabase };
export default db;
