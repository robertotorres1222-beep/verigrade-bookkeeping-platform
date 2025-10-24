import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

export interface BrandingConfig {
  organizationId: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  customDomain?: string;
  favicon?: string;
  emailTemplate?: string;
  loginPageCustomization?: {
    backgroundImage?: string;
    customText?: string;
    hidePoweredBy?: boolean;
  };
  mobileAppBranding?: {
    appIcon?: string;
    splashScreen?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  isDefault: boolean;
  organizationId: string;
}

export interface CustomDomain {
  id: string;
  organizationId: string;
  domain: string;
  sslCertificate?: string;
  status: 'pending' | 'active' | 'failed';
  verifiedAt?: Date;
  createdAt: Date;
}

class BrandingService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
    logger.info('[BrandingService] Initialized');
  }

  /**
   * Updates organization branding
   */
  public async updateBranding(
    organizationId: string,
    branding: Partial<BrandingConfig>
  ): Promise<BrandingConfig> {
    try {
      const existingBranding = await this.getBranding(organizationId);
      const updatedBranding = {
        ...existingBranding,
        ...branding,
        organizationId
      };

      // Update in database
      await this.prisma.organization.update({
        where: { id: organizationId },
        data: { branding: updatedBranding }
      });

      logger.info(`[BrandingService] Updated branding for organization ${organizationId}`);
      return updatedBranding;
    } catch (error: any) {
      logger.error('[BrandingService] Error updating branding:', error);
      throw new Error(`Failed to update branding: ${error.message}`);
    }
  }

  /**
   * Gets organization branding
   */
  public async getBranding(organizationId: string): Promise<BrandingConfig> {
    try {
      const organization = await this.prisma.organization.findUnique({
        where: { id: organizationId }
      });

      if (!organization) {
        throw new Error('Organization not found');
      }

      const branding = organization.branding as BrandingConfig;
      return branding || this.getDefaultBranding(organizationId);
    } catch (error: any) {
      logger.error(`[BrandingService] Error getting branding for organization ${organizationId}:`, error);
      throw new Error(`Failed to get branding: ${error.message}`);
    }
  }

  /**
   * Gets default branding configuration
   */
  private getDefaultBranding(organizationId: string): BrandingConfig {
    return {
      organizationId,
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      accentColor: '#F59E0B',
      fontFamily: 'Inter',
      loginPageCustomization: {
        hidePoweredBy: false
      }
    };
  }

  /**
   * Creates custom email template
   */
  public async createEmailTemplate(
    organizationId: string,
    name: string,
    subject: string,
    htmlContent: string,
    textContent: string,
    variables: string[] = []
  ): Promise<EmailTemplate> {
    try {
      const template = await this.prisma.emailTemplate.create({
        data: {
          organizationId,
          name,
          subject,
          htmlContent,
          textContent,
          variables,
          isDefault: false
        }
      });

      logger.info(`[BrandingService] Created email template ${template.id} for organization ${organizationId}`);
      return template as EmailTemplate;
    } catch (error: any) {
      logger.error('[BrandingService] Error creating email template:', error);
      throw new Error(`Failed to create email template: ${error.message}`);
    }
  }

  /**
   * Gets email templates for organization
   */
  public async getEmailTemplates(organizationId: string): Promise<EmailTemplate[]> {
    try {
      const templates = await this.prisma.emailTemplate.findMany({
        where: { organizationId },
        orderBy: { name: 'asc' }
      });

      return templates as EmailTemplate[];
    } catch (error: any) {
      logger.error(`[BrandingService] Error getting email templates for organization ${organizationId}:`, error);
      throw new Error(`Failed to get email templates: ${error.message}`);
    }
  }

  /**
   * Updates email template
   */
  public async updateEmailTemplate(
    templateId: string,
    updates: Partial<EmailTemplate>
  ): Promise<EmailTemplate> {
    try {
      const template = await this.prisma.emailTemplate.update({
        where: { id: templateId },
        data: updates
      });

      logger.info(`[BrandingService] Updated email template ${templateId}`);
      return template as EmailTemplate;
    } catch (error: any) {
      logger.error(`[BrandingService] Error updating email template:`, error);
      throw new Error(`Failed to update email template: ${error.message}`);
    }
  }

  /**
   * Renders email template with variables
   */
  public async renderEmailTemplate(
    templateId: string,
    variables: { [key: string]: string }
  ): Promise<{ subject: string; htmlContent: string; textContent: string }> {
    try {
      const template = await this.prisma.emailTemplate.findUnique({
        where: { id: templateId }
      });

      if (!template) {
        throw new Error('Email template not found');
      }

      let subject = template.subject;
      let htmlContent = template.htmlContent;
      let textContent = template.textContent;

      // Replace variables in template
      for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`;
        subject = subject.replace(new RegExp(placeholder, 'g'), value);
        htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
        textContent = textContent.replace(new RegExp(placeholder, 'g'), value);
      }

      logger.info(`[BrandingService] Rendered email template ${templateId}`);
      return { subject, htmlContent, textContent };
    } catch (error: any) {
      logger.error(`[BrandingService] Error rendering email template:`, error);
      throw new Error(`Failed to render email template: ${error.message}`);
    }
  }

  /**
   * Sets up custom domain
   */
  public async setupCustomDomain(
    organizationId: string,
    domain: string
  ): Promise<CustomDomain> {
    try {
      // Validate domain format
      if (!this.isValidDomain(domain)) {
        throw new Error('Invalid domain format');
      }

      // Check if domain is already in use
      const existingDomain = await this.prisma.customDomain.findFirst({
        where: { domain }
      });

      if (existingDomain) {
        throw new Error('Domain is already in use');
      }

      const customDomain = await this.prisma.customDomain.create({
        data: {
          organizationId,
          domain,
          status: 'pending'
        }
      });

      // Generate DNS verification record
      const verificationRecord = this.generateDNSVerificationRecord(domain);
      
      logger.info(`[BrandingService] Set up custom domain ${domain} for organization ${organizationId}`);
      return {
        ...customDomain,
        sslCertificate: verificationRecord
      } as CustomDomain;
    } catch (error: any) {
      logger.error('[BrandingService] Error setting up custom domain:', error);
      throw new Error(`Failed to setup custom domain: ${error.message}`);
    }
  }

  /**
   * Verifies custom domain
   */
  public async verifyCustomDomain(domainId: string): Promise<boolean> {
    try {
      const domain = await this.prisma.customDomain.findUnique({
        where: { id: domainId }
      });

      if (!domain) {
        throw new Error('Custom domain not found');
      }

      // Check DNS records
      const isVerified = await this.checkDNSRecords(domain.domain);
      
      if (isVerified) {
        await this.prisma.customDomain.update({
          where: { id: domainId },
          data: {
            status: 'active',
            verifiedAt: new Date()
          }
        });

        logger.info(`[BrandingService] Verified custom domain ${domain.domain}`);
        return true;
      }

      return false;
    } catch (error: any) {
      logger.error(`[BrandingService] Error verifying custom domain:`, error);
      throw new Error(`Failed to verify custom domain: ${error.message}`);
    }
  }

  /**
   * Gets custom domains for organization
   */
  public async getCustomDomains(organizationId: string): Promise<CustomDomain[]> {
    try {
      const domains = await this.prisma.customDomain.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' }
      });

      return domains as CustomDomain[];
    } catch (error: any) {
      logger.error(`[BrandingService] Error getting custom domains:`, error);
      throw new Error(`Failed to get custom domains: ${error.message}`);
    }
  }

  /**
   * Generates CSS for custom branding
   */
  public generateCustomCSS(branding: BrandingConfig): string {
    return `
      :root {
        --primary-color: ${branding.primaryColor};
        --secondary-color: ${branding.secondaryColor};
        --accent-color: ${branding.accentColor};
        --font-family: ${branding.fontFamily};
      }

      .branded-primary {
        background-color: var(--primary-color);
        color: white;
      }

      .branded-secondary {
        background-color: var(--secondary-color);
        color: white;
      }

      .branded-accent {
        background-color: var(--accent-color);
        color: white;
      }

      .branded-text {
        font-family: var(--font-family);
      }

      .branded-button {
        background-color: var(--primary-color);
        border-color: var(--primary-color);
        color: white;
        font-family: var(--font-family);
      }

      .branded-button:hover {
        background-color: var(--secondary-color);
        border-color: var(--secondary-color);
      }

      .branded-input {
        border-color: var(--primary-color);
        font-family: var(--font-family);
      }

      .branded-input:focus {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
      }
    `;
  }

  /**
   * Generates mobile app branding configuration
   */
  public generateMobileAppConfig(branding: BrandingConfig): any {
    return {
      appIcon: branding.mobileAppBranding?.appIcon,
      splashScreen: branding.mobileAppBranding?.splashScreen,
      primaryColor: branding.mobileAppBranding?.primaryColor || branding.primaryColor,
      secondaryColor: branding.mobileAppBranding?.secondaryColor || branding.secondaryColor,
      accentColor: branding.accentColor,
      fontFamily: branding.fontFamily
    };
  }

  /**
   * Validates domain format
   */
  private isValidDomain(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  }

  /**
   * Generates DNS verification record
   */
  private generateDNSVerificationRecord(domain: string): string {
    const verificationCode = Math.random().toString(36).substring(2, 15);
    return `verification-${verificationCode}`;
  }

  /**
   * Checks DNS records for domain verification
   */
  private async checkDNSRecords(domain: string): Promise<boolean> {
    // This would implement actual DNS checking
    // For now, returning true to simulate successful verification
    return true;
  }

  /**
   * Gets branding assets (logos, icons, etc.)
   */
  public async getBrandingAssets(organizationId: string): Promise<{
    logo?: string;
    favicon?: string;
    appIcon?: string;
    splashScreen?: string;
  }> {
    try {
      const branding = await this.getBranding(organizationId);
      
      return {
        logo: branding.logo,
        favicon: branding.favicon,
        appIcon: branding.mobileAppBranding?.appIcon,
        splashScreen: branding.mobileAppBranding?.splashScreen
      };
    } catch (error: any) {
      logger.error(`[BrandingService] Error getting branding assets:`, error);
      throw new Error(`Failed to get branding assets: ${error.message}`);
    }
  }
}

export default new BrandingService();







