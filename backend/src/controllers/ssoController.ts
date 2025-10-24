import { Request, Response } from 'express';
import SAMLService from '../auth/saml';
import OAuthService from '../auth/oauth';
import logger from '../utils/logger';

export const getSAMLMetadata = async (req: Request, res: Response): Promise<void> => {
  try {
    const metadata = SAMLService.getMetadata();
    
    res.set('Content-Type', 'application/xml');
    res.status(200).send(metadata);
  } catch (error: any) {
    logger.error('Error getting SAML metadata:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get SAML metadata',
      error: error.message
    });
  }
};

export const initiateSAMLAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { requestUrl, requestId } = await SAMLService.generateAuthRequest();
    
    // Store request ID in session for validation
    req.session.samlRequestId = requestId;
    req.session.organizationId = organizationId;

    res.status(200).json({
      success: true,
      authUrl: requestUrl,
      requestId
    });
  } catch (error: any) {
    logger.error('Error initiating SAML authentication:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate SAML authentication',
      error: error.message
    });
  }
};

export const handleSAMLResponse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { SAMLResponse, RelayState } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    if (!SAMLResponse) {
      res.status(400).json({ success: false, message: 'SAML response is required' });
      return;
    }

    const samlUser = await SAMLService.processResponse(SAMLResponse, RelayState);
    
    // Map SAML attributes to roles
    const roles = SAMLService.mapAttributesToRoles(samlUser.attributes);
    
    // Provision user (JIT)
    const provisionResult = await OAuthService.provisionUser(samlUser, req.session.organizationId);
    
    // Create JWT token
    const token = OAuthService.createJWTToken({
      id: provisionResult.userId,
      email: samlUser.attributes.email || '',
      firstName: samlUser.attributes.firstName,
      lastName: samlUser.attributes.lastName,
      provider: 'saml',
      providerId: samlUser.nameId,
      roles
    });

    res.status(200).json({
      success: true,
      message: 'SAML authentication successful',
      token,
      user: {
        id: provisionResult.userId,
        email: samlUser.attributes.email,
        firstName: samlUser.attributes.firstName,
        lastName: samlUser.attributes.lastName,
        roles
      },
      isNewUser: provisionResult.isNewUser
    });
  } catch (error: any) {
    logger.error('Error handling SAML response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process SAML response',
      error: error.message
    });
  }
};

export const initiateSAMLLogout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nameId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    if (!nameId) {
      res.status(400).json({ success: false, message: 'Name ID is required for logout' });
      return;
    }

    const { logoutUrl, requestId } = await SAMLService.generateLogoutRequest(nameId);
    
    res.status(200).json({
      success: true,
      logoutUrl,
      requestId
    });
  } catch (error: any) {
    logger.error('Error initiating SAML logout:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate SAML logout',
      error: error.message
    });
  }
};

export const handleSAMLLogoutResponse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { SAMLResponse } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    if (!SAMLResponse) {
      res.status(400).json({ success: false, message: 'SAML response is required' });
      return;
    }

    const success = await SAMLService.processLogoutResponse(SAMLResponse);
    
    res.status(200).json({
      success,
      message: success ? 'SAML logout successful' : 'SAML logout failed'
    });
  } catch (error: any) {
    logger.error('Error handling SAML logout response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process SAML logout response',
      error: error.message
    });
  }
};

export const getOAuthProviders = async (req: Request, res: Response): Promise<void> => {
  try {
    const providers = OAuthService.getAllProviders();
    
    res.status(200).json({
      success: true,
      providers: providers.map(provider => ({
        id: provider.id,
        name: provider.name,
        authUrl: provider.authUrl
      }))
    });
  } catch (error: any) {
    logger.error('Error getting OAuth providers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get OAuth providers',
      error: error.message
    });
  }
};

export const initiateOAuthAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { providerId } = req.params;
    const { organizationId } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const state = `${userId}-${organizationId}-${Date.now()}`;
    const authUrl = OAuthService.getAuthorizationUrl(providerId, state);
    
    // Store state in session for validation
    req.session.oauthState = state;
    req.session.oauthProvider = providerId;
    req.session.organizationId = organizationId;

    res.status(200).json({
        success: true,
      authUrl,
      state
    });
  } catch (error: any) {
    logger.error(`Error initiating OAuth authentication for ${req.params.providerId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate OAuth authentication',
      error: error.message
    });
  }
};

export const handleOAuthCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { providerId } = req.params;
    const { code, state } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    if (!code) {
      res.status(400).json({ success: false, message: 'Authorization code is required' });
      return;
    }

    // Validate state parameter
    if (!OAuthService.validateState(state as string, req.session.oauthState)) {
      res.status(400).json({ success: false, message: 'Invalid state parameter' });
      return;
    }

    // Exchange code for token
    const accessToken = await OAuthService.exchangeCodeForToken(providerId, code as string);
    
    // Get user information
    const oauthUser = await OAuthService.getUserInfo(providerId, accessToken);
    
    // Provision user (JIT)
    const provisionResult = await OAuthService.provisionUser(oauthUser, req.session.organizationId);
    
    // Create JWT token
    const token = OAuthService.createJWTToken(oauthUser);

    res.status(200).json({
      success: true,
      message: 'OAuth authentication successful',
      token,
      user: {
        id: provisionResult.userId,
        email: oauthUser.email,
        firstName: oauthUser.firstName,
        lastName: oauthUser.lastName,
        roles: oauthUser.roles
      },
      isNewUser: provisionResult.isNewUser
    });
  } catch (error: any) {
    logger.error(`Error handling OAuth callback for ${req.params.providerId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to process OAuth callback',
      error: error.message
    });
  }
};

export const getOAuthUserInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { providerId } = req.params;
    const { accessToken } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    if (!accessToken) {
      res.status(400).json({ success: false, message: 'Access token is required' });
      return;
    }

    const userInfo = await OAuthService.getUserInfo(providerId, accessToken);
    
    res.status(200).json({
      success: true,
      userInfo
    });
  } catch (error: any) {
    logger.error(`Error getting OAuth user info for ${req.params.providerId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to get OAuth user info',
      error: error.message
    });
  }
};

export const verifyJWTToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ success: false, message: 'Token is required' });
      return;
    }

    const decoded = OAuthService.verifyJWTToken(token);
    
    res.status(200).json({
      success: true,
      decoded
    });
  } catch (error: any) {
    logger.error('Error verifying JWT token:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message
    });
  }
};