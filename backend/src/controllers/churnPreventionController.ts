import { Request, Response } from 'express';
import { ChurnPreventionService } from '../services/churnPreventionService';
import { logger } from '../utils/logger';

const churnPreventionService = new ChurnPreventionService();

export class ChurnPreventionController {
  /**
   * Analyze churn risk
   */
  async analyzeChurnRisk(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const analysis = await churnPreventionService.analyzeChurnRisk(companyId);

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      logger.error('Error analyzing churn risk:', error);
      res.status(500).json({
        success: false,
        message: 'Error analyzing churn risk',
        error: error.message
      });
    }
  }

  /**
   * Get churn prevention dashboard
   */
  async getChurnPreventionDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await churnPreventionService.getChurnPreventionDashboard(companyId);

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      logger.error('Error getting churn prevention dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting churn prevention dashboard',
        error: error.message
      });
    }
  }

  /**
   * Save churn prevention analysis
   */
  async saveChurnPreventionAnalysis(req: Request, res: Response): Promise<void> {
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

      const analysis = await churnPreventionService.saveChurnPreventionAnalysis(companyId, analysisData);

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      logger.error('Error saving churn prevention analysis:', error);
      res.status(500).json({
        success: false,
        message: 'Error saving churn prevention analysis',
        error: error.message
      });
    }
  }

  /**
   * Get churn statistics
   */
  async getChurnStats(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await churnPreventionService.getChurnPreventionDashboard(companyId);
      const churnStats = dashboard.churnStats;

      res.json({
        success: true,
        data: churnStats
      });
    } catch (error) {
      logger.error('Error getting churn stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting churn stats',
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

      const dashboard = await churnPreventionService.getChurnPreventionDashboard(companyId);
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
   * Get customer segments
   */
  async getCustomerSegments(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await churnPreventionService.getChurnPreventionDashboard(companyId);
      const customerSegments = dashboard.customerSegments;

      res.json({
        success: true,
        data: customerSegments
      });
    } catch (error) {
      logger.error('Error getting customer segments:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting customer segments',
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

      const dashboard = await churnPreventionService.getChurnPreventionDashboard(companyId);
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
   * Get churn risk customers
   */
  async getChurnRiskCustomers(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { riskLevel = 'all' } = req.query;

      const analysis = await churnPreventionService.analyzeChurnRisk(companyId);
      let customers = analysis.customerAnalysis || [];

      // Filter by risk level
      if (riskLevel !== 'all') {
        customers = customers.filter((customer: any) => customer.priority_level === riskLevel);
      }

      res.json({
        success: true,
        data: customers
      });
    } catch (error) {
      logger.error('Error getting churn risk customers:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting churn risk customers',
        error: error.message
      });
    }
  }

  /**
   * Get behavior patterns
   */
  async getBehaviorPatterns(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const analysis = await churnPreventionService.analyzeChurnRisk(companyId);
      const behaviorPatterns = analysis.behaviorAnalysis || [];

      res.json({
        success: true,
        data: behaviorPatterns
      });
    } catch (error) {
      logger.error('Error getting behavior patterns:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting behavior patterns',
        error: error.message
      });
    }
  }

  /**
   * Get engagement metrics
   */
  async getEngagementMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const analysis = await churnPreventionService.analyzeChurnRisk(companyId);
      const engagementMetrics = analysis.engagementAnalysis || [];

      res.json({
        success: true,
        data: engagementMetrics
      });
    } catch (error) {
      logger.error('Error getting engagement metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting engagement metrics',
        error: error.message
      });
    }
  }

  /**
   * Get risk factors
   */
  async getRiskFactors(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const analysis = await churnPreventionService.analyzeChurnRisk(companyId);
      const riskFactors = analysis.riskFactors || [];

      res.json({
        success: true,
        data: riskFactors
      });
    } catch (error) {
      logger.error('Error getting risk factors:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting risk factors',
        error: error.message
      });
    }
  }

  /**
   * Get churn prevention recommendations
   */
  async getChurnPreventionRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { priority, type } = req.query;

      const analysis = await churnPreventionService.analyzeChurnRisk(companyId);
      let recommendations = analysis.recommendations || [];

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
      logger.error('Error getting churn prevention recommendations:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting churn prevention recommendations',
        error: error.message
      });
    }
  }

  /**
   * Get overall churn risk score
   */
  async getOverallChurnRiskScore(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const analysis = await churnPreventionService.analyzeChurnRisk(companyId);
      const overallChurnRisk = analysis.overallChurnRisk;

      res.json({
        success: true,
        data: {
          overallChurnRisk,
          riskLevel: this.getRiskLevel(overallChurnRisk),
          recommendations: analysis.recommendations || []
        }
      });
    } catch (error) {
      logger.error('Error getting overall churn risk score:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting overall churn risk score',
        error: error.message
      });
    }
  }

  /**
   * Get risk level based on score
   */
  private getRiskLevel(score: number): string {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  /**
   * Get churn alerts
   */
  async getChurnAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const analysis = await churnPreventionService.analyzeChurnRisk(companyId);
      const alerts = this.generateChurnAlerts(analysis);

      res.json({
        success: true,
        data: alerts
      });
    } catch (error) {
      logger.error('Error getting churn alerts:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting churn alerts',
        error: error.message
      });
    }
  }

  /**
   * Generate churn alerts
   */
  private generateChurnAlerts(analysis: any): any[] {
    const alerts = [];
    
    // Critical alerts
    if (analysis.overallChurnRisk >= 80) {
      alerts.push({
        type: 'critical',
        title: 'Critical Churn Risk',
        description: `Overall churn risk is ${analysis.overallChurnRisk}%. Immediate action required.`,
        action: 'Implement emergency retention strategies',
        timestamp: new Date()
      });
    }
    
    // High priority alerts
    if (analysis.customerAnalysis) {
      const criticalCustomers = analysis.customerAnalysis.filter((customer: any) => 
        customer.priority_level === 'critical'
      );
      
      if (criticalCustomers.length > 0) {
        alerts.push({
          type: 'high',
          title: 'Critical Customers at Risk',
          description: `${criticalCustomers.length} critical customers are at risk of churning.`,
          action: 'Implement immediate retention strategies for these customers',
          timestamp: new Date()
        });
      }
    }
    
    if (analysis.engagementAnalysis) {
      const disengagedCustomers = analysis.engagementAnalysis.filter((engagement: any) => 
        engagement.engagement_level === 'disengaged'
      );
      
      if (disengagedCustomers.length > 0) {
        alerts.push({
          type: 'high',
          title: 'Disengaged Customers',
          description: `${disengagedCustomers.length} customers are disengaged.`,
          action: 'Launch re-engagement campaigns',
          timestamp: new Date()
        });
      }
    }
    
    // Medium priority alerts
    if (analysis.overallChurnRisk >= 60 && analysis.overallChurnRisk < 80) {
      alerts.push({
        type: 'medium',
        title: 'High Churn Risk',
        description: `Overall churn risk is ${analysis.overallChurnRisk}%.`,
        action: 'Implement proactive retention strategies',
        timestamp: new Date()
      });
    }
    
    if (analysis.behaviorAnalysis) {
      const highRiskBehaviors = analysis.behaviorAnalysis.filter((behavior: any) => 
        behavior.behavior_risk_level === 'high_risk'
      );
      
      if (highRiskBehaviors.length > 0) {
        alerts.push({
          type: 'medium',
          title: 'High-Risk Behavior Patterns',
          description: `${highRiskBehaviors.length} customers show high-risk behavior patterns.`,
          action: 'Implement behavior-based retention strategies',
          timestamp: new Date()
        });
      }
    }
    
    return alerts;
  }
}