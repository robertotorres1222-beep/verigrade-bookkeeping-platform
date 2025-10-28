import { Router } from 'express';
import { enterpriseController } from '../controllers/enterpriseController';

const router = Router();

// Multi-company Management
router.post('/companies', enterpriseController.createCompany);
router.get('/companies', enterpriseController.getCompanies);
router.put('/companies/:id', enterpriseController.updateCompany);

// SSO Configuration
router.post('/sso/setup', enterpriseController.setupSSO);
router.get('/sso/status', enterpriseController.getSSOStatus);

// White-label Configuration
router.post('/white-label', enterpriseController.configureWhiteLabel);
router.get('/white-label', enterpriseController.getWhiteLabelConfig);

// Granular Permissions
router.post('/permissions', enterpriseController.setPermissions);
router.get('/permissions', enterpriseController.getPermissions);

// API Access
router.post('/api-keys', enterpriseController.generateAPIKey);
router.get('/api-keys', enterpriseController.getAPIKeys);

export default router;







