/**
 * Production-ready logger utility
 * Replaces console.log statements with proper logging
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export interface LogContext {
  userId?: string;
  organizationId?: string;
  requestId?: string;
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';
  private logLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const formattedMessage = this.formatMessage(LogLevel.ERROR, message, context);
      console.error(formattedMessage, error?.stack || '');
      
      // In production, send to error tracking service
      if (!this.isDevelopment) {
        this.sendToErrorTracking(message, error, context);
      }
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const formattedMessage = this.formatMessage(LogLevel.WARN, message, context);
      console.warn(formattedMessage);
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const formattedMessage = this.formatMessage(LogLevel.INFO, message, context);
      console.info(formattedMessage);
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const formattedMessage = this.formatMessage(LogLevel.DEBUG, message, context);
      if (this.isDevelopment) {
        console.log(formattedMessage);
      }
    }
  }

  private sendToErrorTracking(message: string, error?: Error, context?: LogContext): void {
    // Integration with error tracking service (e.g., Sentry, Rollbar)
    // This is a placeholder for actual implementation
    try {
      // Send to external service
    } catch (err) {
      // Fail silently to not affect main application
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const logError = (message: string, error?: Error, context?: LogContext) => 
  logger.error(message, error, context);
export const logWarn = (message: string, context?: LogContext) => 
  logger.warn(message, context);
export const logInfo = (message: string, context?: LogContext) => 
  logger.info(message, context);
export const logDebug = (message: string, context?: LogContext) => 
  logger.debug(message, context);