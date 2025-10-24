import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface ReportField {
  id: string;
  name: string;
  type: 'string' | 'number' | 'date' | 'currency' | 'percentage' | 'boolean';
  source: string; // table or calculated field
  expression?: string; // for calculated fields
  format?: string; // display format
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'distinct';
}

export interface ReportFilter {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in' | 'is_null' | 'is_not_null';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface ReportGrouping {
  id: string;
  field: string;
  order: 'asc' | 'desc';
  level: number; // for nested grouping
}

export interface ReportSorting {
  id: string;
  field: string;
  order: 'asc' | 'desc';
  priority: number;
}

export interface ReportChart {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'table';
  title: string;
  xAxis?: string;
  yAxis?: string;
  series?: string[];
  config: any;
}

export interface ReportTemplate {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: string;
  isPublic: boolean;
  fields: ReportField[];
  filters: ReportFilter[];
  groupings: ReportGrouping[];
  sorting: ReportSorting[];
  charts: ReportChart[];
  layout: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportInstance {
  id: string;
  templateId: string;
  userId: string;
  name: string;
  parameters: Record<string, any>;
  status: 'draft' | 'running' | 'completed' | 'failed';
  results?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface ReportData {
  columns: string[];
  rows: any[][];
  summary: Record<string, any>;
  metadata: {
    totalRows: number;
    executionTime: number;
    generatedAt: Date;
  };
}

export interface ReportExport {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  filename: string;
  data: Buffer;
  mimeType: string;
}

class ReportBuilderService {
  private templates: Map<string, ReportTemplate> = new Map();
  private instances: Map<string, ReportInstance> = new Map();
  private dataSources: Map<string, any> = new Map();

  constructor() {
    this.initializeDataSources();
  }

  /**
   * Initialize data sources
   */
  private initializeDataSources(): void {
    // In production, this would connect to actual data sources
    this.dataSources.set('transactions', {
      table: 'transactions',
      fields: ['id', 'amount', 'description', 'category', 'date', 'vendor', 'type'],
    });
    this.dataSources.set('invoices', {
      table: 'invoices',
      fields: ['id', 'amount', 'status', 'due_date', 'client_id', 'created_at'],
    });
    this.dataSources.set('customers', {
      table: 'customers',
      fields: ['id', 'name', 'email', 'phone', 'created_at', 'total_spent'],
    });
    this.dataSources.set('products', {
      table: 'products',
      fields: ['id', 'name', 'sku', 'price', 'category', 'stock_quantity'],
    });
  }

  /**
   * Create a new report template
   */
  public async createTemplate(
    userId: string,
    templateData: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ReportTemplate> {
    try {
      const template: ReportTemplate = {
        id: uuidv4(),
        ...templateData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Validate template
      this.validateTemplate(template);

      // Store template
      this.templates.set(template.id, template);

      logger.info(`Created report template: ${template.name}`);
      return template;
    } catch (error) {
      logger.error('Error creating report template:', error);
      throw error;
    }
  }

  /**
   * Validate report template
   */
  private validateTemplate(template: ReportTemplate): void {
    if (!template.name || !template.description) {
      throw new Error('Template name and description are required');
    }

    if (!template.fields || template.fields.length === 0) {
      throw new Error('Template must have at least one field');
    }

    // Validate fields
    for (const field of template.fields) {
      if (!field.name || !field.type || !field.source) {
        throw new Error('All fields must have name, type, and source');
      }
    }

    // Validate filters
    for (const filter of template.filters) {
      if (!filter.field || !filter.operator) {
        throw new Error('All filters must have field and operator');
      }
    }
  }

  /**
   * Update report template
   */
  public async updateTemplate(
    templateId: string,
    updates: Partial<ReportTemplate>
  ): Promise<ReportTemplate> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const updatedTemplate = {
      ...template,
      ...updates,
      updatedAt: new Date(),
    };

    // Validate updated template
    this.validateTemplate(updatedTemplate);

    this.templates.set(templateId, updatedTemplate);
    logger.info(`Updated report template: ${templateId}`);
    return updatedTemplate;
  }

  /**
   * Delete report template
   */
  public async deleteTemplate(templateId: string): Promise<void> {
    if (!this.templates.has(templateId)) {
      throw new Error('Template not found');
    }

    this.templates.delete(templateId);
    logger.info(`Deleted report template: ${templateId}`);
  }

  /**
   * Get template by ID
   */
  public async getTemplate(templateId: string): Promise<ReportTemplate | null> {
    return this.templates.get(templateId) || null;
  }

  /**
   * Get templates for user
   */
  public async getTemplates(userId: string, includePublic: boolean = true): Promise<ReportTemplate[]> {
    const userTemplates = Array.from(this.templates.values()).filter(template => 
      template.userId === userId || (includePublic && template.isPublic)
    );

    return userTemplates.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  /**
   * Execute report
   */
  public async executeReport(
    templateId: string,
    userId: string,
    parameters: Record<string, any> = {}
  ): Promise<ReportInstance> {
    try {
      const template = this.templates.get(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      const instance: ReportInstance = {
        id: uuidv4(),
        templateId,
        userId,
        name: `${template.name} - ${new Date().toISOString()}`,
        parameters,
        status: 'running',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.instances.set(instance.id, instance);

      // Execute report asynchronously
      this.executeReportAsync(instance, template).catch(error => {
        logger.error(`Error executing report ${instance.id}:`, error);
        instance.status = 'failed';
        instance.error = error.message;
        instance.updatedAt = new Date();
        this.instances.set(instance.id, instance);
      });

      return instance;
    } catch (error) {
      logger.error('Error executing report:', error);
      throw error;
    }
  }

  /**
   * Execute report asynchronously
   */
  private async executeReportAsync(instance: ReportInstance, template: ReportTemplate): Promise<void> {
    try {
      const startTime = Date.now();

      // Build query based on template
      const query = this.buildQuery(template, instance.parameters);
      
      // Execute query (simulated)
      const results = await this.executeQuery(query);
      
      // Process results
      const processedResults = this.processResults(results, template);
      
      // Update instance
      instance.status = 'completed';
      instance.results = processedResults;
      instance.completedAt = new Date();
      instance.updatedAt = new Date();
      
      this.instances.set(instance.id, instance);
      
      const executionTime = Date.now() - startTime;
      logger.info(`Report ${instance.id} completed in ${executionTime}ms`);
    } catch (error) {
      instance.status = 'failed';
      instance.error = error instanceof Error ? error.message : 'Unknown error';
      instance.updatedAt = new Date();
      this.instances.set(instance.id, instance);
      throw error;
    }
  }

  /**
   * Build query from template
   */
  private buildQuery(template: ReportTemplate, parameters: Record<string, any>): any {
    const query = {
      select: template.fields.map(field => ({
        field: field.name,
        source: field.source,
        aggregation: field.aggregation,
      })),
      from: this.getPrimaryTable(template),
      where: this.buildWhereClause(template.filters, parameters),
      groupBy: template.groupings.map(g => g.field),
      orderBy: template.sorting.map(s => ({
        field: s.field,
        order: s.order,
      })),
    };

    return query;
  }

  /**
   * Get primary table from template
   */
  private getPrimaryTable(template: ReportTemplate): string {
    // Determine primary table from fields
    const sources = template.fields.map(f => f.source);
    const uniqueSources = [...new Set(sources)];
    
    if (uniqueSources.length === 1) {
      return uniqueSources[0];
    }
    
    // Default to transactions if multiple sources
    return 'transactions';
  }

  /**
   * Build WHERE clause from filters
   */
  private buildWhereClause(filters: ReportFilter[], parameters: Record<string, any>): any[] {
    const conditions: any[] = [];
    
    for (const filter of filters) {
      const condition = {
        field: filter.field,
        operator: filter.operator,
        value: this.resolveFilterValue(filter.value, parameters),
        logicalOperator: filter.logicalOperator,
      };
      conditions.push(condition);
    }
    
    return conditions;
  }

  /**
   * Resolve filter value (handle parameters)
   */
  private resolveFilterValue(value: any, parameters: Record<string, any>): any {
    if (typeof value === 'string' && value.startsWith('$')) {
      const paramName = value.substring(1);
      return parameters[paramName] || value;
    }
    return value;
  }

  /**
   * Execute query (simulated)
   */
  private async executeQuery(query: any): Promise<any[]> {
    // In production, this would execute against the actual database
    // For now, we'll simulate some data
    
    const mockData = [
      { id: 1, amount: 100, description: 'Office Supplies', category: 'Expenses', date: '2023-01-01', vendor: 'Staples', type: 'debit' },
      { id: 2, amount: 500, description: 'Client Payment', category: 'Revenue', date: '2023-01-02', vendor: 'ABC Corp', type: 'credit' },
      { id: 3, amount: 75, description: 'Software License', category: 'Expenses', date: '2023-01-03', vendor: 'Microsoft', type: 'debit' },
      { id: 4, amount: 200, description: 'Consulting Fee', category: 'Revenue', date: '2023-01-04', vendor: 'XYZ Inc', type: 'credit' },
      { id: 5, amount: 50, description: 'Meals', category: 'Expenses', date: '2023-01-05', vendor: 'Restaurant', type: 'debit' },
    ];

    // Apply filters
    let filteredData = mockData;
    if (query.where && query.where.length > 0) {
      filteredData = this.applyFilters(mockData, query.where);
    }

    // Apply grouping
    if (query.groupBy && query.groupBy.length > 0) {
      filteredData = this.applyGrouping(filteredData, query.groupBy, query.select);
    }

    // Apply sorting
    if (query.orderBy && query.orderBy.length > 0) {
      filteredData = this.applySorting(filteredData, query.orderBy);
    }

    return filteredData;
  }

  /**
   * Apply filters to data
   */
  private applyFilters(data: any[], filters: any[]): any[] {
    return data.filter(row => {
      let result = true;
      
      for (const filter of filters) {
        const fieldValue = row[filter.field];
        const conditionResult = this.evaluateCondition(fieldValue, filter.operator, filter.value);
        
        if (filter.logicalOperator === 'OR') {
          result = result || conditionResult;
        } else {
          result = result && conditionResult;
        }
      }
      
      return result;
    });
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(fieldValue: any, operator: string, value: any): boolean {
    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'not_equals':
        return fieldValue !== value;
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
      case 'not_contains':
        return !String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
      case 'greater_than':
        return Number(fieldValue) > Number(value);
      case 'less_than':
        return Number(fieldValue) < Number(value);
      case 'between':
        return Array.isArray(value) && fieldValue >= value[0] && fieldValue <= value[1];
      case 'in':
        return Array.isArray(value) && value.includes(fieldValue);
      case 'not_in':
        return Array.isArray(value) && !value.includes(fieldValue);
      case 'is_null':
        return fieldValue === null || fieldValue === undefined;
      case 'is_not_null':
        return fieldValue !== null && fieldValue !== undefined;
      default:
        return false;
    }
  }

  /**
   * Apply grouping to data
   */
  private applyGrouping(data: any[], groupBy: string[], select: any[]): any[] {
    const groups = new Map();
    
    for (const row of data) {
      const key = groupBy.map(field => row[field]).join('|');
      
      if (!groups.has(key)) {
        groups.set(key, { ...row });
      } else {
        const group = groups.get(key);
        
        // Apply aggregations
        for (const field of select) {
          if (field.aggregation) {
            group[field.field] = this.applyAggregation(
              group[field.field],
              row[field.field],
              field.aggregation
            );
          }
        }
      }
    }
    
    return Array.from(groups.values());
  }

  /**
   * Apply aggregation
   */
  private applyAggregation(current: any, newValue: any, aggregation: string): any {
    switch (aggregation) {
      case 'sum':
        return (current || 0) + (newValue || 0);
      case 'avg':
        return (current || 0) + (newValue || 0); // Simplified - would need count tracking
      case 'count':
        return (current || 0) + 1;
      case 'min':
        return current === undefined ? newValue : Math.min(current, newValue);
      case 'max':
        return current === undefined ? newValue : Math.max(current, newValue);
      case 'distinct':
        return current; // Simplified - would need set tracking
      default:
        return newValue;
    }
  }

  /**
   * Apply sorting to data
   */
  private applySorting(data: any[], orderBy: any[]): any[] {
    return data.sort((a, b) => {
      for (const sort of orderBy) {
        const aValue = a[sort.field];
        const bValue = b[sort.field];
        
        if (aValue < bValue) return sort.order === 'asc' ? -1 : 1;
        if (aValue > bValue) return sort.order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  /**
   * Process results
   */
  private processResults(results: any[], template: ReportTemplate): ReportData {
    const columns = template.fields.map(field => field.name);
    const rows = results.map(row => 
      template.fields.map(field => row[field.name])
    );
    
    const summary = this.calculateSummary(results, template);
    
    return {
      columns,
      rows,
      summary,
      metadata: {
        totalRows: results.length,
        executionTime: 0, // Would be calculated from actual execution
        generatedAt: new Date(),
      },
    };
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(results: any[], template: ReportTemplate): Record<string, any> {
    const summary: Record<string, any> = {};
    
    for (const field of template.fields) {
      if (field.type === 'number' || field.type === 'currency') {
        const values = results.map(row => Number(row[field.name])).filter(v => !isNaN(v));
        
        if (values.length > 0) {
          summary[field.name] = {
            sum: values.reduce((a, b) => a + b, 0),
            avg: values.reduce((a, b) => a + b, 0) / values.length,
            min: Math.min(...values),
            max: Math.max(...values),
            count: values.length,
          };
        }
      }
    }
    
    return summary;
  }

  /**
   * Get report instance
   */
  public async getReportInstance(instanceId: string): Promise<ReportInstance | null> {
    return this.instances.get(instanceId) || null;
  }

  /**
   * Get report instances for user
   */
  public async getReportInstances(userId: string): Promise<ReportInstance[]> {
    const userInstances = Array.from(this.instances.values()).filter(instance => 
      instance.userId === userId
    );

    return userInstances.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Export report
   */
  public async exportReport(
    instanceId: string,
    format: 'pdf' | 'excel' | 'csv' | 'json'
  ): Promise<ReportExport> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error('Report instance not found');
    }

    if (instance.status !== 'completed') {
      throw new Error('Report not completed');
    }

    const results = instance.results;
    if (!results) {
      throw new Error('No results available');
    }

    const filename = `${instance.name}.${format}`;
    const data = this.formatDataForExport(results, format);
    const mimeType = this.getMimeType(format);

    return {
      format,
      filename,
      data,
      mimeType,
    };
  }

  /**
   * Format data for export
   */
  private formatDataForExport(results: ReportData, format: string): Buffer {
    switch (format) {
      case 'csv':
        return this.formatAsCSV(results);
      case 'json':
        return this.formatAsJSON(results);
      case 'excel':
        return this.formatAsExcel(results);
      case 'pdf':
        return this.formatAsPDF(results);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Format as CSV
   */
  private formatAsCSV(results: ReportData): Buffer {
    const lines: string[] = [];
    
    // Header
    lines.push(results.columns.join(','));
    
    // Data rows
    for (const row of results.rows) {
      lines.push(row.map(cell => `"${cell}"`).join(','));
    }
    
    return Buffer.from(lines.join('\n'));
  }

  /**
   * Format as JSON
   */
  private formatAsJSON(results: ReportData): Buffer {
    const data = {
      columns: results.columns,
      rows: results.rows,
      summary: results.summary,
      metadata: results.metadata,
    };
    
    return Buffer.from(JSON.stringify(data, null, 2));
  }

  /**
   * Format as Excel (simplified)
   */
  private formatAsExcel(results: ReportData): Buffer {
    // In production, this would use a library like xlsx
    return Buffer.from('Excel format not implemented');
  }

  /**
   * Format as PDF (simplified)
   */
  private formatAsPDF(results: ReportData): Buffer {
    // In production, this would use a library like puppeteer or jsPDF
    return Buffer.from('PDF format not implemented');
  }

  /**
   * Get MIME type for format
   */
  private getMimeType(format: string): string {
    switch (format) {
      case 'csv':
        return 'text/csv';
      case 'json':
        return 'application/json';
      case 'excel':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'pdf':
        return 'application/pdf';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * Get available data sources
   */
  public async getDataSources(): Promise<any[]> {
    return Array.from(this.dataSources.entries()).map(([name, config]) => ({
      name,
      ...config,
    }));
  }

  /**
   * Get available fields for data source
   */
  public async getDataSourceFields(sourceName: string): Promise<string[]> {
    const source = this.dataSources.get(sourceName);
    if (!source) {
      throw new Error('Data source not found');
    }
    
    return source.fields;
  }
}

export default new ReportBuilderService();