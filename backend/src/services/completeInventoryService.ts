import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category: string;
  unit: string;
  costMethod: 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE';
  trackSerial: boolean;
  trackLot: boolean;
  reorderPoint: number;
  reorderQuantity: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

export interface BinLocation {
  id: string;
  warehouseId: string;
  name: string;
  code: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItem {
  id: string;
  productId: string;
  warehouseId: string;
  binLocationId?: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  cost: number;
  lastCost: number;
  averageCost: number;
  serialNumbers?: string[];
  lotNumber?: string;
  expiryDate?: Date;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'ORDERED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
  orderDate: Date;
  expectedDate?: Date;
  receivedDate?: Date;
  totalAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  productId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  receivedQuantity: number;
  status: 'PENDING' | 'PARTIALLY_RECEIVED' | 'RECEIVED';
  createdAt: Date;
  updatedAt: Date;
}

export interface CostLayer {
  id: string;
  productId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  method: 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE';
  transactionDate: Date;
  transactionType: 'PURCHASE' | 'ADJUSTMENT' | 'TRANSFER';
  referenceId?: string;
  createdAt: Date;
}

export interface InventoryForecast {
  id: string;
  productId: string;
  forecastDate: Date;
  predictedQuantity: number;
  confidence: number;
  method: 'SEASONAL' | 'TREND' | 'MOVING_AVERAGE' | 'ML_MODEL';
  accuracy?: number;
  createdAt: Date;
}

export interface InventoryAdjustment {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  reason: string;
  reference?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryTransfer {
  id: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  productId: string;
  quantity: number;
  status: 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  transferDate: Date;
  receivedDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CompleteInventoryService {
  // Product Management
  async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    try {
      const product = await prisma.product.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      logger.info('Product created successfully', { productId: product.id });
      return product as Product;
    } catch (error) {
      logger.error('Error creating product', { error, data });
      throw error;
    }
  }

  async getProducts(filters?: {
    category?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ products: Product[]; total: number; page: number; totalPages: number }> {
    try {
      const { category, status, search, page = 1, limit = 10 } = filters || {};
      const skip = (page - 1) * limit;

      const where: any = {};
      if (category) where.category = category;
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.product.count({ where }),
      ]);

      return {
        products: products as Product[],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error fetching products', { error, filters });
      throw error;
    }
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    try {
      const product = await prisma.product.update({
        where: { id },
        data: { ...data, updatedAt: new Date() },
      });

      logger.info('Product updated successfully', { productId: id });
      return product as Product;
    } catch (error) {
      logger.error('Error updating product', { error, productId: id, data });
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      await prisma.product.delete({ where: { id } });
      logger.info('Product deleted successfully', { productId: id });
    } catch (error) {
      logger.error('Error deleting product', { error, productId: id });
      throw error;
    }
  }

  // Warehouse Management
  async createWarehouse(data: Omit<Warehouse, 'id' | 'createdAt' | 'updatedAt'>): Promise<Warehouse> {
    try {
      const warehouse = await prisma.warehouse.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      logger.info('Warehouse created successfully', { warehouseId: warehouse.id });
      return warehouse as Warehouse;
    } catch (error) {
      logger.error('Error creating warehouse', { error, data });
      throw error;
    }
  }

  async getWarehouses(): Promise<Warehouse[]> {
    try {
      const warehouses = await prisma.warehouse.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { name: 'asc' },
      });

      return warehouses as Warehouse[];
    } catch (error) {
      logger.error('Error fetching warehouses', { error });
      throw error;
    }
  }

  async updateWarehouse(id: string, data: Partial<Warehouse>): Promise<Warehouse> {
    try {
      const warehouse = await prisma.warehouse.update({
        where: { id },
        data: { ...data, updatedAt: new Date() },
      });

      logger.info('Warehouse updated successfully', { warehouseId: id });
      return warehouse as Warehouse;
    } catch (error) {
      logger.error('Error updating warehouse', { error, warehouseId: id, data });
      throw error;
    }
  }

  // Bin Location Management
  async createBinLocation(data: Omit<BinLocation, 'id' | 'createdAt' | 'updatedAt'>): Promise<BinLocation> {
    try {
      const binLocation = await prisma.binLocation.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      logger.info('Bin location created successfully', { binLocationId: binLocation.id });
      return binLocation as BinLocation;
    } catch (error) {
      logger.error('Error creating bin location', { error, data });
      throw error;
    }
  }

  async getBinLocations(warehouseId: string): Promise<BinLocation[]> {
    try {
      const binLocations = await prisma.binLocation.findMany({
        where: { warehouseId, status: 'ACTIVE' },
        orderBy: { name: 'asc' },
      });

      return binLocations as BinLocation[];
    } catch (error) {
      logger.error('Error fetching bin locations', { error, warehouseId });
      throw error;
    }
  }

  // Inventory Management
  async getInventory(productId?: string, warehouseId?: string): Promise<InventoryItem[]> {
    try {
      const where: any = {};
      if (productId) where.productId = productId;
      if (warehouseId) where.warehouseId = warehouseId;

      const inventory = await prisma.inventoryItem.findMany({
        where,
        include: {
          product: true,
          warehouse: true,
          binLocation: true,
        },
        orderBy: { updatedAt: 'desc' },
      });

      return inventory as InventoryItem[];
    } catch (error) {
      logger.error('Error fetching inventory', { error, productId, warehouseId });
      throw error;
    }
  }

  async updateInventoryQuantity(
    productId: string,
    warehouseId: string,
    quantity: number,
    transactionType: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'TRANSFER'
  ): Promise<InventoryItem> {
    try {
      // Get current inventory
      const currentInventory = await prisma.inventoryItem.findFirst({
        where: { productId, warehouseId },
      });

      if (!currentInventory) {
        throw new Error('Inventory item not found');
      }

      // Update quantity based on transaction type
      let newQuantity = currentInventory.quantity;
      if (transactionType === 'PURCHASE' || transactionType === 'ADJUSTMENT') {
        newQuantity += quantity;
      } else if (transactionType === 'SALE' || transactionType === 'TRANSFER') {
        newQuantity -= quantity;
      }

      if (newQuantity < 0) {
        throw new Error('Insufficient inventory quantity');
      }

      // Update inventory
      const updatedInventory = await prisma.inventoryItem.update({
        where: { id: currentInventory.id },
        data: {
          quantity: newQuantity,
          availableQuantity: newQuantity - currentInventory.reservedQuantity,
          updatedAt: new Date(),
        },
      });

      // Create cost layer for tracking
      await this.createCostLayer({
        productId,
        quantity: Math.abs(quantity),
        unitCost: currentInventory.lastCost,
        method: 'FIFO',
        transactionDate: new Date(),
        transactionType: transactionType as any,
      });

      logger.info('Inventory quantity updated', {
        productId,
        warehouseId,
        quantity,
        transactionType,
        newQuantity,
      });

      return updatedInventory as InventoryItem;
    } catch (error) {
      logger.error('Error updating inventory quantity', {
        error,
        productId,
        warehouseId,
        quantity,
        transactionType,
      });
      throw error;
    }
  }

  // Purchase Order Management
  async createPurchaseOrder(data: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<PurchaseOrder> {
    try {
      const purchaseOrder = await prisma.purchaseOrder.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      logger.info('Purchase order created successfully', { poId: purchaseOrder.id });
      return purchaseOrder as PurchaseOrder;
    } catch (error) {
      logger.error('Error creating purchase order', { error, data });
      throw error;
    }
  }

  async getPurchaseOrders(filters?: {
    status?: string;
    vendorId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ purchaseOrders: PurchaseOrder[]; total: number; page: number; totalPages: number }> {
    try {
      const { status, vendorId, dateFrom, dateTo, page = 1, limit = 10 } = filters || {};
      const skip = (page - 1) * limit;

      const where: any = {};
      if (status) where.status = status;
      if (vendorId) where.vendorId = vendorId;
      if (dateFrom || dateTo) {
        where.orderDate = {};
        if (dateFrom) where.orderDate.gte = dateFrom;
        if (dateTo) where.orderDate.lte = dateTo;
      }

      const [purchaseOrders, total] = await Promise.all([
        prisma.purchaseOrder.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.purchaseOrder.count({ where }),
      ]);

      return {
        purchaseOrders: purchaseOrders as PurchaseOrder[],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error fetching purchase orders', { error, filters });
      throw error;
    }
  }

  async receivePurchaseOrder(poId: string, receivedItems: Array<{
    productId: string;
    quantity: number;
    unitCost: number;
  }>): Promise<void> {
    try {
      const purchaseOrder = await prisma.purchaseOrder.findUnique({
        where: { id: poId },
        include: { items: true },
      });

      if (!purchaseOrder) {
        throw new Error('Purchase order not found');
      }

      // Update inventory for each received item
      for (const item of receivedItems) {
        await this.updateInventoryQuantity(
          item.productId,
          purchaseOrder.warehouseId || '',
          item.quantity,
          'PURCHASE'
        );

        // Update purchase order item
        await prisma.purchaseOrderItem.updateMany({
          where: { purchaseOrderId: poId, productId: item.productId },
          data: {
            receivedQuantity: { increment: item.quantity },
            status: 'RECEIVED',
            updatedAt: new Date(),
          },
        });
      }

      // Update purchase order status
      await prisma.purchaseOrder.update({
        where: { id: poId },
        data: {
          status: 'RECEIVED',
          receivedDate: new Date(),
          updatedAt: new Date(),
        },
      });

      logger.info('Purchase order received successfully', { poId, receivedItems });
    } catch (error) {
      logger.error('Error receiving purchase order', { error, poId, receivedItems });
      throw error;
    }
  }

  // Cost Layer Management
  async createCostLayer(data: Omit<CostLayer, 'id' | 'createdAt'>): Promise<CostLayer> {
    try {
      const costLayer = await prisma.costLayer.create({
        data: {
          ...data,
          totalCost: data.quantity * data.unitCost,
          createdAt: new Date(),
        },
      });

      logger.info('Cost layer created successfully', { costLayerId: costLayer.id });
      return costLayer as CostLayer;
    } catch (error) {
      logger.error('Error creating cost layer', { error, data });
      throw error;
    }
  }

  async getCostLayers(productId: string): Promise<CostLayer[]> {
    try {
      const costLayers = await prisma.costLayer.findMany({
        where: { productId },
        orderBy: { transactionDate: 'desc' },
      });

      return costLayers as CostLayer[];
    } catch (error) {
      logger.error('Error fetching cost layers', { error, productId });
      throw error;
    }
  }

  // Inventory Forecasting
  async generateInventoryForecast(productId: string, method: 'SEASONAL' | 'TREND' | 'MOVING_AVERAGE' | 'ML_MODEL'): Promise<InventoryForecast[]> {
    try {
      // Get historical inventory data
      const historicalData = await prisma.inventoryItem.findMany({
        where: { productId },
        orderBy: { createdAt: 'asc' },
      });

      if (historicalData.length < 12) {
        throw new Error('Insufficient historical data for forecasting');
      }

      const forecasts: InventoryForecast[] = [];
      const forecastDate = new Date();
      forecastDate.setMonth(forecastDate.getMonth() + 1);

      let predictedQuantity = 0;
      let confidence = 0;

      switch (method) {
        case 'MOVING_AVERAGE':
          const recentQuantities = historicalData.slice(-6).map(item => item.quantity);
          predictedQuantity = recentQuantities.reduce((sum, qty) => sum + qty, 0) / recentQuantities.length;
          confidence = 0.7;
          break;

        case 'TREND':
          const quantities = historicalData.map(item => item.quantity);
          const trend = this.calculateTrend(quantities);
          predictedQuantity = quantities[quantities.length - 1] + trend;
          confidence = 0.8;
          break;

        case 'SEASONAL':
          const seasonalFactor = this.calculateSeasonalFactor(historicalData);
          const avgQuantity = historicalData.reduce((sum, item) => sum + item.quantity, 0) / historicalData.length;
          predictedQuantity = avgQuantity * seasonalFactor;
          confidence = 0.75;
          break;

        case 'ML_MODEL':
          // Placeholder for ML model prediction
          predictedQuantity = historicalData[historicalData.length - 1].quantity * 1.1;
          confidence = 0.85;
          break;
      }

      const forecast = await prisma.inventoryForecast.create({
        data: {
          productId,
          forecastDate,
          predictedQuantity: Math.round(predictedQuantity),
          confidence,
          method,
          createdAt: new Date(),
        },
      });

      forecasts.push(forecast as InventoryForecast);

      logger.info('Inventory forecast generated', { productId, method, predictedQuantity, confidence });
      return forecasts;
    } catch (error) {
      logger.error('Error generating inventory forecast', { error, productId, method });
      throw error;
    }
  }

  // Inventory Adjustments
  async createInventoryAdjustment(data: Omit<InventoryAdjustment, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryAdjustment> {
    try {
      const adjustment = await prisma.inventoryAdjustment.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      logger.info('Inventory adjustment created successfully', { adjustmentId: adjustment.id });
      return adjustment as InventoryAdjustment;
    } catch (error) {
      logger.error('Error creating inventory adjustment', { error, data });
      throw error;
    }
  }

  async approveInventoryAdjustment(adjustmentId: string): Promise<void> {
    try {
      const adjustment = await prisma.inventoryAdjustment.findUnique({
        where: { id: adjustmentId },
      });

      if (!adjustment) {
        throw new Error('Inventory adjustment not found');
      }

      // Update inventory quantity
      await this.updateInventoryQuantity(
        adjustment.productId,
        adjustment.warehouseId,
        adjustment.quantity,
        'ADJUSTMENT'
      );

      // Update adjustment status
      await prisma.inventoryAdjustment.update({
        where: { id: adjustmentId },
        data: {
          status: 'APPROVED',
          updatedAt: new Date(),
        },
      });

      logger.info('Inventory adjustment approved successfully', { adjustmentId });
    } catch (error) {
      logger.error('Error approving inventory adjustment', { error, adjustmentId });
      throw error;
    }
  }

  // Inventory Transfers
  async createInventoryTransfer(data: Omit<InventoryTransfer, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryTransfer> {
    try {
      const transfer = await prisma.inventoryTransfer.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      logger.info('Inventory transfer created successfully', { transferId: transfer.id });
      return transfer as InventoryTransfer;
    } catch (error) {
      logger.error('Error creating inventory transfer', { error, data });
      throw error;
    }
  }

  async completeInventoryTransfer(transferId: string): Promise<void> {
    try {
      const transfer = await prisma.inventoryTransfer.findUnique({
        where: { id: transferId },
      });

      if (!transfer) {
        throw new Error('Inventory transfer not found');
      }

      // Update inventory quantities
      await this.updateInventoryQuantity(
        transfer.productId,
        transfer.fromWarehouseId,
        -transfer.quantity,
        'TRANSFER'
      );

      await this.updateInventoryQuantity(
        transfer.productId,
        transfer.toWarehouseId,
        transfer.quantity,
        'TRANSFER'
      );

      // Update transfer status
      await prisma.inventoryTransfer.update({
        where: { id: transferId },
        data: {
          status: 'COMPLETED',
          receivedDate: new Date(),
          updatedAt: new Date(),
        },
      });

      logger.info('Inventory transfer completed successfully', { transferId });
    } catch (error) {
      logger.error('Error completing inventory transfer', { error, transferId });
      throw error;
    }
  }

  // Analytics and Reporting
  async getInventoryAnalytics(): Promise<{
    totalProducts: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    topProducts: Array<{ productId: string; name: string; quantity: number; value: number }>;
    categoryBreakdown: Array<{ category: string; count: number; value: number }>;
  }> {
    try {
      const [
        totalProducts,
        inventoryItems,
        lowStockItems,
        outOfStockItems,
      ] = await Promise.all([
        prisma.product.count({ where: { status: 'ACTIVE' } }),
        prisma.inventoryItem.findMany({
          include: { product: true },
        }),
        prisma.inventoryItem.count({
          where: {
            quantity: { lte: prisma.product.fields.reorderPoint },
          },
        }),
        prisma.inventoryItem.count({
          where: { quantity: 0 },
        }),
      ]);

      const totalValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.cost), 0);

      // Top products by value
      const topProducts = inventoryItems
        .map(item => ({
          productId: item.productId,
          name: item.product.name,
          quantity: item.quantity,
          value: item.quantity * item.cost,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      // Category breakdown
      const categoryBreakdown = inventoryItems.reduce((acc, item) => {
        const category = item.product.category;
        if (!acc[category]) {
          acc[category] = { count: 0, value: 0 };
        }
        acc[category].count += 1;
        acc[category].value += item.quantity * item.cost;
        return acc;
      }, {} as Record<string, { count: number; value: number }>);

      const categoryBreakdownArray = Object.entries(categoryBreakdown).map(([category, data]) => ({
        category,
        count: data.count,
        value: data.value,
      }));

      return {
        totalProducts,
        totalValue,
        lowStockItems,
        outOfStockItems,
        topProducts,
        categoryBreakdown: categoryBreakdownArray,
      };
    } catch (error) {
      logger.error('Error fetching inventory analytics', { error });
      throw error;
    }
  }

  // Helper methods
  private calculateTrend(quantities: number[]): number {
    if (quantities.length < 2) return 0;
    
    const n = quantities.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = quantities.reduce((sum, qty) => sum + qty, 0);
    const sumXY = quantities.reduce((sum, qty, index) => sum + (index * qty), 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  private calculateSeasonalFactor(historicalData: any[]): number {
    // Simple seasonal factor calculation based on month
    const currentMonth = new Date().getMonth();
    const monthlyData = historicalData.reduce((acc, item) => {
      const month = new Date(item.createdAt).getMonth();
      if (!acc[month]) acc[month] = [];
      acc[month].push(item.quantity);
      return acc;
    }, {} as Record<number, number[]>);

    const currentMonthData = monthlyData[currentMonth] || [];
    const avgQuantity = currentMonthData.reduce((sum, qty) => sum + qty, 0) / currentMonthData.length;
    const overallAvg = historicalData.reduce((sum, item) => sum + item.quantity, 0) / historicalData.length;
    
    return avgQuantity / overallAvg;
  }
}

export const completeInventoryService = new CompleteInventoryService();
