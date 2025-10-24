import { Request, Response } from 'express';
import revenueRecognitionService from '../services/revenueRecognitionService';

export class RevenueRecognitionController {
  // Recognize Revenue
  async recognizeRevenue(req: Request, res: Response) {
    try {
      const { contractId } = req.params;
      const recognitionData = req.body;

      const result = await revenueRecognitionService.recognizeRevenue(
        contractId,
        recognitionData
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

  // Track Performance Obligation
  async trackPerformanceObligation(req: Request, res: Response) {
    try {
      const { obligationId } = req.params;
      const completionData = req.body;

      const result = await revenueRecognitionService.trackPerformanceObligation(
        obligationId,
        completionData
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

  // Handle Contract Modification
  async handleContractModification(req: Request, res: Response) {
    try {
      const { contractId } = req.params;
      const modificationData = req.body;

      const result = await revenueRecognitionService.handleContractModification(
        contractId,
        modificationData
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

  // Handle Multi-Element Arrangement
  async handleMultiElementArrangement(req: Request, res: Response) {
    try {
      const { contractId } = req.params;
      const elements = req.body.elements;

      const result = await revenueRecognitionService.handleMultiElementArrangement(
        contractId,
        elements
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

  // Recognize Usage-Based Revenue
  async recognizeUsageBasedRevenue(req: Request, res: Response) {
    try {
      const { contractId } = req.params;
      const usageData = req.body;

      const result = await revenueRecognitionService.recognizeUsageBasedRevenue(
        contractId,
        usageData
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

  // Generate Revenue Waterfall Report
  async generateRevenueWaterfallReport(req: Request, res: Response) {
    try {
      const { contractId } = req.params;
      const { startDate, endDate } = req.query;

      const result = await revenueRecognitionService.generateRevenueWaterfallReport(
        contractId,
        new Date(startDate as string),
        new Date(endDate as string)
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

  // Check Renewal Alerts
  async checkRenewalAlerts(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const alerts = await revenueRecognitionService.checkRenewalAlerts(userId);

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
}

export default new RevenueRecognitionController();







