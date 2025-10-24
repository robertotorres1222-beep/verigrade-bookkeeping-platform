import { Request, Response } from 'express';
import AdvancedMonitoringService from '../services/advancedMonitoringService';
import { logger } from '../utils/logger';

const advancedMonitoringService = new AdvancedMonitoringService();

export class AdvancedMonitoringController {
  /**
   * Create monitoring dashboard
   */
  async createMonitoringDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const dashboardData = req.body;

      const dashboard = await advancedMonitoringService.createMonitoringDashboard(companyId, {
        ...dashboardData,
        createdBy: req.user?.id
      });

      res.status(201).json({
        success: true,
        data: dashboard,
        message: 'Monitoring dashboard created successfully'
      });
    } catch (error) {
      logger.error('Error creating monitoring dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create monitoring dashboard',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get monitoring dashboards
   */
  async getMonitoringDashboards(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;

      const dashboards = await advancedMonitoringService.getMonitoringDashboards(companyId);

      res.json({
        success: true,
        data: dashboards,
        message: 'Monitoring dashboards retrieved successfully'
      });
    } catch (error) {
      logger.error('Error getting monitoring dashboards:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get monitoring dashboards',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create SLO metric
   */
  async createSLOMetric(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const sloData = req.body;

      const slo = await advancedMonitoringService.createSLOMetric(companyId, sloData);

      res.status(201).json({
        success: true,
        data: slo,
        message: 'SLO metric created successfully'
      });
    } catch (error) {
      logger.error('Error creating SLO metric:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create SLO metric',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get SLO metrics
   */
  async getSLOMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;

      const slos = await advancedMonitoringService.getSLOMetrics(companyId);

      res.json({
        success: true,
        data: slos,
        message: 'SLO metrics retrieved successfully'
      });
    } catch (error) {
      logger.error('Error getting SLO metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get SLO metrics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create alert rule
   */
  async createAlertRule(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const ruleData = req.body;

      const rule = await advancedMonitoringService.createAlertRule(companyId, ruleData);

      res.status(201).json({
        success: true,
        data: rule,
        message: 'Alert rule created successfully'
      });
    } catch (error) {
      logger.error('Error creating alert rule:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create alert rule',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get alert rules
   */
  async getAlertRules(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;

      const rules = await advancedMonitoringService.getAlertRules(companyId);

      res.json({
        success: true,
        data: rules,
        message: 'Alert rules retrieved successfully'
      });
    } catch (error) {
      logger.error('Error getting alert rules:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get alert rules',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create log query
   */
  async createLogQuery(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const queryData = req.body;

      const query = await advancedMonitoringService.createLogQuery(companyId, {
        ...queryData,
        createdBy: req.user?.id
      });

      res.status(201).json({
        success: true,
        data: query,
        message: 'Log query created successfully'
      });
    } catch (error) {
      logger.error('Error creating log query:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create log query',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get log queries
   */
  async getLogQueries(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;

      const queries = await advancedMonitoringService.getLogQueries(companyId);

      res.json({
        success: true,
        data: queries,
        message: 'Log queries retrieved successfully'
      });
    } catch (error) {
      logger.error('Error getting log queries:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get log queries',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Execute log query
   */
  async executeLogQuery(req: Request, res: Response): Promise<void> {
    try {
      const { query, timeRange = '1h' } = req.body;

      if (!query) {
        res.status(400).json({
          success: false,
          message: 'Query is required'
        });
        return;
      }

      const results = await advancedMonitoringService.executeLogQuery(query, timeRange);

      res.json({
        success: true,
        data: results,
        message: 'Log query executed successfully'
      });
    } catch (error) {
      logger.error('Error executing log query:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to execute log query',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const { service, timeRange } = req.query;

      const metrics = await advancedMonitoringService.getPerformanceMetrics(
        companyId,
        service as string,
        timeRange as string
      );

      res.json({
        success: true,
        data: metrics,
        message: 'Performance metrics retrieved successfully'
      });
    } catch (error) {
      logger.error('Error getting performance metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get performance metrics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get monitoring overview
   */
  async getMonitoringOverview(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;

      const overview = await advancedMonitoringService.getMonitoringOverview(companyId);

      res.json({
        success: true,
        data: overview,
        message: 'Monitoring overview retrieved successfully'
      });
    } catch (error) {
      logger.error('Error getting monitoring overview:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get monitoring overview',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get alert history
   */
  async getAlertHistory(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const { timeRange } = req.query;

      const alerts = await advancedMonitoringService.getAlertHistory(
        companyId,
        timeRange as string
      );

      res.json({
        success: true,
        data: alerts,
        message: 'Alert history retrieved successfully'
      });
    } catch (error) {
      logger.error('Error getting alert history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get alert history',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create custom metric
   */
  async createCustomMetric(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const metricData = req.body;

      const metric = await advancedMonitoringService.createCustomMetric(companyId, metricData);

      res.status(201).json({
        success: true,
        data: metric,
        message: 'Custom metric created successfully'
      });
    } catch (error) {
      logger.error('Error creating custom metric:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create custom metric',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get metric data
   */
  async getMetricData(req: Request, res: Response): Promise<void> {
    try {
      const { metricName } = req.params;
      const { timeRange = '1h' } = req.query;

      const data = await advancedMonitoringService.getMetricData(metricName, timeRange as string);

      res.json({
        success: true,
        data: data,
        message: 'Metric data retrieved successfully'
      });
    } catch (error) {
      logger.error('Error getting metric data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get metric data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update SLO status
   */
  async updateSLOStatus(req: Request, res: Response): Promise<void> {
    try {
      const { sloId } = req.params;

      const slo = await advancedMonitoringService.updateSLOStatus(sloId);

      res.json({
        success: true,
        data: slo,
        message: 'SLO status updated successfully'
      });
    } catch (error) {
      logger.error('Error updating SLO status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update SLO status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Trigger alert
   */
  async triggerAlert(req: Request, res: Response): Promise<void> {
    try {
      const { ruleId } = req.params;
      const { metricValue } = req.body;

      if (metricValue === undefined) {
        res.status(400).json({
          success: false,
          message: 'Metric value is required'
        });
        return;
      }

      const alert = await advancedMonitoringService.triggerAlert(ruleId, metricValue);

      res.status(201).json({
        success: true,
        data: alert,
        message: 'Alert triggered successfully'
      });
    } catch (error) {
      logger.error('Error triggering alert:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to trigger alert',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get dashboard by ID
   */
  async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { dashboardId } = req.params;

      // This would need to be implemented in the service
      res.json({
        success: true,
        message: 'Get dashboard by ID functionality not yet implemented'
      });
    } catch (error) {
      logger.error('Error getting dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get dashboard',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update dashboard
   */
  async updateDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { dashboardId } = req.params;
      const dashboardData = req.body;

      // This would need to be implemented in the service
      res.json({
        success: true,
        message: 'Dashboard update functionality not yet implemented'
      });
    } catch (error) {
      logger.error('Error updating dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update dashboard',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete dashboard
   */
  async deleteDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { dashboardId } = req.params;

      // This would need to be implemented in the service
      res.json({
        success: true,
        message: 'Dashboard deletion functionality not yet implemented'
      });
    } catch (error) {
      logger.error('Error deleting dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete dashboard',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default AdvancedMonitoringController;




