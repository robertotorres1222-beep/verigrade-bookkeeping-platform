import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

export interface CostLayer {
  id: string;
  productId: string;
  organizationId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  method: 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE' | 'STANDARD_COST';
  receivedDate: Date;
  supplierId?: string;
  purchaseOrderId?: string;
  batchNumber?: string;
  lotNumber?: string;
  expirationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface COGSCalculation {
  productId: string;
  method: 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE' | 'STANDARD_COST';
  quantitySold: number;
  costOfGoodsSold: number;
  averageUnitCost: number;
  remainingQuantity: number;
  remainingValue: number;
  layers: CostLayer[];
}

export interface LandedCost {
  productId: string;
  purchaseOrderId: string;
  baseCost: number;
  freight: number;
  duties: number;
  handling: number;
  insurance: number;
  other: number;
  totalLandedCost: number;
  landedCostPerUnit: number;
}

export interface CostVariance {
  productId: string;
  standardCost: number;
  actualCost: number;
  variance: number;
  variancePercentage: number;
  varianceType: 'favorable' | 'unfavorable';
  period: string;
}

export interface InventoryValuation {
  productId: string;
  productName: string;
  quantityOnHand: number;
  totalValue: number;
  averageUnitCost: number;
  method: string;
  lastUpdated: Date;
}

class COGSService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Calculate COGS using FIFO method
   */
  async calculateCOGSFIFO(
    productId: string,
    organizationId: string,
    quantitySold: number,
    saleDate: Date
  ): Promise<COGSCalculation> {
    try {
      // Get cost layers ordered by received date (FIFO)
      const layers = await this.prisma.costLayer.findMany({
        where: {
          productId,
          organizationId,
          quantity: { gt: 0 },
          receivedDate: { lte: saleDate },
        },
        orderBy: { receivedDate: 'asc' },
      });

      let remainingQuantity = quantitySold;
      let costOfGoodsSold = 0;
      const usedLayers: CostLayer[] = [];

      for (const layer of layers) {
        if (remainingQuantity <= 0) break;

        const quantityUsed = Math.min(remainingQuantity, layer.quantity);
        costOfGoodsSold += quantityUsed * layer.unitCost;
        remainingQuantity -= quantityUsed;

        usedLayers.push({
          ...layer,
          quantity: quantityUsed,
          totalCost: quantityUsed * layer.unitCost,
        });

        // Update layer quantity
        await this.prisma.costLayer.update({
          where: { id: layer.id },
          data: {
            quantity: layer.quantity - quantityUsed,
            totalCost: (layer.quantity - quantityUsed) * layer.unitCost,
          },
        });
      }

      const averageUnitCost = quantitySold > 0 ? costOfGoodsSold / quantitySold : 0;
      const remainingLayers = await this.getRemainingLayers(productId, organizationId);
      const remainingValue = remainingLayers.reduce((sum, layer) => sum + layer.totalCost, 0);

      return {
        productId,
        method: 'FIFO',
        quantitySold,
        costOfGoodsSold,
        averageUnitCost,
        remainingQuantity: remainingLayers.reduce((sum, layer) => sum + layer.quantity, 0),
        remainingValue,
        layers: usedLayers,
      };
    } catch (error) {
      logger.error('[COGSService] Failed to calculate COGS FIFO:', error);
      throw new Error(`Failed to calculate COGS FIFO: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate COGS using LIFO method
   */
  async calculateCOGSLIFO(
    productId: string,
    organizationId: string,
    quantitySold: number,
    saleDate: Date
  ): Promise<COGSCalculation> {
    try {
      // Get cost layers ordered by received date descending (LIFO)
      const layers = await this.prisma.costLayer.findMany({
        where: {
          productId,
          organizationId,
          quantity: { gt: 0 },
          receivedDate: { lte: saleDate },
        },
        orderBy: { receivedDate: 'desc' },
      });

      let remainingQuantity = quantitySold;
      let costOfGoodsSold = 0;
      const usedLayers: CostLayer[] = [];

      for (const layer of layers) {
        if (remainingQuantity <= 0) break;

        const quantityUsed = Math.min(remainingQuantity, layer.quantity);
        costOfGoodsSold += quantityUsed * layer.unitCost;
        remainingQuantity -= quantityUsed;

        usedLayers.push({
          ...layer,
          quantity: quantityUsed,
          totalCost: quantityUsed * layer.unitCost,
        });

        // Update layer quantity
        await this.prisma.costLayer.update({
          where: { id: layer.id },
          data: {
            quantity: layer.quantity - quantityUsed,
            totalCost: (layer.quantity - quantityUsed) * layer.unitCost,
          },
        });
      }

      const averageUnitCost = quantitySold > 0 ? costOfGoodsSold / quantitySold : 0;
      const remainingLayers = await this.getRemainingLayers(productId, organizationId);
      const remainingValue = remainingLayers.reduce((sum, layer) => sum + layer.totalCost, 0);

      return {
        productId,
        method: 'LIFO',
        quantitySold,
        costOfGoodsSold,
        averageUnitCost,
        remainingQuantity: remainingLayers.reduce((sum, layer) => sum + layer.quantity, 0),
        remainingValue,
        layers: usedLayers,
      };
    } catch (error) {
      logger.error('[COGSService] Failed to calculate COGS LIFO:', error);
      throw new Error(`Failed to calculate COGS LIFO: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate COGS using Weighted Average method
   */
  async calculateCOGSWeightedAverage(
    productId: string,
    organizationId: string,
    quantitySold: number,
    saleDate: Date
  ): Promise<COGSCalculation> {
    try {
      // Get all cost layers
      const layers = await this.prisma.costLayer.findMany({
        where: {
          productId,
          organizationId,
          receivedDate: { lte: saleDate },
        },
        orderBy: { receivedDate: 'asc' },
      });

      // Calculate weighted average cost
      const totalQuantity = layers.reduce((sum, layer) => sum + layer.quantity, 0);
      const totalValue = layers.reduce((sum, layer) => sum + layer.totalCost, 0);
      const weightedAverageCost = totalQuantity > 0 ? totalValue / totalQuantity : 0;

      const costOfGoodsSold = quantitySold * weightedAverageCost;

      // Update all layers proportionally
      const usedLayers: CostLayer[] = [];
      for (const layer of layers) {
        const proportion = layer.quantity / totalQuantity;
        const quantityUsed = quantitySold * proportion;
        const costUsed = quantityUsed * layer.unitCost;

        usedLayers.push({
          ...layer,
          quantity: quantityUsed,
          totalCost: costUsed,
        });

        // Update layer quantity
        await this.prisma.costLayer.update({
          where: { id: layer.id },
          data: {
            quantity: layer.quantity - quantityUsed,
            totalCost: (layer.quantity - quantityUsed) * layer.unitCost,
          },
        });
      }

      const remainingLayers = await this.getRemainingLayers(productId, organizationId);
      const remainingValue = remainingLayers.reduce((sum, layer) => sum + layer.totalCost, 0);

      return {
        productId,
        method: 'WEIGHTED_AVERAGE',
        quantitySold,
        costOfGoodsSold,
        averageUnitCost: weightedAverageCost,
        remainingQuantity: remainingLayers.reduce((sum, layer) => sum + layer.quantity, 0),
        remainingValue,
        layers: usedLayers,
      };
    } catch (error) {
      logger.error('[COGSService] Failed to calculate COGS Weighted Average:', error);
      throw new Error(`Failed to calculate COGS Weighted Average: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate COGS using Standard Cost method
   */
  async calculateCOGSStandardCost(
    productId: string,
    organizationId: string,
    quantitySold: number,
    saleDate: Date
  ): Promise<COGSCalculation> {
    try {
      // Get standard cost for the product
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        select: { standardCost: true },
      });

      if (!product || !product.standardCost) {
        throw new Error('Standard cost not set for product');
      }

      const standardCost = product.standardCost;
      const costOfGoodsSold = quantitySold * standardCost;

      // No need to update cost layers for standard cost method
      const remainingLayers = await this.getRemainingLayers(productId, organizationId);
      const remainingValue = remainingLayers.reduce((sum, layer) => sum + layer.totalCost, 0);

      return {
        productId,
        method: 'STANDARD_COST',
        quantitySold,
        costOfGoodsSold,
        averageUnitCost: standardCost,
        remainingQuantity: remainingLayers.reduce((sum, layer) => sum + layer.quantity, 0),
        remainingValue,
        layers: [],
      };
    } catch (error) {
      logger.error('[COGSService] Failed to calculate COGS Standard Cost:', error);
      throw new Error(`Failed to calculate COGS Standard Cost: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add cost layer for inventory
   */
  async addCostLayer(
    productId: string,
    organizationId: string,
    quantity: number,
    unitCost: number,
    method: 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE' | 'STANDARD_COST',
    receivedDate: Date,
    supplierId?: string,
    purchaseOrderId?: string,
    batchNumber?: string,
    lotNumber?: string,
    expirationDate?: Date
  ): Promise<CostLayer> {
    try {
      const costLayer = await this.prisma.costLayer.create({
        data: {
          id: `cl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          productId,
          organizationId,
          quantity,
          unitCost,
          totalCost: quantity * unitCost,
          method,
          receivedDate,
          supplierId,
          purchaseOrderId,
          batchNumber,
          lotNumber,
          expirationDate,
        },
      });

      logger.info(`[COGSService] Added cost layer for product ${productId}: ${quantity} units at $${unitCost}`);
      return costLayer;
    } catch (error) {
      logger.error('[COGSService] Failed to add cost layer:', error);
      throw new Error(`Failed to add cost layer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate landed cost
   */
  async calculateLandedCost(
    productId: string,
    purchaseOrderId: string,
    baseCost: number,
    freight: number = 0,
    duties: number = 0,
    handling: number = 0,
    insurance: number = 0,
    other: number = 0
  ): Promise<LandedCost> {
    try {
      const totalLandedCost = baseCost + freight + duties + handling + insurance + other;
      
      // Get quantity from purchase order
      const poItems = await this.prisma.purchaseOrderItem.findMany({
        where: { poId: purchaseOrderId, productId },
        select: { quantity: true },
      });

      const totalQuantity = poItems.reduce((sum, item) => sum + item.quantity, 0);
      const landedCostPerUnit = totalQuantity > 0 ? totalLandedCost / totalQuantity : 0;

      const landedCost: LandedCost = {
        productId,
        purchaseOrderId,
        baseCost,
        freight,
        duties,
        handling,
        insurance,
        other,
        totalLandedCost,
        landedCostPerUnit,
      };

      // Store landed cost calculation
      await this.prisma.landedCost.create({
        data: {
          id: `lc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          productId,
          purchaseOrderId,
          baseCost,
          freight,
          duties,
          handling,
          insurance,
          other,
          totalLandedCost,
          landedCostPerUnit,
          calculatedAt: new Date(),
        },
      });

      logger.info(`[COGSService] Calculated landed cost for product ${productId}: $${landedCostPerUnit} per unit`);
      return landedCost;
    } catch (error) {
      logger.error('[COGSService] Failed to calculate landed cost:', error);
      throw new Error(`Failed to calculate landed cost: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate cost variance
   */
  async calculateCostVariance(
    productId: string,
    organizationId: string,
    period: string
  ): Promise<CostVariance[]> {
    try {
      const startDate = new Date(period);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      // Get standard cost
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        select: { standardCost: true },
      });

      if (!product || !product.standardCost) {
        throw new Error('Standard cost not set for product');
      }

      // Get actual costs from cost layers
      const costLayers = await this.prisma.costLayer.findMany({
        where: {
          productId,
          organizationId,
          receivedDate: {
            gte: startDate,
            lt: endDate,
          },
        },
      });

      const actualCost = costLayers.length > 0 
        ? costLayers.reduce((sum, layer) => sum + layer.totalCost, 0) / 
          costLayers.reduce((sum, layer) => sum + layer.quantity, 0)
        : 0;

      const variance = actualCost - product.standardCost;
      const variancePercentage = product.standardCost > 0 
        ? (variance / product.standardCost) * 100 
        : 0;

      const costVariance: CostVariance = {
        productId,
        standardCost: product.standardCost,
        actualCost,
        variance,
        variancePercentage,
        varianceType: variance >= 0 ? 'unfavorable' : 'favorable',
        period,
      };

      logger.info(`[COGSService] Calculated cost variance for product ${productId}: ${variancePercentage.toFixed(2)}%`);
      return [costVariance];
    } catch (error) {
      logger.error('[COGSService] Failed to calculate cost variance:', error);
      throw new Error(`Failed to calculate cost variance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get inventory valuation
   */
  async getInventoryValuation(
    organizationId: string,
    method: 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE' | 'STANDARD_COST' = 'WEIGHTED_AVERAGE'
  ): Promise<InventoryValuation[]> {
    try {
      const products = await this.prisma.product.findMany({
        where: { organizationId },
        select: { id: true, name: true, standardCost: true },
      });

      const valuations: InventoryValuation[] = [];

      for (const product of products) {
        const layers = await this.getRemainingLayers(product.id, organizationId);
        
        let totalValue = 0;
        let averageUnitCost = 0;

        if (method === 'WEIGHTED_AVERAGE') {
          const totalQuantity = layers.reduce((sum, layer) => sum + layer.quantity, 0);
          const totalCost = layers.reduce((sum, layer) => sum + layer.totalCost, 0);
          averageUnitCost = totalQuantity > 0 ? totalCost / totalQuantity : 0;
          totalValue = totalCost;
        } else if (method === 'STANDARD_COST') {
          averageUnitCost = product.standardCost || 0;
          const totalQuantity = layers.reduce((sum, layer) => sum + layer.quantity, 0);
          totalValue = totalQuantity * averageUnitCost;
        } else {
          // FIFO or LIFO - use current layer costs
          totalValue = layers.reduce((sum, layer) => sum + layer.totalCost, 0);
          const totalQuantity = layers.reduce((sum, layer) => sum + layer.quantity, 0);
          averageUnitCost = totalQuantity > 0 ? totalValue / totalQuantity : 0;
        }

        valuations.push({
          productId: product.id,
          productName: product.name,
          quantityOnHand: layers.reduce((sum, layer) => sum + layer.quantity, 0),
          totalValue,
          averageUnitCost,
          method,
          lastUpdated: new Date(),
        });
      }

      logger.info(`[COGSService] Generated inventory valuation for ${valuations.length} products using ${method}`);
      return valuations;
    } catch (error) {
      logger.error('[COGSService] Failed to get inventory valuation:', error);
      throw new Error(`Failed to get inventory valuation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get COGS report
   */
  async getCOGSReport(
    organizationId: string,
    dateFrom: Date,
    dateTo: Date,
    method: 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE' | 'STANDARD_COST' = 'WEIGHTED_AVERAGE'
  ) {
    try {
      // Get sales transactions in the period
      const sales = await this.prisma.sale.findMany({
        where: {
          organizationId,
          saleDate: {
            gte: dateFrom,
            lte: dateTo,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      const cogsReport = {
        period: { from: dateFrom, to: dateTo },
        method,
        totalSales: 0,
        totalCOGS: 0,
        grossProfit: 0,
        grossMargin: 0,
        productBreakdown: [] as any[],
      };

      for (const sale of sales) {
        cogsReport.totalSales += sale.totalAmount;

        for (const item of sale.items) {
          let cogsCalculation: COGSCalculation;

          switch (method) {
            case 'FIFO':
              cogsCalculation = await this.calculateCOGSFIFO(
                item.productId,
                organizationId,
                item.quantity,
                sale.saleDate
              );
              break;
            case 'LIFO':
              cogsCalculation = await this.calculateCOGSLIFO(
                item.productId,
                organizationId,
                item.quantity,
                sale.saleDate
              );
              break;
            case 'WEIGHTED_AVERAGE':
              cogsCalculation = await this.calculateCOGSWeightedAverage(
                item.productId,
                organizationId,
                item.quantity,
                sale.saleDate
              );
              break;
            case 'STANDARD_COST':
              cogsCalculation = await this.calculateCOGSStandardCost(
                item.productId,
                organizationId,
                item.quantity,
                sale.saleDate
              );
              break;
            default:
              throw new Error(`Unknown COGS method: ${method}`);
          }

          cogsReport.totalCOGS += cogsCalculation.costOfGoodsSold;

          // Add to product breakdown
          const existingProduct = cogsReport.productBreakdown.find(p => p.productId === item.productId);
          if (existingProduct) {
            existingProduct.quantitySold += item.quantity;
            existingProduct.costOfGoodsSold += cogsCalculation.costOfGoodsSold;
            existingProduct.salesAmount += item.quantity * item.unitPrice;
          } else {
            cogsReport.productBreakdown.push({
              productId: item.productId,
              productName: item.product.name,
              quantitySold: item.quantity,
              costOfGoodsSold: cogsCalculation.costOfGoodsSold,
              salesAmount: item.quantity * item.unitPrice,
              averageUnitCost: cogsCalculation.averageUnitCost,
            });
          }
        }
      }

      cogsReport.grossProfit = cogsReport.totalSales - cogsReport.totalCOGS;
      cogsReport.grossMargin = cogsReport.totalSales > 0 
        ? (cogsReport.grossProfit / cogsReport.totalSales) * 100 
        : 0;

      logger.info(`[COGSService] Generated COGS report: $${cogsReport.totalCOGS} COGS on $${cogsReport.totalSales} sales`);
      return cogsReport;
    } catch (error) {
      logger.error('[COGSService] Failed to get COGS report:', error);
      throw new Error(`Failed to get COGS report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private helper methods
  private async getRemainingLayers(productId: string, organizationId: string): Promise<CostLayer[]> {
    return await this.prisma.costLayer.findMany({
      where: {
        productId,
        organizationId,
        quantity: { gt: 0 },
      },
      orderBy: { receivedDate: 'asc' },
    });
  }
}

export default new COGSService();