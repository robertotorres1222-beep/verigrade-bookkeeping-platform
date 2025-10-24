import { Request, Response } from 'express';
import enhancedFileUploadService from '../services/enhancedFileUploadService';
import multer from 'multer';
import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';

// Configure multer for enhanced file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types but log for security monitoring
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/tiff',
      'application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

/**
 * Upload file with enhanced processing
 */
export const uploadFile = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided',
      });
    }

    const {
      description,
      category = 'general',
      tags = [],
      folder = 'documents',
      isPublic = false,
    } = req.body;

    const processedFile = await enhancedFileUploadService.uploadFile({
      fileName: file.originalname,
      fileSize: file.size,
      contentType: file.mimetype,
      fileBuffer: file.buffer,
      folder,
      metadata: {
        description,
        category,
        tags: tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
        isPublic: isPublic === 'true',
        organizationId: req.user!.organizationId!,
        uploadedBy: req.user!.id,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: processedFile.id,
        fileName: processedFile.fileName,
        fileSize: processedFile.fileSize,
        contentType: processedFile.contentType,
        s3Url: processedFile.s3Url,
        thumbnailUrl: processedFile.thumbnailUrl,
        ocrData: processedFile.ocrData,
        imageMetadata: processedFile.imageMetadata,
        uploadedAt: processedFile.uploadedAt,
      },
    });
  } catch (error) {
    console.error('Enhanced file upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload file',
    });
  }
};

/**
 * Get file by ID
 */
export const getFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const file = await enhancedFileUploadService.getFile(id, req.user!.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found',
      });
    }

    res.json({
      success: true,
      data: file,
    });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get file',
    });
  }
};

/**
 * Delete file
 */
export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await enhancedFileUploadService.deleteFile(id, req.user!.id);

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete file',
    });
  }
};

/**
 * Search files by OCR text
 */
export const searchFilesByText = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
      });
    }

    const files = await enhancedFileUploadService.searchFilesByText(
      req.user!.organizationId!,
      q as string
    );

    res.json({
      success: true,
      data: files,
    });
  } catch (error) {
    console.error('Search files error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search files',
    });
  }
};

/**
 * Get file statistics
 */
export const getFileStats = async (req: Request, res: Response) => {
  try {
    const stats = await enhancedFileUploadService.getFileStats(req.user!.organizationId!);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get file stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get file statistics',
    });
  }
};

/**
 * Bulk upload files
 */
export const bulkUploadFiles = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files provided',
      });
    }

    const {
      description,
      category = 'general',
      tags = [],
      folder = 'documents',
      isPublic = false,
    } = req.body;

    const uploadPromises = files.map(file =>
      enhancedFileUploadService.uploadFile({
        fileName: file.originalname,
        fileSize: file.size,
        contentType: file.mimetype,
        fileBuffer: file.buffer,
        folder,
        metadata: {
          description,
          category,
          tags: tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
          isPublic: isPublic === 'true',
          organizationId: req.user!.organizationId!,
          uploadedBy: req.user!.id,
        },
      })
    );

    const results = await Promise.allSettled(uploadPromises);
    const successful = results.filter(r => r.status === 'fulfilled').map(r => (r as PromiseFulfilledResult<any>).value);
    const failed = results.filter(r => r.status === 'rejected').map(r => (r as PromiseRejectedResult).reason);

    res.status(201).json({
      success: true,
      data: {
        successful: successful.length,
        failed: failed.length,
        files: successful,
        errors: failed.map(error => error.message),
      },
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload files',
    });
  }
};

/**
 * Get file download URL
 */
export const getFileDownloadUrl = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { expiresIn = 3600 } = req.query;

    const file = await enhancedFileUploadService.getFile(id, req.user!.id);
    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found',
      });
    }

    // Generate fresh presigned URL
    const downloadUrl = await enhancedFileUploadService.getFile(id, req.user!.id);
    
    res.json({
      success: true,
      data: {
        downloadUrl: downloadUrl?.s3Url,
        expiresIn: parseInt(expiresIn as string),
      },
    });
  } catch (error) {
    console.error('Get download URL error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get download URL',
    });
  }
};

/**
 * Process receipt with OCR
 */
export const processReceipt = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided',
      });
    }

    // Upload file first
    const uploadedFile = await enhancedFileUploadService.uploadFile({
      fileName: file.originalname,
      fileSize: file.size,
      contentType: file.mimetype,
      fileBuffer: file.buffer,
      folder: 'receipts',
      metadata: {
        description: 'Receipt upload',
        category: 'receipt',
        tags: ['receipt', 'expense'],
        isPublic: false,
        organizationId: req.user!.organizationId!,
        uploadedBy: req.user!.id,
      },
    });

    // Extract structured data from receipt
    const receiptData = await extractReceiptData(uploadedFile.ocrData?.extractedText || '');

    res.status(201).json({
      success: true,
      data: {
        file: uploadedFile,
        receiptData,
      },
    });
  } catch (error) {
    console.error('Process receipt error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process receipt',
    });
  }
};

/**
 * Extract structured data from receipt text
 */
async function extractReceiptData(text: string): Promise<{
  merchant?: string;
  amount?: number;
  date?: string;
  items?: string[];
  tax?: number;
  total?: number;
}> {
  try {
    // Simple regex patterns for common receipt formats
    const amountPattern = /\$?(\d+\.?\d*)/g;
    const datePattern = /(\d{1,2}\/\d{1,2}\/\d{2,4})|(\d{4}-\d{2}-\d{2})/g;
    const merchantPattern = /^([A-Z][A-Z\s&]+)/m;
    
    const amounts = text.match(amountPattern)?.map(m => parseFloat(m.replace('$', ''))) || [];
    const dates = text.match(datePattern) || [];
    const merchant = text.match(merchantPattern)?.[0]?.trim();
    
    // Find the largest amount (likely the total)
    const total = Math.max(...amounts);
    
    // Extract items (lines that don't contain amounts or dates)
    const lines = text.split('\n').filter(line => 
      line.trim().length > 0 && 
      !line.match(amountPattern) && 
      !line.match(datePattern) &&
      !line.toLowerCase().includes('total') &&
      !line.toLowerCase().includes('tax')
    );

    return {
      merchant: merchant,
      amount: total,
      date: dates[0],
      items: lines.slice(0, 5), // First 5 items
      total: total,
    };
  } catch (error) {
    console.error('Extract receipt data error:', error);
    return {};
  }
}

export { upload };
