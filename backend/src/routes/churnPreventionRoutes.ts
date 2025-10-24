import { Router } from 'express';
import { ChurnPreventionController } from '../controllers/churnPreventionController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const churnPreventionController = new ChurnPreventionController();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Churn Prevention main routes
router.get('/analysis', churnPreventionController.analyzeChurnRisk.bind(churnPreventionController));
router.get('/dashboard', churnPreventionController.getChurnPreventionDashboard.bind(churnPreventionController));
router.post('/analysis', churnPreventionController.saveChurnPreventionAnalysis.bind(churnPreventionController));

// Statistics and analytics routes
router.get('/stats', churnPreventionController.getChurnStats.bind(churnPreventionController));
router.get('/recent', churnPreventionController.getRecentAnalyses.bind(churnPreventionController));
router.get('/segments', churnPreventionController.getCustomerSegments.bind(churnPreventionController));
router.get('/trends', churnPreventionController.getTrendAnalysis.bind(churnPreventionController));

// Risk analysis routes
router.get('/customers', churnPreventionController.getChurnRiskCustomers.bind(churnPreventionController));
router.get('/behavior', churnPreventionController.getBehaviorPatterns.bind(churnPreventionController));
router.get('/engagement', churnPreventionController.getEngagementMetrics.bind(churnPreventionController));
router.get('/risk-factors', churnPreventionController.getRiskFactors.bind(churnPreventionController));

// Recommendations and alerts
router.get('/recommendations', churnPreventionController.getChurnPreventionRecommendations.bind(churnPreventionController));
router.get('/score', churnPreventionController.getOverallChurnRiskScore.bind(churnPreventionController));
router.get('/alerts', churnPreventionController.getChurnAlerts.bind(churnPreventionController));

export default router;