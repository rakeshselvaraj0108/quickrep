// Authentication middleware for API routes
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import type { DecodedJWT } from '@/types/auth';

export function verifyToken(token: string): DecodedJWT | null {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as DecodedJWT;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  return parts[1];
}

/**
 * Protect API routes that require authentication
 * Usage in route.ts:
 *
 * export async function POST(request: NextRequest) {
 *   const decoded = withAuth(request);
 *   if (!decoded) {
 *     return NextResponse.json(
 *       { error: 'Unauthorized' },
 *       { status: 401 }
 *     );
 *   }
 *   // Use decoded.userId for protected operations
 * }
 */
export function withAuth(request: NextRequest): DecodedJWT | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  return verifyToken(token);
}

/**
 * Middleware wrapper for protected endpoints
 */
export function createProtectedHandler(
  handler: (request: NextRequest, decoded: DecodedJWT) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const decoded = withAuth(request);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }

    try {
      return await handler(request, decoded);
    } catch (error) {
      console.error('Handler error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
