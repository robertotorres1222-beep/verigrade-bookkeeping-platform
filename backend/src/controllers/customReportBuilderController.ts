import { Request, Response } from 'express';
import CustomReportBuilderService from '../services/customReportBuilderService';
import { logger } from '../utils/logger';

const customReportBuilderService = new CustomReportBuilderService();

export class CustomReportBuilderController {
  /**
   * Create report template
   */
  async createReportTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const templateData = req.body;

      const template = await customReportBuilderService.createReportTemplate(companyId, {
        ...templateData,
        createdBy: req.user?.id
      });

      res.status(201).json({
        success: true,
        data: template,
        message: 'Report template created successfully'
      });
    } catch (error) {
      logger.error('Error creating report template:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create report template',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get report templates
   */
  async getReportTemplates(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const { category } = req.query;

      const templates = await customReportBuilderService.getReportTemplates(
        companyId,
        category as string
      );

      res.json({
        success: true,
        data: templates,
        message: 'Report templates retrieved successfully'
      });
    } catch (error) {
      logger.error('Error getting report templates:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get report templates',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create report builder
   */
  async createReportBuilder(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const builderData = req.body;

      const builder = await customReportBuilderService.createReportBuilder(companyId, {
        ...builderData,
        createdBy: req.user?.id
      });

      res.status(201).json({
        success: true,
        data: builder,
        message: 'Report builder created successfully'
      });
    } catch (error) {
      logger.error('Error creating report builder:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create report builder',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get report builders
   */
  async getReportBuilders(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;

      const builders = await customReportBuilderService.getReportBuilders(companyId);

      res.json({
        success: true,
        data: builders,
        message: 'Report builders retrieved successfully'
      });
    } catch (error) {
      logger.error('Error getting report builders:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get report builders',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Add element to report builder
   */
  async addReportElement(req: Request, res: Response): Promise<void> {
    try {
      const { builderId } = req.params;
      const elementData = req.body;

      const element = await customReportBuilderService.addReportElement(builderId, elementData);

      res.status(201).json({
        success: true,
        data: element,
        message: 'Report element added successfully'
      });
    } catch (error) {
      logger.error('Error adding report element:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add report element',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update report element
   */
  async updateReportElement(req: Request, res: Response): Promise<void> {
    try {
      const { elementId } = req.params;
      const elementData = req.body;

      const element = await customReportBuilderService.updateReportElement(elementId, elementData);

      res.json({
        success: true,
        data: element,
        message: 'Report element updated successfully'
      });
    } catch (error) {
      logger.error('Error updating report element:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update report element',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete report element
   */
  async deleteReportElement(req: Request, res: Response): Promise<void> {
    try {
      const { elementId } = req.params;

      await customReportBuilderService.deleteReportElement(elementId);

      res.json({
        success: true,
        message: 'Report element deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting report element:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete report element',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get data sources
   */
  async getDataSources(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;

      const sources = await customReportBuilderService.getDataSources(companyId);

      res.json({
        success: true,
        data: sources,
        message: 'Data sources retrieved successfully'
      });
    } catch (error) {
      logger.error('Error getting data sources:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get data sources',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create data source
   */
  async createDataSource(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const sourceData = req.body;

      const source = await customReportBuilderService.createDataSource(companyId, sourceData);

      res.status(201).json({
        success: true,
        data: source,
        message: 'Data source created successfully'
      });
    } catch (error) {
      logger.error('Error creating data source:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create data source',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get report filters
   */
  async getReportFilters(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;

      const filters = await customReportBuilderService.getReportFilters(companyId);

      res.json({
        success: true,
        data: filters,
        message: 'Report filters retrieved successfully'
      });
    } catch (error) {
      logger.error('Error getting report filters:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get report filters',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create report filter
   */
  async createReportFilter(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const filterData = req.body;

      const filter = await customReportBuilderService.createReportFilter(companyId, filterData);

      res.status(201).json({
        success: true,
        data: filter,
        message: 'Report filter created successfully'
      });
    } catch (error) {
      logger.error('Error creating report filter:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create report filter',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Execute report query
   */
  async executeReportQuery(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const { query, parameters = [] } = req.body;

      if (!query) {
        res.status(400).json({
          success: false,
          message: 'Query is required'
        });
        return;
      }

      const results = await customReportBuilderService.executeReportQuery(companyId, query, parameters);

      res.json({
        success: true,
        data: results,
        message: 'Query executed successfully'
      });
    } catch (error) {
      logger.error('Error executing report query:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to execute report query',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Generate report from builder
   */
  async generateReport(req: Request, res: Response): Promise<void> {
    try {
      const { builderId } = req.params;
      const parameters = req.body.parameters || {};

      const report = await customReportBuilderService.generateReport(builderId, parameters);

      res.json({
        success: true,
        data: report,
        message: 'Report generated successfully'
      });
    } catch (error) {
      logger.error('Error generating report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Export report
   */
  async exportReport(req: Request, res: Response): Promise<void> {
    try {
      const { builderId } = req.params;
      const { format = 'pdf', parameters = {} } = req.body;

      const exportBuffer = await customReportBuilderService.exportReport(builderId, format, parameters);

      res.setHeader('Content-Type', this.getContentType(format));
      res.setHeader('Content-Disposition', `attachment; filename="report.${format}"`);
      res.send(exportBuffer);
    } catch (error) {
      logger.error('Error exporting report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get report preview
   */
  async getReportPreview(req: Request, res: Response): Promise<void> {
    try {
      const { builderId } = req.params;
      const parameters = req.body.parameters || {};

      const preview = await customReportBuilderService.getReportPreview(builderId, parameters);

      res.json({
        success: true,
        data: preview,
        message: 'Report preview generated successfully'
      });
    } catch (error) {
      logger.error('Error getting report preview:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get report preview',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Clone report builder
   */
  async cloneReportBuilder(req: Request, res: Response): Promise<void> {
    try {
      const { builderId } = req.params;
      const { newName } = req.body;

      if (!newName) {
        res.status(400).json({
          success: false,
          message: 'New name is required'
        });
        return;
      }

      const cloned = await customReportBuilderService.cloneReportBuilder(
        builderId,
        newName,
        req.user?.id || ''
      );

      res.status(201).json({
        success: true,
        data: cloned,
        message: 'Report builder cloned successfully'
      });
    } catch (error) {
      logger.error('Error cloning report builder:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clone report builder',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get report builder by ID
   */
  async getReportBuilder(req: Request, res: Response): Promise<void> {
    try {
      const { builderId } = req.params;

      const builders = await customReportBuilderService.getReportBuilders('');
      const builder = builders.find(b => b.id === builderId);

      if (!builder) {
        res.status(404).json({
          success: false,
          message: 'Report builder not found'
        });
        return;
      }

      res.json({
        success: true,
        data: builder,
        message: 'Report builder retrieved successfully'
      });
    } catch (error) {
      logger.error('Error getting report builder:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get report builder',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update report builder
   */
  async updateReportBuilder(req: Request, res: Response): Promise<void> {
    try {
      const { builderId } = req.params;
      const builderData = req.body;

      // This would need to be implemented in the service
      res.json({
        success: true,
        message: 'Report builder update functionality not yet implemented'
      });
    } catch (error) {
      logger.error('Error updating report builder:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update report builder',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete report builder
   */
  async deleteReportBuilder(req: Request, res: Response): Promise<void> {
    try {
      const { builderId } = req.params;

      // This would need to be implemented in the service
      res.json({
        success: true,
        message: 'Report builder deletion functionality not yet implemented'
      });
    } catch (error) {
      logger.error('Error deleting report builder:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete report builder',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private getContentType(format: string): string {
    switch (format) {
      case 'pdf':
        return 'application/pdf';
      case 'excel':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'csv':
        return 'text/csv';
      case 'json':
        return 'application/json';
      default:
        return 'application/octet-stream';
    }
  }
}

export default CustomReportBuilderController;




