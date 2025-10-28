import { Router } from 'express';
import CustomReportBuilderController from '../controllers/customReportBuilderController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const customReportBuilderController = new CustomReportBuilderController();

// Report Templates
router.post('/companies/:companyId/templates', authenticateToken, customReportBuilderController.createReportTemplate);
router.get('/companies/:companyId/templates', authenticateToken, customReportBuilderController.getReportTemplates);

// Report Builders
router.post('/companies/:companyId/builders', authenticateToken, customReportBuilderController.createReportBuilder);
router.get('/companies/:companyId/builders', authenticateToken, customReportBuilderController.getReportBuilders);
router.get('/builders/:builderId', authenticateToken, customReportBuilderController.getReportBuilder);
router.put('/builders/:builderId', authenticateToken, customReportBuilderController.updateReportBuilder);
router.delete('/builders/:builderId', authenticateToken, customReportBuilderController.deleteReportBuilder);

// Report Elements
router.post('/builders/:builderId/elements', authenticateToken, customReportBuilderController.addReportElement);
router.put('/elements/:elementId', authenticateToken, customReportBuilderController.updateReportElement);
router.delete('/elements/:elementId', authenticateToken, customReportBuilderController.deleteReportElement);

// Data Sources
router.get('/companies/:companyId/data-sources', authenticateToken, customReportBuilderController.getDataSources);
router.post('/companies/:companyId/data-sources', authenticateToken, customReportBuilderController.createDataSource);

// Report Filters
router.get('/companies/:companyId/filters', authenticateToken, customReportBuilderController.getReportFilters);
router.post('/companies/:companyId/filters', authenticateToken, customReportBuilderController.createReportFilter);

// Report Execution
router.post('/companies/:companyId/execute-query', authenticateToken, customReportBuilderController.executeReportQuery);
router.post('/builders/:builderId/generate', authenticateToken, customReportBuilderController.generateReport);
router.post('/builders/:builderId/export', authenticateToken, customReportBuilderController.exportReport);
router.post('/builders/:builderId/preview', authenticateToken, customReportBuilderController.getReportPreview);

// Report Builder Management
router.post('/builders/:builderId/clone', authenticateToken, customReportBuilderController.cloneReportBuilder);

export default router;








