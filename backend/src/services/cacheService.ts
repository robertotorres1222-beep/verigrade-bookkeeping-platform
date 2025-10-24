import Redis from 'ioredis';
import { logger } from '../utils/logger';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  serialize?: boolean; // Whether to serialize/deserialize data
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
}

class CacheService {
  private redis: Redis;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    hitRate: 0,
  };

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.redis.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    this.redis.on('error', (error) => {
      logger.error('Redis connection error:', error);
    });
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      
      if (value === null) {
        this.stats.misses++;
        this.updateHitRate();
        return null;
      }

      this.stats.hits++;
      this.updateHitRate();

      try {
        return JSON.parse(value);
      } catch {
        return value as T;
      }
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, options: CacheOptions = {}): Promise<boolean> {
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      const ttl = options.ttl || 3600; // Default 1 hour

      await this.redis.setex(key, ttl, serializedValue);

      // Add to tag sets if tags are provided
      if (options.tags && options.tags.length > 0) {
        await this.addToTags(key, options.tags);
      }

      this.stats.sets++;
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      const result = await this.redis.del(key);
      this.stats.deletes++;
      return result > 0;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Delete multiple keys
   */
  async deleteMany(keys: string[]): Promise<number> {
    try {
      if (keys.length === 0) return 0;
      const result = await this.redis.del(...keys);
      this.stats.deletes += result;
      return result;
    } catch (error) {
      logger.error('Cache delete many error:', error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Get multiple values
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await this.redis.mget(...keys);
      
      return values.map(value => {
        if (value === null) {
          this.stats.misses++;
          return null;
        }
        
        this.stats.hits++;
        try {
          return JSON.parse(value);
        } catch {
          return value as T;
        }
      });
    } catch (error) {
      logger.error('Cache mget error:', error);
      return keys.map(() => null);
    } finally {
      this.updateHitRate();
    }
  }

  /**
   * Set multiple values
   */
  async mset(keyValuePairs: Record<string, any>, options: CacheOptions = {}): Promise<boolean> {
    try {
      const serializedPairs: string[] = [];
      
      for (const [key, value] of Object.entries(keyValuePairs)) {
        const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
        serializedPairs.push(key, serializedValue);
      }

      await this.redis.mset(...serializedPairs);

      // Set TTL for all keys
      if (options.ttl) {
        const pipeline = this.redis.pipeline();
        for (const key of Object.keys(keyValuePairs)) {
          pipeline.expire(key, options.ttl);
        }
        await pipeline.exec();
      }

      // Add to tag sets if tags are provided
      if (options.tags && options.tags.length > 0) {
        for (const key of Object.keys(keyValuePairs)) {
          await this.addToTags(key, options.tags);
        }
      }

      this.stats.sets += Object.keys(keyValuePairs).length;
      return true;
    } catch (error) {
      logger.error('Cache mset error:', error);
      return false;
    }
  }

  /**
   * Increment a numeric value
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      const result = await this.redis.incrby(key, amount);
      return result;
    } catch (error) {
      logger.error('Cache increment error:', error);
      return 0;
    }
  }

  /**
   * Decrement a numeric value
   */
  async decrement(key: string, amount: number = 1): Promise<number> {
    try {
      const result = await this.redis.decrby(key, amount);
      return result;
    } catch (error) {
      logger.error('Cache decrement error:', error);
      return 0;
    }
  }

  /**
   * Set expiration for a key
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const result = await this.redis.expire(key, ttl);
      return result === 1;
    } catch (error) {
      logger.error('Cache expire error:', error);
      return false;
    }
  }

  /**
   * Get TTL for a key
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      logger.error('Cache TTL error:', error);
      return -1;
    }
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    try {
      let totalDeleted = 0;
      
      for (const tag of tags) {
        const tagKey = `tag:${tag}`;
        const keys = await this.redis.smembers(tagKey);
        
        if (keys.length > 0) {
          const deleted = await this.redis.del(...keys);
          totalDeleted += deleted;
        }
        
        // Clean up the tag set
        await this.redis.del(tagKey);
      }

      this.stats.deletes += totalDeleted;
      return totalDeleted;
    } catch (error) {
      logger.error('Cache invalidate by tags error:', error);
      return 0;
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<boolean> {
    try {
      await this.redis.flushdb();
      this.stats = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        hitRate: 0,
      };
      return true;
    } catch (error) {
      logger.error('Cache clear error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      hitRate: 0,
    };
  }

  /**
   * Get cache keys by pattern
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.redis.keys(pattern);
    } catch (error) {
      logger.error('Cache keys error:', error);
      return [];
    }
  }

  /**
   * Get cache size
   */
  async size(): Promise<number> {
    try {
      return await this.redis.dbsize();
    } catch (error) {
      logger.error('Cache size error:', error);
      return 0;
    }
  }

  /**
   * Cache-aside pattern implementation
   */
  async cacheAside<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // If not in cache, fetch from source
    const data = await fetchFn();
    
    // Store in cache
    await this.set(key, data, options);
    
    return data;
  }

  /**
   * Write-through pattern implementation
   */
  async writeThrough<T>(
    key: string,
    value: T,
    writeFn: (value: T) => Promise<void>,
    options: CacheOptions = {}
  ): Promise<void> {
    // Write to source first
    await writeFn(value);
    
    // Then write to cache
    await this.set(key, value, options);
  }

  /**
   * Write-behind pattern implementation
   */
  async writeBehind<T>(
    key: string,
    value: T,
    writeFn: (value: T) => Promise<void>,
    options: CacheOptions = {}
  ): Promise<void> {
    // Write to cache immediately
    await this.set(key, value, options);
    
    // Schedule write to source (in production, use a queue)
    setImmediate(async () => {
      try {
        await writeFn(value);
      } catch (error) {
        logger.error('Write-behind error:', error);
        // In production, you might want to retry or alert
      }
    });
  }

  /**
   * Add key to tag sets
   */
  private async addToTags(key: string, tags: string[]): Promise<void> {
    const pipeline = this.redis.pipeline();
    
    for (const tag of tags) {
      const tagKey = `tag:${tag}`;
      pipeline.sadd(tagKey, key);
      pipeline.expire(tagKey, 86400); // Tag sets expire in 24 hours
    }
    
    await pipeline.exec();
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    try {
      await this.redis.quit();
      logger.info('Redis connection closed');
    } catch (error) {
      logger.error('Error closing Redis connection:', error);
    }
  }
}

// Create singleton instance
export const cacheService = new CacheService();

export default CacheService;







