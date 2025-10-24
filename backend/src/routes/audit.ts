import { Router } from 'express';
import { auditController } from '../controllers/auditController';
import { authenticate } from '../middleware/jwtAuth';

const router = Router();

// Audit log routes
router.get('/logs', authenticate, auditController.getLogs);
router.get('/logs/:logId', authenticate, auditController.getLogById);
router.post('/export', authenticate, auditController.exportLogs);
router.get('/stats', authenticate, auditController.getStats);
router.post('/logs', auditController.createLog); // Internal use only

export default router;

