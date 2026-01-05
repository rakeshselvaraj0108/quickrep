/**
 * Async User Repository for Turso in Production
 * Falls back to sync repository in development
 */

import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@libsql/client';
import db, { initializeDatabase } from './sqlite';

// Initialize database tables for development
if (process.env.NODE_ENV !== 'production') {
  initializeDatabase();
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string | null;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Turso client for production
const tursoClient = 
  process.env.NODE_ENV === 'production' && process.env.DATABASE_URL?.startsWith('libsql://')
    ? createClient({
        url: process.env.DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN || undefined,
      })
    : null;

// Log initialization status
if (process.env.NODE_ENV === 'production') {
  console.log('🔧 Database Mode: PRODUCTION');
  console.log('📍 DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'MISSING');
  console.log('🔑 TURSO_AUTH_TOKEN:', process.env.TURSO_AUTH_TOKEN ? 'SET' : 'MISSING');
  console.log('💾 Turso Client:', tursoClient ? 'INITIALIZED' : 'NULL');
} else {
  console.log('🔧 Database Mode: DEVELOPMENT (Local SQLite)');
}

// Initialize Turso tables in production (at runtime, not build time)
async function initializeTursoDatabase() {
  if (tursoClient && process.env.NODE_ENV === 'production') {
    try {
      // Only initialize tables at runtime, not during build
      if (typeof window !== 'undefined') return; // Skip if in browser
      
      // Execute each statement separately
      await tursoClient.execute('CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL, avatar TEXT, resetToken TEXT, resetTokenExpiry TEXT, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL)');
      await tursoClient.execute('CREATE INDEX IF NOT EXISTS idx_email ON users(email)');
      await tursoClient.execute('CREATE TABLE IF NOT EXISTS user_stats (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, mode TEXT NOT NULL, success INTEGER NOT NULL, duration_ms INTEGER NOT NULL, created_at TEXT NOT NULL)');
      await tursoClient.execute('CREATE INDEX IF NOT EXISTS idx_stats_user_id ON user_stats(user_id)');
      await tursoClient.execute('CREATE INDEX IF NOT EXISTS idx_stats_created_at ON user_stats(created_at)');
      
      console.log('✅ Turso database initialized successfully');
    } catch (error) {
      // Silently fail if tables already exist or auth fails
      // This is fine - the actual queries will handle missing tables or auth issues
    }
  }
}

// Don't initialize on build time - only when actually used in a request
let initialized = false;
async function ensureInitialized() {
  if (!initialized && tursoClient && process.env.NODE_ENV === 'production') {
    initialized = true;
    await initializeTursoDatabase().catch(() => {});
  }
}

class AsyncUserRepository {
  private formatUser(row: any): UserData {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      avatar: row.avatar || null,
      resetToken: row.resetToken || null,
      resetTokenExpiry: row.resetTokenExpiry ? new Date(row.resetTokenExpiry) : null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  async findByEmail(email: string): Promise<UserData | null> {
    try {
      if (tursoClient) {
        console.log('🔍 Finding user by email (Turso):', email);
        await ensureInitialized();
        const result = await tursoClient.execute({
          sql: 'SELECT * FROM users WHERE LOWER(email) = LOWER(?)',
          args: [email],
        });
        console.log('📊 Turso query result:', result.rows?.length || 0, 'rows');
        const user = result.rows?.[0];
        return user ? this.formatUser(user) : null;
      } else {
        console.log('🔍 Finding user by email (Local SQLite):', email);
        const stmt = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)');
        const user = stmt.get(email) as any;
        return user ? this.formatUser(user) : null;
      }
    } catch (error) {
      console.error('❌ Error finding user by email:', error);
      throw error; // Re-throw to see the actual error
    }
  }

  async findById(id: string): Promise<UserData | null> {
    try {
      if (tursoClient) {
        const result = await tursoClient.execute({
          sql: 'SELECT * FROM users WHERE id = ?',
          args: [id],
        });
        const user = result.rows?.[0];
        return user ? this.formatUser(user) : null;
      } else {
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
        const user = stmt.get(id) as any;
        return user ? this.formatUser(user) : null;
      }
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }

  async findByResetToken(token: string): Promise<UserData | null> {
    try {
      if (tursoClient) {
        const result = await tursoClient.execute({
          sql: 'SELECT * FROM users WHERE resetToken = ? AND resetTokenExpiry > datetime("now")',
          args: [token],
        });
        const user = result.rows?.[0];
        return user ? this.formatUser(user) : null;
      } else {
        const stmt = db.prepare('SELECT * FROM users WHERE resetToken = ? AND resetTokenExpiry > datetime("now")');
        const user = stmt.get(token) as any;
        return user ? this.formatUser(user) : null;
      }
    } catch (error) {
      console.error('Error finding user by reset token:', error);
      return null;
    }
  }

  async create(data: { name: string; email: string; password: string; avatar?: string }): Promise<UserData> {
    try {
      console.log('👤 Creating user:', data.email);
      const id = uuidv4();
      const now = new Date().toISOString();
      const hashedPassword = bcryptjs.hashSync(data.password, 10);

      if (tursoClient) {
        console.log('💾 Inserting into Turso database...');
        await ensureInitialized();
        await tursoClient.execute({
          sql: `INSERT INTO users (id, name, email, password, avatar, createdAt, updatedAt) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: [id, data.name, data.email.toLowerCase(), hashedPassword, data.avatar || null, now, now],
        });
        console.log('✅ User inserted successfully into Turso');
      } else {
        console.log('💾 Inserting into Local SQLite...');
        const stmt = db.prepare(
          `INSERT INTO users (id, name, email, password, avatar, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        );
        stmt.run(id, data.name, data.email.toLowerCase(), hashedPassword, data.avatar || null, now, now);
        console.log('✅ User inserted successfully into Local SQLite');
      }

      const user = await this.findById(id);
      if (!user) throw new Error('Failed to create user');
      return user;
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<UserData>): Promise<UserData | null> {
    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (data.name) {
        updates.push('name = ?');
        values.push(data.name);
      }
      if (data.password) {
        updates.push('password = ?');
        values.push(bcryptjs.hashSync(data.password, 10));
      }
      if ('avatar' in data) {
        updates.push('avatar = ?');
        values.push(data.avatar);
      }
      if ('resetToken' in data) {
        updates.push('resetToken = ?');
        values.push(data.resetToken);
      }
      if ('resetTokenExpiry' in data) {
        updates.push('resetTokenExpiry = ?');
        values.push(data.resetTokenExpiry ? new Date(data.resetTokenExpiry).toISOString() : null);
      }

      updates.push('updatedAt = ?');
      values.push(new Date().toISOString());
      values.push(id);

      const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

      if (tursoClient) {
        await tursoClient.execute({
          sql,
          args: values,
        });
      } else {
        const stmt = db.prepare(sql);
        stmt.run(...values);
      }

      return this.findById(id);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  comparePassword(plainPassword: string, hashedPassword: string): boolean {
    try {
      return bcryptjs.compareSync(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error comparing password:', error);
      return false;
    }
  }
}

export const userRepository = new AsyncUserRepository();
