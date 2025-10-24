import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

export interface Organization {
  id: string;
  name: string;
  domain?: string;
  parentId?: string;
  type: 'enterprise' | 'subsidiary' | 'department';
  status: 'active' | 'inactive' | 'suspended';
  settings: OrganizationSettings;
  branding: OrganizationBranding;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationSettings {
  timezone: string;
  currency: string;
  dateFormat: string;
  numberFormat: string;
  fiscalYearStart: string;
  allowInterCompanyTransactions: boolean;
  requireApprovalForInterCompany: boolean;
  dataRetentionDays: number;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  complianceLevel: 'basic' | 'standard' | 'enterprise';
}

export interface OrganizationBranding {
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
}

export interface OrganizationUser {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  permissions: string[];
  department?: string;
  managerId?: string;
  isActive: boolean;
  joinedAt: Date;
  lastLoginAt?: Date;
}

export interface OrganizationRole {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  permissions: string[];
  isSystemRole: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InterCompanyTransaction {
  id: string;
  fromOrganizationId: string;
  toOrganizationId: string;
  amount: number;
  currency: string;
  description: string;
  type: 'transfer' | 'loan' | 'service' | 'expense';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

class OrganizationService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
    logger.info('[OrganizationService] Initialized');
  }

  /**
   * Creates a new organization
   */
  public async createOrganization(
    name: string,
    type: Organization['type'],
    parentId?: string,
    settings?: Partial<OrganizationSettings>,
    branding?: Partial<OrganizationBranding>
  ): Promise<Organization> {
    try {
      const defaultSettings: OrganizationSettings = {
        timezone: 'UTC',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        numberFormat: 'en-US',
        fiscalYearStart: '01-01',
        allowInterCompanyTransactions: false,
        requireApprovalForInterCompany: true,
        dataRetentionDays: 2555, // 7 years
        backupFrequency: 'daily',
        complianceLevel: 'basic',
        ...settings
      };

      const defaultBranding: OrganizationBranding = {
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        accentColor: '#F59E0B',
        fontFamily: 'Inter',
        ...branding
      };

      const organization = await this.prisma.organization.create({
        data: {
          name,
          type,
          parentId,
          status: 'active',
          settings: defaultSettings,
          branding: defaultBranding
        }
      });

      logger.info(`[OrganizationService] Created organization ${organization.id}: ${name}`);
      return organization as Organization;
    } catch (error: any) {
      logger.error('[OrganizationService] Error creating organization:', error);
      throw new Error(`Failed to create organization: ${error.message}`);
    }
  }

  /**
   * Gets organization by ID
   */
  public async getOrganization(organizationId: string): Promise<Organization | null> {
    try {
      const organization = await this.prisma.organization.findUnique({
        where: { id: organizationId }
      });

      return organization as Organization | null;
    } catch (error: any) {
      logger.error(`[OrganizationService] Error getting organization ${organizationId}:`, error);
      throw new Error(`Failed to get organization: ${error.message}`);
    }
  }

  /**
   * Gets organization hierarchy
   */
  public async getOrganizationHierarchy(organizationId: string): Promise<Organization[]> {
    try {
      const organizations = await this.prisma.organization.findMany({
        where: {
          OR: [
            { id: organizationId },
            { parentId: organizationId }
          ]
        },
        orderBy: { name: 'asc' }
      });

      return organizations as Organization[];
    } catch (error: any) {
      logger.error(`[OrganizationService] Error getting organization hierarchy for ${organizationId}:`, error);
      throw new Error(`Failed to get organization hierarchy: ${error.message}`);
    }
  }

  /**
   * Updates organization settings
   */
  public async updateOrganizationSettings(
    organizationId: string,
    settings: Partial<OrganizationSettings>
  ): Promise<Organization> {
    try {
      const organization = await this.prisma.organization.findUnique({
        where: { id: organizationId }
      });

      if (!organization) {
        throw new Error('Organization not found');
      }

      const updatedSettings = {
        ...(organization.settings as OrganizationSettings),
        ...settings
      };

      const updated = await this.prisma.organization.update({
        where: { id: organizationId },
        data: { settings: updatedSettings }
      });

      logger.info(`[OrganizationService] Updated settings for organization ${organizationId}`);
      return updated as Organization;
    } catch (error: any) {
      logger.error(`[OrganizationService] Error updating organization settings:`, error);
      throw new Error(`Failed to update organization settings: ${error.message}`);
    }
  }

  /**
   * Updates organization branding
   */
  public async updateOrganizationBranding(
    organizationId: string,
    branding: Partial<OrganizationBranding>
  ): Promise<Organization> {
    try {
      const organization = await this.prisma.organization.findUnique({
        where: { id: organizationId }
      });

      if (!organization) {
        throw new Error('Organization not found');
      }

      const updatedBranding = {
        ...(organization.branding as OrganizationBranding),
        ...branding
      };

      const updated = await this.prisma.organization.update({
        where: { id: organizationId },
        data: { branding: updatedBranding }
      });

      logger.info(`[OrganizationService] Updated branding for organization ${organizationId}`);
      return updated as Organization;
    } catch (error: any) {
      logger.error(`[OrganizationService] Error updating organization branding:`, error);
      throw new Error(`Failed to update organization branding: ${error.message}`);
    }
  }

  /**
   * Adds user to organization
   */
  public async addUserToOrganization(
    organizationId: string,
    userId: string,
    roleId: string,
    department?: string,
    managerId?: string
  ): Promise<OrganizationUser> {
    try {
      const role = await this.prisma.organizationRole.findUnique({
        where: { id: roleId }
      });

      if (!role) {
        throw new Error('Role not found');
      }

      const organizationUser = await this.prisma.organizationUser.create({
        data: {
          organizationId,
          userId,
          roleId,
          permissions: role.permissions,
          department,
          managerId,
          isActive: true
        }
      });

      logger.info(`[OrganizationService] Added user ${userId} to organization ${organizationId}`);
      return organizationUser as OrganizationUser;
    } catch (error: any) {
      logger.error(`[OrganizationService] Error adding user to organization:`, error);
      throw new Error(`Failed to add user to organization: ${error.message}`);
    }
  }

  /**
   * Gets users in organization
   */
  public async getOrganizationUsers(organizationId: string): Promise<OrganizationUser[]> {
    try {
      const users = await this.prisma.organizationUser.findMany({
        where: { organizationId, isActive: true },
        include: {
          user: true,
          role: true
        }
      });

      return users as OrganizationUser[];
    } catch (error: any) {
      logger.error(`[OrganizationService] Error getting organization users:`, error);
      throw new Error(`Failed to get organization users: ${error.message}`);
    }
  }

  /**
   * Creates organization role
   */
  public async createOrganizationRole(
    organizationId: string,
    name: string,
    description: string,
    permissions: string[],
    isDefault: boolean = false
  ): Promise<OrganizationRole> {
    try {
      const role = await this.prisma.organizationRole.create({
        data: {
          organizationId,
          name,
          description,
          permissions,
          isSystemRole: false,
          isDefault
        }
      });

      logger.info(`[OrganizationService] Created role ${role.id} for organization ${organizationId}`);
      return role as OrganizationRole;
    } catch (error: any) {
      logger.error(`[OrganizationService] Error creating organization role:`, error);
      throw new Error(`Failed to create organization role: ${error.message}`);
    }
  }

  /**
   * Gets organization roles
   */
  public async getOrganizationRoles(organizationId: string): Promise<OrganizationRole[]> {
    try {
      const roles = await this.prisma.organizationRole.findMany({
        where: { organizationId },
        orderBy: { name: 'asc' }
      });

      return roles as OrganizationRole[];
    } catch (error: any) {
      logger.error(`[OrganizationService] Error getting organization roles:`, error);
      throw new Error(`Failed to get organization roles: ${error.message}`);
    }
  }

  /**
   * Creates inter-company transaction
   */
  public async createInterCompanyTransaction(
    fromOrganizationId: string,
    toOrganizationId: string,
    amount: number,
    currency: string,
    description: string,
    type: InterCompanyTransaction['type']
  ): Promise<InterCompanyTransaction> {
    try {
      const transaction = await this.prisma.interCompanyTransaction.create({
        data: {
          fromOrganizationId,
          toOrganizationId,
          amount,
          currency,
          description,
          type,
          status: 'pending'
        }
      });

      logger.info(`[OrganizationService] Created inter-company transaction ${transaction.id}`);
      return transaction as InterCompanyTransaction;
    } catch (error: any) {
      logger.error(`[OrganizationService] Error creating inter-company transaction:`, error);
      throw new Error(`Failed to create inter-company transaction: ${error.message}`);
    }
  }

  /**
   * Approves inter-company transaction
   */
  public async approveInterCompanyTransaction(
    transactionId: string,
    approvedBy: string
  ): Promise<InterCompanyTransaction> {
    try {
      const transaction = await this.prisma.interCompanyTransaction.update({
        where: { id: transactionId },
        data: {
          status: 'approved',
          approvedBy,
          approvedAt: new Date()
        }
      });

      logger.info(`[OrganizationService] Approved inter-company transaction ${transactionId}`);
      return transaction as InterCompanyTransaction;
    } catch (error: any) {
      logger.error(`[OrganizationService] Error approving inter-company transaction:`, error);
      throw new Error(`Failed to approve inter-company transaction: ${error.message}`);
    }
  }

  /**
   * Gets inter-company transactions
   */
  public async getInterCompanyTransactions(
    organizationId: string,
    status?: InterCompanyTransaction['status']
  ): Promise<InterCompanyTransaction[]> {
    try {
      const where: any = {
        OR: [
          { fromOrganizationId: organizationId },
          { toOrganizationId: organizationId }
        ]
      };

      if (status) {
        where.status = status;
      }

      const transactions = await this.prisma.interCompanyTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });

      return transactions as InterCompanyTransaction[];
    } catch (error: any) {
      logger.error(`[OrganizationService] Error getting inter-company transactions:`, error);
      throw new Error(`Failed to get inter-company transactions: ${error.message}`);
    }
  }

  /**
   * Gets consolidated reporting data
   */
  public async getConsolidatedReport(
    organizationIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    try {
      // This would aggregate financial data across multiple organizations
      // Implementation would depend on your specific reporting requirements
      const report = {
        totalRevenue: 0,
        totalExpenses: 0,
        netIncome: 0,
        organizationBreakdown: []
      };

      for (const orgId of organizationIds) {
        // Aggregate data for each organization
        const orgData = await this.getOrganizationFinancialData(orgId, startDate, endDate);
        report.totalRevenue += orgData.revenue;
        report.totalExpenses += orgData.expenses;
        report.organizationBreakdown.push({
          organizationId: orgId,
          ...orgData
        });
      }

      report.netIncome = report.totalRevenue - report.totalExpenses;

      logger.info(`[OrganizationService] Generated consolidated report for ${organizationIds.length} organizations`);
      return report;
    } catch (error: any) {
      logger.error(`[OrganizationService] Error generating consolidated report:`, error);
      throw new Error(`Failed to generate consolidated report: ${error.message}`);
    }
  }

  /**
   * Gets financial data for a specific organization
   */
  private async getOrganizationFinancialData(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ revenue: number; expenses: number; netIncome: number }> {
    // This would query your financial data tables
    // For now, returning mock data
    return {
      revenue: Math.random() * 100000,
      expenses: Math.random() * 80000,
      netIncome: 0
    };
  }
}

export default new OrganizationService();






