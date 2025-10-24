import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';

const prisma = new PrismaClient();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ComplianceRisk {
  id: string;
  userId: string;
  riskType: 'tax_compliance' | 'regulatory_compliance' | 'audit_risk' | 'data_privacy' | 'financial_reporting';
  title: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  impact: number;
  riskScore: number;
  confidence: number;
  reasoning: string[];
  mitigationActions: string[];
  deadline: Date;
  createdAt: Date;
}

export interface ComplianceViolation {
  violationType: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
  potentialPenalty: number;
  regulatoryBody: string;
  deadline: Date;
  status: 'active' | 'resolved' | 'monitoring';
}

export interface ComplianceScore {
  overallScore: number;
  taxCompliance: number;
  regulatoryCompliance: number;
  auditReadiness: number;
  dataPrivacy: number;
  financialReporting: number;
  trends: {
    improvement: number;
    decline: number;
    stability: number;
  };
}

export class CompliancePredictorService {
  /**
   * Generate compliance risk predictions
   */
  async generateComplianceRiskPredictions(userId: string): Promise<ComplianceRisk[]> {
    try {
      const risks: ComplianceRisk[] = [];
      
      // Get business data for compliance analysis
      const businessData = await this.getBusinessData(userId);
      
      // Tax compliance risks
      const taxRisks = await this.analyzeTaxComplianceRisks(userId, businessData);
      risks.push(...taxRisks);
      
      // Regulatory compliance risks
      const regulatoryRisks = await this.analyzeRegulatoryComplianceRisks(userId, businessData);
      risks.push(...regulatoryRisks);
      
      // Audit risks
      const auditRisks = await this.analyzeAuditRisks(userId, businessData);
      risks.push(...auditRisks);
      
      // Data privacy risks
      const dataPrivacyRisks = await this.analyzeDataPrivacyRisks(userId, businessData);
      risks.push(...dataPrivacyRisks);
      
      // Financial reporting risks
      const financialReportingRisks = await this.analyzeFinancialReportingRisks(userId, businessData);
      risks.push(...financialReportingRisks);
      
      // Sort by risk score
      return risks.sort((a, b) => b.riskScore - a.riskScore);

    } catch (error) {
      console.error('Error generating compliance risk predictions:', error);
      return [];
    }
  }

  /**
   * Get business data for compliance analysis
   */
  private async getBusinessData(userId: string): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          businessType: true,
          industry: true,
          employeeCount: true,
          annualRevenue: true,
          location: true
        }
      });
      
      // Get recent transactions for analysis
      const recentTransactions = await prisma.transaction.findMany({
        where: { userId },
        take: 100,
        orderBy: { createdAt: 'desc' }
      });
      
      // Get compliance history
      const complianceHistory = await this.getComplianceHistory(userId);
      
      return {
        businessType: user?.businessType || 'LLC',
        industry: user?.industry || 'Services',
        employeeCount: user?.employeeCount || 10,
        annualRevenue: user?.annualRevenue || 1000000,
        location: user?.location || 'US',
        recentTransactions,
        complianceHistory
      };

    } catch (error) {
      console.error('Error getting business data:', error);
      return {
        businessType: 'LLC',
        industry: 'Services',
        employeeCount: 10,
        annualRevenue: 1000000,
        location: 'US',
        recentTransactions: [],
        complianceHistory: []
      };
    }
  }

  /**
   * Get compliance history
   */
  private async getComplianceHistory(userId: string): Promise<any[]> {
    // Mock compliance history - in real implementation, this would query actual compliance data
    return [
      {
        date: new Date('2023-01-15'),
        type: 'tax_filing',
        status: 'compliant',
        notes: 'Quarterly tax filing completed on time'
      },
      {
        date: new Date('2023-02-28'),
        type: 'regulatory_review',
        status: 'compliant',
        notes: 'Annual regulatory compliance review passed'
      },
      {
        date: new Date('2023-03-31'),
        type: 'audit_preparation',
        status: 'in_progress',
        notes: 'Preparing for annual audit'
      }
    ];
  }

  /**
   * Analyze tax compliance risks
   */
  private async analyzeTaxComplianceRisks(userId: string, businessData: any): Promise<ComplianceRisk[]> {
    const risks: ComplianceRisk[] = [];
    
    // Late tax filing risk
    const lastFilingDate = new Date('2023-01-15');
    const daysSinceLastFiling = (Date.now() - lastFilingDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastFiling > 90) {
      const riskScore = Math.min(daysSinceLastFiling / 30, 100);
      
      risks.push({
        id: `tax_late_filing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        riskType: 'tax_compliance',
        title: 'Late tax filing risk',
        description: `Tax filing is ${Math.floor(daysSinceLastFiling)} days overdue`,
        riskLevel: riskScore > 70 ? 'critical' : riskScore > 40 ? 'high' : 'medium',
        probability: Math.min(riskScore / 100, 0.9),
        impact: 0.8,
        riskScore,
        confidence: 0.9,
        reasoning: [
          `Last filing: ${lastFilingDate.toLocaleDateString()}`,
          `Days overdue: ${Math.floor(daysSinceLastFiling)}`,
          'Late filing penalties apply',
          'IRS may impose additional penalties'
        ],
        mitigationActions: [
          'File taxes immediately',
          'Contact tax professional',
          'Set up automatic reminders',
          'Implement tax calendar'
        ],
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdAt: new Date()
      });
    }
    
    // Estimated tax payment risk
    const estimatedTaxRisk = this.calculateEstimatedTaxRisk(businessData);
    if (estimatedTaxRisk > 0.7) {
      risks.push({
        id: `tax_estimated_payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        riskType: 'tax_compliance',
        title: 'Estimated tax payment risk',
        description: 'High risk of underpayment penalties',
        riskLevel: 'high',
        probability: estimatedTaxRisk,
        impact: 0.6,
        riskScore: estimatedTaxRisk * 80,
        confidence: 0.8,
        reasoning: [
          'Quarterly estimated tax payments may be insufficient',
          'Underpayment penalties can be significant',
          'Business income is volatile'
        ],
        mitigationActions: [
          'Review estimated tax calculations',
          'Increase quarterly payments',
          'Consult with tax advisor',
          'Monitor income projections'
        ],
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        createdAt: new Date()
      });
    }
    
    return risks;
  }

  /**
   * Analyze regulatory compliance risks
   */
  private async analyzeRegulatoryComplianceRisks(userId: string, businessData: any): Promise<ComplianceRisk[]> {
    const risks: ComplianceRisk[] = [];
    
    // Industry-specific compliance risks
    const industryRisks = this.getIndustrySpecificRisks(businessData.industry);
    
    for (const risk of industryRisks) {
      risks.push({
        id: `regulatory_${risk.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        riskType: 'regulatory_compliance',
        title: risk.title,
        description: risk.description,
        riskLevel: risk.level,
        probability: risk.probability,
        impact: risk.impact,
        riskScore: risk.probability * risk.impact * 100,
        confidence: 0.7,
        reasoning: risk.reasoning,
        mitigationActions: risk.mitigationActions,
        deadline: risk.deadline,
        createdAt: new Date()
      });
    }
    
    return risks;
  }

  /**
   * Analyze audit risks
   */
  private async analyzeAuditRisks(userId: string, businessData: any): Promise<ComplianceRisk[]> {
    const risks: ComplianceRisk[] = [];
    
    // High expense ratio risk
    const expenseRatio = this.calculateExpenseRatio(businessData);
    if (expenseRatio > 0.8) {
      risks.push({
        id: `audit_expense_ratio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        riskType: 'audit_risk',
        title: 'High expense ratio audit risk',
        description: `Expense ratio of ${(expenseRatio * 100).toFixed(1)}% may trigger audit`,
        riskLevel: 'high',
        probability: 0.7,
        impact: 0.8,
        riskScore: 56,
        confidence: 0.8,
        reasoning: [
          `Expense ratio: ${(expenseRatio * 100).toFixed(1)}%`,
          'High expense ratios attract IRS attention',
          'Audit risk increases with expense ratio',
          'Documentation requirements are higher'
        ],
        mitigationActions: [
          'Review expense categorization',
          'Ensure proper documentation',
          'Consult with tax professional',
          'Implement expense tracking system'
        ],
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        createdAt: new Date()
      });
    }
    
    // Round number transactions
    const roundNumberRisk = this.calculateRoundNumberRisk(businessData.recentTransactions);
    if (roundNumberRisk > 0.5) {
      risks.push({
        id: `audit_round_numbers_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        riskType: 'audit_risk',
        title: 'Round number transaction risk',
        description: 'High frequency of round number transactions may trigger audit',
        riskLevel: 'medium',
        probability: roundNumberRisk,
        impact: 0.6,
        riskScore: roundNumberRisk * 60,
        confidence: 0.6,
        reasoning: [
          'Round number transactions are audit red flags',
          'IRS looks for patterns in transaction amounts',
          'Documentation is crucial for round numbers'
        ],
        mitigationActions: [
          'Review transaction patterns',
          'Ensure proper documentation',
          'Avoid round number estimates',
          'Use precise calculations'
        ],
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        createdAt: new Date()
      });
    }
    
    return risks;
  }

  /**
   * Analyze data privacy risks
   */
  private async analyzeDataPrivacyRisks(userId: string, businessData: any): Promise<ComplianceRisk[]> {
    const risks: ComplianceRisk[] = [];
    
    // GDPR compliance risk
    if (businessData.location === 'EU' || businessData.location === 'UK') {
      const gdprRisk = this.calculateGDPRRisk(businessData);
      if (gdprRisk > 0.6) {
        risks.push({
          id: `privacy_gdpr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          riskType: 'data_privacy',
          title: 'GDPR compliance risk',
          description: 'High risk of GDPR violations',
          riskLevel: 'high',
          probability: gdprRisk,
          impact: 0.9,
          riskScore: gdprRisk * 90,
          confidence: 0.8,
          reasoning: [
            'GDPR compliance is mandatory in EU/UK',
            'High penalties for violations',
            'Data protection requirements are strict'
          ],
          mitigationActions: [
            'Implement GDPR compliance measures',
            'Conduct privacy impact assessment',
            'Update privacy policies',
            'Train staff on data protection'
          ],
          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
          createdAt: new Date()
        });
      }
    }
    
    // CCPA compliance risk
    if (businessData.location === 'CA') {
      const ccpaRisk = this.calculateCCPARisk(businessData);
      if (ccpaRisk > 0.5) {
        risks.push({
          id: `privacy_ccpa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          riskType: 'data_privacy',
          title: 'CCPA compliance risk',
          description: 'High risk of CCPA violations',
          riskLevel: 'medium',
          probability: ccpaRisk,
          impact: 0.7,
          riskScore: ccpaRisk * 70,
          confidence: 0.7,
          reasoning: [
            'CCPA compliance required in California',
            'Consumer privacy rights must be protected',
            'Data breach notification requirements'
          ],
          mitigationActions: [
            'Implement CCPA compliance measures',
            'Update privacy notices',
            'Establish data breach response plan',
            'Train staff on consumer rights'
          ],
          deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
          createdAt: new Date()
        });
      }
    }
    
    return risks;
  }

  /**
   * Analyze financial reporting risks
   */
  private async analyzeFinancialReportingRisks(userId: string, businessData: any): Promise<ComplianceRisk[]> {
    const risks: ComplianceRisk[] = [];
    
    // Revenue recognition compliance
    const revenueRecognitionRisk = this.calculateRevenueRecognitionRisk(businessData);
    if (revenueRecognitionRisk > 0.6) {
      risks.push({
        id: `reporting_revenue_recognition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        riskType: 'financial_reporting',
        title: 'Revenue recognition compliance risk',
        description: 'High risk of revenue recognition violations',
        riskLevel: 'high',
        probability: revenueRecognitionRisk,
        impact: 0.8,
        riskScore: revenueRecognitionRisk * 80,
        confidence: 0.8,
        reasoning: [
          'ASC 606 compliance is mandatory',
          'Revenue recognition rules are complex',
          'Audit requirements are strict'
        ],
        mitigationActions: [
          'Review revenue recognition policies',
          'Implement ASC 606 compliance',
          'Train staff on revenue recognition',
          'Conduct regular compliance reviews'
        ],
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
        createdAt: new Date()
      });
    }
    
    return risks;
  }

  /**
   * Calculate estimated tax risk
   */
  private calculateEstimatedTaxRisk(businessData: any): number {
    // Mock calculation - in real implementation, this would analyze actual tax data
    const incomeVolatility = 0.3; // 30% income volatility
    const paymentHistory = 0.8; // 80% payment history
    return Math.max(0, incomeVolatility - paymentHistory);
  }

  /**
   * Get industry-specific risks
   */
  private getIndustrySpecificRisks(industry: string): any[] {
    const risks: { [key: string]: any[] } = {
      'Healthcare': [
        {
          type: 'hipaa',
          title: 'HIPAA compliance risk',
          description: 'Healthcare data protection requirements',
          level: 'high' as const,
          probability: 0.8,
          impact: 0.9,
          reasoning: ['HIPAA compliance mandatory', 'High penalties for violations'],
          mitigationActions: ['Implement HIPAA safeguards', 'Conduct risk assessment'],
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      ],
      'Financial': [
        {
          type: 'sox',
          title: 'SOX compliance risk',
          description: 'Sarbanes-Oxley compliance requirements',
          level: 'high' as const,
          probability: 0.7,
          impact: 0.8,
          reasoning: ['SOX compliance mandatory', 'Financial reporting requirements'],
          mitigationActions: ['Implement SOX controls', 'Conduct internal audits'],
          deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
        }
      ],
      'Technology': [
        {
          type: 'data_protection',
          title: 'Data protection compliance risk',
          description: 'Data protection and privacy requirements',
          level: 'medium' as const,
          probability: 0.6,
          impact: 0.7,
          reasoning: ['Data protection laws apply', 'Privacy requirements'],
          mitigationActions: ['Implement data protection measures', 'Update privacy policies'],
          deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
        }
      ]
    };
    
    return risks[industry] || [];
  }

  /**
   * Calculate expense ratio
   */
  private calculateExpenseRatio(businessData: any): number {
    // Mock calculation - in real implementation, this would use actual financial data
    return 0.75; // 75% expense ratio
  }

  /**
   * Calculate round number risk
   */
  private calculateRoundNumberRisk(transactions: any[]): number {
    if (transactions.length === 0) return 0;
    
    const roundNumbers = transactions.filter(t => 
      t.amount % 100 === 0 || t.amount % 50 === 0
    ).length;
    
    return roundNumbers / transactions.length;
  }

  /**
   * Calculate GDPR risk
   */
  private calculateGDPRRisk(businessData: any): number {
    // Mock calculation - in real implementation, this would analyze data processing activities
    return 0.7; // 70% GDPR risk
  }

  /**
   * Calculate CCPA risk
   */
  private calculateCCPARisk(businessData: any): number {
    // Mock calculation - in real implementation, this would analyze data processing activities
    return 0.6; // 60% CCPA risk
  }

  /**
   * Calculate revenue recognition risk
   */
  private calculateRevenueRecognitionRisk(businessData: any): number {
    // Mock calculation - in real implementation, this would analyze revenue recognition practices
    return 0.7; // 70% revenue recognition risk
  }

  /**
   * Get compliance score
   */
  async getComplianceScore(userId: string): Promise<ComplianceScore> {
    try {
      const risks = await this.generateComplianceRiskPredictions(userId);
      
      const overallScore = Math.max(0, 100 - risks.reduce((sum, risk) => sum + risk.riskScore, 0) / risks.length);
      
      const taxCompliance = 100 - risks.filter(r => r.riskType === 'tax_compliance').reduce((sum, r) => sum + r.riskScore, 0) / Math.max(risks.filter(r => r.riskType === 'tax_compliance').length, 1);
      const regulatoryCompliance = 100 - risks.filter(r => r.riskType === 'regulatory_compliance').reduce((sum, r) => sum + r.riskScore, 0) / Math.max(risks.filter(r => r.riskType === 'regulatory_compliance').length, 1);
      const auditReadiness = 100 - risks.filter(r => r.riskType === 'audit_risk').reduce((sum, r) => sum + r.riskScore, 0) / Math.max(risks.filter(r => r.riskType === 'audit_risk').length, 1);
      const dataPrivacy = 100 - risks.filter(r => r.riskType === 'data_privacy').reduce((sum, r) => sum + r.riskScore, 0) / Math.max(risks.filter(r => r.riskType === 'data_privacy').length, 1);
      const financialReporting = 100 - risks.filter(r => r.riskType === 'financial_reporting').reduce((sum, r) => sum + r.riskScore, 0) / Math.max(risks.filter(r => r.riskType === 'financial_reporting').length, 1);
      
      return {
        overallScore,
        taxCompliance,
        regulatoryCompliance,
        auditReadiness,
        dataPrivacy,
        financialReporting,
        trends: {
          improvement: 5, // Mock 5% improvement
          decline: 2, // Mock 2% decline
          stability: 93 // Mock 93% stability
        }
      };

    } catch (error) {
      console.error('Error getting compliance score:', error);
      return {
        overallScore: 0,
        taxCompliance: 0,
        regulatoryCompliance: 0,
        auditReadiness: 0,
        dataPrivacy: 0,
        financialReporting: 0,
        trends: {
          improvement: 0,
          decline: 0,
          stability: 0
        }
      };
    }
  }
}

export default CompliancePredictorService;






