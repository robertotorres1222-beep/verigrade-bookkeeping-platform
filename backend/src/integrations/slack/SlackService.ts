import IntegrationFramework, { IntegrationConnection } from '../framework/IntegrationFramework';
import logger from '../../utils/logger';

export interface SlackChannel {
  id: string;
  name: string;
  isPrivate: boolean;
  isMember: boolean;
  topic?: string;
  purpose?: string;
  memberCount: number;
  createdAt: string;
}

export interface SlackMessage {
  id: string;
  channelId: string;
  text: string;
  userId: string;
  userName: string;
  timestamp: string;
  threadTs?: string;
  attachments?: Array<{
    title?: string;
    text?: string;
    color?: string;
    fields?: Array<{
      title: string;
      value: string;
      short: boolean;
    }>;
  }>;
}

export interface SlackUser {
  id: string;
  name: string;
  realName: string;
  email?: string;
  phone?: string;
  title?: string;
  isAdmin: boolean;
  isBot: boolean;
  timezone?: string;
  status?: string;
  statusText?: string;
}

export interface SlackNotification {
  channelId: string;
  text: string;
  attachments?: Array<{
    title?: string;
    text?: string;
    color?: string;
    fields?: Array<{
      title: string;
      value: string;
      short: boolean;
    }>;
    actions?: Array<{
      type: string;
      text: string;
      url?: string;
      value?: string;
    }>;
  }>;
  threadTs?: string;
}

class SlackService {
  private framework: IntegrationFramework;

  constructor() {
    this.framework = IntegrationFramework;
    logger.info('[SlackService] Initialized');
  }

  /**
   * Gets authorization URL for Slack OAuth
   */
  public getAuthorizationUrl(userId: string): string {
    return this.framework.getAuthorizationUrl('slack', userId);
  }

  /**
   * Exchanges authorization code for access token
   */
  public async connect(userId: string, code: string): Promise<IntegrationConnection> {
    return this.framework.exchangeCodeForToken('slack', code, userId);
  }

  /**
   * Gets list of channels
   */
  public async getChannels(connectionId: string): Promise<SlackChannel[]> {
    const client = this.framework.createAuthenticatedClient(connectionId);
    
    try {
      const response = await client.get('/conversations.list', {
        params: {
          types: 'public_channel,private_channel',
          limit: 1000
        }
      });

      const channels: SlackChannel[] = response.data.channels?.map((slack: any) => ({
        id: slack.id,
        name: slack.name,
        isPrivate: slack.is_private,
        isMember: slack.is_member,
        topic: slack.topic?.value,
        purpose: slack.purpose?.value,
        memberCount: slack.num_members,
        createdAt: new Date(parseFloat(slack.created) * 1000).toISOString()
      })) || [];

      logger.info(`[SlackService] Retrieved ${channels.length} channels`);
      return channels;
    } catch (error: any) {
      logger.error('[SlackService] Error getting channels:', error);
      throw new Error(`Failed to get channels: ${error.message}`);
    }
  }

  /**
   * Gets list of users
   */
  public async getUsers(connectionId: string): Promise<SlackUser[]> {
    const client = this.framework.createAuthenticatedClient(connectionId);
    
    try {
      const response = await client.get('/users.list');

      const users: SlackUser[] = response.data.members?.map((slack: any) => ({
        id: slack.id,
        name: slack.name,
        realName: slack.real_name,
        email: slack.profile?.email,
        phone: slack.profile?.phone,
        title: slack.profile?.title,
        isAdmin: slack.is_admin,
        isBot: slack.is_bot,
        timezone: slack.tz,
        status: slack.profile?.status_text,
        statusText: slack.profile?.status_emoji
      })) || [];

      logger.info(`[SlackService] Retrieved ${users.length} users`);
      return users;
    } catch (error: any) {
      logger.error('[SlackService] Error getting users:', error);
      throw new Error(`Failed to get users: ${error.message}`);
    }
  }

  /**
   * Gets messages from a channel
   */
  public async getChannelMessages(
    connectionId: string, 
    channelId: string, 
    limit: number = 100
  ): Promise<SlackMessage[]> {
    const client = this.framework.createAuthenticatedClient(connectionId);
    
    try {
      const response = await client.get('/conversations.history', {
        params: {
          channel: channelId,
          limit
        }
      });

      const messages: SlackMessage[] = response.data.messages?.map((slack: any) => ({
        id: slack.ts,
        channelId,
        text: slack.text,
        userId: slack.user,
        userName: slack.username || 'Unknown',
        timestamp: new Date(parseFloat(slack.ts) * 1000).toISOString(),
        threadTs: slack.thread_ts,
        attachments: slack.attachments?.map((att: any) => ({
          title: att.title,
          text: att.text,
          color: att.color,
          fields: att.fields?.map((field: any) => ({
            title: field.title,
            value: field.value,
            short: field.short
          }))
        }))
      })) || [];

      logger.info(`[SlackService] Retrieved ${messages.length} messages from channel ${channelId}`);
      return messages;
    } catch (error: any) {
      logger.error('[SlackService] Error getting channel messages:', error);
      throw new Error(`Failed to get channel messages: ${error.message}`);
    }
  }

  /**
   * Sends a message to a channel
   */
  public async sendMessage(connectionId: string, notification: SlackNotification): Promise<SlackMessage> {
    const client = this.framework.createAuthenticatedClient(connectionId);
    
    try {
      const payload: any = {
        channel: notification.channelId,
        text: notification.text
      };

      if (notification.attachments) {
        payload.attachments = notification.attachments;
      }

      if (notification.threadTs) {
        payload.thread_ts = notification.threadTs;
      }

      const response = await client.post('/chat.postMessage', payload);

      const message: SlackMessage = {
        id: response.data.ts,
        channelId: notification.channelId,
        text: notification.text,
        userId: response.data.message?.user || 'bot',
        userName: 'Bot',
        timestamp: new Date(parseFloat(response.data.ts) * 1000).toISOString(),
        attachments: notification.attachments
      };

      logger.info(`[SlackService] Sent message to channel ${notification.channelId}`);
      return message;
    } catch (error: any) {
      logger.error('[SlackService] Error sending message:', error);
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  /**
   * Sends a notification about a new invoice
   */
  public async notifyInvoiceCreated(
    connectionId: string, 
    channelId: string, 
    invoiceData: {
      invoiceNumber: string;
      customerName: string;
      amount: number;
      dueDate: string;
      invoiceUrl?: string;
    }
  ): Promise<SlackMessage> {
    const notification: SlackNotification = {
      channelId,
      text: `📄 New invoice created: ${invoiceData.invoiceNumber}`,
      attachments: [{
        title: `Invoice ${invoiceData.invoiceNumber}`,
        text: `Customer: ${invoiceData.customerName}\nAmount: $${invoiceData.amount}\nDue Date: ${invoiceData.dueDate}`,
        color: 'good',
        actions: invoiceData.invoiceUrl ? [{
          type: 'button',
          text: 'View Invoice',
          url: invoiceData.invoiceUrl
        }] : undefined
      }]
    };

    return this.sendMessage(connectionId, notification);
  }

  /**
   * Sends a notification about a payment received
   */
  public async notifyPaymentReceived(
    connectionId: string, 
    channelId: string, 
    paymentData: {
      invoiceNumber: string;
      customerName: string;
      amount: number;
      paymentMethod: string;
      paymentUrl?: string;
    }
  ): Promise<SlackMessage> {
    const notification: SlackNotification = {
      channelId,
      text: `💰 Payment received: ${paymentData.amount} for invoice ${paymentData.invoiceNumber}`,
      attachments: [{
        title: `Payment for ${paymentData.invoiceNumber}`,
        text: `Customer: ${paymentData.customerName}\nAmount: $${paymentData.amount}\nMethod: ${paymentData.paymentMethod}`,
        color: 'good',
        actions: paymentData.paymentUrl ? [{
          type: 'button',
          text: 'View Payment',
          url: paymentData.paymentUrl
        }] : undefined
      }]
    };

    return this.sendMessage(connectionId, notification);
  }

  /**
   * Sends a notification about low stock
   */
  public async notifyLowStock(
    connectionId: string, 
    channelId: string, 
    stockData: {
      productName: string;
      currentStock: number;
      minimumStock: number;
      productUrl?: string;
    }
  ): Promise<SlackMessage> {
    const notification: SlackNotification = {
      channelId,
      text: `⚠️ Low stock alert: ${stockData.productName}`,
      attachments: [{
        title: `Low Stock: ${stockData.productName}`,
        text: `Current Stock: ${stockData.currentStock}\nMinimum Required: ${stockData.minimumStock}`,
        color: 'warning',
        actions: stockData.productUrl ? [{
          type: 'button',
          text: 'View Product',
          url: stockData.productUrl
        }] : undefined
      }]
    };

    return this.sendMessage(connectionId, notification);
  }

  /**
   * Sends a notification about overdue invoices
   */
  public async notifyOverdueInvoices(
    connectionId: string, 
    channelId: string, 
    overdueData: {
      count: number;
      totalAmount: number;
      invoices: Array<{
        invoiceNumber: string;
        customerName: string;
        amount: number;
        daysOverdue: number;
      }>;
    }
  ): Promise<SlackMessage> {
    const notification: SlackNotification = {
      channelId,
      text: `🚨 ${overdueData.count} overdue invoices totaling $${overdueData.totalAmount}`,
      attachments: [{
        title: 'Overdue Invoices',
        text: overdueData.invoices.map(inv => 
          `${inv.invoiceNumber} - ${inv.customerName} - $${inv.amount} (${inv.daysOverdue} days overdue)`
        ).join('\n'),
        color: 'danger',
        fields: [{
          title: 'Total Overdue',
          value: `$${overdueData.totalAmount}`,
          short: true
        }, {
          title: 'Count',
          value: overdueData.count.toString(),
          short: true
        }]
      }]
    };

    return this.sendMessage(connectionId, notification);
  }

  /**
   * Sets up webhook for Slack events
   */
  public async setupWebhook(connectionId: string, webhookUrl: string): Promise<boolean> {
    const client = this.framework.createAuthenticatedClient(connectionId);
    
    try {
      // This would typically involve setting up event subscriptions
      // For now, we'll just log the webhook setup
      logger.info(`[SlackService] Webhook setup for connection ${connectionId}: ${webhookUrl}`);
      return true;
    } catch (error: any) {
      logger.error('[SlackService] Error setting up webhook:', error);
      throw new Error(`Failed to setup webhook: ${error.message}`);
    }
  }
}

export default new SlackService();






