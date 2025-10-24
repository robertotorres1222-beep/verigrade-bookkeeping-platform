import { Router } from 'express';
import { taxDeadlineController } from '../controllers/taxDeadlineController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Tax deadline routes
router.get('/tax-deadlines', authenticate, taxDeadlineController.getTaxDeadlines);
router.post('/tax-deadlines', authenticate, taxDeadlineController.createTaxDeadline);
router.put('/tax-deadlines/:deadlineId', authenticate, taxDeadlineController.updateTaxDeadline);
router.put('/tax-deadlines/:deadlineId/complete', authenticate, taxDeadlineController.completeTaxDeadline);
router.get('/tax-deadlines/calendar', authenticate, taxDeadlineController.getTaxDeadlineCalendar);
router.get('/tax-deadlines/statistics', authenticate, taxDeadlineController.getTaxDeadlineStatistics);

export default router;

