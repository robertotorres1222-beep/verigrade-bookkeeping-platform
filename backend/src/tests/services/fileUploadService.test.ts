import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { FileUploadService, createFileUploadService, defaultFileUploadConfig } from '../../services/fileUploadService';

describe('FileUploadService', () => {
  let fileUploadService: FileUploadService;
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    fileUploadService = createFileUploadService(defaultFileUploadConfig);
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should upload a file successfully', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('test-image-data'),
      } as Express.Multer.File;

      const result = await fileUploadService.uploadFile(mockFile, mockUserId);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('originalName', 'test.jpg');
      expect(result).toHaveProperty('fileName');
      expect(result).toHaveProperty('mimeType', 'image/jpeg');
      expect(result).toHaveProperty('size');
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('uploadedAt');
      expect(result).toHaveProperty('userId', mockUserId);
    });

    it('should process image files with thumbnail generation', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('test-image-data'),
      } as Express.Multer.File;

      const options = {
        generateThumbnail: true,
        maxWidth: 800,
        maxHeight: 600,
        quality: 90,
      };

      const result = await fileUploadService.uploadFile(mockFile, mockUserId, options);

      expect(result).toHaveProperty('thumbnailUrl');
      expect(result.metadata).toHaveProperty('width');
      expect(result.metadata).toHaveProperty('height');
    });

    it('should handle non-image files', async () => {
      const mockFile = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('test-pdf-data'),
      } as Express.Multer.File;

      const result = await fileUploadService.uploadFile(mockFile, mockUserId);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('mimeType', 'application/pdf');
      expect(result.thumbnailUrl).toBeUndefined();
    });
  });

  describe('getSignedUrl', () => {
    it('should generate signed URL for file access', async () => {
      const key = 'uploads/test-user/test-file.jpg';
      const expiresIn = 3600;

      const url = await fileUploadService.getSignedUrl(key, expiresIn);

      expect(url).toBe('https://mock-signed-url.com');
    });
  });

  describe('deleteFile', () => {
    it('should delete file from storage', async () => {
      const key = 'uploads/test-user/test-file.jpg';

      await expect(fileUploadService.deleteFile(key)).resolves.not.toThrow();
    });
  });

  describe('generatePresignedUploadUrl', () => {
    it('should generate presigned URL for direct upload', async () => {
      const fileName = 'test.jpg';
      const mimeType = 'image/jpeg';
      const expiresIn = 300;

      const result = await fileUploadService.generatePresignedUploadUrl(
        fileName,
        mimeType,
        mockUserId,
        expiresIn
      );

      expect(result).toHaveProperty('uploadUrl');
      expect(result).toHaveProperty('fileUrl');
      expect(result).toHaveProperty('fields');
      expect(result.fields).toHaveProperty('key');
      expect(result.fields).toHaveProperty('Content-Type', mimeType);
    });
  });

  describe('uploadMultipleFiles', () => {
    it('should upload multiple files', async () => {
      const mockFiles = [
        {
          originalname: 'test1.jpg',
          mimetype: 'image/jpeg',
          size: 1024,
          buffer: Buffer.from('test-image-data-1'),
        },
        {
          originalname: 'test2.jpg',
          mimetype: 'image/jpeg',
          size: 1024,
          buffer: Buffer.from('test-image-data-2'),
        },
      ] as Express.Multer.File[];

      const results = await fileUploadService.uploadMultipleFiles(mockFiles, mockUserId);

      expect(results).toHaveLength(2);
      expect(results[0]).toHaveProperty('id');
      expect(results[1]).toHaveProperty('id');
      expect(results[0].originalName).toBe('test1.jpg');
      expect(results[1].originalName).toBe('test2.jpg');
    });
  });

  describe('getFileMetadata', () => {
    it('should get file metadata', async () => {
      const key = 'uploads/test-user/test-file.jpg';

      const metadata = await fileUploadService.getFileMetadata(key);

      expect(metadata).toHaveProperty('contentType');
      expect(metadata).toHaveProperty('contentLength');
      expect(metadata).toHaveProperty('lastModified');
      expect(metadata).toHaveProperty('metadata');
    });
  });

  describe('validateFile', () => {
    it('should validate file type and size', () => {
      const validFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('test-data'),
      } as Express.Multer.File;

      expect(() => fileUploadService.validateFile(validFile)).not.toThrow();
    });

    it('should throw error for invalid file type', () => {
      const invalidFile = {
        originalname: 'test.exe',
        mimetype: 'application/x-executable',
        size: 1024,
        buffer: Buffer.from('test-data'),
      } as Express.Multer.File;

      expect(() => fileUploadService.validateFile(invalidFile)).toThrow('File type application/x-executable is not allowed');
    });

    it('should throw error for file too large', () => {
      const largeFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 20 * 1024 * 1024, // 20MB
        buffer: Buffer.from('test-data'),
      } as Express.Multer.File;

      expect(() => fileUploadService.validateFile(largeFile, 10 * 1024 * 1024)).toThrow('File size');
    });
  });
});






