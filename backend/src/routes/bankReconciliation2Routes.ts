import { Router } from 'express';
import bankReconciliation2Controller from '../controllers/bankReconciliation2Controller';

const router = Router();

// Bank Reconciliation 2.0
router.post('/reconcile/:userId/:bankAccountId', bankReconciliation2Controller.reconcileTransactions);
router.post('/timing-differences/:userId', bankReconciliation2Controller.detectTimingDifferences);
router.post('/suspicious-activity/:userId', bankReconciliation2Controller.identifySuspiciousActivity);
router.post('/fee-breakout/:userId', bankReconciliation2Controller.breakoutPaymentProcessorFees);
router.post('/match-confidence/:userId', bankReconciliation2Controller.calculateMatchConfidence);

// Batch Operations
router.post('/batch-reconcile/:userId', bankReconciliation2Controller.batchReconcileTransactions);
router.post('/handle-exceptions/:userId', bankReconciliation2Controller.handleReconciliationExceptions);

// Dashboard
router.get('/dashboard/:userId', bankReconciliation2Controller.getReconciliationDashboard);

export default router;










