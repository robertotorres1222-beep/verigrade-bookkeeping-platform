import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface ContractTerms {
  contractValue: number;
  term: number;
  paymentTerms: string;
  obligations: string[];
  renewalDate: Date;
  autoRenewal: boolean;
  priceEscalation: number;
  terminationClauses: string[];
}

export interface ContractModification {
  id: string;
  contractId: string;
  modificationType: 'price_change' | 'term_extension' | 'scope_change' | 'termination';
  description: string;
  effectiveDate: Date;
  impact: {
    revenue: number;
    cost: number;
    risk: number;
  };
  approvalRequired: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

export interface UpsellOpportunity {
  id: string;
  contractId: string;
  opportunityType: 'upgrade_tier' | 'add_users' | 'annual_billing' | 'premium_support' | 'additional_features';
  description: string;
  potentialRevenue: number;
  probability: number;
  nextSteps: string[];
  priority: 'low' | 'medium' | 'high';
}

export class ContractAnalysisService {
  /**
   * Analyze contract terms and generate insights
   */
  async analyzeContractTerms(contractId: string): Promise<{
    terms: ContractTerms;
    insights: string[];
    recommendations: string[];
    riskFactors: string[];
  }> {
    try {
      logger.info(`Analyzing contract terms for contract ${contractId}`);

      const contract = await this.getContract(contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }

      const terms = this.extractTerms(contract);
      const insights = this.generateInsights(terms);
      const recommendations = this.generateRecommendations(terms);
      const riskFactors = this.identifyRiskFactors(terms);

      return {
        terms,
        insights,
        recommendations,
        riskFactors
      };
    } catch (error) {
      logger.error(`Error analyzing contract terms: ${error.message}`);
      throw new Error(`Failed to analyze contract terms: ${error.message}`);
    }
  }

  /**
   * Generate revenue recognition schedule
   */
  async generateRevenueRecognitionSchedule(contractId: string): Promise<Array<{
    date: Date;
    amount: number;
    description: string;
    status: 'pending' | 'recognized' | 'deferred';
  }>> {
    try {
      const contract = await this.getContract(contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }

      const terms = this.extractTerms(contract);
      const schedule = this.calculateRevenueSchedule(terms);
      
      // Store the schedule
      await this.storeRevenueSchedule(contractId, schedule);

      return schedule;
    } catch (error) {
      logger.error(`Error generating revenue recognition schedule: ${error.message}`);
      throw new Error(`Failed to generate revenue recognition schedule: ${error.message}`);
    }
  }

  /**
   * Track contract modifications
   */
  async trackContractModification(
    contractId: string,
    modification: Omit<ContractModification, 'id' | 'contractId'>
  ): Promise<ContractModification> {
    try {
      const modificationRecord = await prisma.contractModification.create({
        data: {
          contractId,
          modificationType: modification.modificationType,
          description: modification.description,
          effectiveDate: modification.effectiveDate,
          impact: JSON.stringify(modification.impact),
          approvalRequired: modification.approvalRequired,
          status: modification.status
        }
      });

      return {
        id: modificationRecord.id,
        contractId: modificationRecord.contractId,
        modificationType: modificationRecord.modificationType as any,
        description: modificationRecord.description,
        effectiveDate: modificationRecord.effectiveDate,
        impact: JSON.parse(modificationRecord.impact),
        approvalRequired: modificationRecord.approvalRequired,
        status: modificationRecord.status as any
      };
    } catch (error) {
      logger.error(`Error tracking contract modification: ${error.message}`);
      throw new Error(`Failed to track contract modification: ${error.message}`);
    }
  }

  /**
   * Identify upsell opportunities
   */
  async identifyUpsellOpportunities(contractId: string): Promise<UpsellOpportunity[]> {
    try {
      const contract = await this.getContract(contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }

      const terms = this.extractTerms(contract);
      const opportunities = this.analyzeUpsellPotential(terms);

      // Store opportunities
      for (const opportunity of opportunities) {
        await prisma.upsellOpportunity.create({
          data: {
            contractId,
            opportunityType: opportunity.opportunityType,
            description: opportunity.description,
            potentialRevenue: opportunity.potentialRevenue,
            probability: opportunity.probability,
            nextSteps: JSON.stringify(opportunity.nextSteps),
            priority: opportunity.priority
          }
        });
      }

      return opportunities;
    } catch (error) {
      logger.error(`Error identifying upsell opportunities: ${error.message}`);
      throw new Error(`Failed to identify upsell opportunities: ${error.message}`);
    }
  }

  /**
   * Get contract renewal calendar
   */
  async getRenewalCalendar(companyId: string, months: number = 12): Promise<Array<{
    contractId: string;
    renewalDate: Date;
    contractValue: number;
    autoRenewal: boolean;
    riskLevel: 'low' | 'medium' | 'high';
    actionRequired: string[];
  }>> {
    try {
      const contracts = await prisma.contractAnalysis.findMany({
        where: { companyId }
      });

      const calendar = contracts.map(contract => {
        const extractedData = JSON.parse(contract.extractedData);
        const riskAssessment = JSON.parse(contract.riskAssessment);
        
        return {
          contractId: contract.contractId,
          renewalDate: new Date(extractedData.renewalDate),
          contractValue: extractedData.contractValue,
          autoRenewal: extractedData.autoRenewal,
          riskLevel: riskAssessment.level,
          actionRequired: this.getRequiredActions(extractedData, riskAssessment)
        };
      });

      // Filter by date range
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + months);

      return calendar.filter(item => item.renewalDate <= endDate);
    } catch (error) {
      logger.error(`Error getting renewal calendar: ${error.message}`);
      throw new Error(`Failed to get renewal calendar: ${error.message}`);
    }
  }

  /**
   * Get contract risk dashboard
   */
  async getContractRiskDashboard(companyId: string): Promise<{
    totalContracts: number;
    highRiskContracts: number;
    upcomingRenewals: number;
    totalContractValue: number;
    riskDistribution: Array<{
      level: string;
      count: number;
      percentage: number;
    }>;
    topRiskFactors: Array<{
      factor: string;
      count: number;
      contracts: string[];
    }>;
  }> {
    try {
      const contracts = await prisma.contractAnalysis.findMany({
        where: { companyId }
      });

      const totalContracts = contracts.length;
      const highRiskContracts = contracts.filter(c => {
        const risk = JSON.parse(c.riskAssessment);
        return risk.level === 'high';
      }).length;

      const upcomingRenewals = contracts.filter(c => {
        const extractedData = JSON.parse(c.extractedData);
        const renewalDate = new Date(extractedData.renewalDate);
        const ninetyDaysFromNow = new Date();
        ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
        return renewalDate <= ninetyDaysFromNow;
      }).length;

      const totalContractValue = contracts.reduce((sum, c) => {
        const extractedData = JSON.parse(c.extractedData);
        return sum + extractedData.contractValue;
      }, 0);

      const riskDistribution = this.calculateRiskDistribution(contracts);
      const topRiskFactors = this.identifyTopRiskFactors(contracts);

      return {
        totalContracts,
        highRiskContracts,
        upcomingRenewals,
        totalContractValue,
        riskDistribution,
        topRiskFactors
      };
    } catch (error) {
      logger.error(`Error getting contract risk dashboard: ${error.message}`);
      throw new Error(`Failed to get contract risk dashboard: ${error.message}`);
    }
  }

  // Helper methods
  private async getContract(contractId: string) {
    return await prisma.contractAnalysis.findUnique({
      where: { contractId }
    });
  }

  private extractTerms(contract: any): ContractTerms {
    const extractedData = JSON.parse(contract.extractedData);
    
    return {
      contractValue: extractedData.contractValue,
      term: extractedData.term,
      paymentTerms: extractedData.paymentTerms,
      obligations: extractedData.obligations,
      renewalDate: new Date(extractedData.renewalDate),
      autoRenewal: extractedData.autoRenewal,
      priceEscalation: extractedData.priceEscalation,
      terminationClauses: extractedData.terminationClauses
    };
  }

  private generateInsights(terms: ContractTerms): string[] {
    const insights: string[] = [];

    if (terms.autoRenewal) {
      insights.push('Contract has auto-renewal clause - monitor renewal date closely');
    }

    if (terms.priceEscalation > 5) {
      insights.push(`High price escalation (${terms.priceEscalation}%) may impact profitability`);
    }

    if (terms.term > 36) {
      insights.push('Long-term contract provides stability but limits flexibility');
    }

    if (terms.obligations.length > 5) {
      insights.push('Complex obligations may require dedicated resources');
    }

    return insights;
  }

  private generateRecommendations(terms: ContractTerms): string[] {
    const recommendations: string[] = [];

    if (terms.autoRenewal) {
      recommendations.push('Set up 90-day renewal alerts');
    }

    if (terms.priceEscalation > 3) {
      recommendations.push('Negotiate price caps for future renewals');
    }

    if (terms.terminationClauses.length > 3) {
      recommendations.push('Simplify termination clauses in future contracts');
    }

    recommendations.push('Review contract performance quarterly');
    recommendations.push('Document all contract modifications');

    return recommendations;
  }

  private identifyRiskFactors(terms: ContractTerms): string[] {
    const riskFactors: string[] = [];

    if (terms.autoRenewal) {
      riskFactors.push('Auto-renewal risk');
    }

    if (terms.priceEscalation > 5) {
      riskFactors.push('Price escalation risk');
    }

    if (terms.terminationClauses.some(clause => clause.includes('penalty'))) {
      riskFactors.push('Termination penalty risk');
    }

    if (terms.obligations.length > 5) {
      riskFactors.push('Complex obligations risk');
    }

    return riskFactors;
  }

  private calculateRevenueSchedule(terms: ContractTerms): Array<{
    date: Date;
    amount: number;
    description: string;
    status: 'pending' | 'recognized' | 'deferred';
  }> {
    const schedule = [];
    const monthlyAmount = terms.contractValue / terms.term;
    const startDate = new Date();

    for (let i = 0; i < terms.term; i++) {
      const recognitionDate = new Date(startDate);
      recognitionDate.setMonth(recognitionDate.getMonth() + i);

      schedule.push({
        date: recognitionDate,
        amount: monthlyAmount,
        description: `Monthly revenue recognition - Month ${i + 1}`,
        status: recognitionDate <= new Date() ? 'recognized' : 'pending'
      });
    }

    return schedule;
  }

  private async storeRevenueSchedule(contractId: string, schedule: any[]): Promise<void> {
    await prisma.revenueRecognitionSchedule.create({
      data: {
        contractId,
        schedule: JSON.stringify(schedule),
        createdAt: new Date()
      }
    });
  }

  private analyzeUpsellPotential(terms: ContractTerms): UpsellOpportunity[] {
    const opportunities: UpsellOpportunity[] = [];

    // Analyze based on contract terms
    if (terms.term < 24) {
      opportunities.push({
        id: `upsell-${Date.now()}-1`,
        contractId: '',
        opportunityType: 'annual_billing',
        description: 'Convert to annual billing for better rates',
        potentialRevenue: terms.contractValue * 0.1,
        probability: 0.7,
        nextSteps: ['Present annual billing benefits', 'Offer discount incentive'],
        priority: 'medium'
      });
    }

    if (terms.contractValue < 100000) {
      opportunities.push({
        id: `upsell-${Date.now()}-2`,
        contractId: '',
        opportunityType: 'upgrade_tier',
        description: 'Upgrade to premium tier for additional features',
        potentialRevenue: terms.contractValue * 0.3,
        probability: 0.5,
        nextSteps: ['Demo premium features', 'Show ROI calculation'],
        priority: 'high'
      });
    }

    return opportunities;
  }

  private getRequiredActions(extractedData: any, riskAssessment: any): string[] {
    const actions: string[] = [];

    if (riskAssessment.level === 'high') {
      actions.push('Review contract terms immediately');
    }

    if (extractedData.autoRenewal) {
      actions.push('Set renewal reminder');
    }

    if (extractedData.priceEscalation > 5) {
      actions.push('Negotiate price caps');
    }

    return actions;
  }

  private calculateRiskDistribution(contracts: any[]): Array<{
    level: string;
    count: number;
    percentage: number;
  }> {
    const distribution = { low: 0, medium: 0, high: 0 };

    contracts.forEach(contract => {
      const risk = JSON.parse(contract.riskAssessment);
      distribution[risk.level]++;
    });

    const total = contracts.length;

    return Object.entries(distribution).map(([level, count]) => ({
      level,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }));
  }

  private identifyTopRiskFactors(contracts: any[]): Array<{
    factor: string;
    count: number;
    contracts: string[];
  }> {
    const factorCounts: { [key: string]: { count: number; contracts: string[] } } = {};

    contracts.forEach(contract => {
      const risk = JSON.parse(contract.riskAssessment);
      risk.factors.forEach((factor: string) => {
        if (!factorCounts[factor]) {
          factorCounts[factor] = { count: 0, contracts: [] };
        }
        factorCounts[factor].count++;
        factorCounts[factor].contracts.push(contract.contractId);
      });
    });

    return Object.entries(factorCounts)
      .map(([factor, data]) => ({
        factor,
        count: data.count,
        contracts: data.contracts
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
}









