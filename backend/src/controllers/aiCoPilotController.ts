import { Request, Response } from 'express';
import { AICoPilotService } from '../services/aiCoPilotService';
import { logger } from '../utils/logger';

const aiCoPilotService = new AICoPilotService();

export class AICoPilotController {
  /**
   * Get AI insights
   */
  async getAIInsights(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const context = req.body;

      const insights = await aiCoPilotService.getAIInsights(companyId, context);

      res.json({
        success: true,
        data: insights
      });
    } catch (error) {
      logger.error('Error getting AI insights:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting AI insights',
        error: error.message
      });
    }
  }

  /**
   * Get AI Co-Pilot dashboard
   */
  async getAICoPilotDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await aiCoPilotService.getAICoPilotDashboard(companyId);

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      logger.error('Error getting AI Co-Pilot dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting AI Co-Pilot dashboard',
        error: error.message
      });
    }
  }

  /**
   * Save AI analysis
   */
  async saveAIAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const analysisData = req.body;

      if (!analysisData.type || !analysisData.data) {
        res.status(400).json({
          success: false,
          message: 'Analysis type and data are required'
        });
        return;
      }

      const analysis = await aiCoPilotService.saveAIAnalysis(companyId, analysisData);

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      logger.error('Error saving AI analysis:', error);
      res.status(500).json({
        success: false,
        message: 'Error saving AI analysis',
        error: error.message
      });
    }
  }

  /**
   * Get financial insights
   */
  async getFinancialInsights(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const insights = await aiCoPilotService.getAIInsights(companyId, {});
      const financialInsights = insights.financialInsights;

      res.json({
        success: true,
        data: financialInsights
      });
    } catch (error) {
      logger.error('Error getting financial insights:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting financial insights',
        error: error.message
      });
    }
  }

  /**
   * Get operational insights
   */
  async getOperationalInsights(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const insights = await aiCoPilotService.getAIInsights(companyId, {});
      const operationalInsights = insights.operationalInsights;

      res.json({
        success: true,
        data: operationalInsights
      });
    } catch (error) {
      logger.error('Error getting operational insights:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting operational insights',
        error: error.message
      });
    }
  }

  /**
   * Get strategic insights
   */
  async getStrategicInsights(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const insights = await aiCoPilotService.getAIInsights(companyId, {});
      const strategicInsights = insights.strategicInsights;

      res.json({
        success: true,
        data: strategicInsights
      });
    } catch (error) {
      logger.error('Error getting strategic insights:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting strategic insights',
        error: error.message
      });
    }
  }

  /**
   * Get risk insights
   */
  async getRiskInsights(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const insights = await aiCoPilotService.getAIInsights(companyId, {});
      const riskInsights = insights.riskInsights;

      res.json({
        success: true,
        data: riskInsights
      });
    } catch (error) {
      logger.error('Error getting risk insights:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting risk insights',
        error: error.message
      });
    }
  }

  /**
   * Get recommendations
   */
  async getRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { priority, type } = req.query;

      const insights = await aiCoPilotService.getAIInsights(companyId, {});
      let recommendations = insights.recommendations || [];

      // Filter by priority
      if (priority) {
        recommendations = recommendations.filter((rec: any) => rec.priority === priority);
      }

      // Filter by type
      if (type) {
        recommendations = recommendations.filter((rec: any) => rec.type === type);
      }

      res.json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      logger.error('Error getting recommendations:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting recommendations',
        error: error.message
      });
    }
  }

  /**
   * Get recent analyses
   */
  async getRecentAnalyses(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { limit = '20' } = req.query;

      const dashboard = await aiCoPilotService.getAICoPilotDashboard(companyId);
      const recentAnalyses = dashboard.recentAnalyses;

      res.json({
        success: true,
        data: recentAnalyses
      });
    } catch (error) {
      logger.error('Error getting recent analyses:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting recent analyses',
        error: error.message
      });
    }
  }

  /**
   * Get trend analysis
   */
  async getTrendAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { days = '30' } = req.query;

      const dashboard = await aiCoPilotService.getAICoPilotDashboard(companyId);
      const trendAnalysis = dashboard.trendAnalysis;

      res.json({
        success: true,
        data: trendAnalysis
      });
    } catch (error) {
      logger.error('Error getting trend analysis:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting trend analysis',
        error: error.message
      });
    }
  }

  /**
   * Get overall score
   */
  async getOverallScore(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const insights = await aiCoPilotService.getAIInsights(companyId, {});
      const overallScore = insights.overallScore;

      res.json({
        success: true,
        data: {
          overallScore,
          scoreBreakdown: {
            financial: insights.financialInsights ? this.calculateScore(insights.financialInsights) : 0,
            operational: insights.operationalInsights ? this.calculateScore(insights.operationalInsights) : 0,
            strategic: insights.strategicInsights ? this.calculateScore(insights.strategicInsights) : 0,
            risk: insights.riskInsights ? this.calculateScore(insights.riskInsights) : 0
          }
        }
      });
    } catch (error) {
      logger.error('Error getting overall score:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting overall score',
        error: error.message
      });
    }
  }

  /**
   * Calculate score for insights
   */
  private calculateScore(insights: any): number {
    // Simplified score calculation
    let score = 0;
    
    if (insights.profitMargin > 20) score += 25;
    else if (insights.profitMargin > 10) score += 15;
    else if (insights.profitMargin > 0) score += 10;
    
    if (insights.taskCompletionRate > 90) score += 25;
    else if (insights.taskCompletionRate > 80) score += 15;
    else if (insights.taskCompletionRate > 70) score += 10;
    
    if (insights.uniqueCustomers > 100) score += 25;
    else if (insights.uniqueCustomers > 50) score += 15;
    else if (insights.uniqueCustomers > 20) score += 10;
    
    if (insights.activityRisk === 'low') score += 25;
    else if (insights.activityRisk === 'medium') score += 15;
    else if (insights.activityRisk === 'high') score += 5;
    
    return Math.min(score, 100);
  }

  /**
   * Get AI alerts
   */
  async getAIAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const insights = await aiCoPilotService.getAIInsights(companyId, {});
      const alerts = this.generateAlerts(insights);

      res.json({
        success: true,
        data: alerts
      });
    } catch (error) {
      logger.error('Error getting AI alerts:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting AI alerts',
        error: error.message
      });
    }
  }

  /**
   * Generate alerts based on insights
   */
  private generateAlerts(insights: any): any[] {
    const alerts = [];
    
    // Critical alerts
    if (insights.financialInsights?.netCashFlow < 0) {
      alerts.push({
        type: 'critical',
        title: 'Negative Cash Flow',
        description: 'Company is burning cash. Immediate action required.',
        action: 'Review expenses and revenue immediately',
        timestamp: new Date()
      });
    }
    
    if (insights.financialInsights?.cashRunway < 3) {
      alerts.push({
        type: 'critical',
        title: 'Low Cash Runway',
        description: `Cash runway is ${insights.financialInsights.cashRunway.toFixed(1)} months.`,
        action: 'Prepare for fundraising or implement cost cuts',
        timestamp: new Date()
      });
    }
    
    // High priority alerts
    if (insights.operationalInsights?.overdueTaskRate > 20) {
      alerts.push({
        type: 'high',
        title: 'High Overdue Task Rate',
        description: `Overdue task rate is ${insights.operationalInsights.overdueTaskRate.toFixed(1)}%.`,
        action: 'Address capacity issues or redistribute workload',
        timestamp: new Date()
      });
    }
    
    if (insights.riskInsights?.activityRisk === 'high') {
      alerts.push({
        type: 'high',
        title: 'Low Business Activity',
        description: 'Very low transaction activity detected.',
        action: 'Investigate and address business activity issues',
        timestamp: new Date()
      });
    }
    
    // Medium priority alerts
    if (insights.financialInsights?.profitMargin < 10) {
      alerts.push({
        type: 'medium',
        title: 'Low Profit Margin',
        description: `Profit margin is ${insights.financialInsights.profitMargin.toFixed(1)}%.`,
        action: 'Review pricing strategy and cost structure',
        timestamp: new Date()
      });
    }
    
    if (insights.operationalInsights?.taskCompletionRate < 80) {
      alerts.push({
        type: 'medium',
        title: 'Low Task Completion Rate',
        description: `Task completion rate is ${insights.operationalInsights.taskCompletionRate.toFixed(1)}%.`,
        action: 'Implement better project management practices',
        timestamp: new Date()
      });
    }
    
    return alerts;
  }

  /**
   * Get AI predictions
   */
  async getAIPredictions(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { timeframe = '30' } = req.query;

      const insights = await aiCoPilotService.getAIInsights(companyId, {});
      const predictions = this.generatePredictions(insights, parseInt(timeframe as string));

      res.json({
        success: true,
        data: predictions
      });
    } catch (error) {
      logger.error('Error getting AI predictions:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting AI predictions',
        error: error.message
      });
    }
  }

  /**
   * Generate predictions based on insights
   */
  private generatePredictions(insights: any, timeframe: number): any {
    const predictions = {
      revenue: {
        current: insights.financialInsights?.totalRevenue || 0,
        predicted: (insights.financialInsights?.totalRevenue || 0) * (1 + (insights.financialInsights?.revenueGrowth || 0) / 100),
        confidence: 0.8
      },
      expenses: {
        current: insights.financialInsights?.totalExpenses || 0,
        predicted: (insights.financialInsights?.totalExpenses || 0) * (1 + (insights.financialInsights?.expenseGrowth || 0) / 100),
        confidence: 0.75
      },
      cashFlow: {
        current: insights.financialInsights?.netCashFlow || 0,
        predicted: (insights.financialInsights?.netCashFlow || 0) * 1.1, // Simplified
        confidence: 0.7
      },
      customers: {
        current: insights.strategicInsights?.uniqueCustomers || 0,
        predicted: (insights.strategicInsights?.uniqueCustomers || 0) * 1.15, // Simplified
        confidence: 0.8
      },
      tasks: {
        current: insights.operationalInsights?.totalTasks || 0,
        predicted: (insights.operationalInsights?.totalTasks || 0) * 1.05, // Simplified
        confidence: 0.75
      }
    };

    return predictions;
  }
}