import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';

const prisma = new PrismaClient();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface BillingOptimizationRecommendation {
  id: string;
  userId: string;
  clientId: string;
  clientName: string;
  recommendationType: 'billing_frequency' | 'billing_date' | 'price_increase' | 'churn_mitigation';
  title: string;
  description: string;
  currentValue: number;
  recommendedValue: number;
  potentialImpact: number;
  confidence: number;
  reasoning: string[];
  actionItems: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedImplementationTime: string;
  createdAt: Date;
}

export interface ClientBillingProfile {
  clientId: string;
  clientName: string;
  currentBillingFrequency: 'monthly' | 'quarterly' | 'annually';
  averageInvoiceAmount: number;
  paymentReliability: number;
  daysToPay: number;
  churnRisk: number;
  lifetimeValue: number;
  lastPaymentDate: Date;
  paymentPattern: 'consistent' | 'irregular' | 'declining';
}

export interface BillingOptimizationInsights {
  totalClients: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  averageDaysToPay: number;
  churnRiskClients: number;
  optimizationOpportunities: number;
  potentialRevenueIncrease: number;
}

export class BillingOptimizationService {
  /**
   * Generate billing optimization recommendations
   */
  async generateBillingOptimizationRecommendations(userId: string): Promise<BillingOptimizationRecommendation[]> {
    try {
      const recommendations: BillingOptimizationRecommendation[] = [];
      
      // Get client billing profiles
      const clientProfiles = await this.analyzeClientBillingProfiles(userId);
      
      // Generate recommendations for each client
      for (const profile of clientProfiles) {
        // Billing frequency optimization
        const frequencyRecommendations = await this.analyzeBillingFrequency(profile);
        recommendations.push(...frequencyRecommendations);
        
        // Billing date optimization
        const dateRecommendations = await this.analyzeBillingDates(profile);
        recommendations.push(...dateRecommendations);
        
        // Price increase opportunities
        const priceRecommendations = await this.analyzePriceIncreaseOpportunities(profile);
        recommendations.push(...priceRecommendations);
        
        // Churn risk mitigation
        const churnRecommendations = await this.analyzeChurnRiskMitigation(profile);
        recommendations.push(...churnRecommendations);
      }
      
      // Sort by potential impact
      return recommendations.sort((a, b) => b.potentialImpact - a.potentialImpact);

    } catch (error) {
      console.error('Error generating billing optimization recommendations:', error);
      return [];
    }
  }

  /**
   * Analyze client billing profiles
   */
  private async analyzeClientBillingProfiles(userId: string): Promise<ClientBillingProfile[]> {
    try {
      const profiles: ClientBillingProfile[] = [];
      
      // Get clients with their invoices
      const clients = await prisma.client.findMany({
        where: { userId },
        include: {
          invoices: {
            select: {
              total: true,
              createdAt: true,
              paidAt: true,
              status: true
            }
          }
        }
      });
      
      for (const client of clients) {
        const paidInvoices = client.invoices.filter(i => i.status === 'PAID');
        const averageInvoiceAmount = paidInvoices.length > 0 
          ? paidInvoices.reduce((sum, i) => sum + i.total, 0) / paidInvoices.length 
          : 0;
        
        // Calculate payment reliability
        const paymentReliability = this.calculatePaymentReliability(paidInvoices);
        
        // Calculate average days to pay
        const daysToPay = this.calculateAverageDaysToPay(paidInvoices);
        
        // Calculate churn risk
        const churnRisk = this.calculateChurnRisk(client, paidInvoices);
        
        // Calculate lifetime value
        const lifetimeValue = paidInvoices.reduce((sum, i) => sum + i.total, 0);
        
        // Determine payment pattern
        const paymentPattern = this.determinePaymentPattern(paidInvoices);
        
        // Determine billing frequency
        const billingFrequency = this.determineBillingFrequency(paidInvoices);
        
        const lastPaymentDate = paidInvoices.length > 0 
          ? new Date(Math.max(...paidInvoices.map(i => i.paidAt?.getTime() || 0)))
          : new Date();
        
        profiles.push({
          clientId: client.id,
          clientName: client.name,
          currentBillingFrequency: billingFrequency,
          averageInvoiceAmount,
          paymentReliability,
          daysToPay,
          churnRisk,
          lifetimeValue,
          lastPaymentDate,
          paymentPattern
        });
      }
      
      return profiles;

    } catch (error) {
      console.error('Error analyzing client billing profiles:', error);
      return [];
    }
  }

  /**
   * Analyze billing frequency optimization
   */
  private async analyzeBillingFrequency(profile: ClientBillingProfile): Promise<BillingOptimizationRecommendation[]> {
    const recommendations: BillingOptimizationRecommendation[] = [];
    
    // Recommend annual billing for reliable clients
    if (profile.paymentReliability > 80 && profile.currentBillingFrequency !== 'annually') {
      const annualSavings = profile.averageInvoiceAmount * 0.1; // 10% discount for annual
      
      recommendations.push({
        id: `billing_freq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: '', // Would be set from context
        clientId: profile.clientId,
        clientName: profile.clientName,
        recommendationType: 'billing_frequency',
        title: 'Switch to annual billing',
        description: `Switch ${profile.clientName} to annual billing for better cash flow and 10% discount`,
        currentValue: profile.averageInvoiceAmount * 12,
        recommendedValue: profile.averageInvoiceAmount * 12 * 0.9,
        potentialImpact: annualSavings,
        confidence: 0.8,
        reasoning: [
          `Client has ${profile.paymentReliability.toFixed(1)}% payment reliability`,
          `Annual billing improves cash flow predictability`,
          `10% discount incentive for client`
        ],
        actionItems: [
          'Contact client to discuss annual billing option',
          'Prepare annual billing proposal',
          'Update billing schedule in system',
          'Set up automated annual invoicing'
        ],
        priority: annualSavings > 1000 ? 'high' : 'medium',
        estimatedImplementationTime: '2-3 weeks',
        createdAt: new Date()
      });
    }
    
    // Recommend monthly billing for irregular payers
    if (profile.paymentPattern === 'irregular' && profile.currentBillingFrequency !== 'monthly') {
      recommendations.push({
        id: `billing_freq_monthly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: '', // Would be set from context
        clientId: profile.clientId,
        clientName: profile.clientName,
        recommendationType: 'billing_frequency',
        title: 'Switch to monthly billing',
        description: `Switch ${profile.clientName} to monthly billing to reduce payment risk`,
        currentValue: profile.averageInvoiceAmount,
        recommendedValue: profile.averageInvoiceAmount,
        potentialImpact: profile.averageInvoiceAmount * 0.05, // Reduced risk
        confidence: 0.7,
        reasoning: [
          `Client has irregular payment pattern`,
          `Monthly billing reduces payment risk`,
          `Smaller amounts are easier to collect`
        ],
        actionItems: [
          'Contact client to discuss monthly billing',
          'Update billing frequency in system',
          'Set up automated monthly invoicing',
          'Monitor payment patterns closely'
        ],
        priority: 'medium',
        estimatedImplementationTime: '1-2 weeks',
        createdAt: new Date()
      });
    }
    
    return recommendations;
  }

  /**
   * Analyze billing date optimization
   */
  private async analyzeBillingDates(profile: ClientBillingProfile): Promise<BillingOptimizationRecommendation[]> {
    const recommendations: BillingOptimizationRecommendation[] = [];
    
    // Optimize billing dates for cash flow
    const optimalBillingDate = this.calculateOptimalBillingDate(profile);
    
    if (optimalBillingDate !== 1) { // If not already on 1st
      recommendations.push({
        id: `billing_date_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: '', // Would be set from context
        clientId: profile.clientId,
        clientName: profile.clientName,
        recommendationType: 'billing_date',
        title: 'Optimize billing date',
        description: `Move billing date to ${optimalBillingDate}st for better cash flow`,
        currentValue: 0,
        recommendedValue: optimalBillingDate,
        potentialImpact: profile.averageInvoiceAmount * 0.02, // 2% improvement
        confidence: 0.6,
        reasoning: [
          `Billing on ${optimalBillingDate}st improves cash flow timing`,
          `Aligns with client payment patterns`,
          `Reduces days to payment`
        ],
        actionItems: [
          'Update billing date in system',
          'Notify client of billing date change',
          'Monitor payment timing improvements',
          'Adjust cash flow projections'
        ],
        priority: 'low',
        estimatedImplementationTime: '1 week',
        createdAt: new Date()
      });
    }
    
    return recommendations;
  }

  /**
   * Analyze price increase opportunities
   */
  private async analyzePriceIncreaseOpportunities(profile: ClientBillingProfile): Promise<BillingOptimizationRecommendation[]> {
    const recommendations: BillingOptimizationRecommendation[] = [];
    
    // Recommend price increase for high-value, low-risk clients
    if (profile.lifetimeValue > 10000 && profile.churnRisk < 30) {
      const priceIncrease = profile.averageInvoiceAmount * 0.1; // 10% increase
      
      recommendations.push({
        id: `price_increase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: '', // Would be set from context
        clientId: profile.clientId,
        clientName: profile.clientName,
        recommendationType: 'price_increase',
        title: 'Consider price increase',
        description: `Increase pricing for ${profile.clientName} by 10%`,
        currentValue: profile.averageInvoiceAmount,
        recommendedValue: profile.averageInvoiceAmount * 1.1,
        potentialImpact: priceIncrease * 12, // Annual impact
        confidence: 0.7,
        reasoning: [
          `Client has high lifetime value ($${profile.lifetimeValue.toLocaleString()})`,
          `Low churn risk (${profile.churnRisk.toFixed(1)}%)`,
          `Strong payment reliability (${profile.paymentReliability.toFixed(1)}%)`
        ],
        actionItems: [
          'Research market rates for similar services',
          'Prepare value proposition for price increase',
          'Schedule client meeting to discuss pricing',
          'Implement gradual price increase if approved'
        ],
        priority: priceIncrease > 500 ? 'high' : 'medium',
        estimatedImplementationTime: '4-6 weeks',
        createdAt: new Date()
      });
    }
    
    return recommendations;
  }

  /**
   * Analyze churn risk mitigation
   */
  private async analyzeChurnRiskMitigation(profile: ClientBillingProfile): Promise<BillingOptimizationRecommendation[]> {
    const recommendations: BillingOptimizationRecommendation[] = [];
    
    // High churn risk clients need attention
    if (profile.churnRisk > 70) {
      recommendations.push({
        id: `churn_mitigation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: '', // Would be set from context
        clientId: profile.clientId,
        clientName: profile.clientName,
        recommendationType: 'churn_mitigation',
        title: 'High churn risk - immediate action needed',
        description: `${profile.clientName} has high churn risk (${profile.churnRisk.toFixed(1)}%)`,
        currentValue: profile.churnRisk,
        recommendedValue: 30, // Target churn risk
        potentialImpact: profile.lifetimeValue * 0.5, // 50% of LTV at risk
        confidence: 0.9,
        reasoning: [
          `Churn risk is ${profile.churnRisk.toFixed(1)}% (critical level)`,
          `Client value: $${profile.lifetimeValue.toLocaleString()}`,
          `Payment pattern: ${profile.paymentPattern}`
        ],
        actionItems: [
          'Schedule immediate client check-in call',
          'Review service quality and satisfaction',
          'Offer retention incentives if needed',
          'Develop client success plan',
          'Monitor closely for next 30 days'
        ],
        priority: 'critical',
        estimatedImplementationTime: '1 week',
        createdAt: new Date()
      });
    }
    
    return recommendations;
  }

  /**
   * Calculate payment reliability
   */
  private calculatePaymentReliability(invoices: any[]): number {
    if (invoices.length === 0) return 0;
    
    const paidInvoices = invoices.filter(i => i.status === 'PAID');
    return (paidInvoices.length / invoices.length) * 100;
  }

  /**
   * Calculate average days to pay
   */
  private calculateAverageDaysToPay(invoices: any[]): number {
    const paidInvoices = invoices.filter(i => i.status === 'PAID' && i.paidAt);
    
    if (paidInvoices.length === 0) return 0;
    
    const totalDays = paidInvoices.reduce((sum, invoice) => {
      const days = (invoice.paidAt.getTime() - invoice.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return sum + days;
    }, 0);
    
    return totalDays / paidInvoices.length;
  }

  /**
   * Calculate churn risk
   */
  private calculateChurnRisk(client: any, invoices: any[]): number {
    let riskScore = 0;
    
    // Payment reliability factor
    const paymentReliability = this.calculatePaymentReliability(invoices);
    if (paymentReliability < 70) riskScore += 40;
    else if (paymentReliability < 90) riskScore += 20;
    
    // Recent activity factor
    const daysSinceLastPayment = invoices.length > 0 
      ? (Date.now() - Math.max(...invoices.map(i => i.paidAt?.getTime() || 0))) / (1000 * 60 * 60 * 24)
      : 365;
    
    if (daysSinceLastPayment > 90) riskScore += 30;
    else if (daysSinceLastPayment > 60) riskScore += 15;
    
    // Payment pattern factor
    const paymentPattern = this.determinePaymentPattern(invoices);
    if (paymentPattern === 'declining') riskScore += 25;
    else if (paymentPattern === 'irregular') riskScore += 15;
    
    return Math.min(riskScore, 100);
  }

  /**
   * Determine payment pattern
   */
  private determinePaymentPattern(invoices: any[]): 'consistent' | 'irregular' | 'declining' {
    if (invoices.length < 3) return 'irregular';
    
    const sortedInvoices = [...invoices].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const amounts = sortedInvoices.map(i => i.total);
    
    // Check for declining trend
    const firstHalf = amounts.slice(0, Math.floor(amounts.length / 2));
    const secondHalf = amounts.slice(Math.floor(amounts.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, a) => sum + a, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, a) => sum + a, 0) / secondHalf.length;
    
    if (secondHalfAvg < firstHalfAvg * 0.8) return 'declining';
    
    // Check for irregularity
    const variance = amounts.reduce((sum, amount) => {
      const avg = amounts.reduce((s, a) => s + a, 0) / amounts.length;
      return sum + Math.pow(amount - avg, 2);
    }, 0) / amounts.length;
    
    const avgAmount = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
    const coefficientOfVariation = Math.sqrt(variance) / avgAmount;
    
    if (coefficientOfVariation > 0.3) return 'irregular';
    
    return 'consistent';
  }

  /**
   * Determine billing frequency
   */
  private determineBillingFrequency(invoices: any[]): 'monthly' | 'quarterly' | 'annually' {
    if (invoices.length < 2) return 'monthly';
    
    const sortedInvoices = [...invoices].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const intervals = [];
    
    for (let i = 1; i < sortedInvoices.length; i++) {
      const interval = (sortedInvoices[i].createdAt.getTime() - sortedInvoices[i-1].createdAt.getTime()) / (1000 * 60 * 60 * 24);
      intervals.push(interval);
    }
    
    const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    
    if (averageInterval <= 35) return 'monthly';
    if (averageInterval <= 100) return 'quarterly';
    return 'annually';
  }

  /**
   * Calculate optimal billing date
   */
  private calculateOptimalBillingDate(profile: ClientBillingProfile): number {
    // Simplified logic - in real implementation, this would analyze payment patterns
    if (profile.paymentPattern === 'consistent') return 1; // 1st of month
    if (profile.paymentPattern === 'irregular') return 15; // Mid-month
    return 1; // Default to 1st
  }

  /**
   * Get billing optimization insights
   */
  async getBillingOptimizationInsights(userId: string): Promise<BillingOptimizationInsights> {
    try {
      const clientProfiles = await this.analyzeClientBillingProfiles(userId);
      
      const totalClients = clientProfiles.length;
      const monthlyRecurringRevenue = clientProfiles
        .filter(p => p.currentBillingFrequency === 'monthly')
        .reduce((sum, p) => sum + p.averageInvoiceAmount, 0);
      
      const annualRecurringRevenue = clientProfiles
        .filter(p => p.currentBillingFrequency === 'annually')
        .reduce((sum, p) => sum + p.averageInvoiceAmount, 0) + monthlyRecurringRevenue * 12;
      
      const averageDaysToPay = clientProfiles.length > 0 
        ? clientProfiles.reduce((sum, p) => sum + p.daysToPay, 0) / clientProfiles.length 
        : 0;
      
      const churnRiskClients = clientProfiles.filter(p => p.churnRisk > 70).length;
      
      const recommendations = await this.generateBillingOptimizationRecommendations(userId);
      const optimizationOpportunities = recommendations.length;
      
      const potentialRevenueIncrease = recommendations.reduce((sum, r) => sum + r.potentialImpact, 0);
      
      return {
        totalClients,
        monthlyRecurringRevenue,
        annualRecurringRevenue,
        averageDaysToPay,
        churnRiskClients,
        optimizationOpportunities,
        potentialRevenueIncrease
      };

    } catch (error) {
      console.error('Error getting billing optimization insights:', error);
      return {
        totalClients: 0,
        monthlyRecurringRevenue: 0,
        annualRecurringRevenue: 0,
        averageDaysToPay: 0,
        churnRiskClients: 0,
        optimizationOpportunities: 0,
        potentialRevenueIncrease: 0
      };
    }
  }
}

export default BillingOptimizationService;







