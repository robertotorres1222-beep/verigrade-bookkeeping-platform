import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'financial' | 'operational' | 'customer' | 'inventory' | 'custom';
  layout: any;
  dataSources: string[];
  filters: any[];
  parameters: any[];
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportElement {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'text' | 'image' | 'filter';
  title: string;
  position: { x: number; y: number; width: number; height: number };
  config: any;
  dataSource: string;
  query: string;
  filters: any[];
  styling: any;
}

export interface ReportBuilder {
  id: string;
  name: string;
  description: string;
  layout: any;
  elements: ReportElement[];
  dataSources: string[];
  filters: any[];
  parameters: any[];
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'database' | 'api' | 'file' | 'calculated';
  connection: any;
  schema: any;
  tables: any[];
  isActive: boolean;
  lastSync: Date;
}

export interface ReportFilter {
  id: string;
  name: string;
  type: 'date' | 'number' | 'text' | 'select' | 'multiselect' | 'boolean';
  field: string;
  operator: string;
  defaultValue: any;
  options: any[];
  required: boolean;
}

export class CustomReportBuilderService {
  /**
   * Create a new report template
   */
  async createReportTemplate(companyId: string, templateData: Partial<ReportTemplate>): Promise<ReportTemplate> {
    try {
      const template = await prisma.$queryRaw`
        INSERT INTO report_templates (
          company_id, name, description, category, type, layout, 
          data_sources, filters, parameters, is_public, created_by
        ) VALUES (
          ${companyId}, ${templateData.name}, ${templateData.description}, 
          ${templateData.category}, ${templateData.type}, ${JSON.stringify(templateData.layout || {})}, 
          ${JSON.stringify(templateData.dataSources || [])}, ${JSON.stringify(templateData.filters || [])}, 
          ${JSON.stringify(templateData.parameters || [])}, ${templateData.isPublic || false}, ${templateData.createdBy}
        ) RETURNING *
      `;

      return template[0] as ReportTemplate;
    } catch (error) {
      logger.error('Error creating report template:', error);
      throw new Error('Failed to create report template');
    }
  }

  /**
   * Get report templates
   */
  async getReportTemplates(companyId: string, category?: string): Promise<ReportTemplate[]> {
    try {
      let query = `
        SELECT * FROM report_templates 
        WHERE company_id = $1
      `;
      const params = [companyId];

      if (category) {
        query += ` AND category = $2`;
        params.push(category);
      }

      query += ` ORDER BY created_at DESC`;

      const templates = await prisma.$queryRawUnsafe(query, ...params);
      return templates as ReportTemplate[];
    } catch (error) {
      logger.error('Error getting report templates:', error);
      throw new Error('Failed to get report templates');
    }
  }

  /**
   * Create a new report builder
   */
  async createReportBuilder(companyId: string, builderData: Partial<ReportBuilder>): Promise<ReportBuilder> {
    try {
      const builder = await prisma.$queryRaw`
        INSERT INTO report_builders (
          company_id, name, description, layout, elements, 
          data_sources, filters, parameters, is_public, created_by
        ) VALUES (
          ${companyId}, ${builderData.name}, ${builderData.description}, 
          ${JSON.stringify(builderData.layout || {})}, ${JSON.stringify(builderData.elements || [])}, 
          ${JSON.stringify(builderData.dataSources || [])}, ${JSON.stringify(builderData.filters || [])}, 
          ${JSON.stringify(builderData.parameters || [])}, ${builderData.isPublic || false}, ${builderData.createdBy}
        ) RETURNING *
      `;

      return builder[0] as ReportBuilder;
    } catch (error) {
      logger.error('Error creating report builder:', error);
      throw new Error('Failed to create report builder');
    }
  }

  /**
   * Get report builders
   */
  async getReportBuilders(companyId: string): Promise<ReportBuilder[]> {
    try {
      const builders = await prisma.$queryRaw`
        SELECT * FROM report_builders 
        WHERE company_id = ${companyId}
        ORDER BY created_at DESC
      `;

      return builders as ReportBuilder[];
    } catch (error) {
      logger.error('Error getting report builders:', error);
      throw new Error('Failed to get report builders');
    }
  }

  /**
   * Add element to report builder
   */
  async addReportElement(builderId: string, elementData: Partial<ReportElement>): Promise<ReportElement> {
    try {
      const element = await prisma.$queryRaw`
        INSERT INTO report_elements (
          builder_id, type, title, position, config, 
          data_source, query, filters, styling
        ) VALUES (
          ${builderId}, ${elementData.type}, ${elementData.title}, 
          ${JSON.stringify(elementData.position || { x: 0, y: 0, width: 4, height: 3 })}, 
          ${JSON.stringify(elementData.config || {})}, ${elementData.dataSource}, 
          ${elementData.query}, ${JSON.stringify(elementData.filters || [])}, 
          ${JSON.stringify(elementData.styling || {})}
        ) RETURNING *
      `;

      return element[0] as ReportElement;
    } catch (error) {
      logger.error('Error adding report element:', error);
      throw new Error('Failed to add report element');
    }
  }

  /**
   * Update report element
   */
  async updateReportElement(elementId: string, elementData: Partial<ReportElement>): Promise<ReportElement> {
    try {
      const element = await prisma.$queryRaw`
        UPDATE report_elements 
        SET 
          type = COALESCE($2, type),
          title = COALESCE($3, title),
          position = COALESCE($4, position),
          config = COALESCE($5, config),
          data_source = COALESCE($6, data_source),
          query = COALESCE($7, query),
          filters = COALESCE($8, filters),
          styling = COALESCE($9, styling),
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      return element[0] as ReportElement;
    } catch (error) {
      logger.error('Error updating report element:', error);
      throw new Error('Failed to update report element');
    }
  }

  /**
   * Delete report element
   */
  async deleteReportElement(elementId: string): Promise<boolean> {
    try {
      await prisma.$queryRaw`
        DELETE FROM report_elements WHERE id = ${elementId}
      `;

      return true;
    } catch (error) {
      logger.error('Error deleting report element:', error);
      throw new Error('Failed to delete report element');
    }
  }

  /**
   * Get data sources
   */
  async getDataSources(companyId: string): Promise<DataSource[]> {
    try {
      const sources = await prisma.$queryRaw`
        SELECT * FROM data_sources 
        WHERE company_id = ${companyId} AND is_active = true
        ORDER BY name
      `;

      return sources as DataSource[];
    } catch (error) {
      logger.error('Error getting data sources:', error);
      throw new Error('Failed to get data sources');
    }
  }

  /**
   * Create data source
   */
  async createDataSource(companyId: string, sourceData: Partial<DataSource>): Promise<DataSource> {
    try {
      const source = await prisma.$queryRaw`
        INSERT INTO data_sources (
          company_id, name, type, connection_config, schema, 
          tables, is_active
        ) VALUES (
          ${companyId}, ${sourceData.name}, ${sourceData.type}, 
          ${JSON.stringify(sourceData.connection || {})}, ${JSON.stringify(sourceData.schema || {})}, 
          ${JSON.stringify(sourceData.tables || [])}, ${sourceData.isActive || true}
        ) RETURNING *
      `;

      return source[0] as DataSource;
    } catch (error) {
      logger.error('Error creating data source:', error);
      throw new Error('Failed to create data source');
    }
  }

  /**
   * Get report filters
   */
  async getReportFilters(companyId: string): Promise<ReportFilter[]> {
    try {
      const filters = await prisma.$queryRaw`
        SELECT * FROM report_filters 
        WHERE company_id = ${companyId}
        ORDER BY name
      `;

      return filters as ReportFilter[];
    } catch (error) {
      logger.error('Error getting report filters:', error);
      throw new Error('Failed to get report filters');
    }
  }

  /**
   * Create report filter
   */
  async createReportFilter(companyId: string, filterData: Partial<ReportFilter>): Promise<ReportFilter> {
    try {
      const filter = await prisma.$queryRaw`
        INSERT INTO report_filters (
          company_id, name, type, field, operator, 
          default_value, options, required
        ) VALUES (
          ${companyId}, ${filterData.name}, ${filterData.type}, 
          ${filterData.field}, ${filterData.operator}, ${JSON.stringify(filterData.defaultValue || null)}, 
          ${JSON.stringify(filterData.options || [])}, ${filterData.required || false}
        ) RETURNING *
      `;

      return filter[0] as ReportFilter;
    } catch (error) {
      logger.error('Error creating report filter:', error);
      throw new Error('Failed to create report filter');
    }
  }

  /**
   * Execute report query
   */
  async executeReportQuery(companyId: string, query: string, parameters: any[] = []): Promise<any[]> {
    try {
      // Validate query for security
      if (!this.isValidReportQuery(query)) {
        throw new Error('Invalid query detected');
      }

      const results = await prisma.$queryRawUnsafe(query, ...parameters);
      return results;
    } catch (error) {
      logger.error('Error executing report query:', error);
      throw new Error('Failed to execute report query');
    }
  }

  /**
   * Generate report from builder
   */
  async generateReport(builderId: string, parameters: any = {}): Promise<any> {
    try {
      const builder = await prisma.$queryRaw`
        SELECT * FROM report_builders WHERE id = ${builderId}
      `;

      if (!builder[0]) {
        throw new Error('Report builder not found');
      }

      const reportData = await this.buildReportData(builder[0] as ReportBuilder, parameters);
      
      return {
        builder: builder[0],
        data: reportData,
        generatedAt: new Date(),
        parameters
      };
    } catch (error) {
      logger.error('Error generating report:', error);
      throw new Error('Failed to generate report');
    }
  }

  /**
   * Export report
   */
  async exportReport(builderId: string, format: 'pdf' | 'excel' | 'csv' | 'json', parameters: any = {}): Promise<Buffer> {
    try {
      const report = await this.generateReport(builderId, parameters);
      
      switch (format) {
        case 'pdf':
          return this.exportToPDF(report);
        case 'excel':
          return this.exportToExcel(report);
        case 'csv':
          return this.exportToCSV(report);
        case 'json':
          return Buffer.from(JSON.stringify(report, null, 2));
        default:
          throw new Error('Unsupported export format');
      }
    } catch (error) {
      logger.error('Error exporting report:', error);
      throw new Error('Failed to export report');
    }
  }

  /**
   * Get report builder preview
   */
  async getReportPreview(builderId: string, parameters: any = {}): Promise<any> {
    try {
      const builder = await prisma.$queryRaw`
        SELECT * FROM report_builders WHERE id = ${builderId}
      `;

      if (!builder[0]) {
        throw new Error('Report builder not found');
      }

      // Generate preview data (limited results)
      const previewData = await this.buildReportPreview(builder[0] as ReportBuilder, parameters);
      
      return {
        builder: builder[0],
        preview: previewData,
        generatedAt: new Date()
      };
    } catch (error) {
      logger.error('Error getting report preview:', error);
      throw new Error('Failed to get report preview');
    }
  }

  /**
   * Clone report builder
   */
  async cloneReportBuilder(builderId: string, newName: string, createdBy: string): Promise<ReportBuilder> {
    try {
      const original = await prisma.$queryRaw`
        SELECT * FROM report_builders WHERE id = ${builderId}
      `;

      if (!original[0]) {
        throw new Error('Report builder not found');
      }

      const cloned = await prisma.$queryRaw`
        INSERT INTO report_builders (
          company_id, name, description, layout, elements, 
          data_sources, filters, parameters, is_public, created_by
        ) VALUES (
          (SELECT company_id FROM report_builders WHERE id = ${builderId}),
          ${newName}, 
          (SELECT description FROM report_builders WHERE id = ${builderId}) || ' (Cloned)',
          (SELECT layout FROM report_builders WHERE id = ${builderId}),
          (SELECT elements FROM report_builders WHERE id = ${builderId}),
          (SELECT data_sources FROM report_builders WHERE id = ${builderId}),
          (SELECT filters FROM report_builders WHERE id = ${builderId}),
          (SELECT parameters FROM report_builders WHERE id = ${builderId}),
          false, ${createdBy}
        ) RETURNING *
      `;

      return cloned[0] as ReportBuilder;
    } catch (error) {
      logger.error('Error cloning report builder:', error);
      throw new Error('Failed to clone report builder');
    }
  }

  // Private helper methods

  private async buildReportData(builder: ReportBuilder, parameters: any): Promise<any> {
    const reportData: any = {
      elements: [],
      metadata: {
        generatedAt: new Date(),
        parameters,
        builder: {
          id: builder.id,
          name: builder.name,
          description: builder.description
        }
      }
    };

    // Process each element
    for (const element of builder.elements) {
      try {
        const elementData = await this.processElement(element, parameters);
        reportData.elements.push({
          id: element.id,
          type: element.type,
          title: element.title,
          position: element.position,
          data: elementData,
          config: element.config,
          styling: element.styling
        });
      } catch (error) {
        logger.error(`Error processing element ${element.id}:`, error);
        reportData.elements.push({
          id: element.id,
          type: element.type,
          title: element.title,
          position: element.position,
          data: null,
          error: 'Failed to load data'
        });
      }
    }

    return reportData;
  }

  private async buildReportPreview(builder: ReportBuilder, parameters: any): Promise<any> {
    const previewData: any = {
      elements: [],
      metadata: {
        isPreview: true,
        generatedAt: new Date(),
        parameters
      }
    };

    // Process elements with limited data for preview
    for (const element of builder.elements.slice(0, 5)) { // Limit to 5 elements for preview
      try {
        const elementData = await this.processElementPreview(element, parameters);
        previewData.elements.push({
          id: element.id,
          type: element.type,
          title: element.title,
          data: elementData
        });
      } catch (error) {
        logger.error(`Error processing preview element ${element.id}:`, error);
      }
    }

    return previewData;
  }

  private async processElement(element: ReportElement, parameters: any): Promise<any> {
    switch (element.type) {
      case 'chart':
        return await this.processChartElement(element, parameters);
      case 'table':
        return await this.processTableElement(element, parameters);
      case 'metric':
        return await this.processMetricElement(element, parameters);
      case 'text':
        return await this.processTextElement(element, parameters);
      default:
        return { type: element.type, data: null };
    }
  }

  private async processElementPreview(element: ReportElement, parameters: any): Promise<any> {
    // Simplified processing for preview
    return {
      type: element.type,
      preview: true,
      sampleData: this.generateSampleData(element.type)
    };
  }

  private async processChartElement(element: ReportElement, parameters: any): Promise<any> {
    try {
      const results = await this.executeReportQuery('', element.query, parameters);
      return {
        type: 'chart',
        data: results,
        config: element.config
      };
    } catch (error) {
      logger.error('Error processing chart element:', error);
      return { type: 'chart', data: [], error: 'Failed to load chart data' };
    }
  }

  private async processTableElement(element: ReportElement, parameters: any): Promise<any> {
    try {
      const results = await this.executeReportQuery('', element.query, parameters);
      return {
        type: 'table',
        data: results,
        config: element.config
      };
    } catch (error) {
      logger.error('Error processing table element:', error);
      return { type: 'table', data: [], error: 'Failed to load table data' };
    }
  }

  private async processMetricElement(element: ReportElement, parameters: any): Promise<any> {
    try {
      const results = await this.executeReportQuery('', element.query, parameters);
      return {
        type: 'metric',
        data: results[0] || {},
        config: element.config
      };
    } catch (error) {
      logger.error('Error processing metric element:', error);
      return { type: 'metric', data: {}, error: 'Failed to load metric data' };
    }
  }

  private async processTextElement(element: ReportElement, parameters: any): Promise<any> {
    return {
      type: 'text',
      content: element.config.content || '',
      styling: element.styling
    };
  }

  private generateSampleData(type: string): any {
    switch (type) {
      case 'chart':
        return [
          { label: 'Jan', value: 100 },
          { label: 'Feb', value: 150 },
          { label: 'Mar', value: 200 }
        ];
      case 'table':
        return [
          { name: 'Item 1', value: 100 },
          { name: 'Item 2', value: 200 }
        ];
      case 'metric':
        return { value: 1234, label: 'Sample Metric' };
      default:
        return null;
    }
  }

  private isValidReportQuery(query: string): boolean {
    // Basic SQL injection prevention for report queries
    const dangerousPatterns = [
      /DROP\s+TABLE/i,
      /DELETE\s+FROM/i,
      /UPDATE\s+.*\s+SET/i,
      /INSERT\s+INTO/i,
      /ALTER\s+TABLE/i,
      /CREATE\s+TABLE/i,
      /TRUNCATE/i,
      /EXEC\s*\(/i,
      /UNION\s+SELECT/i
    ];

    return !dangerousPatterns.some(pattern => pattern.test(query));
  }

  private exportToPDF(report: any): Buffer {
    // Simplified PDF export
    const content = JSON.stringify(report, null, 2);
    return Buffer.from(content, 'utf8');
  }

  private exportToExcel(report: any): Buffer {
    // Simplified Excel export
    const content = JSON.stringify(report, null, 2);
    return Buffer.from(content, 'utf8');
  }

  private exportToCSV(report: any): Buffer {
    // Simplified CSV export
    const content = JSON.stringify(report, null, 2);
    return Buffer.from(content, 'utf8');
  }
}

export default CustomReportBuilderService;




