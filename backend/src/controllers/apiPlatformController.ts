import { Request, Response } from 'express';
import { apiPlatformService } from '../services/apiPlatformService';
import logger from '../utils/logger';

export class APIPlatformController {
  // API Key Management
  async createAPIKey(req: Request, res: Response): Promise<void> {
    try {
      const apiKey = await apiPlatformService.createAPIKey(req.body);
      res.status(201).json({
        success: true,
        data: apiKey,
        message: 'API key created successfully',
      });
    } catch (error) {
      logger.error('Error creating API key', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create API key',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getAPIKeys(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        userId: req.query.userId as string || undefined,
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await apiPlatformService.getAPIKeys(filters);
      res.json({
        success: true,
        data: result,
        message: 'API keys retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching API keys', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch API keys',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async revokeAPIKey(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const apiKey = await apiPlatformService.revokeAPIKey(id || '');
      res.json({
        success: true,
        data: apiKey,
        message: 'API key revoked successfully',
      });
    } catch (error) {
      logger.error('Error revoking API key', { error, apiKeyId: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Failed to revoke API key',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Webhook Management
  async createWebhook(req: Request, res: Response): Promise<void> {
    try {
      const webhook = await apiPlatformService.createWebhook(req.body);
      res.status(201).json({
        success: true,
        data: webhook,
        message: 'Webhook created successfully',
      });
    } catch (error) {
      logger.error('Error creating webhook', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create webhook',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getWebhooks(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        userId: req.query.userId as string || undefined,
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await apiPlatformService.getWebhooks(filters);
      res.json({
        success: true,
        data: result,
        message: 'Webhooks retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching webhooks', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch webhooks',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async triggerWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { event, payload } = req.body;
      const delivery = await apiPlatformService.triggerWebhook(id || '', event, payload);
      res.json({
        success: true,
        data: delivery,
        message: 'Webhook triggered successfully',
      });
    } catch (error) {
      logger.error('Error triggering webhook', { error, webhookId: req.params.id, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to trigger webhook',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Integration Management
  async createIntegration(req: Request, res: Response): Promise<void> {
    try {
      const integration = await apiPlatformService.createIntegration(req.body);
      res.status(201).json({
        success: true,
        data: integration,
        message: 'Integration created successfully',
      });
    } catch (error) {
      logger.error('Error creating integration', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create integration',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getIntegrations(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        category: req.query.category as string || undefined,
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await apiPlatformService.getIntegrations(filters);
      res.json({
        success: true,
        data: result,
        message: 'Integrations retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching integrations', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch integrations',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Integration Installation Management
  async installIntegration(req: Request, res: Response): Promise<void> {
    try {
      const installation = await apiPlatformService.installIntegration(req.body);
      res.status(201).json({
        success: true,
        data: installation,
        message: 'Integration installation started successfully',
      });
    } catch (error) {
      logger.error('Error installing integration', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to install integration',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getIntegrationInstallations(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        userId: req.query.userId as string || undefined,
        integrationId: req.query.integrationId as string || undefined,
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await apiPlatformService.getIntegrationInstallations(filters);
      res.json({
        success: true,
        data: result,
        message: 'Integration installations retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching integration installations', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch integration installations',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // SDK Management
  async createSDK(req: Request, res: Response): Promise<void> {
    try {
      const sdk = await apiPlatformService.createSDK(req.body);
      res.status(201).json({
        success: true,
        data: sdk,
        message: 'SDK created successfully',
      });
    } catch (error) {
      logger.error('Error creating SDK', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create SDK',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getSDKs(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        language: req.query.language as string || undefined,
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await apiPlatformService.getSDKs(filters);
      res.json({
        success: true,
        data: result,
        message: 'SDKs retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching SDKs', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch SDKs',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // API Version Management
  async createAPIVersion(req: Request, res: Response): Promise<void> {
    try {
      const version = await apiPlatformService.createAPIVersion(req.body);
      res.status(201).json({
        success: true,
        data: version,
        message: 'API version created successfully',
      });
    } catch (error) {
      logger.error('Error creating API version', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create API version',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getAPIVersions(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await apiPlatformService.getAPIVersions(filters);
      res.json({
        success: true,
        data: result,
        message: 'API versions retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching API versions', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch API versions',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Developer Portal Management
  async createDeveloperPortalContent(req: Request, res: Response): Promise<void> {
    try {
      const content = await apiPlatformService.createDeveloperPortalContent(req.body);
      res.status(201).json({
        success: true,
        data: content,
        message: 'Developer portal content created successfully',
      });
    } catch (error) {
      logger.error('Error creating developer portal content', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create developer portal content',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getDeveloperPortalContent(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        category: req.query.category as string || undefined,
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await apiPlatformService.getDeveloperPortalContent(filters);
      res.json({
        success: true,
        data: result,
        message: 'Developer portal content retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching developer portal content', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch developer portal content',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Analytics and Reporting
  async getAPIAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await apiPlatformService.getAPIAnalytics();
      res.json({
        success: true,
        data: analytics,
        message: 'API analytics retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching API analytics', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch API analytics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const apiPlatformController = new APIPlatformController();







