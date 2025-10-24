import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DataAggregationService {
  // Get user profile data for auto-filling prompts
  static async getUserProfile(userId: string, organizationId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true
        }
      });

      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: {
          name: true,
          industry: true,
          size: true,
          currency: true,
          timezone: true,
          createdAt: true
        }
      });

      return {
        user: {
          name: `${user?.firstName} ${user?.lastName}`,
          email: user?.email,
          memberSince: user?.createdAt
        },
        organization: {
          name: organization?.name,
          industry: organization?.industry || 'Professional Services',
          size: organization?.size || 'Small Business',
          currency: organization?.currency || 'USD',
          timezone: organization?.timezone || 'UTC',
          established: organization?.createdAt
        }
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Get financial metrics for auto-filling prompts
  static async getFinancialMetrics(organizationId: string, timeRange: string = '12months') {
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '3months':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case '6months':
          startDate.setMonth(endDate.getMonth() - 6);
          break;
        case '12months':
        default:
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Get transaction data
      const transactions = await prisma.transaction.findMany({
        where: {
          organizationId,
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          type: true,
          amount: true,
          category: true,
          date: true
        }
      });

      // Calculate metrics
      const totalRevenue = transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalExpenses = transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      // Get invoice data
      const invoices = await prisma.invoice.findMany({
        where: {
          organizationId,
          issueDate: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          total: true,
          status: true,
          issueDate: true
        }
      });

      const totalInvoiced = invoices.reduce((sum, i) => sum + Number(i.total), 0);
      const paidInvoices = invoices.filter(i => i.status === 'paid').length;
      const totalInvoices = invoices.length;
      const paymentRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;

      // Calculate growth rate (simplified)
      const currentPeriodRevenue = totalRevenue;
      const previousPeriodStart = new Date(startDate);
      previousPeriodStart.setMonth(previousPeriodStart.getMonth() - (timeRange === '3months' ? 3 : timeRange === '6months' ? 6 : 12));
      
      const previousPeriodTransactions = await prisma.transaction.findMany({
        where: {
          organizationId,
          type: 'INCOME',
          date: {
            gte: previousPeriodStart,
            lt: startDate
          }
        },
        select: { amount: true }
      });

      const previousPeriodRevenue = previousPeriodTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
      const growthRate = previousPeriodRevenue > 0 ? ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 : 0;

      return {
        revenue: {
          total: totalRevenue,
          growthRate: growthRate,
          monthlyAverage: totalRevenue / (timeRange === '3months' ? 3 : timeRange === '6months' ? 6 : 12)
        },
        expenses: {
          total: totalExpenses,
          monthlyAverage: totalExpenses / (timeRange === '3months' ? 3 : timeRange === '6months' ? 6 : 12)
        },
        profitability: {
          netProfit: netProfit,
          profitMargin: profitMargin
        },
        invoicing: {
          totalInvoiced: totalInvoiced,
          paymentRate: paymentRate,
          totalInvoices: totalInvoices,
          paidInvoices: paidInvoices
        },
        timeRange: {
          start: startDate,
          end: endDate,
          period: timeRange
        }
      };
    } catch (error) {
      console.error('Error fetching financial metrics:', error);
      return null;
    }
  }

  // Get seasonal patterns for cash flow analysis
  static async getSeasonalPatterns(organizationId: string) {
    try {
      const transactions = await prisma.transaction.findMany({
        where: {
          organizationId,
          date: {
            gte: new Date(new Date().getFullYear() - 1, 0, 1)
          }
        },
        select: {
          type: true,
          amount: true,
          date: true
        }
      });

      // Group by month
      const monthlyData = transactions.reduce((acc, transaction) => {
        const month = transaction.date.getMonth();
        const key = `${transaction.type}_${month}`;
        
        if (!acc[key]) {
          acc[key] = { amount: 0, count: 0 };
        }
        
        acc[key].amount += Number(transaction.amount);
        acc[key].count += 1;
        
        return acc;
      }, {} as Record<string, { amount: number; count: number }>);

      // Calculate seasonal patterns
      const incomePattern = Array.from({ length: 12 }, (_, i) => {
        const key = `INCOME_${i}`;
        return monthlyData[key]?.amount || 0;
      });

      const expensePattern = Array.from({ length: 12 }, (_, i) => {
        const key = `EXPENSE_${i}`;
        return monthlyData[key]?.amount || 0;
      });

      const peakMonth = incomePattern.indexOf(Math.max(...incomePattern));
      const lowMonth = incomePattern.indexOf(Math.min(...incomePattern));

      return {
        incomePattern,
        expensePattern,
        peakMonth: peakMonth + 1, // Convert to 1-based month
        lowMonth: lowMonth + 1,
        seasonality: {
          hasSeasonalPattern: Math.max(...incomePattern) / Math.min(...incomePattern) > 1.5,
          peakToLowRatio: Math.max(...incomePattern) / Math.min(...incomePattern)
        }
      };
    } catch (error) {
      console.error('Error fetching seasonal patterns:', error);
      return null;
    }
  }

  // Get industry benchmarks (mock data for now)
  static async getIndustryBenchmarks(industry: string) {
    // This would typically come from an external API or database
    const benchmarks: Record<string, any> = {
      'Professional Services': {
        profitMargin: 15.2,
        revenueGrowth: 8.5,
        expenseRatio: 0.65,
        cashConversionCycle: 45
      },
      'Technology': {
        profitMargin: 22.1,
        revenueGrowth: 12.3,
        expenseRatio: 0.58,
        cashConversionCycle: 30
      },
      'Retail': {
        profitMargin: 8.7,
        revenueGrowth: 5.2,
        expenseRatio: 0.78,
        cashConversionCycle: 60
      },
      'Manufacturing': {
        profitMargin: 12.4,
        revenueGrowth: 6.8,
        expenseRatio: 0.72,
        cashConversionCycle: 75
      }
    };

    return benchmarks[industry] || benchmarks['Professional Services'];
  }

  // Auto-populate prompt fields based on available data
  static async populatePromptFields(promptId: string, userId: string, organizationId: string) {
    try {
      const userProfile = await this.getUserProfile(userId, organizationId);
      const financialMetrics = await this.getFinancialMetrics(organizationId);
      const seasonalPatterns = await this.getSeasonalPatterns(organizationId);
      const benchmarks = userProfile?.organization.industry 
        ? await this.getIndustryBenchmarks(userProfile.organization.industry)
        : null;

      const populatedData: Record<string, any> = {};

      // Map common field names to data
      if (userProfile) {
        populatedData['CLIENT_INDUSTRY'] = userProfile.organization.industry;
        populatedData['BUSINESS_MODEL'] = userProfile.organization.size;
        populatedData['EMPLOYEE_COUNT'] = userProfile.organization.size === 'Small Business' ? '1-10' : 
          userProfile.organization.size === 'Medium Business' ? '11-50' : '50+';
        populatedData['REVENUE_RANGE'] = financialMetrics?.revenue.total 
          ? `$${Math.round(financialMetrics.revenue.total / 1000)}K annually`
          : 'Not available';
      }

      if (financialMetrics) {
        populatedData['ANNUAL_REVENUE'] = financialMetrics.revenue.total;
        populatedData['GROWTH_RATE'] = financialMetrics.revenue.growthRate;
        populatedData['PROFIT_MARGIN'] = financialMetrics.profitability.profitMargin;
        populatedData['CASH_FLOW'] = financialMetrics.profitability.netProfit;
        populatedData['EFFECTIVE_TAX_RATE'] = 25; // Default, would be calculated from actual tax data
      }

      if (seasonalPatterns) {
        populatedData['SEASONALITY'] = seasonalPatterns.hasSeasonalPattern 
          ? `Peak in month ${seasonalPatterns.peakMonth}, low in month ${seasonalPatterns.lowMonth}`
          : 'No significant seasonal patterns detected';
        populatedData['CASH_CONVERSION_CYCLE'] = benchmarks?.cashConversionCycle || 45;
      }

      if (benchmarks) {
        populatedData['INDUSTRY_BENCHMARKS'] = `Industry average profit margin: ${benchmarks.profitMargin}%, Growth rate: ${benchmarks.revenueGrowth}%`;
      }

      return populatedData;
    } catch (error) {
      console.error('Error populating prompt fields:', error);
      return {};
    }
  }
}




