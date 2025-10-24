import { performance } from 'perf_hooks';
import { logger } from '../utils/logger';

interface PerformanceMetrics {
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  timestamp: Date;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
}

interface DatabaseMetrics {
  query: string;
  duration: number;
  timestamp: Date;
  connectionCount: number;
}

interface SystemMetrics {
  timestamp: Date;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  uptime: number;
  loadAverage: number[];
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private dbMetrics: DatabaseMetrics[] = [];
  private systemMetrics: SystemMetrics[] = [];
  private startTime: number;
  private lastCpuUsage: NodeJS.CpuUsage;

  private constructor() {
    this.startTime = Date.now();
    this.lastCpuUsage = process.cpuUsage();
    this.startSystemMonitoring();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Record API endpoint performance
   */
  public recordApiCall(
    endpoint: string,
    method: string,
    duration: number,
    statusCode: number
  ): void {
    const metric: PerformanceMetrics = {
      endpoint,
      method,
      duration,
      statusCode,
      timestamp: new Date(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(this.lastCpuUsage),
    };

    this.metrics.push(metric);
    this.lastCpuUsage = process.cpuUsage();

    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow API request detected', {
        endpoint,
        method,
        duration,
        statusCode,
      });
    }

    // Log error responses
    if (statusCode >= 400) {
      logger.error('API error response', {
        endpoint,
        method,
        duration,
        statusCode,
      });
    }

    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Record database query performance
   */
  public recordDatabaseQuery(
    query: string,
    duration: number,
    connectionCount: number
  ): void {
    const metric: DatabaseMetrics = {
      query: this.sanitizeQuery(query),
      duration,
      timestamp: new Date(),
      connectionCount,
    };

    this.dbMetrics.push(metric);

    // Log slow queries
    if (duration > 500) {
      logger.warn('Slow database query detected', {
        query: this.sanitizeQuery(query),
        duration,
        connectionCount,
      });
    }

    // Keep only last 1000 metrics
    if (this.dbMetrics.length > 1000) {
      this.dbMetrics = this.dbMetrics.slice(-1000);
    }
  }

  /**
   * Get performance statistics
   */
  public getPerformanceStats(): {
    apiStats: {
      totalRequests: number;
      averageResponseTime: number;
      slowRequests: number;
      errorRate: number;
      topEndpoints: Array<{ endpoint: string; count: number; avgDuration: number }>;
    };
    dbStats: {
      totalQueries: number;
      averageQueryTime: number;
      slowQueries: number;
      topQueries: Array<{ query: string; count: number; avgDuration: number }>;
    };
    systemStats: {
      uptime: number;
      memoryUsage: NodeJS.MemoryUsage;
      cpuUsage: NodeJS.CpuUsage;
      loadAverage: number[];
    };
  } {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    // Filter metrics from last hour
    const recentApiMetrics = this.metrics.filter(
      m => m.timestamp.getTime() > oneHourAgo
    );
    const recentDbMetrics = this.dbMetrics.filter(
      m => m.timestamp.getTime() > oneHourAgo
    );

    // API Statistics
    const totalRequests = recentApiMetrics.length;
    const averageResponseTime = totalRequests > 0
      ? recentApiMetrics.reduce((sum, m) => sum + m.duration, 0) / totalRequests
      : 0;
    const slowRequests = recentApiMetrics.filter(m => m.duration > 1000).length;
    const errorRate = totalRequests > 0
      ? recentApiMetrics.filter(m => m.statusCode >= 400).length / totalRequests
      : 0;

    // Top endpoints by request count
    const endpointCounts = new Map<string, { count: number; totalDuration: number }>();
    recentApiMetrics.forEach(m => {
      const key = `${m.method} ${m.endpoint}`;
      const existing = endpointCounts.get(key) || { count: 0, totalDuration: 0 };
      endpointCounts.set(key, {
        count: existing.count + 1,
        totalDuration: existing.totalDuration + m.duration,
      });
    });

    const topEndpoints = Array.from(endpointCounts.entries())
      .map(([endpoint, data]) => ({
        endpoint,
        count: data.count,
        avgDuration: data.totalDuration / data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Database Statistics
    const totalQueries = recentDbMetrics.length;
    const averageQueryTime = totalQueries > 0
      ? recentDbMetrics.reduce((sum, m) => sum + m.duration, 0) / totalQueries
      : 0;
    const slowQueries = recentDbMetrics.filter(m => m.duration > 500).length;

    // Top queries by count
    const queryCounts = new Map<string, { count: number; totalDuration: number }>();
    recentDbMetrics.forEach(m => {
      const existing = queryCounts.get(m.query) || { count: 0, totalDuration: 0 };
      queryCounts.set(m.query, {
        count: existing.count + 1,
        totalDuration: existing.totalDuration + m.duration,
      });
    });

    const topQueries = Array.from(queryCounts.entries())
      .map(([query, data]) => ({
        query,
        count: data.count,
        avgDuration: data.totalDuration / data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // System Statistics
    const latestSystemMetric = this.systemMetrics[this.systemMetrics.length - 1];
    const systemStats = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(this.lastCpuUsage),
      loadAverage: latestSystemMetric?.loadAverage || [0, 0, 0],
    };

    return {
      apiStats: {
        totalRequests,
        averageResponseTime,
        slowRequests,
        errorRate,
        topEndpoints,
      },
      dbStats: {
        totalQueries,
        averageQueryTime,
        slowQueries,
        topQueries,
      },
      systemStats,
    };
  }

  /**
   * Get health check data
   */
  public getHealthCheck(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: Date;
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
    metrics: {
      apiErrorRate: number;
      dbErrorRate: number;
      averageResponseTime: number;
      slowRequestCount: number;
    };
  } {
    const stats = this.getPerformanceStats();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage(this.lastCpuUsage);

    // Determine health status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (
      stats.apiStats.errorRate > 0.1 || // 10% error rate
      stats.apiStats.averageResponseTime > 2000 || // 2s average response time
      memoryUsage.heapUsed / memoryUsage.heapTotal > 0.9 || // 90% memory usage
      cpuUsage.user + cpuUsage.system > 1000000 // High CPU usage
    ) {
      status = 'degraded';
    }

    if (
      stats.apiStats.errorRate > 0.2 || // 20% error rate
      stats.apiStats.averageResponseTime > 5000 || // 5s average response time
      memoryUsage.heapUsed / memoryUsage.heapTotal > 0.95 || // 95% memory usage
      cpuUsage.user + cpuUsage.system > 2000000 // Very high CPU usage
    ) {
      status = 'unhealthy';
    }

    return {
      status,
      timestamp: new Date(),
      uptime: process.uptime(),
      memoryUsage,
      cpuUsage,
      metrics: {
        apiErrorRate: stats.apiStats.errorRate,
        dbErrorRate: 0, // Would need to track DB errors separately
        averageResponseTime: stats.apiStats.averageResponseTime,
        slowRequestCount: stats.apiStats.slowRequests,
      },
    };
  }

  /**
   * Start system monitoring
   */
  private startSystemMonitoring(): void {
    setInterval(() => {
      const systemMetric: SystemMetrics = {
        timestamp: new Date(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(this.lastCpuUsage),
        uptime: process.uptime(),
        loadAverage: require('os').loadavg(),
      };

      this.systemMetrics.push(systemMetric);
      this.lastCpuUsage = process.cpuUsage();

      // Keep only last 100 system metrics
      if (this.systemMetrics.length > 100) {
        this.systemMetrics = this.systemMetrics.slice(-100);
      }

      // Log system metrics every 5 minutes
      if (this.systemMetrics.length % 5 === 0) {
        logger.info('System metrics', {
          memoryUsage: systemMetric.memoryUsage,
          cpuUsage: systemMetric.cpuUsage,
          uptime: systemMetric.uptime,
          loadAverage: systemMetric.loadAverage,
        });
      }
    }, 60000); // Every minute
  }

  /**
   * Sanitize database query for logging
   */
  private sanitizeQuery(query: string): string {
    // Remove sensitive data and limit length
    return query
      .replace(/password\s*=\s*'[^']*'/gi, "password='***'")
      .replace(/token\s*=\s*'[^']*'/gi, "token='***'")
      .replace(/secret\s*=\s*'[^']*'/gi, "secret='***'")
      .substring(0, 200);
  }

  /**
   * Clear old metrics
   */
  public clearOldMetrics(): void {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    this.metrics = this.metrics.filter(m => m.timestamp.getTime() > oneDayAgo);
    this.dbMetrics = this.dbMetrics.filter(m => m.timestamp.getTime() > oneDayAgo);
    this.systemMetrics = this.systemMetrics.filter(m => m.timestamp.getTime() > oneDayAgo);
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

