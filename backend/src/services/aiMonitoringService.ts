import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AIMetrics {
  timestamp: Date;
  modelType: string;
  performance: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
  usage: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
  };
  systemHealth: {
    cpuUsage: number;
    memoryUsage: number;
    storageUsage: number;
    networkLatency: number;
  };
  userFeedback: {
    positive: number;
    negative: number;
    neutral: number;
    total: number;
  };
}

export interface ModelDrift {
  modelType: string;
  driftScore: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;
  description: string;
  recommendations: string[];
}

export interface PerformanceAlert {
  id: string;
  type: 'performance_degradation' | 'high_error_rate' | 'slow_response' | 'model_drift';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  detectedAt: Date;
  resolvedAt?: Date;
  status: 'active' | 'resolved' | 'acknowledged';
  metrics: any;
  recommendations: string[];
}

export class AIMonitoringService {
  /**
   * Get AI metrics dashboard
   */
  async getAIMetricsDashboard(): Promise<{
    overallHealth: number;
    modelPerformance: { [key: string]: any };
    systemHealth: any;
    alerts: PerformanceAlert[];
    trends: {
      accuracy: Array<{ date: string; value: number }>;
      responseTime: Array<{ date: string; value: number }>;
      userSatisfaction: Array<{ date: string; value: number }>;
    };
  }> {
    try {
      const metrics = await this.getLatestMetrics();
      const alerts = await this.getActiveAlerts();
      const trends = await this.getPerformanceTrends();

      const overallHealth = this.calculateOverallHealth(metrics);
      const modelPerformance = this.aggregateModelPerformance(metrics);
      const systemHealth = this.aggregateSystemHealth(metrics);

      return {
        overallHealth,
        modelPerformance,
        systemHealth,
        alerts,
        trends
      };

    } catch (error) {
      console.error('Error getting AI metrics dashboard:', error);
      return {
        overallHealth: 0,
        modelPerformance: {},
        systemHealth: {},
        alerts: [],
        trends: {
          accuracy: [],
          responseTime: [],
          userSatisfaction: []
        }
      };
    }
  }

  /**
   * Get latest metrics
   */
  private async getLatestMetrics(): Promise<AIMetrics[]> {
    try {
      // Mock data - in real implementation, this would query the database
      return [
        {
          timestamp: new Date(),
          modelType: 'chatbot',
          performance: {
            accuracy: 0.92,
            precision: 0.89,
            recall: 0.91,
            f1Score: 0.90
          },
          usage: {
            totalRequests: 1500,
            successfulRequests: 1450,
            failedRequests: 50,
            averageResponseTime: 250
          },
          systemHealth: {
            cpuUsage: 45,
            memoryUsage: 60,
            storageUsage: 75,
            networkLatency: 120
          },
          userFeedback: {
            positive: 1200,
            negative: 50,
            neutral: 200,
            total: 1450
          }
        },
        {
          timestamp: new Date(),
          modelType: 'document_intelligence',
          performance: {
            accuracy: 0.88,
            precision: 0.86,
            recall: 0.89,
            f1Score: 0.87
          },
          usage: {
            totalRequests: 800,
            successfulRequests: 780,
            failedRequests: 20,
            averageResponseTime: 450
          },
          systemHealth: {
            cpuUsage: 55,
            memoryUsage: 70,
            storageUsage: 80,
            networkLatency: 150
          },
          userFeedback: {
            positive: 700,
            negative: 30,
            neutral: 50,
            total: 780
          }
        }
      ];

    } catch (error) {
      console.error('Error getting latest metrics:', error);
      return [];
    }
  }

  /**
   * Get active alerts
   */
  private async getActiveAlerts(): Promise<PerformanceAlert[]> {
    try {
      // Mock data - in real implementation, this would query the database
      return [
        {
          id: 'alert_1',
          type: 'performance_degradation',
          severity: 'medium',
          title: 'Chatbot Accuracy Decline',
          description: 'Chatbot accuracy has decreased by 5% over the last 24 hours',
          detectedAt: new Date(Date.now() - 3600000), // 1 hour ago
          status: 'active',
          metrics: {
            currentAccuracy: 0.87,
            previousAccuracy: 0.92,
            decline: 0.05
          },
          recommendations: [
            'Review recent training data quality',
            'Consider retraining the model',
            'Check for data drift in user inputs'
          ]
        },
        {
          id: 'alert_2',
          type: 'slow_response',
          severity: 'high',
          title: 'High Response Time',
          description: 'Average response time has increased to 800ms (threshold: 500ms)',
          detectedAt: new Date(Date.now() - 1800000), // 30 minutes ago
          status: 'active',
          metrics: {
            currentResponseTime: 800,
            threshold: 500,
            increase: 300
          },
          recommendations: [
            'Check system resources',
            'Optimize model inference',
            'Consider scaling infrastructure'
          ]
        }
      ];

    } catch (error) {
      console.error('Error getting active alerts:', error);
      return [];
    }
  }

  /**
   * Get performance trends
   */
  private async getPerformanceTrends(): Promise<{
    accuracy: Array<{ date: string; value: number }>;
    responseTime: Array<{ date: string; value: number }>;
    userSatisfaction: Array<{ date: string; value: number }>;
  }> {
    try {
      // Mock trend data - in real implementation, this would query historical data
      const dates = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }

      return {
        accuracy: dates.map(date => ({
          date,
          value: 0.85 + Math.random() * 0.1 // Random between 0.85-0.95
        })),
        responseTime: dates.map(date => ({
          date,
          value: 200 + Math.random() * 300 // Random between 200-500ms
        })),
        userSatisfaction: dates.map(date => ({
          date,
          value: 0.8 + Math.random() * 0.15 // Random between 0.8-0.95
        }))
      };

    } catch (error) {
      console.error('Error getting performance trends:', error);
      return {
        accuracy: [],
        responseTime: [],
        userSatisfaction: []
      };
    }
  }

  /**
   * Calculate overall health score
   */
  private calculateOverallHealth(metrics: AIMetrics[]): number {
    if (metrics.length === 0) return 0;

    const avgAccuracy = metrics.reduce((sum, m) => sum + m.performance.accuracy, 0) / metrics.length;
    const avgResponseTime = metrics.reduce((sum, m) => sum + m.usage.averageResponseTime, 0) / metrics.length;
    const avgSystemHealth = metrics.reduce((sum, m) => sum + (100 - m.systemHealth.cpuUsage), 0) / metrics.length;
    const avgUserSatisfaction = metrics.reduce((sum, m) => sum + (m.userFeedback.positive / m.userFeedback.total), 0) / metrics.length;

    const healthScore = (
      avgAccuracy * 0.3 +
      (avgResponseTime < 500 ? 1 : 500 / avgResponseTime) * 0.2 +
      (avgSystemHealth / 100) * 0.2 +
      avgUserSatisfaction * 0.3
    ) * 100;

    return Math.round(healthScore);
  }

  /**
   * Aggregate model performance
   */
  private aggregateModelPerformance(metrics: AIMetrics[]): { [key: string]: any } {
    const performance: { [key: string]: any } = {};

    metrics.forEach(metric => {
      if (!performance[metric.modelType]) {
        performance[metric.modelType] = {
          accuracy: 0,
          precision: 0,
          recall: 0,
          f1Score: 0,
          responseTime: 0,
          requests: 0,
          successRate: 0
        };
      }

      performance[metric.modelType].accuracy = metric.performance.accuracy;
      performance[metric.modelType].precision = metric.performance.precision;
      performance[metric.modelType].recall = metric.performance.recall;
      performance[metric.modelType].f1Score = metric.performance.f1Score;
      performance[metric.modelType].responseTime = metric.usage.averageResponseTime;
      performance[metric.modelType].requests = metric.usage.totalRequests;
      performance[metric.modelType].successRate = metric.usage.successfulRequests / metric.usage.totalRequests;
    });

    return performance;
  }

  /**
   * Aggregate system health
   */
  private aggregateSystemHealth(metrics: AIMetrics[]): any {
    if (metrics.length === 0) return {};

    const avgCpuUsage = metrics.reduce((sum, m) => sum + m.systemHealth.cpuUsage, 0) / metrics.length;
    const avgMemoryUsage = metrics.reduce((sum, m) => sum + m.systemHealth.memoryUsage, 0) / metrics.length;
    const avgStorageUsage = metrics.reduce((sum, m) => sum + m.systemHealth.storageUsage, 0) / metrics.length;
    const avgNetworkLatency = metrics.reduce((sum, m) => sum + m.systemHealth.networkLatency, 0) / metrics.length;

    return {
      cpuUsage: Math.round(avgCpuUsage),
      memoryUsage: Math.round(avgMemoryUsage),
      storageUsage: Math.round(avgStorageUsage),
      networkLatency: Math.round(avgNetworkLatency),
      healthScore: Math.round((100 - avgCpuUsage) * 0.4 + (100 - avgMemoryUsage) * 0.3 + (100 - avgStorageUsage) * 0.3)
    };
  }

  /**
   * Detect model drift
   */
  async detectModelDrift(modelType: string): Promise<ModelDrift | null> {
    try {
      // Mock drift detection - in real implementation, this would use statistical methods
      const driftScore = Math.random();
      
      if (driftScore > 0.7) {
        const severity = driftScore > 0.9 ? 'critical' : driftScore > 0.8 ? 'high' : 'medium';
        
        return {
          modelType,
          driftScore,
          severity,
          detectedAt: new Date(),
          description: `Model drift detected with score ${driftScore.toFixed(3)}`,
          recommendations: [
            'Retrain model with recent data',
            'Review feature importance',
            'Check for data quality issues',
            'Consider ensemble methods'
          ]
        };
      }

      return null;

    } catch (error) {
      console.error('Error detecting model drift:', error);
      return null;
    }
  }

  /**
   * Create performance alert
   */
  async createPerformanceAlert(alert: Omit<PerformanceAlert, 'id' | 'detectedAt'>): Promise<PerformanceAlert> {
    try {
      const newAlert: PerformanceAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        detectedAt: new Date(),
        ...alert
      };

      // In a real implementation, this would save to database
      console.log('Performance alert created:', newAlert);

      return newAlert;

    } catch (error) {
      console.error('Error creating performance alert:', error);
      throw error;
    }
  }

  /**
   * Resolve alert
   */
  async resolveAlert(alertId: string): Promise<boolean> {
    try {
      // In a real implementation, this would update the database
      console.log(`Alert ${alertId} resolved`);
      return true;

    } catch (error) {
      console.error('Error resolving alert:', error);
      return false;
    }
  }

  /**
   * Get model performance history
   */
  async getModelPerformanceHistory(modelType: string, days: number = 30): Promise<Array<{
    date: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    responseTime: number;
    requests: number;
  }>> {
    try {
      const history = [];
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        history.push({
          date: d.toISOString().split('T')[0],
          accuracy: 0.85 + Math.random() * 0.1,
          precision: 0.83 + Math.random() * 0.1,
          recall: 0.87 + Math.random() * 0.1,
          f1Score: 0.84 + Math.random() * 0.1,
          responseTime: 200 + Math.random() * 300,
          requests: Math.floor(Math.random() * 1000) + 500
        });
      }

      return history;

    } catch (error) {
      console.error('Error getting model performance history:', error);
      return [];
    }
  }

  /**
   * Get system health metrics
   */
  async getSystemHealthMetrics(): Promise<{
    cpu: Array<{ timestamp: string; usage: number }>;
    memory: Array<{ timestamp: string; usage: number }>;
    storage: Array<{ timestamp: string; usage: number }>;
    network: Array<{ timestamp: string; latency: number }>;
  }> {
    try {
      const now = new Date();
      const metrics = {
        cpu: [],
        memory: [],
        storage: [],
        network: []
      };

      // Generate mock data for the last 24 hours
      for (let i = 23; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000).toISOString();
        
        metrics.cpu.push({
          timestamp,
          usage: 40 + Math.random() * 30 // 40-70%
        });
        
        metrics.memory.push({
          timestamp,
          usage: 50 + Math.random() * 30 // 50-80%
        });
        
        metrics.storage.push({
          timestamp,
          usage: 60 + Math.random() * 20 // 60-80%
        });
        
        metrics.network.push({
          timestamp,
          latency: 100 + Math.random() * 100 // 100-200ms
        });
      }

      return metrics;

    } catch (error) {
      console.error('Error getting system health metrics:', error);
      return {
        cpu: [],
        memory: [],
        storage: [],
        network: []
      };
    }
  }

  /**
   * Get user feedback analytics
   */
  async getUserFeedbackAnalytics(): Promise<{
    overallSatisfaction: number;
    feedbackTrends: Array<{ date: string; positive: number; negative: number; neutral: number }>;
    commonIssues: Array<{ issue: string; count: number; percentage: number }>;
    improvementSuggestions: string[];
  }> {
    try {
      return {
        overallSatisfaction: 0.87,
        feedbackTrends: [
          { date: '2024-01-01', positive: 120, negative: 15, neutral: 25 },
          { date: '2024-01-02', positive: 135, negative: 12, neutral: 18 },
          { date: '2024-01-03', positive: 128, negative: 18, neutral: 22 }
        ],
        commonIssues: [
          { issue: 'Slow response time', count: 45, percentage: 0.3 },
          { issue: 'Inaccurate predictions', count: 30, percentage: 0.2 },
          { issue: 'Poor categorization', count: 25, percentage: 0.17 }
        ],
        improvementSuggestions: [
          'Optimize model inference speed',
          'Improve training data quality',
          'Add more diverse training examples',
          'Implement better error handling'
        ]
      };

    } catch (error) {
      console.error('Error getting user feedback analytics:', error);
      return {
        overallSatisfaction: 0,
        feedbackTrends: [],
        commonIssues: [],
        improvementSuggestions: []
      };
    }
  }
}

export default AIMonitoringService;










