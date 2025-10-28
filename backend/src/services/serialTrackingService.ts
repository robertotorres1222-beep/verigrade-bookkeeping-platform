import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface SerialNumber {
  id: string;
  productId: string;
  organizationId: string;
  serialNumber: string;
  lotNumber?: string;
  batchNumber?: string;
  status: 'available' | 'allocated' | 'sold' | 'returned' | 'defective' | 'recalled';
  location?: string;
  binLocation?: string;
  warehouseId?: string;
  supplierId?: string;
  purchaseOrderId?: string;
  purchaseDate?: Date;
  cost?: number;
  warrantyStartDate?: Date;
  warrantyEndDate?: Date;
  expirationDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  soldTo?: string;
  soldDate?: Date;
  invoiceId?: string;
  returnReason?: string;
  returnDate?: Date;
  recallReason?: string;
  recallDate?: Date;
}

export interface LotNumber {
  id: string;
  productId: string;
  organizationId: string;
  lotNumber: string;
  batchNumber?: string;
  quantity: number;
  remainingQuantity: number;
  status: 'active' | 'expired' | 'recalled' | 'depleted';
  supplierId?: string;
  purchaseOrderId?: string;
  purchaseDate?: Date;
  cost?: number;
  expirationDate?: Date;
  manufacturingDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  recallReason?: string;
  recallDate?: Date;
}

export interface Warranty {
  id: string;
  serialNumberId: string;
  productId: string;
  organizationId: string;
  warrantyType: 'manufacturer' | 'extended' | 'service';
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'void' | 'claimed';
  terms?: string;
  provider?: string;
  claimCount: number;
  lastClaimDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Recall {
  id: string;
  productId: string;
  organizationId: string;
  recallType: 'safety' | 'quality' | 'voluntary' | 'mandatory';
  title: string;
  description: string;
  reason: string;
  affectedSerialNumbers: string[];
  affectedLotNumbers: string[];
  status: 'active' | 'resolved' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  actionRequired: string;
  contactInfo?: string;
  createdAt: Date;
  updatedAt: Date;
}

class SerialTrackingService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Create serial number tracking
   */
  async createSerialNumber(data: {
    productId: string;
    organizationId: string;
    serialNumber: string;
    lotNumber?: string;
    batchNumber?: string;
    location?: string;
    binLocation?: string;
    warehouseId?: string;
    supplierId?: string;
    purchaseOrderId?: string;
    purchaseDate?: Date;
    cost?: number;
    warrantyStartDate?: Date;
    warrantyEndDate?: Date;
    expirationDate?: Date;
    notes?: string;
  }): Promise<SerialNumber> {
    try {
      // Check if serial number already exists
      const existing = await this.prisma.serialNumber.findFirst({
        where: {
          serialNumber: data.serialNumber,
          organizationId: data.organizationId,
        },
      });

      if (existing) {
        throw new Error('Serial number already exists');
      }

      const serialNumber = await this.prisma.serialNumber.create({
        data: {
          id: uuidv4(),
          productId: data.productId,
          organizationId: data.organizationId,
          serialNumber: data.serialNumber,
          lotNumber: data.lotNumber,
          batchNumber: data.batchNumber,
          status: 'available',
          location: data.location,
          binLocation: data.binLocation,
          warehouseId: data.warehouseId,
          supplierId: data.supplierId,
          purchaseOrderId: data.purchaseOrderId,
          purchaseDate: data.purchaseDate,
          cost: data.cost,
          warrantyStartDate: data.warrantyStartDate,
          warrantyEndDate: data.warrantyEndDate,
          expirationDate: data.expirationDate,
          notes: data.notes,
        },
      });

      logger.info(`[SerialTrackingService] Created serial number: ${data.serialNumber}`);
      return serialNumber;
    } catch (error) {
      logger.error('[SerialTrackingService] Failed to create serial number:', error);
      throw new Error(`Failed to create serial number: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create lot number tracking
   */
  async createLotNumber(data: {
    productId: string;
    organizationId: string;
    lotNumber: string;
    batchNumber?: string;
    quantity: number;
    supplierId?: string;
    purchaseOrderId?: string;
    purchaseDate?: Date;
    cost?: number;
    expirationDate?: Date;
    manufacturingDate?: Date;
    notes?: string;
  }): Promise<LotNumber> {
    try {
      // Check if lot number already exists
      const existing = await this.prisma.lotNumber.findFirst({
        where: {
          lotNumber: data.lotNumber,
          organizationId: data.organizationId,
        },
      });

      if (existing) {
        throw new Error('Lot number already exists');
      }

      const lotNumber = await this.prisma.lotNumber.create({
        data: {
          id: uuidv4(),
          productId: data.productId,
          organizationId: data.organizationId,
          lotNumber: data.lotNumber,
          batchNumber: data.batchNumber,
          quantity: data.quantity,
          remainingQuantity: data.quantity,
          status: 'active',
          supplierId: data.supplierId,
          purchaseOrderId: data.purchaseOrderId,
          purchaseDate: data.purchaseDate,
          cost: data.cost,
          expirationDate: data.expirationDate,
          manufacturingDate: data.manufacturingDate,
          notes: data.notes,
        },
      });

      logger.info(`[SerialTrackingService] Created lot number: ${data.lotNumber}`);
      return lotNumber;
    } catch (error) {
      logger.error('[SerialTrackingService] Failed to create lot number:', error);
      throw new Error(`Failed to create lot number: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Allocate serial number for sale
   */
  async allocateSerialNumber(
    serialNumberId: string,
    organizationId: string,
    customerId: string,
    invoiceId?: string
  ): Promise<SerialNumber> {
    try {
      const serialNumber = await this.prisma.serialNumber.findFirst({
        where: {
          id: serialNumberId,
          organizationId,
          status: 'available',
        },
      });

      if (!serialNumber) {
        throw new Error('Serial number not found or not available');
      }

      const updated = await this.prisma.serialNumber.update({
        where: { id: serialNumberId },
        data: {
          status: 'allocated',
          soldTo: customerId,
          soldDate: new Date(),
          invoiceId,
        },
      });

      logger.info(`[SerialTrackingService] Allocated serial number: ${serialNumber.serialNumber}`);
      return updated;
    } catch (error) {
      logger.error('[SerialTrackingService] Failed to allocate serial number:', error);
      throw new Error(`Failed to allocate serial number: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mark serial number as sold
   */
  async markSerialNumberSold(
    serialNumberId: string,
    organizationId: string,
    customerId: string,
    invoiceId: string
  ): Promise<SerialNumber> {
    try {
      const serialNumber = await this.prisma.serialNumber.findFirst({
        where: {
          id: serialNumberId,
          organizationId,
        },
      });

      if (!serialNumber) {
        throw new Error('Serial number not found');
      }

      if (serialNumber.status !== 'allocated') {
        throw new Error('Serial number must be allocated before marking as sold');
      }

      const updated = await this.prisma.serialNumber.update({
        where: { id: serialNumberId },
        data: {
          status: 'sold',
          soldTo: customerId,
          soldDate: new Date(),
          invoiceId,
        },
      });

      logger.info(`[SerialTrackingService] Marked serial number as sold: ${serialNumber.serialNumber}`);
      return updated;
    } catch (error) {
      logger.error('[SerialTrackingService] Failed to mark serial number as sold:', error);
      throw new Error(`Failed to mark serial number as sold: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Return serial number
   */
  async returnSerialNumber(
    serialNumberId: string,
    organizationId: string,
    returnReason: string,
    condition: 'good' | 'defective' | 'damaged'
  ): Promise<SerialNumber> {
    try {
      const serialNumber = await this.prisma.serialNumber.findFirst({
        where: {
          id: serialNumberId,
          organizationId,
        },
      });

      if (!serialNumber) {
        throw new Error('Serial number not found');
      }

      if (serialNumber.status !== 'sold') {
        throw new Error('Serial number must be sold before returning');
      }

      const newStatus = condition === 'good' ? 'available' : 'defective';
      const updated = await this.prisma.serialNumber.update({
        where: { id: serialNumberId },
        data: {
          status: newStatus,
          returnReason,
          returnDate: new Date(),
          soldTo: null,
          soldDate: null,
          invoiceId: null,
        },
      });

      logger.info(`[SerialTrackingService] Returned serial number: ${serialNumber.serialNumber}`);
      return updated;
    } catch (error) {
      logger.error('[SerialTrackingService] Failed to return serial number:', error);
      throw new Error(`Failed to return serial number: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create warranty record
   */
  async createWarranty(data: {
    serialNumberId: string;
    productId: string;
    organizationId: string;
    warrantyType: 'manufacturer' | 'extended' | 'service';
    startDate: Date;
    endDate: Date;
    terms?: string;
    provider?: string;
    notes?: string;
  }): Promise<Warranty> {
    try {
      const warranty = await this.prisma.warranty.create({
        data: {
          id: uuidv4(),
          serialNumberId: data.serialNumberId,
          productId: data.productId,
          organizationId: data.organizationId,
          warrantyType: data.warrantyType,
          startDate: data.startDate,
          endDate: data.endDate,
          status: 'active',
          terms: data.terms,
          provider: data.provider,
          claimCount: 0,
          notes: data.notes,
        },
      });

      logger.info(`[SerialTrackingService] Created warranty for serial number: ${data.serialNumberId}`);
      return warranty;
    } catch (error) {
      logger.error('[SerialTrackingService] Failed to create warranty:', error);
      throw new Error(`Failed to create warranty: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process warranty claim
   */
  async processWarrantyClaim(
    warrantyId: string,
    organizationId: string,
    claimDescription: string
  ): Promise<Warranty> {
    try {
      const warranty = await this.prisma.warranty.findFirst({
        where: {
          id: warrantyId,
          organizationId,
          status: 'active',
        },
      });

      if (!warranty) {
        throw new Error('Warranty not found or not active');
      }

      if (warranty.endDate < new Date()) {
        throw new Error('Warranty has expired');
      }

      const updated = await this.prisma.warranty.update({
        where: { id: warrantyId },
        data: {
          claimCount: warranty.claimCount + 1,
          lastClaimDate: new Date(),
          notes: warranty.notes ? `${warranty.notes}\nClaim: ${claimDescription}` : `Claim: ${claimDescription}`,
        },
      });

      logger.info(`[SerialTrackingService] Processed warranty claim: ${warrantyId}`);
      return updated;
    } catch (error) {
      logger.error('[SerialTrackingService] Failed to process warranty claim:', error);
      throw new Error(`Failed to process warranty claim: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create product recall
   */
  async createRecall(data: {
    productId: string;
    organizationId: string;
    recallType: 'safety' | 'quality' | 'voluntary' | 'mandatory';
    title: string;
    description: string;
    reason: string;
    affectedSerialNumbers: string[];
    affectedLotNumbers: string[];
    actionRequired: string;
    contactInfo?: string;
  }): Promise<Recall> {
    try {
      const recall = await this.prisma.recall.create({
        data: {
          id: uuidv4(),
          productId: data.productId,
          organizationId: data.organizationId,
          recallType: data.recallType,
          title: data.title,
          description: data.description,
          reason: data.reason,
          affectedSerialNumbers: data.affectedSerialNumbers,
          affectedLotNumbers: data.affectedLotNumbers,
          status: 'active',
          startDate: new Date(),
          actionRequired: data.actionRequired,
          contactInfo: data.contactInfo,
        },
      });

      // Update affected serial numbers
      await this.prisma.serialNumber.updateMany({
        where: {
          id: { in: data.affectedSerialNumbers },
          organizationId: data.organizationId,
        },
        data: {
          status: 'recalled',
          recallReason: data.reason,
          recallDate: new Date(),
        },
      });

      // Update affected lot numbers
      await this.prisma.lotNumber.updateMany({
        where: {
          id: { in: data.affectedLotNumbers },
          organizationId: data.organizationId,
        },
        data: {
          status: 'recalled',
          recallReason: data.reason,
          recallDate: new Date(),
        },
      });

      logger.info(`[SerialTrackingService] Created recall: ${data.title}`);
      return recall;
    } catch (error) {
      logger.error('[SerialTrackingService] Failed to create recall:', error);
      throw new Error(`Failed to create recall: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get serial numbers by status
   */
  async getSerialNumbersByStatus(
    organizationId: string,
    status: string,
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<{ data: SerialNumber[]; total: number; page: number; limit: number }> {
    try {
      const where = {
        organizationId,
        status: status as any,
      };

      const [data, total] = await Promise.all([
        this.prisma.serialNumber.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (pagination.page - 1) * pagination.limit,
          take: pagination.limit,
        }),
        this.prisma.serialNumber.count({ where }),
      ]);

      return {
        data,
        total,
        page: pagination.page,
        limit: pagination.limit,
      };
    } catch (error) {
      logger.error('[SerialTrackingService] Failed to get serial numbers by status:', error);
      throw new Error(`Failed to get serial numbers by status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search serial numbers
   */
  async searchSerialNumbers(
    organizationId: string,
    query: string,
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<{ data: SerialNumber[]; total: number; page: number; limit: number }> {
    try {
      const where = {
        organizationId,
        OR: [
          { serialNumber: { contains: query, mode: 'insensitive' as const } },
          { lotNumber: { contains: query, mode: 'insensitive' as const } },
          { batchNumber: { contains: query, mode: 'insensitive' as const } },
        ],
      };

      const [data, total] = await Promise.all([
        this.prisma.serialNumber.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (pagination.page - 1) * pagination.limit,
          take: pagination.limit,
        }),
        this.prisma.serialNumber.count({ where }),
      ]);

      return {
        data,
        total,
        page: pagination.page,
        limit: pagination.limit,
      };
    } catch (error) {
      logger.error('[SerialTrackingService] Failed to search serial numbers:', error);
      throw new Error(`Failed to search serial numbers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get warranty status
   */
  async getWarrantyStatus(serialNumberId: string, organizationId: string): Promise<Warranty | null> {
    try {
      const warranty = await this.prisma.warranty.findFirst({
        where: {
          serialNumberId,
          organizationId,
          status: 'active',
        },
        orderBy: { endDate: 'desc' },
      });

      return warranty;
    } catch (error) {
      logger.error('[SerialTrackingService] Failed to get warranty status:', error);
      throw new Error(`Failed to get warranty status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get recall information
   */
  async getRecallInfo(serialNumberId: string, organizationId: string): Promise<Recall | null> {
    try {
      const recall = await this.prisma.recall.findFirst({
        where: {
          productId: {
            in: await this.prisma.serialNumber.findUnique({
              where: { id: serialNumberId },
              select: { productId: true },
            }).then(sn => sn ? [sn.productId] : []),
          },
          organizationId,
          status: 'active',
          affectedSerialNumbers: {
            has: serialNumberId,
          },
        },
      });

      return recall;
    } catch (error) {
      logger.error('[SerialTrackingService] Failed to get recall info:', error);
      throw new Error(`Failed to get recall info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get serial number analytics
   */
  async getSerialNumberAnalytics(organizationId: string, dateFrom: Date, dateTo: Date) {
    try {
      const [
        totalSerialNumbers,
        statusBreakdown,
        warrantyExpiring,
        recallCount,
        topProducts,
      ] = await Promise.all([
        // Total serial numbers
        this.prisma.serialNumber.count({
          where: {
            organizationId,
            createdAt: {
              gte: dateFrom,
              lte: dateTo,
            },
          },
        }),

        // Status breakdown
        this.prisma.serialNumber.groupBy({
          by: ['status'],
          where: {
            organizationId,
            createdAt: {
              gte: dateFrom,
              lte: dateTo,
            },
          },
          _count: {
            id: true,
          },
        }),

        // Warranty expiring in next 30 days
        this.prisma.warranty.count({
          where: {
            organizationId,
            status: 'active',
            endDate: {
              gte: new Date(),
              lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),

        // Active recalls
        this.prisma.recall.count({
          where: {
            organizationId,
            status: 'active',
          },
        }),

        // Top products by serial number count
        this.prisma.serialNumber.groupBy({
          by: ['productId'],
          where: {
            organizationId,
            createdAt: {
              gte: dateFrom,
              lte: dateTo,
            },
          },
          _count: {
            id: true,
          },
          orderBy: {
            _count: {
              id: 'desc',
            },
          },
          take: 10,
        }),
      ]);

      return {
        totalSerialNumbers,
        statusBreakdown: statusBreakdown.map(item => ({
          status: item.status,
          count: item._count.id,
        })),
        warrantyExpiring,
        recallCount,
        topProducts: topProducts.map(item => ({
          productId: item.productId,
          count: item._count.id,
        })),
      };
    } catch (error) {
      logger.error('[SerialTrackingService] Failed to get analytics:', error);
      throw new Error(`Failed to get analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default new SerialTrackingService();









