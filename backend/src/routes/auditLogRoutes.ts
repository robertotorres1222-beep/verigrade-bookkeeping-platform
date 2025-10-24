import { Router } from 'express';
import { auditLogController } from '../controllers/auditLogController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Get audit logs with filtering and pagination
router.get('/', authenticate, auditLogController.getAuditLogs);

// Get audit log by ID
router.get('/:id', authenticate, auditLogController.getAuditLogById);

// Export audit logs to CSV
router.get('/export', authenticate, auditLogController.exportAuditLogs);

// Get audit log statistics
router.get('/stats', authenticate, auditLogController.getAuditLogStats);

// Create audit log entry (internal use)
router.post('/', authenticate, auditLogController.createAuditLog);

export default router;

