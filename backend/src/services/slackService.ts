import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

interface SlackConfig {
  webhookUrl: string;
  botToken?: string;
  channel?: string;
}

interface SlackMessage {
  text: string;
  blocks?: any[];
  attachments?: any[];
  channel?: string;
  username?: string;
  iconEmoji?: string;
}

interface SlackNotification {
  type: 'invoice_paid' | 'expense_approved' | 'low_stock' | 'payment_received' | 'system_alert';
  title: string;
  message: string;
  data?: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export class SlackService {
  private config: SlackConfig;

  constructor() {
    this.config = {
      webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
      botToken: process.env.SLACK_BOT_TOKEN,
      channel: process.env.SLACK_CHANNEL || '#general',
    };
  }

  /**
   * Send message to Slack
   */
  async sendMessage(message: SlackMessage): Promise<boolean> {
    try {
      if (!this.config.webhookUrl) {
        throw new AppError('Slack webhook URL not configured', 400);
      }

      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: message.text,
          blocks: message.blocks,
          attachments: message.attachments,
          channel: message.channel || this.config.channel,
          username: message.username || 'VeriGrade Bot',
          icon_emoji: message.iconEmoji || ':chart_with_upwards_trend:',
        }),
      });

      if (!response.ok) {
        throw new AppError('Failed to send Slack message', 400);
      }

      return true;
    } catch (error) {
      console.error('Send Slack message error:', error);
      return false;
    }
  }

  /**
   * Send notification to Slack
   */
  async sendNotification(notification: SlackNotification): Promise<boolean> {
    try {
      const message = this.buildNotificationMessage(notification);
      return await this.sendMessage(message);
    } catch (error) {
      console.error('Send Slack notification error:', error);
      return false;
    }
  }

  /**
   * Send invoice paid notification
   */
  async sendInvoicePaidNotification(invoiceData: {
    invoiceNumber: string;
    clientName: string;
    amount: number;
    paymentMethod: string;
  }): Promise<boolean> {
    const message: SlackMessage = {
      text: `💰 Invoice Paid - ${invoiceData.invoiceNumber}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '💰 Invoice Paid',
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Invoice:* ${invoiceData.invoiceNumber}`,
            },
            {
              type: 'mrkdwn',
              text: `*Client:* ${invoiceData.clientName}`,
            },
            {
              type: 'mrkdwn',
              text: `*Amount:* $${invoiceData.amount.toFixed(2)}`,
            },
            {
              type: 'mrkdwn',
              text: `*Payment Method:* ${invoiceData.paymentMethod}`,
            },
          ],
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Payment received at ${new Date().toLocaleString()}`,
            },
          ],
        },
      ],
    };

    return await this.sendMessage(message);
  }

  /**
   * Send expense approved notification
   */
  async sendExpenseApprovedNotification(expenseData: {
    description: string;
    amount: number;
    category: string;
    employeeName: string;
  }): Promise<boolean> {
    const message: SlackMessage = {
      text: `✅ Expense Approved - ${expenseData.description}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '✅ Expense Approved',
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Description:* ${expenseData.description}`,
            },
            {
              type: 'mrkdwn',
              text: `*Amount:* $${expenseData.amount.toFixed(2)}`,
            },
            {
              type: 'mrkdwn',
              text: `*Category:* ${expenseData.category}`,
            },
            {
              type: 'mrkdwn',
              text: `*Employee:* ${expenseData.employeeName}`,
            },
          ],
        },
      ],
    };

    return await this.sendMessage(message);
  }

  /**
   * Send low stock notification
   */
  async sendLowStockNotification(products: Array<{
    name: string;
    sku: string;
    currentStock: number;
    minStockLevel: number;
  }>): Promise<boolean> {
    const message: SlackMessage = {
      text: `⚠️ Low Stock Alert - ${products.length} product(s)`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '⚠️ Low Stock Alert',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${products.length} product(s) are running low on stock:*`,
          },
        },
        {
          type: 'section',
          fields: products.slice(0, 10).map(product => ({
            type: 'mrkdwn',
            text: `*${product.name}* (${product.sku})\nCurrent: ${product.currentStock} | Min: ${product.minStockLevel}`,
          })),
        },
        ...(products.length > 10 ? [{
          type: 'context',
          elements: [{
            type: 'mrkdwn',
            text: `... and ${products.length - 10} more products`,
          }],
        }] : []),
      ],
    };

    return await this.sendMessage(message);
  }

  /**
   * Send system alert
   */
  async sendSystemAlert(alertData: {
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    details?: any;
  }): Promise<boolean> {
    const emojiMap = {
      info: ':information_source:',
      warning: ':warning:',
      error: ':x:',
      critical: ':rotating_light:',
    };

    const colorMap = {
      info: '#36a64f',
      warning: '#ff9500',
      error: '#ff0000',
      critical: '#8b0000',
    };

    const message: SlackMessage = {
      text: `${emojiMap[alertData.severity]} ${alertData.title}`,
      attachments: [
        {
          color: colorMap[alertData.severity],
          fields: [
            {
              title: 'Message',
              value: alertData.message,
              short: false,
            },
            ...(alertData.details ? [{
              title: 'Details',
              value: JSON.stringify(alertData.details, null, 2),
              short: false,
            }] : []),
          ],
          footer: 'VeriGrade System',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    return await this.sendMessage(message);
  }

  /**
   * Send daily summary
   */
  async sendDailySummary(summaryData: {
    date: string;
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    invoicesSent: number;
    paymentsReceived: number;
    expensesApproved: number;
  }): Promise<boolean> {
    const message: SlackMessage = {
      text: `📊 Daily Summary - ${summaryData.date}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📊 Daily Summary',
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Total Revenue:* $${summaryData.totalRevenue.toFixed(2)}`,
            },
            {
              type: 'mrkdwn',
              text: `*Total Expenses:* $${summaryData.totalExpenses.toFixed(2)}`,
            },
            {
              type: 'mrkdwn',
              text: `*Net Income:* $${summaryData.netIncome.toFixed(2)}`,
            },
            {
              type: 'mrkdwn',
              text: `*Invoices Sent:* ${summaryData.invoicesSent}`,
            },
            {
              type: 'mrkdwn',
              text: `*Payments Received:* ${summaryData.paymentsReceived}`,
            },
            {
              type: 'mrkdwn',
              text: `*Expenses Approved:* ${summaryData.expensesApproved}`,
            },
          ],
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Generated at ${new Date().toLocaleString()}`,
            },
          ],
        },
      ],
    };

    return await this.sendMessage(message);
  }

  /**
   * Send weekly report
   */
  async sendWeeklyReport(reportData: {
    week: string;
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    topClients: Array<{ name: string; revenue: number }>;
    topExpenses: Array<{ category: string; amount: number }>;
    growthRate: number;
  }): Promise<boolean> {
    const message: SlackMessage = {
      text: `📈 Weekly Report - ${reportData.week}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📈 Weekly Report',
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Total Revenue:* $${reportData.totalRevenue.toFixed(2)}`,
            },
            {
              type: 'mrkdwn',
              text: `*Total Expenses:* $${reportData.totalExpenses.toFixed(2)}`,
            },
            {
              type: 'mrkdwn',
              text: `*Net Income:* $${reportData.netIncome.toFixed(2)}`,
            },
            {
              type: 'mrkdwn',
              text: `*Growth Rate:* ${reportData.growthRate.toFixed(1)}%`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Top Clients:*',
          },
        },
        {
          type: 'section',
          fields: reportData.topClients.slice(0, 5).map(client => ({
            type: 'mrkdwn',
            text: `*${client.name}*: $${client.revenue.toFixed(2)}`,
          })),
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Top Expense Categories:*',
          },
        },
        {
          type: 'section',
          fields: reportData.topExpenses.slice(0, 5).map(expense => ({
            type: 'mrkdwn',
            text: `*${expense.category}*: $${expense.amount.toFixed(2)}`,
          })),
        },
      ],
    };

    return await this.sendMessage(message);
  }

  /**
   * Build notification message
   */
  private buildNotificationMessage(notification: SlackNotification): SlackMessage {
    const emojiMap = {
      invoice_paid: ':money_with_wings:',
      expense_approved: ':white_check_mark:',
      low_stock: ':warning:',
      payment_received: ':moneybag:',
      system_alert: ':rotating_light:',
    };

    const colorMap = {
      low: '#36a64f',
      medium: '#ff9500',
      high: '#ff0000',
      critical: '#8b0000',
    };

    return {
      text: `${emojiMap[notification.type]} ${notification.title}`,
      attachments: [
        {
          color: colorMap[notification.priority],
          fields: [
            {
              title: 'Message',
              value: notification.message,
              short: false,
            },
            ...(notification.data ? [{
              title: 'Data',
              value: JSON.stringify(notification.data, null, 2),
              short: false,
            }] : []),
          ],
          footer: 'VeriGrade Notification',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };
  }

  /**
   * Test Slack connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const message: SlackMessage = {
        text: '🔧 VeriGrade Slack integration test',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '🔧 *VeriGrade Slack Integration Test*\n\nThis is a test message to verify the Slack integration is working correctly.',
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `Test sent at ${new Date().toLocaleString()}`,
              },
            ],
          },
        ],
      };

      return await this.sendMessage(message);
    } catch (error) {
      console.error('Test Slack connection error:', error);
      return false;
    }
  }
}

export default new SlackService();




