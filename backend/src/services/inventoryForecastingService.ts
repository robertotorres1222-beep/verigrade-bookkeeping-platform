import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

export interface ForecastData {
  productId: string;
  organizationId: string;
  forecastDate: Date;
  predictedDemand: number;
  confidenceLevel: number;
  method: 'moving_average' | 'exponential_smoothing' | 'arima' | 'neural_network' | 'seasonal';
  parameters: Record<string, any>;
  createdAt: Date;
}

export interface SafetyStockRecommendation {
  productId: string;
  organizationId: string;
  currentStock: number;
  recommendedSafetyStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  leadTime: number;
  demandVariability: number;
  serviceLevel: number;
  reason: string;
  createdAt: Date;
}

export interface ABCAnalysis {
  productId: string;
  organizationId: string;
  category: 'A' | 'B' | 'C';
  annualValue: number;
  annualQuantity: number;
  cumulativeValue: number;
  cumulativeQuantity: number;
  valuePercentage: number;
  quantityPercentage: number;
  recommendation: string;
  createdAt: Date;
}

class InventoryForecastingService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Generate demand forecast using moving average
   */
  async generateMovingAverageForecast(
    productId: string,
    organizationId: string,
    periods: number = 12,
    windowSize: number = 3
  ): Promise<ForecastData> {
    try {
      // Get historical sales data
      const salesData = await this.prisma.salesTransaction.findMany({
        where: {
          productId,
          organizationId,
          status: 'completed',
          createdAt: {
            gte: new Date(Date.now() - periods * 30 * 24 * 60 * 60 * 1000), // Last N months
          },
        },
        orderBy: { createdAt: 'asc' },
        select: {
          quantity: true,
          createdAt: true,
        },
      });

      if (salesData.length < windowSize) {
        throw new Error('Insufficient data for moving average forecast');
      }

      // Group by month
      const monthlyData = this.groupSalesByMonth(salesData);
      const monthlyValues = Object.values(monthlyData);

      // Calculate moving average
      const movingAverages = [];
      for (let i = windowSize - 1; i < monthlyValues.length; i++) {
        const window = monthlyValues.slice(i - windowSize + 1, i + 1);
        const average = window.reduce((sum, val) => sum + val, 0) / window.length;
        movingAverages.push(average);
      }

      // Forecast next period
      const lastMovingAverage = movingAverages[movingAverages.length - 1];
      const trend = this.calculateTrend(movingAverages);
      const predictedDemand = Math.max(0, lastMovingAverage + trend);

      // Calculate confidence level based on historical accuracy
      const confidenceLevel = this.calculateConfidenceLevel(monthlyValues, movingAverages);

      const forecast = await this.prisma.forecastData.create({
        data: {
          id: this.generateId(),
          productId,
          organizationId,
          forecastDate: new Date(),
          predictedDemand: Math.round(predictedDemand),
          confidenceLevel,
          method: 'moving_average',
          parameters: {
            windowSize,
            periods,
            trend,
          },
        },
      });

      logger.info(`[InventoryForecastingService] Generated moving average forecast for product: ${productId}`);
      return forecast;
    } catch (error) {
      logger.error('[InventoryForecastingService] Failed to generate moving average forecast:', error);
      throw new Error(`Failed to generate moving average forecast: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate demand forecast using exponential smoothing
   */
  async generateExponentialSmoothingForecast(
    productId: string,
    organizationId: string,
    periods: number = 12,
    alpha: number = 0.3
  ): Promise<ForecastData> {
    try {
      // Get historical sales data
      const salesData = await this.prisma.salesTransaction.findMany({
        where: {
          productId,
          organizationId,
          status: 'completed',
          createdAt: {
            gte: new Date(Date.now() - periods * 30 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: { createdAt: 'asc' },
        select: {
          quantity: true,
          createdAt: true,
        },
      });

      if (salesData.length < 2) {
        throw new Error('Insufficient data for exponential smoothing forecast');
      }

      // Group by month
      const monthlyData = this.groupSalesByMonth(salesData);
      const monthlyValues = Object.values(monthlyData);

      // Calculate exponential smoothing
      const smoothedValues = this.calculateExponentialSmoothing(monthlyValues, alpha);
      const predictedDemand = Math.max(0, smoothedValues[smoothedValues.length - 1]);

      // Calculate confidence level
      const confidenceLevel = this.calculateConfidenceLevel(monthlyValues, smoothedValues);

      const forecast = await this.prisma.forecastData.create({
        data: {
          id: this.generateId(),
          productId,
          organizationId,
          forecastDate: new Date(),
          predictedDemand: Math.round(predictedDemand),
          confidenceLevel,
          method: 'exponential_smoothing',
          parameters: {
            alpha,
            periods,
          },
        },
      });

      logger.info(`[InventoryForecastingService] Generated exponential smoothing forecast for product: ${productId}`);
      return forecast;
    } catch (error) {
      logger.error('[InventoryForecastingService] Failed to generate exponential smoothing forecast:', error);
      throw new Error(`Failed to generate exponential smoothing forecast: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate seasonal forecast
   */
  async generateSeasonalForecast(
    productId: string,
    organizationId: string,
    periods: number = 24
  ): Promise<ForecastData> {
    try {
      // Get historical sales data
      const salesData = await this.prisma.salesTransaction.findMany({
        where: {
          productId,
          organizationId,
          status: 'completed',
          createdAt: {
            gte: new Date(Date.now() - periods * 30 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: { createdAt: 'asc' },
        select: {
          quantity: true,
          createdAt: true,
        },
      });

      if (salesData.length < 24) {
        throw new Error('Insufficient data for seasonal forecast (need at least 24 months)');
      }

      // Group by month
      const monthlyData = this.groupSalesByMonth(salesData);
      const monthlyValues = Object.values(monthlyData);

      // Calculate seasonal indices
      const seasonalIndices = this.calculateSeasonalIndices(monthlyValues);
      
      // Calculate trend
      const trend = this.calculateTrend(monthlyValues);
      
      // Forecast next period
      const lastValue = monthlyValues[monthlyValues.length - 1];
      const nextMonthIndex = (monthlyValues.length % 12);
      const seasonalFactor = seasonalIndices[nextMonthIndex];
      const predictedDemand = Math.max(0, (lastValue + trend) * seasonalFactor);

      // Calculate confidence level
      const confidenceLevel = this.calculateSeasonalConfidenceLevel(monthlyValues, seasonalIndices);

      const forecast = await this.prisma.forecastData.create({
        data: {
          id: this.generateId(),
          productId,
          organizationId,
          forecastDate: new Date(),
          predictedDemand: Math.round(predictedDemand),
          confidenceLevel,
          method: 'seasonal',
          parameters: {
            periods,
            seasonalIndices,
            trend,
          },
        },
      });

      logger.info(`[InventoryForecastingService] Generated seasonal forecast for product: ${productId}`);
      return forecast;
    } catch (error) {
      logger.error('[InventoryForecastingService] Failed to generate seasonal forecast:', error);
      throw new Error(`Failed to generate seasonal forecast: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate safety stock recommendations
   */
  async calculateSafetyStock(
    productId: string,
    organizationId: string,
    serviceLevel: number = 0.95
  ): Promise<SafetyStockRecommendation> {
    try {
      // Get current inventory
      const inventory = await this.prisma.inventory.findFirst({
        where: {
          productId,
          organizationId,
        },
        select: {
          quantity: true,
        },
      });

      const currentStock = inventory?.quantity || 0;

      // Get historical demand data
      const demandData = await this.prisma.salesTransaction.findMany({
        where: {
          productId,
          organizationId,
          status: 'completed',
          createdAt: {
            gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Last year
          },
        },
        orderBy: { createdAt: 'asc' },
        select: {
          quantity: true,
          createdAt: true,
        },
      });

      if (demandData.length < 30) {
        throw new Error('Insufficient data for safety stock calculation');
      }

      // Group by month
      const monthlyData = this.groupSalesByMonth(demandData);
      const monthlyValues = Object.values(monthlyData);

      // Calculate demand statistics
      const averageDemand = monthlyValues.reduce((sum, val) => sum + val, 0) / monthlyValues.length;
      const demandVariance = this.calculateVariance(monthlyValues, averageDemand);
      const demandVariability = Math.sqrt(demandVariance);

      // Get lead time data
      const leadTimeData = await this.getLeadTimeData(productId, organizationId);
      const averageLeadTime = leadTimeData.reduce((sum, val) => sum + val, 0) / leadTimeData.length;
      const leadTimeVariance = this.calculateVariance(leadTimeData, averageLeadTime);
      const leadTimeVariability = Math.sqrt(leadTimeVariance);

      // Calculate safety stock using statistical method
      const zScore = this.getZScore(serviceLevel);
      const safetyStock = Math.ceil(
        zScore * Math.sqrt(
          averageLeadTime * demandVariance + 
          Math.pow(averageDemand, 2) * leadTimeVariance
        )
      );

      // Calculate reorder point
      const reorderPoint = Math.ceil(averageDemand * averageLeadTime + safetyStock);

      // Calculate reorder quantity (EOQ)
      const reorderQuantity = this.calculateEOQ(
        averageDemand,
        await this.getOrderingCost(productId, organizationId),
        await this.getHoldingCost(productId, organizationId)
      );

      const recommendation = await this.prisma.safetyStockRecommendation.create({
        data: {
          id: this.generateId(),
          productId,
          organizationId,
          currentStock,
          recommendedSafetyStock: safetyStock,
          reorderPoint,
          reorderQuantity,
          leadTime: Math.round(averageLeadTime),
          demandVariability: Math.round(demandVariability * 100) / 100,
          serviceLevel,
          reason: this.generateSafetyStockReason(safetyStock, currentStock, serviceLevel),
        },
      });

      logger.info(`[InventoryForecastingService] Calculated safety stock for product: ${productId}`);
      return recommendation;
    } catch (error) {
      logger.error('[InventoryForecastingService] Failed to calculate safety stock:', error);
      throw new Error(`Failed to calculate safety stock: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Perform ABC analysis
   */
  async performABCAnalysis(organizationId: string): Promise<ABCAnalysis[]> {
    try {
      // Get all products with their annual sales value
      const products = await this.prisma.product.findMany({
        where: { organizationId },
        include: {
          salesTransactions: {
            where: {
              status: 'completed',
              createdAt: {
                gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Last year
              },
            },
            select: {
              quantity: true,
              unitPrice: true,
            },
          },
        },
      });

      // Calculate annual value for each product
      const productValues = products.map(product => {
        const annualValue = product.salesTransactions.reduce(
          (sum, transaction) => sum + (transaction.quantity * transaction.unitPrice),
          0
        );
        const annualQuantity = product.salesTransactions.reduce(
          (sum, transaction) => sum + transaction.quantity,
          0
        );
        return {
          productId: product.id,
          organizationId: product.organizationId,
          annualValue,
          annualQuantity,
        };
      });

      // Sort by annual value (descending)
      productValues.sort((a, b) => b.annualValue - a.annualValue);

      // Calculate cumulative percentages
      const totalValue = productValues.reduce((sum, p) => sum + p.annualValue, 0);
      const totalQuantity = productValues.reduce((sum, p) => sum + p.annualQuantity, 0);

      let cumulativeValue = 0;
      let cumulativeQuantity = 0;

      const abcAnalysis = productValues.map((product, index) => {
        cumulativeValue += product.annualValue;
        cumulativeQuantity += product.annualQuantity;

        const valuePercentage = (product.annualValue / totalValue) * 100;
        const quantityPercentage = (product.annualQuantity / totalQuantity) * 100;
        const cumulativeValuePercentage = (cumulativeValue / totalValue) * 100;
        const cumulativeQuantityPercentage = (cumulativeQuantity / totalQuantity) * 100;

        // Determine ABC category
        let category: 'A' | 'B' | 'C';
        let recommendation: string;

        if (cumulativeValuePercentage <= 80) {
          category = 'A';
          recommendation = 'High priority - monitor closely, maintain high service levels';
        } else if (cumulativeValuePercentage <= 95) {
          category = 'B';
          recommendation = 'Medium priority - regular monitoring, moderate service levels';
        } else {
          category = 'C';
          recommendation = 'Low priority - periodic review, basic service levels';
        }

        return {
          productId: product.productId,
          organizationId: product.organizationId,
          category,
          annualValue: product.annualValue,
          annualQuantity: product.annualQuantity,
          cumulativeValue,
          cumulativeQuantity,
          valuePercentage: Math.round(valuePercentage * 100) / 100,
          quantityPercentage: Math.round(quantityPercentage * 100) / 100,
          recommendation,
          createdAt: new Date(),
        };
      });

      // Save ABC analysis results
      await Promise.all(
        abcAnalysis.map(analysis =>
          this.prisma.aBCAnalysis.create({
            data: {
              id: this.generateId(),
              ...analysis,
            },
          })
        )
      );

      logger.info(`[InventoryForecastingService] Completed ABC analysis for organization: ${organizationId}`);
      return abcAnalysis;
    } catch (error) {
      logger.error('[InventoryForecastingService] Failed to perform ABC analysis:', error);
      throw new Error(`Failed to perform ABC analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get forecast accuracy metrics
   */
  async getForecastAccuracy(
    productId: string,
    organizationId: string,
    method: string,
    periods: number = 12
  ) {
    try {
      const forecasts = await this.prisma.forecastData.findMany({
        where: {
          productId,
          organizationId,
          method: method as any,
          forecastDate: {
            gte: new Date(Date.now() - periods * 30 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: { forecastDate: 'asc' },
      });

      if (forecasts.length === 0) {
        return {
          mape: 0,
          mae: 0,
          rmse: 0,
          accuracy: 0,
        };
      }

      // Get actual sales data for the same periods
      const actualSales = await this.prisma.salesTransaction.findMany({
        where: {
          productId,
          organizationId,
          status: 'completed',
          createdAt: {
            gte: new Date(Date.now() - periods * 30 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: { createdAt: 'asc' },
        select: {
          quantity: true,
          createdAt: true,
        },
      });

      const monthlyActuals = this.groupSalesByMonth(actualSales);
      const actualValues = Object.values(monthlyActuals);

      // Calculate accuracy metrics
      let totalError = 0;
      let totalAbsoluteError = 0;
      let totalSquaredError = 0;
      let totalActual = 0;

      for (let i = 0; i < Math.min(forecasts.length, actualValues.length); i++) {
        const forecast = forecasts[i].predictedDemand;
        const actual = actualValues[i] || 0;
        
        const error = forecast - actual;
        const absoluteError = Math.abs(error);
        const squaredError = error * error;

        totalError += error;
        totalAbsoluteError += absoluteError;
        totalSquaredError += squaredError;
        totalActual += actual;
      }

      const mae = totalAbsoluteError / Math.min(forecasts.length, actualValues.length);
      const rmse = Math.sqrt(totalSquaredError / Math.min(forecasts.length, actualValues.length));
      const mape = totalActual > 0 ? (totalAbsoluteError / totalActual) * 100 : 0;
      const accuracy = Math.max(0, 100 - mape);

      return {
        mape: Math.round(mape * 100) / 100,
        mae: Math.round(mae * 100) / 100,
        rmse: Math.round(rmse * 100) / 100,
        accuracy: Math.round(accuracy * 100) / 100,
      };
    } catch (error) {
      logger.error('[InventoryForecastingService] Failed to get forecast accuracy:', error);
      throw new Error(`Failed to get forecast accuracy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper methods
  private groupSalesByMonth(salesData: { quantity: number; createdAt: Date }[]): Record<string, number> {
    const monthlyData: Record<string, number> = {};
    
    salesData.forEach(transaction => {
      const monthKey = transaction.createdAt.toISOString().substring(0, 7); // YYYY-MM
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + transaction.quantity;
    });

    return monthlyData;
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;

    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  private calculateExponentialSmoothing(values: number[], alpha: number): number[] {
    if (values.length === 0) return [];
    
    const smoothed = [values[0]];
    
    for (let i = 1; i < values.length; i++) {
      const smoothedValue = alpha * values[i] + (1 - alpha) * smoothed[i - 1];
      smoothed.push(smoothedValue);
    }
    
    return smoothed;
  }

  private calculateSeasonalIndices(values: number[]): number[] {
    if (values.length < 12) return Array(12).fill(1);
    
    const monthlyAverages = Array(12).fill(0);
    const monthlyCounts = Array(12).fill(0);
    
    values.forEach((value, index) => {
      const month = index % 12;
      monthlyAverages[month] += value;
      monthlyCounts[month]++;
    });
    
    const overallAverage = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    return monthlyAverages.map((avg, index) => 
      monthlyCounts[index] > 0 ? avg / monthlyCounts[index] / overallAverage : 1
    );
  }

  private calculateVariance(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  private calculateConfidenceLevel(actual: number[], predicted: number[]): number {
    if (actual.length !== predicted.length || actual.length === 0) return 0;
    
    const errors = actual.map((val, index) => Math.abs(val - predicted[index]));
    const meanError = errors.reduce((sum, err) => sum + err, 0) / errors.length;
    const maxError = Math.max(...errors);
    
    if (maxError === 0) return 100;
    
    const accuracy = Math.max(0, 100 - (meanError / maxError) * 100);
    return Math.round(accuracy * 100) / 100;
  }

  private calculateSeasonalConfidenceLevel(values: number[], seasonalIndices: number[]): number {
    // Simplified confidence calculation for seasonal forecasts
    const variance = this.calculateVariance(values, values.reduce((sum, val) => sum + val, 0) / values.length);
    const coefficientOfVariation = Math.sqrt(variance) / (values.reduce((sum, val) => sum + val, 0) / values.length);
    
    const confidence = Math.max(0, 100 - coefficientOfVariation * 100);
    return Math.round(confidence * 100) / 100;
  }

  private getZScore(serviceLevel: number): number {
    // Common z-scores for service levels
    const zScores: Record<number, number> = {
      0.90: 1.28,
      0.95: 1.65,
      0.99: 2.33,
      0.999: 3.09,
    };
    
    return zScores[serviceLevel] || 1.65; // Default to 95%
  }

  private async getLeadTimeData(productId: string, organizationId: string): Promise<number[]> {
    // Get lead time data from purchase orders
    const purchaseOrders = await this.prisma.purchaseOrder.findMany({
      where: {
        organizationId,
        items: {
          some: {
            productId,
          },
        },
        status: 'received',
      },
      select: {
        orderDate: true,
        receivedDate: true,
      },
    });

    return purchaseOrders
      .filter(po => po.orderDate && po.receivedDate)
      .map(po => {
        const leadTime = po.receivedDate!.getTime() - po.orderDate!.getTime();
        return leadTime / (1000 * 60 * 60 * 24); // Convert to days
      });
  }

  private async getOrderingCost(productId: string, organizationId: string): Promise<number> {
    // Get average ordering cost from purchase orders
    const purchaseOrders = await this.prisma.purchaseOrder.findMany({
      where: {
        organizationId,
        items: {
          some: {
            productId,
          },
        },
      },
      select: {
        totalAmount: true,
        items: {
          where: { productId },
          select: { quantity: true },
        },
      },
    });

    if (purchaseOrders.length === 0) return 50; // Default ordering cost

    const totalOrderingCost = purchaseOrders.reduce((sum, po) => {
      const productQuantity = po.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
      return sum + (po.totalAmount / productQuantity);
    }, 0);

    return totalOrderingCost / purchaseOrders.length;
  }

  private async getHoldingCost(productId: string, organizationId: string): Promise<number> {
    // Get product cost for holding cost calculation
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        organizationId,
      },
      select: {
        cost: true,
      },
    });

    if (!product || !product.cost) return 0.2; // Default 20% holding cost

    return product.cost * 0.2; // 20% of product cost
  }

  private calculateEOQ(demand: number, orderingCost: number, holdingCost: number): number {
    if (holdingCost <= 0) return Math.ceil(demand);
    
    const eoq = Math.sqrt((2 * demand * orderingCost) / holdingCost);
    return Math.ceil(eoq);
  }

  private generateSafetyStockReason(
    safetyStock: number,
    currentStock: number,
    serviceLevel: number
  ): string {
    if (currentStock >= safetyStock) {
      return `Current stock (${currentStock}) meets safety stock requirement (${safetyStock}) for ${serviceLevel * 100}% service level`;
    } else {
      const shortage = safetyStock - currentStock;
      return `Increase safety stock by ${shortage} units to meet ${serviceLevel * 100}% service level requirement`;
    }
  }

  private generateId(): string {
    return `forecast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default new InventoryForecastingService();






