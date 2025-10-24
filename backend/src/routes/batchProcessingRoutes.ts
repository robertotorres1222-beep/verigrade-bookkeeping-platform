import { Router } from 'express';
import * as batchProcessingController from '../controllers/batchProcessingController';
import { uploadMultiple, validateUploadedFile, addFileMetadata } from '../middleware/upload';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Start batch processing job
router.post(
  '/start',
  authenticateToken,
  uploadMultiple('files', 20),
  validateUploadedFile,
  addFileMetadata,
  batchProcessingController.startBatchProcessing
);

// Get batch job status
router.get(
  '/status/:jobId',
  authenticateToken,
  batchProcessingController.getBatchJobStatus
);

// Get batch job result
router.get(
  '/result/:jobId',
  authenticateToken,
  batchProcessingController.getBatchJobResult
);

// Get user's batch jobs
router.get(
  '/jobs',
  authenticateToken,
  batchProcessingController.getUserBatchJobs
);

// Cancel batch job
router.delete(
  '/cancel/:jobId',
  authenticateToken,
  batchProcessingController.cancelBatchJob
);

// Cleanup old jobs (admin only)
router.delete(
  '/cleanup',
  authenticateToken,
  batchProcessingController.cleanupOldJobs
);

export default router;







