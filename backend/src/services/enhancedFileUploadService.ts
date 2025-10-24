import { S3Service } from './s3Service';
import ocrService from './ocrService';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/errorHandler';
import { prisma } from '../config/database';

interface FileUploadOptions {
  fileName: string;
  fileSize: number;
  contentType: string;
  fileBuffer: Buffer;
  folder?: string;
  metadata?: {
    description?: string;
    category?: string;
    tags?: string[];
    isPublic?: boolean;
    organizationId: string;
    uploadedBy: string;
  };
}

interface ProcessedFile {
  id: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  s3Key: string;
  s3Url: string;
  thumbnailUrl?: string | undefined;
  ocrData?: {
    extractedText: string;
    confidence: number;
    boundingBoxes: any[];
  } | undefined;
  imageMetadata?: {
    width: number;
    height: number;
    format: string;
    hasAlpha: boolean;
  } | undefined;
  uploadedAt: Date;
  uploadedBy: string;
  organizationId: string;
}

export class EnhancedFileUploadService {
  private s3Service: S3Service;

  constructor() {
    // Initialize S3 service with environment variables
    this.s3Service = new S3Service({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      region: process.env.AWS_REGION || 'us-east-1',
      bucket: process.env.AWS_S3_BUCKET || 'verigrade-documents'
    });
  }

  /**
   * Upload file with enhanced processing
   */
  async uploadFile(options: FileUploadOptions): Promise<ProcessedFile> {
    try {
      const fileId = uuidv4();
      const timestamp = Date.now();
      const fileExtension = this.getFileExtension(options.fileName);
      const sanitizedFileName = this.sanitizeFileName(options.fileName);
      
      // Generate S3 key
      const s3Key = `${options.metadata?.organizationId}/${options.folder || 'documents'}/${fileId}-${timestamp}-${sanitizedFileName}`;
      
      let processedBuffer = options.fileBuffer;
      let thumbnailUrl: string | undefined;
      let imageMetadata: any;
      let ocrData: any;

      // Process image files
      if (this.isImageFile(options.contentType)) {
        const imageProcessing = await this.processImage(options.fileBuffer, options.contentType);
        processedBuffer = imageProcessing.optimizedBuffer;
        imageMetadata = imageProcessing.metadata;
        
        // Generate thumbnail
        if (imageProcessing.thumbnailBuffer) {
          const thumbnailKey = `${options.metadata?.organizationId}/thumbnails/${fileId}-${timestamp}-thumb.jpg`;
          await this.s3Service.uploadFile(
            imageProcessing.thumbnailBuffer,
            `thumb-${sanitizedFileName}`,
            'image/jpeg',
            options.metadata?.organizationId || '',
            'thumbnails'
          );
          thumbnailUrl = await this.s3Service.generatePresignedUrl(thumbnailKey, 3600);
        }

        // Perform OCR on images
        if (this.shouldPerformOCR(options.contentType, options.fileName)) {
          try {
            const ocrResult = await ocrService.extractText(options.fileBuffer, {
              language: 'eng',
              isOverlayRequired: true
            });
            ocrData = {
              extractedText: ocrResult.text,
              confidence: ocrResult.confidence,
              boundingBoxes: ocrResult.boundingBoxes
            };
          } catch (ocrError) {
            console.warn('OCR processing failed:', ocrError);
            // Continue without OCR data
          }
        }
      }

      // Process PDF files
      if (options.contentType === 'application/pdf') {
        if (this.shouldPerformOCR(options.contentType, options.fileName)) {
          try {
            const ocrResult = await ocrService.extractTextFromPDF(options.fileBuffer, {
              language: 'eng',
              isOverlayRequired: true
            });
            ocrData = {
              extractedText: ocrResult.text,
              confidence: ocrResult.confidence,
              boundingBoxes: ocrResult.boundingBoxes
            };
          } catch (ocrError) {
            console.warn('PDF OCR processing failed:', ocrError);
          }
        }
      }

      // Upload to S3
      const uploadResult = await this.s3Service.uploadFile(
        processedBuffer,
        sanitizedFileName,
        options.contentType,
        options.metadata?.organizationId || '',
        options.folder || 'documents'
      );

      // Generate presigned URL for access
      const s3Url = await this.s3Service.generatePresignedUrl(uploadResult.key, 3600);

      // Create database record
      const processedFile: ProcessedFile = {
        id: fileId,
        fileName: sanitizedFileName,
        fileSize: processedBuffer.length,
        contentType: options.contentType,
        s3Key: uploadResult.key,
        s3Url,
        thumbnailUrl,
        ocrData,
        imageMetadata,
        uploadedAt: new Date(),
        uploadedBy: options.metadata?.uploadedBy || '',
        organizationId: options.metadata?.organizationId || ''
      };

      // Store in database
      await this.storeFileRecord(processedFile, options.metadata);

      return processedFile;
    } catch (error) {
      console.error('Enhanced file upload error:', error);
      throw new AppError('Failed to upload file', 500);
    }
  }

  /**
   * Process image files with optimization and thumbnail generation
   */
  private async processImage(buffer: Buffer, contentType: string): Promise<{
    optimizedBuffer: Buffer;
    thumbnailBuffer?: Buffer;
    metadata: any;
  }> {
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();
      
      // Optimize image (compress if too large)
      let optimizedBuffer = buffer;
      if (metadata.width && metadata.width > 1920) {
        optimizedBuffer = await image
          .resize(1920, null, { withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();
      }

      // Generate thumbnail
      const thumbnailBuffer = await image
        .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

      return {
        optimizedBuffer,
        thumbnailBuffer,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          hasAlpha: metadata.hasAlpha,
          size: optimizedBuffer.length
        }
      };
    } catch (error) {
      console.error('Image processing error:', error);
      // Return original buffer if processing fails
      return {
        optimizedBuffer: buffer,
        metadata: {}
      };
    }
  }

  /**
   * Store file record in database
   */
  private async storeFileRecord(file: ProcessedFile, metadata?: any): Promise<void> {
    try {
      await prisma.uploadedFile.create({
        data: {
          id: file.id,
          organizationId: file.organizationId,
          userId: file.uploadedBy,
          fileName: file.fileName,
          originalName: file.fileName,
          filePath: file.s3Key,
          fileUrl: file.s3Url,
          mimeType: file.contentType,
          fileSize: file.fileSize,
          type: metadata?.category || 'DOCUMENT'
        }
      });
    } catch (error) {
      console.error('Database storage error:', error);
      // Don't throw error here to avoid breaking the upload process
    }
  }

  /**
   * Get file by ID
   */
  async getFile(fileId: string, userId: string): Promise<ProcessedFile | null> {
    try {
      const fileRecord = await prisma.uploadedFile.findFirst({
        where: {
          id: fileId,
          userId
        }
      });

      if (!fileRecord) {
        return null;
      }

      // Generate fresh presigned URL
      const s3Url = await this.s3Service.generatePresignedUrl(fileRecord.filePath, 3600);
      const thumbnailUrl = undefined; // Not stored in current schema

      return {
        id: fileRecord.id,
        fileName: fileRecord.fileName,
        fileSize: fileRecord.fileSize,
        contentType: fileRecord.mimeType,
        s3Key: fileRecord.filePath,
        s3Url,
        thumbnailUrl,
        ocrData: undefined, // Not stored in current schema
        imageMetadata: undefined, // Not stored in current schema
        uploadedAt: fileRecord.createdAt,
        uploadedBy: fileRecord.userId,
        organizationId: fileRecord.organizationId
      };
    } catch (error) {
      console.error('Get file error:', error);
      throw new AppError('Failed to retrieve file', 500);
    }
  }

  /**
   * Delete file
   */
  async deleteFile(fileId: string, userId: string): Promise<void> {
    try {
      const fileRecord = await prisma.uploadedFile.findFirst({
        where: {
          id: fileId,
          userId
        }
      });

      if (!fileRecord) {
        throw new AppError('File not found', 404);
      }

      // Delete from S3
      await this.s3Service.deleteFile(fileRecord.filePath);

      // Delete from database
      await prisma.uploadedFile.delete({
        where: { id: fileId }
      });
    } catch (error) {
      console.error('Delete file error:', error);
      throw new AppError('Failed to delete file', 500);
    }
  }

  /**
   * Search files by OCR text
   */
  async searchFilesByText(organizationId: string, searchText: string): Promise<ProcessedFile[]> {
    try {
      const files = await prisma.uploadedFile.findMany({
        where: {
          organizationId,
          OR: [
            { fileName: { contains: searchText, mode: 'insensitive' } },
            { originalName: { contains: searchText, mode: 'insensitive' } }
          ]
        },
        orderBy: { createdAt: 'desc' }
      });

      return files.map(file => ({
        id: file.id,
        fileName: file.fileName,
        fileSize: file.fileSize,
        contentType: file.mimeType,
        s3Key: file.filePath,
        s3Url: '', // Will be generated when accessed
        thumbnailUrl: undefined,
        ocrData: undefined,
        imageMetadata: undefined,
        uploadedAt: file.createdAt,
        uploadedBy: file.userId,
        organizationId: file.organizationId
      }));
    } catch (error) {
      console.error('Search files error:', error);
      throw new AppError('Failed to search files', 500);
    }
  }

  /**
   * Get file statistics
   */
  async getFileStats(organizationId: string): Promise<{
    totalFiles: number;
    totalSize: number;
    byType: Array<{ type: string; count: number; size: number }>;
    byFolder: Array<{ folder: string; count: number; size: number }>;
  }> {
    try {
      const files = await prisma.uploadedFile.findMany({
        where: { organizationId }
      });

      const totalFiles = files.length;
      const totalSize = files.reduce((sum, file) => sum + file.fileSize, 0);

      // Group by content type
      const byType: Record<string, { count: number; size: number }> = {};
      files.forEach(file => {
        const type = file.mimeType?.split('/')[0] || 'unknown';
        if (!byType[type]) {
          byType[type] = { count: 0, size: 0 };
        }
        byType[type].count += 1;
        byType[type].size += file.fileSize;
      });

      // Group by type
      const byFolder: Record<string, { count: number; size: number }> = {};
      files.forEach(file => {
        const folder = file.type || 'documents';
        if (!byFolder[folder]) {
          byFolder[folder] = { count: 0, size: 0 };
        }
        byFolder[folder].count += 1;
        byFolder[folder].size += file.fileSize;
      });

      return {
        totalFiles,
        totalSize,
        byType: Object.entries(byType).map(([type, data]) => ({
          type,
          count: data.count,
          size: data.size
        })),
        byFolder: Object.entries(byFolder).map(([folder, data]) => ({
          folder,
          count: data.count,
          size: data.size
        }))
      };
    } catch (error) {
      console.error('Get file stats error:', error);
      throw new AppError('Failed to get file statistics', 500);
    }
  }

  /**
   * Utility methods
   */
  private getFileExtension(fileName: string): string {
    return fileName.split('.').pop()?.toLowerCase() || '';
  }

  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  private isImageFile(contentType: string): boolean {
    return contentType.startsWith('image/');
  }

  private shouldPerformOCR(contentType: string, fileName: string): boolean {
    const imageTypes = ['image/jpeg', 'image/png', 'image/tiff', 'image/bmp'];
    const documentTypes = ['application/pdf'];
    const ocrExtensions = ['.jpg', '.jpeg', '.png', '.tiff', '.bmp', '.pdf'];
    
    const fileExtension = this.getFileExtension(fileName);
    
    return imageTypes.includes(contentType) || 
           documentTypes.includes(contentType) ||
           ocrExtensions.includes(`.${fileExtension}`);
  }
}

export default new EnhancedFileUploadService();
