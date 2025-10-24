import { Request, Response } from 'express';
import { DocumentProcessingService } from '../services/documentProcessingService';
import { createFileUploadService, defaultFileUploadConfig } from '../services/fileUploadService';
import { logger } from '../utils/logger';

export const processDocument = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided',
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const options = {
      generateThumbnail: req.body.generateThumbnail === 'true',
      extractText: req.body.extractText === 'true',
      classifyDocument: req.body.classifyDocument === 'true',
      extractStructuredData: req.body.extractStructuredData === 'true',
      confidenceThreshold: req.body.confidenceThreshold ? parseInt(req.body.confidenceThreshold) : 80,
    };

    const fileUploadService = createFileUploadService(defaultFileUploadConfig);
    const documentProcessingService = new DocumentProcessingService(fileUploadService);

    const result = await documentProcessingService.processDocument(req.file, userId, options);

    logger.info(`Document processed: ${result.id} for user: ${userId}`);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Document processed successfully',
    });

  } catch (error) {
    logger.error('Error processing document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process document',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const batchProcessDocuments = async (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided',
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const options = {
      generateThumbnail: req.body.generateThumbnail === 'true',
      extractText: req.body.extractText === 'true',
      classifyDocument: req.body.classifyDocument === 'true',
      extractStructuredData: req.body.extractStructuredData === 'true',
      confidenceThreshold: req.body.confidenceThreshold ? parseInt(req.body.confidenceThreshold) : 80,
    };

    const fileUploadService = createFileUploadService(defaultFileUploadConfig);
    const documentProcessingService = new DocumentProcessingService(fileUploadService);

    const results = await documentProcessingService.batchProcessDocuments(req.files, userId, options);

    logger.info(`Batch processed ${results.length} documents for user: ${userId}`);

    res.status(200).json({
      success: true,
      data: results,
      message: `${results.length} documents processed successfully`,
    });

  } catch (error) {
    logger.error('Error batch processing documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to batch process documents',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getDocumentsRequiringReview = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const fileUploadService = createFileUploadService(defaultFileUploadConfig);
    const documentProcessingService = new DocumentProcessingService(fileUploadService);

    const documents = await documentProcessingService.getDocumentsRequiringReview(userId);

    res.status(200).json({
      success: true,
      data: documents,
      message: 'Documents requiring review retrieved successfully',
    });

  } catch (error) {
    logger.error('Error getting documents requiring review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get documents requiring review',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateDocumentReview = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const { approved, corrections } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: 'Document ID is required',
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const fileUploadService = createFileUploadService(defaultFileUploadConfig);
    const documentProcessingService = new DocumentProcessingService(fileUploadService);

    await documentProcessingService.updateDocumentReview(documentId, approved, corrections);

    logger.info(`Document review updated: ${documentId} by user: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Document review updated successfully',
    });

  } catch (error) {
    logger.error('Error updating document review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update document review',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const extractTextFromDocument = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided',
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Import OCR service
    const { ocrService } = await import('../services/ocrService');
    
    const result = await ocrService.extractText(req.file.buffer);

    logger.info(`Text extracted from document for user: ${userId}`);

    res.status(200).json({
      success: true,
      data: {
        text: result.text,
        confidence: result.confidence,
        wordCount: result.words.length,
        lineCount: result.lines.length,
      },
      message: 'Text extracted successfully',
    });

  } catch (error) {
    logger.error('Error extracting text from document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extract text from document',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const extractReceiptData = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided',
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Import OCR service
    const { ocrService } = await import('../services/ocrService');
    
    const result = await ocrService.extractReceiptData(req.file.buffer);

    logger.info(`Receipt data extracted for user: ${userId}`);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Receipt data extracted successfully',
    });

  } catch (error) {
    logger.error('Error extracting receipt data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extract receipt data',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const extractInvoiceData = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided',
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Import OCR service
    const { ocrService } = await import('../services/ocrService');
    
    const result = await ocrService.extractInvoiceData(req.file.buffer);

    logger.info(`Invoice data extracted for user: ${userId}`);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Invoice data extracted successfully',
    });

  } catch (error) {
    logger.error('Error extracting invoice data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extract invoice data',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};






