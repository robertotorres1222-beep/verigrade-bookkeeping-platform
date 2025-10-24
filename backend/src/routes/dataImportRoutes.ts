import { Router } from 'express';
import { dataImportController } from '../controllers/dataImportController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Data import routes
router.post('/import/quickbooks', authenticate, dataImportController.importFromQuickBooks);
router.post('/import/xero', authenticate, dataImportController.importFromXero);
router.post('/import/excel', authenticate, dataImportController.importFromExcel);
router.get('/import/history', authenticate, dataImportController.getImportHistory);
router.post('/import/validate', authenticate, dataImportController.validateImportData);
router.get('/import/statistics', authenticate, dataImportController.getImportStatistics);

export default router;

