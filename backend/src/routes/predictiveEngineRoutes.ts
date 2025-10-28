import { Router } from 'express';
import predictiveEngineController from '../controllers/predictiveEngineController';

const router = Router();

// Predictive Analytics
router.get('/churn/:userId', predictiveEngineController.predictCustomerChurn);
router.get('/expansion/:userId', predictiveEngineController.detectExpansionOpportunities);
router.get('/downturn-risk/:userId', predictiveEngineController.calculateDownturnRisk);
router.get('/payment-failures/:userId', predictiveEngineController.predictPaymentFailures);
router.get('/ltv/:userId', predictiveEngineController.predictCustomerLTV);
router.get('/growth-forecast/:userId', predictiveEngineController.forecastGrowthTrajectory);

// Comprehensive Insights
router.get('/insights/:userId', predictiveEngineController.generateSaaSPredictiveInsights);

export default router;










