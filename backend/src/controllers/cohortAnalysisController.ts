import { Request, Response } from 'express';
import cohortAnalysisService from '../services/cohortAnalysisService';

export class CohortAnalysisController {
  // Create Cohort
  async createCohort(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const cohortData = req.body;

      const cohort = await cohortAnalysisService.createCohort(userId, cohortData);

      res.json({
        success: true,
        data: cohort
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Analyze Cohort Retention
  async analyzeCohortRetention(req: Request, res: Response) {
    try {
      const { userId, cohortId } = req.params;
      const { periods } = req.query;

      const retention = await cohortAnalysisService.analyzeCohortRetention(
        userId,
        cohortId,
        parseInt(periods as string) || 12
      );

      res.json({
        success: true,
        data: retention
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Calculate Cohort Revenue
  async calculateCohortRevenue(req: Request, res: Response) {
    try {
      const { userId, cohortId } = req.params;
      const { periods } = req.query;

      const revenue = await cohortAnalysisService.calculateCohortRevenue(
        userId,
        cohortId,
        parseInt(periods as string) || 12
      );

      res.json({
        success: true,
        data: revenue
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Track Cohort Expansion
  async trackCohortExpansion(req: Request, res: Response) {
    try {
      const { userId, cohortId } = req.params;
      const { periods } = req.query;

      const expansion = await cohortAnalysisService.trackCohortExpansion(
        userId,
        cohortId,
        parseInt(periods as string) || 12
      );

      res.json({
        success: true,
        data: expansion
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Analyze Cohort Churn
  async analyzeCohortChurn(req: Request, res: Response) {
    try {
      const { userId, cohortId } = req.params;
      const { periods } = req.query;

      const churn = await cohortAnalysisService.analyzeCohortChurn(
        userId,
        cohortId,
        parseInt(periods as string) || 12
      );

      res.json({
        success: true,
        data: churn
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Calculate Cohort LTV
  async calculateCohortLTV(req: Request, res: Response) {
    try {
      const { userId, cohortId } = req.params;

      const ltv = await cohortAnalysisService.calculateCohortLTV(userId, cohortId);

      res.json({
        success: true,
        data: ltv
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Generate Cohort Comparison Report
  async generateCohortComparisonReport(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { cohortIds } = req.body;

      const comparison = await cohortAnalysisService.generateCohortComparisonReport(
        userId,
        cohortIds
      );

      res.json({
        success: true,
        data: comparison
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new CohortAnalysisController();







