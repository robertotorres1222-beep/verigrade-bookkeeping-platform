import { Request, Response } from 'express';
import profitabilityAnalyticsService from '../services/profitabilityAnalyticsService';

/**
 * Get profitability dashboard data
 */
export const getProfitabilityDashboard = async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).user?.organizationId;
    const { startDate, endDate } = req.query;

    if (!organizationId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // Default to 1 year ago
    const end = endDate ? new Date(endDate as string) : new Date();

    const dashboard = await profitabilityAnalyticsService.getProfitabilityDashboard(
      organizationId,
      start,
      end
    );

    res.json({
      success: true,
      dashboard
    });
  } catch (error) {
    console.error('Error getting profitability dashboard:', error);
    res.status(500).json({ 
      error: 'Failed to get profitability dashboard',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get client profitability analysis
 */
export const getClientProfitability = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const organizationId = (req as any).user?.organizationId;
    const { startDate, endDate } = req.query;

    if (!organizationId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const profitability = await profitabilityAnalyticsService.calculateClientProfitability(
      clientId,
      organizationId,
      start,
      end
    );

    res.json({
      success: true,
      profitability
    });
  } catch (error) {
    console.error('Error getting client profitability:', error);
    res.status(500).json({ 
      error: 'Failed to get client profitability',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get service profitability analysis
 */
export const getServiceProfitability = async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.params;
    const organizationId = (req as any).user?.organizationId;
    const { startDate, endDate } = req.query;

    if (!organizationId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const profitability = await profitabilityAnalyticsService.calculateServiceProfitability(
      serviceId,
      organizationId,
      start,
      end
    );

    res.json({
      success: true,
      profitability
    });
  } catch (error) {
    console.error('Error getting service profitability:', error);
    res.status(500).json({ 
      error: 'Failed to get service profitability',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Generate comprehensive profitability report
 */
export const generateProfitabilityReport = async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).user?.organizationId;
    const { startDate, endDate } = req.body;

    if (!organizationId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const report = await profitabilityAnalyticsService.generateProfitabilityReport(
      organizationId,
      start,
      end
    );

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Error generating profitability report:', error);
    res.status(500).json({ 
      error: 'Failed to generate profitability report',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get profitability trends
 */
export const getProfitabilityTrends = async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).user?.organizationId;
    const { period } = req.query; // 'monthly', 'quarterly', 'yearly'

    if (!organizationId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Calculate date range based on period
    const endDate = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'monthly':
        startDate = new Date(endDate.getTime() - 12 * 30 * 24 * 60 * 60 * 1000); // 12 months
        break;
      case 'quarterly':
        startDate = new Date(endDate.getTime() - 4 * 90 * 24 * 60 * 60 * 1000); // 4 quarters
        break;
      case 'yearly':
        startDate = new Date(endDate.getTime() - 5 * 365 * 24 * 60 * 60 * 1000); // 5 years
        break;
      default:
        startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000); // 1 year
    }

    const report = await profitabilityAnalyticsService.generateProfitabilityReport(
      organizationId,
      startDate,
      endDate
    );

    res.json({
      success: true,
      trends: report.metrics.trends,
      period: report.period
    });
  } catch (error) {
    console.error('Error getting profitability trends:', error);
    res.status(500).json({ 
      error: 'Failed to get profitability trends',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get profitability benchmarks
 */
export const getProfitabilityBenchmarks = async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).user?.organizationId;

    if (!organizationId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000); // 1 year

    const report = await profitabilityAnalyticsService.generateProfitabilityReport(
      organizationId,
      startDate,
      endDate
    );

    res.json({
      success: true,
      benchmarks: report.metrics.benchmarks,
      currentMetrics: {
        grossProfitMargin: report.metrics.grossProfitMargin,
        netProfitMargin: report.metrics.netProfitMargin,
        averageClientValue: report.metrics.averageClientValue
      }
    });
  } catch (error) {
    console.error('Error getting profitability benchmarks:', error);
    res.status(500).json({ 
      error: 'Failed to get profitability benchmarks',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get profitability alerts
 */
export const getProfitabilityAlerts = async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).user?.organizationId;

    if (!organizationId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days

    const dashboard = await profitabilityAnalyticsService.getProfitabilityDashboard(
      organizationId,
      startDate,
      endDate
    );

    res.json({
      success: true,
      alerts: dashboard.alerts
    });
  } catch (error) {
    console.error('Error getting profitability alerts:', error);
    res.status(500).json({ 
      error: 'Failed to get profitability alerts',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Export profitability report
 */
export const exportProfitabilityReport = async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).user?.organizationId;
    const { startDate, endDate, format } = req.body;

    if (!organizationId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const report = await profitabilityAnalyticsService.generateProfitabilityReport(
      organizationId,
      start,
      end
    );

    // Generate export based on format
    if (format === 'csv') {
      const csvData = generateCSVReport(report);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="profitability-report-${start.toISOString().split('T')[0]}-${end.toISOString().split('T')[0]}.csv"`);
      res.send(csvData);
    } else if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="profitability-report-${start.toISOString().split('T')[0]}-${end.toISOString().split('T')[0]}.json"`);
      res.json(report);
    } else {
      return res.status(400).json({ error: 'Unsupported export format' });
    }
  } catch (error) {
    console.error('Error exporting profitability report:', error);
    res.status(500).json({ 
      error: 'Failed to export profitability report',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Generate CSV report
 */
function generateCSVReport(report: any): string {
  const headers = [
    'Client Name',
    'Total Revenue',
    'Total Costs',
    'Gross Profit',
    'Gross Profit Margin (%)',
    'Project Count',
    'Average Project Value',
    'Risk Score',
    'Payment On Time',
    'Payment Late',
    'Payment Overdue'
  ];

  const rows = report.clients.map((client: any) => [
    client.clientName,
    client.totalRevenue,
    client.totalCosts,
    client.grossProfit,
    client.grossProfitMargin,
    client.projectCount,
    client.averageProjectValue,
    client.riskScore,
    client.paymentHistory.onTime,
    client.paymentHistory.late,
    client.paymentHistory.overdue
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  return csvContent;
}

