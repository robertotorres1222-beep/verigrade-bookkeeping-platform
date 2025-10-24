import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

export interface ClientPortalUser {
  id: string;
  clientId: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLoginAt?: Date;
  preferences: ClientPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientPreferences {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  dashboard: {
    defaultView: 'overview' | 'invoices' | 'documents' | 'activity';
    itemsPerPage: number;
    showRecentActivity: boolean;
  };
  privacy: {
    showPaymentHistory: boolean;
    allowDocumentDownload: boolean;
    shareContactInfo: boolean;
  };
  language: string;
  timezone: string;
}

export interface ClientInvoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  amount: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  issueDate: Date;
  paidDate?: Date;
  description?: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  paymentMethods: PaymentMethod[];
  notes?: string;
  attachments: Document[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethod {
  id: string;
  clientId: string;
  type: 'credit_card' | 'bank_account' | 'paypal' | 'stripe';
  lastFour: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
}

export interface Document {
  id: string;
  clientId: string;
  name: string;
  type: 'invoice' | 'receipt' | 'contract' | 'statement' | 'other';
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  isPublic: boolean;
  downloadCount: number;
  tags: string[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientMessage {
  id: string;
  clientId: string;
  fromUserId?: string;
  fromClientId?: string;
  subject: string;
  content: string;
  isRead: boolean;
  isUrgent: boolean;
  attachments: Document[];
  threadId?: string;
  parentMessageId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientActivity {
  id: string;
  clientId: string;
  type: 'invoice_created' | 'invoice_paid' | 'document_uploaded' | 'message_sent' | 'payment_made' | 'login';
  description: string;
  metadata: any;
  createdAt: Date;
}

export interface ClientNotification {
  id: string;
  clientId: string;
  type: 'invoice' | 'payment' | 'document' | 'message' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  isUrgent: boolean;
  actionUrl?: string;
  metadata: any;
  createdAt: Date;
}

class ClientPortalService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
    logger.info('[ClientPortalService] Initialized');
  }

  /**
   * Creates a client portal user
   */
  public async createClientPortalUser(
    clientId: string,
    email: string,
    firstName: string,
    lastName: string,
    preferences?: Partial<ClientPreferences>
  ): Promise<ClientPortalUser> {
    try {
      const defaultPreferences: ClientPreferences = {
        notifications: {
          email: true,
          sms: false,
          push: true
        },
        dashboard: {
          defaultView: 'overview',
          itemsPerPage: 10,
          showRecentActivity: true
        },
        privacy: {
          showPaymentHistory: true,
          allowDocumentDownload: true,
          shareContactInfo: false
        },
        language: 'en',
        timezone: 'UTC',
        ...preferences
      };

      const clientPortalUser = await this.prisma.clientPortalUser.create({
        data: {
          clientId,
          email,
          firstName,
          lastName,
          isActive: true,
          preferences: defaultPreferences
        }
      });

      logger.info(`[ClientPortalService] Created client portal user ${clientPortalUser.id} for client ${clientId}`);
      return clientPortalUser as ClientPortalUser;
    } catch (error: any) {
      logger.error('[ClientPortalService] Error creating client portal user:', error);
      throw new Error(`Failed to create client portal user: ${error.message}`);
    }
  }

  /**
   * Gets client portal user by ID
   */
  public async getClientPortalUser(clientPortalUserId: string): Promise<ClientPortalUser | null> {
    try {
      const clientPortalUser = await this.prisma.clientPortalUser.findUnique({
        where: { id: clientPortalUserId }
      });

      return clientPortalUser as ClientPortalUser | null;
    } catch (error: any) {
      logger.error(`[ClientPortalService] Error getting client portal user ${clientPortalUserId}:`, error);
      throw new Error(`Failed to get client portal user: ${error.message}`);
    }
  }

  /**
   * Gets client portal user by email
   */
  public async getClientPortalUserByEmail(email: string): Promise<ClientPortalUser | null> {
    try {
      const clientPortalUser = await this.prisma.clientPortalUser.findFirst({
        where: { email, isActive: true }
      });

      return clientPortalUser as ClientPortalUser | null;
    } catch (error: any) {
      logger.error(`[ClientPortalService] Error getting client portal user by email ${email}:`, error);
      throw new Error(`Failed to get client portal user: ${error.message}`);
    }
  }

  /**
   * Updates client portal user preferences
   */
  public async updateClientPreferences(
    clientPortalUserId: string,
    preferences: Partial<ClientPreferences>
  ): Promise<ClientPortalUser> {
    try {
      const clientPortalUser = await this.prisma.clientPortalUser.findUnique({
        where: { id: clientPortalUserId }
      });

      if (!clientPortalUser) {
        throw new Error('Client portal user not found');
      }

      const updatedPreferences = {
        ...(clientPortalUser.preferences as ClientPreferences),
        ...preferences
      };

      const updated = await this.prisma.clientPortalUser.update({
        where: { id: clientPortalUserId },
        data: { preferences: updatedPreferences }
      });

      logger.info(`[ClientPortalService] Updated preferences for client portal user ${clientPortalUserId}`);
      return updated as ClientPortalUser;
    } catch (error: any) {
      logger.error(`[ClientPortalService] Error updating client preferences:`, error);
      throw new Error(`Failed to update client preferences: ${error.message}`);
    }
  }

  /**
   * Gets client invoices
   */
  public async getClientInvoices(
    clientId: string,
    status?: ClientInvoice['status'],
    limit: number = 50,
    offset: number = 0
  ): Promise<ClientInvoice[]> {
    try {
      const where: any = { clientId };
      if (status) {
        where.status = status;
      }

      const invoices = await this.prisma.clientInvoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });

      return invoices as ClientInvoice[];
    } catch (error: any) {
      logger.error(`[ClientPortalService] Error getting client invoices for ${clientId}:`, error);
      throw new Error(`Failed to get client invoices: ${error.message}`);
    }
  }

  /**
   * Gets client invoice by ID
   */
  public async getClientInvoice(invoiceId: string, clientId: string): Promise<ClientInvoice | null> {
    try {
      const invoice = await this.prisma.clientInvoice.findFirst({
        where: { id: invoiceId, clientId }
      });

      return invoice as ClientInvoice | null;
    } catch (error: any) {
      logger.error(`[ClientPortalService] Error getting client invoice ${invoiceId}:`, error);
      throw new Error(`Failed to get client invoice: ${error.message}`);
    }
  }

  /**
   * Records invoice view
   */
  public async recordInvoiceView(invoiceId: string, clientId: string): Promise<void> {
    try {
      await this.prisma.clientInvoice.updateMany({
        where: { id: invoiceId, clientId },
        data: { status: 'viewed' }
      });

      // Create activity record
      await this.createClientActivity(clientId, 'invoice_viewed', 'Invoice viewed', { invoiceId });

      logger.info(`[ClientPortalService] Recorded view for invoice ${invoiceId} by client ${clientId}`);
    } catch (error: any) {
      logger.error(`[ClientPortalService] Error recording invoice view:`, error);
      throw new Error(`Failed to record invoice view: ${error.message}`);
    }
  }

  /**
   * Processes invoice payment
   */
  public async processInvoicePayment(
    invoiceId: string,
    clientId: string,
    paymentMethodId: string,
    amount: number,
    paymentData: any
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      const invoice = await this.getClientInvoice(invoiceId, clientId);
      if (!invoice) {
        return { success: false, error: 'Invoice not found' };
      }

      if (invoice.status === 'paid') {
        return { success: false, error: 'Invoice already paid' };
      }

      // Process payment (this would integrate with payment processor)
      const paymentResult = await this.processPayment(paymentMethodId, amount, paymentData);

      if (paymentResult.success) {
        // Update invoice status
        await this.prisma.clientInvoice.update({
          where: { id: invoiceId },
          data: {
            status: 'paid',
            paidDate: new Date()
          }
        });

        // Create activity record
        await this.createClientActivity(clientId, 'payment_made', 'Payment processed', {
          invoiceId,
          amount,
          transactionId: paymentResult.transactionId
        });

        logger.info(`[ClientPortalService] Processed payment for invoice ${invoiceId}`);
        return { success: true, transactionId: paymentResult.transactionId };
      } else {
        return { success: false, error: paymentResult.error };
      }
    } catch (error: any) {
      logger.error(`[ClientPortalService] Error processing invoice payment:`, error);
      return { success: false, error: 'Payment processing failed' };
    }
  }

  /**
   * Gets client documents
   */
  public async getClientDocuments(
    clientId: string,
    type?: Document['type'],
    limit: number = 50,
    offset: number = 0
  ): Promise<Document[]> {
    try {
      const where: any = { clientId, isPublic: true };
      if (type) {
        where.type = type;
      }

      const documents = await this.prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });

      return documents as Document[];
    } catch (error: any) {
      logger.error(`[ClientPortalService] Error getting client documents for ${clientId}:`, error);
      throw new Error(`Failed to get client documents: ${error.message}`);
    }
  }

  /**
   * Uploads document for client
   */
  public async uploadClientDocument(
    clientId: string,
    name: string,
    type: Document['type'],
    fileUrl: string,
    fileSize: number,
    mimeType: string,
    uploadedBy: string,
    description?: string,
    tags: string[] = []
  ): Promise<Document> {
    try {
      const document = await this.prisma.document.create({
        data: {
          clientId,
          name,
          type,
          fileUrl,
          fileSize,
          mimeType,
          uploadedBy,
          isPublic: true,
          description,
          tags
        }
      });

      // Create activity record
      await this.createClientActivity(clientId, 'document_uploaded', 'Document uploaded', {
        documentId: document.id,
        documentName: name
      });

      logger.info(`[ClientPortalService] Uploaded document ${document.id} for client ${clientId}`);
      return document as Document;
    } catch (error: any) {
      logger.error('[ClientPortalService] Error uploading client document:', error);
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  }

  /**
   * Gets client messages
   */
  public async getClientMessages(
    clientId: string,
    threadId?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ClientMessage[]> {
    try {
      const where: any = { clientId };
      if (threadId) {
        where.threadId = threadId;
      }

      const messages = await this.prisma.clientMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });

      return messages as ClientMessage[];
    } catch (error: any) {
      logger.error(`[ClientPortalService] Error getting client messages for ${clientId}:`, error);
      throw new Error(`Failed to get client messages: ${error.message}`);
    }
  }

  /**
   * Sends message to client
   */
  public async sendMessageToClient(
    clientId: string,
    fromUserId: string,
    subject: string,
    content: string,
    isUrgent: boolean = false,
    attachments: string[] = []
  ): Promise<ClientMessage> {
    try {
      const message = await this.prisma.clientMessage.create({
        data: {
          clientId,
          fromUserId,
          subject,
          content,
          isUrgent,
          attachments: attachments.map(id => ({ id }))
        }
      });

      // Create notification
      await this.createClientNotification(clientId, 'message', 'New Message', subject, {
        messageId: message.id,
        fromUserId
      });

      // Create activity record
      await this.createClientActivity(clientId, 'message_received', 'Message received', {
        messageId: message.id,
        subject
      });

      logger.info(`[ClientPortalService] Sent message ${message.id} to client ${clientId}`);
      return message as ClientMessage;
    } catch (error: any) {
      logger.error('[ClientPortalService] Error sending message to client:', error);
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  /**
   * Gets client activity
   */
  public async getClientActivity(
    clientId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ClientActivity[]> {
    try {
      const activities = await this.prisma.clientActivity.findMany({
        where: { clientId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });

      return activities as ClientActivity[];
    } catch (error: any) {
      logger.error(`[ClientPortalService] Error getting client activity for ${clientId}:`, error);
      throw new Error(`Failed to get client activity: ${error.message}`);
    }
  }

  /**
   * Gets client notifications
   */
  public async getClientNotifications(
    clientId: string,
    unreadOnly: boolean = false,
    limit: number = 50,
    offset: number = 0
  ): Promise<ClientNotification[]> {
    try {
      const where: any = { clientId };
      if (unreadOnly) {
        where.isRead = false;
      }

      const notifications = await this.prisma.clientNotification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });

      return notifications as ClientNotification[];
    } catch (error: any) {
      logger.error(`[ClientPortalService] Error getting client notifications for ${clientId}:`, error);
      throw new Error(`Failed to get client notifications: ${error.message}`);
    }
  }

  /**
   * Marks notification as read
   */
  public async markNotificationAsRead(notificationId: string, clientId: string): Promise<boolean> {
    try {
      await this.prisma.clientNotification.updateMany({
        where: { id: notificationId, clientId },
        data: { isRead: true }
      });

      logger.info(`[ClientPortalService] Marked notification ${notificationId} as read`);
      return true;
    } catch (error: any) {
      logger.error(`[ClientPortalService] Error marking notification as read:`, error);
      return false;
    }
  }

  /**
   * Gets client dashboard data
   */
  public async getClientDashboard(clientId: string): Promise<{
    recentInvoices: ClientInvoice[];
    recentDocuments: Document[];
    recentMessages: ClientMessage[];
    recentActivity: ClientActivity[];
    unreadNotifications: number;
    totalOutstanding: number;
    totalPaid: number;
  }> {
    try {
      const [recentInvoices, recentDocuments, recentMessages, recentActivity, notifications, outstandingInvoices, paidInvoices] = await Promise.all([
        this.getClientInvoices(clientId, undefined, 5),
        this.getClientDocuments(clientId, undefined, 5),
        this.getClientMessages(clientId, undefined, 5),
        this.getClientActivity(clientId, 10),
        this.getClientNotifications(clientId, true),
        this.getClientInvoices(clientId, 'sent'),
        this.getClientInvoices(clientId, 'paid')
      ]);

      const totalOutstanding = outstandingInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
      const totalPaid = paidInvoices.reduce((sum, invoice) => sum + invoice.total, 0);

      return {
        recentInvoices,
        recentDocuments,
        recentMessages,
        recentActivity,
        unreadNotifications: notifications.length,
        totalOutstanding,
        totalPaid
      };
    } catch (error: any) {
      logger.error(`[ClientPortalService] Error getting client dashboard for ${clientId}:`, error);
      throw new Error(`Failed to get client dashboard: ${error.message}`);
    }
  }

  /**
   * Creates client activity record
   */
  private async createClientActivity(
    clientId: string,
    type: ClientActivity['type'],
    description: string,
    metadata: any
  ): Promise<ClientActivity> {
    try {
      const activity = await this.prisma.clientActivity.create({
        data: {
          clientId,
          type,
          description,
          metadata
        }
      });

      return activity as ClientActivity;
    } catch (error: any) {
      logger.error('[ClientPortalService] Error creating client activity:', error);
      throw new Error(`Failed to create client activity: ${error.message}`);
    }
  }

  /**
   * Creates client notification
   */
  private async createClientNotification(
    clientId: string,
    type: ClientNotification['type'],
    title: string,
    message: string,
    metadata: any,
    isUrgent: boolean = false
  ): Promise<ClientNotification> {
    try {
      const notification = await this.prisma.clientNotification.create({
        data: {
          clientId,
          type,
          title,
          message,
          isUrgent,
          metadata
        }
      });

      return notification as ClientNotification;
    } catch (error: any) {
      logger.error('[ClientPortalService] Error creating client notification:', error);
      throw new Error(`Failed to create client notification: ${error.message}`);
    }
  }

  /**
   * Processes payment (mock implementation)
   */
  private async processPayment(
    paymentMethodId: string,
    amount: number,
    paymentData: any
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // This would integrate with actual payment processor
    // For now, returning mock success
    return {
      success: true,
      transactionId: `txn_${Date.now()}`
    };
  }
}

export default new ClientPortalService();







