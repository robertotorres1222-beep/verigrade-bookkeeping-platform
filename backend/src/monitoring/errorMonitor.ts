import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

interface ErrorMetrics {
  error: string;
  stack?: string;
  timestamp: Date;
  endpoint?: string;
  method?: string;
  userId?: string;
  organizationId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  count: number;
}

interface AlertRule {
  id: string;
  name: string;
  condition: (metrics: ErrorMetrics[]) => boolean;
  threshold: number;
  timeWindow: number; // in minutes
  enabled: boolean;
}

export class ErrorMonitor {
  private static instance: ErrorMonitor;
  private errors: ErrorMetrics[] = [];
  private alertRules: AlertRule[] = [];
  private alertHistory: Array<{
    ruleId: string;
    timestamp: Date;
    message: string;
    resolved: boolean;
  }> = [];

  private constructor() {
    this.setupDefaultAlertRules();
  }

  public static getInstance(): ErrorMonitor {
    if (!ErrorMonitor.instance) {
      ErrorMonitor.instance = new ErrorMonitor();
    }
    return ErrorMonitor.instance;
  }

  /**
   * Record an error
   */
  public recordError(
    error: Error | AppError,
    context?: {
      endpoint?: string;
      method?: string;
      userId?: string;
      organizationId?: string;
    }
  ): void {
    const errorMetric: ErrorMetrics = {
      error: error.message,
      stack: error.stack,
      timestamp: new Date(),
      endpoint: context?.endpoint,
      method: context?.method,
      userId: context?.userId,
      organizationId: context?.organizationId,
      severity: this.determineSeverity(error),
      count: 1,
    };

    this.errors.push(errorMetric);

    // Log error based on severity
    switch (errorMetric.severity) {
      case 'critical':
        logger.error('Critical error occurred', {
          error: error.message,
          stack: error.stack,
          context,
        });
        break;
      case 'high':
        logger.error('High severity error occurred', {
          error: error.message,
          context,
        });
        break;
      case 'medium':
        logger.warn('Medium severity error occurred', {
          error: error.message,
          context,
        });
        break;
      case 'low':
        logger.info('Low severity error occurred', {
          error: error.message,
          context,
        });
        break;
    }

    // Check alert rules
    this.checkAlertRules();

    // Keep only last 1000 errors to prevent memory leaks
    if (this.errors.length > 1000) {
      this.errors = this.errors.slice(-1000);
    }
  }

  /**
   * Get error statistics
   */
  public getErrorStats(): {
    totalErrors: number;
    errorsBySeverity: Record<string, number>;
    errorsByEndpoint: Array<{ endpoint: string; count: number; severity: string }>;
    recentErrors: ErrorMetrics[];
    errorRate: number;
  } {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const recentErrors = this.errors.filter(e => e.timestamp.getTime() > oneHourAgo);

    // Count by severity
    const errorsBySeverity: Record<string, number> = {};
    recentErrors.forEach(error => {
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
    });

    // Count by endpoint
    const endpointCounts = new Map<string, { count: number; severity: string }>();
    recentErrors.forEach(error => {
      if (error.endpoint) {
        const key = `${error.method} ${error.endpoint}`;
        const existing = endpointCounts.get(key) || { count: 0, severity: error.severity };
        endpointCounts.set(key, {
          count: existing.count + 1,
          severity: this.getHighestSeverity(existing.severity, error.severity),
        });
      }
    });

    const errorsByEndpoint = Array.from(endpointCounts.entries())
      .map(([endpoint, data]) => ({
        endpoint,
        count: data.count,
        severity: data.severity,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalErrors: recentErrors.length,
      errorsBySeverity,
      errorsByEndpoint,
      recentErrors: recentErrors.slice(-20), // Last 20 errors
      errorRate: recentErrors.length / 60, // Errors per minute
    };
  }

  /**
   * Get active alerts
   */
  public getActiveAlerts(): Array<{
    ruleId: string;
    name: string;
    message: string;
    timestamp: Date;
    severity: string;
  }> {
    return this.alertHistory
      .filter(alert => !alert.resolved)
      .map(alert => ({
        ruleId: alert.ruleId,
        name: this.alertRules.find(r => r.id === alert.ruleId)?.name || 'Unknown',
        message: alert.message,
        timestamp: alert.timestamp,
        severity: this.getAlertSeverity(alert.ruleId),
      }));
  }

  /**
   * Add custom alert rule
   */
  public addAlertRule(rule: AlertRule): void {
    this.alertRules.push(rule);
  }

  /**
   * Update alert rule
   */
  public updateAlertRule(ruleId: string, updates: Partial<AlertRule>): void {
    const ruleIndex = this.alertRules.findIndex(r => r.id === ruleId);
    if (ruleIndex !== -1) {
      this.alertRules[ruleIndex] = { ...this.alertRules[ruleIndex], ...updates };
    }
  }

  /**
   * Resolve alert
   */
  public resolveAlert(ruleId: string): void {
    const alertIndex = this.alertHistory.findIndex(
      a => a.ruleId === ruleId && !a.resolved
    );
    if (alertIndex !== -1) {
      this.alertHistory[alertIndex].resolved = true;
    }
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: Error | AppError): 'low' | 'medium' | 'high' | 'critical' {
    if (error instanceof AppError) {
      if (error.statusCode >= 500) return 'critical';
      if (error.statusCode >= 400) return 'high';
      return 'medium';
    }

    // Check error message for severity indicators
    const message = error.message.toLowerCase();
    
    if (message.includes('database') || message.includes('connection')) {
      return 'critical';
    }
    
    if (message.includes('authentication') || message.includes('authorization')) {
      return 'high';
    }
    
    if (message.includes('validation') || message.includes('invalid')) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Setup default alert rules
   */
  private setupDefaultAlertRules(): void {
    // High error rate alert
    this.addAlertRule({
      id: 'high-error-rate',
      name: 'High Error Rate',
      condition: (errors) => errors.length > 10,
      threshold: 10,
      timeWindow: 5,
      enabled: true,
    });

    // Critical errors alert
    this.addAlertRule({
      id: 'critical-errors',
      name: 'Critical Errors Detected',
      condition: (errors) => errors.some(e => e.severity === 'critical'),
      threshold: 1,
      timeWindow: 1,
      enabled: true,
    });

    // Database errors alert
    this.addAlertRule({
      id: 'database-errors',
      name: 'Database Errors',
      condition: (errors) => errors.some(e => e.error.includes('database')),
      threshold: 1,
      timeWindow: 1,
      enabled: true,
    });

    // Authentication errors alert
    this.addAlertRule({
      id: 'auth-errors',
      name: 'Authentication Errors',
      condition: (errors) => errors.some(e => e.error.includes('authentication')),
      threshold: 5,
      timeWindow: 5,
      enabled: true,
    });
  }

  /**
   * Check alert rules
   */
  private checkAlertRules(): void {
    const now = Date.now();
    
    this.alertRules.forEach(rule => {
      if (!rule.enabled) return;

      const timeWindow = now - (rule.timeWindow * 60 * 1000);
      const recentErrors = this.errors.filter(e => e.timestamp.getTime() > timeWindow);
      
      if (rule.condition(recentErrors)) {
        // Check if alert already exists and is not resolved
        const existingAlert = this.alertHistory.find(
          a => a.ruleId === rule.id && !a.resolved
        );
        
        if (!existingAlert) {
          const message = this.generateAlertMessage(rule, recentErrors);
          this.alertHistory.push({
            ruleId: rule.id,
            timestamp: new Date(),
            message,
            resolved: false,
          });
          
          // Send alert notification
          this.sendAlert(rule, message);
        }
      }
    });
  }

  /**
   * Generate alert message
   */
  private generateAlertMessage(rule: AlertRule, errors: ErrorMetrics[]): string {
    switch (rule.id) {
      case 'high-error-rate':
        return `High error rate detected: ${errors.length} errors in the last ${rule.timeWindow} minutes`;
      case 'critical-errors':
        return `Critical error detected: ${errors.find(e => e.severity === 'critical')?.error}`;
      case 'database-errors':
        return `Database errors detected: ${errors.filter(e => e.error.includes('database')).length} errors`;
      case 'auth-errors':
        return `Authentication errors detected: ${errors.filter(e => e.error.includes('authentication')).length} errors`;
      default:
        return `Alert triggered: ${rule.name}`;
    }
  }

  /**
   * Send alert notification
   */
  private sendAlert(rule: AlertRule, message: string): void {
    // Log alert
    logger.error('Alert triggered', {
      ruleId: rule.id,
      ruleName: rule.name,
      message,
    });

    // Here you would integrate with your alerting system (Slack, email, etc.)
    // For now, we'll just log it
    console.log(`🚨 ALERT: ${rule.name} - ${message}`);
  }

  /**
   * Get highest severity between two severities
   */
  private getHighestSeverity(severity1: string, severity2: string): string {
    const severityOrder = ['low', 'medium', 'high', 'critical'];
    const index1 = severityOrder.indexOf(severity1);
    const index2 = severityOrder.indexOf(severity2);
    return index1 > index2 ? severity1 : severity2;
  }

  /**
   * Get alert severity based on rule
   */
  private getAlertSeverity(ruleId: string): string {
    switch (ruleId) {
      case 'critical-errors':
      case 'database-errors':
        return 'critical';
      case 'high-error-rate':
      case 'auth-errors':
        return 'high';
      default:
        return 'medium';
    }
  }

  /**
   * Clear old errors
   */
  public clearOldErrors(): void {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    this.errors = this.errors.filter(e => e.timestamp.getTime() > oneDayAgo);
    
    // Clear resolved alerts older than 7 days
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    this.alertHistory = this.alertHistory.filter(
      a => !a.resolved || a.timestamp.getTime() > sevenDaysAgo
    );
  }
}

export const errorMonitor = ErrorMonitor.getInstance();

