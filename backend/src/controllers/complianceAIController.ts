import { Request, Response } from 'express';
import CompliancePredictorService from '../services/compliancePredictorService';
import AutoAuditService from '../services/autoAuditService';
import RegulatoryMonitorService from '../services/regulatoryMonitorService';

const compliancePredictorService = new CompliancePredictorService();
const autoAuditService = new AutoAuditService();
const regulatoryMonitorService = new RegulatoryMonitorService();

/**
 * Get compliance risks
 */
export const getComplianceRisks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const risks = await compliancePredictorService.generateComplianceRiskPredictions(userId);
    const complianceScore = await compliancePredictorService.getComplianceScore(userId);

    res.json({
      risks,
      complianceScore,
      success: true
    });

  } catch (error) {
    console.error('Error getting compliance risks:', error);
    res.status(500).json({ 
      error: 'Failed to get compliance risks',
      success: false 
    });
  }
};

/**
 * Generate audit report
 */
export const generateAuditReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { reportType, startDate, endDate } = req.body;

    if (!reportType || !startDate || !endDate) {
      res.status(400).json({ 
        error: 'Report type, start date, and end date are required',
        success: false 
      });
      return;
    }

    const period = {
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    };

    const report = await autoAuditService.generateAuditReport(userId, reportType, period);

    res.json({
      report,
      success: true
    });

  } catch (error) {
    console.error('Error generating audit report:', error);
    res.status(500).json({ 
      error: 'Failed to generate audit report',
      success: false 
    });
  }
};

/**
 * Get regulatory updates
 */
export const getRegulatoryUpdates = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const updates = await regulatoryMonitorService.getRegulatoryUpdates(userId);
    const calendar = await regulatoryMonitorService.getComplianceCalendar(userId);

    res.json({
      updates,
      calendar,
      success: true
    });

  } catch (error) {
    console.error('Error getting regulatory updates:', error);
    res.status(500).json({ 
      error: 'Failed to get regulatory updates',
      success: false 
    });
  }
};

/**
 * Get compliance score
 */
export const getComplianceScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const complianceScore = await compliancePredictorService.getComplianceScore(userId);

    res.json({
      complianceScore,
      success: true
    });

  } catch (error) {
    console.error('Error getting compliance score:', error);
    res.status(500).json({ 
      error: 'Failed to get compliance score',
      success: false 
    });
  }
};

/**
 * Get compliance dashboard
 */
export const getComplianceDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const [
      risks,
      complianceScore,
      regulatoryDashboard,
      auditSummary
    ] = await Promise.all([
      compliancePredictorService.generateComplianceRiskPredictions(userId),
      compliancePredictorService.getComplianceScore(userId),
      regulatoryMonitorService.getRegulatoryMonitoringDashboard(userId),
      autoAuditService.getAuditReportSummary(userId)
    ]);

    const dashboard = {
      risks,
      complianceScore,
      regulatoryUpdates: regulatoryDashboard.updates,
      complianceCalendar: regulatoryDashboard.calendar,
      auditSummary,
      insights: {
        totalRisks: risks.length,
        criticalRisks: risks.filter(r => r.riskLevel === 'critical').length,
        highRisks: risks.filter(r => r.riskLevel === 'high').length,
        upcomingDeadlines: regulatoryDashboard.calendar.filter(c => c.status === 'upcoming').length,
        complianceScore: complianceScore.overallScore
      }
    };

    res.json({
      dashboard,
      success: true
    });

  } catch (error) {
    console.error('Error getting compliance dashboard:', error);
    res.status(500).json({ 
      error: 'Failed to get compliance dashboard',
      success: false 
    });
  }
};

/**
 * Get regulatory impact analysis
 */
export const getRegulatoryImpactAnalysis = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { regulationId } = req.body;

    if (!regulationId) {
      res.status(400).json({ 
        error: 'Regulation ID is required',
        success: false 
      });
      return;
    }

    const impactAnalysis = await regulatoryMonitorService.analyzeRegulatoryImpact(userId, regulationId);

    res.json({
      impactAnalysis,
      success: true
    });

  } catch (error) {
    console.error('Error getting regulatory impact analysis:', error);
    res.status(500).json({ 
      error: 'Failed to get regulatory impact analysis',
      success: false 
    });
  }
};

/**
 * Get compliance analytics
 */
export const getComplianceAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const [
      risks,
      complianceScore,
      regulatoryDashboard,
      auditSummary
    ] = await Promise.all([
      compliancePredictorService.generateComplianceRiskPredictions(userId),
      compliancePredictorService.getComplianceScore(userId),
      regulatoryMonitorService.getRegulatoryMonitoringDashboard(userId),
      autoAuditService.getAuditReportSummary(userId)
    ]);

    const analytics = {
      riskDistribution: {
        critical: risks.filter(r => r.riskLevel === 'critical').length,
        high: risks.filter(r => r.riskLevel === 'high').length,
        medium: risks.filter(r => r.riskLevel === 'medium').length,
        low: risks.filter(r => r.riskLevel === 'low').length
      },
      complianceMetrics: {
        overallScore: complianceScore.overallScore,
        taxCompliance: complianceScore.taxCompliance,
        regulatoryCompliance: complianceScore.regulatoryCompliance,
        auditReadiness: complianceScore.auditReadiness,
        dataPrivacy: complianceScore.dataPrivacy,
        financialReporting: complianceScore.financialReporting
      },
      regulatoryMetrics: {
        totalUpdates: regulatoryDashboard.insights.totalUpdates,
        criticalUpdates: regulatoryDashboard.insights.criticalUpdates,
        upcomingDeadlines: regulatoryDashboard.insights.upcomingDeadlines
      },
      auditMetrics: {
        totalReports: auditSummary.totalReports,
        complianceTrends: auditSummary.complianceTrends,
        riskDistribution: auditSummary.riskDistribution
      }
    };

    res.json({
      analytics,
      success: true
    });

  } catch (error) {
    console.error('Error getting compliance analytics:', error);
    res.status(500).json({ 
      error: 'Failed to get compliance analytics',
      success: false 
    });
  }
};

/**
 * Get compliance priorities
 */
export const getCompliancePriorities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const [
      risks,
      regulatoryDashboard
    ] = await Promise.all([
      compliancePredictorService.generateComplianceRiskPredictions(userId),
      regulatoryMonitorService.getRegulatoryMonitoringDashboard(userId)
    ]);

    const priorities = {
      critical: risks.filter(r => r.riskLevel === 'critical'),
      high: risks.filter(r => r.riskLevel === 'high'),
      medium: risks.filter(r => r.riskLevel === 'medium'),
      low: risks.filter(r => r.riskLevel === 'low')
    };

    const priorityScores = {
      critical: priorities.critical.reduce((sum, r) => sum + r.riskScore, 0),
      high: priorities.high.reduce((sum, r) => sum + r.riskScore, 0),
      medium: priorities.medium.reduce((sum, r) => sum + r.riskScore, 0),
      low: priorities.low.reduce((sum, r) => sum + r.riskScore, 0)
    };

    const upcomingDeadlines = regulatoryDashboard.calendar.filter(c => c.status === 'upcoming');
    const overdueDeadlines = regulatoryDashboard.calendar.filter(c => c.status === 'overdue');

    res.json({
      priorities,
      priorityScores,
      upcomingDeadlines,
      overdueDeadlines,
      totalRisks: risks.length,
      success: true
    });

  } catch (error) {
    console.error('Error getting compliance priorities:', error);
    res.status(500).json({ 
      error: 'Failed to get compliance priorities',
      success: false 
    });
  }
};

export default {
  getComplianceRisks,
  generateAuditReport,
  getRegulatoryUpdates,
  getComplianceScore,
  getComplianceDashboard,
  getRegulatoryImpactAnalysis,
  getComplianceAnalytics,
  getCompliancePriorities
};







