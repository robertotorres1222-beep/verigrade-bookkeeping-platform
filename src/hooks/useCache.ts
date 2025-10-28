import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items in cache
  storage?: 'memory' | 'sessionStorage' | 'localStorage';
  keyPrefix?: string;
}

interface CacheItem<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize: number;
  private storage: 'memory' | 'sessionStorage' | 'localStorage';
  private keyPrefix: string;

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 100;
    this.storage = options.storage || 'memory';
    this.keyPrefix = options.keyPrefix || 'cache_';
  }

  private getStorageKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  private evictOldest(): void {
    if (this.cache.size === 0) return;
    
    let oldestKey = '';
    let oldestTimestamp = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  set<T>(key: string, value: T, ttl: number = 5 * 60 * 1000): void {
    const storageKey = this.getStorageKey(key);
    const item: CacheItem<T> = {
      value,
      timestamp: Date.now(),
      ttl
    };

    // Check if we need to evict items
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(storageKey, item);

    // Persist to storage if not memory
    if (this.storage !== 'memory') {
      try {
        const storageData = JSON.stringify(item);
        if (this.storage === 'sessionStorage') {
          sessionStorage.setItem(storageKey, storageData);
        } else {
          localStorage.setItem(storageKey, storageData);
        }
      } catch (error) {
        console.warn('Failed to persist cache item:', error);
      }
    }
  }

  get<T>(key: string): T | null {
    const storageKey = this.getStorageKey(key);
    let item = this.cache.get(storageKey);

    // Try to load from storage if not in memory
    if (!item && this.storage !== 'memory') {
      try {
        const storageData = this.storage === 'sessionStorage' 
          ? sessionStorage.getItem(storageKey)
          : localStorage.getItem(storageKey);
        
        if (storageData) {
          const parsedItem = JSON.parse(storageData);
          if (parsedItem) {
            item = parsedItem;
            this.cache.set(storageKey, item!);
          }
        }
      } catch (error) {
        console.warn('Failed to load cache item from storage:', error);
      }
    }

    if (!item) return null;

    // Check if expired
    if (this.isExpired(item)) {
      this.delete(key);
      return null;
    }

    return item.value;
  }

  delete(key: string): void {
    const storageKey = this.getStorageKey(key);
    this.cache.delete(storageKey);

    if (this.storage !== 'memory') {
      try {
        if (this.storage === 'sessionStorage') {
          sessionStorage.removeItem(storageKey);
        } else {
          localStorage.removeItem(storageKey);
        }
      } catch (error) {
        console.warn('Failed to delete cache item from storage:', error);
      }
    }
  }

  clear(): void {
    this.cache.clear();

    if (this.storage !== 'memory') {
      try {
        const keys = this.storage === 'sessionStorage' 
          ? Object.keys(sessionStorage)
          : Object.keys(localStorage);
        
        keys.forEach(key => {
          if (key.startsWith(this.keyPrefix)) {
            if (this.storage === 'sessionStorage') {
              sessionStorage.removeItem(key);
            } else {
              localStorage.removeItem(key);
            }
          }
        });
      } catch (error) {
        console.warn('Failed to clear cache from storage:', error);
      }
    }
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys()).map(key => key.replace(this.keyPrefix, ''));
  }
}

// Global cache instances
const memoryCache = new CacheManager({ storage: 'memory' });
const sessionCache = new CacheManager({ storage: 'sessionStorage' });
const persistentCache = new CacheManager({ storage: 'localStorage' });

// Hook for using cache
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<CacheManager>();

  // Initialize cache based on options
  useEffect(() => {
    if (options.storage === 'sessionStorage') {
      cacheRef.current = sessionCache;
    } else if (options.storage === 'localStorage') {
      cacheRef.current = persistentCache;
    } else {
      cacheRef.current = memoryCache;
    }
  }, [options.storage]);

  const fetchData = useCallback(async () => {
    if (!cacheRef.current) return;

    setLoading(true);
    setError(null);

    try {
      // Check cache first
      const cachedData = cacheRef.current.get<T>(key);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return;
      }

      // Fetch fresh data
      const freshData = await fetcher();
      
      // Cache the data
      cacheRef.current.set(key, freshData, options.ttl);
      setData(freshData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, options.ttl]);

  const invalidate = useCallback(() => {
    if (cacheRef.current) {
      cacheRef.current.delete(key);
    }
  }, [key]);

  const refresh = useCallback(() => {
    invalidate();
    fetchData();
  }, [invalidate, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    invalidate,
    refresh
  };
}

// Hook for API caching
export function useApiCache<T>(
  url: string,
  options: CacheOptions & { 
    params?: Record<string, any>;
    headers?: Record<string, string>;
  } = {}
) {
  const cacheKey = `${url}_${JSON.stringify(options.params || {})}`;
  
  const fetcher = useCallback(async () => {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }, [url, options.headers]);

  return useCache(cacheKey, fetcher, options);
}

// Hook for component-level caching
export function useComponentCache<T>(
  componentKey: string,
  data: T,
  options: CacheOptions = {}
) {
  const cacheRef = useRef<CacheManager>();

  useEffect(() => {
    if (options.storage === 'sessionStorage') {
      cacheRef.current = sessionCache;
    } else if (options.storage === 'localStorage') {
      cacheRef.current = persistentCache;
    } else {
      cacheRef.current = memoryCache;
    }
  }, [options.storage]);

  useEffect(() => {
    if (cacheRef.current && data) {
      cacheRef.current.set(componentKey, data, options.ttl);
    }
  }, [componentKey, data, options.ttl]);

  const getCachedData = useCallback(() => {
    return cacheRef.current?.get<T>(componentKey) || null;
  }, [componentKey]);

  const clearCache = useCallback(() => {
    cacheRef.current?.delete(componentKey);
  }, [componentKey]);

  return {
    getCachedData,
    clearCache
  };
}

// Hook for form data caching
export function useFormCache<T extends Record<string, any>>(
  formKey: string,
  initialData: T,
  options: CacheOptions = {}
) {
  const [formData, setFormData] = useState<T>(initialData);
  const cacheRef = useRef<CacheManager>();

  useEffect(() => {
    if (options.storage === 'sessionStorage') {
      cacheRef.current = sessionCache;
    } else if (options.storage === 'localStorage') {
      cacheRef.current = persistentCache;
    } else {
      cacheRef.current = memoryCache;
    }
  }, [options.storage]);

  // Load cached data on mount
  useEffect(() => {
    if (cacheRef.current) {
      const cachedData = cacheRef.current.get<T>(formKey);
      if (cachedData) {
        setFormData(cachedData);
      }
    }
  }, [formKey]);

  // Save data to cache on change
  useEffect(() => {
    if (cacheRef.current) {
      cacheRef.current.set(formKey, formData, options.ttl);
    }
  }, [formKey, formData, options.ttl]);

  const updateFormData = useCallback((updates: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const clearFormCache = useCallback(() => {
    cacheRef.current?.delete(formKey);
    setFormData(initialData);
  }, [formKey, initialData]);

  return {
    formData,
    updateFormData,
    clearFormCache
  };
}

// Cache utilities
export const cacheUtils = {
  memory: memoryCache,
  session: sessionCache,
  persistent: persistentCache,
  
  clearAll: () => {
    memoryCache.clear();
    sessionCache.clear();
    persistentCache.clear();
  },
  
  getStats: () => ({
    memory: memoryCache.size(),
    session: sessionCache.size(),
    persistent: persistentCache.size()
  }),
  
  preload: async <T>(key: string, fetcher: () => Promise<T>, options: CacheOptions = {}) => {
    const cache = options.storage === 'sessionStorage' ? sessionCache : 
                  options.storage === 'localStorage' ? persistentCache : memoryCache;
    
    try {
      const data = await fetcher();
      cache.set(key, data, options.ttl);
      return data;
    } catch (error) {
      console.warn('Failed to preload cache:', error);
      return null;
    }
  }
};

