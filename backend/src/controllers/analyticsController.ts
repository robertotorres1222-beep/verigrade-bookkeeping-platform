import { Request, Response } from 'express';
import predictiveAnalyticsService from '../services/predictiveAnalyticsService';
import mlModelsService from '../services/mlModelsService';
import businessIntelligenceService from '../services/businessIntelligenceService';
import advancedReportingService from '../services/advancedReportingService';
import logger from '../utils/logger';

export class AnalyticsController {
  /**
   * Get cash flow forecast
   */
  public async getCashFlowForecast(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const { months = 12 } = req.query;
      
      const forecast = await predictiveAnalyticsService.generateCashFlowForecast(
        companyId,
        parseInt(months as string)
      );
      
      res.json({
        success: true,
        data: forecast
      });
    } catch (error: any) {
      logger.error('[AnalyticsController] Error getting cash flow forecast:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get revenue prediction
   */
  public async getRevenuePrediction(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const { period } = req.query;
      
      const prediction = await predictiveAnalyticsService.predictRevenue(
        companyId,
        period as string || 'month'
      );
      
      res.json({
        success: true,
        data: prediction
      });
    } catch (error: any) {
      logger.error('[AnalyticsController] Error getting revenue prediction:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get expense trends
   */
  public async getExpenseTrends(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const { category } = req.query;
      
      const trends = await predictiveAnalyticsService.analyzeExpenseTrends(
        companyId,
        category as string
      );
      
      res.json({
        success: true,
        data: trends
      });
    } catch (error: any) {
      logger.error('[AnalyticsController] Error getting expense trends:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Detect anomalies
   */
  public async detectAnomalies(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const { days = 30 } = req.query;
      
      const anomalies = await predictiveAnalyticsService.detectAnomalies(
        companyId,
        parseInt(days as string)
      );
      
      res.json({
        success: true,
        data: anomalies
      });
    } catch (error: any) {
      logger.error('[AnalyticsController] Error detecting anomalies:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Assess risks
   */
  public async assessRisks(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      
      const risks = await predictiveAnalyticsService.assessRisks(companyId);
      
      res.json({
        success: true,
        data: risks
      });
    } catch (error: any) {
      logger.error('[AnalyticsController] Error assessing risks:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Detect seasonal patterns
   */
  public async detectSeasonalPatterns(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      
      const patterns = await predictiveAnalyticsService.detectSeasonalPatterns(companyId);
      
      res.json({
        success: true,
        data: patterns
      });
    } catch (error: any) {
      logger.error('[AnalyticsController] Error detecting seasonal patterns:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get ML models
   */
  public async getMLModels(req: Request, res: Response): Promise<void> {
    try {
      const models = await mlModelsService.getModels();
      
      res.json({
        success: true,
        data: models
      });
    } catch (error: any) {
      logger.error('[AnalyticsController] Error getting ML models:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get ML model by ID
   */
  public async getMLModel(req: Request, res: Response): Promise<void> {
    try {
      const { modelId } = req.params;
      
      const model = await mlModelsService.getModel(modelId);
      
      if (!model) {
        res.status(404).json({
          success: false,
          error: 'Model not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: model
      });
    } catch (error: any) {
      logger.error('[AnalyticsController] Error getting ML model:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Train ML model
   */
  public async trainMLModel(req: Request, res: Response): Promise<void> {
    try {
      const { modelId } = req.params;
      const { trainingData } = req.body;
      
      const model = await mlModelsService.trainModel(modelId, trainingData);
      
      res.json({
        success: true,
        data: model
      });
    } catch (error: any) {
      logger.error('[AnalyticsController] Error training ML model:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Make ML prediction
   */
  public async makeMLPrediction(req: Request, res: Response): Promise<void> {
    try {
      const { modelId } = req.params;
      const { input } = req.body;
      
      const prediction = await mlModelsService.makePrediction(modelId, input);
      
      res.json({
        success: true,
        data: prediction
      });
    } catch (error: any) {
      logger.error('[AnalyticsController] Error making ML prediction:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get ML recommendations
   */
  public async getMLRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const { context } = req.body;
      
      const recommendations = await mlModelsService.getRecommendations(companyId, context);
      
      res.json({
        success: true,
        data: recommendations
      });
    } catch (error: any) {
      logger.error('[AnalyticsController] Error getting ML recommendations:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get ML model features
   */
  public async getMLModelFeatures(req: Request, res: Response): Promise<void> {
    try {
      const { modelId } = req.params;
      
      const features = await mlModelsService.getModelFeatures(modelId);
      
      res.json({
        success: true,
        data: features
      });
    } catch (error: any) {
      logger.error('[AnalyticsController] Error getting ML model features:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get KPIs
   */
  public async getKPIs(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const { period = 'month' } = req.query;
      
      const kpis = await businessIntelligenceService.getKPIs(
        companyId,
        period as string
      );
      
      res.json({
        success: true,
        data: kpis
      });
    } catch (error: any) {
      logger.error('[AnalyticsController] Error getting KPIs:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Create dashboard
   */
  public async createDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const { name, description, widgets, layout, filters } = req.body;
      
      const dashboard = await businessIntelligenceService.createDashboard(
        companyId,
        name,
        description,
        widgets,
        layout,
        filters
      );
      
      res.json({
        success: true,
        data: dashboard
      });
    } catch (error: any) {
      logger.error('[AnalyticsController] Error creating dashboard:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get dashboards
   */
  public async getDashboards(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      
      const dashboards = await businessIntelligenceService.getDashboards(companyId);
      
      res.json({
        success: true,
        data: dashboards
      });
    } catch (error: any) {
      logger.error('[AnalyticsController] Error getting dashboards:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get performance metrics
   */
  public async getPerformanceMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const { period = 'month' } = req.query;
      
      const metrics = await businessIntelligenceService.getPerformanceMetrics(
        companyId,
        period as string
      );
      
      res.json({
        success: true,
        data: metrics
      });
    } catch (error: any) {
      logger.error('[AnalyticsController] Error getting performance metrics:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get benchmarks
   */
  public async getBenchmarks(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const { industry } = req.query;
      
      const benchmarks = await businessIntelligenceService.getBenchmarks(
        companyId,
        industry as string || 'technology'
      );
      
      res.json({
        success: true,
        data: benchmarks
      });
    } catch (error: any) {
      logger.error('[AnalyticsController] Error getting benchmarks:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get market insights
   */
  public async getMarketInsights(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const { industry } = req.query;
      
      const insights = await businessIntelligenceService.getMarketInsights(
        companyId,
        industry as string || 'technology'
      );
      
      res.json({
        success: true,
        data: insights
      });
    } catch (error: any) {
      logger.error('[AnalyticsController] Error getting market insights:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get competitive analysis
   */
  public async getCompetitiveAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const { industry } = req.query;
      
      const analysis = await businessIntelligenceService.getCompetitiveAnalysis(
        companyId,
        industry as string || 'technology'
      );
      
      res.json({
        success: true,
        data: analysis
      });
    } catch (error: any) {
      logger.error('[AnalyticsController] Error getting competitive analysis:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Generate executive summary
   */
  public async generateExecutiveSummary(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      
      const summary = await businessIntelligenceService.generateExecutiveSummary(companyId);
      
      res.json({
        success: true,
        data: summary
      });
    } catch (error: any) {
      logger.error('[AnalyticsController] Error generating executive summary:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Create report
   */
  public async createReport(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const { name, description, type, template, data, filters } = req.body;
      
      const report = await advancedReportingService.createReport(
        companyId,
        name,
        description,
        type,
        template,
        data,
        filters
      );
      
      res.json({
        success: true,
        data: report
      });
    } catch (error: any) {
      logger.error('[AnalyticsController] Error creating report:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get reports
   */
  public async getReports(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      
      const reports = await advancedReportingService.getReports(companyId);
      
      res.json({
        success: true,
        data: reports
      });
    } catch (error: any) {
      logger.error('[AnalyticsController] Error getting reports:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Execute report
   */
  public async executeReport(req: Request, res: Response): Promise<void> {
    try {
      const { reportId } = req.params;
      const { parameters } = req.body;
      
      const execution = await advancedReportingService.executeReport(reportId, parameters);
      
      res.json({
        success: true,
        data: execution
      });
    } catch (error: any) {
      logger.error('[AnalyticsController] Error executing report:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get report execution status
   */
  public async getReportExecutionStatus(req: Request, res: Response): Promise<void> {
    try {
      const { executionId } = req.params;
      
      const execution = await advancedReportingService.getExecutionStatus(executionId);
      
      res.json({
        success: true,
        data: execution
      });
    } catch (error: any) {
      logger.error('[AnalyticsController] Error getting report execution status:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Schedule report
   */
  public async scheduleReport(req: Request, res: Response): Promise<void> {
    try {
      const { reportId } = req.params;
      const { schedule } = req.body;
      
      await advancedReportingService.scheduleReport(reportId, schedule);
      
      res.json({
        success: true,
        message: 'Report scheduled successfully'
      });
    } catch (error: any) {
      logger.error('[AnalyticsController] Error scheduling report:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get report templates
   */
  public async getReportTemplates(req: Request, res: Response): Promise<void> {
    try {
      const templates = await advancedReportingService.getReportTemplates();
      
      res.json({
        success: true,
        data: templates
      });
    } catch (error: any) {
      logger.error('[AnalyticsController] Error getting report templates:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Export report
   */
  public async exportReport(req: Request, res: Response): Promise<void> {
    try {
      const { reportId } = req.params;
      const { format = 'pdf' } = req.query;
      const { parameters } = req.body;
      
      const result = await advancedReportingService.exportReport(
        reportId,
        format as string,
        parameters
      );
      
      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error('[AnalyticsController] Error exporting report:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Share report
   */
  public async shareReport(req: Request, res: Response): Promise<void> {
    try {
      const { reportId } = req.params;
      const { recipients, permissions, expiresAt } = req.body;
      
      const result = await advancedReportingService.shareReport(
        reportId,
        recipients,
        permissions,
        expiresAt
      );
      
      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error('[AnalyticsController] Error sharing report:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new AnalyticsController();










