import { Router } from 'express';
import { bankingController } from '../controllers/bankingController';

const router = Router();

// Multi-account Management
router.get('/accounts', bankingController.getAccounts);
router.post('/accounts', bankingController.addAccount);
router.put('/accounts/:id', bankingController.updateAccount);

// Automated Reconciliation
router.post('/reconcile', bankingController.reconcileTransactions);
router.get('/reconcile/status', bankingController.getReconciliationStatus);

// Bank Feed Rules
router.post('/feed-rules', bankingController.createFeedRule);
router.get('/feed-rules', bankingController.getFeedRules);
router.put('/feed-rules/:id', bankingController.updateFeedRule);

// Statement Import
router.post('/import-statement', bankingController.importStatement);
router.get('/import-history', bankingController.getImportHistory);

export default router;