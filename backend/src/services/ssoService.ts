import logger from '../utils/logger';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface UserInfo {
  email: string;
  firstName: string;
  lastName: string;
  id: string;
  picture?: string;
}

export class SSOService {
  // Generate OAuth2 authorization URL
  async generateAuthUrl(ssoConfig: any): Promise<string> {
    const { provider, clientId, redirectUri, configuration } = ssoConfig;
    
    const baseUrls = {
      google: 'https://accounts.google.com/o/oauth2/v2/auth',
      microsoft: `https://login.microsoftonline.com/${configuration.tenantId}/oauth2/v2.0/authorize`
    };

    const baseUrl = baseUrls[provider as keyof typeof baseUrls];
    if (!baseUrl) {
      throw new Error(`Unsupported SSO provider: ${provider}`);
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: configuration.responseType || 'code',
      scope: configuration.scope?.join(' ') || 'openid email profile',
      state: ssoConfig.organizationId,
      access_type: 'offline',
      prompt: 'consent'
    });

    return `${baseUrl}?${params.toString()}`;
  }

  // Exchange authorization code for user info
  async exchangeCodeForUserInfo(ssoConfig: any, code: string): Promise<UserInfo> {
    const { provider, clientId, clientSecret, redirectUri, configuration } = ssoConfig;

    try {
      // Exchange code for access token
      const tokenResponse = await this.exchangeCodeForToken(provider, {
        clientId,
        clientSecret,
        redirectUri,
        code,
        configuration
      });

      // Get user info using access token
      const userInfo = await this.getUserInfo(provider, tokenResponse.access_token);
      
      return userInfo;
    } catch (error: any) {
      logger.error(`SSO token exchange failed for ${provider}:`, error);
      throw new Error(`Failed to authenticate with ${provider}: ${error.message}`);
    }
  }

  // Exchange authorization code for access token
  private async exchangeCodeForToken(provider: string, config: any): Promise<any> {
    const tokenUrls = {
      google: 'https://oauth2.googleapis.com/token',
      microsoft: `https://login.microsoftonline.com/${config.configuration.tenantId}/oauth2/v2.0/token`
    };

    const tokenUrl = tokenUrls[provider as keyof typeof tokenUrls];
    if (!tokenUrl) {
      throw new Error(`Unsupported SSO provider: ${provider}`);
    }

    const data = {
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code: config.code,
      grant_type: 'authorization_code',
      redirect_uri: config.redirectUri
    };

    const response = await axios.post(tokenUrl, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return response.data;
  }

  // Get user information from provider
  private async getUserInfo(provider: string, accessToken: string): Promise<UserInfo> {
    const userInfoUrls = {
      google: 'https://www.googleapis.com/oauth2/v2/userinfo',
      microsoft: 'https://graph.microsoft.com/v1.0/me'
    };

    const userInfoUrl = userInfoUrls[provider as keyof typeof userInfoUrls];
    if (!userInfoUrl) {
      throw new Error(`Unsupported SSO provider: ${provider}`);
    }

    const response = await axios.get(userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const data = response.data;

    // Normalize user info across providers
    if (provider === 'google') {
      return {
        email: data.email,
        firstName: data.given_name,
        lastName: data.family_name,
        id: data.id,
        picture: data.picture
      };
    } else if (provider === 'microsoft') {
      return {
        email: data.mail || data.userPrincipalName,
        firstName: data.givenName,
        lastName: data.surname,
        id: data.id,
        picture: undefined // Microsoft Graph doesn't provide profile picture in basic profile
      };
    }

    throw new Error(`Unsupported SSO provider: ${provider}`);
  }

  // Generate SAML metadata
  async generateSAMLMetadata(ssoConfig: any): Promise<string> {
    const { entityId, ssoUrl, x509Certificate } = ssoConfig;
    
    const metadata = `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="${entityId}">
  <md:IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="${ssoUrl}"/>
    <md:KeyDescriptor use="signing">
      <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <ds:X509Data>
          <ds:X509Certificate>${x509Certificate}</ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </md:KeyDescriptor>
  </md:IDPSSODescriptor>
</md:EntityDescriptor>`;

    return metadata;
  }

  // Validate SAML response
  async validateSAMLResponse(samlResponse: string, ssoConfig: any): Promise<UserInfo> {
    // In a real implementation, you would use a SAML library like 'passport-saml'
    // or 'saml2-js' to parse and validate the SAML response
    
    // This is a simplified example - you would need to implement proper SAML parsing
    logger.info('SAML response validation would be implemented here');
    
    // For now, return mock data
    return {
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      id: 'saml-user-id'
    };
  }

  // Test SSO configuration
  async testSSOConfiguration(ssoConfig: any): Promise<boolean> {
    try {
      const { provider } = ssoConfig;
      
      if (provider === 'google' || provider === 'microsoft') {
        // Test OAuth2 configuration by attempting to generate auth URL
        await this.generateAuthUrl(ssoConfig);
        return true;
      } else if (provider === 'saml') {
        // Test SAML configuration by generating metadata
        await this.generateSAMLMetadata(ssoConfig);
        return true;
      }
      
      return false;
    } catch (error: any) {
      logger.error(`SSO configuration test failed for ${ssoConfig.provider}:`, error);
      return false;
    }
  }

  // Get supported SSO providers
  getSupportedProviders(): string[] {
    return ['google', 'microsoft', 'saml'];
  }

  // Get provider configuration requirements
  getProviderRequirements(provider: string): any {
    const requirements = {
      google: {
        required: ['clientId', 'clientSecret', 'redirectUri'],
        optional: ['scope'],
        description: 'Google OAuth2 configuration'
      },
      microsoft: {
        required: ['clientId', 'clientSecret', 'redirectUri', 'tenantId'],
        optional: ['scope'],
        description: 'Microsoft OAuth2 configuration'
      },
      saml: {
        required: ['entityId', 'ssoUrl', 'x509Certificate'],
        optional: ['nameIdFormat', 'attributeMapping'],
        description: 'SAML SSO configuration'
      }
    };

    return requirements[provider as keyof typeof requirements] || null;
  }

  // Clean up expired SSO sessions
  async cleanupExpiredSessions(): Promise<void> {
    try {
      // Delete SSO sessions older than 24 hours
      const expiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      await prisma.ssoSession.deleteMany({
        where: {
          createdAt: {
            lt: expiredDate
          }
        }
      });
      
      logger.info('Cleaned up expired SSO sessions');
    } catch (error) {
      logger.error('Failed to cleanup expired SSO sessions:', error);
    }
  }
}

export const ssoService = new SSOService();
