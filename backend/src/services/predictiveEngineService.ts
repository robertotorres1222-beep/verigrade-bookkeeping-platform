import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class PredictiveEngineService {
  // Customer Churn Prediction Algorithms
  async predictCustomerChurn(userId: string, customerId?: string) {
    try {
      const churnPredictions = [];

      if (customerId) {
        // Predict churn for specific customer
        const prediction = await this.predictIndividualChurn(userId, customerId);
        churnPredictions.push(prediction);
      } else {
        // Predict churn for all customers
        const customers = await prisma.customer.findMany({
          where: { userId },
          include: {
            subscriptions: true,
            transactions: true
          }
        });

        for (const customer of customers) {
          const prediction = await this.predictIndividualChurn(userId, customer.id);
          churnPredictions.push(prediction);
        }
      }

      // Store predictions
      for (const prediction of churnPredictions) {
        await prisma.churnPrediction.create({
          data: {
            id: uuidv4(),
            userId,
            customerId: prediction.customerId,
            churnProbability: prediction.churnProbability,
            riskLevel: prediction.riskLevel,
            keyFactors: JSON.stringify(prediction.keyFactors),
            recommendedActions: JSON.stringify(prediction.recommendedActions),
            predictedAt: new Date()
          }
        });
      }

      return churnPredictions;
    } catch (error) {
      throw new Error(`Failed to predict customer churn: ${error.message}`);
    }
  }

  // Expansion Opportunity Detection
  async detectExpansionOpportunities(userId: string) {
    try {
      const opportunities = [];

      // Get customers with potential for expansion
      const customers = await prisma.customer.findMany({
        where: { userId },
        include: {
          subscriptions: {
            include: { plan: true }
          },
          transactions: {
            where: { type: 'income' }
          }
        }
      });

      for (const customer of customers) {
        const opportunity = await this.analyzeExpansionOpportunity(customer);
        if (opportunity.score > 0.5) {
          opportunities.push(opportunity);
        }
      }

      // Store opportunities
      for (const opportunity of opportunities) {
        await prisma.expansionOpportunity.create({
          data: {
            id: uuidv4(),
            userId,
            customerId: opportunity.customerId,
            opportunityScore: opportunity.score,
            potentialRevenue: opportunity.potentialRevenue,
            recommendedPlan: opportunity.recommendedPlan,
            keyFactors: JSON.stringify(opportunity.keyFactors),
            createdAt: new Date()
          }
        });
      }

      return opportunities;
    } catch (error) {
      throw new Error(`Failed to detect expansion opportunities: ${error.message}`);
    }
  }

  // Downturn Risk Scoring
  async calculateDownturnRisk(userId: string) {
    try {
      // Analyze various risk factors
      const riskFactors = {
        revenueDecline: await this.analyzeRevenueDecline(userId),
        customerChurn: await this.analyzeCustomerChurnTrend(userId),
        marketConditions: await this.analyzeMarketConditions(userId),
        cashFlow: await this.analyzeCashFlowRisk(userId),
        competition: await this.analyzeCompetitionRisk(userId)
      };

      // Calculate overall risk score
      const riskScore = this.calculateOverallRiskScore(riskFactors);

      // Generate risk assessment
      const riskAssessment = {
        overallScore: riskScore,
        riskLevel: this.getRiskLevel(riskScore),
        factors: riskFactors,
        recommendations: this.generateRiskRecommendations(riskScore, riskFactors),
        assessedAt: new Date()
      };

      // Store risk assessment
      await prisma.downturnRiskAssessment.create({
        data: {
          id: uuidv4(),
          userId,
          riskScore,
          riskLevel: riskAssessment.riskLevel,
          factors: JSON.stringify(riskFactors),
          recommendations: JSON.stringify(riskAssessment.recommendations),
          assessedAt: new Date()
        }
      });

      return riskAssessment;
    } catch (error) {
      throw new Error(`Failed to calculate downturn risk: ${error.message}`);
    }
  }

  // Payment Failure Prediction
  async predictPaymentFailures(userId: string, days: number = 30) {
    try {
      const predictions = [];

      // Get customers with upcoming payments
      const upcomingPayments = await this.getUpcomingPayments(userId, days);

      for (const payment of upcomingPayments) {
        const failurePrediction = await this.predictPaymentFailure(payment);
        if (failurePrediction.probability > 0.3) {
          predictions.push(failurePrediction);
        }
      }

      // Store predictions
      for (const prediction of predictions) {
        await prisma.paymentFailurePrediction.create({
          data: {
            id: uuidv4(),
            userId,
            customerId: prediction.customerId,
            paymentId: prediction.paymentId,
            failureProbability: prediction.probability,
            riskFactors: JSON.stringify(prediction.riskFactors),
            recommendedActions: JSON.stringify(prediction.recommendedActions),
            predictedAt: new Date()
          }
        });
      }

      return predictions;
    } catch (error) {
      throw new Error(`Failed to predict payment failures: ${error.message}`);
    }
  }

  // Lifetime Value Prediction Models
  async predictCustomerLTV(userId: string, customerId?: string) {
    try {
      const ltvPredictions = [];

      if (customerId) {
        // Predict LTV for specific customer
        const prediction = await this.predictIndividualLTV(userId, customerId);
        ltvPredictions.push(prediction);
      } else {
        // Predict LTV for all customers
        const customers = await prisma.customer.findMany({
          where: { userId },
          include: {
            subscriptions: true,
            transactions: true
          }
        });

        for (const customer of customers) {
          const prediction = await this.predictIndividualLTV(userId, customer.id);
          ltvPredictions.push(prediction);
        }
      }

      // Store predictions
      for (const prediction of ltvPredictions) {
        await prisma.ltvPrediction.create({
          data: {
            id: uuidv4(),
            userId,
            customerId: prediction.customerId,
            predictedLTV: prediction.predictedLTV,
            confidence: prediction.confidence,
            factors: JSON.stringify(prediction.factors),
            predictedAt: new Date()
          }
        });
      }

      return ltvPredictions;
    } catch (error) {
      throw new Error(`Failed to predict customer LTV: ${error.message}`);
    }
  }

  // Growth Trajectory Forecasting
  async forecastGrowthTrajectory(userId: string, months: number = 12) {
    try {
      // Get historical growth data
      const historicalData = await this.getHistoricalGrowthData(userId, months * 2);
      
      // Analyze growth patterns
      const growthPatterns = this.analyzeGrowthPatterns(historicalData);
      
      // Generate growth forecast
      const forecast = this.generateGrowthForecast(growthPatterns, months);
      
      // Calculate growth scenarios
      const scenarios = {
        optimistic: this.applyGrowthMultiplier(forecast, 1.2),
        realistic: forecast,
        pessimistic: this.applyGrowthMultiplier(forecast, 0.8)
      };

      // Store forecast
      await prisma.growthForecast.create({
        data: {
          id: uuidv4(),
          userId,
          forecastMonths: months,
          scenarios: JSON.stringify(scenarios),
          confidence: this.calculateForecastConfidence(historicalData),
          createdAt: new Date()
        }
      });

      return {
        scenarios,
        historicalData,
        growthPatterns,
        confidence: this.calculateForecastConfidence(historicalData)
      };
    } catch (error) {
      throw new Error(`Failed to forecast growth trajectory: ${error.message}`);
    }
  }

  // Enhanced Predictive Analytics with SaaS Focus
  async generateSaaSPredictiveInsights(userId: string) {
    try {
      const insights = {
        churnInsights: await this.generateChurnInsights(userId),
        expansionInsights: await this.generateExpansionInsights(userId),
        revenueInsights: await this.generateRevenueInsights(userId),
        riskInsights: await this.generateRiskInsights(userId),
        opportunityInsights: await this.generateOpportunityInsights(userId)
      };

      // Store insights
      await prisma.predictiveInsights.create({
        data: {
          id: uuidv4(),
          userId,
          insights: JSON.stringify(insights),
          generatedAt: new Date()
        }
      });

      return insights;
    } catch (error) {
      throw new Error(`Failed to generate SaaS predictive insights: ${error.message}`);
    }
  }

  // Helper Methods
  private async predictIndividualChurn(userId: string, customerId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        subscriptions: true,
        transactions: {
          orderBy: { date: 'desc' },
          take: 10
        }
      }
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    // Calculate churn probability based on various factors
    const factors = {
      subscriptionAge: this.calculateSubscriptionAge(customer.subscriptions),
      paymentHistory: this.analyzePaymentHistory(customer.transactions),
      engagementLevel: this.calculateEngagementLevel(customer),
      supportTickets: await this.getSupportTicketCount(customerId),
      planValue: this.calculatePlanValue(customer.subscriptions)
    };

    const churnProbability = this.calculateChurnProbability(factors);
    const riskLevel = this.getChurnRiskLevel(churnProbability);

    return {
      customerId,
      churnProbability,
      riskLevel,
      keyFactors: factors,
      recommendedActions: this.generateChurnPreventionActions(churnProbability, factors)
    };
  }

  private async analyzeExpansionOpportunity(customer: any) {
    const factors = {
      currentPlanValue: this.calculatePlanValue(customer.subscriptions),
      usageGrowth: this.calculateUsageGrowth(customer.transactions),
      paymentReliability: this.calculatePaymentReliability(customer.transactions),
      engagementScore: this.calculateEngagementScore(customer),
      tenure: this.calculateCustomerTenure(customer)
    };

    const opportunityScore = this.calculateExpansionScore(factors);
    const potentialRevenue = this.calculatePotentialExpansionRevenue(customer, factors);

    return {
      customerId: customer.id,
      score: opportunityScore,
      potentialRevenue,
      recommendedPlan: this.recommendExpansionPlan(customer, factors),
      keyFactors: factors
    };
  }

  private async analyzeRevenueDecline(userId: string) {
    const endDate = new Date();
    const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 3, 1);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'income',
        date: { gte: startDate }
      },
      orderBy: { date: 'asc' }
    });

    // Calculate month-over-month growth
    const monthlyRevenue = this.groupTransactionsByMonth(transactions);
    const growthRates = this.calculateGrowthRates(monthlyRevenue);
    
    return {
      currentGrowthRate: growthRates[growthRates.length - 1],
      averageGrowthRate: this.calculateMean(growthRates),
      trend: this.analyzeTrend(growthRates),
      riskScore: this.calculateRevenueDeclineRisk(growthRates)
    };
  }

  private async analyzeCustomerChurnTrend(userId: string) {
    const endDate = new Date();
    const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 6, 1);

    const churnData = await prisma.customer.findMany({
      where: {
        userId,
        createdAt: { gte: startDate }
      },
      include: {
        subscriptions: {
          where: {
            status: 'cancelled',
            endDate: { gte: startDate }
          }
        }
      }
    });

    const monthlyChurn = this.calculateMonthlyChurn(churnData);
    const churnTrend = this.analyzeChurnTrend(monthlyChurn);

    return {
      currentChurnRate: monthlyChurn[monthlyChurn.length - 1],
      trend: churnTrend,
      riskScore: this.calculateChurnRiskScore(monthlyChurn)
    };
  }

  private async analyzeMarketConditions(userId: string) {
    // Simplified market analysis
    return {
      marketGrowth: 0.05, // 5% market growth
      competitionLevel: 'medium',
      riskScore: 0.3
    };
  }

  private async analyzeCashFlowRisk(userId: string) {
    const currentCash = await this.getCurrentCashPosition(userId);
    const monthlyBurn = await this.calculateMonthlyBurnRate(userId);
    const runway = monthlyBurn > 0 ? currentCash / monthlyBurn : 0;

    return {
      currentCash,
      monthlyBurn,
      runway,
      riskScore: this.calculateCashFlowRiskScore(runway)
    };
  }

  private async analyzeCompetitionRisk(userId: string) {
    // Simplified competition analysis
    return {
      competitivePressure: 'medium',
      marketShare: 0.02, // 2% market share
      riskScore: 0.4
    };
  }

  private calculateOverallRiskScore(factors: any): number {
    const weights = {
      revenueDecline: 0.3,
      customerChurn: 0.25,
      marketConditions: 0.2,
      cashFlow: 0.15,
      competition: 0.1
    };

    return (
      factors.revenueDecline.riskScore * weights.revenueDecline +
      factors.customerChurn.riskScore * weights.customerChurn +
      factors.marketConditions.riskScore * weights.marketConditions +
      factors.cashFlow.riskScore * weights.cashFlow +
      factors.competition.riskScore * weights.competition
    );
  }

  private getRiskLevel(riskScore: number): string {
    if (riskScore < 0.3) return 'low';
    if (riskScore < 0.6) return 'medium';
    return 'high';
  }

  private generateRiskRecommendations(riskScore: number, factors: any): string[] {
    const recommendations = [];

    if (riskScore > 0.7) {
      recommendations.push('URGENT: Implement immediate risk mitigation strategies');
      recommendations.push('Consider emergency funding options');
    } else if (riskScore > 0.5) {
      recommendations.push('Monitor key risk indicators closely');
      recommendations.push('Develop contingency plans');
    } else {
      recommendations.push('Continue current risk management practices');
    }

    return recommendations;
  }

  private async getUpcomingPayments(userId: string, days: number) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return await prisma.subscription.findMany({
      where: {
        userId,
        status: 'active',
        nextBillingDate: {
          lte: endDate
        }
      },
      include: {
        customer: true,
        plan: true
      }
    });
  }

  private async predictPaymentFailure(payment: any) {
    const factors = {
      paymentHistory: await this.analyzePaymentHistory(payment.customer.transactions),
      customerReliability: this.calculateCustomerReliability(payment.customer),
      amount: payment.plan.monthlyPrice,
      paymentMethod: payment.paymentMethod
    };

    const failureProbability = this.calculatePaymentFailureProbability(factors);

    return {
      customerId: payment.customerId,
      paymentId: payment.id,
      probability: failureProbability,
      riskFactors: factors,
      recommendedActions: this.generatePaymentFailurePreventionActions(failureProbability, factors)
    };
  }

  private async predictIndividualLTV(userId: string, customerId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        subscriptions: true,
        transactions: true
      }
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    const factors = {
      currentValue: this.calculateCurrentCustomerValue(customer),
      tenure: this.calculateCustomerTenure(customer),
      growthRate: this.calculateCustomerGrowthRate(customer),
      churnRisk: await this.predictIndividualChurn(userId, customerId)
    };

    const predictedLTV = this.calculatePredictedLTV(factors);
    const confidence = this.calculateLTVConfidence(factors);

    return {
      customerId,
      predictedLTV,
      confidence,
      factors
    };
  }

  private async getHistoricalGrowthData(userId: string, months: number) {
    const endDate = new Date();
    const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - months, 1);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'income',
        date: { gte: startDate }
      },
      orderBy: { date: 'asc' }
    });

    return this.groupTransactionsByMonth(transactions);
  }

  private analyzeGrowthPatterns(historicalData: any[]) {
    const growthRates = this.calculateGrowthRates(historicalData);
    const trend = this.analyzeTrend(growthRates);
    const seasonality = this.analyzeSeasonality(historicalData);

    return {
      growthRates,
      trend,
      seasonality,
      averageGrowth: this.calculateMean(growthRates)
    };
  }

  private generateGrowthForecast(patterns: any, months: number) {
    const forecast = [];
    let currentValue = patterns.averageGrowth;

    for (let i = 0; i < months; i++) {
      const projectedValue = currentValue * (1 + patterns.trend);
      forecast.push({
        month: i + 1,
        projectedValue,
        confidence: this.calculateForecastConfidence(patterns)
      });
      currentValue = projectedValue;
    }

    return forecast;
  }

  private applyGrowthMultiplier(forecast: any[], multiplier: number) {
    return forecast.map(item => ({
      ...item,
      projectedValue: item.projectedValue * multiplier
    }));
  }

  private calculateForecastConfidence(patterns: any): number {
    // Simplified confidence calculation
    return Math.max(0, Math.min(1, 0.8 - (patterns.growthRates.length < 6 ? 0.2 : 0)));
  }

  // Additional helper methods would be implemented here...
  private calculateSubscriptionAge(subscriptions: any[]): number {
    if (subscriptions.length === 0) return 0;
    const oldest = subscriptions.reduce((oldest, sub) => 
      new Date(sub.startDate) < new Date(oldest.startDate) ? sub : oldest
    );
    return (new Date().getTime() - new Date(oldest.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30);
  }

  private analyzePaymentHistory(transactions: any[]): any {
    // Simplified payment history analysis
    return { reliability: 0.8, latePayments: 0 };
  }

  private calculateEngagementLevel(customer: any): number {
    // Simplified engagement calculation
    return 0.7;
  }

  private async getSupportTicketCount(customerId: string): Promise<number> {
    // Simplified support ticket count
    return 0;
  }

  private calculatePlanValue(subscriptions: any[]): number {
    return subscriptions.reduce((sum, sub) => sum + (sub.plan?.monthlyPrice || 0), 0);
  }

  private calculateChurnProbability(factors: any): number {
    // Simplified churn probability calculation
    return 0.3;
  }

  private getChurnRiskLevel(probability: number): string {
    if (probability < 0.3) return 'low';
    if (probability < 0.6) return 'medium';
    return 'high';
  }

  private generateChurnPreventionActions(probability: number, factors: any): string[] {
    const actions = [];
    if (probability > 0.5) {
      actions.push('Reach out to customer for feedback');
      actions.push('Offer retention incentives');
    }
    return actions;
  }

  private calculateExpansionScore(factors: any): number {
    // Simplified expansion score calculation
    return 0.6;
  }

  private calculatePotentialExpansionRevenue(customer: any, factors: any): number {
    // Simplified potential revenue calculation
    return factors.currentPlanValue * 0.5;
  }

  private recommendExpansionPlan(customer: any, factors: any): string {
    // Simplified plan recommendation
    return 'Premium Plan';
  }

  private groupTransactionsByMonth(transactions: any[]): any[] {
    const monthlyData = {};
    transactions.forEach(transaction => {
      const month = transaction.date.toISOString().slice(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = 0;
      }
      monthlyData[month] += transaction.amount;
    });
    return Object.entries(monthlyData).map(([month, amount]) => ({ month, amount }));
  }

  private calculateGrowthRates(monthlyData: any[]): number[] {
    const rates = [];
    for (let i = 1; i < monthlyData.length; i++) {
      const current = monthlyData[i].amount;
      const previous = monthlyData[i - 1].amount;
      const rate = previous > 0 ? (current - previous) / previous : 0;
      rates.push(rate);
    }
    return rates;
  }

  private calculateMean(values: number[]): number {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  private analyzeTrend(growthRates: number[]): string {
    const recent = growthRates.slice(-3);
    const average = this.calculateMean(recent);
    if (average > 0.05) return 'increasing';
    if (average < -0.05) return 'decreasing';
    return 'stable';
  }

  private calculateRevenueDeclineRisk(growthRates: number[]): number {
    const negativeRates = growthRates.filter(rate => rate < 0).length;
    return negativeRates / growthRates.length;
  }

  private calculateMonthlyChurn(churnData: any[]): number[] {
    // Simplified monthly churn calculation
    return [0.05, 0.04, 0.06, 0.03, 0.05, 0.04];
  }

  private analyzeChurnTrend(monthlyChurn: number[]): string {
    return this.analyzeTrend(monthlyChurn);
  }

  private calculateChurnRiskScore(monthlyChurn: number[]): number {
    return this.calculateMean(monthlyChurn);
  }

  private async getCurrentCashPosition(userId: string): Promise<number> {
    // Simplified cash position
    return 100000;
  }

  private async calculateMonthlyBurnRate(userId: string): Promise<number> {
    // Simplified burn rate calculation
    return 15000;
  }

  private calculateCashFlowRiskScore(runway: number): number {
    if (runway < 3) return 0.9;
    if (runway < 6) return 0.6;
    if (runway < 12) return 0.3;
    return 0.1;
  }

  private calculatePaymentFailureProbability(factors: any): number {
    // Simplified payment failure probability
    return 0.2;
  }

  private generatePaymentFailurePreventionActions(probability: number, factors: any): string[] {
    const actions = [];
    if (probability > 0.3) {
      actions.push('Contact customer about payment method');
      actions.push('Offer payment plan options');
    }
    return actions;
  }

  private calculateCurrentCustomerValue(customer: any): number {
    return this.calculatePlanValue(customer.subscriptions);
  }

  private calculateCustomerTenure(customer: any): number {
    return (new Date().getTime() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30);
  }

  private calculateCustomerGrowthRate(customer: any): number {
    // Simplified growth rate calculation
    return 0.1;
  }

  private calculatePredictedLTV(factors: any): number {
    // Simplified LTV prediction
    return factors.currentValue * 24; // 24 months average
  }

  private calculateLTVConfidence(factors: any): number {
    // Simplified confidence calculation
    return 0.8;
  }

  private analyzeSeasonality(historicalData: any[]): any {
    // Simplified seasonality analysis
    return { hasSeasonality: false, pattern: 'none' };
  }

  private async generateChurnInsights(userId: string): Promise<any> {
    return { insight: 'Churn insights generated' };
  }

  private async generateExpansionInsights(userId: string): Promise<any> {
    return { insight: 'Expansion insights generated' };
  }

  private async generateRevenueInsights(userId: string): Promise<any> {
    return { insight: 'Revenue insights generated' };
  }

  private async generateRiskInsights(userId: string): Promise<any> {
    return { insight: 'Risk insights generated' };
  }

  private async generateOpportunityInsights(userId: string): Promise<any> {
    return { insight: 'Opportunity insights generated' };
  }
}

export default new PredictiveEngineService();






