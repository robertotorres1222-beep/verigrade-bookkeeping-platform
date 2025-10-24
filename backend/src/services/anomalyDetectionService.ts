import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class AnomalyDetectionService {
  /**
   * Detect financial anomalies
   */
  async detectFinancialAnomalies(companyId: string): Promise<any> {
    try {
      const [
        spendingAnomalies,
        revenueAnomalies,
        cashFlowAnomalies,
        transactionAnomalies
      ] = await Promise.all([
        this.detectSpendingAnomalies(companyId),
        this.detectRevenueAnomalies(companyId),
        this.detectCashFlowAnomalies(companyId),
        this.detectTransactionAnomalies(companyId)
      ]);

      return {
        spendingAnomalies,
        revenueAnomalies,
        cashFlowAnomalies,
        transactionAnomalies,
        overallAnomalyScore: this.calculateOverallAnomalyScore({
          spendingAnomalies,
          revenueAnomalies,
          cashFlowAnomalies,
          transactionAnomalies
        }),
        recommendations: this.generateAnomalyRecommendations({
          spendingAnomalies,
          revenueAnomalies,
          cashFlowAnomalies,
          transactionAnomalies
        })
      };
    } catch (error) {
      logger.error('Error detecting financial anomalies:', error);
      throw error;
    }
  }

  /**
   * Detect spending anomalies
   */
  private async detectSpendingAnomalies(companyId: string): Promise<any> {
    try {
      const spendingData = await prisma.$queryRaw`
        WITH spending_analysis AS (
          SELECT 
            DATE_TRUNC('day', created_at) as transaction_date,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as daily_expenses,
            COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count,
            AVG(CASE WHEN type = 'expense' THEN amount ELSE NULL END) as avg_expense_amount
          FROM transactions
          WHERE company_id = ${companyId}
          AND created_at >= CURRENT_DATE - INTERVAL '90 days'
          GROUP BY DATE_TRUNC('day', created_at)
        ),
        spending_stats AS (
          SELECT 
            AVG(daily_expenses) as avg_daily_spending,
            STDDEV(daily_expenses) as spending_stddev,
            PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY daily_expenses) as spending_95th_percentile,
            PERCENTILE_CONT(0.05) WITHIN GROUP (ORDER BY daily_expenses) as spending_5th_percentile
          FROM spending_analysis
        ),
        anomaly_detection AS (
          SELECT 
            sa.*,
            ss.avg_daily_spending,
            ss.spending_stddev,
            ss.spending_95th_percentile,
            ss.spending_5th_percentile,
            CASE 
              WHEN sa.daily_expenses > ss.avg_daily_spending + (ss.spending_stddev * 2) THEN 'high_spending'
              WHEN sa.daily_expenses < ss.avg_daily_spending - (ss.spending_stddev * 2) THEN 'low_spending'
              WHEN sa.daily_expenses > ss.spending_95th_percentile THEN 'outlier_high'
              WHEN sa.daily_expenses < ss.spending_5th_percentile THEN 'outlier_low'
              ELSE 'normal'
            END as anomaly_type,
            CASE 
              WHEN sa.daily_expenses > ss.avg_daily_spending + (ss.spending_stddev * 3) THEN 'critical'
              WHEN sa.daily_expenses > ss.avg_daily_spending + (ss.spending_stddev * 2) THEN 'high'
              WHEN sa.daily_expenses < ss.avg_daily_spending - (ss.spending_stddev * 2) THEN 'medium'
              ELSE 'low'
            END as anomaly_severity
          FROM spending_analysis sa
          CROSS JOIN spending_stats ss
        )
        SELECT 
          *,
          CASE 
            WHEN anomaly_type != 'normal' THEN 
              ABS(daily_expenses - avg_daily_spending) / avg_daily_spending * 100
            ELSE 0
          END as deviation_percentage
        FROM anomaly_detection
        WHERE anomaly_type != 'normal'
        ORDER BY deviation_percentage DESC
      `;

      return spendingData;
    } catch (error) {
      logger.error('Error detecting spending anomalies:', error);
      throw error;
    }
  }

  /**
   * Detect revenue anomalies
   */
  private async detectRevenueAnomalies(companyId: string): Promise<any> {
    try {
      const revenueData = await prisma.$queryRaw`
        WITH revenue_analysis AS (
          SELECT 
            DATE_TRUNC('day', created_at) as transaction_date,
            SUM(CASE WHEN type = 'revenue' THEN amount ELSE 0 END) as daily_revenue,
            COUNT(CASE WHEN type = 'revenue' THEN 1 END) as revenue_count,
            AVG(CASE WHEN type = 'revenue' THEN amount ELSE NULL END) as avg_revenue_amount
          FROM transactions
          WHERE company_id = ${companyId}
          AND created_at >= CURRENT_DATE - INTERVAL '90 days'
          GROUP BY DATE_TRUNC('day', created_at)
        ),
        revenue_stats AS (
          SELECT 
            AVG(daily_revenue) as avg_daily_revenue,
            STDDEV(daily_revenue) as revenue_stddev,
            PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY daily_revenue) as revenue_95th_percentile,
            PERCENTILE_CONT(0.05) WITHIN GROUP (ORDER BY daily_revenue) as revenue_5th_percentile
          FROM revenue_analysis
        ),
        anomaly_detection AS (
          SELECT 
            ra.*,
            rs.avg_daily_revenue,
            rs.revenue_stddev,
            rs.revenue_95th_percentile,
            rs.revenue_5th_percentile,
            CASE 
              WHEN ra.daily_revenue > rs.avg_daily_revenue + (rs.revenue_stddev * 2) THEN 'high_revenue'
              WHEN ra.daily_revenue < rs.avg_daily_revenue - (rs.revenue_stddev * 2) THEN 'low_revenue'
              WHEN ra.daily_revenue > rs.revenue_95th_percentile THEN 'outlier_high'
              WHEN ra.daily_revenue < rs.revenue_5th_percentile THEN 'outlier_low'
              ELSE 'normal'
            END as anomaly_type,
            CASE 
              WHEN ra.daily_revenue > rs.avg_daily_revenue + (rs.revenue_stddev * 3) THEN 'critical'
              WHEN ra.daily_revenue > rs.avg_daily_revenue + (rs.revenue_stddev * 2) THEN 'high'
              WHEN ra.daily_revenue < rs.avg_daily_revenue - (rs.revenue_stddev * 2) THEN 'medium'
              ELSE 'low'
            END as anomaly_severity
          FROM revenue_analysis ra
          CROSS JOIN revenue_stats rs
        )
        SELECT 
          *,
          CASE 
            WHEN anomaly_type != 'normal' THEN 
              ABS(daily_revenue - avg_daily_revenue) / avg_daily_revenue * 100
            ELSE 0
          END as deviation_percentage
        FROM anomaly_detection
        WHERE anomaly_type != 'normal'
        ORDER BY deviation_percentage DESC
      `;

      return revenueData;
    } catch (error) {
      logger.error('Error detecting revenue anomalies:', error);
      throw error;
    }
  }

  /**
   * Detect cash flow anomalies
   */
  private async detectCashFlowAnomalies(companyId: string): Promise<any> {
    try {
      const cashFlowData = await prisma.$queryRaw`
        WITH cash_flow_analysis AS (
          SELECT 
            DATE_TRUNC('day', created_at) as transaction_date,
            SUM(CASE WHEN type = 'revenue' THEN amount ELSE -amount END) as daily_cash_flow,
            SUM(CASE WHEN type = 'revenue' THEN amount ELSE 0 END) as daily_revenue,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as daily_expenses
          FROM transactions
          WHERE company_id = ${companyId}
          AND created_at >= CURRENT_DATE - INTERVAL '90 days'
          GROUP BY DATE_TRUNC('day', created_at)
        ),
        cash_flow_stats AS (
          SELECT 
            AVG(daily_cash_flow) as avg_daily_cash_flow,
            STDDEV(daily_cash_flow) as cash_flow_stddev,
            PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY daily_cash_flow) as cash_flow_95th_percentile,
            PERCENTILE_CONT(0.05) WITHIN GROUP (ORDER BY daily_cash_flow) as cash_flow_5th_percentile
          FROM cash_flow_analysis
        ),
        anomaly_detection AS (
          SELECT 
            cfa.*,
            cfs.avg_daily_cash_flow,
            cfs.cash_flow_stddev,
            cfs.cash_flow_95th_percentile,
            cfs.cash_flow_5th_percentile,
            CASE 
              WHEN cfa.daily_cash_flow > cfs.avg_daily_cash_flow + (cfs.cash_flow_stddev * 2) THEN 'positive_cash_flow'
              WHEN cfa.daily_cash_flow < cfs.avg_daily_cash_flow - (cfs.cash_flow_stddev * 2) THEN 'negative_cash_flow'
              WHEN cfa.daily_cash_flow > cfs.cash_flow_95th_percentile THEN 'outlier_high'
              WHEN cfa.daily_cash_flow < cfs.cash_flow_5th_percentile THEN 'outlier_low'
              ELSE 'normal'
            END as anomaly_type,
            CASE 
              WHEN cfa.daily_cash_flow < cfs.avg_daily_cash_flow - (cfs.cash_flow_stddev * 3) THEN 'critical'
              WHEN cfa.daily_cash_flow < cfs.avg_daily_cash_flow - (cfs.cash_flow_stddev * 2) THEN 'high'
              WHEN cfa.daily_cash_flow > cfs.avg_daily_cash_flow + (cfs.cash_flow_stddev * 2) THEN 'medium'
              ELSE 'low'
            END as anomaly_severity
          FROM cash_flow_analysis cfa
          CROSS JOIN cash_flow_stats cfs
        )
        SELECT 
          *,
          CASE 
            WHEN anomaly_type != 'normal' THEN 
              ABS(daily_cash_flow - avg_daily_cash_flow) / ABS(avg_daily_cash_flow) * 100
            ELSE 0
          END as deviation_percentage
        FROM anomaly_detection
        WHERE anomaly_type != 'normal'
        ORDER BY deviation_percentage DESC
      `;

      return cashFlowData;
    } catch (error) {
      logger.error('Error detecting cash flow anomalies:', error);
      throw error;
    }
  }

  /**
   * Detect transaction anomalies
   */
  private async detectTransactionAnomalies(companyId: string): Promise<any> {
    try {
      const transactionData = await prisma.$queryRaw`
        WITH transaction_analysis AS (
          SELECT 
            t.id,
            t.amount,
            t.type,
            t.description,
            t.created_at,
            c.name as customer_name,
            v.name as vendor_name,
            e.name as employee_name,
            d.name as department_name
          FROM transactions t
          LEFT JOIN customers c ON t.customer_id = c.id
          LEFT JOIN vendors v ON t.vendor_id = v.id
          LEFT JOIN employees e ON t.employee_id = e.id
          LEFT JOIN departments d ON e.department_id = d.id
          WHERE t.company_id = ${companyId}
          AND t.created_at >= CURRENT_DATE - INTERVAL '30 days'
        ),
        amount_stats AS (
          SELECT 
            AVG(amount) as avg_amount,
            STDDEV(amount) as amount_stddev,
            PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY amount) as amount_95th_percentile,
            PERCENTILE_CONT(0.05) WITHIN GROUP (ORDER BY amount) as amount_5th_percentile
          FROM transaction_analysis
        ),
        anomaly_detection AS (
          SELECT 
            ta.*,
            ast.avg_amount,
            ast.amount_stddev,
            ast.amount_95th_percentile,
            ast.amount_5th_percentile,
            CASE 
              WHEN ta.amount > ast.avg_amount + (ast.amount_stddev * 3) THEN 'high_amount'
              WHEN ta.amount < ast.avg_amount - (ast.amount_stddev * 3) THEN 'low_amount'
              WHEN ta.amount > ast.amount_95th_percentile THEN 'outlier_high'
              WHEN ta.amount < ast.amount_5th_percentile THEN 'outlier_low'
              WHEN ta.amount = 0 THEN 'zero_amount'
              WHEN ta.amount < 0 AND ta.type = 'revenue' THEN 'negative_revenue'
              WHEN ta.amount > 0 AND ta.type = 'expense' THEN 'positive_expense'
              ELSE 'normal'
            END as anomaly_type,
            CASE 
              WHEN ta.amount > ast.avg_amount + (ast.amount_stddev * 3) THEN 'critical'
              WHEN ta.amount < ast.avg_amount - (ast.amount_stddev * 3) THEN 'high'
              WHEN ta.amount > ast.amount_95th_percentile OR ta.amount < ast.amount_5th_percentile THEN 'medium'
              ELSE 'low'
            END as anomaly_severity
          FROM transaction_analysis ta
          CROSS JOIN amount_stats ast
        )
        SELECT 
          *,
          CASE 
            WHEN anomaly_type != 'normal' THEN 
              ABS(amount - avg_amount) / avg_amount * 100
            ELSE 0
          END as deviation_percentage
        FROM anomaly_detection
        WHERE anomaly_type != 'normal'
        ORDER BY deviation_percentage DESC
      `;

      return transactionData;
    } catch (error) {
      logger.error('Error detecting transaction anomalies:', error);
      throw error;
    }
  }

  /**
   * Detect vendor anomalies
   */
  async detectVendorAnomalies(companyId: string): Promise<any> {
    try {
      const vendorData = await prisma.$queryRaw`
        WITH vendor_analysis AS (
          SELECT 
            v.id,
            v.name,
            v.email,
            v.phone,
            COUNT(t.id) as transaction_count,
            SUM(t.amount) as total_spent,
            AVG(t.amount) as avg_transaction_amount,
            MAX(t.created_at) as last_transaction_date,
            MIN(t.created_at) as first_transaction_date,
            COUNT(CASE WHEN t.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_transactions,
            COUNT(CASE WHEN t.created_at >= CURRENT_DATE - INTERVAL '90 days' THEN 1 END) as quarterly_transactions
          FROM vendors v
          LEFT JOIN transactions t ON v.id = t.vendor_id
          WHERE v.company_id = ${companyId}
          GROUP BY v.id, v.name, v.email, v.phone
        ),
        vendor_stats AS (
          SELECT 
            AVG(total_spent) as avg_vendor_spending,
            STDDEV(total_spent) as spending_stddev,
            AVG(transaction_count) as avg_transaction_count,
            STDDEV(transaction_count) as transaction_count_stddev
          FROM vendor_analysis
        ),
        anomaly_detection AS (
          SELECT 
            va.*,
            vs.avg_vendor_spending,
            vs.spending_stddev,
            vs.avg_transaction_count,
            vs.transaction_count_stddev,
            CASE 
              WHEN va.total_spent > vs.avg_vendor_spending + (vs.spending_stddev * 2) THEN 'high_spending'
              WHEN va.total_spent < vs.avg_vendor_spending - (vs.spending_stddev * 2) THEN 'low_spending'
              WHEN va.transaction_count > vs.avg_transaction_count + (vs.transaction_count_stddev * 2) THEN 'high_frequency'
              WHEN va.transaction_count < vs.avg_transaction_count - (vs.transaction_count_stddev * 2) THEN 'low_frequency'
              WHEN va.recent_transactions = 0 AND va.quarterly_transactions > 0 THEN 'recently_inactive'
              WHEN va.last_transaction_date < CURRENT_DATE - INTERVAL '90 days' THEN 'long_inactive'
              ELSE 'normal'
            END as anomaly_type,
            CASE 
              WHEN va.total_spent > vs.avg_vendor_spending + (vs.spending_stddev * 3) THEN 'critical'
              WHEN va.total_spent > vs.avg_vendor_spending + (vs.spending_stddev * 2) THEN 'high'
              WHEN va.total_spent < vs.avg_vendor_spending - (vs.spending_stddev * 2) THEN 'medium'
              ELSE 'low'
            END as anomaly_severity
          FROM vendor_analysis va
          CROSS JOIN vendor_stats vs
        )
        SELECT 
          *,
          CASE 
            WHEN anomaly_type != 'normal' THEN 
              ABS(total_spent - avg_vendor_spending) / avg_vendor_spending * 100
            ELSE 0
          END as deviation_percentage
        FROM anomaly_detection
        WHERE anomaly_type != 'normal'
        ORDER BY deviation_percentage DESC
      `;

      return vendorData;
    } catch (error) {
      logger.error('Error detecting vendor anomalies:', error);
      throw error;
    }
  }

  /**
   * Detect employee anomalies
   */
  async detectEmployeeAnomalies(companyId: string): Promise<any> {
    try {
      const employeeData = await prisma.$queryRaw`
        WITH employee_analysis AS (
          SELECT 
            e.id,
            e.name,
            e.email,
            e.salary,
            e.department_id,
            d.name as department_name,
            COUNT(t.id) as transaction_count,
            SUM(t.amount) as total_transaction_amount,
            AVG(t.amount) as avg_transaction_amount,
            MAX(t.created_at) as last_transaction_date,
            COUNT(CASE WHEN t.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_transactions,
            COUNT(CASE WHEN t.type = 'expense' THEN 1 END) as expense_count,
            SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) as total_expenses
          FROM employees e
          LEFT JOIN departments d ON e.department_id = d.id
          LEFT JOIN transactions t ON e.id = t.employee_id
          WHERE e.company_id = ${companyId}
          AND e.is_active = true
          GROUP BY e.id, e.name, e.email, e.salary, e.department_id, d.name
        ),
        employee_stats AS (
          SELECT 
            AVG(salary) as avg_salary,
            STDDEV(salary) as salary_stddev,
            AVG(total_expenses) as avg_employee_expenses,
            STDDEV(total_expenses) as expenses_stddev,
            AVG(transaction_count) as avg_transaction_count,
            STDDEV(transaction_count) as transaction_count_stddev
          FROM employee_analysis
        ),
        anomaly_detection AS (
          SELECT 
            ea.*,
            es.avg_salary,
            es.salary_stddev,
            es.avg_employee_expenses,
            es.expenses_stddev,
            es.avg_transaction_count,
            es.transaction_count_stddev,
            CASE 
              WHEN ea.salary > es.avg_salary + (es.salary_stddev * 2) THEN 'high_salary'
              WHEN ea.salary < es.avg_salary - (es.salary_stddev * 2) THEN 'low_salary'
              WHEN ea.total_expenses > es.avg_employee_expenses + (es.expenses_stddev * 2) THEN 'high_expenses'
              WHEN ea.total_expenses < es.avg_employee_expenses - (es.expenses_stddev * 2) THEN 'low_expenses'
              WHEN ea.transaction_count > es.avg_transaction_count + (es.transaction_count_stddev * 2) THEN 'high_activity'
              WHEN ea.transaction_count < es.avg_transaction_count - (es.transaction_count_stddev * 2) THEN 'low_activity'
              WHEN ea.recent_transactions = 0 AND ea.transaction_count > 0 THEN 'recently_inactive'
              ELSE 'normal'
            END as anomaly_type,
            CASE 
              WHEN ea.salary > es.avg_salary + (es.salary_stddev * 3) THEN 'critical'
              WHEN ea.salary > es.avg_salary + (es.salary_stddev * 2) THEN 'high'
              WHEN ea.total_expenses > es.avg_employee_expenses + (es.expenses_stddev * 2) THEN 'medium'
              ELSE 'low'
            END as anomaly_severity
          FROM employee_analysis ea
          CROSS JOIN employee_stats es
        )
        SELECT 
          *,
          CASE 
            WHEN anomaly_type != 'normal' THEN 
              ABS(salary - avg_salary) / avg_salary * 100
            ELSE 0
          END as deviation_percentage
        FROM anomaly_detection
        WHERE anomaly_type != 'normal'
        ORDER BY deviation_percentage DESC
      `;

      return employeeData;
    } catch (error) {
      logger.error('Error detecting employee anomalies:', error);
      throw error;
    }
  }

  /**
   * Calculate overall anomaly score
   */
  private calculateOverallAnomalyScore(analysis: any): number {
    let totalScore = 0;
    let weightSum = 0;

    // Spending anomalies (weight: 0.3)
    if (analysis.spendingAnomalies && analysis.spendingAnomalies.length > 0) {
      const spendingScore = analysis.spendingAnomalies.reduce((sum: number, anomaly: any) => {
        const severityScore = anomaly.anomaly_severity === 'critical' ? 100 :
                            anomaly.anomaly_severity === 'high' ? 75 :
                            anomaly.anomaly_severity === 'medium' ? 50 : 25;
        return sum + severityScore;
      }, 0) / analysis.spendingAnomalies.length;
      totalScore += spendingScore * 0.3;
      weightSum += 0.3;
    }

    // Revenue anomalies (weight: 0.25)
    if (analysis.revenueAnomalies && analysis.revenueAnomalies.length > 0) {
      const revenueScore = analysis.revenueAnomalies.reduce((sum: number, anomaly: any) => {
        const severityScore = anomaly.anomaly_severity === 'critical' ? 100 :
                            anomaly.anomaly_severity === 'high' ? 75 :
                            anomaly.anomaly_severity === 'medium' ? 50 : 25;
        return sum + severityScore;
      }, 0) / analysis.revenueAnomalies.length;
      totalScore += revenueScore * 0.25;
      weightSum += 0.25;
    }

    // Cash flow anomalies (weight: 0.25)
    if (analysis.cashFlowAnomalies && analysis.cashFlowAnomalies.length > 0) {
      const cashFlowScore = analysis.cashFlowAnomalies.reduce((sum: number, anomaly: any) => {
        const severityScore = anomaly.anomaly_severity === 'critical' ? 100 :
                            anomaly.anomaly_severity === 'high' ? 75 :
                            anomaly.anomaly_severity === 'medium' ? 50 : 25;
        return sum + severityScore;
      }, 0) / analysis.cashFlowAnomalies.length;
      totalScore += cashFlowScore * 0.25;
      weightSum += 0.25;
    }

    // Transaction anomalies (weight: 0.2)
    if (analysis.transactionAnomalies && analysis.transactionAnomalies.length > 0) {
      const transactionScore = analysis.transactionAnomalies.reduce((sum: number, anomaly: any) => {
        const severityScore = anomaly.anomaly_severity === 'critical' ? 100 :
                            anomaly.anomaly_severity === 'high' ? 75 :
                            anomaly.anomaly_severity === 'medium' ? 50 : 25;
        return sum + severityScore;
      }, 0) / analysis.transactionAnomalies.length;
      totalScore += transactionScore * 0.2;
      weightSum += 0.2;
    }

    return weightSum > 0 ? Math.round(totalScore / weightSum) : 0;
  }

  /**
   * Generate anomaly recommendations
   */
  private generateAnomalyRecommendations(analysis: any): any[] {
    const recommendations = [];

    // Spending anomaly recommendations
    if (analysis.spendingAnomalies && analysis.spendingAnomalies.length > 0) {
      const criticalSpending = analysis.spendingAnomalies.filter((anomaly: any) => 
        anomaly.anomaly_severity === 'critical'
      );

      if (criticalSpending.length > 0) {
        recommendations.push({
          type: 'spending_anomaly',
          priority: 'high',
          title: 'Critical Spending Anomalies Detected',
          description: `${criticalSpending.length} critical spending anomalies detected`,
          action: 'Review and investigate unusual spending patterns immediately',
          impact: 'High - may indicate fraud or budget issues'
            });
          }
        }

    // Revenue anomaly recommendations
    if (analysis.revenueAnomalies && analysis.revenueAnomalies.length > 0) {
      const criticalRevenue = analysis.revenueAnomalies.filter((anomaly: any) => 
        anomaly.anomaly_severity === 'critical'
      );

      if (criticalRevenue.length > 0) {
        recommendations.push({
          type: 'revenue_anomaly',
          priority: 'high',
          title: 'Critical Revenue Anomalies Detected',
          description: `${criticalRevenue.length} critical revenue anomalies detected`,
          action: 'Review and investigate unusual revenue patterns',
          impact: 'High - may indicate data entry errors or fraud'
        });
      }
    }

    // Cash flow anomaly recommendations
    if (analysis.cashFlowAnomalies && analysis.cashFlowAnomalies.length > 0) {
      const criticalCashFlow = analysis.cashFlowAnomalies.filter((anomaly: any) => 
        anomaly.anomaly_severity === 'critical'
      );

      if (criticalCashFlow.length > 0) {
        recommendations.push({
          type: 'cash_flow_anomaly',
          priority: 'critical',
          title: 'Critical Cash Flow Anomalies Detected',
          description: `${criticalCashFlow.length} critical cash flow anomalies detected`,
          action: 'Immediate review of cash flow patterns required',
          impact: 'Critical - affects business liquidity and operations'
        });
      }
    }

    // Transaction anomaly recommendations
    if (analysis.transactionAnomalies && analysis.transactionAnomalies.length > 0) {
      const criticalTransactions = analysis.transactionAnomalies.filter((anomaly: any) => 
        anomaly.anomaly_severity === 'critical'
      );

      if (criticalTransactions.length > 0) {
        recommendations.push({
          type: 'transaction_anomaly',
          priority: 'high',
          title: 'Critical Transaction Anomalies Detected',
          description: `${criticalTransactions.length} critical transaction anomalies detected`,
          action: 'Review and investigate unusual transaction patterns',
          impact: 'High - may indicate fraud or data errors'
          });
        }
      }

    return recommendations;
  }

  /**
   * Get anomaly detection dashboard
   */
  async getAnomalyDetectionDashboard(companyId: string): Promise<any> {
    try {
      const [
        anomalyStats,
        recentAnalyses,
        alertSummary,
        trendAnalysis
      ] = await Promise.all([
        this.getAnomalyStats(companyId),
        this.getRecentAnalyses(companyId),
        this.getAlertSummary(companyId),
        this.getTrendAnalysis(companyId)
      ]);

      return {
        anomalyStats,
        recentAnalyses,
        alertSummary,
        trendAnalysis
      };
    } catch (error) {
      logger.error('Error getting anomaly detection dashboard:', error);
      throw error;
    }
  }

  /**
   * Get anomaly statistics
   */
  private async getAnomalyStats(companyId: string): Promise<any> {
    try {
      const stats = await prisma.$queryRaw`
        SELECT 
          COUNT(*) as total_anomalies,
          COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_anomalies,
          COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_anomalies,
          COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium_anomalies,
          COUNT(CASE WHEN severity = 'low' THEN 1 END) as low_anomalies,
          COUNT(CASE WHEN anomaly_type = 'financial' THEN 1 END) as financial_anomalies,
          COUNT(CASE WHEN anomaly_type = 'vendor' THEN 1 END) as vendor_anomalies,
          COUNT(CASE WHEN anomaly_type = 'employee' THEN 1 END) as employee_anomalies,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as recent_anomalies
        FROM anomaly_detections
        WHERE company_id = ${companyId}
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      `;

      return stats[0];
    } catch (error) {
      logger.error('Error getting anomaly stats:', error);
      throw error;
    }
  }

  /**
   * Get recent analyses
   */
  private async getRecentAnalyses(companyId: string): Promise<any> {
    try {
      const analyses = await prisma.anomalyDetectionAnalysis.findMany({
        where: { companyId },
        orderBy: { analyzedAt: 'desc' },
        take: 10
      });

      return analyses;
    } catch (error) {
      logger.error('Error getting recent analyses:', error);
      throw error;
    }
  }

  /**
   * Get alert summary
   */
  private async getAlertSummary(companyId: string): Promise<any> {
    try {
      const alerts = await prisma.$queryRaw`
        SELECT 
          COUNT(*) as total_alerts,
          COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_alerts,
          COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_alerts,
          COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium_alerts,
          COUNT(CASE WHEN severity = 'low' THEN 1 END) as low_alerts,
          COUNT(CASE WHEN is_acknowledged = true THEN 1 END) as acknowledged_alerts,
          COUNT(CASE WHEN is_resolved = true THEN 1 END) as resolved_alerts,
          COUNT(CASE WHEN is_acknowledged = false AND is_resolved = false THEN 1 END) as active_alerts
        FROM anomaly_alerts
        WHERE company_id = ${companyId}
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      `;

      return alerts[0];
    } catch (error) {
      logger.error('Error getting alert summary:', error);
      throw error;
    }
  }

  /**
   * Get trend analysis
   */
  private async getTrendAnalysis(companyId: string): Promise<any> {
    try {
      const trends = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('week', created_at) as week,
          COUNT(*) as anomalies_detected,
          COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_anomalies,
          COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_anomalies,
          AVG(anomaly_score) as avg_anomaly_score
        FROM anomaly_detections
        WHERE company_id = ${companyId}
        AND created_at >= CURRENT_DATE - INTERVAL '12 weeks'
        GROUP BY DATE_TRUNC('week', created_at)
        ORDER BY week DESC
      `;

      return trends;
    } catch (error) {
      logger.error('Error getting trend analysis:', error);
      throw error;
    }
  }

  /**
   * Save anomaly detection analysis
   */
  async saveAnomalyDetectionAnalysis(companyId: string, analysisData: any): Promise<any> {
    try {
      const analysis = await prisma.anomalyDetectionAnalysis.create({
        data: {
          companyId,
          analysisType: analysisData.type,
          analysisData: JSON.stringify(analysisData.data),
          recommendations: JSON.stringify(analysisData.recommendations || []),
          anomalyScore: analysisData.overallAnomalyScore || 0,
          confidenceScore: analysisData.confidenceScore || 0,
          analyzedAt: new Date()
        }
      });

      return analysis;
    } catch (error) {
      logger.error('Error saving anomaly detection analysis:', error);
      throw error;
    }
  }
}