import { Request, Response } from 'express';
import { AdvancedFraudService } from '../services/advancedFraudService';
import { GhostEmployeeService } from '../services/ghostEmployeeService';
import { BenfordAnalysisService } from '../services/benfordAnalysisService';
import { logger } from '../utils/logger';

const advancedFraudService = new AdvancedFraudService();
const ghostEmployeeService = new GhostEmployeeService();
const benfordAnalysisService = new BenfordAnalysisService();

export class FraudController {
  /**
   * Get fraud detection dashboard
   */
  async getFraudDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await advancedFraudService.getFraudDashboard(companyId);

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      logger.error('Error getting fraud dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting fraud dashboard',
        error: error.message
      });
    }
  }

  /**
   * Detect ghost employees
   */
  async detectGhostEmployees(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const ghostEmployees = await ghostEmployeeService.detectGhostEmployees(companyId);

      res.json({
        success: true,
        data: ghostEmployees
      });
    } catch (error) {
      logger.error('Error detecting ghost employees:', error);
      res.status(500).json({
        success: false,
        message: 'Error detecting ghost employees',
        error: error.message
      });
    }
  }

  /**
   * Get ghost employee dashboard
   */
  async getGhostEmployeeDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await ghostEmployeeService.getGhostEmployeeDashboard(companyId);

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      logger.error('Error getting ghost employee dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting ghost employee dashboard',
        error: error.message
      });
    }
  }

  /**
   * Detect split transactions
   */
  async detectSplitTransactions(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const splitTransactions = await advancedFraudService.detectSplitTransactions(companyId);

      res.json({
        success: true,
        data: splitTransactions
      });
    } catch (error) {
      logger.error('Error detecting split transactions:', error);
      res.status(500).json({
        success: false,
        message: 'Error detecting split transactions',
        error: error.message
      });
    }
  }

  /**
   * Detect duplicate invoices
   */
  async detectDuplicateInvoices(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const duplicateInvoices = await advancedFraudService.detectDuplicateInvoices(companyId);

      res.json({
        success: true,
        data: duplicateInvoices
      });
    } catch (error) {
      logger.error('Error detecting duplicate invoices:', error);
      res.status(500).json({
        success: false,
        message: 'Error detecting duplicate invoices',
        error: error.message
      });
    }
  }

  /**
   * Detect round number transactions
   */
  async detectRoundNumberTransactions(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const roundNumberTransactions = await advancedFraudService.detectRoundNumberTransactions(companyId);

      res.json({
        success: true,
        data: roundNumberTransactions
      });
    } catch (error) {
      logger.error('Error detecting round number transactions:', error);
      res.status(500).json({
        success: false,
        message: 'Error detecting round number transactions',
        error: error.message
      });
    }
  }

  /**
   * Verify vendor existence
   */
  async verifyVendorExistence(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const suspiciousVendors = await advancedFraudService.verifyVendorExistence(companyId);

      res.json({
        success: true,
        data: suspiciousVendors
      });
    } catch (error) {
      logger.error('Error verifying vendor existence:', error);
      res.status(500).json({
        success: false,
        message: 'Error verifying vendor existence',
        error: error.message
      });
    }
  }

  /**
   * Run comprehensive fraud detection
   */
  async runComprehensiveFraudDetection(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const results = await advancedFraudService.runComprehensiveFraudDetection(companyId);

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      logger.error('Error running comprehensive fraud detection:', error);
      res.status(500).json({
        success: false,
        message: 'Error running comprehensive fraud detection',
        error: error.message
      });
    }
  }

  /**
   * Resolve fraud detection
   */
  async resolveFraudDetection(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { detectionId } = req.params;
      const resolution = req.body;

      if (!resolution.notes || !resolution.type) {
        res.status(400).json({
          success: false,
          message: 'Resolution notes and type are required'
        });
        return;
      }

      const updatedDetection = await advancedFraudService.resolveFraudDetection(companyId, detectionId, resolution);

      res.json({
        success: true,
        data: updatedDetection
      });
    } catch (error) {
      logger.error('Error resolving fraud detection:', error);
      res.status(500).json({
        success: false,
        message: 'Error resolving fraud detection',
        error: error.message
      });
    }
  }

  /**
   * Perform Benford's Law analysis
   */
  async performBenfordAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { dataType } = req.params;

      if (!dataType) {
        res.status(400).json({
          success: false,
          message: 'Data type is required'
        });
        return;
      }

      const analysis = await benfordAnalysisService.performBenfordAnalysis(companyId, dataType);

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      logger.error('Error performing Benford analysis:', error);
      res.status(500).json({
        success: false,
        message: 'Error performing Benford analysis',
        error: error.message
      });
    }
  }

  /**
   * Get Benford analysis dashboard
   */
  async getBenfordDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await benfordAnalysisService.getBenfordDashboard(companyId);

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      logger.error('Error getting Benford dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting Benford dashboard',
        error: error.message
      });
    }
  }

  /**
   * Run comprehensive Benford analysis
   */
  async runComprehensiveBenfordAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const results = await benfordAnalysisService.runComprehensiveBenfordAnalysis(companyId);

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      logger.error('Error running comprehensive Benford analysis:', error);
      res.status(500).json({
        success: false,
        message: 'Error running comprehensive Benford analysis',
        error: error.message
      });
    }
  }

  /**
   * Get Benford analysis report
   */
  async getBenfordAnalysisReport(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { analysisId } = req.params;

      if (!analysisId) {
        res.status(400).json({
          success: false,
          message: 'Analysis ID is required'
        });
        return;
      }

      const report = await benfordAnalysisService.getBenfordAnalysisReport(companyId, analysisId);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error('Error getting Benford analysis report:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting Benford analysis report',
        error: error.message
      });
    }
  }

  /**
   * Get Benford trends
   */
  async getBenfordTrends(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { days = '30' } = req.query;

      const trends = await benfordAnalysisService.getBenfordTrends(companyId, parseInt(days as string));

      res.json({
        success: true,
        data: trends
      });
    } catch (error) {
      logger.error('Error getting Benford trends:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting Benford trends',
        error: error.message
      });
    }
  }

  /**
   * Resolve ghost employee report
   */
  async resolveGhostEmployeeReport(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { reportId } = req.params;
      const resolution = req.body;

      if (!resolution.notes || !resolution.type) {
        res.status(400).json({
          success: false,
          message: 'Resolution notes and type are required'
        });
        return;
      }

      const updatedReport = await ghostEmployeeService.resolveGhostEmployeeReport(companyId, reportId, resolution);

      res.json({
        success: true,
        data: updatedReport
      });
    } catch (error) {
      logger.error('Error resolving ghost employee report:', error);
      res.status(500).json({
        success: false,
        message: 'Error resolving ghost employee report',
        error: error.message
      });
    }
  }

  /**
   * Get ghost employee trends
   */
  async getGhostEmployeeTrends(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { days = '30' } = req.query;

      const trends = await ghostEmployeeService.getGhostEmployeeTrends(companyId, parseInt(days as string));

      res.json({
        success: true,
        data: trends
      });
    } catch (error) {
      logger.error('Error getting ghost employee trends:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting ghost employee trends',
        error: error.message
      });
    }
  }

  /**
   * Get fraud detection statistics
   */
  async getFraudStats(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { period = '30' } = req.query;

      const stats = await advancedFraudService.getFraudStats(companyId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error getting fraud stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting fraud stats',
        error: error.message
      });
    }
  }

  /**
   * Get recent fraud detections
   */
  async getRecentFraudDetections(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { limit = '20' } = req.query;

      const detections = await advancedFraudService.getRecentDetections(companyId);

      res.json({
        success: true,
        data: detections
      });
    } catch (error) {
      logger.error('Error getting recent fraud detections:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting recent fraud detections',
        error: error.message
      });
    }
  }

  /**
   * Get fraud risk analysis
   */
  async getFraudRiskAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const riskAnalysis = await advancedFraudService.getRiskAnalysis(companyId);

      res.json({
        success: true,
        data: riskAnalysis
      });
    } catch (error) {
      logger.error('Error getting fraud risk analysis:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting fraud risk analysis',
        error: error.message
      });
    }
  }
}