import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';
import { performanceMonitor } from '../monitoring/performanceMonitor';
import { errorMonitor } from '../monitoring/errorMonitor';
import { logger } from '../utils/logger';

/**
 * Performance monitoring middleware
 */
export const performanceMonitoringMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = performance.now();
  const startCpuUsage = process.cpuUsage();

  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Record performance metrics
    performanceMonitor.recordApiCall(
      req.path,
      req.method,
      duration,
      res.statusCode
    );

    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        path: req.path,
        duration,
        statusCode: res.statusCode,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      });
    }

    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Error monitoring middleware
 */
export const errorMonitoringMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Record error
  errorMonitor.recordError(error, {
    endpoint: req.path,
    method: req.method,
    userId: (req as any).user?.id,
    organizationId: (req as any).user?.organizationId,
  });

  // Log error details
  logger.error('Request error', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    path: req.path,
    statusCode: res.statusCode,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: (req as any).user?.id,
    organizationId: (req as any).user?.organizationId,
  });

  next(error);
};

/**
 * Database query monitoring middleware
 */
export const databaseMonitoringMiddleware = (query: string, duration: number) => {
  // Get connection count (this would need to be implemented based on your DB setup)
  const connectionCount = 1; // Placeholder

  // Record database metrics
  performanceMonitor.recordDatabaseQuery(query, duration, connectionCount);

  // Log slow queries
  if (duration > 500) {
    logger.warn('Slow database query detected', {
      query: query.substring(0, 200), // Truncate for logging
      duration,
      connectionCount,
    });
  }
};

/**
 * Request logging middleware
 */
export const requestLoggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  // Log request
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    query: req.query,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: (req as any).user?.id,
    organizationId: (req as any).user?.organizationId,
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const duration = Date.now() - startTime;

    // Log response
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      contentLength: res.get('Content-Length'),
    });

    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Security monitoring middleware
 */
export const securityMonitoringMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.\./, // Directory traversal
    /<script/i, // XSS attempts
    /union\s+select/i, // SQL injection
    /eval\s*\(/i, // Code injection
    /javascript:/i, // JavaScript injection
  ];

  const requestString = JSON.stringify({
    path: req.path,
    query: req.query,
    body: req.body,
    headers: req.headers,
  });

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestString)) {
      logger.warn('Suspicious request detected', {
        method: req.method,
        path: req.path,
        pattern: pattern.toString(),
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: (req as any).user?.id,
      });

      // Record security event
      errorMonitor.recordError(
        new Error(`Suspicious request pattern detected: ${pattern}`),
        {
          endpoint: req.path,
          method: req.method,
          userId: (req as any).user?.id,
          organizationId: (req as any).user?.organizationId,
        }
      );
    }
  }

  next();
};

/**
 * Rate limiting monitoring middleware
 */
export const rateLimitMonitoringMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // This would integrate with your rate limiting implementation
  // For now, we'll just log rate limit events
  if (res.statusCode === 429) {
    logger.warn('Rate limit exceeded', {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id,
    });

    // Record rate limit event
    errorMonitor.recordError(
      new Error('Rate limit exceeded'),
      {
        endpoint: req.path,
        method: req.method,
        userId: (req as any).user?.id,
        organizationId: (req as any).user?.organizationId,
      }
    );
  }

  next();
};


