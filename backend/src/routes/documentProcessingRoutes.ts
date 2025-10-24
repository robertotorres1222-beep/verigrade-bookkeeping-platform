import { Router } from 'express';
import * as documentProcessingController from '../controllers/documentProcessingController';
import { uploadSingle, uploadMultiple, validateUploadedFile, addFileMetadata } from '../middleware/upload';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Process single document
router.post(
  '/process',
  authenticateToken,
  uploadSingle('file'),
  validateUploadedFile,
  addFileMetadata,
  documentProcessingController.processDocument
);

// Batch process multiple documents
router.post(
  '/batch-process',
  authenticateToken,
  uploadMultiple('files', 10),
  validateUploadedFile,
  addFileMetadata,
  documentProcessingController.batchProcessDocuments
);

// Extract text from document
router.post(
  '/extract-text',
  authenticateToken,
  uploadSingle('file'),
  validateUploadedFile,
  addFileMetadata,
  documentProcessingController.extractTextFromDocument
);

// Extract receipt data
router.post(
  '/extract-receipt',
  authenticateToken,
  uploadSingle('file'),
  validateUploadedFile,
  addFileMetadata,
  documentProcessingController.extractReceiptData
);

// Extract invoice data
router.post(
  '/extract-invoice',
  authenticateToken,
  uploadSingle('file'),
  validateUploadedFile,
  addFileMetadata,
  documentProcessingController.extractInvoiceData
);

// Get documents requiring review
router.get(
  '/review-required',
  authenticateToken,
  documentProcessingController.getDocumentsRequiringReview
);

// Update document review status
router.put(
  '/:documentId/review',
  authenticateToken,
  documentProcessingController.updateDocumentReview
);

export default router;







