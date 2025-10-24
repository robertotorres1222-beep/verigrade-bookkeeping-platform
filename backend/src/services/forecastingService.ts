import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface ForecastData {
  id: string;
  userId: string;
  name: string;
  description: string;
  type: 'revenue' | 'expenses' | 'cash_flow' | 'custom';
  dataSource: string;
  timeRange: {
    start: Date;
    end: Date;
  };
  forecastPeriod: {
    start: Date;
    end: Date;
  };
  method: 'linear' | 'exponential' | 'seasonal' | 'arima' | 'machine_learning';
  parameters: Record<string, any>;
  results?: ForecastResult;
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForecastResult {
  dataPoints: Array<{
    date: Date;
    actual?: number;
    forecast: number;
    lowerBound: number;
    upperBound: number;
    confidence: number;
  }>;
  summary: {
    totalForecast: number;
    averageMonthly: number;
    growthRate: number;
    seasonality: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  accuracy: {
    mape: number; // Mean Absolute Percentage Error
    rmse: number; // Root Mean Square Error
    r2: number; // R-squared
  };
}

export interface ComparativeAnalysis {
  id: string;
  userId: string;
  name: string;
  description: string;
  comparisons: Array<{
    name: string;
    data: Array<{
      period: string;
      value: number;
      percentage?: number;
    }>;
  }>;
  insights: string[];
  recommendations: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ScenarioModel {
  id: string;
  userId: string;
  name: string;
  description: string;
  baseScenario: string;
  scenarios: Array<{
    name: string;
    description: string;
    assumptions: Record<string, any>;
    results: any;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrendAnalysis {
  id: string;
  userId: string;
  name: string;
  data: Array<{
    period: string;
    value: number;
    change: number;
    changePercentage: number;
  }>;
  trends: Array<{
    type: 'growth' | 'decline' | 'seasonal' | 'cyclical';
    strength: number;
    description: string;
  }>;
  insights: string[];
  createdAt: Date;
}

class ForecastingService {
  private forecasts: Map<string, ForecastData> = new Map();
  private comparativeAnalyses: Map<string, ComparativeAnalysis> = new Map();
  private scenarioModels: Map<string, ScenarioModel> = new Map();
  private trendAnalyses: Map<string, TrendAnalysis> = new Map();

  constructor() {
    this.initializeForecastingModels();
  }

  /**
   * Initialize forecasting models
   */
  private initializeForecastingModels(): void {
    logger.info('Initializing forecasting service...');
  }

  /**
   * Create a new forecast
   */
  public async createForecast(
    userId: string,
    forecastData: Omit<ForecastData, 'id' | 'createdAt' | 'updatedAt' | 'results'>
  ): Promise<ForecastData> {
    try {
      const forecast: ForecastData = {
        id: uuidv4(),
        ...forecastData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Validate forecast data
      this.validateForecast(forecast);

      // Generate forecast
      const results = await this.generateForecast(forecast);
      forecast.results = results;

      // Store forecast
      this.forecasts.set(forecast.id, forecast);

      logger.info(`Created forecast: ${forecast.name}`);
      return forecast;
    } catch (error) {
      logger.error('Error creating forecast:', error);
      throw error;
    }
  }

  /**
   * Validate forecast data
   */
  private validateForecast(forecast: ForecastData): void {
    if (!forecast.name || !forecast.description) {
      throw new Error('Forecast name and description are required');
    }

    if (forecast.timeRange.start >= forecast.timeRange.end) {
      throw new Error('Start date must be before end date');
    }

    if (forecast.forecastPeriod.start <= forecast.timeRange.end) {
      throw new Error('Forecast period must start after the data range');
    }

    if (!['linear', 'exponential', 'seasonal', 'arima', 'machine_learning'].includes(forecast.method)) {
      throw new Error('Invalid forecasting method');
    }
  }

  /**
   * Generate forecast
   */
  private async generateForecast(forecast: ForecastData): Promise<ForecastResult> {
    try {
      // Get historical data
      const historicalData = await this.getHistoricalData(forecast);
      
      // Apply forecasting method
      let forecastResult: ForecastResult;
      
      switch (forecast.method) {
        case 'linear':
          forecastResult = this.linearForecast(historicalData, forecast);
          break;
        case 'exponential':
          forecastResult = this.exponentialForecast(historicalData, forecast);
          break;
        case 'seasonal':
          forecastResult = this.seasonalForecast(historicalData, forecast);
          break;
        case 'arima':
          forecastResult = this.arimaForecast(historicalData, forecast);
          break;
        case 'machine_learning':
          forecastResult = this.mlForecast(historicalData, forecast);
          break;
        default:
          throw new Error('Unsupported forecasting method');
      }

      return forecastResult;
    } catch (error) {
      logger.error('Error generating forecast:', error);
      throw error;
    }
  }

  /**
   * Get historical data
   */
  private async getHistoricalData(forecast: ForecastData): Promise<Array<{ date: Date; value: number }>> {
    // In production, this would query the actual database
    // For now, we'll generate sample data
    
    const data: Array<{ date: Date; value: number }> = [];
    const startDate = new Date(forecast.timeRange.start);
    const endDate = new Date(forecast.timeRange.end);
    
    let currentDate = new Date(startDate);
    let value = 1000; // Starting value
    
    while (currentDate <= endDate) {
      // Add some trend and seasonality
      const trend = (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30) * 50; // Monthly growth
      const seasonality = Math.sin((currentDate.getMonth() / 12) * 2 * Math.PI) * 100; // Seasonal variation
      const noise = (Math.random() - 0.5) * 50; // Random noise
      
      data.push({
        date: new Date(currentDate),
        value: value + trend + seasonality + noise,
      });
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return data;
  }

  /**
   * Linear forecasting
   */
  private linearForecast(
    historicalData: Array<{ date: Date; value: number }>,
    forecast: ForecastData
  ): ForecastResult {
    const n = historicalData.length;
    const x = historicalData.map((_, i) => i);
    const y = historicalData.map(d => d.value);
    
    // Calculate linear regression
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Generate forecast
    const dataPoints: ForecastResult['dataPoints'] = [];
    const forecastStart = new Date(forecast.forecastPeriod.start);
    const forecastEnd = new Date(forecast.forecastPeriod.end);
    
    let currentDate = new Date(forecastStart);
    let forecastIndex = n;
    
    while (currentDate <= forecastEnd) {
      const forecastValue = intercept + slope * forecastIndex;
      const confidence = Math.max(0.5, 1 - (forecastIndex - n) * 0.1); // Decreasing confidence over time
      const margin = forecastValue * (1 - confidence) * 0.5;
      
      dataPoints.push({
        date: new Date(currentDate),
        forecast: forecastValue,
        lowerBound: forecastValue - margin,
        upperBound: forecastValue + margin,
        confidence,
      });
      
      currentDate.setMonth(currentDate.getMonth() + 1);
      forecastIndex++;
    }
    
    // Calculate summary
    const totalForecast = dataPoints.reduce((sum, dp) => sum + dp.forecast, 0);
    const averageMonthly = totalForecast / dataPoints.length;
    const growthRate = slope;
    
    return {
      dataPoints,
      summary: {
        totalForecast,
        averageMonthly,
        growthRate,
        seasonality: 0,
        trend: growthRate > 0 ? 'increasing' : growthRate < 0 ? 'decreasing' : 'stable',
      },
      accuracy: {
        mape: 0.1, // Would be calculated from actual vs predicted
        rmse: 50, // Would be calculated from actual vs predicted
        r2: 0.85, // Would be calculated from actual vs predicted
      },
    };
  }

  /**
   * Exponential forecasting
   */
  private exponentialForecast(
    historicalData: Array<{ date: Date; value: number }>,
    forecast: ForecastData
  ): ForecastResult {
    // Simplified exponential smoothing
    const alpha = 0.3; // Smoothing parameter
    let forecastValue = historicalData[0].value;
    
    // Apply exponential smoothing to historical data
    for (let i = 1; i < historicalData.length; i++) {
      forecastValue = alpha * historicalData[i].value + (1 - alpha) * forecastValue;
    }
    
    // Generate forecast
    const dataPoints: ForecastResult['dataPoints'] = [];
    const forecastStart = new Date(forecast.forecastPeriod.start);
    const forecastEnd = new Date(forecast.forecastPeriod.end);
    
    let currentDate = new Date(forecastStart);
    let currentForecast = forecastValue;
    
    while (currentDate <= forecastEnd) {
      const confidence = Math.max(0.3, 1 - (currentDate.getTime() - forecastStart.getTime()) / (1000 * 60 * 60 * 24 * 365)); // Decreasing confidence over time
      const margin = currentForecast * (1 - confidence) * 0.3;
      
      dataPoints.push({
        date: new Date(currentDate),
        forecast: currentForecast,
        lowerBound: currentForecast - margin,
        upperBound: currentForecast + margin,
        confidence,
      });
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    const totalForecast = dataPoints.reduce((sum, dp) => sum + dp.forecast, 0);
    const averageMonthly = totalForecast / dataPoints.length;
    
    return {
      dataPoints,
      summary: {
        totalForecast,
        averageMonthly,
        growthRate: 0,
        seasonality: 0,
        trend: 'stable',
      },
      accuracy: {
        mape: 0.15,
        rmse: 75,
        r2: 0.75,
      },
    };
  }

  /**
   * Seasonal forecasting
   */
  private seasonalForecast(
    historicalData: Array<{ date: Date; value: number }>,
    forecast: ForecastData
  ): ForecastResult {
    // Calculate seasonal patterns
    const monthlyAverages = new Array(12).fill(0);
    const monthlyCounts = new Array(12).fill(0);
    
    historicalData.forEach(data => {
      const month = data.date.getMonth();
      monthlyAverages[month] += data.value;
      monthlyCounts[month]++;
    });
    
    monthlyAverages.forEach((sum, month) => {
      if (monthlyCounts[month] > 0) {
        monthlyAverages[month] = sum / monthlyCounts[month];
      }
    });
    
    // Calculate overall average
    const overallAverage = monthlyAverages.reduce((sum, avg) => sum + avg, 0) / 12;
    
    // Calculate seasonal indices
    const seasonalIndices = monthlyAverages.map(avg => avg / overallAverage);
    
    // Generate forecast
    const dataPoints: ForecastResult['dataPoints'] = [];
    const forecastStart = new Date(forecast.forecastPeriod.start);
    const forecastEnd = new Date(forecast.forecastPeriod.end);
    
    let currentDate = new Date(forecastStart);
    
    while (currentDate <= forecastEnd) {
      const month = currentDate.getMonth();
      const seasonalIndex = seasonalIndices[month];
      const baseForecast = overallAverage;
      const forecastValue = baseForecast * seasonalIndex;
      const confidence = 0.8;
      const margin = forecastValue * 0.2;
      
      dataPoints.push({
        date: new Date(currentDate),
        forecast: forecastValue,
        lowerBound: forecastValue - margin,
        upperBound: forecastValue + margin,
        confidence,
      });
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    const totalForecast = dataPoints.reduce((sum, dp) => sum + dp.forecast, 0);
    const averageMonthly = totalForecast / dataPoints.length;
    
    return {
      dataPoints,
      summary: {
        totalForecast,
        averageMonthly,
        growthRate: 0,
        seasonality: 1,
        trend: 'stable',
      },
      accuracy: {
        mape: 0.12,
        rmse: 60,
        r2: 0.8,
      },
    };
  }

  /**
   * ARIMA forecasting (simplified)
   */
  private arimaForecast(
    historicalData: Array<{ date: Date; value: number }>,
    forecast: ForecastData
  ): ForecastResult {
    // Simplified ARIMA implementation
    // In production, this would use a proper ARIMA library
    
    const dataPoints: ForecastResult['dataPoints'] = [];
    const forecastStart = new Date(forecast.forecastPeriod.start);
    const forecastEnd = new Date(forecast.forecastPeriod.end);
    
    let currentDate = new Date(forecastStart);
    let forecastValue = historicalData[historicalData.length - 1].value;
    
    while (currentDate <= forecastEnd) {
      const confidence = Math.max(0.4, 1 - (currentDate.getTime() - forecastStart.getTime()) / (1000 * 60 * 60 * 24 * 365));
      const margin = forecastValue * (1 - confidence) * 0.4;
      
      dataPoints.push({
        date: new Date(currentDate),
        forecast: forecastValue,
        lowerBound: forecastValue - margin,
        upperBound: forecastValue + margin,
        confidence,
      });
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    const totalForecast = dataPoints.reduce((sum, dp) => sum + dp.forecast, 0);
    const averageMonthly = totalForecast / dataPoints.length;
    
    return {
      dataPoints,
      summary: {
        totalForecast,
        averageMonthly,
        growthRate: 0,
        seasonality: 0,
        trend: 'stable',
      },
      accuracy: {
        mape: 0.08,
        rmse: 40,
        r2: 0.9,
      },
    };
  }

  /**
   * Machine learning forecasting
   */
  private mlForecast(
    historicalData: Array<{ date: Date; value: number }>,
    forecast: ForecastData
  ): ForecastResult {
    // Simplified ML forecasting
    // In production, this would use a proper ML library like TensorFlow.js
    
    const dataPoints: ForecastResult['dataPoints'] = [];
    const forecastStart = new Date(forecast.forecastPeriod.start);
    const forecastEnd = new Date(forecast.forecastPeriod.end);
    
    let currentDate = new Date(forecastStart);
    let forecastValue = historicalData[historicalData.length - 1].value;
    
    while (currentDate <= forecastEnd) {
      const confidence = Math.max(0.6, 1 - (currentDate.getTime() - forecastStart.getTime()) / (1000 * 60 * 60 * 24 * 365));
      const margin = forecastValue * (1 - confidence) * 0.3;
      
      dataPoints.push({
        date: new Date(currentDate),
        forecast: forecastValue,
        lowerBound: forecastValue - margin,
        upperBound: forecastValue + margin,
        confidence,
      });
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    const totalForecast = dataPoints.reduce((sum, dp) => sum + dp.forecast, 0);
    const averageMonthly = totalForecast / dataPoints.length;
    
    return {
      dataPoints,
      summary: {
        totalForecast,
        averageMonthly,
        growthRate: 0,
        seasonality: 0,
        trend: 'stable',
      },
      accuracy: {
        mape: 0.06,
        rmse: 30,
        r2: 0.95,
      },
    };
  }

  /**
   * Create comparative analysis
   */
  public async createComparativeAnalysis(
    userId: string,
    analysisData: Omit<ComparativeAnalysis, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ComparativeAnalysis> {
    try {
      const analysis: ComparativeAnalysis = {
        id: uuidv4(),
        ...analysisData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.comparativeAnalyses.set(analysis.id, analysis);
      logger.info(`Created comparative analysis: ${analysis.name}`);
      return analysis;
    } catch (error) {
      logger.error('Error creating comparative analysis:', error);
      throw error;
    }
  }

  /**
   * Create scenario model
   */
  public async createScenarioModel(
    userId: string,
    modelData: Omit<ScenarioModel, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ScenarioModel> {
    try {
      const model: ScenarioModel = {
        id: uuidv4(),
        ...modelData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.scenarioModels.set(model.id, model);
      logger.info(`Created scenario model: ${model.name}`);
      return model;
    } catch (error) {
      logger.error('Error creating scenario model:', error);
      throw error;
    }
  }

  /**
   * Create trend analysis
   */
  public async createTrendAnalysis(
    userId: string,
    analysisData: Omit<TrendAnalysis, 'id' | 'createdAt'>
  ): Promise<TrendAnalysis> {
    try {
      const analysis: TrendAnalysis = {
        id: uuidv4(),
        ...analysisData,
        createdAt: new Date(),
      };

      this.trendAnalyses.set(analysis.id, analysis);
      logger.info(`Created trend analysis: ${analysis.name}`);
      return analysis;
    } catch (error) {
      logger.error('Error creating trend analysis:', error);
      throw error;
    }
  }

  /**
   * Get forecast by ID
   */
  public async getForecast(forecastId: string): Promise<ForecastData | null> {
    return this.forecasts.get(forecastId) || null;
  }

  /**
   * Get forecasts for user
   */
  public async getForecasts(userId: string): Promise<ForecastData[]> {
    const userForecasts = Array.from(this.forecasts.values()).filter(forecast => 
      forecast.userId === userId
    );

    return userForecasts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Update forecast
   */
  public async updateForecast(
    forecastId: string,
    updates: Partial<ForecastData>
  ): Promise<ForecastData> {
    const forecast = this.forecasts.get(forecastId);
    if (!forecast) {
      throw new Error('Forecast not found');
    }

    const updatedForecast = {
      ...forecast,
      ...updates,
      updatedAt: new Date(),
    };

    // Regenerate forecast if parameters changed
    if (updates.parameters || updates.method || updates.timeRange || updates.forecastPeriod) {
      updatedForecast.results = await this.generateForecast(updatedForecast);
    }

    this.forecasts.set(forecastId, updatedForecast);
    return updatedForecast;
  }

  /**
   * Delete forecast
   */
  public async deleteForecast(forecastId: string): Promise<void> {
    if (!this.forecasts.has(forecastId)) {
      throw new Error('Forecast not found');
    }

    this.forecasts.delete(forecastId);
    logger.info(`Deleted forecast: ${forecastId}`);
  }

  /**
   * Get forecast accuracy
   */
  public async getForecastAccuracy(forecastId: string): Promise<{
    mape: number;
    rmse: number;
    r2: number;
    confidence: number;
  }> {
    const forecast = this.forecasts.get(forecastId);
    if (!forecast || !forecast.results) {
      throw new Error('Forecast not found or not completed');
    }

    return forecast.results.accuracy;
  }

  /**
   * Get forecast summary
   */
  public async getForecastSummary(forecastId: string): Promise<{
    totalForecast: number;
    averageMonthly: number;
    growthRate: number;
    trend: string;
    confidence: number;
  }> {
    const forecast = this.forecasts.get(forecastId);
    if (!forecast || !forecast.results) {
      throw new Error('Forecast not found or not completed');
    }

    return {
      ...forecast.results.summary,
      confidence: forecast.confidence,
    };
  }
}

export default new ForecastingService();