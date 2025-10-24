import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';

const prisma = new PrismaClient();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface InvestmentRecommendation {
  id: string;
  userId: string;
  recommendationType: 'cash_reserves' | 'short_term' | 'medium_term' | 'long_term' | 'risk_management';
  title: string;
  description: string;
  currentAllocation: number;
  recommendedAllocation: number;
  expectedReturn: number;
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
  reasoning: string[];
  actionItems: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  implementationTime: string;
  createdAt: Date;
}

export interface CashFlowAnalysis {
  currentCash: number;
  monthlyInflows: number;
  monthlyOutflows: number;
  netCashFlow: number;
  cashRunway: number;
  recommendedReserves: number;
  excessCash: number;
}

export interface InvestmentPortfolio {
  cashReserves: number;
  shortTermInvestments: number;
  mediumTermInvestments: number;
  longTermInvestments: number;
  totalValue: number;
  expectedReturn: number;
  riskScore: number;
}

export interface RiskAssessment {
  businessRisk: number;
  marketRisk: number;
  liquidityRisk: number;
  overallRisk: number;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  recommendations: string[];
}

export class InvestmentAdvisorService {
  /**
   * Generate investment recommendations
   */
  async generateInvestmentRecommendations(userId: string): Promise<InvestmentRecommendation[]> {
    try {
      const recommendations: InvestmentRecommendation[] = [];
      
      // Get cash flow analysis
      const cashFlowAnalysis = await this.analyzeCashFlow(userId);
      
      // Cash reserve optimization
      const cashReserveRecommendations = await this.analyzeCashReserves(userId, cashFlowAnalysis);
      recommendations.push(...cashReserveRecommendations);
      
      // Short-term investment opportunities
      const shortTermRecommendations = await this.analyzeShortTermInvestments(userId, cashFlowAnalysis);
      recommendations.push(...shortTermRecommendations);
      
      // Medium-term investment opportunities
      const mediumTermRecommendations = await this.analyzeMediumTermInvestments(userId, cashFlowAnalysis);
      recommendations.push(...mediumTermRecommendations);
      
      // Long-term investment opportunities
      const longTermRecommendations = await this.analyzeLongTermInvestments(userId, cashFlowAnalysis);
      recommendations.push(...longTermRecommendations);
      
      // Risk management
      const riskManagementRecommendations = await this.analyzeRiskManagement(userId, cashFlowAnalysis);
      recommendations.push(...riskManagementRecommendations);
      
      // Sort by expected return
      return recommendations.sort((a, b) => b.expectedReturn - a.expectedReturn);

    } catch (error) {
      console.error('Error generating investment recommendations:', error);
      return [];
    }
  }

  /**
   * Analyze cash flow for investment opportunities
   */
  private async analyzeCashFlow(userId: string): Promise<CashFlowAnalysis> {
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
      
      const monthlyInflows = revenue._sum.total || 0;
      const monthlyOutflows = expenses._sum.amount || 0;
      const netCashFlow = monthlyInflows - monthlyOutflows;
      
      // Mock current cash (in real implementation, this would come from bank account data)
      const currentCash = 100000; // $100,000 mock cash
      const recommendedReserves = monthlyOutflows * 6; // 6 months of expenses
      const excessCash = Math.max(0, currentCash - recommendedReserves);
      const cashRunway = monthlyOutflows > 0 ? currentCash / monthlyOutflows : 0;
      
      return {
        currentCash,
        monthlyInflows,
        monthlyOutflows,
        netCashFlow,
        cashRunway,
        recommendedReserves,
        excessCash
      };

    } catch (error) {
      console.error('Error analyzing cash flow:', error);
      return {
        currentCash: 0,
        monthlyInflows: 0,
        monthlyOutflows: 0,
        netCashFlow: 0,
        cashRunway: 0,
        recommendedReserves: 0,
        excessCash: 0
      };
    }
  }

  /**
   * Analyze cash reserves
   */
  private async analyzeCashReserves(userId: string, cashFlow: CashFlowAnalysis): Promise<InvestmentRecommendation[]> {
    const recommendations: InvestmentRecommendation[] = [];
    
    // Insufficient cash reserves
    if (cashFlow.currentCash < cashFlow.recommendedReserves) {
      const shortfall = cashFlow.recommendedReserves - cashFlow.currentCash;
      
      recommendations.push({
        id: `cash_reserves_insufficient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        recommendationType: 'cash_reserves',
        title: 'Build emergency cash reserves',
        description: `Increase cash reserves by $${shortfall.toLocaleString()} to reach recommended 6-month reserve`,
        currentAllocation: cashFlow.currentCash,
        recommendedAllocation: cashFlow.recommendedReserves,
        expectedReturn: 0, // No return on cash reserves
        riskLevel: 'low',
        confidence: 0.9,
        reasoning: [
          `Current reserves: $${cashFlow.currentCash.toLocaleString()}`,
          `Recommended reserves: $${cashFlow.recommendedReserves.toLocaleString()}`,
          `Shortfall: $${shortfall.toLocaleString()}`,
          'Emergency reserves provide financial security'
        ],
        actionItems: [
          'Reduce non-essential expenses',
          'Accelerate accounts receivable collection',
          'Consider short-term financing',
          'Build reserves gradually over 6-12 months'
        ],
        priority: 'critical',
        implementationTime: '6-12 months',
        createdAt: new Date()
      });
    }
    
    // Excess cash reserves
    if (cashFlow.excessCash > 50000) {
      const investableAmount = cashFlow.excessCash * 0.5; // Invest 50% of excess
      
      recommendations.push({
        id: `cash_reserves_excess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        recommendationType: 'cash_reserves',
        title: 'Invest excess cash reserves',
        description: `Invest $${investableAmount.toLocaleString()} of excess cash in short-term investments`,
        currentAllocation: cashFlow.currentCash,
        recommendedAllocation: cashFlow.currentCash - investableAmount,
        expectedReturn: 0.03, // 3% annual return
        riskLevel: 'low',
        confidence: 0.8,
        reasoning: [
          `Excess cash: $${cashFlow.excessCash.toLocaleString()}`,
          'Opportunity cost of holding excess cash',
          'Short-term investments provide better returns'
        ],
        actionItems: [
          'Research short-term investment options',
          'Consider money market accounts',
          'Evaluate CD rates',
          'Set up automatic transfers'
        ],
        priority: 'medium',
        implementationTime: '1-2 months',
        createdAt: new Date()
      });
    }
    
    return recommendations;
  }

  /**
   * Analyze short-term investment opportunities
   */
  private async analyzeShortTermInvestments(userId: string, cashFlow: CashFlowAnalysis): Promise<InvestmentRecommendation[]> {
    const recommendations: InvestmentRecommendation[] = [];
    
    if (cashFlow.excessCash > 25000) {
      const shortTermAmount = Math.min(cashFlow.excessCash * 0.3, 50000); // Up to $50k or 30% of excess
      
      recommendations.push({
        id: `short_term_money_market_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        recommendationType: 'short_term',
        title: 'Money market account',
        description: `Invest $${shortTermAmount.toLocaleString()} in money market account for 3-6 month returns`,
        currentAllocation: 0,
        recommendedAllocation: shortTermAmount,
        expectedReturn: 0.04, // 4% annual return
        riskLevel: 'low',
        confidence: 0.9,
        reasoning: [
          'High liquidity with competitive returns',
          'FDIC insured up to $250,000',
          'Easy access to funds when needed'
        ],
        actionItems: [
          'Research money market account options',
          'Compare rates and fees',
          'Open account with reputable institution',
          'Set up automatic transfers'
        ],
        priority: 'medium',
        implementationTime: '2-4 weeks',
        createdAt: new Date()
      });
      
      recommendations.push({
        id: `short_term_cd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        recommendationType: 'short_term',
        title: 'Certificate of Deposit (CD)',
        description: `Invest $${shortTermAmount.toLocaleString()} in 6-month CD for higher returns`,
        currentAllocation: 0,
        recommendedAllocation: shortTermAmount,
        expectedReturn: 0.05, // 5% annual return
        riskLevel: 'low',
        confidence: 0.8,
        reasoning: [
          'Higher returns than money market',
          'FDIC insured',
          'Fixed term commitment'
        ],
        actionItems: [
          'Research CD rates and terms',
          'Compare different institutions',
          'Open CD account',
          'Set up maturity date reminders'
        ],
        priority: 'medium',
        implementationTime: '2-4 weeks',
        createdAt: new Date()
      });
    }
    
    return recommendations;
  }

  /**
   * Analyze medium-term investment opportunities
   */
  private async analyzeMediumTermInvestments(userId: string, cashFlow: CashFlowAnalysis): Promise<InvestmentRecommendation[]> {
    const recommendations: InvestmentRecommendation[] = [];
    
    if (cashFlow.excessCash > 100000) {
      const mediumTermAmount = Math.min(cashFlow.excessCash * 0.4, 100000); // Up to $100k or 40% of excess
      
      recommendations.push({
        id: `medium_term_bonds_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        recommendationType: 'medium_term',
        title: 'Corporate bond fund',
        description: `Invest $${mediumTermAmount.toLocaleString()} in corporate bond fund for 1-3 year returns`,
        currentAllocation: 0,
        recommendedAllocation: mediumTermAmount,
        expectedReturn: 0.06, // 6% annual return
        riskLevel: 'medium',
        confidence: 0.7,
        reasoning: [
          'Higher returns than short-term investments',
          'Diversified bond portfolio',
          'Moderate risk level'
        ],
        actionItems: [
          'Research bond fund options',
          'Compare expense ratios',
          'Open investment account',
          'Set up automatic investments'
        ],
        priority: 'medium',
        implementationTime: '1-2 months',
        createdAt: new Date()
      });
      
      recommendations.push({
        id: `medium_term_etf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        recommendationType: 'medium_term',
        title: 'Balanced ETF portfolio',
        description: `Invest $${mediumTermAmount.toLocaleString()} in balanced ETF for diversified growth`,
        currentAllocation: 0,
        recommendedAllocation: mediumTermAmount,
        expectedReturn: 0.08, // 8% annual return
        riskLevel: 'medium',
        confidence: 0.8,
        reasoning: [
          'Diversified stock and bond exposure',
          'Lower fees than mutual funds',
          'Easy to buy and sell'
        ],
        actionItems: [
          'Research balanced ETF options',
          'Compare expense ratios and performance',
          'Open brokerage account',
          'Set up dollar-cost averaging'
        ],
        priority: 'medium',
        implementationTime: '1-2 months',
        createdAt: new Date()
      });
    }
    
    return recommendations;
  }

  /**
   * Analyze long-term investment opportunities
   */
  private async analyzeLongTermInvestments(userId: string, cashFlow: CashFlowAnalysis): Promise<InvestmentRecommendation[]> {
    const recommendations: InvestmentRecommendation[] = [];
    
    if (cashFlow.excessCash > 200000) {
      const longTermAmount = Math.min(cashFlow.excessCash * 0.3, 150000); // Up to $150k or 30% of excess
      
      recommendations.push({
        id: `long_term_stock_market_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        recommendationType: 'long_term',
        title: 'Stock market index fund',
        description: `Invest $${longTermAmount.toLocaleString()} in S&P 500 index fund for long-term growth`,
        currentAllocation: 0,
        recommendedAllocation: longTermAmount,
        expectedReturn: 0.10, // 10% annual return
        riskLevel: 'high',
        confidence: 0.8,
        reasoning: [
          'Historical long-term returns of 10%+',
          'Diversified exposure to large companies',
          'Low expense ratios'
        ],
        actionItems: [
          'Research index fund options',
          'Compare expense ratios',
          'Open investment account',
          'Set up long-term investment strategy'
        ],
        priority: 'medium',
        implementationTime: '1-2 months',
        createdAt: new Date()
      });
      
      recommendations.push({
        id: `long_term_real_estate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        recommendationType: 'long_term',
        title: 'Real estate investment trust (REIT)',
        description: `Invest $${longTermAmount.toLocaleString()} in REIT for real estate exposure`,
        currentAllocation: 0,
        recommendedAllocation: longTermAmount,
        expectedReturn: 0.09, // 9% annual return
        riskLevel: 'medium',
        confidence: 0.7,
        reasoning: [
          'Diversification into real estate',
          'Regular dividend income',
          'Professional management'
        ],
        actionItems: [
          'Research REIT options',
          'Compare dividend yields',
          'Open investment account',
          'Set up dividend reinvestment'
        ],
        priority: 'low',
        implementationTime: '2-3 months',
        createdAt: new Date()
      });
    }
    
    return recommendations;
  }

  /**
   * Analyze risk management
   */
  private async analyzeRiskManagement(userId: string, cashFlow: CashFlowAnalysis): Promise<InvestmentRecommendation[]> {
    const recommendations: InvestmentRecommendation[] = [];
    
    // Risk assessment
    const riskAssessment = await this.assessRisk(userId, cashFlow);
    
    if (riskAssessment.overallRisk > 70) {
      recommendations.push({
        id: `risk_management_high_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        recommendationType: 'risk_management',
        title: 'High risk detected - implement risk management',
        description: `Business shows high risk profile (${riskAssessment.overallRisk}%) - implement risk management strategies`,
        currentAllocation: 0,
        recommendedAllocation: cashFlow.currentCash * 0.2, // 20% for risk management
        expectedReturn: 0, // No return on risk management
        riskLevel: 'low',
        confidence: 0.9,
        reasoning: [
          `Overall risk score: ${riskAssessment.overallRisk}%`,
          'High risk requires immediate attention',
          'Risk management protects business value'
        ],
        actionItems: [
          'Increase cash reserves',
          'Diversify revenue streams',
          'Purchase business insurance',
          'Implement risk monitoring'
        ],
        priority: 'critical',
        implementationTime: '1-3 months',
        createdAt: new Date()
      });
    }
    
    return recommendations;
  }

  /**
   * Assess business risk
   */
  private async assessRisk(userId: string, cashFlow: CashFlowAnalysis): Promise<RiskAssessment> {
    // Mock risk assessment - in real implementation, this would analyze various risk factors
    const businessRisk = 60; // 60% business risk
    const marketRisk = 40; // 40% market risk
    const liquidityRisk = 30; // 30% liquidity risk
    const overallRisk = (businessRisk + marketRisk + liquidityRisk) / 3;
    
    const riskTolerance = overallRisk > 60 ? 'conservative' : overallRisk > 40 ? 'moderate' : 'aggressive';
    
    const recommendations = [
      'Maintain higher cash reserves',
      'Diversify investment portfolio',
      'Monitor market conditions closely',
      'Consider hedging strategies'
    ];
    
    return {
      businessRisk,
      marketRisk,
      liquidityRisk,
      overallRisk,
      riskTolerance,
      recommendations
    };
  }

  /**
   * Get investment advisor dashboard
   */
  async getInvestmentAdvisorDashboard(userId: string): Promise<{
    recommendations: InvestmentRecommendation[];
    cashFlowAnalysis: CashFlowAnalysis;
    riskAssessment: RiskAssessment;
    portfolio: InvestmentPortfolio;
    insights: {
      totalInvestableCash: number;
      recommendedAllocation: number;
      expectedPortfolioReturn: number;
      riskLevel: string;
    };
  }> {
    try {
      const recommendations = await this.generateInvestmentRecommendations(userId);
      const cashFlowAnalysis = await this.analyzeCashFlow(userId);
      const riskAssessment = await this.assessRisk(userId, cashFlowAnalysis);
      
      const portfolio: InvestmentPortfolio = {
        cashReserves: cashFlowAnalysis.recommendedReserves,
        shortTermInvestments: 0,
        mediumTermInvestments: 0,
        longTermInvestments: 0,
        totalValue: cashFlowAnalysis.currentCash,
        expectedReturn: 0.03, // 3% weighted average
        riskScore: riskAssessment.overallRisk
      };
      
      const totalInvestableCash = cashFlowAnalysis.excessCash;
      const recommendedAllocation = recommendations.reduce((sum, r) => sum + r.recommendedAllocation, 0);
      const expectedPortfolioReturn = recommendations.reduce((sum, r) => sum + (r.expectedReturn * r.recommendedAllocation), 0) / Math.max(recommendedAllocation, 1);
      
      const insights = {
        totalInvestableCash,
        recommendedAllocation,
        expectedPortfolioReturn,
        riskLevel: riskAssessment.riskTolerance
      };
      
      return {
        recommendations,
        cashFlowAnalysis,
        riskAssessment,
        portfolio,
        insights
      };

    } catch (error) {
      console.error('Error getting investment advisor dashboard:', error);
      return {
        recommendations: [],
        cashFlowAnalysis: {
          currentCash: 0,
          monthlyInflows: 0,
          monthlyOutflows: 0,
          netCashFlow: 0,
          cashRunway: 0,
          recommendedReserves: 0,
          excessCash: 0
        },
        riskAssessment: {
          businessRisk: 0,
          marketRisk: 0,
          liquidityRisk: 0,
          overallRisk: 0,
          riskTolerance: 'conservative',
          recommendations: []
        },
        portfolio: {
          cashReserves: 0,
          shortTermInvestments: 0,
          mediumTermInvestments: 0,
          longTermInvestments: 0,
          totalValue: 0,
          expectedReturn: 0,
          riskScore: 0
        },
        insights: {
          totalInvestableCash: 0,
          recommendedAllocation: 0,
          expectedPortfolioReturn: 0,
          riskLevel: 'conservative'
        }
      };
    }
  }
}

export default InvestmentAdvisorService;






