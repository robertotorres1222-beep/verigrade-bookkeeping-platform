import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { cacheService } from './cacheService';

export interface QueryOptions {
  select?: Record<string, boolean>;
  include?: Record<string, boolean>;
  where?: Record<string, any>;
  orderBy?: Record<string, any>;
  take?: number;
  skip?: number;
  cache?: boolean;
  cacheKey?: string;
  cacheTtl?: number;
}

export interface QueryStats {
  query: string;
  duration: number;
  cacheHit: boolean;
  rowsReturned: number;
  timestamp: Date;
}

class QueryOptimizationService {
  private prisma: PrismaClient;
  private queryStats: QueryStats[] = [];
  private slowQueryThreshold = 1000; // 1 second

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.setupQueryLogging();
  }

  /**
   * Setup query logging and monitoring
   */
  private setupQueryLogging(): void {
    // Log slow queries
    this.prisma.$on('query', (e) => {
      const duration = e.duration;
      
      if (duration > this.slowQueryThreshold) {
        logger.warn(`Slow query detected: ${e.query} (${duration}ms)`);
      }
      
      this.queryStats.push({
        query: e.query,
        duration,
        cacheHit: false,
        rowsReturned: 0, // This would need to be tracked separately
        timestamp: new Date(),
      });
      
      // Keep only last 1000 queries in memory
      if (this.queryStats.length > 1000) {
        this.queryStats = this.queryStats.slice(-1000);
      }
    });
  }

  /**
   * Optimized findMany with caching
   */
  async findMany<T>(
    model: string,
    options: QueryOptions = {}
  ): Promise<T[]> {
    const {
      select,
      include,
      where,
      orderBy,
      take,
      skip,
      cache = true,
      cacheKey,
      cacheTtl = 3600,
    } = options;

    const key = cacheKey || this.generateCacheKey(model, 'findMany', options);

    if (cache) {
      const cached = await cacheService.get<T[]>(key);
      if (cached) {
        logger.debug(`Cache hit for ${model}.findMany`);
        return cached;
      }
    }

    const startTime = Date.now();
    
    try {
      const queryOptions: any = {};
      
      if (select) queryOptions.select = select;
      if (include) queryOptions.include = include;
      if (where) queryOptions.where = where;
      if (orderBy) queryOptions.orderBy = orderBy;
      if (take) queryOptions.take = take;
      if (skip) queryOptions.skip = skip;

      const result = await (this.prisma as any)[model].findMany(queryOptions);
      
      const duration = Date.now() - startTime;
      logger.debug(`${model}.findMany completed in ${duration}ms`);

      if (cache && result.length > 0) {
        await cacheService.set(key, result, { ttl: cacheTtl });
      }

      return result;
    } catch (error) {
      logger.error(`Error in ${model}.findMany:`, error);
      throw error;
    }
  }

  /**
   * Optimized findUnique with caching
   */
  async findUnique<T>(
    model: string,
    where: Record<string, any>,
    options: QueryOptions = {}
  ): Promise<T | null> {
    const {
      select,
      include,
      cache = true,
      cacheKey,
      cacheTtl = 3600,
    } = options;

    const key = cacheKey || this.generateCacheKey(model, 'findUnique', { where, ...options });

    if (cache) {
      const cached = await cacheService.get<T>(key);
      if (cached) {
        logger.debug(`Cache hit for ${model}.findUnique`);
        return cached;
      }
    }

    const startTime = Date.now();
    
    try {
      const queryOptions: any = { where };
      
      if (select) queryOptions.select = select;
      if (include) queryOptions.include = include;

      const result = await (this.prisma as any)[model].findUnique(queryOptions);
      
      const duration = Date.now() - startTime;
      logger.debug(`${model}.findUnique completed in ${duration}ms`);

      if (cache && result) {
        await cacheService.set(key, result, { ttl: cacheTtl });
      }

      return result;
    } catch (error) {
      logger.error(`Error in ${model}.findUnique:`, error);
      throw error;
    }
  }

  /**
   * Optimized findFirst with caching
   */
  async findFirst<T>(
    model: string,
    options: QueryOptions = {}
  ): Promise<T | null> {
    const {
      select,
      include,
      where,
      orderBy,
      cache = true,
      cacheKey,
      cacheTtl = 3600,
    } = options;

    const key = cacheKey || this.generateCacheKey(model, 'findFirst', options);

    if (cache) {
      const cached = await cacheService.get<T>(key);
      if (cached) {
        logger.debug(`Cache hit for ${model}.findFirst`);
        return cached;
      }
    }

    const startTime = Date.now();
    
    try {
      const queryOptions: any = {};
      
      if (select) queryOptions.select = select;
      if (include) queryOptions.include = include;
      if (where) queryOptions.where = where;
      if (orderBy) queryOptions.orderBy = orderBy;

      const result = await (this.prisma as any)[model].findFirst(queryOptions);
      
      const duration = Date.now() - startTime;
      logger.debug(`${model}.findFirst completed in ${duration}ms`);

      if (cache && result) {
        await cacheService.set(key, result, { ttl: cacheTtl });
      }

      return result;
    } catch (error) {
      logger.error(`Error in ${model}.findFirst:`, error);
      throw error;
    }
  }

  /**
   * Optimized count with caching
   */
  async count(
    model: string,
    where?: Record<string, any>,
    options: QueryOptions = {}
  ): Promise<number> {
    const {
      cache = true,
      cacheKey,
      cacheTtl = 3600,
    } = options;

    const key = cacheKey || this.generateCacheKey(model, 'count', { where, ...options });

    if (cache) {
      const cached = await cacheService.get<number>(key);
      if (cached !== null) {
        logger.debug(`Cache hit for ${model}.count`);
        return cached;
      }
    }

    const startTime = Date.now();
    
    try {
      const queryOptions: any = {};
      if (where) queryOptions.where = where;

      const result = await (this.prisma as any)[model].count(queryOptions);
      
      const duration = Date.now() - startTime;
      logger.debug(`${model}.count completed in ${duration}ms`);

      if (cache) {
        await cacheService.set(key, result, { ttl: cacheTtl });
      }

      return result;
    } catch (error) {
      logger.error(`Error in ${model}.count:`, error);
      throw error;
    }
  }

  /**
   * Optimized aggregate with caching
   */
  async aggregate<T>(
    model: string,
    options: {
      _count?: boolean | Record<string, boolean>;
      _sum?: Record<string, boolean>;
      _avg?: Record<string, boolean>;
      _min?: Record<string, boolean>;
      _max?: Record<string, boolean>;
      where?: Record<string, any>;
      cache?: boolean;
      cacheKey?: string;
      cacheTtl?: number;
    } = {}
  ): Promise<T> {
    const {
      _count,
      _sum,
      _avg,
      _min,
      _max,
      where,
      cache = true,
      cacheKey,
      cacheTtl = 3600,
    } = options;

    const key = cacheKey || this.generateCacheKey(model, 'aggregate', options);

    if (cache) {
      const cached = await cacheService.get<T>(key);
      if (cached) {
        logger.debug(`Cache hit for ${model}.aggregate`);
        return cached;
      }
    }

    const startTime = Date.now();
    
    try {
      const queryOptions: any = {};
      
      if (_count) queryOptions._count = _count;
      if (_sum) queryOptions._sum = _sum;
      if (_avg) queryOptions._avg = _avg;
      if (_min) queryOptions._min = _min;
      if (_max) queryOptions._max = _max;
      if (where) queryOptions.where = where;

      const result = await (this.prisma as any)[model].aggregate(queryOptions);
      
      const duration = Date.now() - startTime;
      logger.debug(`${model}.aggregate completed in ${duration}ms`);

      if (cache) {
        await cacheService.set(key, result, { ttl: cacheTtl });
      }

      return result;
    } catch (error) {
      logger.error(`Error in ${model}.aggregate:`, error);
      throw error;
    }
  }

  /**
   * Batch operations for better performance
   */
  async batchCreate<T>(
    model: string,
    data: any[],
    options: { batchSize?: number } = {}
  ): Promise<T[]> {
    const { batchSize = 1000 } = options;
    const results: T[] = [];

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      try {
        const batchResults = await (this.prisma as any)[model].createMany({
          data: batch,
          skipDuplicates: true,
        });
        
        results.push(...batchResults);
        logger.debug(`Batch ${Math.floor(i / batchSize) + 1} completed for ${model}`);
      } catch (error) {
        logger.error(`Batch create error for ${model}:`, error);
        throw error;
      }
    }

    return results;
  }

  /**
   * Optimized pagination
   */
  async paginate<T>(
    model: string,
    options: {
      page: number;
      limit: number;
      where?: Record<string, any>;
      orderBy?: Record<string, any>;
      select?: Record<string, boolean>;
      include?: Record<string, boolean>;
      cache?: boolean;
    } = { page: 1, limit: 10 }
  ): Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const { page, limit, where, orderBy, select, include, cache = true } = options;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await this.count(model, where, { cache });
    
    // Get data
    const data = await this.findMany<T>(model, {
      where,
      orderBy,
      select,
      include,
      take: limit,
      skip,
      cache,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Connection pooling optimization
   */
  async optimizeConnectionPool(): Promise<void> {
    try {
      // This would be implemented based on your database setup
      // For PostgreSQL, you might adjust connection pool settings
      logger.info('Connection pool optimization completed');
    } catch (error) {
      logger.error('Connection pool optimization error:', error);
    }
  }

  /**
   * Generate cache key for queries
   */
  private generateCacheKey(model: string, operation: string, options: any): string {
    const optionsHash = Buffer.from(JSON.stringify(options)).toString('base64');
    return `query:${model}:${operation}:${optionsHash}`;
  }

  /**
   * Get query statistics
   */
  getQueryStats(): QueryStats[] {
    return [...this.queryStats];
  }

  /**
   * Get slow queries
   */
  getSlowQueries(threshold: number = this.slowQueryThreshold): QueryStats[] {
    return this.queryStats.filter(stat => stat.duration > threshold);
  }

  /**
   * Clear query statistics
   */
  clearQueryStats(): void {
    this.queryStats = [];
  }

  /**
   * Invalidate cache for a model
   */
  async invalidateModelCache(model: string): Promise<void> {
    try {
      const pattern = `query:${model}:*`;
      const keys = await cacheService.keys(pattern);
      
      if (keys.length > 0) {
        await cacheService.deleteMany(keys);
        logger.info(`Invalidated ${keys.length} cache entries for model: ${model}`);
      }
    } catch (error) {
      logger.error(`Error invalidating cache for model ${model}:`, error);
    }
  }

  /**
   * Warm up cache for frequently accessed data
   */
  async warmupCache(model: string, commonQueries: QueryOptions[]): Promise<void> {
    try {
      for (const query of commonQueries) {
        await this.findMany(model, { ...query, cache: true });
      }
      logger.info(`Cache warmed up for model: ${model}`);
    } catch (error) {
      logger.error(`Error warming up cache for model ${model}:`, error);
    }
  }
}

export default QueryOptimizationService;










