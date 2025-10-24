import { Router } from 'express';
import { qualityControlController } from '../controllers/qualityControlController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Quality control routes
router.get('/qc/checklists', authenticate, qualityControlController.getChecklists);
router.post('/qc/reviews', authenticate, qualityControlController.startReview);
router.put('/qc/reviews/:reviewId/items/:itemId', authenticate, qualityControlController.updateChecklistItem);
router.put('/qc/reviews/:reviewId/complete', authenticate, qualityControlController.completeReview);
router.get('/qc/statistics', authenticate, qualityControlController.getQCStatistics);

export default router;

