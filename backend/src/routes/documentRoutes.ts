import express from 'express';
import {
  uploadDocument,
  getDocument,
  getDocuments,
  updateDocument,
  deleteDocument,
  uploadNewVersion,
  getDocumentVersion,
  getDocumentUrl,
  getDocumentDownloadUrl,
  searchDocuments,
  getDocumentStats,
  getPresignedUploadUrl,
  upload,
} from '../controllers/documentController';
import { authenticateToken } from '../middleware/auth';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

// Upload document
router.post(
  '/upload',
  authenticateToken,
  upload.single('file'),
  [
    body('description').optional().isString().isLength({ max: 500 }),
    body('category').optional().isString().isLength({ max: 50 }),
    body('tags').optional().isString(),
    body('folder').optional().isString().isLength({ max: 100 }),
  ],
  validateRequest,
  uploadDocument
);

// Get presigned upload URL
router.post(
  '/presigned-upload',
  authenticateToken,
  [
    body('fileName').isString().isLength({ min: 1, max: 255 }),
    body('contentType').isString().isLength({ min: 1, max: 100 }),
    body('folder').optional().isString().isLength({ max: 100 }),
  ],
  validateRequest,
  getPresignedUploadUrl
);

// Get documents
router.get(
  '/',
  authenticateToken,
  [
    query('category').optional().isString(),
    query('tags').optional().isString(),
    query('search').optional().isString(),
    query('isPublic').optional().isBoolean(),
  ],
  validateRequest,
  getDocuments
);

// Search documents
router.get(
  '/search',
  authenticateToken,
  [
    query('q').isString().isLength({ min: 1 }).withMessage('Search query is required'),
  ],
  validateRequest,
  searchDocuments
);

// Get document statistics
router.get(
  '/stats',
  authenticateToken,
  getDocumentStats
);

// Get document by ID
router.get(
  '/:id',
  authenticateToken,
  [param('id').isUUID().withMessage('Invalid document ID')],
  validateRequest,
  getDocument
);

// Get document URL
router.get(
  '/:id/url',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Invalid document ID'),
    query('version').optional().isInt({ min: 1 }),
  ],
  validateRequest,
  getDocumentUrl
);

// Get document download URL
router.get(
  '/:id/download',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Invalid document ID'),
    query('version').optional().isInt({ min: 1 }),
  ],
  validateRequest,
  getDocumentDownloadUrl
);

// Get document version
router.get(
  '/:id/versions/:version',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Invalid document ID'),
    param('version').isInt({ min: 1 }).withMessage('Invalid version number'),
  ],
  validateRequest,
  getDocumentVersion
);

// Update document
router.put(
  '/:id',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Invalid document ID'),
    body('name').optional().isString().isLength({ min: 1, max: 255 }),
    body('description').optional().isString().isLength({ max: 500 }),
    body('category').optional().isString().isLength({ max: 50 }),
    body('tags').optional().isArray(),
    body('isPublic').optional().isBoolean(),
    body('permissions').optional().isObject(),
  ],
  validateRequest,
  updateDocument
);

// Upload new version
router.post(
  '/:id/versions',
  authenticateToken,
  upload.single('file'),
  [
    param('id').isUUID().withMessage('Invalid document ID'),
    body('description').optional().isString().isLength({ max: 500 }),
    body('category').optional().isString().isLength({ max: 50 }),
    body('tags').optional().isString(),
    body('folder').optional().isString().isLength({ max: 100 }),
  ],
  validateRequest,
  uploadNewVersion
);

// Delete document
router.delete(
  '/:id',
  authenticateToken,
  [param('id').isUUID().withMessage('Invalid document ID')],
  validateRequest,
  deleteDocument
);

export default router;