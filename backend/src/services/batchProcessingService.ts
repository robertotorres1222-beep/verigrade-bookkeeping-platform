import { DocumentProcessingService } from './documentProcessingService';
import { createFileUploadService, defaultFileUploadConfig } from './fileUploadService';
import { enhancedOcrService } from './enhancedOcrService';
import { receiptDetectionService } from './receiptDetectionService';
import { logger } from '../utils/logger';

export interface BatchProcessingJob {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalFiles: number;
  processedFiles: number;
  failedFiles: number;
  results: Array<{
    fileId: string;
    fileName: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    result?: any;
    error?: string;
  }>;
  createdAt: Date;
  completedAt?: Date;
  options: BatchProcessingOptions;
}

export interface BatchProcessingOptions {
  generateThumbnails?: boolean;
  extractText?: boolean;
  classifyDocuments?: boolean;
  extractStructuredData?: boolean;
  confidenceThreshold?: number;
  enableReceiptDetection?: boolean;
  enablePreprocessing?: boolean;
  parallelProcessing?: boolean;
  maxConcurrent?: number;
}

export interface BatchProcessingResult {
  jobId: string;
  status: 'completed' | 'failed' | 'partial';
  totalFiles: number;
  successfulFiles: number;
  failedFiles: number;
  results: Array<{
    fileId: string;
    fileName: string;
    status: 'success' | 'failed';
    documentType: string;
    confidence: number;
    extractedData?: any;
    error?: string;
  }>;
  processingTime: number;
  summary: {
    receipts: number;
    invoices: number;
    contracts: number;
    statements: number;
    other: number;
    averageConfidence: number;
  };
}

class BatchProcessingService {
  private jobs: Map<string, BatchProcessingJob> = new Map();
  private documentProcessingService: DocumentProcessingService;

  constructor() {
    const fileUploadService = createFileUploadService(defaultFileUploadConfig);
    this.documentProcessingService = new DocumentProcessingService(fileUploadService);
  }

  /**
   * Start batch processing job
   */
  async startBatchProcessing(
    files: Express.Multer.File[],
    userId: string,
    options: BatchProcessingOptions = {}
  ): Promise<BatchProcessingJob> {
    const jobId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: BatchProcessingJob = {
      id: jobId,
      userId,
      status: 'pending',
      totalFiles: files.length,
      processedFiles: 0,
      failedFiles: 0,
      results: files.map(file => ({
        fileId: Math.random().toString(36).substr(2, 9),
        fileName: file.originalname,
        status: 'pending',
      })),
      createdAt: new Date(),
      options: {
        generateThumbnails: true,
        extractText: true,
        classifyDocuments: true,
        extractStructuredData: true,
        confidenceThreshold: 80,
        enableReceiptDetection: true,
        enablePreprocessing: true,
        parallelProcessing: true,
        maxConcurrent: 5,
        ...options,
      },
    };

    this.jobs.set(jobId, job);

    // Start processing asynchronously
    this.processBatchJob(jobId).catch(error => {
      logger.error(`Batch processing job ${jobId} failed:`, error);
      const job = this.jobs.get(jobId);
      if (job) {
        job.status = 'failed';
        job.completedAt = new Date();
      }
    });

    logger.info(`Batch processing job started: ${jobId} for ${files.length} files`);
    return job;
  }

  /**
   * Process batch job
   */
  private async processBatchJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    job.status = 'processing';
    const startTime = Date.now();

    try {
      if (job.options.parallelProcessing) {
        await this.processFilesInParallel(job);
      } else {
        await this.processFilesSequentially(job);
      }

      job.status = 'completed';
      job.completedAt = new Date();
      
      const processingTime = Date.now() - startTime;
      logger.info(`Batch processing job ${jobId} completed in ${processingTime}ms`);

    } catch (error) {
      job.status = 'failed';
      job.completedAt = new Date();
      logger.error(`Batch processing job ${jobId} failed:`, error);
    }
  }

  /**
   * Process files in parallel
   */
  private async processFilesInParallel(job: BatchProcessingJob): Promise<void> {
    const maxConcurrent = job.options.maxConcurrent || 5;
    const chunks = this.chunkArray(job.results, maxConcurrent);

    for (const chunk of chunks) {
      const promises = chunk.map(result => this.processSingleFile(job, result));
      await Promise.allSettled(promises);
    }
  }

  /**
   * Process files sequentially
   */
  private async processFilesSequentially(job: BatchProcessingJob): Promise<void> {
    for (const result of job.results) {
      await this.processSingleFile(job, result);
    }
  }

  /**
   * Process a single file
   */
  private async processSingleFile(
    job: BatchProcessingJob, 
    result: BatchProcessingJob['results'][0]
  ): Promise<void> {
    try {
      result.status = 'processing';
      
      // Find the corresponding file
      const file = this.findFileByName(result.fileName);
      if (!file) {
        throw new Error(`File ${result.fileName} not found`);
      }

      let processedResult: any = {};

      // Receipt detection if enabled
      if (job.options.enableReceiptDetection) {
        const detectionResult = await receiptDetectionService.detectReceipt(file.buffer);
        processedResult.detection = detectionResult;
      }

      // Preprocess image if needed
      let processedBuffer = file.buffer;
      if (job.options.enablePreprocessing && processedResult.detection) {
        processedBuffer = await receiptDetectionService.preprocessForOCR(
          file.buffer, 
          processedResult.detection
        );
      }

      // Enhanced OCR processing
      const ocrResult = await enhancedOcrService.extractTextWithPreprocessing(
        processedBuffer,
        file.originalname
      );

      processedResult.ocr = ocrResult;

      // Extract structured data if enabled
      if (job.options.extractStructuredData) {
        if (ocrResult.documentType === 'receipt' && ocrResult.receiptData) {
          processedResult.structuredData = ocrResult.receiptData;
        } else if (ocrResult.documentType === 'invoice' && ocrResult.invoiceData) {
          processedResult.structuredData = ocrResult.invoiceData;
        }
      }

      // Check confidence threshold
      const confidence = ocrResult.confidence;
      if (confidence < (job.options.confidenceThreshold || 80)) {
        processedResult.requiresReview = true;
        processedResult.reviewReason = 'Low confidence score';
      }

      result.result = processedResult;
      result.status = 'completed';
      job.processedFiles++;

      logger.info(`File ${result.fileName} processed successfully with confidence ${confidence}%`);

    } catch (error) {
      result.status = 'failed';
      result.error = error instanceof Error ? error.message : 'Unknown error';
      job.failedFiles++;
      
      logger.error(`File ${result.fileName} processing failed:`, error);
    }
  }

  /**
   * Find file by name (simplified - in real implementation, files would be stored)
   */
  private findFileByName(fileName: string): Express.Multer.File | null {
    // This is a simplified implementation
    // In a real implementation, files would be stored and retrieved from storage
    return null;
  }

  /**
   * Get batch processing job status
   */
  getJobStatus(jobId: string): BatchProcessingJob | null {
    return this.jobs.get(jobId) || null;
  }

  /**
   * Get batch processing result
   */
  getBatchResult(jobId: string): BatchProcessingResult | null {
    const job = this.jobs.get(jobId);
    if (!job) {
      return null;
    }

    const successfulFiles = job.results.filter(r => r.status === 'completed').length;
    const failedFiles = job.results.filter(r => r.status === 'failed').length;
    
    // Calculate summary statistics
    const summary = this.calculateSummary(job.results);
    
    const processingTime = job.completedAt 
      ? job.completedAt.getTime() - job.createdAt.getTime()
      : Date.now() - job.createdAt.getTime();

    return {
      jobId,
      status: job.status === 'completed' ? 'completed' : 
              job.status === 'failed' ? 'failed' : 'partial',
      totalFiles: job.totalFiles,
      successfulFiles,
      failedFiles,
      results: job.results.map(result => ({
        fileId: result.fileId,
        fileName: result.fileName,
        status: result.status === 'completed' ? 'success' : 'failed',
        documentType: result.result?.ocr?.documentType || 'unknown',
        confidence: result.result?.ocr?.confidence || 0,
        extractedData: result.result?.structuredData,
        error: result.error,
      })),
      processingTime,
      summary,
    };
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(results: BatchProcessingJob['results']): {
    receipts: number;
    invoices: number;
    contracts: number;
    statements: number;
    other: number;
    averageConfidence: number;
  } {
    const documentTypes = {
      receipts: 0,
      invoices: 0,
      contracts: 0,
      statements: 0,
      other: 0,
    };

    let totalConfidence = 0;
    let confidenceCount = 0;

    results.forEach(result => {
      if (result.status === 'completed' && result.result?.ocr) {
        const docType = result.result.ocr.documentType;
        const confidence = result.result.ocr.confidence;

        switch (docType) {
          case 'receipt':
            documentTypes.receipts++;
            break;
          case 'invoice':
            documentTypes.invoices++;
            break;
          case 'contract':
            documentTypes.contracts++;
            break;
          case 'statement':
            documentTypes.statements++;
            break;
          default:
            documentTypes.other++;
        }

        if (confidence > 0) {
          totalConfidence += confidence;
          confidenceCount++;
        }
      }
    });

    return {
      receipts: documentTypes.receipts,
      invoices: documentTypes.invoices,
      contracts: documentTypes.contracts,
      statements: documentTypes.statements,
      other: documentTypes.other,
      averageConfidence: confidenceCount > 0 ? totalConfidence / confidenceCount : 0,
    };
  }

  /**
   * Chunk array into smaller arrays
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Get all jobs for a user
   */
  getUserJobs(userId: string): BatchProcessingJob[] {
    return Array.from(this.jobs.values()).filter(job => job.userId === userId);
  }

  /**
   * Cancel a batch processing job
   */
  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (job && job.status === 'processing') {
      job.status = 'failed';
      job.completedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Clean up completed jobs older than specified days
   */
  cleanupOldJobs(daysOld: number = 30): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    let cleanedCount = 0;
    for (const [jobId, job] of this.jobs.entries()) {
      if (job.completedAt && job.completedAt < cutoffDate) {
        this.jobs.delete(jobId);
        cleanedCount++;
      }
    }

    logger.info(`Cleaned up ${cleanedCount} old batch processing jobs`);
    return cleanedCount;
  }
}

// Create singleton instance
export const batchProcessingService = new BatchProcessingService();

export default BatchProcessingService;







