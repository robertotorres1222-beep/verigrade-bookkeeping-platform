import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PriceAnomaly {
  id: string;
  userId: string;
  vendorId: string;
  vendorName: string;
  itemDescription: string;
  currentPrice: number;
  previousPrice: number;
  priceChange: number;
  priceChangePercentage: number;
  anomalyType: 'price_spike' | 'price_drop' | 'above_market' | 'suspicious_pricing';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
}

export interface MarketPriceData {
  itemDescription: string;
  averageMarketPrice: number;
  priceRange: {
    min: number;
    max: number;
    median: number;
  };
  confidence: number;
  source: string;
  lastUpdated: Date;
}

export interface VendorPriceHistory {
  vendorId: string;
  vendorName: string;
  itemDescription: string;
  prices: Array<{
    price: number;
    date: Date;
    transactionId: string;
  }>;
  averagePrice: number;
  priceVolatility: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface PriceOptimizationRecommendation {
  id: string;
  userId: string;
  vendorId: string;
  itemDescription: string;
  currentVendor: string;
  recommendedVendor: string;
  currentPrice: number;
  recommendedPrice: number;
  potentialSavings: number;
  savingsPercentage: number;
  confidence: number;
  reasoning: string[];
  createdAt: Date;
}

export class PriceAnomalyService {
  /**
   * Detect price anomalies for user
   */
  async detectPriceAnomalies(userId: string): Promise<PriceAnomaly[]> {
    try {
      const anomalies: PriceAnomaly[] = [];
      
      // Get vendor price histories
      const vendorHistories = await this.getVendorPriceHistories(userId);
      
      for (const history of vendorHistories) {
        // Detect price spikes
        const spikeAnomalies = this.detectPriceSpikes(history);
        anomalies.push(...spikeAnomalies);
        
        // Detect price drops
        const dropAnomalies = this.detectPriceDrops(history);
        anomalies.push(...dropAnomalies);
        
        // Detect above-market pricing
        const marketAnomalies = await this.detectAboveMarketPricing(history);
        anomalies.push(...marketAnomalies);
        
        // Detect suspicious pricing patterns
        const suspiciousAnomalies = this.detectSuspiciousPricing(history);
        anomalies.push(...suspiciousAnomalies);
      }
      
      return anomalies;

    } catch (error) {
      console.error('Error detecting price anomalies:', error);
      return [];
    }
  }

  /**
   * Get vendor price histories
   */
  private async getVendorPriceHistories(userId: string): Promise<VendorPriceHistory[]> {
    try {
      const histories: VendorPriceHistory[] = [];
      
      // Get expenses grouped by vendor and item description
      const expenses = await prisma.expense.findMany({
        where: { userId },
        include: {
          vendor: true
        },
        orderBy: { createdAt: 'desc' },
        take: 1000
      });
      
      // Group by vendor and item description
      const groupedExpenses = expenses.reduce((acc, expense) => {
        const key = `${expense.vendorId}_${expense.description}`;
        if (!acc[key]) {
          acc[key] = {
            vendorId: expense.vendorId,
            vendorName: expense.vendor?.name || 'Unknown',
            itemDescription: expense.description,
            expenses: []
          };
        }
        acc[key].expenses.push(expense);
        return acc;
      }, {} as Record<string, any>);
      
      // Calculate price histories
      for (const [key, group] of Object.entries(groupedExpenses)) {
        const prices = group.expenses.map((expense: any) => ({
          price: expense.amount,
          date: expense.createdAt,
          transactionId: expense.id
        }));
        
        const averagePrice = prices.reduce((sum: number, p: any) => sum + p.price, 0) / prices.length;
        const priceVolatility = this.calculatePriceVolatility(prices);
        const trend = this.calculatePriceTrend(prices);
        
        histories.push({
          vendorId: group.vendorId,
          vendorName: group.vendorName,
          itemDescription: group.itemDescription,
          prices,
          averagePrice,
          priceVolatility,
          trend
        });
      }
      
      return histories;

    } catch (error) {
      console.error('Error getting vendor price histories:', error);
      return [];
    }
  }

  /**
   * Detect price spikes
   */
  private detectPriceSpikes(history: VendorPriceHistory): PriceAnomaly[] {
    const anomalies: PriceAnomaly[] = [];
    
    if (history.prices.length < 2) return anomalies;
    
    // Sort prices by date
    const sortedPrices = [...history.prices].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    for (let i = 1; i < sortedPrices.length; i++) {
      const currentPrice = sortedPrices[i].price;
      const previousPrice = sortedPrices[i - 1].price;
      const priceChange = currentPrice - previousPrice;
      const priceChangePercentage = (priceChange / previousPrice) * 100;
      
      // Detect significant price increase
      if (priceChangePercentage > 50 && priceChange > 10) {
        const severity = this.getPriceAnomalySeverity(priceChangePercentage);
        
        const anomaly: PriceAnomaly = {
          id: `price_spike_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: '', // Would be set from context
          vendorId: history.vendorId,
          vendorName: history.vendorName,
          itemDescription: history.itemDescription,
          currentPrice,
          previousPrice,
          priceChange,
          priceChangePercentage,
          anomalyType: 'price_spike',
          severity,
          description: `Price spike detected: ${priceChangePercentage.toFixed(1)}% increase from $${previousPrice.toFixed(2)} to $${currentPrice.toFixed(2)}`,
          detectedAt: new Date(),
          status: 'active'
        };
        
        anomalies.push(anomaly);
      }
    }
    
    return anomalies;
  }

  /**
   * Detect price drops
   */
  private detectPriceDrops(history: VendorPriceHistory): PriceAnomaly[] {
    const anomalies: PriceAnomaly[] = [];
    
    if (history.prices.length < 2) return anomalies;
    
    // Sort prices by date
    const sortedPrices = [...history.prices].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    for (let i = 1; i < sortedPrices.length; i++) {
      const currentPrice = sortedPrices[i].price;
      const previousPrice = sortedPrices[i - 1].price;
      const priceChange = currentPrice - previousPrice;
      const priceChangePercentage = (priceChange / previousPrice) * 100;
      
      // Detect significant price decrease
      if (priceChangePercentage < -30 && Math.abs(priceChange) > 5) {
        const severity = this.getPriceAnomalySeverity(Math.abs(priceChangePercentage));
        
        const anomaly: PriceAnomaly = {
          id: `price_drop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: '', // Would be set from context
          vendorId: history.vendorId,
          vendorName: history.vendorName,
          itemDescription: history.itemDescription,
          currentPrice,
          previousPrice,
          priceChange,
          priceChangePercentage,
          anomalyType: 'price_drop',
          severity,
          description: `Price drop detected: ${priceChangePercentage.toFixed(1)}% decrease from $${previousPrice.toFixed(2)} to $${currentPrice.toFixed(2)}`,
          detectedAt: new Date(),
          status: 'active'
        };
        
        anomalies.push(anomaly);
      }
    }
    
    return anomalies;
  }

  /**
   * Detect above-market pricing
   */
  private async detectAboveMarketPricing(history: VendorPriceHistory): Promise<PriceAnomaly[]> {
    const anomalies: PriceAnomaly[] = [];
    
    try {
      // Get market price data (in a real implementation, this would call external APIs)
      const marketData = await this.getMarketPriceData(history.itemDescription);
      
      if (marketData && history.prices.length > 0) {
        const currentPrice = history.prices[0].price; // Most recent price
        const marketPrice = marketData.averageMarketPrice;
        
        // Check if current price is significantly above market
        const priceDifference = currentPrice - marketPrice;
        const priceDifferencePercentage = (priceDifference / marketPrice) * 100;
        
        if (priceDifferencePercentage > 20 && priceDifference > 10) {
          const severity = this.getPriceAnomalySeverity(priceDifferencePercentage);
          
          const anomaly: PriceAnomaly = {
            id: `above_market_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: '', // Would be set from context
            vendorId: history.vendorId,
            vendorName: history.vendorName,
            itemDescription: history.itemDescription,
            currentPrice,
            previousPrice: marketPrice,
            priceChange: priceDifference,
            priceChangePercentage,
            anomalyType: 'above_market',
            severity,
            description: `Above market pricing: $${currentPrice.toFixed(2)} vs market average $${marketPrice.toFixed(2)} (${priceDifferencePercentage.toFixed(1)}% above market)`,
            detectedAt: new Date(),
            status: 'active'
          };
          
          anomalies.push(anomaly);
        }
      }
      
      return anomalies;

    } catch (error) {
      console.error('Error detecting above-market pricing:', error);
      return [];
    }
  }

  /**
   * Detect suspicious pricing patterns
   */
  private detectSuspiciousPricing(history: VendorPriceHistory): PriceAnomaly[] {
    const anomalies: PriceAnomaly[] = [];
    
    if (history.prices.length < 3) return anomalies;
    
    // Detect round number pricing (potential fraud indicator)
    const roundNumberPrices = history.prices.filter(p => p.price % 100 === 0 && p.price >= 100);
    if (roundNumberPrices.length > history.prices.length * 0.5) {
      const anomaly: PriceAnomaly = {
        id: `suspicious_round_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: '', // Would be set from context
        vendorId: history.vendorId,
        vendorName: history.vendorName,
        itemDescription: history.itemDescription,
        currentPrice: history.prices[0].price,
        previousPrice: 0,
        priceChange: 0,
        priceChangePercentage: 0,
        anomalyType: 'suspicious_pricing',
        severity: 'medium',
        description: `Suspicious pricing pattern: ${roundNumberPrices.length}/${history.prices.length} transactions are round dollar amounts`,
        detectedAt: new Date(),
        status: 'active'
      };
      
      anomalies.push(anomaly);
    }
    
    // Detect unusual price volatility
    if (history.priceVolatility > history.averagePrice * 0.5) {
      const anomaly: PriceAnomaly = {
        id: `suspicious_volatility_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: '', // Would be set from context
        vendorId: history.vendorId,
        vendorName: history.vendorName,
        itemDescription: history.itemDescription,
        currentPrice: history.prices[0].price,
        previousPrice: 0,
        priceChange: 0,
        priceChangePercentage: 0,
        anomalyType: 'suspicious_pricing',
        severity: 'medium',
        description: `High price volatility detected: ${(history.priceVolatility / history.averagePrice * 100).toFixed(1)}% variation`,
        detectedAt: new Date(),
        status: 'active'
      };
      
      anomalies.push(anomaly);
    }
    
    return anomalies;
  }

  /**
   * Get market price data
   */
  private async getMarketPriceData(itemDescription: string): Promise<MarketPriceData | null> {
    try {
      // In a real implementation, this would call external APIs like:
      // - Amazon Product API
      // - Google Shopping API
      // - Industry-specific pricing databases
      
      // Mock market data for demonstration
      return {
        itemDescription,
        averageMarketPrice: 50, // Mock average price
        priceRange: {
          min: 30,
          max: 80,
          median: 50
        },
        confidence: 0.8,
        source: 'market_data_api',
        lastUpdated: new Date()
      };

    } catch (error) {
      console.error('Error getting market price data:', error);
      return null;
    }
  }

  /**
   * Calculate price volatility
   */
  private calculatePriceVolatility(prices: Array<{ price: number }>): number {
    if (prices.length < 2) return 0;
    
    const averagePrice = prices.reduce((sum, p) => sum + p.price, 0) / prices.length;
    const variance = prices.reduce((sum, p) => sum + Math.pow(p.price - averagePrice, 2), 0) / prices.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Calculate price trend
   */
  private calculatePriceTrend(prices: Array<{ price: number; date: Date }>): 'increasing' | 'decreasing' | 'stable' {
    if (prices.length < 2) return 'stable';
    
    const sortedPrices = [...prices].sort((a, b) => a.date.getTime() - b.date.getTime());
    const firstHalf = sortedPrices.slice(0, Math.floor(sortedPrices.length / 2));
    const secondHalf = sortedPrices.slice(Math.floor(sortedPrices.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, p) => sum + p.price, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, p) => sum + p.price, 0) / secondHalf.length;
    
    const changePercentage = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    
    if (changePercentage > 10) return 'increasing';
    if (changePercentage < -10) return 'decreasing';
    return 'stable';
  }

  /**
   * Get price anomaly severity
   */
  private getPriceAnomalySeverity(changePercentage: number): 'low' | 'medium' | 'high' | 'critical' {
    if (changePercentage > 100) return 'critical';
    if (changePercentage > 50) return 'high';
    if (changePercentage > 25) return 'medium';
    return 'low';
  }

  /**
   * Generate price optimization recommendations
   */
  async generatePriceOptimizationRecommendations(userId: string): Promise<PriceOptimizationRecommendation[]> {
    try {
      const recommendations: PriceOptimizationRecommendation[] = [];
      
      // Get vendor price histories
      const vendorHistories = await this.getVendorPriceHistories(userId);
      
      // Group by item description to find alternative vendors
      const itemGroups = vendorHistories.reduce((acc, history) => {
        if (!acc[history.itemDescription]) {
          acc[history.itemDescription] = [];
        }
        acc[history.itemDescription].push(history);
        return acc;
      }, {} as Record<string, VendorPriceHistory[]>);
      
      // Generate recommendations for each item
      for (const [itemDescription, histories] of Object.entries(itemGroups)) {
        if (histories.length < 2) continue; // Need at least 2 vendors to compare
        
        // Find the most expensive vendor
        const mostExpensive = histories.reduce((max, current) => 
          current.averagePrice > max.averagePrice ? current : max
        );
        
        // Find the cheapest vendor
        const cheapest = histories.reduce((min, current) => 
          current.averagePrice < min.averagePrice ? current : min
        );
        
        // Generate recommendation if there's significant savings
        const potentialSavings = mostExpensive.averagePrice - cheapest.averagePrice;
        const savingsPercentage = (potentialSavings / mostExpensive.averagePrice) * 100;
        
        if (savingsPercentage > 15 && potentialSavings > 5) {
          const recommendation: PriceOptimizationRecommendation = {
            id: `price_opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            vendorId: mostExpensive.vendorId,
            itemDescription,
            currentVendor: mostExpensive.vendorName,
            recommendedVendor: cheapest.vendorName,
            currentPrice: mostExpensive.averagePrice,
            recommendedPrice: cheapest.averagePrice,
            potentialSavings,
            savingsPercentage,
            confidence: Math.min(savingsPercentage / 100, 1),
            reasoning: [
              `${cheapest.vendorName} offers ${itemDescription} for $${cheapest.averagePrice.toFixed(2)} vs ${mostExpensive.vendorName}'s $${mostExpensive.averagePrice.toFixed(2)}`,
              `Potential savings of $${potentialSavings.toFixed(2)} (${savingsPercentage.toFixed(1)}%)`,
              `Based on ${cheapest.prices.length} transactions with ${cheapest.vendorName}`
            ],
            createdAt: new Date()
          };
          
          recommendations.push(recommendation);
        }
      }
      
      return recommendations;

    } catch (error) {
      console.error('Error generating price optimization recommendations:', error);
      return [];
    }
  }

  /**
   * Get price anomaly dashboard
   */
  async getPriceAnomalyDashboard(userId: string): Promise<{
    anomalies: PriceAnomaly[];
    recommendations: PriceOptimizationRecommendation[];
    statistics: {
      totalAnomalies: number;
      criticalAnomalies: number;
      potentialSavings: number;
      averagePriceVariance: number;
    };
  }> {
    try {
      const anomalies = await this.detectPriceAnomalies(userId);
      const recommendations = await this.generatePriceOptimizationRecommendations(userId);
      
      const statistics = {
        totalAnomalies: anomalies.length,
        criticalAnomalies: anomalies.filter(a => a.severity === 'critical').length,
        potentialSavings: recommendations.reduce((sum, r) => sum + r.potentialSavings, 0),
        averagePriceVariance: anomalies.length > 0 
          ? anomalies.reduce((sum, a) => sum + Math.abs(a.priceChangePercentage), 0) / anomalies.length 
          : 0
      };
      
      return {
        anomalies,
        recommendations,
        statistics
      };

    } catch (error) {
      console.error('Error getting price anomaly dashboard:', error);
      return {
        anomalies: [],
        recommendations: [],
        statistics: {
          totalAnomalies: 0,
          criticalAnomalies: 0,
          potentialSavings: 0,
          averagePriceVariance: 0
        }
      };
    }
  }
}

export default PriceAnomalyService;







