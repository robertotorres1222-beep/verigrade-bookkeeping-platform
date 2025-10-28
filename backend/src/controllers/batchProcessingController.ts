import { Request, Response } from 'express';
import { batchProcessingService } from '../services/batchProcessingService';
import { logger } from '../utils/logger';

export const startBatchProcessing = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No files provided',
      });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const options = {
      generateThumbnails: req.body.generateThumbnails === 'true',
      extractText: req.body.extractText === 'true',
      classifyDocuments: req.body.classifyDocuments === 'true',
      extractStructuredData: req.body.extractStructuredData === 'true',
      confidenceThreshold: req.body.confidenceThreshold ? parseInt(req.body.confidenceThreshold) : 80,
      enableReceiptDetection: req.body.enableReceiptDetection === 'true',
      enablePreprocessing: req.body.enablePreprocessing === 'true',
      parallelProcessing: req.body.parallelProcessing === 'true',
      maxConcurrent: req.body.maxConcurrent ? parseInt(req.body.maxConcurrent) : 5,
    };

    const job = await batchProcessingService.startBatchProcessing(req.files, userId, options);

    logger.info(`Batch processing job started: ${job.id} for user: ${userId}`);

    res.status(200).json({
      success: true,
      data: job,
      message: 'Batch processing job started successfully',
    });

  } catch (error) {
    logger.error('Error starting batch processing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start batch processing',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getBatchJobStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      res.status(400).json({
        success: false,
        message: 'Job ID is required',
      });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const job = batchProcessingService.getJobStatus(jobId);

    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job not found',
      });
      return;
    }

    // Check if user owns this job
    if (job.userId !== userId) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: job,
      message: 'Job status retrieved successfully',
    });

  } catch (error) {
    logger.error('Error getting batch job status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get job status',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getBatchJobResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      res.status(400).json({
        success: false,
        message: 'Job ID is required',
      });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const result = batchProcessingService.getBatchResult(jobId);

    if (!result) {
      res.status(404).json({
        success: false,
        message: 'Job result not found',
      });
      return;
    }

    // Check if user owns this job (we need to get the job first)
    const job = batchProcessingService.getJobStatus(jobId);
    if (!job || job.userId !== userId) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result,
      message: 'Job result retrieved successfully',
    });

  } catch (error) {
    logger.error('Error getting batch job result:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get job result',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getUserBatchJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const jobs = batchProcessingService.getUserJobs(userId);

    res.status(200).json({
      success: true,
      data: jobs,
      message: 'User batch jobs retrieved successfully',
    });

  } catch (error) {
    logger.error('Error getting user batch jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user batch jobs',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const cancelBatchJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      res.status(400).json({
        success: false,
        message: 'Job ID is required',
      });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    // Check if user owns this job
    const job = batchProcessingService.getJobStatus(jobId);
    if (!job || job.userId !== userId) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
      });
      return;
    }

    const cancelled = batchProcessingService.cancelJob(jobId);

    if (cancelled) {
      res.status(200).json({
        success: true,
        message: 'Job cancelled successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Job could not be cancelled (may already be completed or failed)',
      });
    }

  } catch (error) {
    logger.error('Error cancelling batch job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel job',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const cleanupOldJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { daysOld } = req.query;
    const days = daysOld ? parseInt(daysOld as string) : 30;

    const cleanedCount = batchProcessingService.cleanupOldJobs(days);

    res.status(200).json({
      success: true,
      data: { cleanedCount },
      message: `${cleanedCount} old jobs cleaned up successfully`,
    });

  } catch (error) {
    logger.error('Error cleaning up old jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup old jobs',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};










