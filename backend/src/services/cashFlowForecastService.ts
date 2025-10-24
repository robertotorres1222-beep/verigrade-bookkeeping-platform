import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class CashFlowForecastService {
  // 30/60/90/180 Day Forecasting Engine
  async generateCashFlowForecast(userId: string, forecastDays: number = 90) {
    try {
      const forecast = {
        userId,
        forecastDays,
        generatedAt: new Date(),
        scenarios: []
      };

      // Generate multiple scenarios
      const scenarios = ['optimistic', 'realistic', 'pessimistic'];
      
      for (const scenario of scenarios) {
        const scenarioForecast = await this.generateScenarioForecast(
          userId,
          forecastDays,
          scenario
        );
        forecast.scenarios.push(scenarioForecast);
      }

      // Store forecast
      await prisma.cashFlowForecast.create({
        data: {
          id: uuidv4(),
          userId,
          forecastDays,
          data: JSON.stringify(forecast),
          createdAt: new Date()
        }
      });

      return forecast;
    } catch (error) {
      throw new Error(`Failed to generate cash flow forecast: ${error.message}`);
    }
  }

  // Subscription Renewal Pattern Analysis
  async analyzeRenewalPatterns(userId: string, months: number = 12) {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - months, 1);

      // Get subscription data
      const subscriptions = await prisma.subscription.findMany({
        where: {
          userId,
          startDate: { gte: startDate },
          status: { in: ['active', 'cancelled'] }
        },
        include: {
          plan: true,
          customer: true
        }
      });

      // Analyze renewal patterns
      const patterns = {
        monthlyRenewals: await this.analyzeMonthlyRenewals(subscriptions, startDate, endDate),
        churnPatterns: await this.analyzeChurnPatterns(subscriptions, startDate, endDate),
        expansionPatterns: await this.analyzeExpansionPatterns(subscriptions, startDate, endDate),
        seasonalTrends: await this.analyzeSeasonalTrends(subscriptions, startDate, endDate)
      };

      return patterns;
    } catch (error) {
      throw new Error(`Failed to analyze renewal patterns: ${error.message}`);
    }
  }

  // Seasonal Trend Detection and Factoring
  async detectSeasonalTrends(userId: string, years: number = 2) {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getFullYear() - years, 0, 1);

      // Get historical revenue data
      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          type: 'income',
          date: { gte: startDate }
        },
        orderBy: { date: 'asc' }
      });

      // Analyze seasonal patterns
      const seasonalAnalysis = {
        monthlyAverages: this.calculateMonthlyAverages(transactions),
        quarterlyTrends: this.calculateQuarterlyTrends(transactions),
        yearlyGrowth: this.calculateYearlyGrowth(transactions),
        peakMonths: this.identifyPeakMonths(transactions),
        lowMonths: this.identifyLowMonths(transactions)
      };

      return seasonalAnalysis;
    } catch (error) {
      throw new Error(`Failed to detect seasonal trends: ${error.message}`);
    }
  }

  // Multiple Churn Scenario Modeling
  async modelChurnScenarios(userId: string, baseChurnRate: number) {
    try {
      const scenarios = {
        optimistic: {
          churnRate: baseChurnRate * 0.5,
          description: '50% reduction in churn rate'
        },
        realistic: {
          churnRate: baseChurnRate,
          description: 'Current churn rate maintained'
        },
        pessimistic: {
          churnRate: baseChurnRate * 1.5,
          description: '50% increase in churn rate'
        }
      };

      const scenarioResults = {};

      for (const [scenarioName, scenario] of Object.entries(scenarios)) {
        const impact = await this.calculateChurnImpact(userId, scenario.churnRate);
        scenarioResults[scenarioName] = {
          ...scenario,
          impact,
          revenueImpact: impact.revenueLoss,
          customerImpact: impact.customerLoss
        };
      }

      return scenarioResults;
    } catch (error) {
      throw new Error(`Failed to model churn scenarios: ${error.message}`);
    }
  }

  // Runway Calculator with Burn Rate Analysis
  async calculateRunway(userId: string, currentCash: number, monthlyBurnRate?: number) {
    try {
      // Calculate current burn rate if not provided
      const burnRate = monthlyBurnRate || await this.calculateMonthlyBurnRate(userId);
      
      // Calculate runway in months
      const runwayMonths = burnRate > 0 ? currentCash / burnRate : 0;
      
      // Calculate runway scenarios
      const scenarios = {
        current: {
          burnRate,
          runwayMonths,
          runwayDate: this.addMonths(new Date(), runwayMonths)
        },
        optimistic: {
          burnRate: burnRate * 0.8,
          runwayMonths: burnRate * 0.8 > 0 ? currentCash / (burnRate * 0.8) : 0,
          runwayDate: this.addMonths(new Date(), burnRate * 0.8 > 0 ? currentCash / (burnRate * 0.8) : 0)
        },
        pessimistic: {
          burnRate: burnRate * 1.2,
          runwayMonths: burnRate * 1.2 > 0 ? currentCash / (burnRate * 1.2) : 0,
          runwayDate: this.addMonths(new Date(), burnRate * 1.2 > 0 ? currentCash / (burnRate * 1.2) : 0)
        }
      };

      return {
        currentCash,
        scenarios,
        recommendations: this.generateRunwayRecommendations(runwayMonths, burnRate)
      };
    } catch (error) {
      throw new Error(`Failed to calculate runway: ${error.message}`);
    }
  }

  // Proactive Cash Shortage Alerts with Recommendations
  async checkCashShortageAlerts(userId: string) {
    try {
      const alerts = [];
      const currentDate = new Date();

      // Get current cash position
      const currentCash = await this.getCurrentCashPosition(userId);
      
      // Get forecast for next 90 days
      const forecast = await this.generateCashFlowForecast(userId, 90);
      const realisticScenario = forecast.scenarios.find(s => s.scenario === 'realistic');

      if (realisticScenario) {
        // Check for potential shortages
        for (let day = 1; day <= 90; day++) {
          const projectedCash = realisticScenario.dailyProjections[day - 1]?.projectedCash || 0;
          
          if (projectedCash < 0) {
            const alert = {
              type: 'cash_shortage',
              severity: projectedCash < -10000 ? 'critical' : 'warning',
              projectedDate: this.addDays(currentDate, day),
              projectedShortage: Math.abs(projectedCash),
              daysUntilShortage: day,
              recommendations: this.generateShortageRecommendations(projectedCash, day)
            };
            alerts.push(alert);
          }
        }
      }

      // Store alerts
      for (const alert of alerts) {
        await prisma.cashFlowAlert.create({
          data: {
            id: uuidv4(),
            userId,
            alertType: alert.type,
            severity: alert.severity,
            projectedDate: alert.projectedDate,
            projectedAmount: alert.projectedShortage,
            daysUntilEvent: alert.daysUntilShortage,
            recommendations: JSON.stringify(alert.recommendations),
            createdAt: new Date()
          }
        });
      }

      return alerts;
    } catch (error) {
      throw new Error(`Failed to check cash shortage alerts: ${error.message}`);
    }
  }

  // What-If Scenario Planning
  async runWhatIfScenario(userId: string, scenarioData: any) {
    try {
      const scenarios = {
        priceIncrease: await this.modelPriceIncrease(userId, scenarioData.priceIncrease),
        churnReduction: await this.modelChurnReduction(userId, scenarioData.churnReduction),
        fundingImpact: await this.modelFundingImpact(userId, scenarioData.fundingAmount),
        hiringImpact: await this.modelHiringImpact(userId, scenarioData.newHires),
        expenseOptimization: await this.modelExpenseOptimization(userId, scenarioData.expenseReduction)
      };

      return scenarios;
    } catch (error) {
      throw new Error(`Failed to run what-if scenario: ${error.message}`);
    }
  }

  // Monte Carlo Simulation for Uncertainty Modeling
  async runMonteCarloSimulation(userId: string, iterations: number = 1000) {
    try {
      const simulation = {
        iterations,
        results: [],
        statistics: {}
      };

      for (let i = 0; i < iterations; i++) {
        const scenario = await this.generateRandomScenario(userId);
        simulation.results.push(scenario);
      }

      // Calculate statistics
      simulation.statistics = {
        mean: this.calculateMean(simulation.results),
        median: this.calculateMedian(simulation.results),
        standardDeviation: this.calculateStandardDeviation(simulation.results),
        percentiles: this.calculatePercentiles(simulation.results),
        probabilityOfProfitability: this.calculateProfitabilityProbability(simulation.results)
      };

      return simulation;
    } catch (error) {
      throw new Error(`Failed to run Monte Carlo simulation: ${error.message}`);
    }
  }

  // Helper Methods
  private async generateScenarioForecast(userId: string, days: number, scenario: string) {
    const dailyProjections = [];
    const currentDate = new Date();
    
    // Get base metrics
    const baseRevenue = await this.getBaseMonthlyRevenue(userId);
    const baseExpenses = await this.getBaseMonthlyExpenses(userId);
    
    // Apply scenario multipliers
    const multipliers = {
      optimistic: { revenue: 1.2, expenses: 0.9 },
      realistic: { revenue: 1.0, expenses: 1.0 },
      pessimistic: { revenue: 0.8, expenses: 1.1 }
    };
    
    const multiplier = multipliers[scenario];
    const dailyRevenue = (baseRevenue * multiplier.revenue) / 30;
    const dailyExpenses = (baseExpenses * multiplier.expenses) / 30;
    
    let runningCash = await this.getCurrentCashPosition(userId);
    
    for (let day = 0; day < days; day++) {
      const projectionDate = this.addDays(currentDate, day);
      
      // Apply seasonal adjustments
      const seasonalMultiplier = this.getSeasonalMultiplier(projectionDate);
      const adjustedRevenue = dailyRevenue * seasonalMultiplier;
      const adjustedExpenses = dailyExpenses;
      
      runningCash += adjustedRevenue - adjustedExpenses;
      
      dailyProjections.push({
        date: projectionDate,
        projectedRevenue: adjustedRevenue,
        projectedExpenses: adjustedExpenses,
        projectedCash: runningCash,
        netCashFlow: adjustedRevenue - adjustedExpenses
      });
    }
    
    return {
      scenario,
      dailyProjections,
      totalProjectedRevenue: dailyProjections.reduce((sum, p) => sum + p.projectedRevenue, 0),
      totalProjectedExpenses: dailyProjections.reduce((sum, p) => sum + p.projectedExpenses, 0),
      finalProjectedCash: runningCash
    };
  }

  private async analyzeMonthlyRenewals(subscriptions: any[], startDate: Date, endDate: Date) {
    const monthlyData = {};
    
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(startDate.getFullYear(), startDate.getMonth() + month, 1);
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      
      const monthRenewals = subscriptions.filter(sub => {
        const subDate = new Date(sub.startDate);
        return subDate >= monthStart && subDate <= monthEnd;
      });
      
      monthlyData[monthStart.toISOString().slice(0, 7)] = {
        renewals: monthRenewals.length,
        revenue: monthRenewals.reduce((sum, sub) => sum + sub.plan.monthlyPrice, 0)
      };
    }
    
    return monthlyData;
  }

  private async analyzeChurnPatterns(subscriptions: any[], startDate: Date, endDate: Date) {
    const churnData = {};
    
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(startDate.getFullYear(), startDate.getMonth() + month, 1);
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      
      const monthChurn = subscriptions.filter(sub => {
        if (!sub.endDate) return false;
        const churnDate = new Date(sub.endDate);
        return churnDate >= monthStart && churnDate <= monthEnd;
      });
      
      churnData[monthStart.toISOString().slice(0, 7)] = {
        churn: monthChurn.length,
        revenue: monthChurn.reduce((sum, sub) => sum + sub.plan.monthlyPrice, 0)
      };
    }
    
    return churnData;
  }

  private async analyzeExpansionPatterns(subscriptions: any[], startDate: Date, endDate: Date) {
    // Simplified expansion analysis
    return {};
  }

  private async analyzeSeasonalTrends(subscriptions: any[], startDate: Date, endDate: Date) {
    // Simplified seasonal analysis
    return {};
  }

  private calculateMonthlyAverages(transactions: any[]) {
    const monthlyTotals = {};
    
    transactions.forEach(transaction => {
      const month = transaction.date.toISOString().slice(0, 7);
      if (!monthlyTotals[month]) {
        monthlyTotals[month] = 0;
      }
      monthlyTotals[month] += transaction.amount;
    });
    
    const months = Object.keys(monthlyTotals);
    const totalRevenue = Object.values(monthlyTotals).reduce((sum: number, amount: any) => sum + amount, 0);
    
    return {
      average: totalRevenue / months.length,
      monthlyTotals
    };
  }

  private calculateQuarterlyTrends(transactions: any[]) {
    // Simplified quarterly analysis
    return {};
  }

  private calculateYearlyGrowth(transactions: any[]) {
    // Simplified yearly growth analysis
    return {};
  }

  private identifyPeakMonths(transactions: any[]) {
    // Simplified peak month identification
    return [];
  }

  private identifyLowMonths(transactions: any[]) {
    // Simplified low month identification
    return [];
  }

  private async calculateChurnImpact(userId: string, churnRate: number) {
    const currentMRR = await this.getCurrentMRR(userId);
    const revenueLoss = currentMRR * churnRate;
    const customerLoss = await this.getCurrentCustomerCount(userId) * churnRate;
    
    return {
      revenueLoss,
      customerLoss,
      churnRate
    };
  }

  private async calculateMonthlyBurnRate(userId: string): Promise<number> {
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    const expenses = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'expense',
        date: { gte: startOfMonth, lte: endOfMonth }
      }
    });
    
    const revenue = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'income',
        date: { gte: startOfMonth, lte: endOfMonth }
      }
    });
    
    const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalRevenue = revenue.reduce((sum, t) => sum + t.amount, 0);
    
    return totalExpenses - totalRevenue;
  }

  private async getCurrentCashPosition(userId: string): Promise<number> {
    // Simplified cash position calculation
    const bankAccounts = await prisma.bankAccount.findMany({
      where: { userId, isActive: true }
    });
    
    return bankAccounts.reduce((sum, account) => sum + (account.balance || 0), 0);
  }

  private async getBaseMonthlyRevenue(userId: string): Promise<number> {
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    const revenue = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'income',
        date: { gte: startOfMonth, lte: endOfMonth }
      }
    });
    
    return revenue.reduce((sum, t) => sum + t.amount, 0);
  }

  private async getBaseMonthlyExpenses(userId: string): Promise<number> {
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    const expenses = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'expense',
        date: { gte: startOfMonth, lte: endOfMonth }
      }
    });
    
    return expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }

  private getSeasonalMultiplier(date: Date): number {
    const month = date.getMonth();
    // Simplified seasonal multipliers
    const multipliers = [0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 1.1, 1.05, 1.0, 0.95, 0.9, 0.85];
    return multipliers[month];
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  private generateRunwayRecommendations(runwayMonths: number, burnRate: number): string[] {
    const recommendations = [];
    
    if (runwayMonths < 3) {
      recommendations.push('URGENT: Secure additional funding immediately');
      recommendations.push('Consider emergency cost reduction measures');
    } else if (runwayMonths < 6) {
      recommendations.push('Start fundraising process');
      recommendations.push('Implement cost optimization strategies');
    } else if (runwayMonths < 12) {
      recommendations.push('Plan for future funding rounds');
      recommendations.push('Focus on revenue growth initiatives');
    }
    
    return recommendations;
  }

  private generateShortageRecommendations(projectedCash: number, daysUntil: number): string[] {
    const recommendations = [];
    
    if (projectedCash < -50000) {
      recommendations.push('CRITICAL: Immediate funding required');
      recommendations.push('Consider emergency cost cuts');
    } else if (projectedCash < -10000) {
      recommendations.push('Secure additional funding');
      recommendations.push('Optimize cash flow timing');
    }
    
    return recommendations;
  }

  private async modelPriceIncrease(userId: string, increasePercentage: number) {
    // Simplified price increase modeling
    return { impact: 'positive', revenueIncrease: increasePercentage };
  }

  private async modelChurnReduction(userId: string, reductionPercentage: number) {
    // Simplified churn reduction modeling
    return { impact: 'positive', churnReduction: reductionPercentage };
  }

  private async modelFundingImpact(userId: string, fundingAmount: number) {
    // Simplified funding impact modeling
    return { impact: 'positive', fundingAmount };
  }

  private async modelHiringImpact(userId: string, newHires: number) {
    // Simplified hiring impact modeling
    return { impact: 'negative', costIncrease: newHires * 5000 };
  }

  private async modelExpenseOptimization(userId: string, reductionPercentage: number) {
    // Simplified expense optimization modeling
    return { impact: 'positive', expenseReduction: reductionPercentage };
  }

  private async generateRandomScenario(userId: string) {
    // Simplified random scenario generation
    return { revenue: Math.random() * 100000, expenses: Math.random() * 80000 };
  }

  private calculateMean(values: number[]): number {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  private calculateMedian(values: number[]): number {
    const sorted = values.sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = this.calculateMean(values);
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquaredDiff = this.calculateMean(squaredDiffs);
    return Math.sqrt(avgSquaredDiff);
  }

  private calculatePercentiles(values: number[]): any {
    const sorted = values.sort((a, b) => a - b);
    return {
      p10: sorted[Math.floor(sorted.length * 0.1)],
      p25: sorted[Math.floor(sorted.length * 0.25)],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p75: sorted[Math.floor(sorted.length * 0.75)],
      p90: sorted[Math.floor(sorted.length * 0.9)]
    };
  }

  private calculateProfitabilityProbability(values: number[]): number {
    const profitableScenarios = values.filter(value => value > 0).length;
    return profitableScenarios / values.length;
  }

  private async getCurrentMRR(userId: string): Promise<number> {
    // Simplified MRR calculation
    return 10000; // Placeholder
  }

  private async getCurrentCustomerCount(userId: string): Promise<number> {
    const customers = await prisma.customer.findMany({
      where: { userId }
    });
    return customers.length;
  }
}

export default new CashFlowForecastService();







