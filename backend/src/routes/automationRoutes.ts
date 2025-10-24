import { Router } from 'express';
import { automationController } from '../controllers/automationController';

const router = Router();

// ML Categorization
router.post('/categorize', automationController.categorizeTransaction);
router.get('/categories', automationController.getCategories);
router.post('/categories/feedback', automationController.submitFeedback);

// Bank Feed Processing
router.post('/bank-feed/process', automationController.processBankFeed);
router.get('/bank-feed/status', automationController.getBankFeedStatus);

// Recurring Invoices
router.post('/recurring-invoices', automationController.createRecurringInvoice);
router.get('/recurring-invoices', automationController.getRecurringInvoices);
router.put('/recurring-invoices/:id', automationController.updateRecurringInvoice);
router.delete('/recurring-invoices/:id', automationController.deleteRecurringInvoice);

// Approval Workflows
router.post('/workflows', automationController.createWorkflow);
router.get('/workflows', automationController.getWorkflows);
router.post('/workflows/:id/execute', automationController.executeWorkflow);

export default router;