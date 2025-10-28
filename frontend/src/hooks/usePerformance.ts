import { useEffect, useRef, useState, useCallback } from 'react';

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  networkRequests: number;
  cacheHits: number;
  cacheMisses: number;
}

export interface PerformanceConfig {
  enableMetrics: boolean;
  sampleRate: number;
  reportInterval: number;
  maxMetrics: number;
}

const defaultConfig: PerformanceConfig = {
  enableMetrics: true,
  sampleRate: 1.0,
  reportInterval: 30000, // 30 seconds
  maxMetrics: 1000,
};

export const usePerformance = (config: Partial<PerformanceConfig> = {}) => {
  const finalConfig = { ...defaultConfig, ...config };
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
  });
  
  const startTime = useRef<number>(Date.now());
  const renderStartTime = useRef<number>(0);
  const networkRequests = useRef<number>(0);
  const cacheHits = useRef<number>(0);
  const cacheMisses = useRef<number>(0);
  const observerRef = useRef<PerformanceObserver | null>(null);

  // Measure component render time
  const measureRender = useCallback((callback: () => void) => {
    renderStartTime.current = performance.now();
    callback();
    
    requestAnimationFrame(() => {
      const renderTime = performance.now() - renderStartTime.current;
      setMetrics(prev => ({ ...prev, renderTime }));
    });
  }, []);

  // Measure async operations
  const measureAsync = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    const start = performance.now();
    
    try {
      const result = await operation();
      const duration = performance.now() - start;
      
      console.log(`${operationName} completed in ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`${operationName} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }, []);

  // Track network requests
  const trackNetworkRequest = useCallback(() => {
    networkRequests.current += 1;
    setMetrics(prev => ({ ...prev, networkRequests: networkRequests.current }));
  }, []);

  // Track cache hits/misses
  const trackCacheHit = useCallback(() => {
    cacheHits.current += 1;
    setMetrics(prev => ({ ...prev, cacheHits: cacheHits.current }));
  }, []);

  const trackCacheMiss = useCallback(() => {
    cacheMisses.current += 1;
    setMetrics(prev => ({ ...prev, cacheMisses: cacheMisses.current }));
  }, []);

  // Get memory usage (if available)
  const getMemoryUsage = useCallback((): number => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }, []);

  // Setup performance monitoring
  useEffect(() => {
    if (!finalConfig.enableMetrics) return;

    // Measure initial load time
    const loadTime = Date.now() - startTime.current;
    setMetrics(prev => ({ ...prev, loadTime }));

    // Setup performance observer for navigation timing
    if ('PerformanceObserver' in window) {
      observerRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            console.log('Navigation timing:', {
              domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
              totalTime: navEntry.loadEventEnd - navEntry.fetchStart,
            });
          }
        });
      });

      observerRef.current.observe({ entryTypes: ['navigation', 'measure', 'mark'] });
    }

    // Monitor memory usage
    const updateMemoryUsage = () => {
      const memoryUsage = getMemoryUsage();
      setMetrics(prev => ({ ...prev, memoryUsage }));
    };

    const memoryInterval = setInterval(updateMemoryUsage, 5000);

    // Report metrics periodically
    const reportInterval = setInterval(() => {
      console.log('Performance Metrics:', metrics);
      
      // Send metrics to analytics service
      if (window.gtag) {
        window.gtag('event', 'performance_metrics', {
          load_time: metrics.loadTime,
          render_time: metrics.renderTime,
          memory_usage: metrics.memoryUsage,
          network_requests: metrics.networkRequests,
          cache_hit_rate: metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses) || 0,
        });
      }
    }, finalConfig.reportInterval);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      clearInterval(memoryInterval);
      clearInterval(reportInterval);
    };
  }, [finalConfig, metrics, getMemoryUsage]);

  // Performance optimization utilities
  const debounce = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): T => {
    let timeoutId: NodeJS.Timeout;
    
    return ((...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
  }, []);

  const throttle = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): T => {
    let lastCall = 0;
    
    return ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return func(...args);
      }
    }) as T;
  }, []);

  const memoize = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    keyGenerator?: (...args: Parameters<T>) => string
  ): T => {
    const cache = new Map<string, ReturnType<T>>();
    
    return ((...args: Parameters<T>) => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      
      if (cache.has(key)) {
        trackCacheHit();
        return cache.get(key);
      }
      
      trackCacheMiss();
      const result = func(...args);
      cache.set(key, result);
      return result;
    }) as T;
  }, [trackCacheHit, trackCacheMiss]);

  // Lazy loading utility
  const useLazyLoad = useCallback((
    importFn: () => Promise<any>,
    fallback?: React.ComponentType
  ) => {
    const [Component, setComponent] = useState<React.ComponentType | null>(fallback || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const loadComponent = useCallback(async () => {
      if (Component && Component !== fallback) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const module = await importFn();
        const component = module.default || module;
        setComponent(() => component);
      } catch (err) {
        setError(err as Error);
        console.error('Lazy loading error:', err);
      } finally {
        setLoading(false);
      }
    }, [Component, fallback, importFn]);

    return { Component, loading, error, loadComponent };
  }, []);

  // Image optimization
  const optimizeImage = useCallback((
    src: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpeg' | 'png';
    } = {}
  ): string => {
    const { width, height, quality = 80, format = 'webp' } = options;
    
    // In a real implementation, you would use an image optimization service
    // like Cloudinary, ImageKit, or Next.js Image Optimization
    const params = new URLSearchParams();
    
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('q', quality.toString());
    params.set('f', format);
    
    return `${src}?${params.toString()}`;
  }, []);

  // Bundle size analysis
  const analyzeBundleSize = useCallback(() => {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      const jsFiles = resources.filter(resource => 
        resource.name.includes('.js') && !resource.name.includes('node_modules')
      );
      
      const totalSize = jsFiles.reduce((total, file) => total + file.transferSize, 0);
      
      console.log('Bundle Analysis:', {
        totalJSSize: totalSize,
        jsFiles: jsFiles.length,
        averageFileSize: totalSize / jsFiles.length,
        largestFiles: jsFiles
          .sort((a, b) => b.transferSize - a.transferSize)
          .slice(0, 5)
          .map(file => ({
            name: file.name.split('/').pop(),
            size: file.transferSize,
          })),
      });
    }
  }, []);

  return {
    metrics,
    measureRender,
    measureAsync,
    trackNetworkRequest,
    trackCacheHit,
    trackCacheMiss,
    debounce,
    throttle,
    memoize,
    useLazyLoad,
    optimizeImage,
    analyzeBundleSize,
  };
};










