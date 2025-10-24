import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';
import path from 'path';
import fs from 'fs';

// S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'verigrade-uploads';
const CLOUDFLARE_R2_ENDPOINT = process.env.CLOUDFLARE_R2_ENDPOINT;
const CLOUDFLARE_R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const CLOUDFLARE_R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

// Use CloudFlare R2 if configured, otherwise use AWS S3
const isUsingR2 = CLOUDFLARE_R2_ENDPOINT && CLOUDFLARE_R2_ACCESS_KEY_ID && CLOUDFLARE_R2_SECRET_ACCESS_KEY;

const r2Client = isUsingR2 ? new S3Client({
  region: 'auto',
  endpoint: CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
}) : null;

const client = isUsingR2 ? r2Client! : s3Client;

export interface FileUploadResult {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  metadata: Record<string, any>;
  uploadedAt: Date;
}

export interface FileMetadata {
  id: string;
  userId: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  metadata: Record<string, any>;
  category: 'receipt' | 'invoice' | 'document' | 'profile' | 'logo' | 'other';
  tags: string[];
  isPublic: boolean;
  expiresAt?: Date;
  uploadedAt: Date;
  updatedAt: Date;
}

export class FileUploadService {
  private uploadDir = 'uploads';
  private maxFileSize = 50 * 1024 * 1024; // 50MB
  private allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  // Configure multer for file uploads
  private storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), this.uploadDir);
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${uuidv4()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  });

  private fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (this.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  };

  public upload = multer({
    storage: this.storage,
    fileFilter: this.fileFilter,
    limits: {
      fileSize: this.maxFileSize,
    },
  });

  // Upload file to S3/R2
  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    category: 'receipt' | 'invoice' | 'document' | 'profile' | 'logo' | 'other' = 'other',
    tags: string[] = [],
    isPublic: boolean = false
  ): Promise<FileUploadResult> {
    try {
      const fileId = uuidv4();
      const fileExtension = path.extname(file.originalname);
      const fileName = `${fileId}${fileExtension}`;
      const key = `uploads/${userId}/${category}/${fileName}`;

      // Process image files
      let processedBuffer = file.buffer;
      let thumbnailBuffer: Buffer | undefined;

      if (file.mimetype.startsWith('image/')) {
        // Resize and optimize image
        processedBuffer = await sharp(file.buffer)
          .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();

        // Create thumbnail
        thumbnailBuffer = await sharp(file.buffer)
          .resize(300, 300, { fit: 'cover' })
          .jpeg({ quality: 80 })
          .toBuffer();
      }

      // Upload main file
      const uploadCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: processedBuffer,
        ContentType: file.mimetype,
        Metadata: {
          userId,
          category,
          originalName: file.originalname,
          uploadedAt: new Date().toISOString(),
        },
        ACL: isPublic ? 'public-read' : 'private',
      });

      await client.send(uploadCommand);

      // Upload thumbnail if it exists
      let thumbnailUrl: string | undefined;
      if (thumbnailBuffer) {
        const thumbnailKey = `thumbnails/${userId}/${category}/${fileId}_thumb.jpg`;
        const thumbnailCommand = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: thumbnailKey,
          Body: thumbnailBuffer,
          ContentType: 'image/jpeg',
          ACL: isPublic ? 'public-read' : 'private',
        });

        await client.send(thumbnailCommand);
        thumbnailUrl = await this.getSignedUrl(thumbnailKey);
      }

      const url = await this.getSignedUrl(key);
      const metadata = {
        width: file.mimetype.startsWith('image/') ? await this.getImageDimensions(processedBuffer) : undefined,
        height: file.mimetype.startsWith('image/') ? await this.getImageDimensions(processedBuffer) : undefined,
        tags,
        category,
        isPublic,
      };

      const result: FileUploadResult = {
        id: fileId,
        originalName: file.originalname,
        fileName,
        mimeType: file.mimetype,
        size: processedBuffer.length,
        url,
        thumbnailUrl,
        metadata,
        uploadedAt: new Date(),
      };

      logger.info('File uploaded successfully', { fileId, userId, category, size: result.size });
      return result;
    } catch (error) {
      logger.error('Error uploading file', { error, userId, fileName: file.originalname });
      throw error;
    }
  }

  // Get signed URL for file access
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      const signedUrl = await getSignedUrl(client, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      logger.error('Error generating signed URL', { error, key });
      throw error;
    }
  }

  // Delete file from S3/R2
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await client.send(command);
      logger.info('File deleted successfully', { key });
    } catch (error) {
      logger.error('Error deleting file', { error, key });
      throw error;
    }
  }

  // List files for a user
  async listUserFiles(
    userId: string,
    category?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ files: FileMetadata[]; total: number }> {
    try {
      const prefix = `uploads/${userId}/${category || ''}`;
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: prefix,
        MaxKeys: limit,
        ContinuationToken: offset > 0 ? `token-${offset}` : undefined,
      });

      const response = await client.send(command);
      const files: FileMetadata[] = [];

      if (response.Contents) {
        for (const object of response.Contents) {
          if (object.Key && object.LastModified) {
            const metadata: FileMetadata = {
              id: path.basename(object.Key, path.extname(object.Key)),
              userId,
              originalName: object.Key.split('/').pop() || '',
              fileName: object.Key.split('/').pop() || '',
              mimeType: this.getMimeTypeFromExtension(path.extname(object.Key)),
              size: object.Size || 0,
              url: await this.getSignedUrl(object.Key),
              category: this.getCategoryFromKey(object.Key),
              tags: [],
              isPublic: false,
              uploadedAt: object.LastModified,
              updatedAt: object.LastModified,
              metadata: {},
            };
            files.push(metadata);
          }
        }
      }

      return { files, total: response.KeyCount || 0 };
    } catch (error) {
      logger.error('Error listing user files', { error, userId, category });
      throw error;
    }
  }

  // Generate presigned URL for direct upload
  async generatePresignedUploadUrl(
    userId: string,
    fileName: string,
    mimeType: string,
    category: string = 'other'
  ): Promise<{ uploadUrl: string; fileId: string; key: string }> {
    try {
      const fileId = uuidv4();
      const fileExtension = path.extname(fileName);
      const key = `uploads/${userId}/${category}/${fileId}${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: mimeType,
        Metadata: {
          userId,
          category,
          originalName: fileName,
          uploadedAt: new Date().toISOString(),
        },
      });

      const uploadUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
      
      return {
        uploadUrl,
        fileId,
        key,
      };
    } catch (error) {
      logger.error('Error generating presigned upload URL', { error, userId, fileName });
      throw error;
    }
  }

  // Process and optimize image
  async processImage(
    buffer: Buffer,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp';
    } = {}
  ): Promise<Buffer> {
    try {
      const { width = 1920, height = 1080, quality = 85, format = 'jpeg' } = options;

      let sharpInstance = sharp(buffer).resize(width, height, { 
        fit: 'inside', 
        withoutEnlargement: true 
      });

      switch (format) {
        case 'jpeg':
          sharpInstance = sharpInstance.jpeg({ quality });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({ quality });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp({ quality });
          break;
      }

      return await sharpInstance.toBuffer();
    } catch (error) {
      logger.error('Error processing image', { error });
      throw error;
    }
  }

  // Extract text from image (OCR preparation)
  async extractImageText(buffer: Buffer): Promise<string> {
    try {
      // This would integrate with OCR service like Tesseract.js or Google Vision API
      // For now, return placeholder
      logger.info('OCR text extraction requested', { bufferSize: buffer.length });
      return 'OCR text extraction not implemented yet';
    } catch (error) {
      logger.error('Error extracting text from image', { error });
      throw error;
    }
  }

  // Get image dimensions
  private async getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
    try {
      const metadata = await sharp(buffer).metadata();
      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
      };
    } catch (error) {
      logger.error('Error getting image dimensions', { error });
      return { width: 0, height: 0 };
    }
  }

  // Get MIME type from file extension
  private getMimeTypeFromExtension(extension: string): string {
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  // Get category from S3 key
  private getCategoryFromKey(key: string): 'receipt' | 'invoice' | 'document' | 'profile' | 'logo' | 'other' {
    const pathParts = key.split('/');
    const category = pathParts[2]; // uploads/userId/category/filename

    const validCategories = ['receipt', 'invoice', 'document', 'profile', 'logo', 'other'];
    return validCategories.includes(category) ? category as any : 'other';
  }

  // Clean up old files
  async cleanupOldFiles(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: 'uploads/',
      });

      const response = await client.send(command);
      let deletedCount = 0;

      if (response.Contents) {
        for (const object of response.Contents) {
          if (object.Key && object.LastModified && object.LastModified < cutoffDate) {
            await this.deleteFile(object.Key);
            deletedCount++;
          }
        }
      }

      logger.info('Cleanup completed', { deletedCount, daysOld });
      return deletedCount;
    } catch (error) {
      logger.error('Error during cleanup', { error, daysOld });
      throw error;
    }
  }

  // Get storage statistics
  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    filesByCategory: Record<string, number>;
    filesByUser: Record<string, number>;
  }> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: 'uploads/',
      });

      const response = await client.send(command);
      let totalFiles = 0;
      let totalSize = 0;
      const filesByCategory: Record<string, number> = {};
      const filesByUser: Record<string, number> = {};

      if (response.Contents) {
        for (const object of response.Contents) {
          if (object.Key && object.Size) {
            totalFiles++;
            totalSize += object.Size;

            const pathParts = object.Key.split('/');
            if (pathParts.length >= 3) {
              const userId = pathParts[1];
              const category = pathParts[2];

              filesByUser[userId] = (filesByUser[userId] || 0) + 1;
              filesByCategory[category] = (filesByCategory[category] || 0) + 1;
            }
          }
        }
      }

      return {
        totalFiles,
        totalSize,
        filesByCategory,
        filesByUser,
      };
    } catch (error) {
      logger.error('Error getting storage stats', { error });
      throw error;
    }
  }
}

export const fileUploadService = new FileUploadService();