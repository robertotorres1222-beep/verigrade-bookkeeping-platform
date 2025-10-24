import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface VendorOptimization {
  vendorId: string;
  vendorName: string;
  currentSpend: number;
  potentialSavings: number;
  savingsPercentage: number;
  optimizationType: 'reserved_instances' | 'duplicate_subscriptions' | 'unused_licenses' | 'annual_prepay' | 'negotiation' | 'consolidation';
  recommendations: string[];
  priority: 'high' | 'medium' | 'low';
  implementationEffort: 'low' | 'medium' | 'high';
  estimatedROI: number;
  nextRenewalDate?: Date;
  marketRate?: number;
}

export interface SavingsOpportunity {
  id: string;
  vendorId: string;
  opportunityType: string;
  currentCost: number;
  potentialSavings: number;
  description: string;
  implementationSteps: string[];
  timeline: string;
  riskLevel: 'low' | 'medium' | 'high';
  dependencies: string[];
}

export interface VendorAnalysis {
  totalSpend: number;
  vendorCount: number;
  topVendors: Array<{
    vendorId: string;
    vendorName: string;
    spend: number;
    percentage: number;
  }>;
  optimizationOpportunities: VendorOptimization[];
  totalPotentialSavings: number;
  savingsByCategory: Array<{
    category: string;
    savings: number;
    percentage: number;
  }>;
  peerComparison: {
    industryAverage: number;
    topQuartile: number;
    yourSpend: number;
    percentile: number;
  };
}

export class VendorOptimizationService {
  /**
   * Get vendor optimization analysis
   */
  async getVendorAnalysis(companyId: string): Promise<VendorAnalysis> {
    try {
      logger.info(`Getting vendor analysis for company ${companyId}`);

      const [
        totalSpend,
        vendorCount,
        topVendors,
        optimizationOpportunities,
        peerComparison
      ] = await Promise.all([
        this.getTotalSpend(companyId),
        this.getVendorCount(companyId),
        this.getTopVendors(companyId),
        this.getOptimizationOpportunities(companyId),
        this.getPeerComparison(companyId)
      ]);

      const totalPotentialSavings = optimizationOpportunities.reduce(
        (sum, opp) => sum + opp.potentialSavings, 0
      );

      const savingsByCategory = this.calculateSavingsByCategory(optimizationOpportunities);

      return {
        totalSpend,
        vendorCount,
        topVendors,
        optimizationOpportunities,
        totalPotentialSavings,
        savingsByCategory,
        peerComparison
      };
    } catch (error) {
      logger.error(`Error getting vendor analysis: ${error.message}`);
      throw new Error(`Failed to get vendor analysis: ${error.message}`);
    }
  }

  /**
   * Get optimization opportunities for a specific vendor
   */
  async getVendorOptimization(vendorId: string): Promise<VendorOptimization[]> {
    try {
      logger.info(`Getting optimization opportunities for vendor ${vendorId}`);

      const vendor = await this.getVendor(vendorId);
      const opportunities: VendorOptimization[] = [];

      // Check for Reserved Instance opportunities (AWS, Azure, GCP)
      if (this.isCloudProvider(vendor.name)) {
        const riOpportunity = await this.analyzeReservedInstances(vendorId);
        if (riOpportunity) opportunities.push(riOpportunity);
      }

      // Check for duplicate subscriptions
      const duplicateOpportunity = await this.analyzeDuplicateSubscriptions(vendorId);
      if (duplicateOpportunity) opportunities.push(duplicateOpportunity);

      // Check for unused licenses
      const unusedLicenseOpportunity = await this.analyzeUnusedLicenses(vendorId);
      if (unusedLicenseOpportunity) opportunities.push(unusedLicenseOpportunity);

      // Check for annual prepay discounts
      const annualPrepayOpportunity = await this.analyzeAnnualPrepay(vendorId);
      if (annualPrepayOpportunity) opportunities.push(annualPrepayOpportunity);

      // Check for negotiation opportunities
      const negotiationOpportunity = await this.analyzeNegotiationOpportunities(vendorId);
      if (negotiationOpportunity) opportunities.push(negotiationOpportunity);

      return opportunities;
    } catch (error) {
      logger.error(`Error getting vendor optimization: ${error.message}`);
      throw new Error(`Failed to get vendor optimization: ${error.message}`);
    }
  }

  /**
   * Analyze Reserved Instance opportunities
   */
  private async analyzeReservedInstances(vendorId: string): Promise<VendorOptimization | null> {
    const vendor = await this.getVendor(vendorId);
    const currentSpend = await this.getVendorSpend(vendorId);
    
    if (currentSpend < 1000) return null; // Minimum threshold for RI analysis

    const riSavings = this.calculateRISavings(currentSpend);
    
    if (riSavings.savingsPercentage < 10) return null; // Minimum 10% savings

    return {
      vendorId,
      vendorName: vendor.name,
      currentSpend,
      potentialSavings: riSavings.savingsAmount,
      savingsPercentage: riSavings.savingsPercentage,
      optimizationType: 'reserved_instances',
      recommendations: [
        'Purchase Reserved Instances for predictable workloads',
        'Use 1-year term for 30% savings',
        'Use 3-year term for 50% savings',
        'Consider Convertible RIs for flexibility'
      ],
      priority: riSavings.savingsPercentage > 30 ? 'high' : 'medium',
      implementationEffort: 'medium',
      estimatedROI: riSavings.savingsAmount / currentSpend
    };
  }

  /**
   * Analyze duplicate subscriptions
   */
  private async analyzeDuplicateSubscriptions(vendorId: string): Promise<VendorOptimization | null> {
    const duplicates = await this.findDuplicateSubscriptions(vendorId);
    
    if (duplicates.length === 0) return null;

    const totalWaste = duplicates.reduce((sum, dup) => sum + dup.wasteAmount, 0);
    const vendor = await this.getVendor(vendorId);

    return {
      vendorId,
      vendorName: vendor.name,
      currentSpend: await this.getVendorSpend(vendorId),
      potentialSavings: totalWaste,
      savingsPercentage: (totalWaste / await this.getVendorSpend(vendorId)) * 100,
      optimizationType: 'duplicate_subscriptions',
      recommendations: [
        'Consolidate duplicate subscriptions',
        'Review user access and remove inactive accounts',
        'Implement subscription management process',
        'Set up usage monitoring'
      ],
      priority: totalWaste > 500 ? 'high' : 'medium',
      implementationEffort: 'low',
      estimatedROI: totalWaste / await this.getVendorSpend(vendorId)
    };
  }

  /**
   * Analyze unused licenses
   */
  private async analyzeUnusedLicenses(vendorId: string): Promise<VendorOptimization | null> {
    const unusedLicenses = await this.findUnusedLicenses(vendorId);
    
    if (unusedLicenses.length === 0) return null;

    const totalWaste = unusedLicenses.reduce((sum, license) => sum + license.monthlyCost, 0);
    const vendor = await this.getVendor(vendorId);

    return {
      vendorId,
      vendorName: vendor.name,
      currentSpend: await this.getVendorSpend(vendorId),
      potentialSavings: totalWaste * 12, // Annual savings
      savingsPercentage: (totalWaste * 12 / await this.getVendorSpend(vendorId)) * 100,
      optimizationType: 'unused_licenses',
      recommendations: [
        'Remove unused licenses',
        'Implement license usage tracking',
        'Set up automated license management',
        'Review license allocation quarterly'
      ],
      priority: totalWaste > 200 ? 'high' : 'medium',
      implementationEffort: 'low',
      estimatedROI: (totalWaste * 12) / await this.getVendorSpend(vendorId)
    };
  }

  /**
   * Analyze annual prepay opportunities
   */
  private async analyzeAnnualPrepay(vendorId: string): Promise<VendorOptimization | null> {
    const vendor = await this.getVendor(vendorId);
    const currentSpend = await this.getVendorSpend(vendorId);
    
    // Check if vendor offers annual prepay discounts
    const annualDiscount = this.getAnnualDiscountRate(vendor.name);
    if (annualDiscount === 0) return null;

    const annualSavings = currentSpend * annualDiscount;

    return {
      vendorId,
      vendorName: vendor.name,
      currentSpend,
      potentialSavings: annualSavings,
      savingsPercentage: annualDiscount * 100,
      optimizationType: 'annual_prepay',
      recommendations: [
        'Switch to annual prepay billing',
        'Negotiate better annual rates',
        'Consider multi-year contracts for additional savings'
      ],
      priority: annualSavings > 1000 ? 'high' : 'medium',
      implementationEffort: 'low',
      estimatedROI: annualSavings / currentSpend
    };
  }

  /**
   * Analyze negotiation opportunities
   */
  private async analyzeNegotiationOpportunities(vendorId: string): Promise<VendorOptimization | null> {
    const vendor = await this.getVendor(vendorId);
    const currentSpend = await this.getVendorSpend(vendorId);
    const marketRate = await this.getMarketRate(vendor.name);
    
    if (!marketRate || currentSpend < 5000) return null;

    const currentRate = await this.getCurrentRate(vendorId);
    const potentialSavings = (currentRate - marketRate) * currentSpend;

    if (potentialSavings < 500) return null;

    return {
      vendorId,
      vendorName: vendor.name,
      currentSpend,
      potentialSavings,
      savingsPercentage: ((currentRate - marketRate) / currentRate) * 100,
      optimizationType: 'negotiation',
      recommendations: [
        'Negotiate better rates based on market data',
        'Leverage volume for better pricing',
        'Consider switching to competitive vendors',
        'Request price matching from current vendor'
      ],
      priority: potentialSavings > 2000 ? 'high' : 'medium',
      implementationEffort: 'high',
      estimatedROI: potentialSavings / currentSpend,
      marketRate,
      nextRenewalDate: await this.getNextRenewalDate(vendorId)
    };
  }

  // Helper methods
  private async getTotalSpend(companyId: string): Promise<number> {
    const result = await prisma.vendorSpend.aggregate({
      where: { companyId },
      _sum: { amount: true }
    });
    return result._sum.amount || 0;
  }

  private async getVendorCount(companyId: string): Promise<number> {
    return await prisma.vendor.count({
      where: { companyId }
    });
  }

  private async getTopVendors(companyId: string, limit: number = 10) {
    const vendors = await prisma.vendor.findMany({
      where: { companyId },
      include: {
        spend: {
          select: { amount: true }
        }
      },
      take: limit
    });

    const totalSpend = await this.getTotalSpend(companyId);

    return vendors.map(vendor => ({
      vendorId: vendor.id,
      vendorName: vendor.name,
      spend: vendor.spend.reduce((sum, s) => sum + s.amount, 0),
      percentage: (vendor.spend.reduce((sum, s) => sum + s.amount, 0) / totalSpend) * 100
    })).sort((a, b) => b.spend - a.spend);
  }

  private async getOptimizationOpportunities(companyId: string): Promise<VendorOptimization[]> {
    const vendors = await prisma.vendor.findMany({
      where: { companyId }
    });

    const opportunities: VendorOptimization[] = [];

    for (const vendor of vendors) {
      const vendorOpportunities = await this.getVendorOptimization(vendor.id);
      opportunities.push(...vendorOpportunities);
    }

    return opportunities.sort((a, b) => b.potentialSavings - a.potentialSavings);
  }

  private calculateSavingsByCategory(opportunities: VendorOptimization[]) {
    const categories = new Map<string, number>();

    for (const opp of opportunities) {
      const category = opp.optimizationType;
      const current = categories.get(category) || 0;
      categories.set(category, current + opp.potentialSavings);
    }

    const total = Array.from(categories.values()).reduce((sum, val) => sum + val, 0);

    return Array.from(categories.entries()).map(([category, savings]) => ({
      category,
      savings,
      percentage: (savings / total) * 100
    }));
  }

  private async getPeerComparison(companyId: string) {
    // Mock implementation - in reality, this would use industry benchmarks
    return {
      industryAverage: 150000,
      topQuartile: 120000,
      yourSpend: await this.getTotalSpend(companyId),
      percentile: 75
    };
  }

  private async getVendor(vendorId: string) {
    return await prisma.vendor.findUnique({
      where: { id: vendorId }
    });
  }

  private async getVendorSpend(vendorId: string): Promise<number> {
    const result = await prisma.vendorSpend.aggregate({
      where: { vendorId },
      _sum: { amount: true }
    });
    return result._sum.amount || 0;
  }

  private isCloudProvider(vendorName: string): boolean {
    const cloudProviders = ['AWS', 'Amazon Web Services', 'Azure', 'Microsoft Azure', 'GCP', 'Google Cloud'];
    return cloudProviders.some(provider => vendorName.toLowerCase().includes(provider.toLowerCase()));
  }

  private calculateRISavings(currentSpend: number) {
    // Simplified RI savings calculation
    const oneYearSavings = currentSpend * 0.3; // 30% savings for 1-year RI
    const threeYearSavings = currentSpend * 0.5; // 50% savings for 3-year RI
    
    return {
      savingsAmount: oneYearSavings, // Use 1-year as default
      savingsPercentage: 30
    };
  }

  private async findDuplicateSubscriptions(vendorId: string) {
    // Implementation to find duplicate subscriptions
    return [];
  }

  private async findUnusedLicenses(vendorId: string) {
    // Implementation to find unused licenses
    return [];
  }

  private getAnnualDiscountRate(vendorName: string): number {
    // Mock implementation - in reality, this would be based on vendor data
    const discountRates: { [key: string]: number } = {
      'Slack': 0.15,
      'Zoom': 0.20,
      'Microsoft': 0.10,
      'Adobe': 0.25
    };
    
    return discountRates[vendorName] || 0;
  }

  private async getMarketRate(vendorName: string): Promise<number | null> {
    // Mock implementation - in reality, this would query market data
    return 0.85; // 15% below current rate
  }

  private async getCurrentRate(vendorId: string): Promise<number> {
    // Mock implementation
    return 1.0;
  }

  private async getNextRenewalDate(vendorId: string): Promise<Date | null> {
    // Mock implementation
    return new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days from now
  }
}