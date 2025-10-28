import ClientPortalService from '../../models/clientPortal';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    clientPortalUser: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn()
    },
    clientInvoice: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn()
    },
    document: {
      findMany: jest.fn(),
      create: jest.fn()
    },
    clientMessage: {
      findMany: jest.fn(),
      create: jest.fn()
    },
    clientActivity: {
      findMany: jest.fn(),
      create: jest.fn()
    },
    clientNotification: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn()
    }
  }))
}));

describe('ClientPortalService', () => {
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('createClientPortalUser', () => {
    it('should create client portal user with default preferences', async () => {
      const mockUser = {
        id: 'cp-user-123',
        clientId: 'client-123',
        email: 'client@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        preferences: {
          notifications: { email: true, sms: false, push: true },
          dashboard: { defaultView: 'overview', itemsPerPage: 10, showRecentActivity: true },
          privacy: { showPaymentHistory: true, allowDocumentDownload: true, shareContactInfo: false },
          language: 'en',
          timezone: 'UTC'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.clientPortalUser.create.mockResolvedValue(mockUser);

      const result = await ClientPortalService.createClientPortalUser(
        'client-123',
        'client@example.com',
        'John',
        'Doe'
      );

      expect(result).toEqual(mockUser);
      expect(mockPrisma.clientPortalUser.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          clientId: 'client-123',
          email: 'client@example.com',
          firstName: 'John',
          lastName: 'Doe',
          isActive: true,
          preferences: expect.objectContaining({
            notifications: { email: true, sms: false, push: true }
          })
        })
      });
    });

    it('should create client portal user with custom preferences', async () => {
      const customPreferences = {
        notifications: { email: false, sms: true, push: false },
        dashboard: { defaultView: 'invoices', itemsPerPage: 20, showRecentActivity: false },
        privacy: { showPaymentHistory: false, allowDocumentDownload: false, shareContactInfo: true },
        language: 'es',
        timezone: 'America/New_York'
      };

      const mockUser = {
        id: 'cp-user-123',
        clientId: 'client-123',
        email: 'client@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        preferences: customPreferences,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.clientPortalUser.create.mockResolvedValue(mockUser);

      const result = await ClientPortalService.createClientPortalUser(
        'client-123',
        'client@example.com',
        'John',
        'Doe',
        customPreferences
      );

      expect(result).toEqual(mockUser);
      expect(mockPrisma.clientPortalUser.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          preferences: customPreferences
        })
      });
    });
  });

  describe('getClientDashboard', () => {
    it('should return client dashboard data', async () => {
      const mockInvoices = [
        { id: 'inv-1', invoiceNumber: 'INV-001', amount: 1000, total: 1000, status: 'sent', dueDate: new Date(), issueDate: new Date(), lineItems: [] }
      ];
      const mockDocuments = [
        { id: 'doc-1', name: 'Document 1', type: 'invoice', fileSize: 1024, mimeType: 'application/pdf', createdAt: new Date(), tags: [] }
      ];
      const mockMessages = [
        { id: 'msg-1', subject: 'Test Message', content: 'Test content', isRead: false, isUrgent: false, createdAt: new Date(), attachments: [] }
      ];
      const mockActivity = [
        { id: 'act-1', type: 'invoice_created', description: 'Invoice created', metadata: {}, createdAt: new Date() }
      ];
      const mockNotifications = [
        { id: 'notif-1', type: 'invoice', title: 'New Invoice', message: 'You have a new invoice', isRead: false, isUrgent: false, metadata: {}, createdAt: new Date() }
      ];

      // Mock the individual service calls
      jest.spyOn(ClientPortalService, 'getClientInvoices').mockResolvedValue(mockInvoices);
      jest.spyOn(ClientPortalService, 'getClientDocuments').mockResolvedValue(mockDocuments);
      jest.spyOn(ClientPortalService, 'getClientMessages').mockResolvedValue(mockMessages);
      jest.spyOn(ClientPortalService, 'getClientActivity').mockResolvedValue(mockActivity);
      jest.spyOn(ClientPortalService, 'getClientNotifications').mockResolvedValue(mockNotifications);

      const result = await ClientPortalService.getClientDashboard('client-123');

      expect(result).toEqual({
        recentInvoices: mockInvoices,
        recentDocuments: mockDocuments,
        recentMessages: mockMessages,
        recentActivity: mockActivity,
        unreadNotifications: 1,
        totalOutstanding: 1000,
        totalPaid: 0
      });
    });
  });

  describe('processInvoicePayment', () => {
    it('should process successful payment', async () => {
      const mockInvoice = {
        id: 'inv-123',
        clientId: 'client-123',
        total: 1000,
        status: 'sent'
      };

      jest.spyOn(ClientPortalService, 'getClientInvoice').mockResolvedValue(mockInvoice);
      jest.spyOn(ClientPortalService, 'createClientActivity').mockResolvedValue({} as any);

      mockPrisma.clientInvoice.update.mockResolvedValue({});

      const result = await ClientPortalService.processInvoicePayment(
        'inv-123',
        'client-123',
        'pm-123',
        1000,
        {}
      );

      expect(result.success).toBe(true);
      expect(result.transactionId).toBeDefined();
    });

    it('should handle payment for non-existent invoice', async () => {
      jest.spyOn(ClientPortalService, 'getClientInvoice').mockResolvedValue(null);

      const result = await ClientPortalService.processInvoicePayment(
        'non-existent',
        'client-123',
        'pm-123',
        1000,
        {}
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invoice not found');
    });

    it('should handle payment for already paid invoice', async () => {
      const mockInvoice = {
        id: 'inv-123',
        clientId: 'client-123',
        total: 1000,
        status: 'paid'
      };

      jest.spyOn(ClientPortalService, 'getClientInvoice').mockResolvedValue(mockInvoice);

      const result = await ClientPortalService.processInvoicePayment(
        'inv-123',
        'client-123',
        'pm-123',
        1000,
        {}
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invoice already paid');
    });
  });

  describe('uploadClientDocument', () => {
    it('should upload document successfully', async () => {
      const mockDocument = {
        id: 'doc-123',
        clientId: 'client-123',
        name: 'test.pdf',
        type: 'invoice',
        fileUrl: 'https://example.com/test.pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
        uploadedBy: 'user-123',
        isPublic: true,
        description: 'Test document',
        tags: ['important'],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.document.create.mockResolvedValue(mockDocument);
      jest.spyOn(ClientPortalService, 'createClientActivity').mockResolvedValue({} as any);

      const result = await ClientPortalService.uploadClientDocument(
        'client-123',
        'test.pdf',
        'invoice',
        'https://example.com/test.pdf',
        1024,
        'application/pdf',
        'user-123',
        'Test document',
        ['important']
      );

      expect(result).toEqual(mockDocument);
      expect(mockPrisma.document.create).toHaveBeenCalledWith({
        data: {
          clientId: 'client-123',
          name: 'test.pdf',
          type: 'invoice',
          fileUrl: 'https://example.com/test.pdf',
          fileSize: 1024,
          mimeType: 'application/pdf',
          uploadedBy: 'user-123',
          isPublic: true,
          description: 'Test document',
          tags: ['important']
        }
      });
    });
  });

  describe('sendMessageToClient', () => {
    it('should send message successfully', async () => {
      const mockMessage = {
        id: 'msg-123',
        clientId: 'client-123',
        fromUserId: 'user-123',
        subject: 'Test Message',
        content: 'Test content',
        isUrgent: false,
        attachments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.clientMessage.create.mockResolvedValue(mockMessage);
      jest.spyOn(ClientPortalService, 'createClientNotification').mockResolvedValue({} as any);
      jest.spyOn(ClientPortalService, 'createClientActivity').mockResolvedValue({} as any);

      const result = await ClientPortalService.sendMessageToClient(
        'client-123',
        'user-123',
        'Test Message',
        'Test content',
        false,
        []
      );

      expect(result).toEqual(mockMessage);
      expect(mockPrisma.clientMessage.create).toHaveBeenCalledWith({
        data: {
          clientId: 'client-123',
          fromUserId: 'user-123',
          subject: 'Test Message',
          content: 'Test content',
          isUrgent: false,
          attachments: []
        }
      });
    });
  });

  describe('getClientNotifications', () => {
    it('should get all notifications', async () => {
      const mockNotifications = [
        { id: 'notif-1', clientId: 'client-123', type: 'invoice', title: 'New Invoice', message: 'You have a new invoice', isRead: false, isUrgent: false, metadata: {}, createdAt: new Date() },
        { id: 'notif-2', clientId: 'client-123', type: 'payment', title: 'Payment Received', message: 'Your payment has been received', isRead: true, isUrgent: false, metadata: {}, createdAt: new Date() }
      ];

      mockPrisma.clientNotification.findMany.mockResolvedValue(mockNotifications);

      const result = await ClientPortalService.getClientNotifications('client-123');

      expect(result).toEqual(mockNotifications);
      expect(mockPrisma.clientNotification.findMany).toHaveBeenCalledWith({
        where: { clientId: 'client-123' },
        orderBy: { createdAt: 'desc' },
        take: 50,
        skip: 0
      });
    });

    it('should get unread notifications only', async () => {
      const mockNotifications = [
        { id: 'notif-1', clientId: 'client-123', type: 'invoice', title: 'New Invoice', message: 'You have a new invoice', isRead: false, isUrgent: false, metadata: {}, createdAt: new Date() }
      ];

      mockPrisma.clientNotification.findMany.mockResolvedValue(mockNotifications);

      const result = await ClientPortalService.getClientNotifications('client-123', true);

      expect(result).toEqual(mockNotifications);
      expect(mockPrisma.clientNotification.findMany).toHaveBeenCalledWith({
        where: { clientId: 'client-123', isRead: false },
        orderBy: { createdAt: 'desc' },
        take: 50,
        skip: 0
      });
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark notification as read', async () => {
      mockPrisma.clientNotification.updateMany.mockResolvedValue({ count: 1 });

      const result = await ClientPortalService.markNotificationAsRead('notif-123', 'client-123');

      expect(result).toBe(true);
      expect(mockPrisma.clientNotification.updateMany).toHaveBeenCalledWith({
        where: { id: 'notif-123', clientId: 'client-123' },
        data: { isRead: true }
      });
    });
  });
});










