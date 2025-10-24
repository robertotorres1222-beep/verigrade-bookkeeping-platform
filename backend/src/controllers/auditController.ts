import { Request, Response } from 'express';
import { AuditService } from '../services/auditService';
import { logger } from '../utils/logger';

const auditService = new AuditService();

export class AuditController {
  /**
   * Create audit trail entry
   */
  async createAuditTrail(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const auditData = req.body;

      if (!auditData.entityType || !auditData.entityId || !auditData.action) {
        res.status(400).json({
          success: false,
          message: 'Entity type, entity ID, and action are required'
        });
        return;
      }

      const auditTrail = await auditService.createAuditTrail(companyId, auditData);

      res.json({
        success: true,
        data: auditTrail
      });
    } catch (error) {
      logger.error('Error creating audit trail:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating audit trail',
        error: error.message
      });
    }
  }

  /**
   * Get audit trails
   */
  async getAuditTrails(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { entityType, entityId, action, userId, startDate, endDate, limit } = req.query;

      const filters = {
        entityType,
        entityId,
        action,
        userId,
        startDate,
        endDate,
        limit: limit ? parseInt(limit as string) : undefined
      };

      const auditTrails = await auditService.getAuditTrails(companyId, filters);

      res.json({
        success: true,
        data: auditTrails
      });
    } catch (error) {
      logger.error('Error getting audit trails:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting audit trails',
        error: error.message
      });
    }
  }

  /**
   * Get audit trail by ID
   */
  async getAuditTrail(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { auditTrailId } = req.params;

      if (!auditTrailId) {
        res.status(400).json({
          success: false,
          message: 'Audit trail ID is required'
        });
        return;
      }

      const auditTrail = await auditService.getAuditTrail(auditTrailId, companyId);

      res.json({
        success: true,
        data: auditTrail
      });
    } catch (error) {
      logger.error('Error getting audit trail:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting audit trail',
        error: error.message
      });
    }
  }

  /**
   * Verify audit trail integrity
   */
  async verifyAuditTrail(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { auditTrailId } = req.params;

      if (!auditTrailId) {
        res.status(400).json({
          success: false,
          message: 'Audit trail ID is required'
        });
        return;
      }

      const verification = await auditService.verifyAuditTrail(auditTrailId, companyId);

      res.json({
        success: true,
        data: verification
      });
    } catch (error) {
      logger.error('Error verifying audit trail:', error);
      res.status(500).json({
        success: false,
        message: 'Error verifying audit trail',
        error: error.message
      });
    }
  }

  /**
   * Get audit dashboard
   */
  async getAuditDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await auditService.getAuditDashboard(companyId);

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      logger.error('Error getting audit dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting audit dashboard',
        error: error.message
      });
    }
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await auditService.getAuditDashboard(companyId);
      const auditStats = dashboard.auditStats;

      res.json({
        success: true,
        data: auditStats
      });
    } catch (error) {
      logger.error('Error getting audit stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting audit stats',
        error: error.message
      });
    }
  }

  /**
   * Get recent audits
   */
  async getRecentAudits(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { limit = '20' } = req.query;

      const dashboard = await auditService.getAuditDashboard(companyId);
      const recentAudits = dashboard.recentAudits;

      res.json({
        success: true,
        data: recentAudits
      });
    } catch (error) {
      logger.error('Error getting recent audits:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting recent audits',
        error: error.message
      });
    }
  }

  /**
   * Get audit summary
   */
  async getAuditSummary(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await auditService.getAuditDashboard(companyId);
      const auditSummary = dashboard.auditSummary;

      res.json({
        success: true,
        data: auditSummary
      });
    } catch (error) {
      logger.error('Error getting audit summary:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting audit summary',
        error: error.message
      });
    }
  }

  /**
   * Get integrity report
   */
  async getIntegrityReport(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await auditService.getAuditDashboard(companyId);
      const integrityReport = dashboard.integrityReport;

      res.json({
        success: true,
        data: integrityReport
      });
    } catch (error) {
      logger.error('Error getting integrity report:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting integrity report',
        error: error.message
      });
    }
  }

  /**
   * Get audit analytics
   */
  async getAuditAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const analytics = await auditService.getAuditAnalytics(companyId);

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('Error getting audit analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting audit analytics',
        error: error.message
      });
    }
  }

  /**
   * Get audit insights
   */
  async getAuditInsights(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const insights = await auditService.getAuditInsights(companyId);

      res.json({
        success: true,
        data: insights
      });
    } catch (error) {
      logger.error('Error getting audit insights:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting audit insights',
        error: error.message
      });
    }
  }

  /**
   * Export audit trails
   */
  async exportAuditTrails(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { entityType, entityId, action, userId, startDate, endDate } = req.query;

      const filters = {
        entityType,
        entityId,
        action,
        userId,
        startDate,
        endDate
      };

      const exportData = await auditService.exportAuditTrails(companyId, filters);

      res.json({
        success: true,
        data: exportData
      });
    } catch (error) {
      logger.error('Error exporting audit trails:', error);
      res.status(500).json({
        success: false,
        message: 'Error exporting audit trails',
        error: error.message
      });
    }
  }

  /**
   * Clean up old audit trails
   */
  async cleanupOldAuditTrails(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { retentionDays = 2555 } = req.body; // Default 7 years

      const cleanupResult = await auditService.cleanupOldAuditTrails(companyId, retentionDays);

      res.json({
        success: true,
        data: cleanupResult
      });
    } catch (error) {
      logger.error('Error cleaning up old audit trails:', error);
      res.status(500).json({
        success: false,
        message: 'Error cleaning up old audit trails',
        error: error.message
      });
    }
  }
}