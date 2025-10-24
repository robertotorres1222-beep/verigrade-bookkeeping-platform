import { Request, Response } from 'express';
import saasMetricsService from '../services/saasMetricsService';

export class SaaSMetricsController {
  // Get SaaS Metrics Dashboard
  async getSaaSMetricsDashboard(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { date } = req.query;

      const dashboard = await saasMetricsService.getSaaSMetricsDashboard(
        userId,
        date ? new Date(date as string) : undefined
      );

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

  // Calculate MRR
  async calculateMRR(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { date } = req.query;

      const mrr = await saasMetricsService.calculateMRR(
        userId,
        date ? new Date(date as string) : undefined
      );

      res.json({
        success: true,
        data: mrr
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Calculate ARR
  async calculateARR(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { date } = req.query;

      const arr = await saasMetricsService.calculateARR(
        userId,
        date ? new Date(date as string) : undefined
      );

      res.json({
        success: true,
        data: arr
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Calculate NRR
  async calculateNRR(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { period } = req.query;

      const nrr = await saasMetricsService.calculateNRR(
        userId,
        (period as 'month' | 'quarter' | 'year') || 'month'
      );

      res.json({
        success: true,
        data: nrr
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Calculate GRR
  async calculateGRR(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { period } = req.query;

      const grr = await saasMetricsService.calculateGRR(
        userId,
        (period as 'month' | 'quarter' | 'year') || 'month'
      );

      res.json({
        success: true,
        data: grr
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Calculate Quick Ratio
  async calculateQuickRatio(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { date } = req.query;

      const quickRatio = await saasMetricsService.calculateQuickRatio(
        userId,
        date ? new Date(date as string) : undefined
      );

      res.json({
        success: true,
        data: quickRatio
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Calculate Rule of 40
  async calculateRuleOf40(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { period } = req.query;

      const ruleOf40 = await saasMetricsService.calculateRuleOf40(
        userId,
        (period as 'month' | 'quarter' | 'year') || 'month'
      );

      res.json({
        success: true,
        data: ruleOf40
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Calculate Magic Number
  async calculateMagicNumber(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { period } = req.query;

      const magicNumber = await saasMetricsService.calculateMagicNumber(
        userId,
        (period as 'month' | 'quarter' | 'year') || 'month'
      );

      res.json({
        success: true,
        data: magicNumber
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Calculate Burn Multiple
  async calculateBurnMultiple(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { period } = req.query;

      const burnMultiple = await saasMetricsService.calculateBurnMultiple(
        userId,
        (period as 'month' | 'quarter' | 'year') || 'month'
      );

      res.json({
        success: true,
        data: burnMultiple
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Calculate CAC Payback Period
  async calculateCACPaybackPeriod(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { channel } = req.query;

      const cacPayback = await saasMetricsService.calculateCACPaybackPeriod(
        userId,
        channel as string
      );

      res.json({
        success: true,
        data: cacPayback
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Calculate LTV:CAC Ratio
  async calculateLTVCACRatio(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { cohort } = req.query;

      const ltvCac = await saasMetricsService.calculateLTVCACRatio(
        userId,
        cohort as string
      );

      res.json({
        success: true,
        data: ltvCac
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new SaaSMetricsController();







