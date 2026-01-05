// Simple in-memory user storage for development
// Replace with database in production

interface User {
  id: string;
  name: string;
  email: string;
  password: string; // hashed
  avatar?: string;
  resetToken?: string;
  resetTokenExpiry?: number;
}

// In-memory storage (persists during dev server runtime)
const users: Map<string, User> = new Map();

export const authStorage = {
  findByEmail(email: string): User | null {
    for (const user of users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  },

  findById(id: string): User | null {
    return users.get(id) || null;
  },

  findByResetToken(token: string): User | null {
    for (const user of users.values()) {
      if (user.resetToken === token && user.resetTokenExpiry && user.resetTokenExpiry > Date.now()) {
        return user;
      }
    }
    return null;
  },

  create(user: Omit<User, 'id'>): User {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newUser: User = { ...user, id };
    users.set(id, newUser);
    return newUser;
  },

  update(id: string, updates: Partial<User>): User | null {
    const user = users.get(id);
    if (!user) return null;
    const updatedUser = { ...user, ...updates };
    users.set(id, updatedUser);
    return updatedUser;
  },

  getAll() {
    return Array.from(users.values());
  },
};
