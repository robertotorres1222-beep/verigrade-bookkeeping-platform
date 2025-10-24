import { Request, Response } from 'express';
import complianceAutomationService from '../services/complianceAutomationService';

export class ComplianceAutomationController {
  // Check Industry Compliance
  async checkIndustryCompliance(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { industry, standard } = req.query;

      const result = await complianceAutomationService.checkIndustryCompliance(
        userId,
        industry as string,
        standard as string
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

  // Generate Compliance Report
  async generateComplianceReport(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { reportType, period } = req.body;

      const result = await complianceAutomationService.generateComplianceReport(
        userId,
        reportType,
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

  // Track Regulatory Changes
  async trackRegulatoryChanges(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { jurisdictions } = req.body;

      const result = await complianceAutomationService.trackRegulatoryChanges(
        userId,
        jurisdictions
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

  // Generate Compliance Scorecard
  async generateComplianceScorecard(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const result = await complianceAutomationService.generateComplianceScorecard(userId);

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

  // Prepare Audit Materials
  async prepareAuditMaterials(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { auditType } = req.body;

      const result = await complianceAutomationService.prepareAuditMaterials(
        userId,
        auditType
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

  // Check SOC 2 Compliance
  async checkSOC2Compliance(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const result = await complianceAutomationService.checkSOC2Compliance(userId);

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

  // Check GDPR Compliance
  async checkGDPRCompliance(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const result = await complianceAutomationService.checkGDPRCompliance(userId);

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

  // Check PCI DSS Compliance
  async checkPCIDSSCompliance(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const result = await complianceAutomationService.checkPCIDSSCompliance(userId);

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

  // Get Compliance Dashboard
  async getComplianceDashboard(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const result = await complianceAutomationService.getComplianceDashboard(userId);

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

export default new ComplianceAutomationController();







