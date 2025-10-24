import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class RecurringService {
  /**
   * Create recurring template
   */
  async createRecurringTemplate(companyId: string, templateData: any): Promise<any> {
    try {
      const template = await prisma.recurringTemplate.create({
        data: {
          companyId,
          templateName: templateData.templateName,
          templateDescription: templateData.templateDescription,
          templateType: templateData.templateType, // 'invoice', 'expense', 'payment'
          templateData: JSON.stringify(templateData.templateData),
          recurrencePattern: templateData.recurrencePattern, // 'daily', 'weekly', 'monthly', 'yearly', 'custom'
          recurrenceInterval: templateData.recurrenceInterval || 1,
          recurrenceDays: JSON.stringify(templateData.recurrenceDays || []),
          recurrenceDayOfMonth: templateData.recurrenceDayOfMonth,
          recurrenceDayOfWeek: templateData.recurrenceDayOfWeek,
          recurrenceMonth: templateData.recurrenceMonth,
          startDate: new Date(templateData.startDate),
          endDate: templateData.endDate ? new Date(templateData.endDate) : null,
          isActive: templateData.isActive !== false,
          createdBy: templateData.createdBy,
          createdAt: new Date()
        }
      });

      return template;
    } catch (error) {
      logger.error('Error creating recurring template:', error);
      throw error;
    }
  }

  /**
   * Update recurring template
   */
  async updateRecurringTemplate(templateId: string, companyId: string, updateData: any): Promise<any> {
    try {
      const template = await prisma.recurringTemplate.update({
        where: { 
          id: templateId,
          companyId 
        },
        data: {
          ...updateData,
          updatedAt: new Date()
        }
      });

      return template;
    } catch (error) {
      logger.error('Error updating recurring template:', error);
      throw error;
    }
  }

  /**
   * Delete recurring template
   */
  async deleteRecurringTemplate(templateId: string, companyId: string): Promise<any> {
    try {
      const template = await prisma.recurringTemplate.delete({
        where: { 
          id: templateId,
          companyId 
        }
      });

      return template;
    } catch (error) {
      logger.error('Error deleting recurring template:', error);
      throw error;
    }
  }

  /**
   * Get recurring templates
   */
  async getRecurringTemplates(companyId: string): Promise<any> {
    try {
      const templates = await prisma.recurringTemplate.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' }
      });

      return templates;
    } catch (error) {
      logger.error('Error getting recurring templates:', error);
      throw error;
    }
  }

  /**
   * Generate recurring items
   */
  async generateRecurringItems(companyId: string): Promise<any> {
    try {
      const templates = await prisma.recurringTemplate.findMany({
        where: { 
          companyId,
          isActive: true
        }
      });

      const generationResult = {
        totalTemplates: templates.length,
        generatedItems: 0,
        skippedItems: 0,
        errors: []
      };

      for (const template of templates) {
        try {
          const shouldGenerate = this.shouldGenerateItem(template);
          
          if (shouldGenerate) {
            const generatedItem = await this.generateItemFromTemplate(template, companyId);
            generationResult.generatedItems++;
            
            // Update last generated date
            await prisma.recurringTemplate.update({
              where: { id: template.id },
              data: { lastGeneratedAt: new Date() }
            });
          } else {
            generationResult.skippedItems++;
          }
        } catch (error) {
          logger.error('Error generating item from template:', error);
          generationResult.errors.push({
            templateId: template.id,
            templateName: template.templateName,
            error: error.message
          });
        }
      }

      // Save generation log
      await this.saveGenerationLog(companyId, generationResult);

      return generationResult;
    } catch (error) {
      logger.error('Error generating recurring items:', error);
      throw error;
    }
  }

  /**
   * Check if item should be generated
   */
  private shouldGenerateItem(template: any): boolean {
    const now = new Date();
    const lastGenerated = template.lastGeneratedAt ? new Date(template.lastGeneratedAt) : null;
    
    // Check if template has ended
    if (template.endDate && new Date(template.endDate) < now) {
      return false;
    }

    // Check if template has started
    if (new Date(template.startDate) > now) {
      return false;
    }

    // Check recurrence pattern
    switch (template.recurrencePattern) {
      case 'daily':
        return this.shouldGenerateDaily(template, lastGenerated);
      case 'weekly':
        return this.shouldGenerateWeekly(template, lastGenerated);
      case 'monthly':
        return this.shouldGenerateMonthly(template, lastGenerated);
      case 'yearly':
        return this.shouldGenerateYearly(template, lastGenerated);
      case 'custom':
        return this.shouldGenerateCustom(template, lastGenerated);
      default:
        return false;
    }
  }

  /**
   * Check daily generation
   */
  private shouldGenerateDaily(template: any, lastGenerated: Date | null): boolean {
    if (!lastGenerated) return true;
    
    const daysSinceLastGenerated = Math.floor(
      (Date.now() - lastGenerated.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return daysSinceLastGenerated >= template.recurrenceInterval;
  }

  /**
   * Check weekly generation
   */
  private shouldGenerateWeekly(template: any, lastGenerated: Date | null): boolean {
    if (!lastGenerated) return true;
    
    const weeksSinceLastGenerated = Math.floor(
      (Date.now() - lastGenerated.getTime()) / (1000 * 60 * 60 * 24 * 7)
    );
    
    return weeksSinceLastGenerated >= template.recurrenceInterval;
  }

  /**
   * Check monthly generation
   */
  private shouldGenerateMonthly(template: any, lastGenerated: Date | null): boolean {
    if (!lastGenerated) return true;
    
    const now = new Date();
    const lastGeneratedDate = new Date(lastGenerated);
    
    // Check if we're past the recurrence day of month
    if (template.recurrenceDayOfMonth) {
      return now.getDate() >= template.recurrenceDayOfMonth && 
             (lastGeneratedDate.getMonth() < now.getMonth() || 
              lastGeneratedDate.getFullYear() < now.getFullYear());
    }
    
    // Check interval
    const monthsSinceLastGenerated = (now.getFullYear() - lastGeneratedDate.getFullYear()) * 12 + 
                                   (now.getMonth() - lastGeneratedDate.getMonth());
    
    return monthsSinceLastGenerated >= template.recurrenceInterval;
  }

  /**
   * Check yearly generation
   */
  private shouldGenerateYearly(template: any, lastGenerated: Date | null): boolean {
    if (!lastGenerated) return true;
    
    const yearsSinceLastGenerated = Math.floor(
      (Date.now() - lastGenerated.getTime()) / (1000 * 60 * 60 * 24 * 365)
    );
    
    return yearsSinceLastGenerated >= template.recurrenceInterval;
  }

  /**
   * Check custom generation
   */
  private shouldGenerateCustom(template: any, lastGenerated: Date | null): boolean {
    if (!lastGenerated) return true;
    
    // This would implement custom logic based on template configuration
    // For now, return true if it's been more than the interval days
    const daysSinceLastGenerated = Math.floor(
      (Date.now() - lastGenerated.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return daysSinceLastGenerated >= template.recurrenceInterval;
  }

  /**
   * Generate item from template
   */
  private async generateItemFromTemplate(template: any, companyId: string): Promise<any> {
    try {
      const templateData = JSON.parse(template.templateData);
      
      // Create the item based on template type
      switch (template.templateType) {
        case 'invoice':
          return await this.generateInvoice(templateData, companyId);
        case 'expense':
          return await this.generateExpense(templateData, companyId);
        case 'payment':
          return await this.generatePayment(templateData, companyId);
        default:
          throw new Error(`Unknown template type: ${template.templateType}`);
      }
    } catch (error) {
      logger.error('Error generating item from template:', error);
      throw error;
    }
  }

  /**
   * Generate invoice from template
   */
  private async generateInvoice(templateData: any, companyId: string): Promise<any> {
    try {
      const invoice = await prisma.invoice.create({
        data: {
          companyId,
          invoiceNumber: await this.generateInvoiceNumber(companyId),
          customerId: templateData.customerId,
          amount: templateData.amount,
          description: templateData.description,
          dueDate: new Date(Date.now() + (templateData.dueDays || 30) * 24 * 60 * 60 * 1000),
          status: 'draft',
          isRecurring: true,
          recurringTemplateId: templateData.templateId,
          createdAt: new Date()
        }
      });

      return invoice;
    } catch (error) {
      logger.error('Error generating invoice:', error);
      throw error;
    }
  }

  /**
   * Generate expense from template
   */
  private async generateExpense(templateData: any, companyId: string): Promise<any> {
    try {
      const expense = await prisma.expense.create({
        data: {
          companyId,
          amount: templateData.amount,
          description: templateData.description,
          category: templateData.category,
          vendorId: templateData.vendorId,
          employeeId: templateData.employeeId,
          departmentId: templateData.departmentId,
          projectId: templateData.projectId,
          isRecurring: true,
          recurringTemplateId: templateData.templateId,
          createdAt: new Date()
        }
      });

      return expense;
    } catch (error) {
      logger.error('Error generating expense:', error);
      throw error;
    }
  }

  /**
   * Generate payment from template
   */
  private async generatePayment(templateData: any, companyId: string): Promise<any> {
    try {
      const payment = await prisma.payment.create({
        data: {
          companyId,
          amount: templateData.amount,
          description: templateData.description,
          paymentMethod: templateData.paymentMethod,
          vendorId: templateData.vendorId,
          customerId: templateData.customerId,
          isRecurring: true,
          recurringTemplateId: templateData.templateId,
          createdAt: new Date()
        }
      });

      return payment;
    } catch (error) {
      logger.error('Error generating payment:', error);
      throw error;
    }
  }

  /**
   * Generate invoice number
   */
  private async generateInvoiceNumber(companyId: string): Promise<string> {
    try {
      const lastInvoice = await prisma.invoice.findFirst({
        where: { companyId },
        orderBy: { createdAt: 'desc' }
      });

      const lastNumber = lastInvoice ? parseInt(lastInvoice.invoiceNumber) || 0 : 0;
      return (lastNumber + 1).toString().padStart(6, '0');
    } catch (error) {
      logger.error('Error generating invoice number:', error);
      return Date.now().toString();
    }
  }

  /**
   * Save generation log
   */
  private async saveGenerationLog(companyId: string, generationResult: any): Promise<any> {
    try {
      const log = await prisma.recurringGenerationLog.create({
        data: {
          companyId,
          totalTemplates: generationResult.totalTemplates,
          generatedItems: generationResult.generatedItems,
          skippedItems: generationResult.skippedItems,
          errors: JSON.stringify(generationResult.errors),
          generatedAt: new Date()
        }
      });

      return log;
    } catch (error) {
      logger.error('Error saving generation log:', error);
      throw error;
    }
  }

  /**
   * Get recurring dashboard
   */
  async getRecurringDashboard(companyId: string): Promise<any> {
    try {
      const [
        templateStats,
        recentTemplates,
        generationLogs,
        upcomingItems
      ] = await Promise.all([
        this.getTemplateStats(companyId),
        this.getRecentTemplates(companyId),
        this.getGenerationLogs(companyId),
        this.getUpcomingItems(companyId)
      ]);

      return {
        templateStats,
        recentTemplates,
        generationLogs,
        upcomingItems
      };
    } catch (error) {
      logger.error('Error getting recurring dashboard:', error);
      throw error;
    }
  }

  /**
   * Get template statistics
   */
  private async getTemplateStats(companyId: string): Promise<any> {
    try {
      const stats = await prisma.$queryRaw`
        SELECT 
          COUNT(*) as total_templates,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_templates,
          COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_templates,
          COUNT(CASE WHEN template_type = 'invoice' THEN 1 END) as invoice_templates,
          COUNT(CASE WHEN template_type = 'expense' THEN 1 END) as expense_templates,
          COUNT(CASE WHEN template_type = 'payment' THEN 1 END) as payment_templates,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_templates
        FROM recurring_templates
        WHERE company_id = ${companyId}
      `;

      return stats[0];
    } catch (error) {
      logger.error('Error getting template stats:', error);
      throw error;
    }
  }

  /**
   * Get recent templates
   */
  private async getRecentTemplates(companyId: string): Promise<any> {
    try {
      const templates = await prisma.recurringTemplate.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      return templates;
    } catch (error) {
      logger.error('Error getting recent templates:', error);
      return [];
    }
  }

  /**
   * Get generation logs
   */
  private async getGenerationLogs(companyId: string): Promise<any> {
    try {
      const logs = await prisma.recurringGenerationLog.findMany({
        where: { companyId },
        orderBy: { generatedAt: 'desc' },
        take: 10
      });

      return logs;
    } catch (error) {
      logger.error('Error getting generation logs:', error);
      return [];
    }
  }

  /**
   * Get upcoming items
   */
  private async getUpcomingItems(companyId: string): Promise<any> {
    try {
      const templates = await prisma.recurringTemplate.findMany({
        where: { 
          companyId,
          isActive: true
        }
      });

      const upcomingItems = [];

      for (const template of templates) {
        const nextGeneration = this.calculateNextGeneration(template);
        if (nextGeneration) {
          upcomingItems.push({
            templateId: template.id,
            templateName: template.templateName,
            templateType: template.templateType,
            nextGeneration: nextGeneration,
            daysUntilNext: Math.ceil((nextGeneration.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          });
        }
      }

      return upcomingItems.sort((a, b) => a.nextGeneration - b.nextGeneration);
    } catch (error) {
      logger.error('Error getting upcoming items:', error);
      return [];
    }
  }

  /**
   * Calculate next generation date
   */
  private calculateNextGeneration(template: any): Date | null {
    const now = new Date();
    const lastGenerated = template.lastGeneratedAt ? new Date(template.lastGeneratedAt) : new Date(template.startDate);
    
    switch (template.recurrencePattern) {
      case 'daily':
        return new Date(lastGenerated.getTime() + template.recurrenceInterval * 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(lastGenerated.getTime() + template.recurrenceInterval * 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        const nextMonth = new Date(lastGenerated);
        nextMonth.setMonth(nextMonth.getMonth() + template.recurrenceInterval);
        return nextMonth;
      case 'yearly':
        const nextYear = new Date(lastGenerated);
        nextYear.setFullYear(nextYear.getFullYear() + template.recurrenceInterval);
        return nextYear;
      default:
        return null;
    }
  }

  /**
   * Get recurring analytics
   */
  async getRecurringAnalytics(companyId: string): Promise<any> {
    try {
      const analytics = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', generated_at) as month,
          COUNT(*) as generation_runs,
          SUM(generated_items) as total_generated,
          SUM(skipped_items) as total_skipped,
          AVG(generated_items::float / NULLIF(total_templates, 0)) as avg_generation_rate
        FROM recurring_generation_logs
        WHERE company_id = ${companyId}
        AND generated_at >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', generated_at)
        ORDER BY month DESC
      `;

      return analytics;
    } catch (error) {
      logger.error('Error getting recurring analytics:', error);
      return [];
    }
  }
}