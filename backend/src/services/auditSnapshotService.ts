import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class AuditSnapshotService {
  /**
   * Create before/after snapshot
   */
  async createSnapshot(companyId: string, snapshotData: any): Promise<any> {
    try {
      const {
        entityType,
        entityId,
        action,
        beforeData,
        afterData,
        userId,
        metadata
      } = snapshotData;

      // Create before snapshot
      const beforeSnapshot = await this.createEntitySnapshot(
        companyId,
        entityType,
        entityId,
        'before',
        beforeData,
        userId
      );

      // Create after snapshot
      const afterSnapshot = await this.createEntitySnapshot(
        companyId,
        entityType,
        entityId,
        'after',
        afterData,
        userId
      );

      // Create snapshot pair
      const snapshotPair = await prisma.auditSnapshotPair.create({
        data: {
          companyId,
          entityType,
          entityId,
          action,
          beforeSnapshotId: beforeSnapshot.id,
          afterSnapshotId: afterSnapshot.id,
          userId,
          metadata: JSON.stringify(metadata || {}),
          createdAt: new Date()
        }
      });

      return snapshotPair;
    } catch (error) {
      logger.error('Error creating snapshot:', error);
      throw error;
    }
  }

  /**
   * Create entity snapshot
   */
  private async createEntitySnapshot(
    companyId: string,
    entityType: string,
    entityId: string,
    snapshotType: 'before' | 'after',
    data: any,
    userId: string
  ): Promise<any> {
    try {
      const snapshotHash = this.generateSnapshotHash(data);
      
      const snapshot = await prisma.auditSnapshot.create({
        data: {
          companyId,
          entityType,
          entityId,
          snapshotType,
          snapshotData: JSON.stringify(data),
          snapshotHash,
          userId,
          createdAt: new Date()
        }
      });

      return snapshot;
    } catch (error) {
      logger.error('Error creating entity snapshot:', error);
      throw error;
    }
  }

  /**
   * Generate snapshot hash
   */
  private generateSnapshotHash(data: any): string {
    const hashInput = JSON.stringify(data);
    return crypto.createHash('sha256').update(hashInput).digest('hex');
  }

  /**
   * Get snapshot comparison
   */
  async getSnapshotComparison(companyId: string, snapshotPairId: string): Promise<any> {
    try {
      const snapshotPair = await prisma.auditSnapshotPair.findUnique({
        where: { id: snapshotPairId },
        include: {
          beforeSnapshot: true,
          afterSnapshot: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!snapshotPair) {
        throw new Error('Snapshot pair not found');
      }

      const beforeData = JSON.parse(snapshotPair.beforeSnapshot.snapshotData);
      const afterData = JSON.parse(snapshotPair.afterSnapshot.snapshotData);

      const comparison = this.compareSnapshots(beforeData, afterData);

      return {
        snapshotPair,
        comparison,
        changes: comparison.changes,
        summary: comparison.summary
      };
    } catch (error) {
      logger.error('Error getting snapshot comparison:', error);
      throw error;
    }
  }

  /**
   * Compare snapshots
   */
  private compareSnapshots(beforeData: any, afterData: any): any {
    const changes = [];
    const added = [];
    const removed = [];
    const modified = [];

    // Compare all fields
    const allKeys = new Set([
      ...Object.keys(beforeData || {}),
      ...Object.keys(afterData || {})
    ]);

    for (const key of allKeys) {
      const beforeValue = beforeData?.[key];
      const afterValue = afterData?.[key];

      if (beforeValue === undefined && afterValue !== undefined) {
        added.push({
          field: key,
          value: afterValue
        });
        changes.push({
          type: 'added',
          field: key,
          before: undefined,
          after: afterValue
        });
      } else if (beforeValue !== undefined && afterValue === undefined) {
        removed.push({
          field: key,
          value: beforeValue
        });
        changes.push({
          type: 'removed',
          field: key,
          before: beforeValue,
          after: undefined
        });
      } else if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
        modified.push({
          field: key,
          before: beforeValue,
          after: afterValue
        });
        changes.push({
          type: 'modified',
          field: key,
          before: beforeValue,
          after: afterValue
        });
      }
    }

    return {
      changes,
      added,
      removed,
      modified,
      summary: {
        totalChanges: changes.length,
        addedCount: added.length,
        removedCount: removed.length,
        modifiedCount: modified.length
      }
    };
  }

  /**
   * Get snapshot history
   */
  async getSnapshotHistory(companyId: string, entityType: string, entityId: string): Promise<any> {
    try {
      const snapshots = await prisma.auditSnapshotPair.findMany({
        where: {
          companyId,
          entityType,
          entityId
        },
        orderBy: { createdAt: 'desc' },
        include: {
          beforeSnapshot: true,
          afterSnapshot: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return snapshots;
    } catch (error) {
      logger.error('Error getting snapshot history:', error);
      throw error;
    }
  }

  /**
   * Get snapshot dashboard
   */
  async getSnapshotDashboard(companyId: string): Promise<any> {
    try {
      const [
        snapshotStats,
        recentSnapshots,
        entitySnapshots,
        snapshotSummary
      ] = await Promise.all([
        this.getSnapshotStats(companyId),
        this.getRecentSnapshots(companyId),
        this.getEntitySnapshots(companyId),
        this.getSnapshotSummary(companyId)
      ]);

      return {
        snapshotStats,
        recentSnapshots,
        entitySnapshots,
        snapshotSummary
      };
    } catch (error) {
      logger.error('Error getting snapshot dashboard:', error);
      throw error;
    }
  }

  /**
   * Get snapshot statistics
   */
  private async getSnapshotStats(companyId: string): Promise<any> {
    try {
      const stats = await prisma.$queryRaw`
        SELECT 
          COUNT(*) as total_snapshots,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as recent_snapshots,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as monthly_snapshots,
          COUNT(DISTINCT entity_type) as entity_types,
          COUNT(DISTINCT entity_id) as unique_entities
        FROM audit_snapshots
        WHERE company_id = ${companyId}
      `;

      return stats[0];
    } catch (error) {
      logger.error('Error getting snapshot stats:', error);
      throw error;
    }
  }

  /**
   * Get recent snapshots
   */
  private async getRecentSnapshots(companyId: string): Promise<any> {
    try {
      const snapshots = await prisma.auditSnapshotPair.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          beforeSnapshot: true,
          afterSnapshot: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return snapshots;
    } catch (error) {
      logger.error('Error getting recent snapshots:', error);
      throw error;
    }
  }

  /**
   * Get entity snapshots
   */
  private async getEntitySnapshots(companyId: string): Promise<any> {
    try {
      const entitySnapshots = await prisma.$queryRaw`
        SELECT 
          entity_type,
          entity_id,
          COUNT(*) as snapshot_count,
          MAX(created_at) as last_snapshot,
          MIN(created_at) as first_snapshot
        FROM audit_snapshot_pairs
        WHERE company_id = ${companyId}
        GROUP BY entity_type, entity_id
        ORDER BY snapshot_count DESC
        LIMIT 20
      `;

      return entitySnapshots;
    } catch (error) {
      logger.error('Error getting entity snapshots:', error);
      throw error;
    }
  }

  /**
   * Get snapshot summary
   */
  private async getSnapshotSummary(companyId: string): Promise<any> {
    try {
      const summary = await prisma.$queryRaw`
        SELECT 
          entity_type,
          action,
          COUNT(*) as count,
          MAX(created_at) as last_activity
        FROM audit_snapshot_pairs
        WHERE company_id = ${companyId}
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY entity_type, action
        ORDER BY count DESC
      `;

      return summary;
    } catch (error) {
      logger.error('Error getting snapshot summary:', error);
      throw error;
    }
  }

  /**
   * Restore entity from snapshot
   */
  async restoreFromSnapshot(companyId: string, snapshotId: string): Promise<any> {
    try {
      const snapshot = await prisma.auditSnapshot.findUnique({
        where: { id: snapshotId }
      });

      if (!snapshot) {
        throw new Error('Snapshot not found');
      }

      const snapshotData = JSON.parse(snapshot.snapshotData);
      
      // Restore entity based on type
      const restoredEntity = await this.restoreEntity(
        snapshot.entityType,
        snapshot.entityId,
        snapshotData
      );

      // Create audit trail for restoration
      await prisma.blockchainAuditEntry.create({
        data: {
          companyId,
          action: 'restore',
          entityType: snapshot.entityType,
          entityId: snapshot.entityId,
          userId: snapshot.userId,
          beforeData: JSON.stringify({}),
          afterData: JSON.stringify(snapshotData),
          auditHash: crypto.createHash('sha256').update(JSON.stringify({
            action: 'restore',
            entityType: snapshot.entityType,
            entityId: snapshot.entityId,
            timestamp: new Date().toISOString()
          })).digest('hex'),
          previousHash: null,
          metadata: JSON.stringify({ restoredFrom: snapshotId }),
          ipAddress: 'system',
          userAgent: 'system',
          timestamp: new Date(),
          blockIndex: 1
        }
      });

      return restoredEntity;
    } catch (error) {
      logger.error('Error restoring from snapshot:', error);
      throw error;
    }
  }

  /**
   * Restore entity
   */
  private async restoreEntity(entityType: string, entityId: string, data: any): Promise<any> {
    try {
      switch (entityType) {
        case 'transaction':
          return await prisma.transaction.update({
            where: { id: entityId },
            data: {
              amount: data.amount,
              description: data.description,
              transactionDate: new Date(data.transactionDate),
              type: data.type,
              status: data.status
            }
          });
        case 'invoice':
          return await prisma.invoice.update({
            where: { id: entityId },
            data: {
              amount: data.amount,
              description: data.description,
              status: data.status,
              dueDate: data.dueDate ? new Date(data.dueDate) : null
            }
          });
        case 'expense':
          return await prisma.expense.update({
            where: { id: entityId },
            data: {
              amount: data.amount,
              description: data.description,
              status: data.status,
              expenseDate: data.expenseDate ? new Date(data.expenseDate) : null
            }
          });
        case 'customer':
          return await prisma.customer.update({
            where: { id: entityId },
            data: {
              name: data.name,
              email: data.email,
              phone: data.phone,
              address: data.address
            }
          });
        case 'vendor':
          return await prisma.vendor.update({
            where: { id: entityId },
            data: {
              name: data.name,
              email: data.email,
              phone: data.phone,
              address: data.address
            }
          });
        default:
          throw new Error(`Unsupported entity type: ${entityType}`);
      }
    } catch (error) {
      logger.error('Error restoring entity:', error);
      throw error;
    }
  }

  /**
   * Get snapshot integrity report
   */
  async getSnapshotIntegrityReport(companyId: string): Promise<any> {
    try {
      const snapshots = await prisma.auditSnapshot.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' }
      });

      const integrityReport = {
        totalSnapshots: snapshots.length,
        corruptedSnapshots: 0,
        missingSnapshots: 0,
        recommendations: []
      };

      // Check for corrupted snapshots
      for (const snapshot of snapshots) {
        const expectedHash = this.generateSnapshotHash(JSON.parse(snapshot.snapshotData));
        if (snapshot.snapshotHash !== expectedHash) {
          integrityReport.corruptedSnapshots++;
        }
      }

      // Generate recommendations
      if (integrityReport.corruptedSnapshots > 0) {
        integrityReport.recommendations.push('Investigate corrupted snapshots');
      }

      return integrityReport;
    } catch (error) {
      logger.error('Error getting snapshot integrity report:', error);
      throw error;
    }
  }
}





