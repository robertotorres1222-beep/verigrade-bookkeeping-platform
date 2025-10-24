import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class MLCategorizationService {
  /**
   * Categorize transaction using ML model
   */
  async categorizeTransaction(transactionId: string, companyId: string): Promise<any> {
    try {
      // Get transaction details
      const transaction = await prisma.transaction.findFirst({
        where: { id: transactionId, companyId },
        include: {
          customer: true,
          vendor: true,
          employee: true
        }
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Extract features for ML model
      const features = this.extractFeatures(transaction);
      
      // Get ML model predictions
      const predictions = await this.getMLPredictions(features, companyId);
      
      // Get rules-based predictions
      const rulesPredictions = await this.getRulesBasedPredictions(transaction, companyId);
      
      // Combine predictions
      const finalPrediction = this.combinePredictions(predictions, rulesPredictions);
      
      // Save categorization result
      const categorization = await this.saveCategorizationResult(
        transactionId, 
        companyId, 
        finalPrediction
      );

      return categorization;
    } catch (error) {
      logger.error('Error categorizing transaction:', error);
      throw error;
    }
  }

  /**
   * Extract features for ML model
   */
  private extractFeatures(transaction: any): any {
    const features = {
      // Transaction features
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description || '',
      
      // Customer features
      customerName: transaction.customer?.name || '',
      customerEmail: transaction.customer?.email || '',
      
      // Vendor features
      vendorName: transaction.vendor?.name || '',
      vendorEmail: transaction.vendor?.email || '',
      
      // Employee features
      employeeName: transaction.employee?.name || '',
      employeeDepartment: transaction.employee?.department || '',
      
      // Date features
      dayOfWeek: new Date(transaction.createdAt).getDay(),
      dayOfMonth: new Date(transaction.createdAt).getDate(),
      month: new Date(transaction.createdAt).getMonth() + 1,
      hour: new Date(transaction.createdAt).getHours(),
      
      // Amount features
      amountRounded: Math.round(transaction.amount),
      amountDecimal: transaction.amount % 1,
      amountMagnitude: Math.floor(Math.log10(Math.abs(transaction.amount)) + 1),
      
      // Text features
      descriptionLength: (transaction.description || '').length,
      descriptionWords: (transaction.description || '').split(' ').length,
      hasNumbers: /\d/.test(transaction.description || ''),
      hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(transaction.description || ''),
      
      // Pattern features
      isRoundNumber: transaction.amount % 1 === 0,
      isNegative: transaction.amount < 0,
      isZero: transaction.amount === 0
    };

    return features;
  }

  /**
   * Get ML model predictions
   */
  private async getMLPredictions(features: any, companyId: string): Promise<any> {
    try {
      // Get company's ML model
      const mlModel = await prisma.mlModel.findFirst({
        where: { 
          companyId,
          modelType: 'categorization',
          isActive: true
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!mlModel) {
        // Return default predictions if no model exists
        return this.getDefaultPredictions();
      }

      // Simulate ML model prediction (in real implementation, this would call the actual ML service)
      const predictions = await this.simulateMLPrediction(features, mlModel);
      
      return predictions;
    } catch (error) {
      logger.error('Error getting ML predictions:', error);
      return this.getDefaultPredictions();
    }
  }

  /**
   * Simulate ML model prediction
   */
  private async simulateMLPrediction(features: any, mlModel: any): Promise<any> {
    // This is a simplified simulation - in reality, this would call a trained ML model
    const categories = await this.getAvailableCategories(mlModel.companyId);
    
    // Simple rule-based prediction for demonstration
    let predictedCategory = 'Uncategorized';
    let confidence = 0.5;
    
    // Amount-based rules
    if (features.amount > 1000) {
      predictedCategory = 'Large Transaction';
      confidence = 0.8;
    } else if (features.amount < 100) {
      predictedCategory = 'Small Transaction';
      confidence = 0.7;
    }
    
    // Description-based rules
    if (features.description.toLowerCase().includes('office')) {
      predictedCategory = 'Office Supplies';
      confidence = 0.9;
    } else if (features.description.toLowerCase().includes('travel')) {
      predictedCategory = 'Travel';
      confidence = 0.85;
    } else if (features.description.toLowerCase().includes('software')) {
      predictedCategory = 'Software';
      confidence = 0.9;
    }
    
    // Vendor-based rules
    if (features.vendorName.toLowerCase().includes('amazon')) {
      predictedCategory = 'Office Supplies';
      confidence = 0.8;
    } else if (features.vendorName.toLowerCase().includes('uber')) {
      predictedCategory = 'Transportation';
      confidence = 0.9;
    }
    
    return {
      category: predictedCategory,
      confidence: confidence,
      modelVersion: mlModel.version,
      modelId: mlModel.id,
      features: features
    };
  }

  /**
   * Get rules-based predictions
   */
  private async getRulesBasedPredictions(transaction: any, companyId: string): Promise<any> {
    try {
      const rules = await prisma.categorizationRule.findMany({
        where: { 
          companyId,
          isActive: true
        },
        orderBy: { priority: 'desc' }
      });

      for (const rule of rules) {
        if (this.evaluateRule(transaction, rule)) {
          return {
            category: rule.category,
            confidence: rule.confidence,
            ruleId: rule.id,
            ruleName: rule.name
          };
        }
      }

      return {
        category: 'Uncategorized',
        confidence: 0.1,
        ruleId: null,
        ruleName: 'Default'
      };
    } catch (error) {
      logger.error('Error getting rules-based predictions:', error);
      return {
        category: 'Uncategorized',
        confidence: 0.1,
        ruleId: null,
        ruleName: 'Default'
      };
    }
  }

  /**
   * Evaluate categorization rule
   */
  private evaluateRule(transaction: any, rule: any): boolean {
    try {
      const conditions = rule.conditions;
      
      for (const condition of conditions) {
        const field = condition.field;
        const operator = condition.operator;
        const value = condition.value;
        
        let transactionValue;
        switch (field) {
          case 'amount':
            transactionValue = transaction.amount;
            break;
          case 'description':
            transactionValue = transaction.description || '';
            break;
          case 'type':
            transactionValue = transaction.type;
            break;
          case 'customer_name':
            transactionValue = transaction.customer?.name || '';
            break;
          case 'vendor_name':
            transactionValue = transaction.vendor?.name || '';
            break;
          default:
            continue;
        }
        
        if (!this.evaluateCondition(transactionValue, operator, value)) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      logger.error('Error evaluating rule:', error);
      return false;
    }
  }

  /**
   * Evaluate single condition
   */
  private evaluateCondition(transactionValue: any, operator: string, ruleValue: any): boolean {
    switch (operator) {
      case 'equals':
        return transactionValue === ruleValue;
      case 'not_equals':
        return transactionValue !== ruleValue;
      case 'contains':
        return (transactionValue || '').toLowerCase().includes(ruleValue.toLowerCase());
      case 'not_contains':
        return !(transactionValue || '').toLowerCase().includes(ruleValue.toLowerCase());
      case 'greater_than':
        return Number(transactionValue) > Number(ruleValue);
      case 'less_than':
        return Number(transactionValue) < Number(ruleValue);
      case 'greater_than_or_equal':
        return Number(transactionValue) >= Number(ruleValue);
      case 'less_than_or_equal':
        return Number(transactionValue) <= Number(ruleValue);
      case 'starts_with':
        return (transactionValue || '').toLowerCase().startsWith(ruleValue.toLowerCase());
      case 'ends_with':
        return (transactionValue || '').toLowerCase().endsWith(ruleValue.toLowerCase());
      case 'regex':
        try {
          const regex = new RegExp(ruleValue, 'i');
          return regex.test(transactionValue || '');
        } catch {
          return false;
        }
      default:
        return false;
    }
  }

  /**
   * Combine ML and rules-based predictions
   */
  private combinePredictions(mlPrediction: any, rulesPrediction: any): any {
    // If rules prediction has higher confidence, use it
    if (rulesPrediction.confidence > mlPrediction.confidence) {
      return {
        category: rulesPrediction.category,
        confidence: rulesPrediction.confidence,
        method: 'rules',
        mlPrediction: mlPrediction,
        rulesPrediction: rulesPrediction
      };
    }
    
    // Otherwise, use ML prediction
    return {
      category: mlPrediction.category,
      confidence: mlPrediction.confidence,
      method: 'ml',
      mlPrediction: mlPrediction,
      rulesPrediction: rulesPrediction
    };
  }

  /**
   * Save categorization result
   */
  private async saveCategorizationResult(
    transactionId: string, 
    companyId: string, 
    prediction: any
  ): Promise<any> {
    try {
      const categorization = await prisma.transactionCategorization.create({
        data: {
          transactionId,
          companyId,
          category: prediction.category,
          confidence: prediction.confidence,
          method: prediction.method,
          mlModelId: prediction.mlPrediction?.modelId,
          ruleId: prediction.rulesPrediction?.ruleId,
          features: JSON.stringify(prediction.mlPrediction?.features || {}),
          createdAt: new Date()
        }
      });

      return categorization;
    } catch (error) {
      logger.error('Error saving categorization result:', error);
      throw error;
    }
  }

  /**
   * Get default predictions
   */
  private getDefaultPredictions(): any {
    return {
      category: 'Uncategorized',
      confidence: 0.1,
      modelVersion: '1.0.0',
      modelId: null,
      features: {}
    };
  }

  /**
   * Get available categories
   */
  private async getAvailableCategories(companyId: string): Promise<string[]> {
    try {
      const categories = await prisma.transactionCategorization.findMany({
        where: { companyId },
        select: { category: true },
        distinct: ['category']
      });

      return categories.map(c => c.category);
    } catch (error) {
      logger.error('Error getting available categories:', error);
      return ['Uncategorized'];
    }
  }

  /**
   * Provide feedback on categorization
   */
  async provideFeedback(
    categorizationId: string, 
    companyId: string, 
    feedback: any
  ): Promise<any> {
    try {
      const updatedCategorization = await prisma.transactionCategorization.update({
        where: { 
          id: categorizationId,
          companyId 
        },
        data: {
          userFeedback: feedback.feedback,
          correctedCategory: feedback.correctedCategory,
          feedbackConfidence: feedback.confidence,
          feedbackAt: new Date()
        }
      });

      // Update ML model with feedback
      await this.updateMLModelWithFeedback(categorizationId, companyId, feedback);

      return updatedCategorization;
    } catch (error) {
      logger.error('Error providing feedback:', error);
      throw error;
    }
  }

  /**
   * Update ML model with feedback
   */
  private async updateMLModelWithFeedback(
    categorizationId: string, 
    companyId: string, 
    feedback: any
  ): Promise<void> {
    try {
      // Save feedback for model retraining
      await prisma.mlFeedback.create({
        data: {
          categorizationId,
          companyId,
          feedback: feedback.feedback,
          correctedCategory: feedback.correctedCategory,
          confidence: feedback.confidence,
          createdAt: new Date()
        }
      });

      // Trigger model retraining if enough feedback is collected
      await this.checkAndTriggerModelRetraining(companyId);
    } catch (error) {
      logger.error('Error updating ML model with feedback:', error);
    }
  }

  /**
   * Check and trigger model retraining
   */
  private async checkAndTriggerModelRetraining(companyId: string): Promise<void> {
    try {
      const feedbackCount = await prisma.mlFeedback.count({
        where: { 
          companyId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      });

      // Retrain if we have enough feedback (e.g., 100+ feedback items)
      if (feedbackCount >= 100) {
        await this.triggerModelRetraining(companyId);
      }
    } catch (error) {
      logger.error('Error checking model retraining:', error);
    }
  }

  /**
   * Trigger model retraining
   */
  private async triggerModelRetraining(companyId: string): Promise<void> {
    try {
      // Create retraining job
      await prisma.mlRetrainingJob.create({
        data: {
          companyId,
          modelType: 'categorization',
          status: 'pending',
          createdAt: new Date()
        }
      });

      logger.info(`Model retraining triggered for company ${companyId}`);
    } catch (error) {
      logger.error('Error triggering model retraining:', error);
    }
  }

  /**
   * Get categorization performance metrics
   */
  async getCategorizationPerformance(companyId: string): Promise<any> {
    try {
      const metrics = await prisma.$queryRaw`
        SELECT 
          COUNT(*) as total_categorizations,
          COUNT(CASE WHEN user_feedback IS NOT NULL THEN 1 END) as feedback_count,
          AVG(confidence) as avg_confidence,
          AVG(feedback_confidence) as avg_feedback_confidence,
          COUNT(CASE WHEN method = 'ml' THEN 1 END) as ml_categorizations,
          COUNT(CASE WHEN method = 'rules' THEN 1 END) as rules_categorizations,
          COUNT(CASE WHEN user_feedback = 'correct' THEN 1 END) as correct_categorizations,
          COUNT(CASE WHEN user_feedback = 'incorrect' THEN 1 END) as incorrect_categorizations
        FROM transaction_categorizations
        WHERE company_id = ${companyId}
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      `;

      const categoryDistribution = await prisma.$queryRaw`
        SELECT 
          category,
          COUNT(*) as count,
          AVG(confidence) as avg_confidence
        FROM transaction_categorizations
        WHERE company_id = ${companyId}
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY category
        ORDER BY count DESC
        LIMIT 10
      `;

      const accuracy = await this.calculateAccuracy(companyId);

      return {
        metrics: metrics[0],
        categoryDistribution,
        accuracy
      };
    } catch (error) {
      logger.error('Error getting categorization performance:', error);
      throw error;
    }
  }

  /**
   * Calculate categorization accuracy
   */
  private async calculateAccuracy(companyId: string): Promise<number> {
    try {
      const result = await prisma.$queryRaw`
        SELECT 
          COUNT(CASE WHEN user_feedback = 'correct' THEN 1 END) as correct,
          COUNT(CASE WHEN user_feedback IS NOT NULL THEN 1 END) as total
        FROM transaction_categorizations
        WHERE company_id = ${companyId}
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      `;

      const { correct, total } = result[0] as any;
      return total > 0 ? (correct / total) * 100 : 0;
    } catch (error) {
      logger.error('Error calculating accuracy:', error);
      return 0;
    }
  }

  /**
   * Get categorization dashboard
   */
  async getCategorizationDashboard(companyId: string): Promise<any> {
    try {
      const [
        performance,
        recentCategorizations,
        topCategories,
        accuracyTrends
      ] = await Promise.all([
        this.getCategorizationPerformance(companyId),
        this.getRecentCategorizations(companyId),
        this.getTopCategories(companyId),
        this.getAccuracyTrends(companyId)
      ]);

      return {
        performance,
        recentCategorizations,
        topCategories,
        accuracyTrends
      };
    } catch (error) {
      logger.error('Error getting categorization dashboard:', error);
      throw error;
    }
  }

  /**
   * Get recent categorizations
   */
  private async getRecentCategorizations(companyId: string): Promise<any> {
    try {
      const categorizations = await prisma.transactionCategorization.findMany({
        where: { companyId },
        include: {
          transaction: {
            select: {
              id: true,
              amount: true,
              description: true,
              type: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      });

      return categorizations;
    } catch (error) {
      logger.error('Error getting recent categorizations:', error);
      return [];
    }
  }

  /**
   * Get top categories
   */
  private async getTopCategories(companyId: string): Promise<any> {
    try {
      const categories = await prisma.$queryRaw`
        SELECT 
          category,
          COUNT(*) as count,
          AVG(confidence) as avg_confidence,
          COUNT(CASE WHEN user_feedback = 'correct' THEN 1 END) as correct_count,
          COUNT(CASE WHEN user_feedback = 'incorrect' THEN 1 END) as incorrect_count
        FROM transaction_categorizations
        WHERE company_id = ${companyId}
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY category
        ORDER BY count DESC
        LIMIT 10
      `;

      return categories;
    } catch (error) {
      logger.error('Error getting top categories:', error);
      return [];
    }
  }

  /**
   * Get accuracy trends
   */
  private async getAccuracyTrends(companyId: string): Promise<any> {
    try {
      const trends = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('week', created_at) as week,
          COUNT(*) as total_categorizations,
          COUNT(CASE WHEN user_feedback = 'correct' THEN 1 END) as correct_categorizations,
          AVG(confidence) as avg_confidence
        FROM transaction_categorizations
        WHERE company_id = ${companyId}
        AND created_at >= CURRENT_DATE - INTERVAL '12 weeks'
        GROUP BY DATE_TRUNC('week', created_at)
        ORDER BY week DESC
      `;

      return trends;
    } catch (error) {
      logger.error('Error getting accuracy trends:', error);
      return [];
    }
  }
}