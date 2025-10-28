import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

export interface MLModel {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'clustering' | 'anomaly_detection';
  status: 'training' | 'trained' | 'deployed' | 'failed';
  accuracy: number;
  confidence: number;
  lastTrained: Date;
  version: string;
  parameters: Record<string, any>;
  performance: {
    precision: number;
    recall: number;
    f1Score: number;
    auc: number;
  };
}

export interface MLPrediction {
  modelId: string;
  input: Record<string, any>;
  prediction: any;
  confidence: number;
  probability?: number;
  explanation?: string;
  timestamp: Date;
}

export interface MLTrainingData {
  id: string;
  modelId: string;
  features: Record<string, any>;
  label: string;
  weight: number;
  timestamp: Date;
}

export interface MLFeature {
  name: string;
  type: 'numeric' | 'categorical' | 'text' | 'datetime';
  importance: number;
  description: string;
  examples: any[];
}

export interface MLRecommendation {
  type: 'categorization' | 'pricing' | 'fraud' | 'churn' | 'demand';
  confidence: number;
  recommendation: string;
  reasoning: string;
  action: string;
  impact: 'low' | 'medium' | 'high';
}

class MLModelsService {
  private prisma: PrismaClient;
  private models: Map<string, MLModel> = new Map();

  constructor() {
    this.prisma = new PrismaClient();
    this.initializeModels();
    logger.info('[MLModelsService] Initialized');
  }

  /**
   * Initialize ML models
   */
  private async initializeModels(): Promise<void> {
    try {
      // Load existing models from database
      const existingModels = await this.prisma.mLModel.findMany();
      
      for (const model of existingModels) {
        this.models.set(model.id, {
          id: model.id,
          name: model.name,
          type: model.type as any,
          status: model.status as any,
          accuracy: model.accuracy,
          confidence: model.confidence,
          lastTrained: model.lastTrained,
          version: model.version,
          parameters: model.parameters as any,
          performance: model.performance as any
        });
      }
      
      // Initialize default models if none exist
      if (this.models.size === 0) {
        await this.createDefaultModels();
      }
    } catch (error: any) {
      logger.error('[MLModelsService] Error initializing models:', error);
    }
  }

  /**
   * Create default ML models
   */
  private async createDefaultModels(): Promise<void> {
    const defaultModels = [
      {
        id: 'expense_categorization',
        name: 'Expense Categorization',
        type: 'classification',
        status: 'trained',
        accuracy: 0.85,
        confidence: 0.8,
        version: '1.0.0',
        parameters: {
          algorithm: 'naive_bayes',
          features: ['description', 'amount', 'vendor', 'date'],
          categories: ['office', 'travel', 'meals', 'supplies', 'utilities']
        },
        performance: {
          precision: 0.82,
          recall: 0.85,
          f1Score: 0.83,
          auc: 0.88
        }
      },
      {
        id: 'fraud_detection',
        name: 'Fraud Detection',
        type: 'anomaly_detection',
        status: 'trained',
        accuracy: 0.92,
        confidence: 0.9,
        version: '1.0.0',
        parameters: {
          algorithm: 'isolation_forest',
          features: ['amount', 'frequency', 'location', 'time', 'vendor'],
          threshold: 0.1
        },
        performance: {
          precision: 0.89,
          recall: 0.94,
          f1Score: 0.91,
          auc: 0.93
        }
      },
      {
        id: 'customer_churn',
        name: 'Customer Churn Prediction',
        type: 'classification',
        status: 'trained',
        accuracy: 0.78,
        confidence: 0.75,
        version: '1.0.0',
        parameters: {
          algorithm: 'random_forest',
          features: ['payment_history', 'usage_pattern', 'support_tickets', 'satisfaction'],
          classes: ['churn', 'retain']
        },
        performance: {
          precision: 0.76,
          recall: 0.80,
          f1Score: 0.78,
          auc: 0.82
        }
      },
      {
        id: 'price_optimization',
        name: 'Price Optimization',
        type: 'regression',
        status: 'trained',
        accuracy: 0.88,
        confidence: 0.85,
        version: '1.0.0',
        parameters: {
          algorithm: 'linear_regression',
          features: ['demand', 'competition', 'seasonality', 'cost'],
          target: 'optimal_price'
        },
        performance: {
          precision: 0.85,
          recall: 0.87,
          f1Score: 0.86,
          auc: 0.89
        }
      },
      {
        id: 'demand_forecasting',
        name: 'Demand Forecasting',
        type: 'regression',
        status: 'trained',
        accuracy: 0.82,
        confidence: 0.8,
        version: '1.0.0',
        parameters: {
          algorithm: 'arima',
          features: ['historical_sales', 'seasonality', 'trend', 'external_factors'],
          target: 'demand'
        },
        performance: {
          precision: 0.80,
          recall: 0.84,
          f1Score: 0.82,
          auc: 0.85
        }
      }
    ];

    for (const model of defaultModels) {
      await this.createModel(model);
    }
  }

  /**
   * Create a new ML model
   */
  public async createModel(modelData: Partial<MLModel>): Promise<MLModel> {
    try {
      const model = await this.prisma.mLModel.create({
        data: {
          id: modelData.id || `model_${Date.now()}`,
          name: modelData.name || 'Untitled Model',
          type: modelData.type || 'classification',
          status: modelData.status || 'training',
          accuracy: modelData.accuracy || 0,
          confidence: modelData.confidence || 0,
          version: modelData.version || '1.0.0',
          parameters: modelData.parameters || {},
          performance: modelData.performance || {
            precision: 0,
            recall: 0,
            f1Score: 0,
            auc: 0
          }
        }
      });

      const mlModel: MLModel = {
        id: model.id,
        name: model.name,
        type: model.type as any,
        status: model.status as any,
        accuracy: model.accuracy,
        confidence: model.confidence,
        lastTrained: model.lastTrained,
        version: model.version,
        parameters: model.parameters as any,
        performance: model.performance as any
      };

      this.models.set(model.id, mlModel);
      return mlModel;
    } catch (error: any) {
      logger.error('[MLModelsService] Error creating model:', error);
      throw new Error(`Failed to create model: ${error.message}`);
    }
  }

  /**
   * Train a model with new data
   */
  public async trainModel(modelId: string, trainingData: MLTrainingData[]): Promise<MLModel> {
    try {
      const model = this.models.get(modelId);
      if (!model) {
        throw new Error('Model not found');
      }

      // Update model status to training
      model.status = 'training';
      await this.updateModel(model);

      // Simulate training process
      await this.simulateTraining(model, trainingData);

      // Update model with new performance metrics
      const newPerformance = await this.calculatePerformance(model, trainingData);
      model.accuracy = newPerformance.accuracy;
      model.confidence = newPerformance.confidence;
      model.performance = newPerformance.performance;
      model.status = 'trained';
      model.lastTrained = new Date();

      await this.updateModel(model);
      return model;
    } catch (error: any) {
      logger.error('[MLModelsService] Error training model:', error);
      throw new Error(`Failed to train model: ${error.message}`);
    }
  }

  /**
   * Make a prediction using a model
   */
  public async makePrediction(modelId: string, input: Record<string, any>): Promise<MLPrediction> {
    try {
      const model = this.models.get(modelId);
      if (!model) {
        throw new Error('Model not found');
      }

      if (model.status !== 'trained' && model.status !== 'deployed') {
        throw new Error('Model is not ready for predictions');
      }

      // Simulate prediction based on model type
      const prediction = await this.simulatePrediction(model, input);
      
      return {
        modelId,
        input,
        prediction: prediction.result,
        confidence: prediction.confidence,
        probability: prediction.probability,
        explanation: prediction.explanation,
        timestamp: new Date()
      };
    } catch (error: any) {
      logger.error('[MLModelsService] Error making prediction:', error);
      throw new Error(`Failed to make prediction: ${error.message}`);
    }
  }

  /**
   * Get model recommendations
   */
  public async getRecommendations(companyId: string, context: Record<string, any>): Promise<MLRecommendation[]> {
    try {
      const recommendations: MLRecommendation[] = [];

      // Categorization recommendations
      const categorizationRecs = await this.getCategorizationRecommendations(companyId, context);
      recommendations.push(...categorizationRecs);

      // Pricing recommendations
      const pricingRecs = await this.getPricingRecommendations(companyId, context);
      recommendations.push(...pricingRecs);

      // Fraud detection recommendations
      const fraudRecs = await this.getFraudRecommendations(companyId, context);
      recommendations.push(...fraudRecs);

      // Churn prevention recommendations
      const churnRecs = await this.getChurnRecommendations(companyId, context);
      recommendations.push(...churnRecs);

      // Demand forecasting recommendations
      const demandRecs = await this.getDemandRecommendations(companyId, context);
      recommendations.push(...demandRecs);

      return recommendations.sort((a, b) => b.confidence - a.confidence);
    } catch (error: any) {
      logger.error('[MLModelsService] Error getting recommendations:', error);
      throw new Error(`Failed to get recommendations: ${error.message}`);
    }
  }

  /**
   * Get all models
   */
  public async getModels(): Promise<MLModel[]> {
    return Array.from(this.models.values());
  }

  /**
   * Get model by ID
   */
  public async getModel(modelId: string): Promise<MLModel | null> {
    return this.models.get(modelId) || null;
  }

  /**
   * Update model
   */
  public async updateModel(model: MLModel): Promise<void> {
    try {
      await this.prisma.mLModel.update({
        where: { id: model.id },
        data: {
          name: model.name,
          type: model.type,
          status: model.status,
          accuracy: model.accuracy,
          confidence: model.confidence,
          version: model.version,
          parameters: model.parameters,
          performance: model.performance,
          lastTrained: model.lastTrained
        }
      });

      this.models.set(model.id, model);
    } catch (error: any) {
      logger.error('[MLModelsService] Error updating model:', error);
      throw new Error(`Failed to update model: ${error.message}`);
    }
  }

  /**
   * Delete model
   */
  public async deleteModel(modelId: string): Promise<void> {
    try {
      await this.prisma.mLModel.delete({
        where: { id: modelId }
      });

      this.models.delete(modelId);
    } catch (error: any) {
      logger.error('[MLModelsService] Error deleting model:', error);
      throw new Error(`Failed to delete model: ${error.message}`);
    }
  }

  /**
   * Get model features
   */
  public async getModelFeatures(modelId: string): Promise<MLFeature[]> {
    try {
      const model = this.models.get(modelId);
      if (!model) {
        throw new Error('Model not found');
      }

      const features: MLFeature[] = [];
      const parameters = model.parameters;

      if (parameters.features) {
        for (const featureName of parameters.features) {
          features.push({
            name: featureName,
            type: this.determineFeatureType(featureName),
            importance: Math.random(), // This would be calculated from actual model
            description: this.getFeatureDescription(featureName),
            examples: this.getFeatureExamples(featureName)
          });
        }
      }

      return features.sort((a, b) => b.importance - a.importance);
    } catch (error: any) {
      logger.error('[MLModelsService] Error getting model features:', error);
      throw new Error(`Failed to get model features: ${error.message}`);
    }
  }

  // Helper methods
  private async simulateTraining(model: MLModel, trainingData: MLTrainingData[]): Promise<void> {
    // Simulate training time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update model parameters based on training data
    const dataSize = trainingData.length;
    const accuracy = Math.min(0.95, 0.7 + (dataSize / 1000) * 0.25);
    
    model.accuracy = accuracy;
    model.confidence = accuracy * 0.9;
  }

  private async calculatePerformance(model: MLModel, trainingData: MLTrainingData[]): Promise<any> {
    const accuracy = model.accuracy;
    const precision = accuracy * 0.95;
    const recall = accuracy * 0.90;
    const f1Score = (2 * precision * recall) / (precision + recall);
    const auc = accuracy * 0.92;

    return {
      accuracy,
      confidence: accuracy * 0.9,
      performance: {
        precision,
        recall,
        f1Score,
        auc
      }
    };
  }

  private async simulatePrediction(model: MLModel, input: Record<string, any>): Promise<any> {
    // Simulate prediction based on model type
    switch (model.type) {
      case 'classification':
        return this.simulateClassificationPrediction(model, input);
      case 'regression':
        return this.simulateRegressionPrediction(model, input);
      case 'clustering':
        return this.simulateClusteringPrediction(model, input);
      case 'anomaly_detection':
        return this.simulateAnomalyDetectionPrediction(model, input);
      default:
        throw new Error('Unknown model type');
    }
  }

  private simulateClassificationPrediction(model: MLModel, input: Record<string, any>): any {
    const categories = model.parameters.categories || ['category1', 'category2', 'category3'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const confidence = 0.7 + Math.random() * 0.3;
    
    return {
      result: randomCategory,
      confidence,
      probability: confidence,
      explanation: `Predicted category: ${randomCategory} with ${(confidence * 100).toFixed(1)}% confidence`
    };
  }

  private simulateRegressionPrediction(model: MLModel, input: Record<string, any>): any {
    const baseValue = 100;
    const variation = (Math.random() - 0.5) * 50;
    const predictedValue = baseValue + variation;
    const confidence = 0.8 + Math.random() * 0.2;
    
    return {
      result: predictedValue,
      confidence,
      explanation: `Predicted value: ${predictedValue.toFixed(2)} with ${(confidence * 100).toFixed(1)}% confidence`
    };
  }

  private simulateClusteringPrediction(model: MLModel, input: Record<string, any>): any {
    const cluster = Math.floor(Math.random() * 3) + 1;
    const confidence = 0.75 + Math.random() * 0.25;
    
    return {
      result: `cluster_${cluster}`,
      confidence,
      explanation: `Assigned to cluster ${cluster} with ${(confidence * 100).toFixed(1)}% confidence`
    };
  }

  private simulateAnomalyDetectionPrediction(model: MLModel, input: Record<string, any>): any {
    const isAnomaly = Math.random() < 0.1; // 10% chance of anomaly
    const confidence = 0.85 + Math.random() * 0.15;
    
    return {
      result: isAnomaly ? 'anomaly' : 'normal',
      confidence,
      explanation: isAnomaly 
        ? `Anomaly detected with ${(confidence * 100).toFixed(1)}% confidence`
        : `Normal pattern with ${(confidence * 100).toFixed(1)}% confidence`
    };
  }

  private async getCategorizationRecommendations(companyId: string, context: Record<string, any>): Promise<MLRecommendation[]> {
    const recommendations: MLRecommendation[] = [];
    
    // Check for uncategorized expenses
    const uncategorizedCount = await this.getUncategorizedExpensesCount(companyId);
    if (uncategorizedCount > 0) {
      recommendations.push({
        type: 'categorization',
        confidence: 0.9,
        recommendation: `You have ${uncategorizedCount} uncategorized expenses. Use ML categorization to automatically categorize them.`,
        reasoning: 'Uncategorized expenses make financial reporting less accurate',
        action: 'Run ML categorization on uncategorized expenses',
        impact: 'high'
      });
    }
    
    return recommendations;
  }

  private async getPricingRecommendations(companyId: string, context: Record<string, any>): Promise<MLRecommendation[]> {
    const recommendations: MLRecommendation[] = [];
    
    // Check for pricing optimization opportunities
    const pricingData = await this.getPricingData(companyId);
    if (pricingData.competitorPrice < pricingData.currentPrice * 0.9) {
      recommendations.push({
        type: 'pricing',
        confidence: 0.8,
        recommendation: 'Consider adjusting your pricing strategy based on market analysis',
        reasoning: 'Competitor pricing is significantly lower than your current pricing',
        action: 'Review pricing strategy and consider adjustments',
        impact: 'medium'
      });
    }
    
    return recommendations;
  }

  private async getFraudRecommendations(companyId: string, context: Record<string, any>): Promise<MLRecommendation[]> {
    const recommendations: MLRecommendation[] = [];
    
    // Check for potential fraud indicators
    const fraudIndicators = await this.getFraudIndicators(companyId);
    if (fraudIndicators.length > 0) {
      recommendations.push({
        type: 'fraud',
        confidence: 0.95,
        recommendation: `${fraudIndicators.length} transactions flagged for potential fraud. Review immediately.`,
        reasoning: 'ML model detected unusual patterns in transaction data',
        action: 'Review flagged transactions and take appropriate action',
        impact: 'high'
      });
    }
    
    return recommendations;
  }

  private async getChurnRecommendations(companyId: string, context: Record<string, any>): Promise<MLRecommendation[]> {
    const recommendations: MLRecommendation[] = [];
    
    // Check for customer churn risk
    const churnRisk = await this.getChurnRisk(companyId);
    if (churnRisk > 0.7) {
      recommendations.push({
        type: 'churn',
        confidence: 0.85,
        recommendation: 'High customer churn risk detected. Implement retention strategies.',
        reasoning: 'ML model predicts high probability of customer churn',
        action: 'Implement customer retention strategies and outreach',
        impact: 'high'
      });
    }
    
    return recommendations;
  }

  private async getDemandRecommendations(companyId: string, context: Record<string, any>): Promise<MLRecommendation[]> {
    const recommendations: MLRecommendation[] = [];
    
    // Check for demand forecasting opportunities
    const demandForecast = await this.getDemandForecast(companyId);
    if (demandForecast.forecastedDemand > demandForecast.currentCapacity * 1.2) {
      recommendations.push({
        type: 'demand',
        confidence: 0.8,
        recommendation: 'Forecasted demand exceeds current capacity. Consider scaling up.',
        reasoning: 'ML model predicts significant increase in demand',
        action: 'Plan for capacity expansion or resource allocation',
        impact: 'medium'
      });
    }
    
    return recommendations;
  }

  private determineFeatureType(featureName: string): 'numeric' | 'categorical' | 'text' | 'datetime' {
    if (featureName.includes('amount') || featureName.includes('price') || featureName.includes('quantity')) {
      return 'numeric';
    }
    if (featureName.includes('date') || featureName.includes('time')) {
      return 'datetime';
    }
    if (featureName.includes('description') || featureName.includes('notes')) {
      return 'text';
    }
    return 'categorical';
  }

  private getFeatureDescription(featureName: string): string {
    const descriptions: Record<string, string> = {
      'amount': 'Transaction amount in dollars',
      'description': 'Transaction description or notes',
      'vendor': 'Vendor or merchant name',
      'date': 'Transaction date',
      'category': 'Transaction category',
      'location': 'Transaction location',
      'frequency': 'Transaction frequency',
      'time': 'Transaction time',
      'payment_method': 'Payment method used',
      'customer_id': 'Customer identifier'
    };
    
    return descriptions[featureName] || `Feature: ${featureName}`;
  }

  private getFeatureExamples(featureName: string): any[] {
    const examples: Record<string, any[]> = {
      'amount': [25.99, 150.00, 0.50, 1000.00],
      'description': ['Office supplies', 'Client dinner', 'Software subscription'],
      'vendor': ['Amazon', 'Starbucks', 'Microsoft'],
      'category': ['Office', 'Meals', 'Software'],
      'payment_method': ['Credit Card', 'Debit Card', 'Cash']
    };
    
    return examples[featureName] || [];
  }

  private async getUncategorizedExpensesCount(companyId: string): Promise<number> {
    return await this.prisma.expense.count({
      where: {
        companyId,
        category: null
      }
    });
  }

  private async getPricingData(companyId: string): Promise<any> {
    // This would integrate with external pricing data
    return {
      currentPrice: 100,
      competitorPrice: 85,
      marketAverage: 90
    };
  }

  private async getFraudIndicators(companyId: string): Promise<any[]> {
    // This would use the fraud detection model
    return [];
  }

  private async getChurnRisk(companyId: string): Promise<number> {
    // This would use the churn prediction model
    return Math.random();
  }

  private async getDemandForecast(companyId: string): Promise<any> {
    // This would use the demand forecasting model
    return {
      forecastedDemand: 120,
      currentCapacity: 100
    };
  }
}

export default new MLModelsService();










