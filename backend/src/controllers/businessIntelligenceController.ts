import { Request, Response } from 'express';
import BusinessIntelligenceService from '../services/businessIntelligenceService';
import { logger } from '../utils/logger';

const biService = new BusinessIntelligenceService();

/**
 * Create a new BI report
 */
export const createReport = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const reportData = req.body;

    const report = await biService.createReport(companyId, reportData);

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('Error creating BI report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create BI report'
    });
  }
};

/**
 * Get BI reports
 */
export const getReports = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { category, type, isPublic } = req.query;

    const filters: any = {};
    if (category) filters.category = category;
    if (type) filters.type = type;
    if (isPublic !== undefined) filters.isPublic = isPublic === 'true';

    const reports = await biService.getReports(companyId, filters);

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    logger.error('Error getting BI reports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get BI reports'
    });
  }
};

/**
 * Create a BI dashboard
 */
export const createDashboard = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const dashboardData = req.body;

    const dashboard = await biService.createDashboard(companyId, dashboardData);

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    logger.error('Error creating BI dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create BI dashboard'
    });
  }
};

/**
 * Get BI dashboards
 */
export const getDashboards = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    const dashboards = await biService.getDashboards(companyId);

    res.json({
      success: true,
      data: dashboards
    });
  } catch (error) {
    logger.error('Error getting BI dashboards:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get BI dashboards'
    });
  }
};

/**
 * Add widget to dashboard
 */
export const addWidget = async (req: Request, res: Response) => {
  try {
    const { dashboardId } = req.params;
    const widgetData = req.body;

    const widget = await biService.addWidget(dashboardId, widgetData);

    res.json({
      success: true,
      data: widget
    });
  } catch (error) {
    logger.error('Error adding widget to dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add widget to dashboard'
    });
  }
};

/**
 * Execute custom BI query
 */
export const executeQuery = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { query, parameters = [] } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }

    const results = await biService.executeQuery(companyId, query, parameters);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    logger.error('Error executing BI query:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute BI query'
    });
  }
};

/**
 * Generate KPI metrics
 */
export const generateKPIs = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    const kpis = await biService.generateKPIs(companyId);

    res.json({
      success: true,
      data: kpis
    });
  } catch (error) {
    logger.error('Error generating KPIs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate KPIs'
    });
  }
};

/**
 * Create BI analysis
 */
export const createAnalysis = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const analysisData = req.body;

    const analysis = await biService.createAnalysis(companyId, analysisData);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    logger.error('Error creating BI analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create BI analysis'
    });
  }
};

/**
 * Get BI analyses
 */
export const getAnalyses = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { type } = req.query;

    const analyses = await biService.getAnalyses(companyId, type as string);

    res.json({
      success: true,
      data: analyses
    });
  } catch (error) {
    logger.error('Error getting BI analyses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get BI analyses'
    });
  }
};

/**
 * Create BI alert
 */
export const createAlert = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const alertData = req.body;

    const alert = await biService.createAlert(companyId, alertData);

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    logger.error('Error creating BI alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create BI alert'
    });
  }
};

/**
 * Get BI alerts
 */
export const getAlerts = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { isActive } = req.query;

    const alerts = await biService.getAlerts(companyId, isActive === 'true');

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    logger.error('Error getting BI alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get BI alerts'
    });
  }
};

/**
 * Check and trigger alerts
 */
export const checkAlerts = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    const triggeredAlerts = await biService.checkAlerts(companyId);

    res.json({
      success: true,
      data: triggeredAlerts
    });
  } catch (error) {
    logger.error('Error checking alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check alerts'
    });
  }
};

/**
 * Generate comprehensive BI insights
 */
export const generateInsights = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    const insights = await biService.generateInsights(companyId);

    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    logger.error('Error generating BI insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate BI insights'
    });
  }
};

/**
 * Export BI data
 */
export const exportBIData = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { format = 'json', type = 'insights' } = req.query;

    const data = await biService.exportBIData(companyId, format as any, type as string);

    const contentType = format === 'csv' ? 'text/csv' : 
                       format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                       'application/json';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="bi-export-${type}.${format}"`);
    res.send(data);
  } catch (error) {
    logger.error('Error exporting BI data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export BI data'
    });
  }
};

/**
 * Get BI dashboard summary
 */
export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    const [kpis, dashboards, alerts, analyses] = await Promise.all([
      biService.generateKPIs(companyId),
      biService.getDashboards(companyId),
      biService.getAlerts(companyId, true),
      biService.getAnalyses(companyId)
    ]);

    const summary = {
      kpis: kpis.slice(0, 6), // Top 6 KPIs
      dashboards: dashboards.slice(0, 5), // Recent 5 dashboards
      activeAlerts: alerts.filter(a => a.isActive).length,
      recentAnalyses: analyses.slice(0, 3), // Latest 3 analyses
      totalReports: await biService.getReports(companyId).then(reports => reports.length)
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    logger.error('Error getting BI dashboard summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get BI dashboard summary'
    });
  }
};

/**
 * Get BI performance metrics
 */
export const getBIPerformance = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    // Get BI performance metrics
    const performance = {
      queryPerformance: {
        avgResponseTime: 250, // ms
        slowestQueries: [
          { query: 'kpi_calculation', avgTime: 1200 },
          { query: 'trend_analysis', avgTime: 800 },
          { query: 'alert_evaluation', avgTime: 400 }
        ],
        cacheHitRate: 75
      },
      dataQuality: {
        completeness: 92,
        accuracy: 96,
        freshness: 98
      },
      usage: {
        dailyQueries: 850,
        uniqueUsers: 25,
        popularReports: [
          { name: 'Financial Dashboard', views: 180 },
          { name: 'Customer Analytics', views: 150 },
          { name: 'Performance Metrics', views: 120 }
        ]
      }
    };

    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    logger.error('Error getting BI performance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get BI performance'
    });
  }
};








