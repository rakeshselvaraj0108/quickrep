/**
 * Production Logger for Application-wide Logging
 * Supports multiple log levels and outputs
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

export interface LogContext {
  userId?: string;
  requestId?: string;
  sessionId?: string;
  endpoint?: string;
  timestamp: string;
  environment: string;
  version: string;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context: LogContext;
  data?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

class Logger {
  private environment: string;
  private version: string;
  private isDevelopment: boolean;

  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.version = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
    this.isDevelopment = this.environment === 'development';
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: Record<string, any>,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      context: {
        timestamp: new Date().toISOString(),
        environment: this.environment,
        version: this.version,
        requestId: data?.requestId,
        userId: data?.userId,
        sessionId: data?.sessionId,
        endpoint: data?.endpoint
      },
      data: data ? Object.fromEntries(
        Object.entries(data).filter(([key]) => 
          !['requestId', 'userId', 'sessionId', 'endpoint'].includes(key)
        )
      ) : undefined,
      error: error ? {
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
        code: (error as any).code
      } : undefined
    };
  }

  private formatLog(entry: LogEntry): string {
    const timestamp = entry.context.timestamp;
    const level = entry.level.padEnd(5);
    const message = entry.message;

    if (this.isDevelopment) {
      return `[${timestamp}] ${level} ${message}${
        entry.data ? '\n' + JSON.stringify(entry.data, null, 2) : ''
      }${entry.error ? '\n' + JSON.stringify(entry.error, null, 2) : ''}`;
    }

    return JSON.stringify(entry);
  }

  private output(entry: LogEntry): void {
    const formatted = this.formatLog(entry);

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formatted);
        break;
    }

    // In production, you could send to external logging service here
    // e.g., Sentry, LogRocket, DataDog, etc.
    if (!this.isDevelopment) {
      this.sendToExternalService(entry);
    }
  }

  private sendToExternalService(entry: LogEntry): void {
    // Placeholder for external logging service integration
    // Examples:
    // - Sentry.captureException()
    // - window.datadog.logMessage()
    // - fetch('https://logs.service.com/log', { method: 'POST', body: JSON.stringify(entry) })
  }

  debug(message: string, data?: Record<string, any>): void {
    this.output(this.createLogEntry(LogLevel.DEBUG, message, data));
  }

  info(message: string, data?: Record<string, any>): void {
    this.output(this.createLogEntry(LogLevel.INFO, message, data));
  }

  warn(message: string, data?: Record<string, any>): void {
    this.output(this.createLogEntry(LogLevel.WARN, message, data));
  }

  error(message: string, error?: Error | unknown, data?: Record<string, any>): void {
    const err = error instanceof Error ? error : new Error(String(error));
    this.output(this.createLogEntry(LogLevel.ERROR, message, data, err));
  }

  fatal(message: string, error?: Error | unknown, data?: Record<string, any>): void {
    const err = error instanceof Error ? error : new Error(String(error));
    this.output(this.createLogEntry(LogLevel.FATAL, message, data, err));
  }

  // Specialized logging methods
  apiCall(method: string, endpoint: string, statusCode: number, duration: number, data?: Record<string, any>): void {
    this.info(`API Call: ${method} ${endpoint} - ${statusCode}`, {
      ...data,
      method,
      endpoint,
      statusCode,
      duration
    });
  }

  authentication(action: string, userId?: string, success: boolean = true, data?: Record<string, any>): void {
    this.info(`Authentication: ${action} - ${success ? 'SUCCESS' : 'FAILED'}`, {
      ...data,
      action,
      userId,
      success
    });
  }

  database(operation: string, collection: string, duration: number, data?: Record<string, any>): void {
    this.info(`Database: ${operation} on ${collection}`, {
      ...data,
      operation,
      collection,
      duration
    });
  }

  userAction(action: string, userId: string, details?: Record<string, any>): void {
    this.info(`User Action: ${action}`, {
      ...details,
      action,
      userId
    });
  }

  performance(metric: string, value: number, threshold: number, data?: Record<string, any>): void {
    const status = value > threshold ? 'SLOW' : 'NORMAL';
    this.info(`Performance: ${metric} - ${status}`, {
      ...data,
      metric,
      value,
      threshold,
      status
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for dependency injection
export type ILogger = typeof logger;
