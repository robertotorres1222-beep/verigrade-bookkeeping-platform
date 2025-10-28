import { Router } from 'express';
import AdvancedMonitoringController from '../controllers/advancedMonitoringController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const advancedMonitoringController = new AdvancedMonitoringController();

// Monitoring Dashboards
router.post('/companies/:companyId/dashboards', authenticateToken, advancedMonitoringController.createMonitoringDashboard);
router.get('/companies/:companyId/dashboards', authenticateToken, advancedMonitoringController.getMonitoringDashboards);
router.get('/dashboards/:dashboardId', authenticateToken, advancedMonitoringController.getDashboard);
router.put('/dashboards/:dashboardId', authenticateToken, advancedMonitoringController.updateDashboard);
router.delete('/dashboards/:dashboardId', authenticateToken, advancedMonitoringController.deleteDashboard);

// SLO Metrics
router.post('/companies/:companyId/slo-metrics', authenticateToken, advancedMonitoringController.createSLOMetric);
router.get('/companies/:companyId/slo-metrics', authenticateToken, advancedMonitoringController.getSLOMetrics);
router.post('/slo-metrics/:sloId/update-status', authenticateToken, advancedMonitoringController.updateSLOStatus);

// Alert Rules
router.post('/companies/:companyId/alert-rules', authenticateToken, advancedMonitoringController.createAlertRule);
router.get('/companies/:companyId/alert-rules', authenticateToken, advancedMonitoringController.getAlertRules);
router.post('/alert-rules/:ruleId/trigger', authenticateToken, advancedMonitoringController.triggerAlert);

// Log Queries
router.post('/companies/:companyId/log-queries', authenticateToken, advancedMonitoringController.createLogQuery);
router.get('/companies/:companyId/log-queries', authenticateToken, advancedMonitoringController.getLogQueries);
router.post('/log-queries/execute', authenticateToken, advancedMonitoringController.executeLogQuery);

// Performance Metrics
router.get('/companies/:companyId/performance-metrics', authenticateToken, advancedMonitoringController.getPerformanceMetrics);
router.get('/metrics/:metricName/data', authenticateToken, advancedMonitoringController.getMetricData);

// Custom Metrics
router.post('/companies/:companyId/custom-metrics', authenticateToken, advancedMonitoringController.createCustomMetric);

// Monitoring Overview
router.get('/companies/:companyId/overview', authenticateToken, advancedMonitoringController.getMonitoringOverview);

// Alert History
router.get('/companies/:companyId/alert-history', authenticateToken, advancedMonitoringController.getAlertHistory);

export default router;







