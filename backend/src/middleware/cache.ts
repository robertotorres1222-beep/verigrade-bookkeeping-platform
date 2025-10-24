import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cacheService';
import { logger } from '../utils/logger';

export interface CacheMiddlewareOptions {
  ttl?: number;
  tags?: string[];
  keyGenerator?: (req: Request) => string;
  skipCache?: (req: Request) => boolean;
  varyBy?: string[]; // Headers to vary cache by
}

/**
 * Cache middleware for GET requests
 */
export const cache = (options: CacheMiddlewareOptions = {}) => {
  const {
    ttl = 3600, // 1 hour default
    tags = [],
    keyGenerator = defaultKeyGenerator,
    skipCache = () => false,
    varyBy = ['authorization'],
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip cache if specified
    if (skipCache(req)) {
      return next();
    }

    try {
      const cacheKey = keyGenerator(req);
      
      // Check if we have a cached response
      const cached = await cacheService.get(cacheKey);
      
      if (cached) {
        logger.debug(`Cache hit for key: ${cacheKey}`);
        
        // Set cache headers
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-Key', cacheKey);
        
        return res.json(cached);
      }

      // Cache miss - continue to handler
      logger.debug(`Cache miss for key: ${cacheKey}`);
      
      // Override res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = function(body: any) {
        // Cache the response
        cacheService.set(cacheKey, body, { ttl, tags }).catch(error => {
          logger.error('Failed to cache response:', error);
        });
        
        // Set cache headers
        res.set('X-Cache', 'MISS');
        res.set('X-Cache-Key', cacheKey);
        
        return originalJson(body);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Cache invalidation middleware
 */
export const invalidateCache = (tags: string[] = []) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Override res.json to invalidate cache after successful operations
    const originalJson = res.json.bind(res);
    
    res.json = function(body: any) {
      // Only invalidate on successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheService.invalidateByTags(tags).catch(error => {
          logger.error('Failed to invalidate cache:', error);
        });
      }
      
      return originalJson(body);
    };

    next();
  };
};

/**
 * Cache warming middleware
 */
export const warmCache = (key: string, fetchFn: () => Promise<any>, ttl: number = 3600) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cached = await cacheService.get(key);
      
      if (!cached) {
        logger.info(`Warming cache for key: ${key}`);
        const data = await fetchFn();
        await cacheService.set(key, data, { ttl });
      }
    } catch (error) {
      logger.error('Cache warming error:', error);
    }
    
    next();
  };
};

/**
 * Rate limiting with cache
 */
export const rateLimitWithCache = (options: {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
}) => {
  const { windowMs, max, keyGenerator = defaultKeyGenerator, skipSuccessfulRequests = false } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = `rate_limit:${keyGenerator(req)}`;
      const current = await cacheService.increment(key);
      
      // Set expiration on first request
      if (current === 1) {
        await cacheService.expire(key, Math.ceil(windowMs / 1000));
      }
      
      if (current > max) {
        return res.status(429).json({
          error: 'Too Many Requests',
          retryAfter: Math.ceil(windowMs / 1000),
        });
      }
      
      // Set rate limit headers
      res.set('X-RateLimit-Limit', max.toString());
      res.set('X-RateLimit-Remaining', Math.max(0, max - current).toString());
      res.set('X-RateLimit-Reset', new Date(Date.now() + windowMs).toISOString());
      
      next();
    } catch (error) {
      logger.error('Rate limit error:', error);
      next();
    }
  };
};

/**
 * Session storage with cache
 */
export const sessionCache = (options: { ttl?: number } = {}) => {
  const { ttl = 86400 } = options; // 24 hours default

  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.sessionID) {
      return next();
    }

    const sessionKey = `session:${req.sessionID}`;
    
    try {
      // Try to get session from cache
      const cachedSession = await cacheService.get(sessionKey);
      
      if (cachedSession) {
        req.session = { ...req.session, ...cachedSession };
      }
      
      // Override session save to cache
      const originalSave = req.session.save;
      req.session.save = function(callback?: (err?: any) => void) {
        cacheService.set(sessionKey, req.session, { ttl }).catch(error => {
          logger.error('Failed to cache session:', error);
        });
        
        if (originalSave) {
          return originalSave.call(this, callback);
        }
        
        if (callback) callback();
      };
      
      next();
    } catch (error) {
      logger.error('Session cache error:', error);
      next();
    }
  };
};

/**
 * Default cache key generator
 */
function defaultKeyGenerator(req: Request): string {
  const { method, url, query } = req;
  const userId = (req as any).user?.id || 'anonymous';
  
  // Create a hash of the request
  const queryString = new URLSearchParams(query as any).toString();
  const baseKey = `${method}:${url}${queryString ? `?${queryString}` : ''}`;
  
  // Include user ID in key for user-specific caching
  return `cache:${userId}:${Buffer.from(baseKey).toString('base64')}`;
}

/**
 * Cache control headers middleware
 */
export const cacheControl = (maxAge: number = 3600, mustRevalidate: boolean = false) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const cacheControl = mustRevalidate 
      ? `public, max-age=${maxAge}, must-revalidate`
      : `public, max-age=${maxAge}`;
    
    res.set('Cache-Control', cacheControl);
    res.set('Expires', new Date(Date.now() + maxAge * 1000).toUTCString());
    
    next();
  };
};

/**
 * ETag middleware for conditional requests
 */
export const etag = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    
    res.json = function(body: any) {
      // Generate ETag from response body
      const etag = `"${Buffer.from(JSON.stringify(body)).toString('base64').slice(0, 16)}"`;
      
      // Check if client has the same ETag
      const clientETag = req.headers['if-none-match'];
      if (clientETag === etag) {
        return res.status(304).end();
      }
      
      res.set('ETag', etag);
      return originalJson(body);
    };
    
    next();
  };
};

/**
 * Cache statistics middleware
 */
export const cacheStats = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/cache/stats') {
      const stats = cacheService.getStats();
      return res.json({
        cache: stats,
        timestamp: new Date().toISOString(),
      });
    }
    
    next();
  };
};






