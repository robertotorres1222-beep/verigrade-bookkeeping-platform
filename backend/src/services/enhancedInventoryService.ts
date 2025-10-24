import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createInventoryItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  unit: z.string().min(1, 'Unit is required'),
  cost: z.number().min(0, 'Cost must be positive'),
  price: z.number().min(0, 'Price must be positive'),
  minStock: z.number().min(0, 'Min stock must be positive'),
  maxStock: z.number().min(0, 'Max stock must be positive'),
  reorderPoint: z.number().min(0, 'Reorder point must be positive'),
  trackingType: z.enum(['NONE', 'SERIAL', 'BATCH', 'BOTH']),
  valuationMethod: z.enum(['FIFO', 'LIFO', 'WEIGHTED_AVERAGE']),
  isActive: z.boolean().default(true)
});

const createInventoryLocationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  address: z.string().optional(),
  isDefault: z.boolean().default(false)
});

const createInventoryTransactionSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  locationId: z.string().min(1, 'Location is required'),
  type: z.enum(['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT']),
  quantity: z.number().min(0, 'Quantity must be positive'),
  unitCost: z.number().min(0, 'Unit cost must be positive'),
  reference: z.string().optional(),
  notes: z.string().optional(),
  serialNumbers: z.array(z.string()).optional(),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional()
});

// Enhanced inventory service with serial numbers, batches, and multi-location
export class EnhancedInventoryService {
  // Create inventory item with tracking configuration
  async createInventoryItem(organizationId: string, data: any) {
    const validatedData = createInventoryItemSchema.parse(data);

    return await prisma.inventoryItem.create({
      data: {
        organizationId,
        ...validatedData
      }
    });
  }

  // Create inventory location
  async createInventoryLocation(organizationId: string, data: any) {
    const validatedData = createInventoryLocationSchema.parse(data);

    // If this is set as default, unset other defaults
    if (validatedData.isDefault) {
      await prisma.inventoryLocation.updateMany({
        where: { organizationId, isDefault: true },
        data: { isDefault: false }
      });
    }

    return await prisma.inventoryLocation.create({
      data: {
        organizationId,
        ...validatedData
      }
    });
  }

  // Create inventory transaction with serial/batch tracking
  async createInventoryTransaction(organizationId: string, data: any) {
    const validatedData = createInventoryTransactionSchema.parse(data);

    // Get item details
    const item = await prisma.inventoryItem.findFirst({
      where: { id: validatedData.itemId, organizationId }
    });

    if (!item) {
      throw new Error('Inventory item not found');
    }

    // Handle serial number tracking
    if (item.trackingType === 'SERIAL' || item.trackingType === 'BOTH') {
      if (!validatedData.serialNumbers || validatedData.serialNumbers.length === 0) {
        throw new Error('Serial numbers are required for this item');
      }

      if (validatedData.serialNumbers.length !== validatedData.quantity) {
        throw new Error('Number of serial numbers must match quantity');
      }
    }

    // Handle batch tracking
    if (item.trackingType === 'BATCH' || item.trackingType === 'BOTH') {
      if (!validatedData.batchNumber) {
        throw new Error('Batch number is required for this item');
      }
    }

    // Create transaction
    const transaction = await prisma.inventoryTransaction.create({
      data: {
        organizationId,
        ...validatedData,
        expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : null
      }
    });

    // Create serial number records if applicable
    if (validatedData.serialNumbers && validatedData.serialNumbers.length > 0) {
      await prisma.inventorySerialNumber.createMany({
        data: validatedData.serialNumbers.map(serialNumber => ({
          organizationId,
          itemId: validatedData.itemId,
          locationId: validatedData.locationId,
          serialNumber,
          status: validatedData.type === 'IN' ? 'AVAILABLE' : 'SOLD',
          transactionId: transaction.id
        }))
      });
    }

    // Create batch record if applicable
    if (validatedData.batchNumber) {
      await prisma.inventoryBatch.create({
        data: {
          organizationId,
          itemId: validatedData.itemId,
          locationId: validatedData.locationId,
          batchNumber: validatedData.batchNumber,
          quantity: validatedData.quantity,
          unitCost: validatedData.unitCost,
          expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : null,
          status: validatedData.type === 'IN' ? 'AVAILABLE' : 'SOLD',
          transactionId: transaction.id
        }
      });
    }

    // Update item stock levels
    await this.updateItemStockLevels(validatedData.itemId, validatedData.locationId, validatedData.type, validatedData.quantity);

    return transaction;
  }

  // Update item stock levels
  async updateItemStockLevels(itemId: string, locationId: string, type: string, quantity: number) {
    const item = await prisma.inventoryItem.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      throw new Error('Item not found');
    }

    // Get current stock for this location
    const currentStock = await this.getCurrentStock(itemId, locationId);

    let newQuantity = currentStock;
    if (type === 'IN') {
      newQuantity += quantity;
    } else if (type === 'OUT') {
      newQuantity -= quantity;
    }

    // Update or create stock level record
    await prisma.inventoryStockLevel.upsert({
      where: {
        itemId_locationId: {
          itemId,
          locationId
        }
      },
      update: {
        quantity: newQuantity,
        lastUpdated: new Date()
      },
      create: {
        itemId,
        locationId,
        quantity: newQuantity,
        lastUpdated: new Date()
      }
    });

    // Check for reorder alerts
    if (newQuantity <= item.reorderPoint) {
      await this.createReorderAlert(itemId, locationId, newQuantity, item.reorderPoint);
    }
  }

  // Get current stock for item at location
  async getCurrentStock(itemId: string, locationId: string): Promise<number> {
    const stockLevel = await prisma.inventoryStockLevel.findUnique({
      where: {
        itemId_locationId: {
          itemId,
          locationId
        }
      }
    });

    return stockLevel ? Number(stockLevel.quantity) : 0;
  }

  // Create reorder alert
  async createReorderAlert(itemId: string, locationId: string, currentStock: number, reorderPoint: number) {
    const item = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
      include: { organization: true }
    });

    if (!item) return;

    await prisma.inventoryAlert.create({
      data: {
        organizationId: item.organizationId,
        itemId,
        locationId,
        type: 'REORDER',
        message: `Stock level (${currentStock}) is below reorder point (${reorderPoint})`,
        isActive: true
      }
    });
  }

  // Get inventory valuation using different methods
  async getInventoryValuation(organizationId: string, method: 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE') {
    const items = await prisma.inventoryItem.findMany({
      where: { organizationId, isActive: true },
      include: {
        stockLevels: {
          include: {
            location: true
          }
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 100
        }
      }
    });

    const valuations = [];

    for (const item of items) {
      let valuation = 0;

      switch (method) {
        case 'FIFO':
          valuation = await this.calculateFIFOValuation(item);
          break;
        case 'LIFO':
          valuation = await this.calculateLIFOValuation(item);
          break;
        case 'WEIGHTED_AVERAGE':
          valuation = await this.calculateWeightedAverageValuation(item);
          break;
      }

      valuations.push({
        itemId: item.id,
        itemName: item.name,
        sku: item.sku,
        totalQuantity: item.stockLevels.reduce((sum, sl) => sum + Number(sl.quantity), 0),
        valuation,
        method
      });
    }

    return valuations;
  }

  // Calculate FIFO valuation
  async calculateFIFOValuation(item: any): Promise<number> {
    const transactions = await prisma.inventoryTransaction.findMany({
      where: { itemId: item.id, type: 'IN' },
      orderBy: { createdAt: 'asc' }
    });

    let totalCost = 0;
    let remainingQuantity = item.stockLevels.reduce((sum, sl) => sum + Number(sl.quantity), 0);

    for (const transaction of transactions) {
      if (remainingQuantity <= 0) break;

      const quantityToUse = Math.min(Number(transaction.quantity), remainingQuantity);
      totalCost += quantityToUse * Number(transaction.unitCost);
      remainingQuantity -= quantityToUse;
    }

    return totalCost;
  }

  // Calculate LIFO valuation
  async calculateLIFOValuation(item: any): Promise<number> {
    const transactions = await prisma.inventoryTransaction.findMany({
      where: { itemId: item.id, type: 'IN' },
      orderBy: { createdAt: 'desc' }
    });

    let totalCost = 0;
    let remainingQuantity = item.stockLevels.reduce((sum, sl) => sum + Number(sl.quantity), 0);

    for (const transaction of transactions) {
      if (remainingQuantity <= 0) break;

      const quantityToUse = Math.min(Number(transaction.quantity), remainingQuantity);
      totalCost += quantityToUse * Number(transaction.unitCost);
      remainingQuantity -= quantityToUse;
    }

    return totalCost;
  }

  // Calculate weighted average valuation
  async calculateWeightedAverageValuation(item: any): Promise<number> {
    const transactions = await prisma.inventoryTransaction.findMany({
      where: { itemId: item.id, type: 'IN' }
    });

    let totalCost = 0;
    let totalQuantity = 0;

    for (const transaction of transactions) {
      totalCost += Number(transaction.quantity) * Number(transaction.unitCost);
      totalQuantity += Number(transaction.quantity);
    }

    const weightedAverageCost = totalQuantity > 0 ? totalCost / totalQuantity : 0;
    const currentQuantity = item.stockLevels.reduce((sum, sl) => sum + Number(sl.quantity), 0);

    return weightedAverageCost * currentQuantity;
  }

  // Get serial number tracking
  async getSerialNumberTracking(organizationId: string, itemId?: string) {
    const where: any = { organizationId };
    if (itemId) {
      where.itemId = itemId;
    }

    return await prisma.inventorySerialNumber.findMany({
      where,
      include: {
        item: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        },
        location: {
          select: {
            id: true,
            name: true
          }
        },
        transaction: {
          select: {
            id: true,
            type: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get batch tracking
  async getBatchTracking(organizationId: string, itemId?: string) {
    const where: any = { organizationId };
    if (itemId) {
      where.itemId = itemId;
    }

    return await prisma.inventoryBatch.findMany({
      where,
      include: {
        item: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        },
        location: {
          select: {
            id: true,
            name: true
          }
        },
        transaction: {
          select: {
            id: true,
            type: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get multi-location stock levels
  async getMultiLocationStock(organizationId: string, itemId?: string) {
    const where: any = { organizationId };
    if (itemId) {
      where.itemId = itemId;
    }

    return await prisma.inventoryStockLevel.findMany({
      where,
      include: {
        item: {
          select: {
            id: true,
            name: true,
            sku: true,
            minStock: true,
            reorderPoint: true
          }
        },
        location: {
          select: {
            id: true,
            name: true,
            isDefault: true
          }
        }
      },
      orderBy: [
        { item: { name: 'asc' } },
        { location: { name: 'asc' } }
      ]
    });
  }

  // Get inventory alerts
  async getInventoryAlerts(organizationId: string, isActive?: boolean) {
    const where: any = { organizationId };
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return await prisma.inventoryAlert.findMany({
      where,
      include: {
        item: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        },
        location: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Transfer inventory between locations
  async transferInventory(organizationId: string, data: {
    itemId: string;
    fromLocationId: string;
    toLocationId: string;
    quantity: number;
    serialNumbers?: string[];
    batchNumber?: string;
    notes?: string;
  }) {
    // Check if sufficient stock at source location
    const currentStock = await this.getCurrentStock(data.itemId, data.fromLocationId);
    if (currentStock < data.quantity) {
      throw new Error('Insufficient stock at source location');
    }

    // Create OUT transaction at source
    await this.createInventoryTransaction(organizationId, {
      itemId: data.itemId,
      locationId: data.fromLocationId,
      type: 'OUT',
      quantity: data.quantity,
      unitCost: 0, // Will be calculated from current stock
      reference: `TRANSFER-${Date.now()}`,
      notes: `Transfer to ${data.toLocationId}`,
      serialNumbers: data.serialNumbers,
      batchNumber: data.batchNumber
    });

    // Create IN transaction at destination
    await this.createInventoryTransaction(organizationId, {
      itemId: data.itemId,
      locationId: data.toLocationId,
      type: 'IN',
      quantity: data.quantity,
      unitCost: 0, // Will be calculated from current stock
      reference: `TRANSFER-${Date.now()}`,
      notes: `Transfer from ${data.fromLocationId}`,
      serialNumbers: data.serialNumbers,
      batchNumber: data.batchNumber
    });
  }

  // Get inventory reports
  async getInventoryReports(organizationId: string, reportType: 'STOCK_LEVELS' | 'MOVEMENTS' | 'VALUATION' | 'ALERTS') {
    switch (reportType) {
      case 'STOCK_LEVELS':
        return await this.getMultiLocationStock(organizationId);
      
      case 'MOVEMENTS':
        return await prisma.inventoryTransaction.findMany({
          where: { organizationId },
          include: {
            item: {
              select: {
                id: true,
                name: true,
                sku: true
              }
            },
            location: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
      
      case 'VALUATION':
        return await this.getInventoryValuation(organizationId, 'WEIGHTED_AVERAGE');
      
      case 'ALERTS':
        return await this.getInventoryAlerts(organizationId, true);
      
      default:
        throw new Error('Invalid report type');
    }
  }
}