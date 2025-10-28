import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface PricingAnalysis {
  currentPricing: {
    plans: PricingPlan[];
    totalRevenue: number;
    averageRevenuePerUser: number;
  };
  willingnessToPay: {
    analysis: WTPAnalysis;
    recommendations: string[];
  };
  valueBasedPricing: {
    recommendations: ValueBasedRecommendation[];
    implementationSteps: string[];
  };
  annualDiscountOptimization: {
    currentDiscount: number;
    optimalDiscount: number;
    revenueImpact: number;
  };
  grandfatherPricingRisk: {
    riskLevel: 'low' | 'medium' | 'high';
    affectedRevenue: number;
    mitigationStrategies: string[];
  };
  usageBasedPricing: {
    currentUsage: UsageMetrics;
    recommendedPricing: UsageBasedPlan[];
    revenueProjection: number;
  };
  priceElasticity: {
    elasticity: number;
    optimalPrice: number;
    revenueImpact: number;
  };
  abTestRecommendations: {
    tests: ABTestRecommendation[];
    expectedImpact: number;
  };
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  userCount: number;
  revenue: number;
  churnRate: number;
  upgradeRate: number;
}

export interface WTPAnalysis {
  overallWTP: number;
  bySegment: Array<{
    segment: string;
    wtp: number;
    confidence: number;
  }>;
  byFeature: Array<{
    feature: string;
    wtp: number;
    importance: number;
  }>;
  upgradeBehavior: {
    upgradeRate: number;
    averageUpgradeValue: number;
    commonUpgradePaths: string[];
  };
  usagePatterns: {
    heavyUsers: number;
    lightUsers: number;
    powerUsers: number;
  };
}

export interface ValueBasedRecommendation {
  feature: string;
  currentValue: number;
  recommendedValue: number;
  justification: string;
  implementationEffort: 'low' | 'medium' | 'high';
}

export interface UsageMetrics {
  totalUsers: number;
  activeUsers: number;
  averageUsage: number;
  usageDistribution: Array<{
    range: string;
    userCount: number;
    percentage: number;
  }>;
}

export interface UsageBasedPlan {
  name: string;
  basePrice: number;
  usagePrice: number;
  includedUsage: number;
  projectedUsers: number;
  projectedRevenue: number;
}

export interface ABTestRecommendation {
  testName: string;
  description: string;
  hypothesis: string;
  metrics: string[];
  duration: number;
  expectedImpact: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export class PricingAnalysisService {
  /**
   * Get comprehensive pricing analysis
   */
  async getPricingAnalysis(companyId: string): Promise<PricingAnalysis> {
    try {
      logger.info(`Getting pricing analysis for company ${companyId}`);

      const [
        currentPricing,
        willingnessToPay,
        valueBasedPricing,
        annualDiscountOptimization,
        grandfatherPricingRisk,
        usageBasedPricing,
        priceElasticity,
        abTestRecommendations
      ] = await Promise.all([
        this.getCurrentPricing(companyId),
        this.analyzeWillingnessToPay(companyId),
        this.analyzeValueBasedPricing(companyId),
        this.optimizeAnnualDiscounts(companyId),
        this.assessGrandfatherPricingRisk(companyId),
        this.analyzeUsageBasedPricing(companyId),
        this.calculatePriceElasticity(companyId),
        this.getABTestRecommendations(companyId)
      ]);

      return {
        currentPricing,
        willingnessToPay,
        valueBasedPricing,
        annualDiscountOptimization,
        grandfatherPricingRisk,
        usageBasedPricing,
        priceElasticity,
        abTestRecommendations
      };
    } catch (error) {
      logger.error(`Error getting pricing analysis: ${error.message}`);
      throw new Error(`Failed to get pricing analysis: ${error.message}`);
    }
  }

  /**
   * Get current pricing structure
   */
  private async getCurrentPricing(companyId: string) {
    const plans = await prisma.pricingPlan.findMany({
      where: { companyId },
      include: {
        subscriptions: {
          include: {
            customer: true
          }
        }
      }
    });

    const totalRevenue = plans.reduce((sum, plan) => {
      return sum + plan.subscriptions.reduce((planSum, sub) => planSum + sub.amount, 0);
    }, 0);

    const totalUsers = plans.reduce((sum, plan) => sum + plan.subscriptions.length, 0);
    const averageRevenuePerUser = totalUsers > 0 ? totalRevenue / totalUsers : 0;

    return {
      plans: plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        features: JSON.parse(plan.features),
        userCount: plan.subscriptions.length,
        revenue: plan.subscriptions.reduce((sum, sub) => sum + sub.amount, 0),
        churnRate: this.calculateChurnRate(plan.subscriptions),
        upgradeRate: this.calculateUpgradeRate(plan.subscriptions)
      })),
      totalRevenue,
      averageRevenuePerUser
    };
  }

  /**
   * Analyze willingness to pay
   */
  private async analyzeWillingnessToPay(companyId: string): Promise<{ analysis: WTPAnalysis; recommendations: string[] }> {
    const customerData = await this.getCustomerData(companyId);
    const upgradeData = await this.getUpgradeData(companyId);
    const usageData = await this.getUsageData(companyId);

    const analysis: WTPAnalysis = {
      overallWTP: this.calculateOverallWTP(customerData),
      bySegment: this.calculateWTPBySegment(customerData),
      byFeature: this.calculateWTPByFeature(customerData),
      upgradeBehavior: {
        upgradeRate: upgradeData.upgradeRate,
        averageUpgradeValue: upgradeData.averageValue,
        commonUpgradePaths: upgradeData.commonPaths
      },
      usagePatterns: {
        heavyUsers: usageData.heavyUsers,
        lightUsers: usageData.lightUsers,
        powerUsers: usageData.powerUsers
      }
    };

    const recommendations = this.generateWTPRecommendations(analysis);

    return { analysis, recommendations };
  }

  /**
   * Analyze value-based pricing opportunities
   */
  private async analyzeValueBasedPricing(companyId: string): Promise<{ recommendations: ValueBasedRecommendation[]; implementationSteps: string[] }> {
    const featureUsage = await this.getFeatureUsage(companyId);
    const customerFeedback = await this.getCustomerFeedback(companyId);
    const competitorPricing = await this.getCompetitorPricing(companyId);

    const recommendations: ValueBasedRecommendation[] = [];

    for (const feature of featureUsage) {
      const currentValue = feature.currentPricing;
      const recommendedValue = this.calculateOptimalFeaturePricing(feature, customerFeedback, competitorPricing);
      
      if (recommendedValue !== currentValue) {
        recommendations.push({
          feature: feature.name,
          currentValue,
          recommendedValue,
          justification: this.generateFeatureJustification(feature, recommendedValue),
          implementationEffort: this.assessImplementationEffort(feature)
        });
      }
    }

    const implementationSteps = [
      'Conduct customer interviews to validate value propositions',
      'A/B test new pricing with small customer segment',
      'Gradually roll out to broader customer base',
      'Monitor churn and upgrade rates closely',
      'Adjust pricing based on market response'
    ];

    return { recommendations, implementationSteps };
  }

  /**
   * Optimize annual discount structure
   */
  private async optimizeAnnualDiscounts(companyId: string) {
    const currentPricing = await this.getCurrentPricing(companyId);
    const customerData = await this.getCustomerData(companyId);
    
    const currentDiscount = this.getCurrentAnnualDiscount(currentPricing);
    const optimalDiscount = this.calculateOptimalAnnualDiscount(customerData);
    const revenueImpact = this.calculateDiscountRevenueImpact(currentDiscount, optimalDiscount, customerData);

    return {
      currentDiscount,
      optimalDiscount,
      revenueImpact
    };
  }

  /**
   * Assess grandfather pricing risk
   */
  private async assessGrandfatherPricingRisk(companyId: string) {
    const grandfatherCustomers = await this.getGrandfatherCustomers(companyId);
    const currentPricing = await this.getCurrentPricing(companyId);
    
    const affectedRevenue = grandfatherCustomers.reduce((sum, customer) => sum + customer.annualRevenue, 0);
    const riskLevel = this.calculateGrandfatherRisk(affectedRevenue, currentPricing.totalRevenue);
    
    const mitigationStrategies = [
      'Implement grandfather pricing sunset timeline',
      'Offer migration incentives to new pricing',
      'Create value-added features for new pricing tiers',
      'Communicate changes well in advance',
      'Provide support during transition period'
    ];

    return {
      riskLevel,
      affectedRevenue,
      mitigationStrategies
    };
  }

  /**
   * Analyze usage-based pricing opportunities
   */
  private async analyzeUsageBasedPricing(companyId: string) {
    const usageMetrics = await this.getUsageMetrics(companyId);
    const currentPricing = await this.getCurrentPricing(companyId);
    
    const recommendedPricing = this.generateUsageBasedPlans(usageMetrics);
    const revenueProjection = this.calculateUsageBasedRevenue(usageMetrics, recommendedPricing);

    return {
      currentUsage: usageMetrics,
      recommendedPricing,
      revenueProjection
    };
  }

  /**
   * Calculate price elasticity
   */
  private async calculatePriceElasticity(companyId: string) {
    const historicalData = await this.getHistoricalPricingData(companyId);
    const elasticity = this.calculateElasticityCoefficient(historicalData);
    const optimalPrice = this.calculateOptimalPrice(elasticity, historicalData);
    const revenueImpact = this.calculateElasticityRevenueImpact(elasticity, optimalPrice, historicalData);

    return {
      elasticity,
      optimalPrice,
      revenueImpact
    };
  }

  /**
   * Get A/B test recommendations
   */
  private async getABTestRecommendations(companyId: string) {
    const currentPricing = await this.getCurrentPricing(companyId);
    const customerSegments = await this.getCustomerSegments(companyId);
    
    const tests: ABTestRecommendation[] = [
      {
        testName: 'Price Sensitivity Test',
        description: 'Test different price points for new customers',
        hypothesis: 'Higher prices will reduce conversion but increase revenue per customer',
        metrics: ['conversion_rate', 'revenue_per_customer', 'churn_rate'],
        duration: 30,
        expectedImpact: 0.15,
        riskLevel: 'medium'
      },
      {
        testName: 'Feature-Based Pricing Test',
        description: 'Test pricing based on feature usage',
        hypothesis: 'Usage-based pricing will increase revenue from power users',
        metrics: ['revenue_per_user', 'feature_adoption', 'customer_satisfaction'],
        duration: 45,
        expectedImpact: 0.25,
        riskLevel: 'high'
      },
      {
        testName: 'Annual Discount Test',
        description: 'Test different annual discount percentages',
        hypothesis: 'Higher discounts will increase annual subscriptions',
        metrics: ['annual_conversion_rate', 'lifetime_value', 'cash_flow'],
        duration: 60,
        expectedImpact: 0.20,
        riskLevel: 'low'
      }
    ];

    const expectedImpact = tests.reduce((sum, test) => sum + test.expectedImpact, 0) / tests.length;

    return {
      tests,
      expectedImpact
    };
  }

  // Helper methods
  private calculateChurnRate(subscriptions: any[]): number {
    // Implementation to calculate churn rate
    return 0.05; // 5% churn rate
  }

  private calculateUpgradeRate(subscriptions: any[]): number {
    // Implementation to calculate upgrade rate
    return 0.15; // 15% upgrade rate
  }

  private async getCustomerData(companyId: string) {
    // Implementation to get customer data
    return {
      totalCustomers: 150,
      segments: [
        { name: 'Enterprise', count: 20, avgSpend: 5000 },
        { name: 'SMB', count: 80, avgSpend: 500 },
        { name: 'Startup', count: 50, avgSpend: 100 }
      ]
    };
  }

  private async getUpgradeData(companyId: string) {
    // Implementation to get upgrade data
    return {
      upgradeRate: 0.15,
      averageValue: 2000,
      commonPaths: ['Basic → Pro', 'Pro → Enterprise']
    };
  }

  private async getUsageData(companyId: string) {
    // Implementation to get usage data
    return {
      heavyUsers: 30,
      lightUsers: 80,
      powerUsers: 40
    };
  }

  private calculateOverallWTP(customerData: any): number {
    // Implementation to calculate overall WTP
    return 750; // Example value
  }

  private calculateWTPBySegment(customerData: any) {
    return customerData.segments.map((segment: any) => ({
      segment: segment.name,
      wtp: segment.avgSpend * 1.2, // 20% above current spend
      confidence: 0.8
    }));
  }

  private calculateWTPByFeature(customerData: any) {
    return [
      { feature: 'Advanced Analytics', wtp: 200, importance: 0.9 },
      { feature: 'API Access', wtp: 150, importance: 0.8 },
      { feature: 'Priority Support', wtp: 100, importance: 0.7 }
    ];
  }

  private generateWTPRecommendations(analysis: WTPAnalysis): string[] {
    const recommendations: string[] = [];
    
    if (analysis.overallWTP > 500) {
      recommendations.push('Consider premium pricing for high-value features');
    }
    
    if (analysis.upgradeBehavior.upgradeRate < 0.2) {
      recommendations.push('Improve upgrade incentives and communication');
    }
    
    if (analysis.usagePatterns.powerUsers > 0.3) {
      recommendations.push('Implement usage-based pricing for power users');
    }
    
    return recommendations;
  }

  private async getFeatureUsage(companyId: string) {
    return [
      { name: 'Advanced Analytics', currentPricing: 100, usage: 0.8, satisfaction: 0.9 },
      { name: 'API Access', currentPricing: 50, usage: 0.6, satisfaction: 0.8 },
      { name: 'Priority Support', currentPricing: 75, usage: 0.4, satisfaction: 0.7 }
    ];
  }

  private async getCustomerFeedback(companyId: string) {
    return {
      satisfaction: 0.85,
      featureRequests: ['Better Analytics', 'More API Endpoints'],
      complaints: ['Pricing too high', 'Limited features']
    };
  }

  private async getCompetitorPricing(companyId: string) {
    return {
      average: 800,
      range: { min: 500, max: 1200 },
      features: {
        'Advanced Analytics': 200,
        'API Access': 150,
        'Priority Support': 100
      }
    };
  }

  private calculateOptimalFeaturePricing(feature: any, feedback: any, competitor: any): number {
    // Implementation to calculate optimal feature pricing
    return feature.currentPricing * 1.2; // 20% increase
  }

  private generateFeatureJustification(feature: any, recommendedValue: number): string {
    return `Based on usage (${(feature.usage * 100).toFixed(0)}%) and satisfaction (${(feature.satisfaction * 100).toFixed(0)}%), this feature can support a ${((recommendedValue / feature.currentPricing - 1) * 100).toFixed(0)}% price increase.`;
  }

  private assessImplementationEffort(feature: any): 'low' | 'medium' | 'high' {
    if (feature.usage > 0.8) return 'low';
    if (feature.usage > 0.5) return 'medium';
    return 'high';
  }

  private getCurrentAnnualDiscount(pricing: any): number {
    return 0.15; // 15% current discount
  }

  private calculateOptimalAnnualDiscount(customerData: any): number {
    return 0.20; // 20% optimal discount
  }

  private calculateDiscountRevenueImpact(current: number, optimal: number, customerData: any): number {
    return (optimal - current) * customerData.totalCustomers * 1000; // Example calculation
  }

  private async getGrandfatherCustomers(companyId: string) {
    return [
      { id: '1', annualRevenue: 5000, pricingTier: 'Legacy' },
      { id: '2', annualRevenue: 3000, pricingTier: 'Legacy' }
    ];
  }

  private calculateGrandfatherRisk(affectedRevenue: number, totalRevenue: number): 'low' | 'medium' | 'high' {
    const percentage = affectedRevenue / totalRevenue;
    if (percentage > 0.3) return 'high';
    if (percentage > 0.1) return 'medium';
    return 'low';
  }

  private async getUsageMetrics(companyId: string): Promise<UsageMetrics> {
    return {
      totalUsers: 150,
      activeUsers: 120,
      averageUsage: 75,
      usageDistribution: [
        { range: '0-25%', userCount: 30, percentage: 20 },
        { range: '25-50%', userCount: 45, percentage: 30 },
        { range: '50-75%', userCount: 45, percentage: 30 },
        { range: '75-100%', userCount: 30, percentage: 20 }
      ]
    };
  }

  private generateUsageBasedPlans(metrics: UsageMetrics): UsageBasedPlan[] {
    return [
      {
        name: 'Starter',
        basePrice: 29,
        usagePrice: 0.10,
        includedUsage: 1000,
        projectedUsers: 50,
        projectedRevenue: 1450
      },
      {
        name: 'Professional',
        basePrice: 99,
        usagePrice: 0.05,
        includedUsage: 10000,
        projectedUsers: 70,
        projectedRevenue: 6930
      }
    ];
  }

  private calculateUsageBasedRevenue(metrics: UsageMetrics, plans: UsageBasedPlan[]): number {
    return plans.reduce((sum, plan) => sum + plan.projectedRevenue, 0);
  }

  private async getHistoricalPricingData(companyId: string) {
    return [
      { price: 100, demand: 100, revenue: 10000 },
      { price: 120, demand: 90, revenue: 10800 },
      { price: 140, demand: 80, revenue: 11200 }
    ];
  }

  private calculateElasticityCoefficient(data: any[]): number {
    // Simplified elasticity calculation
    return -1.5; // Elastic demand
  }

  private calculateOptimalPrice(elasticity: number, data: any[]): number {
    // Implementation to calculate optimal price based on elasticity
    return 130;
  }

  private calculateElasticityRevenueImpact(elasticity: number, optimalPrice: number, data: any[]): number {
    // Implementation to calculate revenue impact
    return 1500;
  }

  private async getCustomerSegments(companyId: string) {
    return [
      { name: 'Enterprise', size: 20, priceSensitivity: 'low' },
      { name: 'SMB', size: 80, priceSensitivity: 'medium' },
      { name: 'Startup', size: 50, priceSensitivity: 'high' }
    ];
  }
}









