import { Router } from 'express';
import expenseApprovalController from '../controllers/expenseApprovalController';

const router = Router();

// Expense Approval Workflows
router.post('/workflow/:userId', expenseApprovalController.createApprovalWorkflow);
router.post('/approve/:userId/:expenseId', expenseApprovalController.processExpenseApproval);
router.post('/delegate/:userId/:approvalId', expenseApprovalController.delegateApproval);

// Policy Enforcement
router.post('/enforce-policy/:userId/:expenseId', expenseApprovalController.enforceExpensePolicy);

// Notifications and Rejections
router.post('/notifications/:userId', expenseApprovalController.sendApprovalNotifications);
router.post('/reject/:approvalId', expenseApprovalController.rejectExpense);

// Dashboard and Analytics
router.get('/dashboard/:userId', expenseApprovalController.getApprovalDashboard);
router.get('/analytics/:userId', expenseApprovalController.getApprovalAnalytics);

// Bulk Operations
router.post('/bulk-approve/:userId', expenseApprovalController.bulkApproveExpenses);

export default router;






