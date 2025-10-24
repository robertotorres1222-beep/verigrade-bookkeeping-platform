import { Router } from 'express';
import { kpiController } from '../controllers/kpiController';
import { authenticate } from '../middleware/auth';

const router = Router();

// KPI routes
router.post('/kpis', authenticate, kpiController.createKPI);
router.get('/kpis', authenticate, kpiController.getKPIs);
router.put('/kpis/:kpiId', authenticate, kpiController.updateKPI);
router.get('/kpis/:kpiId/calculate', authenticate, kpiController.calculateKPI);
router.get('/kpis/dashboard', authenticate, kpiController.getKPIDashboard);
router.get('/kpis/:kpiId/trends', authenticate, kpiController.getKPITrends);

export default router;

