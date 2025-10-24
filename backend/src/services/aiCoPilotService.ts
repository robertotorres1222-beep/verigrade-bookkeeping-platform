import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class AICoPilotService {
  /**
   * Get AI insights and recommendations
   */
  async getAIInsights(companyId: string, context: any): Promise<any> {
    try {
      const [
        financialInsights,
        operationalInsights,
        strategicInsights,
        riskInsights
      ] = await Promise.all([
        this.getFinancialInsights(companyId, context),
        this.getOperationalInsights(companyId, context),
        this.getStrategicInsights(companyId, context),
        this.getRiskInsights(companyId, context)
      ]);

      return {
        financialInsights,
        operationalInsights,
        strategicInsights,
        riskInsights,
        overallScore: this.calculateOverallScore({
          financialInsights,
          operationalInsights,
          strategicInsights,
          riskInsights
        }),
        recommendations: this.generateRecommendations({
          financialInsights,
          operationalInsights,
          strategicInsights,
          riskInsights
        })
      };
    } catch (error) {
      logger.error('Error getting AI insights:', error);
      throw error;
    }
  }

  /**
   * Get financial insights
   */
  private async getFinancialInsights(companyId: string, context: any): Promise<any> {
    try {
      const financialData = await prisma.$queryRaw`
        WITH financial_metrics AS (
          SELECT 
            SUM(CASE WHEN type = 'revenue' THEN amount ELSE 0 END) as total_revenue,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
            AVG(CASE WHEN type = 'revenue' THEN amount ELSE NULL END) as avg_revenue_per_transaction,
            COUNT(CASE WHEN type = 'revenue' THEN 1 END) as revenue_transactions,
            COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_transactions,
            SUM(CASE WHEN type = 'revenue' AND created_at >= CURRENT_DATE - INTERVAL '30 days' THEN amount ELSE 0 END) as monthly_revenue,
            SUM(CASE WHEN type = 'expense' AND created_at >= CURRENT_DATE - INTERVAL '30 days' THEN amount ELSE 0 END) as monthly_expenses
          FROM transactions
          WHERE company_id = ${companyId}
          AND created_at >= CURRENT_DATE - INTERVAL '12 months'
        ),
        cash_flow_analysis AS (
          SELECT 
            SUM(CASE WHEN type = 'revenue' THEN amount ELSE -amount END) as net_cash_flow,
            AVG(CASE WHEN type = 'revenue' THEN amount ELSE -amount END) as avg_daily_cash_flow,
            COUNT(DISTINCT DATE(created_at)) as active_days
          FROM transactions
          WHERE company_id = ${companyId}
          AND created_at >= CURRENT_DATE - INTERVAL '30 days'
        ),
        growth_metrics AS (
          SELECT 
            (monthly_revenue - LAG(monthly_revenue) OVER (ORDER BY month)) / LAG(monthly_revenue) OVER (ORDER BY month) * 100 as revenue_growth_rate,
            (monthly_expenses - LAG(monthly_expenses) OVER (ORDER BY month)) / LAG(monthly_expenses) OVER (ORDER BY month) * 100 as expense_growth_rate
          FROM (
            SELECT 
              DATE_TRUNC('month', created_at) as month,
              SUM(CASE WHEN type = 'revenue' THEN amount ELSE 0 END) as monthly_revenue,
              SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as monthly_expenses
            FROM transactions
            WHERE company_id = ${companyId}
            AND created_at >= CURRENT_DATE - INTERVAL '6 months'
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY month
          ) monthly_data
        )
        SELECT 
          fm.*,
          cfa.net_cash_flow,
          cfa.avg_daily_cash_flow,
          cfa.active_days,
          CASE 
            WHEN fm.total_revenue > 0 THEN (fm.total_revenue - fm.total_expenses) / fm.total_revenue * 100
            ELSE 0
          END as profit_margin,
          CASE 
            WHEN fm.monthly_revenue > 0 THEN (fm.monthly_revenue - fm.monthly_expenses) / fm.monthly_revenue * 100
            ELSE 0
          END as monthly_profit_margin
        FROM financial_metrics fm
        CROSS JOIN cash_flow_analysis cfa
      `;

      const insights = financialData[0] as any;
      
      return {
        totalRevenue: insights.total_revenue || 0,
        totalExpenses: insights.total_expenses || 0,
        netCashFlow: insights.net_cash_flow || 0,
        profitMargin: insights.profit_margin || 0,
        monthlyProfitMargin: insights.monthly_profit_margin || 0,
        avgDailyCashFlow: insights.avg_daily_cash_flow || 0,
        revenueGrowth: this.calculateRevenueGrowth(insights),
        expenseGrowth: this.calculateExpenseGrowth(insights),
        cashRunway: this.calculateCashRunway(insights),
        recommendations: this.generateFinancialRecommendations(insights)
      };
    } catch (error) {
      logger.error('Error getting financial insights:', error);
      throw error;
    }
  }

  /**
   * Get operational insights
   */
  private async getOperationalInsights(companyId: string, context: any): Promise<any> {
    try {
      const operationalData = await prisma.$queryRaw`
        WITH employee_metrics AS (
          SELECT 
            COUNT(*) as total_employees,
            COUNT(CASE WHEN is_active = true THEN 1 END) as active_employees,
            AVG(salary) as avg_salary,
            SUM(salary) as total_salary_cost,
            COUNT(CASE WHEN hire_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_hires,
            COUNT(CASE WHEN termination_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_departures
          FROM employees
          WHERE company_id = ${companyId}
        ),
        task_metrics AS (
          SELECT 
            COUNT(*) as total_tasks,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
            COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_tasks,
            COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
            AVG(estimated_hours) as avg_estimated_hours,
            AVG(actual_hours) as avg_actual_hours,
            AVG(CASE WHEN actual_hours > 0 THEN actual_hours / estimated_hours ELSE 1 END) as time_efficiency
          FROM tasks t
          JOIN employees e ON t.assigned_to = e.id
          WHERE e.company_id = ${companyId}
          AND t.created_at >= CURRENT_DATE - INTERVAL '30 days'
        ),
        customer_metrics AS (
          SELECT 
            COUNT(*) as total_customers,
            COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_customers,
            AVG(amount) as avg_customer_value,
            SUM(amount) as total_customer_revenue
          FROM customers c
          LEFT JOIN transactions t ON c.id = t.customer_id
          WHERE c.company_id = ${companyId}
        )
        SELECT 
          em.*,
          tm.*,
          cm.*,
          CASE 
            WHEN tm.total_tasks > 0 THEN (tm.completed_tasks / tm.total_tasks) * 100
            ELSE 0
          END as task_completion_rate,
          CASE 
            WHEN tm.total_tasks > 0 THEN (tm.overdue_tasks / tm.total_tasks) * 100
            ELSE 0
          END as overdue_task_rate
        FROM employee_metrics em
        CROSS JOIN task_metrics tm
        CROSS JOIN customer_metrics cm
      `;

      const insights = operationalData[0] as any;
      
      return {
        totalEmployees: insights.total_employees || 0,
        activeEmployees: insights.active_employees || 0,
        avgSalary: insights.avg_salary || 0,
        totalSalaryCost: insights.total_salary_cost || 0,
        recentHires: insights.recent_hires || 0,
        recentDepartures: insights.recent_departures || 0,
        totalTasks: insights.total_tasks || 0,
        completedTasks: insights.completed_tasks || 0,
        overdueTasks: insights.overdue_tasks || 0,
        taskCompletionRate: insights.task_completion_rate || 0,
        overdueTaskRate: insights.overdue_task_rate || 0,
        timeEfficiency: insights.time_efficiency || 0,
        totalCustomers: insights.total_customers || 0,
        newCustomers: insights.new_customers || 0,
        avgCustomerValue: insights.avg_customer_value || 0,
        recommendations: this.generateOperationalRecommendations(insights)
      };
    } catch (error) {
      logger.error('Error getting operational insights:', error);
      throw error;
    }
  }

  /**
   * Get strategic insights
   */
  private async getStrategicInsights(companyId: string, context: any): Promise<any> {
    try {
      const strategicData = await prisma.$queryRaw`
        WITH market_analysis AS (
          SELECT 
            COUNT(DISTINCT customer_id) as unique_customers,
            AVG(amount) as avg_transaction_value,
            MAX(amount) as max_transaction_value,
            MIN(amount) as min_transaction_value,
            COUNT(*) as total_transactions,
            SUM(amount) as total_revenue
          FROM transactions
          WHERE company_id = ${companyId}
          AND type = 'revenue'
          AND created_at >= CURRENT_DATE - INTERVAL '12 months'
        ),
        customer_segments AS (
          SELECT 
            CASE 
              WHEN amount >= 10000 THEN 'enterprise'
              WHEN amount >= 5000 THEN 'mid_market'
              WHEN amount >= 1000 THEN 'small_business'
              ELSE 'individual'
            END as segment,
            COUNT(*) as customer_count,
            SUM(amount) as segment_revenue,
            AVG(amount) as avg_segment_value
          FROM (
            SELECT 
              customer_id,
              SUM(amount) as amount
            FROM transactions
            WHERE company_id = ${companyId}
            AND type = 'revenue'
            AND created_at >= CURRENT_DATE - INTERVAL '12 months'
            GROUP BY customer_id
          ) customer_totals
          GROUP BY segment
        ),
        growth_opportunities AS (
          SELECT 
            COUNT(CASE WHEN amount >= 5000 THEN 1 END) as high_value_customers,
            COUNT(CASE WHEN amount < 1000 THEN 1 END) as low_value_customers,
            AVG(amount) as overall_avg_value,
            STDDEV(amount) as value_volatility
          FROM (
            SELECT 
              customer_id,
              SUM(amount) as amount
            FROM transactions
            WHERE company_id = ${companyId}
            AND type = 'revenue'
            AND created_at >= CURRENT_DATE - INTERVAL '12 months'
            GROUP BY customer_id
          ) customer_totals
        )
        SELECT 
          ma.*,
          go.*,
          COUNT(DISTINCT cs.segment) as segment_diversity,
          SUM(cs.customer_count) as total_segmented_customers,
          SUM(cs.segment_revenue) as total_segmented_revenue
        FROM market_analysis ma
        CROSS JOIN growth_opportunities go
        CROSS JOIN customer_segments cs
        GROUP BY ma.unique_customers, ma.avg_transaction_value, ma.max_transaction_value, 
                 ma.min_transaction_value, ma.total_transactions, ma.total_revenue,
                 go.high_value_customers, go.low_value_customers, go.overall_avg_value, go.value_volatility
      `;

      const insights = strategicData[0] as any;
      
      return {
        uniqueCustomers: insights.unique_customers || 0,
        avgTransactionValue: insights.avg_transaction_value || 0,
        maxTransactionValue: insights.max_transaction_value || 0,
        minTransactionValue: insights.min_transaction_value || 0,
        totalTransactions: insights.total_transactions || 0,
        totalRevenue: insights.total_revenue || 0,
        highValueCustomers: insights.high_value_customers || 0,
        lowValueCustomers: insights.low_value_customers || 0,
        segmentDiversity: insights.segment_diversity || 0,
        valueVolatility: insights.value_volatility || 0,
        recommendations: this.generateStrategicRecommendations(insights)
      };
    } catch (error) {
      logger.error('Error getting strategic insights:', error);
      throw error;
    }
  }

  /**
   * Get risk insights
   */
  private async getRiskInsights(companyId: string, context: any): Promise<any> {
    try {
      const riskData = await prisma.$queryRaw`
        WITH financial_risks AS (
          SELECT 
            COUNT(CASE WHEN amount < 0 THEN 1 END) as negative_transactions,
            SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END) as total_negative_amount,
            AVG(amount) as avg_transaction_amount,
            STDDEV(amount) as transaction_volatility,
            COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as recent_transactions
          FROM transactions
          WHERE company_id = ${companyId}
          AND created_at >= CURRENT_DATE - INTERVAL '30 days'
        ),
        operational_risks AS (
          SELECT 
            COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_tasks,
            COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_tasks,
            AVG(estimated_hours) as avg_estimated_hours,
            AVG(actual_hours) as avg_actual_hours,
            COUNT(CASE WHEN actual_hours > estimated_hours * 2 THEN 1 END) as significantly_over_estimate
          FROM tasks t
          JOIN employees e ON t.assigned_to = e.id
          WHERE e.company_id = ${companyId}
          AND t.created_at >= CURRENT_DATE - INTERVAL '30 days'
        ),
        customer_risks AS (
          SELECT 
            COUNT(*) as total_customers,
            COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_customers,
            COUNT(CASE WHEN created_at < CURRENT_DATE - INTERVAL '90 days' THEN 1 END) as inactive_customers,
            AVG(amount) as avg_customer_value
          FROM customers c
          LEFT JOIN transactions t ON c.id = t.customer_id
          WHERE c.company_id = ${companyId}
        )
        SELECT 
          fr.*,
          or.*,
          cr.*,
          CASE 
            WHEN fr.recent_transactions = 0 THEN 'high'
            WHEN fr.recent_transactions < 5 THEN 'medium'
            ELSE 'low'
          END as activity_risk,
          CASE 
            WHEN or.overdue_tasks > 10 THEN 'high'
            WHEN or.overdue_tasks > 5 THEN 'medium'
            ELSE 'low'
          END as operational_risk
        FROM financial_risks fr
        CROSS JOIN operational_risks or
        CROSS JOIN customer_risks cr
      `;

      const insights = riskData[0] as any;
      
      return {
        negativeTransactions: insights.negative_transactions || 0,
        totalNegativeAmount: insights.total_negative_amount || 0,
        transactionVolatility: insights.transaction_volatility || 0,
        activityRisk: insights.activity_risk || 'low',
        operationalRisk: insights.operational_risk || 'low',
        overdueTasks: insights.overdue_tasks || 0,
        highPriorityTasks: insights.high_priority_tasks || 0,
        significantlyOverEstimate: insights.significantly_over_estimate || 0,
        inactiveCustomers: insights.inactive_customers || 0,
        recommendations: this.generateRiskRecommendations(insights)
      };
    } catch (error) {
      logger.error('Error getting risk insights:', error);
      throw error;
    }
  }

  /**
   * Calculate overall score
   */
  private calculateOverallScore(insights: any): number {
    let score = 0;
    let weightSum = 0;

    // Financial score (weight: 0.4)
    if (insights.financialInsights) {
      const financialScore = this.calculateFinancialScore(insights.financialInsights);
      score += financialScore * 0.4;
      weightSum += 0.4;
    }

    // Operational score (weight: 0.3)
    if (insights.operationalInsights) {
      const operationalScore = this.calculateOperationalScore(insights.operationalInsights);
      score += operationalScore * 0.3;
      weightSum += 0.3;
    }

    // Strategic score (weight: 0.2)
    if (insights.strategicInsights) {
      const strategicScore = this.calculateStrategicScore(insights.strategicInsights);
      score += strategicScore * 0.2;
      weightSum += 0.2;
    }

    // Risk score (weight: 0.1)
    if (insights.riskInsights) {
      const riskScore = this.calculateRiskScore(insights.riskInsights);
      score += riskScore * 0.1;
      weightSum += 0.1;
    }

    return weightSum > 0 ? Math.round(score / weightSum) : 0;
  }

  /**
   * Calculate financial score
   */
  private calculateFinancialScore(insights: any): number {
    let score = 0;
    
    // Profit margin score
    if (insights.profitMargin > 20) score += 30;
    else if (insights.profitMargin > 10) score += 20;
    else if (insights.profitMargin > 0) score += 10;
    
    // Cash flow score
    if (insights.netCashFlow > 0) score += 25;
    else if (insights.netCashFlow > -10000) score += 15;
    else score += 5;
    
    // Growth score
    if (insights.revenueGrowth > 20) score += 25;
    else if (insights.revenueGrowth > 10) score += 15;
    else if (insights.revenueGrowth > 0) score += 10;
    
    // Cash runway score
    if (insights.cashRunway > 12) score += 20;
    else if (insights.cashRunway > 6) score += 15;
    else if (insights.cashRunway > 3) score += 10;
    
    return Math.min(score, 100);
  }

  /**
   * Calculate operational score
   */
  private calculateOperationalScore(insights: any): number {
    let score = 0;
    
    // Task completion rate
    if (insights.taskCompletionRate > 90) score += 30;
    else if (insights.taskCompletionRate > 80) score += 20;
    else if (insights.taskCompletionRate > 70) score += 10;
    
    // Overdue task rate
    if (insights.overdueTaskRate < 5) score += 25;
    else if (insights.overdueTaskRate < 10) score += 15;
    else if (insights.overdueTaskRate < 20) score += 10;
    
    // Time efficiency
    if (insights.timeEfficiency > 0.9) score += 25;
    else if (insights.timeEfficiency > 0.8) score += 15;
    else if (insights.timeEfficiency > 0.7) score += 10;
    
    // Employee retention
    const retentionRate = insights.activeEmployees / (insights.activeEmployees + insights.recentDepartures);
    if (retentionRate > 0.95) score += 20;
    else if (retentionRate > 0.90) score += 15;
    else if (retentionRate > 0.85) score += 10;
    
    return Math.min(score, 100);
  }

  /**
   * Calculate strategic score
   */
  private calculateStrategicScore(insights: any): number {
    let score = 0;
    
    // Customer diversity
    if (insights.segmentDiversity > 3) score += 30;
    else if (insights.segmentDiversity > 2) score += 20;
    else if (insights.segmentDiversity > 1) score += 10;
    
    // High-value customers
    if (insights.highValueCustomers > insights.lowValueCustomers) score += 25;
    else if (insights.highValueCustomers > 0) score += 15;
    
    // Revenue growth
    if (insights.totalRevenue > 0) score += 25;
    
    // Market penetration
    if (insights.uniqueCustomers > 100) score += 20;
    else if (insights.uniqueCustomers > 50) score += 15;
    else if (insights.uniqueCustomers > 20) score += 10;
    
    return Math.min(score, 100);
  }

  /**
   * Calculate risk score
   */
  private calculateRiskScore(insights: any): number {
    let score = 100; // Start with perfect score
    
    // Reduce score based on risks
    if (insights.activityRisk === 'high') score -= 30;
    else if (insights.activityRisk === 'medium') score -= 15;
    
    if (insights.operationalRisk === 'high') score -= 25;
    else if (insights.operationalRisk === 'medium') score -= 10;
    
    if (insights.negativeTransactions > 0) score -= 20;
    
    if (insights.overdueTasks > 10) score -= 15;
    else if (insights.overdueTasks > 5) score -= 10;
    
    if (insights.inactiveCustomers > insights.totalCustomers * 0.3) score -= 10;
    
    return Math.max(score, 0);
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(insights: any): any[] {
    const recommendations = [];
    
    // Financial recommendations
    if (insights.financialInsights) {
      recommendations.push(...this.generateFinancialRecommendations(insights.financialInsights));
    }
    
    // Operational recommendations
    if (insights.operationalInsights) {
      recommendations.push(...this.generateOperationalRecommendations(insights.operationalInsights));
    }
    
    // Strategic recommendations
    if (insights.strategicInsights) {
      recommendations.push(...this.generateStrategicRecommendations(insights.strategicInsights));
    }
    
    // Risk recommendations
    if (insights.riskInsights) {
      recommendations.push(...this.generateRiskRecommendations(insights.riskInsights));
    }
    
    return recommendations;
  }

  /**
   * Generate financial recommendations
   */
  private generateFinancialRecommendations(insights: any): any[] {
    const recommendations = [];
    
    if (insights.profitMargin < 10) {
      recommendations.push({
        type: 'financial',
        priority: 'high',
        title: 'Improve Profit Margins',
        description: `Current profit margin is ${insights.profitMargin.toFixed(1)}%. Focus on increasing revenue or reducing costs.`,
        action: 'Review pricing strategy and cost structure',
        impact: 'High - will improve financial health'
      });
    }
    
    if (insights.netCashFlow < 0) {
      recommendations.push({
        type: 'financial',
        priority: 'critical',
        title: 'Address Negative Cash Flow',
        description: 'Company is burning cash. Immediate action required.',
        action: 'Reduce expenses or increase revenue immediately',
        impact: 'Critical - affects company survival'
      });
    }
    
    if (insights.cashRunway < 6) {
      recommendations.push({
        type: 'financial',
        priority: 'high',
        title: 'Extend Cash Runway',
        description: `Cash runway is ${insights.cashRunway.toFixed(1)} months. Consider fundraising or cost reduction.`,
        action: 'Prepare for fundraising or implement cost cuts',
        impact: 'High - ensures business continuity'
      });
    }
    
    return recommendations;
  }

  /**
   * Generate operational recommendations
   */
  private generateOperationalRecommendations(insights: any): any[] {
    const recommendations = [];
    
    if (insights.taskCompletionRate < 80) {
      recommendations.push({
        type: 'operational',
        priority: 'medium',
        title: 'Improve Task Completion Rate',
        description: `Task completion rate is ${insights.taskCompletionRate.toFixed(1)}%. Focus on better task management.`,
        action: 'Implement better project management practices',
        impact: 'Medium - will improve productivity'
      });
    }
    
    if (insights.overdueTaskRate > 15) {
      recommendations.push({
        type: 'operational',
        priority: 'high',
        title: 'Reduce Overdue Tasks',
        description: `Overdue task rate is ${insights.overdueTaskRate.toFixed(1)}%. This indicates capacity issues.`,
        action: 'Hire additional staff or redistribute workload',
        impact: 'High - will improve delivery performance'
      });
    }
    
    if (insights.timeEfficiency < 0.8) {
      recommendations.push({
        type: 'operational',
        priority: 'medium',
        title: 'Improve Time Estimation',
        description: 'Time estimation accuracy is low. This affects planning and delivery.',
        action: 'Implement better estimation practices and historical analysis',
        impact: 'Medium - will improve planning accuracy'
      });
    }
    
    return recommendations;
  }

  /**
   * Generate strategic recommendations
   */
  private generateStrategicRecommendations(insights: any): any[] {
    const recommendations = [];
    
    if (insights.segmentDiversity < 2) {
      recommendations.push({
        type: 'strategic',
        priority: 'medium',
        title: 'Diversify Customer Base',
        description: 'Limited customer segment diversity increases risk.',
        action: 'Develop strategies to target different customer segments',
        impact: 'Medium - will reduce business risk'
      });
    }
    
    if (insights.highValueCustomers < insights.lowValueCustomers) {
      recommendations.push({
        type: 'strategic',
        priority: 'high',
        title: 'Focus on High-Value Customers',
        description: 'More low-value than high-value customers. Focus on upselling.',
        action: 'Implement upselling strategies and customer success programs',
        impact: 'High - will increase revenue per customer'
      });
    }
    
    if (insights.uniqueCustomers < 50) {
      recommendations.push({
        type: 'strategic',
        priority: 'medium',
        title: 'Expand Customer Base',
        description: 'Limited customer base increases risk and limits growth.',
        action: 'Implement customer acquisition strategies',
        impact: 'Medium - will increase market penetration'
      });
    }
    
    return recommendations;
  }

  /**
   * Generate risk recommendations
   */
  private generateRiskRecommendations(insights: any): any[] {
    const recommendations = [];
    
    if (insights.activityRisk === 'high') {
      recommendations.push({
        type: 'risk',
        priority: 'critical',
        title: 'Address Low Activity',
        description: 'Very low transaction activity indicates potential business issues.',
        action: 'Investigate and address business activity issues',
        impact: 'Critical - affects business viability'
      });
    }
    
    if (insights.operationalRisk === 'high') {
      recommendations.push({
        type: 'risk',
        priority: 'high',
        title: 'Reduce Operational Risks',
        description: 'High number of overdue tasks indicates operational issues.',
        action: 'Implement better operational processes and capacity planning',
        impact: 'High - will improve operational efficiency'
      });
    }
    
    if (insights.negativeTransactions > 0) {
      recommendations.push({
        type: 'risk',
        priority: 'medium',
        title: 'Investigate Negative Transactions',
        description: `${insights.negativeTransactions} negative transactions detected.`,
        action: 'Review and investigate negative transactions',
        impact: 'Medium - will improve financial accuracy'
      });
    }
    
    return recommendations;
  }

  /**
   * Calculate revenue growth
   */
  private calculateRevenueGrowth(insights: any): number {
    // Simplified calculation - in real implementation, you'd compare periods
    return insights.monthly_revenue > 0 ? 15 : 0; // Placeholder
  }

  /**
   * Calculate expense growth
   */
  private calculateExpenseGrowth(insights: any): number {
    // Simplified calculation - in real implementation, you'd compare periods
    return insights.monthly_expenses > 0 ? 10 : 0; // Placeholder
  }

  /**
   * Calculate cash runway
   */
  private calculateCashRunway(insights: any): number {
    if (insights.monthly_expenses <= 0) return 999; // No expenses
    return Math.abs(insights.net_cash_flow) / (insights.monthly_expenses / 30); // Days
  }

  /**
   * Get AI Co-Pilot dashboard
   */
  async getAICoPilotDashboard(companyId: string): Promise<any> {
    try {
      const [
        insights,
        recentAnalyses,
        trendAnalysis,
        recommendations
      ] = await Promise.all([
        this.getAIInsights(companyId, {}),
        this.getRecentAnalyses(companyId),
        this.getTrendAnalysis(companyId),
        this.getRecommendations(companyId)
      ]);

      return {
        insights,
        recentAnalyses,
        trendAnalysis,
        recommendations
      };
    } catch (error) {
      logger.error('Error getting AI Co-Pilot dashboard:', error);
      throw error;
    }
  }

  /**
   * Get recent analyses
   */
  private async getRecentAnalyses(companyId: string): Promise<any> {
    try {
      const analyses = await prisma.aiCoPilotAnalysis.findMany({
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
   * Get trend analysis
   */
  private async getTrendAnalysis(companyId: string): Promise<any> {
    try {
      const trends = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('week', analyzed_at) as week,
          COUNT(*) as analyses_count,
          AVG(overall_score) as avg_score,
          AVG(confidence_score) as avg_confidence
        FROM ai_copilot_analyses
        WHERE company_id = ${companyId}
        AND analyzed_at >= CURRENT_DATE - INTERVAL '12 weeks'
        GROUP BY DATE_TRUNC('week', analyzed_at)
        ORDER BY week DESC
      `;

      return trends;
    } catch (error) {
      logger.error('Error getting trend analysis:', error);
      throw error;
    }
  }

  /**
   * Get recommendations
   */
  private async getRecommendations(companyId: string): Promise<any> {
    try {
      const recommendations = await prisma.aiCoPilotRecommendation.findMany({
        where: { 
          companyId,
          isImplemented: false
        },
        orderBy: { priority: 'desc' },
        take: 20
      });

      return recommendations;
    } catch (error) {
      logger.error('Error getting recommendations:', error);
      throw error;
    }
  }

  /**
   * Save AI analysis
   */
  async saveAIAnalysis(companyId: string, analysisData: any): Promise<any> {
    try {
      const analysis = await prisma.aiCoPilotAnalysis.create({
        data: {
          companyId,
          analysisType: analysisData.type,
          analysisData: JSON.stringify(analysisData.data),
          recommendations: JSON.stringify(analysisData.recommendations || []),
          overallScore: analysisData.overallScore || 0,
          confidenceScore: analysisData.confidenceScore || 0,
          analyzedAt: new Date()
        }
      });

      return analysis;
    } catch (error) {
      logger.error('Error saving AI analysis:', error);
      throw error;
    }
  }
}