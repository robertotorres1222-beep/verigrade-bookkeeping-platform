import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class SaaSMetricsService {
  // MRR/ARR Calculation with Expansion/Contraction Tracking
  async calculateMRR(userId: string, date?: Date) {
    try {
      const targetDate = date || new Date();
      const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

      // Get all active subscriptions
      const subscriptions = await prisma.subscription.findMany({
        where: {
          userId,
          status: 'active',
          startDate: { lte: endOfMonth },
          OR: [
            { endDate: null },
            { endDate: { gte: startOfMonth } }
          ]
        },
        include: {
          plan: true,
          customer: true
        }
      });

      // Calculate MRR components
      let totalMRR = 0;
      let newMRR = 0;
      let expansionMRR = 0;
      let contractionMRR = 0;
      let churnMRR = 0;

      for (const subscription of subscriptions) {
        const monthlyAmount = subscription.plan.monthlyPrice;
        totalMRR += monthlyAmount;

        // Categorize by subscription type
        if (subscription.startDate >= startOfMonth) {
          newMRR += monthlyAmount;
        }

        // Check for expansion/contraction (simplified logic)
        const previousMonth = new Date(startOfMonth);
        previousMonth.setMonth(previousMonth.getMonth() - 1);
        
        const previousSubscription = await prisma.subscription.findFirst({
          where: {
            userId,
            customerId: subscription.customerId,
            startDate: { lte: previousMonth },
            OR: [
              { endDate: null },
              { endDate: { gte: previousMonth } }
            ]
          },
          include: { plan: true }
        });

        if (previousSubscription) {
          const previousAmount = previousSubscription.plan.monthlyPrice;
          const difference = monthlyAmount - previousAmount;
          
          if (difference > 0) {
            expansionMRR += difference;
          } else if (difference < 0) {
            contractionMRR += Math.abs(difference);
          }
        }

        // Check for churn
        if (subscription.endDate && subscription.endDate >= startOfMonth && subscription.endDate <= endOfMonth) {
          churnMRR += monthlyAmount;
        }
      }

      const netNewMRR = newMRR + expansionMRR - contractionMRR - churnMRR;

      return {
        totalMRR,
        newMRR,
        expansionMRR,
        contractionMRR,
        churnMRR,
        netNewMRR,
        date: targetDate
      };
    } catch (error) {
      throw new Error(`Failed to calculate MRR: ${error.message}`);
    }
  }

  async calculateARR(userId: string, date?: Date) {
    try {
      const mrrData = await this.calculateMRR(userId, date);
      return {
        totalARR: mrrData.totalMRR * 12,
        newARR: mrrData.newMRR * 12,
        expansionARR: mrrData.expansionMRR * 12,
        contractionARR: mrrData.contractionMRR * 12,
        churnARR: mrrData.churnMRR * 12,
        netNewARR: mrrData.netNewMRR * 12,
        date: mrrData.date
      };
    } catch (error) {
      throw new Error(`Failed to calculate ARR: ${error.message}`);
    }
  }

  // Net Revenue Retention (NRR)
  async calculateNRR(userId: string, period: 'month' | 'quarter' | 'year' = 'month') {
    try {
      const endDate = new Date();
      let startDate: Date;

      switch (period) {
        case 'month':
          startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
          break;
        case 'quarter':
          startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 3, 1);
          break;
        case 'year':
          startDate = new Date(endDate.getFullYear() - 1, endDate.getMonth(), 1);
          break;
      }

      // Get revenue at start of period
      const startRevenue = await this.getRevenueForPeriod(userId, startDate, new Date(startDate.getTime() + 24 * 60 * 60 * 1000));
      
      // Get revenue at end of period
      const endRevenue = await this.getRevenueForPeriod(userId, new Date(endDate.getTime() - 24 * 60 * 60 * 1000), endDate);

      // Calculate NRR
      const nrr = (endRevenue / startRevenue) * 100;

      return {
        nrr,
        startRevenue,
        endRevenue,
        period,
        startDate,
        endDate
      };
    } catch (error) {
      throw new Error(`Failed to calculate NRR: ${error.message}`);
    }
  }

  // Gross Revenue Retention (GRR)
  async calculateGRR(userId: string, period: 'month' | 'quarter' | 'year' = 'month') {
    try {
      const endDate = new Date();
      let startDate: Date;

      switch (period) {
        case 'month':
          startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
          break;
        case 'quarter':
          startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 3, 1);
          break;
        case 'year':
          startDate = new Date(endDate.getFullYear() - 1, endDate.getMonth(), 1);
          break;
      }

      // Get base revenue (excluding expansion)
      const baseRevenue = await this.getBaseRevenueForPeriod(userId, startDate, endDate);
      
      // Get retained revenue (excluding churn)
      const retainedRevenue = await this.getRetainedRevenueForPeriod(userId, startDate, endDate);

      const grr = (retainedRevenue / baseRevenue) * 100;

      return {
        grr,
        baseRevenue,
        retainedRevenue,
        period,
        startDate,
        endDate
      };
    } catch (error) {
      throw new Error(`Failed to calculate GRR: ${error.message}`);
    }
  }

  // Quick Ratio (new+expansion MRR / churned+contraction MRR)
  async calculateQuickRatio(userId: string, date?: Date) {
    try {
      const mrrData = await this.calculateMRR(userId, date);
      
      const numerator = mrrData.newMRR + mrrData.expansionMRR;
      const denominator = mrrData.churnMRR + mrrData.contractionMRR;
      
      const quickRatio = denominator > 0 ? numerator / denominator : numerator;

      return {
        quickRatio,
        numerator,
        denominator,
        newMRR: mrrData.newMRR,
        expansionMRR: mrrData.expansionMRR,
        churnMRR: mrrData.churnMRR,
        contractionMRR: mrrData.contractionMRR,
        date: mrrData.date
      };
    } catch (error) {
      throw new Error(`Failed to calculate Quick Ratio: ${error.message}`);
    }
  }

  // Rule of 40 (growth rate + profit margin)
  async calculateRuleOf40(userId: string, period: 'month' | 'quarter' | 'year' = 'month') {
    try {
      const endDate = new Date();
      let startDate: Date;

      switch (period) {
        case 'month':
          startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
          break;
        case 'quarter':
          startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 3, 1);
          break;
        case 'year':
          startDate = new Date(endDate.getFullYear() - 1, endDate.getMonth(), 1);
          break;
      }

      // Calculate growth rate
      const currentRevenue = await this.getRevenueForPeriod(userId, startDate, endDate);
      const previousRevenue = await this.getRevenueForPeriod(userId, 
        new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime())), 
        startDate
      );
      
      const growthRate = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

      // Calculate profit margin
      const expenses = await this.getExpensesForPeriod(userId, startDate, endDate);
      const profitMargin = currentRevenue > 0 ? ((currentRevenue - expenses) / currentRevenue) * 100 : 0;

      const ruleOf40 = growthRate + profitMargin;

      return {
        ruleOf40,
        growthRate,
        profitMargin,
        currentRevenue,
        previousRevenue,
        expenses,
        period,
        startDate,
        endDate
      };
    } catch (error) {
      throw new Error(`Failed to calculate Rule of 40: ${error.message}`);
    }
  }

  // Magic Number (sales efficiency)
  async calculateMagicNumber(userId: string, period: 'month' | 'quarter' | 'year' = 'month') {
    try {
      const endDate = new Date();
      let startDate: Date;

      switch (period) {
        case 'month':
          startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
          break;
        case 'quarter':
          startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 3, 1);
          break;
        case 'year':
          startDate = new Date(endDate.getFullYear() - 1, endDate.getMonth(), 1);
          break;
      }

      // Get new ARR added in period
      const newARR = await this.getNewARRForPeriod(userId, startDate, endDate);
      
      // Get sales and marketing spend
      const salesMarketingSpend = await this.getSalesMarketingSpendForPeriod(userId, startDate, endDate);

      const magicNumber = salesMarketingSpend > 0 ? newARR / salesMarketingSpend : 0;

      return {
        magicNumber,
        newARR,
        salesMarketingSpend,
        period,
        startDate,
        endDate
      };
    } catch (error) {
      throw new Error(`Failed to calculate Magic Number: ${error.message}`);
    }
  }

  // Burn Multiple (cash burned / net new ARR)
  async calculateBurnMultiple(userId: string, period: 'month' | 'quarter' | 'year' = 'month') {
    try {
      const endDate = new Date();
      let startDate: Date;

      switch (period) {
        case 'month':
          startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
          break;
        case 'quarter':
          startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 3, 1);
          break;
        case 'year':
          startDate = new Date(endDate.getFullYear() - 1, endDate.getMonth(), 1);
          break;
      }

      // Get net new ARR
      const mrrData = await this.calculateMRR(userId, endDate);
      const netNewARR = mrrData.netNewMRR * 12;

      // Get cash burned (negative cash flow)
      const cashFlow = await this.getCashFlowForPeriod(userId, startDate, endDate);
      const cashBurned = Math.abs(Math.min(0, cashFlow));

      const burnMultiple = netNewARR > 0 ? cashBurned / netNewARR : 0;

      return {
        burnMultiple,
        cashBurned,
        netNewARR,
        cashFlow,
        period,
        startDate,
        endDate
      };
    } catch (error) {
      throw new Error(`Failed to calculate Burn Multiple: ${error.message}`);
    }
  }

  // CAC Payback Period by Channel
  async calculateCACPaybackPeriod(userId: string, channel?: string) {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);

      // Get CAC by channel
      const cac = await this.getCACByChannel(userId, startDate, endDate, channel);
      
      // Get average monthly revenue per customer
      const avgMonthlyRevenue = await this.getAverageMonthlyRevenuePerCustomer(userId, startDate, endDate);

      const paybackPeriod = avgMonthlyRevenue > 0 ? cac / avgMonthlyRevenue : 0;

      return {
        paybackPeriod,
        cac,
        avgMonthlyRevenue,
        channel: channel || 'all',
        startDate,
        endDate
      };
    } catch (error) {
      throw new Error(`Failed to calculate CAC Payback Period: ${error.message}`);
    }
  }

  // LTV:CAC Ratio with Cohort Analysis
  async calculateLTVCACRatio(userId: string, cohort?: string) {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);

      // Get LTV
      const ltv = await this.getLTV(userId, cohort);
      
      // Get CAC
      const cac = await this.getCACByChannel(userId, startDate, endDate);

      const ltvCacRatio = cac > 0 ? ltv / cac : 0;

      return {
        ltvCacRatio,
        ltv,
        cac,
        cohort: cohort || 'all',
        startDate,
        endDate
      };
    } catch (error) {
      throw new Error(`Failed to calculate LTV:CAC Ratio: ${error.message}`);
    }
  }

  // Comprehensive SaaS Metrics Dashboard
  async getSaaSMetricsDashboard(userId: string, date?: Date) {
    try {
      const targetDate = date || new Date();

      const [
        mrrData,
        arrData,
        nrrData,
        grrData,
        quickRatioData,
        ruleOf40Data,
        magicNumberData,
        burnMultipleData,
        cacPaybackData,
        ltvCacData
      ] = await Promise.all([
        this.calculateMRR(userId, targetDate),
        this.calculateARR(userId, targetDate),
        this.calculateNRR(userId, 'month'),
        this.calculateGRR(userId, 'month'),
        this.calculateQuickRatio(userId, targetDate),
        this.calculateRuleOf40(userId, 'month'),
        this.calculateMagicNumber(userId, 'month'),
        this.calculateBurnMultiple(userId, 'month'),
        this.calculateCACPaybackPeriod(userId),
        this.calculateLTVCACRatio(userId)
      ]);

      return {
        mrr: mrrData,
        arr: arrData,
        nrr: nrrData,
        grr: grrData,
        quickRatio: quickRatioData,
        ruleOf40: ruleOf40Data,
        magicNumber: magicNumberData,
        burnMultiple: burnMultipleData,
        cacPayback: cacPaybackData,
        ltvCac: ltvCacData,
        generatedAt: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to get SaaS metrics dashboard: ${error.message}`);
    }
  }

  // Helper Methods
  private async getRevenueForPeriod(userId: string, startDate: Date, endDate: Date): Promise<number> {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'income',
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    return transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  }

  private async getBaseRevenueForPeriod(userId: string, startDate: Date, endDate: Date): Promise<number> {
    // Simplified implementation - would need more complex logic for actual base revenue
    return await this.getRevenueForPeriod(userId, startDate, endDate);
  }

  private async getRetainedRevenueForPeriod(userId: string, startDate: Date, endDate: Date): Promise<number> {
    // Simplified implementation - would need more complex logic for retained revenue
    return await this.getRevenueForPeriod(userId, startDate, endDate);
  }

  private async getExpensesForPeriod(userId: string, startDate: Date, endDate: Date): Promise<number> {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'expense',
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    return transactions.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  }

  private async getNewARRForPeriod(userId: string, startDate: Date, endDate: Date): Promise<number> {
    const mrrData = await this.calculateMRR(userId, endDate);
    return mrrData.newMRR * 12;
  }

  private async getSalesMarketingSpendForPeriod(userId: string, startDate: Date, endDate: Date): Promise<number> {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'expense',
        category: {
          in: ['Sales', 'Marketing', 'Advertising']
        },
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    return transactions.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  }

  private async getCashFlowForPeriod(userId: string, startDate: Date, endDate: Date): Promise<number> {
    const income = await this.getRevenueForPeriod(userId, startDate, endDate);
    const expenses = await this.getExpensesForPeriod(userId, startDate, endDate);
    return income - expenses;
  }

  private async getCACByChannel(userId: string, startDate: Date, endDate: Date, channel?: string): Promise<number> {
    // Simplified implementation - would need actual CAC tracking
    const salesMarketingSpend = await this.getSalesMarketingSpendForPeriod(userId, startDate, endDate);
    const newCustomers = await this.getNewCustomersForPeriod(userId, startDate, endDate);
    return newCustomers > 0 ? salesMarketingSpend / newCustomers : 0;
  }

  private async getAverageMonthlyRevenuePerCustomer(userId: string, startDate: Date, endDate: Date): Promise<number> {
    const revenue = await this.getRevenueForPeriod(userId, startDate, endDate);
    const activeCustomers = await this.getActiveCustomersForPeriod(userId, startDate, endDate);
    return activeCustomers > 0 ? revenue / activeCustomers : 0;
  }

  private async getLTV(userId: string, cohort?: string): Promise<number> {
    // Simplified implementation - would need actual LTV calculation
    const avgMonthlyRevenue = await this.getAverageMonthlyRevenuePerCustomer(userId, 
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
      new Date()
    );
    const avgLifespanMonths = 24; // Simplified assumption
    return avgMonthlyRevenue * avgLifespanMonths;
  }

  private async getNewCustomersForPeriod(userId: string, startDate: Date, endDate: Date): Promise<number> {
    const customers = await prisma.customer.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });
    return customers.length;
  }

  private async getActiveCustomersForPeriod(userId: string, startDate: Date, endDate: Date): Promise<number> {
    const customers = await prisma.customer.findMany({
      where: {
        userId,
        OR: [
          { createdAt: { lte: endDate } },
          { 
            subscriptions: {
              some: {
                status: 'active',
                startDate: { lte: endDate },
                OR: [
                  { endDate: null },
                  { endDate: { gte: startDate } }
                ]
              }
            }
          }
        ]
      }
    });
    return customers.length;
  }
}

export default new SaaSMetricsService();






