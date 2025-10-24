import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface ScheduledReport {
  id: string;
  userId: string;
  templateId: string;
  name: string;
  description: string;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    time: string; // HH:MM format
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    month?: number; // 0-11 for yearly
  };
  recipients: Array<{
    email: string;
    name: string;
    format: 'pdf' | 'excel' | 'csv' | 'json';
  }>;
  parameters: Record<string, any>;
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportDelivery {
  id: string;
  scheduledReportId: string;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  recipients: string[];
  format: string;
  fileSize?: number;
  sentAt?: Date;
  error?: string;
  createdAt: Date;
}

export interface ReportSubscription {
  id: string;
  userId: string;
  scheduledReportId: string;
  isActive: boolean;
  createdAt: Date;
}

export interface ReportHistory {
  id: string;
  scheduledReportId: string;
  status: 'success' | 'failed';
  recipients: string[];
  format: string;
  fileSize: number;
  sentAt: Date;
  error?: string;
}

class ScheduledReportService {
  private scheduledReports: Map<string, ScheduledReport> = new Map();
  private deliveries: Map<string, ReportDelivery> = new Map();
  private subscriptions: Map<string, ReportSubscription> = new Map();
  private history: Map<string, ReportHistory[]> = new Map();
  private scheduler: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeScheduler();
  }

  /**
   * Initialize the scheduler
   */
  private initializeScheduler(): void {
    logger.info('Initializing scheduled report service...');
    
    // Check for due reports every minute
    this.scheduler = setInterval(() => {
      this.processScheduledReports();
    }, 60 * 1000);
  }

  /**
   * Create a scheduled report
   */
  public async createScheduledReport(
    userId: string,
    reportData: Omit<ScheduledReport, 'id' | 'createdAt' | 'updatedAt' | 'lastRun' | 'nextRun'>
  ): Promise<ScheduledReport> {
    try {
      const scheduledReport: ScheduledReport = {
        id: uuidv4(),
        ...reportData,
        nextRun: this.calculateNextRun(reportData.schedule),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Validate schedule
      this.validateSchedule(scheduledReport.schedule);

      // Store scheduled report
      this.scheduledReports.set(scheduledReport.id, scheduledReport);

      logger.info(`Created scheduled report: ${scheduledReport.name}`);
      return scheduledReport;
    } catch (error) {
      logger.error('Error creating scheduled report:', error);
      throw error;
    }
  }

  /**
   * Validate schedule configuration
   */
  private validateSchedule(schedule: ScheduledReport['schedule']): void {
    if (!schedule.frequency || !schedule.time) {
      throw new Error('Schedule frequency and time are required');
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(schedule.time)) {
      throw new Error('Invalid time format. Use HH:MM');
    }

    // Validate day of week for weekly
    if (schedule.frequency === 'weekly' && (schedule.dayOfWeek < 0 || schedule.dayOfWeek > 6)) {
      throw new Error('Day of week must be between 0 (Sunday) and 6 (Saturday)');
    }

    // Validate day of month for monthly
    if (schedule.frequency === 'monthly' && (schedule.dayOfMonth < 1 || schedule.dayOfMonth > 31)) {
      throw new Error('Day of month must be between 1 and 31');
    }

    // Validate month for yearly
    if (schedule.frequency === 'yearly' && (schedule.month < 0 || schedule.month > 11)) {
      throw new Error('Month must be between 0 (January) and 11 (December)');
    }
  }

  /**
   * Calculate next run time
   */
  private calculateNextRun(schedule: ScheduledReport['schedule']): Date {
    const now = new Date();
    const [hours, minutes] = schedule.time.split(':').map(Number);
    
    let nextRun = new Date(now);
    nextRun.setHours(hours, minutes, 0, 0);

    // If time has passed today, move to next occurrence
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    switch (schedule.frequency) {
      case 'daily':
        // Already set to next day
        break;
        
      case 'weekly':
        const targetDay = schedule.dayOfWeek || 0;
        const currentDay = nextRun.getDay();
        const daysToAdd = (targetDay - currentDay + 7) % 7;
        nextRun.setDate(nextRun.getDate() + daysToAdd);
        break;
        
      case 'monthly':
        const targetDayOfMonth = schedule.dayOfMonth || 1;
        nextRun.setDate(targetDayOfMonth);
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
        break;
        
      case 'quarterly':
        // First day of next quarter
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const nextQuarter = (currentQuarter + 1) % 4;
        nextRun.setMonth(nextQuarter * 3);
        nextRun.setDate(1);
        break;
        
      case 'yearly':
        const targetMonth = schedule.month || 0;
        nextRun.setMonth(targetMonth);
        nextRun.setDate(schedule.dayOfMonth || 1);
        if (nextRun <= now) {
          nextRun.setFullYear(nextRun.getFullYear() + 1);
        }
        break;
    }

    return nextRun;
  }

  /**
   * Update scheduled report
   */
  public async updateScheduledReport(
    reportId: string,
    updates: Partial<ScheduledReport>
  ): Promise<ScheduledReport> {
    const report = this.scheduledReports.get(reportId);
    if (!report) {
      throw new Error('Scheduled report not found');
    }

    const updatedReport = {
      ...report,
      ...updates,
      updatedAt: new Date(),
    };

    // Recalculate next run if schedule changed
    if (updates.schedule) {
      updatedReport.nextRun = this.calculateNextRun(updatedReport.schedule);
    }

    this.scheduledReports.set(reportId, updatedReport);
    logger.info(`Updated scheduled report: ${reportId}`);
    return updatedReport;
  }

  /**
   * Delete scheduled report
   */
  public async deleteScheduledReport(reportId: string): Promise<void> {
    if (!this.scheduledReports.has(reportId)) {
      throw new Error('Scheduled report not found');
    }

    this.scheduledReports.delete(reportId);
    logger.info(`Deleted scheduled report: ${reportId}`);
  }

  /**
   * Get scheduled reports for user
   */
  public async getScheduledReports(userId: string): Promise<ScheduledReport[]> {
    const userReports = Array.from(this.scheduledReports.values()).filter(report => 
      report.userId === userId
    );

    return userReports.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Process scheduled reports
   */
  private async processScheduledReports(): Promise<void> {
    const now = new Date();
    
    for (const [reportId, report] of this.scheduledReports) {
      if (report.isActive && report.nextRun && report.nextRun <= now) {
        try {
          await this.executeScheduledReport(report);
        } catch (error) {
          logger.error(`Error executing scheduled report ${reportId}:`, error);
        }
      }
    }
  }

  /**
   * Execute scheduled report
   */
  private async executeScheduledReport(report: ScheduledReport): Promise<void> {
    try {
      logger.info(`Executing scheduled report: ${report.name}`);

      // Create delivery record
      const delivery: ReportDelivery = {
        id: uuidv4(),
        scheduledReportId: report.id,
        status: 'processing',
        recipients: report.recipients.map(r => r.email),
        format: report.recipients[0]?.format || 'pdf',
        createdAt: new Date(),
      };

      this.deliveries.set(delivery.id, delivery);

      // Generate report for each recipient
      for (const recipient of report.recipients) {
        try {
          await this.generateAndSendReport(report, recipient, delivery);
        } catch (error) {
          logger.error(`Error sending report to ${recipient.email}:`, error);
          delivery.error = error instanceof Error ? error.message : 'Unknown error';
        }
      }

      // Update delivery status
      delivery.status = delivery.error ? 'failed' : 'sent';
      delivery.sentAt = new Date();
      this.deliveries.set(delivery.id, delivery);

      // Update report
      report.lastRun = new Date();
      report.nextRun = this.calculateNextRun(report.schedule);
      this.scheduledReports.set(report.id, report);

      // Add to history
      const historyEntry: ReportHistory = {
        id: uuidv4(),
        scheduledReportId: report.id,
        status: delivery.status === 'sent' ? 'success' : 'failed',
        recipients: report.recipients.map(r => r.email),
        format: report.recipients[0]?.format || 'pdf',
        fileSize: 0, // Would be calculated from actual file
        sentAt: new Date(),
        error: delivery.error,
      };

      if (!this.history.has(report.id)) {
        this.history.set(report.id, []);
      }
      this.history.get(report.id)!.push(historyEntry);

      logger.info(`Scheduled report ${report.name} executed successfully`);
    } catch (error) {
      logger.error(`Error executing scheduled report ${report.id}:`, error);
      throw error;
    }
  }

  /**
   * Generate and send report
   */
  private async generateAndSendReport(
    report: ScheduledReport,
    recipient: ScheduledReport['recipients'][0],
    delivery: ReportDelivery
  ): Promise<void> {
    try {
      // In production, this would:
      // 1. Execute the report template with parameters
      // 2. Generate the report in the specified format
      // 3. Send email with attachment
      
      logger.info(`Generating report for ${recipient.email} in ${recipient.format} format`);
      
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate email sending
      await this.sendEmail(recipient.email, report.name, recipient.format);
      
      logger.info(`Report sent successfully to ${recipient.email}`);
    } catch (error) {
      logger.error(`Error generating/sending report to ${recipient.email}:`, error);
      throw error;
    }
  }

  /**
   * Send email (simulated)
   */
  private async sendEmail(email: string, reportName: string, format: string): Promise<void> {
    // In production, this would use an email service like SendGrid, SES, etc.
    logger.info(`Sending email to ${email} with report ${reportName} in ${format} format`);
    
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  /**
   * Subscribe to scheduled report
   */
  public async subscribeToReport(
    userId: string,
    scheduledReportId: string
  ): Promise<ReportSubscription> {
    const subscription: ReportSubscription = {
      id: uuidv4(),
      userId,
      scheduledReportId,
      isActive: true,
      createdAt: new Date(),
    };

    this.subscriptions.set(subscription.id, subscription);
    logger.info(`User ${userId} subscribed to report ${scheduledReportId}`);
    return subscription;
  }

  /**
   * Unsubscribe from scheduled report
   */
  public async unsubscribeFromReport(subscriptionId: string): Promise<void> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    subscription.isActive = false;
    this.subscriptions.set(subscriptionId, subscription);
    logger.info(`Unsubscribed from report: ${subscriptionId}`);
  }

  /**
   * Get report history
   */
  public async getReportHistory(scheduledReportId: string): Promise<ReportHistory[]> {
    return this.history.get(scheduledReportId) || [];
  }

  /**
   * Get delivery status
   */
  public async getDeliveryStatus(deliveryId: string): Promise<ReportDelivery | null> {
    return this.deliveries.get(deliveryId) || null;
  }

  /**
   * Get active deliveries
   */
  public async getActiveDeliveries(): Promise<ReportDelivery[]> {
    return Array.from(this.deliveries.values()).filter(delivery => 
      delivery.status === 'pending' || delivery.status === 'processing'
    );
  }

  /**
   * Retry failed delivery
   */
  public async retryDelivery(deliveryId: string): Promise<void> {
    const delivery = this.deliveries.get(deliveryId);
    if (!delivery) {
      throw new Error('Delivery not found');
    }

    if (delivery.status !== 'failed') {
      throw new Error('Can only retry failed deliveries');
    }

    delivery.status = 'processing';
    delivery.error = undefined;
    this.deliveries.set(deliveryId, delivery);

    // Retry the delivery
    const report = this.scheduledReports.get(delivery.scheduledReportId);
    if (report) {
      try {
        await this.executeScheduledReport(report);
      } catch (error) {
        logger.error(`Error retrying delivery ${deliveryId}:`, error);
        delivery.status = 'failed';
        delivery.error = error instanceof Error ? error.message : 'Unknown error';
        this.deliveries.set(deliveryId, delivery);
      }
    }
  }

  /**
   * Get report statistics
   */
  public async getReportStatistics(scheduledReportId: string): Promise<{
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    successRate: number;
    averageFileSize: number;
    lastDelivery?: Date;
  }> {
    const history = this.history.get(scheduledReportId) || [];
    
    const stats = {
      totalDeliveries: history.length,
      successfulDeliveries: history.filter(h => h.status === 'success').length,
      failedDeliveries: history.filter(h => h.status === 'failed').length,
      successRate: 0,
      averageFileSize: 0,
      lastDelivery: history.length > 0 ? history[history.length - 1].sentAt : undefined,
    };

    if (stats.totalDeliveries > 0) {
      stats.successRate = (stats.successfulDeliveries / stats.totalDeliveries) * 100;
      stats.averageFileSize = history.reduce((sum, h) => sum + h.fileSize, 0) / stats.totalDeliveries;
    }

    return stats;
  }

  /**
   * Pause scheduled report
   */
  public async pauseScheduledReport(reportId: string): Promise<void> {
    const report = this.scheduledReports.get(reportId);
    if (!report) {
      throw new Error('Scheduled report not found');
    }

    report.isActive = false;
    this.scheduledReports.set(reportId, report);
    logger.info(`Paused scheduled report: ${reportId}`);
  }

  /**
   * Resume scheduled report
   */
  public async resumeScheduledReport(reportId: string): Promise<void> {
    const report = this.scheduledReports.get(reportId);
    if (!report) {
      throw new Error('Scheduled report not found');
    }

    report.isActive = true;
    report.nextRun = this.calculateNextRun(report.schedule);
    this.scheduledReports.set(reportId, report);
    logger.info(`Resumed scheduled report: ${reportId}`);
  }

  /**
   * Execute report immediately
   */
  public async executeNow(reportId: string): Promise<void> {
    const report = this.scheduledReports.get(reportId);
    if (!report) {
      throw new Error('Scheduled report not found');
    }

    await this.executeScheduledReport(report);
    logger.info(`Executed scheduled report immediately: ${reportId}`);
  }

  /**
   * Cleanup old history
   */
  public async cleanupHistory(olderThanDays: number = 90): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    for (const [reportId, history] of this.history) {
      const filteredHistory = history.filter(h => h.sentAt > cutoffDate);
      this.history.set(reportId, filteredHistory);
    }

    logger.info(`Cleaned up history older than ${olderThanDays} days`);
  }

  /**
   * Get scheduler status
   */
  public getSchedulerStatus(): {
    isRunning: boolean;
    nextCheck: Date;
    activeReports: number;
    totalReports: number;
  } {
    const now = new Date();
    const nextCheck = new Date(now.getTime() + 60 * 1000); // Next minute
    
    return {
      isRunning: this.scheduler !== null,
      nextCheck,
      activeReports: Array.from(this.scheduledReports.values()).filter(r => r.isActive).length,
      totalReports: this.scheduledReports.size,
    };
  }
}

export default new ScheduledReportService();







