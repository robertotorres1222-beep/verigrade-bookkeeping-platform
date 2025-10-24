import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class ChurnPreventionService {
  /**
   * Analyze customer churn risk
   */
  async analyzeChurnRisk(companyId: string): Promise<any> {
    try {
      const [
        customerAnalysis,
        behaviorAnalysis,
        engagementAnalysis,
        riskFactors
      ] = await Promise.all([
        this.analyzeCustomerData(companyId),
        this.analyzeBehaviorPatterns(companyId),
        this.analyzeEngagementMetrics(companyId),
        this.identifyRiskFactors(companyId)
      ]);

      return {
        customerAnalysis,
        behaviorAnalysis,
        engagementAnalysis,
        riskFactors,
        overallChurnRisk: this.calculateOverallChurnRisk({
          customerAnalysis,
          behaviorAnalysis,
          engagementAnalysis,
          riskFactors
        }),
        recommendations: this.generateChurnPreventionRecommendations({
          customerAnalysis,
          behaviorAnalysis,
          engagementAnalysis,
          riskFactors
        })
      };
    } catch (error) {
      logger.error('Error analyzing churn risk:', error);
      throw error;
    }
  }

  /**
   * Analyze customer data
   */
  private async analyzeCustomerData(companyId: string): Promise<any> {
    try {
      const customerData = await prisma.$queryRaw`
        WITH customer_metrics AS (
          SELECT 
            c.id,
            c.name,
            c.email,
            c.created_at,
            c.last_activity,
            COUNT(t.id) as total_transactions,
            SUM(t.amount) as total_spent,
            AVG(t.amount) as avg_transaction_value,
            MAX(t.created_at) as last_transaction_date,
            COUNT(CASE WHEN t.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_transactions,
            COUNT(CASE WHEN t.created_at >= CURRENT_DATE - INTERVAL '90 days' THEN 1 END) as quarterly_transactions,
            COUNT(CASE WHEN t.created_at >= CURRENT_DATE - INTERVAL '365 days' THEN 1 END) as yearly_transactions
          FROM customers c
          LEFT JOIN transactions t ON c.id = t.customer_id
          WHERE c.company_id = ${companyId}
          GROUP BY c.id, c.name, c.email, c.created_at, c.last_activity
        ),
        churn_indicators AS (
          SELECT 
            *,
            CASE 
              WHEN last_transaction_date < CURRENT_DATE - INTERVAL '90 days' THEN 'high_risk'
              WHEN last_transaction_date < CURRENT_DATE - INTERVAL '60 days' THEN 'medium_risk'
              WHEN last_transaction_date < CURRENT_DATE - INTERVAL '30 days' THEN 'low_risk'
              ELSE 'active'
            END as churn_risk_level,
            CASE 
              WHEN recent_transactions = 0 THEN 'inactive'
              WHEN recent_transactions < 2 THEN 'low_activity'
              WHEN recent_transactions < 5 THEN 'moderate_activity'
              ELSE 'high_activity'
            END as activity_level,
            CASE 
              WHEN total_spent > 10000 THEN 'high_value'
              WHEN total_spent > 5000 THEN 'medium_value'
              WHEN total_spent > 1000 THEN 'low_value'
              ELSE 'minimal_value'
            END as customer_value_tier
          FROM customer_metrics
        )
        SELECT 
          *,
          CASE 
            WHEN churn_risk_level = 'high_risk' AND customer_value_tier IN ('high_value', 'medium_value') THEN 'critical'
            WHEN churn_risk_level = 'high_risk' OR (churn_risk_level = 'medium_risk' AND customer_value_tier = 'high_value') THEN 'high'
            WHEN churn_risk_level = 'medium_risk' OR (churn_risk_level = 'low_risk' AND customer_value_tier = 'high_value') THEN 'medium'
            ELSE 'low'
          END as priority_level
        FROM churn_indicators
        ORDER BY priority_level DESC, total_spent DESC
      `;

      return customerData;
    } catch (error) {
      logger.error('Error analyzing customer data:', error);
      throw error;
    }
  }

  /**
   * Analyze behavior patterns
   */
  private async analyzeBehaviorPatterns(companyId: string): Promise<any> {
    try {
      const behaviorData = await prisma.$queryRaw`
        WITH customer_behavior AS (
          SELECT 
            c.id as customer_id,
            c.name,
            COUNT(t.id) as total_transactions,
            AVG(t.amount) as avg_transaction_value,
            STDDEV(t.amount) as transaction_volatility,
            COUNT(DISTINCT DATE_TRUNC('month', t.created_at)) as active_months,
            COUNT(CASE WHEN t.amount > AVG(t.amount) * 2 THEN 1 END) as large_transactions,
            COUNT(CASE WHEN t.amount < AVG(t.amount) * 0.5 THEN 1 END) as small_transactions,
            AVG(EXTRACT(EPOCH FROM (t.created_at - LAG(t.created_at) OVER (PARTITION BY c.id ORDER BY t.created_at))) / 86400) as avg_days_between_transactions
          FROM customers c
          LEFT JOIN transactions t ON c.id = t.customer_id
          WHERE c.company_id = ${companyId}
          AND t.created_at >= CURRENT_DATE - INTERVAL '12 months'
          GROUP BY c.id, c.name
        ),
        behavior_patterns AS (
          SELECT 
            *,
            CASE 
              WHEN avg_days_between_transactions > 60 THEN 'infrequent'
              WHEN avg_days_between_transactions > 30 THEN 'moderate'
              WHEN avg_days_between_transactions > 14 THEN 'frequent'
              ELSE 'very_frequent'
            END as transaction_frequency,
            CASE 
              WHEN transaction_volatility > avg_transaction_value * 0.5 THEN 'high_volatility'
              WHEN transaction_volatility > avg_transaction_value * 0.3 THEN 'medium_volatility'
              ELSE 'low_volatility'
            END as spending_volatility,
            CASE 
              WHEN large_transactions > total_transactions * 0.3 THEN 'high_large_transactions'
              WHEN large_transactions > total_transactions * 0.1 THEN 'medium_large_transactions'
              ELSE 'low_large_transactions'
            END as large_transaction_pattern
          FROM customer_behavior
        )
        SELECT 
          *,
          CASE 
            WHEN transaction_frequency = 'infrequent' AND spending_volatility = 'high_volatility' THEN 'high_risk'
            WHEN transaction_frequency = 'infrequent' OR spending_volatility = 'high_volatility' THEN 'medium_risk'
            WHEN transaction_frequency = 'moderate' AND spending_volatility = 'low_volatility' THEN 'low_risk'
            ELSE 'stable'
          END as behavior_risk_level
        FROM behavior_patterns
        ORDER BY behavior_risk_level DESC, total_transactions DESC
      `;

      return behaviorData;
    } catch (error) {
      logger.error('Error analyzing behavior patterns:', error);
      throw error;
    }
  }

  /**
   * Analyze engagement metrics
   */
  private async analyzeEngagementMetrics(companyId: string): Promise<any> {
    try {
      const engagementData = await prisma.$queryRaw`
        WITH engagement_metrics AS (
          SELECT 
            c.id as customer_id,
            c.name,
            c.email,
            c.created_at as customer_since,
            c.last_activity,
            COUNT(t.id) as total_transactions,
            SUM(t.amount) as total_spent,
            MAX(t.created_at) as last_transaction_date,
            COUNT(CASE WHEN t.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_transactions,
            COUNT(CASE WHEN t.created_at >= CURRENT_DATE - INTERVAL '90 days' THEN 1 END) as quarterly_transactions,
            COUNT(CASE WHEN t.created_at >= CURRENT_DATE - INTERVAL '365 days' THEN 1 END) as yearly_transactions,
            EXTRACT(EPOCH FROM (CURRENT_DATE - c.last_activity)) / 86400 as days_since_last_activity,
            EXTRACT(EPOCH FROM (CURRENT_DATE - c.created_at)) / 86400 as customer_age_days
          FROM customers c
          LEFT JOIN transactions t ON c.id = t.customer_id
          WHERE c.company_id = ${companyId}
          GROUP BY c.id, c.name, c.email, c.created_at, c.last_activity
        ),
        engagement_analysis AS (
          SELECT 
            *,
            CASE 
              WHEN days_since_last_activity > 90 THEN 'disengaged'
              WHEN days_since_last_activity > 60 THEN 'low_engagement'
              WHEN days_since_last_activity > 30 THEN 'moderate_engagement'
              ELSE 'high_engagement'
            END as engagement_level,
            CASE 
              WHEN recent_transactions = 0 THEN 'no_recent_activity'
              WHEN recent_transactions < 2 THEN 'low_recent_activity'
              WHEN recent_transactions < 5 THEN 'moderate_recent_activity'
              ELSE 'high_recent_activity'
            END as recent_activity_level,
            CASE 
              WHEN customer_age_days > 365 AND total_transactions < 5 THEN 'old_inactive'
              WHEN customer_age_days > 180 AND total_transactions < 3 THEN 'mature_inactive'
              WHEN customer_age_days < 30 AND total_transactions > 5 THEN 'new_active'
              ELSE 'normal'
            END as customer_lifecycle_stage
          FROM engagement_metrics
        )
        SELECT 
          *,
          CASE 
            WHEN engagement_level = 'disengaged' AND customer_lifecycle_stage = 'old_inactive' THEN 'critical'
            WHEN engagement_level = 'disengaged' OR customer_lifecycle_stage = 'old_inactive' THEN 'high'
            WHEN engagement_level = 'low_engagement' OR customer_lifecycle_stage = 'mature_inactive' THEN 'medium'
            ELSE 'low'
          END as engagement_risk_level
        FROM engagement_analysis
        ORDER BY engagement_risk_level DESC, total_spent DESC
      `;

      return engagementData;
    } catch (error) {
      logger.error('Error analyzing engagement metrics:', error);
      throw error;
    }
  }

  /**
   * Identify risk factors
   */
  private async identifyRiskFactors(companyId: string): Promise<any> {
    try {
      const riskFactors = await prisma.$queryRaw`
        WITH risk_analysis AS (
          SELECT 
            c.id as customer_id,
            c.name,
            c.email,
            c.created_at,
            c.last_activity,
            COUNT(t.id) as total_transactions,
            SUM(t.amount) as total_spent,
            AVG(t.amount) as avg_transaction_value,
            MAX(t.created_at) as last_transaction_date,
            MIN(t.created_at) as first_transaction_date,
            COUNT(CASE WHEN t.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_transactions,
            COUNT(CASE WHEN t.created_at >= CURRENT_DATE - INTERVAL '90 days' THEN 1 END) as quarterly_transactions,
            EXTRACT(EPOCH FROM (CURRENT_DATE - c.last_activity)) / 86400 as days_since_last_activity,
            EXTRACT(EPOCH FROM (CURRENT_DATE - MAX(t.created_at)) / 86400) as days_since_last_transaction,
            EXTRACT(EPOCH FROM (MAX(t.created_at) - MIN(t.created_at)) / 86400) as customer_activity_span
          FROM customers c
          LEFT JOIN transactions t ON c.id = t.customer_id
          WHERE c.company_id = ${companyId}
          GROUP BY c.id, c.name, c.email, c.created_at, c.last_activity
        ),
        risk_factors AS (
          SELECT 
            *,
            CASE 
              WHEN days_since_last_activity > 90 THEN 'inactive_90_days'
              WHEN days_since_last_activity > 60 THEN 'inactive_60_days'
              WHEN days_since_last_activity > 30 THEN 'inactive_30_days'
              ELSE 'active'
            END as inactivity_risk,
            CASE 
              WHEN days_since_last_transaction > 60 THEN 'no_recent_transactions'
              WHEN days_since_last_transaction > 30 THEN 'few_recent_transactions'
              ELSE 'active_transactions'
            END as transaction_risk,
            CASE 
              WHEN total_transactions < 3 AND customer_activity_span > 180 THEN 'low_frequency_high_span'
              WHEN total_transactions < 5 AND customer_activity_span > 365 THEN 'very_low_frequency'
              ELSE 'normal_frequency'
            END as frequency_risk,
            CASE 
              WHEN avg_transaction_value < 50 AND total_spent > 1000 THEN 'high_volume_low_value'
              WHEN avg_transaction_value > 500 AND total_transactions < 3 THEN 'high_value_low_frequency'
              ELSE 'normal_pattern'
            END as spending_pattern_risk
          FROM risk_analysis
        )
        SELECT 
          *,
          CASE 
            WHEN inactivity_risk IN ('inactive_90_days', 'inactive_60_days') THEN 'high'
            WHEN inactivity_risk = 'inactive_30_days' OR transaction_risk = 'no_recent_transactions' THEN 'medium'
            WHEN frequency_risk = 'very_low_frequency' OR spending_pattern_risk = 'high_volume_low_value' THEN 'medium'
            ELSE 'low'
          END as overall_risk_level
        FROM risk_factors
        ORDER BY overall_risk_level DESC, total_spent DESC
      `;

      return riskFactors;
    } catch (error) {
      logger.error('Error identifying risk factors:', error);
      throw error;
    }
  }

  /**
   * Calculate overall churn risk
   */
  private calculateOverallChurnRisk(analysis: any): number {
    let totalRisk = 0;
    let weightSum = 0;

    // Customer analysis (weight: 0.3)
    if (analysis.customerAnalysis && analysis.customerAnalysis.length > 0) {
      const customerRisk = analysis.customerAnalysis.reduce((sum: number, customer: any) => {
        const riskScore = customer.priority_level === 'critical' ? 100 :
                        customer.priority_level === 'high' ? 75 :
                        customer.priority_level === 'medium' ? 50 : 25;
        return sum + riskScore;
      }, 0) / analysis.customerAnalysis.length;
      totalRisk += customerRisk * 0.3;
      weightSum += 0.3;
    }

    // Behavior analysis (weight: 0.25)
    if (analysis.behaviorAnalysis && analysis.behaviorAnalysis.length > 0) {
      const behaviorRisk = analysis.behaviorAnalysis.reduce((sum: number, behavior: any) => {
        const riskScore = behavior.behavior_risk_level === 'high_risk' ? 100 :
                        behavior.behavior_risk_level === 'medium_risk' ? 75 :
                        behavior.behavior_risk_level === 'low_risk' ? 50 : 25;
        return sum + riskScore;
      }, 0) / analysis.behaviorAnalysis.length;
      totalRisk += behaviorRisk * 0.25;
      weightSum += 0.25;
    }

    // Engagement analysis (weight: 0.25)
    if (analysis.engagementAnalysis && analysis.engagementAnalysis.length > 0) {
      const engagementRisk = analysis.engagementAnalysis.reduce((sum: number, engagement: any) => {
        const riskScore = engagement.engagement_risk_level === 'critical' ? 100 :
                        engagement.engagement_risk_level === 'high' ? 75 :
                        engagement.engagement_risk_level === 'medium' ? 50 : 25;
        return sum + riskScore;
      }, 0) / analysis.engagementAnalysis.length;
      totalRisk += engagementRisk * 0.25;
      weightSum += 0.25;
    }

    // Risk factors (weight: 0.2)
    if (analysis.riskFactors && analysis.riskFactors.length > 0) {
      const riskFactorScore = analysis.riskFactors.reduce((sum: number, risk: any) => {
        const riskScore = risk.overall_risk_level === 'high' ? 100 :
                        risk.overall_risk_level === 'medium' ? 75 : 25;
        return sum + riskScore;
      }, 0) / analysis.riskFactors.length;
      totalRisk += riskFactorScore * 0.2;
      weightSum += 0.2;
    }

    return weightSum > 0 ? Math.round(totalRisk / weightSum) : 0;
  }

  /**
   * Generate churn prevention recommendations
   */
  private generateChurnPreventionRecommendations(analysis: any): any[] {
    const recommendations = [];

    // Customer-based recommendations
    if (analysis.customerAnalysis) {
      const highRiskCustomers = analysis.customerAnalysis.filter((customer: any) => 
        customer.priority_level === 'critical' || customer.priority_level === 'high'
      );

      if (highRiskCustomers.length > 0) {
        recommendations.push({
          type: 'customer_retention',
          priority: 'high',
          title: 'Retain High-Value At-Risk Customers',
          description: `${highRiskCustomers.length} high-value customers are at risk of churning`,
          action: 'Implement immediate retention strategies for these customers',
          impact: 'High - will prevent revenue loss from high-value customers'
        });
      }
    }

    // Behavior-based recommendations
    if (analysis.behaviorAnalysis) {
      const highRiskBehaviors = analysis.behaviorAnalysis.filter((behavior: any) => 
        behavior.behavior_risk_level === 'high_risk'
      );

      if (highRiskBehaviors.length > 0) {
        recommendations.push({
          type: 'behavior_intervention',
          priority: 'medium',
          title: 'Address High-Risk Behavior Patterns',
          description: `${highRiskBehaviors.length} customers show concerning behavior patterns`,
          action: 'Implement behavior-based retention strategies',
          impact: 'Medium - will improve customer engagement and retention'
        });
      }
    }

    // Engagement-based recommendations
    if (analysis.engagementAnalysis) {
      const disengagedCustomers = analysis.engagementAnalysis.filter((engagement: any) => 
        engagement.engagement_level === 'disengaged' || engagement.engagement_level === 'low_engagement'
      );

      if (disengagedCustomers.length > 0) {
        recommendations.push({
          type: 'engagement_boost',
          priority: 'high',
          title: 'Re-engage Disengaged Customers',
          description: `${disengagedCustomers.length} customers are disengaged or have low engagement`,
          action: 'Launch re-engagement campaigns and improve customer experience',
          impact: 'High - will reactivate dormant customers and increase engagement'
        });
      }
    }

    // Risk factor recommendations
    if (analysis.riskFactors) {
      const highRiskFactors = analysis.riskFactors.filter((risk: any) => 
        risk.overall_risk_level === 'high'
      );

      if (highRiskFactors.length > 0) {
        recommendations.push({
          type: 'risk_mitigation',
          priority: 'medium',
          title: 'Mitigate High-Risk Factors',
          description: `${highRiskFactors.length} customers have high-risk factors that need attention`,
          action: 'Implement targeted interventions for high-risk customers',
          impact: 'Medium - will reduce churn risk and improve customer retention'
        });
      }
    }

    return recommendations;
  }

  /**
   * Get churn prevention dashboard
   */
  async getChurnPreventionDashboard(companyId: string): Promise<any> {
    try {
      const [
        churnStats,
        recentAnalyses,
        customerSegments,
        trendAnalysis
      ] = await Promise.all([
        this.getChurnStats(companyId),
        this.getRecentAnalyses(companyId),
        this.getCustomerSegments(companyId),
        this.getTrendAnalysis(companyId)
      ]);

      return {
        churnStats,
        recentAnalyses,
        customerSegments,
        trendAnalysis
      };
    } catch (error) {
      logger.error('Error getting churn prevention dashboard:', error);
      throw error;
    }
  }

  /**
   * Get churn statistics
   */
  private async getChurnStats(companyId: string): Promise<any> {
    try {
      const stats = await prisma.$queryRaw`
        SELECT 
          COUNT(*) as total_customers,
          COUNT(CASE WHEN last_activity >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as active_customers,
          COUNT(CASE WHEN last_activity < CURRENT_DATE - INTERVAL '90 days' THEN 1 END) as inactive_customers,
          COUNT(CASE WHEN last_activity < CURRENT_DATE - INTERVAL '30 days' AND last_activity >= CURRENT_DATE - INTERVAL '90 days' THEN 1 END) as at_risk_customers,
          AVG(total_spent) as avg_customer_value,
          SUM(total_spent) as total_customer_value,
          COUNT(CASE WHEN total_spent > 10000 THEN 1 END) as high_value_customers,
          COUNT(CASE WHEN total_spent < 1000 THEN 1 END) as low_value_customers
        FROM (
          SELECT 
            c.id,
            c.last_activity,
            COALESCE(SUM(t.amount), 0) as total_spent
          FROM customers c
          LEFT JOIN transactions t ON c.id = t.customer_id
          WHERE c.company_id = ${companyId}
          GROUP BY c.id, c.last_activity
        ) customer_totals
      `;

      return stats[0];
    } catch (error) {
      logger.error('Error getting churn stats:', error);
      throw error;
    }
  }

  /**
   * Get recent analyses
   */
  private async getRecentAnalyses(companyId: string): Promise<any> {
    try {
      const analyses = await prisma.churnPreventionAnalysis.findMany({
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
   * Get customer segments
   */
  private async getCustomerSegments(companyId: string): Promise<any> {
    try {
      const segments = await prisma.$queryRaw`
        SELECT 
          CASE 
            WHEN total_spent > 10000 THEN 'high_value'
            WHEN total_spent > 5000 THEN 'medium_value'
            WHEN total_spent > 1000 THEN 'low_value'
            ELSE 'minimal_value'
          END as segment,
          COUNT(*) as customer_count,
          AVG(total_spent) as avg_segment_value,
          SUM(total_spent) as total_segment_value,
          COUNT(CASE WHEN last_activity >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as active_in_segment,
          COUNT(CASE WHEN last_activity < CURRENT_DATE - INTERVAL '90 days' THEN 1 END) as inactive_in_segment
        FROM (
          SELECT 
            c.id,
            c.last_activity,
            COALESCE(SUM(t.amount), 0) as total_spent
          FROM customers c
          LEFT JOIN transactions t ON c.id = t.customer_id
          WHERE c.company_id = ${companyId}
          GROUP BY c.id, c.last_activity
        ) customer_totals
        GROUP BY segment
        ORDER BY total_segment_value DESC
      `;

      return segments;
    } catch (error) {
      logger.error('Error getting customer segments:', error);
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
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as new_customers,
          COUNT(CASE WHEN last_activity < CURRENT_DATE - INTERVAL '90 days' THEN 1 END) as churned_customers,
          AVG(total_spent) as avg_customer_value
        FROM (
          SELECT 
            c.id,
            c.created_at,
            c.last_activity,
            COALESCE(SUM(t.amount), 0) as total_spent
          FROM customers c
          LEFT JOIN transactions t ON c.id = t.customer_id
          WHERE c.company_id = ${companyId}
          GROUP BY c.id, c.created_at, c.last_activity
        ) customer_data
        WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
      `;

      return trends;
    } catch (error) {
      logger.error('Error getting trend analysis:', error);
      throw error;
    }
  }

  /**
   * Save churn prevention analysis
   */
  async saveChurnPreventionAnalysis(companyId: string, analysisData: any): Promise<any> {
    try {
      const analysis = await prisma.churnPreventionAnalysis.create({
        data: {
          companyId,
          analysisType: analysisData.type,
          analysisData: JSON.stringify(analysisData.data),
          recommendations: JSON.stringify(analysisData.recommendations || []),
          churnRiskScore: analysisData.overallChurnRisk || 0,
          confidenceScore: analysisData.confidenceScore || 0,
          analyzedAt: new Date()
        }
      });

      return analysis;
    } catch (error) {
      logger.error('Error saving churn prevention analysis:', error);
      throw error;
    }
  }
}