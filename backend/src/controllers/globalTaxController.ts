import { Request, Response } from 'express';
import globalTaxService from '../services/globalTaxService';

export class GlobalTaxController {
  // Monitor Economic Nexus
  async monitorEconomicNexus(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { jurisdiction } = req.query;

      const result = await globalTaxService.monitorEconomicNexus(
        userId,
        jurisdiction as string
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

  // Check DST Compliance
  async checkDSTCompliance(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { country } = req.query;

      const result = await globalTaxService.checkDSTCompliance(
        userId,
        country as string
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

  // Detect Reverse Charge
  async detectReverseCharge(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const transaction = req.body;

      const result = await globalTaxService.detectReverseCharge(
        userId,
        transaction
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

  // Calculate VAT by Location
  async calculateVATByLocation(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const transaction = req.body;

      const result = await globalTaxService.calculateVATByLocation(
        userId,
        transaction
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

  // Generate Tax Optimization Suggestions
  async generateTaxOptimizationSuggestions(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const result = await globalTaxService.generateTaxOptimizationSuggestions(userId);

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

  // Calculate Sales Tax by Jurisdiction
  async calculateSalesTaxByJurisdiction(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const transaction = req.body;

      const result = await globalTaxService.calculateSalesTaxByJurisdiction(
        userId,
        transaction
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

  // Track Tax Filing Deadlines
  async trackTaxFilingDeadlines(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const result = await globalTaxService.trackTaxFilingDeadlines(userId);

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

  // Generate Tax Forms
  async generateTaxForms(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { formType, period } = req.body;

      const result = await globalTaxService.generateTaxForms(
        userId,
        formType,
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

  // Get Global Tax Dashboard
  async getGlobalTaxDashboard(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const result = await globalTaxService.getGlobalTaxDashboard(userId);

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

export default new GlobalTaxController();






