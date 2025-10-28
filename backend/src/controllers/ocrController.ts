import { Request, Response } from 'express';
import { ocrService } from '../services/ocrService';
import logger from '../utils/logger';

export class OCRController {
  // Extract text from image
  async extractText(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No image file provided',
        });
        return;
      }

      const result = await ocrService.extractText(req.file.buffer);

      res.json({
        success: true,
        data: result,
        message: 'Text extracted successfully',
      });
    } catch (error) {
      logger.error('Error extracting text', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to extract text',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Extract receipt data
  async extractReceiptData(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No image file provided',
        });
        return;
      }

      const result = await ocrService.extractReceiptData(req.file.buffer);

      res.json({
        success: true,
        data: result,
        message: 'Receipt data extracted successfully',
      });
    } catch (error) {
      logger.error('Error extracting receipt data', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to extract receipt data',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Extract invoice data
  async extractInvoiceData(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No image file provided',
        });
        return;
      }

      const result = await ocrService.extractInvoiceData(req.file.buffer);

      res.json({
        success: true,
        data: result,
        message: 'Invoice data extracted successfully',
      });
    } catch (error) {
      logger.error('Error extracting invoice data', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to extract invoice data',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Batch process multiple images
  async batchProcess(req: Request, res: Response): Promise<void> {
    try {
      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        res.status(400).json({
          success: false,
          message: 'No image files provided',
        });
        return;
      }

      const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      const { type = 'text' } = req.body;

      const results = await Promise.all(
        files.map(async (file) => {
          try {
            if (type === 'receipt') {
              return await ocrService.extractReceiptData(file.buffer);
            } else if (type === 'invoice') {
              return await ocrService.extractInvoiceData(file.buffer);
            } else {
              return await ocrService.extractText(file.buffer);
            }
          } catch (error) {
            logger.error('Error processing file in batch', { error, fileName: file.originalname });
            return { error: 'Failed to process file' };
          }
        })
      );

      res.json({
        success: true,
        data: results,
        message: `${results.length} files processed successfully`,
      });
    } catch (error) {
      logger.error('Error in batch processing', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to process files',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get OCR statistics
  async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      // This would typically fetch from database
      const stats = {
        totalProcessed: 0,
        successRate: 0,
        averageConfidence: 0,
        processingTime: 0,
      };

      res.json({
        success: true,
        data: stats,
        message: 'OCR statistics retrieved successfully',
      });
    } catch (error) {
      logger.error('Error getting OCR statistics', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve OCR statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const ocrController = new OCRController();







