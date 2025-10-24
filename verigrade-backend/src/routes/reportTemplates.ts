import express from 'express';
import { ReportTemplatesController } from '../controllers/reportTemplatesController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Template routes
router.post('/templates', ReportTemplatesController.createTemplate);
router.get('/templates', ReportTemplatesController.getTemplates);
router.get('/templates/:templateId', ReportTemplatesController.getTemplate);
router.put('/templates/:templateId', ReportTemplatesController.updateTemplate);
router.delete('/templates/:templateId', ReportTemplatesController.deleteTemplate);

// Scheduled report routes
router.post('/scheduled', ReportTemplatesController.createScheduledReport);
router.get('/scheduled', ReportTemplatesController.getScheduledReports);
router.put('/scheduled/:scheduledReportId', ReportTemplatesController.updateScheduledReport);
router.delete('/scheduled/:templateId', ReportTemplatesController.cancelScheduledReport);

// Execution routes
router.post('/templates/:templateId/execute', ReportTemplatesController.executeReport);
router.get('/templates/:templateId/executions', ReportTemplatesController.getExecutionHistory);

// Utility routes
router.get('/categories', ReportTemplatesController.getCategories);

export default router;

