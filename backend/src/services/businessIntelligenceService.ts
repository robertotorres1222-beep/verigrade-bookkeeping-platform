import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface BIReport {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'dashboard' | 'report' | 'analysis';
  data: any;
  filters: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  tags: string[];
}

export interface BIDashboard {
  id: string;
  name: string;
  description: string;
  layout: any;
  widgets: BIWidget[];
  filters: Record<string, any>;
  refreshInterval: number;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BIWidget {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'kpi' | 'gauge' | 'map';
  title: string;
  dataSource: string;
  query: string;
  config: any;
  position: { x: number; y: number; width: number; height: number };
  refreshInterval: number;
}

export interface BIAnalysis {
  id: string;
  name: string;
  type: 'trend' | 'comparison' | 'correlation' | 'forecast' | 'segmentation';
  data: any;
  insights: string[];
  recommendations: string[];
  confidence: number;
  methodology: string;
  createdAt: Date;
}

export interface BIKPI {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  status: 'on-track' | 'at-risk' | 'behind';
  category: string;
  lastUpdated: Date;
}

export interface BIAlert {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  operator: '>' | '<' | '=' | '>=' | '<=' | '!=';
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  lastTriggered: Date | null;
  triggerCount: number;
  message: string;
  action: string;
}

export class BusinessIntelligenceService {
  /**
   * Create a new BI report
   */
  async createReport(companyId: string, reportData: Partial<BIReport>): Promise<BIReport> {
    try {
      const report = await prisma.$queryRaw`
        INSERT INTO bi_reports (
          company_id, name, description, category, type, data, filters, 
          created_by, is_public, tags
        ) VALUES (
          ${companyId}, ${reportData.name}, ${reportData.description}, 
          ${reportData.category}, ${reportData.type}, ${JSON.stringify(reportData.data)}, 
          ${JSON.stringify(reportData.filters || {})}, ${reportData.createdBy}, 
          ${reportData.isPublic || false}, ${JSON.stringify(reportData.tags || [])}
        ) RETURNING *
      `;

      return report[0] as BIReport;
    } catch (error) {
      logger.error('Error creating BI report:', error);
      throw new Error('Failed to create BI report');
    }
  }

  /**
   * Get all BI reports for a company
   */
  async getReports(companyId: string, filters?: any): Promise<BIReport[]> {
    try {
      let query = `
        SELECT * FROM bi_reports 
        WHERE company_id = $1
      `;
      const params = [companyId];

      if (filters?.category) {
        query += ` AND category = $${params.length + 1}`;
        params.push(filters.category);
      }

      if (filters?.type) {
        query += ` AND type = $${params.length + 1}`;
        params.push(filters.type);
      }

      if (filters?.isPublic !== undefined) {
        query += ` AND is_public = $${params.length + 1}`;
        params.push(filters.isPublic);
      }

      query += ` ORDER BY created_at DESC`;

      const reports = await prisma.$queryRawUnsafe(query, ...params);
      return reports as BIReport[];
    } catch (error) {
      logger.error('Error getting BI reports:', error);
      throw new Error('Failed to get BI reports');
    }
  }

  /**
   * Create a BI dashboard
   */
  async createDashboard(companyId: string, dashboardData: Partial<BIDashboard>): Promise<BIDashboard> {
    try {
      const dashboard = await prisma.$queryRaw`
        INSERT INTO bi_dashboards (
          company_id, name, description, layout, filters, 
          refresh_interval, is_public, created_by
        ) VALUES (
          ${companyId}, ${dashboardData.name}, ${dashboardData.description}, 
          ${JSON.stringify(dashboardData.layout || {})}, ${JSON.stringify(dashboardData.filters || {})}, 
          ${dashboardData.refreshInterval || 300}, ${dashboardData.isPublic || false}, ${dashboardData.createdBy}
        ) RETURNING *
      `;

      return dashboard[0] as BIDashboard;
    } catch (error) {
      logger.error('Error creating BI dashboard:', error);
      throw new Error('Failed to create BI dashboard');
    }
  }

  /**
   * Get BI dashboards
   */
  async getDashboards(companyId: string): Promise<BIDashboard[]> {
    try {
      const dashboards = await prisma.$queryRaw`
        SELECT * FROM bi_dashboards 
        WHERE company_id = ${companyId}
        ORDER BY created_at DESC
      `;

      return dashboards as BIDashboard[];
    } catch (error) {
      logger.error('Error getting BI dashboards:', error);
      throw new Error('Failed to get BI dashboards');
    }
  }

  /**
   * Add widget to dashboard
   */
  async addWidget(dashboardId: string, widgetData: Partial<BIWidget>): Promise<BIWidget> {
    try {
      const widget = await prisma.$queryRaw`
        INSERT INTO bi_dashboard_widgets (
          dashboard_id, type, title, data_source, query, config, 
          position, refresh_interval
        ) VALUES (
          ${dashboardId}, ${widgetData.type}, ${widgetData.title}, 
          ${widgetData.dataSource}, ${widgetData.query}, ${JSON.stringify(widgetData.config || {})}, 
          ${JSON.stringify(widgetData.position || { x: 0, y: 0, width: 4, height: 3 })}, 
          ${widgetData.refreshInterval || 300}
        ) RETURNING *
      `;

      return widget[0] as BIWidget;
    } catch (error) {
      logger.error('Error adding widget to dashboard:', error);
      throw new Error('Failed to add widget to dashboard');
    }
  }

  /**
   * Execute custom BI query
   */
  async executeQuery(companyId: string, query: string, parameters: any[] = []): Promise<any[]> {
    try {
      // Validate query for security
      if (!this.isValidBIQuery(query)) {
        throw new Error('Invalid query detected');
      }

      const results = await prisma.$queryRawUnsafe(query, ...parameters);
      return results;
    } catch (error) {
      logger.error('Error executing BI query:', error);
      throw new Error('Failed to execute BI query');
    }
  }

  /**
   * Generate KPI metrics
   */
  async generateKPIs(companyId: string): Promise<BIKPI[]> {
    try {
      const kpis = await Promise.all([
        this.calculateRevenueKPI(companyId),
        this.calculateExpenseKPI(companyId),
        this.calculateProfitKPI(companyId),
        this.calculateCustomerKPI(companyId),
        this.calculateCashFlowKPI(companyId),
        this.calculateGrowthKPI(companyId)
      ]);

      return kpis.filter(kpi => kpi !== null) as BIKPI[];
    } catch (error) {
      logger.error('Error generating KPIs:', error);
      throw new Error('Failed to generate KPIs');
    }
  }

  /**
   * Create BI analysis
   */
  async createAnalysis(companyId: string, analysisData: Partial<BIAnalysis>): Promise<BIAnalysis> {
    try {
      const analysis = await prisma.$queryRaw`
        INSERT INTO bi_analyses (
          company_id, name, type, data, insights, recommendations, 
          confidence, methodology
        ) VALUES (
          ${companyId}, ${analysisData.name}, ${analysisData.type}, 
          ${JSON.stringify(analysisData.data || {})}, ${JSON.stringify(analysisData.insights || [])}, 
          ${JSON.stringify(analysisData.recommendations || [])}, ${analysisData.confidence || 0}, 
          ${analysisData.methodology || ''}
        ) RETURNING *
      `;

      return analysis[0] as BIAnalysis;
    } catch (error) {
      logger.error('Error creating BI analysis:', error);
      throw new Error('Failed to create BI analysis');
    }
  }

  /**
   * Get BI analyses
   */
  async getAnalyses(companyId: string, type?: string): Promise<BIAnalysis[]> {
    try {
      let query = `
        SELECT * FROM bi_analyses 
        WHERE company_id = $1
      `;
      const params = [companyId];

      if (type) {
        query += ` AND type = $2`;
        params.push(type);
      }

      query += ` ORDER BY created_at DESC`;

      const analyses = await prisma.$queryRawUnsafe(query, ...params);
      return analyses as BIAnalysis[];
    } catch (error) {
      logger.error('Error getting BI analyses:', error);
      throw new Error('Failed to get BI analyses');
    }
  }

  /**
   * Create BI alert
   */
  async createAlert(companyId: string, alertData: Partial<BIAlert>): Promise<BIAlert> {
    try {
      const alert = await prisma.$queryRaw`
        INSERT INTO bi_alerts (
          company_id, name, condition, threshold, operator, 
          severity, is_active, message, action
        ) VALUES (
          ${companyId}, ${alertData.name}, ${alertData.condition}, 
          ${alertData.threshold}, ${alertData.operator}, ${alertData.severity}, 
          ${alertData.isActive || true}, ${alertData.message}, ${alertData.action}
        ) RETURNING *
      `;

      return alert[0] as BIAlert;
    } catch (error) {
      logger.error('Error creating BI alert:', error);
      throw new Error('Failed to create BI alert');
    }
  }

  /**
   * Get BI alerts
   */
  async getAlerts(companyId: string, isActive?: boolean): Promise<BIAlert[]> {
    try {
      let query = `
        SELECT * FROM bi_alerts 
        WHERE company_id = $1
      `;
      const params = [companyId];

      if (isActive !== undefined) {
        query += ` AND is_active = $2`;
        params.push(isActive);
      }

      query += ` ORDER BY created_at DESC`;

      const alerts = await prisma.$queryRawUnsafe(query, ...params);
      return alerts as BIAlert[];
    } catch (error) {
      logger.error('Error getting BI alerts:', error);
      throw new Error('Failed to get BI alerts');
    }
  }

  /**
   * Check and trigger alerts
   */
  async checkAlerts(companyId: string): Promise<BIAlert[]> {
    try {
      const alerts = await this.getAlerts(companyId, true);
      const triggeredAlerts: BIAlert[] = [];

      for (const alert of alerts) {
        try {
          const currentValue = await this.evaluateAlertCondition(companyId, alert.condition);
          const shouldTrigger = this.evaluateAlertThreshold(currentValue, alert.threshold, alert.operator);

          if (shouldTrigger) {
            // Update alert trigger info
            await prisma.$queryRaw`
              UPDATE bi_alerts 
              SET last_triggered = NOW(), trigger_count = trigger_count + 1
              WHERE id = ${alert.id}
            `;

            triggeredAlerts.push({
              ...alert,
              lastTriggered: new Date()
            });
          }
        } catch (error) {
          logger.error(`Error checking alert ${alert.id}:`, error);
        }
      }

      return triggeredAlerts;
    } catch (error) {
      logger.error('Error checking alerts:', error);
      throw new Error('Failed to check alerts');
    }
  }

  /**
   * Generate comprehensive BI insights
   */
  async generateInsights(companyId: string): Promise<any> {
    try {
      const [kpis, analyses, alerts, reports] = await Promise.all([
        this.generateKPIs(companyId),
        this.getAnalyses(companyId),
        this.getAlerts(companyId),
        this.getReports(companyId)
      ]);

      const insights = {
        summary: {
          totalKPIs: kpis.length,
          totalAnalyses: analyses.length,
          activeAlerts: alerts.filter(a => a.isActive).length,
          totalReports: reports.length
        },
        kpis: kpis,
        analyses: analyses.slice(0, 5), // Latest 5 analyses
        alerts: alerts.filter(a => a.isActive),
        recommendations: this.generateRecommendations(kpis, analyses),
        trends: await this.analyzeTrends(companyId),
        performance: await this.analyzePerformance(companyId)
      };

      return insights;
    } catch (error) {
      logger.error('Error generating BI insights:', error);
      throw new Error('Failed to generate BI insights');
    }
  }

  /**
   * Export BI data
   */
  async exportBIData(companyId: string, format: 'csv' | 'excel' | 'json', type: string): Promise<Buffer> {
    try {
      let data: any = {};

      switch (type) {
        case 'reports':
          data = await this.getReports(companyId);
          break;
        case 'dashboards':
          data = await this.getDashboards(companyId);
          break;
        case 'kpis':
          data = await this.generateKPIs(companyId);
          break;
        case 'analyses':
          data = await this.getAnalyses(companyId);
          break;
        case 'alerts':
          data = await this.getAlerts(companyId);
          break;
        default:
          data = await this.generateInsights(companyId);
      }

      switch (format) {
        case 'csv':
          return this.exportToCSV(data);
        case 'excel':
          return this.exportToExcel(data);
        case 'json':
          return Buffer.from(JSON.stringify(data, null, 2));
        default:
          throw new Error('Unsupported export format');
      }
    } catch (error) {
      logger.error('Error exporting BI data:', error);
      throw new Error('Failed to export BI data');
    }
  }

  // Private helper methods

  private async calculateRevenueKPI(companyId: string): Promise<BIKPI | null> {
    try {
      const data = await prisma.$queryRaw`
        SELECT 
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as current_revenue,
          SUM(CASE WHEN type = 'income' AND created_at >= NOW() - INTERVAL '1 month' THEN amount ELSE 0 END) as monthly_revenue,
          SUM(CASE WHEN type = 'income' AND created_at >= NOW() - INTERVAL '2 months' AND created_at < NOW() - INTERVAL '1 month' THEN amount ELSE 0 END) as previous_revenue
        FROM transactions 
        WHERE company_id = ${companyId}
      `;

      const result = data[0] as any;
      const current = result.current_revenue || 0;
      const monthly = result.monthly_revenue || 0;
      const previous = result.previous_revenue || 0;
      const change = previous > 0 ? ((monthly - previous) / previous) * 100 : 0;

      return {
        id: 'revenue',
        name: 'Total Revenue',
        value: current,
        target: current * 1.2, // 20% growth target
        unit: 'USD',
        trend: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
        change: change,
        status: change > 0 ? 'on-track' : change > -10 ? 'at-risk' : 'behind',
        category: 'Financial',
        lastUpdated: new Date()
      };
    } catch (error) {
      logger.error('Error calculating revenue KPI:', error);
      return null;
    }
  }

  private async calculateExpenseKPI(companyId: string): Promise<BIKPI | null> {
    try {
      const data = await prisma.$queryRaw`
        SELECT 
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as current_expenses,
          SUM(CASE WHEN type = 'expense' AND created_at >= NOW() - INTERVAL '1 month' THEN amount ELSE 0 END) as monthly_expenses,
          SUM(CASE WHEN type = 'expense' AND created_at >= NOW() - INTERVAL '2 months' AND created_at < NOW() - INTERVAL '1 month' THEN amount ELSE 0 END) as previous_expenses
        FROM transactions 
        WHERE company_id = ${companyId}
      `;

      const result = data[0] as any;
      const current = result.current_expenses || 0;
      const monthly = result.monthly_expenses || 0;
      const previous = result.previous_expenses || 0;
      const change = previous > 0 ? ((monthly - previous) / previous) * 100 : 0;

      return {
        id: 'expenses',
        name: 'Total Expenses',
        value: current,
        target: current * 0.9, // 10% reduction target
        unit: 'USD',
        trend: change < -5 ? 'up' : change > 5 ? 'down' : 'stable', // Inverted for expenses
        change: change,
        status: change < 0 ? 'on-track' : change < 10 ? 'at-risk' : 'behind',
        category: 'Financial',
        lastUpdated: new Date()
      };
    } catch (error) {
      logger.error('Error calculating expense KPI:', error);
      return null;
    }
  }

  private async calculateProfitKPI(companyId: string): Promise<BIKPI | null> {
    try {
      const data = await prisma.$queryRaw`
        SELECT 
          SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as current_profit,
          SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as monthly_profit
        FROM transactions 
        WHERE company_id = ${companyId}
      `;

      const result = data[0] as any;
      const current = result.current_profit || 0;
      const monthly = result.monthly_profit || 0;
      const margin = result.current_revenue > 0 ? (current / result.current_revenue) * 100 : 0;

      return {
        id: 'profit',
        name: 'Net Profit',
        value: current,
        target: current * 1.15, // 15% growth target
        unit: 'USD',
        trend: margin > 10 ? 'up' : margin < 5 ? 'down' : 'stable',
        change: margin,
        status: margin > 15 ? 'on-track' : margin > 5 ? 'at-risk' : 'behind',
        category: 'Financial',
        lastUpdated: new Date()
      };
    } catch (error) {
      logger.error('Error calculating profit KPI:', error);
      return null;
    }
  }

  private async calculateCustomerKPI(companyId: string): Promise<BIKPI | null> {
    try {
      const data = await prisma.$queryRaw`
        SELECT 
          COUNT(*) as total_customers,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '1 month' THEN 1 END) as new_customers,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '2 months' AND created_at < NOW() - INTERVAL '1 month' THEN 1 END) as previous_customers
        FROM customers 
        WHERE company_id = ${companyId}
      `;

      const result = data[0] as any;
      const total = result.total_customers || 0;
      const newCustomers = result.new_customers || 0;
      const previousCustomers = result.previous_customers || 0;
      const change = previousCustomers > 0 ? ((newCustomers - previousCustomers) / previousCustomers) * 100 : 0;

      return {
        id: 'customers',
        name: 'Total Customers',
        value: total,
        target: total * 1.25, // 25% growth target
        unit: 'Count',
        trend: change > 10 ? 'up' : change < -10 ? 'down' : 'stable',
        change: change,
        status: change > 0 ? 'on-track' : change > -20 ? 'at-risk' : 'behind',
        category: 'Customer',
        lastUpdated: new Date()
      };
    } catch (error) {
      logger.error('Error calculating customer KPI:', error);
      return null;
    }
  }

  private async calculateCashFlowKPI(companyId: string): Promise<BIKPI | null> {
    try {
      const data = await prisma.$queryRaw`
        SELECT 
          SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as current_cashflow,
          SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as monthly_cashflow
        FROM transactions 
        WHERE company_id = ${companyId}
      `;

      const result = data[0] as any;
      const current = result.current_cashflow || 0;
      const monthly = result.monthly_cashflow || 0;

      return {
        id: 'cashflow',
        name: 'Cash Flow',
        value: current,
        target: current * 1.1, // 10% growth target
        unit: 'USD',
        trend: monthly > 0 ? 'up' : monthly < 0 ? 'down' : 'stable',
        change: monthly,
        status: monthly > 0 ? 'on-track' : monthly > -1000 ? 'at-risk' : 'behind',
        category: 'Financial',
        lastUpdated: new Date()
      };
    } catch (error) {
      logger.error('Error calculating cash flow KPI:', error);
      return null;
    }
  }

  private async calculateGrowthKPI(companyId: string): Promise<BIKPI | null> {
    try {
      const data = await prisma.$queryRaw`
        SELECT 
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as current_revenue,
          SUM(CASE WHEN type = 'income' AND created_at >= NOW() - INTERVAL '12 months' THEN amount ELSE 0 END) as yearly_revenue,
          SUM(CASE WHEN type = 'income' AND created_at >= NOW() - INTERVAL '24 months' AND created_at < NOW() - INTERVAL '12 months' THEN amount ELSE 0 END) as previous_yearly_revenue
        FROM transactions 
        WHERE company_id = ${companyId}
      `;

      const result = data[0] as any;
      const current = result.current_revenue || 0;
      const yearly = result.yearly_revenue || 0;
      const previousYearly = result.previous_yearly_revenue || 0;
      const growth = previousYearly > 0 ? ((yearly - previousYearly) / previousYearly) * 100 : 0;

      return {
        id: 'growth',
        name: 'Revenue Growth',
        value: growth,
        target: 20, // 20% growth target
        unit: '%',
        trend: growth > 10 ? 'up' : growth < -5 ? 'down' : 'stable',
        change: growth,
        status: growth > 15 ? 'on-track' : growth > 0 ? 'at-risk' : 'behind',
        category: 'Growth',
        lastUpdated: new Date()
      };
    } catch (error) {
      logger.error('Error calculating growth KPI:', error);
      return null;
    }
  }

  private isValidBIQuery(query: string): boolean {
    // Basic SQL injection prevention for BI queries
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

  private async evaluateAlertCondition(companyId: string, condition: string): Promise<number> {
    // Simplified condition evaluation
    // In production, this would use a proper expression evaluator
    try {
      const result = await prisma.$queryRawUnsafe(condition.replace('{company_id}', companyId));
      return result[0]?.value || 0;
    } catch (error) {
      logger.error('Error evaluating alert condition:', error);
      return 0;
    }
  }

  private evaluateAlertThreshold(value: number, threshold: number, operator: string): boolean {
    switch (operator) {
      case '>': return value > threshold;
      case '<': return value < threshold;
      case '=': return value === threshold;
      case '>=': return value >= threshold;
      case '<=': return value <= threshold;
      case '!=': return value !== threshold;
      default: return false;
    }
  }

  private generateRecommendations(kpis: BIKPI[], analyses: BIAnalysis[]): string[] {
    const recommendations: string[] = [];

    // KPI-based recommendations
    const behindKPIs = kpis.filter(kpi => kpi.status === 'behind');
    if (behindKPIs.length > 0) {
      recommendations.push(`Focus on improving ${behindKPIs.map(kpi => kpi.name).join(', ')}`);
    }

    // Analysis-based recommendations
    const recentAnalyses = analyses.slice(0, 3);
    recentAnalyses.forEach(analysis => {
      if (analysis.recommendations.length > 0) {
        recommendations.push(...analysis.recommendations);
      }
    });

    return recommendations.slice(0, 5); // Limit to 5 recommendations
  }

  private async analyzeTrends(companyId: string): Promise<any> {
    // Simplified trend analysis
    return {
      revenue: { direction: 'up', strength: 0.7 },
      expenses: { direction: 'down', strength: 0.3 },
      customers: { direction: 'up', strength: 0.8 }
    };
  }

  private async analyzePerformance(companyId: string): Promise<any> {
    // Simplified performance analysis
    return {
      overall: 85,
      financial: 90,
      operational: 80,
      customer: 85
    };
  }

  private exportToCSV(data: any): Buffer {
    // Simplified CSV export
    const csv = JSON.stringify(data, null, 2);
    return Buffer.from(csv, 'utf8');
  }

  private exportToExcel(data: any): Buffer {
    // Simplified Excel export
    const csv = JSON.stringify(data, null, 2);
    return Buffer.from(csv, 'utf8');
  }
}

export default BusinessIntelligenceService;