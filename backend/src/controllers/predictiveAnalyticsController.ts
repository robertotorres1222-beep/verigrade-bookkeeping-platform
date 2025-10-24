import { Request, Response } from 'express';
import PredictiveAnalyticsService from '../services/predictiveAnalyticsService';
import { logger } from '../utils/logger';

const analyticsService = new PredictiveAnalyticsService();

/**
 * Train ML models for predictions
 */
export const trainModels = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { modelIds } = req.body;

    const models = await analyticsService.trainModels(companyId);

    res.json({
      success: true,
      data: models,
      message: 'Models trained successfully'
    });
  } catch (error) {
    logger.error('Error training models:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to train models'
    });
  }
};

/**
 * Generate revenue forecast
 */
export const generateRevenueForecast = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { periods = 12 } = req.query;

    const forecast = await analyticsService.generateRevenueForecast(
      companyId, 
      parseInt(periods as string)
    );

    res.json({
      success: true,
      data: forecast
    });
  } catch (error) {
    logger.error('Error generating revenue forecast:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate revenue forecast'
    });
  }
};

/**
 * Generate expense forecast
 */
export const generateExpenseForecast = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { periods = 12 } = req.query;

    const forecast = await analyticsService.generateExpenseForecast(
      companyId, 
      parseInt(periods as string)
    );

    res.json({
      success: true,
      data: forecast
    });
  } catch (error) {
    logger.error('Error generating expense forecast:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate expense forecast'
    });
  }
};

/**
 * Generate cash flow forecast
 */
export const generateCashFlowForecast = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { periods = 12 } = req.query;

    const forecast = await analyticsService.generateCashFlowForecast(
      companyId, 
      parseInt(periods as string)
    );

    res.json({
      success: true,
      data: forecast
    });
  } catch (error) {
    logger.error('Error generating cash flow forecast:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate cash flow forecast'
    });
  }
};

/**
 * Predict customer churn
 */
export const predictCustomerChurn = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    const predictions = await analyticsService.predictCustomerChurn(companyId);

    res.json({
      success: true,
      data: predictions
    });
  } catch (error) {
    logger.error('Error predicting customer churn:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to predict customer churn'
    });
  }
};

/**
 * Perform customer segmentation
 */
export const performCustomerSegmentation = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    const segments = await analyticsService.performCustomerSegmentation(companyId);

    res.json({
      success: true,
      data: segments
    });
  } catch (error) {
    logger.error('Error performing customer segmentation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform customer segmentation'
    });
  }
};

/**
 * Detect anomalies
 */
export const detectAnomalies = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { metric, days = 30 } = req.query;

    if (!metric) {
      return res.status(400).json({
        success: false,
        error: 'Metric parameter is required'
      });
    }

    const anomalies = await analyticsService.detectAnomalies(
      companyId, 
      metric as string, 
      parseInt(days as string)
    );

    res.json({
      success: true,
      data: anomalies
    });
  } catch (error) {
    logger.error('Error detecting anomalies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to detect anomalies'
    });
  }
};

/**
 * Get model performance metrics
 */
export const getModelPerformance = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    const performance = await analyticsService.getModelPerformance(companyId);

    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    logger.error('Error getting model performance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get model performance'
    });
  }
};

/**
 * Retrain models
 */
export const retrainModels = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { modelIds } = req.body;

    const models = await analyticsService.retrainModels(companyId, modelIds);

    res.json({
      success: true,
      data: models,
      message: 'Models retrained successfully'
    });
  } catch (error) {
    logger.error('Error retraining models:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrain models'
    });
  }
};

/**
 * Get comprehensive predictions dashboard
 */
export const getPredictionsDashboard = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { periods = 12 } = req.query;

    const [revenueForecast, expenseForecast, cashFlowForecast, churnPredictions, segments, anomalies] = await Promise.all([
      analyticsService.generateRevenueForecast(companyId, parseInt(periods as string)),
      analyticsService.generateExpenseForecast(companyId, parseInt(periods as string)),
      analyticsService.generateCashFlowForecast(companyId, parseInt(periods as string)),
      analyticsService.predictCustomerChurn(companyId),
      analyticsService.performCustomerSegmentation(companyId),
      analyticsService.detectAnomalies(companyId, 'revenue', 30)
    ]);

    res.json({
      success: true,
      data: {
        forecasts: {
          revenue: revenueForecast,
          expenses: expenseForecast,
          cashFlow: cashFlowForecast
        },
        predictions: {
          churn: churnPredictions,
          segments
        },
        anomalies,
        summary: {
          totalForecasts: 3,
          totalPredictions: churnPredictions.length,
          totalSegments: segments.length,
          totalAnomalies: anomalies.length
        }
      }
    });
  } catch (error) {
    logger.error('Error getting predictions dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get predictions dashboard'
    });
  }
};

/**
 * Get prediction insights
 */
export const getPredictionInsights = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    const [performance, churnPredictions, segments] = await Promise.all([
      analyticsService.getModelPerformance(companyId),
      analyticsService.predictCustomerChurn(companyId),
      analyticsService.performCustomerSegmentation(companyId)
    ]);

    // Calculate insights
    const highRiskCustomers = churnPredictions.filter(p => p.probability > 0.7).length;
    const totalCustomers = churnPredictions.length;
    const churnRiskPercentage = totalCustomers > 0 ? (highRiskCustomers / totalCustomers) * 100 : 0;

    const insights = {
      churnRisk: {
        highRiskCustomers,
        totalCustomers,
        riskPercentage: churnRiskPercentage,
        trend: churnRiskPercentage > 20 ? 'increasing' : churnRiskPercentage < 10 ? 'decreasing' : 'stable'
      },
      segments: {
        total: segments.length,
        highValue: segments.find(s => s.segment === 'High Value')?.customers || 0,
        mediumValue: segments.find(s => s.segment === 'Medium Value')?.customers || 0,
        lowValue: segments.find(s => s.segment === 'Low Value')?.customers || 0
      },
      modelPerformance: {
        overallAccuracy: performance.overallAccuracy,
        modelCount: performance.modelCount,
        lastTraining: performance.lastTraining
      },
      recommendations: [
        churnRiskPercentage > 20 ? 'Implement customer retention strategies' : null,
        segments.length > 0 ? 'Focus on high-value customer segments' : null,
        performance.overallAccuracy < 0.8 ? 'Consider retraining models' : null
      ].filter(Boolean)
    };

    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    logger.error('Error getting prediction insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get prediction insights'
    });
  }
};

/**
 * Export prediction data
 */
export const exportPredictionData = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { format = 'json', type = 'all' } = req.query;

    let data: any = {};

    if (type === 'all' || type === 'forecasts') {
      const [revenue, expenses, cashFlow] = await Promise.all([
        analyticsService.generateRevenueForecast(companyId, 12),
        analyticsService.generateExpenseForecast(companyId, 12),
        analyticsService.generateCashFlowForecast(companyId, 12)
      ]);
      data.forecasts = { revenue, expenses, cashFlow };
    }

    if (type === 'all' || type === 'predictions') {
      const [churn, segments] = await Promise.all([
        analyticsService.predictCustomerChurn(companyId),
        analyticsService.performCustomerSegmentation(companyId)
      ]);
      data.predictions = { churn, segments };
    }

    if (type === 'all' || type === 'anomalies') {
      data.anomalies = await analyticsService.detectAnomalies(companyId, 'revenue', 30);
    }

    const contentType = format === 'csv' ? 'text/csv' : 'application/json';
    const filename = `predictions-${companyId}-${new Date().toISOString().split('T')[0]}.${format}`;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(data);
      res.send(csv);
    } else {
      res.json(data);
    }
  } catch (error) {
    logger.error('Error exporting prediction data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export prediction data'
    });
  }
};

// Helper function to convert data to CSV
function convertToCSV(data: any): string {
  // Simplified CSV conversion
  // In production, use a proper CSV library
  return JSON.stringify(data, null, 2);
}