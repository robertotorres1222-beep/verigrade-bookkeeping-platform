import express from 'express';
import complianceAIController from '../controllers/complianceAIController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route GET /api/ai/compliance/risks/:userId
 * @desc Get compliance risks
 * @access Private
 */
router.get('/risks/:userId', complianceAIController.getComplianceRisks);

/**
 * @route POST /api/ai/compliance/audit-report/:userId
 * @desc Generate audit report
 * @access Private
 */
router.post('/audit-report/:userId', complianceAIController.generateAuditReport);

/**
 * @route GET /api/ai/compliance/regulatory-updates/:userId
 * @desc Get regulatory updates
 * @access Private
 */
router.get('/regulatory-updates/:userId', complianceAIController.getRegulatoryUpdates);

/**
 * @route GET /api/ai/compliance/score/:userId
 * @desc Get compliance score
 * @access Private
 */
router.get('/score/:userId', complianceAIController.getComplianceScore);

/**
 * @route GET /api/ai/compliance/dashboard/:userId
 * @desc Get compliance dashboard
 * @access Private
 */
router.get('/dashboard/:userId', complianceAIController.getComplianceDashboard);

/**
 * @route POST /api/ai/compliance/regulatory-impact/:userId
 * @desc Get regulatory impact analysis
 * @access Private
 */
router.post('/regulatory-impact/:userId', complianceAIController.getRegulatoryImpactAnalysis);

/**
 * @route GET /api/ai/compliance/analytics/:userId
 * @desc Get compliance analytics
 * @access Private
 */
router.get('/analytics/:userId', complianceAIController.getComplianceAnalytics);

/**
 * @route GET /api/ai/compliance/priorities/:userId
 * @desc Get compliance priorities
 * @access Private
 */
router.get('/priorities/:userId', complianceAIController.getCompliancePriorities);

export default router;






