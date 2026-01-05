import db, { initializeDatabase } from './sqlite';
import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Initialize database on first load
initializeDatabase();

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

class UserRepository {
  /**
   * Find user by email
   */
  findByEmail(email: string): UserData | null {
    try {
      const stmt = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)');
      const user = stmt.get(email) as any;
      return user ? this.formatUser(user) : null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  /**
   * Find user by ID
   */
  findById(id: string): UserData | null {
    try {
      const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
      const user = stmt.get(id) as any;
      return user ? this.formatUser(user) : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }

  /**
   * Find user by reset token
   */
  findByResetToken(token: string): UserData | null {
    try {
      const stmt = db.prepare('SELECT * FROM users WHERE resetToken = ? AND resetTokenExpiry > datetime("now")');
      const user = stmt.get(token) as any;
      return user ? this.formatUser(user) : null;
    } catch (error) {
      console.error('Error finding user by reset token:', error);
      return null;
    }
  }

  /**
   * Create new user
   */
  create(data: { name: string; email: string; password: string; avatar?: string }): UserData {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      const hashedPassword = bcryptjs.hashSync(data.password, 10);

      const stmt = db.prepare(
        `INSERT INTO users (id, name, email, password, avatar, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      );

      stmt.run(
        id,
        data.name,
        data.email.toLowerCase(),
        hashedPassword,
        data.avatar || null,
        now,
        now
      );

      return this.findById(id)!;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user
   */
  update(id: string, data: Partial<UserData>): UserData | null {
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

      const stmt = db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`);
      stmt.run(...values);

      return this.findById(id);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Compare password
   */
  comparePassword(plainPassword: string, hashedPassword: string): boolean {
    try {
      return bcryptjs.compareSync(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error comparing password:', error);
      return false;
    }
  }

  /**
   * Format user object from database
   */
  private formatUser(row: any): UserData {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      avatar: row.avatar,
      resetToken: row.resetToken,
      resetTokenExpiry: row.resetTokenExpiry ? new Date(row.resetTokenExpiry) : null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }
}

export const userRepository = new UserRepository();
