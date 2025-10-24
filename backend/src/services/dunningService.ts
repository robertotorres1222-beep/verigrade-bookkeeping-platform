import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { sendEmail } from '../utils/emailService';

const prisma = new PrismaClient();

export interface DunningSequence {
  day0: string;    // Thank you email
  day5: string;    // Friendly reminder
  day25: string;   // Due soon
  day31: string;   // 1 day late
  day40: string;   // 10 days late
  day60: string;   // 30 days late
  day90: string;   // 60 days late
}

export interface DunningEmail {
  templateId: string;
  subject: string;
  body: string;
  priority: 'low' | 'medium' | 'high';
  attachments?: string[];
  actionRequired?: string;
}

export class DunningService {
  /**
   * Process automated dunning sequence
   */
  async processDunningSequence(companyId: string): Promise<void> {
    try {
      logger.info(`Processing dunning sequence for company ${companyId}`);

      const overdueInvoices = await this.getOverdueInvoices(companyId);
      
      for (const invoice of overdueInvoices) {
        const daysOverdue = this.calculateDaysOverdue(invoice.dueDate);
        const dunningEmail = this.getDunningEmail(daysOverdue, invoice);
        
        if (dunningEmail) {
          await this.sendDunningEmail(invoice, dunningEmail);
          await this.logDunningActivity(invoice.id, dunningEmail);
        }
      }
    } catch (error) {
      logger.error(`Error processing dunning sequence: ${error.message}`);
      throw new Error(`Failed to process dunning sequence: ${error.message}`);
    }
  }

  /**
   * Get overdue invoices
   */
  private async getOverdueInvoices(companyId: string) {
    const now = new Date();
    
    return await prisma.invoice.findMany({
      where: {
        companyId,
        status: { in: ['sent', 'overdue'] },
        dueDate: { lt: now }
      },
      include: {
        customer: true,
        company: true
      }
    });
  }

  /**
   * Calculate days overdue
   */
  private calculateDaysOverdue(dueDate: Date | null): number {
    if (!dueDate) return 0;
    
    const now = new Date();
    return Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Get appropriate dunning email based on days overdue
   */
  private getDunningEmail(daysOverdue: number, invoice: any): DunningEmail | null {
    const templates = this.getDunningTemplates();
    
    if (daysOverdue === 0) {
      return templates.day0;
    } else if (daysOverdue === 5) {
      return templates.day5;
    } else if (daysOverdue === 25) {
      return templates.day25;
    } else if (daysOverdue === 31) {
      return templates.day31;
    } else if (daysOverdue === 40) {
      return templates.day40;
    } else if (daysOverdue === 60) {
      return templates.day60;
    } else if (daysOverdue === 90) {
      return templates.day90;
    }
    
    return null;
  }

  /**
   * Get dunning email templates
   */
  private getDunningTemplates(): DunningSequence {
    return {
      day0: this.createDay0Template(),
      day5: this.createDay5Template(),
      day25: this.createDay25Template(),
      day31: this.createDay31Template(),
      day40: this.createDay40Template(),
      day60: this.createDay60Template(),
      day90: this.createDay90Template()
    };
  }

  /**
   * Day 0: Thank you email
   */
  private createDay0Template(): DunningEmail {
    return {
      templateId: 'dunning-day0',
      subject: 'Thank you for your business - Invoice #{invoiceNumber}',
      body: `
        <h2>Thank you for your business!</h2>
        <p>Dear {customerName},</p>
        <p>Thank you for choosing {companyName}. We've sent you invoice #{invoiceNumber} for {amount}.</p>
        <p>Payment is due on {dueDate}. You can pay online using the link below:</p>
        <p><a href="{paymentLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Pay Now</a></p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>{companyName} Team</p>
      `,
      priority: 'low'
    };
  }

  /**
   * Day 5: Friendly reminder
   */
  private createDay5Template(): DunningEmail {
    return {
      templateId: 'dunning-day5',
      subject: 'Friendly reminder - Invoice #{invoiceNumber} due in 25 days',
      body: `
        <h2>Friendly Payment Reminder</h2>
        <p>Dear {customerName},</p>
        <p>This is a friendly reminder that invoice #{invoiceNumber} for {amount} is due on {dueDate}.</p>
        <p>You can pay online using the secure link below:</p>
        <p><a href="{paymentLink}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Pay Online</a></p>
        <p>We also accept:</p>
        <ul>
          <li>Bank transfer</li>
          <li>Check by mail</li>
          <li>Credit card</li>
        </ul>
        <p>If you have any questions about this invoice, please contact us.</p>
        <p>Thank you for your business!</p>
        <p>Best regards,<br>{companyName} Team</p>
      `,
      priority: 'low'
    };
  }

  /**
   * Day 25: Due soon
   */
  private createDay25Template(): DunningEmail {
    return {
      templateId: 'dunning-day25',
      subject: 'Invoice #{invoiceNumber} due in 5 days',
      body: `
        <h2>Payment Due Soon</h2>
        <p>Dear {customerName},</p>
        <p>Invoice #{invoiceNumber} for {amount} is due in 5 days (due date: {dueDate}).</p>
        <p>To avoid any late fees, please process payment using one of these convenient methods:</p>
        <p><a href="{paymentLink}" style="background-color: #FF9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Pay Now</a></p>
        <p><strong>Payment Methods:</strong></p>
        <ul>
          <li>Online payment (recommended)</li>
          <li>Bank transfer to: {bankDetails}</li>
          <li>Check payable to {companyName}</li>
        </ul>
        <p>If you've already sent payment, please disregard this notice.</p>
        <p>Thank you for your prompt attention to this matter.</p>
        <p>Best regards,<br>{companyName} Team</p>
      `,
      priority: 'medium'
    };
  }

  /**
   * Day 31: 1 day late
   */
  private createDay31Template(): DunningEmail {
    return {
      templateId: 'dunning-day31',
      subject: 'Payment Overdue - Invoice #{invoiceNumber}',
      body: `
        <h2>Payment Overdue Notice</h2>
        <p>Dear {customerName},</p>
        <p>Invoice #{invoiceNumber} for {amount} was due on {dueDate} and is now overdue.</p>
        <p>We understand that sometimes payments can be delayed. Please process payment as soon as possible to avoid any late fees.</p>
        <p><a href="{paymentLink}" style="background-color: #F44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Pay Now</a></p>
        <p><strong>Payment Options:</strong></p>
        <ul>
          <li>Online payment (instant)</li>
          <li>Bank transfer</li>
          <li>Call us to discuss payment arrangements</li>
        </ul>
        <p>If you've already sent payment, please contact us immediately.</p>
        <p>If you're experiencing financial difficulties, please contact us to discuss payment options.</p>
        <p>Best regards,<br>{companyName} Team</p>
      `,
      priority: 'medium',
      actionRequired: 'Payment required'
    };
  }

  /**
   * Day 40: 10 days late
   */
  private createDay40Template(): DunningEmail {
    return {
      templateId: 'dunning-day40',
      subject: 'URGENT: Payment 10 Days Overdue - Invoice #{invoiceNumber}',
      body: `
        <h2>Urgent Payment Notice</h2>
        <p>Dear {customerName},</p>
        <p>Invoice #{invoiceNumber} for {amount} is now 10 days overdue (original due date: {dueDate}).</p>
        <p><strong>This is our second notice regarding this overdue payment.</strong></p>
        <p>Please remit payment immediately to avoid:</p>
        <ul>
          <li>Late fees and interest charges</li>
          <li>Service suspension</li>
          <li>Collection proceedings</li>
        </ul>
        <p><a href="{paymentLink}" style="background-color: #D32F2F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">PAY NOW</a></p>
        <p><strong>Immediate Payment Required:</strong></p>
        <p>Amount: {amount}<br>
        Due Date: {dueDate}<br>
        Days Overdue: {daysOverdue}</p>
        <p>If you cannot pay the full amount immediately, please contact us within 48 hours to discuss payment arrangements.</p>
        <p>Failure to respond may result in service suspension and collection proceedings.</p>
        <p>Best regards,<br>{companyName} Collections Team</p>
      `,
      priority: 'high',
      actionRequired: 'Immediate payment required'
    };
  }

  /**
   * Day 60: 30 days late
   */
  private createDay60Template(): DunningEmail {
    return {
      templateId: 'dunning-day60',
      subject: 'FINAL NOTICE: Payment 30 Days Overdue - Invoice #{invoiceNumber}',
      body: `
        <h2>Final Payment Notice</h2>
        <p>Dear {customerName},</p>
        <p>Invoice #{invoiceNumber} for {amount} is now 30 days overdue (original due date: {dueDate}).</p>
        <p><strong>This is our FINAL NOTICE before collection proceedings begin.</strong></p>
        <p>You have 7 days to remit full payment or contact us to arrange payment.</p>
        <p><strong>Consequences of Non-Payment:</strong></p>
        <ul>
          <li>Service will be suspended immediately</li>
          <li>Account will be turned over to collections</li>
          <li>Credit reporting may be affected</li>
          <li>Legal action may be pursued</li>
        </ul>
        <p><a href="{paymentLink}" style="background-color: #B71C1C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">PAY IMMEDIATELY</a></p>
        <p><strong>Payment Must Be Received By: {finalDueDate}</strong></p>
        <p>If you have already sent payment, please contact us immediately with proof of payment.</p>
        <p>This is your last opportunity to resolve this matter before collection proceedings begin.</p>
        <p>Best regards,<br>{companyName} Collections Department</p>
      `,
      priority: 'high',
      actionRequired: 'Final payment notice'
    };
  }

  /**
   * Day 90: 60 days late
   */
  private createDay90Template(): DunningEmail {
    return {
      templateId: 'dunning-day90',
      subject: 'SERVICE SUSPENDED - Account Turned Over to Collections',
      body: `
        <h2>Service Suspension Notice</h2>
        <p>Dear {customerName},</p>
        <p>Due to non-payment of invoice #{invoiceNumber} for {amount} (60 days overdue), your account has been suspended and turned over to our collections department.</p>
        <p><strong>Account Status: SUSPENDED</strong></p>
        <p><strong>Outstanding Balance: {amount}</strong></p>
        <p>To restore service, you must:</p>
        <ol>
          <li>Pay the full outstanding balance immediately</li>
          <li>Contact our collections department</li>
          <li>Provide payment verification</li>
        </ol>
        <p><strong>Collections Contact:</strong><br>
        Phone: {collectionsPhone}<br>
        Email: {collectionsEmail}</p>
        <p>This matter will remain on your account until resolved.</p>
        <p>If you believe this is an error, please contact us immediately.</p>
        <p>Best regards,<br>{companyName} Collections Department</p>
      `,
      priority: 'high',
      actionRequired: 'Service suspended - collections'
    };
  }

  /**
   * Send dunning email
   */
  private async sendDunningEmail(invoice: any, dunningEmail: DunningEmail): Promise<void> {
    try {
      const emailData = {
        to: invoice.customer.email,
        subject: this.replaceTemplateVariables(dunningEmail.subject, invoice),
        html: this.replaceTemplateVariables(dunningEmail.body, invoice),
        priority: dunningEmail.priority
      };

      await sendEmail(emailData);
      
      logger.info(`Sent dunning email ${dunningEmail.templateId} for invoice ${invoice.id}`);
    } catch (error) {
      logger.error(`Error sending dunning email: ${error.message}`);
      throw error;
    }
  }

  /**
   * Replace template variables
   */
  private replaceTemplateVariables(template: string, invoice: any): string {
    const variables = {
      '{customerName}': invoice.customer.name,
      '{companyName}': invoice.company.name,
      '{invoiceNumber}': invoice.invoiceNumber,
      '{amount}': this.formatCurrency(invoice.amount),
      '{dueDate}': this.formatDate(invoice.dueDate),
      '{paymentLink}': `${process.env.FRONTEND_URL}/pay/${invoice.id}`,
      '{daysOverdue}': this.calculateDaysOverdue(invoice.dueDate),
      '{finalDueDate}': this.formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      '{bankDetails}': 'Account: 123456789, Routing: 987654321',
      '{collectionsPhone}': '1-800-COLLECT',
      '{collectionsEmail}': 'collections@company.com'
    };

    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(key, 'g'), value);
    }

    return result;
  }

  /**
   * Log dunning activity
   */
  private async logDunningActivity(invoiceId: string, dunningEmail: DunningEmail): Promise<void> {
    await prisma.collectionActivity.create({
      data: {
        invoiceId,
        activityType: 'email_sent',
        description: `Sent ${dunningEmail.templateId} email`,
        priority: dunningEmail.priority,
        actionRequired: dunningEmail.actionRequired
      }
    });
  }

  /**
   * Format currency
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  /**
   * Format date
   */
  private formatDate(date: Date | null): string {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }
}





