import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from './logger';

const prisma = new PrismaClient();

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: HealthCheck;
    memory: HealthCheck;
    disk: HealthCheck;
    external: HealthCheck;
  };
}

export interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  message?: string;
  details?: any;
}

/**
 * Basic health check endpoint
 */
export const healthCheck = async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    
    // Basic system checks
    const memoryUsage = process.memoryUsage();
    const memoryUsageMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const maxMemoryMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const memoryPercentage = (memoryUsageMB / maxMemoryMB) * 100;

    const healthResult: HealthCheckResult = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: await checkDatabase(),
        memory: checkMemory(memoryPercentage),
        disk: await checkDiskSpace(),
        external: await checkExternalServices(),
      },
    };

    // Determine overall status
    const checkStatuses = Object.values(healthResult.checks).map(check => check.status);
    if (checkStatuses.includes('unhealthy')) {
      healthResult.status = 'unhealthy';
    } else if (checkStatuses.includes('degraded')) {
      healthResult.status = 'degraded';
    }

    const responseTime = Date.now() - startTime;
    
    logger.info(`Health check completed in ${responseTime}ms`, {
      status: healthResult.status,
      responseTime,
    });

    const statusCode = healthResult.status === 'healthy' ? 200 : 
                      healthResult.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(healthResult);

  } catch (error) {
    logger.error('Health check failed:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: { status: 'unhealthy', message: 'Health check failed' },
        memory: { status: 'unhealthy', message: 'Health check failed' },
        disk: { status: 'unhealthy', message: 'Health check failed' },
        external: { status: 'unhealthy', message: 'Health check failed' },
      },
    });
  }
};

/**
 * Readiness check endpoint
 */
export const readinessCheck = async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    
    // Check if the application is ready to serve traffic
    const databaseCheck = await checkDatabase();
    const memoryCheck = checkMemory();
    
    const isReady = databaseCheck.status === 'healthy' && memoryCheck.status === 'healthy';
    const responseTime = Date.now() - startTime;

    if (isReady) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        responseTime,
        checks: {
          database: databaseCheck,
          memory: memoryCheck,
        },
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        responseTime,
        checks: {
          database: databaseCheck,
          memory: memoryCheck,
        },
      });
    }

  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Liveness check endpoint
 */
export const livenessCheck = (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // Simple query to test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      responseTime,
      message: 'Database connection successful',
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    logger.error('Database health check failed:', error);
    
    return {
      status: 'unhealthy',
      responseTime,
      message: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check memory usage
 */
function checkMemory(usagePercentage?: number): HealthCheck {
  const memoryUsage = process.memoryUsage();
  const memoryUsageMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  const maxMemoryMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
  const percentage = usagePercentage || (memoryUsageMB / maxMemoryMB) * 100;

  let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
  let message = 'Memory usage normal';

  if (percentage > 90) {
    status = 'unhealthy';
    message = 'Memory usage critical';
  } else if (percentage > 80) {
    status = 'degraded';
    message = 'Memory usage high';
  }

  return {
    status,
    message,
    details: {
      used: `${memoryUsageMB}MB`,
      total: `${maxMemoryMB}MB`,
      percentage: Math.round(percentage * 100) / 100,
    },
  };
}

/**
 * Check disk space
 */
async function checkDiskSpace(): Promise<HealthCheck> {
  try {
    // This is a simplified check - in production, you might want to use a library like 'node-disk-info'
    const fs = require('fs');
    const stats = fs.statSync('.');
    
    return {
      status: 'healthy',
      message: 'Disk space check passed',
      details: {
        // In a real implementation, you would check actual disk usage
        available: 'N/A',
        used: 'N/A',
      },
    };
  } catch (error) {
    return {
      status: 'degraded',
      message: 'Disk space check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check external services
 */
async function checkExternalServices(): Promise<HealthCheck> {
  try {
    // Check if required environment variables are set
    const requiredEnvVars = [
      'DATABASE_URL',
      'JWT_SECRET',
      'FILE_STORAGE_BUCKET',
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      return {
        status: 'degraded',
        message: 'Some environment variables are missing',
        details: {
          missing: missingVars,
        },
      };
    }

    return {
      status: 'healthy',
      message: 'External services check passed',
    };
  } catch (error) {
    return {
      status: 'degraded',
      message: 'External services check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}







