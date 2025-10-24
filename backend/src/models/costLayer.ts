import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface CostLayer {
  id: string;
  productId: string;
  organizationId: string;
  layerType: 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE' | 'SPECIFIC_IDENTIFICATION';
  quantity: number;
  unitCost: number;
  totalCost: number;
  purchaseDate: Date;
  purchaseOrderId?: string;
  supplierId?: string;
  batchNumber?: string;
  lotNumber?: string;
  serialNumbers?: string[];
  expirationDate?: Date;
  status: 'available' | 'allocated' | 'sold' | 'expired' | 'damaged';
  createdAt: Date;
  updatedAt: Date;
}

export interface CostLayerTransaction {
  id: string;
  organizationId: string;
  productId: string;
  transactionType: 'purchase' | 'sale' | 'adjustment' | 'transfer' | 'return';
  quantity: number;
  unitCost: number;
  totalCost: number;
  method: 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE' | 'SPECIFIC_IDENTIFICATION';
  referenceId?: string; // Invoice ID, PO ID, etc.
  referenceType?: string; // 'invoice', 'purchase_order', 'adjustment', etc.
  costLayerIds: string[]; // Which cost layers were affected
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface COGSCalculation {
  productId: string;
  organizationId: string;
  method: 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE' | 'SPECIFIC_IDENTIFICATION';
  quantitySold: number;
  totalCOGS: number;
  averageUnitCost: number;
  remainingQuantity: number;
  remainingValue: number;
  costLayersUsed: CostLayer[];
  calculationDate: Date;
}

class CostLayerModel {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Add cost layer for purchase
   */
  async addCostLayer(data: {
    productId: string;
    organizationId: string;
    layerType: 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE' | 'SPECIFIC_IDENTIFICATION';
    quantity: number;
    unitCost: number;
    purchaseDate: Date;
    purchaseOrderId?: string;
    supplierId?: string;
    batchNumber?: string;
    lotNumber?: string;
    serialNumbers?: string[];
    expirationDate?: Date;
  }): Promise<CostLayer> {
    try {
      const totalCost = data.quantity * data.unitCost;

      const costLayer = await this.prisma.costLayer.create({
        data: {
          id: uuidv4(),
          productId: data.productId,
          organizationId: data.organizationId,
          layerType: data.layerType,
          quantity: data.quantity,
          unitCost: data.unitCost,
          totalCost,
          purchaseDate: data.purchaseDate,
          purchaseOrderId: data.purchaseOrderId,
          supplierId: data.supplierId,
          batchNumber: data.batchNumber,
          lotNumber: data.lotNumber,
          serialNumbers: data.serialNumbers,
          expirationDate: data.expirationDate,
          status: 'available',
        },
      });

      // Create cost layer transaction
      await this.createCostLayerTransaction({
        organizationId: data.organizationId,
        productId: data.productId,
        transactionType: 'purchase',
        quantity: data.quantity,
        unitCost: data.unitCost,
        totalCost,
        method: data.layerType,
        referenceId: data.purchaseOrderId,
        referenceType: 'purchase_order',
        costLayerIds: [costLayer.id],
      });

      logger.info(`[CostLayerModel] Added cost layer for product: ${data.productId}`);
      return costLayer;
    } catch (error) {
      logger.error('[CostLayerModel] Failed to add cost layer:', error);
      throw new Error(`Failed to add cost layer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate COGS using FIFO method
   */
  async calculateCOGSFIFO(
    productId: string,
    organizationId: string,
    quantityToSell: number
  ): Promise<COGSCalculation> {
    try {
      // Get available cost layers ordered by purchase date (FIFO)
      const costLayers = await this.prisma.costLayer.findMany({
        where: {
          productId,
          organizationId,
          status: 'available',
          quantity: { gt: 0 },
        },
        orderBy: { purchaseDate: 'asc' },
      });

      if (costLayers.length === 0) {
        throw new Error('No available cost layers found');
      }

      let remainingQuantity = quantityToSell;
      let totalCOGS = 0;
      const costLayersUsed: CostLayer[] = [];
      const costLayerIds: string[] = [];

      for (const layer of costLayers) {
        if (remainingQuantity <= 0) break;

        const quantityToUse = Math.min(remainingQuantity, layer.quantity);
        const layerCOGS = quantityToUse * layer.unitCost;

        totalCOGS += layerCOGS;
        remainingQuantity -= quantityToUse;

        // Update cost layer
        const updatedLayer = await this.prisma.costLayer.update({
          where: { id: layer.id },
          data: {
            quantity: layer.quantity - quantityToUse,
            totalCost: (layer.quantity - quantityToUse) * layer.unitCost,
            status: layer.quantity - quantityToUse === 0 ? 'sold' : 'available',
          },
        });

        costLayersUsed.push({
          ...updatedLayer,
          quantity: quantityToUse, // Amount used from this layer
        });
        costLayerIds.push(layer.id);
      }

      if (remainingQuantity > 0) {
        throw new Error(`Insufficient inventory. Need ${quantityToSell} units, but only ${quantityToSell - remainingQuantity} available`);
      }

      // Calculate remaining inventory value
      const remainingLayers = await this.prisma.costLayer.findMany({
        where: {
          productId,
          organizationId,
          status: 'available',
          quantity: { gt: 0 },
        },
      });

      const remainingQuantityTotal = remainingLayers.reduce((sum, layer) => sum + layer.quantity, 0);
      const remainingValue = remainingLayers.reduce((sum, layer) => sum + layer.totalCost, 0);

      const averageUnitCost = totalCOGS / quantityToSell;

      // Create cost layer transaction
      await this.createCostLayerTransaction({
        organizationId,
        productId,
        transactionType: 'sale',
        quantity: quantityToSell,
        unitCost: averageUnitCost,
        totalCost: totalCOGS,
        method: 'FIFO',
        costLayerIds,
      });

      const calculation: COGSCalculation = {
        productId,
        organizationId,
        method: 'FIFO',
        quantitySold: quantityToSell,
        totalCOGS,
        averageUnitCost,
        remainingQuantity: remainingQuantityTotal,
        remainingValue,
        costLayersUsed,
        calculationDate: new Date(),
      };

      logger.info(`[CostLayerModel] Calculated COGS using FIFO for product: ${productId}`);
      return calculation;
    } catch (error) {
      logger.error('[CostLayerModel] Failed to calculate COGS FIFO:', error);
      throw new Error(`Failed to calculate COGS FIFO: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate COGS using LIFO method
   */
  async calculateCOGSLIFO(
    productId: string,
    organizationId: string,
    quantityToSell: number
  ): Promise<COGSCalculation> {
    try {
      // Get available cost layers ordered by purchase date (LIFO - newest first)
      const costLayers = await this.prisma.costLayer.findMany({
        where: {
          productId,
          organizationId,
          status: 'available',
          quantity: { gt: 0 },
        },
        orderBy: { purchaseDate: 'desc' },
      });

      if (costLayers.length === 0) {
        throw new Error('No available cost layers found');
      }

      let remainingQuantity = quantityToSell;
      let totalCOGS = 0;
      const costLayersUsed: CostLayer[] = [];
      const costLayerIds: string[] = [];

      for (const layer of costLayers) {
        if (remainingQuantity <= 0) break;

        const quantityToUse = Math.min(remainingQuantity, layer.quantity);
        const layerCOGS = quantityToUse * layer.unitCost;

        totalCOGS += layerCOGS;
        remainingQuantity -= quantityToUse;

        // Update cost layer
        const updatedLayer = await this.prisma.costLayer.update({
          where: { id: layer.id },
          data: {
            quantity: layer.quantity - quantityToUse,
            totalCost: (layer.quantity - quantityToUse) * layer.unitCost,
            status: layer.quantity - quantityToUse === 0 ? 'sold' : 'available',
          },
        });

        costLayersUsed.push({
          ...updatedLayer,
          quantity: quantityToUse, // Amount used from this layer
        });
        costLayerIds.push(layer.id);
      }

      if (remainingQuantity > 0) {
        throw new Error(`Insufficient inventory. Need ${quantityToSell} units, but only ${quantityToSell - remainingQuantity} available`);
      }

      // Calculate remaining inventory value
      const remainingLayers = await this.prisma.costLayer.findMany({
        where: {
          productId,
          organizationId,
          status: 'available',
          quantity: { gt: 0 },
        },
      });

      const remainingQuantityTotal = remainingLayers.reduce((sum, layer) => sum + layer.quantity, 0);
      const remainingValue = remainingLayers.reduce((sum, layer) => sum + layer.totalCost, 0);

      const averageUnitCost = totalCOGS / quantityToSell;

      // Create cost layer transaction
      await this.createCostLayerTransaction({
        organizationId,
        productId,
        transactionType: 'sale',
        quantity: quantityToSell,
        unitCost: averageUnitCost,
        totalCost: totalCOGS,
        method: 'LIFO',
        costLayerIds,
      });

      const calculation: COGSCalculation = {
        productId,
        organizationId,
        method: 'LIFO',
        quantitySold: quantityToSell,
        totalCOGS,
        averageUnitCost,
        remainingQuantity: remainingQuantityTotal,
        remainingValue,
        costLayersUsed,
        calculationDate: new Date(),
      };

      logger.info(`[CostLayerModel] Calculated COGS using LIFO for product: ${productId}`);
      return calculation;
    } catch (error) {
      logger.error('[CostLayerModel] Failed to calculate COGS LIFO:', error);
      throw new Error(`Failed to calculate COGS LIFO: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate COGS using Weighted Average method
   */
  async calculateCOGSWeightedAverage(
    productId: string,
    organizationId: string,
    quantityToSell: number
  ): Promise<COGSCalculation> {
    try {
      // Get all available cost layers
      const costLayers = await this.prisma.costLayer.findMany({
        where: {
          productId,
          organizationId,
          status: 'available',
          quantity: { gt: 0 },
        },
      });

      if (costLayers.length === 0) {
        throw new Error('No available cost layers found');
      }

      // Calculate weighted average cost
      const totalQuantity = costLayers.reduce((sum, layer) => sum + layer.quantity, 0);
      const totalValue = costLayers.reduce((sum, layer) => sum + layer.totalCost, 0);
      const weightedAverageCost = totalValue / totalQuantity;

      if (quantityToSell > totalQuantity) {
        throw new Error(`Insufficient inventory. Need ${quantityToSell} units, but only ${totalQuantity} available`);
      }

      const totalCOGS = quantityToSell * weightedAverageCost;

      // Update cost layers proportionally
      const costLayersUsed: CostLayer[] = [];
      const costLayerIds: string[] = [];

      for (const layer of costLayers) {
        const proportion = layer.quantity / totalQuantity;
        const quantityToUse = Math.round(quantityToSell * proportion);
        
        if (quantityToUse > 0) {
          const updatedLayer = await this.prisma.costLayer.update({
            where: { id: layer.id },
            data: {
              quantity: layer.quantity - quantityToUse,
              totalCost: (layer.quantity - quantityToUse) * layer.unitCost,
              status: layer.quantity - quantityToUse === 0 ? 'sold' : 'available',
            },
          });

          costLayersUsed.push({
            ...updatedLayer,
            quantity: quantityToUse, // Amount used from this layer
          });
          costLayerIds.push(layer.id);
        }
      }

      // Calculate remaining inventory
      const remainingLayers = await this.prisma.costLayer.findMany({
        where: {
          productId,
          organizationId,
          status: 'available',
          quantity: { gt: 0 },
        },
      });

      const remainingQuantity = remainingLayers.reduce((sum, layer) => sum + layer.quantity, 0);
      const remainingValue = remainingLayers.reduce((sum, layer) => sum + layer.totalCost, 0);

      // Create cost layer transaction
      await this.createCostLayerTransaction({
        organizationId,
        productId,
        transactionType: 'sale',
        quantity: quantityToSell,
        unitCost: weightedAverageCost,
        totalCost: totalCOGS,
        method: 'WEIGHTED_AVERAGE',
        costLayerIds,
      });

      const calculation: COGSCalculation = {
        productId,
        organizationId,
        method: 'WEIGHTED_AVERAGE',
        quantitySold: quantityToSell,
        totalCOGS,
        averageUnitCost: weightedAverageCost,
        remainingQuantity,
        remainingValue,
        costLayersUsed,
        calculationDate: new Date(),
      };

      logger.info(`[CostLayerModel] Calculated COGS using Weighted Average for product: ${productId}`);
      return calculation;
    } catch (error) {
      logger.error('[CostLayerModel] Failed to calculate COGS Weighted Average:', error);
      throw new Error(`Failed to calculate COGS Weighted Average: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate COGS using Specific Identification method
   */
  async calculateCOGSSpecificIdentification(
    productId: string,
    organizationId: string,
    specificCostLayerIds: string[]
  ): Promise<COGSCalculation> {
    try {
      // Get specific cost layers
      const costLayers = await this.prisma.costLayer.findMany({
        where: {
          id: { in: specificCostLayerIds },
          productId,
          organizationId,
          status: 'available',
        },
      });

      if (costLayers.length === 0) {
        throw new Error('No available cost layers found for specified IDs');
      }

      const quantityToSell = costLayers.reduce((sum, layer) => sum + layer.quantity, 0);
      const totalCOGS = costLayers.reduce((sum, layer) => sum + layer.totalCost, 0);
      const averageUnitCost = totalCOGS / quantityToSell;

      // Mark all specified layers as sold
      const costLayersUsed: CostLayer[] = [];
      const costLayerIds: string[] = [];

      for (const layer of costLayers) {
        const updatedLayer = await this.prisma.costLayer.update({
          where: { id: layer.id },
          data: {
            status: 'sold',
          },
        });

        costLayersUsed.push(updatedLayer);
        costLayerIds.push(layer.id);
      }

      // Calculate remaining inventory
      const remainingLayers = await this.prisma.costLayer.findMany({
        where: {
          productId,
          organizationId,
          status: 'available',
          quantity: { gt: 0 },
        },
      });

      const remainingQuantity = remainingLayers.reduce((sum, layer) => sum + layer.quantity, 0);
      const remainingValue = remainingLayers.reduce((sum, layer) => sum + layer.totalCost, 0);

      // Create cost layer transaction
      await this.createCostLayerTransaction({
        organizationId,
        productId,
        transactionType: 'sale',
        quantity: quantityToSell,
        unitCost: averageUnitCost,
        totalCost: totalCOGS,
        method: 'SPECIFIC_IDENTIFICATION',
        costLayerIds,
      });

      const calculation: COGSCalculation = {
        productId,
        organizationId,
        method: 'SPECIFIC_IDENTIFICATION',
        quantitySold: quantityToSell,
        totalCOGS,
        averageUnitCost,
        remainingQuantity,
        remainingValue,
        costLayersUsed,
        calculationDate: new Date(),
      };

      logger.info(`[CostLayerModel] Calculated COGS using Specific Identification for product: ${productId}`);
      return calculation;
    } catch (error) {
      logger.error('[CostLayerModel] Failed to calculate COGS Specific Identification:', error);
      throw new Error(`Failed to calculate COGS Specific Identification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get cost layer summary
   */
  async getCostLayerSummary(
    productId: string,
    organizationId: string
  ): Promise<{
    totalQuantity: number;
    totalValue: number;
    averageCost: number;
    layers: CostLayer[];
    method: string;
  }> {
    try {
      const layers = await this.prisma.costLayer.findMany({
        where: {
          productId,
          organizationId,
          status: 'available',
        },
        orderBy: { purchaseDate: 'asc' },
      });

      const totalQuantity = layers.reduce((sum, layer) => sum + layer.quantity, 0);
      const totalValue = layers.reduce((sum, layer) => sum + layer.totalCost, 0);
      const averageCost = totalQuantity > 0 ? totalValue / totalQuantity : 0;

      // Get the method used for this product
      const product = await this.prisma.product.findFirst({
        where: { id: productId, organizationId },
        select: { costMethod: true },
      });

      return {
        totalQuantity,
        totalValue,
        averageCost,
        layers,
        method: product?.costMethod || 'FIFO',
      };
    } catch (error) {
      logger.error('[CostLayerModel] Failed to get cost layer summary:', error);
      throw new Error(`Failed to get cost layer summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create cost layer transaction record
   */
  private async createCostLayerTransaction(data: {
    organizationId: string;
    productId: string;
    transactionType: 'purchase' | 'sale' | 'adjustment' | 'transfer' | 'return';
    quantity: number;
    unitCost: number;
    totalCost: number;
    method: 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE' | 'SPECIFIC_IDENTIFICATION';
    referenceId?: string;
    referenceType?: string;
    costLayerIds: string[];
    notes?: string;
  }): Promise<CostLayerTransaction> {
    try {
      const transaction = await this.prisma.costLayerTransaction.create({
        data: {
          id: uuidv4(),
          organizationId: data.organizationId,
          productId: data.productId,
          transactionType: data.transactionType,
          quantity: data.quantity,
          unitCost: data.unitCost,
          totalCost: data.totalCost,
          method: data.method,
          referenceId: data.referenceId,
          referenceType: data.referenceType,
          costLayerIds: data.costLayerIds,
          notes: data.notes,
        },
      });

      return transaction;
    } catch (error) {
      logger.error('[CostLayerModel] Failed to create cost layer transaction:', error);
      throw new Error(`Failed to create cost layer transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get cost layer transactions
   */
  async getCostLayerTransactions(
    productId: string,
    organizationId: string,
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<{ data: CostLayerTransaction[]; total: number; page: number; limit: number }> {
    try {
      const where = {
        productId,
        organizationId,
      };

      const [data, total] = await Promise.all([
        this.prisma.costLayerTransaction.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (pagination.page - 1) * pagination.limit,
          take: pagination.limit,
        }),
        this.prisma.costLayerTransaction.count({ where }),
      ]);

      return {
        data,
        total,
        page: pagination.page,
        limit: pagination.limit,
      };
    } catch (error) {
      logger.error('[CostLayerModel] Failed to get cost layer transactions:', error);
      throw new Error(`Failed to get cost layer transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Adjust cost layer (for inventory adjustments)
   */
  async adjustCostLayer(
    productId: string,
    organizationId: string,
    adjustmentType: 'increase' | 'decrease',
    quantity: number,
    unitCost: number,
    reason: string
  ): Promise<CostLayer> {
    try {
      const adjustedQuantity = adjustmentType === 'increase' ? quantity : -quantity;
      const totalCost = adjustedQuantity * unitCost;

      const costLayer = await this.prisma.costLayer.create({
        data: {
          id: uuidv4(),
          productId,
          organizationId,
          layerType: 'WEIGHTED_AVERAGE', // Adjustments use weighted average
          quantity: adjustedQuantity,
          unitCost,
          totalCost,
          purchaseDate: new Date(),
          status: 'available',
        },
      });

      // Create cost layer transaction
      await this.createCostLayerTransaction({
        organizationId,
        productId,
        transactionType: 'adjustment',
        quantity: adjustedQuantity,
        unitCost,
        totalCost,
        method: 'WEIGHTED_AVERAGE',
        costLayerIds: [costLayer.id],
        notes: reason,
      });

      logger.info(`[CostLayerModel] Adjusted cost layer for product: ${productId}`);
      return costLayer;
    } catch (error) {
      logger.error('[CostLayerModel] Failed to adjust cost layer:', error);
      throw new Error(`Failed to adjust cost layer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default new CostLayerModel();






