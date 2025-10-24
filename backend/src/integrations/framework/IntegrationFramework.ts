import axios, { AxiosInstance } from 'axios';
import logger from '../../utils/logger';

export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'oauth' | 'api_key' | 'webhook';
  baseUrl: string;
  authUrl?: string;
  tokenUrl?: string;
  scopes?: string[];
  rateLimit?: {
    requests: number;
    window: number; // in seconds
  };
  webhookSecret?: string;
}

export interface OAuthCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface IntegrationConnection {
  id: string;
  userId: string;
  integrationId: string;
  status: 'active' | 'inactive' | 'error' | 'expired';
  credentials: {
    accessToken?: string;
    refreshToken?: string;
    apiKey?: string;
    expiresAt?: Date;
  };
  metadata?: any;
  lastSync?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncJob {
  id: string;
  connectionId: string;
  type: 'full' | 'incremental';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  recordsProcessed: number;
  recordsFailed: number;
  errorMessage?: string;
}

export interface WebhookEvent {
  id: string;
  integrationId: string;
  eventType: string;
  payload: any;
  processed: boolean;
  processedAt?: Date;
  errorMessage?: string;
  createdAt: Date;
}

class IntegrationFramework {
  private connections: Map<string, IntegrationConnection> = new Map();
  private syncJobs: Map<string, SyncJob> = new Map();
  private webhookEvents: Map<string, WebhookEvent> = new Map();
  private integrations: Map<string, IntegrationConfig> = new Map();

  constructor() {
    this.initializeDefaultIntegrations();
    logger.info('[IntegrationFramework] Initialized with default integrations');
  }

  private initializeDefaultIntegrations() {
    const defaultIntegrations: IntegrationConfig[] = [
      {
        id: 'quickbooks',
        name: 'QuickBooks Online',
        type: 'oauth',
        baseUrl: 'https://sandbox-quickbooks.api.intuit.com',
        authUrl: 'https://appcenter.intuit.com/connect/oauth2',
        tokenUrl: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
        scopes: ['com.intuit.quickbooks.accounting'],
        rateLimit: { requests: 500, window: 3600 }
      },
      {
        id: 'xero',
        name: 'Xero',
        type: 'oauth',
        baseUrl: 'https://api.xero.com',
        authUrl: 'https://login.xero.com/identity/connect/authorize',
        tokenUrl: 'https://identity.xero.com/connect/token',
        scopes: ['accounting.transactions', 'accounting.contacts.read'],
        rateLimit: { requests: 1000, window: 3600 }
      },
      {
        id: 'shopify',
        name: 'Shopify',
        type: 'oauth',
        baseUrl: 'https://{shop}.myshopify.com/admin/api/2023-10',
        authUrl: 'https://{shop}.myshopify.com/admin/oauth/authorize',
        tokenUrl: 'https://{shop}.myshopify.com/admin/oauth/access_token',
        scopes: ['read_orders', 'read_products', 'read_customers'],
        rateLimit: { requests: 40, window: 1 }
      },
      {
        id: 'salesforce',
        name: 'Salesforce',
        type: 'oauth',
        baseUrl: 'https://{instance}.salesforce.com/services/data/v58.0',
        authUrl: 'https://login.salesforce.com/services/oauth2/authorize',
        tokenUrl: 'https://login.salesforce.com/services/oauth2/token',
        scopes: ['api', 'refresh_token'],
        rateLimit: { requests: 1000, window: 3600 }
      },
      {
        id: 'slack',
        name: 'Slack',
        type: 'oauth',
        baseUrl: 'https://slack.com/api',
        authUrl: 'https://slack.com/oauth/v2/authorize',
        tokenUrl: 'https://slack.com/api/oauth.v2.access',
        scopes: ['chat:write', 'channels:read', 'users:read'],
        rateLimit: { requests: 1, window: 1 }
      }
    ];

    defaultIntegrations.forEach(integration => {
      this.integrations.set(integration.id, integration);
    });
  }

  /**
   * Gets OAuth authorization URL for an integration
   */
  public getAuthorizationUrl(integrationId: string, userId: string, state?: string): string {
    const integration = this.integrations.get(integrationId);
    if (!integration || integration.type !== 'oauth') {
      throw new Error(`Integration ${integrationId} not found or not OAuth type`);
    }

    const params = new URLSearchParams({
      client_id: process.env[`${integrationId.toUpperCase()}_CLIENT_ID`] || '',
      redirect_uri: integration.redirectUri || `${process.env.API_BASE_URL}/integrations/oauth/callback`,
      response_type: 'code',
      scope: integration.scopes?.join(' ') || '',
      state: state || `${userId}-${Date.now()}`
    });

    return `${integration.authUrl}?${params.toString()}`;
  }

  /**
   * Exchanges authorization code for access token
   */
  public async exchangeCodeForToken(
    integrationId: string,
    code: string,
    userId: string
  ): Promise<IntegrationConnection> {
    const integration = this.integrations.get(integrationId);
    if (!integration || integration.type !== 'oauth') {
      throw new Error(`Integration ${integrationId} not found or not OAuth type`);
    }

    try {
      const tokenResponse = await axios.post(integration.tokenUrl!, {
        grant_type: 'authorization_code',
        client_id: process.env[`${integrationId.toUpperCase()}_CLIENT_ID`],
        client_secret: process.env[`${integrationId.toUpperCase()}_CLIENT_SECRET`],
        redirect_uri: integration.redirectUri || `${process.env.API_BASE_URL}/integrations/oauth/callback`,
        code
      });

      const connection: IntegrationConnection = {
        id: `conn-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        integrationId,
        status: 'active',
        credentials: {
          accessToken: tokenResponse.data.access_token,
          refreshToken: tokenResponse.data.refresh_token,
          expiresAt: tokenResponse.data.expires_in 
            ? new Date(Date.now() + tokenResponse.data.expires_in * 1000)
            : undefined
        },
        metadata: tokenResponse.data,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.connections.set(connection.id, connection);
      logger.info(`[IntegrationFramework] Created connection for ${integrationId} for user ${userId}`);
      
      return connection;
    } catch (error: any) {
      logger.error(`[IntegrationFramework] Error exchanging code for token:`, error);
      throw new Error(`Failed to exchange authorization code: ${error.message}`);
    }
  }

  /**
   * Refreshes access token using refresh token
   */
  public async refreshAccessToken(connectionId: string): Promise<IntegrationConnection> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`);
    }

    const integration = this.integrations.get(connection.integrationId);
    if (!integration || !connection.credentials.refreshToken) {
      throw new Error('Cannot refresh token: missing integration or refresh token');
    }

    try {
      const refreshResponse = await axios.post(integration.tokenUrl!, {
        grant_type: 'refresh_token',
        client_id: process.env[`${connection.integrationId.toUpperCase()}_CLIENT_ID`],
        client_secret: process.env[`${connection.integrationId.toUpperCase()}_CLIENT_SECRET`],
        refresh_token: connection.credentials.refreshToken
      });

      connection.credentials.accessToken = refreshResponse.data.access_token;
      connection.credentials.refreshToken = refreshResponse.data.refresh_token || connection.credentials.refreshToken;
      connection.credentials.expiresAt = refreshResponse.data.expires_in 
        ? new Date(Date.now() + refreshResponse.data.expires_in * 1000)
        : undefined;
      connection.updatedAt = new Date();

      this.connections.set(connectionId, connection);
      logger.info(`[IntegrationFramework] Refreshed token for connection ${connectionId}`);
      
      return connection;
    } catch (error: any) {
      connection.status = 'error';
      connection.errorMessage = error.message;
      this.connections.set(connectionId, connection);
      logger.error(`[IntegrationFramework] Error refreshing token:`, error);
      throw error;
    }
  }

  /**
   * Creates authenticated HTTP client for integration
   */
  public createAuthenticatedClient(connectionId: string): AxiosInstance {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`);
    }

    const integration = this.integrations.get(connection.integrationId);
    if (!integration) {
      throw new Error(`Integration ${connection.integrationId} not found`);
    }

    const client = axios.create({
      baseURL: integration.baseUrl,
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${connection.credentials.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    // Add rate limiting interceptor
    if (integration.rateLimit) {
      this.addRateLimitInterceptor(client, integration.rateLimit);
    }

    // Add token refresh interceptor
    client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && connection.credentials.refreshToken) {
          try {
            await this.refreshAccessToken(connectionId);
            const newConnection = this.connections.get(connectionId);
            if (newConnection?.credentials.accessToken) {
              error.config.headers.Authorization = `Bearer ${newConnection.credentials.accessToken}`;
              return client.request(error.config);
            }
          } catch (refreshError) {
            logger.error(`[IntegrationFramework] Token refresh failed:`, refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return client;
  }

  /**
   * Adds rate limiting interceptor to HTTP client
   */
  private addRateLimitInterceptor(client: AxiosInstance, rateLimit: { requests: number; window: number }) {
    const requestTimes: number[] = [];

    client.interceptors.request.use((config) => {
      const now = Date.now();
      const windowStart = now - (rateLimit.window * 1000);
      
      // Remove old requests outside the window
      while (requestTimes.length > 0 && requestTimes[0] < windowStart) {
        requestTimes.shift();
      }

      if (requestTimes.length >= rateLimit.requests) {
        const oldestRequest = requestTimes[0];
        const waitTime = (oldestRequest + (rateLimit.window * 1000)) - now;
        
        if (waitTime > 0) {
          logger.warn(`[IntegrationFramework] Rate limit reached, waiting ${waitTime}ms`);
          return new Promise(resolve => {
            setTimeout(() => resolve(config), waitTime);
          });
        }
      }

      requestTimes.push(now);
      return config;
    });
  }

  /**
   * Processes webhook event
   */
  public async processWebhookEvent(
    integrationId: string,
    eventType: string,
    payload: any,
    signature?: string
  ): Promise<WebhookEvent> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error(`Integration ${integrationId} not found`);
    }

    // Verify webhook signature if secret is configured
    if (integration.webhookSecret && signature) {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', integration.webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');
      
      if (signature !== expectedSignature) {
        throw new Error('Invalid webhook signature');
      }
    }

    const event: WebhookEvent = {
      id: `webhook-${Math.random().toString(36).substr(2, 9)}`,
      integrationId,
      eventType,
      payload,
      processed: false,
      createdAt: new Date()
    };

    this.webhookEvents.set(event.id, event);
    logger.info(`[IntegrationFramework] Processed webhook event ${event.id} for ${integrationId}`);
    
    return event;
  }

  /**
   * Starts a sync job
   */
  public async startSyncJob(
    connectionId: string,
    type: 'full' | 'incremental' = 'incremental'
  ): Promise<SyncJob> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`);
    }

    const job: SyncJob = {
      id: `sync-${Math.random().toString(36).substr(2, 9)}`,
      connectionId,
      type,
      status: 'pending',
      recordsProcessed: 0,
      recordsFailed: 0,
      startedAt: new Date()
    };

    this.syncJobs.set(job.id, job);
    logger.info(`[IntegrationFramework] Started sync job ${job.id} for connection ${connectionId}`);
    
    return job;
  }

  /**
   * Gets connection by ID
   */
  public getConnection(connectionId: string): IntegrationConnection | undefined {
    return this.connections.get(connectionId);
  }

  /**
   * Gets all connections for a user
   */
  public getConnectionsByUser(userId: string): IntegrationConnection[] {
    return Array.from(this.connections.values()).filter(conn => conn.userId === userId);
  }

  /**
   * Gets sync job by ID
   */
  public getSyncJob(jobId: string): SyncJob | undefined {
    return this.syncJobs.get(jobId);
  }

  /**
   * Gets webhook event by ID
   */
  public getWebhookEvent(eventId: string): WebhookEvent | undefined {
    return this.webhookEvents.get(eventId);
  }

  /**
   * Disconnects an integration
   */
  public async disconnectIntegration(connectionId: string): Promise<boolean> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return false;
    }

    connection.status = 'inactive';
    connection.updatedAt = new Date();
    this.connections.set(connectionId, connection);
    
    logger.info(`[IntegrationFramework] Disconnected integration ${connectionId}`);
    return true;
  }
}

export default new IntegrationFramework();







