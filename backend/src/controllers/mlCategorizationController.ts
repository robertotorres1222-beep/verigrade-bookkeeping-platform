import { Request, Response } from 'express';
import { MLCategorizationService } from '../services/mlCategorizationService';
import { logger } from '../utils/logger';

const mlCategorizationService = new MLCategorizationService();

export class MLCategorizationController {
  /**
   * Categorize transaction
   */
  async categorizeTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { transactionId } = req.params;

      if (!transactionId) {
        res.status(400).json({
          success: false,
          message: 'Transaction ID is required'
        });
        return;
      }

      const categorization = await mlCategorizationService.categorizeTransaction(transactionId, companyId);

      res.json({
        success: true,
        data: categorization
      });
    } catch (error) {
      logger.error('Error categorizing transaction:', error);
      res.status(500).json({
        success: false,
        message: 'Error categorizing transaction',
        error: error.message
      });
    }
  }

  /**
   * Provide feedback on categorization
   */
  async provideFeedback(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { categorizationId } = req.params;
      const feedback = req.body;

      if (!categorizationId) {
        res.status(400).json({
          success: false,
          message: 'Categorization ID is required'
        });
        return;
      }

      if (!feedback.feedback || !feedback.correctedCategory) {
        res.status(400).json({
          success: false,
          message: 'Feedback and corrected category are required'
        });
        return;
      }

      const updatedCategorization = await mlCategorizationService.provideFeedback(
        categorizationId, 
        companyId, 
        feedback
      );

      res.json({
        success: true,
        data: updatedCategorization
      });
    } catch (error) {
      logger.error('Error providing feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Error providing feedback',
        error: error.message
      });
    }
  }

  /**
   * Get categorization performance
   */
  async getCategorizationPerformance(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const performance = await mlCategorizationService.getCategorizationPerformance(companyId);

      res.json({
        success: true,
        data: performance
      });
    } catch (error) {
      logger.error('Error getting categorization performance:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting categorization performance',
        error: error.message
      });
    }
  }

  /**
   * Get categorization dashboard
   */
  async getCategorizationDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await mlCategorizationService.getCategorizationDashboard(companyId);

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      logger.error('Error getting categorization dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting categorization dashboard',
        error: error.message
      });
    }
  }

  /**
   * Get recent categorizations
   */
  async getRecentCategorizations(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { limit = '20' } = req.query;

      const dashboard = await mlCategorizationService.getCategorizationDashboard(companyId);
      const recentCategorizations = dashboard.recentCategorizations;

      res.json({
        success: true,
        data: recentCategorizations
      });
    } catch (error) {
      logger.error('Error getting recent categorizations:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting recent categorizations',
        error: error.message
      });
    }
  }

  /**
   * Get top categories
   */
  async getTopCategories(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await mlCategorizationService.getCategorizationDashboard(companyId);
      const topCategories = dashboard.topCategories;

      res.json({
        success: true,
        data: topCategories
      });
    } catch (error) {
      logger.error('Error getting top categories:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting top categories',
        error: error.message
      });
    }
  }

  /**
   * Get accuracy trends
   */
  async getAccuracyTrends(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await mlCategorizationService.getCategorizationDashboard(companyId);
      const accuracyTrends = dashboard.accuracyTrends;

      res.json({
        success: true,
        data: accuracyTrends
      });
    } catch (error) {
      logger.error('Error getting accuracy trends:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting accuracy trends',
        error: error.message
      });
    }
  }

  /**
   * Get categorization statistics
   */
  async getCategorizationStats(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const performance = await mlCategorizationService.getCategorizationPerformance(companyId);
      const stats = performance.metrics;

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error getting categorization stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting categorization stats',
        error: error.message
      });
    }
  }

  /**
   * Get categorization accuracy
   */
  async getCategorizationAccuracy(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const performance = await mlCategorizationService.getCategorizationPerformance(companyId);
      const accuracy = performance.accuracy;

      res.json({
        success: true,
        data: { accuracy }
      });
    } catch (error) {
      logger.error('Error getting categorization accuracy:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting categorization accuracy',
        error: error.message
      });
    }
  }

  /**
   * Get categorization confidence distribution
   */
  async getConfidenceDistribution(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const performance = await mlCategorizationService.getCategorizationPerformance(companyId);
      const avgConfidence = performance.metrics.avg_confidence;

      // Calculate confidence distribution
      const distribution = {
        high: 0,    // > 0.8
        medium: 0,  // 0.5 - 0.8
        low: 0      // < 0.5
      };

      // This would be calculated from actual data in a real implementation
      if (avgConfidence > 0.8) {
        distribution.high = 1;
      } else if (avgConfidence > 0.5) {
        distribution.medium = 1;
      } else {
        distribution.low = 1;
      }

      res.json({
        success: true,
        data: distribution
      });
    } catch (error) {
      logger.error('Error getting confidence distribution:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting confidence distribution',
        error: error.message
      });
    }
  }

  /**
   * Get categorization methods breakdown
   */
  async getCategorizationMethods(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const performance = await mlCategorizationService.getCategorizationPerformance(companyId);
      const methods = {
        ml: performance.metrics.ml_categorizations,
        rules: performance.metrics.rules_categorizations,
        total: performance.metrics.total_categorizations
      };

      res.json({
        success: true,
        data: methods
      });
    } catch (error) {
      logger.error('Error getting categorization methods:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting categorization methods',
        error: error.message
      });
    }
  }

  /**
   * Get categorization feedback summary
   */
  async getFeedbackSummary(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const performance = await mlCategorizationService.getCategorizationPerformance(companyId);
      const feedback = {
        total: performance.metrics.feedback_count,
        correct: performance.metrics.correct_categorizations,
        incorrect: performance.metrics.incorrect_categorizations,
        accuracy: performance.accuracy
      };

      res.json({
        success: true,
        data: feedback
      });
    } catch (error) {
      logger.error('Error getting feedback summary:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting feedback summary',
        error: error.message
      });
    }
  }

  /**
   * Get categorization model performance
   */
  async getModelPerformance(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const performance = await mlCategorizationService.getCategorizationPerformance(companyId);
      const modelPerformance = {
        accuracy: performance.accuracy,
        avgConfidence: performance.metrics.avg_confidence,
        avgFeedbackConfidence: performance.metrics.avg_feedback_confidence,
        totalCategorizations: performance.metrics.total_categorizations,
        feedbackCount: performance.metrics.feedback_count
      };

      res.json({
        success: true,
        data: modelPerformance
      });
    } catch (error) {
      logger.error('Error getting model performance:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting model performance',
        error: error.message
      });
    }
  }

  /**
   * Get categorization insights
   */
  async getCategorizationInsights(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await mlCategorizationService.getCategorizationDashboard(companyId);
      const insights = this.generateInsights(dashboard);

      res.json({
        success: true,
        data: insights
      });
    } catch (error) {
      logger.error('Error getting categorization insights:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting categorization insights',
        error: error.message
      });
    }
  }

  /**
   * Generate categorization insights
   */
  private generateInsights(dashboard: any): any[] {
    const insights = [];

    // Accuracy insight
    if (dashboard.performance.accuracy < 70) {
      insights.push({
        type: 'accuracy',
        priority: 'high',
        title: 'Low Categorization Accuracy',
        description: `Current accuracy is ${dashboard.performance.accuracy.toFixed(1)}%. Consider reviewing categorization rules and providing more feedback.`,
        action: 'Review categorization rules and provide feedback on incorrect categorizations',
        impact: 'High - affects financial reporting accuracy'
      });
    }

    // Confidence insight
    if (dashboard.performance.metrics.avg_confidence < 0.6) {
      insights.push({
        type: 'confidence',
        priority: 'medium',
        title: 'Low Categorization Confidence',
        description: `Average confidence is ${(dashboard.performance.metrics.avg_confidence * 100).toFixed(1)}%. Model may need retraining.`,
        action: 'Provide more feedback to improve model confidence',
        impact: 'Medium - affects categorization reliability'
      });
    }

    // Feedback insight
    if (dashboard.performance.metrics.feedback_count < 50) {
      insights.push({
        type: 'feedback',
        priority: 'medium',
        title: 'Low Feedback Volume',
        description: `Only ${dashboard.performance.metrics.feedback_count} feedback items received. More feedback needed for model improvement.`,
        action: 'Encourage users to provide feedback on categorizations',
        impact: 'Medium - affects model learning and improvement'
      });
    }

    // Method distribution insight
    const mlPercentage = (dashboard.performance.metrics.ml_categorizations / dashboard.performance.metrics.total_categorizations) * 100;
    if (mlPercentage < 30) {
      insights.push({
        type: 'method',
        priority: 'low',
        title: 'Low ML Usage',
        description: `Only ${mlPercentage.toFixed(1)}% of categorizations use ML. Consider improving ML model performance.`,
        action: 'Review ML model performance and retrain if necessary',
        impact: 'Low - affects automation efficiency'
      });
    }

    return insights;
  }
}