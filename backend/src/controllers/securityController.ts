import { Request, Response } from 'express';
import { securityService } from '../services/securityService';
import logger from '../utils/logger';

export class SecurityController {
  // SOC 2 Documentation
  async generateSOC2Docs(req: Request, res: Response): Promise<void> {
    try {
      const docs = await securityService.generateSOC2Docs();
      res.json({ success: true, data: docs, message: 'SOC 2 docs generated successfully' });
    } catch (error) {
      logger.error('Error generating SOC 2 docs', { error });
      res.status(500).json({ success: false, message: 'Failed to generate SOC 2 docs' });
    }
  }

  async collectSOC2Evidence(req: Request, res: Response): Promise<void> {
    try {
      const { evidenceType } = req.body;
      const evidence = await securityService.collectSOC2Evidence(evidenceType);
      res.json({ success: true, data: evidence, message: 'SOC 2 evidence collected successfully' });
    } catch (error) {
      logger.error('Error collecting SOC 2 evidence', { error });
      res.status(500).json({ success: false, message: 'Failed to collect SOC 2 evidence' });
    }
  }

  // GDPR Tools
  async implementGDPRTools(req: Request, res: Response): Promise<void> {
    try {
      await securityService.implementGDPRTools();
      res.json({ success: true, message: 'GDPR tools implemented successfully' });
    } catch (error) {
      logger.error('Error implementing GDPR tools', { error });
      res.status(500).json({ success: false, message: 'Failed to implement GDPR tools' });
    }
  }

  async getGDPRStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await securityService.getGDPRStatus();
      res.json({ success: true, data: status, message: 'GDPR status retrieved successfully' });
    } catch (error) {
      logger.error('Error getting GDPR status', { error });
      res.status(500).json({ success: false, message: 'Failed to get GDPR status' });
    }
  }

  // PCI Compliance
  async ensurePCICompliance(req: Request, res: Response): Promise<void> {
    try {
      await securityService.ensurePCICompliance();
      res.json({ success: true, message: 'PCI compliance ensured successfully' });
    } catch (error) {
      logger.error('Error ensuring PCI compliance', { error });
      res.status(500).json({ success: false, message: 'Failed to ensure PCI compliance' });
    }
  }

  async getPCIStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await securityService.getPCIStatus();
      res.json({ success: true, data: status, message: 'PCI status retrieved successfully' });
    } catch (error) {
      logger.error('Error getting PCI status', { error });
      res.status(500).json({ success: false, message: 'Failed to get PCI status' });
    }
  }

  // Penetration Testing
  async runPenetrationTest(req: Request, res: Response): Promise<void> {
    try {
      const results = await securityService.runPenetrationTest();
      res.json({ success: true, data: results, message: 'Penetration test completed successfully' });
    } catch (error) {
      logger.error('Error running penetration test', { error });
      res.status(500).json({ success: false, message: 'Failed to run penetration test' });
    }
  }

  async getPenetrationTestResults(req: Request, res: Response): Promise<void> {
    try {
      const results = await securityService.getPenetrationTestResults();
      res.json({ success: true, data: results, message: 'Penetration test results retrieved successfully' });
    } catch (error) {
      logger.error('Error getting penetration test results', { error });
      res.status(500).json({ success: false, message: 'Failed to get penetration test results' });
    }
  }

  // Audit Trails
  async createAuditTrail(req: Request, res: Response): Promise<void> {
    try {
      const { action, userId, details } = req.body;
      await securityService.createAuditTrail(action, userId, details);
      res.json({ success: true, message: 'Audit trail created successfully' });
    } catch (error) {
      logger.error('Error creating audit trail', { error });
      res.status(500).json({ success: false, message: 'Failed to create audit trail' });
    }
  }

  async getAuditTrails(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, userId, action } = req.query;
      const auditTrails = await securityService.getAuditTrails({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        userId: userId as string,
        action: action as string,
      });
      res.json({ success: true, data: auditTrails, message: 'Audit trails retrieved successfully' });
    } catch (error) {
      logger.error('Error getting audit trails', { error });
      res.status(500).json({ success: false, message: 'Failed to get audit trails' });
    }
  }
}

export const securityController = new SecurityController();