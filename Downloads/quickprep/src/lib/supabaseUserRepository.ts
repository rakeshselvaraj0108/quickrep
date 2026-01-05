import { supabase } from './supabase';
import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

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

class SupabaseUserRepository {
  async findByEmail(email: string): Promise<UserData | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        console.error('Error finding user by email:', error);
        throw error;
      }

      return data ? this.formatUser(data) : null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  async findById(id: string): Promise<UserData | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        console.error('Error finding user by ID:', error);
        throw error;
      }

      return data ? this.formatUser(data) : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }

  async findByResetToken(token: string): Promise<UserData | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('resetToken', token)
        .gt('resetTokenExpiry', new Date().toISOString())
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        console.error('Error finding user by reset token:', error);
        throw error;
      }

      return data ? this.formatUser(data) : null;
    } catch (error) {
      console.error('Error finding user by reset token:', error);
      return null;
    }
  }

  async create(data: { name: string; email: string; password: string; avatar?: string }): Promise<UserData> {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      const hashedPassword = bcryptjs.hashSync(data.password, 10);

      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          id,
          name: data.name,
          email: data.email.toLowerCase(),
          password: hashedPassword,
          avatar: data.avatar || null,
          createdAt: now,
          updatedAt: now,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        throw error;
      }

      return this.formatUser(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<UserData>): Promise<UserData | null> {
    try {
      const updates: any = {
        updatedAt: new Date().toISOString(),
      };

      if (data.name) updates.name = data.name;
      if (data.password) updates.password = bcryptjs.hashSync(data.password, 10);
      if ('avatar' in data) updates.avatar = data.avatar;
      if ('resetToken' in data) updates.resetToken = data.resetToken;
      if ('resetTokenExpiry' in data) {
        updates.resetTokenExpiry = data.resetTokenExpiry ? new Date(data.resetTokenExpiry).toISOString() : null;
      }

      const { data: updatedUser, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user:', error);
        throw error;
      }

      return updatedUser ? this.formatUser(updatedUser) : null;
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
}

export const userRepository = new SupabaseUserRepository();
