import { Router } from 'express';
import { approvalController } from '../controllers/approvalController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Approval workflow routes
router.post('/approvals/workflows', authenticate, approvalController.createWorkflow);
router.get('/approvals/workflows', authenticate, approvalController.getWorkflows);
router.post('/approvals/submit', authenticate, approvalController.submitForApproval);
router.put('/approvals/:approvalId/process', authenticate, approvalController.processApproval);
router.get('/approvals/pending', authenticate, approvalController.getPendingApprovals);
router.get('/approvals/statistics', authenticate, approvalController.getApprovalStatistics);

export default router;

