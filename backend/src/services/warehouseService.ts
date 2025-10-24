import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface Warehouse {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  type: 'main' | 'satellite' | 'virtual' | 'consignment';
  status: 'active' | 'inactive' | 'maintenance';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  capacity: {
    totalSpace: number; // in cubic feet
    usedSpace: number;
    maxWeight: number; // in pounds
    currentWeight: number;
  };
  operatingHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  settings: {
    allowNegativeInventory: boolean;
    requireBinLocation: boolean;
    autoAllocate: boolean;
    fifoEnabled: boolean;
    lotTrackingEnabled: boolean;
    serialTrackingEnabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface BinLocation {
  id: string;
  warehouseId: string;
  organizationId: string;
  zone: string;
  aisle: string;
  rack: string;
  shelf: string;
  bin: string;
  fullCode: string; // e.g., "A-01-01-01-01"
  type: 'storage' | 'picking' | 'receiving' | 'shipping' | 'quarantine' | 'damaged';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  capacity: {
    maxWeight: number;
    maxVolume: number;
    currentWeight: number;
    currentVolume: number;
  };
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  temperatureZone?: string;
  hazardClass?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockTransfer {
  id: string;
  organizationId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  transferType: 'internal' | 'external' | 'return' | 'adjustment';
  referenceNumber: string;
  notes?: string;
  requestedBy: string;
  approvedBy?: string;
  requestedAt: Date;
  approvedAt?: Date;
  shippedAt?: Date;
  receivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockTransferItem {
  id: string;
  transferId: string;
  productId: string;
  quantity: number;
  fromBinLocationId?: string;
  toBinLocationId?: string;
  serialNumbers?: string[];
  lotNumbers?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

class WarehouseService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Create warehouse
   */
  async createWarehouse(data: {
    organizationId: string;
    name: string;
    code: string;
    type: 'main' | 'satellite' | 'virtual' | 'consignment';
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    contact: {
      name: string;
      email: string;
      phone: string;
    };
    capacity: {
      totalSpace: number;
      maxWeight: number;
    };
    operatingHours: {
      monday: { open: string; close: string; closed: boolean };
      tuesday: { open: string; close: string; closed: boolean };
      wednesday: { open: string; close: string; closed: boolean };
      thursday: { open: string; close: string; closed: boolean };
      friday: { open: string; close: string; closed: boolean };
      saturday: { open: string; close: string; closed: boolean };
      sunday: { open: string; close: string; closed: boolean };
    };
    settings: {
      allowNegativeInventory: boolean;
      requireBinLocation: boolean;
      autoAllocate: boolean;
      fifoEnabled: boolean;
      lotTrackingEnabled: boolean;
      serialTrackingEnabled: boolean;
    };
  }): Promise<Warehouse> {
    try {
      // Check if warehouse code already exists
      const existing = await this.prisma.warehouse.findFirst({
        where: {
          code: data.code,
          organizationId: data.organizationId,
        },
      });

      if (existing) {
        throw new Error('Warehouse code already exists');
      }

      const warehouse = await this.prisma.warehouse.create({
        data: {
          id: uuidv4(),
          organizationId: data.organizationId,
          name: data.name,
          code: data.code,
          type: data.type,
          status: 'active',
          address: data.address,
          contact: data.contact,
          capacity: {
            totalSpace: data.capacity.totalSpace,
            usedSpace: 0,
            maxWeight: data.capacity.maxWeight,
            currentWeight: 0,
          },
          operatingHours: data.operatingHours,
          settings: data.settings,
        },
      });

      logger.info(`[WarehouseService] Created warehouse: ${data.name} (${data.code})`);
      return warehouse;
    } catch (error) {
      logger.error('[WarehouseService] Failed to create warehouse:', error);
      throw new Error(`Failed to create warehouse: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create bin location
   */
  async createBinLocation(data: {
    warehouseId: string;
    organizationId: string;
    zone: string;
    aisle: string;
    rack: string;
    shelf: string;
    bin: string;
    type: 'storage' | 'picking' | 'receiving' | 'shipping' | 'quarantine' | 'damaged';
    capacity: {
      maxWeight: number;
      maxVolume: number;
    };
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    temperatureZone?: string;
    hazardClass?: string;
    notes?: string;
  }): Promise<BinLocation> {
    try {
      const fullCode = `${data.zone}-${data.aisle}-${data.rack}-${data.shelf}-${data.bin}`;

      // Check if bin location already exists
      const existing = await this.prisma.binLocation.findFirst({
        where: {
          fullCode,
          warehouseId: data.warehouseId,
        },
      });

      if (existing) {
        throw new Error('Bin location already exists');
      }

      const binLocation = await this.prisma.binLocation.create({
        data: {
          id: uuidv4(),
          warehouseId: data.warehouseId,
          organizationId: data.organizationId,
          zone: data.zone,
          aisle: data.aisle,
          rack: data.rack,
          shelf: data.shelf,
          bin: data.bin,
          fullCode,
          type: data.type,
          status: 'available',
          capacity: {
            maxWeight: data.capacity.maxWeight,
            maxVolume: data.capacity.maxVolume,
            currentWeight: 0,
            currentVolume: 0,
          },
          dimensions: data.dimensions,
          temperatureZone: data.temperatureZone,
          hazardClass: data.hazardClass,
          notes: data.notes,
        },
      });

      logger.info(`[WarehouseService] Created bin location: ${fullCode}`);
      return binLocation;
    } catch (error) {
      logger.error('[WarehouseService] Failed to create bin location:', error);
      throw new Error(`Failed to create bin location: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create stock transfer
   */
  async createStockTransfer(data: {
    organizationId: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    transferType: 'internal' | 'external' | 'return' | 'adjustment';
    referenceNumber: string;
    notes?: string;
    requestedBy: string;
    items: {
      productId: string;
      quantity: number;
      fromBinLocationId?: string;
      toBinLocationId?: string;
      serialNumbers?: string[];
      lotNumbers?: string[];
      notes?: string;
    }[];
  }): Promise<StockTransfer> {
    try {
      const transfer = await this.prisma.stockTransfer.create({
        data: {
          id: uuidv4(),
          organizationId: data.organizationId,
          fromWarehouseId: data.fromWarehouseId,
          toWarehouseId: data.toWarehouseId,
          status: 'pending',
          transferType: data.transferType,
          referenceNumber: data.referenceNumber,
          notes: data.notes,
          requestedBy: data.requestedBy,
          requestedAt: new Date(),
        },
      });

      // Create transfer items
      const transferItems = await Promise.all(
        data.items.map(item =>
          this.prisma.stockTransferItem.create({
            data: {
              id: uuidv4(),
              transferId: transfer.id,
              productId: item.productId,
              quantity: item.quantity,
              fromBinLocationId: item.fromBinLocationId,
              toBinLocationId: item.toBinLocationId,
              serialNumbers: item.serialNumbers,
              lotNumbers: item.lotNumbers,
              notes: item.notes,
            },
          })
        )
      );

      logger.info(`[WarehouseService] Created stock transfer: ${data.referenceNumber}`);
      return { ...transfer, items: transferItems };
    } catch (error) {
      logger.error('[WarehouseService] Failed to create stock transfer:', error);
      throw new Error(`Failed to create stock transfer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Approve stock transfer
   */
  async approveStockTransfer(
    transferId: string,
    organizationId: string,
    approvedBy: string
  ): Promise<StockTransfer> {
    try {
      const transfer = await this.prisma.stockTransfer.findFirst({
        where: {
          id: transferId,
          organizationId,
          status: 'pending',
        },
      });

      if (!transfer) {
        throw new Error('Transfer not found or not pending');
      }

      const updated = await this.prisma.stockTransfer.update({
        where: { id: transferId },
        data: {
          status: 'in_transit',
          approvedBy,
          approvedAt: new Date(),
        },
      });

      logger.info(`[WarehouseService] Approved stock transfer: ${transfer.referenceNumber}`);
      return updated;
    } catch (error) {
      logger.error('[WarehouseService] Failed to approve stock transfer:', error);
      throw new Error(`Failed to approve stock transfer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Complete stock transfer
   */
  async completeStockTransfer(
    transferId: string,
    organizationId: string,
    completedBy: string
  ): Promise<StockTransfer> {
    try {
      const transfer = await this.prisma.stockTransfer.findFirst({
        where: {
          id: transferId,
          organizationId,
          status: 'in_transit',
        },
        include: {
          items: true,
        },
      });

      if (!transfer) {
        throw new Error('Transfer not found or not in transit');
      }

      // Update inventory levels
      for (const item of transfer.items) {
        // Reduce from source warehouse
        await this.prisma.inventory.updateMany({
          where: {
            productId: item.productId,
            warehouseId: transfer.fromWarehouseId,
            organizationId,
          },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });

        // Add to destination warehouse
        await this.prisma.inventory.upsert({
          where: {
            productId_warehouseId_organizationId: {
              productId: item.productId,
              warehouseId: transfer.toWarehouseId,
              organizationId,
            },
          },
          update: {
            quantity: {
              increment: item.quantity,
            },
          },
          create: {
            id: uuidv4(),
            productId: item.productId,
            warehouseId: transfer.toWarehouseId,
            organizationId,
            quantity: item.quantity,
            binLocationId: item.toBinLocationId,
          },
        });
      }

      const updated = await this.prisma.stockTransfer.update({
        where: { id: transferId },
        data: {
          status: 'completed',
          receivedAt: new Date(),
        },
      });

      logger.info(`[WarehouseService] Completed stock transfer: ${transfer.referenceNumber}`);
      return updated;
    } catch (error) {
      logger.error('[WarehouseService] Failed to complete stock transfer:', error);
      throw new Error(`Failed to complete stock transfer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get warehouse by ID
   */
  async getWarehouse(warehouseId: string, organizationId: string): Promise<Warehouse | null> {
    try {
      const warehouse = await this.prisma.warehouse.findFirst({
        where: {
          id: warehouseId,
          organizationId,
        },
      });

      return warehouse;
    } catch (error) {
      logger.error('[WarehouseService] Failed to get warehouse:', error);
      throw new Error(`Failed to get warehouse: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get warehouses by organization
   */
  async getWarehouses(
    organizationId: string,
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<{ data: Warehouse[]; total: number; page: number; limit: number }> {
    try {
      const where = { organizationId };

      const [data, total] = await Promise.all([
        this.prisma.warehouse.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (pagination.page - 1) * pagination.limit,
          take: pagination.limit,
        }),
        this.prisma.warehouse.count({ where }),
      ]);

      return {
        data,
        total,
        page: pagination.page,
        limit: pagination.limit,
      };
    } catch (error) {
      logger.error('[WarehouseService] Failed to get warehouses:', error);
      throw new Error(`Failed to get warehouses: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get bin locations by warehouse
   */
  async getBinLocations(
    warehouseId: string,
    organizationId: string,
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<{ data: BinLocation[]; total: number; page: number; limit: number }> {
    try {
      const where = {
        warehouseId,
        organizationId,
      };

      const [data, total] = await Promise.all([
        this.prisma.binLocation.findMany({
          where,
          orderBy: { fullCode: 'asc' },
          skip: (pagination.page - 1) * pagination.limit,
          take: pagination.limit,
        }),
        this.prisma.binLocation.count({ where }),
      ]);

      return {
        data,
        total,
        page: pagination.page,
        limit: pagination.limit,
      };
    } catch (error) {
      logger.error('[WarehouseService] Failed to get bin locations:', error);
      throw new Error(`Failed to get bin locations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get stock transfers
   */
  async getStockTransfers(
    organizationId: string,
    filters: {
      status?: string;
      transferType?: string;
      fromWarehouseId?: string;
      toWarehouseId?: string;
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<{ data: StockTransfer[]; total: number; page: number; limit: number }> {
    try {
      const where = {
        organizationId,
        ...(filters.status && { status: filters.status as any }),
        ...(filters.transferType && { transferType: filters.transferType as any }),
        ...(filters.fromWarehouseId && { fromWarehouseId: filters.fromWarehouseId }),
        ...(filters.toWarehouseId && { toWarehouseId: filters.toWarehouseId }),
      };

      const [data, total] = await Promise.all([
        this.prisma.stockTransfer.findMany({
          where,
          include: {
            items: true,
          },
          orderBy: { createdAt: 'desc' },
          skip: (pagination.page - 1) * pagination.limit,
          take: pagination.limit,
        }),
        this.prisma.stockTransfer.count({ where }),
      ]);

      return {
        data,
        total,
        page: pagination.page,
        limit: pagination.limit,
      };
    } catch (error) {
      logger.error('[WarehouseService] Failed to get stock transfers:', error);
      throw new Error(`Failed to get stock transfers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get warehouse capacity utilization
   */
  async getWarehouseCapacity(warehouseId: string, organizationId: string) {
    try {
      const warehouse = await this.prisma.warehouse.findFirst({
        where: {
          id: warehouseId,
          organizationId,
        },
      });

      if (!warehouse) {
        throw new Error('Warehouse not found');
      }

      // Get current inventory levels
      const inventory = await this.prisma.inventory.findMany({
        where: {
          warehouseId,
          organizationId,
        },
        include: {
          product: true,
        },
      });

      let totalWeight = 0;
      let totalVolume = 0;

      for (const item of inventory) {
        if (item.product.weight) {
          totalWeight += item.product.weight * item.quantity;
        }
        if (item.product.dimensions) {
          const volume = item.product.dimensions.length * item.product.dimensions.width * item.product.dimensions.height;
          totalVolume += volume * item.quantity;
        }
      }

      const spaceUtilization = (totalVolume / warehouse.capacity.totalSpace) * 100;
      const weightUtilization = (totalWeight / warehouse.capacity.maxWeight) * 100;

      return {
        warehouse: {
          id: warehouse.id,
          name: warehouse.name,
          code: warehouse.code,
        },
        capacity: {
          totalSpace: warehouse.capacity.totalSpace,
          usedSpace: totalVolume,
          availableSpace: warehouse.capacity.totalSpace - totalVolume,
          spaceUtilization: Math.round(spaceUtilization * 100) / 100,
          maxWeight: warehouse.capacity.maxWeight,
          currentWeight: totalWeight,
          availableWeight: warehouse.capacity.maxWeight - totalWeight,
          weightUtilization: Math.round(weightUtilization * 100) / 100,
        },
        inventory: {
          totalItems: inventory.length,
          totalQuantity: inventory.reduce((sum, item) => sum + item.quantity, 0),
          totalValue: inventory.reduce((sum, item) => sum + (item.quantity * (item.product.cost || 0)), 0),
        },
      };
    } catch (error) {
      logger.error('[WarehouseService] Failed to get warehouse capacity:', error);
      throw new Error(`Failed to get warehouse capacity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get warehouse analytics
   */
  async getWarehouseAnalytics(organizationId: string, dateFrom: Date, dateTo: Date) {
    try {
      const [
        totalWarehouses,
        activeWarehouses,
        totalBinLocations,
        availableBinLocations,
        totalTransfers,
        completedTransfers,
        transferVolume,
      ] = await Promise.all([
        // Total warehouses
        this.prisma.warehouse.count({
          where: {
            organizationId,
            createdAt: {
              gte: dateFrom,
              lte: dateTo,
            },
          },
        }),

        // Active warehouses
        this.prisma.warehouse.count({
          where: {
            organizationId,
            status: 'active',
          },
        }),

        // Total bin locations
        this.prisma.binLocation.count({
          where: {
            organizationId,
            createdAt: {
              gte: dateFrom,
              lte: dateTo,
            },
          },
        }),

        // Available bin locations
        this.prisma.binLocation.count({
          where: {
            organizationId,
            status: 'available',
          },
        }),

        // Total transfers
        this.prisma.stockTransfer.count({
          where: {
            organizationId,
            createdAt: {
              gte: dateFrom,
              lte: dateTo,
            },
          },
        }),

        // Completed transfers
        this.prisma.stockTransfer.count({
          where: {
            organizationId,
            status: 'completed',
            createdAt: {
              gte: dateFrom,
              lte: dateTo,
            },
          },
        }),

        // Transfer volume by type
        this.prisma.stockTransfer.groupBy({
          by: ['transferType'],
          where: {
            organizationId,
            status: 'completed',
            createdAt: {
              gte: dateFrom,
              lte: dateTo,
            },
          },
          _count: {
            id: true,
          },
        }),
      ]);

      return {
        warehouses: {
          total: totalWarehouses,
          active: activeWarehouses,
          inactive: totalWarehouses - activeWarehouses,
        },
        binLocations: {
          total: totalBinLocations,
          available: availableBinLocations,
          occupied: totalBinLocations - availableBinLocations,
        },
        transfers: {
          total: totalTransfers,
          completed: completedTransfers,
          pending: totalTransfers - completedTransfers,
          volumeByType: transferVolume.map(item => ({
            type: item.transferType,
            count: item._count.id,
          })),
        },
      };
    } catch (error) {
      logger.error('[WarehouseService] Failed to get analytics:', error);
      throw new Error(`Failed to get analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default new WarehouseService();






