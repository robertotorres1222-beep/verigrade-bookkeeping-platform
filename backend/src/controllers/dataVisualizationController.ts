import { Request, Response } from 'express';
import DataVisualizationService from '../services/dataVisualizationService';
import { logger } from '../utils/logger';

const dataVisualizationService = new DataVisualizationService();

export class DataVisualizationController {
  /**
   * Create chart configuration
   */
  async createChartConfig(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const chartData = req.body;

      const chart = await dataVisualizationService.createChartConfig(companyId, {
        ...chartData,
        createdBy: req.user?.id
      });

      res.status(201).json({
        success: true,
        data: chart,
        message: 'Chart configuration created successfully'
      });
    } catch (error) {
      logger.error('Error creating chart config:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create chart configuration',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get chart configurations
   */
  async getChartConfigs(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const { type } = req.query;

      const charts = await dataVisualizationService.getChartConfigs(
        companyId,
        type as string
      );

      res.json({
        success: true,
        data: charts,
        message: 'Chart configurations retrieved successfully'
      });
    } catch (error) {
      logger.error('Error getting chart configs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get chart configurations',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create dashboard
   */
  async createDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const dashboardData = req.body;

      const dashboard = await dataVisualizationService.createDashboard(companyId, {
        ...dashboardData,
        createdBy: req.user?.id
      });

      res.status(201).json({
        success: true,
        data: dashboard,
        message: 'Dashboard created successfully'
      });
    } catch (error) {
      logger.error('Error creating dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create dashboard',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get dashboards
   */
  async getDashboards(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;

      const dashboards = await dataVisualizationService.getDashboards(companyId);

      res.json({
        success: true,
        data: dashboards,
        message: 'Dashboards retrieved successfully'
      });
    } catch (error) {
      logger.error('Error getting dashboards:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get dashboards',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Generate chart data
   */
  async generateChartData(req: Request, res: Response): Promise<void> {
    try {
      const { chartId } = req.params;
      const parameters = req.body.parameters || {};

      const chartData = await dataVisualizationService.generateChartData(chartId, parameters);

      res.json({
        success: true,
        data: chartData,
        message: 'Chart data generated successfully'
      });
    } catch (error) {
      logger.error('Error generating chart data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate chart data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create visualization template
   */
  async createVisualizationTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const templateData = req.body;

      const template = await dataVisualizationService.createVisualizationTemplate(companyId, {
        ...templateData,
        createdBy: req.user?.id
      });

      res.status(201).json({
        success: true,
        data: template,
        message: 'Visualization template created successfully'
      });
    } catch (error) {
      logger.error('Error creating visualization template:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create visualization template',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get visualization templates
   */
  async getVisualizationTemplates(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const { category } = req.query;

      const templates = await dataVisualizationService.getVisualizationTemplates(
        companyId,
        category as string
      );

      res.json({
        success: true,
        data: templates,
        message: 'Visualization templates retrieved successfully'
      });
    } catch (error) {
      logger.error('Error getting visualization templates:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get visualization templates',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Export chart as image
   */
  async exportChartAsImage(req: Request, res: Response): Promise<void> {
    try {
      const { chartId } = req.params;
      const { format = 'png', parameters = {} } = req.body;

      const imageBuffer = await dataVisualizationService.exportChartAsImage(chartId, format, parameters);

      res.setHeader('Content-Type', this.getContentType(format));
      res.setHeader('Content-Disposition', `attachment; filename="chart.${format}"`);
      res.send(imageBuffer);
    } catch (error) {
      logger.error('Error exporting chart as image:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export chart as image',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get chart insights
   */
  async getChartInsights(req: Request, res: Response): Promise<void> {
    try {
      const { chartId } = req.params;
      const parameters = req.body.parameters || {};

      const insights = await dataVisualizationService.getChartInsights(chartId, parameters);

      res.json({
        success: true,
        data: insights,
        message: 'Chart insights retrieved successfully'
      });
    } catch (error) {
      logger.error('Error getting chart insights:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get chart insights',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create interactive dashboard
   */
  async createInteractiveDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const dashboardData = req.body;

      const dashboard = await dataVisualizationService.createInteractiveDashboard(companyId, {
        ...dashboardData,
        createdBy: req.user?.id
      });

      res.status(201).json({
        success: true,
        data: dashboard,
        message: 'Interactive dashboard created successfully'
      });
    } catch (error) {
      logger.error('Error creating interactive dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create interactive dashboard',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Share dashboard
   */
  async shareDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { dashboardId } = req.params;
      const shareData = req.body;

      const share = await dataVisualizationService.shareDashboard(dashboardId, {
        ...shareData,
        sharedBy: req.user?.id
      });

      res.status(201).json({
        success: true,
        data: share,
        message: 'Dashboard shared successfully'
      });
    } catch (error) {
      logger.error('Error sharing dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to share dashboard',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get dashboard analytics
   */
  async getDashboardAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { dashboardId } = req.params;

      const analytics = await dataVisualizationService.getDashboardAnalytics(dashboardId);

      res.json({
        success: true,
        data: analytics,
        message: 'Dashboard analytics retrieved successfully'
      });
    } catch (error) {
      logger.error('Error getting dashboard analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get dashboard analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update chart configuration
   */
  async updateChartConfig(req: Request, res: Response): Promise<void> {
    try {
      const { chartId } = req.params;
      const chartData = req.body;

      // This would need to be implemented in the service
      res.json({
        success: true,
        message: 'Chart configuration update functionality not yet implemented'
      });
    } catch (error) {
      logger.error('Error updating chart config:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update chart configuration',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete chart configuration
   */
  async deleteChartConfig(req: Request, res: Response): Promise<void> {
    try {
      const { chartId } = req.params;

      // This would need to be implemented in the service
      res.json({
        success: true,
        message: 'Chart configuration deletion functionality not yet implemented'
      });
    } catch (error) {
      logger.error('Error deleting chart config:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete chart configuration',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get chart configuration by ID
   */
  async getChartConfig(req: Request, res: Response): Promise<void> {
    try {
      const { chartId } = req.params;

      // This would need to be implemented in the service
      res.json({
        success: true,
        message: 'Get chart configuration by ID functionality not yet implemented'
      });
    } catch (error) {
      logger.error('Error getting chart config:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get chart configuration',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Clone chart configuration
   */
  async cloneChartConfig(req: Request, res: Response): Promise<void> {
    try {
      const { chartId } = req.params;
      const { newName } = req.body;

      if (!newName) {
        res.status(400).json({
          success: false,
          message: 'New name is required'
        });
        return;
      }

      // This would need to be implemented in the service
      res.json({
        success: true,
        message: 'Chart configuration cloning functionality not yet implemented'
      });
    } catch (error) {
      logger.error('Error cloning chart config:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clone chart configuration',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private getContentType(format: string): string {
    switch (format) {
      case 'png':
        return 'image/png';
      case 'svg':
        return 'image/svg+xml';
      case 'pdf':
        return 'application/pdf';
      default:
        return 'image/png';
    }
  }
}

export default DataVisualizationController;





