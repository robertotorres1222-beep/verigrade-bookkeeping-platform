import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface ChartConfig {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'heatmap' | 'gauge' | 'funnel' | 'sankey' | 'treemap';
  title: string;
  description: string;
  dataSource: string;
  query: string;
  xAxis: any;
  yAxis: any;
  series: any[];
  colors: string[];
  legend: any;
  tooltip: any;
  animation: any;
  responsive: boolean;
  interactive: boolean;
  exportable: boolean;
  shareable: boolean;
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  layout: any;
  charts: ChartConfig[];
  filters: any[];
  permissions: any;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VisualizationTemplate {
  id: string;
  name: string;
  category: string;
  type: string;
  config: any;
  sampleData: any[];
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface ChartData {
  labels: string[];
  datasets: any[];
  metadata: any;
}

export class DataVisualizationService {
  /**
   * Create a new chart configuration
   */
  async createChartConfig(companyId: string, chartData: Partial<ChartConfig>): Promise<ChartConfig> {
    try {
      const chart = await prisma.$queryRaw`
        INSERT INTO chart_configs (
          company_id, type, title, description, data_source, query,
          x_axis, y_axis, series, colors, legend, tooltip, animation,
          responsive, interactive, exportable, shareable
        ) VALUES (
          ${companyId}, ${chartData.type}, ${chartData.title}, ${chartData.description},
          ${chartData.dataSource}, ${chartData.query}, ${JSON.stringify(chartData.xAxis || {})},
          ${JSON.stringify(chartData.yAxis || {})}, ${JSON.stringify(chartData.series || [])},
          ${JSON.stringify(chartData.colors || [])}, ${JSON.stringify(chartData.legend || {})},
          ${JSON.stringify(chartData.tooltip || {})}, ${JSON.stringify(chartData.animation || {})},
          ${chartData.responsive || true}, ${chartData.interactive || true},
          ${chartData.exportable || true}, ${chartData.shareable || false}
        ) RETURNING *
      `;

      return chart[0] as ChartConfig;
    } catch (error) {
      logger.error('Error creating chart config:', error);
      throw new Error('Failed to create chart configuration');
    }
  }

  /**
   * Get chart configurations
   */
  async getChartConfigs(companyId: string, type?: string): Promise<ChartConfig[]> {
    try {
      let query = `
        SELECT * FROM chart_configs 
        WHERE company_id = $1
      `;
      const params = [companyId];

      if (type) {
        query += ` AND type = $2`;
        params.push(type);
      }

      query += ` ORDER BY created_at DESC`;

      const charts = await prisma.$queryRawUnsafe(query, ...params);
      return charts as ChartConfig[];
    } catch (error) {
      logger.error('Error getting chart configs:', error);
      throw new Error('Failed to get chart configurations');
    }
  }

  /**
   * Create a new dashboard
   */
  async createDashboard(companyId: string, dashboardData: Partial<Dashboard>): Promise<Dashboard> {
    try {
      const dashboard = await prisma.$queryRaw`
        INSERT INTO dashboards (
          company_id, name, description, layout, charts, filters,
          permissions, is_public, created_by
        ) VALUES (
          ${companyId}, ${dashboardData.name}, ${dashboardData.description},
          ${JSON.stringify(dashboardData.layout || {})}, ${JSON.stringify(dashboardData.charts || [])},
          ${JSON.stringify(dashboardData.filters || [])}, ${JSON.stringify(dashboardData.permissions || {})},
          ${dashboardData.isPublic || false}, ${dashboardData.createdBy}
        ) RETURNING *
      `;

      return dashboard[0] as Dashboard;
    } catch (error) {
      logger.error('Error creating dashboard:', error);
      throw new Error('Failed to create dashboard');
    }
  }

  /**
   * Get dashboards
   */
  async getDashboards(companyId: string): Promise<Dashboard[]> {
    try {
      const dashboards = await prisma.$queryRaw`
        SELECT * FROM dashboards 
        WHERE company_id = ${companyId}
        ORDER BY created_at DESC
      `;

      return dashboards as Dashboard[];
    } catch (error) {
      logger.error('Error getting dashboards:', error);
      throw new Error('Failed to get dashboards');
    }
  }

  /**
   * Generate chart data
   */
  async generateChartData(chartId: string, parameters: any = {}): Promise<ChartData> {
    try {
      const chart = await prisma.$queryRaw`
        SELECT * FROM chart_configs WHERE id = ${chartId}
      `;

      if (!chart[0]) {
        throw new Error('Chart configuration not found');
      }

      const chartConfig = chart[0] as ChartConfig;
      const data = await this.executeChartQuery(chartConfig, parameters);
      
      return {
        labels: data.map((row: any) => row.label || row.name || row.date),
        datasets: this.formatChartData(data, chartConfig),
        metadata: {
          chartId,
          type: chartConfig.type,
          generatedAt: new Date(),
          parameters
        }
      };
    } catch (error) {
      logger.error('Error generating chart data:', error);
      throw new Error('Failed to generate chart data');
    }
  }

  /**
   * Create visualization template
   */
  async createVisualizationTemplate(companyId: string, templateData: Partial<VisualizationTemplate>): Promise<VisualizationTemplate> {
    try {
      const template = await prisma.$queryRaw`
        INSERT INTO visualization_templates (
          company_id, name, category, type, config, sample_data, is_public, created_by
        ) VALUES (
          ${companyId}, ${templateData.name}, ${templateData.category}, ${templateData.type},
          ${JSON.stringify(templateData.config || {})}, ${JSON.stringify(templateData.sampleData || [])},
          ${templateData.isPublic || false}, ${templateData.createdBy}
        ) RETURNING *
      `;

      return template[0] as VisualizationTemplate;
    } catch (error) {
      logger.error('Error creating visualization template:', error);
      throw new Error('Failed to create visualization template');
    }
  }

  /**
   * Get visualization templates
   */
  async getVisualizationTemplates(companyId: string, category?: string): Promise<VisualizationTemplate[]> {
    try {
      let query = `
        SELECT * FROM visualization_templates 
        WHERE company_id = $1 OR is_public = true
      `;
      const params = [companyId];

      if (category) {
        query += ` AND category = $2`;
        params.push(category);
      }

      query += ` ORDER BY created_at DESC`;

      const templates = await prisma.$queryRawUnsafe(query, ...params);
      return templates as VisualizationTemplate[];
    } catch (error) {
      logger.error('Error getting visualization templates:', error);
      throw new Error('Failed to get visualization templates');
    }
  }

  /**
   * Export chart as image
   */
  async exportChartAsImage(chartId: string, format: 'png' | 'svg' | 'pdf' = 'png', parameters: any = {}): Promise<Buffer> {
    try {
      const chartData = await this.generateChartData(chartId, parameters);
      
      // This would integrate with a chart rendering service
      // For now, return a placeholder
      return Buffer.from(JSON.stringify(chartData, null, 2));
    } catch (error) {
      logger.error('Error exporting chart as image:', error);
      throw new Error('Failed to export chart as image');
    }
  }

  /**
   * Get chart insights
   */
  async getChartInsights(chartId: string, parameters: any = {}): Promise<any> {
    try {
      const chartData = await this.generateChartData(chartId, parameters);
      
      return {
        insights: this.generateInsights(chartData),
        recommendations: this.generateRecommendations(chartData),
        anomalies: this.detectAnomalies(chartData),
        trends: this.analyzeTrends(chartData)
      };
    } catch (error) {
      logger.error('Error getting chart insights:', error);
      throw new Error('Failed to get chart insights');
    }
  }

  /**
   * Create interactive dashboard
   */
  async createInteractiveDashboard(companyId: string, dashboardData: Partial<Dashboard>): Promise<Dashboard> {
    try {
      const dashboard = await this.createDashboard(companyId, {
        ...dashboardData,
        interactive: true,
        realTime: true
      });

      // Set up real-time updates
      await this.setupRealTimeUpdates(dashboard.id);

      return dashboard;
    } catch (error) {
      logger.error('Error creating interactive dashboard:', error);
      throw new Error('Failed to create interactive dashboard');
    }
  }

  /**
   * Share dashboard
   */
  async shareDashboard(dashboardId: string, shareData: any): Promise<any> {
    try {
      const share = await prisma.$queryRaw`
        INSERT INTO dashboard_shares (
          dashboard_id, shared_with, permission, shared_by, expires_at
        ) VALUES (
          ${dashboardId}, ${shareData.sharedWith}, ${shareData.permission},
          ${shareData.sharedBy}, ${shareData.expiresAt ? new Date(shareData.expiresAt) : null}
        ) RETURNING *
      `;

      return share[0];
    } catch (error) {
      logger.error('Error sharing dashboard:', error);
      throw new Error('Failed to share dashboard');
    }
  }

  /**
   * Get dashboard analytics
   */
  async getDashboardAnalytics(dashboardId: string): Promise<any> {
    try {
      const analytics = await prisma.$queryRaw`
        SELECT 
          COUNT(*) as total_views,
          COUNT(DISTINCT viewer_id) as unique_viewers,
          AVG(view_duration) as avg_view_duration,
          MAX(last_viewed) as last_viewed
        FROM dashboard_views 
        WHERE dashboard_id = ${dashboardId}
      `;

      return analytics[0];
    } catch (error) {
      logger.error('Error getting dashboard analytics:', error);
      throw new Error('Failed to get dashboard analytics');
    }
  }

  // Private helper methods

  private async executeChartQuery(chartConfig: ChartConfig, parameters: any): Promise<any[]> {
    try {
      // Validate query for security
      if (!this.isValidChartQuery(chartConfig.query)) {
        throw new Error('Invalid query detected');
      }

      const results = await prisma.$queryRawUnsafe(chartConfig.query, ...Object.values(parameters));
      return results;
    } catch (error) {
      logger.error('Error executing chart query:', error);
      throw new Error('Failed to execute chart query');
    }
  }

  private formatChartData(data: any[], chartConfig: ChartConfig): any[] {
    switch (chartConfig.type) {
      case 'line':
      case 'bar':
      case 'area':
        return this.formatTimeSeriesData(data, chartConfig);
      case 'pie':
      case 'doughnut':
        return this.formatPieChartData(data, chartConfig);
      case 'scatter':
        return this.formatScatterData(data, chartConfig);
      case 'heatmap':
        return this.formatHeatmapData(data, chartConfig);
      default:
        return this.formatDefaultData(data, chartConfig);
    }
  }

  private formatTimeSeriesData(data: any[], chartConfig: ChartConfig): any[] {
    const datasets = chartConfig.series.map((series, index) => ({
      label: series.label,
      data: data.map(row => row[series.field] || 0),
      borderColor: chartConfig.colors[index] || this.getDefaultColor(index),
      backgroundColor: chartConfig.colors[index] || this.getDefaultColor(index),
      fill: chartConfig.type === 'area',
      tension: 0.4
    }));

    return datasets;
  }

  private formatPieChartData(data: any[], chartConfig: ChartConfig): any[] {
    return [{
      data: data.map(row => row.value || 0),
      backgroundColor: chartConfig.colors,
      borderWidth: 1
    }];
  }

  private formatScatterData(data: any[], chartConfig: ChartConfig): any[] {
    return [{
      label: chartConfig.series[0]?.label || 'Data',
      data: data.map(row => ({
        x: row.x || row[chartConfig.xAxis?.field || 'x'],
        y: row.y || row[chartConfig.yAxis?.field || 'y']
      })),
      backgroundColor: chartConfig.colors[0] || this.getDefaultColor(0)
    }];
  }

  private formatHeatmapData(data: any[], chartConfig: ChartConfig): any[] {
    // Heatmap data formatting would be implemented here
    return [{
      data: data,
      backgroundColor: chartConfig.colors[0] || this.getDefaultColor(0)
    }];
  }

  private formatDefaultData(data: any[], chartConfig: ChartConfig): any[] {
    return [{
      label: chartConfig.series[0]?.label || 'Data',
      data: data.map(row => row.value || 0),
      backgroundColor: chartConfig.colors[0] || this.getDefaultColor(0)
    }];
  }

  private generateInsights(chartData: ChartData): any[] {
    const insights = [];
    
    // Basic insights based on data patterns
    if (chartData.datasets.length > 0) {
      const data = chartData.datasets[0].data;
      const max = Math.max(...data);
      const min = Math.min(...data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      
      insights.push({
        type: 'statistical',
        message: `Data ranges from ${min} to ${max} with an average of ${avg.toFixed(2)}`,
        confidence: 0.8
      });

      if (max > avg * 1.5) {
        insights.push({
          type: 'anomaly',
          message: 'Peak values detected that are significantly above average',
          confidence: 0.9
        });
      }
    }

    return insights;
  }

  private generateRecommendations(chartData: ChartData): any[] {
    const recommendations = [];
    
    // Generate recommendations based on data patterns
    if (chartData.datasets.length > 0) {
      const data = chartData.datasets[0].data;
      const trend = this.calculateTrend(data);
      
      if (trend > 0.1) {
        recommendations.push({
          type: 'optimization',
          message: 'Data shows positive trend - consider scaling resources',
          priority: 'medium'
        });
      } else if (trend < -0.1) {
        recommendations.push({
          type: 'alert',
          message: 'Data shows declining trend - investigate potential issues',
          priority: 'high'
        });
      }
    }

    return recommendations;
  }

  private detectAnomalies(chartData: ChartData): any[] {
    const anomalies = [];
    
    if (chartData.datasets.length > 0) {
      const data = chartData.datasets[0].data;
      const mean = data.reduce((a, b) => a + b, 0) / data.length;
      const stdDev = Math.sqrt(data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length);
      
      data.forEach((value, index) => {
        if (Math.abs(value - mean) > 2 * stdDev) {
          anomalies.push({
            index,
            value,
            deviation: Math.abs(value - mean) / stdDev,
            severity: Math.abs(value - mean) > 3 * stdDev ? 'high' : 'medium'
          });
        }
      });
    }

    return anomalies;
  }

  private analyzeTrends(chartData: ChartData): any[] {
    const trends = [];
    
    if (chartData.datasets.length > 0) {
      const data = chartData.datasets[0].data;
      const trend = this.calculateTrend(data);
      
      trends.push({
        direction: trend > 0.05 ? 'increasing' : trend < -0.05 ? 'decreasing' : 'stable',
        strength: Math.abs(trend),
        confidence: 0.8
      });
    }

    return trends;
  }

  private calculateTrend(data: number[]): number {
    if (data.length < 2) return 0;
    
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  private isValidChartQuery(query: string): boolean {
    // Basic SQL injection prevention for chart queries
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

  private getDefaultColor(index: number): string {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];
    return colors[index % colors.length];
  }

  private async setupRealTimeUpdates(dashboardId: string): Promise<void> {
    // This would set up real-time updates for the dashboard
    // Implementation would depend on the real-time system (WebSockets, Server-Sent Events, etc.)
    logger.info(`Setting up real-time updates for dashboard ${dashboardId}`);
  }
}

export default DataVisualizationService;





