import { Router } from 'express';
import { HiringController } from '../controllers/hiringController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const hiringController = new HiringController();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Hiring Analysis routes
router.get('/analysis', hiringController.analyzeHiringNeeds.bind(hiringController));
router.get('/dashboard', hiringController.getHiringDashboard.bind(hiringController));
router.get('/scenarios', hiringController.getHiringScenarios.bind(hiringController));
router.get('/stats', hiringController.getHiringStats.bind(hiringController));
router.get('/recent', hiringController.getRecentHiringAnalyses.bind(hiringController));
router.get('/departments', hiringController.getDepartmentAnalysis.bind(hiringController));
router.get('/trends', hiringController.getTrendAnalysis.bind(hiringController));
router.get('/recommendations', hiringController.getHiringRecommendations.bind(hiringController));
router.post('/analysis', hiringController.saveHiringAnalysis.bind(hiringController));

// Bottleneck Analysis routes
router.get('/bottlenecks', hiringController.analyzeBottlenecks.bind(hiringController));
router.get('/bottlenecks/dashboard', hiringController.getBottleneckDashboard.bind(hiringController));
router.get('/bottlenecks/stats', hiringController.getBottleneckStats.bind(hiringController));
router.get('/bottlenecks/recent', hiringController.getRecentBottleneckAnalyses.bind(hiringController));
router.get('/bottlenecks/departments', hiringController.getBottleneckDepartmentAnalysis.bind(hiringController));
router.get('/bottlenecks/trends', hiringController.getBottleneckTrendAnalysis.bind(hiringController));
router.get('/bottlenecks/recommendations', hiringController.getBottleneckRecommendations.bind(hiringController));
router.post('/bottlenecks/analysis', hiringController.saveBottleneckAnalysis.bind(hiringController));

export default router;