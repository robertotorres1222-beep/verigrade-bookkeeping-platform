import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface MonitoringDashboard {
  id: string;
  name: string;
  description: string;
  layout: any;
  widgets: any[];
  filters: any[];
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SLOMetric {
  id: string;
  name: string;
  description: string;
  metricType: 'availability' | 'latency' | 'error_rate' | 'throughput' | 'custom';
  target: number;
  measurement: number;
  status: 'healthy' | 'warning' | 'critical';
  errorBudget: number;
  burnRate: number;
  timeWindow: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: string[];
  isActive: boolean;
  cooldown: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LogQuery {
  id: string;
  name: string;
  query: string;
  timeRange: string;
  filters: any[];
  saved: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface PerformanceMetric {
  id: string;
  service: string;
  metric: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags: any;
}

export class AdvancedMonitoringService {
  /**
   * Create monitoring dashboard
   */
  async createMonitoringDashboard(companyId: string, dashboardData: Partial<MonitoringDashboard>): Promise<MonitoringDashboard> {
    try {
      const dashboard = await prisma.$queryRaw`
        INSERT INTO monitoring_dashboards (
          company_id, name, description, layout, widgets, 
          filters, is_public, created_by
        ) VALUES (
          ${companyId}, ${dashboardData.name}, ${dashboardData.description}, 
          ${JSON.stringify(dashboardData.layout || {})}, ${JSON.stringify(dashboardData.widgets || [])}, 
          ${JSON.stringify(dashboardData.filters || [])}, ${dashboardData.isPublic || false}, ${dashboardData.createdBy}
        ) RETURNING *
      `;

      return dashboard[0] as MonitoringDashboard;
    } catch (error) {
      logger.error('Error creating monitoring dashboard:', error);
      throw new Error('Failed to create monitoring dashboard');
    }
  }

  /**
   * Get monitoring dashboards
   */
  async getMonitoringDashboards(companyId: string): Promise<MonitoringDashboard[]> {
    try {
      const dashboards = await prisma.$queryRaw`
        SELECT * FROM monitoring_dashboards 
        WHERE company_id = ${companyId}
        ORDER BY created_at DESC
      `;

      return dashboards as MonitoringDashboard[];
    } catch (error) {
      logger.error('Error getting monitoring dashboards:', error);
      throw new Error('Failed to get monitoring dashboards');
    }
  }

  /**
   * Create SLO metric
   */
  async createSLOMetric(companyId: string, sloData: Partial<SLOMetric>): Promise<SLOMetric> {
    try {
      const slo = await prisma.$queryRaw`
        INSERT INTO slo_metrics (
          company_id, name, description, metric_type, target, 
          measurement, status, error_budget, burn_rate, time_window
        ) VALUES (
          ${companyId}, ${sloData.name}, ${sloData.description}, 
          ${sloData.metricType}, ${sloData.target}, ${sloData.measurement || 0}, 
          ${sloData.status || 'healthy'}, ${sloData.errorBudget || 0}, 
          ${sloData.burnRate || 0}, ${sloData.timeWindow || '30d'}
        ) RETURNING *
      `;

      return slo[0] as SLOMetric;
    } catch (error) {
      logger.error('Error creating SLO metric:', error);
      throw new Error('Failed to create SLO metric');
    }
  }

  /**
   * Get SLO metrics
   */
  async getSLOMetrics(companyId: string): Promise<SLOMetric[]> {
    try {
      const slos = await prisma.$queryRaw`
        SELECT * FROM slo_metrics 
        WHERE company_id = ${companyId}
        ORDER BY created_at DESC
      `;

      return slos as SLOMetric[];
    } catch (error) {
      logger.error('Error getting SLO metrics:', error);
      throw new Error('Failed to get SLO metrics');
    }
  }

  /**
   * Create alert rule
   */
  async createAlertRule(companyId: string, ruleData: Partial<AlertRule>): Promise<AlertRule> {
    try {
      const rule = await prisma.$queryRaw`
        INSERT INTO alert_rules (
          company_id, name, description, metric, condition, 
          threshold, severity, channels, is_active, cooldown
        ) VALUES (
          ${companyId}, ${ruleData.name}, ${ruleData.description}, 
          ${ruleData.metric}, ${ruleData.condition}, ${ruleData.threshold}, 
          ${ruleData.severity}, ${JSON.stringify(ruleData.channels || [])}, 
          ${ruleData.isActive || true}, ${ruleData.cooldown || 300}
        ) RETURNING *
      `;

      return rule[0] as AlertRule;
    } catch (error) {
      logger.error('Error creating alert rule:', error);
      throw new Error('Failed to create alert rule');
    }
  }

  /**
   * Get alert rules
   */
  async getAlertRules(companyId: string): Promise<AlertRule[]> {
    try {
      const rules = await prisma.$queryRaw`
        SELECT * FROM alert_rules 
        WHERE company_id = ${companyId}
        ORDER BY created_at DESC
      `;

      return rules as AlertRule[];
    } catch (error) {
      logger.error('Error getting alert rules:', error);
      throw new Error('Failed to get alert rules');
    }
  }

  /**
   * Create log query
   */
  async createLogQuery(companyId: string, queryData: Partial<LogQuery>): Promise<LogQuery> {
    try {
      const query = await prisma.$queryRaw`
        INSERT INTO log_queries (
          company_id, name, query, time_range, filters, saved, created_by
        ) VALUES (
          ${companyId}, ${queryData.name}, ${queryData.query}, 
          ${queryData.timeRange || '1h'}, ${JSON.stringify(queryData.filters || [])}, 
          ${queryData.saved || false}, ${queryData.createdBy}
        ) RETURNING *
      `;

      return query[0] as LogQuery;
    } catch (error) {
      logger.error('Error creating log query:', error);
      throw new Error('Failed to create log query');
    }
  }

  /**
   * Get log queries
   */
  async getLogQueries(companyId: string): Promise<LogQuery[]> {
    try {
      const queries = await prisma.$queryRaw`
        SELECT * FROM log_queries 
        WHERE company_id = ${companyId}
        ORDER BY created_at DESC
      `;

      return queries as LogQuery[];
    } catch (error) {
      logger.error('Error getting log queries:', error);
      throw new Error('Failed to get log queries');
    }
  }

  /**
   * Execute log query
   */
  async executeLogQuery(query: string, timeRange: string = '1h'): Promise<any[]> {
    try {
      // Simulate log query execution
      const results = await this.simulateLogQuery(query, timeRange);
      return results;
    } catch (error) {
      logger.error('Error executing log query:', error);
      throw new Error('Failed to execute log query');
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(companyId: string, service?: string, timeRange?: string): Promise<PerformanceMetric[]> {
    try {
      let query = `
        SELECT * FROM performance_metrics 
        WHERE company_id = $1
      `;
      const params = [companyId];

      if (service) {
        query += ` AND service = $2`;
        params.push(service);
      }

      if (timeRange) {
        const hours = this.parseTimeRange(timeRange);
        query += ` AND timestamp > NOW() - INTERVAL '${hours} hours'`;
      }

      query += ` ORDER BY timestamp DESC LIMIT 1000`;

      const metrics = await prisma.$queryRawUnsafe(query, ...params);
      return metrics as PerformanceMetric[];
    } catch (error) {
      logger.error('Error getting performance metrics:', error);
      throw new Error('Failed to get performance metrics');
    }
  }

  /**
   * Get monitoring overview
   */
  async getMonitoringOverview(companyId: string): Promise<any> {
    try {
      const overview = await prisma.$queryRaw`
        SELECT 
          COUNT(DISTINCT md.id) as total_dashboards,
          COUNT(DISTINCT sm.id) as total_slos,
          COUNT(DISTINCT ar.id) as total_alert_rules,
          COUNT(DISTINCT lq.id) as total_log_queries,
          COUNT(CASE WHEN sm.status = 'healthy' THEN 1 END) as healthy_slos,
          COUNT(CASE WHEN sm.status = 'warning' THEN 1 END) as warning_slos,
          COUNT(CASE WHEN sm.status = 'critical' THEN 1 END) as critical_slos,
          COUNT(CASE WHEN ar.is_active = true THEN 1 END) as active_alerts
        FROM monitoring_dashboards md
        LEFT JOIN slo_metrics sm ON md.company_id = sm.company_id
        LEFT JOIN alert_rules ar ON md.company_id = ar.company_id
        LEFT JOIN log_queries lq ON md.company_id = lq.company_id
        WHERE md.company_id = ${companyId}
      `;

      return overview[0];
    } catch (error) {
      logger.error('Error getting monitoring overview:', error);
      throw new Error('Failed to get monitoring overview');
    }
  }

  /**
   * Get alert history
   */
  async getAlertHistory(companyId: string, timeRange?: string): Promise<any[]> {
    try {
      let query = `
        SELECT * FROM alert_history 
        WHERE company_id = $1
      `;
      const params = [companyId];

      if (timeRange) {
        const hours = this.parseTimeRange(timeRange);
        query += ` AND created_at > NOW() - INTERVAL '${hours} hours'`;
      }

      query += ` ORDER BY created_at DESC LIMIT 100`;

      const alerts = await prisma.$queryRawUnsafe(query, ...params);
      return alerts;
    } catch (error) {
      logger.error('Error getting alert history:', error);
      throw new Error('Failed to get alert history');
    }
  }

  /**
   * Create custom metric
   */
  async createCustomMetric(companyId: string, metricData: any): Promise<any> {
    try {
      const metric = await prisma.$queryRaw`
        INSERT INTO custom_metrics (
          company_id, name, description, metric_type, unit, 
          aggregation, tags, is_public
        ) VALUES (
          ${companyId}, ${metricData.name}, ${metricData.description}, 
          ${metricData.metricType}, ${metricData.unit}, ${metricData.aggregation}, 
          ${JSON.stringify(metricData.tags || {})}, ${metricData.isPublic || false}
        ) RETURNING *
      `;

      return metric[0];
    } catch (error) {
      logger.error('Error creating custom metric:', error);
      throw new Error('Failed to create custom metric');
    }
  }

  /**
   * Get metric data
   */
  async getMetricData(metricName: string, timeRange: string = '1h'): Promise<any[]> {
    try {
      const hours = this.parseTimeRange(timeRange);
      const data = await prisma.$queryRaw`
        SELECT * FROM performance_metrics 
        WHERE metric = ${metricName} 
        AND timestamp > NOW() - INTERVAL '${hours} hours'
        ORDER BY timestamp DESC
      `;

      return data;
    } catch (error) {
      logger.error('Error getting metric data:', error);
      throw new Error('Failed to get metric data');
    }
  }

  /**
   * Update SLO status
   */
  async updateSLOStatus(sloId: string): Promise<SLOMetric> {
    try {
      const slo = await prisma.$queryRaw`
        UPDATE slo_metrics 
        SET 
          measurement = (SELECT AVG(value) FROM performance_metrics WHERE metric = slo_metrics.metric),
          status = CASE 
            WHEN measurement >= target THEN 'healthy'
            WHEN measurement >= target * 0.9 THEN 'warning'
            ELSE 'critical'
          END,
          error_budget = target - measurement,
          burn_rate = (target - measurement) / target,
          updated_at = NOW()
        WHERE id = ${sloId}
        RETURNING *
      `;

      return slo[0] as SLOMetric;
    } catch (error) {
      logger.error('Error updating SLO status:', error);
      throw new Error('Failed to update SLO status');
    }
  }

  /**
   * Trigger alert
   */
  async triggerAlert(ruleId: string, metricValue: number): Promise<any> {
    try {
      const alert = await prisma.$queryRaw`
        INSERT INTO alert_history (
          rule_id, metric_value, status, message, created_at
        ) VALUES (
          ${ruleId}, ${metricValue}, 'triggered', 'Alert triggered', NOW()
        ) RETURNING *
      `;

      return alert[0];
    } catch (error) {
      logger.error('Error triggering alert:', error);
      throw new Error('Failed to trigger alert');
    }
  }

  // Private helper methods

  private async simulateLogQuery(query: string, timeRange: string): Promise<any[]> {
    // Simulate log query results
    const results = [];
    const count = Math.floor(Math.random() * 100) + 10;
    
    for (let i = 0; i < count; i++) {
      results.push({
        timestamp: new Date(Date.now() - Math.random() * 3600000),
        level: ['info', 'warn', 'error'][Math.floor(Math.random() * 3)],
        message: `Sample log message ${i}`,
        service: ['api', 'web', 'db', 'cache'][Math.floor(Math.random() * 4)],
        traceId: `trace-${Math.random().toString(36).substr(2, 9)}`
      });
    }

    return results;
  }

  private parseTimeRange(timeRange: string): number {
    const timeMap: { [key: string]: number } = {
      '5m': 0.083,
      '15m': 0.25,
      '30m': 0.5,
      '1h': 1,
      '3h': 3,
      '6h': 6,
      '12h': 12,
      '1d': 24,
      '3d': 72,
      '7d': 168
    };

    return timeMap[timeRange] || 1;
  }
}

export default AdvancedMonitoringService;



