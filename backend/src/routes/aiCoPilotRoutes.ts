import { Router } from 'express';
import { AICoPilotController } from '../controllers/aiCoPilotController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const aiCoPilotController = new AICoPilotController();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// AI Co-Pilot main routes
router.get('/insights', aiCoPilotController.getAIInsights.bind(aiCoPilotController));
router.get('/dashboard', aiCoPilotController.getAICoPilotDashboard.bind(aiCoPilotController));
router.post('/analysis', aiCoPilotController.saveAIAnalysis.bind(aiCoPilotController));

// Specific insight routes
router.get('/insights/financial', aiCoPilotController.getFinancialInsights.bind(aiCoPilotController));
router.get('/insights/operational', aiCoPilotController.getOperationalInsights.bind(aiCoPilotController));
router.get('/insights/strategic', aiCoPilotController.getStrategicInsights.bind(aiCoPilotController));
router.get('/insights/risk', aiCoPilotController.getRiskInsights.bind(aiCoPilotController));

// Recommendations and analysis routes
router.get('/recommendations', aiCoPilotController.getRecommendations.bind(aiCoPilotController));
router.get('/recent', aiCoPilotController.getRecentAnalyses.bind(aiCoPilotController));
router.get('/trends', aiCoPilotController.getTrendAnalysis.bind(aiCoPilotController));
router.get('/score', aiCoPilotController.getOverallScore.bind(aiCoPilotController));

// AI alerts and predictions
router.get('/alerts', aiCoPilotController.getAIAlerts.bind(aiCoPilotController));
router.get('/predictions', aiCoPilotController.getAIPredictions.bind(aiCoPilotController));

export default router;