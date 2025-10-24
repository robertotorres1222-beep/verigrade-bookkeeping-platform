import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

export interface Report {
  id: string;
  name: string;
  description: string;
  type: 'financial' | 'operational' | 'customer' | 'custom';
  template: ReportTemplate;
  data: ReportData;
  filters: ReportFilter[];
  schedule?: ReportSchedule;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  sections: ReportSection[];
  layout: ReportLayout;
  styling: ReportStyling;
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'chart' | 'table' | 'kpi' | 'text' | 'image';
  data: any;
  config: Record<string, any>;
  position: { x: number; y: number; width: number; height: number };
}

export interface ReportLayout {
  orientation: 'portrait' | 'landscape';
  pageSize: 'A4' | 'Letter' | 'Legal';
  margins: { top: number; right: number; bottom: number; left: number };
  columns: number;
  spacing: number;
}

export interface ReportStyling {
  fontFamily: string;
  fontSize: number;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  theme: 'light' | 'dark' | 'corporate';
}

export interface ReportData {
  source: string;
  query: string;
  parameters: Record<string, any>;
  aggregation: ReportAggregation[];
  grouping: ReportGrouping[];
  sorting: ReportSorting[];
}

export interface ReportAggregation {
  field: string;
  function: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median';
  alias: string;
}

export interface ReportGrouping {
  field: string;
  function: 'year' | 'month' | 'week' | 'day' | 'category' | 'custom';
  alias: string;
}

export interface ReportSorting {
  field: string;
  direction: 'asc' | 'desc';
}

export interface ReportFilter {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
  value: any;
  label: string;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  timezone: string;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv' | 'html';
  enabled: boolean;
}

export interface ReportExecution {
  id: string;
  reportId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  error?: string;
  result?: {
    url: string;
    size: number;
    format: string;
  };
}

export interface ReportBuilder {
  id: string;
  name: string;
  description: string;
  dataSources: DataSource[];
  fields: ReportField[];
  relationships: ReportRelationship[];
  calculatedFields: CalculatedField[];
}

export interface DataSource {
  id: string;
  name: string;
  type: 'table' | 'view' | 'query' | 'api';
  connection: string;
  schema: string;
  table: string;
  fields: DataSourceField[];
}

export interface DataSourceField {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'json';
  nullable: boolean;
  description: string;
}

export interface ReportField {
  id: string;
  name: string;
  label: string;
  type: 'dimension' | 'measure';
  dataType: 'string' | 'number' | 'date' | 'boolean';
  source: string;
  expression?: string;
  format?: string;
  aggregation?: string;
}

export interface ReportRelationship {
  id: string;
  from: string;
  to: string;
  type: 'one_to_one' | 'one_to_many' | 'many_to_one' | 'many_to_many';
  condition: string;
}

export interface CalculatedField {
  id: string;
  name: string;
  expression: string;
  dataType: 'string' | 'number' | 'date' | 'boolean';
  description: string;
}

class AdvancedReportingService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
    logger.info('[AdvancedReportingService] Initialized');
  }

  /**
   * Create a new report
   */
  public async createReport(
    companyId: string,
    name: string,
    description: string,
    type: 'financial' | 'operational' | 'customer' | 'custom',
    template: ReportTemplate,
    data: ReportData,
    filters: ReportFilter[] = []
  ): Promise<Report> {
    try {
      const report = await this.prisma.report.create({
        data: {
          id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          companyId,
          name,
          description,
          type,
          template: template as any,
          data: data as any,
          filters: filters as any,
          isPublic: false
        }
      });

      return {
        id: report.id,
        name: report.name,
        description: report.description,
        type: report.type as any,
        template: report.template as any,
        data: report.data as any,
        filters: report.filters as any,
        isPublic: report.isPublic,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt
      };
    } catch (error: any) {
      logger.error('[AdvancedReportingService] Error creating report:', error);
      throw new Error(`Failed to create report: ${error.message}`);
    }
  }

  /**
   * Get reports for a company
   */
  public async getReports(companyId: string): Promise<Report[]> {
    try {
      const reports = await this.prisma.report.findMany({
        where: { companyId },
        orderBy: { updatedAt: 'desc' }
      });

      return reports.map(report => ({
        id: report.id,
        name: report.name,
        description: report.description,
        type: report.type as any,
        template: report.template as any,
        data: report.data as any,
        filters: report.filters as any,
        isPublic: report.isPublic,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt
      }));
    } catch (error: any) {
      logger.error('[AdvancedReportingService] Error getting reports:', error);
      throw new Error(`Failed to get reports: ${error.message}`);
    }
  }

  /**
   * Execute a report
   */
  public async executeReport(
    reportId: string,
    parameters: Record<string, any> = {}
  ): Promise<ReportExecution> {
    try {
      const report = await this.prisma.report.findUnique({
        where: { id: reportId }
      });

      if (!report) {
        throw new Error('Report not found');
      }

      // Create execution record
      const execution = await this.prisma.reportExecution.create({
        data: {
          id: `execution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          reportId,
          status: 'pending'
        }
      });

      // Start execution in background
      this.executeReportAsync(execution.id, report, parameters);

      return {
        id: execution.id,
        reportId: execution.reportId,
        status: execution.status as any,
        startedAt: execution.startedAt,
        completedAt: execution.completedAt,
        duration: execution.duration,
        error: execution.error,
        result: execution.result as any
      };
    } catch (error: any) {
      logger.error('[AdvancedReportingService] Error executing report:', error);
      throw new Error(`Failed to execute report: ${error.message}`);
    }
  }

  /**
   * Get report execution status
   */
  public async getExecutionStatus(executionId: string): Promise<ReportExecution> {
    try {
      const execution = await this.prisma.reportExecution.findUnique({
        where: { id: executionId }
      });

      if (!execution) {
        throw new Error('Execution not found');
      }

      return {
        id: execution.id,
        reportId: execution.reportId,
        status: execution.status as any,
        startedAt: execution.startedAt,
        completedAt: execution.completedAt,
        duration: execution.duration,
        error: execution.error,
        result: execution.result as any
      };
    } catch (error: any) {
      logger.error('[AdvancedReportingService] Error getting execution status:', error);
      throw new Error(`Failed to get execution status: ${error.message}`);
    }
  }

  /**
   * Schedule a report
   */
  public async scheduleReport(
    reportId: string,
    schedule: ReportSchedule
  ): Promise<void> {
    try {
      await this.prisma.report.update({
        where: { id: reportId },
        data: {
          schedule: schedule as any
        }
      });
    } catch (error: any) {
      logger.error('[AdvancedReportingService] Error scheduling report:', error);
      throw new Error(`Failed to schedule report: ${error.message}`);
    }
  }

  /**
   * Get report templates
   */
  public async getReportTemplates(): Promise<ReportTemplate[]> {
    try {
      const templates = await this.prisma.reportTemplate.findMany({
        orderBy: { name: 'asc' }
      });

      return templates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        sections: template.sections as any,
        layout: template.layout as any,
        styling: template.styling as any
      }));
    } catch (error: any) {
      logger.error('[AdvancedReportingService] Error getting report templates:', error);
      throw new Error(`Failed to get report templates: ${error.message}`);
    }
  }

  /**
   * Create report builder
   */
  public async createReportBuilder(
    companyId: string,
    name: string,
    description: string,
    dataSources: DataSource[],
    fields: ReportField[],
    relationships: ReportRelationship[] = [],
    calculatedFields: CalculatedField[] = []
  ): Promise<ReportBuilder> {
    try {
      const builder = await this.prisma.reportBuilder.create({
        data: {
          id: `builder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          companyId,
          name,
          description,
          dataSources: dataSources as any,
          fields: fields as any,
          relationships: relationships as any,
          calculatedFields: calculatedFields as any
        }
      });

      return {
        id: builder.id,
        name: builder.name,
        description: builder.description,
        dataSources: builder.dataSources as any,
        fields: builder.fields as any,
        relationships: builder.relationships as any,
        calculatedFields: builder.calculatedFields as any
      };
    } catch (error: any) {
      logger.error('[AdvancedReportingService] Error creating report builder:', error);
      throw new Error(`Failed to create report builder: ${error.message}`);
    }
  }

  /**
   * Get report builders
   */
  public async getReportBuilders(companyId: string): Promise<ReportBuilder[]> {
    try {
      const builders = await this.prisma.reportBuilder.findMany({
        where: { companyId },
        orderBy: { updatedAt: 'desc' }
      });

      return builders.map(builder => ({
        id: builder.id,
        name: builder.name,
        description: builder.description,
        dataSources: builder.dataSources as any,
        fields: builder.fields as any,
        relationships: builder.relationships as any,
        calculatedFields: builder.calculatedFields as any
      }));
    } catch (error: any) {
      logger.error('[AdvancedReportingService] Error getting report builders:', error);
      throw new Error(`Failed to get report builders: ${error.message}`);
    }
  }

  /**
   * Generate report data
   */
  public async generateReportData(
    data: ReportData,
    filters: ReportFilter[] = [],
    parameters: Record<string, any> = {}
  ): Promise<any[]> {
    try {
      // Build query based on data configuration
      const query = this.buildQuery(data, filters, parameters);
      
      // Execute query
      const results = await this.executeQuery(query);
      
      // Apply aggregations
      const aggregatedResults = this.applyAggregations(results, data.aggregation);
      
      // Apply grouping
      const groupedResults = this.applyGrouping(aggregatedResults, data.grouping);
      
      // Apply sorting
      const sortedResults = this.applySorting(groupedResults, data.sorting);
      
      return sortedResults;
    } catch (error: any) {
      logger.error('[AdvancedReportingService] Error generating report data:', error);
      throw new Error(`Failed to generate report data: ${error.message}`);
    }
  }

  /**
   * Export report
   */
  public async exportReport(
    reportId: string,
    format: 'pdf' | 'excel' | 'csv' | 'html',
    parameters: Record<string, any> = {}
  ): Promise<{ url: string; size: number; format: string }> {
    try {
      const report = await this.prisma.report.findUnique({
        where: { id: reportId }
      });

      if (!report) {
        throw new Error('Report not found');
      }

      // Generate report data
      const data = await this.generateReportData(
        report.data as any,
        report.filters as any,
        parameters
      );

      // Generate export file
      const exportResult = await this.generateExportFile(data, format, report.template as any);

      return exportResult;
    } catch (error: any) {
      logger.error('[AdvancedReportingService] Error exporting report:', error);
      throw new Error(`Failed to export report: ${error.message}`);
    }
  }

  /**
   * Share report
   */
  public async shareReport(
    reportId: string,
    recipients: string[],
    permissions: 'view' | 'edit' | 'admin',
    expiresAt?: Date
  ): Promise<{ shareUrl: string; expiresAt?: Date }> {
    try {
      const shareToken = this.generateShareToken();
      
      await this.prisma.reportShare.create({
        data: {
          id: `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          reportId,
          shareToken,
          recipients: recipients as any,
          permissions,
          expiresAt
        }
      });

      const shareUrl = `${process.env.FRONTEND_URL}/reports/shared/${shareToken}`;
      
      return {
        shareUrl,
        expiresAt
      };
    } catch (error: any) {
      logger.error('[AdvancedReportingService] Error sharing report:', error);
      throw new Error(`Failed to share report: ${error.message}`);
    }
  }

  // Helper methods
  private async executeReportAsync(
    executionId: string,
    report: any,
    parameters: Record<string, any>
  ): Promise<void> {
    try {
      // Update status to running
      await this.prisma.reportExecution.update({
        where: { id: executionId },
        data: { status: 'running' }
      });

      const startTime = Date.now();

      // Generate report data
      const data = await this.generateReportData(
        report.data,
        report.filters,
        parameters
      );

      // Generate report file
      const result = await this.generateReportFile(data, report.template);

      const duration = Date.now() - startTime;

      // Update execution with results
      await this.prisma.reportExecution.update({
        where: { id: executionId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          duration,
          result: result as any
        }
      });
    } catch (error: any) {
      // Update execution with error
      await this.prisma.reportExecution.update({
        where: { id: executionId },
        data: {
          status: 'failed',
          completedAt: new Date(),
          error: error.message
        }
      });
    }
  }

  private buildQuery(data: ReportData, filters: ReportFilter[], parameters: Record<string, any>): string {
    // Build SQL query based on data configuration
    let query = `SELECT `;
    
    // Add fields
    const fields = data.aggregation.map(agg => `${agg.function}(${agg.field}) as ${agg.alias}`).join(', ');
    query += fields;
    
    // Add FROM clause
    query += ` FROM ${data.source}`;
    
    // Add WHERE clause
    const whereConditions = this.buildWhereConditions(filters, parameters);
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    // Add GROUP BY clause
    if (data.grouping.length > 0) {
      const groupFields = data.grouping.map(group => group.field).join(', ');
      query += ` GROUP BY ${groupFields}`;
    }
    
    // Add ORDER BY clause
    if (data.sorting.length > 0) {
      const sortFields = data.sorting.map(sort => `${sort.field} ${sort.direction}`).join(', ');
      query += ` ORDER BY ${sortFields}`;
    }
    
    return query;
  }

  private buildWhereConditions(filters: ReportFilter[], parameters: Record<string, any>): string[] {
    const conditions: string[] = [];
    
    for (const filter of filters) {
      const value = parameters[filter.field] || filter.value;
      if (value !== undefined && value !== null) {
        let condition = '';
        
        switch (filter.operator) {
          case 'equals':
            condition = `${filter.field} = '${value}'`;
            break;
          case 'not_equals':
            condition = `${filter.field} != '${value}'`;
            break;
          case 'contains':
            condition = `${filter.field} LIKE '%${value}%'`;
            break;
          case 'not_contains':
            condition = `${filter.field} NOT LIKE '%${value}%'`;
            break;
          case 'greater_than':
            condition = `${filter.field} > ${value}`;
            break;
          case 'less_than':
            condition = `${filter.field} < ${value}`;
            break;
          case 'between':
            if (Array.isArray(value) && value.length === 2) {
              condition = `${filter.field} BETWEEN ${value[0]} AND ${value[1]}`;
            }
            break;
          case 'in':
            if (Array.isArray(value)) {
              condition = `${filter.field} IN (${value.map(v => `'${v}'`).join(', ')})`;
            }
            break;
          case 'not_in':
            if (Array.isArray(value)) {
              condition = `${filter.field} NOT IN (${value.map(v => `'${v}'`).join(', ')})`;
            }
            break;
        }
        
        if (condition) {
          conditions.push(condition);
        }
      }
    }
    
    return conditions;
  }

  private async executeQuery(query: string): Promise<any[]> {
    // This would execute the query against the database
    // For now, return mock data
    return [
      { date: '2024-01-01', amount: 1000, category: 'Revenue' },
      { date: '2024-01-02', amount: 1500, category: 'Revenue' },
      { date: '2024-01-03', amount: 800, category: 'Revenue' }
    ];
  }

  private applyAggregations(data: any[], aggregations: ReportAggregation[]): any[] {
    if (aggregations.length === 0) return data;
    
    const result: any = {};
    
    for (const agg of aggregations) {
      const values = data.map(row => row[agg.field]).filter(val => val !== null && val !== undefined);
      
      switch (agg.function) {
        case 'sum':
          result[agg.alias] = values.reduce((sum, val) => sum + val, 0);
          break;
        case 'avg':
          result[agg.alias] = values.reduce((sum, val) => sum + val, 0) / values.length;
          break;
        case 'count':
          result[agg.alias] = values.length;
          break;
        case 'min':
          result[agg.alias] = Math.min(...values);
          break;
        case 'max':
          result[agg.alias] = Math.max(...values);
          break;
        case 'median':
          const sorted = values.sort((a, b) => a - b);
          result[agg.alias] = sorted[Math.floor(sorted.length / 2)];
          break;
      }
    }
    
    return [result];
  }

  private applyGrouping(data: any[], grouping: ReportGrouping[]): any[] {
    if (grouping.length === 0) return data;
    
    // Group data by specified fields
    const groups: Record<string, any[]> = {};
    
    for (const row of data) {
      const key = grouping.map(group => row[group.field]).join('|');
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(row);
    }
    
    return Object.values(groups);
  }

  private applySorting(data: any[], sorting: ReportSorting[]): any[] {
    if (sorting.length === 0) return data;
    
    return data.sort((a, b) => {
      for (const sort of sorting) {
        const aVal = a[sort.field];
        const bVal = b[sort.field];
        
        if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  private async generateReportFile(data: any[], template: ReportTemplate): Promise<{ url: string; size: number; format: string }> {
    // This would generate the actual report file
    // For now, return mock data
    return {
      url: `https://reports.verigrade.com/reports/${Date.now()}.pdf`,
      size: 1024 * 1024, // 1MB
      format: 'pdf'
    };
  }

  private async generateExportFile(data: any[], format: string, template: ReportTemplate): Promise<{ url: string; size: number; format: string }> {
    // This would generate the export file
    // For now, return mock data
    return {
      url: `https://reports.verigrade.com/exports/${Date.now()}.${format}`,
      size: 512 * 1024, // 512KB
      format
    };
  }

  private generateShareToken(): string {
    return Math.random().toString(36).substr(2, 32);
  }
}

export default new AdvancedReportingService();







