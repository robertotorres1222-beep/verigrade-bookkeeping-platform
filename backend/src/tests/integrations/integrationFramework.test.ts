import IntegrationFramework from '../../integrations/framework/IntegrationFramework';
import { IntegrationConnection } from '../../integrations/framework/IntegrationFramework';

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(),
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  }))
}));

describe('IntegrationFramework', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAuthorizationUrl', () => {
    it('should generate authorization URL for QuickBooks', () => {
      const userId = 'user123';
      const authUrl = IntegrationFramework.getAuthorizationUrl('quickbooks', userId);
      
      expect(authUrl).toContain('appcenter.intuit.com');
      expect(authUrl).toContain('client_id');
      expect(authUrl).toContain('response_type=code');
      expect(authUrl).toContain('scope');
    });

    it('should generate authorization URL for Xero', () => {
      const userId = 'user123';
      const authUrl = IntegrationFramework.getAuthorizationUrl('xero', userId);
      
      expect(authUrl).toContain('login.xero.com');
      expect(authUrl).toContain('client_id');
      expect(authUrl).toContain('response_type=code');
    });

    it('should throw error for unknown integration', () => {
      const userId = 'user123';
      
      expect(() => {
        IntegrationFramework.getAuthorizationUrl('unknown', userId);
      }).toThrow('Integration unknown not found or not OAuth type');
    });
  });

  describe('exchangeCodeForToken', () => {
    const mockAxios = require('axios');
    
    beforeEach(() => {
      mockAxios.post.mockResolvedValue({
        data: {
          access_token: 'mock_access_token',
          refresh_token: 'mock_refresh_token',
          expires_in: 3600
        }
      });
    });

    it('should exchange code for token successfully', async () => {
      const userId = 'user123';
      const code = 'mock_auth_code';
      
      const connection = await IntegrationFramework.exchangeCodeForToken('quickbooks', code, userId);
      
      expect(connection).toBeDefined();
      expect(connection.userId).toBe(userId);
      expect(connection.integrationId).toBe('quickbooks');
      expect(connection.status).toBe('active');
      expect(connection.credentials.accessToken).toBe('mock_access_token');
      expect(connection.credentials.refreshToken).toBe('mock_refresh_token');
    });

    it('should handle token exchange error', async () => {
      const userId = 'user123';
      const code = 'invalid_code';
      
      mockAxios.post.mockRejectedValue(new Error('Invalid authorization code'));
      
      await expect(
        IntegrationFramework.exchangeCodeForToken('quickbooks', code, userId)
      ).rejects.toThrow('Failed to exchange authorization code: Invalid authorization code');
    });
  });

  describe('getConnectionsByUser', () => {
    it('should return empty array for user with no connections', () => {
      const connections = IntegrationFramework.getConnectionsByUser('user123');
      expect(connections).toEqual([]);
    });

    it('should return connections for specific user', async () => {
      const userId = 'user123';
      const mockAxios = require('axios');
      
      mockAxios.post.mockResolvedValue({
        data: {
          access_token: 'mock_access_token',
          refresh_token: 'mock_refresh_token',
          expires_in: 3600
        }
      });

      // Create a connection
      await IntegrationFramework.exchangeCodeForToken('quickbooks', 'mock_code', userId);
      
      const connections = IntegrationFramework.getConnectionsByUser(userId);
      expect(connections).toHaveLength(1);
      expect(connections[0].userId).toBe(userId);
      expect(connections[0].integrationId).toBe('quickbooks');
    });
  });

  describe('disconnectIntegration', () => {
    it('should disconnect integration successfully', async () => {
      const userId = 'user123';
      const mockAxios = require('axios');
      
      mockAxios.post.mockResolvedValue({
        data: {
          access_token: 'mock_access_token',
          refresh_token: 'mock_refresh_token',
          expires_in: 3600
        }
      });

      // Create a connection
      const connection = await IntegrationFramework.exchangeCodeForToken('quickbooks', 'mock_code', userId);
      
      // Disconnect it
      const result = await IntegrationFramework.disconnectIntegration(connection.id);
      expect(result).toBe(true);
      
      // Verify connection is inactive
      const updatedConnection = IntegrationFramework.getConnection(connection.id);
      expect(updatedConnection?.status).toBe('inactive');
    });

    it('should return false for non-existent connection', async () => {
      const result = await IntegrationFramework.disconnectIntegration('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('startSyncJob', () => {
    it('should start sync job successfully', async () => {
      const userId = 'user123';
      const mockAxios = require('axios');
      
      mockAxios.post.mockResolvedValue({
        data: {
          access_token: 'mock_access_token',
          refresh_token: 'mock_refresh_token',
          expires_in: 3600
        }
      });

      // Create a connection
      const connection = await IntegrationFramework.exchangeCodeForToken('quickbooks', 'mock_code', userId);
      
      // Start sync job
      const syncJob = await IntegrationFramework.startSyncJob(connection.id, 'full');
      
      expect(syncJob).toBeDefined();
      expect(syncJob.connectionId).toBe(connection.id);
      expect(syncJob.type).toBe('full');
      expect(syncJob.status).toBe('pending');
    });
  });

  describe('processWebhookEvent', () => {
    it('should process webhook event successfully', async () => {
      const integrationId = 'quickbooks';
      const eventType = 'invoice.created';
      const payload = { invoice: { id: '123', amount: 100 } };
      
      const event = await IntegrationFramework.processWebhookEvent(
        integrationId,
        eventType,
        payload
      );
      
      expect(event).toBeDefined();
      expect(event.integrationId).toBe(integrationId);
      expect(event.eventType).toBe(eventType);
      expect(event.payload).toEqual(payload);
      expect(event.processed).toBe(false);
    });

    it('should verify webhook signature when secret is provided', async () => {
      const integrationId = 'quickbooks';
      const eventType = 'invoice.created';
      const payload = { invoice: { id: '123', amount: 100 } };
      const signature = 'valid_signature';
      
      // Mock crypto
      const crypto = require('crypto');
      const mockHmac = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('valid_signature')
      };
      crypto.createHmac = jest.fn().mockReturnValue(mockHmac);
      
      const event = await IntegrationFramework.processWebhookEvent(
        integrationId,
        eventType,
        payload,
        signature
      );
      
      expect(event).toBeDefined();
      expect(crypto.createHmac).toHaveBeenCalledWith('sha256', undefined);
    });
  });
});







