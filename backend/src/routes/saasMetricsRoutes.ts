import { Router } from 'express';
import saasMetricsController from '../controllers/saasMetricsController';

const router = Router();

// SaaS Metrics Dashboard
router.get('/dashboard/:userId', saasMetricsController.getSaaSMetricsDashboard);

// Individual Metrics
router.get('/mrr/:userId', saasMetricsController.calculateMRR);
router.get('/arr/:userId', saasMetricsController.calculateARR);
router.get('/nrr/:userId', saasMetricsController.calculateNRR);
router.get('/grr/:userId', saasMetricsController.calculateGRR);
router.get('/quick-ratio/:userId', saasMetricsController.calculateQuickRatio);
router.get('/rule-of-40/:userId', saasMetricsController.calculateRuleOf40);
router.get('/magic-number/:userId', saasMetricsController.calculateMagicNumber);
router.get('/burn-multiple/:userId', saasMetricsController.calculateBurnMultiple);
router.get('/cac-payback/:userId', saasMetricsController.calculateCACPaybackPeriod);
router.get('/ltv-cac/:userId', saasMetricsController.calculateLTVCACRatio);

export default router;










