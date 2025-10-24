import { Request, Response } from 'express';
import cashFlowForecastService from '../services/cashFlowForecastService';

export class CashFlowForecastController {
  // Generate Cash Flow Forecast
  async generateCashFlowForecast(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { forecastDays } = req.query;

      const forecast = await cashFlowForecastService.generateCashFlowForecast(
        userId,
        parseInt(forecastDays as string) || 90
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

  // Analyze Renewal Patterns
  async analyzeRenewalPatterns(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { months } = req.query;

      const patterns = await cashFlowForecastService.analyzeRenewalPatterns(
        userId,
        parseInt(months as string) || 12
      );

      res.json({
        success: true,
        data: patterns
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Detect Seasonal Trends
  async detectSeasonalTrends(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { years } = req.query;

      const trends = await cashFlowForecastService.detectSeasonalTrends(
        userId,
        parseInt(years as string) || 2
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

  // Model Churn Scenarios
  async modelChurnScenarios(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { baseChurnRate } = req.body;

      const scenarios = await cashFlowForecastService.modelChurnScenarios(
        userId,
        baseChurnRate
      );

      res.json({
        success: true,
        data: scenarios
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Calculate Runway
  async calculateRunway(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { currentCash, monthlyBurnRate } = req.body;

      const runway = await cashFlowForecastService.calculateRunway(
        userId,
        currentCash,
        monthlyBurnRate
      );

      res.json({
        success: true,
        data: runway
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Check Cash Shortage Alerts
  async checkCashShortageAlerts(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const alerts = await cashFlowForecastService.checkCashShortageAlerts(userId);

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

  // Run What-If Scenario
  async runWhatIfScenario(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const scenarioData = req.body;

      const scenarios = await cashFlowForecastService.runWhatIfScenario(
        userId,
        scenarioData
      );

      res.json({
        success: true,
        data: scenarios
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Run Monte Carlo Simulation
  async runMonteCarloSimulation(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { iterations } = req.query;

      const simulation = await cashFlowForecastService.runMonteCarloSimulation(
        userId,
        parseInt(iterations as string) || 1000
      );

      res.json({
        success: true,
        data: simulation
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new CashFlowForecastController();






