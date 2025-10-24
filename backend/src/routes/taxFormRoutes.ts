import { Router } from 'express';
import { taxFormController } from '../controllers/taxFormController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Tax form routes
router.post('/tax-forms/1099', authenticate, taxFormController.generate1099);
router.post('/tax-forms/w2', authenticate, taxFormController.generateW2);
router.post('/tax-forms/1040es', authenticate, taxFormController.generate1040ES);
router.get('/tax-forms', authenticate, taxFormController.getTaxForms);
router.get('/tax-forms/:formId/download', authenticate, taxFormController.downloadTaxForm);
router.get('/tax-forms/statistics', authenticate, taxFormController.getTaxFormStatistics);

export default router;

