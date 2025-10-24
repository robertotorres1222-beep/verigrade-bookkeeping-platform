import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';

const prisma = new PrismaClient();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface VendorProfile {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  businessType?: string;
  industry?: string;
  paymentTerms?: string;
  preferredPaymentMethod?: string;
  creditRating?: string;
  riskScore: number;
  confidence: number;
}

export interface VendorRelationship {
  vendorId: string;
  totalSpent: number;
  transactionCount: number;
  averageTransactionValue: number;
  lastTransactionDate: Date;
  paymentHistory: PaymentHistory[];
  relationshipScore: number;
}

export interface PaymentHistory {
  invoiceId: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  daysLate?: number;
  status: 'paid' | 'overdue' | 'pending';
}

export interface VendorEnrichment {
  businessInfo: {
    industry: string;
    businessType: string;
    employeeCount?: string;
    revenue?: string;
    foundedYear?: number;
  };
  financialInfo: {
    creditRating?: string;
    riskScore: number;
    paymentReliability: number;
  };
  contactInfo: {
    primaryContact?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
  location: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    timezone?: string;
  };
}

export class VendorIntelligenceService {
  /**
   * Extract vendor details from any document
   */
  async extractVendorDetails(documentText: string): Promise<VendorProfile> {
    try {
      const prompt = `
Extract vendor information from this document. Return JSON format:

{
  "name": "string",
  "address": "string (optional)",
  "phone": "string (optional)",
  "email": "string (optional)",
  "website": "string (optional)",
  "taxId": "string (optional)",
  "businessType": "string (optional)",
  "industry": "string (optional)",
  "paymentTerms": "string (optional)",
  "preferredPaymentMethod": "string (optional)",
  "confidence": number (0-1)
}

Document text:
${documentText}

Look for:
- Company/vendor name (usually at top or in header)
- Business address
- Contact information (phone, email)
- Tax ID or business registration number
- Payment terms (Net 30, Due on receipt, etc.)
- Industry indicators
- Business type (LLC, Corp, etc.)
`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: documentText }
        ],
        temperature: 0.1,
        max_tokens: 500
      });

      const response = completion.choices[0].message.content;
      const vendorInfo = JSON.parse(response || '{}');

      return {
        name: vendorInfo.name || 'Unknown Vendor',
        address: vendorInfo.address,
        phone: vendorInfo.phone,
        email: vendorInfo.email,
        website: vendorInfo.website,
        taxId: vendorInfo.taxId,
        businessType: vendorInfo.businessType,
        industry: vendorInfo.industry,
        paymentTerms: vendorInfo.paymentTerms,
        preferredPaymentMethod: vendorInfo.preferredPaymentMethod,
        riskScore: 50, // Default medium risk
        confidence: vendorInfo.confidence || 0.5
      };

    } catch (error) {
      console.error('Error extracting vendor details:', error);
      return {
        name: 'Unknown Vendor',
        riskScore: 50,
        confidence: 0.1
      };
    }
  }

  /**
   * Auto-populate vendor database from invoices
   */
  async populateVendorFromInvoice(
    userId: string, 
    invoiceData: any
  ): Promise<string> {
    try {
      const vendorProfile = await this.extractVendorDetails(invoiceData.text || '');
      
      // Check if vendor already exists
      const existingVendor = await prisma.vendor.findFirst({
        where: {
          userId,
          name: vendorProfile.name
        }
      });

      if (existingVendor) {
        // Update existing vendor with new information
        await prisma.vendor.update({
          where: { id: existingVendor.id },
          data: {
            address: vendorProfile.address || existingVendor.address,
            phone: vendorProfile.phone || existingVendor.phone,
            email: vendorProfile.email || existingVendor.email,
            website: vendorProfile.website || existingVendor.website,
            taxId: vendorProfile.taxId || existingVendor.taxId,
            businessType: vendorProfile.businessType || existingVendor.businessType,
            industry: vendorProfile.industry || existingVendor.industry,
            paymentTerms: vendorProfile.paymentTerms || existingVendor.paymentTerms,
            lastUsed: new Date()
          }
        });
        return existingVendor.id;
      } else {
        // Create new vendor
        const newVendor = await prisma.vendor.create({
          data: {
            name: vendorProfile.name,
            address: vendorProfile.address,
            phone: vendorProfile.phone,
            email: vendorProfile.email,
            website: vendorProfile.website,
            taxId: vendorProfile.taxId,
            businessType: vendorProfile.businessType,
            industry: vendorProfile.industry,
            paymentTerms: vendorProfile.paymentTerms,
            preferredPaymentMethod: vendorProfile.preferredPaymentMethod,
            riskScore: vendorProfile.riskScore,
            userId,
            lastUsed: new Date()
          }
        });
        return newVendor.id;
      }

    } catch (error) {
      console.error('Error populating vendor from invoice:', error);
      throw new Error('Failed to populate vendor from invoice');
    }
  }

  /**
   * Detect payment terms and methods
   */
  async detectPaymentTerms(documentText: string): Promise<{
    paymentTerms: string;
    dueDate?: Date;
    discountTerms?: string;
    lateFees?: string;
    preferredMethod?: string;
  }> {
    try {
      const prompt = `
Extract payment terms from this document. Return JSON format:

{
  "paymentTerms": "string (e.g., Net 30, Due on receipt)",
  "dueDate": "YYYY-MM-DD (optional)",
  "discountTerms": "string (optional, e.g., 2% 10 Net 30)",
  "lateFees": "string (optional)",
  "preferredMethod": "string (optional, e.g., Check, ACH, Credit Card)"
}

Document text:
${documentText}

Look for:
- Payment terms (Net 30, Due on receipt, etc.)
- Due dates
- Early payment discounts
- Late fees or penalties
- Preferred payment methods
- Payment instructions
`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: documentText }
        ],
        temperature: 0.1,
        max_tokens: 300
      });

      const response = completion.choices[0].message.content;
      const paymentTerms = JSON.parse(response || '{}');

      return {
        paymentTerms: paymentTerms.paymentTerms || '',
        dueDate: paymentTerms.dueDate ? new Date(paymentTerms.dueDate) : undefined,
        discountTerms: paymentTerms.discountTerms,
        lateFees: paymentTerms.lateFees,
        preferredMethod: paymentTerms.preferredMethod
      };

    } catch (error) {
      console.error('Error detecting payment terms:', error);
      return {
        paymentTerms: ''
      };
    }
  }

  /**
   * Identify recurring vendors and relationships
   */
  async analyzeVendorRelationships(userId: string): Promise<VendorRelationship[]> {
    try {
      const vendors = await prisma.vendor.findMany({
        where: { userId },
        include: {
          expenses: {
            select: {
              amount: true,
              createdAt: true
            }
          },
          invoices: {
            select: {
              total: true,
              createdAt: true,
              status: true
            }
          }
        }
      });

      const relationships: VendorRelationship[] = [];

      for (const vendor of vendors) {
        const allTransactions = [
          ...vendor.expenses.map(e => ({ type: 'expense', amount: e.amount, date: e.createdAt })),
          ...vendor.invoices.map(i => ({ type: 'invoice', amount: i.total, date: i.createdAt, status: i.status }))
        ];

        const totalSpent = allTransactions.reduce((sum, t) => sum + t.amount, 0);
        const transactionCount = allTransactions.length;
        const averageTransactionValue = transactionCount > 0 ? totalSpent / transactionCount : 0;
        const lastTransactionDate = allTransactions.length > 0 
          ? new Date(Math.max(...allTransactions.map(t => t.date.getTime())))
          : new Date();

        // Calculate relationship score
        const relationshipScore = this.calculateRelationshipScore(
          totalSpent,
          transactionCount,
          averageTransactionValue,
          lastTransactionDate
        );

        relationships.push({
          vendorId: vendor.id,
          totalSpent,
          transactionCount,
          averageTransactionValue,
          lastTransactionDate,
          paymentHistory: [], // Would be populated from actual payment data
          relationshipScore
        });
      }

      return relationships.sort((a, b) => b.relationshipScore - a.relationshipScore);

    } catch (error) {
      console.error('Error analyzing vendor relationships:', error);
      return [];
    }
  }

  /**
   * Build vendor profile enrichment with external data
   */
  async enrichVendorProfile(vendorName: string): Promise<VendorEnrichment> {
    try {
      // In a real implementation, this would call external APIs like:
      // - Business registration databases
      // - Credit rating services
      // - Industry databases
      // - Social media and web presence

      const prompt = `
Enrich vendor profile with business intelligence. Return JSON format:

{
  "businessInfo": {
    "industry": "string",
    "businessType": "string",
    "employeeCount": "string (optional)",
    "revenue": "string (optional)",
    "foundedYear": number (optional)
  },
  "financialInfo": {
    "creditRating": "string (optional)",
    "riskScore": number (0-100),
    "paymentReliability": number (0-100)
  },
  "contactInfo": {
    "primaryContact": "string (optional)",
    "phone": "string (optional)",
    "email": "string (optional)",
    "website": "string (optional)"
  },
  "location": {
    "address": "string (optional)",
    "city": "string (optional)",
    "state": "string (optional)",
    "country": "string (optional)",
    "timezone": "string (optional)"
  }
}

Vendor name: ${vendorName}

Provide realistic business intelligence based on the vendor name.
`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: vendorName }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response || '{}');

    } catch (error) {
      console.error('Error enriching vendor profile:', error);
      return {
        businessInfo: { industry: 'Unknown', businessType: 'Unknown' },
        financialInfo: { riskScore: 50, paymentReliability: 50 },
        contactInfo: {},
        location: {}
      };
    }
  }

  /**
   * Calculate vendor risk score
   */
  async calculateVendorRiskScore(vendorId: string, userId: string): Promise<number> {
    try {
      const vendor = await prisma.vendor.findFirst({
        where: { id: vendorId, userId },
        include: {
          expenses: true,
          invoices: true
        }
      });

      if (!vendor) return 50; // Default medium risk

      let riskScore = 50; // Start with medium risk
      let factors = 0;

      // Payment history factor
      const paymentHistory = await this.getPaymentHistory(vendorId, userId);
      const onTimePayments = paymentHistory.filter(p => p.status === 'paid' && (!p.daysLate || p.daysLate <= 0)).length;
      const totalPayments = paymentHistory.length;
      
      if (totalPayments > 0) {
        const onTimeRate = onTimePayments / totalPayments;
        riskScore += (1 - onTimeRate) * 30; // Higher risk for late payments
        factors++;
      }

      // Transaction frequency factor
      const transactionCount = vendor.expenses.length + vendor.invoices.length;
      if (transactionCount < 3) {
        riskScore += 10; // Higher risk for new vendors
        factors++;
      }

      // Business information factor
      if (!vendor.taxId) {
        riskScore += 5; // Slightly higher risk without tax ID
        factors++;
      }

      if (!vendor.email && !vendor.phone) {
        riskScore += 10; // Higher risk without contact info
        factors++;
      }

      // Industry factor (would be enriched from external data)
      const highRiskIndustries = ['construction', 'retail', 'restaurant'];
      if (vendor.industry && highRiskIndustries.includes(vendor.industry.toLowerCase())) {
        riskScore += 15;
        factors++;
      }

      return Math.min(Math.max(riskScore, 0), 100);

    } catch (error) {
      console.error('Error calculating vendor risk score:', error);
      return 50;
    }
  }

  /**
   * Get payment history for vendor
   */
  private async getPaymentHistory(vendorId: string, userId: string): Promise<PaymentHistory[]> {
    try {
      // This would typically query payment records
      // For now, return mock data
      return [];

    } catch (error) {
      console.error('Error getting payment history:', error);
      return [];
    }
  }

  /**
   * Calculate relationship score
   */
  private calculateRelationshipScore(
    totalSpent: number,
    transactionCount: number,
    averageTransactionValue: number,
    lastTransactionDate: Date
  ): number {
    let score = 0;

    // Transaction frequency (more transactions = higher score)
    score += Math.min(transactionCount * 5, 50);

    // Total spent (more spent = higher score)
    score += Math.min(totalSpent / 1000, 30);

    // Recency (more recent = higher score)
    const daysSinceLastTransaction = (Date.now() - lastTransactionDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastTransaction < 30) {
      score += 20;
    } else if (daysSinceLastTransaction < 90) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  /**
   * Get vendor recommendations
   */
  async getVendorRecommendations(userId: string): Promise<{
    consolidationOpportunities: string[];
    newVendorSuggestions: string[];
    paymentOptimization: string[];
  }> {
    try {
      const relationships = await this.analyzeVendorRelationships(userId);
      
      const consolidationOpportunities: string[] = [];
      const newVendorSuggestions: string[] = [];
      const paymentOptimization: string[] = [];

      // Find vendors with similar names (potential duplicates)
      const vendorNames = relationships.map(r => r.vendorId);
      // This would implement fuzzy matching for similar vendor names

      // Find high-spend vendors for consolidation
      const highSpendVendors = relationships
        .filter(r => r.totalSpent > 10000)
        .sort((a, b) => b.totalSpent - a.totalSpent);

      if (highSpendVendors.length > 0) {
        consolidationOpportunities.push(
          `Consider consolidating with ${highSpendVendors[0].vendorId} ($${highSpendVendors[0].totalSpent.toLocaleString()} spent)`
        );
      }

      // Payment optimization suggestions
      const overdueVendors = relationships.filter(r => r.paymentHistory.some(p => p.status === 'overdue'));
      if (overdueVendors.length > 0) {
        paymentOptimization.push(
          `Review payment terms with ${overdueVendors.length} vendors with overdue payments`
        );
      }

      return {
        consolidationOpportunities,
        newVendorSuggestions,
        paymentOptimization
      };

    } catch (error) {
      console.error('Error getting vendor recommendations:', error);
      return {
        consolidationOpportunities: [],
        newVendorSuggestions: [],
        paymentOptimization: []
      };
    }
  }

  /**
   * Store vendor enrichment data
   */
  async storeVendorEnrichment(
    vendorId: string, 
    enrichment: VendorEnrichment
  ): Promise<void> {
    try {
      await prisma.vendorEnrichment.upsert({
        where: { vendorId },
        update: {
          businessInfo: enrichment.businessInfo,
          financialInfo: enrichment.financialInfo,
          contactInfo: enrichment.contactInfo,
          location: enrichment.location,
          enrichedAt: new Date()
        },
        create: {
          vendorId,
          businessInfo: enrichment.businessInfo,
          financialInfo: enrichment.financialInfo,
          contactInfo: enrichment.contactInfo,
          location: enrichment.location,
          enrichedAt: new Date()
        }
      });

    } catch (error) {
      console.error('Error storing vendor enrichment:', error);
      throw new Error('Failed to store vendor enrichment');
    }
  }
}

export default VendorIntelligenceService;






