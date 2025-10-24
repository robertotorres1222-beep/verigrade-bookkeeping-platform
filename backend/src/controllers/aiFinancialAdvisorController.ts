import { Request, Response } from 'express';
import TaxOptimizationService from '../services/taxOptimizationService';
import PricingStrategyService from '../services/pricingStrategyService';
import InvestmentAdvisorService from '../services/investmentAdvisorService';
import BusinessStrategyService from '../services/businessStrategyService';

const taxOptimizationService = new TaxOptimizationService();
const pricingStrategyService = new PricingStrategyService();
const investmentAdvisorService = new InvestmentAdvisorService();
const businessStrategyService = new BusinessStrategyService();

/**
 * Get tax optimization recommendations
 */
export const getTaxOptimizationRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const recommendations = await taxOptimizationService.generateTaxOptimizationRecommendations(userId);
    const dashboard = await taxOptimizationService.getTaxOptimizationDashboard(userId);

    res.json({
      recommendations,
      dashboard,
      success: true
    });

  } catch (error) {
    console.error('Error getting tax optimization recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to get tax optimization recommendations',
      success: false 
    });
  }
};

/**
 * Get pricing strategy recommendations
 */
export const getPricingStrategyRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const recommendations = await pricingStrategyService.generatePricingRecommendations(userId);
    const dashboard = await pricingStrategyService.getPricingStrategyDashboard(userId);

    res.json({
      recommendations,
      dashboard,
      success: true
    });

  } catch (error) {
    console.error('Error getting pricing strategy recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to get pricing strategy recommendations',
      success: false 
    });
  }
};

/**
 * Get investment recommendations
 */
export const getInvestmentRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const recommendations = await investmentAdvisorService.generateInvestmentRecommendations(userId);
    const dashboard = await investmentAdvisorService.getInvestmentAdvisorDashboard(userId);

    res.json({
      recommendations,
      dashboard,
      success: true
    });

  } catch (error) {
    console.error('Error getting investment recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to get investment recommendations',
      success: false 
    });
  }
};

/**
 * Get business strategy recommendations
 */
export const getBusinessStrategyRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const recommendations = await businessStrategyService.generateBusinessStrategyRecommendations(userId);
    const dashboard = await businessStrategyService.getBusinessStrategyDashboard(userId);

    res.json({
      recommendations,
      dashboard,
      success: true
    });

  } catch (error) {
    console.error('Error getting business strategy recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to get business strategy recommendations',
      success: false 
    });
  }
};

/**
 * Get all financial advisor recommendations
 */
export const getAllFinancialAdvisorRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const [
      taxRecommendations,
      pricingRecommendations,
      investmentRecommendations,
      strategyRecommendations
    ] = await Promise.all([
      taxOptimizationService.generateTaxOptimizationRecommendations(userId),
      pricingStrategyService.generatePricingRecommendations(userId),
      investmentAdvisorService.generateInvestmentRecommendations(userId),
      businessStrategyService.generateBusinessStrategyRecommendations(userId)
    ]);

    const allRecommendations = [
      ...taxRecommendations,
      ...pricingRecommendations,
      ...investmentRecommendations,
      ...strategyRecommendations
    ];

    // Sort by expected impact
    allRecommendations.sort((a, b) => b.expectedImpact - a.expectedImpact);

    res.json({
      recommendations: allRecommendations,
      summary: {
        total: allRecommendations.length,
        tax: taxRecommendations.length,
        pricing: pricingRecommendations.length,
        investment: investmentRecommendations.length,
        strategy: strategyRecommendations.length,
        totalExpectedImpact: allRecommendations.reduce((sum, r) => sum + r.expectedImpact, 0)
      },
      success: true
    });

  } catch (error) {
    console.error('Error getting all financial advisor recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to get financial advisor recommendations',
      success: false 
    });
  }
};

/**
 * Get financial advisor dashboard
 */
export const getFinancialAdvisorDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const [
      taxDashboard,
      pricingDashboard,
      investmentDashboard,
      strategyDashboard
    ] = await Promise.all([
      taxOptimizationService.getTaxOptimizationDashboard(userId),
      pricingStrategyService.getPricingStrategyDashboard(userId),
      investmentAdvisorService.getInvestmentAdvisorDashboard(userId),
      businessStrategyService.getBusinessStrategyDashboard(userId)
    ]);

    const dashboard = {
      tax: taxDashboard,
      pricing: pricingDashboard,
      investment: investmentDashboard,
      strategy: strategyDashboard,
      insights: {
        totalRecommendations: taxDashboard.recommendations.length + 
                             pricingDashboard.recommendations.length + 
                             investmentDashboard.recommendations.length + 
                             strategyDashboard.recommendations.length,
        totalPotentialSavings: taxDashboard.insights.potentialSavings + 
                               pricingDashboard.insights.optimizationPotential + 
                               investmentDashboard.insights.recommendedAllocation + 
                               strategyDashboard.insights.growthPotential,
        overallRiskLevel: investmentDashboard.insights.riskLevel,
        marketPosition: pricingDashboard.insights.marketPosition
      }
    };

    res.json({
      dashboard,
      success: true
    });

  } catch (error) {
    console.error('Error getting financial advisor dashboard:', error);
    res.status(500).json({ 
      error: 'Failed to get financial advisor dashboard',
      success: false 
    });
  }
};

/**
 * Get financial advisor analytics
 */
export const getFinancialAdvisorAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const [
      taxDashboard,
      pricingDashboard,
      investmentDashboard,
      strategyDashboard
    ] = await Promise.all([
      taxOptimizationService.getTaxOptimizationDashboard(userId),
      pricingStrategyService.getPricingStrategyDashboard(userId),
      investmentAdvisorService.getInvestmentAdvisorDashboard(userId),
      businessStrategyService.getBusinessStrategyDashboard(userId)
    ]);

    const analytics = {
      tax: {
        currentYearTaxLiability: taxDashboard.insights.currentYearTaxLiability,
        potentialSavings: taxDashboard.insights.potentialSavings,
        optimizationScore: taxDashboard.insights.optimizationScore,
        estimatedTaxDue: taxDashboard.insights.estimatedTaxDue
      },
      pricing: {
        currentPricing: pricingDashboard.insights.currentPricing,
        marketPosition: pricingDashboard.insights.marketPosition,
        optimizationPotential: pricingDashboard.insights.optimizationPotential,
        competitiveAdvantage: pricingDashboard.insights.competitiveAdvantage
      },
      investment: {
        totalInvestableCash: investmentDashboard.insights.totalInvestableCash,
        recommendedAllocation: investmentDashboard.insights.recommendedAllocation,
        expectedPortfolioReturn: investmentDashboard.insights.expectedPortfolioReturn,
        riskLevel: investmentDashboard.insights.riskLevel
      },
      strategy: {
        overallPerformance: strategyDashboard.insights.overallPerformance,
        growthPotential: strategyDashboard.insights.growthPotential,
        efficiencyScore: strategyDashboard.insights.efficiencyScore,
        marketOpportunity: strategyDashboard.insights.marketOpportunity
      }
    };

    res.json({
      analytics,
      success: true
    });

  } catch (error) {
    console.error('Error getting financial advisor analytics:', error);
    res.status(500).json({ 
      error: 'Failed to get financial advisor analytics',
      success: false 
    });
  }
};

/**
 * Get recommendation priorities
 */
export const getFinancialAdvisorPriorities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const allRecommendations = await Promise.all([
      taxOptimizationService.generateTaxOptimizationRecommendations(userId),
      pricingStrategyService.generatePricingRecommendations(userId),
      investmentAdvisorService.generateInvestmentRecommendations(userId),
      businessStrategyService.generateBusinessStrategyRecommendations(userId)
    ]).then(results => results.flat());

    // Group by priority
    const priorities = {
      critical: allRecommendations.filter(r => r.priority === 'critical'),
      high: allRecommendations.filter(r => r.priority === 'high'),
      medium: allRecommendations.filter(r => r.priority === 'medium'),
      low: allRecommendations.filter(r => r.priority === 'low')
    };

    // Calculate priority scores
    const priorityScores = {
      critical: priorities.critical.reduce((sum, r) => sum + r.expectedImpact, 0),
      high: priorities.high.reduce((sum, r) => sum + r.expectedImpact, 0),
      medium: priorities.medium.reduce((sum, r) => sum + r.expectedImpact, 0),
      low: priorities.low.reduce((sum, r) => sum + r.expectedImpact, 0)
    };

    res.json({
      priorities,
      priorityScores,
      totalRecommendations: allRecommendations.length,
      success: true
    });

  } catch (error) {
    console.error('Error getting financial advisor priorities:', error);
    res.status(500).json({ 
      error: 'Failed to get financial advisor priorities',
      success: false 
    });
  }
};

export default {
  getTaxOptimizationRecommendations,
  getPricingStrategyRecommendations,
  getInvestmentRecommendations,
  getBusinessStrategyRecommendations,
  getAllFinancialAdvisorRecommendations,
  getFinancialAdvisorDashboard,
  getFinancialAdvisorAnalytics,
  getFinancialAdvisorPriorities
};






