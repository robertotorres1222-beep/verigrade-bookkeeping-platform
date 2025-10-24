import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

export interface BulkOperation {
  id: string;
  userId: string;
  type: 'delete' | 'update' | 'export' | 'import' | 'archive' | 'restore';
  entityType: 'invoice' | 'expense' | 'client' | 'transaction' | 'document';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalItems: number;
  processedItems: number;
  failedItems: number;
  errors: string[];
  filters: any;
  operation: any;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
}

export interface BulkOperationResult {
  success: boolean;
  totalProcessed: number;
  successfulItems: number;
  failedItems: number;
  errors: Array<{
    itemId: string;
    error: string;
  }>;
  result?: any;
}

export interface BulkOperationFilters {
  ids?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string[];
  category?: string[];
  amountRange?: {
    min: number;
    max: number;
  };
  tags?: string[];
  [key: string]: any;
}

class BulkOperationsService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
    logger.info('[BulkOperationsService] Initialized');
  }

  /**
   * Creates a new bulk operation
   */
  public async createBulkOperation(
    userId: string,
    type: BulkOperation['type'],
    entityType: BulkOperation['entityType'],
    filters: BulkOperationFilters,
    operation: any
  ): Promise<BulkOperation> {
    try {
      // Count total items that will be affected
      const totalItems = await this.countItemsForOperation(entityType, filters, userId);

      const bulkOperation = await this.prisma.bulkOperation.create({
        data: {
          userId,
          type,
          entityType,
          status: 'pending',
          totalItems,
          processedItems: 0,
          failedItems: 0,
          errors: [],
          filters: JSON.stringify(filters),
          operation: JSON.stringify(operation)
        }
      });

      logger.info(`[BulkOperationsService] Created bulk operation ${bulkOperation.id} for user ${userId}`);
      return bulkOperation as BulkOperation;
    } catch (error: any) {
      logger.error('[BulkOperationsService] Error creating bulk operation:', error);
      throw new Error(`Failed to create bulk operation: ${error.message}`);
    }
  }

  /**
   * Executes a bulk operation
   */
  public async executeBulkOperation(operationId: string): Promise<BulkOperationResult> {
    try {
      const operation = await this.prisma.bulkOperation.findUnique({
        where: { id: operationId }
      });

      if (!operation) {
        throw new Error('Bulk operation not found');
      }

      // Update status to processing
      await this.prisma.bulkOperation.update({
        where: { id: operationId },
        data: {
          status: 'processing',
          startedAt: new Date()
        }
      });

      // Execute the operation based on type
      let result: BulkOperationResult;
      switch (operation.type) {
        case 'delete':
          result = await this.executeBulkDelete(operation);
          break;
        case 'update':
          result = await this.executeBulkUpdate(operation);
          break;
        case 'export':
          result = await this.executeBulkExport(operation);
          break;
        case 'archive':
          result = await this.executeBulkArchive(operation);
          break;
        case 'restore':
          result = await this.executeBulkRestore(operation);
          break;
        default:
          throw new Error(`Unsupported operation type: ${operation.type}`);
      }

      // Update operation status
      await this.prisma.bulkOperation.update({
        where: { id: operationId },
        data: {
          status: result.success ? 'completed' : 'failed',
          processedItems: result.totalProcessed,
          failedItems: result.failedItems,
          errors: result.errors.map(e => e.error),
          completedAt: new Date(),
          result: JSON.stringify(result.result)
        }
      });

      logger.info(`[BulkOperationsService] Completed bulk operation ${operationId}: ${result.successfulItems} successful, ${result.failedItems} failed`);
      return result;
    } catch (error: any) {
      logger.error(`[BulkOperationsService] Error executing bulk operation ${operationId}:`, error);
      
      // Update operation status to failed
      await this.prisma.bulkOperation.update({
        where: { id: operationId },
        data: {
          status: 'failed',
          errors: [error.message],
          completedAt: new Date()
        }
      });

      throw new Error(`Failed to execute bulk operation: ${error.message}`);
    }
  }

  /**
   * Gets bulk operations for a user
   */
  public async getUserBulkOperations(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<BulkOperation[]> {
    try {
      const operations = await this.prisma.bulkOperation.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });

      return operations.map(op => ({
        ...op,
        filters: JSON.parse(op.filters as string),
        operation: JSON.parse(op.operation as string),
        result: op.result ? JSON.parse(op.result as string) : undefined
      })) as BulkOperation[];
    } catch (error: any) {
      logger.error(`[BulkOperationsService] Error getting bulk operations for user ${userId}:`, error);
      throw new Error(`Failed to get bulk operations: ${error.message}`);
    }
  }

  /**
   * Gets bulk operation by ID
   */
  public async getBulkOperation(operationId: string, userId: string): Promise<BulkOperation | null> {
    try {
      const operation = await this.prisma.bulkOperation.findFirst({
        where: { id: operationId, userId }
      });

      if (!operation) return null;

      return {
        ...operation,
        filters: JSON.parse(operation.filters as string),
        operation: JSON.parse(operation.operation as string),
        result: operation.result ? JSON.parse(operation.result as string) : undefined
      } as BulkOperation;
    } catch (error: any) {
      logger.error(`[BulkOperationsService] Error getting bulk operation ${operationId}:`, error);
      throw new Error(`Failed to get bulk operation: ${error.message}`);
    }
  }

  /**
   * Cancels a bulk operation
   */
  public async cancelBulkOperation(operationId: string, userId: string): Promise<void> {
    try {
      const operation = await this.prisma.bulkOperation.findFirst({
        where: { id: operationId, userId }
      });

      if (!operation) {
        throw new Error('Bulk operation not found');
      }

      if (operation.status === 'completed' || operation.status === 'failed') {
        throw new Error('Cannot cancel completed or failed operation');
      }

      await this.prisma.bulkOperation.update({
        where: { id: operationId },
        data: {
          status: 'failed',
          errors: ['Operation cancelled by user'],
          completedAt: new Date()
        }
      });

      logger.info(`[BulkOperationsService] Cancelled bulk operation ${operationId}`);
    } catch (error: any) {
      logger.error(`[BulkOperationsService] Error cancelling bulk operation ${operationId}:`, error);
      throw new Error(`Failed to cancel bulk operation: ${error.message}`);
    }
  }

  /**
   * Counts items for operation
   */
  private async countItemsForOperation(
    entityType: string,
    filters: BulkOperationFilters,
    userId: string
  ): Promise<number> {
    const whereClause = this.buildWhereClause(filters, userId);

    switch (entityType) {
      case 'invoice':
        return await this.prisma.invoice.count({ where: whereClause });
      case 'expense':
        return await this.prisma.expense.count({ where: whereClause });
      case 'client':
        return await this.prisma.client.count({ where: whereClause });
      case 'transaction':
        return await this.prisma.transaction.count({ where: whereClause });
      case 'document':
        return await this.prisma.document.count({ where: whereClause });
      default:
        return 0;
    }
  }

  /**
   * Builds where clause for filters
   */
  private buildWhereClause(filters: BulkOperationFilters, userId: string): any {
    const where: any = { userId };

    if (filters.ids && filters.ids.length > 0) {
      where.id = { in: filters.ids };
    }

    if (filters.dateRange) {
      where.createdAt = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end
      };
    }

    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status };
    }

    if (filters.category && filters.category.length > 0) {
      where.category = { in: filters.category };
    }

    if (filters.amountRange) {
      where.amount = {
        gte: filters.amountRange.min,
        lte: filters.amountRange.max
      };
    }

    return where;
  }

  /**
   * Executes bulk delete operation
   */
  private async executeBulkDelete(operation: any): Promise<BulkOperationResult> {
    const filters = JSON.parse(operation.filters as string);
    const whereClause = this.buildWhereClause(filters, operation.userId);
    const errors: Array<{ itemId: string; error: string }> = [];
    let successfulItems = 0;

    try {
      switch (operation.entityType) {
        case 'invoice':
          const invoices = await this.prisma.invoice.findMany({ where: whereClause });
          for (const invoice of invoices) {
            try {
              await this.prisma.invoice.delete({ where: { id: invoice.id } });
              successfulItems++;
            } catch (error: any) {
              errors.push({ itemId: invoice.id, error: error.message });
            }
          }
          break;
        case 'expense':
          const expenses = await this.prisma.expense.findMany({ where: whereClause });
          for (const expense of expenses) {
            try {
              await this.prisma.expense.delete({ where: { id: expense.id } });
              successfulItems++;
            } catch (error: any) {
              errors.push({ itemId: expense.id, error: error.message });
            }
          }
          break;
        case 'client':
          const clients = await this.prisma.client.findMany({ where: whereClause });
          for (const client of clients) {
            try {
              await this.prisma.client.delete({ where: { id: client.id } });
              successfulItems++;
            } catch (error: any) {
              errors.push({ itemId: client.id, error: error.message });
            }
          }
          break;
        case 'transaction':
          const transactions = await this.prisma.transaction.findMany({ where: whereClause });
          for (const transaction of transactions) {
            try {
              await this.prisma.transaction.delete({ where: { id: transaction.id } });
              successfulItems++;
            } catch (error: any) {
              errors.push({ itemId: transaction.id, error: error.message });
            }
          }
          break;
        case 'document':
          const documents = await this.prisma.document.findMany({ where: whereClause });
          for (const document of documents) {
            try {
              await this.prisma.document.delete({ where: { id: document.id } });
              successfulItems++;
            } catch (error: any) {
              errors.push({ itemId: document.id, error: error.message });
            }
          }
          break;
      }

      return {
        success: errors.length === 0,
        totalProcessed: successfulItems + errors.length,
        successfulItems,
        failedItems: errors.length,
        errors
      };
    } catch (error: any) {
      return {
        success: false,
        totalProcessed: 0,
        successfulItems: 0,
        failedItems: 0,
        errors: [{ itemId: 'unknown', error: error.message }]
      };
    }
  }

  /**
   * Executes bulk update operation
   */
  private async executeBulkUpdate(operation: any): Promise<BulkOperationResult> {
    const filters = JSON.parse(operation.filters as string);
    const updateData = JSON.parse(operation.operation as string);
    const whereClause = this.buildWhereClause(filters, operation.userId);
    const errors: Array<{ itemId: string; error: string }> = [];
    let successfulItems = 0;

    try {
      switch (operation.entityType) {
        case 'invoice':
          const invoices = await this.prisma.invoice.findMany({ where: whereClause });
          for (const invoice of invoices) {
            try {
              await this.prisma.invoice.update({
                where: { id: invoice.id },
                data: updateData
              });
              successfulItems++;
            } catch (error: any) {
              errors.push({ itemId: invoice.id, error: error.message });
            }
          }
          break;
        case 'expense':
          const expenses = await this.prisma.expense.findMany({ where: whereClause });
          for (const expense of expenses) {
            try {
              await this.prisma.expense.update({
                where: { id: expense.id },
                data: updateData
              });
              successfulItems++;
            } catch (error: any) {
              errors.push({ itemId: expense.id, error: error.message });
            }
          }
          break;
        case 'client':
          const clients = await this.prisma.client.findMany({ where: whereClause });
          for (const client of clients) {
            try {
              await this.prisma.client.update({
                where: { id: client.id },
                data: updateData
              });
              successfulItems++;
            } catch (error: any) {
              errors.push({ itemId: client.id, error: error.message });
            }
          }
          break;
        case 'transaction':
          const transactions = await this.prisma.transaction.findMany({ where: whereClause });
          for (const transaction of transactions) {
            try {
              await this.prisma.transaction.update({
                where: { id: transaction.id },
                data: updateData
              });
              successfulItems++;
            } catch (error: any) {
              errors.push({ itemId: transaction.id, error: error.message });
            }
          }
          break;
        case 'document':
          const documents = await this.prisma.document.findMany({ where: whereClause });
          for (const document of documents) {
            try {
              await this.prisma.document.update({
                where: { id: document.id },
                data: updateData
              });
              successfulItems++;
            } catch (error: any) {
              errors.push({ itemId: document.id, error: error.message });
            }
          }
          break;
      }

      return {
        success: errors.length === 0,
        totalProcessed: successfulItems + errors.length,
        successfulItems,
        failedItems: errors.length,
        errors
      };
    } catch (error: any) {
      return {
        success: false,
        totalProcessed: 0,
        successfulItems: 0,
        failedItems: 0,
        errors: [{ itemId: 'unknown', error: error.message }]
      };
    }
  }

  /**
   * Executes bulk export operation
   */
  private async executeBulkExport(operation: any): Promise<BulkOperationResult> {
    const filters = JSON.parse(operation.filters as string);
    const exportFormat = JSON.parse(operation.operation as string).format || 'csv';
    const whereClause = this.buildWhereClause(filters, operation.userId);

    try {
      let data: any[] = [];

      switch (operation.entityType) {
        case 'invoice':
          data = await this.prisma.invoice.findMany({ where: whereClause });
          break;
        case 'expense':
          data = await this.prisma.expense.findMany({ where: whereClause });
          break;
        case 'client':
          data = await this.prisma.client.findMany({ where: whereClause });
          break;
        case 'transaction':
          data = await this.prisma.transaction.findMany({ where: whereClause });
          break;
        case 'document':
          data = await this.prisma.document.findMany({ where: whereClause });
          break;
      }

      // Generate export file
      const exportResult = await this.generateExportFile(data, exportFormat);

      return {
        success: true,
        totalProcessed: data.length,
        successfulItems: data.length,
        failedItems: 0,
        errors: [],
        result: exportResult
      };
    } catch (error: any) {
      return {
        success: false,
        totalProcessed: 0,
        successfulItems: 0,
        failedItems: 0,
        errors: [{ itemId: 'unknown', error: error.message }]
      };
    }
  }

  /**
   * Executes bulk archive operation
   */
  private async executeBulkArchive(operation: any): Promise<BulkOperationResult> {
    return await this.executeBulkUpdate({
      ...operation,
      operation: JSON.stringify({ archived: true })
    });
  }

  /**
   * Executes bulk restore operation
   */
  private async executeBulkRestore(operation: any): Promise<BulkOperationResult> {
    return await this.executeBulkUpdate({
      ...operation,
      operation: JSON.stringify({ archived: false })
    });
  }

  /**
   * Generates export file
   */
  private async generateExportFile(data: any[], format: string): Promise<any> {
    // Implementation would generate actual export files
    return {
      format,
      recordCount: data.length,
      downloadUrl: `https://example.com/exports/${Date.now()}.${format}`
    };
  }
}

export default new BulkOperationsService();






