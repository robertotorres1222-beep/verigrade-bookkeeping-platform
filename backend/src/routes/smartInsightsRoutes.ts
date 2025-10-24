import { Router } from 'express';
import smartInsightsController from '../controllers/smartInsightsController';

const router = Router();

// Smart Insights
router.get('/notifications/:userId', smartInsightsController.generateProactiveNotifications);
router.get('/trends/:userId', smartInsightsController.detectTrends);
router.get('/recommendations/:userId', smartInsightsController.generateRecommendations);
router.get('/thresholds/:userId', smartInsightsController.monitorPerformanceThresholds);
router.get('/benchmarking/:userId', smartInsightsController.generateBenchmarkingInsights);
router.get('/goals/:userId', smartInsightsController.trackGoalProgress);

// Comprehensive Dashboard
router.get('/dashboard/:userId', smartInsightsController.generateSmartInsightsDashboard);

export default router;






