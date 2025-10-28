import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import logger from '../utils/logger';

export interface PerformanceMetrics {
  endpoint: string;
  method: string;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  requestCount: number;
  errorRate: number;
  throughput: number;
  timestamp: Date;
}

export interface DatabaseMetrics {
  query: string;
  averageExecutionTime: number;
  executionCount: number;
  slowQueries: number;
  indexUsage: number;
  timestamp: Date;
}

export interface CacheMetrics {
  hitRate: number;
  missRate: number;
  evictionRate: number;
  memoryUsage: number;
  keyCount: number;
  timestamp: Date;
}

export interface OptimizationRecommendation {
  type: 'database' | 'cache' | 'api' | 'frontend';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  implementation: string;
  estimatedImprovement: number;
}

class PerformanceOptimizationService {
  private prisma: PrismaClient;
  private redis: Redis;
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private dbMetrics: Map<string, DatabaseMetrics> = new Map();
  private cacheMetrics: Map<string, CacheMetrics> = new Map();

  constructor() {
    this.prisma = new PrismaClient();
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    });
    
    this.initializeMonitoring();
    logger.info('[PerformanceOptimizationService] Initialized');
  }

  /**
   * Initialize performance monitoring
   */
  private initializeMonitoring(): void {
    // Start collecting metrics every 30 seconds
    setInterval(() => {
      this.collectMetrics();
    }, 30000);

    // Start database query monitoring
    this.setupDatabaseMonitoring();

    // Start cache monitoring
    this.setupCacheMonitoring();
  }

  /**
   * Collect performance metrics
   */
  public async collectMetrics(): Promise<void> {
    try {
      await this.collectAPIMetrics();
      await this.collectDatabaseMetrics();
      await this.collectCacheMetrics();
    } catch (error: any) {
      logger.error('[PerformanceOptimizationService] Error collecting metrics:', error);
    }
  }

  /**
   * Collect API performance metrics
   */
  private async collectAPIMetrics(): Promise<void> {
    // This would typically come from your monitoring system
    // For now, we'll simulate some metrics
    const endpoints = [
      '/api/analytics/companies/:id/cash-flow-forecast',
      '/api/analytics/companies/:id/revenue-prediction',
      '/api/analytics/companies/:id/expense-trends',
      '/api/analytics/companies/:id/anomalies',
      '/api/analytics/companies/:id/risks',
      '/api/analytics/companies/:id/kpis',
      '/api/analytics/companies/:id/dashboards',
      '/api/analytics/ml-models',
      '/api/analytics/ml-models/:id/predict'
    ];

    for (const endpoint of endpoints) {
      const metrics: PerformanceMetrics = {
        endpoint,
        method: 'GET',
        averageResponseTime: Math.random() * 1000 + 100,
        p95ResponseTime: Math.random() * 2000 + 500,
        p99ResponseTime: Math.random() * 3000 + 1000,
        requestCount: Math.floor(Math.random() * 1000) + 100,
        errorRate: Math.random() * 0.05,
        throughput: Math.random() * 100 + 50,
        timestamp: new Date()
      };

      this.metrics.set(endpoint, metrics);
    }
  }

  /**
   * Collect database performance metrics
   */
  private async collectDatabaseMetrics(): Promise<void> {
    try {
      // Get slow queries from database
      const slowQueries = await this.prisma.$queryRaw`
        SELECT 
          query,
          mean_exec_time,
          calls,
          total_exec_time
        FROM pg_stat_statements 
        WHERE mean_exec_time > 1000
        ORDER BY mean_exec_time DESC
        LIMIT 10
      ` as any[];

      for (const query of slowQueries) {
        const dbMetrics: DatabaseMetrics = {
          query: query.query,
          averageExecutionTime: parseFloat(query.mean_exec_time),
          executionCount: parseInt(query.calls),
          slowQueries: parseInt(query.calls),
          indexUsage: Math.random() * 100,
          timestamp: new Date()
        };

        this.dbMetrics.set(query.query, dbMetrics);
      }
    } catch (error) {
      // pg_stat_statements might not be available
      logger.warn('[PerformanceOptimizationService] Database monitoring not available');
    }
  }

  /**
   * Collect cache performance metrics
   */
  private async collectCacheMetrics(): Promise<void> {
    try {
      const info = await this.redis.info('stats');
      const memory = await this.redis.info('memory');
      
      const stats = this.parseRedisInfo(info);
      const memStats = this.parseRedisInfo(memory);
      
      const cacheMetrics: CacheMetrics = {
        hitRate: stats.keyspace_hits / (stats.keyspace_hits + stats.keyspace_misses) || 0,
        missRate: stats.keyspace_misses / (stats.keyspace_hits + stats.keyspace_misses) || 0,
        evictionRate: stats.evicted_keys / stats.total_commands_processed || 0,
        memoryUsage: parseInt(memStats.used_memory) || 0,
        keyCount: await this.redis.dbsize(),
        timestamp: new Date()
      };

      this.cacheMetrics.set('redis', cacheMetrics);
    } catch (error: any) {
      logger.error('[PerformanceOptimizationService] Error collecting cache metrics:', error);
    }
  }

  /**
   * Parse Redis INFO output
   */
  private parseRedisInfo(info: string): Record<string, any> {
    const result: Record<string, any> = {};
    const lines = info.split('\r\n');
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        result[key] = isNaN(Number(value)) ? value : Number(value);
      }
    }
    
    return result;
  }

  /**
   * Setup database monitoring
   */
  private setupDatabaseMonitoring(): void {
    // Enable query logging
    this.prisma.$on('query', (e) => {
      if (e.duration > 1000) { // Log slow queries
        logger.warn(`Slow query detected: ${e.duration}ms - ${e.query}`);
      }
    });
  }

  /**
   * Setup cache monitoring
   */
  private setupCacheMonitoring(): void {
    // Monitor cache operations
    this.redis.on('error', (error) => {
      logger.error('[PerformanceOptimizationService] Redis error:', error);
    });
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get database metrics
   */
  public getDatabaseMetrics(): DatabaseMetrics[] {
    return Array.from(this.dbMetrics.values());
  }

  /**
   * Get cache metrics
   */
  public getCacheMetrics(): CacheMetrics[] {
    return Array.from(this.cacheMetrics.values());
  }

  /**
   * Generate optimization recommendations
   */
  public async generateOptimizationRecommendations(): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = [];

    // Analyze API performance
    const apiRecommendations = this.analyzeAPIPerformance();
    recommendations.push(...apiRecommendations);

    // Analyze database performance
    const dbRecommendations = this.analyzeDatabasePerformance();
    recommendations.push(...dbRecommendations);

    // Analyze cache performance
    const cacheRecommendations = this.analyzeCachePerformance();
    recommendations.push(...cacheRecommendations);

    // Sort by priority
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Analyze API performance
   */
  private analyzeAPIPerformance(): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    for (const [endpoint, metrics] of this.metrics) {
      // Check for slow endpoints
      if (metrics.p95ResponseTime > 2000) {
        recommendations.push({
          type: 'api',
          priority: 'high',
          title: `Slow API Endpoint: ${endpoint}`,
          description: `The ${endpoint} endpoint has a 95th percentile response time of ${metrics.p95ResponseTime.toFixed(2)}ms`,
          impact: 'High user impact due to slow response times',
          effort: 'medium',
          implementation: 'Optimize database queries, add caching, or implement pagination',
          estimatedImprovement: 50
        });
      }

      // Check for high error rates
      if (metrics.errorRate > 0.05) {
        recommendations.push({
          type: 'api',
          priority: 'critical',
          title: `High Error Rate: ${endpoint}`,
          description: `The ${endpoint} endpoint has an error rate of ${(metrics.errorRate * 100).toFixed(2)}%`,
          impact: 'Critical user impact due to failed requests',
          effort: 'high',
          implementation: 'Investigate and fix error causes, add better error handling',
          estimatedImprovement: 80
        });
      }

      // Check for low throughput
      if (metrics.throughput < 10) {
        recommendations.push({
          type: 'api',
          priority: 'medium',
          title: `Low Throughput: ${endpoint}`,
          description: `The ${endpoint} endpoint has low throughput of ${metrics.throughput.toFixed(2)} requests/second`,
          impact: 'Medium impact on system scalability',
          effort: 'medium',
          implementation: 'Optimize queries, add caching, or scale horizontally',
          estimatedImprovement: 30
        });
      }
    }

    return recommendations;
  }

  /**
   * Analyze database performance
   */
  private analyzeDatabasePerformance(): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    for (const [query, metrics] of this.dbMetrics) {
      // Check for slow queries
      if (metrics.averageExecutionTime > 1000) {
        recommendations.push({
          type: 'database',
          priority: 'high',
          title: `Slow Database Query`,
          description: `Query has average execution time of ${metrics.averageExecutionTime.toFixed(2)}ms`,
          impact: 'High impact on API response times',
          effort: 'medium',
          implementation: 'Add database indexes, optimize query structure, or add caching',
          estimatedImprovement: 60
        });
      }

      // Check for frequently executed queries
      if (metrics.executionCount > 10000) {
        recommendations.push({
          type: 'database',
          priority: 'medium',
          title: `Frequently Executed Query`,
          description: `Query executed ${metrics.executionCount} times`,
          impact: 'Medium impact on database performance',
          effort: 'low',
          implementation: 'Add query result caching or optimize query',
          estimatedImprovement: 40
        });
      }

      // Check for low index usage
      if (metrics.indexUsage < 50) {
        recommendations.push({
          type: 'database',
          priority: 'medium',
          title: `Low Index Usage`,
          description: `Query has low index usage of ${metrics.indexUsage.toFixed(2)}%`,
          impact: 'Medium impact on query performance',
          effort: 'low',
          implementation: 'Add appropriate database indexes',
          estimatedImprovement: 50
        });
      }
    }

    return recommendations;
  }

  /**
   * Analyze cache performance
   */
  private analyzeCachePerformance(): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    for (const [cache, metrics] of this.cacheMetrics) {
      // Check for low hit rate
      if (metrics.hitRate < 0.8) {
        recommendations.push({
          type: 'cache',
          priority: 'medium',
          title: `Low Cache Hit Rate`,
          description: `Cache has hit rate of ${(metrics.hitRate * 100).toFixed(2)}%`,
          impact: 'Medium impact on performance due to cache misses',
          effort: 'medium',
          implementation: 'Review cache keys, increase TTL, or improve cache strategy',
          estimatedImprovement: 30
        });
      }

      // Check for high eviction rate
      if (metrics.evictionRate > 0.1) {
        recommendations.push({
          type: 'cache',
          priority: 'high',
          title: `High Cache Eviction Rate`,
          description: `Cache has eviction rate of ${(metrics.evictionRate * 100).toFixed(2)}%`,
          impact: 'High impact on performance due to cache evictions',
          effort: 'low',
          implementation: 'Increase cache memory or optimize cache size',
          estimatedImprovement: 40
        });
      }

      // Check for high memory usage
      if (metrics.memoryUsage > 100 * 1024 * 1024) { // 100MB
        recommendations.push({
          type: 'cache',
          priority: 'medium',
          title: `High Cache Memory Usage`,
          description: `Cache uses ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB of memory`,
          impact: 'Medium impact on system resources',
          effort: 'low',
          implementation: 'Optimize cache data structure or reduce cache size',
          estimatedImprovement: 20
        });
      }
    }

    return recommendations;
  }

  /**
   * Optimize database queries
   */
  public async optimizeDatabaseQueries(): Promise<void> {
    try {
      // Add missing indexes
      await this.addMissingIndexes();
      
      // Update table statistics
      await this.updateTableStatistics();
      
      // Vacuum tables
      await this.vacuumTables();
      
      logger.info('[PerformanceOptimizationService] Database optimization completed');
    } catch (error: any) {
      logger.error('[PerformanceOptimizationService] Error optimizing database:', error);
    }
  }

  /**
   * Add missing indexes
   */
  private async addMissingIndexes(): Promise<void> {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_transactions_company_id ON transactions(company_id)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category)',
      'CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(company_id)',
      'CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id)',
      'CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)',
      'CREATE INDEX IF NOT EXISTS idx_invoices_paid_at ON invoices(paid_at)',
      'CREATE INDEX IF NOT EXISTS idx_expenses_company_id ON expenses(company_id)',
      'CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date)',
      'CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category)'
    ];

    for (const index of indexes) {
      try {
        await this.prisma.$executeRawUnsafe(index);
      } catch (error) {
        logger.warn(`[PerformanceOptimizationService] Failed to create index: ${index}`);
      }
    }
  }

  /**
   * Update table statistics
   */
  private async updateTableStatistics(): Promise<void> {
    try {
      await this.prisma.$executeRaw`ANALYZE`;
    } catch (error) {
      logger.warn('[PerformanceOptimizationService] Failed to update table statistics');
    }
  }

  /**
   * Vacuum tables
   */
  private async vacuumTables(): Promise<void> {
    try {
      await this.prisma.$executeRaw`VACUUM ANALYZE`;
    } catch (error) {
      logger.warn('[PerformanceOptimizationService] Failed to vacuum tables');
    }
  }

  /**
   * Optimize cache configuration
   */
  public async optimizeCacheConfiguration(): Promise<void> {
    try {
      // Set optimal Redis configuration
      await this.redis.config('SET', 'maxmemory-policy', 'allkeys-lru');
      await this.redis.config('SET', 'timeout', '300');
      await this.redis.config('SET', 'tcp-keepalive', '60');
      
      logger.info('[PerformanceOptimizationService] Cache optimization completed');
    } catch (error: any) {
      logger.error('[PerformanceOptimizationService] Error optimizing cache:', error);
    }
  }

  /**
   * Get performance summary
   */
  public getPerformanceSummary(): {
    apiMetrics: PerformanceMetrics[];
    databaseMetrics: DatabaseMetrics[];
    cacheMetrics: CacheMetrics[];
    recommendations: OptimizationRecommendation[];
  } {
    return {
      apiMetrics: this.getPerformanceMetrics(),
      databaseMetrics: this.getDatabaseMetrics(),
      cacheMetrics: this.getCacheMetrics(),
      recommendations: []
    };
  }

  /**
   * Cleanup
   */
  public async destroy(): Promise<void> {
    await this.prisma.$disconnect();
    await this.redis.quit();
  }
}

export default new PerformanceOptimizationService();









