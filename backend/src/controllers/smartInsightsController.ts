import { Request, Response } from 'express';
import smartInsightsService from '../services/smartInsightsService';

export class SmartInsightsController {
  // Generate Proactive Notifications
  async generateProactiveNotifications(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const notifications = await smartInsightsService.generateProactiveNotifications(userId);

      res.json({
        success: true,
        data: notifications
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Detect Trends
  async detectTrends(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { timePeriod } = req.query;

      const trends = await smartInsightsService.detectTrends(
        userId,
        (timePeriod as string) || 'month'
      );

      res.json({
        success: true,
        data: trends
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Generate Recommendations
  async generateRecommendations(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const recommendations = await smartInsightsService.generateRecommendations(userId);

      res.json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Monitor Performance Thresholds
  async monitorPerformanceThresholds(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const alerts = await smartInsightsService.monitorPerformanceThresholds(userId);

      res.json({
        success: true,
        data: alerts
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Generate Benchmarking Insights
  async generateBenchmarkingInsights(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const benchmarking = await smartInsightsService.generateBenchmarkingInsights(userId);

      res.json({
        success: true,
        data: benchmarking
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Track Goal Progress
  async trackGoalProgress(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const progress = await smartInsightsService.trackGoalProgress(userId);

      res.json({
        success: true,
        data: progress
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Generate Smart Insights Dashboard
  async generateSmartInsightsDashboard(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const dashboard = await smartInsightsService.generateSmartInsightsDashboard(userId);

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new SmartInsightsController();







