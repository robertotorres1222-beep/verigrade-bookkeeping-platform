import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface SpendingAnomaly {
  id: string;
  userId: string;
  category: string;
  anomalyType: 'spike' | 'drop' | 'unusual_pattern' | 'budget_overrun';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  currentValue: number;
  expectedValue: number;
  variance: number;
  variancePercentage: number;
  detectedAt: Date;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
}

export interface SpendingPattern {
  category: string;
  averageMonthly: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonality: boolean;
  volatility: number;
  lastMonth: number;
  averageLast3Months: number;
  averageLast12Months: number;
}

export interface BudgetAlert {
  id: string;
  userId: string;
  category: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  daysRemaining: number;
  projectedOverspend: number;
  alertLevel: 'warning' | 'critical';
  createdAt: Date;
}

export class SpendingAnomalyService {
  /**
   * Detect spending anomalies for user
   */
  async detectSpendingAnomalies(userId: string): Promise<SpendingAnomaly[]> {
    try {
      const anomalies: SpendingAnomaly[] = [];
      
      // Get user's spending patterns by category
      const spendingPatterns = await this.analyzeSpendingPatterns(userId);
      
      // Get current month spending
      const currentMonthSpending = await this.getCurrentMonthSpending(userId);
      
      // Check for anomalies in each category
      for (const pattern of spendingPatterns) {
        const currentSpending = currentMonthSpending[pattern.category] || 0;
        const expectedSpending = pattern.averageMonthly;
        
        if (currentSpending > 0) {
          const variance = currentSpending - expectedSpending;
          const variancePercentage = expectedSpending > 0 ? (variance / expectedSpending) * 100 : 0;
          
          // Detect different types of anomalies
          const spikeAnomaly = this.detectSpendingSpike(pattern, currentSpending, variancePercentage);
          if (spikeAnomaly) {
            anomalies.push(spikeAnomaly);
          }
          
          const dropAnomaly = this.detectSpendingDrop(pattern, currentSpending, variancePercentage);
          if (dropAnomaly) {
            anomalies.push(dropAnomaly);
          }
          
          const unusualPatternAnomaly = this.detectUnusualPattern(pattern, currentSpending);
          if (unusualPatternAnomaly) {
            anomalies.push(unusualPatternAnomaly);
          }
        }
      }
      
      // Check for budget overruns
      const budgetAlerts = await this.checkBudgetOverruns(userId);
      for (const alert of budgetAlerts) {
        const anomaly: SpendingAnomaly = {
          id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          category: alert.category,
          anomalyType: 'budget_overrun',
          description: `Budget overrun detected in ${alert.category}`,
          severity: alert.alertLevel === 'critical' ? 'high' : 'medium',
          currentValue: alert.spentAmount,
          expectedValue: alert.budgetAmount,
          variance: alert.projectedOverspend,
          variancePercentage: alert.percentageUsed - 100,
          detectedAt: new Date(),
          status: 'active'
        };
        anomalies.push(anomaly);
      }
      
      return anomalies;

    } catch (error) {
      console.error('Error detecting spending anomalies:', error);
      return [];
    }
  }

  /**
   * Analyze spending patterns by category
   */
  private async analyzeSpendingPatterns(userId: string): Promise<SpendingPattern[]> {
    try {
      const patterns: SpendingPattern[] = [];
      
      // Get spending data for the last 12 months
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
      
      const expenses = await prisma.expense.findMany({
        where: {
          userId,
          createdAt: { gte: twelveMonthsAgo }
        },
        select: {
          category: true,
          amount: true,
          createdAt: true
        }
      });
      
      // Group by category
      const categoryData = expenses.reduce((acc, expense) => {
        if (!acc[expense.category]) {
          acc[expense.category] = [];
        }
        acc[expense.category].push(expense);
        return acc;
      }, {} as Record<string, any[]>);
      
      // Analyze each category
      for (const [category, categoryExpenses] of Object.entries(categoryData)) {
        const pattern = this.calculateSpendingPattern(category, categoryExpenses);
        patterns.push(pattern);
      }
      
      return patterns;

    } catch (error) {
      console.error('Error analyzing spending patterns:', error);
      return [];
    }
  }

  /**
   * Calculate spending pattern for a category
   */
  private calculateSpendingPattern(category: string, expenses: any[]): SpendingPattern {
    // Group by month
    const monthlySpending = expenses.reduce((acc, expense) => {
      const month = expense.createdAt.toISOString().substring(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const monthlyAmounts = Object.values(monthlySpending);
    const averageMonthly = monthlyAmounts.reduce((sum, amount) => sum + amount, 0) / monthlyAmounts.length;
    
    // Calculate trend
    const recentMonths = monthlyAmounts.slice(-3);
    const olderMonths = monthlyAmounts.slice(0, -3);
    const recentAverage = recentMonths.reduce((sum, amount) => sum + amount, 0) / recentMonths.length;
    const olderAverage = olderMonths.length > 0 ? olderMonths.reduce((sum, amount) => sum + amount, 0) / olderMonths.length : recentAverage;
    
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentAverage > olderAverage * 1.1) {
      trend = 'increasing';
    } else if (recentAverage < olderAverage * 0.9) {
      trend = 'decreasing';
    }
    
    // Calculate volatility (standard deviation)
    const variance = monthlyAmounts.reduce((sum, amount) => sum + Math.pow(amount - averageMonthly, 2), 0) / monthlyAmounts.length;
    const volatility = Math.sqrt(variance);
    
    // Check for seasonality (simplified)
    const seasonality = this.detectSeasonality(monthlySpending);
    
    return {
      category,
      averageMonthly,
      trend,
      seasonality,
      volatility,
      lastMonth: monthlyAmounts[monthlyAmounts.length - 1] || 0,
      averageLast3Months: recentAverage,
      averageLast12Months: averageMonthly
    };
  }

  /**
   * Detect seasonality in spending
   */
  private detectSeasonality(monthlySpending: Record<string, number>): boolean {
    const months = Object.keys(monthlySpending).sort();
    if (months.length < 12) return false;
    
    // Simple seasonality detection - check if certain months are consistently higher/lower
    const monthAverages: Record<string, number[]> = {};
    
    for (const monthKey of months) {
      const month = monthKey.substring(5, 7); // Extract month number
      if (!monthAverages[month]) {
        monthAverages[month] = [];
      }
      monthAverages[month].push(monthlySpending[monthKey]);
    }
    
    // Check for significant seasonal patterns
    for (const [month, amounts] of Object.entries(monthAverages)) {
      if (amounts.length >= 2) {
        const avg = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
        const overallAvg = Object.values(monthlySpending).reduce((sum, amount) => sum + amount, 0) / Object.values(monthlySpending).length;
        
        if (avg > overallAvg * 1.3 || avg < overallAvg * 0.7) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Get current month spending by category
   */
  private async getCurrentMonthSpending(userId: string): Promise<Record<string, number>> {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const expenses = await prisma.expense.findMany({
        where: {
          userId,
          createdAt: { gte: startOfMonth }
        },
        select: {
          category: true,
          amount: true
        }
      });
      
      return expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>);

    } catch (error) {
      console.error('Error getting current month spending:', error);
      return {};
    }
  }

  /**
   * Detect spending spike
   */
  private detectSpendingSpike(
    pattern: SpendingPattern, 
    currentSpending: number, 
    variancePercentage: number
  ): SpendingAnomaly | null {
    // Spike detection: current spending is significantly higher than expected
    if (variancePercentage > 50 && currentSpending > pattern.averageMonthly * 1.5) {
      return {
        id: `spike_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: pattern.category, // This would be the actual userId
        category: pattern.category,
        anomalyType: 'spike',
        description: `Significant spending spike detected in ${pattern.category}`,
        severity: variancePercentage > 100 ? 'high' : variancePercentage > 75 ? 'medium' : 'low',
        currentValue: currentSpending,
        expectedValue: pattern.averageMonthly,
        variance: currentSpending - pattern.averageMonthly,
        variancePercentage,
        detectedAt: new Date(),
        status: 'active'
      };
    }
    
    return null;
  }

  /**
   * Detect spending drop
   */
  private detectSpendingDrop(
    pattern: SpendingPattern, 
    currentSpending: number, 
    variancePercentage: number
  ): SpendingAnomaly | null {
    // Drop detection: current spending is significantly lower than expected
    if (variancePercentage < -50 && currentSpending < pattern.averageMonthly * 0.5) {
      return {
        id: `drop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: pattern.category, // This would be the actual userId
        category: pattern.category,
        anomalyType: 'drop',
        description: `Significant spending drop detected in ${pattern.category}`,
        severity: Math.abs(variancePercentage) > 75 ? 'medium' : 'low',
        currentValue: currentSpending,
        expectedValue: pattern.averageMonthly,
        variance: currentSpending - pattern.averageMonthly,
        variancePercentage,
        detectedAt: new Date(),
        status: 'active'
      };
    }
    
    return null;
  }

  /**
   * Detect unusual patterns
   */
  private detectUnusualPattern(
    pattern: SpendingPattern, 
    currentSpending: number
  ): SpendingAnomaly | null {
    // Unusual pattern detection based on volatility and trend
    const volatilityThreshold = pattern.averageMonthly * 0.5;
    
    if (pattern.volatility > volatilityThreshold && Math.abs(currentSpending - pattern.averageMonthly) > pattern.volatility * 2) {
      return {
        id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: pattern.category, // This would be the actual userId
        category: pattern.category,
        anomalyType: 'unusual_pattern',
        description: `Unusual spending pattern detected in ${pattern.category}`,
        severity: 'medium',
        currentValue: currentSpending,
        expectedValue: pattern.averageMonthly,
        variance: currentSpending - pattern.averageMonthly,
        variancePercentage: pattern.averageMonthly > 0 ? ((currentSpending - pattern.averageMonthly) / pattern.averageMonthly) * 100 : 0,
        detectedAt: new Date(),
        status: 'active'
      };
    }
    
    return null;
  }

  /**
   * Check for budget overruns
   */
  private async checkBudgetOverruns(userId: string): Promise<BudgetAlert[]> {
    try {
      const alerts: BudgetAlert[] = [];
      
      // Get user's budgets
      const budgets = await prisma.budget.findMany({
        where: { userId },
        select: {
          category: true,
          amount: true,
          period: true
        }
      });
      
      // Get current period spending
      const currentSpending = await this.getCurrentMonthSpending(userId);
      
      for (const budget of budgets) {
        const spentAmount = currentSpending[budget.category] || 0;
        const percentageUsed = (spentAmount / budget.amount) * 100;
        
        // Calculate days remaining in month
        const now = new Date();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const daysRemaining = endOfMonth.getDate() - now.getDate();
        
        // Project overspend based on current rate
        const dailyRate = spentAmount / (now.getDate());
        const projectedSpend = dailyRate * endOfMonth.getDate();
        const projectedOverspend = Math.max(0, projectedSpend - budget.amount);
        
        // Create alert if over budget or projected to overspend
        if (percentageUsed > 100 || projectedOverspend > 0) {
          const alert: BudgetAlert = {
            id: `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            category: budget.category,
            budgetAmount: budget.amount,
            spentAmount,
            remainingAmount: Math.max(0, budget.amount - spentAmount),
            percentageUsed,
            daysRemaining,
            projectedOverspend,
            alertLevel: percentageUsed > 120 ? 'critical' : 'warning',
            createdAt: new Date()
          };
          alerts.push(alert);
        }
      }
      
      return alerts;

    } catch (error) {
      console.error('Error checking budget overruns:', error);
      return [];
    }
  }

  /**
   * Get spending insights for user
   */
  async getSpendingInsights(userId: string): Promise<{
    totalSpending: number;
    categoryBreakdown: Record<string, number>;
    topCategories: Array<{ category: string; amount: number; percentage: number }>;
    trends: Array<{ category: string; trend: string; change: number }>;
    anomalies: SpendingAnomaly[];
    budgetAlerts: BudgetAlert[];
  }> {
    try {
      const currentSpending = await this.getCurrentMonthSpending(userId);
      const totalSpending = Object.values(currentSpending).reduce((sum, amount) => sum + amount, 0);
      
      const categoryBreakdown = currentSpending;
      
      const topCategories = Object.entries(categoryBreakdown)
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
      
      const patterns = await this.analyzeSpendingPatterns(userId);
      const trends = patterns.map(pattern => ({
        category: pattern.category,
        trend: pattern.trend,
        change: pattern.averageLast3Months - pattern.averageLast12Months
      }));
      
      const anomalies = await this.detectSpendingAnomalies(userId);
      const budgetAlerts = await this.checkBudgetOverruns(userId);
      
      return {
        totalSpending,
        categoryBreakdown,
        topCategories,
        trends,
        anomalies,
        budgetAlerts
      };

    } catch (error) {
      console.error('Error getting spending insights:', error);
      return {
        totalSpending: 0,
        categoryBreakdown: {},
        topCategories: [],
        trends: [],
        anomalies: [],
        budgetAlerts: []
      };
    }
  }

  /**
   * Get proactive spending alerts
   */
  async getProactiveAlerts(userId: string): Promise<{
    upcomingOverspend: BudgetAlert[];
    unusualActivity: SpendingAnomaly[];
    recommendations: string[];
  }> {
    try {
      const budgetAlerts = await this.checkBudgetOverruns(userId);
      const anomalies = await this.detectSpendingAnomalies(userId);
      
      const recommendations: string[] = [];
      
      // Generate recommendations based on patterns
      const insights = await this.getSpendingInsights(userId);
      
      if (insights.topCategories.length > 0) {
        const topCategory = insights.topCategories[0];
        if (topCategory.percentage > 40) {
          recommendations.push(`Consider reviewing spending in ${topCategory.category} (${topCategory.percentage.toFixed(1)}% of total)`);
        }
      }
      
      if (budgetAlerts.length > 0) {
        recommendations.push('Review budget allocations to prevent overspending');
      }
      
      if (anomalies.length > 0) {
        recommendations.push('Investigate unusual spending patterns');
      }
      
      return {
        upcomingOverspend: budgetAlerts,
        unusualActivity: anomalies,
        recommendations
      };

    } catch (error) {
      console.error('Error getting proactive alerts:', error);
      return {
        upcomingOverspend: [],
        unusualActivity: [],
        recommendations: []
      };
    }
  }
}

export default SpendingAnomalyService;






