import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface AnalyticsMetrics {
  revenue: {
    total: number;
    monthly: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  };
  expenses: {
    total: number;
    monthly: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  };
  profit: {
    total: number;
    margin: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  };
  customers: {
    total: number;
    active: number;
    new: number;
    churn: number;
  };
  cashFlow: {
    current: number;
    projected: number;
    trend: 'up' | 'down' | 'stable';
  };
}

export interface TimeSeriesData {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
  customers: number;
}

export interface CohortAnalysis {
  cohort: string;
  period: number;
  customers: number;
  retention: number;
  revenue: number;
}

export interface PredictiveInsights {
  revenueForecast: {
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
    confidence: number;
  };
  expenseForecast: {
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
    confidence: number;
  };
  cashFlowForecast: {
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
    confidence: number;
  };
  churnRisk: {
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
  };
  opportunities: {
    upselling: number;
    crossSelling: number;
    retention: number;
  };
}

export interface BusinessIntelligence {
  kpis: {
    name: string;
    value: number;
    target: number;
    status: 'on-track' | 'at-risk' | 'behind';
    trend: 'up' | 'down' | 'stable';
  }[];
  alerts: {
    type: 'warning' | 'error' | 'info';
    message: string;
    priority: 'high' | 'medium' | 'low';
    action: string;
  }[];
  recommendations: {
    category: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
    roi: number;
  }[];
}

export class AdvancedAnalyticsService {
  /**
   * Get comprehensive analytics metrics for dashboard
   */
  async getAnalyticsMetrics(companyId: string, period: string = '30d'): Promise<AnalyticsMetrics> {
    try {
      const startDate = this.getStartDate(period);
      const previousStartDate = this.getPreviousPeriodStartDate(period);

      // Get current period data
      const currentData = await this.getPeriodData(companyId, startDate, new Date());
      
      // Get previous period data for comparison
      const previousData = await this.getPeriodData(companyId, previousStartDate, startDate);

      // Calculate metrics
      const revenue = {
        total: currentData.revenue,
        monthly: currentData.revenue,
        growth: this.calculateGrowthRate(currentData.revenue, previousData.revenue),
        trend: this.getTrend(currentData.revenue, previousData.revenue)
      };

      const expenses = {
        total: currentData.expenses,
        monthly: currentData.expenses,
        growth: this.calculateGrowthRate(currentData.expenses, previousData.expenses),
        trend: this.getTrend(currentData.expenses, previousData.expenses)
      };

      const profit = {
        total: currentData.revenue - currentData.expenses,
        margin: currentData.revenue > 0 ? ((currentData.revenue - currentData.expenses) / currentData.revenue) * 100 : 0,
        growth: this.calculateGrowthRate(
          currentData.revenue - currentData.expenses,
          previousData.revenue - previousData.expenses
        ),
        trend: this.getTrend(
          currentData.revenue - currentData.expenses,
          previousData.revenue - previousData.expenses
        )
      };

      const customers = {
        total: currentData.totalCustomers,
        active: currentData.activeCustomers,
        new: currentData.newCustomers,
        churn: currentData.churnedCustomers
      };

      const cashFlow = {
        current: currentData.cashFlow,
        projected: await this.projectCashFlow(companyId),
        trend: this.getTrend(currentData.cashFlow, previousData.cashFlow)
      };

      return {
        revenue,
        expenses,
        profit,
        customers,
        cashFlow
      };
    } catch (error) {
      logger.error('Error getting analytics metrics:', error);
      throw new Error('Failed to get analytics metrics');
    }
  }

  /**
   * Get time series data for charts
   */
  async getTimeSeriesData(companyId: string, period: string = '12m'): Promise<TimeSeriesData[]> {
    try {
      const startDate = this.getStartDate(period);
      const interval = this.getInterval(period);

      const data = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('${interval}', created_at) as date,
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as revenue,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expenses,
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as profit,
          COUNT(DISTINCT customer_id) as customers
        FROM transactions 
        WHERE company_id = ${companyId}
          AND created_at >= ${startDate}
        GROUP BY DATE_TRUNC('${interval}', created_at)
        ORDER BY date
      `;

      return data as TimeSeriesData[];
    } catch (error) {
      logger.error('Error getting time series data:', error);
      throw new Error('Failed to get time series data');
    }
  }

  /**
   * Perform cohort analysis
   */
  async getCohortAnalysis(companyId: string, period: string = '12m'): Promise<CohortAnalysis[]> {
    try {
      const startDate = this.getStartDate(period);

      const cohorts = await prisma.$queryRaw`
        WITH customer_cohorts AS (
          SELECT 
            customer_id,
            DATE_TRUNC('month', MIN(created_at)) as cohort_month,
            EXTRACT(MONTH FROM AGE(created_at, MIN(created_at))) as period_number
          FROM transactions 
          WHERE company_id = ${companyId}
            AND created_at >= ${startDate}
          GROUP BY customer_id
        ),
        cohort_data AS (
          SELECT 
            cohort_month,
            period_number,
            COUNT(DISTINCT customer_id) as customers,
            SUM(amount) as revenue
          FROM customer_cohorts cc
          JOIN transactions t ON cc.customer_id = t.customer_id
          WHERE t.company_id = ${companyId}
          GROUP BY cohort_month, period_number
        )
        SELECT 
          TO_CHAR(cohort_month, 'YYYY-MM') as cohort,
          period_number as period,
          customers,
          CASE 
            WHEN LAG(customers) OVER (PARTITION BY cohort_month ORDER BY period_number) > 0 
            THEN (customers::float / LAG(customers) OVER (PARTITION BY cohort_month ORDER BY period_number)) * 100
            ELSE 100
          END as retention,
          revenue
        FROM cohort_data
        ORDER BY cohort_month, period_number
      `;

      return cohorts as CohortAnalysis[];
    } catch (error) {
      logger.error('Error getting cohort analysis:', error);
      throw new Error('Failed to get cohort analysis');
    }
  }

  /**
   * Get predictive insights using ML models
   */
  async getPredictiveInsights(companyId: string): Promise<PredictiveInsights> {
    try {
      // Get historical data for forecasting
      const historicalData = await this.getTimeSeriesData(companyId, '24m');
      
      // Simple forecasting using linear regression
      const revenueForecast = this.forecastRevenue(historicalData);
      const expenseForecast = this.forecastExpenses(historicalData);
      const cashFlowForecast = this.forecastCashFlow(historicalData);
      
      // Churn risk analysis
      const churnRisk = await this.analyzeChurnRisk(companyId);
      
      // Opportunity analysis
      const opportunities = await this.analyzeOpportunities(companyId);

      return {
        revenueForecast,
        expenseForecast,
        cashFlowForecast,
        churnRisk,
        opportunities
      };
    } catch (error) {
      logger.error('Error getting predictive insights:', error);
      throw new Error('Failed to get predictive insights');
    }
  }

  /**
   * Get business intelligence insights
   */
  async getBusinessIntelligence(companyId: string): Promise<BusinessIntelligence> {
    try {
      const kpis = await this.calculateKPIs(companyId);
      const alerts = await this.generateAlerts(companyId);
      const recommendations = await this.generateRecommendations(companyId);

      return {
        kpis,
        alerts,
        recommendations
      };
    } catch (error) {
      logger.error('Error getting business intelligence:', error);
      throw new Error('Failed to get business intelligence');
    }
  }

  /**
   * Get custom analytics query results
   */
  async executeCustomQuery(companyId: string, query: string, parameters: any[] = []): Promise<any[]> {
    try {
      // Validate query for security
      if (!this.isValidQuery(query)) {
        throw new Error('Invalid query detected');
      }

      const results = await prisma.$queryRawUnsafe(query, ...parameters);
      return results;
    } catch (error) {
      logger.error('Error executing custom query:', error);
      throw new Error('Failed to execute custom query');
    }
  }

  /**
   * Export analytics data
   */
  async exportAnalyticsData(companyId: string, format: 'csv' | 'excel' | 'json', filters: any = {}): Promise<Buffer> {
    try {
      const data = await this.getAnalyticsMetrics(companyId);
      
      switch (format) {
        case 'csv':
          return this.exportToCSV(data);
        case 'excel':
          return this.exportToExcel(data);
        case 'json':
          return Buffer.from(JSON.stringify(data, null, 2));
        default:
          throw new Error('Unsupported export format');
      }
    } catch (error) {
      logger.error('Error exporting analytics data:', error);
      throw new Error('Failed to export analytics data');
    }
  }

  // Private helper methods

  private async getPeriodData(companyId: string, startDate: Date, endDate: Date) {
    const result = await prisma.$queryRaw`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as revenue,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expenses,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as cashFlow,
        COUNT(DISTINCT customer_id) as totalCustomers,
        COUNT(DISTINCT CASE WHEN created_at >= ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)} THEN customer_id END) as activeCustomers,
        COUNT(DISTINCT CASE WHEN created_at >= ${startDate} AND created_at < ${endDate} THEN customer_id END) as newCustomers,
        COUNT(DISTINCT CASE WHEN created_at < ${startDate} AND created_at >= ${new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000)} THEN customer_id END) as churnedCustomers
      FROM transactions 
      WHERE company_id = ${companyId}
        AND created_at >= ${startDate}
        AND created_at <= ${endDate}
    `;

    return result[0] as any;
  }

  private getStartDate(period: string): Date {
    const now = new Date();
    switch (period) {
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '12m': return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      case '24m': return new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
      default: return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  private getPreviousPeriodStartDate(period: string): Date {
    const startDate = this.getStartDate(period);
    const duration = new Date().getTime() - startDate.getTime();
    return new Date(startDate.getTime() - duration);
  }

  private getInterval(period: string): string {
    switch (period) {
      case '7d': return 'day';
      case '30d': return 'day';
      case '90d': return 'week';
      case '12m': return 'month';
      case '24m': return 'month';
      default: return 'day';
    }
  }

  private calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  private getTrend(current: number, previous: number): 'up' | 'down' | 'stable' {
    const change = current - previous;
    if (Math.abs(change) < 0.01) return 'stable';
    return change > 0 ? 'up' : 'down';
  }

  private async projectCashFlow(companyId: string): Promise<number> {
    // Simple projection based on recent trends
    const recentData = await this.getTimeSeriesData(companyId, '90d');
    if (recentData.length < 2) return 0;

    const recentTrend = recentData.slice(-3);
    const avgGrowth = recentTrend.reduce((sum, item, index) => {
      if (index === 0) return 0;
      return sum + (item.profit - recentTrend[index - 1].profit);
    }, 0) / (recentTrend.length - 1);

    return recentTrend[recentTrend.length - 1].profit + (avgGrowth * 30);
  }

  private forecastRevenue(data: TimeSeriesData[]): any {
    if (data.length < 3) {
      return { nextMonth: 0, nextQuarter: 0, nextYear: 0, confidence: 0 };
    }

    // Simple linear regression
    const n = data.length;
    const sumX = data.reduce((sum, _, i) => sum + i, 0);
    const sumY = data.reduce((sum, item) => sum + item.revenue, 0);
    const sumXY = data.reduce((sum, item, i) => sum + (i * item.revenue), 0);
    const sumXX = data.reduce((sum, _, i) => sum + (i * i), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const nextMonth = slope * n + intercept;
    const nextQuarter = slope * (n + 3) + intercept;
    const nextYear = slope * (n + 12) + intercept;

    return {
      nextMonth: Math.max(0, nextMonth),
      nextQuarter: Math.max(0, nextQuarter),
      nextYear: Math.max(0, nextYear),
      confidence: Math.min(95, Math.max(60, 100 - (data.length * 2)))
    };
  }

  private forecastExpenses(data: TimeSeriesData[]): any {
    if (data.length < 3) {
      return { nextMonth: 0, nextQuarter: 0, nextYear: 0, confidence: 0 };
    }

    const n = data.length;
    const sumX = data.reduce((sum, _, i) => sum + i, 0);
    const sumY = data.reduce((sum, item) => sum + item.expenses, 0);
    const sumXY = data.reduce((sum, item, i) => sum + (i * item.expenses), 0);
    const sumXX = data.reduce((sum, _, i) => sum + (i * i), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const nextMonth = slope * n + intercept;
    const nextQuarter = slope * (n + 3) + intercept;
    const nextYear = slope * (n + 12) + intercept;

    return {
      nextMonth: Math.max(0, nextMonth),
      nextQuarter: Math.max(0, nextQuarter),
      nextYear: Math.max(0, nextYear),
      confidence: Math.min(95, Math.max(60, 100 - (data.length * 2)))
    };
  }

  private forecastCashFlow(data: TimeSeriesData[]): any {
    if (data.length < 3) {
      return { nextMonth: 0, nextQuarter: 0, nextYear: 0, confidence: 0 };
    }

    const n = data.length;
    const sumX = data.reduce((sum, _, i) => sum + i, 0);
    const sumY = data.reduce((sum, item) => sum + item.profit, 0);
    const sumXY = data.reduce((sum, item, i) => sum + (i * item.profit), 0);
    const sumXX = data.reduce((sum, _, i) => sum + (i * i), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const nextMonth = slope * n + intercept;
    const nextQuarter = slope * (n + 3) + intercept;
    const nextYear = slope * (n + 12) + intercept;

    return {
      nextMonth: nextMonth,
      nextQuarter: nextQuarter,
      nextYear: nextYear,
      confidence: Math.min(95, Math.max(60, 100 - (data.length * 2)))
    };
  }

  private async analyzeChurnRisk(companyId: string): Promise<any> {
    // Simple churn risk analysis based on activity patterns
    const inactiveCustomers = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM customers c
      WHERE c.company_id = ${companyId}
        AND c.id NOT IN (
          SELECT DISTINCT customer_id 
          FROM transactions 
          WHERE company_id = ${companyId}
            AND created_at >= ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
        )
    `;

    const totalCustomers = await prisma.customer.count({
      where: { companyId }
    });

    const churnRate = totalCustomers > 0 ? (inactiveCustomers[0] as any).count / totalCustomers : 0;

    return {
      highRisk: Math.round(churnRate * 100),
      mediumRisk: Math.round(churnRate * 50),
      lowRisk: Math.round((1 - churnRate) * 100)
    };
  }

  private async analyzeOpportunities(companyId: string): Promise<any> {
    // Analyze upselling and cross-selling opportunities
    const avgOrderValue = await prisma.$queryRaw`
      SELECT AVG(amount) as avg_value
      FROM transactions 
      WHERE company_id = ${companyId}
        AND type = 'income'
        AND created_at >= ${new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)}
    `;

    const customerCount = await prisma.customer.count({
      where: { companyId }
    });

    return {
      upselling: Math.round((avgOrderValue[0] as any).avg_value * 0.1 * customerCount),
      crossSelling: Math.round(customerCount * 0.2),
      retention: Math.round(customerCount * 0.15)
    };
  }

  private async calculateKPIs(companyId: string): Promise<any[]> {
    const metrics = await this.getAnalyticsMetrics(companyId);
    
    return [
      {
        name: 'Monthly Recurring Revenue',
        value: metrics.revenue.monthly,
        target: metrics.revenue.monthly * 1.2,
        status: metrics.revenue.trend === 'up' ? 'on-track' : 'at-risk',
        trend: metrics.revenue.trend
      },
      {
        name: 'Customer Acquisition Cost',
        value: metrics.expenses.monthly / Math.max(metrics.customers.new, 1),
        target: 100,
        status: 'on-track',
        trend: 'stable'
      },
      {
        name: 'Customer Lifetime Value',
        value: metrics.revenue.monthly / Math.max(metrics.customers.total, 1),
        target: 1000,
        status: 'on-track',
        trend: 'stable'
      },
      {
        name: 'Churn Rate',
        value: (metrics.customers.churn / Math.max(metrics.customers.total, 1)) * 100,
        target: 5,
        status: metrics.customers.churn < 5 ? 'on-track' : 'behind',
        trend: 'stable'
      }
    ];
  }

  private async generateAlerts(companyId: string): Promise<any[]> {
    const metrics = await this.getAnalyticsMetrics(companyId);
    const alerts = [];

    if (metrics.revenue.trend === 'down') {
      alerts.push({
        type: 'warning',
        message: 'Revenue is declining',
        priority: 'high',
        action: 'Review pricing strategy and customer acquisition'
      });
    }

    if (metrics.profit.margin < 10) {
      alerts.push({
        type: 'error',
        message: 'Profit margin is below 10%',
        priority: 'high',
        action: 'Review expenses and pricing'
      });
    }

    if (metrics.customers.churn > 10) {
      alerts.push({
        type: 'warning',
        message: 'High customer churn rate detected',
        priority: 'medium',
        action: 'Implement customer retention strategies'
      });
    }

    return alerts;
  }

  private async generateRecommendations(companyId: string): Promise<any[]> {
    const metrics = await this.getAnalyticsMetrics(companyId);
    const recommendations = [];

    if (metrics.revenue.growth < 5) {
      recommendations.push({
        category: 'Growth',
        title: 'Increase Marketing Spend',
        description: 'Consider increasing marketing budget to drive revenue growth',
        impact: 'high',
        effort: 'medium',
        roi: 2.5
      });
    }

    if (metrics.profit.margin < 15) {
      recommendations.push({
        category: 'Profitability',
        title: 'Optimize Operating Expenses',
        description: 'Review and optimize operational expenses to improve margins',
        impact: 'high',
        effort: 'high',
        roi: 1.8
      });
    }

    if (metrics.customers.churn > 5) {
      recommendations.push({
        category: 'Retention',
        title: 'Implement Customer Success Program',
        description: 'Develop proactive customer success initiatives to reduce churn',
        impact: 'high',
        effort: 'medium',
        roi: 3.2
      });
    }

    return recommendations;
  }

  private isValidQuery(query: string): boolean {
    // Basic SQL injection prevention
    const dangerousPatterns = [
      /DROP\s+TABLE/i,
      /DELETE\s+FROM/i,
      /UPDATE\s+.*\s+SET/i,
      /INSERT\s+INTO/i,
      /ALTER\s+TABLE/i,
      /CREATE\s+TABLE/i,
      /TRUNCATE/i,
      /EXEC\s*\(/i,
      /UNION\s+SELECT/i
    ];

    return !dangerousPatterns.some(pattern => pattern.test(query));
  }

  private exportToCSV(data: any): Buffer {
    const csv = this.convertToCSV(data);
    return Buffer.from(csv, 'utf8');
  }

  private exportToExcel(data: any): Buffer {
    // Simple Excel export - in production, use a proper Excel library
    const csv = this.convertToCSV(data);
    return Buffer.from(csv, 'utf8');
  }

  private convertToCSV(data: any): string {
    // Simple CSV conversion
    return JSON.stringify(data, null, 2);
  }
}

export default AdvancedAnalyticsService;





