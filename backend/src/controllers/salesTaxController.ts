import { Request, Response } from 'express';
import salesTaxService from '../services/salesTaxService';

export class SalesTaxController {
  // Calculate Sales Tax
  async calculateSalesTax(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const transactionData = req.body;

      const result = await salesTaxService.calculateSalesTax(
        userId,
        transactionData
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

  // Get Tax Rates by Address
  async getTaxRatesByAddress(req: Request, res: Response) {
    try {
      const { address } = req.body;

      const result = await salesTaxService.getTaxRatesByAddress(address);

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

  // Get Product Taxability Rules
  async getProductTaxabilityRules(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { jurisdiction } = req.query;

      const result = await salesTaxService.getProductTaxabilityRules(
        productId,
        jurisdiction as any
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

  // Process Tax Exemption
  async processTaxExemption(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const exemptionData = req.body;

      const result = await salesTaxService.processTaxExemption(
        userId,
        exemptionData
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

  // Track Tax Liability
  async trackTaxLiability(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { period } = req.body;

      const result = await salesTaxService.trackTaxLiability(
        userId,
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

  // Automate Sales Tax Filing
  async automateSalesTaxFiling(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const filingData = req.body;

      const result = await salesTaxService.automateSalesTaxFiling(
        userId,
        filingData
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

  // Get Sales Tax Dashboard
  async getSalesTaxDashboard(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const result = await salesTaxService.getSalesTaxDashboard(userId);

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

  // Get Sales Tax Analytics
  async getSalesTaxAnalytics(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { period } = req.query;

      const result = await salesTaxService.getSalesTaxAnalytics(
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

export default new SalesTaxController();