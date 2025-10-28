import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

export interface ContractData {
  contractId: string;
  contractValue: number;
  term: number; // in months
  paymentTerms: string;
  obligations: string[];
  renewalDate: Date;
  autoRenewal: boolean;
  priceEscalation: number; // percentage
  terminationClauses: string[];
  riskScore: number;
  upsellOpportunities: string[];
}

export interface ContractAnalysis {
  contractId: string;
  extractedData: ContractData;
  confidence: number;
  revenueRecognitionSchedule: Array<{
    date: Date;
    amount: number;
    description: string;
  }>;
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    mitigation: string[];
  };
  renewalAlerts: Array<{
    date: Date;
    type: 'renewal' | 'termination' | 'price_change';
    message: string;
  }>;
}

export class ContractParsingService {
  /**
   * Parse contract PDF and extract key terms
   */
  async parseContractPDF(filePath: string, companyId: string): Promise<ContractAnalysis> {
    try {
      logger.info(`Parsing contract PDF: ${filePath}`);

      // In a real implementation, this would use GPT-4 Vision or similar OCR service
      const extractedText = await this.extractTextFromPDF(filePath);
      const contractData = await this.extractContractData(extractedText);
      
      const analysis: ContractAnalysis = {
        contractId: `contract-${Date.now()}`,
        extractedData: contractData,
        confidence: this.calculateConfidence(extractedText),
        revenueRecognitionSchedule: this.generateRevenueRecognitionSchedule(contractData),
        riskAssessment: this.assessContractRisk(contractData),
        renewalAlerts: this.generateRenewalAlerts(contractData)
      };

      // Store the analysis
      await this.storeContractAnalysis(companyId, analysis);

      return analysis;
    } catch (error) {
      logger.error(`Error parsing contract PDF: ${error.message}`);
      throw new Error(`Failed to parse contract PDF: ${error.message}`);
    }
  }

  /**
   * Extract text from PDF using OCR
   */
  private async extractTextFromPDF(filePath: string): Promise<string> {
    // Mock implementation - in reality, this would use a PDF parsing library
    // or send to GPT-4 Vision API
    return `
      CONTRACT AGREEMENT
      
      Contract Value: $50,000
      Term: 24 months
      Payment Terms: Net 30
      Renewal Date: December 31, 2024
      Auto-renewal: Yes
      Price Escalation: 3% annually
      
      Obligations:
      - Monthly reporting
      - Quarterly reviews
      - Annual compliance audit
      
      Termination Clauses:
      - 90-day notice required
      - Early termination fee: $5,000
      - Material breach provisions
    `;
  }

  /**
   * Extract structured data from contract text
   */
  private async extractContractData(text: string): Promise<ContractData> {
    // Mock implementation - in reality, this would use NLP/AI to extract structured data
    return {
      contractId: `contract-${Date.now()}`,
      contractValue: 50000,
      term: 24,
      paymentTerms: 'Net 30',
      obligations: [
        'Monthly reporting',
        'Quarterly reviews',
        'Annual compliance audit'
      ],
      renewalDate: new Date('2024-12-31'),
      autoRenewal: true,
      priceEscalation: 3,
      terminationClauses: [
        '90-day notice required',
        'Early termination fee: $5,000',
        'Material breach provisions'
      ],
      riskScore: this.calculateRiskScore(text),
      upsellOpportunities: this.identifyUpsellOpportunities(text)
    };
  }

  /**
   * Calculate confidence score for extraction
   */
  private calculateConfidence(text: string): number {
    // Mock implementation - in reality, this would analyze extraction quality
    const confidenceFactors = {
      hasContractValue: text.includes('Contract Value') ? 0.2 : 0,
      hasTerm: text.includes('Term') ? 0.2 : 0,
      hasPaymentTerms: text.includes('Payment Terms') ? 0.2 : 0,
      hasRenewalDate: text.includes('Renewal Date') ? 0.2 : 0,
      hasObligations: text.includes('Obligations') ? 0.2 : 0
    };

    return Object.values(confidenceFactors).reduce((sum, factor) => sum + factor, 0);
  }

  /**
   * Generate revenue recognition schedule
   */
  private generateRevenueRecognitionSchedule(contractData: ContractData): Array<{
    date: Date;
    amount: number;
    description: string;
  }> {
    const schedule = [];
    const monthlyAmount = contractData.contractValue / contractData.term;
    const startDate = new Date();

    for (let i = 0; i < contractData.term; i++) {
      const recognitionDate = new Date(startDate);
      recognitionDate.setMonth(recognitionDate.getMonth() + i);

      schedule.push({
        date: recognitionDate,
        amount: monthlyAmount,
        description: `Monthly revenue recognition - Month ${i + 1}`
      });
    }

    return schedule;
  }

  /**
   * Assess contract risk
   */
  private assessContractRisk(contractData: ContractData): {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    mitigation: string[];
  } {
    const riskFactors: string[] = [];
    const mitigation: string[] = [];

    if (contractData.autoRenewal) {
      riskFactors.push('Auto-renewal clause may lock in unfavorable terms');
      mitigation.push('Review renewal terms 90 days before expiration');
    }

    if (contractData.priceEscalation > 5) {
      riskFactors.push('High price escalation may impact profitability');
      mitigation.push('Negotiate price caps or inflation adjustments');
    }

    if (contractData.terminationClauses.length > 3) {
      riskFactors.push('Complex termination clauses may limit flexibility');
      mitigation.push('Simplify termination terms in future contracts');
    }

    const riskLevel = riskFactors.length > 2 ? 'high' : riskFactors.length > 1 ? 'medium' : 'low';

    return {
      level: riskLevel,
      factors: riskFactors,
      mitigation
    };
  }

  /**
   * Generate renewal alerts
   */
  private generateRenewalAlerts(contractData: ContractData): Array<{
    date: Date;
    type: 'renewal' | 'termination' | 'price_change';
    message: string;
  }> {
    const alerts = [];
    const renewalDate = contractData.renewalDate;
    const ninetyDaysBefore = new Date(renewalDate);
    ninetyDaysBefore.setDate(ninetyDaysBefore.getDate() - 90);

    alerts.push({
      date: ninetyDaysBefore,
      type: 'renewal',
      message: 'Contract renewal approaching - 90 days notice'
    });

    if (contractData.autoRenewal) {
      alerts.push({
        date: renewalDate,
        type: 'renewal',
        message: 'Contract auto-renews today'
      });
    }

    // Price escalation alert
    const priceChangeDate = new Date(renewalDate);
    priceChangeDate.setFullYear(priceChangeDate.getFullYear() + 1);
    
    alerts.push({
      date: priceChangeDate,
      type: 'price_change',
      message: `Price escalation of ${contractData.priceEscalation}% takes effect`
    });

    return alerts;
  }

  /**
   * Calculate risk score
   */
  private calculateRiskScore(text: string): number {
    let score = 0;
    
    if (text.includes('auto-renewal') || text.includes('auto renewal')) score += 20;
    if (text.includes('termination fee')) score += 15;
    if (text.includes('penalty')) score += 10;
    if (text.includes('exclusive')) score += 25;
    if (text.includes('minimum commitment')) score += 15;
    
    return Math.min(score, 100);
  }

  /**
   * Identify upsell opportunities
   */
  private identifyUpsellOpportunities(text: string): string[] {
    const opportunities: string[] = [];
    
    if (text.includes('basic') || text.includes('standard')) {
      opportunities.push('Upgrade to premium tier');
    }
    
    if (text.includes('monthly')) {
      opportunities.push('Convert to annual billing for discount');
    }
    
    if (text.includes('single user') || text.includes('individual')) {
      opportunities.push('Add team members');
    }
    
    if (text.includes('limited support')) {
      opportunities.push('Upgrade to priority support');
    }
    
    return opportunities;
  }

  /**
   * Store contract analysis
   */
  private async storeContractAnalysis(companyId: string, analysis: ContractAnalysis): Promise<void> {
    await prisma.contractAnalysis.create({
      data: {
        contractId: analysis.contractId,
        companyId,
        extractedData: JSON.stringify(analysis.extractedData),
        confidence: analysis.confidence,
        revenueRecognitionSchedule: JSON.stringify(analysis.revenueRecognitionSchedule),
        riskAssessment: JSON.stringify(analysis.riskAssessment),
        renewalAlerts: JSON.stringify(analysis.renewalAlerts),
        createdAt: new Date()
      }
    });
  }

  /**
   * Get contract analysis by ID
   */
  async getContractAnalysis(contractId: string): Promise<ContractAnalysis | null> {
    const analysis = await prisma.contractAnalysis.findUnique({
      where: { contractId }
    });

    if (!analysis) return null;

    return {
      contractId: analysis.contractId,
      extractedData: JSON.parse(analysis.extractedData),
      confidence: analysis.confidence,
      revenueRecognitionSchedule: JSON.parse(analysis.revenueRecognitionSchedule),
      riskAssessment: JSON.parse(analysis.riskAssessment),
      renewalAlerts: JSON.parse(analysis.renewalAlerts)
    };
  }

  /**
   * Get all contracts for a company
   */
  async getCompanyContracts(companyId: string): Promise<ContractAnalysis[]> {
    const analyses = await prisma.contractAnalysis.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    });

    return analyses.map(analysis => ({
      contractId: analysis.contractId,
      extractedData: JSON.parse(analysis.extractedData),
      confidence: analysis.confidence,
      revenueRecognitionSchedule: JSON.parse(analysis.revenueRecognitionSchedule),
      riskAssessment: JSON.parse(analysis.riskAssessment),
      renewalAlerts: JSON.parse(analysis.renewalAlerts)
    }));
  }

  /**
   * Get upcoming renewals
   */
  async getUpcomingRenewals(companyId: string, days: number = 90): Promise<ContractAnalysis[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    const analyses = await prisma.contractAnalysis.findMany({
      where: { 
        companyId,
        renewalAlerts: {
          path: '$[*].date',
          gte: new Date().toISOString()
        }
      }
    });

    return analyses.map(analysis => ({
      contractId: analysis.contractId,
      extractedData: JSON.parse(analysis.extractedData),
      confidence: analysis.confidence,
      revenueRecognitionSchedule: JSON.parse(analysis.revenueRecognitionSchedule),
      riskAssessment: JSON.parse(analysis.riskAssessment),
      renewalAlerts: JSON.parse(analysis.renewalAlerts)
    }));
  }

  /**
   * Update contract analysis
   */
  async updateContractAnalysis(contractId: string, updates: Partial<ContractAnalysis>): Promise<void> {
    await prisma.contractAnalysis.update({
      where: { contractId },
      data: {
        extractedData: updates.extractedData ? JSON.stringify(updates.extractedData) : undefined,
        confidence: updates.confidence,
        revenueRecognitionSchedule: updates.revenueRecognitionSchedule ? JSON.stringify(updates.revenueRecognitionSchedule) : undefined,
        riskAssessment: updates.riskAssessment ? JSON.stringify(updates.riskAssessment) : undefined,
        renewalAlerts: updates.renewalAlerts ? JSON.stringify(updates.renewalAlerts) : undefined,
        updatedAt: new Date()
      }
    });
  }
}









