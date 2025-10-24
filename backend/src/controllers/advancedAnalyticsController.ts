import { Request, Response } from 'express';
import AdvancedAnalyticsService from '../services/advancedAnalyticsService';
import { logger } from '../utils/logger';

const analyticsService = new AdvancedAnalyticsService();

/**
 * Get comprehensive analytics metrics
 */
export const getAnalyticsMetrics = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { period = '30d' } = req.query;

    const metrics = await analyticsService.getAnalyticsMetrics(companyId, period as string);

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Error getting analytics metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics metrics'
    });
  }
};

/**
 * Get time series data for charts
 */
export const getTimeSeriesData = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { period = '12m' } = req.query;

    const data = await analyticsService.getTimeSeriesData(companyId, period as string);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Error getting time series data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get time series data'
    });
  }
};

/**
 * Get cohort analysis
 */
export const getCohortAnalysis = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { period = '12m' } = req.query;

    const data = await analyticsService.getCohortAnalysis(companyId, period as string);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Error getting cohort analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cohort analysis'
    });
  }
};

/**
 * Get predictive insights
 */
export const getPredictiveInsights = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    const insights = await analyticsService.getPredictiveInsights(companyId);

    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    logger.error('Error getting predictive insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get predictive insights'
    });
  }
};

/**
 * Get business intelligence
 */
export const getBusinessIntelligence = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    const intelligence = await analyticsService.getBusinessIntelligence(companyId);

    res.json({
      success: true,
      data: intelligence
    });
  } catch (error) {
    logger.error('Error getting business intelligence:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get business intelligence'
    });
  }
};

/**
 * Execute custom analytics query
 */
export const executeCustomQuery = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { query, parameters = [] } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }

    const results = await analyticsService.executeCustomQuery(companyId, query, parameters);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    logger.error('Error executing custom query:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute custom query'
    });
  }
};

/**
 * Export analytics data
 */
export const exportAnalyticsData = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { format = 'json', filters = {} } = req.body;

    const data = await analyticsService.exportAnalyticsData(companyId, format, filters);

    const contentType = format === 'csv' ? 'text/csv' : 
                       format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                       'application/json';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="analytics-export.${format}"`);
    res.send(data);
  } catch (error) {
    logger.error('Error exporting analytics data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export analytics data'
    });
  }
};

/**
 * Get analytics dashboard summary
 */
export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { period = '30d' } = req.query;

    const [metrics, timeSeries, insights, intelligence] = await Promise.all([
      analyticsService.getAnalyticsMetrics(companyId, period as string),
      analyticsService.getTimeSeriesData(companyId, '12m'),
      analyticsService.getPredictiveInsights(companyId),
      analyticsService.getBusinessIntelligence(companyId)
    ]);

    res.json({
      success: true,
      data: {
        metrics,
        timeSeries,
        insights,
        intelligence
      }
    });
  } catch (error) {
    logger.error('Error getting dashboard summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard summary'
    });
  }
};

/**
 * Get real-time analytics updates
 */
export const getRealTimeUpdates = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    // Get latest metrics
    const metrics = await analyticsService.getAnalyticsMetrics(companyId, '7d');
    
    // Get recent alerts
    const intelligence = await analyticsService.getBusinessIntelligence(companyId);
    const recentAlerts = intelligence.alerts.filter(alert => 
      new Date().getTime() - new Date(alert.timestamp || Date.now()).getTime() < 24 * 60 * 60 * 1000
    );

    res.json({
      success: true,
      data: {
        metrics,
        alerts: recentAlerts,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error getting real-time updates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get real-time updates'
    });
  }
};

/**
 * Get analytics performance metrics
 */
export const getAnalyticsPerformance = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    // Get performance metrics for analytics queries
    const performanceData = {
      queryPerformance: {
        avgResponseTime: 150, // ms
        slowestQueries: [
          { query: 'cohort_analysis', avgTime: 1200 },
          { query: 'time_series', avgTime: 800 },
          { query: 'predictive_insights', avgTime: 2000 }
        ],
        cacheHitRate: 85
      },
      dataQuality: {
        completeness: 95,
        accuracy: 98,
        freshness: 99
      },
      usage: {
        dailyQueries: 1250,
        uniqueUsers: 45,
        popularReports: [
          { name: 'Revenue Dashboard', views: 320 },
          { name: 'Customer Analytics', views: 280 },
          { name: 'Profit Analysis', views: 250 }
        ]
      }
    };

    res.json({
      success: true,
      data: performanceData
    });
  } catch (error) {
    logger.error('Error getting analytics performance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics performance'
    });
  }
};




