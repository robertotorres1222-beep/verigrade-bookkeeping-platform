import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';

const prisma = new PrismaClient();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CashFlowOptimizationRecommendation {
  id: string;
  userId: string;
  recommendationType: 'payment_timing' | 'expense_deferral' | 'expense_acceleration' | 'working_capital' | 'investment_timing';
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

export interface CashFlowScenario {
  name: string;
  description: string;
  assumptions: string[];
  projectedCashFlow: Array<{
    month: string;
    inflows: number;
    outflows: number;
    netCashFlow: number;
    cumulativeCash: number;
  }>;
  keyMetrics: {
    peakCashNeed: number;
    averageMonthlyCash: number;
    cashRunway: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
}

export interface WorkingCapitalAnalysis {
  currentAssets: number;
  currentLiabilities: number;
  workingCapital: number;
  workingCapitalRatio: number;
  cashConversionCycle: number;
  recommendations: string[];
}

export class CashFlowOptimizationService {
  /**
   * Generate cash flow optimization recommendations
   */
  async generateCashFlowOptimizationRecommendations(userId: string): Promise<CashFlowOptimizationRecommendation[]> {
    try {
      const recommendations: CashFlowOptimizationRecommendation[] = [];
      
      // Get current cash flow data
      const cashFlowData = await this.getCurrentCashFlowData(userId);
      
      // Payment timing optimization
      const paymentTimingRecommendations = await this.analyzePaymentTiming(userId, cashFlowData);
      recommendations.push(...paymentTimingRecommendations);
      
      // Expense deferral opportunities
      const expenseDeferralRecommendations = await this.analyzeExpenseDeferrals(userId, cashFlowData);
      recommendations.push(...expenseDeferralRecommendations);
      
      // Expense acceleration opportunities
      const expenseAccelerationRecommendations = await this.analyzeExpenseAccelerations(userId, cashFlowData);
      recommendations.push(...expenseAccelerationRecommendations);
      
      // Working capital optimization
      const workingCapitalRecommendations = await this.analyzeWorkingCapital(userId, cashFlowData);
      recommendations.push(...workingCapitalRecommendations);
      
      // Investment timing optimization
      const investmentTimingRecommendations = await this.analyzeInvestmentTiming(userId, cashFlowData);
      recommendations.push(...investmentTimingRecommendations);
      
      // Sort by potential impact
      return recommendations.sort((a, b) => b.potentialImpact - a.potentialImpact);

    } catch (error) {
      console.error('Error generating cash flow optimization recommendations:', error);
      return [];
    }
  }

  /**
   * Get current cash flow data
   */
  private async getCurrentCashFlowData(userId: string): Promise<any> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      // Get revenue data
      const revenue = await prisma.invoice.aggregate({
        where: {
          userId,
          status: 'PAID',
          paidAt: { gte: startOfMonth, lte: endOfMonth }
        },
        _sum: { total: true }
      });
      
      // Get expense data
      const expenses = await prisma.expense.aggregate({
        where: {
          userId,
          createdAt: { gte: startOfMonth, lte: endOfMonth }
        },
        _sum: { amount: true }
      });
      
      // Get pending invoices
      const pendingInvoices = await prisma.invoice.findMany({
        where: {
          userId,
          status: 'SENT'
        },
        select: {
          total: true,
          dueDate: true
        }
      });
      
      // Get upcoming expenses
      const upcomingExpenses = await prisma.expense.findMany({
        where: {
          userId,
          status: 'PENDING'
        },
        select: {
          amount: true,
          dueDate: true
        }
      });
      
      return {
        currentRevenue: revenue._sum.total || 0,
        currentExpenses: expenses._sum.amount || 0,
        netCashFlow: (revenue._sum.total || 0) - (expenses._sum.amount || 0),
        pendingInvoices,
        upcomingExpenses
      };

    } catch (error) {
      console.error('Error getting current cash flow data:', error);
      return {
        currentRevenue: 0,
        currentExpenses: 0,
        netCashFlow: 0,
        pendingInvoices: [],
        upcomingExpenses: []
      };
    }
  }

  /**
   * Analyze payment timing optimization
   */
  private async analyzePaymentTiming(userId: string, cashFlowData: any): Promise<CashFlowOptimizationRecommendation[]> {
    const recommendations: CashFlowOptimizationRecommendation[] = [];
    
    // Analyze pending invoices for payment timing optimization
    const totalPendingRevenue = cashFlowData.pendingInvoices.reduce((sum: number, invoice: any) => sum + invoice.total, 0);
    
    if (totalPendingRevenue > 0) {
      // Check for overdue invoices
      const overdueInvoices = cashFlowData.pendingInvoices.filter((invoice: any) => 
        invoice.dueDate && new Date(invoice.dueDate) < new Date()
      );
      
      if (overdueInvoices.length > 0) {
        const overdueAmount = overdueInvoices.reduce((sum: number, invoice: any) => sum + invoice.total, 0);
        
        recommendations.push({
          id: `payment_timing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          recommendationType: 'payment_timing',
          title: 'Accelerate overdue invoice collection',
          description: `Focus on collecting $${overdueAmount.toLocaleString()} in overdue invoices`,
          currentValue: overdueAmount,
          recommendedValue: overdueAmount,
          potentialImpact: overdueAmount * 0.1, // 10% improvement in collection
          confidence: 0.8,
          reasoning: [
            `${overdueInvoices.length} invoices are overdue`,
            `Total overdue amount: $${overdueAmount.toLocaleString()}`,
            `Immediate cash flow improvement opportunity`
          ],
          actionItems: [
            'Send payment reminders to overdue clients',
            'Offer payment plans for large overdue amounts',
            'Implement automated payment reminders',
            'Consider early payment discounts'
          ],
          priority: overdueAmount > 5000 ? 'high' : 'medium',
          estimatedImplementationTime: '1-2 weeks',
          createdAt: new Date()
        });
      }
      
      // Check for upcoming invoice due dates
      const upcomingInvoices = cashFlowData.pendingInvoices.filter((invoice: any) => 
        invoice.dueDate && new Date(invoice.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );
      
      if (upcomingInvoices.length > 0) {
        const upcomingAmount = upcomingInvoices.reduce((sum: number, invoice: any) => sum + invoice.total, 0);
        
        recommendations.push({
          id: `payment_timing_upcoming_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          recommendationType: 'payment_timing',
          title: 'Follow up on upcoming invoice payments',
          description: `Proactively follow up on $${upcomingAmount.toLocaleString()} in invoices due this week`,
          currentValue: upcomingAmount,
          recommendedValue: upcomingAmount,
          potentialImpact: upcomingAmount * 0.05, // 5% improvement
          confidence: 0.7,
          reasoning: [
            `${upcomingInvoices.length} invoices due within 7 days`,
            `Proactive follow-up improves collection rates`,
            `Better cash flow predictability`
          ],
          actionItems: [
            'Send payment reminders to clients with upcoming due dates',
            'Confirm payment arrangements',
            'Update payment tracking system',
            'Monitor payment confirmations'
          ],
          priority: 'medium',
          estimatedImplementationTime: '3-5 days',
          createdAt: new Date()
        });
      }
    }
    
    return recommendations;
  }

  /**
   * Analyze expense deferral opportunities
   */
  private async analyzeExpenseDeferrals(userId: string, cashFlowData: any): Promise<CashFlowOptimizationRecommendation[]> {
    const recommendations: CashFlowOptimizationRecommendation[] = [];
    
    // Analyze upcoming expenses for deferral opportunities
    const totalUpcomingExpenses = cashFlowData.upcomingExpenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);
    
    if (totalUpcomingExpenses > 0) {
      // Identify non-essential expenses that can be deferred
      const deferrableExpenses = cashFlowData.upcomingExpenses.filter((expense: any) => 
        expense.amount > 1000 && this.isDeferrableExpense(expense)
      );
      
      if (deferrableExpenses.length > 0) {
        const deferrableAmount = deferrableExpenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);
        
        recommendations.push({
          id: `expense_deferral_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          recommendationType: 'expense_deferral',
          title: 'Defer non-essential expenses',
          description: `Consider deferring $${deferrableAmount.toLocaleString()} in non-essential expenses`,
          currentValue: deferrableAmount,
          recommendedValue: 0,
          potentialImpact: deferrableAmount,
          confidence: 0.6,
          reasoning: [
            `${deferrableExpenses.length} expenses can be deferred`,
            `Total deferrable amount: $${deferrableAmount.toLocaleString()}`,
            `Improves short-term cash flow`
          ],
          actionItems: [
            'Review each expense for deferral feasibility',
            'Negotiate payment terms with vendors',
            'Prioritize essential vs non-essential expenses',
            'Update expense schedule'
          ],
          priority: deferrableAmount > 5000 ? 'high' : 'medium',
          estimatedImplementationTime: '1-2 weeks',
          createdAt: new Date()
        });
      }
    }
    
    return recommendations;
  }

  /**
   * Analyze expense acceleration opportunities
   */
  private async analyzeExpenseAccelerations(userId: string, cashFlowData: any): Promise<CashFlowOptimizationRecommendation[]> {
    const recommendations: CashFlowOptimizationRecommendation[] = [];
    
    // Look for expenses that can be accelerated for discounts
    const expenses = await prisma.expense.findMany({
      where: { userId },
      include: { vendor: true }
    });
    
    // Find vendors offering early payment discounts
    const earlyPaymentOpportunities = expenses.filter(expense => 
      expense.vendor?.paymentTerms?.includes('2/10') || 
      expense.vendor?.paymentTerms?.includes('discount')
    );
    
    if (earlyPaymentOpportunities.length > 0) {
      const totalOpportunity = earlyPaymentOpportunities.reduce((sum, expense) => sum + expense.amount, 0);
      const potentialSavings = totalOpportunity * 0.02; // 2% discount
      
      recommendations.push({
        id: `expense_acceleration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        recommendationType: 'expense_acceleration',
        title: 'Take advantage of early payment discounts',
        description: `Accelerate payments to save $${potentialSavings.toLocaleString()} with early payment discounts`,
        currentValue: totalOpportunity,
        recommendedValue: totalOpportunity * 0.98,
        potentialImpact: potentialSavings,
        confidence: 0.9,
        reasoning: [
          `${earlyPaymentOpportunities.length} vendors offer early payment discounts`,
          `Potential savings: $${potentialSavings.toLocaleString()}`,
          `Improves vendor relationships`
        ],
        actionItems: [
          'Review vendor payment terms',
          'Calculate early payment savings',
          'Process early payments',
          'Track discount savings'
        ],
        priority: potentialSavings > 500 ? 'high' : 'medium',
        estimatedImplementationTime: '1 week',
        createdAt: new Date()
      });
    }
    
    return recommendations;
  }

  /**
   * Analyze working capital optimization
   */
  private async analyzeWorkingCapital(userId: string, cashFlowData: any): Promise<CashFlowOptimizationRecommendation[]> {
    const recommendations: CashFlowOptimizationRecommendation[] = [];
    
    // Get working capital analysis
    const workingCapitalAnalysis = await this.getWorkingCapitalAnalysis(userId);
    
    if (workingCapitalAnalysis.workingCapital < 0) {
      recommendations.push({
        id: `working_capital_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        recommendationType: 'working_capital',
        title: 'Improve working capital position',
        description: `Current working capital is negative. Focus on improving cash position.`,
        currentValue: workingCapitalAnalysis.workingCapital,
        recommendedValue: 0,
        potentialImpact: Math.abs(workingCapitalAnalysis.workingCapital),
        confidence: 0.8,
        reasoning: [
          `Working capital: $${workingCapitalAnalysis.workingCapital.toLocaleString()}`,
          `Working capital ratio: ${workingCapitalAnalysis.workingCapitalRatio.toFixed(2)}`,
          `Cash conversion cycle: ${workingCapitalAnalysis.cashConversionCycle.toFixed(1)} days`
        ],
        actionItems: [
          'Accelerate accounts receivable collection',
          'Negotiate better payment terms with vendors',
          'Optimize inventory levels',
          'Consider short-term financing'
        ],
        priority: 'critical',
        estimatedImplementationTime: '2-4 weeks',
        createdAt: new Date()
      });
    }
    
    return recommendations;
  }

  /**
   * Analyze investment timing optimization
   */
  private async analyzeInvestmentTiming(userId: string, cashFlowData: any): Promise<CashFlowOptimizationRecommendation[]> {
    const recommendations: CashFlowOptimizationRecommendation[] = [];
    
    // Check for excess cash that could be invested
    const excessCash = cashFlowData.netCashFlow;
    
    if (excessCash > 10000) {
      recommendations.push({
        id: `investment_timing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        recommendationType: 'investment_timing',
        title: 'Consider short-term investments for excess cash',
        description: `Invest excess cash of $${excessCash.toLocaleString()} in short-term instruments`,
        currentValue: excessCash,
        recommendedValue: excessCash * 0.8, // Keep 20% as buffer
        potentialImpact: excessCash * 0.03, // 3% annual return
        confidence: 0.7,
        reasoning: [
          `Excess cash available: $${excessCash.toLocaleString()}`,
          `Short-term investment opportunity`,
          `Potential 3% annual return`
        ],
        actionItems: [
          'Research short-term investment options',
          'Consider money market accounts',
          'Evaluate risk vs return',
          'Set up investment account'
        ],
        priority: 'medium',
        estimatedImplementationTime: '2-3 weeks',
        createdAt: new Date()
      });
    }
    
    return recommendations;
  }

  /**
   * Check if expense can be deferred
   */
  private isDeferrableExpense(expense: any): boolean {
    // Simplified logic - in real implementation, this would use AI categorization
    const deferrableCategories = ['Marketing', 'Software', 'Office Supplies', 'Professional Services'];
    return deferrableCategories.includes(expense.category);
  }

  /**
   * Get working capital analysis
   */
  private async getWorkingCapitalAnalysis(userId: string): Promise<WorkingCapitalAnalysis> {
    try {
      // Simplified working capital calculation
      const currentAssets = 50000; // Mock current assets
      const currentLiabilities = 30000; // Mock current liabilities
      const workingCapital = currentAssets - currentLiabilities;
      const workingCapitalRatio = currentAssets / currentLiabilities;
      const cashConversionCycle = 45; // Mock cash conversion cycle
      
      const recommendations = [
        'Accelerate accounts receivable collection',
        'Optimize inventory turnover',
        'Negotiate better payment terms'
      ];
      
      return {
        currentAssets,
        currentLiabilities,
        workingCapital,
        workingCapitalRatio,
        cashConversionCycle,
        recommendations
      };

    } catch (error) {
      console.error('Error getting working capital analysis:', error);
      return {
        currentAssets: 0,
        currentLiabilities: 0,
        workingCapital: 0,
        workingCapitalRatio: 0,
        cashConversionCycle: 0,
        recommendations: []
      };
    }
  }

  /**
   * Generate cash flow scenarios
   */
  async generateCashFlowScenarios(userId: string): Promise<CashFlowScenario[]> {
    try {
      const scenarios: CashFlowScenario[] = [];
      
      // Optimistic scenario
      scenarios.push({
        name: 'Optimistic Growth',
        description: 'Best-case scenario with strong growth',
        assumptions: [
          '20% revenue growth',
          '10% expense reduction',
          'Improved payment terms'
        ],
        projectedCashFlow: this.generateProjectedCashFlow(1.2, 0.9),
        keyMetrics: {
          peakCashNeed: 15000,
          averageMonthlyCash: 25000,
          cashRunway: 18,
          riskLevel: 'low'
        }
      });
      
      // Conservative scenario
      scenarios.push({
        name: 'Conservative Growth',
        description: 'Moderate growth with current trends',
        assumptions: [
          '5% revenue growth',
          'Current expense levels',
          'Stable payment terms'
        ],
        projectedCashFlow: this.generateProjectedCashFlow(1.05, 1.0),
        keyMetrics: {
          peakCashNeed: 25000,
          averageMonthlyCash: 15000,
          cashRunway: 12,
          riskLevel: 'medium'
        }
      });
      
      // Pessimistic scenario
      scenarios.push({
        name: 'Economic Downturn',
        description: 'Worst-case scenario with challenges',
        assumptions: [
          '-10% revenue decline',
          '15% expense increase',
          'Extended payment terms'
        ],
        projectedCashFlow: this.generateProjectedCashFlow(0.9, 1.15),
        keyMetrics: {
          peakCashNeed: 50000,
          averageMonthlyCash: 5000,
          cashRunway: 6,
          riskLevel: 'high'
        }
      });
      
      return scenarios;

    } catch (error) {
      console.error('Error generating cash flow scenarios:', error);
      return [];
    }
  }

  /**
   * Generate projected cash flow data
   */
  private generateProjectedCashFlow(revenueMultiplier: number, expenseMultiplier: number): Array<{
    month: string;
    inflows: number;
    outflows: number;
    netCashFlow: number;
    cumulativeCash: number;
  }> {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const baseInflows = 50000;
    const baseOutflows = 40000;
    let cumulativeCash = 100000; // Starting cash
    
    return months.map((month, index) => {
      const inflows = baseInflows * revenueMultiplier * (1 + index * 0.02); // 2% monthly growth
      const outflows = baseOutflows * expenseMultiplier * (1 + index * 0.01); // 1% monthly growth
      const netCashFlow = inflows - outflows;
      cumulativeCash += netCashFlow;
      
      return {
        month,
        inflows,
        outflows,
        netCashFlow,
        cumulativeCash
      };
    });
  }

  /**
   * Get cash flow optimization dashboard
   */
  async getCashFlowOptimizationDashboard(userId: string): Promise<{
    recommendations: CashFlowOptimizationRecommendation[];
    scenarios: CashFlowScenario[];
    workingCapital: WorkingCapitalAnalysis;
    insights: {
      currentCashFlow: number;
      projectedCashFlow: number;
      optimizationPotential: number;
      riskLevel: string;
    };
  }> {
    try {
      const recommendations = await this.generateCashFlowOptimizationRecommendations(userId);
      const scenarios = await this.generateCashFlowScenarios(userId);
      const workingCapital = await this.getWorkingCapitalAnalysis(userId);
      
      const cashFlowData = await this.getCurrentCashFlowData(userId);
      const optimizationPotential = recommendations.reduce((sum, r) => sum + r.potentialImpact, 0);
      
      const insights = {
        currentCashFlow: cashFlowData.netCashFlow,
        projectedCashFlow: scenarios[1]?.keyMetrics.averageMonthlyCash || 0,
        optimizationPotential,
        riskLevel: workingCapital.workingCapital < 0 ? 'high' : 'medium'
      };
      
      return {
        recommendations,
        scenarios,
        workingCapital,
        insights
      };

    } catch (error) {
      console.error('Error getting cash flow optimization dashboard:', error);
      return {
        recommendations: [],
        scenarios: [],
        workingCapital: {
          currentAssets: 0,
          currentLiabilities: 0,
          workingCapital: 0,
          workingCapitalRatio: 0,
          cashConversionCycle: 0,
          recommendations: []
        },
        insights: {
          currentCashFlow: 0,
          projectedCashFlow: 0,
          optimizationPotential: 0,
          riskLevel: 'medium'
        }
      };
    }
  }
}

export default CashFlowOptimizationService;










