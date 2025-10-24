import winston from 'winston';
import { createWriteStream } from 'fs';
import path from 'path';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
import { mkdirSync } from 'fs';
try {
  mkdirSync(logsDir, { recursive: true });
} catch (error) {
  // Directory might already exist
}

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'verigrade-bookkeeping' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    
    // File transports
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Audit log for security events
    new winston.transports.File({
      filename: path.join(logsDir, 'audit.log'),
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
  ],
});

// Add request ID to logs
export const addRequestId = (req: any, res: any, next: any) => {
  req.requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

// Request logging middleware
export const requestLogger = (req: any, res: any, next: any) => {
  const startTime = Date.now();
  
  // Log request
  logger.info('Request started', {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id,
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const duration = Date.now() - startTime;
    
    logger.info('Request completed', {
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id,
    });
    
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Error logging middleware
export const errorLogger = (error: Error, req: any, res: any, next: any) => {
  logger.error('Request error', {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    userId: req.user?.id,
  });
  
  next(error);
};

// Security event logging
export const securityLogger = {
  loginAttempt: (email: string, success: boolean, ip: string, userAgent: string) => {
    logger.warn('Login attempt', {
      email,
      success,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    });
  },

  passwordReset: (email: string, ip: string) => {
    logger.info('Password reset requested', {
      email,
      ip,
      timestamp: new Date().toISOString(),
    });
  },

  suspiciousActivity: (userId: string, activity: string, details: any) => {
    logger.warn('Suspicious activity detected', {
      userId,
      activity,
      details,
      timestamp: new Date().toISOString(),
    });
  },

  dataAccess: (userId: string, resource: string, action: string, ip: string) => {
    logger.info('Data access', {
      userId,
      resource,
      action,
      ip,
      timestamp: new Date().toISOString(),
    });
  },

  adminAction: (adminId: string, action: string, target: string, details: any) => {
    logger.info('Admin action', {
      adminId,
      action,
      target,
      details,
      timestamp: new Date().toISOString(),
    });
  },
};

// Business event logging
export const businessLogger = {
  userRegistration: (userId: string, email: string, source: string) => {
    logger.info('User registered', {
      userId,
      email,
      source,
      timestamp: new Date().toISOString(),
    });
  },

  transactionCreated: (userId: string, transactionId: string, amount: number, type: string) => {
    logger.info('Transaction created', {
      userId,
      transactionId,
      amount,
      type,
      timestamp: new Date().toISOString(),
    });
  },

  invoiceCreated: (userId: string, invoiceId: string, customerEmail: string, amount: number) => {
    logger.info('Invoice created', {
      userId,
      invoiceId,
      customerEmail,
      amount,
      timestamp: new Date().toISOString(),
    });
  },

  paymentProcessed: (userId: string, paymentId: string, amount: number, currency: string, status: string) => {
    logger.info('Payment processed', {
      userId,
      paymentId,
      amount,
      currency,
      status,
      timestamp: new Date().toISOString(),
    });
  },

  fileUploaded: (userId: string, fileId: string, fileName: string, fileSize: number, fileType: string) => {
    logger.info('File uploaded', {
      userId,
      fileId,
      fileName,
      fileSize,
      fileType,
      timestamp: new Date().toISOString(),
    });
  },

  subscriptionChanged: (userId: string, oldPlan: string, newPlan: string, amount: number) => {
    logger.info('Subscription changed', {
      userId,
      oldPlan,
      newPlan,
      amount,
      timestamp: new Date().toISOString(),
    });
  },
};

// Performance logging
export const performanceLogger = {
  slowQuery: (query: string, duration: number, table: string) => {
    logger.warn('Slow database query', {
      query,
      duration: `${duration}ms`,
      table,
      timestamp: new Date().toISOString(),
    });
  },

  slowAPI: (endpoint: string, method: string, duration: number) => {
    logger.warn('Slow API endpoint', {
      endpoint,
      method,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  },

  highMemoryUsage: (usage: number, limit: number) => {
    logger.warn('High memory usage', {
      usage: `${usage}MB`,
      limit: `${limit}MB`,
      percentage: `${(usage / limit) * 100}%`,
      timestamp: new Date().toISOString(),
    });
  },

  highCPUUsage: (usage: number) => {
    logger.warn('High CPU usage', {
      usage: `${usage}%`,
      timestamp: new Date().toISOString(),
    });
  },
};

// System logging
export const systemLogger = {
  startup: (port: number, environment: string) => {
    logger.info('Application started', {
      port,
      environment,
      timestamp: new Date().toISOString(),
    });
  },

  shutdown: (reason: string) => {
    logger.info('Application shutting down', {
      reason,
      timestamp: new Date().toISOString(),
    });
  },

  healthCheck: (status: string, details: any) => {
    logger.info('Health check', {
      status,
      details,
      timestamp: new Date().toISOString(),
    });
  },

  databaseConnection: (status: string, details: any) => {
    logger.info('Database connection', {
      status,
      details,
      timestamp: new Date().toISOString(),
    });
  },

  externalService: (service: string, status: string, details: any) => {
    logger.info('External service status', {
      service,
      status,
      details,
      timestamp: new Date().toISOString(),
    });
  },
};

// Log rotation and cleanup
export const logRotation = {
  rotateLogs: () => {
    logger.info('Log rotation started', {
      timestamp: new Date().toISOString(),
    });
    
    // This would typically be handled by winston's file rotation
    // or external tools like logrotate
  },

  cleanupOldLogs: (daysOld: number = 30) => {
    logger.info('Log cleanup started', {
      daysOld,
      timestamp: new Date().toISOString(),
    });
    
    // Implementation would depend on your log storage strategy
  },
};

// Structured logging for analytics
export const analyticsLogger = {
  userAction: (userId: string, action: string, properties: any) => {
    logger.info('User action', {
      userId,
      action,
      properties,
      timestamp: new Date().toISOString(),
    });
  },

  featureUsage: (userId: string, feature: string, usage: any) => {
    logger.info('Feature usage', {
      userId,
      feature,
      usage,
      timestamp: new Date().toISOString(),
    });
  },

  conversion: (userId: string, event: string, value: number) => {
    logger.info('Conversion event', {
      userId,
      event,
      value,
      timestamp: new Date().toISOString(),
    });
  },
};

// Export the main logger
export default logger;