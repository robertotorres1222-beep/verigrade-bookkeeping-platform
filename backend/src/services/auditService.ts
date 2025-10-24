import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class AuditService {
  /**
   * Create audit trail entry
   */
  async createAuditTrail(companyId: string, auditData: any): Promise<any> {
    try {
      // Generate SHA-256 hash of the audit data
      const auditHash = this.generateAuditHash(auditData);
      
      // Create audit trail entry
      const auditTrail = await prisma.auditTrail.create({
        data: {
          companyId,
          entityType: auditData.entityType,
          entityId: auditData.entityId,
          action: auditData.action,
          userId: auditData.userId,
          userEmail: auditData.userEmail,
          ipAddress: auditData.ipAddress,
          userAgent: auditData.userAgent,
          beforeData: JSON.stringify(auditData.beforeData || {}),
          afterData: JSON.stringify(auditData.afterData || {}),
          changes: JSON.stringify(auditData.changes || []),
          auditHash,
          metadata: JSON.stringify(auditData.metadata || {}),
          createdAt: new Date()
        }
      });

      return auditTrail;
    } catch (error) {
      logger.error('Error creating audit trail:', error);
      throw error;
    }
  }

  /**
   * Generate SHA-256 hash for audit data
   */
  private generateAuditHash(auditData: any): string {
    const hashData = {
      companyId: auditData.companyId,
      entityType: auditData.entityType,
      entityId: auditData.entityId,
      action: auditData.action,
      userId: auditData.userId,
      timestamp: new Date().toISOString(),
      beforeData: auditData.beforeData,
      afterData: auditData.afterData
    };

    const hashString = JSON.stringify(hashData);
    return crypto.createHash('sha256').update(hashString).digest('hex');
  }

  /**
   * Verify audit trail integrity
   */
  async verifyAuditTrail(auditTrailId: string, companyId: string): Promise<any> {
    try {
      const auditTrail = await prisma.auditTrail.findFirst({
        where: { 
          id: auditTrailId,
          companyId 
        }
      });

      if (!auditTrail) {
        throw new Error('Audit trail not found');
      }

      // Recalculate hash
      const recalculatedHash = this.generateAuditHash({
        companyId: auditTrail.companyId,
        entityType: auditTrail.entityType,
        entityId: auditTrail.entityId,
        action: auditTrail.action,
        userId: auditTrail.userId,
        beforeData: JSON.parse(auditTrail.beforeData),
        afterData: JSON.parse(auditTrail.afterData)
      });

      // Check if hashes match
      const isIntegrityValid = auditTrail.auditHash === recalculatedHash;

      return {
        auditTrailId,
        isIntegrityValid,
        originalHash: auditTrail.auditHash,
        recalculatedHash,
        timestamp: auditTrail.createdAt
      };
    } catch (error) {
      logger.error('Error verifying audit trail:', error);
      throw error;
    }
  }

  /**
   * Get audit trails
   */
  async getAuditTrails(companyId: string, filters: any = {}): Promise<any> {
    try {
      const whereClause: any = { companyId };
      
      if (filters.entityType) {
        whereClause.entityType = filters.entityType;
      }
      
      if (filters.entityId) {
        whereClause.entityId = filters.entityId;
      }
      
      if (filters.action) {
        whereClause.action = filters.action;
      }
      
      if (filters.userId) {
        whereClause.userId = filters.userId;
      }
      
      if (filters.startDate) {
        whereClause.createdAt = {
          ...whereClause.createdAt,
          gte: new Date(filters.startDate)
        };
      }
      
      if (filters.endDate) {
        whereClause.createdAt = {
          ...whereClause.createdAt,
          lte: new Date(filters.endDate)
        };
      }

      const auditTrails = await prisma.auditTrail.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 100
      });

      return auditTrails;
    } catch (error) {
      logger.error('Error getting audit trails:', error);
      throw error;
    }
  }

  /**
   * Get audit trail by ID
   */
  async getAuditTrail(auditTrailId: string, companyId: string): Promise<any> {
    try {
      const auditTrail = await prisma.auditTrail.findFirst({
        where: { 
          id: auditTrailId,
          companyId 
        }
      });

      if (!auditTrail) {
        throw new Error('Audit trail not found');
      }

      return auditTrail;
    } catch (error) {
      logger.error('Error getting audit trail:', error);
      throw error;
    }
  }

  /**
   * Get audit dashboard
   */
  async getAuditDashboard(companyId: string): Promise<any> {
    try {
      const [
        auditStats,
        recentAudits,
        auditSummary,
        integrityReport
      ] = await Promise.all([
        this.getAuditStats(companyId),
        this.getRecentAudits(companyId),
        this.getAuditSummary(companyId),
        this.getIntegrityReport(companyId)
      ]);

      return {
        auditStats,
        recentAudits,
        auditSummary,
        integrityReport
      };
    } catch (error) {
      logger.error('Error getting audit dashboard:', error);
      throw error;
    }
  }

  /**
   * Get audit statistics
   */
  private async getAuditStats(companyId: string): Promise<any> {
    try {
      const stats = await prisma.$queryRaw`
        SELECT 
          COUNT(*) as total_audits,
          COUNT(CASE WHEN entity_type = 'user' THEN 1 END) as user_audits,
          COUNT(CASE WHEN entity_type = 'transaction' THEN 1 END) as transaction_audits,
          COUNT(CASE WHEN entity_type = 'invoice' THEN 1 END) as invoice_audits,
          COUNT(CASE WHEN entity_type = 'expense' THEN 1 END) as expense_audits,
          COUNT(CASE WHEN action = 'create' THEN 1 END) as create_actions,
          COUNT(CASE WHEN action = 'update' THEN 1 END) as update_actions,
          COUNT(CASE WHEN action = 'delete' THEN 1 END) as delete_actions,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_audits
        FROM audit_trails
        WHERE company_id = ${companyId}
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      `;

      return stats[0];
    } catch (error) {
      logger.error('Error getting audit stats:', error);
      throw error;
    }
  }

  /**
   * Get recent audits
   */
  private async getRecentAudits(companyId: string): Promise<any> {
    try {
      const audits = await prisma.auditTrail.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 20
      });

      return audits;
    } catch (error) {
      logger.error('Error getting recent audits:', error);
      return [];
    }
  }

  /**
   * Get audit summary
   */
  private async getAuditSummary(companyId: string): Promise<any> {
    try {
      const summary = await prisma.$queryRaw`
        SELECT 
          entity_type,
          action,
          COUNT(*) as count,
          MAX(created_at) as last_activity
        FROM audit_trails
        WHERE company_id = ${companyId}
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY entity_type, action
        ORDER BY count DESC
      `;

      return summary;
    } catch (error) {
      logger.error('Error getting audit summary:', error);
      return [];
    }
  }

  /**
   * Get integrity report
   */
  private async getIntegrityReport(companyId: string): Promise<any> {
    try {
      // This would implement integrity checking logic
      // For now, return a mock report
      return {
        totalAudits: 0,
        verifiedAudits: 0,
        integrityPercentage: 100,
        lastVerification: new Date()
      };
    } catch (error) {
      logger.error('Error getting integrity report:', error);
      return {
        totalAudits: 0,
        verifiedAudits: 0,
        integrityPercentage: 0,
        lastVerification: null
      };
    }
  }

  /**
   * Get audit analytics
   */
  async getAuditAnalytics(companyId: string): Promise<any> {
    try {
      const analytics = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('day', created_at) as date,
          COUNT(*) as total_audits,
          COUNT(CASE WHEN action = 'create' THEN 1 END) as create_audits,
          COUNT(CASE WHEN action = 'update' THEN 1 END) as update_audits,
          COUNT(CASE WHEN action = 'delete' THEN 1 END) as delete_audits,
          COUNT(DISTINCT user_id) as unique_users
        FROM audit_trails
        WHERE company_id = ${companyId}
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE_TRUNC('day', created_at)
        ORDER BY date DESC
      `;

      return analytics;
    } catch (error) {
      logger.error('Error getting audit analytics:', error);
      return [];
    }
  }

  /**
   * Get audit insights
   */
  async getAuditInsights(companyId: string): Promise<any> {
    try {
      const dashboard = await this.getAuditDashboard(companyId);
      const insights = this.generateAuditInsights(dashboard);

      return insights;
    } catch (error) {
      logger.error('Error getting audit insights:', error);
      return [];
    }
  }

  /**
   * Generate audit insights
   */
  private generateAuditInsights(dashboard: any): any[] {
    const insights = [];

    // High activity insight
    if (dashboard.auditStats.recent_audits > 1000) {
      insights.push({
        type: 'high_activity',
        priority: 'medium',
        title: 'High Audit Activity',
        description: `${dashboard.auditStats.recent_audits} audit entries in the last 30 days. Consider reviewing audit configuration.`,
        action: 'Review audit configuration and retention policies',
        impact: 'Medium - affects storage and performance'
      });
    }

    // Delete actions insight
    if (dashboard.auditStats.delete_actions > 100) {
      insights.push({
        type: 'delete_actions',
        priority: 'high',
        title: 'High Number of Delete Actions',
        description: `${dashboard.auditStats.delete_actions} delete actions recorded. Review for potential data loss.`,
        action: 'Review delete actions and implement additional safeguards',
        impact: 'High - potential data loss risk'
      });
    }

    // User activity insight
    if (dashboard.auditStats.user_audits > 500) {
      insights.push({
        type: 'user_activity',
        priority: 'low',
        title: 'High User Activity',
        description: `${dashboard.auditStats.user_audits} user-related audit entries. Normal user activity.`,
        action: 'Monitor user activity patterns',
        impact: 'Low - normal operation'
      });
    }

    // Transaction activity insight
    if (dashboard.auditStats.transaction_audits > 1000) {
      insights.push({
        type: 'transaction_activity',
        priority: 'low',
        title: 'High Transaction Activity',
        description: `${dashboard.auditStats.transaction_audits} transaction-related audit entries. Normal business activity.`,
        action: 'Monitor transaction patterns',
        impact: 'Low - normal operation'
      });
    }

    return insights;
  }

  /**
   * Export audit trails
   */
  async exportAuditTrails(companyId: string, filters: any = {}): Promise<any> {
    try {
      const auditTrails = await this.getAuditTrails(companyId, filters);
      
      // Generate export data
      const exportData = auditTrails.map(trail => ({
        id: trail.id,
        entityType: trail.entityType,
        entityId: trail.entityId,
        action: trail.action,
        userId: trail.userId,
        userEmail: trail.userEmail,
        ipAddress: trail.ipAddress,
        userAgent: trail.userAgent,
        beforeData: trail.beforeData,
        afterData: trail.afterData,
        changes: trail.changes,
        auditHash: trail.auditHash,
        metadata: trail.metadata,
        createdAt: trail.createdAt
      }));

      return exportData;
    } catch (error) {
      logger.error('Error exporting audit trails:', error);
      throw error;
    }
  }

  /**
   * Clean up old audit trails
   */
  async cleanupOldAuditTrails(companyId: string, retentionDays: number = 2555): Promise<any> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const deletedCount = await prisma.auditTrail.deleteMany({
        where: {
          companyId,
          createdAt: {
            lt: cutoffDate
          }
        }
      });

      return {
        deletedCount: deletedCount.count,
        cutoffDate,
        retentionDays
      };
    } catch (error) {
      logger.error('Error cleaning up old audit trails:', error);
      throw error;
    }
  }
}