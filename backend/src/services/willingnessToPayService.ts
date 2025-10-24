import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface WTPAnalysis {
  overallWTP: number;
  bySegment: Array<{
    segment: string;
    wtp: number;
    confidence: number;
    sampleSize: number;
  }>;
  byFeature: Array<{
    feature: string;
    wtp: number;
    importance: number;
    usage: number;
  }>;
  byCustomer: Array<{
    customerId: string;
    customerName: string;
    wtp: number;
    factors: string[];
  }>;
  upgradeBehavior: {
    upgradeRate: number;
    averageUpgradeValue: number;
    commonUpgradePaths: string[];
    upgradeTriggers: string[];
  };
  usagePatterns: {
    heavyUsers: number;
    lightUsers: number;
    powerUsers: number;
    usageDistribution: Array<{
      range: string;
      userCount: number;
      averageWTP: number;
    }>;
  };
  priceSensitivity: {
    overall: number;
    bySegment: Array<{
      segment: string;
      sensitivity: number;
    }>;
    byFeature: Array<{
      feature: string;
      sensitivity: number;
    }>;
  };
}

export interface WTPRecommendation {
  type: 'pricing' | 'packaging' | 'positioning';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  expectedRevenue: number;
  implementationSteps: string[];
}

export class WillingnessToPayService {
  /**
   * Analyze willingness to pay across all dimensions
   */
  async analyzeWillingnessToPay(companyId: string): Promise<WTPAnalysis> {
    try {
      logger.info(`Analyzing willingness to pay for company ${companyId}`);

      const [
        customerData,
        usageData,
        upgradeData,
        feedbackData,
        competitorData
      ] = await Promise.all([
        this.getCustomerData(companyId),
        this.getUsageData(companyId),
        this.getUpgradeData(companyId),
        this.getCustomerFeedback(companyId),
        this.getCompetitorData(companyId)
      ]);

      const analysis: WTPAnalysis = {
        overallWTP: this.calculateOverallWTP(customerData, usageData, feedbackData),
        bySegment: this.calculateWTPBySegment(customerData, usageData),
        byFeature: this.calculateWTPByFeature(usageData, feedbackData),
        byCustomer: this.calculateWTPByCustomer(customerData, usageData),
        upgradeBehavior: this.analyzeUpgradeBehavior(upgradeData),
        usagePatterns: this.analyzeUsagePatterns(usageData),
        priceSensitivity: this.calculatePriceSensitivity(customerData, competitorData)
      };

      return analysis;
    } catch (error) {
      logger.error(`Error analyzing willingness to pay: ${error.message}`);
      throw new Error(`Failed to analyze willingness to pay: ${error.message}`);
    }
  }

  /**
   * Generate WTP-based recommendations
   */
  async generateWTPRecommendations(companyId: string): Promise<WTPRecommendation[]> {
    try {
      const wtpAnalysis = await this.analyzeWillingnessToPay(companyId);
      const currentPricing = await this.getCurrentPricing(companyId);
      
      const recommendations: WTPRecommendation[] = [];

      // Pricing recommendations
      if (wtpAnalysis.overallWTP > currentPricing.averagePrice * 1.2) {
        recommendations.push({
          type: 'pricing',
          title: 'Increase Base Pricing',
          description: `Customers show willingness to pay ${wtpAnalysis.overallWTP} vs current ${currentPricing.averagePrice}`,
          impact: 'high',
          effort: 'low',
          expectedRevenue: (wtpAnalysis.overallWTP - currentPricing.averagePrice) * currentPricing.customerCount,
          implementationSteps: [
            'A/B test 20% price increase with new customers',
            'Monitor conversion and churn rates',
            'Gradually roll out to existing customers',
            'Communicate value proposition clearly'
          ]
        });
      }

      // Packaging recommendations
      const highValueFeatures = wtpAnalysis.byFeature.filter(f => f.wtp > 100);
      if (highValueFeatures.length > 0) {
        recommendations.push({
          type: 'packaging',
          title: 'Create Premium Tier',
          description: `Bundle high-value features (${highValueFeatures.map(f => f.feature).join(', ')}) into premium tier`,
          impact: 'medium',
          effort: 'medium',
          expectedRevenue: highValueFeatures.reduce((sum, f) => sum + f.wtp, 0) * 0.3 * currentPricing.customerCount,
          implementationSteps: [
            'Identify premium feature bundle',
            'Design new pricing tier',
            'Create upgrade flow and messaging',
            'Test with existing customers'
          ]
        });
      }

      // Positioning recommendations
      const enterpriseSegment = wtpAnalysis.bySegment.find(s => s.segment === 'Enterprise');
      if (enterpriseSegment && enterpriseSegment.wtp > currentPricing.averagePrice * 1.5) {
        recommendations.push({
          type: 'positioning',
          title: 'Enterprise Positioning',
          description: 'Enterprise customers show high WTP - create dedicated enterprise offering',
          impact: 'high',
          effort: 'high',
          expectedRevenue: enterpriseSegment.wtp * enterpriseSegment.sampleSize * 0.5,
          implementationSteps: [
            'Develop enterprise feature set',
            'Create enterprise sales process',
            'Hire enterprise sales team',
            'Build enterprise onboarding'
          ]
        });
      }

      return recommendations;
    } catch (error) {
      logger.error(`Error generating WTP recommendations: ${error.message}`);
      throw new Error(`Failed to generate WTP recommendations: ${error.message}`);
    }
  }

  /**
   * Calculate WTP for specific customer segment
   */
  async calculateSegmentWTP(companyId: string, segment: string): Promise<number> {
    try {
      const segmentData = await this.getSegmentData(companyId, segment);
      const usageData = await this.getSegmentUsage(companyId, segment);
      const feedbackData = await this.getSegmentFeedback(companyId, segment);

      return this.calculateSegmentWTPValue(segmentData, usageData, feedbackData);
    } catch (error) {
      logger.error(`Error calculating segment WTP: ${error.message}`);
      throw new Error(`Failed to calculate segment WTP: ${error.message}`);
    }
  }

  /**
   * Calculate WTP for specific feature
   */
  async calculateFeatureWTP(companyId: string, feature: string): Promise<number> {
    try {
      const featureUsage = await this.getFeatureUsage(companyId, feature);
      const featureFeedback = await this.getFeatureFeedback(companyId, feature);
      const competitorPricing = await this.getCompetitorFeaturePricing(feature);

      return this.calculateFeatureWTPValue(featureUsage, featureFeedback, competitorPricing);
    } catch (error) {
      logger.error(`Error calculating feature WTP: ${error.message}`);
      throw new Error(`Failed to calculate feature WTP: ${error.message}`);
    }
  }

  /**
   * Get WTP trends over time
   */
  async getWTPTrends(companyId: string, months: number = 12): Promise<Array<{ month: string; wtp: number; factors: string[] }>> {
    try {
      const trends = [];
      const currentDate = new Date();
      
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthData = await this.getMonthlyData(companyId, date);
        
        trends.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          wtp: this.calculateMonthlyWTP(monthData),
          factors: this.identifyWTPFactors(monthData)
        });
      }

      return trends;
    } catch (error) {
      logger.error(`Error getting WTP trends: ${error.message}`);
      throw new Error(`Failed to get WTP trends: ${error.message}`);
    }
  }

  // Helper methods
  private async getCustomerData(companyId: string) {
    return await prisma.customer.findMany({
      where: { companyId },
      include: {
        subscriptions: true,
        usage: true
      }
    });
  }

  private async getUsageData(companyId: string) {
    return await prisma.usageRecord.findMany({
      where: { companyId },
      include: {
        customer: true,
        feature: true
      }
    });
  }

  private async getUpgradeData(companyId: string) {
    return await prisma.subscriptionChange.findMany({
      where: { 
        companyId,
        changeType: 'upgrade'
      },
      include: {
        customer: true,
        fromPlan: true,
        toPlan: true
      }
    });
  }

  private async getCustomerFeedback(companyId: string) {
    return await prisma.customerFeedback.findMany({
      where: { companyId },
      include: {
        customer: true
      }
    });
  }

  private async getCompetitorData(companyId: string) {
    // Mock implementation - in reality, this would query competitor data
    return {
      averagePrice: 800,
      priceRange: { min: 500, max: 1200 },
      features: {
        'Advanced Analytics': 200,
        'API Access': 150,
        'Priority Support': 100
      }
    };
  }

  private calculateOverallWTP(customerData: any, usageData: any, feedbackData: any): number {
    // Implementation to calculate overall WTP
    const currentSpend = customerData.reduce((sum: number, customer: any) => 
      sum + customer.subscriptions.reduce((subSum: number, sub: any) => subSum + sub.amount, 0), 0
    );
    
    const averageSpend = currentSpend / customerData.length;
    const usageMultiplier = this.calculateUsageMultiplier(usageData);
    const satisfactionMultiplier = this.calculateSatisfactionMultiplier(feedbackData);
    
    return averageSpend * usageMultiplier * satisfactionMultiplier;
  }

  private calculateWTPBySegment(customerData: any, usageData: any) {
    const segments = this.groupCustomersBySegment(customerData);
    
    return segments.map(segment => ({
      segment: segment.name,
      wtp: this.calculateSegmentWTPValue(segment.customers, usageData, []),
      confidence: this.calculateConfidence(segment.customers.length),
      sampleSize: segment.customers.length
    }));
  }

  private calculateWTPByFeature(usageData: any, feedbackData: any) {
    const features = this.groupUsageByFeature(usageData);
    
    return features.map(feature => ({
      feature: feature.name,
      wtp: this.calculateFeatureWTPValue(feature.usage, [], {}),
      importance: this.calculateFeatureImportance(feature.usage),
      usage: this.calculateFeatureUsage(feature.usage)
    }));
  }

  private calculateWTPByCustomer(customerData: any, usageData: any) {
    return customerData.slice(0, 10).map((customer: any) => ({
      customerId: customer.id,
      customerName: customer.name,
      wtp: this.calculateCustomerWTP(customer, usageData),
      factors: this.identifyCustomerWTPFactors(customer, usageData)
    }));
  }

  private analyzeUpgradeBehavior(upgradeData: any) {
    const totalCustomers = upgradeData.length;
    const upgradeRate = upgradeData.length / totalCustomers;
    const averageValue = upgradeData.reduce((sum: number, upgrade: any) => 
      sum + (upgrade.toPlan.price - upgrade.fromPlan.price), 0) / upgradeData.length;
    
    return {
      upgradeRate,
      averageUpgradeValue: averageValue,
      commonUpgradePaths: this.identifyCommonUpgradePaths(upgradeData),
      upgradeTriggers: this.identifyUpgradeTriggers(upgradeData)
    };
  }

  private analyzeUsagePatterns(usageData: any) {
    const usageStats = this.calculateUsageStats(usageData);
    
    return {
      heavyUsers: usageStats.heavyUsers,
      lightUsers: usageStats.lightUsers,
      powerUsers: usageStats.powerUsers,
      usageDistribution: this.calculateUsageDistribution(usageData)
    };
  }

  private calculatePriceSensitivity(customerData: any, competitorData: any) {
    return {
      overall: this.calculateOverallPriceSensitivity(customerData, competitorData),
      bySegment: this.calculateSegmentPriceSensitivity(customerData),
      byFeature: this.calculateFeaturePriceSensitivity(customerData)
    };
  }

  private async getCurrentPricing(companyId: string) {
    const plans = await prisma.pricingPlan.findMany({
      where: { companyId }
    });
    
    const totalRevenue = plans.reduce((sum, plan) => sum + plan.price, 0);
    const averagePrice = totalRevenue / plans.length;
    const customerCount = await prisma.customer.count({ where: { companyId } });
    
    return { averagePrice, customerCount };
  }

  private calculateUsageMultiplier(usageData: any): number {
    // Implementation to calculate usage multiplier
    return 1.2; // 20% increase for high usage
  }

  private calculateSatisfactionMultiplier(feedbackData: any): number {
    // Implementation to calculate satisfaction multiplier
    return 1.1; // 10% increase for high satisfaction
  }

  private groupCustomersBySegment(customerData: any) {
    // Implementation to group customers by segment
    return [
      { name: 'Enterprise', customers: customerData.slice(0, 20) },
      { name: 'SMB', customers: customerData.slice(20, 100) },
      { name: 'Startup', customers: customerData.slice(100) }
    ];
  }

  private calculateConfidence(sampleSize: number): number {
    // Implementation to calculate confidence based on sample size
    return Math.min(0.95, 0.5 + (sampleSize / 100) * 0.45);
  }

  private groupUsageByFeature(usageData: any) {
    // Implementation to group usage by feature
    return [
      { name: 'Advanced Analytics', usage: usageData.filter((u: any) => u.feature.name === 'Analytics') },
      { name: 'API Access', usage: usageData.filter((u: any) => u.feature.name === 'API') }
    ];
  }

  private calculateFeatureImportance(usage: any[]): number {
    // Implementation to calculate feature importance
    return 0.8; // Example value
  }

  private calculateFeatureUsage(usage: any[]): number {
    // Implementation to calculate feature usage
    return 0.6; // Example value
  }

  private calculateCustomerWTP(customer: any, usageData: any): number {
    // Implementation to calculate customer-specific WTP
    return 750; // Example value
  }

  private identifyCustomerWTPFactors(customer: any, usageData: any): string[] {
    // Implementation to identify customer WTP factors
    return ['High usage', 'Enterprise segment', 'Long tenure'];
  }

  private identifyCommonUpgradePaths(upgradeData: any): string[] {
    // Implementation to identify common upgrade paths
    return ['Basic → Pro', 'Pro → Enterprise'];
  }

  private identifyUpgradeTriggers(upgradeData: any): string[] {
    // Implementation to identify upgrade triggers
    return ['Feature limits reached', 'Team size growth', 'Advanced needs'];
  }

  private calculateUsageStats(usageData: any) {
    // Implementation to calculate usage statistics
    return {
      heavyUsers: 30,
      lightUsers: 80,
      powerUsers: 40
    };
  }

  private calculateUsageDistribution(usageData: any) {
    // Implementation to calculate usage distribution
    return [
      { range: '0-25%', userCount: 30, averageWTP: 500 },
      { range: '25-50%', userCount: 45, averageWTP: 750 },
      { range: '50-75%', userCount: 45, averageWTP: 1000 },
      { range: '75-100%', userCount: 30, averageWTP: 1500 }
    ];
  }

  private calculateOverallPriceSensitivity(customerData: any, competitorData: any): number {
    // Implementation to calculate overall price sensitivity
    return 0.7; // Example value (0 = not sensitive, 1 = very sensitive)
  }

  private calculateSegmentPriceSensitivity(customerData: any) {
    // Implementation to calculate segment price sensitivity
    return [
      { segment: 'Enterprise', sensitivity: 0.3 },
      { segment: 'SMB', sensitivity: 0.7 },
      { segment: 'Startup', sensitivity: 0.9 }
    ];
  }

  private calculateFeaturePriceSensitivity(customerData: any) {
    // Implementation to calculate feature price sensitivity
    return [
      { feature: 'Core Features', sensitivity: 0.2 },
      { feature: 'Advanced Features', sensitivity: 0.6 },
      { feature: 'Premium Features', sensitivity: 0.8 }
    ];
  }

  private async getSegmentData(companyId: string, segment: string) {
    // Implementation to get segment-specific data
    return [];
  }

  private async getSegmentUsage(companyId: string, segment: string) {
    // Implementation to get segment usage data
    return [];
  }

  private async getSegmentFeedback(companyId: string, segment: string) {
    // Implementation to get segment feedback data
    return [];
  }

  private calculateSegmentWTPValue(segmentData: any, usageData: any, feedbackData: any): number {
    // Implementation to calculate segment WTP value
    return 800; // Example value
  }

  private async getFeatureUsage(companyId: string, feature: string) {
    // Implementation to get feature usage data
    return [];
  }

  private async getFeatureFeedback(companyId: string, feature: string) {
    // Implementation to get feature feedback data
    return [];
  }

  private async getCompetitorFeaturePricing(feature: string) {
    // Implementation to get competitor feature pricing
    return 200; // Example value
  }

  private calculateFeatureWTPValue(usage: any, feedback: any, competitor: any): number {
    // Implementation to calculate feature WTP value
    return 150; // Example value
  }

  private async getMonthlyData(companyId: string, date: Date) {
    // Implementation to get monthly data
    return {};
  }

  private calculateMonthlyWTP(monthData: any): number {
    // Implementation to calculate monthly WTP
    return 750; // Example value
  }

  private identifyWTPFactors(monthData: any): string[] {
    // Implementation to identify WTP factors
    return ['Market conditions', 'Feature releases', 'Competitor pricing'];
  }
}





