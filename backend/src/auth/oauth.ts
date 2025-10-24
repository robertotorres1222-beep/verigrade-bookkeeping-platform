import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import logger from '../utils/logger';

export interface OAuthProvider {
  id: string;
  name: string;
  clientId: string;
  clientSecret: string;
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string[];
  redirectUri: string;
}

export interface OAuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  provider: string;
  providerId: string;
  roles?: string[];
  groups?: string[];
}

class OAuthService {
  private providers: Map<string, OAuthProvider> = new Map();

  constructor() {
    this.initializeProviders();
    logger.info('[OAuthService] Initialized');
  }

  private initializeProviders() {
    // Google OAuth
    this.providers.set('google', {
      id: 'google',
      name: 'Google',
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
      scope: ['openid', 'email', 'profile'],
      redirectUri: `${process.env.API_BASE_URL}/auth/oauth/google/callback`
    });

    // Microsoft OAuth
    this.providers.set('microsoft', {
      id: 'microsoft',
      name: 'Microsoft',
      clientId: process.env.MICROSOFT_CLIENT_ID || '',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
      authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
      scope: ['openid', 'email', 'profile'],
      redirectUri: `${process.env.API_BASE_URL}/auth/oauth/microsoft/callback`
    });

    // GitHub OAuth
    this.providers.set('github', {
      id: 'github',
      name: 'GitHub',
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      authUrl: 'https://github.com/login/oauth/authorize',
      tokenUrl: 'https://github.com/login/oauth/access_token',
      userInfoUrl: 'https://api.github.com/user',
      scope: ['user:email'],
      redirectUri: `${process.env.API_BASE_URL}/auth/oauth/github/callback`
    });
  }

  /**
   * Gets OAuth provider configuration
   */
  public getProvider(providerId: string): OAuthProvider | null {
    return this.providers.get(providerId) || null;
  }

  /**
   * Gets all available OAuth providers
   */
  public getAllProviders(): OAuthProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Generates OAuth authorization URL
   */
  public getAuthorizationUrl(providerId: string, state?: string): string {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`OAuth provider ${providerId} not found`);
    }

    const params = new URLSearchParams({
      client_id: provider.clientId,
      redirect_uri: provider.redirectUri,
      response_type: 'code',
      scope: provider.scope.join(' '),
      state: state || this.generateState()
    });

    return `${provider.authUrl}?${params.toString()}`;
  }

  /**
   * Exchanges authorization code for access token
   */
  public async exchangeCodeForToken(providerId: string, code: string): Promise<string> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`OAuth provider ${providerId} not found`);
    }

    try {
      const response = await axios.post(provider.tokenUrl, {
        client_id: provider.clientId,
        client_secret: provider.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: provider.redirectUri
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const { access_token } = response.data;
      logger.info(`[OAuthService] Exchanged code for token for provider ${providerId}`);
      return access_token;
    } catch (error: any) {
      logger.error(`[OAuthService] Error exchanging code for token:`, error);
      throw new Error(`Failed to exchange authorization code: ${error.message}`);
    }
  }

  /**
   * Gets user information from OAuth provider
   */
  public async getUserInfo(providerId: string, accessToken: string): Promise<OAuthUser> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`OAuth provider ${providerId} not found`);
    }

    try {
      const response = await axios.get(provider.userInfoUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      const userData = response.data;
      const user: OAuthUser = this.mapProviderUserToOAuthUser(providerId, userData);

      logger.info(`[OAuthService] Retrieved user info for ${user.email} from ${providerId}`);
      return user;
    } catch (error: any) {
      logger.error(`[OAuthService] Error getting user info:`, error);
      throw new Error(`Failed to get user information: ${error.message}`);
    }
  }

  /**
   * Maps provider-specific user data to OAuthUser format
   */
  private mapProviderUserToOAuthUser(providerId: string, userData: any): OAuthUser {
    switch (providerId) {
      case 'google':
        return {
          id: userData.id,
          email: userData.email,
          firstName: userData.given_name,
          lastName: userData.family_name,
          avatar: userData.picture,
          provider: 'google',
          providerId: userData.id
        };

      case 'microsoft':
        return {
          id: userData.id,
          email: userData.mail || userData.userPrincipalName,
          firstName: userData.givenName,
          lastName: userData.surname,
          avatar: userData.photo,
          provider: 'microsoft',
          providerId: userData.id,
          roles: userData.roles || []
        };

      case 'github':
        return {
          id: userData.id.toString(),
          email: userData.email,
          firstName: userData.name?.split(' ')[0],
          lastName: userData.name?.split(' ').slice(1).join(' '),
          avatar: userData.avatar_url,
          provider: 'github',
          providerId: userData.id.toString()
        };

      default:
        throw new Error(`Unsupported OAuth provider: ${providerId}`);
    }
  }

  /**
   * Generates random state parameter
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Validates OAuth state parameter
   */
  public validateState(state: string, expectedState: string): boolean {
    return state === expectedState;
  }

  /**
   * Creates JWT token for OAuth user
   */
  public createJWTToken(user: OAuthUser): string {
    const payload = {
      sub: user.id,
      email: user.email,
      provider: user.provider,
      providerId: user.providerId,
      roles: user.roles || ['user'],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    return jwt.sign(payload, process.env.JWT_SECRET || 'default-secret');
  }

  /**
   * Verifies JWT token
   */
  public verifyJWTToken(token: string): any {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    } catch (error: any) {
      logger.error('[OAuthService] Error verifying JWT token:', error);
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Implements Just-In-Time (JIT) provisioning
   */
  public async provisionUser(user: OAuthUser, organizationId?: string): Promise<{
    userId: string;
    isNewUser: boolean;
    roles: string[];
  }> {
    try {
      // Check if user already exists
      const existingUser = await this.findUserByProviderId(user.provider, user.providerId);
      
      if (existingUser) {
        // Update existing user
        await this.updateUserFromOAuth(existingUser.id, user);
        return {
          userId: existingUser.id,
          isNewUser: false,
          roles: user.roles || ['user']
        };
      }

      // Create new user
      const newUserId = await this.createUserFromOAuth(user, organizationId);
      return {
        userId: newUserId,
        isNewUser: true,
        roles: user.roles || ['user']
      };
    } catch (error: any) {
      logger.error('[OAuthService] Error provisioning user:', error);
      throw new Error(`Failed to provision user: ${error.message}`);
    }
  }

  /**
   * Finds user by provider ID
   */
  private async findUserByProviderId(provider: string, providerId: string): Promise<any> {
    // This would query your user database
    // For now, returning null to simulate new user
    return null;
  }

  /**
   * Updates existing user from OAuth data
   */
  private async updateUserFromOAuth(userId: string, oauthUser: OAuthUser): Promise<void> {
    // This would update user data in your database
    logger.info(`[OAuthService] Updated user ${userId} from OAuth data`);
  }

  /**
   * Creates new user from OAuth data
   */
  private async createUserFromOAuth(oauthUser: OAuthUser, organizationId?: string): Promise<string> {
    // This would create a new user in your database
    const userId = `user_${Date.now()}`;
    logger.info(`[OAuthService] Created new user ${userId} from OAuth data`);
    return userId;
  }

  /**
   * Maps OAuth groups to application roles
   */
  public mapGroupsToRoles(groups: string[]): string[] {
    const roleMap: { [key: string]: string } = {
      'admin': 'admin',
      'administrator': 'admin',
      'manager': 'manager',
      'accountant': 'accountant',
      'user': 'user',
      'viewer': 'viewer'
    };

    const roles: string[] = [];
    for (const group of groups) {
      const role = roleMap[group.toLowerCase()];
      if (role && !roles.includes(role)) {
        roles.push(role);
      }
    }

    // Default role if no mapping found
    if (roles.length === 0) {
      roles.push('user');
    }

    return roles;
  }
}

export default new OAuthService();






