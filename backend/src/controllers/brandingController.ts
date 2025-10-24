import { Request, Response } from 'express';
import BrandingService from '../services/brandingService';
import logger from '../utils/logger';

export const updateBranding = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.params;
    const branding = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const updatedBranding = await BrandingService.updateBranding(organizationId, branding);

    res.status(200).json({
      success: true,
      message: 'Branding updated successfully',
      branding: updatedBranding
    });
  } catch (error: any) {
    logger.error(`Error updating branding for organization ${req.params.organizationId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to update branding',
      error: error.message
    });
  }
};

export const getBranding = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const branding = await BrandingService.getBranding(organizationId);

    res.status(200).json({
      success: true,
      branding
    });
  } catch (error: any) {
    logger.error(`Error getting branding for organization ${req.params.organizationId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to get branding',
      error: error.message
    });
  }
};

export const createEmailTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.params;
    const { name, subject, htmlContent, textContent, variables } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const template = await BrandingService.createEmailTemplate(
      organizationId,
      name,
      subject,
      htmlContent,
      textContent,
      variables
    );

    res.status(201).json({
      success: true,
      message: 'Email template created successfully',
      template
    });
  } catch (error: any) {
    logger.error(`Error creating email template for organization ${req.params.organizationId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to create email template',
      error: error.message
    });
  }
};

export const getEmailTemplates = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const templates = await BrandingService.getEmailTemplates(organizationId);

    res.status(200).json({
      success: true,
      templates
    });
  } catch (error: any) {
    logger.error(`Error getting email templates for organization ${req.params.organizationId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to get email templates',
      error: error.message
    });
  }
};

export const updateEmailTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { templateId } = req.params;
    const updates = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const template = await BrandingService.updateEmailTemplate(templateId, updates);

    res.status(200).json({
      success: true,
      message: 'Email template updated successfully',
      template
    });
  } catch (error: any) {
    logger.error(`Error updating email template ${req.params.templateId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to update email template',
      error: error.message
    });
  }
};

export const renderEmailTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { templateId } = req.params;
    const { variables } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const rendered = await BrandingService.renderEmailTemplate(templateId, variables);

    res.status(200).json({
      success: true,
      rendered
    });
  } catch (error: any) {
    logger.error(`Error rendering email template ${req.params.templateId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to render email template',
      error: error.message
    });
  }
};

export const setupCustomDomain = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.params;
    const { domain } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const customDomain = await BrandingService.setupCustomDomain(organizationId, domain);

    res.status(201).json({
      success: true,
      message: 'Custom domain setup initiated',
      customDomain
    });
  } catch (error: any) {
    logger.error(`Error setting up custom domain for organization ${req.params.organizationId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to setup custom domain',
      error: error.message
    });
  }
};

export const verifyCustomDomain = async (req: Request, res: Response): Promise<void> => {
  try {
    const { domainId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const verified = await BrandingService.verifyCustomDomain(domainId);

    res.status(200).json({
      success: true,
      message: verified ? 'Domain verified successfully' : 'Domain verification failed',
      verified
    });
  } catch (error: any) {
    logger.error(`Error verifying custom domain ${req.params.domainId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify custom domain',
      error: error.message
    });
  }
};

export const getCustomDomains = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const domains = await BrandingService.getCustomDomains(organizationId);

    res.status(200).json({
      success: true,
      domains
    });
  } catch (error: any) {
    logger.error(`Error getting custom domains for organization ${req.params.organizationId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to get custom domains',
      error: error.message
    });
  }
};

export const generateCustomCSS = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const branding = await BrandingService.getBranding(organizationId);
    const css = BrandingService.generateCustomCSS(branding);

    res.set('Content-Type', 'text/css');
    res.status(200).send(css);
  } catch (error: any) {
    logger.error(`Error generating custom CSS for organization ${req.params.organizationId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate custom CSS',
      error: error.message
    });
  }
};

export const getMobileAppConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const branding = await BrandingService.getBranding(organizationId);
    const config = BrandingService.generateMobileAppConfig(branding);

    res.status(200).json({
      success: true,
      config
    });
  } catch (error: any) {
    logger.error(`Error getting mobile app config for organization ${req.params.organizationId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to get mobile app config',
      error: error.message
    });
  }
};

export const getBrandingAssets = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const assets = await BrandingService.getBrandingAssets(organizationId);

    res.status(200).json({
      success: true,
      assets
    });
  } catch (error: any) {
    logger.error(`Error getting branding assets for organization ${req.params.organizationId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to get branding assets',
      error: error.message
    });
  }
};