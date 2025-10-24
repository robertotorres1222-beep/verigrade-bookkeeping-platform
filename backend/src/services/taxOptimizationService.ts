import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';

const prisma = new PrismaClient();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TaxOptimizationRecommendation {
  id: string;
  userId: string;
  recommendationType: 'timing' | 'credits' | 'deductions' | 'entity_structure' | 'estimated_tax';
  title: string;
  description: string;
  currentTaxLiability: number;
  optimizedTaxLiability: number;
  potentialSavings: number;
  confidence: number;
  reasoning: string[];
  actionItems: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  deadline: Date;
  createdAt: Date;
}

export interface TaxCreditOpportunity {
  creditName: string;
  description: string;
  potentialValue: number;
  eligibility: string[];
  requirements: string[];
  deadline: Date;
  confidence: number;
}

export interface EstimatedTaxProjection {
  quarter: string;
  estimatedIncome: number;
  estimatedTax: number;
  paymentsToDate: number;
  balanceDue: number;
  recommendedPayment: number;
  dueDate: Date;
}

export class TaxOptimizationService {
  /**
   * Generate tax optimization recommendations
   */
  async generateTaxOptimizationRecommendations(userId: string): Promise<TaxOptimizationRecommendation[]> {
    try {
      const recommendations: TaxOptimizationRecommendation[] = [];
      
      // Get financial data
      const financialData = await this.getFinancialData(userId);
      
      // Revenue/expense timing optimization
      const timingRecommendations = await this.analyzeRevenueExpenseTiming(userId, financialData);
      recommendations.push(...timingRecommendations);
      
      // Tax credit opportunities
      const creditRecommendations = await this.identifyTaxCreditOpportunities(userId, financialData);
      recommendations.push(...creditRecommendations);
      
      // Deduction optimization
      const deductionRecommendations = await this.optimizeDeductions(userId, financialData);
      recommendations.push(...deductionRecommendations);
      
      // Entity structure optimization
      const entityRecommendations = await this.analyzeEntityStructure(userId, financialData);
      recommendations.push(...entityRecommendations);
      
      // Estimated tax optimization
      const estimatedTaxRecommendations = await this.optimizeEstimatedTaxes(userId, financialData);
      recommendations.push(...estimatedTaxRecommendations);
      
      // Sort by potential savings
      return recommendations.sort((a, b) => b.potentialSavings - a.potentialSavings);

    } catch (error) {
      console.error('Error generating tax optimization recommendations:', error);
      return [];
    }
  }

  /**
   * Get financial data for tax analysis
   */
  private async getFinancialData(userId: string): Promise<any> {
    try {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      
      // Get revenue data
      const revenue = await prisma.invoice.aggregate({
        where: {
          userId,
          status: 'PAID',
          paidAt: { gte: startOfYear }
        },
        _sum: { total: true }
      });
      
      // Get expense data
      const expenses = await prisma.expense.aggregate({
        where: {
          userId,
          createdAt: { gte: startOfYear }
        },
        _sum: { amount: true }
      });
      
      // Get business type
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { businessType: true }
      });
      
      return {
        annualRevenue: revenue._sum.total || 0,
        annualExpenses: expenses._sum.amount || 0,
        netIncome: (revenue._sum.total || 0) - (expenses._sum.amount || 0),
        businessType: user?.businessType || 'LLC',
        currentYear: now.getFullYear()
      };

    } catch (error) {
      console.error('Error getting financial data:', error);
      return {
        annualRevenue: 0,
        annualExpenses: 0,
        netIncome: 0,
        businessType: 'LLC',
        currentYear: new Date().getFullYear()
      };
    }
  }

  /**
   * Analyze revenue/expense timing for tax optimization
   */
  private async analyzeRevenueExpenseTiming(userId: string, financialData: any): Promise<TaxOptimizationRecommendation[]> {
    const recommendations: TaxOptimizationRecommendation[] = [];
    
    // Defer revenue to next year if beneficial
    if (financialData.netIncome > 100000) {
      const deferredRevenue = financialData.annualRevenue * 0.1; // 10% of revenue
      const taxSavings = deferredRevenue * 0.25; // 25% tax rate
      
      recommendations.push({
        id: `timing_defer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        recommendationType: 'timing',
        title: 'Defer revenue to next year',
        description: `Consider deferring $${deferredRevenue.toLocaleString()} in revenue to reduce current year taxes`,
        currentTaxLiability: financialData.netIncome * 0.25,
        optimizedTaxLiability: (financialData.netIncome - deferredRevenue) * 0.25,
        potentialSavings: taxSavings,
        confidence: 0.8,
        reasoning: [
          `Current income: $${financialData.netIncome.toLocaleString()}`,
          `Deferring revenue reduces current year tax liability`,
          `Potential savings: $${taxSavings.toLocaleString()}`
        ],
        actionItems: [
          'Review contracts for revenue recognition timing',
          'Consider delaying invoice sending until January',
          'Coordinate with clients on payment timing',
          'Update revenue recognition policies'
        ],
        priority: taxSavings > 5000 ? 'high' : 'medium',
        deadline: new Date(financialData.currentYear, 11, 31), // End of year
        createdAt: new Date()
      });
    }
    
    // Accelerate expenses to current year
    if (financialData.netIncome > 50000) {
      const acceleratedExpenses = 10000; // $10,000 in expenses
      const taxSavings = acceleratedExpenses * 0.25; // 25% tax rate
      
      recommendations.push({
        id: `timing_accelerate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        recommendationType: 'timing',
        title: 'Accelerate deductible expenses',
        description: `Accelerate $${acceleratedExpenses.toLocaleString()} in deductible expenses to current year`,
        currentTaxLiability: financialData.netIncome * 0.25,
        optimizedTaxLiability: (financialData.netIncome - acceleratedExpenses) * 0.25,
        potentialSavings: taxSavings,
        confidence: 0.9,
        reasoning: [
          `Accelerating expenses reduces current year taxable income`,
          `Equipment purchases, software subscriptions, etc.`,
          `Potential savings: $${taxSavings.toLocaleString()}`
        ],
        actionItems: [
          'Purchase needed equipment before year-end',
          'Pay annual software subscriptions',
          'Prepay business insurance',
          'Consider equipment leasing'
        ],
        priority: 'high',
        deadline: new Date(financialData.currentYear, 11, 31),
        createdAt: new Date()
      });
    }
    
    return recommendations;
  }

  /**
   * Identify tax credit opportunities
   */
  private async identifyTaxCreditOpportunities(userId: string, financialData: any): Promise<TaxOptimizationRecommendation[]> {
    const recommendations: TaxOptimizationRecommendation[] = [];
    
    // R&D Tax Credit
    if (financialData.businessType === 'Corporation' && financialData.annualRevenue > 100000) {
      const rdcCredit = financialData.annualRevenue * 0.06; // 6% of revenue
      
      recommendations.push({
        id: `credit_rd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        recommendationType: 'credits',
        title: 'Research & Development Tax Credit',
        description: `Qualify for R&D tax credit worth $${rdcCredit.toLocaleString()}`,
        currentTaxLiability: financialData.netIncome * 0.25,
        optimizedTaxLiability: (financialData.netIncome * 0.25) - rdcCredit,
        potentialSavings: rdcCredit,
        confidence: 0.7,
        reasoning: [
          'Corporation with significant revenue',
          'R&D activities may qualify for tax credit',
          'Credit can offset tax liability'
        ],
        actionItems: [
          'Document R&D activities and expenses',
          'Calculate qualified research expenses',
          'File Form 6765 for R&D credit',
          'Consider hiring R&D credit specialist'
        ],
        priority: rdcCredit > 10000 ? 'high' : 'medium',
        deadline: new Date(financialData.currentYear + 1, 3, 15), // Tax filing deadline
        createdAt: new Date()
      });
    }
    
    // Work Opportunity Tax Credit
    const wotcCredit = 5000; // $5,000 potential credit
    
    recommendations.push({
      id: `credit_wotc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      recommendationType: 'credits',
      title: 'Work Opportunity Tax Credit',
      description: `Hire qualified employees for WOTC worth up to $${wotcCredit.toLocaleString()}`,
      currentTaxLiability: financialData.netIncome * 0.25,
      optimizedTaxLiability: (financialData.netIncome * 0.25) - wotcCredit,
      potentialSavings: wotcCredit,
      confidence: 0.6,
      reasoning: [
        'Hiring qualified employees can generate tax credits',
        'WOTC available for certain target groups',
        'Credit can be carried forward if not used'
      ],
      actionItems: [
        'Identify qualified target groups for hiring',
        'Screen potential employees for WOTC eligibility',
        'Complete pre-screening questionnaire',
        'File Form 8850 for WOTC'
      ],
      priority: 'medium',
      deadline: new Date(financialData.currentYear + 1, 3, 15),
      createdAt: new Date()
    });
    
    return recommendations;
  }

  /**
   * Optimize deductions
   */
  private async optimizeDeductions(userId: string, financialData: any): Promise<TaxOptimizationRecommendation[]> {
    const recommendations: TaxOptimizationRecommendation[] = [];
    
    // Home office deduction
    const homeOfficeDeduction = 5000; // $5,000 potential deduction
    const taxSavings = homeOfficeDeduction * 0.25; // 25% tax rate
    
    recommendations.push({
      id: `deduction_home_office_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      recommendationType: 'deductions',
      title: 'Home Office Deduction',
      description: `Claim home office deduction worth $${homeOfficeDeduction.toLocaleString()}`,
      currentTaxLiability: financialData.netIncome * 0.25,
      optimizedTaxLiability: (financialData.netIncome - homeOfficeDeduction) * 0.25,
      potentialSavings: taxSavings,
      confidence: 0.8,
      reasoning: [
        'Home office used exclusively for business',
        'Simplified method: $5 per square foot',
        'Regular method: actual expenses'
      ],
      actionItems: [
        'Measure home office square footage',
        'Calculate percentage of home used for business',
        'Gather utility bills and home expenses',
        'Choose between simplified and regular method'
      ],
      priority: 'medium',
      deadline: new Date(financialData.currentYear + 1, 3, 15),
      createdAt: new Date()
    });
    
    // Vehicle deduction
    const vehicleDeduction = 8000; // $8,000 potential deduction
    const vehicleTaxSavings = vehicleDeduction * 0.25;
    
    recommendations.push({
      id: `deduction_vehicle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      recommendationType: 'deductions',
      title: 'Business Vehicle Deduction',
      description: `Maximize vehicle deduction worth $${vehicleDeduction.toLocaleString()}`,
      currentTaxLiability: financialData.netIncome * 0.25,
      optimizedTaxLiability: (financialData.netIncome - vehicleDeduction) * 0.25,
      potentialSavings: vehicleTaxSavings,
      confidence: 0.7,
      reasoning: [
        'Business use of vehicle for work',
        'Standard mileage rate or actual expenses',
        'Keep detailed mileage logs'
      ],
      actionItems: [
        'Track all business mileage',
        'Keep receipts for vehicle expenses',
        'Calculate business use percentage',
        'Choose between standard mileage and actual expenses'
      ],
      priority: 'medium',
      deadline: new Date(financialData.currentYear + 1, 3, 15),
      createdAt: new Date()
    });
    
    return recommendations;
  }

  /**
   * Analyze entity structure optimization
   */
  private async analyzeEntityStructure(userId: string, financialData: any): Promise<TaxOptimizationRecommendation[]> {
    const recommendations: TaxOptimizationRecommendation[] = [];
    
    // S-Corporation election
    if (financialData.businessType === 'LLC' && financialData.netIncome > 80000) {
      const sCorpSavings = financialData.netIncome * 0.15; // 15% savings on self-employment tax
      
      recommendations.push({
        id: `entity_s_corp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        recommendationType: 'entity_structure',
        title: 'S-Corporation Election',
        description: `Elect S-Corporation status to save $${sCorpSavings.toLocaleString()} in self-employment taxes`,
        currentTaxLiability: financialData.netIncome * 0.25,
        optimizedTaxLiability: (financialData.netIncome * 0.25) - sCorpSavings,
        potentialSavings: sCorpSavings,
        confidence: 0.8,
        reasoning: [
          'S-Corp election reduces self-employment taxes',
          'Reasonable salary vs. distributions',
          'Must file by March 15th for current year'
        ],
        actionItems: [
          'File Form 2553 for S-Corporation election',
          'Set up payroll for reasonable salary',
          'Separate salary from distributions',
          'Maintain corporate formalities'
        ],
        priority: sCorpSavings > 10000 ? 'high' : 'medium',
        deadline: new Date(financialData.currentYear + 1, 2, 15), // March 15th
        createdAt: new Date()
      });
    }
    
    return recommendations;
  }

  /**
   * Optimize estimated taxes
   */
  private async optimizeEstimatedTaxes(userId: string, financialData: any): Promise<TaxOptimizationRecommendation[]> {
    const recommendations: TaxOptimizationRecommendation[] = [];
    
    // Calculate estimated tax projections
    const estimatedTaxProjections = await this.calculateEstimatedTaxProjections(financialData);
    
    for (const projection of estimatedTaxProjections) {
      if (projection.balanceDue > 1000) {
        recommendations.push({
          id: `estimated_tax_${projection.quarter}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          recommendationType: 'estimated_tax',
          title: `Q${projection.quarter} Estimated Tax Payment`,
          description: `Make estimated tax payment of $${projection.recommendedPayment.toLocaleString()} by ${projection.dueDate.toLocaleDateString()}`,
          currentTaxLiability: projection.estimatedTax,
          optimizedTaxLiability: projection.estimatedTax,
          potentialSavings: 0, // No savings, just compliance
          confidence: 0.9,
          reasoning: [
            `Estimated tax due: $${projection.balanceDue.toLocaleString()}`,
            `Avoid penalties and interest`,
            `Maintain good standing with IRS`
          ],
          actionItems: [
            'Calculate quarterly estimated tax',
            'Make payment by due date',
            'Consider annualized method if income varies',
            'Track payments for year-end reconciliation'
          ],
          priority: 'high',
          deadline: projection.dueDate,
          createdAt: new Date()
        });
      }
    }
    
    return recommendations;
  }

  /**
   * Calculate estimated tax projections
   */
  private async calculateEstimatedTaxProjections(financialData: any): Promise<EstimatedTaxProjection[]> {
    const projections: EstimatedTaxProjection[] = [];
    const quarterlyIncome = financialData.annualRevenue / 4;
    const quarterlyTax = quarterlyIncome * 0.25; // 25% tax rate
    
    const quarters = [
      { quarter: '1', dueDate: new Date(financialData.currentYear, 3, 15) },
      { quarter: '2', dueDate: new Date(financialData.currentYear, 5, 15) },
      { quarter: '3', dueDate: new Date(financialData.currentYear, 8, 15) },
      { quarter: '4', dueDate: new Date(financialData.currentYear + 1, 0, 15) }
    ];
    
    for (const q of quarters) {
      const estimatedIncome = quarterlyIncome;
      const estimatedTax = quarterlyTax;
      const paymentsToDate = 0; // Mock - would be actual payments
      const balanceDue = Math.max(0, estimatedTax - paymentsToDate);
      const recommendedPayment = balanceDue;
      
      projections.push({
        quarter: q.quarter,
        estimatedIncome,
        estimatedTax,
        paymentsToDate,
        balanceDue,
        recommendedPayment,
        dueDate: q.dueDate
      });
    }
    
    return projections;
  }

  /**
   * Get tax optimization dashboard
   */
  async getTaxOptimizationDashboard(userId: string): Promise<{
    recommendations: TaxOptimizationRecommendation[];
    projections: EstimatedTaxProjection[];
    insights: {
      currentYearTaxLiability: number;
      potentialSavings: number;
      estimatedTaxDue: number;
      optimizationScore: number;
    };
  }> {
    try {
      const recommendations = await this.generateTaxOptimizationRecommendations(userId);
      const financialData = await this.getFinancialData(userId);
      const projections = await this.calculateEstimatedTaxProjections(financialData);
      
      const currentYearTaxLiability = financialData.netIncome * 0.25;
      const potentialSavings = recommendations.reduce((sum, r) => sum + r.potentialSavings, 0);
      const estimatedTaxDue = projections.reduce((sum, p) => sum + p.balanceDue, 0);
      const optimizationScore = Math.min((potentialSavings / currentYearTaxLiability) * 100, 100);
      
      const insights = {
        currentYearTaxLiability,
        potentialSavings,
        estimatedTaxDue,
        optimizationScore
      };
      
      return {
        recommendations,
        projections,
        insights
      };

    } catch (error) {
      console.error('Error getting tax optimization dashboard:', error);
      return {
        recommendations: [],
        projections: [],
        insights: {
          currentYearTaxLiability: 0,
          potentialSavings: 0,
          estimatedTaxDue: 0,
          optimizationScore: 0
        }
      };
    }
  }
}

export default TaxOptimizationService;







