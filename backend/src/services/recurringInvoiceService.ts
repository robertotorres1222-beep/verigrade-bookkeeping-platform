import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import automationService from './automationService';

interface RecurringInvoiceTemplate {
  id: string;
  name: string;
  description: string;
  clientId: string;
  items: any[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  recurrence: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  startDate: Date;
  endDate?: Date;
  nextDueDate: Date;
  isActive: boolean;
  organizationId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface RecurringInvoice {
  id: string;
  templateId: string;
  invoiceId: string;
  dueDate: Date;
  status: 'PENDING' | 'SENT' | 'PAID' | 'CANCELLED';
  organizationId: string;
  createdAt: Date;
}

export class RecurringInvoiceService {
  /**
   * Create recurring invoice template
   */
  async createTemplate(data: {
    name: string;
    description: string;
    clientId: string;
    items: any[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    recurrence: string;
    startDate: Date;
    endDate?: Date;
    organizationId: string;
    createdBy: string;
  }): Promise<RecurringInvoiceTemplate> {
    try {
      const nextDueDate = this.calculateNextDueDate(data.startDate, data.recurrence);

      const template = await prisma.recurringInvoiceTemplate.create({
        data: {
          id: uuidv4(),
          name: data.name,
          description: data.description,
          clientId: data.clientId,
          items: data.items,
          subtotal: data.subtotal,
          taxRate: data.taxRate,
          taxAmount: data.taxAmount,
          total: data.total,
          recurrence: data.recurrence as any,
          startDate: data.startDate,
          endDate: data.endDate,
          nextDueDate,
          isActive: true,
          organizationId: data.organizationId,
          createdBy: data.createdBy,
        },
      });

      // Execute automation rules
      await automationService.executeRulesForTrigger('RECURRING_INVOICE_CREATED', template, data.organizationId);

      return template;
    } catch (error) {
      console.error('Create recurring invoice template error:', error);
      throw new AppError('Failed to create recurring invoice template', 500);
    }
  }

  /**
   * Get recurring invoice templates
   */
  async getTemplates(organizationId: string, filters?: {
    clientId?: string;
    isActive?: boolean;
    recurrence?: string;
  }): Promise<RecurringInvoiceTemplate[]> {
    try {
      const where: any = { organizationId };

      if (filters?.clientId) {
        where.clientId = filters.clientId;
      }

      if (filters?.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      if (filters?.recurrence) {
        where.recurrence = filters.recurrence;
      }

      const templates = await prisma.recurringInvoiceTemplate.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return templates;
    } catch (error) {
      console.error('Get recurring invoice templates error:', error);
      throw new AppError('Failed to get recurring invoice templates', 500);
    }
  }

  /**
   * Update recurring invoice template
   */
  async updateTemplate(
    templateId: string,
    data: Partial<Omit<RecurringInvoiceTemplate, 'id' | 'organizationId' | 'createdAt'>>,
    organizationId: string,
    updatedBy: string
  ): Promise<RecurringInvoiceTemplate> {
    try {
      const template = await prisma.recurringInvoiceTemplate.update({
        where: {
          id: templateId,
          organizationId,
        },
        data: {
          ...data,
          updatedBy,
          updatedAt: new Date(),
        },
      });

      return template;
    } catch (error) {
      console.error('Update recurring invoice template error:', error);
      throw new AppError('Failed to update recurring invoice template', 500);
    }
  }

  /**
   * Delete recurring invoice template
   */
  async deleteTemplate(templateId: string, organizationId: string): Promise<void> {
    try {
      await prisma.recurringInvoiceTemplate.delete({
        where: {
          id: templateId,
          organizationId,
        },
      });
    } catch (error) {
      console.error('Delete recurring invoice template error:', error);
      throw new AppError('Failed to delete recurring invoice template', 500);
    }
  }

  /**
   * Process recurring invoices
   */
  async processRecurringInvoices(organizationId: string): Promise<{
    processed: number;
    created: number;
    errors: number;
  }> {
    try {
      const now = new Date();
      const templates = await prisma.recurringInvoiceTemplate.findMany({
        where: {
          organizationId,
          isActive: true,
          nextDueDate: { lte: now },
          OR: [
            { endDate: null },
            { endDate: { gte: now } },
          ],
        },
        include: {
          client: true,
        },
      });

      let processed = 0;
      let created = 0;
      let errors = 0;

      for (const template of templates) {
        try {
          // Create invoice from template
          const invoice = await this.createInvoiceFromTemplate(template, organizationId);

          // Create recurring invoice record
          await prisma.recurringInvoice.create({
            data: {
              id: uuidv4(),
              templateId: template.id,
              invoiceId: invoice.id,
              dueDate: template.nextDueDate,
              status: 'PENDING',
              organizationId,
            },
          });

          // Update template next due date
          const nextDueDate = this.calculateNextDueDate(template.nextDueDate, template.recurrence);
          await prisma.recurringInvoiceTemplate.update({
            where: { id: template.id },
            data: { nextDueDate },
          });

          // Execute automation rules
          await automationService.executeRulesForTrigger('RECURRING_INVOICE_GENERATED', {
            template,
            invoice,
          }, organizationId);

          created++;
        } catch (error) {
          console.error(`Process recurring invoice error for template ${template.id}:`, error);
          errors++;
        }

        processed++;
      }

      return { processed, created, errors };
    } catch (error) {
      console.error('Process recurring invoices error:', error);
      throw new AppError('Failed to process recurring invoices', 500);
    }
  }

  /**
   * Create invoice from template
   */
  private async createInvoiceFromTemplate(template: RecurringInvoiceTemplate, organizationId: string): Promise<any> {
    const invoiceNumber = await this.generateInvoiceNumber(organizationId);

    const invoice = await prisma.invoice.create({
      data: {
        id: uuidv4(),
        organizationId,
        clientId: template.clientId,
        invoiceNumber,
        dueDate: template.nextDueDate,
        status: 'DRAFT',
        subtotal: template.subtotal,
        taxRate: template.taxRate,
        taxAmount: template.taxAmount,
        total: template.total,
        notes: template.description,
        items: template.items,
        isRecurring: true,
        recurringTemplateId: template.id,
      },
    });

    return invoice;
  }

  /**
   * Generate invoice number
   */
  private async generateInvoiceNumber(organizationId: string): Promise<string> {
    const count = await prisma.invoice.count({
      where: { organizationId },
    });

    return `INV-${String(count + 1).padStart(6, '0')}`;
  }

  /**
   * Calculate next due date
   */
  private calculateNextDueDate(currentDate: Date, recurrence: string): Date {
    const nextDate = new Date(currentDate);

    switch (recurrence) {
      case 'WEEKLY':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'MONTHLY':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'QUARTERLY':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'YEARLY':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        throw new AppError('Invalid recurrence pattern', 400);
    }

    return nextDate;
  }

  /**
   * Get recurring invoice history
   */
  async getRecurringInvoiceHistory(
    templateId: string,
    organizationId: string
  ): Promise<RecurringInvoice[]> {
    try {
      const recurringInvoices = await prisma.recurringInvoice.findMany({
        where: {
          templateId,
          organizationId,
        },
        include: {
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              total: true,
              status: true,
              dueDate: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return recurringInvoices;
    } catch (error) {
      console.error('Get recurring invoice history error:', error);
      throw new AppError('Failed to get recurring invoice history', 500);
    }
  }

  /**
   * Get recurring invoice statistics
   */
  async getRecurringInvoiceStats(organizationId: string): Promise<{
    totalTemplates: number;
    activeTemplates: number;
    totalGenerated: number;
    totalRevenue: number;
    byRecurrence: Record<string, number>;
  }> {
    try {
      const [
        totalTemplates,
        activeTemplates,
        totalGenerated,
        recurringInvoices,
      ] = await Promise.all([
        prisma.recurringInvoiceTemplate.count({ where: { organizationId } }),
        prisma.recurringInvoiceTemplate.count({ where: { organizationId, isActive: true } }),
        prisma.recurringInvoice.count({ where: { organizationId } }),
        prisma.recurringInvoice.findMany({
          where: { organizationId },
          include: { invoice: true },
        }),
      ]);

      const totalRevenue = recurringInvoices.reduce(
        (sum, ri) => sum + (ri.invoice?.total || 0),
        0
      );

      const byRecurrence: Record<string, number> = {};
      const templates = await prisma.recurringInvoiceTemplate.findMany({
        where: { organizationId },
        select: { recurrence: true },
      });

      templates.forEach(template => {
        byRecurrence[template.recurrence] = (byRecurrence[template.recurrence] || 0) + 1;
      });

      return {
        totalTemplates,
        activeTemplates,
        totalGenerated,
        totalRevenue,
        byRecurrence,
      };
    } catch (error) {
      console.error('Get recurring invoice stats error:', error);
      throw new AppError('Failed to get recurring invoice statistics', 500);
    }
  }

  /**
   * Pause recurring invoice template
   */
  async pauseTemplate(templateId: string, organizationId: string): Promise<void> {
    try {
      await prisma.recurringInvoiceTemplate.update({
        where: {
          id: templateId,
          organizationId,
        },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Pause recurring invoice template error:', error);
      throw new AppError('Failed to pause recurring invoice template', 500);
    }
  }

  /**
   * Resume recurring invoice template
   */
  async resumeTemplate(templateId: string, organizationId: string): Promise<void> {
    try {
      await prisma.recurringInvoiceTemplate.update({
        where: {
          id: templateId,
          organizationId,
        },
        data: {
          isActive: true,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Resume recurring invoice template error:', error);
      throw new AppError('Failed to resume recurring invoice template', 500);
    }
  }

  /**
   * Update template next due date
   */
  async updateNextDueDate(templateId: string, nextDueDate: Date, organizationId: string): Promise<void> {
    try {
      await prisma.recurringInvoiceTemplate.update({
        where: {
          id: templateId,
          organizationId,
        },
        data: {
          nextDueDate,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Update next due date error:', error);
      throw new AppError('Failed to update next due date', 500);
    }
  }
}

export default new RecurringInvoiceService();




