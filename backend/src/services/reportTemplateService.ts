import { prisma } from '../lib/prisma';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  query: string;
  parameters: Record<string, any>;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
  };
  delivery: {
    email: boolean;
    dashboard: boolean;
    webhook?: string;
  };
  isPublic: boolean;
  createdBy: string;
  organizationId: string;
}

interface ReportExecution {
  id: string;
  templateId: string;
  executedAt: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  parameters: Record<string, any>;
  result?: any;
  error?: string;
}

class ReportTemplateService {
  /**
   * Create a new report template
   */
  async createTemplate(data: Omit<ReportTemplate, 'id'>): Promise<ReportTemplate> {
    const template = await prisma.reportTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        query: data.query,
        parameters: data.parameters,
        schedule: data.schedule,
        delivery: data.delivery,
        isPublic: data.isPublic,
        createdBy: data.createdBy,
        organizationId: data.organizationId,
      },
    });

    return template as ReportTemplate;
  }

  /**
   * Get all templates for an organization
   */
  async getTemplates(organizationId: string, includePublic: boolean = true): Promise<ReportTemplate[]> {
    const where: any = {
      OR: [
        { organizationId },
        ...(includePublic ? [{ isPublic: true }] : []),
      ],
    };

    const templates = await prisma.reportTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return templates as ReportTemplate[];
  }

  /**
   * Get template by ID
   */
  async getTemplate(id: string): Promise<ReportTemplate | null> {
    const template = await prisma.reportTemplate.findUnique({
      where: { id },
    });

    return template as ReportTemplate | null;
  }

  /**
   * Update template
   */
  async updateTemplate(id: string, data: Partial<ReportTemplate>): Promise<ReportTemplate> {
    const template = await prisma.reportTemplate.update({
      where: { id },
      data,
    });

    return template as ReportTemplate;
  }

  /**
   * Delete template
   */
  async deleteTemplate(id: string): Promise<void> {
    await prisma.reportTemplate.delete({
      where: { id },
    });
  }

  /**
   * Execute a report template
   */
  async executeTemplate(templateId: string, parameters: Record<string, any>): Promise<ReportExecution> {
    const template = await this.getTemplate(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Create execution record
    const execution = await prisma.reportExecution.create({
      data: {
        templateId,
        parameters,
        status: 'running',
        executedAt: new Date(),
      },
    });

    try {
      // Execute the query with parameters
      const result = await this.executeQuery(template.query, parameters);
      
      // Update execution with result
      await prisma.reportExecution.update({
        where: { id: execution.id },
        data: {
          status: 'completed',
          result,
        },
      });

      return {
        ...execution,
        status: 'completed',
        result,
      } as ReportExecution;
    } catch (error) {
      // Update execution with error
      await prisma.reportExecution.update({
        where: { id: execution.id },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  /**
   * Execute SQL query with parameters
   */
  private async executeQuery(query: string, parameters: Record<string, any>): Promise<any> {
    // Replace parameters in query
    let processedQuery = query;
    Object.entries(parameters).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      const sqlValue = typeof value === 'string' ? `'${value}'` : value;
      processedQuery = processedQuery.replace(new RegExp(placeholder, 'g'), sqlValue);
    });

    // Execute query using Prisma raw query
    const result = await prisma.$queryRawUnsafe(processedQuery);
    return result;
  }

  /**
   * Get scheduled templates that need to be executed
   */
  async getScheduledTemplates(): Promise<ReportTemplate[]> {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();
    const currentDate = now.getDate();

    const templates = await prisma.reportTemplate.findMany({
      where: {
        schedule: {
          not: null,
        },
      },
    });

    return templates.filter(template => {
      if (!template.schedule) return false;

      const schedule = template.schedule as any;
      const [scheduleHour] = schedule.time.split(':').map(Number);

      // Check if it's time to execute
      if (scheduleHour !== currentHour) return false;

      switch (schedule.frequency) {
        case 'daily':
          return true;
        case 'weekly':
          return schedule.dayOfWeek === currentDay;
        case 'monthly':
          return schedule.dayOfMonth === currentDate;
        case 'quarterly':
          return schedule.dayOfMonth === currentDate && 
                 [0, 3, 6, 9].includes(now.getMonth());
        default:
          return false;
      }
    }) as ReportTemplate[];
  }

  /**
   * Get execution history for a template
   */
  async getExecutionHistory(templateId: string, limit: number = 50): Promise<ReportExecution[]> {
    const executions = await prisma.reportExecution.findMany({
      where: { templateId },
      orderBy: { executedAt: 'desc' },
      take: limit,
    });

    return executions as ReportExecution[];
  }

  /**
   * Get predefined templates
   */
  getPredefinedTemplates(): ReportTemplate[] {
    return [
      {
        id: 'profit-loss',
        name: 'Profit & Loss Statement',
        description: 'Standard P&L report showing revenue, expenses, and net income',
        category: 'Financial',
        query: `
          SELECT 
            DATE_TRUNC('month', date) as period,
            SUM(CASE WHEN transactionType = 'income' THEN amount ELSE 0 END) as revenue,
            SUM(CASE WHEN transactionType = 'expense' THEN amount ELSE 0 END) as expenses,
            SUM(CASE WHEN transactionType = 'income' THEN amount ELSE -amount END) as net_income
          FROM transactions 
          WHERE organizationId = '{organizationId}'
            AND date >= '{startDate}' 
            AND date <= '{endDate}'
          GROUP BY DATE_TRUNC('month', date)
          ORDER BY period
        `,
        parameters: {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
        delivery: {
          email: true,
          dashboard: true,
        },
        isPublic: true,
        createdBy: 'system',
        organizationId: 'system',
      },
      {
        id: 'balance-sheet',
        name: 'Balance Sheet',
        description: 'Assets, liabilities, and equity summary',
        category: 'Financial',
        query: `
          SELECT 
            'Assets' as category,
            SUM(amount) as total
          FROM transactions 
          WHERE organizationId = '{organizationId}'
            AND transactionType = 'income'
            AND date <= '{endDate}'
          UNION ALL
          SELECT 
            'Liabilities' as category,
            SUM(amount) as total
          FROM transactions 
          WHERE organizationId = '{organizationId}'
            AND transactionType = 'expense'
            AND date <= '{endDate}'
        `,
        parameters: {
          endDate: '2024-12-31',
        },
        delivery: {
          email: true,
          dashboard: true,
        },
        isPublic: true,
        createdBy: 'system',
        organizationId: 'system',
      },
      {
        id: 'cash-flow',
        name: 'Cash Flow Statement',
        description: 'Cash inflows and outflows by category',
        category: 'Financial',
        query: `
          SELECT 
            category,
            SUM(CASE WHEN transactionType = 'income' THEN amount ELSE 0 END) as inflows,
            SUM(CASE WHEN transactionType = 'expense' THEN amount ELSE 0 END) as outflows,
            SUM(CASE WHEN transactionType = 'income' THEN amount ELSE -amount END) as net_cash_flow
          FROM transactions 
          WHERE organizationId = '{organizationId}'
            AND date >= '{startDate}' 
            AND date <= '{endDate}'
          GROUP BY category
          ORDER BY net_cash_flow DESC
        `,
        parameters: {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
        delivery: {
          email: true,
          dashboard: true,
        },
        isPublic: true,
        createdBy: 'system',
        organizationId: 'system',
      },
    ];
  }
}

export default new ReportTemplateService();

