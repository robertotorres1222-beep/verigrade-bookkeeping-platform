import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';

const prisma = new PrismaClient();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ContractAnalysis {
  contractId: string;
  contractType: 'service' | 'subscription' | 'license' | 'purchase' | 'other';
  parties: {
    client: string;
    vendor: string;
  };
  financialTerms: {
    totalValue: number;
    paymentSchedule: PaymentSchedule[];
    currency: string;
  };
  performanceObligations: PerformanceObligation[];
  contractTerms: {
    startDate: Date;
    endDate?: Date;
    renewalTerms?: string;
    terminationClause?: string;
  };
  riskFactors: string[];
  complianceRequirements: string[];
  confidence: number;
}

export interface PaymentSchedule {
  amount: number;
  dueDate: Date;
  milestone?: string;
  status: 'pending' | 'paid' | 'overdue';
}

export interface PerformanceObligation {
  description: string;
  deliveryDate: Date;
  value: number;
  status: 'pending' | 'completed' | 'overdue';
  revenueRecognitionDate?: Date;
}

export interface ContractModification {
  type: 'amendment' | 'extension' | 'termination' | 'renewal';
  description: string;
  effectiveDate: Date;
  impact: {
    valueChange: number;
    termChange: number; // days
  };
}

export class ContractIntelligenceService {
  /**
   * Analyze contract for revenue recognition compliance
   */
  async analyzeContract(
    contractText: string, 
    contractType?: string
  ): Promise<ContractAnalysis> {
    try {
      const prompt = `
Analyze this contract for revenue recognition (ASC 606) compliance. Return JSON format:

{
  "contractType": "service|subscription|license|purchase|other",
  "parties": {
    "client": "string",
    "vendor": "string"
  },
  "financialTerms": {
    "totalValue": number,
    "paymentSchedule": [
      {
        "amount": number,
        "dueDate": "YYYY-MM-DD",
        "milestone": "string (optional)",
        "status": "pending"
      }
    ],
    "currency": "string"
  },
  "performanceObligations": [
    {
      "description": "string",
      "deliveryDate": "YYYY-MM-DD",
      "value": number,
      "status": "pending",
      "revenueRecognitionDate": "YYYY-MM-DD (optional)"
    }
  ],
  "contractTerms": {
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD (optional)",
    "renewalTerms": "string (optional)",
    "terminationClause": "string (optional)"
  },
  "riskFactors": ["string"],
  "complianceRequirements": ["string"],
  "confidence": number (0-1)
}

Contract text:
${contractText}

Contract type: ${contractType || 'unknown'}

Focus on:
- ASC 606 revenue recognition requirements
- Performance obligations and delivery dates
- Payment terms and schedules
- Contract modifications and renewals
- Risk factors and compliance requirements
`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: contractText }
        ],
        temperature: 0.1,
        max_tokens: 2000
      });

      const response = completion.choices[0].message.content;
      const analysis = JSON.parse(response || '{}');

      return {
        contractId: this.generateContractId(),
        contractType: analysis.contractType || 'other',
        parties: analysis.parties || { client: 'Unknown', vendor: 'Unknown' },
        financialTerms: analysis.financialTerms || { totalValue: 0, paymentSchedule: [], currency: 'USD' },
        performanceObligations: analysis.performanceObligations || [],
        contractTerms: {
          startDate: new Date(analysis.contractTerms?.startDate || new Date()),
          endDate: analysis.contractTerms?.endDate ? new Date(analysis.contractTerms.endDate) : undefined,
          renewalTerms: analysis.contractTerms?.renewalTerms,
          terminationClause: analysis.contractTerms?.terminationClause
        },
        riskFactors: analysis.riskFactors || [],
        complianceRequirements: analysis.complianceRequirements || [],
        confidence: analysis.confidence || 0.5
      };

    } catch (error) {
      console.error('Error analyzing contract:', error);
      throw new Error('Failed to analyze contract');
    }
  }

  /**
   * Extract performance obligations for revenue recognition
   */
  async extractPerformanceObligations(contractText: string): Promise<PerformanceObligation[]> {
    try {
      const prompt = `
Extract performance obligations from this contract for ASC 606 revenue recognition. Return JSON array:

[
  {
    "description": "string",
    "deliveryDate": "YYYY-MM-DD",
    "value": number,
    "status": "pending",
    "revenueRecognitionDate": "YYYY-MM-DD (optional)"
  }
]

Contract text:
${contractText}

Look for:
- Service deliverables
- Milestone payments
- Performance requirements
- Delivery dates
- Value allocation
- Revenue recognition triggers
`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: contractText }
        ],
        temperature: 0.1,
        max_tokens: 1000
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response || '[]');

    } catch (error) {
      console.error('Error extracting performance obligations:', error);
      return [];
    }
  }

  /**
   * Detect contract modifications and amendments
   */
  async detectContractModifications(
    originalContract: string, 
    modifiedContract: string
  ): Promise<ContractModification[]> {
    try {
      const prompt = `
Compare these two contract versions and identify modifications. Return JSON array:

[
  {
    "type": "amendment|extension|termination|renewal",
    "description": "string",
    "effectiveDate": "YYYY-MM-DD",
    "impact": {
      "valueChange": number,
      "termChange": number
    }
  }
]

Original contract:
${originalContract}

Modified contract:
${modifiedContract}

Identify:
- Changes to financial terms
- Modifications to delivery dates
- Changes to performance obligations
- Contract extensions or renewals
- Termination clauses
`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `Original: ${originalContract}\n\nModified: ${modifiedContract}` }
        ],
        temperature: 0.1,
        max_tokens: 1000
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response || '[]');

    } catch (error) {
      console.error('Error detecting contract modifications:', error);
      return [];
    }
  }

  /**
   * Identify renewal clauses and terms
   */
  async identifyRenewalTerms(contractText: string): Promise<{
    hasRenewal: boolean;
    renewalTerms: string;
    renewalDate?: Date;
    autoRenewal: boolean;
    noticeRequired: boolean;
    noticePeriod?: number; // days
  }> {
    try {
      const prompt = `
Analyze this contract for renewal terms. Return JSON format:

{
  "hasRenewal": boolean,
  "renewalTerms": "string",
  "renewalDate": "YYYY-MM-DD (optional)",
  "autoRenewal": boolean,
  "noticeRequired": boolean,
  "noticePeriod": number (days, optional)
}

Contract text:
${contractText}

Look for:
- Renewal clauses
- Auto-renewal terms
- Notice requirements
- Renewal dates
- Term extensions
`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: contractText }
        ],
        temperature: 0.1,
        max_tokens: 500
      });

      const response = completion.choices[0].message.content;
      const renewalInfo = JSON.parse(response || '{}');

      return {
        hasRenewal: renewalInfo.hasRenewal || false,
        renewalTerms: renewalInfo.renewalTerms || '',
        renewalDate: renewalInfo.renewalDate ? new Date(renewalInfo.renewalDate) : undefined,
        autoRenewal: renewalInfo.autoRenewal || false,
        noticeRequired: renewalInfo.noticeRequired || false,
        noticePeriod: renewalInfo.noticePeriod
      };

    } catch (error) {
      console.error('Error identifying renewal terms:', error);
      return {
        hasRenewal: false,
        renewalTerms: '',
        autoRenewal: false,
        noticeRequired: false
      };
    }
  }

  /**
   * Flag non-standard terms for review
   */
  async flagNonStandardTerms(contractText: string): Promise<{
    flaggedTerms: string[];
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
  }> {
    try {
      const prompt = `
Analyze this contract for non-standard or risky terms. Return JSON format:

{
  "flaggedTerms": ["string"],
  "riskLevel": "low|medium|high",
  "recommendations": ["string"]
}

Contract text:
${contractText}

Look for:
- Unusual payment terms
- Penalty clauses
- Liability limitations
- Intellectual property issues
- Termination clauses
- Force majeure clauses
- Dispute resolution terms
- Confidentiality requirements
`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: contractText }
        ],
        temperature: 0.1,
        max_tokens: 800
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response || '{}');

    } catch (error) {
      console.error('Error flagging non-standard terms:', error);
      return {
        flaggedTerms: [],
        riskLevel: 'low',
        recommendations: []
      };
    }
  }

  /**
   * Auto-populate revenue recognition schedule
   */
  async generateRevenueRecognitionSchedule(
    contractAnalysis: ContractAnalysis
  ): Promise<{
    schedule: Array<{
      date: Date;
      amount: number;
      obligation: string;
      status: 'pending' | 'recognized' | 'deferred';
    }>;
    totalDeferredRevenue: number;
    nextRecognitionDate?: Date;
  }> {
    try {
      const schedule: Array<{
        date: Date;
        amount: number;
        obligation: string;
        status: 'pending' | 'recognized' | 'deferred';
      }> = [];

      let totalDeferredRevenue = 0;
      let nextRecognitionDate: Date | undefined;

      // Process performance obligations
      for (const obligation of contractAnalysis.performanceObligations) {
        const recognitionDate = obligation.revenueRecognitionDate || obligation.deliveryDate;
        
        schedule.push({
          date: recognitionDate,
          amount: obligation.value,
          obligation: obligation.description,
          status: obligation.status === 'completed' ? 'recognized' : 'pending'
        });

        if (obligation.status !== 'completed') {
          totalDeferredRevenue += obligation.value;
          
          if (!nextRecognitionDate || recognitionDate < nextRecognitionDate) {
            nextRecognitionDate = recognitionDate;
          }
        }
      }

      // Sort by date
      schedule.sort((a, b) => a.date.getTime() - b.date.getTime());

      return {
        schedule,
        totalDeferredRevenue,
        nextRecognitionDate
      };

    } catch (error) {
      console.error('Error generating revenue recognition schedule:', error);
      return {
        schedule: [],
        totalDeferredRevenue: 0
      };
    }
  }

  /**
   * Store contract analysis in database
   */
  async storeContractAnalysis(
    userId: string,
    contractId: string,
    analysis: ContractAnalysis
  ): Promise<void> {
    try {
      await prisma.contractAnalysis.create({
        data: {
          contractId,
          userId,
          contractType: analysis.contractType,
          parties: analysis.parties,
          financialTerms: analysis.financialTerms,
          performanceObligations: analysis.performanceObligations,
          contractTerms: analysis.contractTerms,
          riskFactors: analysis.riskFactors,
          complianceRequirements: analysis.complianceRequirements,
          confidence: analysis.confidence,
          analyzedAt: new Date()
        }
      });

    } catch (error) {
      console.error('Error storing contract analysis:', error);
      throw new Error('Failed to store contract analysis');
    }
  }

  /**
   * Get contract analysis history
   */
  async getContractAnalysisHistory(userId: string, limit: number = 20): Promise<any[]> {
    try {
      return await prisma.contractAnalysis.findMany({
        where: { userId },
        orderBy: { analyzedAt: 'desc' },
        take: limit
      });

    } catch (error) {
      console.error('Error getting contract analysis history:', error);
      return [];
    }
  }

  /**
   * Generate contract ID
   */
  private generateContractId(): string {
    return `CONTRACT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate contract risk score
   */
  calculateRiskScore(analysis: ContractAnalysis): number {
    let riskScore = 0;
    let factors = 0;

    // Risk factors
    riskScore += analysis.riskFactors.length * 10;
    factors += analysis.riskFactors.length;

    // Compliance requirements
    riskScore += analysis.complianceRequirements.length * 5;
    factors += analysis.complianceRequirements.length;

    // Contract duration (longer = higher risk)
    if (analysis.contractTerms.endDate) {
      const duration = analysis.contractTerms.endDate.getTime() - analysis.contractTerms.startDate.getTime();
      const years = duration / (365 * 24 * 60 * 60 * 1000);
      riskScore += years * 5;
      factors++;
    }

    // Payment schedule complexity
    riskScore += analysis.financialTerms.paymentSchedule.length * 2;
    factors += analysis.financialTerms.paymentSchedule.length;

    // Performance obligations complexity
    riskScore += analysis.performanceObligations.length * 3;
    factors += analysis.performanceObligations.length;

    return factors > 0 ? Math.min(riskScore / factors, 100) : 0;
  }

  /**
   * Get contract compliance score
   */
  calculateComplianceScore(analysis: ContractAnalysis): number {
    let score = 100; // Start with perfect score

    // Deduct for missing information
    if (!analysis.parties.client || analysis.parties.client === 'Unknown') {
      score -= 20;
    }

    if (!analysis.parties.vendor || analysis.parties.vendor === 'Unknown') {
      score -= 20;
    }

    if (analysis.financialTerms.totalValue <= 0) {
      score -= 30;
    }

    if (analysis.performanceObligations.length === 0) {
      score -= 25;
    }

    if (analysis.contractTerms.startDate > new Date()) {
      score -= 10; // Future start date
    }

    // Deduct for risk factors
    score -= analysis.riskFactors.length * 5;

    return Math.max(score, 0);
  }
}

export default ContractIntelligenceService;







