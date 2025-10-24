import { Router } from 'express';
import {
  getProfitabilityDashboard,
  getClientProfitability,
  getServiceProfitability,
  generateProfitabilityReport,
  getProfitabilityTrends,
  getProfitabilityBenchmarks,
  getProfitabilityAlerts,
  exportProfitabilityReport
} from '../controllers/profitabilityAnalyticsController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Dashboard and overview
router.get('/dashboard', getProfitabilityDashboard);
router.get('/trends', getProfitabilityTrends);
router.get('/benchmarks', getProfitabilityBenchmarks);
router.get('/alerts', getProfitabilityAlerts);

// Client and service analysis
router.get('/clients/:clientId', getClientProfitability);
router.get('/services/:serviceId', getServiceProfitability);

// Reports
router.post('/report', generateProfitabilityReport);
router.post('/export', exportProfitabilityReport);

export default router;

