import { Router } from 'express';
import budgetActualController from '../controllers/budgetActualController';

const router = Router();

// Budget Management
router.post('/create/:userId', budgetActualController.createBudget);
router.post('/analyze-variance/:userId/:budgetId', budgetActualController.analyzeVariance);
router.get('/templates', budgetActualController.getBudgetTemplates);

// Rolling Forecasts
router.post('/rolling-forecast/:userId', budgetActualController.createRollingForecast);

// Approval Workflows
router.post('/approval-workflow/:userId', budgetActualController.createBudgetApprovalWorkflow);

// Budget Alerts
router.post('/alerts/:userId', budgetActualController.setupBudgetAlerts);

// Dashboard and Analytics
router.get('/dashboard/:userId', budgetActualController.getBudgetActualDashboard);
router.get('/analytics/:userId', budgetActualController.getBudgetPerformanceAnalytics);

export default router;






