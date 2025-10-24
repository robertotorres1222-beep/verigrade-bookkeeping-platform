import { Router } from 'express';
import { fileUploadController } from '../controllers/fileUploadController';
import { fileUploadService } from '../services/fileUploadService';

const router = Router();

// Single file upload
router.post('/upload', fileUploadService.upload.single('file'), fileUploadController.uploadFile);

// Multiple files upload
router.post('/upload-multiple', fileUploadService.upload.array('files', 10), fileUploadController.uploadMultipleFiles);

// Generate presigned URL for direct upload
router.post('/presigned-url', fileUploadController.generatePresignedUrl);

// Get file by ID
router.get('/files/:fileId', fileUploadController.getFile);

// List user files
router.get('/files', fileUploadController.listUserFiles);

// Delete file
router.delete('/files/:fileId', fileUploadController.deleteFile);

// Process image
router.post('/process-image', fileUploadService.upload.single('image'), fileUploadController.processImage);

// Extract text from image (OCR)
router.post('/extract-text', fileUploadService.upload.single('image'), fileUploadController.extractText);

// Get storage statistics
router.get('/stats', fileUploadController.getStorageStats);

// Cleanup old files
router.post('/cleanup', fileUploadController.cleanupOldFiles);

// Get signed URL for file access
router.get('/signed-url/:key', fileUploadController.getSignedUrl);

export default router;