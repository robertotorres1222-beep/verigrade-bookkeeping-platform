import { Router } from 'express';
import { apiPlatformController } from '../controllers/apiPlatformController';

const router = Router();

// API Key Management Routes
router.post('/api-keys', apiPlatformController.createAPIKey);
router.get('/api-keys', apiPlatformController.getAPIKeys);
router.put('/api-keys/:id/revoke', apiPlatformController.revokeAPIKey);

// Webhook Management Routes
router.post('/webhooks', apiPlatformController.createWebhook);
router.get('/webhooks', apiPlatformController.getWebhooks);
router.post('/webhooks/:id/trigger', apiPlatformController.triggerWebhook);

// Integration Management Routes
router.post('/integrations', apiPlatformController.createIntegration);
router.get('/integrations', apiPlatformController.getIntegrations);

// Integration Installation Management Routes
router.post('/integration-installations', apiPlatformController.installIntegration);
router.get('/integration-installations', apiPlatformController.getIntegrationInstallations);

// SDK Management Routes
router.post('/sdks', apiPlatformController.createSDK);
router.get('/sdks', apiPlatformController.getSDKs);

// API Version Management Routes
router.post('/api-versions', apiPlatformController.createAPIVersion);
router.get('/api-versions', apiPlatformController.getAPIVersions);

// Developer Portal Management Routes
router.post('/developer-portal', apiPlatformController.createDeveloperPortalContent);
router.get('/developer-portal', apiPlatformController.getDeveloperPortalContent);

// Analytics and Reporting Routes
router.get('/analytics', apiPlatformController.getAPIAnalytics);

export default router;




