import { Request, Response } from 'express';
import { performanceService } from '../services/performanceService';
import logger from '../utils/logger';

export class PerformanceController {
  // Optimize database
  async optimizeDatabase(req: Request, res: Response): Promise<void> {
    try {
      await performanceService.optimizeDatabase();

      res.json({
        success: true,
        message: 'Database optimization completed successfully',
      });
    } catch (error) {
      logger.error('Error optimizing database', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to optimize database',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Optimize queries
  async optimizeQueries(req: Request, res: Response): Promise<void> {
    try {
      await performanceService.optimizeQueries();

      res.json({
        success: true,
        message: 'Query optimization completed successfully',
      });
    } catch (error) {
      logger.error('Error optimizing queries', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to optimize queries',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Optimize cache
  async optimizeCache(req: Request, res: Response): Promise<void> {
    try {
      await performanceService.optimizeCache();

      res.json({
        success: true,
        message: 'Cache optimization completed successfully',
      });
    } catch (error) {
      logger.error('Error optimizing cache', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to optimize cache',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Optimize frontend
  async optimizeFrontend(req: Request, res: Response): Promise<void> {
    try {
      await performanceService.optimizeFrontend();

      res.json({
        success: true,
        message: 'Frontend optimization completed successfully',
      });
    } catch (error) {
      logger.error('Error optimizing frontend', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to optimize frontend',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Optimize API
  async optimizeAPI(req: Request, res: Response): Promise<void> {
    try {
      await performanceService.optimizeAPI();

      res.json({
        success: true,
        message: 'API optimization completed successfully',
      });
    } catch (error) {
      logger.error('Error optimizing API', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to optimize API',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const performanceController = new PerformanceController();