import { Router } from 'express';
import { ocrController } from '../controllers/ocrController';
import { fileUploadService } from '../services/fileUploadService';

const router = Router();

// Extract text from image
router.post('/extract-text', fileUploadService.upload.single('image'), ocrController.extractText);

// Extract receipt data
router.post('/extract-receipt', fileUploadService.upload.single('image'), ocrController.extractReceiptData);

// Extract invoice data
router.post('/extract-invoice', fileUploadService.upload.single('image'), ocrController.extractInvoiceData);

// Batch process multiple images
router.post('/batch-process', fileUploadService.upload.array('images', 10), ocrController.batchProcess);

// Get OCR statistics
router.get('/statistics', ocrController.getStatistics);

export default router;




