import { Request, Response } from 'express';
import { fileUploadService } from '../services/fileUploadService';
import logger from '../utils/logger';

export class FileUploadController {
  // Upload single file
  async uploadFile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file provided',
        });
        return;
      }

      const userId = req.user?.id || 'anonymous';
      const category = req.body.category || 'other';
      const tags = req.body.tags ? JSON.parse(req.body.tags) : [];
      const isPublic = req.body.isPublic === 'true';

      const result = await fileUploadService.uploadFile(
        req.file,
        userId,
        category as any,
        tags,
        isPublic
      );

      res.status(201).json({
        success: true,
        data: result,
        message: 'File uploaded successfully',
      });
    } catch (error) {
      logger.error('Error uploading file', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to upload file',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(req: Request, res: Response): Promise<void> {
    try {
      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        res.status(400).json({
          success: false,
          message: 'No files provided',
        });
        return;
      }

      const userId = req.user?.id || 'anonymous';
      const category = req.body.category || 'other';
      const tags = req.body.tags ? JSON.parse(req.body.tags) : [];
      const isPublic = req.body.isPublic === 'true';

      const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      const results = await Promise.all(
        files.map(file => 
          fileUploadService.uploadFile(file, userId, category as any, tags, isPublic)
        )
      );

      res.status(201).json({
        success: true,
        data: results,
        message: `${results.length} files uploaded successfully`,
      });
    } catch (error) {
      logger.error('Error uploading multiple files', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to upload files',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Generate presigned URL for direct upload
  async generatePresignedUrl(req: Request, res: Response): Promise<void> {
    try {
      const { fileName, mimeType, category = 'other' } = req.body;
      const userId = req.user?.id || 'anonymous';

      if (!fileName || !mimeType) {
        res.status(400).json({
          success: false,
          message: 'fileName and mimeType are required',
        });
        return;
      }

      const result = await fileUploadService.generatePresignedUploadUrl(
        userId,
        fileName,
        mimeType,
        category
      );

      res.json({
        success: true,
        data: result,
        message: 'Presigned URL generated successfully',
      });
    } catch (error) {
      logger.error('Error generating presigned URL', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to generate presigned URL',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get file by ID
  async getFile(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      const userId = req.user?.id || 'anonymous';

      // This would typically fetch from database
      // For now, return a placeholder response
      res.json({
        success: true,
        data: {
          id: fileId,
          userId,
          message: 'File details retrieved successfully',
        },
        message: 'File retrieved successfully',
      });
    } catch (error) {
      logger.error('Error retrieving file', { error, params: req.params });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve file',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // List user files
  async listUserFiles(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 'anonymous';
      const category = req.query.category as string;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await fileUploadService.listUserFiles(userId, category, limit, offset);

      res.json({
        success: true,
        data: result,
        message: 'Files retrieved successfully',
      });
    } catch (error) {
      logger.error('Error listing user files', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve files',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Delete file
  async deleteFile(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      const userId = req.user?.id || 'anonymous';

      // This would typically delete from database and S3
      // For now, return a placeholder response
      res.json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting file', { error, params: req.params });
      res.status(500).json({
        success: false,
        message: 'Failed to delete file',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Process image
  async processImage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No image file provided',
        });
        return;
      }

      const { width, height, quality, format } = req.body;
      const options = {
        width: width ? parseInt(width) : undefined,
        height: height ? parseInt(height) : undefined,
        quality: quality ? parseInt(quality) : undefined,
        format: format as 'jpeg' | 'png' | 'webp' | undefined,
      };

      const processedBuffer = await fileUploadService.processImage(req.file.buffer, options);

      res.set({
        'Content-Type': `image/${format || 'jpeg'}`,
        'Content-Length': processedBuffer.length.toString(),
      });

      res.send(processedBuffer);
    } catch (error) {
      logger.error('Error processing image', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to process image',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

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

      const extractedText = await fileUploadService.extractImageText(req.file.buffer);

      res.json({
        success: true,
        data: {
          text: extractedText,
          confidence: 0.95, // Placeholder confidence score
        },
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

  // Get storage statistics
  async getStorageStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await fileUploadService.getStorageStats();

      res.json({
        success: true,
        data: stats,
        message: 'Storage statistics retrieved successfully',
      });
    } catch (error) {
      logger.error('Error getting storage stats', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve storage statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Cleanup old files
  async cleanupOldFiles(req: Request, res: Response): Promise<void> {
    try {
      const { daysOld = 30 } = req.body;
      const deletedCount = await fileUploadService.cleanupOldFiles(parseInt(daysOld));

      res.json({
        success: true,
        data: {
          deletedCount,
          daysOld: parseInt(daysOld),
        },
        message: `${deletedCount} old files cleaned up successfully`,
      });
    } catch (error) {
      logger.error('Error cleaning up old files', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to cleanup old files',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get signed URL for file access
  async getSignedUrl(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      const { expiresIn = 3600 } = req.query;

      const signedUrl = await fileUploadService.getSignedUrl(
        key,
        parseInt(expiresIn as string)
      );

      res.json({
        success: true,
        data: {
          signedUrl,
          expiresIn: parseInt(expiresIn as string),
        },
        message: 'Signed URL generated successfully',
      });
    } catch (error) {
      logger.error('Error generating signed URL', { error, params: req.params });
      res.status(500).json({
        success: false,
        message: 'Failed to generate signed URL',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const fileUploadController = new FileUploadController();