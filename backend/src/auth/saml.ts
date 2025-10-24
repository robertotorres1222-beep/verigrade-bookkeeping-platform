import { Request, Response } from 'express';
import * as saml from 'saml2-js';
import * as crypto from 'crypto';
import logger from '../utils/logger';

export interface SAMLConfig {
  entityId: string;
  ssoUrl: string;
  sloUrl?: string;
  certificate: string;
  privateKey?: string;
  nameIdFormat: string;
  signatureAlgorithm: string;
  digestAlgorithm: string;
  authnContext: string;
  requestBinding: 'HTTP-POST' | 'HTTP-Redirect';
  responseBinding: 'HTTP-POST' | 'HTTP-Redirect';
}

export interface SAMLUser {
  nameId: string;
  attributes: {
    email?: string;
    firstName?: string;
    lastName?: string;
    department?: string;
    title?: string;
    groups?: string[];
  };
}

class SAMLService {
  private sp: saml.ServiceProvider;
  private idp: saml.IdentityProvider;
  private config: SAMLConfig;

  constructor(config: SAMLConfig) {
    this.config = config;
    this.initializeProviders();
    logger.info('[SAMLService] Initialized');
  }

  private initializeProviders() {
    // Service Provider configuration
    const spOptions = {
      entity_id: this.config.entityId,
      private_key: this.config.privateKey,
      certificate: this.config.certificate,
      assert_endpoint: `${process.env.API_BASE_URL}/auth/saml/assert`,
      force_authn: true,
      auth_context: {
        comparison: 'exact',
        class_refs: [this.config.authnContext]
      },
      nameid_format: this.config.nameIdFormat,
      sign_get_request: false,
      allow_unencrypted_assertion: false
    };

    // Identity Provider configuration
    const idpOptions = {
      sso_login_url: this.config.ssoUrl,
      sso_logout_url: this.config.sloUrl,
      certificates: [this.config.certificate],
      force_authn: true,
      sign_get_request: false,
      allow_unencrypted_assertion: false
    };

    this.sp = new saml.ServiceProvider(spOptions);
    this.idp = new saml.IdentityProvider(idpOptions);
  }

  /**
   * Generates SAML authentication request
   */
  public async generateAuthRequest(): Promise<{
    requestUrl: string;
    requestId: string;
  }> {
    return new Promise((resolve, reject) => {
      this.sp.create_login_request_url(this.idp, {}, (err, loginUrl, requestId) => {
        if (err) {
          logger.error('[SAMLService] Error generating auth request:', err);
          reject(new Error(`Failed to generate SAML auth request: ${err.message}`));
          return;
        }

        logger.info(`[SAMLService] Generated SAML auth request: ${requestId}`);
        resolve({
          requestUrl: loginUrl,
          requestId: requestId || ''
        });
      });
    });
  }

  /**
   * Processes SAML response
   */
  public async processResponse(
    samlResponse: string,
    relayState?: string
  ): Promise<SAMLUser> {
    return new Promise((resolve, reject) => {
      this.sp.post_assert(this.idp, { SAMLResponse: samlResponse, RelayState: relayState }, (err, samlAssertion) => {
        if (err) {
          logger.error('[SAMLService] Error processing SAML response:', err);
          reject(new Error(`Failed to process SAML response: ${err.message}`));
          return;
        }

        const user: SAMLUser = {
          nameId: samlAssertion.user.name_id,
          attributes: {
            email: samlAssertion.user.attributes?.email?.[0],
            firstName: samlAssertion.user.attributes?.firstName?.[0] || samlAssertion.user.attributes?.givenName?.[0],
            lastName: samlAssertion.user.attributes?.lastName?.[0] || samlAssertion.user.attributes?.surname?.[0],
            department: samlAssertion.user.attributes?.department?.[0],
            title: samlAssertion.user.attributes?.title?.[0],
            groups: samlAssertion.user.attributes?.groups || samlAssertion.user.attributes?.memberOf || []
          }
        };

        logger.info(`[SAMLService] Processed SAML response for user: ${user.nameId}`);
        resolve(user);
      });
    });
  }

  /**
   * Generates SAML logout request
   */
  public async generateLogoutRequest(nameId: string): Promise<{
    logoutUrl: string;
    requestId: string;
  }> {
    return new Promise((resolve, reject) => {
      this.sp.create_logout_request_url(this.idp, { name_id: nameId }, (err, logoutUrl, requestId) => {
        if (err) {
          logger.error('[SAMLService] Error generating logout request:', err);
          reject(new Error(`Failed to generate SAML logout request: ${err.message}`));
          return;
        }

        logger.info(`[SAMLService] Generated SAML logout request: ${requestId}`);
        resolve({
          logoutUrl: logoutUrl,
          requestId: requestId || ''
        });
      });
    });
  }

  /**
   * Processes SAML logout response
   */
  public async processLogoutResponse(samlResponse: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.sp.post_assert(this.idp, { SAMLResponse: samlResponse }, (err, samlAssertion) => {
        if (err) {
          logger.error('[SAMLService] Error processing SAML logout response:', err);
          reject(new Error(`Failed to process SAML logout response: ${err.message}`));
          return;
        }

        logger.info('[SAMLService] Processed SAML logout response successfully');
        resolve(true);
      });
    });
  }

  /**
   * Validates SAML signature
   */
  public validateSignature(samlResponse: string, signature: string): boolean {
    try {
      const verifier = crypto.createVerify(this.config.signatureAlgorithm);
      verifier.update(samlResponse);
      return verifier.verify(this.config.certificate, signature, 'base64');
    } catch (error: any) {
      logger.error('[SAMLService] Error validating SAML signature:', error);
      return false;
    }
  }

  /**
   * Gets SAML metadata
   */
  public getMetadata(): string {
    return this.sp.get_metadata();
  }

  /**
   * Maps SAML attributes to user roles
   */
  public mapAttributesToRoles(attributes: SAMLUser['attributes']): string[] {
    const roles: string[] = [];

    // Map groups to roles
    if (attributes.groups) {
      for (const group of attributes.groups) {
        switch (group.toLowerCase()) {
          case 'administrators':
          case 'admin':
            roles.push('admin');
            break;
          case 'managers':
          case 'manager':
            roles.push('manager');
            break;
          case 'accountants':
          case 'accounting':
            roles.push('accountant');
            break;
          case 'users':
          case 'user':
            roles.push('user');
            break;
          default:
            roles.push('user');
        }
      }
    }

    // Default role if no groups found
    if (roles.length === 0) {
      roles.push('user');
    }

    return roles;
  }
}

export default SAMLService;







