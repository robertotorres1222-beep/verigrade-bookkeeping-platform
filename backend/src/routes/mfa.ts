import { Router } from 'express';
import { mfaController } from '../controllers/mfaController';
import { authenticate } from '../middleware/jwtAuth';

const router = Router();

// MFA routes
router.get('/', authenticate, mfaController.getMFAStatus);
router.post('/setup', authenticate, mfaController.setupMFA);
router.post('/verify', authenticate, mfaController.verifyMFA);
router.post('/:methodId/disable', authenticate, mfaController.disableMFA);
router.post('/backup-codes', authenticate, mfaController.generateBackupCodes);
router.post('/verify-code', mfaController.verifyMFACode);

export default router;

