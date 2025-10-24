import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class BlockchainAuditService {
  /**
   * Create immutable audit trail entry
   */
  async createAuditTrail(companyId: string, auditData: any): Promise<any> {
    try {
      const {
        action,
        entityType,
        entityId,
        userId,
        beforeData,
        afterData,
        metadata,
        ipAddress,
        userAgent
      } = auditData;

      // Generate SHA-256 hash of the audit data
      const auditHash = this.generateAuditHash(auditData);
      
      // Get previous hash for chain integrity
      const previousHash = await this.getPreviousHash(companyId);
      
      // Create blockchain entry
      const blockchainEntry = await prisma.blockchainAuditEntry.create({
        data: {
          companyId,
          action,
          entityType,
          entityId,
          userId,
          beforeData: JSON.stringify(beforeData),
          afterData: JSON.stringify(afterData),
          auditHash,
          previousHash,
          metadata: JSON.stringify(metadata || {}),
          ipAddress,
          userAgent,
          timestamp: new Date(),
          blockIndex: await this.getNextBlockIndex(companyId)
        }
      });

      // Verify chain integrity
      await this.verifyChainIntegrity(companyId);

      return blockchainEntry;
    } catch (error) {
      logger.error('Error creating audit trail:', error);
      throw error;
    }
  }

  /**
   * Generate SHA-256 hash for audit data
   */
  private generateAuditHash(auditData: any): string {
    const hashInput = JSON.stringify({
      action: auditData.action,
      entityType: auditData.entityType,
      entityId: auditData.entityId,
      userId: auditData.userId,
      beforeData: auditData.beforeData,
      afterData: auditData.afterData,
      timestamp: new Date().toISOString(),
      metadata: auditData.metadata
    });

    return crypto.createHash('sha256').update(hashInput).digest('hex');
  }

  /**
   * Get previous hash for chain integrity
   */
  private async getPreviousHash(companyId: string): Promise<string | null> {
    try {
      const lastEntry = await prisma.blockchainAuditEntry.findFirst({
        where: { companyId },
        orderBy: { blockIndex: 'desc' }
      });

      return lastEntry?.auditHash || null;
    } catch (error) {
      logger.error('Error getting previous hash:', error);
      return null;
    }
  }

  /**
   * Get next block index
   */
  private async getNextBlockIndex(companyId: string): Promise<number> {
    try {
      const lastEntry = await prisma.blockchainAuditEntry.findFirst({
        where: { companyId },
        orderBy: { blockIndex: 'desc' }
      });

      return (lastEntry?.blockIndex || 0) + 1;
    } catch (error) {
      logger.error('Error getting next block index:', error);
      return 1;
    }
  }

  /**
   * Verify chain integrity
   */
  private async verifyChainIntegrity(companyId: string): Promise<boolean> {
    try {
      const entries = await prisma.blockchainAuditEntry.findMany({
        where: { companyId },
        orderBy: { blockIndex: 'asc' }
      });

      for (let i = 1; i < entries.length; i++) {
        const currentEntry = entries[i];
        const previousEntry = entries[i - 1];

        if (currentEntry.previousHash !== previousEntry.auditHash) {
          logger.error('Chain integrity violation detected', {
            companyId,
            blockIndex: currentEntry.blockIndex,
            expectedHash: previousEntry.auditHash,
            actualHash: currentEntry.previousHash
          });
          return false;
        }
      }

      return true;
    } catch (error) {
      logger.error('Error verifying chain integrity:', error);
      return false;
    }
  }

  /**
   * Create audit snapshot
   */
  async createAuditSnapshot(companyId: string, entityType: string, entityId: string): Promise<any> {
    try {
      const snapshotData = await this.getEntitySnapshot(entityType, entityId);
      
      const snapshot = await prisma.auditSnapshot.create({
        data: {
          companyId,
          entityType,
          entityId,
          snapshotData: JSON.stringify(snapshotData),
          snapshotHash: this.generateSnapshotHash(snapshotData),
          createdAt: new Date()
        }
      });

      return snapshot;
    } catch (error) {
      logger.error('Error creating audit snapshot:', error);
      throw error;
    }
  }

  /**
   * Get entity snapshot
   */
  private async getEntitySnapshot(entityType: string, entityId: string): Promise<any> {
    try {
      switch (entityType) {
        case 'transaction':
          return await prisma.transaction.findUnique({
            where: { id: entityId },
            include: {
              vendor: true,
              category: true,
              employee: true
            }
          });
        case 'invoice':
          return await prisma.invoice.findUnique({
            where: { id: entityId },
            include: {
              customer: true,
              lineItems: true
            }
          });
        case 'expense':
          return await prisma.expense.findUnique({
            where: { id: entityId },
            include: {
              vendor: true,
              category: true,
              employee: true
            }
          });
        case 'customer':
          return await prisma.customer.findUnique({
            where: { id: entityId }
          });
        case 'vendor':
          return await prisma.vendor.findUnique({
            where: { id: entityId }
          });
        default:
          return null;
      }
    } catch (error) {
      logger.error('Error getting entity snapshot:', error);
      return null;
    }
  }

  /**
   * Generate snapshot hash
   */
  private generateSnapshotHash(snapshotData: any): string {
    const hashInput = JSON.stringify(snapshotData);
    return crypto.createHash('sha256').update(hashInput).digest('hex');
  }

  /**
   * Get audit trail for entity
   */
  async getAuditTrail(companyId: string, entityType: string, entityId: string): Promise<any> {
    try {
      const auditTrail = await prisma.blockchainAuditEntry.findMany({
        where: {
          companyId,
          entityType,
          entityId
        },
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return auditTrail;
    } catch (error) {
      logger.error('Error getting audit trail:', error);
      throw error;
    }
  }

  /**
   * Get audit trail dashboard
   */
  async getAuditTrailDashboard(companyId: string): Promise<any> {
    try {
      const [
        auditStats,
        recentAudits,
        tamperDetections,
        auditSummary
      ] = await Promise.all([
        this.getAuditStats(companyId),
        this.getRecentAudits(companyId),
        this.getTamperDetections(companyId),
        this.getAuditSummary(companyId)
      ]);

      return {
        auditStats,
        recentAudits,
        tamperDetections,
        auditSummary
      };
    } catch (error) {
      logger.error('Error getting audit trail dashboard:', error);
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
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as recent_audits,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as monthly_audits,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(DISTINCT entity_type) as entity_types
        FROM blockchain_audit_entries
        WHERE company_id = ${companyId}
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
      const audits = await prisma.blockchainAuditEntry.findMany({
        where: { companyId },
        orderBy: { timestamp: 'desc' },
        take: 20,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return audits;
    } catch (error) {
      logger.error('Error getting recent audits:', error);
      throw error;
    }
  }

  /**
   * Get tamper detections
   */
  private async getTamperDetections(companyId: string): Promise<any> {
    try {
      const tamperDetections = await prisma.tamperDetection.findMany({
        where: { companyId },
        orderBy: { detectedAt: 'desc' },
        take: 10
      });

      return tamperDetections;
    } catch (error) {
      logger.error('Error getting tamper detections:', error);
      throw error;
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
          MAX(timestamp) as last_activity
        FROM blockchain_audit_entries
        WHERE company_id = ${companyId}
        AND timestamp >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY entity_type, action
        ORDER BY count DESC
      `;

      return summary;
    } catch (error) {
      logger.error('Error getting audit summary:', error);
      throw error;
    }
  }

  /**
   * Detect tampering
   */
  async detectTampering(companyId: string): Promise<any> {
    try {
      const entries = await prisma.blockchainAuditEntry.findMany({
        where: { companyId },
        orderBy: { blockIndex: 'asc' }
      });

      const tamperDetections = [];

      for (let i = 1; i < entries.length; i++) {
        const currentEntry = entries[i];
        const previousEntry = entries[i - 1];

        if (currentEntry.previousHash !== previousEntry.auditHash) {
          const tamperDetection = await prisma.tamperDetection.create({
            data: {
              companyId,
              blockIndex: currentEntry.blockIndex,
              expectedHash: previousEntry.auditHash,
              actualHash: currentEntry.previousHash,
              detectedAt: new Date(),
              severity: 'high',
              description: 'Chain integrity violation detected'
            }
          });

          tamperDetections.push(tamperDetection);
        }
      }

      return tamperDetections;
    } catch (error) {
      logger.error('Error detecting tampering:', error);
      throw error;
    }
  }

  /**
   * Export audit trail
   */
  async exportAuditTrail(companyId: string, startDate: Date, endDate: Date): Promise<any> {
    try {
      const auditTrail = await prisma.blockchainAuditEntry.findMany({
        where: {
          companyId,
          timestamp: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { timestamp: 'asc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return auditTrail;
    } catch (error) {
      logger.error('Error exporting audit trail:', error);
      throw error;
    }
  }

  /**
   * Get audit trail integrity report
   */
  async getIntegrityReport(companyId: string): Promise<any> {
    try {
      const entries = await prisma.blockchainAuditEntry.findMany({
        where: { companyId },
        orderBy: { blockIndex: 'asc' }
      });

      const integrityReport = {
        totalEntries: entries.length,
        chainIntegrity: true,
        tamperDetections: 0,
        gaps: [],
        recommendations: []
      };

      // Check for gaps in block index
      for (let i = 0; i < entries.length - 1; i++) {
        if (entries[i + 1].blockIndex - entries[i].blockIndex > 1) {
          integrityReport.gaps.push({
            from: entries[i].blockIndex,
            to: entries[i + 1].blockIndex
          });
        }
      }

      // Check chain integrity
      for (let i = 1; i < entries.length; i++) {
        if (entries[i].previousHash !== entries[i - 1].auditHash) {
          integrityReport.chainIntegrity = false;
          integrityReport.tamperDetections++;
        }
      }

      // Generate recommendations
      if (integrityReport.tamperDetections > 0) {
        integrityReport.recommendations.push('Investigate tamper detections immediately');
      }

      if (integrityReport.gaps.length > 0) {
        integrityReport.recommendations.push('Review missing audit entries');
      }

      return integrityReport;
    } catch (error) {
      logger.error('Error getting integrity report:', error);
      throw error;
    }
  }
}






