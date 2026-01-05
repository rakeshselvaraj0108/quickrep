/**
 * Input Validation & Sanitization
 * Provides Zod schemas and sanitization utilities for production safety
 */

import { z } from 'zod';
import DOMPurify from 'dompurify';
import { ValidationError } from './errors';

// Common validation schemas
export const schemas = {
  // User
  userId: z.string().uuid('Invalid user ID'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain special character'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, dashes and underscores'),

  // Content
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  content: z.string()
    .min(1, 'Content is required')
    .max(50000, 'Content must be less than 50000 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters'),

  // Numbers
  positiveInt: z.number().int('Must be an integer').positive('Must be positive'),
  percentage: z.number().min(0).max(100),

  // IDs
  uuid: z.string().uuid('Invalid ID format'),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),

  // Dates
  date: z.string().datetime('Invalid date format'),

  // Pagination
  page: z.number().int().min(1, 'Page must be at least 1'),
  limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100'),

  // Search
  searchQuery: z.string()
    .min(1, 'Search query is required')
    .max(500, 'Search query too long')
};

// Compound schemas
export const authSchemas = {
  login: z.object({
    email: schemas.email,
    password: z.string().min(1, 'Password is required')
  }),

  register: z.object({
    email: schemas.email,
    password: schemas.password,
    username: schemas.username,
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  }),

  resetPassword: z.object({
    email: schemas.email,
    token: z.string().min(1, 'Token is required'),
    newPassword: schemas.password
  })
};

export const contentSchemas = {
  createStudyNote: z.object({
    title: schemas.title,
    content: schemas.content,
    topic: z.string().max(100, 'Topic too long'),
    tags: z.array(z.string()).max(10, 'Maximum 10 tags'),
    isPublic: z.boolean().default(false)
  }),

  updateStudyNote: z.object({
    title: schemas.title.optional(),
    content: schemas.content.optional(),
    topic: z.string().max(100, 'Topic too long').optional(),
    tags: z.array(z.string()).max(10, 'Maximum 10 tags').optional(),
    isPublic: z.boolean().optional()
  }),

  createFlashcard: z.object({
    question: schemas.content,
    answer: schemas.content,
    difficulty: z.enum(['easy', 'medium', 'hard']),
    deck: schemas.uuid
  })
};

export const searchSchemas = {
  search: z.object({
    query: schemas.searchQuery,
    page: schemas.page.default(1),
    limit: schemas.limit.default(20),
    sortBy: z.enum(['relevance', 'date', 'views']).default('relevance')
  })
};

/**
 * Sanitization utility functions
 */
export class Sanitizer {
  /**
   * Sanitize HTML to prevent XSS attacks
   */
  static html(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
      ALLOWED_ATTR: ['href', 'target', 'rel']
    });
  }

  /**
   * Sanitize plain text
   */
  static text(text: string, maxLength: number = 10000): string {
    return text
      .trim()
      .substring(0, maxLength)
      .replace(/[<>]/g, ''); // Remove angle brackets
  }

  /**
   * Sanitize email
   */
  static email(email: string): string {
    return email.toLowerCase().trim();
  }

  /**
   * Sanitize URL
   */
  static url(url: string): string {
    try {
      const parsed = new URL(url);
      // Only allow http and https
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Invalid protocol');
      }
      return parsed.toString();
    } catch {
      throw new ValidationError('Invalid URL provided');
    }
  }

  /**
   * Sanitize filename
   */
  static filename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '')
      .substring(0, 255);
  }

  /**
   * Sanitize JSON string
   */
  static json(json: string): Record<string, any> {
    try {
      return JSON.parse(json);
    } catch {
      throw new ValidationError('Invalid JSON provided');
    }
  }
}

/**
 * Validation utility functions
 */
export class Validator {
  /**
   * Validate and parse data against schema
   */
  static parse<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = error.issues.reduce((acc, err) => {
          const path = err.path.join('.');
          acc[path] = err.message;
          return acc;
        }, {} as Record<string, string>);
        throw new ValidationError('Validation failed', details);
      }
      throw error;
    }
  }

  /**
   * Safely parse with fallback
   */
  static safeParse<T>(schema: z.ZodSchema<T>, data: unknown): [T | null, ValidationError | null] {
    try {
      const parsed = schema.parse(data);
      return [parsed, null];
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = error.issues.reduce((acc, err) => {
          const path = err.path.join('.');
          acc[path] = err.message;
          return acc;
        }, {} as Record<string, string>);
        return [null, new ValidationError('Validation failed', details)];
      }
      return [null, new ValidationError('Unknown validation error')];
    }
  }

  /**
   * Validate password strength
   */
  static passwordStrength(password: string): {
    score: number; // 0-5
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score < 2) feedback.push('Password is too weak');
    if (!/[A-Z]/.test(password)) feedback.push('Add uppercase letters');
    if (!/[0-9]/.test(password)) feedback.push('Add numbers');
    if (!/[^a-zA-Z0-9]/.test(password)) feedback.push('Add special characters');

    return { score: Math.min(score, 5), feedback };
  }

  /**
   * Validate credit card
   */
  static creditCard(cardNumber: string): boolean {
    const sanitized = cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(sanitized)) return false;

    // Luhn algorithm
    let sum = 0;
    let isEven = false;

    for (let i = sanitized.length - 1; i >= 0; i--) {
      let digit = parseInt(sanitized[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Validate file size
   */
  static fileSize(bytes: number, maxSizeMB: number = 10): boolean {
    return bytes <= maxSizeMB * 1024 * 1024;
  }

  /**
   * Validate file type
   */
  static fileType(filename: string, allowedExtensions: string[]): boolean {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    return allowedExtensions.includes(extension);
  }
}
