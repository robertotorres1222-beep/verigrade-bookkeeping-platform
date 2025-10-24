import { Router } from 'express';
import { 
  updateBranding,
  getBranding,
  createEmailTemplate,
  getEmailTemplates,
  updateEmailTemplate,
  renderEmailTemplate,
  setupCustomDomain,
  verifyCustomDomain,
  getCustomDomains,
  generateCustomCSS,
  getMobileAppConfig,
  getBrandingAssets
} from '../controllers/brandingController';
import { authenticateToken } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';

const router = Router();

// Branding management
router.put('/:organizationId', authenticateToken, requirePermission('organization:branding'), updateBranding);
router.get('/:organizationId', authenticateToken, requirePermission('organization:read'), getBranding);

// Email templates
router.post('/:organizationId/email-templates', authenticateToken, requirePermission('organization:write'), createEmailTemplate);
router.get('/:organizationId/email-templates', authenticateToken, requirePermission('organization:read'), getEmailTemplates);
router.put('/email-templates/:templateId', authenticateToken, requirePermission('organization:write'), updateEmailTemplate);
router.post('/email-templates/:templateId/render', authenticateToken, requirePermission('organization:read'), renderEmailTemplate);

// Custom domains
router.post('/:organizationId/domains', authenticateToken, requirePermission('organization:write'), setupCustomDomain);
router.post('/domains/:domainId/verify', authenticateToken, requirePermission('organization:write'), verifyCustomDomain);
router.get('/:organizationId/domains', authenticateToken, requirePermission('organization:read'), getCustomDomains);

// Branding assets
router.get('/:organizationId/css', authenticateToken, requirePermission('organization:read'), generateCustomCSS);
router.get('/:organizationId/mobile-config', authenticateToken, requirePermission('organization:read'), getMobileAppConfig);
router.get('/:organizationId/assets', authenticateToken, requirePermission('organization:read'), getBrandingAssets);

export default router;