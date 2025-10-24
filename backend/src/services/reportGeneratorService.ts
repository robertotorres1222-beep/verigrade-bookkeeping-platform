import { PrismaClient } from '@prisma/client';
import { ReportField, ReportFilter, ReportGroupBy } from '../types/report';

const prisma = new PrismaClient();

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: ReportField[];
  filters: ReportFilter[];
  groupBy: ReportGroupBy[];
  orderBy: ReportGroupBy[];
  isPublic: boolean;
}

interface ReportExecution {
  id: string;
  reportBuilderId: string;
  executedAt: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  results?: any[];
  error?: string;
  format: 'json' | 'csv' | 'excel' | 'pdf';
  filePath?: string;
}

class ReportGeneratorService {
  private templates: ReportTemplate[] = [];

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Initialize built-in report templates
   */
  private initializeTemplates() {
    this.templates = [
      {
        id: 'profit-loss',
        name: 'Profit & Loss Statement',
        description: 'Standard P&L report showing revenue, expenses, and net profit',
        category: 'Financial',
        fields: [
          { name: 'Account', type: 'string', source: 'account.name' },
          { name: 'Amount', type: 'number', source: 'amount', aggregation: 'sum' },
          { name: 'Type', type: 'string', source: 'type' }
        ],
        filters: [],
        groupBy: [{ field: 'account.name', order: 'asc' }],
        orderBy: [{ field: 'amount', order: 'desc' }],
        isPublic: true
      },
      {
        id: 'cash-flow',
        name: 'Cash Flow Statement',
        description: 'Cash flow analysis showing money in and out',
        category: 'Financial',
        fields: [
          { name: 'Date', type: 'date', source: 'date' },
          { name: 'Inflow', type: 'number', source: 'amount', aggregation: 'sum' },
          { name: 'Outflow', type: 'number', source: 'amount', aggregation: 'sum' },
          { name: 'Net Flow', type: 'number', source: 'netAmount', aggregation: 'sum' }
        ],
        filters: [],
        groupBy: [{ field: 'date', order: 'asc' }],
        orderBy: [{ field: 'date', order: 'asc' }],
        isPublic: true
      },
      {
        id: 'customer-profitability',
        name: 'Customer Profitability Analysis',
        description: 'Analyze profitability by customer',
        category: 'Analytics',
        fields: [
          { name: 'Customer', type: 'string', source: 'customer.name' },
          { name: 'Revenue', type: 'number', source: 'revenue', aggregation: 'sum' },
          { name: 'Costs', type: 'number', source: 'costs', aggregation: 'sum' },
          { name: 'Profit', type: 'number', source: 'profit', aggregation: 'sum' },
          { name: 'Margin', type: 'number', source: 'margin', aggregation: 'avg' }
        ],
        filters: [],
        groupBy: [{ field: 'customer.name', order: 'asc' }],
        orderBy: [{ field: 'profit', order: 'desc' }],
        isPublic: true
      },
      {
        id: 'expense-breakdown',
        name: 'Expense Breakdown by Category',
        description: 'Detailed expense analysis by category',
        category: 'Expenses',
        fields: [
          { name: 'Category', type: 'string', source: 'category.name' },
          { name: 'Amount', type: 'number', source: 'amount', aggregation: 'sum' },
          { name: 'Count', type: 'number', source: 'id', aggregation: 'count' },
          { name: 'Average', type: 'number', source: 'amount', aggregation: 'avg' }
        ],
        filters: [{ field: 'type', operator: 'equals', value: 'expense' }],
        groupBy: [{ field: 'category.name', order: 'asc' }],
        orderBy: [{ field: 'amount', order: 'desc' }],
        isPublic: true
      },
      {
        id: 'tax-summary',
        name: 'Tax Summary Report',
        description: 'Tax-related transactions and calculations',
        category: 'Tax',
        fields: [
          { name: 'Tax Type', type: 'string', source: 'taxType' },
          { name: 'Amount', type: 'number', source: 'amount', aggregation: 'sum' },
          { name: 'Tax Rate', type: 'number', source: 'taxRate' },
          { name: 'Tax Amount', type: 'number', source: 'taxAmount', aggregation: 'sum' }
        ],
        filters: [{ field: 'taxable', operator: 'equals', value: true }],
        groupBy: [{ field: 'taxType', order: 'asc' }],
        orderBy: [{ field: 'taxAmount', order: 'desc' }],
        isPublic: true
      }
    ];
  }

  /**
   * Get all available templates
   */
  getTemplates(): ReportTemplate[] {
    return this.templates;
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: string): ReportTemplate[] {
    return this.templates.filter(template => template.category === category);
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): ReportTemplate | undefined {
    return this.templates.find(template => template.id === id);
  }

  /**
   * Create report from template
   */
  async createFromTemplate(templateId: string, organizationId: string, userId: string, customizations?: any) {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const reportBuilder = await prisma.reportBuilder.create({
      data: {
        name: customizations?.name || template.name,
        description: customizations?.description || template.description,
        fields: JSON.stringify(template.fields),
        filters: JSON.stringify(template.filters),
        groupBy: JSON.stringify(template.groupBy),
        orderBy: JSON.stringify(template.orderBy),
        isTemplate: false,
        isPublic: false,
        organizationId,
        createdBy: userId
      }
    });

    return reportBuilder;
  }

  /**
   * Execute report builder
   */
  async executeReport(reportBuilderId: string, organizationId: string, options: any = {}) {
    const reportBuilder = await prisma.reportBuilder.findFirst({
      where: {
        id: reportBuilderId,
        organizationId
      }
    });

    if (!reportBuilder) {
      throw new Error('Report builder not found');
    }

    const fields = JSON.parse(reportBuilder.fields);
    const filters = JSON.parse(reportBuilder.filters);
    const groupBy = JSON.parse(reportBuilder.groupBy);
    const orderBy = JSON.parse(reportBuilder.orderBy);

    // Create execution record
    const execution = await prisma.reportExecution.create({
      data: {
        reportBuilderId,
        status: 'running',
        format: options.format || 'json',
        executedAt: new Date(),
        organizationId
      }
    });

    try {
      // Build and execute query
      const query = this.buildQuery(fields, filters, groupBy, orderBy, organizationId, options);
      const results = await this.executeQuery(query);

      // Update execution with results
      await prisma.reportExecution.update({
        where: { id: execution.id },
        data: {
          status: 'completed',
          results: JSON.stringify(results)
        }
      });

      return {
        execution,
        results,
        totalCount: results.length
      };
    } catch (error) {
      // Update execution with error
      await prisma.reportExecution.update({
        where: { id: execution.id },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      throw error;
    }
  }

  /**
   * Schedule report execution
   */
  async scheduleReport(reportBuilderId: string, schedule: any, recipients: string[], format: string, organizationId: string, userId: string) {
    const scheduledReport = await prisma.scheduledReport.create({
      data: {
        reportBuilderId,
        schedule: JSON.stringify(schedule),
        recipients: JSON.stringify(recipients),
        format,
        isActive: true,
        organizationId,
        createdBy: userId
      }
    });

    return scheduledReport;
  }

  /**
   * Get scheduled reports
   */
  async getScheduledReports(organizationId: string) {
    return await prisma.scheduledReport.findMany({
      where: {
        organizationId,
        isActive: true
      },
      include: {
        reportBuilder: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });
  }

  /**
   * Execute scheduled reports
   */
  async executeScheduledReports() {
    const scheduledReports = await prisma.scheduledReport.findMany({
      where: {
        isActive: true
      },
      include: {
        reportBuilder: true
      }
    });

    for (const scheduledReport of scheduledReports) {
      try {
        await this.executeReport(
          scheduledReport.reportBuilderId,
          scheduledReport.organizationId,
          {
            format: scheduledReport.format,
            schedule: true
          }
        );

        // Send email to recipients
        await this.sendReportEmail(scheduledReport);
      } catch (error) {
        console.error(`Failed to execute scheduled report ${scheduledReport.id}:`, error);
      }
    }
  }

  /**
   * Build SQL query from report configuration
   */
  private buildQuery(fields: ReportField[], filters: ReportFilter[], groupBy: ReportGroupBy[], orderBy: ReportGroupBy[], organizationId: string, options: any) {
    let query = `
      SELECT 
        ${fields.map(field => {
          if (field.aggregation) {
            return `${field.aggregation.toUpperCase()}(${field.source}) as ${field.name}`;
          }
          return `${field.source} as ${field.name}`;
        }).join(', ')}
      FROM transactions t
      LEFT JOIN accounts a ON t.accountId = a.id
      LEFT JOIN categories c ON t.categoryId = c.id
      LEFT JOIN customers cu ON t.customerId = cu.id
      WHERE t.organizationId = '${organizationId}'
    `;

    // Add filters
    if (filters && filters.length > 0) {
      const filterConditions = filters.map(filter => {
        const field = filter.field.includes('.') ? filter.field : `t.${filter.field}`;
        
        switch (filter.operator) {
          case 'equals':
            return `${field} = '${filter.value}'`;
          case 'not_equals':
            return `${field} != '${filter.value}'`;
          case 'contains':
            return `${field} LIKE '%${filter.value}%'`;
          case 'not_contains':
            return `${field} NOT LIKE '%${filter.value}%'`;
          case 'greater_than':
            return `${field} > ${filter.value}`;
          case 'less_than':
            return `${field} < ${filter.value}`;
          case 'between':
            return `${field} BETWEEN ${filter.value} AND ${filter.value2}`;
          case 'in':
            return `${field} IN (${filter.value.map((v: any) => `'${v}'`).join(', ')})`;
          case 'not_in':
            return `${field} NOT IN (${filter.value.map((v: any) => `'${v}'`).join(', ')})`;
          default:
            return '';
        }
      }).filter(condition => condition);

      if (filterConditions.length > 0) {
        query += ` AND ${filterConditions.join(' AND ')}`;
      }
    }

    // Add date range filter if provided
    if (options.startDate && options.endDate) {
      query += ` AND t.date BETWEEN '${options.startDate}' AND '${options.endDate}'`;
    }

    // Add group by
    if (groupBy && groupBy.length > 0) {
      query += ` GROUP BY ${groupBy.map(gb => gb.field).join(', ')}`;
    }

    // Add order by
    if (orderBy && orderBy.length > 0) {
      query += ` ORDER BY ${orderBy.map(ob => `${ob.field} ${ob.order}`).join(', ')}`;
    }

    // Add limit
    if (options.limit) {
      query += ` LIMIT ${options.limit}`;
    }

    return query;
  }

  /**
   * Execute SQL query
   */
  private async executeQuery(query: string) {
    // This would execute the actual query against the database
    // For now, return mock data
    return [
      { Account: 'Sales', Amount: 10000, Type: 'Revenue' },
      { Account: 'Cost of Goods Sold', Amount: 6000, Type: 'Expense' },
      { Account: 'Marketing', Amount: 2000, Type: 'Expense' },
      { Account: 'Net Profit', Amount: 2000, Type: 'Profit' }
    ];
  }

  /**
   * Send report via email
   */
  private async sendReportEmail(scheduledReport: any) {
    // This would integrate with an email service
    console.log(`Sending report ${scheduledReport.id} to ${scheduledReport.recipients}`);
  }

  /**
   * Export report to different formats
   */
  async exportReport(results: any[], format: string, reportName: string) {
    switch (format) {
      case 'csv':
        return this.exportToCSV(results);
      case 'excel':
        return this.exportToExcel(results, reportName);
      case 'pdf':
        return this.exportToPDF(results, reportName);
      default:
        return results;
    }
  }

  private exportToCSV(results: any[]): string {
    if (results.length === 0) return '';
    
    const headers = Object.keys(results[0]).join(',');
    const rows = results.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
  }

  private exportToExcel(results: any[], reportName: string): any {
    // This would generate Excel format using a library like xlsx
    return {
      format: 'excel',
      reportName,
      data: results,
      generatedAt: new Date()
    };
  }

  private exportToPDF(results: any[], reportName: string): any {
    // This would generate PDF format using a library like puppeteer or jsPDF
    return {
      format: 'pdf',
      reportName,
      data: results,
      generatedAt: new Date()
    };
  }
}

export default new ReportGeneratorService();
