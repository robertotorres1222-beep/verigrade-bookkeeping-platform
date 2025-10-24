import express from 'express';
import {
  uploadFile,
  getFile,
  deleteFile,
  searchFilesByText,
  getFileStats,
  bulkUploadFiles,
  getFileDownloadUrl,
  processReceipt,
  upload,
} from '../controllers/enhancedDocumentController';
import { authenticateToken } from '../middleware/auth';
import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * POST /api/enhanced-documents/upload
 * Upload a single file with enhanced processing
 */
router.post(
  '/upload',
  upload.single('file'),
  [
    body('description').optional().isString().isLength({ max: 500 }),
    body('category').optional().isString().isLength({ max: 50 }),
    body('tags').optional().isString(),
    body('folder').optional().isString().isLength({ max: 100 }),
    body('isPublic').optional().isBoolean(),
  ],
  handleValidationErrors,
  uploadFile
);

/**
 * POST /api/enhanced-documents/bulk-upload
 * Upload multiple files at once
 */
router.post(
  '/bulk-upload',
  upload.array('files', 10), // Max 10 files
  [
    body('description').optional().isString().isLength({ max: 500 }),
    body('category').optional().isString().isLength({ max: 50 }),
    body('tags').optional().isString(),
    body('folder').optional().isString().isLength({ max: 100 }),
    body('isPublic').optional().isBoolean(),
  ],
  handleValidationErrors,
  bulkUploadFiles
);

/**
 * POST /api/enhanced-documents/process-receipt
 * Upload and process a receipt with OCR
 */
router.post(
  '/process-receipt',
  upload.single('file'),
  processReceipt
);

/**
 * GET /api/enhanced-documents/:id
 * Get file by ID
 */
router.get(
  '/:id',
  [param('id').isUUID().withMessage('Invalid file ID')],
  handleValidationErrors,
  getFile
);

/**
 * GET /api/enhanced-documents/:id/download
 * Get file download URL
 */
router.get(
  '/:id/download',
  [
    param('id').isUUID().withMessage('Invalid file ID'),
    query('expiresIn').optional().isInt({ min: 300, max: 86400 }),
  ],
  handleValidationErrors,
  getFileDownloadUrl
);

/**
 * DELETE /api/enhanced-documents/:id
 * Delete file
 */
router.delete(
  '/:id',
  [param('id').isUUID().withMessage('Invalid file ID')],
  handleValidationErrors,
  deleteFile
);

/**
 * GET /api/enhanced-documents/search/text
 * Search files by OCR text content
 */
router.get(
  '/search/text',
  [
    query('q').isString().isLength({ min: 1 }).withMessage('Search query is required'),
  ],
  handleValidationErrors,
  searchFilesByText
);

/**
 * GET /api/enhanced-documents/stats
 * Get file statistics
 */
router.get(
  '/stats',
  getFileStats
);

export default router;
