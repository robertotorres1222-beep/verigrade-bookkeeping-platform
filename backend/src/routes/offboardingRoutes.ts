import { Router } from 'express';
import { offboardingController } from '../controllers/offboardingController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Offboarding routes
router.post('/offboarding/start', authenticate, offboardingController.startClientOffboarding);
router.get('/offboarding/processes', authenticate, offboardingController.getOffboardingProcesses);
router.put('/offboarding/:offboardingId/tasks/:taskId', authenticate, offboardingController.updateOffboardingTask);
router.put('/offboarding/:offboardingId/complete', authenticate, offboardingController.completeOffboarding);
router.get('/offboarding/templates', authenticate, offboardingController.getOffboardingTemplates);
router.get('/offboarding/statistics', authenticate, offboardingController.getOffboardingStatistics);

export default router;

