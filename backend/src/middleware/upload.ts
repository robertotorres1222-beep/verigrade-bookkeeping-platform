import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import FileUploadService from '../services/fileUploadService';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`));
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10, // Maximum 10 files per request
  },
});

// Middleware for single file upload
export const uploadSingle = (fieldName: string = 'file') => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        logger.error('Multer error:', err);
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        });
      } else if (err) {
        logger.error('Upload error:', err);
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      return next();
    });
  };
};

// Middleware for multiple file upload
export const uploadMultiple = (fieldName: string = 'files', maxCount: number = 10) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        logger.error('Multer error:', err);
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        });
      } else if (err) {
        logger.error('Upload error:', err);
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      return next();
    });
  };
};

// Middleware for fields upload (multiple fields with different names)
export const uploadFields = (fields: multer.Field[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.fields(fields)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        logger.error('Multer error:', err);
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        });
      } else if (err) {
        logger.error('Upload error:', err);
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      return next();
    });
  };
};

// Middleware to validate file after upload
export const validateUploadedFile = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file && !req.files) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
  }
  // Validate single file
  if (req.file) {
    try {
      const fileUploadService = new FileUploadService({
        provider: process.env.FILE_STORAGE_PROVIDER as 's3' | 'r2' || 's3',
        bucket: process.env.FILE_STORAGE_BUCKET || '',
        region: process.env.FILE_STORAGE_REGION || 'us-east-1',
        accessKeyId: process.env.FILE_STORAGE_ACCESS_KEY || '',
        secretAccessKey: process.env.FILE_STORAGE_SECRET_KEY || '',
        endpoint: process.env.FILE_STORAGE_ENDPOINT,
      });

      fileUploadService.validateFile(req.file);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'File validation failed',
      });
    }
  }

  // Validate multiple files
  if (req.files && Array.isArray(req.files)) {
    try {
      const fileUploadService = new FileUploadService({
        provider: process.env.FILE_STORAGE_PROVIDER as 's3' | 'r2' || 's3',
        bucket: process.env.FILE_STORAGE_BUCKET || '',
        region: process.env.FILE_STORAGE_REGION || 'us-east-1',
        accessKeyId: process.env.FILE_STORAGE_ACCESS_KEY || '',
        secretAccessKey: process.env.FILE_STORAGE_SECRET_KEY || '',
        endpoint: process.env.FILE_STORAGE_ENDPOINT,
      });

      for (const file of req.files) {
        fileUploadService.validateFile(file);
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'File validation failed',
      });
    }
  }

  return next();
};

// Middleware to add file metadata to request
export const addFileMetadata = (req: Request, res: Response, next: NextFunction) => {
  if (req.file) {
    (req.file as any).metadata = {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date().toISOString(),
    };
  }

  if (req.files && Array.isArray(req.files)) {
    req.files.forEach(file => {
      (file as any).metadata = {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };
    });
  }

  return next();
};

// Error handling middleware for upload errors
export const handleUploadError = (error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Upload error:', error);

  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 10MB.',
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum is 10 files per request.',
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected field name for file upload.',
        });
      default:
        return res.status(400).json({
          success: false,
          message: `Upload error: ${error.message}`,
        });
    }
  }

  return res.status(500).json({
    success: false,
    message: 'Internal server error during file upload',
  });
};

export default upload;
