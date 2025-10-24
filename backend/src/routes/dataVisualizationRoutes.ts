import { Router } from 'express';
import DataVisualizationController from '../controllers/dataVisualizationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const dataVisualizationController = new DataVisualizationController();

// Chart Configurations
router.post('/companies/:companyId/charts', authenticateToken, dataVisualizationController.createChartConfig);
router.get('/companies/:companyId/charts', authenticateToken, dataVisualizationController.getChartConfigs);
router.get('/charts/:chartId', authenticateToken, dataVisualizationController.getChartConfig);
router.put('/charts/:chartId', authenticateToken, dataVisualizationController.updateChartConfig);
router.delete('/charts/:chartId', authenticateToken, dataVisualizationController.deleteChartConfig);
router.post('/charts/:chartId/clone', authenticateToken, dataVisualizationController.cloneChartConfig);

// Chart Data and Export
router.post('/charts/:chartId/data', authenticateToken, dataVisualizationController.generateChartData);
router.post('/charts/:chartId/export', authenticateToken, dataVisualizationController.exportChartAsImage);
router.post('/charts/:chartId/insights', authenticateToken, dataVisualizationController.getChartInsights);

// Dashboards
router.post('/companies/:companyId/dashboards', authenticateToken, dataVisualizationController.createDashboard);
router.get('/companies/:companyId/dashboards', authenticateToken, dataVisualizationController.getDashboards);
router.post('/companies/:companyId/dashboards/interactive', authenticateToken, dataVisualizationController.createInteractiveDashboard);

// Dashboard Management
router.post('/dashboards/:dashboardId/share', authenticateToken, dataVisualizationController.shareDashboard);
router.get('/dashboards/:dashboardId/analytics', authenticateToken, dataVisualizationController.getDashboardAnalytics);

// Visualization Templates
router.post('/companies/:companyId/templates', authenticateToken, dataVisualizationController.createVisualizationTemplate);
router.get('/companies/:companyId/templates', authenticateToken, dataVisualizationController.getVisualizationTemplates);

export default router;





