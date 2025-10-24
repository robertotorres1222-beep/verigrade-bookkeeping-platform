import { Request, Response, NextFunction } from 'express';
import logger from './logger';

export interface Metrics {
  requests: {
    total: number;
    successful: number;
    failed: number;
    byMethod: { [key: string]: number };
    byRoute: { [key: string]: number };
    byStatus: { [key: string]: number };
  };
  responseTime: {
    average: number;
    min: number;
    max: number;
    p95: number;
    p99: number;
  };
  errors: {
    total: number;
    byType: { [key: string]: number };
    recent: Array<{
      timestamp: string;
      error: string;
      route: string;
      method: string;
    }>;
  };
  system: {
    uptime: number;
    memoryUsage: {
      heapUsed: number;
      heapTotal: number;
      external: number;
      rss: number;
    };
    cpuUsage: number;
  };
}

class MetricsCollector {
  private metrics: Metrics;
  private responseTimes: number[] = [];
  private errorLog: Array<{
    timestamp: string;
    error: string;
    route: string;
    method: string;
  }> = [];

  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        byMethod: {},
        byRoute: {},
        byStatus: {},
      },
      responseTime: {
        average: 0,
        min: 0,
        max: 0,
        p95: 0,
        p99: 0,
      },
      errors: {
        total: 0,
        byType: {},
        recent: [],
      },
      system: {
        uptime: 0,
        memoryUsage: {
          heapUsed: 0,
          heapTotal: 0,
          external: 0,
          rss: 0,
        },
        cpuUsage: 0,
      },
    };
  }

  /**
   * Middleware to collect request metrics
   */
  collectRequestMetrics = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const route = req.route?.path || req.path;
    const method = req.method;

    // Increment total requests
    this.metrics.requests.total++;
    this.metrics.requests.byMethod[method] = (this.metrics.requests.byMethod[method] || 0) + 1;
    this.metrics.requests.byRoute[route] = (this.metrics.requests.byRoute[route] || 0) + 1;

    // Override res.end to capture response time and status
    const originalEnd = res.end;
    res.end = (chunk?: any, encoding?: any) => {
      const responseTime = Date.now() - startTime;
      
      // Record response time
      this.responseTimes.push(responseTime);
      if (this.responseTimes.length > 1000) {
        this.responseTimes = this.responseTimes.slice(-1000); // Keep only last 1000
      }

      // Update response time metrics
      this.updateResponseTimeMetrics();

      // Record status
      const status = res.statusCode.toString();
      this.metrics.requests.byStatus[status] = (this.metrics.requests.byStatus[status] || 0) + 1;

      // Record success/failure
      if (res.statusCode >= 200 && res.statusCode < 400) {
        this.metrics.requests.successful++;
      } else {
        this.metrics.requests.failed++;
      }

      // Log slow requests
      if (responseTime > 5000) {
        logger.warn(`Slow request detected: ${method} ${route} took ${responseTime}ms`, {
          method,
          route,
          responseTime,
          status: res.statusCode,
        });
      }

      // Call original end
      originalEnd.call(res, chunk, encoding);
    };

    next();
  };

  /**
   * Record an error
   */
  recordError(error: Error, req: Request) {
    this.metrics.errors.total++;
    
    const errorType = error.constructor.name;
    this.metrics.errors.byType[errorType] = (this.metrics.errors.byType[errorType] || 0) + 1;

    // Add to recent errors (keep only last 100)
    this.errorLog.push({
      timestamp: new Date().toISOString(),
      error: error.message,
      route: req.route?.path || req.path,
      method: req.method,
    });

    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }

    this.metrics.errors.recent = this.errorLog.slice(-10); // Keep only last 10 for API response
  }

  /**
   * Update response time metrics
   */
  private updateResponseTimeMetrics() {
    if (this.responseTimes.length === 0) return;

    const sorted = [...this.responseTimes].sort((a, b) => a - b);
    const length = sorted.length;

    this.metrics.responseTime = {
      average: sorted.reduce((sum, time) => sum + time, 0) / length,
      min: sorted[0],
      max: sorted[length - 1],
      p95: sorted[Math.floor(length * 0.95)],
      p99: sorted[Math.floor(length * 0.99)],
    };
  }

  /**
   * Update system metrics
   */
  updateSystemMetrics() {
    const memoryUsage = process.memoryUsage();
    
    this.metrics.system = {
      uptime: process.uptime(),
      memoryUsage: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      },
      cpuUsage: process.cpuUsage().user / 1000000, // Convert to seconds
    };
  }

  /**
   * Get current metrics
   */
  getMetrics(): Metrics {
    this.updateSystemMetrics();
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        byMethod: {},
        byRoute: {},
        byStatus: {},
      },
      responseTime: {
        average: 0,
        min: 0,
        max: 0,
        p95: 0,
        p99: 0,
      },
      errors: {
        total: 0,
        byType: {},
        recent: [],
      },
      system: {
        uptime: 0,
        memoryUsage: {
          heapUsed: 0,
          heapTotal: 0,
          external: 0,
          rss: 0,
        },
        cpuUsage: 0,
      },
    };
    this.responseTimes = [];
    this.errorLog = [];
  }
}

// Create singleton instance
export const metricsCollector = new MetricsCollector();

/**
 * Middleware to collect request metrics
 */
export const collectRequestMetrics = metricsCollector.collectRequestMetrics;

/**
 * Middleware to record errors
 */
export const recordError = (error: Error, req: Request) => {
  metricsCollector.recordError(error, req);
};

/**
 * Get metrics endpoint
 */
export const getMetrics = (req: Request, res: Response) => {
  try {
    const metrics = metricsCollector.getMetrics();
    
    res.status(200).json({
      success: true,
      data: metrics,
      message: 'Metrics retrieved successfully',
    });
  } catch (error) {
    logger.error('Error getting metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get metrics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Reset metrics endpoint
 */
export const resetMetrics = (req: Request, res: Response) => {
  try {
    metricsCollector.resetMetrics();
    
    res.status(200).json({
      success: true,
      message: 'Metrics reset successfully',
    });
  } catch (error) {
    logger.error('Error resetting metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset metrics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};






