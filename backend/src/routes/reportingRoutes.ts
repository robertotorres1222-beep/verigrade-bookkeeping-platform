import { Router } from 'express';
import { reportingController } from '../controllers/reportingController';

const router = Router();

// Custom Report Builder
router.post('/reports', reportingController.createCustomReport);
router.get('/reports', reportingController.getReports);
router.get('/reports/:id', reportingController.getReport);
router.put('/reports/:id', reportingController.updateReport);
router.delete('/reports/:id', reportingController.deleteReport);

// Scheduled Reports
router.post('/reports/:id/schedule', reportingController.scheduleReport);
router.get('/reports/:id/schedule', reportingController.getReportSchedule);

// Forecasting
router.post('/forecast', reportingController.generateForecast);
router.get('/forecast/:id', reportingController.getForecast);

// Comparative Analysis
router.post('/comparative', reportingController.performComparativeAnalysis);

export default router;







