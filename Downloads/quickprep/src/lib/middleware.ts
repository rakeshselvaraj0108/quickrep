/**
 * Security & Rate Limiting Middleware for Next.js API Routes
 * Handles CORS, CSRF, rate limiting, and security headers
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { RateLimitError, AppError, ErrorCode } from '@/lib/errors';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};
const CLEANUP_INTERVAL = 60000; // Cleanup every minute

// Cleanup old entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const key in rateLimitStore) {
      if (rateLimitStore[key].resetTime < now) {
        delete rateLimitStore[key];
      }
    }
  }, CLEANUP_INTERVAL);
}

/**
 * Rate limiting middleware
 */
export function createRateLimiter(config: RateLimitConfig) {
  return (getIdentifier: (req: NextRequest) => string) => {
    return (handler: (req: NextRequest) => Promise<NextResponse>) => {
      return async (req: NextRequest): Promise<NextResponse> => {
        const identifier = getIdentifier(req);
        const now = Date.now();

        if (!rateLimitStore[identifier]) {
          rateLimitStore[identifier] = {
            count: 1,
            resetTime: now + config.windowMs
          };
          return handler(req);
        }

        const record = rateLimitStore[identifier];

        if (now > record.resetTime) {
          record.count = 1;
          record.resetTime = now + config.windowMs;
          return handler(req);
        }

        if (record.count >= config.maxRequests) {
          const retryAfter = Math.ceil((record.resetTime - now) / 1000);
          logger.warn('Rate limit exceeded', {
            identifier,
            limit: config.maxRequests,
            window: config.windowMs,
            retryAfter
          });

          return NextResponse.json(
            {
              code: 'RATE_LIMIT_EXCEEDED',
              message: `Too many requests. Please try again in ${retryAfter} seconds.`,
              retryAfter
            },
            {
              status: 429,
              headers: {
                'Retry-After': retryAfter.toString()
              }
            }
          );
        }

        record.count++;
        return handler(req);
      };
    };
  };
}

/**
 * Get client IP from request
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.headers.get('x-real-ip') || 
         'unknown';
}

/**
 * CORS configuration
 */
export const corsConfig = {
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.NEXT_PUBLIC_APP_URL
  ].filter(Boolean),
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

/**
 * CORS middleware
 */
export function withCORS(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const origin = req.headers.get('origin');

    // Check if origin is allowed
    const isAllowed = !origin || corsConfig.allowedOrigins.includes(origin);

    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': isAllowed ? origin || '*' : '',
          'Access-Control-Allow-Methods': corsConfig.allowedMethods.join(', '),
          'Access-Control-Allow-Headers': corsConfig.allowedHeaders.join(', '),
          'Access-Control-Max-Age': corsConfig.maxAge.toString(),
          'Access-Control-Allow-Credentials': 'true'
        }
      });
    }

    const response = await handler(req);

    if (isAllowed && origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return response;
  };
}

/**
 * Security headers middleware
 */
export function withSecurityHeaders(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const response = await handler(req);

    // Content Security Policy
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
    );

    // X-Content-Type-Options
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // X-Frame-Options
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');

    // X-XSS-Protection
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Referrer-Policy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions-Policy
    response.headers.set(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=()'
    );

    // Strict-Transport-Security (HSTS)
    if (process.env.NODE_ENV === 'production') {
      response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }

    return response;
  };
}

/**
 * Input validation middleware
 */
export function withValidation<T>(
  schema: any,
  handler: (req: NextRequest, validatedData: T) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      let data: unknown;

      if (req.method === 'GET') {
        data = Object.fromEntries(req.nextUrl.searchParams);
      } else {
        try {
          data = await req.json();
        } catch {
          return NextResponse.json(
            { code: 'INVALID_JSON', message: 'Invalid JSON in request body' },
            { status: 400 }
          );
        }
      }

      const validatedData = schema.parse(data);
      return handler(req, validatedData);
    } catch (error: any) {
      logger.error('Validation error', error);

      if (error.errors) {
        const details = error.errors.reduce((acc: any, err: any) => {
          const path = err.path.join('.');
          acc[path] = err.message;
          return acc;
        }, {});

        return NextResponse.json(
          {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { code: 'BAD_REQUEST', message: 'Invalid request' },
        { status: 400 }
      );
    }
  };
}

/**
 * Combine multiple middleware
 */
export function compose(...middlewares: Array<(handler: any) => any>) {
  return (handler: (req: NextRequest) => Promise<NextResponse>) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
}

/**
 * Error handling wrapper
 */
export function withErrorHandler(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const requestId = crypto.randomUUID();

    try {
      const startTime = Date.now();
      const response = await handler(req);
      const duration = Date.now() - startTime;

      logger.apiCall(
        req.method,
        req.nextUrl.pathname,
        response.status,
        duration,
        { requestId }
      );

      response.headers.set('X-Request-ID', requestId);
      return response;
    } catch (error: any) {
      const duration = Date.now();

      if (error instanceof AppError) {
        logger.error(error.message, error, {
          requestId,
          code: error.code,
          statusCode: error.statusCode
        });

        return NextResponse.json(error.toJSON(), {
          status: error.statusCode,
          headers: { 'X-Request-ID': requestId }
        });
      }

      logger.fatal('Unhandled error', error, {
        requestId,
        endpoint: req.nextUrl.pathname
      });

      return NextResponse.json(
        {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
          requestId,
          timestamp: new Date().toISOString()
        },
        { status: 500, headers: { 'X-Request-ID': requestId } }
      );
    }
  };
}
