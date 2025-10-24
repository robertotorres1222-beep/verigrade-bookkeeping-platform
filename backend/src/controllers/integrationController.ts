import { Request, Response } from 'express';
import { integrationService } from '../services/integrationService';
import logger from '../utils/logger';

export class IntegrationController {
  // QuickBooks Integration
  async syncQuickBooks(req: Request, res: Response): Promise<void> {
    try {
      await integrationService.syncQuickBooks(req.body);
      res.json({ success: true, message: 'QuickBooks synced successfully' });
    } catch (error) {
      logger.error('Error syncing QuickBooks', { error });
      res.status(500).json({ success: false, message: 'Failed to sync QuickBooks' });
    }
  }

  async getQuickBooksStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await integrationService.getQuickBooksStatus();
      res.json({ success: true, data: status });
    } catch (error) {
      logger.error('Error getting QuickBooks status', { error });
      res.status(500).json({ success: false, message: 'Failed to get QuickBooks status' });
    }
  }

  // Xero Integration
  async syncXero(req: Request, res: Response): Promise<void> {
    try {
      await integrationService.syncXero(req.body);
      res.json({ success: true, message: 'Xero synced successfully' });
    } catch (error) {
      logger.error('Error syncing Xero', { error });
      res.status(500).json({ success: false, message: 'Failed to sync Xero' });
    }
  }

  async getXeroStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await integrationService.getXeroStatus();
      res.json({ success: true, data: status });
    } catch (error) {
      logger.error('Error getting Xero status', { error });
      res.status(500).json({ success: false, message: 'Failed to get Xero status' });
    }
  }

  // Shopify Integration
  async syncShopify(req: Request, res: Response): Promise<void> {
    try {
      await integrationService.syncShopify(req.body);
      res.json({ success: true, message: 'Shopify synced successfully' });
    } catch (error) {
      logger.error('Error syncing Shopify', { error });
      res.status(500).json({ success: false, message: 'Failed to sync Shopify' });
    }
  }

  async getShopifyStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await integrationService.getShopifyStatus();
      res.json({ success: true, data: status });
    } catch (error) {
      logger.error('Error getting Shopify status', { error });
      res.status(500).json({ success: false, message: 'Failed to get Shopify status' });
    }
  }

  // Salesforce Integration
  async syncSalesforce(req: Request, res: Response): Promise<void> {
    try {
      await integrationService.syncSalesforce(req.body);
      res.json({ success: true, message: 'Salesforce synced successfully' });
    } catch (error) {
      logger.error('Error syncing Salesforce', { error });
      res.status(500).json({ success: false, message: 'Failed to sync Salesforce' });
    }
  }

  async getSalesforceStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await integrationService.getSalesforceStatus();
      res.json({ success: true, data: status });
    } catch (error) {
      logger.error('Error getting Salesforce status', { error });
      res.status(500).json({ success: false, message: 'Failed to get Salesforce status' });
    }
  }

  // HubSpot Integration
  async syncHubSpot(req: Request, res: Response): Promise<void> {
    try {
      await integrationService.syncHubSpot(req.body);
      res.json({ success: true, message: 'HubSpot synced successfully' });
    } catch (error) {
      logger.error('Error syncing HubSpot', { error });
      res.status(500).json({ success: false, message: 'Failed to sync HubSpot' });
    }
  }

  async getHubSpotStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await integrationService.getHubSpotStatus();
      res.json({ success: true, data: status });
    } catch (error) {
      logger.error('Error getting HubSpot status', { error });
      res.status(500).json({ success: false, message: 'Failed to get HubSpot status' });
    }
  }

  // Mailchimp Integration
  async syncMailchimp(req: Request, res: Response): Promise<void> {
    try {
      await integrationService.syncMailchimp(req.body);
      res.json({ success: true, message: 'Mailchimp synced successfully' });
    } catch (error) {
      logger.error('Error syncing Mailchimp', { error });
      res.status(500).json({ success: false, message: 'Failed to sync Mailchimp' });
    }
  }

  async getMailchimpStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await integrationService.getMailchimpStatus();
      res.json({ success: true, data: status });
    } catch (error) {
      logger.error('Error getting Mailchimp status', { error });
      res.status(500).json({ success: false, message: 'Failed to get Mailchimp status' });
    }
  }

  // Slack Integration
  async syncSlack(req: Request, res: Response): Promise<void> {
    try {
      await integrationService.syncSlack(req.body);
      res.json({ success: true, message: 'Slack synced successfully' });
    } catch (error) {
      logger.error('Error syncing Slack', { error });
      res.status(500).json({ success: false, message: 'Failed to sync Slack' });
    }
  }

  async getSlackStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await integrationService.getSlackStatus();
      res.json({ success: true, data: status });
    } catch (error) {
      logger.error('Error getting Slack status', { error });
      res.status(500).json({ success: false, message: 'Failed to get Slack status' });
    }
  }
}

export const integrationController = new IntegrationController();