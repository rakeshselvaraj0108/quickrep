/**
 * Custom Error Classes for Production Error Handling
 * Handles typed errors across the application
 */

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT = 'RATE_LIMIT',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR'
}

export interface ErrorResponse {
  code: ErrorCode;
  message: string;
  statusCode: number;
  details?: Record<string, any>;
  timestamp: string;
  requestId?: string;
  path?: string;
}

export class AppError extends Error {
  code: ErrorCode;
  statusCode: number;
  details?: Record<string, any>;
  requestId?: string;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR,
    statusCode: number = 500,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Maintain proper stack trace
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): ErrorResponse {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: new Date().toISOString(),
      requestId: this.requestId
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, details);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details?: Record<string, any>) {
    super(message, ErrorCode.NOT_FOUND, 404, details);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', details?: Record<string, any>) {
    super(message, ErrorCode.UNAUTHORIZED, 401, details);
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', details?: Record<string, any>) {
    super(message, ErrorCode.FORBIDDEN, 403, details);
    this.name = 'ForbiddenError';
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict', details?: Record<string, any>) {
    super(message, ErrorCode.CONFLICT, 409, details);
    this.name = 'ConflictError';
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class RateLimitError extends AppError {
  retryAfter: number;

  constructor(message: string = 'Rate limit exceeded', retryAfter: number = 60) {
    super(message, ErrorCode.RATE_LIMIT, 429);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database error', details?: Record<string, any>) {
    super(message, ErrorCode.DATABASE_ERROR, 500, details);
    this.name = 'DatabaseError';
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

export class ExternalApiError extends AppError {
  constructor(
    message: string = 'External API error',
    public service: string = 'Unknown',
    details?: Record<string, any>
  ) {
    super(message, ErrorCode.EXTERNAL_API_ERROR, 502, {
      ...details,
      service
    });
    this.name = 'ExternalApiError';
    Object.setPrototypeOf(this, ExternalApiError.prototype);
  }
}

export class TimeoutError extends AppError {
  constructor(message: string = 'Request timeout', details?: Record<string, any>) {
    super(message, ErrorCode.TIMEOUT, 408, details);
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

// Type guard to check if error is an AppError
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

// Get HTTP status code for error
export function getStatusCode(error: unknown): number {
  if (isAppError(error)) {
    return error.statusCode;
  }
  if (error instanceof Error && 'statusCode' in error) {
    return (error as any).statusCode;
  }
  return 500;
}

// Format error for logging
export function formatErrorForLogging(error: unknown): Record<string, any> {
  if (isAppError(error)) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
      stack: error.stack,
      name: error.name
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name
    };
  }

  return {
    message: String(error),
    type: typeof error
  };
}
