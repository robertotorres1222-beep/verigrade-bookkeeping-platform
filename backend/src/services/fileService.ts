import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs';

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// File upload service
export const uploadFile = async (file: Express.Multer.File, folder: string): Promise<string> => {
  try {
    const fileId = uuidv4();
    const fileExtension = path.extname(file.originalname);
    const fileName = `${fileId}${fileExtension}`;
    
    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'uploads', folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, fileName);
    
    // Process image files with sharp
    if (file.mimetype.startsWith('image/')) {
      await sharp(file.buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toFile(filePath);
    } else {
      // For PDFs, write directly
      fs.writeFileSync(filePath, file.buffer);
    }
    
    // Return relative path for database storage
    return `uploads/${folder}/${fileName}`;
  } catch (error) {
    logger.error('File upload error:', error);
    throw new Error('Failed to upload file');
  }
};

// File deletion service
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      logger.info(`File deleted: ${filePath}`);
    }
  } catch (error) {
    logger.error('File deletion error:', error);
    throw new Error('Failed to delete file');
  }
};

// Get file info
export const getFileInfo = (filePath: string) => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    
    const stats = fs.statSync(fullPath);
    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      path: filePath,
    };
  } catch (error) {
    logger.error('File info error:', error);
    return null;
  }
};

// Serve file (for development)
export const serveFile = (filePath: string): string => {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error('File not found');
  }
  return fullPath;
};

// AWS S3 integration (for production)
export const uploadToS3 = async (_file: Express.Multer.File, _folder: string): Promise<string> => {
  // TODO: Implement AWS S3 upload
  // This would be used in production instead of local file storage
  throw new Error('S3 upload not implemented yet');
};

export const deleteFromS3 = async (_filePath: string): Promise<void> => {
  // TODO: Implement AWS S3 deletion
  throw new Error('S3 deletion not implemented yet');
};
