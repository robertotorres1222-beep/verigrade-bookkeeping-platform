import { Request, Response } from 'express';
import { enterpriseService } from '../services/enterpriseService';
import logger from '../utils/logger';

export class EnterpriseController {
  // Multi-company Management
  async createCompany(req: Request, res: Response): Promise<void> {
    try {
      const company = await enterpriseService.createCompany(req.body);
      res.status(201).json({ success: true, data: company, message: 'Company created successfully' });
    } catch (error) {
      logger.error('Error creating company', { error });
      res.status(500).json({ success: false, message: 'Failed to create company' });
    }
  }

  async getCompanies(req: Request, res: Response): Promise<void> {
    try {
      const companies = await enterpriseService.getCompanies();
      res.json({ success: true, data: companies, message: 'Companies retrieved successfully' });
    } catch (error) {
      logger.error('Error retrieving companies', { error });
      res.status(500).json({ success: false, message: 'Failed to retrieve companies' });
    }
  }

  async updateCompany(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const company = await enterpriseService.updateCompany(id, req.body);
      res.json({ success: true, data: company, message: 'Company updated successfully' });
    } catch (error) {
      logger.error('Error updating company', { error });
      res.status(500).json({ success: false, message: 'Failed to update company' });
    }
  }

  // SSO Configuration
  async setupSSO(req: Request, res: Response): Promise<void> {
    try {
      const { provider, config } = req.body;
      await enterpriseService.setupSSO(provider, config);
      res.json({ success: true, message: 'SSO setup successfully' });
    } catch (error) {
      logger.error('Error setting up SSO', { error });
      res.status(500).json({ success: false, message: 'Failed to setup SSO' });
    }
  }

  async getSSOStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await enterpriseService.getSSOStatus();
      res.json({ success: true, data: status, message: 'SSO status retrieved successfully' });
    } catch (error) {
      logger.error('Error getting SSO status', { error });
      res.status(500).json({ success: false, message: 'Failed to get SSO status' });
    }
  }

  // White-label Configuration
  async configureWhiteLabel(req: Request, res: Response): Promise<void> {
    try {
      await enterpriseService.configureWhiteLabel(req.body);
      res.json({ success: true, message: 'White-label configured successfully' });
    } catch (error) {
      logger.error('Error configuring white-label', { error });
      res.status(500).json({ success: false, message: 'Failed to configure white-label' });
    }
  }

  async getWhiteLabelConfig(req: Request, res: Response): Promise<void> {
    try {
      const config = await enterpriseService.getWhiteLabelConfig();
      res.json({ success: true, data: config, message: 'White-label config retrieved successfully' });
    } catch (error) {
      logger.error('Error getting white-label config', { error });
      res.status(500).json({ success: false, message: 'Failed to get white-label config' });
    }
  }

  // Granular Permissions
  async setPermissions(req: Request, res: Response): Promise<void> {
    try {
      const { userId, permissions } = req.body;
      await enterpriseService.setPermissions(userId, permissions);
      res.json({ success: true, message: 'Permissions set successfully' });
    } catch (error) {
      logger.error('Error setting permissions', { error });
      res.status(500).json({ success: false, message: 'Failed to set permissions' });
    }
  }

  async getPermissions(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.query;
      const permissions = await enterpriseService.getPermissions(userId as string);
      res.json({ success: true, data: permissions, message: 'Permissions retrieved successfully' });
    } catch (error) {
      logger.error('Error getting permissions', { error });
      res.status(500).json({ success: false, message: 'Failed to get permissions' });
    }
  }

  // API Access
  async generateAPIKey(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body;
      const apiKey = await enterpriseService.generateAPIKey(userId);
      res.json({ success: true, data: { apiKey }, message: 'API key generated successfully' });
    } catch (error) {
      logger.error('Error generating API key', { error });
      res.status(500).json({ success: false, message: 'Failed to generate API key' });
    }
  }

  async getAPIKeys(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.query;
      const apiKeys = await enterpriseService.getAPIKeys(userId as string);
      res.json({ success: true, data: apiKeys, message: 'API keys retrieved successfully' });
    } catch (error) {
      logger.error('Error getting API keys', { error });
      res.status(500).json({ success: false, message: 'Failed to get API keys' });
    }
  }
}

export const enterpriseController = new EnterpriseController();




