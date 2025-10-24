import AuditService from '../../services/auditService';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    auditEvent: {
      createMany: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn()
    }
  }))
}));

describe('AuditService', () => {
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('logEvent', () => {
    it('should log audit event successfully', async () => {
      const mockEvent = {
        id: 'audit-123',
        userId: 'user-123',
        organizationId: 'org-123',
        action: 'create',
        resource: 'invoice',
        resourceId: 'inv-123',
        oldValues: null,
        newValues: { amount: 1000 },
        metadata: {},
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        timestamp: new Date(),
        hash: 'hash123'
      };

      mockPrisma.auditEvent.createMany.mockResolvedValue({ count: 1 });

      await AuditService.logEvent(
        'create',
        'invoice',
        'inv-123',
        'user-123',
        'org-123',
        null,
        { amount: 1000 },
        {},
        '192.168.1.1',
        'Mozilla/5.0'
      );

      expect(mockPrisma.auditEvent.createMany).toHaveBeenCalled();
    });

    it('should handle logging errors gracefully', async () => {
      mockPrisma.auditEvent.createMany.mockRejectedValue(new Error('Database error'));

      // Should not throw error
      await expect(AuditService.logEvent(
        'create',
        'invoice',
        'inv-123',
        'user-123'
      )).resolves.not.toThrow();
    });
  });

  describe('logAuthEvent', () => {
    it('should log authentication events', async () => {
      mockPrisma.auditEvent.createMany.mockResolvedValue({ count: 1 });

      await AuditService.logAuthEvent(
        'login',
        'user-123',
        'org-123',
        { loginMethod: 'password' },
        '192.168.1.1',
        'Mozilla/5.0'
      );

      expect(mockPrisma.auditEvent.createMany).toHaveBeenCalled();
    });

    it('should log failed login attempts', async () => {
      mockPrisma.auditEvent.createMany.mockResolvedValue({ count: 1 });

      await AuditService.logAuthEvent(
        'login_failed',
        'user-123',
        'org-123',
        { reason: 'invalid_password' }
      );

      expect(mockPrisma.auditEvent.createMany).toHaveBeenCalled();
    });
  });

  describe('logDataAccess', () => {
    it('should log data access events', async () => {
      mockPrisma.auditEvent.createMany.mockResolvedValue({ count: 1 });

      await AuditService.logDataAccess(
        'invoice',
        'inv-123',
        'read',
        'user-123',
        'org-123',
        { accessedFields: ['amount', 'date'] }
      );

      expect(mockPrisma.auditEvent.createMany).toHaveBeenCalled();
    });
  });

  describe('logDataModification', () => {
    it('should log data modification events', async () => {
      mockPrisma.auditEvent.createMany.mockResolvedValue({ count: 1 });

      await AuditService.logDataModification(
        'invoice',
        'inv-123',
        'update',
        { amount: 1000 },
        { amount: 1200 },
        'user-123',
        'org-123'
      );

      expect(mockPrisma.auditEvent.createMany).toHaveBeenCalled();
    });
  });

  describe('queryEvents', () => {
    it('should query audit events with filters', async () => {
      const mockEvents = [
        {
          id: 'audit-1',
          userId: 'user-123',
          action: 'create',
          resource: 'invoice',
          resourceId: 'inv-123',
          timestamp: new Date()
        }
      ];

      mockPrisma.auditEvent.findMany.mockResolvedValue(mockEvents);

      const events = await AuditService.queryEvents({
        userId: 'user-123',
        action: 'create',
        limit: 10,
        offset: 0
      });

      expect(events).toEqual(mockEvents);
      expect(mockPrisma.auditEvent.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          action: 'create'
        },
        orderBy: { timestamp: 'desc' },
        take: 10,
        skip: 0
      });
    });
  });

  describe('generateAuditReport', () => {
    it('should generate audit report', async () => {
      const mockEvents = [
        {
          id: 'audit-1',
          userId: 'user-123',
          action: 'create',
          resource: 'invoice',
          timestamp: new Date()
        },
        {
          id: 'audit-2',
          userId: 'user-123',
          action: 'update',
          resource: 'invoice',
          timestamp: new Date()
        }
      ];

      mockPrisma.auditEvent.findMany.mockResolvedValue(mockEvents);

      const report = await AuditService.generateAuditReport('org-123');

      expect(report).toHaveProperty('totalEvents', 2);
      expect(report).toHaveProperty('eventsByAction');
      expect(report).toHaveProperty('eventsByResource');
      expect(report).toHaveProperty('eventsByUser');
      expect(report).toHaveProperty('suspiciousActivity');
    });
  });

  describe('verifyIntegrity', () => {
    it('should verify audit log integrity', async () => {
      const mockEvents = [
        {
          id: 'audit-1',
          hash: 'valid-hash',
          action: 'create',
          resource: 'invoice',
          resourceId: 'inv-123',
          userId: 'user-123',
          organizationId: 'org-123',
          oldValues: null,
          newValues: { amount: 1000 },
          metadata: {},
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          timestamp: new Date()
        }
      ];

      mockPrisma.auditEvent.findMany.mockResolvedValue(mockEvents);

      const integrity = await AuditService.verifyIntegrity('org-123');

      expect(integrity).toHaveProperty('totalEvents', 1);
      expect(integrity).toHaveProperty('invalidHashes', 0);
      expect(integrity).toHaveProperty('integrityScore', 100);
    });
  });
});







