import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class MLModelTrainingService {
  // Automated Model Training Pipeline
  async trainModel(userId: string, modelType: string = 'categorization') {
    try {
      // Get training data
      const trainingData = await this.getTrainingData(userId);
      
      if (trainingData.length < 100) {
        throw new Error('Insufficient training data. Need at least 100 samples.');
      }

      // Start training job
      const trainingJob = await prisma.mlTrainingJob.create({
        data: {
          id: uuidv4(),
          userId,
          modelType,
          status: 'started',
          trainingDataCount: trainingData.length,
          startedAt: new Date()
        }
      });

      // Feature engineering
      const features = await this.engineerFeatures(trainingData);
      
      // Train model (simplified)
      const model = await this.trainModelAlgorithm(features);
      
      // Evaluate model
      const evaluation = await this.evaluateModel(model, trainingData);
      
      // Update training job
      await prisma.mlTrainingJob.update({
        where: { id: trainingJob.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          accuracy: evaluation.accuracy,
          metrics: JSON.stringify(evaluation)
        }
      });

      // Store model version
      const modelVersion = await this.storeModelVersion(userId, model, evaluation);

      return {
        trainingJobId: trainingJob.id,
        modelVersion,
        evaluation,
        status: 'completed'
      };
    } catch (error) {
      throw new Error(`Failed to train model: ${error.message}`);
    }
  }

  // Feature Engineering for Transactions
  async engineerFeatures(trainingData: any[]) {
    try {
      const features = [];

      for (const data of trainingData) {
        const transaction = JSON.parse(data.features);
        const engineeredFeatures = {
          // Basic features
          description: transaction.description,
          amount: transaction.amount,
          merchant: transaction.merchant,
          
          // Temporal features
          dayOfWeek: transaction.dayOfWeek,
          dayOfMonth: transaction.dayOfMonth,
          month: transaction.month,
          isWeekend: transaction.isWeekend,
          isMonthEnd: transaction.isMonthEnd,
          
          // Text features
          descriptionLength: transaction.descriptionLength,
          hasNumbers: transaction.hasNumbers,
          hasSpecialChars: transaction.hasSpecialChars,
          wordCount: this.getWordCount(transaction.description),
          
          // Amount features
          amountRange: transaction.amountRange,
          amountLog: Math.log(Math.abs(transaction.amount) + 1),
          isNegative: transaction.amount < 0,
          
          // Merchant features
          merchantLength: transaction.merchant?.length || 0,
          merchantWordCount: this.getWordCount(transaction.merchant || ''),
          
          // Derived features
          descriptionEntropy: this.calculateEntropy(transaction.description),
          merchantEntropy: this.calculateEntropy(transaction.merchant || ''),
          
          // N-gram features
          descriptionBigrams: this.getBigrams(transaction.description),
          merchantBigrams: this.getBigrams(transaction.merchant || ''),
          
          // Pattern features
          hasTimePattern: this.hasTimePattern(transaction.description),
          hasAmountPattern: this.hasAmountPattern(transaction.description),
          hasLocationPattern: this.hasLocationPattern(transaction.description)
        };

        features.push({
          features: engineeredFeatures,
          label: data.label,
          transactionId: data.transactionId
        });
      }

      return features;
    } catch (error) {
      throw new Error(`Failed to engineer features: ${error.message}`);
    }
  }

  // Model Versioning and A/B Testing
  async createModelVersion(userId: string, modelData: any, metrics: any) {
    try {
      const version = await prisma.mlModelVersion.create({
        data: {
          id: uuidv4(),
          userId,
          version: await this.getNextVersionNumber(userId),
          modelData: JSON.stringify(modelData),
          metrics: JSON.stringify(metrics),
          status: 'trained',
          createdAt: new Date()
        }
      });

      return version;
    } catch (error) {
      throw new Error(`Failed to create model version: ${error.message}`);
    }
  }

  // A/B Testing for Models
  async setupABTest(userId: string, modelA: string, modelB: string, trafficSplit: number = 0.5) {
    try {
      const abTest = await prisma.mlABTest.create({
        data: {
          id: uuidv4(),
          userId,
          modelAVersion: modelA,
          modelBVersion: modelB,
          trafficSplit,
          status: 'active',
          startedAt: new Date()
        }
      });

      return abTest;
    } catch (error) {
      throw new Error(`Failed to setup A/B test: ${error.message}`);
    }
  }

  // Model Performance Monitoring
  async monitorModelPerformance(userId: string, modelVersion: string) {
    try {
      const performance = {
        accuracy: await this.calculateAccuracy(userId, modelVersion),
        precision: await this.calculatePrecision(userId, modelVersion),
        recall: await this.calculateRecall(userId, modelVersion),
        f1Score: await this.calculateF1Score(userId, modelVersion),
        confusionMatrix: await this.generateConfusionMatrix(userId, modelVersion),
        categoryMetrics: await this.getCategoryMetrics(userId, modelVersion),
        driftDetection: await this.detectDataDrift(userId, modelVersion),
        performanceTrend: await this.getPerformanceTrend(userId, modelVersion)
      };

      // Store performance metrics
      await prisma.mlPerformanceMetrics.create({
        data: {
          id: uuidv4(),
          userId,
          modelVersion,
          metrics: JSON.stringify(performance),
          calculatedAt: new Date()
        }
      });

      return performance;
    } catch (error) {
      throw new Error(`Failed to monitor model performance: ${error.message}`);
    }
  }

  // Auto-retraining Based on Accuracy Thresholds
  async checkRetrainingThresholds(userId: string) {
    try {
      const currentModel = await this.getCurrentModel(userId);
      const performance = await this.monitorModelPerformance(userId, currentModel.version);
      
      const thresholds = {
        accuracy: 0.8,
        precision: 0.75,
        recall: 0.75,
        f1Score: 0.75
      };

      const needsRetraining = Object.entries(thresholds).some(
        ([metric, threshold]) => performance[metric as keyof typeof performance] < threshold
      );

      if (needsRetraining) {
        await this.scheduleRetraining(userId, 'performance_degradation');
        return {
          needsRetraining: true,
          reason: 'Performance below thresholds',
          currentPerformance: performance,
          thresholds
        };
      }

      // Check for data drift
      if (performance.driftDetection.driftDetected) {
        await this.scheduleRetraining(userId, 'data_drift');
        return {
          needsRetraining: true,
          reason: 'Data drift detected',
          driftDetails: performance.driftDetection
        };
      }

      return {
        needsRetraining: false,
        currentPerformance: performance
      };
    } catch (error) {
      throw new Error(`Failed to check retraining thresholds: ${error.message}`);
    }
  }

  // Explainability Features (Why this category?)
  async explainPrediction(transactionId: string, prediction: any) {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId }
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      const explanation = {
        prediction: prediction.category,
        confidence: prediction.confidence,
        factors: await this.getPredictionFactors(transaction, prediction),
        similarTransactions: await this.findSimilarTransactions(transaction),
        historicalPatterns: await this.getHistoricalPatterns(transaction),
        merchantAnalysis: await this.analyzeMerchant(transaction),
        amountAnalysis: await this.analyzeAmount(transaction),
        timingAnalysis: await this.analyzeTiming(transaction),
        featureImportance: await this.getFeatureImportance(transaction)
      };

      return explanation;
    } catch (error) {
      throw new Error(`Failed to explain prediction: ${error.message}`);
    }
  }

  // Model Comparison and Selection
  async compareModels(userId: string, modelVersions: string[]) {
    try {
      const comparisons = [];

      for (const version of modelVersions) {
        const performance = await this.monitorModelPerformance(userId, version);
        comparisons.push({
          version,
          performance,
          score: this.calculateModelScore(performance)
        });
      }

      // Sort by score
      comparisons.sort((a, b) => b.score - a.score);

      return {
        bestModel: comparisons[0],
        comparisons,
        recommendation: this.getModelRecommendation(comparisons)
      };
    } catch (error) {
      throw new Error(`Failed to compare models: ${error.message}`);
    }
  }

  // Model Deployment Pipeline
  async deployModel(userId: string, modelVersion: string) {
    try {
      // Validate model
      const validation = await this.validateModelForDeployment(userId, modelVersion);
      
      if (!validation.isValid) {
        throw new Error(`Model validation failed: ${validation.errors.join(', ')}`);
      }

      // Deploy model
      const deployment = await prisma.mlModelDeployment.create({
        data: {
          id: uuidv4(),
          userId,
          modelVersion,
          status: 'deploying',
          deployedAt: new Date()
        }
      });

      // Update model status
      await prisma.mlModelVersion.update({
        where: { id: modelVersion },
        data: { status: 'deployed' }
      });

      return {
        deploymentId: deployment.id,
        status: 'deployed',
        modelVersion
      };
    } catch (error) {
      throw new Error(`Failed to deploy model: ${error.message}`);
    }
  }

  // Helper Methods
  private async getTrainingData(userId: string) {
    return await prisma.mlTrainingData.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  private async trainModelAlgorithm(features: any[]) {
    // Simplified model training - would integrate with actual ML library
    return {
      modelType: 'random_forest',
      parameters: {
        n_estimators: 100,
        max_depth: 10,
        random_state: 42
      },
      featureImportance: this.calculateFeatureImportance(features),
      trainingAccuracy: 0.85
    };
  }

  private async evaluateModel(model: any, testData: any[]) {
    // Simplified model evaluation
    return {
      accuracy: 0.85,
      precision: 0.82,
      recall: 0.88,
      f1Score: 0.85,
      confusionMatrix: this.generateConfusionMatrix(testData),
      categoryMetrics: this.getCategoryMetrics(testData)
    };
  }

  private async storeModelVersion(userId: string, model: any, evaluation: any) {
    return await prisma.mlModelVersion.create({
      data: {
        id: uuidv4(),
        userId,
        version: await this.getNextVersionNumber(userId),
        modelData: JSON.stringify(model),
        metrics: JSON.stringify(evaluation),
        status: 'trained',
        createdAt: new Date()
      }
    });
  }

  private getWordCount(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  private calculateEntropy(text: string): number {
    if (!text) return 0;
    
    const charCounts = {};
    for (const char of text) {
      charCounts[char] = (charCounts[char] || 0) + 1;
    }
    
    const total = text.length;
    let entropy = 0;
    
    for (const count of Object.values(charCounts)) {
      const probability = count as number / total;
      entropy -= probability * Math.log2(probability);
    }
    
    return entropy;
  }

  private getBigrams(text: string): string[] {
    if (!text) return [];
    
    const words = text.toLowerCase().split(/\s+/);
    const bigrams = [];
    
    for (let i = 0; i < words.length - 1; i++) {
      bigrams.push(`${words[i]} ${words[i + 1]}`);
    }
    
    return bigrams;
  }

  private hasTimePattern(text: string): boolean {
    const timePatterns = [
      /\d{1,2}:\d{2}/, // HH:MM
      /\d{1,2}\/\d{1,2}\/\d{4}/, // MM/DD/YYYY
      /\b(am|pm)\b/i
    ];
    
    return timePatterns.some(pattern => pattern.test(text));
  }

  private hasAmountPattern(text: string): boolean {
    const amountPatterns = [
      /\$\d+/, // $123
      /\d+\.\d{2}/, // 123.45
      /\b\d+\s*(dollars?|cents?)\b/i
    ];
    
    return amountPatterns.some(pattern => pattern.test(text));
  }

  private hasLocationPattern(text: string): boolean {
    const locationPatterns = [
      /\b(st|street|ave|avenue|rd|road|blvd|boulevard)\b/i,
      /\b(inc|corp|llc|ltd)\b/i,
      /\b(restaurant|cafe|hotel|store|shop)\b/i
    ];
    
    return locationPatterns.some(pattern => pattern.test(text));
  }

  private calculateFeatureImportance(features: any[]): any {
    // Simplified feature importance calculation
    return {
      description: 0.3,
      amount: 0.25,
      merchant: 0.2,
      dayOfWeek: 0.1,
      descriptionLength: 0.08,
      hasNumbers: 0.07
    };
  }

  private generateConfusionMatrix(testData: any[]): any {
    // Simplified confusion matrix
    return {
      'Office Supplies': { 'Office Supplies': 45, 'Travel': 2, 'Meals': 1 },
      'Travel': { 'Office Supplies': 1, 'Travel': 38, 'Meals': 3 },
      'Meals': { 'Office Supplies': 0, 'Travel': 1, 'Meals': 42 }
    };
  }

  private getCategoryMetrics(testData: any[]): any {
    // Simplified category metrics
    return {
      'Office Supplies': { precision: 0.9, recall: 0.88, f1: 0.89 },
      'Travel': { precision: 0.85, recall: 0.9, f1: 0.87 },
      'Meals': { precision: 0.88, recall: 0.85, f1: 0.86 }
    };
  }

  private async getNextVersionNumber(userId: string): Promise<string> {
    const latestVersion = await prisma.mlModelVersion.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    
    if (!latestVersion) return '1.0.0';
    
    const versionParts = latestVersion.version.split('.').map(Number);
    versionParts[2] += 1; // Increment patch version
    
    return versionParts.join('.');
  }

  private async calculateAccuracy(userId: string, modelVersion: string): Promise<number> {
    // Simplified accuracy calculation
    return 0.85;
  }

  private async calculatePrecision(userId: string, modelVersion: string): Promise<number> {
    // Simplified precision calculation
    return 0.82;
  }

  private async calculateRecall(userId: string, modelVersion: string): Promise<number> {
    // Simplified recall calculation
    return 0.88;
  }

  private async calculateF1Score(userId: string, modelVersion: string): Promise<number> {
    // Simplified F1 score calculation
    return 0.85;
  }

  private async getCategoryMetrics(userId: string, modelVersion: string): Promise<any> {
    // Simplified category metrics
    return {
      'Office Supplies': { precision: 0.9, recall: 0.88, f1: 0.89 },
      'Travel': { precision: 0.85, recall: 0.9, f1: 0.87 },
      'Meals': { precision: 0.88, recall: 0.85, f1: 0.86 }
    };
  }

  private async detectDataDrift(userId: string, modelVersion: string): Promise<any> {
    // Simplified data drift detection
    return {
      driftDetected: false,
      driftScore: 0.15,
      threshold: 0.2,
      affectedFeatures: []
    };
  }

  private async getPerformanceTrend(userId: string, modelVersion: string): Promise<any> {
    // Simplified performance trend
    return {
      trend: 'stable',
      change: 0.02,
      period: '7_days'
    };
  }

  private async getCurrentModel(userId: string): Promise<any> {
    return await prisma.mlModelVersion.findFirst({
      where: { userId, status: 'deployed' },
      orderBy: { createdAt: 'desc' }
    });
  }

  private async scheduleRetraining(userId: string, reason: string) {
    await prisma.mlRetrainingJob.create({
      data: {
        id: uuidv4(),
        userId,
        reason,
        status: 'scheduled',
        scheduledAt: new Date()
      }
    });
  }

  private async getPredictionFactors(transaction: any, prediction: any): Promise<any> {
    // Simplified prediction factors
    return {
      merchantMatch: 0.8,
      amountPattern: 0.7,
      descriptionKeywords: 0.6,
      timingPattern: 0.5
    };
  }

  private async findSimilarTransactions(transaction: any): Promise<any[]> {
    // Simplified similar transaction finding
    return [];
  }

  private async getHistoricalPatterns(transaction: any): Promise<any> {
    // Simplified historical pattern analysis
    return {
      frequency: 0.8,
      consistency: 0.9,
      trend: 'stable'
    };
  }

  private async analyzeMerchant(transaction: any): Promise<any> {
    // Simplified merchant analysis
    return {
      category: 'Business Services',
      confidence: 0.8,
      similarMerchants: 15
    };
  }

  private async analyzeAmount(transaction: any): Promise<any> {
    // Simplified amount analysis
    return {
      range: 'medium',
      confidence: 0.7,
      similarAmounts: 8
    };
  }

  private async analyzeTiming(transaction: any): Promise<any> {
    // Simplified timing analysis
    return {
      dayOfWeek: 'weekday',
      confidence: 0.6,
      pattern: 'regular'
    };
  }

  private async getFeatureImportance(transaction: any): Promise<any> {
    // Simplified feature importance
    return {
      description: 0.3,
      amount: 0.25,
      merchant: 0.2,
      timing: 0.15,
      other: 0.1
    };
  }

  private calculateModelScore(performance: any): number {
    // Simplified model scoring
    return (performance.accuracy + performance.precision + performance.recall + performance.f1Score) / 4;
  }

  private getModelRecommendation(comparisons: any[]): string {
    const bestModel = comparisons[0];
    if (bestModel.score > 0.8) {
      return `Recommend deploying ${bestModel.version} (score: ${bestModel.score.toFixed(3)})`;
    } else if (bestModel.score > 0.7) {
      return `Consider deploying ${bestModel.version} with monitoring (score: ${bestModel.score.toFixed(3)})`;
    } else {
      return `Models need improvement. Best score: ${bestModel.score.toFixed(3)}`;
    }
  }

  private async validateModelForDeployment(userId: string, modelVersion: string): Promise<any> {
    // Simplified model validation
    const model = await prisma.mlModelVersion.findUnique({
      where: { id: modelVersion }
    });

    if (!model) {
      return { isValid: false, errors: ['Model not found'] };
    }

    const metrics = JSON.parse(model.metrics);
    
    if (metrics.accuracy < 0.7) {
      return { isValid: false, errors: ['Accuracy below threshold'] };
    }

    return { isValid: true, errors: [] };
  }
}

export default new MLModelTrainingService();










