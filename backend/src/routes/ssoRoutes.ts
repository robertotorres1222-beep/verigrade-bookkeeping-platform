import { Router } from 'express';
import { 
  getSAMLMetadata,
  initiateSAMLAuth,
  handleSAMLResponse,
  initiateSAMLLogout,
  handleSAMLLogoutResponse,
  getOAuthProviders,
  initiateOAuthAuth,
  handleOAuthCallback,
  getOAuthUserInfo,
  verifyJWTToken
} from '../controllers/ssoController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// SAML routes
router.get('/saml/metadata', getSAMLMetadata);
router.post('/saml/:organizationId/auth', authenticateToken, initiateSAMLAuth);
router.post('/saml/response', authenticateToken, handleSAMLResponse);
router.post('/saml/logout', authenticateToken, initiateSAMLLogout);
router.post('/saml/logout/response', authenticateToken, handleSAMLLogoutResponse);

// OAuth routes
router.get('/oauth/providers', getOAuthProviders);
router.get('/oauth/:providerId/auth', authenticateToken, initiateOAuthAuth);
router.get('/oauth/:providerId/callback', authenticateToken, handleOAuthCallback);
router.post('/oauth/:providerId/userinfo', authenticateToken, getOAuthUserInfo);

// JWT verification
router.post('/verify-token', verifyJWTToken);

export default router;