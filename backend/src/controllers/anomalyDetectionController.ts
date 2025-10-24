import { Request, Response } from 'express';
import { AnomalyDetectionService } from '../services/anomalyDetectionService';
import { logger } from '../utils/logger';

const anomalyDetectionService = new AnomalyDetectionService();

export class AnomalyDetectionController {
  /**
   * Detect financial anomalies
   */
  async detectFinancialAnomalies(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const analysis = await anomalyDetectionService.detectFinancialAnomalies(companyId);

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      logger.error('Error detecting financial anomalies:', error);
      res.status(500).json({
        success: false,
        message: 'Error detecting financial anomalies',
        error: error.message
      });
    }
  }

  /**
   * Detect vendor anomalies
   */
  async detectVendorAnomalies(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const analysis = await anomalyDetectionService.detectVendorAnomalies(companyId);

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      logger.error('Error detecting vendor anomalies:', error);
      res.status(500).json({
        success: false,
        message: 'Error detecting vendor anomalies',
        error: error.message
      });
    }
  }

  /**
   * Detect employee anomalies
   */
  async detectEmployeeAnomalies(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const analysis = await anomalyDetectionService.detectEmployeeAnomalies(companyId);

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      logger.error('Error detecting employee anomalies:', error);
      res.status(500).json({
        success: false,
        message: 'Error detecting employee anomalies',
        error: error.message
      });
    }
  }

  /**
   * Get anomaly detection dashboard
   */
  async getAnomalyDetectionDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await anomalyDetectionService.getAnomalyDetectionDashboard(companyId);

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      logger.error('Error getting anomaly detection dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting anomaly detection dashboard',
        error: error.message
      });
    }
  }

  /**
   * Save anomaly detection analysis
   */
  async saveAnomalyDetectionAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const analysisData = req.body;

      if (!analysisData.type || !analysisData.data) {
        res.status(400).json({
          success: false,
          message: 'Analysis type and data are required'
        });
        return;
      }

      const analysis = await anomalyDetectionService.saveAnomalyDetectionAnalysis(companyId, analysisData);

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      logger.error('Error saving anomaly detection analysis:', error);
      res.status(500).json({
        success: false,
        message: 'Error saving anomaly detection analysis',
        error: error.message
      });
    }
  }

  /**
   * Get anomaly statistics
   */
  async getAnomalyStats(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await anomalyDetectionService.getAnomalyDetectionDashboard(companyId);
      const anomalyStats = dashboard.anomalyStats;

      res.json({
        success: true,
        data: anomalyStats
      });
    } catch (error) {
      logger.error('Error getting anomaly stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting anomaly stats',
        error: error.message
      });
    }
  }

  /**
   * Get recent analyses
   */
  async getRecentAnalyses(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { limit = '20' } = req.query;

      const dashboard = await anomalyDetectionService.getAnomalyDetectionDashboard(companyId);
      const recentAnalyses = dashboard.recentAnalyses;

      res.json({
        success: true,
        data: recentAnalyses
      });
    } catch (error) {
      logger.error('Error getting recent analyses:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting recent analyses',
        error: error.message
      });
    }
  }

  /**
   * Get alert summary
   */
  async getAlertSummary(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await anomalyDetectionService.getAnomalyDetectionDashboard(companyId);
      const alertSummary = dashboard.alertSummary;

      res.json({
        success: true,
        data: alertSummary
      });
    } catch (error) {
      logger.error('Error getting alert summary:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting alert summary',
        error: error.message
      });
    }
  }

  /**
   * Get trend analysis
   */
  async getTrendAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { days = '30' } = req.query;

      const dashboard = await anomalyDetectionService.getAnomalyDetectionDashboard(companyId);
      const trendAnalysis = dashboard.trendAnalysis;

      res.json({
        success: true,
        data: trendAnalysis
      });
    } catch (error) {
      logger.error('Error getting trend analysis:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting trend analysis',
        error: error.message
      });
    }
  }

  /**
   * Get anomaly alerts
   */
  async getAnomalyAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { severity, type } = req.query;

      const analysis = await anomalyDetectionService.detectFinancialAnomalies(companyId);
      const alerts = this.generateAnomalyAlerts(analysis);

      // Filter by severity
      let filteredAlerts = alerts;
      if (severity) {
        filteredAlerts = filteredAlerts.filter((alert: any) => alert.severity === severity);
      }

      // Filter by type
      if (type) {
        filteredAlerts = filteredAlerts.filter((alert: any) => alert.type === type);
      }

      res.json({
        success: true,
        data: filteredAlerts
      });
    } catch (error) {
      logger.error('Error getting anomaly alerts:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting anomaly alerts',
        error: error.message
      });
    }
  }

  /**
   * Generate anomaly alerts
   */
  private generateAnomalyAlerts(analysis: any): any[] {
    const alerts = [];
    
    // Critical alerts
    if (analysis.overallAnomalyScore >= 80) {
      alerts.push({
        type: 'critical',
        severity: 'critical',
        title: 'Critical Anomalies Detected',
        description: `Overall anomaly score is ${analysis.overallAnomalyScore}%. Immediate investigation required.`,
        action: 'Review all detected anomalies immediately',
        timestamp: new Date()
      });
    }
    
    // High priority alerts
    if (analysis.spendingAnomalies && analysis.spendingAnomalies.length > 0) {
      const criticalSpending = analysis.spendingAnomalies.filter((anomaly: any) => 
        anomaly.anomaly_severity === 'critical'
      );
      
      if (criticalSpending.length > 0) {
        alerts.push({
          type: 'spending',
          severity: 'high',
          title: 'Critical Spending Anomalies',
          description: `${criticalSpending.length} critical spending anomalies detected.`,
          action: 'Review unusual spending patterns immediately',
          timestamp: new Date()
        });
      }
    }
    
    if (analysis.cashFlowAnomalies && analysis.cashFlowAnomalies.length > 0) {
      const criticalCashFlow = analysis.cashFlowAnomalies.filter((anomaly: any) => 
        anomaly.anomaly_severity === 'critical'
      );
      
      if (criticalCashFlow.length > 0) {
        alerts.push({
          type: 'cash_flow',
          severity: 'high',
          title: 'Critical Cash Flow Anomalies',
          description: `${criticalCashFlow.length} critical cash flow anomalies detected.`,
          action: 'Review cash flow patterns immediately',
          timestamp: new Date()
        });
      }
    }
    
    // Medium priority alerts
    if (analysis.revenueAnomalies && analysis.revenueAnomalies.length > 0) {
      const highRevenue = analysis.revenueAnomalies.filter((anomaly: any) => 
        anomaly.anomaly_severity === 'high'
      );
      
      if (highRevenue.length > 0) {
        alerts.push({
          type: 'revenue',
          severity: 'medium',
          title: 'High Revenue Anomalies',
          description: `${highRevenue.length} high revenue anomalies detected.`,
          action: 'Review revenue patterns',
          timestamp: new Date()
        });
      }
    }
    
    if (analysis.transactionAnomalies && analysis.transactionAnomalies.length > 0) {
      const highTransactions = analysis.transactionAnomalies.filter((anomaly: any) => 
        anomaly.anomaly_severity === 'high'
      );
      
      if (highTransactions.length > 0) {
        alerts.push({
          type: 'transaction',
          severity: 'medium',
          title: 'High Transaction Anomalies',
          description: `${highTransactions.length} high transaction anomalies detected.`,
          action: 'Review transaction patterns',
          timestamp: new Date()
        });
      }
    }
    
    return alerts;
  }

  /**
   * Get anomaly patterns
   */
  async getAnomalyPatterns(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const analysis = await anomalyDetectionService.detectFinancialAnomalies(companyId);
      const patterns = this.analyzeAnomalyPatterns(analysis);

      res.json({
        success: true,
        data: patterns
      });
    } catch (error) {
      logger.error('Error getting anomaly patterns:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting anomaly patterns',
        error: error.message
      });
    }
  }

  /**
   * Analyze anomaly patterns
   */
  private analyzeAnomalyPatterns(analysis: any): any {
    const patterns = {
      spendingPatterns: this.analyzeSpendingPatterns(analysis.spendingAnomalies || []),
      revenuePatterns: this.analyzeRevenuePatterns(analysis.revenueAnomalies || []),
      cashFlowPatterns: this.analyzeCashFlowPatterns(analysis.cashFlowAnomalies || []),
      transactionPatterns: this.analyzeTransactionPatterns(analysis.transactionAnomalies || [])
    };

    return patterns;
  }

  /**
   * Analyze spending patterns
   */
  private analyzeSpendingPatterns(anomalies: any[]): any {
    const patterns = {
      totalAnomalies: anomalies.length,
      criticalAnomalies: anomalies.filter(a => a.anomaly_severity === 'critical').length,
      highAnomalies: anomalies.filter(a => a.anomaly_severity === 'high').length,
      averageDeviation: anomalies.reduce((sum, a) => sum + (a.deviation_percentage || 0), 0) / anomalies.length || 0,
      commonTypes: this.getCommonAnomalyTypes(anomalies)
    };

    return patterns;
  }

  /**
   * Analyze revenue patterns
   */
  private analyzeRevenuePatterns(anomalies: any[]): any {
    const patterns = {
      totalAnomalies: anomalies.length,
      criticalAnomalies: anomalies.filter(a => a.anomaly_severity === 'critical').length,
      highAnomalies: anomalies.filter(a => a.anomaly_severity === 'high').length,
      averageDeviation: anomalies.reduce((sum, a) => sum + (a.deviation_percentage || 0), 0) / anomalies.length || 0,
      commonTypes: this.getCommonAnomalyTypes(anomalies)
    };

    return patterns;
  }

  /**
   * Analyze cash flow patterns
   */
  private analyzeCashFlowPatterns(anomalies: any[]): any {
    const patterns = {
      totalAnomalies: anomalies.length,
      criticalAnomalies: anomalies.filter(a => a.anomaly_severity === 'critical').length,
      highAnomalies: anomalies.filter(a => a.anomaly_severity === 'high').length,
      averageDeviation: anomalies.reduce((sum, a) => sum + (a.deviation_percentage || 0), 0) / anomalies.length || 0,
      commonTypes: this.getCommonAnomalyTypes(anomalies)
    };

    return patterns;
  }

  /**
   * Analyze transaction patterns
   */
  private analyzeTransactionPatterns(anomalies: any[]): any {
    const patterns = {
      totalAnomalies: anomalies.length,
      criticalAnomalies: anomalies.filter(a => a.anomaly_severity === 'critical').length,
      highAnomalies: anomalies.filter(a => a.anomaly_severity === 'high').length,
      averageDeviation: anomalies.reduce((sum, a) => sum + (a.deviation_percentage || 0), 0) / anomalies.length || 0,
      commonTypes: this.getCommonAnomalyTypes(anomalies)
    };

    return patterns;
  }

  /**
   * Get common anomaly types
   */
  private getCommonAnomalyTypes(anomalies: any[]): any[] {
    const typeCounts = anomalies.reduce((counts, anomaly) => {
      const type = anomaly.anomaly_type || 'unknown';
      counts[type] = (counts[type] || 0) + 1;
      return counts;
    }, {});

    return Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }
}