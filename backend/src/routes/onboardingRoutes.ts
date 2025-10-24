import { Router } from 'express';
import { onboardingController } from '../controllers/onboardingController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Onboarding routes
router.post('/onboarding/workflows', authenticate, onboardingController.createOnboardingWorkflow);
router.post('/onboarding/start', authenticate, onboardingController.startClientOnboarding);
router.put('/onboarding/:onboardingId/steps/:stepId', authenticate, onboardingController.updateOnboardingStep);
router.put('/onboarding/:onboardingId/complete', authenticate, onboardingController.completeOnboarding);
router.get('/onboarding/templates', authenticate, onboardingController.getOnboardingTemplates);
router.get('/onboarding/statistics', authenticate, onboardingController.getOnboardingStatistics);

export default router;

