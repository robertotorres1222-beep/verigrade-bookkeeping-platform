import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const prisma = new PrismaClient();

export class AIService {
  // Anomaly Detection
  async detectAnomalies(userId: string, dataType: string) {
    try {
      const anomalies = [];

      if (dataType === 'transactions') {
        const transactions = await prisma.transaction.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 100
        });

        // Detect unusual spending patterns
        const spendingAnomalies = await this.detectSpendingAnomalies(transactions);
        anomalies.push(...spendingAnomalies);

        // Detect unusual transaction times
        const timeAnomalies = await this.detectTimeAnomalies(transactions);
        anomalies.push(...timeAnomalies);

        // Detect unusual amounts
        const amountAnomalies = await this.detectAmountAnomalies(transactions);
        anomalies.push(...amountAnomalies);
      }

      return {
        userId,
        dataType,
        anomalies,
        detectedAt: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to detect anomalies: ${error.message}`);
    }
  }

  // Predictive Cash Flow
  async predictCashFlow(userId: string, days: number = 30) {
    try {
      const historicalData = await prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 365 // Last year of data
      });

      // Analyze patterns
      const patterns = await this.analyzeCashFlowPatterns(historicalData);
      
      // Generate predictions
      const predictions = await this.generateCashFlowPredictions(patterns, days);

      return {
        userId,
        predictions,
        confidence: patterns.confidence,
        generatedAt: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to predict cash flow: ${error.message}`);
    }
  }

  // NLP Queries
  async processNLPQuery(userId: string, query: string) {
    try {
      // Parse the natural language query
      const parsedQuery = await this.parseQuery(query);
      
      // Execute the query
      const results = await this.executeQuery(userId, parsedQuery);
      
      return {
        query,
        parsedQuery,
        results,
        processedAt: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to process NLP query: ${error.message}`);
    }
  }

  // Pattern Recognition
  async recognizePatterns(userId: string, dataType: string) {
    try {
      const patterns = [];

      if (dataType === 'expenses') {
        const expenses = await prisma.transaction.findMany({
          where: { userId, type: 'expense' },
          orderBy: { createdAt: 'desc' },
          take: 1000
        });

        // Recognize recurring expenses
        const recurringPatterns = await this.recognizeRecurringExpenses(expenses);
        patterns.push(...recurringPatterns);

        // Recognize seasonal patterns
        const seasonalPatterns = await this.recognizeSeasonalPatterns(expenses);
        patterns.push(...seasonalPatterns);

        // Recognize category patterns
        const categoryPatterns = await this.recognizeCategoryPatterns(expenses);
        patterns.push(...categoryPatterns);
      }

      return {
        userId,
        dataType,
        patterns,
        recognizedAt: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to recognize patterns: ${error.message}`);
    }
  }

  // Model Training Pipeline
  async trainModel(modelType: string, trainingData: any[]) {
    try {
      const modelId = uuidv4();
      
      // Preprocess data
      const processedData = await this.preprocessData(trainingData);
      
      // Train model
      const model = await this.trainModelAlgorithm(modelType, processedData);
      
      // Save model
      await this.saveModel(modelId, model);
      
      return {
        modelId,
        modelType,
        accuracy: model.accuracy,
        trainedAt: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to train model: ${error.message}`);
    }
  }

  // Helper Methods
  private async detectSpendingAnomalies(transactions: any[]) {
    const anomalies = [];
    
    // Calculate average spending
    const totalSpending = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const averageSpending = totalSpending / transactions.length;
    
    // Detect transactions significantly above average
    for (const transaction of transactions) {
      if (Math.abs(transaction.amount) > averageSpending * 3) {
        anomalies.push({
          type: 'HIGH_SPENDING',
          severity: 'HIGH',
          transactionId: transaction.id,
          amount: transaction.amount,
          description: 'Transaction amount significantly above average'
        });
      }
    }
    
    return anomalies;
  }

  private async detectTimeAnomalies(transactions: any[]) {
    const anomalies = [];
    
    // Group transactions by hour
    const hourlySpending = {};
    for (const transaction of transactions) {
      const hour = new Date(transaction.createdAt).getHours();
      if (!hourlySpending[hour]) {
        hourlySpending[hour] = 0;
      }
      hourlySpending[hour] += Math.abs(transaction.amount);
    }
    
    // Detect unusual spending times
    const maxHourlySpending = Math.max(...Object.values(hourlySpending));
    for (const [hour, spending] of Object.entries(hourlySpending)) {
      if (spending > maxHourlySpending * 0.8 && parseInt(hour) < 6) {
        anomalies.push({
          type: 'UNUSUAL_TIME',
          severity: 'MEDIUM',
          hour: parseInt(hour),
          spending,
          description: 'Unusual spending activity during early morning hours'
        });
      }
    }
    
    return anomalies;
  }

  private async detectAmountAnomalies(transactions: any[]) {
    const anomalies = [];
    
    // Calculate amount distribution
    const amounts = transactions.map(t => Math.abs(t.amount)).sort((a, b) => a - b);
    const q1 = amounts[Math.floor(amounts.length * 0.25)];
    const q3 = amounts[Math.floor(amounts.length * 0.75)];
    const iqr = q3 - q1;
    const outlierThreshold = q3 + 1.5 * iqr;
    
    // Detect outliers
    for (const transaction of transactions) {
      if (Math.abs(transaction.amount) > outlierThreshold) {
        anomalies.push({
          type: 'AMOUNT_OUTLIER',
          severity: 'HIGH',
          transactionId: transaction.id,
          amount: transaction.amount,
          description: 'Transaction amount is a statistical outlier'
        });
      }
    }
    
    return anomalies;
  }

  private async analyzeCashFlowPatterns(transactions: any[]) {
    const patterns = {
      daily: {},
      weekly: {},
      monthly: {},
      confidence: 0
    };
    
    // Analyze daily patterns
    for (const transaction of transactions) {
      const day = new Date(transaction.createdAt).getDay();
      if (!patterns.daily[day]) {
        patterns.daily[day] = { count: 0, total: 0 };
      }
      patterns.daily[day].count++;
      patterns.daily[day].total += transaction.amount;
    }
    
    // Calculate confidence based on data consistency
    const totalTransactions = transactions.length;
    const uniqueDays = new Set(transactions.map(t => new Date(t.createdAt).toDateString())).size;
    patterns.confidence = Math.min(uniqueDays / 30, 1); // Confidence based on data coverage
    
    return patterns;
  }

  private async generateCashFlowPredictions(patterns: any, days: number) {
    const predictions = [];
    const today = new Date();
    
    for (let i = 1; i <= days; i++) {
      const futureDate = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      const dayOfWeek = futureDate.getDay();
      
      // Predict based on historical patterns
      const dayPattern = patterns.daily[dayOfWeek];
      const predictedAmount = dayPattern ? dayPattern.total / dayPattern.count : 0;
      
      predictions.push({
        date: futureDate,
        predictedAmount,
        confidence: patterns.confidence
      });
    }
    
    return predictions;
  }

  private async parseQuery(query: string) {
    // Simple query parsing (would use NLP library in production)
    const keywords = {
      'show': 'SELECT',
      'find': 'SELECT',
      'get': 'SELECT',
      'total': 'SUM',
      'average': 'AVG',
      'count': 'COUNT'
    };
    
    const parsedQuery = {
      action: 'SELECT',
      fields: ['*'],
      conditions: [],
      orderBy: null,
      limit: null
    };
    
    // Basic keyword detection
    for (const [keyword, action] of Object.entries(keywords)) {
      if (query.toLowerCase().includes(keyword)) {
        parsedQuery.action = action;
        break;
      }
    }
    
    return parsedQuery;
  }

  private async executeQuery(userId: string, parsedQuery: any) {
    // Execute the parsed query against the database
    // This is a simplified implementation
    return {
      results: [],
      count: 0
    };
  }

  private async recognizeRecurringExpenses(expenses: any[]) {
    const patterns = [];
    
    // Group expenses by description similarity
    const groupedExpenses = {};
    for (const expense of expenses) {
      const key = this.normalizeDescription(expense.description);
      if (!groupedExpenses[key]) {
        groupedExpenses[key] = [];
      }
      groupedExpenses[key].push(expense);
    }
    
    // Find recurring patterns
    for (const [key, expenses] of Object.entries(groupedExpenses)) {
      if (expenses.length >= 3) {
        patterns.push({
          type: 'RECURRING_EXPENSE',
          description: key,
          frequency: this.calculateFrequency(expenses),
          averageAmount: this.calculateAverageAmount(expenses),
          count: expenses.length
        });
      }
    }
    
    return patterns;
  }

  private async recognizeSeasonalPatterns(expenses: any[]) {
    const patterns = [];
    
    // Group expenses by month
    const monthlyExpenses = {};
    for (const expense of expenses) {
      const month = new Date(expense.createdAt).getMonth();
      if (!monthlyExpenses[month]) {
        monthlyExpenses[month] = 0;
      }
      monthlyExpenses[month] += Math.abs(expense.amount);
    }
    
    // Find seasonal patterns
    const months = Object.keys(monthlyExpenses).map(Number);
    const amounts = Object.values(monthlyExpenses);
    
    if (months.length >= 12) {
      patterns.push({
        type: 'SEASONAL_PATTERN',
        months,
        amounts,
        description: 'Seasonal spending pattern detected'
      });
    }
    
    return patterns;
  }

  private async recognizeCategoryPatterns(expenses: any[]) {
    const patterns = [];
    
    // Group expenses by category
    const categoryExpenses = {};
    for (const expense of expenses) {
      const category = expense.category || 'Uncategorized';
      if (!categoryExpenses[category]) {
        categoryExpenses[category] = [];
      }
      categoryExpenses[category].push(expense);
    }
    
    // Find category patterns
    for (const [category, expenses] of Object.entries(categoryExpenses)) {
      if (expenses.length >= 5) {
        patterns.push({
          type: 'CATEGORY_PATTERN',
          category,
          count: expenses.length,
          averageAmount: this.calculateAverageAmount(expenses),
          description: `Frequent spending in ${category} category`
        });
      }
    }
    
    return patterns;
  }

  private async preprocessData(data: any[]) {
    // Clean and normalize data
    return data.map(item => ({
      ...item,
      normalized: true
    }));
  }

  private async trainModelAlgorithm(modelType: string, data: any[]) {
    // Simplified model training
    return {
      type: modelType,
      accuracy: 0.85,
      parameters: {}
    };
  }

  private async saveModel(modelId: string, model: any) {
    // Save model to database or file system
    await prisma.aiModel.create({
      data: {
        id: modelId,
        type: model.type,
        accuracy: model.accuracy,
        parameters: JSON.stringify(model.parameters),
        trainedAt: new Date()
      }
    });
  }

  private normalizeDescription(description: string): string {
    return description.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private calculateFrequency(expenses: any[]): string {
    // Calculate frequency based on time intervals
    const dates = expenses.map(e => new Date(e.createdAt)).sort();
    const intervals = [];
    
    for (let i = 1; i < dates.length; i++) {
      intervals.push(dates[i].getTime() - dates[i-1].getTime());
    }
    
    const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const days = averageInterval / (24 * 60 * 60 * 1000);
    
    if (days <= 7) return 'weekly';
    if (days <= 30) return 'monthly';
    return 'irregular';
  }

  private calculateAverageAmount(expenses: any[]): number {
    const total = expenses.reduce((sum, expense) => sum + Math.abs(expense.amount), 0);
    return total / expenses.length;
  }
}

export default new AIService();