import { Request, Response } from 'express';
import VendorOptimizationService from '../services/vendorOptimizationService';
import BillingOptimizationService from '../services/billingOptimizationService';
import CashFlowOptimizationService from '../services/cashFlowOptimizationService';
import StaffingRecommendationService from '../services/staffingRecommendationService';

const vendorOptimizationService = new VendorOptimizationService();
const billingOptimizationService = new BillingOptimizationService();
const cashFlowOptimizationService = new CashFlowOptimizationService();
const staffingRecommendationService = new StaffingRecommendationService();

/**
 * Get all recommendations for user
 */
export const getAllRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const [
      vendorRecommendations,
      billingRecommendations,
      cashFlowRecommendations,
      staffingRecommendations
    ] = await Promise.all([
      vendorOptimizationService.generateVendorOptimizationRecommendations(userId),
      billingOptimizationService.generateBillingOptimizationRecommendations(userId),
      cashFlowOptimizationService.generateCashFlowOptimizationRecommendations(userId),
      staffingRecommendationService.generateStaffingRecommendations(userId)
    ]);

    const allRecommendations = [
      ...vendorRecommendations,
      ...billingRecommendations,
      ...cashFlowRecommendations,
      ...staffingRecommendations
    ];

    // Sort by potential impact
    allRecommendations.sort((a, b) => b.potentialImpact - a.potentialImpact);

    res.json({
      recommendations: allRecommendations,
      summary: {
        total: allRecommendations.length,
        vendor: vendorRecommendations.length,
        billing: billingRecommendations.length,
        cashFlow: cashFlowRecommendations.length,
        staffing: staffingRecommendations.length,
        totalPotentialImpact: allRecommendations.reduce((sum, r) => sum + r.potentialImpact, 0)
      },
      success: true
    });

  } catch (error) {
    console.error('Error getting all recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to get recommendations',
      success: false 
    });
  }
};

/**
 * Get vendor optimization recommendations
 */
export const getVendorOptimizationRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const recommendations = await vendorOptimizationService.generateVendorOptimizationRecommendations(userId);
    const dashboard = await vendorOptimizationService.getVendorOptimizationDashboard(userId);

    res.json({
      recommendations,
      dashboard,
      success: true
    });

  } catch (error) {
    console.error('Error getting vendor optimization recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to get vendor optimization recommendations',
      success: false 
    });
  }
};

/**
 * Get billing optimization recommendations
 */
export const getBillingOptimizationRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const recommendations = await billingOptimizationService.generateBillingOptimizationRecommendations(userId);
    const insights = await billingOptimizationService.getBillingOptimizationInsights(userId);

    res.json({
      recommendations,
      insights,
      success: true
    });

  } catch (error) {
    console.error('Error getting billing optimization recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to get billing optimization recommendations',
      success: false 
    });
  }
};

/**
 * Get cash flow optimization recommendations
 */
export const getCashFlowOptimizationRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const recommendations = await cashFlowOptimizationService.generateCashFlowOptimizationRecommendations(userId);
    const dashboard = await cashFlowOptimizationService.getCashFlowOptimizationDashboard(userId);

    res.json({
      recommendations,
      dashboard,
      success: true
    });

  } catch (error) {
    console.error('Error getting cash flow optimization recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to get cash flow optimization recommendations',
      success: false 
    });
  }
};

/**
 * Get staffing recommendations
 */
export const getStaffingRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const recommendations = await staffingRecommendationService.generateStaffingRecommendations(userId);
    const dashboard = await staffingRecommendationService.getStaffingRecommendationDashboard(userId);

    res.json({
      recommendations,
      dashboard,
      success: true
    });

  } catch (error) {
    console.error('Error getting staffing recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to get staffing recommendations',
      success: false 
    });
  }
};

/**
 * Dismiss recommendation
 */
export const dismissRecommendation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason, feedback } = req.body;

    // In a real implementation, this would update the recommendation status in the database
    console.log(`Recommendation ${id} dismissed. Reason: ${reason}, Feedback: ${feedback}`);

    res.json({
      message: 'Recommendation dismissed successfully',
      success: true
    });

  } catch (error) {
    console.error('Error dismissing recommendation:', error);
    res.status(500).json({ 
      error: 'Failed to dismiss recommendation',
      success: false 
    });
  }
};

/**
 * Get recommendation analytics
 */
export const getRecommendationAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const [
      vendorDashboard,
      billingInsights,
      cashFlowDashboard,
      staffingDashboard
    ] = await Promise.all([
      vendorOptimizationService.getVendorOptimizationDashboard(userId),
      billingOptimizationService.getBillingOptimizationInsights(userId),
      cashFlowOptimizationService.getCashFlowOptimizationDashboard(userId),
      staffingRecommendationService.getStaffingRecommendationDashboard(userId)
    ]);

    const analytics = {
      vendor: {
        totalVendors: vendorDashboard.statistics.totalVendors,
        underperformingVendors: vendorDashboard.statistics.underperformingVendors,
        potentialSavings: vendorDashboard.statistics.potentialSavings,
        averageVendorScore: vendorDashboard.statistics.averageVendorScore
      },
      billing: {
        totalClients: billingInsights.totalClients,
        monthlyRecurringRevenue: billingInsights.monthlyRecurringRevenue,
        annualRecurringRevenue: billingInsights.annualRecurringRevenue,
        churnRiskClients: billingInsights.churnRiskClients,
        potentialRevenueIncrease: billingInsights.potentialRevenueIncrease
      },
      cashFlow: {
        currentCashFlow: cashFlowDashboard.insights.currentCashFlow,
        projectedCashFlow: cashFlowDashboard.insights.projectedCashFlow,
        optimizationPotential: cashFlowDashboard.insights.optimizationPotential,
        riskLevel: cashFlowDashboard.insights.riskLevel
      },
      staffing: {
        totalHeadcount: staffingDashboard.analysis.totalHeadcount,
        revenuePerEmployee: staffingDashboard.analysis.revenuePerEmployee,
        productivityScore: staffingDashboard.analysis.productivityScore,
        turnoverRate: staffingDashboard.analysis.turnoverRate,
        potentialCostSavings: staffingDashboard.insights.potentialCostSavings,
        potentialRevenueIncrease: staffingDashboard.insights.potentialRevenueIncrease
      }
    };

    res.json({
      analytics,
      success: true
    });

  } catch (error) {
    console.error('Error getting recommendation analytics:', error);
    res.status(500).json({ 
      error: 'Failed to get recommendation analytics',
      success: false 
    });
  }
};

/**
 * Get recommendation priorities
 */
export const getRecommendationPriorities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const allRecommendations = await Promise.all([
      vendorOptimizationService.generateVendorOptimizationRecommendations(userId),
      billingOptimizationService.generateBillingOptimizationRecommendations(userId),
      cashFlowOptimizationService.generateCashFlowOptimizationRecommendations(userId),
      staffingRecommendationService.generateStaffingRecommendations(userId)
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
      critical: priorities.critical.reduce((sum, r) => sum + r.potentialImpact, 0),
      high: priorities.high.reduce((sum, r) => sum + r.potentialImpact, 0),
      medium: priorities.medium.reduce((sum, r) => sum + r.potentialImpact, 0),
      low: priorities.low.reduce((sum, r) => sum + r.potentialImpact, 0)
    };

    res.json({
      priorities,
      priorityScores,
      totalRecommendations: allRecommendations.length,
      success: true
    });

  } catch (error) {
    console.error('Error getting recommendation priorities:', error);
    res.status(500).json({ 
      error: 'Failed to get recommendation priorities',
      success: false 
    });
  }
};

export default {
  getAllRecommendations,
  getVendorOptimizationRecommendations,
  getBillingOptimizationRecommendations,
  getCashFlowOptimizationRecommendations,
  getStaffingRecommendations,
  dismissRecommendation,
  getRecommendationAnalytics,
  getRecommendationPriorities
};






