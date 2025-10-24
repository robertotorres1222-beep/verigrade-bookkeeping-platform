import express from 'express';
import {
  getDocumentForViewing,
  processDocumentOCR,
  getDocumentAnnotations,
  createDocumentAnnotation,
  updateDocumentAnnotation,
  deleteDocumentAnnotation,
  searchDocumentText,
  getDocumentOCR,
  getDocumentConfidence,
  exportDocumentWithAnnotations,
} from '../controllers/documentViewerController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Document viewing
router.get('/:id', getDocumentForViewing);

// OCR processing
router.post('/:id/ocr', processDocumentOCR);
router.get('/:id/ocr', getDocumentOCR);
router.get('/:id/confidence', getDocumentConfidence);

// Annotations
router.get('/:id/annotations', getDocumentAnnotations);
router.post('/:id/annotations', createDocumentAnnotation);
router.put('/:id/annotations/:annotationId', updateDocumentAnnotation);
router.delete('/:id/annotations/:annotationId', deleteDocumentAnnotation);

// Text search
router.get('/:id/search', searchDocumentText);

// Export
router.get('/:id/export', exportDocumentWithAnnotations);

export default router;

