import { Router } from 'express';
import analyticsController from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Predictive Analytics Routes
router.get('/companies/:companyId/cash-flow-forecast', analyticsController.getCashFlowForecast);
router.get('/companies/:companyId/revenue-prediction', analyticsController.getRevenuePrediction);
router.get('/companies/:companyId/expense-trends', analyticsController.getExpenseTrends);
router.get('/companies/:companyId/anomalies', analyticsController.detectAnomalies);
router.get('/companies/:companyId/risks', analyticsController.assessRisks);
router.get('/companies/:companyId/seasonal-patterns', analyticsController.detectSeasonalPatterns);

// ML Models Routes
router.get('/ml-models', analyticsController.getMLModels);
router.get('/ml-models/:modelId', analyticsController.getMLModel);
router.post('/ml-models/:modelId/train', analyticsController.trainMLModel);
router.post('/ml-models/:modelId/predict', analyticsController.makeMLPrediction);
router.get('/ml-models/:modelId/features', analyticsController.getMLModelFeatures);
router.post('/companies/:companyId/ml-recommendations', analyticsController.getMLRecommendations);

// Business Intelligence Routes
router.get('/companies/:companyId/kpis', analyticsController.getKPIs);
router.post('/companies/:companyId/dashboards', analyticsController.createDashboard);
router.get('/companies/:companyId/dashboards', analyticsController.getDashboards);
router.get('/companies/:companyId/performance-metrics', analyticsController.getPerformanceMetrics);
router.get('/companies/:companyId/benchmarks', analyticsController.getBenchmarks);
router.get('/companies/:companyId/market-insights', analyticsController.getMarketInsights);
router.get('/companies/:companyId/competitive-analysis', analyticsController.getCompetitiveAnalysis);
router.get('/companies/:companyId/executive-summary', analyticsController.generateExecutiveSummary);

// Advanced Reporting Routes
router.post('/companies/:companyId/reports', analyticsController.createReport);
router.get('/companies/:companyId/reports', analyticsController.getReports);
router.post('/reports/:reportId/execute', analyticsController.executeReport);
router.get('/reports/executions/:executionId', analyticsController.getReportExecutionStatus);
router.post('/reports/:reportId/schedule', analyticsController.scheduleReport);
router.get('/report-templates', analyticsController.getReportTemplates);
router.post('/reports/:reportId/export', analyticsController.exportReport);
router.post('/reports/:reportId/share', analyticsController.shareReport);

export default router;






