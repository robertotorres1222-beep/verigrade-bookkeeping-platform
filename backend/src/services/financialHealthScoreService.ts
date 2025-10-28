import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface FinancialHealthScore {
  overallScore: number;
  liquidity: {
    score: number;
    cashRunway: number;
    currentRatio: number;
    quickRatio: number;
  };
  growth: {
    score: number;
    mrrGrowth: number;
    customerGrowth: number;
    pipelineHealth: number;
  };
  profitability: {
    score: number;
    grossMargin: number;
    pathToBreakeven: number;
    burnMultiple: number;
  };
  efficiency: {
    score: number;
    cacPayback: number;
    magicNumber: number;
    ruleOf40: number;
  };
  retention: {
    score: number;
    grossRetention: number;
    netRetention: number;
    churnTrend: number;
  };
  peerComparison: {
    industryAverage: number;
    topQuartile: number;
    percentile: number;
  };
  recommendations: string[];
  lastUpdated: Date;
}

export class FinancialHealthScoreService {
  /**
   * Calculate comprehensive financial health score (0-100)
   */
  async calculateFinancialHealthScore(companyId: string): Promise<FinancialHealthScore> {
    try {
      logger.info(`Calculating financial health score for company ${companyId}`);

      // Get company financial data
      const financialData = await this.getCompanyFinancialData(companyId);
      
      // Calculate individual category scores
      const liquidity = await this.calculateLiquidityScore(financialData);
      const growth = await this.calculateGrowthScore(financialData);
      const profitability = await this.calculateProfitabilityScore(financialData);
      const efficiency = await this.calculateEfficiencyScore(financialData);
      const retention = await this.calculateRetentionScore(financialData);

      // Calculate overall score (weighted average)
      const overallScore = Math.round(
        (liquidity.score * 0.25) +
        (growth.score * 0.20) +
        (profitability.score * 0.20) +
        (efficiency.score * 0.20) +
        (retention.score * 0.15)
      );

      // Get peer comparison data
      const peerComparison = await this.getPeerComparison(overallScore);

      // Generate recommendations
      const recommendations = this.generateRecommendations({
        liquidity,
        growth,
        profitability,
        efficiency,
        retention
      });

      const healthScore: FinancialHealthScore = {
        overallScore,
        liquidity,
        growth,
        profitability,
        efficiency,
        retention,
        peerComparison,
        recommendations,
        lastUpdated: new Date()
      };

      // Store the score
      await this.storeHealthScore(companyId, healthScore);

      return healthScore;
    } catch (error) {
      logger.error(`Error calculating financial health score: ${error.message}`);
      throw new Error(`Failed to calculate financial health score: ${error.message}`);
    }
  }

  /**
   * Get company financial data for calculations
   */
  private async getCompanyFinancialData(companyId: string) {
    const [
      cashBalance,
      monthlyBurn,
      revenue,
      expenses,
      customers,
      subscriptions,
      transactions
    ] = await Promise.all([
      this.getCashBalance(companyId),
      this.getMonthlyBurn(companyId),
      this.getRevenue(companyId),
      this.getExpenses(companyId),
      this.getCustomerData(companyId),
      this.getSubscriptionData(companyId),
      this.getTransactionData(companyId)
    ]);

    return {
      cashBalance,
      monthlyBurn,
      revenue,
      expenses,
      customers,
      subscriptions,
      transactions
    };
  }

  /**
   * Calculate liquidity score (0-100)
   */
  private async calculateLiquidityScore(data: any) {
    const cashRunway = data.monthlyBurn > 0 ? data.cashBalance / data.monthlyBurn : 0;
    const currentRatio = this.calculateCurrentRatio(data);
    const quickRatio = this.calculateQuickRatio(data);

    // Score calculation
    let score = 0;
    
    // Cash runway scoring (0-40 points)
    if (cashRunway >= 18) score += 40;
    else if (cashRunway >= 12) score += 35;
    else if (cashRunway >= 6) score += 25;
    else if (cashRunway >= 3) score += 15;
    else score += 5;

    // Current ratio scoring (0-30 points)
    if (currentRatio >= 2.0) score += 30;
    else if (currentRatio >= 1.5) score += 25;
    else if (currentRatio >= 1.0) score += 15;
    else score += 5;

    // Quick ratio scoring (0-30 points)
    if (quickRatio >= 1.5) score += 30;
    else if (quickRatio >= 1.0) score += 25;
    else if (quickRatio >= 0.5) score += 15;
    else score += 5;

    return {
      score: Math.min(score, 100),
      cashRunway,
      currentRatio,
      quickRatio
    };
  }

  /**
   * Calculate growth score (0-100)
   */
  private async calculateGrowthScore(data: any) {
    const mrrGrowth = this.calculateMRRGrowth(data.subscriptions);
    const customerGrowth = this.calculateCustomerGrowth(data.customers);
    const pipelineHealth = this.calculatePipelineHealth(data);

    let score = 0;

    // MRR growth scoring (0-40 points)
    if (mrrGrowth >= 20) score += 40;
    else if (mrrGrowth >= 15) score += 35;
    else if (mrrGrowth >= 10) score += 30;
    else if (mrrGrowth >= 5) score += 20;
    else score += 10;

    // Customer growth scoring (0-30 points)
    if (customerGrowth >= 15) score += 30;
    else if (customerGrowth >= 10) score += 25;
    else if (customerGrowth >= 5) score += 20;
    else score += 10;

    // Pipeline health scoring (0-30 points)
    if (pipelineHealth >= 0.8) score += 30;
    else if (pipelineHealth >= 0.6) score += 25;
    else if (pipelineHealth >= 0.4) score += 20;
    else score += 10;

    return {
      score: Math.min(score, 100),
      mrrGrowth,
      customerGrowth,
      pipelineHealth
    };
  }

  /**
   * Calculate profitability score (0-100)
   */
  private async calculateProfitabilityScore(data: any) {
    const grossMargin = this.calculateGrossMargin(data.revenue, data.expenses);
    const pathToBreakeven = this.calculatePathToBreakeven(data);
    const burnMultiple = this.calculateBurnMultiple(data);

    let score = 0;

    // Gross margin scoring (0-40 points)
    if (grossMargin >= 80) score += 40;
    else if (grossMargin >= 70) score += 35;
    else if (grossMargin >= 60) score += 30;
    else if (grossMargin >= 50) score += 20;
    else score += 10;

    // Path to breakeven scoring (0-30 points)
    if (pathToBreakeven <= 6) score += 30;
    else if (pathToBreakeven <= 12) score += 25;
    else if (pathToBreakeven <= 18) score += 20;
    else score += 10;

    // Burn multiple scoring (0-30 points)
    if (burnMultiple <= 1.0) score += 30;
    else if (burnMultiple <= 1.5) score += 25;
    else if (burnMultiple <= 2.0) score += 20;
    else score += 10;

    return {
      score: Math.min(score, 100),
      grossMargin,
      pathToBreakeven,
      burnMultiple
    };
  }

  /**
   * Calculate efficiency score (0-100)
   */
  private async calculateEfficiencyScore(data: any) {
    const cacPayback = this.calculateCACPayback(data);
    const magicNumber = this.calculateMagicNumber(data);
    const ruleOf40 = this.calculateRuleOf40(data);

    let score = 0;

    // CAC payback scoring (0-40 points)
    if (cacPayback <= 6) score += 40;
    else if (cacPayback <= 12) score += 35;
    else if (cacPayback <= 18) score += 30;
    else if (cacPayback <= 24) score += 20;
    else score += 10;

    // Magic number scoring (0-30 points)
    if (magicNumber >= 1.0) score += 30;
    else if (magicNumber >= 0.75) score += 25;
    else if (magicNumber >= 0.5) score += 20;
    else score += 10;

    // Rule of 40 scoring (0-30 points)
    if (ruleOf40 >= 40) score += 30;
    else if (ruleOf40 >= 30) score += 25;
    else if (ruleOf40 >= 20) score += 20;
    else score += 10;

    return {
      score: Math.min(score, 100),
      cacPayback,
      magicNumber,
      ruleOf40
    };
  }

  /**
   * Calculate retention score (0-100)
   */
  private async calculateRetentionScore(data: any) {
    const grossRetention = this.calculateGrossRetention(data.subscriptions);
    const netRetention = this.calculateNetRetention(data.subscriptions);
    const churnTrend = this.calculateChurnTrend(data.subscriptions);

    let score = 0;

    // Gross retention scoring (0-40 points)
    if (grossRetention >= 95) score += 40;
    else if (grossRetention >= 90) score += 35;
    else if (grossRetention >= 85) score += 30;
    else if (grossRetention >= 80) score += 20;
    else score += 10;

    // Net retention scoring (0-30 points)
    if (netRetention >= 120) score += 30;
    else if (netRetention >= 110) score += 25;
    else if (netRetention >= 100) score += 20;
    else score += 10;

    // Churn trend scoring (0-30 points)
    if (churnTrend <= -10) score += 30; // Improving
    else if (churnTrend <= 0) score += 25; // Stable
    else if (churnTrend <= 10) score += 20; // Slightly worsening
    else score += 10; // Worsening

    return {
      score: Math.min(score, 100),
      grossRetention,
      netRetention,
      churnTrend
    };
  }

  /**
   * Get peer comparison data
   */
  private async getPeerComparison(overallScore: number) {
    // Simulate industry benchmarks
    const industryAverage = 72;
    const topQuartile = 85;
    const percentile = Math.round((overallScore / 100) * 100);

    return {
      industryAverage,
      topQuartile,
      percentile
    };
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(scores: any): string[] {
    const recommendations: string[] = [];

    if (scores.liquidity.score < 70) {
      recommendations.push("Improve cash runway by reducing burn rate or raising capital");
      recommendations.push("Optimize working capital management");
    }

    if (scores.growth.score < 70) {
      recommendations.push("Accelerate customer acquisition through better marketing");
      recommendations.push("Improve sales pipeline conversion rates");
    }

    if (scores.profitability.score < 70) {
      recommendations.push("Increase gross margins through pricing optimization");
      recommendations.push("Reduce operational costs and improve efficiency");
    }

    if (scores.efficiency.score < 70) {
      recommendations.push("Improve CAC payback period through better sales efficiency");
      recommendations.push("Optimize marketing spend allocation");
    }

    if (scores.retention.score < 70) {
      recommendations.push("Reduce customer churn through better onboarding");
      recommendations.push("Increase expansion revenue from existing customers");
    }

    return recommendations;
  }

  // Helper methods for calculations
  private async getCashBalance(companyId: string): Promise<number> {
    // Implementation to get current cash balance
    return 245000; // Example value
  }

  private async getMonthlyBurn(companyId: string): Promise<number> {
    // Implementation to calculate monthly burn rate
    return 38000; // Example value
  }

  private async getRevenue(companyId: string): Promise<number> {
    // Implementation to get revenue data
    return 64000; // Example value
  }

  private async getExpenses(companyId: string): Promise<number> {
    // Implementation to get expense data
    return 102000; // Example value
  }

  private async getCustomerData(companyId: string) {
    // Implementation to get customer data
    return { total: 150, newThisMonth: 12 };
  }

  private async getSubscriptionData(companyId: string) {
    // Implementation to get subscription data
    return { mrr: 67450, growth: 7.1 };
  }

  private async getTransactionData(companyId: string) {
    // Implementation to get transaction data
    return [];
  }

  private calculateCurrentRatio(data: any): number {
    // Implementation for current ratio calculation
    return 2.3;
  }

  private calculateQuickRatio(data: any): number {
    // Implementation for quick ratio calculation
    return 2.1;
  }

  private calculateMRRGrowth(subscriptions: any): number {
    return subscriptions.growth || 0;
  }

  private calculateCustomerGrowth(customers: any): number {
    return customers.newThisMonth / customers.total * 100;
  }

  private calculatePipelineHealth(data: any): number {
    // Implementation for pipeline health calculation
    return 0.75;
  }

  private calculateGrossMargin(revenue: number, expenses: number): number {
    return ((revenue - expenses) / revenue) * 100;
  }

  private calculatePathToBreakeven(data: any): number {
    // Implementation for path to breakeven calculation
    return 18;
  }

  private calculateBurnMultiple(data: any): number {
    // Implementation for burn multiple calculation
    return 1.2;
  }

  private calculateCACPayback(data: any): number {
    // Implementation for CAC payback calculation
    return 8.2;
  }

  private calculateMagicNumber(data: any): number {
    // Implementation for magic number calculation
    return 0.89;
  }

  private calculateRuleOf40(data: any): number {
    // Implementation for Rule of 40 calculation
    return 42;
  }

  private calculateGrossRetention(subscriptions: any): number {
    // Implementation for gross retention calculation
    return 94.2;
  }

  private calculateNetRetention(subscriptions: any): number {
    // Implementation for net retention calculation
    return 112;
  }

  private calculateChurnTrend(subscriptions: any): number {
    // Implementation for churn trend calculation
    return -5; // Improving
  }

  private async storeHealthScore(companyId: string, score: FinancialHealthScore) {
    // Store the health score in database
    await prisma.financialHealthScore.create({
      data: {
        companyId,
        overallScore: score.overallScore,
        liquidityScore: score.liquidity.score,
        growthScore: score.growth.score,
        profitabilityScore: score.profitability.score,
        efficiencyScore: score.efficiency.score,
        retentionScore: score.retention.score,
        peerComparison: JSON.stringify(score.peerComparison),
        recommendations: JSON.stringify(score.recommendations),
        createdAt: new Date()
      }
    });
  }
}









