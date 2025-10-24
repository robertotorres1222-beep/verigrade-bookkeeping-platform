import { Router } from 'express';
import { ssoController } from '../controllers/ssoController';
import { authenticate } from '../middleware/jwtAuth';

const router = Router();

// SSO provider management routes
router.get('/providers', authenticate, ssoController.getProviders);
router.post('/providers', authenticate, ssoController.createProvider);
router.put('/providers/:providerId', authenticate, ssoController.updateProvider);
router.delete('/providers/:providerId', authenticate, ssoController.deleteProvider);
router.post('/providers/:providerId/test', authenticate, ssoController.testConnection);
router.post('/providers/:providerId/sync', authenticate, ssoController.syncUsers);

// SSO authentication routes
router.get('/providers/:providerId/login-url', ssoController.getLoginUrl);
router.get('/providers/:providerId/callback', ssoController.handleCallback);

export default router;

