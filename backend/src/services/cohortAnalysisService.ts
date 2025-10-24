import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class CohortAnalysisService {
  // Customer Cohort Tracking by Signup Date
  async createCohort(userId: string, cohortData: any) {
    try {
      const cohort = await prisma.cohort.create({
        data: {
          id: uuidv4(),
          userId,
          name: cohortData.name,
          cohortDate: cohortData.cohortDate,
          cohortType: cohortData.cohortType || 'monthly',
          description: cohortData.description,
          createdAt: new Date()
        }
      });

      return cohort;
    } catch (error) {
      throw new Error(`Failed to create cohort: ${error.message}`);
    }
  }

  // Cohort Retention Analysis
  async analyzeCohortRetention(userId: string, cohortId: string, periods: number = 12) {
    try {
      const cohort = await prisma.cohort.findUnique({
        where: { id: cohortId },
        include: {
          customers: {
            include: {
              subscriptions: true,
              transactions: true
            }
          }
        }
      });

      if (!cohort) {
        throw new Error('Cohort not found');
      }

      const retentionData = [];
      const totalCustomers = cohort.customers.length;

      for (let period = 0; period < periods; period++) {
        const periodDate = new Date(cohort.cohortDate);
        periodDate.setMonth(periodDate.getMonth() + period);

        // Calculate active customers in this period
        const activeCustomers = await this.getActiveCustomersInPeriod(
          cohort.customers,
          cohort.cohortDate,
          periodDate
        );

        const retentionRate = totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0;

        retentionData.push({
          period,
          periodDate,
          activeCustomers,
          totalCustomers,
          retentionRate,
          churnRate: 100 - retentionRate
        });
      }

      // Store cohort analysis
      await prisma.cohortAnalysis.create({
        data: {
          id: uuidv4(),
          cohortId,
          analysisType: 'retention',
          periods,
          data: JSON.stringify(retentionData),
          createdAt: new Date()
        }
      });

      return retentionData;
    } catch (error) {
      throw new Error(`Failed to analyze cohort retention: ${error.message}`);
    }
  }

  // Revenue by Cohort Calculations
  async calculateCohortRevenue(userId: string, cohortId: string, periods: number = 12) {
    try {
      const cohort = await prisma.cohort.findUnique({
        where: { id: cohortId },
        include: {
          customers: {
            include: {
              subscriptions: true,
              transactions: {
                where: { type: 'income' }
              }
            }
          }
        }
      });

      if (!cohort) {
        throw new Error('Cohort not found');
      }

      const revenueData = [];

      for (let period = 0; period < periods; period++) {
        const periodStart = new Date(cohort.cohortDate);
        periodStart.setMonth(periodStart.getMonth() + period);
        
        const periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        // Calculate revenue for this period
        const periodRevenue = await this.getRevenueForPeriod(
          cohort.customers,
          periodStart,
          periodEnd
        );

        // Calculate cumulative revenue
        const cumulativeRevenue = revenueData.reduce(
          (sum, data) => sum + data.periodRevenue, 0
        ) + periodRevenue;

        revenueData.push({
          period,
          periodStart,
          periodEnd,
          periodRevenue,
          cumulativeRevenue,
          averageRevenuePerCustomer: cohort.customers.length > 0 
            ? periodRevenue / cohort.customers.length 
            : 0
        });
      }

      // Store cohort revenue analysis
      await prisma.cohortAnalysis.create({
        data: {
          id: uuidv4(),
          cohortId,
          analysisType: 'revenue',
          periods,
          data: JSON.stringify(revenueData),
          createdAt: new Date()
        }
      });

      return revenueData;
    } catch (error) {
      throw new Error(`Failed to calculate cohort revenue: ${error.message}`);
    }
  }

  // Expansion Revenue Tracking per Cohort
  async trackCohortExpansion(userId: string, cohortId: string, periods: number = 12) {
    try {
      const cohort = await prisma.cohort.findUnique({
        where: { id: cohortId },
        include: {
          customers: {
            include: {
              subscriptions: {
                include: { plan: true }
              }
            }
          }
        }
      });

      if (!cohort) {
        throw new Error('Cohort not found');
      }

      const expansionData = [];

      for (let period = 0; period < periods; period++) {
        const periodStart = new Date(cohort.cohortDate);
        periodStart.setMonth(periodStart.getMonth() + period);
        
        const periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        // Calculate expansion revenue for this period
        const expansionRevenue = await this.getExpansionRevenueForPeriod(
          cohort.customers,
          periodStart,
          periodEnd
        );

        // Calculate expansion rate
        const baseRevenue = await this.getBaseRevenueForPeriod(
          cohort.customers,
          periodStart,
          periodEnd
        );
        
        const expansionRate = baseRevenue > 0 ? (expansionRevenue / baseRevenue) * 100 : 0;

        expansionData.push({
          period,
          periodStart,
          periodEnd,
          expansionRevenue,
          baseRevenue,
          expansionRate,
          customersWithExpansion: await this.getCustomersWithExpansion(
            cohort.customers,
            periodStart,
            periodEnd
          )
        });
      }

      // Store cohort expansion analysis
      await prisma.cohortAnalysis.create({
        data: {
          id: uuidv4(),
          cohortId,
          analysisType: 'expansion',
          periods,
          data: JSON.stringify(expansionData),
          createdAt: new Date()
        }
      });

      return expansionData;
    } catch (error) {
      throw new Error(`Failed to track cohort expansion: ${error.message}`);
    }
  }

  // Churn Analysis by Cohort
  async analyzeCohortChurn(userId: string, cohortId: string, periods: number = 12) {
    try {
      const cohort = await prisma.cohort.findUnique({
        where: { id: cohortId },
        include: {
          customers: {
            include: {
              subscriptions: true
            }
          }
        }
      });

      if (!cohort) {
        throw new Error('Cohort not found');
      }

      const churnData = [];

      for (let period = 0; period < periods; period++) {
        const periodStart = new Date(cohort.cohortDate);
        periodStart.setMonth(periodStart.getMonth() + period);
        
        const periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        // Calculate churn for this period
        const churnedCustomers = await this.getChurnedCustomersInPeriod(
          cohort.customers,
          periodStart,
          periodEnd
        );

        const churnRate = cohort.customers.length > 0 
          ? (churnedCustomers / cohort.customers.length) * 100 
          : 0;

        // Calculate revenue lost from churn
        const churnRevenue = await this.getChurnRevenueForPeriod(
          cohort.customers,
          periodStart,
          periodEnd
        );

        churnData.push({
          period,
          periodStart,
          periodEnd,
          churnedCustomers,
          totalCustomers: cohort.customers.length,
          churnRate,
          churnRevenue,
          averageChurnValue: churnedCustomers > 0 
            ? churnRevenue / churnedCustomers 
            : 0
        });
      }

      // Store cohort churn analysis
      await prisma.cohortAnalysis.create({
        data: {
          id: uuidv4(),
          cohortId,
          analysisType: 'churn',
          periods,
          data: JSON.stringify(churnData),
          createdAt: new Date()
        }
      });

      return churnData;
    } catch (error) {
      throw new Error(`Failed to analyze cohort churn: ${error.message}`);
    }
  }

  // LTV Calculation by Cohort
  async calculateCohortLTV(userId: string, cohortId: string) {
    try {
      const cohort = await prisma.cohort.findUnique({
        where: { id: cohortId },
        include: {
          customers: {
            include: {
              subscriptions: {
                include: { plan: true }
              },
              transactions: {
                where: { type: 'income' }
              }
            }
          }
        }
      });

      if (!cohort) {
        throw new Error('Cohort not found');
      }

      const ltvData = [];

      for (const customer of cohort.customers) {
        // Calculate customer LTV
        const totalRevenue = customer.transactions.reduce(
          (sum, transaction) => sum + transaction.amount, 0
        );

        // Calculate average monthly revenue
        const subscriptionMonths = customer.subscriptions.reduce(
          (sum, sub) => {
            const startDate = new Date(sub.startDate);
            const endDate = sub.endDate ? new Date(sub.endDate) : new Date();
            const months = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
            return sum + months;
          }, 0
        );

        const averageMonthlyRevenue = subscriptionMonths > 0 
          ? totalRevenue / subscriptionMonths 
          : 0;

        // Calculate customer lifespan (simplified)
        const customerLifespan = subscriptionMonths;

        // Calculate LTV
        const ltv = averageMonthlyRevenue * customerLifespan;

        ltvData.push({
          customerId: customer.id,
          customerName: customer.name,
          totalRevenue,
          averageMonthlyRevenue,
          customerLifespan,
          ltv,
          subscriptionCount: customer.subscriptions.length,
          firstSubscriptionDate: customer.subscriptions.length > 0 
            ? customer.subscriptions[0].startDate 
            : null,
          lastSubscriptionDate: customer.subscriptions.length > 0 
            ? customer.subscriptions[customer.subscriptions.length - 1].startDate 
            : null
        });
      }

      // Calculate cohort LTV metrics
      const cohortLTV = {
        averageLTV: ltvData.reduce((sum, data) => sum + data.ltv, 0) / ltvData.length,
        medianLTV: this.calculateMedian(ltvData.map(data => data.ltv)),
        totalLTV: ltvData.reduce((sum, data) => sum + data.ltv, 0),
        customerCount: ltvData.length,
        ltvDistribution: this.calculateLTVDistribution(ltvData.map(data => data.ltv)),
        ltvData
      };

      // Store cohort LTV analysis
      await prisma.cohortAnalysis.create({
        data: {
          id: uuidv4(),
          cohortId,
          analysisType: 'ltv',
          periods: 1,
          data: JSON.stringify(cohortLTV),
          createdAt: new Date()
        }
      });

      return cohortLTV;
    } catch (error) {
      throw new Error(`Failed to calculate cohort LTV: ${error.message}`);
    }
  }

  // Cohort Comparison Reports
  async generateCohortComparisonReport(userId: string, cohortIds: string[]) {
    try {
      const cohorts = await prisma.cohort.findMany({
        where: {
          id: { in: cohortIds },
          userId
        },
        include: {
          customers: true,
          analyses: true
        }
      });

      if (cohorts.length === 0) {
        throw new Error('No cohorts found');
      }

      const comparisonData = [];

      for (const cohort of cohorts) {
        // Get latest analysis for each type
        const retentionAnalysis = cohort.analyses
          .filter(a => a.analysisType === 'retention')
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

        const revenueAnalysis = cohort.analyses
          .filter(a => a.analysisType === 'revenue')
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

        const expansionAnalysis = cohort.analyses
          .filter(a => a.analysisType === 'expansion')
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

        const churnAnalysis = cohort.analyses
          .filter(a => a.analysisType === 'churn')
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

        const ltvAnalysis = cohort.analyses
          .filter(a => a.analysisType === 'ltv')
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

        comparisonData.push({
          cohortId: cohort.id,
          cohortName: cohort.name,
          cohortDate: cohort.cohortDate,
          customerCount: cohort.customers.length,
          retentionData: retentionAnalysis ? JSON.parse(retentionAnalysis.data) : null,
          revenueData: revenueAnalysis ? JSON.parse(revenueAnalysis.data) : null,
          expansionData: expansionAnalysis ? JSON.parse(expansionAnalysis.data) : null,
          churnData: churnAnalysis ? JSON.parse(churnAnalysis.data) : null,
          ltvData: ltvAnalysis ? JSON.parse(ltvAnalysis.data) : null
        });
      }

      return comparisonData;
    } catch (error) {
      throw new Error(`Failed to generate cohort comparison report: ${error.message}`);
    }
  }

  // Helper Methods
  private async getActiveCustomersInPeriod(customers: any[], cohortDate: Date, periodDate: Date): Promise<number> {
    let activeCount = 0;

    for (const customer of customers) {
      // Check if customer was active in this period
      const hasActiveSubscription = customer.subscriptions.some(sub => {
        const startDate = new Date(sub.startDate);
        const endDate = sub.endDate ? new Date(sub.endDate) : new Date();
        return startDate <= periodDate && endDate >= periodDate;
      });

      if (hasActiveSubscription) {
        activeCount++;
      }
    }

    return activeCount;
  }

  private async getRevenueForPeriod(customers: any[], periodStart: Date, periodEnd: Date): Promise<number> {
    let totalRevenue = 0;

    for (const customer of customers) {
      const periodTransactions = customer.transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= periodStart && transactionDate < periodEnd;
      });

      totalRevenue += periodTransactions.reduce(
        (sum, transaction) => sum + transaction.amount, 0
      );
    }

    return totalRevenue;
  }

  private async getExpansionRevenueForPeriod(customers: any[], periodStart: Date, periodEnd: Date): Promise<number> {
    let expansionRevenue = 0;

    for (const customer of customers) {
      // Find subscription changes in this period
      const periodSubscriptions = customer.subscriptions.filter(sub => {
        const startDate = new Date(sub.startDate);
        return startDate >= periodStart && startDate < periodEnd;
      });

      for (const subscription of periodSubscriptions) {
        // Check if this is an expansion (upgrade)
        const previousSubscriptions = customer.subscriptions.filter(sub => {
          const startDate = new Date(sub.startDate);
          return startDate < periodStart;
        });

        if (previousSubscriptions.length > 0) {
          const previousPlan = previousSubscriptions[previousSubscriptions.length - 1].plan;
          const currentPlan = subscription.plan;

          if (currentPlan.monthlyPrice > previousPlan.monthlyPrice) {
            expansionRevenue += currentPlan.monthlyPrice - previousPlan.monthlyPrice;
          }
        }
      }
    }

    return expansionRevenue;
  }

  private async getBaseRevenueForPeriod(customers: any[], periodStart: Date, periodEnd: Date): Promise<number> {
    // Simplified implementation - would need more complex logic for actual base revenue
    return await this.getRevenueForPeriod(customers, periodStart, periodEnd);
  }

  private async getCustomersWithExpansion(customers: any[], periodStart: Date, periodEnd: Date): Promise<number> {
    let customersWithExpansion = 0;

    for (const customer of customers) {
      const periodSubscriptions = customer.subscriptions.filter(sub => {
        const startDate = new Date(sub.startDate);
        return startDate >= periodStart && startDate < periodEnd;
      });

      if (periodSubscriptions.length > 0) {
        // Check if any subscription is an upgrade
        const hasExpansion = periodSubscriptions.some(sub => {
          const previousSubscriptions = customer.subscriptions.filter(prevSub => {
            const startDate = new Date(prevSub.startDate);
            return startDate < periodStart;
          });

          if (previousSubscriptions.length > 0) {
            const previousPlan = previousSubscriptions[previousSubscriptions.length - 1].plan;
            return sub.plan.monthlyPrice > previousPlan.monthlyPrice;
          }

          return false;
        });

        if (hasExpansion) {
          customersWithExpansion++;
        }
      }
    }

    return customersWithExpansion;
  }

  private async getChurnedCustomersInPeriod(customers: any[], periodStart: Date, periodEnd: Date): Promise<number> {
    let churnedCount = 0;

    for (const customer of customers) {
      // Check if customer churned in this period
      const churnedSubscriptions = customer.subscriptions.filter(sub => {
        if (!sub.endDate) return false;
        const endDate = new Date(sub.endDate);
        return endDate >= periodStart && endDate < periodEnd;
      });

      if (churnedSubscriptions.length > 0) {
        churnedCount++;
      }
    }

    return churnedCount;
  }

  private async getChurnRevenueForPeriod(customers: any[], periodStart: Date, periodEnd: Date): Promise<number> {
    let churnRevenue = 0;

    for (const customer of customers) {
      const churnedSubscriptions = customer.subscriptions.filter(sub => {
        if (!sub.endDate) return false;
        const endDate = new Date(sub.endDate);
        return endDate >= periodStart && endDate < periodEnd;
      });

      for (const subscription of churnedSubscriptions) {
        churnRevenue += subscription.plan.monthlyPrice;
      }
    }

    return churnRevenue;
  }

  private calculateMedian(values: number[]): number {
    const sorted = values.sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    } else {
      return sorted[middle];
    }
  }

  private calculateLTVDistribution(ltvValues: number[]) {
    const sorted = ltvValues.sort((a, b) => a - b);
    const total = sorted.length;

    return {
      min: sorted[0],
      max: sorted[total - 1],
      q1: sorted[Math.floor(total * 0.25)],
      median: sorted[Math.floor(total * 0.5)],
      q3: sorted[Math.floor(total * 0.75)],
      mean: ltvValues.reduce((sum, value) => sum + value, 0) / total
    };
  }
}

export default new CohortAnalysisService();







