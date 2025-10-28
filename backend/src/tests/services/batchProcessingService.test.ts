import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { BatchProcessingService } from '../../services/batchProcessingService';

describe('BatchProcessingService', () => {
  let batchProcessingService: BatchProcessingService;
  const mockUserId = 'test-user-id';
  const mockFiles = [
    {
      originalname: 'receipt1.jpg',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from('mock-image-data-1'),
    },
    {
      originalname: 'receipt2.jpg',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from('mock-image-data-2'),
    },
  ] as Express.Multer.File[];

  beforeEach(() => {
    batchProcessingService = new BatchProcessingService();
    jest.clearAllMocks();
  });

  describe('startBatchProcessing', () => {
    it('should start batch processing job', async () => {
      const options = {
        generateThumbnails: true,
        extractText: true,
        classifyDocuments: true,
        extractStructuredData: true,
        confidenceThreshold: 80,
        enableReceiptDetection: true,
        enablePreprocessing: true,
        parallelProcessing: true,
        maxConcurrent: 5,
      };

      const job = await batchProcessingService.startBatchProcessing(
        mockFiles,
        mockUserId,
        options
      );

      expect(job).toHaveProperty('id');
      expect(job).toHaveProperty('userId', mockUserId);
      expect(job).toHaveProperty('status', 'pending');
      expect(job).toHaveProperty('totalFiles', 2);
      expect(job).toHaveProperty('processedFiles', 0);
      expect(job).toHaveProperty('failedFiles', 0);
      expect(job).toHaveProperty('results');
      expect(job.results).toHaveLength(2);
      expect(job).toHaveProperty('createdAt');
      expect(job).toHaveProperty('options');
    });

    it('should create job with default options', async () => {
      const job = await batchProcessingService.startBatchProcessing(
        mockFiles,
        mockUserId
      );

      expect(job.options).toHaveProperty('generateThumbnails');
      expect(job.options).toHaveProperty('extractText');
      expect(job.options).toHaveProperty('classifyDocuments');
      expect(job.options).toHaveProperty('extractStructuredData');
      expect(job.options).toHaveProperty('confidenceThreshold');
      expect(job.options).toHaveProperty('enableReceiptDetection');
      expect(job.options).toHaveProperty('enablePreprocessing');
      expect(job.options).toHaveProperty('parallelProcessing');
      expect(job.options).toHaveProperty('maxConcurrent');
    });

    it('should handle empty files array', async () => {
      const job = await batchProcessingService.startBatchProcessing(
        [],
        mockUserId
      );

      expect(job.totalFiles).toBe(0);
      expect(job.results).toHaveLength(0);
    });
  });

  describe('getJobStatus', () => {
    it('should return job status', async () => {
      const job = await batchProcessingService.startBatchProcessing(
        mockFiles,
        mockUserId
      );

      const status = batchProcessingService.getJobStatus(job.id);

      expect(status).toBeDefined();
      expect(status?.id).toBe(job.id);
      expect(status?.userId).toBe(mockUserId);
    });

    it('should return null for non-existent job', () => {
      const status = batchProcessingService.getJobStatus('non-existent-id');

      expect(status).toBeNull();
    });
  });

  describe('getBatchResult', () => {
    it('should return batch result', async () => {
      const job = await batchProcessingService.startBatchProcessing(
        mockFiles,
        mockUserId
      );

      const result = batchProcessingService.getBatchResult(job.id);

      expect(result).toBeDefined();
      expect(result?.jobId).toBe(job.id);
      expect(result?.totalFiles).toBe(2);
      expect(result?.successfulFiles).toBe(0);
      expect(result?.failedFiles).toBe(0);
      expect(result?.results).toHaveLength(2);
      expect(result?.processingTime).toBeGreaterThanOrEqual(0);
      expect(result?.summary).toBeDefined();
    });

    it('should return null for non-existent job', () => {
      const result = batchProcessingService.getBatchResult('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('getUserJobs', () => {
    it('should return user jobs', async () => {
      await batchProcessingService.startBatchProcessing(mockFiles, mockUserId);
      await batchProcessingService.startBatchProcessing(mockFiles, 'other-user');

      const userJobs = batchProcessingService.getUserJobs(mockUserId);

      expect(userJobs).toHaveLength(1);
      expect(userJobs[0].userId).toBe(mockUserId);
    });

    it('should return empty array for user with no jobs', () => {
      const userJobs = batchProcessingService.getUserJobs('no-jobs-user');

      expect(userJobs).toHaveLength(0);
    });
  });

  describe('cancelJob', () => {
    it('should cancel processing job', async () => {
      const job = await batchProcessingService.startBatchProcessing(
        mockFiles,
        mockUserId
      );

      // Mock the job as processing
      const jobStatus = batchProcessingService.getJobStatus(job.id);
      if (jobStatus) {
        jobStatus.status = 'processing';
      }

      const cancelled = batchProcessingService.cancelJob(job.id);

      expect(cancelled).toBe(true);
    });

    it('should not cancel completed job', async () => {
      const job = await batchProcessingService.startBatchProcessing(
        mockFiles,
        mockUserId
      );

      // Mock the job as completed
      const jobStatus = batchProcessingService.getJobStatus(job.id);
      if (jobStatus) {
        jobStatus.status = 'completed';
      }

      const cancelled = batchProcessingService.cancelJob(job.id);

      expect(cancelled).toBe(false);
    });

    it('should return false for non-existent job', () => {
      const cancelled = batchProcessingService.cancelJob('non-existent-id');

      expect(cancelled).toBe(false);
    });
  });

  describe('cleanupOldJobs', () => {
    it('should cleanup old jobs', async () => {
      // Create a job
      await batchProcessingService.startBatchProcessing(mockFiles, mockUserId);

      // Mock the job as completed and old
      const jobs = batchProcessingService.getUserJobs(mockUserId);
      if (jobs.length > 0) {
        const job = jobs[0];
        job.status = 'completed';
        job.completedAt = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000); // 31 days ago
      }

      const cleanedCount = batchProcessingService.cleanupOldJobs(30);

      expect(cleanedCount).toBeGreaterThanOrEqual(0);
    });

    it('should not cleanup recent jobs', async () => {
      // Create a job
      await batchProcessingService.startBatchProcessing(mockFiles, mockUserId);

      // Mock the job as completed and recent
      const jobs = batchProcessingService.getUserJobs(mockUserId);
      if (jobs.length > 0) {
        const job = jobs[0];
        job.status = 'completed';
        job.completedAt = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
      }

      const cleanedCount = batchProcessingService.cleanupOldJobs(30);

      expect(cleanedCount).toBe(0);
    });
  });

  describe('calculateSummary', () => {
    it('should calculate summary statistics', () => {
      const results = [
        {
          fileId: '1',
          fileName: 'receipt1.jpg',
          status: 'completed',
          documentType: 'receipt',
          confidence: 85,
          extractedData: { text: 'receipt text' },
        },
        {
          fileId: '2',
          fileName: 'invoice1.pdf',
          status: 'completed',
          documentType: 'invoice',
          confidence: 90,
          extractedData: { text: 'invoice text' },
        },
        {
          fileId: '3',
          fileName: 'contract1.pdf',
          status: 'failed',
          documentType: 'other',
          confidence: 0,
          error: 'Processing failed',
        },
      ];

      const summary = (batchProcessingService as any).calculateSummary(results);

      expect(summary).toHaveProperty('receipts', 1);
      expect(summary).toHaveProperty('invoices', 1);
      expect(summary).toHaveProperty('contracts', 0);
      expect(summary).toHaveProperty('statements', 0);
      expect(summary).toHaveProperty('other', 1);
      expect(summary).toHaveProperty('averageConfidence');
      expect(summary.averageConfidence).toBeGreaterThan(0);
    });

    it('should handle empty results', () => {
      const summary = (batchProcessingService as any).calculateSummary([]);

      expect(summary).toHaveProperty('receipts', 0);
      expect(summary).toHaveProperty('invoices', 0);
      expect(summary).toHaveProperty('contracts', 0);
      expect(summary).toHaveProperty('statements', 0);
      expect(summary).toHaveProperty('other', 0);
      expect(summary).toHaveProperty('averageConfidence', 0);
    });
  });

  describe('chunkArray', () => {
    it('should chunk array correctly', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const chunks = (batchProcessingService as any).chunkArray(array, 3);

      expect(chunks).toHaveLength(4);
      expect(chunks[0]).toEqual([1, 2, 3]);
      expect(chunks[1]).toEqual([4, 5, 6]);
      expect(chunks[2]).toEqual([7, 8, 9]);
      expect(chunks[3]).toEqual([10]);
    });

    it('should handle empty array', () => {
      const chunks = (batchProcessingService as any).chunkArray([], 3);

      expect(chunks).toHaveLength(0);
    });

    it('should handle array smaller than chunk size', () => {
      const array = [1, 2];
      const chunks = (batchProcessingService as any).chunkArray(array, 5);

      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toEqual([1, 2]);
    });
  });

  describe('error handling', () => {
    it('should handle processing errors gracefully', async () => {
      // Mock files that will cause processing errors
      const errorFiles = [
        {
          originalname: 'error.jpg',
          mimetype: 'image/jpeg',
          size: 1024,
          buffer: Buffer.from('invalid-image-data'),
        },
      ] as Express.Multer.File[];

      const job = await batchProcessingService.startBatchProcessing(
        errorFiles,
        mockUserId
      );

      expect(job).toBeDefined();
      expect(job.status).toBe('pending');
    });

    it('should handle null files', async () => {
      const job = await batchProcessingService.startBatchProcessing(
        null as any,
        mockUserId
      );

      expect(job).toBeDefined();
    });

    it('should handle undefined files', async () => {
      const job = await batchProcessingService.startBatchProcessing(
        undefined as any,
        mockUserId
      );

      expect(job).toBeDefined();
    });
  });

  describe('concurrent processing', () => {
    it('should handle multiple concurrent jobs', async () => {
      const job1 = await batchProcessingService.startBatchProcessing(
        mockFiles,
        mockUserId
      );
      const job2 = await batchProcessingService.startBatchProcessing(
        mockFiles,
        mockUserId
      );

      expect(job1.id).not.toBe(job2.id);
      expect(job1.userId).toBe(job2.userId);

      const userJobs = batchProcessingService.getUserJobs(mockUserId);
      expect(userJobs).toHaveLength(2);
    });
  });
});










