import { Router } from 'express';
import { uxController } from '../controllers/uxController';

const router = Router();

// Onboarding Wizard
router.post('/onboarding/start', uxController.startOnboarding);
router.post('/onboarding/step', uxController.completeOnboardingStep);
router.get('/onboarding/status', uxController.getOnboardingStatus);

// Product Tours
router.post('/tours/start', uxController.startProductTour);
router.post('/tours/complete', uxController.completeProductTour);
router.get('/tours/available', uxController.getAvailableTours);

// Keyboard Shortcuts
router.get('/shortcuts', uxController.getKeyboardShortcuts);
router.post('/shortcuts', uxController.setKeyboardShortcuts);

// Advanced Search
router.post('/search', uxController.performAdvancedSearch);
router.get('/search/suggestions', uxController.getSearchSuggestions);

// Bulk Operations
router.post('/bulk/execute', uxController.executeBulkOperation);
router.get('/bulk/status', uxController.getBulkOperationStatus);

// Undo/Redo
router.post('/undo', uxController.undoAction);
router.post('/redo', uxController.redoAction);
router.get('/history', uxController.getActionHistory);

export default router;