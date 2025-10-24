import { Router } from 'express';
import { mfaController } from '../controllers/mfaController';
import { authenticate } from '../middleware/auth';

const router = Router();

// MFA Management Routes (require authentication)
router.post('/enable', authenticate, mfaController.enableMFA);
router.post('/verify', authenticate, mfaController.verifyMFA);
router.post('/disable', authenticate, mfaController.disableMFA);
router.get('/status', authenticate, mfaController.getMFAStatus);
router.post('/backup-codes', authenticate, mfaController.generateBackupCodes);
router.post('/resend-sms', authenticate, mfaController.resendSMSCode);

// MFA Verification Routes (for login flow)
router.post('/verify-login', mfaController.verifyMFALogin);

export default router;
