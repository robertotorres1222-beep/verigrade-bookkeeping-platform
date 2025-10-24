import { Request, Response } from 'express';
import budgetActualService from '../services/budgetActualService';

export class BudgetActualController {
  // Create Budget
  async createBudget(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const budgetData = req.body;

      const result = await budgetActualService.createBudget(
        userId,
        budgetData
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

  // Analyze Variance
  async analyzeVariance(req: Request, res: Response) {
    try {
      const { userId, budgetId } = req.params;
      const { period } = req.body;

      const result = await budgetActualService.analyzeVariance(
        userId,
        budgetId,
        period
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

  // Get Budget Templates
  async getBudgetTemplates(req: Request, res: Response) {
    try {
      const { industry } = req.query;

      const result = await budgetActualService.getBudgetTemplates(
        industry as string
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

  // Create Rolling Forecast
  async createRollingForecast(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const forecastData = req.body;

      const result = await budgetActualService.createRollingForecast(
        userId,
        forecastData
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

  // Create Budget Approval Workflow
  async createBudgetApprovalWorkflow(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const workflowData = req.body;

      const result = await budgetActualService.createBudgetApprovalWorkflow(
        userId,
        workflowData
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

  // Setup Budget Alerts
  async setupBudgetAlerts(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const alertData = req.body;

      const result = await budgetActualService.setupBudgetAlerts(
        userId,
        alertData
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

  // Get Budget Actual Dashboard
  async getBudgetActualDashboard(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const result = await budgetActualService.getBudgetActualDashboard(userId);

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

  // Get Budget Performance Analytics
  async getBudgetPerformanceAnalytics(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { period } = req.query;

      const result = await budgetActualService.getBudgetPerformanceAnalytics(
        userId,
        period as any
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
}

export default new BudgetActualController();







