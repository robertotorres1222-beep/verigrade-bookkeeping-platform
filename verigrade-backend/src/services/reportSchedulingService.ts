import { PrismaClient } from '@prisma/client';
import { ReportTemplate, ScheduledReport } from '@prisma/client';
import cron from 'node-cron';
import nodemailer from 'nodemailer';
import { ReportGeneratorService } from './reportGeneratorService';

export class ReportSchedulingService {
  private prisma: PrismaClient;
  private reportGenerator: ReportGeneratorService;
  private emailTransporter: nodemailer.Transporter;
  private scheduledJobs: Map<string, cron.ScheduledTask> = new Map();

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.reportGenerator = new ReportGeneratorService(prisma);
    
    // Initialize email transporter
    this.emailTransporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Create a new report template
   */
  async createTemplate(data: {
    name: string;
    description: string;
    category: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'manual';
    query: string;
    parameters: any;
    organizationId: string;
    createdBy: string;
  }): Promise<ReportTemplate> {
    const template = await this.prisma.reportTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        frequency: data.frequency,
        query: data.query,
        parameters: data.parameters,
        organizationId: data.organizationId,
        createdBy: data.createdBy,
        isActive: true,
      },
    });

    return template;
  }

  /**
   * Update an existing report template
   */
  async updateTemplate(
    templateId: string,
    data: Partial<{
      name: string;
      description: string;
      category: string;
      frequency: string;
      query: string;
      parameters: any;
      isActive: boolean;
    }>
  ): Promise<ReportTemplate> {
    const template = await this.prisma.reportTemplate.update({
      where: { id: templateId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    // If frequency changed, reschedule the report
    if (data.frequency) {
      await this.rescheduleReport(templateId);
    }

    return template;
  }

  /**
   * Delete a report template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    // Cancel any scheduled jobs for this template
    await this.cancelScheduledReport(templateId);

    // Delete the template
    await this.prisma.reportTemplate.delete({
      where: { id: templateId },
    });
  }

  /**
   * Get all templates for an organization
   */
  async getTemplates(organizationId: string): Promise<ReportTemplate[]> {
    return this.prisma.reportTemplate.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Create a scheduled report
   */
  async createScheduledReport(data: {
    templateId: string;
    frequency: string;
    recipients: string[];
    organizationId: string;
    createdBy: string;
    scheduleTime?: string; // Cron expression or time
  }): Promise<ScheduledReport> {
    const scheduledReport = await this.prisma.scheduledReport.create({
      data: {
        templateId: data.templateId,
        frequency: data.frequency,
        recipients: data.recipients,
        organizationId: data.organizationId,
        createdBy: data.createdBy,
        isActive: true,
        nextRun: this.calculateNextRun(data.frequency, data.scheduleTime),
      },
    });

    // Schedule the report execution
    await this.scheduleReport(scheduledReport.id);

    return scheduledReport;
  }

  /**
   * Update a scheduled report
   */
  async updateScheduledReport(
    scheduledReportId: string,
    data: Partial<{
      frequency: string;
      recipients: string[];
      isActive: boolean;
      scheduleTime: string;
    }>
  ): Promise<ScheduledReport> {
    const scheduledReport = await this.prisma.scheduledReport.update({
      where: { id: scheduledReportId },
      data: {
        ...data,
        nextRun: data.frequency ? this.calculateNextRun(data.frequency, data.scheduleTime) : undefined,
        updatedAt: new Date(),
      },
    });

    // Reschedule the report
    await this.rescheduleReport(scheduledReport.templateId);

    return scheduledReport;
  }

  /**
   * Cancel a scheduled report
   */
  async cancelScheduledReport(templateId: string): Promise<void> {
    const job = this.scheduledJobs.get(templateId);
    if (job) {
      job.stop();
      this.scheduledJobs.delete(templateId);
    }

    await this.prisma.scheduledReport.updateMany({
      where: { templateId },
      data: { isActive: false },
    });
  }

  /**
   * Get all scheduled reports for an organization
   */
  async getScheduledReports(organizationId: string): Promise<ScheduledReport[]> {
    return this.prisma.scheduledReport.findMany({
      where: { organizationId },
      include: {
        template: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Execute a report immediately
   */
  async executeReport(templateId: string, userId: string): Promise<{
    reportData: any;
    reportUrl: string;
  }> {
    const template = await this.prisma.reportTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error('Report template not found');
    }

    // Generate the report
    const reportData = await this.reportGenerator.generateReport({
      query: template.query,
      parameters: template.parameters,
      organizationId: template.organizationId,
    });

    // Save the report execution
    const execution = await this.prisma.reportExecution.create({
      data: {
        templateId,
        executedBy: userId,
        status: 'completed',
        parameters: template.parameters,
        result: reportData,
        executedAt: new Date(),
      },
    });

    return {
      reportData,
      reportUrl: `/reports/executions/${execution.id}`,
    };
  }

  /**
   * Schedule a report for automatic execution
   */
  private async scheduleReport(scheduledReportId: string): Promise<void> {
    const scheduledReport = await this.prisma.scheduledReport.findUnique({
      where: { id: scheduledReportId },
      include: { template: true },
    });

    if (!scheduledReport || !scheduledReport.isActive) {
      return;
    }

    const cronExpression = this.getCronExpression(scheduledReport.frequency);
    
    const job = cron.schedule(cronExpression, async () => {
      await this.executeScheduledReport(scheduledReportId);
    }, {
      scheduled: false,
    });

    this.scheduledJobs.set(scheduledReport.templateId, job);
    job.start();
  }

  /**
   * Execute a scheduled report
   */
  private async executeScheduledReport(scheduledReportId: string): Promise<void> {
    try {
      const scheduledReport = await this.prisma.scheduledReport.findUnique({
        where: { id: scheduledReportId },
        include: { template: true },
      });

      if (!scheduledReport || !scheduledReport.isActive) {
        return;
      }

      // Generate the report
      const reportData = await this.reportGenerator.generateReport({
        query: scheduledReport.template.query,
        parameters: scheduledReport.template.parameters,
        organizationId: scheduledReport.organizationId,
      });

      // Save the execution
      await this.prisma.reportExecution.create({
        data: {
          templateId: scheduledReport.templateId,
          executedBy: scheduledReport.createdBy,
          status: 'completed',
          parameters: scheduledReport.template.parameters,
          result: reportData,
          executedAt: new Date(),
        },
      });

      // Send email to recipients
      await this.sendReportEmail(scheduledReport, reportData);

      // Update next run time
      const nextRun = this.calculateNextRun(scheduledReport.frequency);
      await this.prisma.scheduledReport.update({
        where: { id: scheduledReportId },
        data: { 
          lastRun: new Date(),
          nextRun,
        },
      });

    } catch (error) {
      console.error('Error executing scheduled report:', error);
      
      // Log the error
      await this.prisma.reportExecution.create({
        data: {
          templateId: scheduledReportId,
          executedBy: 'system',
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          executedAt: new Date(),
        },
      });
    }
  }

  /**
   * Send report via email
   */
  private async sendReportEmail(
    scheduledReport: ScheduledReport & { template: ReportTemplate },
    reportData: any
  ): Promise<void> {
    const htmlContent = this.generateReportHTML(scheduledReport.template, reportData);
    
    await this.emailTransporter.sendMail({
      from: process.env.SMTP_FROM,
      to: scheduledReport.recipients.join(', '),
      subject: `Scheduled Report: ${scheduledReport.template.name}`,
      html: htmlContent,
      attachments: [
        {
          filename: `${scheduledReport.template.name}.pdf`,
          content: await this.generateReportPDF(reportData),
        },
      ],
    });
  }

  /**
   * Generate HTML content for email
   */
  private generateReportHTML(template: ReportTemplate, reportData: any): string {
    return `
      <html>
        <body>
          <h2>${template.name}</h2>
          <p>${template.description}</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <div>
            ${this.formatReportData(reportData)}
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Format report data for display
   */
  private formatReportData(data: any): string {
    if (Array.isArray(data)) {
      return `
        <table border="1" style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr>
              ${Object.keys(data[0] || {}).map(key => `<th>${key}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${Object.values(row).map(value => `<td>${value}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }
    
    return `<pre>${JSON.stringify(data, null, 2)}</pre>`;
  }

  /**
   * Generate PDF from report data
   */
  private async generateReportPDF(reportData: any): Promise<Buffer> {
    // This would integrate with a PDF generation library like Puppeteer or jsPDF
    // For now, return a simple text-based PDF
    const pdfContent = JSON.stringify(reportData, null, 2);
    return Buffer.from(pdfContent);
  }

  /**
   * Get cron expression for frequency
   */
  private getCronExpression(frequency: string): string {
    const expressions = {
      daily: '0 9 * * *', // 9 AM daily
      weekly: '0 9 * * 1', // 9 AM every Monday
      monthly: '0 9 1 * *', // 9 AM on the 1st of every month
      quarterly: '0 9 1 1,4,7,10 *', // 9 AM on the 1st of Jan, Apr, Jul, Oct
      yearly: '0 9 1 1 *', // 9 AM on January 1st
    };
    
    return expressions[frequency as keyof typeof expressions] || '0 9 * * *';
  }

  /**
   * Calculate next run time
   */
  private calculateNextRun(frequency: string, scheduleTime?: string): Date {
    const now = new Date();
    
    switch (frequency) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      case 'quarterly':
        return new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
      case 'yearly':
        return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Reschedule a report
   */
  private async rescheduleReport(templateId: string): Promise<void> {
    // Cancel existing job
    const existingJob = this.scheduledJobs.get(templateId);
    if (existingJob) {
      existingJob.stop();
      this.scheduledJobs.delete(templateId);
    }

    // Get all active scheduled reports for this template
    const scheduledReports = await this.prisma.scheduledReport.findMany({
      where: { 
        templateId,
        isActive: true,
      },
    });

    // Reschedule each one
    for (const scheduledReport of scheduledReports) {
      await this.scheduleReport(scheduledReport.id);
    }
  }
}

