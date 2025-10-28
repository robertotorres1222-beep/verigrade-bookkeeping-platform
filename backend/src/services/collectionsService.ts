import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface ARAgingBucket {
  current: number;      // 0-30 days
  days31to60: number;  // 31-60 days
  days61to90: number;  // 61-90 days
  over90: number;      // 90+ days
  total: number;
}

export interface CollectionsDashboard {
  agingBuckets: ARAgingBucket;
  dso: number; // Days Sales Outstanding
  collectionRate: number;
  badDebtRate: number;
  totalOutstanding: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  recentActivity: any[];
  successMetrics: {
    collectionRate: number;
    dsoImprovement: number;
    badDebtReduction: number;
  };
}

export interface CustomerPriority {
  customerId: string;
  customerName: string;
  outstandingAmount: number;
  daysOverdue: number;
  priority: 'high' | 'medium' | 'low';
  riskFactors: string[];
  lastPaymentDate: Date | null;
  paymentHistory: any[];
  recommendedActions: string[];
}

export class CollectionsService {
  /**
   * Get collections dashboard data
   */
  async getCollectionsDashboard(companyId: string): Promise<CollectionsDashboard> {
    try {
      logger.info(`Getting collections dashboard for company ${companyId}`);

      const [
        agingBuckets,
        dso,
        collectionRate,
        badDebtRate,
        totalOutstanding,
        priorities,
        recentActivity
      ] = await Promise.all([
        this.getARAgingBuckets(companyId),
        this.calculateDSO(companyId),
        this.calculateCollectionRate(companyId),
        this.calculateBadDebtRate(companyId),
        this.getTotalOutstanding(companyId),
        this.getCustomerPriorities(companyId),
        this.getRecentActivity(companyId)
      ]);

      const highPriority = priorities.filter(p => p.priority === 'high').length;
      const mediumPriority = priorities.filter(p => p.priority === 'medium').length;
      const lowPriority = priorities.filter(p => p.priority === 'low').length;

      const successMetrics = await this.getSuccessMetrics(companyId);

      return {
        agingBuckets,
        dso,
        collectionRate,
        badDebtRate,
        totalOutstanding,
        highPriority,
        mediumPriority,
        lowPriority,
        recentActivity,
        successMetrics
      };
    } catch (error) {
      logger.error(`Error getting collections dashboard: ${error.message}`);
      throw new Error(`Failed to get collections dashboard: ${error.message}`);
    }
  }

  /**
   * Get AR aging buckets
   */
  async getARAgingBuckets(companyId: string): Promise<ARAgingBucket> {
    const invoices = await prisma.invoice.findMany({
      where: {
        companyId,
        status: { in: ['sent', 'overdue'] },
        dueDate: { not: null }
      },
      select: {
        id: true,
        amount: true,
        dueDate: true,
        status: true
      }
    });

    const now = new Date();
    let current = 0;
    let days31to60 = 0;
    let days61to90 = 0;
    let over90 = 0;

    for (const invoice of invoices) {
      if (!invoice.dueDate) continue;

      const daysOverdue = Math.floor((now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const amount = invoice.amount;

      if (daysOverdue <= 30) {
        current += amount;
      } else if (daysOverdue <= 60) {
        days31to60 += amount;
      } else if (daysOverdue <= 90) {
        days61to90 += amount;
      } else {
        over90 += amount;
      }
    }

    const total = current + days31to60 + days61to90 + over90;

    return {
      current,
      days31to60,
      days61to90,
      over90,
      total
    };
  }

  /**
   * Calculate Days Sales Outstanding (DSO)
   */
  async calculateDSO(companyId: string): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalReceivables, totalSales] = await Promise.all([
      prisma.invoice.aggregate({
        where: {
          companyId,
          status: { in: ['sent', 'overdue'] }
        },
        _sum: { amount: true }
      }),
      prisma.invoice.aggregate({
        where: {
          companyId,
          status: 'paid',
          paidAt: { gte: thirtyDaysAgo }
        },
        _sum: { amount: true }
      })
    ]);

    const receivables = totalReceivables._sum.amount || 0;
    const sales = totalSales._sum.amount || 0;

    if (sales === 0) return 0;

    return Math.round((receivables / sales) * 30);
  }

  /**
   * Calculate collection rate
   */
  async calculateCollectionRate(companyId: string): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [collected, total] = await Promise.all([
      prisma.invoice.aggregate({
        where: {
          companyId,
          status: 'paid',
          paidAt: { gte: thirtyDaysAgo }
        },
        _sum: { amount: true }
      }),
      prisma.invoice.aggregate({
        where: {
          companyId,
          status: { in: ['sent', 'overdue', 'paid'] },
          dueDate: { gte: thirtyDaysAgo }
        },
        _sum: { amount: true }
      })
    ]);

    const collectedAmount = collected._sum.amount || 0;
    const totalAmount = total._sum.amount || 0;

    if (totalAmount === 0) return 0;

    return Math.round((collectedAmount / totalAmount) * 100);
  }

  /**
   * Calculate bad debt rate
   */
  async calculateBadDebtRate(companyId: string): Promise<number> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [badDebt, totalSales] = await Promise.all([
      prisma.invoice.aggregate({
        where: {
          companyId,
          status: 'overdue',
          dueDate: { lt: sixMonthsAgo }
        },
        _sum: { amount: true }
      }),
      prisma.invoice.aggregate({
        where: {
          companyId,
          status: { in: ['paid', 'overdue'] },
          createdAt: { gte: sixMonthsAgo }
        },
        _sum: { amount: true }
      })
    ]);

    const badDebtAmount = badDebt._sum.amount || 0;
    const totalSalesAmount = totalSales._sum.amount || 0;

    if (totalSalesAmount === 0) return 0;

    return Math.round((badDebtAmount / totalSalesAmount) * 100);
  }

  /**
   * Get total outstanding amount
   */
  async getTotalOutstanding(companyId: string): Promise<number> {
    const result = await prisma.invoice.aggregate({
      where: {
        companyId,
        status: { in: ['sent', 'overdue'] }
      },
      _sum: { amount: true }
    });

    return result._sum.amount || 0;
  }

  /**
   * Get customer priorities with AI analysis
   */
  async getCustomerPriorities(companyId: string): Promise<CustomerPriority[]> {
    const customers = await prisma.customer.findMany({
      where: { companyId },
      include: {
        invoices: {
          where: {
            status: { in: ['sent', 'overdue'] }
          },
          orderBy: { dueDate: 'asc' }
        }
      }
    });

    const priorities: CustomerPriority[] = [];

    for (const customer of customers) {
      if (customer.invoices.length === 0) continue;

      const outstandingAmount = customer.invoices.reduce((sum, inv) => sum + inv.amount, 0);
      const oldestInvoice = customer.invoices[0];
      const daysOverdue = oldestInvoice.dueDate 
        ? Math.floor((new Date().getTime() - oldestInvoice.dueDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      const priority = this.calculatePriority(outstandingAmount, daysOverdue, customer);
      const riskFactors = this.identifyRiskFactors(customer, daysOverdue);
      const recommendedActions = this.generateRecommendedActions(priority, riskFactors);

      priorities.push({
        customerId: customer.id,
        customerName: customer.name,
        outstandingAmount,
        daysOverdue,
        priority,
        riskFactors,
        lastPaymentDate: customer.lastPaymentDate,
        paymentHistory: [], // Would be populated from payment history
        recommendedActions
      });
    }

    return priorities.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Calculate customer priority
   */
  private calculatePriority(amount: number, daysOverdue: number, customer: any): 'high' | 'medium' | 'low' {
    let score = 0;

    // Amount factor
    if (amount > 10000) score += 3;
    else if (amount > 5000) score += 2;
    else if (amount > 1000) score += 1;

    // Days overdue factor
    if (daysOverdue > 90) score += 3;
    else if (daysOverdue > 60) score += 2;
    else if (daysOverdue > 30) score += 1;

    // Customer history factor
    if (customer.paymentReliability < 70) score += 2;
    else if (customer.paymentReliability < 90) score += 1;

    if (score >= 5) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  }

  /**
   * Identify risk factors
   */
  private identifyRiskFactors(customer: any, daysOverdue: number): string[] {
    const factors: string[] = [];

    if (daysOverdue > 90) factors.push('Overdue 90+ days');
    if (customer.paymentReliability < 70) factors.push('Poor payment history');
    if (customer.lastPaymentDate && this.daysSince(customer.lastPaymentDate) > 60) {
      factors.push('No recent payments');
    }
    if (customer.creditScore && customer.creditScore < 600) {
      factors.push('Low credit score');
    }

    return factors;
  }

  /**
   * Generate recommended actions
   */
  private generateRecommendedActions(priority: string, riskFactors: string[]): string[] {
    const actions: string[] = [];

    if (priority === 'high') {
      actions.push('Immediate phone call to customer');
      actions.push('Send formal demand letter');
      actions.push('Consider payment plan offer');
    } else if (priority === 'medium') {
      actions.push('Send friendly reminder email');
      actions.push('Follow up with phone call');
    } else {
      actions.push('Send standard payment reminder');
    }

    if (riskFactors.includes('Poor payment history')) {
      actions.push('Request payment guarantee or deposit');
    }

    return actions;
  }

  /**
   * Get recent collections activity
   */
  async getRecentActivity(companyId: string): Promise<any[]> {
    const activities = await prisma.collectionActivity.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        customer: true,
        invoice: true
      }
    });

    return activities;
  }

  /**
   * Get success metrics
   */
  async getSuccessMetrics(companyId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [currentDSO, previousDSO] = await Promise.all([
      this.calculateDSO(companyId),
      this.calculateDSOForPeriod(companyId, 60, 30) // 30-60 days ago
    ]);

    const [currentCollectionRate, previousCollectionRate] = await Promise.all([
      this.calculateCollectionRate(companyId),
      this.calculateCollectionRateForPeriod(companyId, 60, 30)
    ]);

    const [currentBadDebt, previousBadDebt] = await Promise.all([
      this.calculateBadDebtRate(companyId),
      this.calculateBadDebtRateForPeriod(companyId, 60, 30)
    ]);

    return {
      collectionRate: currentCollectionRate,
      dsoImprovement: currentDSO - previousDSO,
      badDebtReduction: previousBadDebt - currentBadDebt
    };
  }

  // Helper methods
  private daysSince(date: Date): number {
    return Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  }

  private async calculateDSOForPeriod(companyId: string, daysAgo: number, periodDays: number): Promise<number> {
    // Implementation for historical DSO calculation
    return 25; // Example value
  }

  private async calculateCollectionRateForPeriod(companyId: string, daysAgo: number, periodDays: number): Promise<number> {
    // Implementation for historical collection rate
    return 85; // Example value
  }

  private async calculateBadDebtRateForPeriod(companyId: string, daysAgo: number, periodDays: number): Promise<number> {
    // Implementation for historical bad debt rate
    return 2.5; // Example value
  }
}









