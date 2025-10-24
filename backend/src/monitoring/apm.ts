import { createClient } from '@newrelic/apollo-server-plugin';
import { createPrometheusMetrics } from './prometheus';

// New Relic APM Configuration
export const newRelicConfig = {
  appName: process.env.NEW_RELIC_APP_NAME || 'VeriGrade-Bookkeeping',
  licenseKey: process.env.NEW_RELIC_LICENSE_KEY,
  distributedTracing: {
    enabled: true,
  },
  logging: {
    level: process.env.NEW_RELIC_LOG_LEVEL || 'info',
  },
  attributes: {
    exclude: ['request.headers.cookie', 'request.headers.authorization'],
  },
};

// Datadog APM Configuration
export const datadogConfig = {
  service: 'verigrade-bookkeeping',
  env: process.env.NODE_ENV || 'development',
  version: process.env.npm_package_version || '1.0.0',
  tags: {
    team: 'backend',
    component: 'api',
  },
};

// Custom APM Metrics
export class APMMetrics {
  private static instance: APMMetrics;
  private metrics: Map<string, number> = new Map();
  private counters: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();

  static getInstance(): APMMetrics {
    if (!APMMetrics.instance) {
      APMMetrics.instance = new APMMetrics();
    }
    return APMMetrics.instance;
  }

  // Record custom metric
  recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    this.metrics.set(name, value);
    
    // Send to New Relic if configured
    if (process.env.NEW_RELIC_LICENSE_KEY) {
      // New Relic custom metrics
      console.log(`New Relic Metric: ${name}=${value}`, tags);
    }

    // Send to Datadog if configured
    if (process.env.DATADOG_API_KEY) {
      // Datadog custom metrics
      console.log(`Datadog Metric: ${name}=${value}`, tags);
    }
  }

  // Increment counter
  incrementCounter(name: string, value: number = 1, tags?: Record<string, string>): void {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, current + value);
    
    console.log(`Counter: ${name} incremented by ${value}`, tags);
  }

  // Record histogram
  recordHistogram(name: string, value: number, tags?: Record<string, string>): void {
    const current = this.histograms.get(name) || [];
    current.push(value);
    this.histograms.set(name, current);
    
    console.log(`Histogram: ${name} recorded ${value}`, tags);
  }

  // Get all metrics
  getAllMetrics(): Record<string, any> {
    return {
      metrics: Object.fromEntries(this.metrics),
      counters: Object.fromEntries(this.counters),
      histograms: Object.fromEntries(this.histograms),
    };
  }

  // Reset metrics
  reset(): void {
    this.metrics.clear();
    this.counters.clear();
    this.histograms.clear();
  }
}

// Business Metrics
export class BusinessMetrics {
  private apm: APMMetrics;

  constructor() {
    this.apm = APMMetrics.getInstance();
  }

  // Track user registrations
  trackUserRegistration(userId: string, source: string): void {
    this.apm.incrementCounter('user.registration', 1, { source });
    this.apm.recordMetric('user.total_registrations', 1);
  }

  // Track user logins
  trackUserLogin(userId: string, method: string): void {
    this.apm.incrementCounter('user.login', 1, { method });
    this.apm.recordMetric('user.active_sessions', 1);
  }

  // Track transaction creation
  trackTransactionCreated(userId: string, amount: number, type: string): void {
    this.apm.incrementCounter('transaction.created', 1, { type });
    this.apm.recordHistogram('transaction.amount', amount, { type });
    this.apm.recordMetric('transaction.total_value', amount);
  }

  // Track invoice creation
  trackInvoiceCreated(userId: string, amount: number, status: string): void {
    this.apm.incrementCounter('invoice.created', 1, { status });
    this.apm.recordHistogram('invoice.amount', amount, { status });
    this.apm.recordMetric('invoice.total_value', amount);
  }

  // Track expense creation
  trackExpenseCreated(userId: string, amount: number, category: string): void {
    this.apm.incrementCounter('expense.created', 1, { category });
    this.apm.recordHistogram('expense.amount', amount, { category });
    this.apm.recordMetric('expense.total_value', amount);
  }

  // Track file uploads
  trackFileUpload(userId: string, fileSize: number, fileType: string): void {
    this.apm.incrementCounter('file.uploaded', 1, { type: fileType });
    this.apm.recordHistogram('file.size', fileSize, { type: fileType });
    this.apm.recordMetric('file.total_size', fileSize);
  }

  // Track API usage
  trackAPIUsage(endpoint: string, method: string, responseTime: number, statusCode: number): void {
    this.apm.incrementCounter('api.requests', 1, { endpoint, method, status: statusCode.toString() });
    this.apm.recordHistogram('api.response_time', responseTime, { endpoint, method });
    
    if (statusCode >= 400) {
      this.apm.incrementCounter('api.errors', 1, { endpoint, method, status: statusCode.toString() });
    }
  }

  // Track database operations
  trackDatabaseOperation(operation: string, table: string, duration: number): void {
    this.apm.incrementCounter('database.operations', 1, { operation, table });
    this.apm.recordHistogram('database.duration', duration, { operation, table });
  }

  // Track cache operations
  trackCacheOperation(operation: string, hit: boolean): void {
    this.apm.incrementCounter('cache.operations', 1, { operation, hit: hit.toString() });
    if (hit) {
      this.apm.incrementCounter('cache.hits', 1, { operation });
    } else {
      this.apm.incrementCounter('cache.misses', 1, { operation });
    }
  }

  // Track external API calls
  trackExternalAPICall(service: string, endpoint: string, duration: number, statusCode: number): void {
    this.apm.incrementCounter('external.api.calls', 1, { service, status: statusCode.toString() });
    this.apm.recordHistogram('external.api.duration', duration, { service });
    
    if (statusCode >= 400) {
      this.apm.incrementCounter('external.api.errors', 1, { service, status: statusCode.toString() });
    }
  }

  // Track payment processing
  trackPaymentProcessed(userId: string, amount: number, currency: string, status: string): void {
    this.apm.incrementCounter('payment.processed', 1, { currency, status });
    this.apm.recordHistogram('payment.amount', amount, { currency, status });
    this.apm.recordMetric('payment.total_value', amount);
  }

  // Track subscription events
  trackSubscriptionEvent(userId: string, event: string, plan: string): void {
    this.apm.incrementCounter('subscription.events', 1, { event, plan });
    this.apm.recordMetric('subscription.active_subscriptions', 1);
  }

  // Track feature usage
  trackFeatureUsage(userId: string, feature: string, action: string): void {
    this.apm.incrementCounter('feature.usage', 1, { feature, action });
    this.apm.recordMetric('feature.active_users', 1);
  }

  // Track performance metrics
  trackPerformanceMetric(metric: string, value: number, tags?: Record<string, string>): void {
    this.apm.recordMetric(`performance.${metric}`, value, tags);
  }

  // Track error rates
  trackError(error: string, context: string, severity: string): void {
    this.apm.incrementCounter('errors.total', 1, { error, context, severity });
    this.apm.recordMetric('errors.rate', 1);
  }

  // Track user engagement
  trackUserEngagement(userId: string, action: string, duration?: number): void {
    this.apm.incrementCounter('user.engagement', 1, { action });
    if (duration) {
      this.apm.recordHistogram('user.session_duration', duration, { action });
    }
  }

  // Track system health
  trackSystemHealth(component: string, status: string, metrics: Record<string, number>): void {
    this.apm.recordMetric(`system.${component}.status`, status === 'healthy' ? 1 : 0);
    Object.entries(metrics).forEach(([key, value]) => {
      this.apm.recordMetric(`system.${component}.${key}`, value);
    });
  }
}

// APM Middleware
export const apmMiddleware = (req: any, res: any, next: any) => {
  const startTime = Date.now();
  const businessMetrics = new BusinessMetrics();

  // Track request start
  businessMetrics.trackAPIUsage(req.path, req.method, 0, 0);

  // Override res.end to track response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const duration = Date.now() - startTime;
    businessMetrics.trackAPIUsage(req.path, req.method, duration, res.statusCode);
    
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// APM Error Handler
export const apmErrorHandler = (error: Error, req: any, res: any, next: any) => {
  const businessMetrics = new BusinessMetrics();
  
  businessMetrics.trackError(error.name, req.path, 'error');
  businessMetrics.trackAPIUsage(req.path, req.method, 0, 500);
  
  next(error);
};

export const businessMetrics = new BusinessMetrics();




