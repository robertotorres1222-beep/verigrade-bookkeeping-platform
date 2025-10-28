import { Router } from 'express';
import revenueRecognitionController from '../controllers/revenueRecognitionController';

const router = Router();

// Revenue Recognition
router.post('/recognize/:contractId', revenueRecognitionController.recognizeRevenue);

// Performance Obligations
router.put('/obligation/:obligationId', revenueRecognitionController.trackPerformanceObligation);

// Contract Modifications
router.put('/contract/:contractId/modify', revenueRecognitionController.handleContractModification);

// Multi-Element Arrangements
router.post('/contract/:contractId/multi-element', revenueRecognitionController.handleMultiElementArrangement);

// Usage-Based Revenue
router.post('/usage/:contractId', revenueRecognitionController.recognizeUsageBasedRevenue);

// Reports
router.get('/waterfall/:contractId', revenueRecognitionController.generateRevenueWaterfallReport);

// Alerts
router.get('/renewal-alerts/:userId', revenueRecognitionController.checkRenewalAlerts);

export default router;










