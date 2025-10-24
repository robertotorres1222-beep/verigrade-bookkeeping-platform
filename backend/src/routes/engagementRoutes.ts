import { Router } from 'express';
import { engagementController } from '../controllers/engagementController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Engagement letter routes
router.post('/engagement-letters', authenticate, engagementController.createEngagementLetter);
router.get('/engagement-letters', authenticate, engagementController.getEngagementLetters);
router.put('/engagement-letters/:letterId', authenticate, engagementController.updateEngagementLetter);
router.put('/engagement-letters/:letterId/sign', authenticate, engagementController.signEngagementLetter);
router.post('/engagement-letters/:letterId/pdf', authenticate, engagementController.generateEngagementLetterPDF);
router.get('/engagement-letters/templates', authenticate, engagementController.getEngagementLetterTemplates);
router.get('/engagement-letters/statistics', authenticate, engagementController.getEngagementStatistics);

export default router;

