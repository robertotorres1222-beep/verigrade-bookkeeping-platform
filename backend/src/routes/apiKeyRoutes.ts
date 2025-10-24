import { Router } from 'express';
import { 
  createAPIKey,
  getOrganizationAPIKeys,
  getAPIKey,
  updateAPIKey,
  deleteAPIKey,
  regenerateSecret,
  getAPIKeyUsage,
  validateAPIKey,
  checkRateLimit,
  recordUsage
} from '../controllers/apiKeyController';
import { authenticateToken } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';

const router = Router();

// API key management
router.post('/:organizationId', authenticateToken, requirePermission('api:write'), createAPIKey);
router.get('/:organizationId', authenticateToken, requirePermission('api:read'), getOrganizationAPIKeys);
router.get('/key/:apiKeyId', authenticateToken, requirePermission('api:read'), getAPIKey);
router.put('/:apiKeyId', authenticateToken, requirePermission('api:write'), updateAPIKey);
router.delete('/:apiKeyId', authenticateToken, requirePermission('api:write'), deleteAPIKey);
router.post('/:apiKeyId/regenerate-secret', authenticateToken, requirePermission('api:write'), regenerateSecret);

// API key usage and monitoring
router.get('/:apiKeyId/usage', authenticateToken, requirePermission('api:read'), getAPIKeyUsage);

// API key validation (public endpoints)
router.post('/validate', validateAPIKey);
router.post('/rate-limit', checkRateLimit);
router.post('/usage', recordUsage);

export default router;







