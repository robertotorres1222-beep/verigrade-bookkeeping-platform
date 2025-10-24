import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';

const prisma = new PrismaClient();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface PricingRecommendation {
  id: string;
  userId: string;
  recommendationType: 'price_increase' | 'price_decrease' | 'tier_optimization' | 'discount_strategy' | 'bundling';
  title: string;
  description: string;
  currentPrice: number;
  recommendedPrice: number;
  expectedImpact: number;
  confidence: number;
  reasoning: string[];
  actionItems: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  implementationTime: string;
  createdAt: Date;
}

export interface PricingAnalysis {
  currentPricing: {
    averagePrice: number;
    priceRange: { min: number; max: number };
    priceDistribution: Array<{ price: number; frequency: number }>;
  };
  competitivePosition: {
    marketPosition: 'premium' | 'mid-market' | 'budget';
    competitiveAdvantage: number;
    priceElasticity: number;
  };
  customerSegments: Array<{
    segment: string;
    averagePrice: number;
    priceSensitivity: number;
    growthPotential: number;
  }>;
}

export interface PriceElasticityModel {
  product: string;
  currentPrice: number;
  priceElasticity: number;
  optimalPrice: number;
  revenueImpact: number;
  demandImpact: number;
}

export class PricingStrategyService {
  /**
   * Generate pricing strategy recommendations
   */
  async generatePricingRecommendations(userId: string): Promise<PricingRecommendation[]> {
    try {
      const recommendations: PricingRecommendation[] = [];
      
      // Get pricing data
      const pricingData = await this.getPricingData(userId);
      
      // Price increase opportunities
      const increaseRecommendations = await this.analyzePriceIncreaseOpportunities(userId, pricingData);
      recommendations.push(...increaseRecommendations);
      
      // Price decrease opportunities
      const decreaseRecommendations = await this.analyzePriceDecreaseOpportunities(userId, pricingData);
      recommendations.push(...decreaseRecommendations);
      
      // Tier optimization
      const tierRecommendations = await this.analyzeTierOptimization(userId, pricingData);
      recommendations.push(...tierRecommendations);
      
      // Discount strategy
      const discountRecommendations = await this.analyzeDiscountStrategy(userId, pricingData);
      recommendations.push(...discountRecommendations);
      
      // Bundling opportunities
      const bundlingRecommendations = await this.analyzeBundlingOpportunities(userId, pricingData);
      recommendations.push(...bundlingRecommendations);
      
      // Sort by expected impact
      return recommendations.sort((a, b) => b.expectedImpact - a.expectedImpact);

    } catch (error) {
      console.error('Error generating pricing recommendations:', error);
      return [];
    }
  }

  /**
   * Get pricing data for analysis
   */
  private async getPricingData(userId: string): Promise<any> {
    try {
      // Get invoice data for pricing analysis
      const invoices = await prisma.invoice.findMany({
        where: { userId },
        select: {
          total: true,
          createdAt: true,
          status: true,
          client: {
            select: { name: true, industry: true }
          }
        }
      });
      
      const paidInvoices = invoices.filter(i => i.status === 'PAID');
      const averageInvoiceAmount = paidInvoices.length > 0 
        ? paidInvoices.reduce((sum, i) => sum + i.total, 0) / paidInvoices.length 
        : 0;
      
      // Get client segments
      const clientSegments = await this.analyzeClientSegments(paidInvoices);
      
      // Get competitive data (mock - in real implementation, this would be from market research)
      const competitiveData = {
        marketAverage: averageInvoiceAmount * 1.1,
        competitorPrices: [averageInvoiceAmount * 0.8, averageInvoiceAmount * 1.2, averageInvoiceAmount * 1.5],
        marketPosition: averageInvoiceAmount > averageInvoiceAmount * 1.1 ? 'premium' : 'mid-market'
      };
      
      return {
        averageInvoiceAmount,
        totalInvoices: paidInvoices.length,
        clientSegments,
        competitiveData,
        priceHistory: this.generatePriceHistory(paidInvoices)
      };

    } catch (error) {
      console.error('Error getting pricing data:', error);
      return {
        averageInvoiceAmount: 0,
        totalInvoices: 0,
        clientSegments: [],
        competitiveData: { marketAverage: 0, competitorPrices: [], marketPosition: 'mid-market' },
        priceHistory: []
      };
    }
  }

  /**
   * Analyze client segments
   */
  private async analyzeClientSegments(invoices: any[]): Promise<any[]> {
    const segments: { [key: string]: { total: number; count: number; average: number } } = {};
    
    invoices.forEach(invoice => {
      const industry = invoice.client?.industry || 'Other';
      if (!segments[industry]) {
        segments[industry] = { total: 0, count: 0, average: 0 };
      }
      segments[industry].total += invoice.total;
      segments[industry].count += 1;
    });
    
    return Object.entries(segments).map(([industry, data]) => ({
      industry,
      totalRevenue: data.total,
      clientCount: data.count,
      averagePrice: data.total / data.count,
      priceSensitivity: this.calculatePriceSensitivity(industry, data.total / data.count),
      growthPotential: this.calculateGrowthPotential(industry)
    }));
  }

  /**
   * Calculate price sensitivity for segment
   */
  private calculatePriceSensitivity(industry: string, averagePrice: number): number {
    // Mock calculation - in real implementation, this would use historical data
    const sensitivityMap: { [key: string]: number } = {
      'Technology': 0.3,
      'Healthcare': 0.2,
      'Finance': 0.4,
      'Retail': 0.6,
      'Manufacturing': 0.5,
      'Other': 0.4
    };
    
    return sensitivityMap[industry] || 0.4;
  }

  /**
   * Calculate growth potential for segment
   */
  private calculateGrowthPotential(industry: string): number {
    // Mock calculation - in real implementation, this would use market data
    const growthMap: { [key: string]: number } = {
      'Technology': 0.8,
      'Healthcare': 0.6,
      'Finance': 0.7,
      'Retail': 0.4,
      'Manufacturing': 0.5,
      'Other': 0.5
    };
    
    return growthMap[industry] || 0.5;
  }

  /**
   * Generate price history
   */
  private generatePriceHistory(invoices: any[]): Array<{ date: string; averagePrice: number }> {
    const monthlyData: { [key: string]: { total: number; count: number } } = {};
    
    invoices.forEach(invoice => {
      const month = invoice.createdAt.toISOString().substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { total: 0, count: 0 };
      }
      monthlyData[month].total += invoice.total;
      monthlyData[month].count += 1;
    });
    
    return Object.entries(monthlyData).map(([month, data]) => ({
      date: month,
      averagePrice: data.total / data.count
    })).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Analyze price increase opportunities
   */
  private async analyzePriceIncreaseOpportunities(userId: string, pricingData: any): Promise<PricingRecommendation[]> {
    const recommendations: PricingRecommendation[] = [];
    
    // General price increase
    if (pricingData.averageInvoiceAmount < pricingData.competitiveData.marketAverage) {
      const recommendedIncrease = pricingData.averageInvoiceAmount * 0.1; // 10% increase
      const expectedRevenueIncrease = recommendedIncrease * pricingData.totalInvoices;
      
      recommendations.push({
        id: `price_increase_general_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        recommendationType: 'price_increase',
        title: 'General price increase',
        description: `Increase prices by 10% to align with market rates`,
        currentPrice: pricingData.averageInvoiceAmount,
        recommendedPrice: pricingData.averageInvoiceAmount * 1.1,
        expectedImpact: expectedRevenueIncrease,
        confidence: 0.7,
        reasoning: [
          `Current average: $${pricingData.averageInvoiceAmount.toLocaleString()}`,
          `Market average: $${pricingData.competitiveData.marketAverage.toLocaleString()}`,
          `10% increase aligns with market rates`
        ],
        actionItems: [
          'Update pricing in system',
          'Notify existing clients of price changes',
          'Update marketing materials',
          'Monitor client retention after increase'
        ],
        priority: expectedRevenueIncrease > 10000 ? 'high' : 'medium',
        implementationTime: '2-4 weeks',
        createdAt: new Date()
      });
    }
    
    // Segment-specific price increases
    for (const segment of pricingData.clientSegments) {
      if (segment.priceSensitivity < 0.3 && segment.growthPotential > 0.6) {
        const segmentIncrease = segment.averagePrice * 0.15; // 15% increase for low-sensitivity, high-growth segments
        const expectedImpact = segmentIncrease * segment.clientCount;
        
        recommendations.push({
          id: `price_increase_${segment.industry}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          recommendationType: 'price_increase',
          title: `${segment.industry} segment price increase`,
          description: `Increase prices for ${segment.industry} clients by 15%`,
          currentPrice: segment.averagePrice,
          recommendedPrice: segment.averagePrice * 1.15,
          expectedImpact,
          confidence: 0.8,
          reasoning: [
            `${segment.industry} has low price sensitivity (${segment.priceSensitivity})`,
            `High growth potential (${segment.growthPotential})`,
            `Current average: $${segment.averagePrice.toLocaleString()}`
          ],
          actionItems: [
            `Update pricing for ${segment.industry} clients`,
            'Create segment-specific pricing strategy',
            'Monitor client retention',
            'Track revenue impact'
          ],
          priority: expectedImpact > 5000 ? 'high' : 'medium',
          implementationTime: '3-4 weeks',
          createdAt: new Date()
        });
      }
    }
    
    return recommendations;
  }

  /**
   * Analyze price decrease opportunities
   */
  private async analyzePriceDecreaseOpportunities(userId: string, pricingData: any): Promise<PricingRecommendation[]> {
    const recommendations: PricingRecommendation[] = [];
    
    // Competitive pricing adjustment
    if (pricingData.averageInvoiceAmount > pricingData.competitiveData.marketAverage * 1.2) {
      const recommendedDecrease = pricingData.averageInvoiceAmount * 0.1; // 10% decrease
      const expectedVolumeIncrease = pricingData.totalInvoices * 0.2; // 20% volume increase
      const expectedImpact = (pricingData.averageInvoiceAmount - recommendedDecrease) * expectedVolumeIncrease - pricingData.averageInvoiceAmount * pricingData.totalInvoices;
      
      recommendations.push({
        id: `price_decrease_competitive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        recommendationType: 'price_decrease',
        title: 'Competitive pricing adjustment',
        description: `Reduce prices by 10% to improve market competitiveness`,
        currentPrice: pricingData.averageInvoiceAmount,
        recommendedPrice: pricingData.averageInvoiceAmount * 0.9,
        expectedImpact,
        confidence: 0.6,
        reasoning: [
          `Current price: $${pricingData.averageInvoiceAmount.toLocaleString()}`,
          `Market average: $${pricingData.competitiveData.marketAverage.toLocaleString()}`,
          `Price reduction may increase volume`
        ],
        actionItems: [
          'Analyze price elasticity',
          'Test price reduction with select clients',
          'Update competitive analysis',
          'Monitor volume and revenue impact'
        ],
        priority: 'medium',
        implementationTime: '4-6 weeks',
        createdAt: new Date()
      });
    }
    
    return recommendations;
  }

  /**
   * Analyze tier optimization
   */
  private async analyzeTierOptimization(userId: string, pricingData: any): Promise<PricingRecommendation[]> {
    const recommendations: PricingRecommendation[] = [];
    
    // Create pricing tiers
    const basicTier = pricingData.averageInvoiceAmount * 0.7;
    const standardTier = pricingData.averageInvoiceAmount;
    const premiumTier = pricingData.averageInvoiceAmount * 1.5;
    
    recommendations.push({
      id: `tier_optimization_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      recommendationType: 'tier_optimization',
      title: 'Implement pricing tiers',
      description: `Create Basic ($${basicTier.toLocaleString()}), Standard ($${standardTier.toLocaleString()}), and Premium ($${premiumTier.toLocaleString()}) tiers`,
      currentPrice: pricingData.averageInvoiceAmount,
      recommendedPrice: standardTier,
      expectedImpact: pricingData.averageInvoiceAmount * 0.2, // 20% revenue increase
      confidence: 0.7,
      reasoning: [
        'Tiered pricing captures different customer segments',
        'Basic tier attracts price-sensitive customers',
        'Premium tier maximizes revenue from high-value customers'
      ],
      actionItems: [
        'Define tier features and benefits',
        'Create tier comparison chart',
        'Update pricing page',
        'Train sales team on tier positioning'
      ],
      priority: 'high',
      implementationTime: '6-8 weeks',
      createdAt: new Date()
    });
    
    return recommendations;
  }

  /**
   * Analyze discount strategy
   */
  private async analyzeDiscountStrategy(userId: string, pricingData: any): Promise<PricingRecommendation[]> {
    const recommendations: PricingRecommendation[] = [];
    
    // Early payment discount
    const earlyPaymentDiscount = pricingData.averageInvoiceAmount * 0.02; // 2% discount
    const expectedImpact = earlyPaymentDiscount * pricingData.totalInvoices * 0.3; // 30% adoption
    
    recommendations.push({
      id: `discount_early_payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      recommendationType: 'discount_strategy',
      title: 'Early payment discount',
      description: `Offer 2% discount for payments within 10 days`,
      currentPrice: pricingData.averageInvoiceAmount,
      recommendedPrice: pricingData.averageInvoiceAmount * 0.98,
      expectedImpact,
      confidence: 0.8,
      reasoning: [
        'Improves cash flow',
        'Reduces collection time',
        'Common industry practice'
      ],
      actionItems: [
        'Update payment terms',
        'Modify invoice templates',
        'Communicate discount to clients',
        'Track adoption rate'
      ],
      priority: 'medium',
      implementationTime: '1-2 weeks',
      createdAt: new Date()
    });
    
    // Volume discount
    const volumeDiscount = pricingData.averageInvoiceAmount * 0.05; // 5% discount
    const expectedVolumeImpact = pricingData.totalInvoices * 0.15; // 15% volume increase
    
    recommendations.push({
      id: `discount_volume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      recommendationType: 'discount_strategy',
      title: 'Volume discount program',
      description: `Offer 5% discount for annual contracts or large volumes`,
      currentPrice: pricingData.averageInvoiceAmount,
      recommendedPrice: pricingData.averageInvoiceAmount * 0.95,
      expectedImpact: expectedVolumeImpact * pricingData.averageInvoiceAmount * 0.95,
      confidence: 0.6,
      reasoning: [
        'Encourages larger commitments',
        'Improves customer retention',
        'Increases average deal size'
      ],
      actionItems: [
        'Define volume thresholds',
        'Create volume discount schedule',
        'Update contract templates',
        'Train sales team on volume pricing'
      ],
      priority: 'medium',
      implementationTime: '3-4 weeks',
      createdAt: new Date()
    });
    
    return recommendations;
  }

  /**
   * Analyze bundling opportunities
   */
  private async analyzeBundlingOpportunities(userId: string, pricingData: any): Promise<PricingRecommendation[]> {
    const recommendations: PricingRecommendation[] = [];
    
    // Service bundling
    const bundlePrice = pricingData.averageInvoiceAmount * 1.3; // 30% premium for bundle
    const expectedImpact = bundlePrice * pricingData.totalInvoices * 0.2; // 20% adoption
    
    recommendations.push({
      id: `bundling_services_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      recommendationType: 'bundling',
      title: 'Service bundle offering',
      description: `Create service bundles with 30% premium pricing`,
      currentPrice: pricingData.averageInvoiceAmount,
      recommendedPrice: bundlePrice,
      expectedImpact,
      confidence: 0.7,
      reasoning: [
        'Bundles increase average deal size',
        'Reduces customer acquisition cost',
        'Improves customer lifetime value'
      ],
      actionItems: [
        'Identify complementary services',
        'Create bundle packages',
        'Develop bundle pricing strategy',
        'Create marketing materials for bundles'
      ],
      priority: 'medium',
      implementationTime: '4-6 weeks',
      createdAt: new Date()
    });
    
    return recommendations;
  }

  /**
   * Get pricing strategy dashboard
   */
  async getPricingStrategyDashboard(userId: string): Promise<{
    recommendations: PricingRecommendation[];
    analysis: PricingAnalysis;
    elasticityModels: PriceElasticityModel[];
    insights: {
      currentPricing: number;
      marketPosition: string;
      optimizationPotential: number;
      competitiveAdvantage: number;
    };
  }> {
    try {
      const recommendations = await this.generatePricingRecommendations(userId);
      const pricingData = await this.getPricingData(userId);
      
      const analysis: PricingAnalysis = {
        currentPricing: {
          averagePrice: pricingData.averageInvoiceAmount,
          priceRange: { min: pricingData.averageInvoiceAmount * 0.5, max: pricingData.averageInvoiceAmount * 2 },
          priceDistribution: this.generatePriceDistribution(pricingData.averageInvoiceAmount)
        },
        competitivePosition: {
          marketPosition: pricingData.competitiveData.marketPosition,
          competitiveAdvantage: this.calculateCompetitiveAdvantage(pricingData),
          priceElasticity: this.calculatePriceElasticity(pricingData)
        },
        customerSegments: pricingData.clientSegments
      };
      
      const elasticityModels = this.generateElasticityModels(pricingData);
      
      const insights = {
        currentPricing: pricingData.averageInvoiceAmount,
        marketPosition: pricingData.competitiveData.marketPosition,
        optimizationPotential: recommendations.reduce((sum, r) => sum + r.expectedImpact, 0),
        competitiveAdvantage: analysis.competitivePosition.competitiveAdvantage
      };
      
      return {
        recommendations,
        analysis,
        elasticityModels,
        insights
      };

    } catch (error) {
      console.error('Error getting pricing strategy dashboard:', error);
      return {
        recommendations: [],
        analysis: {
          currentPricing: { averagePrice: 0, priceRange: { min: 0, max: 0 }, priceDistribution: [] },
          competitivePosition: { marketPosition: 'mid-market', competitiveAdvantage: 0, priceElasticity: 0 },
          customerSegments: []
        },
        elasticityModels: [],
        insights: {
          currentPricing: 0,
          marketPosition: 'mid-market',
          optimizationPotential: 0,
          competitiveAdvantage: 0
        }
      };
    }
  }

  /**
   * Generate price distribution
   */
  private generatePriceDistribution(averagePrice: number): Array<{ price: number; frequency: number }> {
    return [
      { price: averagePrice * 0.5, frequency: 0.1 },
      { price: averagePrice * 0.7, frequency: 0.2 },
      { price: averagePrice, frequency: 0.4 },
      { price: averagePrice * 1.3, frequency: 0.2 },
      { price: averagePrice * 1.5, frequency: 0.1 }
    ];
  }

  /**
   * Calculate competitive advantage
   */
  private calculateCompetitiveAdvantage(pricingData: any): number {
    const priceRatio = pricingData.averageInvoiceAmount / pricingData.competitiveData.marketAverage;
    return priceRatio > 1 ? (priceRatio - 1) * 100 : -(1 - priceRatio) * 100;
  }

  /**
   * Calculate price elasticity
   */
  private calculatePriceElasticity(pricingData: any): number {
    // Mock calculation - in real implementation, this would use historical data
    return -0.5; // Typical price elasticity for business services
  }

  /**
   * Generate elasticity models
   */
  private generateElasticityModels(pricingData: any): PriceElasticityModel[] {
    return [
      {
        product: 'Core Services',
        currentPrice: pricingData.averageInvoiceAmount,
        priceElasticity: -0.5,
        optimalPrice: pricingData.averageInvoiceAmount * 1.1,
        revenueImpact: pricingData.averageInvoiceAmount * 0.1,
        demandImpact: -0.05
      }
    ];
  }
}

export default PricingStrategyService;






