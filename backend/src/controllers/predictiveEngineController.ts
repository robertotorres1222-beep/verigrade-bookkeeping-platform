import { Request, Response } from 'express';
import predictiveEngineService from '../services/predictiveEngineService';

export class PredictiveEngineController {
  // Predict Customer Churn
  async predictCustomerChurn(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { customerId } = req.query;

      const predictions = await predictiveEngineService.predictCustomerChurn(
        userId,
        customerId as string
      );

      res.json({
        success: true,
        data: predictions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Detect Expansion Opportunities
  async detectExpansionOpportunities(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const opportunities = await predictiveEngineService.detectExpansionOpportunities(userId);

      res.json({
        success: true,
        data: opportunities
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Calculate Downturn Risk
  async calculateDownturnRisk(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const risk = await predictiveEngineService.calculateDownturnRisk(userId);

      res.json({
        success: true,
        data: risk
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Predict Payment Failures
  async predictPaymentFailures(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { days } = req.query;

      const predictions = await predictiveEngineService.predictPaymentFailures(
        userId,
        parseInt(days as string) || 30
      );

      res.json({
        success: true,
        data: predictions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Predict Customer LTV
  async predictCustomerLTV(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { customerId } = req.query;

      const predictions = await predictiveEngineService.predictCustomerLTV(
        userId,
        customerId as string
      );

      res.json({
        success: true,
        data: predictions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Forecast Growth Trajectory
  async forecastGrowthTrajectory(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { months } = req.query;

      const forecast = await predictiveEngineService.forecastGrowthTrajectory(
        userId,
        parseInt(months as string) || 12
      );

      res.json({
        success: true,
        data: forecast
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Generate SaaS Predictive Insights
  async generateSaaSPredictiveInsights(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const insights = await predictiveEngineService.generateSaaSPredictiveInsights(userId);

      res.json({
        success: true,
        data: insights
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new PredictiveEngineController();










