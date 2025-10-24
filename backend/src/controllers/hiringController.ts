import { Request, Response } from 'express';
import { HiringPredictionService } from '../services/hiringPredictionService';
import { BottleneckAnalysisService } from '../services/bottleneckAnalysisService';
import { logger } from '../utils/logger';

const hiringPredictionService = new HiringPredictionService();
const bottleneckAnalysisService = new BottleneckAnalysisService();

export class HiringController {
  /**
   * Analyze hiring needs
   */
  async analyzeHiringNeeds(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const analysis = await hiringPredictionService.analyzeHiringNeeds(companyId);

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      logger.error('Error analyzing hiring needs:', error);
      res.status(500).json({
        success: false,
        message: 'Error analyzing hiring needs',
        error: error.message
      });
    }
  }

  /**
   * Get hiring dashboard
   */
  async getHiringDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await hiringPredictionService.getHiringDashboard(companyId);

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      logger.error('Error getting hiring dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting hiring dashboard',
        error: error.message
      });
    }
  }

  /**
   * Analyze bottlenecks
   */
  async analyzeBottlenecks(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const analysis = await bottleneckAnalysisService.analyzeBottlenecks(companyId);

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      logger.error('Error analyzing bottlenecks:', error);
      res.status(500).json({
        success: false,
        message: 'Error analyzing bottlenecks',
        error: error.message
      });
    }
  }

  /**
   * Get bottleneck dashboard
   */
  async getBottleneckDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await bottleneckAnalysisService.getBottleneckDashboard(companyId);

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      logger.error('Error getting bottleneck dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting bottleneck dashboard',
        error: error.message
      });
    }
  }

  /**
   * Get hiring scenarios
   */
  async getHiringScenarios(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const scenarios = await hiringPredictionService.getHiringScenarios(companyId);

      res.json({
        success: true,
        data: scenarios
      });
    } catch (error) {
      logger.error('Error getting hiring scenarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting hiring scenarios',
        error: error.message
      });
    }
  }

  /**
   * Save hiring analysis
   */
  async saveHiringAnalysis(req: Request, res: Response): Promise<void> {
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

      const analysis = await hiringPredictionService.saveHiringAnalysis(companyId, analysisData);

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      logger.error('Error saving hiring analysis:', error);
      res.status(500).json({
        success: false,
        message: 'Error saving hiring analysis',
        error: error.message
      });
    }
  }

  /**
   * Save bottleneck analysis
   */
  async saveBottleneckAnalysis(req: Request, res: Response): Promise<void> {
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

      const analysis = await bottleneckAnalysisService.saveBottleneckAnalysis(companyId, analysisData);

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      logger.error('Error saving bottleneck analysis:', error);
      res.status(500).json({
        success: false,
        message: 'Error saving bottleneck analysis',
        error: error.message
      });
    }
  }

  /**
   * Get hiring statistics
   */
  async getHiringStats(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { period = '30' } = req.query;

      const stats = await hiringPredictionService.getHiringStats(companyId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error getting hiring stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting hiring stats',
        error: error.message
      });
    }
  }

  /**
   * Get recent hiring analyses
   */
  async getRecentHiringAnalyses(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { limit = '20' } = req.query;

      const analyses = await hiringPredictionService.getRecentAnalyses(companyId);

      res.json({
        success: true,
        data: analyses
      });
    } catch (error) {
      logger.error('Error getting recent hiring analyses:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting recent hiring analyses',
        error: error.message
      });
    }
  }

  /**
   * Get department analysis
   */
  async getDepartmentAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const analysis = await hiringPredictionService.getDepartmentAnalysis(companyId);

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      logger.error('Error getting department analysis:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting department analysis',
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

      const trends = await hiringPredictionService.getTrendAnalysis(companyId);

      res.json({
        success: true,
        data: trends
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
   * Get bottleneck statistics
   */
  async getBottleneckStats(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const stats = await bottleneckAnalysisService.getBottleneckStats(companyId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error getting bottleneck stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting bottleneck stats',
        error: error.message
      });
    }
  }

  /**
   * Get recent bottleneck analyses
   */
  async getRecentBottleneckAnalyses(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { limit = '20' } = req.query;

      const analyses = await bottleneckAnalysisService.getRecentAnalyses(companyId);

      res.json({
        success: true,
        data: analyses
      });
    } catch (error) {
      logger.error('Error getting recent bottleneck analyses:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting recent bottleneck analyses',
        error: error.message
      });
    }
  }

  /**
   * Get bottleneck department analysis
   */
  async getBottleneckDepartmentAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const analysis = await bottleneckAnalysisService.getDepartmentAnalysis(companyId);

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      logger.error('Error getting bottleneck department analysis:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting bottleneck department analysis',
        error: error.message
      });
    }
  }

  /**
   * Get bottleneck trend analysis
   */
  async getBottleneckTrendAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { days = '30' } = req.query;

      const trends = await bottleneckAnalysisService.getTrendAnalysis(companyId);

      res.json({
        success: true,
        data: trends
      });
    } catch (error) {
      logger.error('Error getting bottleneck trend analysis:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting bottleneck trend analysis',
        error: error.message
      });
    }
  }

  /**
   * Get hiring recommendations
   */
  async getHiringRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const analysis = await hiringPredictionService.analyzeHiringNeeds(companyId);
      const recommendations = analysis.recommendations || [];

      res.json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      logger.error('Error getting hiring recommendations:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting hiring recommendations',
        error: error.message
      });
    }
  }

  /**
   * Get bottleneck recommendations
   */
  async getBottleneckRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const analysis = await bottleneckAnalysisService.analyzeBottlenecks(companyId);
      const recommendations = analysis.recommendations || [];

      res.json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      logger.error('Error getting bottleneck recommendations:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting bottleneck recommendations',
        error: error.message
      });
    }
  }
}