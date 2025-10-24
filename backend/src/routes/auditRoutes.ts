import { Router } from 'express';
import { AuditController } from '../controllers/auditController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const auditController = new AuditController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route GET /api/audit/dashboard
 * @desc Get audit dashboard
 * @access Private
 */
router.get('/dashboard', auditController.getAuditDashboard);

/**
 * @route GET /api/audit/trails
 * @desc Get audit trails
 * @access Private
 */
router.get('/trails', auditController.getAuditTrails);

/**
 * @route GET /api/audit/trails/:auditTrailId
 * @desc Get audit trail by ID
 * @access Private
 */
router.get('/trails/:auditTrailId', auditController.getAuditTrail);

/**
 * @route POST /api/audit/trails
 * @desc Create audit trail entry
 * @access Private
 */
router.post('/trails', auditController.createAuditTrail);

/**
 * @route POST /api/audit/trails/:auditTrailId/verify
 * @desc Verify audit trail integrity
 * @access Private
 */
router.post('/trails/:auditTrailId/verify', auditController.verifyAuditTrail);

/**
 * @route GET /api/audit/stats
 * @desc Get audit statistics
 * @access Private
 */
router.get('/stats', auditController.getAuditStats);

/**
 * @route GET /api/audit/recent
 * @desc Get recent audits
 * @access Private
 */
router.get('/recent', auditController.getRecentAudits);

/**
 * @route GET /api/audit/summary
 * @desc Get audit summary
 * @access Private
 */
router.get('/summary', auditController.getAuditSummary);

/**
 * @route GET /api/audit/integrity-report
 * @desc Get integrity report
 * @access Private
 */
router.get('/integrity-report', auditController.getIntegrityReport);

/**
 * @route GET /api/audit/analytics
 * @desc Get audit analytics
 * @access Private
 */
router.get('/analytics', auditController.getAuditAnalytics);

/**
 * @route GET /api/audit/insights
 * @desc Get audit insights
 * @access Private
 */
router.get('/insights', auditController.getAuditInsights);

/**
 * @route GET /api/audit/export
 * @desc Export audit trails
 * @access Private
 */
router.get('/export', auditController.exportAuditTrails);

/**
 * @route POST /api/audit/cleanup
 * @desc Clean up old audit trails
 * @access Private
 */
router.post('/cleanup', auditController.cleanupOldAuditTrails);

export default router;