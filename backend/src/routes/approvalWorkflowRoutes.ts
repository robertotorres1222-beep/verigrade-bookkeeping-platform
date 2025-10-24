import { Router } from 'express';
import { ApprovalWorkflowController } from '../controllers/approvalWorkflowController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const approvalWorkflowController = new ApprovalWorkflowController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route GET /api/approval-workflows/dashboard
 * @desc Get approval workflow dashboard
 * @access Private
 */
router.get('/dashboard', approvalWorkflowController.getApprovalDashboard);

/**
 * @route GET /api/approval-workflows/workflows
 * @desc Get approval workflows
 * @access Private
 */
router.get('/workflows', approvalWorkflowController.getApprovalWorkflows);

/**
 * @route POST /api/approval-workflows/workflows
 * @desc Create approval workflow
 * @access Private
 */
router.post('/workflows', approvalWorkflowController.createApprovalWorkflow);

/**
 * @route PUT /api/approval-workflows/workflows/:workflowId
 * @desc Update approval workflow
 * @access Private
 */
router.put('/workflows/:workflowId', approvalWorkflowController.updateApprovalWorkflow);

/**
 * @route DELETE /api/approval-workflows/workflows/:workflowId
 * @desc Delete approval workflow
 * @access Private
 */
router.delete('/workflows/:workflowId', approvalWorkflowController.deleteApprovalWorkflow);

/**
 * @route GET /api/approval-workflows/requests
 * @desc Get approval requests
 * @access Private
 */
router.get('/requests', approvalWorkflowController.getApprovalRequests);

/**
 * @route POST /api/approval-workflows/requests
 * @desc Create approval request
 * @access Private
 */
router.post('/requests', approvalWorkflowController.createApprovalRequest);

/**
 * @route POST /api/approval-workflows/steps/:stepId/approve
 * @desc Approve step
 * @access Private
 */
router.post('/steps/:stepId/approve', approvalWorkflowController.approveStep);

/**
 * @route POST /api/approval-workflows/steps/:stepId/reject
 * @desc Reject step
 * @access Private
 */
router.post('/steps/:stepId/reject', approvalWorkflowController.rejectStep);

/**
 * @route GET /api/approval-workflows/stats
 * @desc Get request statistics
 * @access Private
 */
router.get('/stats', approvalWorkflowController.getRequestStats);

/**
 * @route GET /api/approval-workflows/recent
 * @desc Get recent requests
 * @access Private
 */
router.get('/recent', approvalWorkflowController.getRecentRequests);

/**
 * @route GET /api/approval-workflows/pending
 * @desc Get pending approvals
 * @access Private
 */
router.get('/pending', approvalWorkflowController.getPendingApprovals);

/**
 * @route GET /api/approval-workflows/workflow-stats
 * @desc Get workflow statistics
 * @access Private
 */
router.get('/workflow-stats', approvalWorkflowController.getWorkflowStats);

/**
 * @route GET /api/approval-workflows/analytics
 * @desc Get approval analytics
 * @access Private
 */
router.get('/analytics', approvalWorkflowController.getApprovalAnalytics);

/**
 * @route GET /api/approval-workflows/insights
 * @desc Get approval insights
 * @access Private
 */
router.get('/insights', approvalWorkflowController.getApprovalInsights);

export default router;