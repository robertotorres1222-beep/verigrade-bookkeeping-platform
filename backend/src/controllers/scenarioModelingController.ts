import { Request, Response } from 'express';
import scenarioModelingService from '../services/scenarioModelingService';

export class ScenarioModelingController {
  // Run What-If Scenario
  async runWhatIfScenario(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const scenarioData = req.body;

      const result = await scenarioModelingService.runWhatIfScenario(
        userId,
        scenarioData
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Model Price Increase Impact
  async modelPriceIncreaseImpact(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const priceIncreaseData = req.body;

      const result = await scenarioModelingService.modelPriceIncreaseImpact(
        userId,
        priceIncreaseData
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Model Churn Reduction Scenario
  async modelChurnReductionScenario(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const churnReductionData = req.body;

      const result = await scenarioModelingService.modelChurnReductionScenario(
        userId,
        churnReductionData
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Calculate Funding Runway
  async calculateFundingRunway(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const fundingData = req.body;

      const result = await scenarioModelingService.calculateFundingRunway(
        userId,
        fundingData
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Project Break-Even Timeline
  async projectBreakEvenTimeline(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const breakEvenData = req.body;

      const result = await scenarioModelingService.projectBreakEvenTimeline(
        userId,
        breakEvenData
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Analyze Hiring Impact
  async analyzeHiringImpact(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const hiringData = req.body;

      const result = await scenarioModelingService.analyzeHiringImpact(
        userId,
        hiringData
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Model Expense Optimization
  async modelExpenseOptimization(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const optimizationData = req.body;

      const result = await scenarioModelingService.modelExpenseOptimization(
        userId,
        optimizationData
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Model Growth Trajectory
  async modelGrowthTrajectory(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const growthData = req.body;

      const result = await scenarioModelingService.modelGrowthTrajectory(
        userId,
        growthData
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get Scenario Dashboard
  async getScenarioDashboard(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const result = await scenarioModelingService.getScenarioDashboard(userId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new ScenarioModelingController();










