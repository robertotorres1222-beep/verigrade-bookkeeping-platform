import OrganizationService from '../../models/organization';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    organization: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    organizationUser: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn()
    },
    organizationRole: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn()
    },
    interCompanyTransaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn()
    }
  }))
}));

describe('OrganizationService', () => {
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('createOrganization', () => {
    it('should create organization with default settings', async () => {
      const mockOrganization = {
        id: 'org-123',
        name: 'Test Organization',
        type: 'enterprise',
        status: 'active',
        settings: {
          timezone: 'UTC',
          currency: 'USD',
          dateFormat: 'MM/DD/YYYY',
          numberFormat: 'en-US',
          fiscalYearStart: '01-01',
          allowInterCompanyTransactions: false,
          requireApprovalForInterCompany: true,
          dataRetentionDays: 2555,
          backupFrequency: 'daily',
          complianceLevel: 'basic'
        },
        branding: {
          primaryColor: '#3B82F6',
          secondaryColor: '#1E40AF',
          accentColor: '#F59E0B',
          fontFamily: 'Inter'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.organization.create.mockResolvedValue(mockOrganization);

      const result = await OrganizationService.createOrganization(
        'Test Organization',
        'enterprise'
      );

      expect(result).toEqual(mockOrganization);
      expect(mockPrisma.organization.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Test Organization',
          type: 'enterprise',
          status: 'active',
          settings: expect.objectContaining({
            timezone: 'UTC',
            currency: 'USD'
          }),
          branding: expect.objectContaining({
            primaryColor: '#3B82F6'
          })
        })
      });
    });

    it('should create organization with custom settings', async () => {
      const customSettings = {
        timezone: 'America/New_York',
        currency: 'EUR',
        complianceLevel: 'enterprise'
      };

      const customBranding = {
        primaryColor: '#FF0000',
        secondaryColor: '#00FF00'
      };

      const mockOrganization = {
        id: 'org-123',
        name: 'Custom Organization',
        type: 'enterprise',
        status: 'active',
        settings: { ...customSettings },
        branding: { ...customBranding },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.organization.create.mockResolvedValue(mockOrganization);

      const result = await OrganizationService.createOrganization(
        'Custom Organization',
        'enterprise',
        undefined,
        customSettings,
        customBranding
      );

      expect(result).toEqual(mockOrganization);
      expect(mockPrisma.organization.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          settings: expect.objectContaining(customSettings),
          branding: expect.objectContaining(customBranding)
        })
      });
    });
  });

  describe('getOrganization', () => {
    it('should return organization by ID', async () => {
      const mockOrganization = {
        id: 'org-123',
        name: 'Test Organization',
        type: 'enterprise',
        status: 'active'
      };

      mockPrisma.organization.findUnique.mockResolvedValue(mockOrganization);

      const result = await OrganizationService.getOrganization('org-123');

      expect(result).toEqual(mockOrganization);
      expect(mockPrisma.organization.findUnique).toHaveBeenCalledWith({
        where: { id: 'org-123' }
      });
    });

    it('should return null for non-existent organization', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue(null);

      const result = await OrganizationService.getOrganization('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('updateOrganizationSettings', () => {
    it('should update organization settings', async () => {
      const existingOrganization = {
        id: 'org-123',
        name: 'Test Organization',
        settings: {
          timezone: 'UTC',
          currency: 'USD'
        }
      };

      const updatedSettings = {
        timezone: 'America/New_York',
        currency: 'EUR'
      };

      const updatedOrganization = {
        ...existingOrganization,
        settings: { ...existingOrganization.settings, ...updatedSettings }
      };

      mockPrisma.organization.findUnique.mockResolvedValue(existingOrganization);
      mockPrisma.organization.update.mockResolvedValue(updatedOrganization);

      const result = await OrganizationService.updateOrganizationSettings(
        'org-123',
        updatedSettings
      );

      expect(result).toEqual(updatedOrganization);
      expect(mockPrisma.organization.update).toHaveBeenCalledWith({
        where: { id: 'org-123' },
        data: { settings: expect.objectContaining(updatedSettings) }
      });
    });

    it('should throw error for non-existent organization', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue(null);

      await expect(
        OrganizationService.updateOrganizationSettings('non-existent', {})
      ).rejects.toThrow('Organization not found');
    });
  });

  describe('addUserToOrganization', () => {
    it('should add user to organization', async () => {
      const mockRole = {
        id: 'role-123',
        name: 'User',
        permissions: ['users:read']
      };

      const mockOrganizationUser = {
        id: 'org-user-123',
        organizationId: 'org-123',
        userId: 'user-123',
        roleId: 'role-123',
        permissions: ['users:read'],
        isActive: true
      };

      mockPrisma.organizationRole.findUnique.mockResolvedValue(mockRole);
      mockPrisma.organizationUser.create.mockResolvedValue(mockOrganizationUser);

      const result = await OrganizationService.addUserToOrganization(
        'org-123',
        'user-123',
        'role-123',
        'Engineering',
        'manager-123'
      );

      expect(result).toEqual(mockOrganizationUser);
      expect(mockPrisma.organizationUser.create).toHaveBeenCalledWith({
        data: {
          organizationId: 'org-123',
          userId: 'user-123',
          roleId: 'role-123',
          permissions: ['users:read'],
          department: 'Engineering',
          managerId: 'manager-123',
          isActive: true
        }
      });
    });

    it('should throw error for non-existent role', async () => {
      mockPrisma.organizationRole.findUnique.mockResolvedValue(null);

      await expect(
        OrganizationService.addUserToOrganization('org-123', 'user-123', 'non-existent')
      ).rejects.toThrow('Role not found');
    });
  });

  describe('createInterCompanyTransaction', () => {
    it('should create inter-company transaction', async () => {
      const mockTransaction = {
        id: 'txn-123',
        fromOrganizationId: 'org-123',
        toOrganizationId: 'org-456',
        amount: 1000,
        currency: 'USD',
        description: 'Service payment',
        type: 'service',
        status: 'pending',
        createdAt: new Date()
      };

      mockPrisma.interCompanyTransaction.create.mockResolvedValue(mockTransaction);

      const result = await OrganizationService.createInterCompanyTransaction(
        'org-123',
        'org-456',
        1000,
        'USD',
        'Service payment',
        'service'
      );

      expect(result).toEqual(mockTransaction);
      expect(mockPrisma.interCompanyTransaction.create).toHaveBeenCalledWith({
        data: {
          fromOrganizationId: 'org-123',
          toOrganizationId: 'org-456',
          amount: 1000,
          currency: 'USD',
          description: 'Service payment',
          type: 'service',
          status: 'pending'
        }
      });
    });
  });

  describe('approveInterCompanyTransaction', () => {
    it('should approve inter-company transaction', async () => {
      const mockTransaction = {
        id: 'txn-123',
        status: 'approved',
        approvedBy: 'user-123',
        approvedAt: new Date()
      };

      mockPrisma.interCompanyTransaction.update.mockResolvedValue(mockTransaction);

      const result = await OrganizationService.approveInterCompanyTransaction(
        'txn-123',
        'user-123'
      );

      expect(result).toEqual(mockTransaction);
      expect(mockPrisma.interCompanyTransaction.update).toHaveBeenCalledWith({
        where: { id: 'txn-123' },
        data: {
          status: 'approved',
          approvedBy: 'user-123',
          approvedAt: expect.any(Date)
        }
      });
    });
  });

  describe('getConsolidatedReport', () => {
    it('should generate consolidated report', async () => {
      const organizationIds = ['org-123', 'org-456'];
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      // Mock the private method by spying on it
      const getOrganizationFinancialDataSpy = jest.spyOn(
        OrganizationService as any,
        'getOrganizationFinancialData'
      );

      getOrganizationFinancialDataSpy
        .mockResolvedValueOnce({ revenue: 100000, expenses: 80000, netIncome: 20000 })
        .mockResolvedValueOnce({ revenue: 150000, expenses: 120000, netIncome: 30000 });

      const result = await OrganizationService.getConsolidatedReport(
        organizationIds,
        startDate,
        endDate
      );

      expect(result).toEqual({
        totalRevenue: 250000,
        totalExpenses: 200000,
        netIncome: 50000,
        organizationBreakdown: expect.arrayContaining([
          expect.objectContaining({ organizationId: 'org-123' }),
          expect.objectContaining({ organizationId: 'org-456' })
        ])
      });

      expect(getOrganizationFinancialDataSpy).toHaveBeenCalledTimes(2);
    });
  });
});










