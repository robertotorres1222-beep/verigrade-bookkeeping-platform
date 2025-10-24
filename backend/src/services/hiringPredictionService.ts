import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class HiringPredictionService {
  /**
   * Analyze hiring needs and bottlenecks
   */
  async analyzeHiringNeeds(companyId: string): Promise<any> {
    try {
      const [
        bottleneckAnalysis,
        capacityAnalysis,
        growthProjections,
        hiringTriggers,
        roiAnalysis
      ] = await Promise.all([
        this.analyzeBottlenecks(companyId),
        this.analyzeCapacity(companyId),
        this.projectGrowth(companyId),
        this.identifyHiringTriggers(companyId),
        this.calculateHiringROI(companyId)
      ]);

      return {
        bottleneckAnalysis,
        capacityAnalysis,
        growthProjections,
        hiringTriggers,
        roiAnalysis,
        recommendations: this.generateHiringRecommendations({
          bottleneckAnalysis,
          capacityAnalysis,
          growthProjections,
          hiringTriggers,
          roiAnalysis
        })
      };
    } catch (error) {
      logger.error('Error analyzing hiring needs:', error);
      throw error;
    }
  }

  /**
   * Analyze operational bottlenecks
   */
  private async analyzeBottlenecks(companyId: string): Promise<any> {
    try {
      const bottlenecks = await prisma.$queryRaw`
        WITH department_metrics AS (
          SELECT 
            d.name as department,
            COUNT(e.id) as current_headcount,
            AVG(e.salary) as avg_salary,
            COUNT(CASE WHEN e.is_active = true THEN 1 END) as active_employees,
            COUNT(CASE WHEN e.is_active = false THEN 1 END) as inactive_employees,
            COUNT(CASE WHEN e.hire_date >= CURRENT_DATE - INTERVAL '90 days' THEN 1 END) as recent_hires,
            COUNT(CASE WHEN e.termination_date >= CURRENT_DATE - INTERVAL '90 days' THEN 1 END) as recent_departures
          FROM departments d
          LEFT JOIN employees e ON d.id = e.department_id
          WHERE d.company_id = ${companyId}
          GROUP BY d.id, d.name
        ),
        workload_analysis AS (
          SELECT 
            d.name as department,
            COUNT(t.id) as total_tasks,
            COUNT(CASE WHEN t.status = 'pending' THEN 1 END) as pending_tasks,
            COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as in_progress_tasks,
            COUNT(CASE WHEN t.status = 'overdue' THEN 1 END) as overdue_tasks,
            AVG(t.estimated_hours) as avg_task_hours,
            SUM(t.estimated_hours) as total_estimated_hours
          FROM departments d
          LEFT JOIN employees e ON d.id = e.department_id
          LEFT JOIN tasks t ON e.id = t.assigned_to
          WHERE d.company_id = ${companyId}
          GROUP BY d.id, d.name
        ),
        performance_metrics AS (
          SELECT 
            d.name as department,
            AVG(ts.hours_worked) as avg_hours_per_employee,
            COUNT(DISTINCT ts.employee_id) as employees_with_timesheets,
            SUM(ts.hours_worked) as total_hours_worked,
            AVG(ts.efficiency_score) as avg_efficiency_score
          FROM departments d
          LEFT JOIN employees e ON d.id = e.department_id
          LEFT JOIN timesheets ts ON e.id = ts.employee_id
          WHERE d.company_id = ${companyId}
          AND ts.week_ending >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY d.id, d.name
        )
        SELECT 
          dm.department,
          dm.current_headcount,
          dm.avg_salary,
          dm.active_employees,
          dm.recent_hires,
          dm.recent_departures,
          wa.total_tasks,
          wa.pending_tasks,
          wa.overdue_tasks,
          wa.avg_task_hours,
          wa.total_estimated_hours,
          pm.avg_hours_per_employee,
          pm.total_hours_worked,
          pm.avg_efficiency_score,
          CASE 
            WHEN wa.overdue_tasks > wa.total_tasks * 0.2 THEN 'high'
            WHEN wa.overdue_tasks > wa.total_tasks * 0.1 THEN 'medium'
            ELSE 'low'
          END as bottleneck_severity,
          CASE 
            WHEN pm.avg_hours_per_employee > 45 THEN 'overworked'
            WHEN pm.avg_hours_per_employee < 30 THEN 'underutilized'
            ELSE 'balanced'
          END as workload_status
        FROM department_metrics dm
        LEFT JOIN workload_analysis wa ON dm.department = wa.department
        LEFT JOIN performance_metrics pm ON dm.department = pm.department
        ORDER BY bottleneck_severity DESC, wa.overdue_tasks DESC
      `;

      return bottlenecks;
    } catch (error) {
      logger.error('Error analyzing bottlenecks:', error);
      throw error;
    }
  }

  /**
   * Analyze team capacity
   */
  private async analyzeCapacity(companyId: string): Promise<any> {
    try {
      const capacityAnalysis = await prisma.$queryRaw`
        WITH employee_capacity AS (
          SELECT 
            e.id,
            e.name,
            e.department_id,
            d.name as department,
            e.salary,
            e.hire_date,
            COUNT(t.id) as assigned_tasks,
            SUM(t.estimated_hours) as total_estimated_hours,
            AVG(ts.hours_worked) as avg_hours_worked,
            AVG(ts.efficiency_score) as efficiency_score,
            CASE 
              WHEN COUNT(t.id) > 10 THEN 'overloaded'
              WHEN COUNT(t.id) < 3 THEN 'underutilized'
              ELSE 'balanced'
            END as workload_status
          FROM employees e
          JOIN departments d ON e.department_id = d.id
          LEFT JOIN tasks t ON e.id = t.assigned_to AND t.status != 'completed'
          LEFT JOIN timesheets ts ON e.id = ts.employee_id
          WHERE e.company_id = ${companyId}
          AND e.is_active = true
          GROUP BY e.id, e.name, e.department_id, d.name, e.salary, e.hire_date
        ),
        department_capacity AS (
          SELECT 
            department,
            COUNT(*) as total_employees,
            COUNT(CASE WHEN workload_status = 'overloaded' THEN 1 END) as overloaded_employees,
            COUNT(CASE WHEN workload_status = 'underutilized' THEN 1 END) as underutilized_employees,
            COUNT(CASE WHEN workload_status = 'balanced' THEN 1 END) as balanced_employees,
            AVG(salary) as avg_salary,
            SUM(salary) as total_salary_cost,
            AVG(efficiency_score) as avg_efficiency,
            AVG(assigned_tasks) as avg_tasks_per_employee,
            AVG(total_estimated_hours) as avg_hours_per_employee
          FROM employee_capacity
          GROUP BY department
        )
        SELECT 
          *,
          CASE 
            WHEN overloaded_employees > total_employees * 0.3 THEN 'needs_hiring'
            WHEN underutilized_employees > total_employees * 0.4 THEN 'overstaffed'
            ELSE 'balanced'
          END as hiring_recommendation
        FROM department_capacity
        ORDER BY overloaded_employees DESC
      `;

      return capacityAnalysis;
    } catch (error) {
      logger.error('Error analyzing capacity:', error);
      throw error;
    }
  }

  /**
   * Project growth and hiring needs
   */
  private async projectGrowth(companyId: string): Promise<any> {
    try {
      const growthProjections = await prisma.$queryRaw`
        WITH historical_data AS (
          SELECT 
            DATE_TRUNC('month', created_at) as month,
            COUNT(*) as new_customers,
            SUM(amount) as revenue,
            COUNT(DISTINCT employee_id) as active_employees
          FROM transactions t
          WHERE t.company_id = ${companyId}
          AND t.created_at >= CURRENT_DATE - INTERVAL '12 months'
          GROUP BY DATE_TRUNC('month', created_at)
        ),
        growth_rates AS (
          SELECT 
            AVG(new_customers) as avg_new_customers_per_month,
            AVG(revenue) as avg_revenue_per_month,
            AVG(active_employees) as avg_employees_per_month,
            STDDEV(new_customers) as customer_growth_volatility,
            STDDEV(revenue) as revenue_growth_volatility,
            STDDEV(active_employees) as employee_growth_volatility
          FROM historical_data
        ),
        projections AS (
          SELECT 
            CURRENT_DATE + INTERVAL '3 months' as projection_date,
            avg_new_customers_per_month * 1.2 as projected_customers_3m,
            avg_revenue_per_month * 1.15 as projected_revenue_3m,
            avg_employees_per_month * 1.1 as projected_employees_3m,
            CURRENT_DATE + INTERVAL '6 months' as projection_date_6m,
            avg_new_customers_per_month * 1.4 as projected_customers_6m,
            avg_revenue_per_month * 1.3 as projected_revenue_6m,
            avg_employees_per_month * 1.2 as projected_employees_6m,
            CURRENT_DATE + INTERVAL '12 months' as projection_date_12m,
            avg_new_customers_per_month * 1.6 as projected_customers_12m,
            avg_revenue_per_month * 1.5 as projected_revenue_12m,
            avg_employees_per_month * 1.4 as projected_employees_12m
          FROM growth_rates
        )
        SELECT 
          *,
          CASE 
            WHEN projected_employees_3m > avg_employees_per_month * 1.2 THEN 'aggressive_hiring_needed'
            WHEN projected_employees_3m > avg_employees_per_month * 1.1 THEN 'moderate_hiring_needed'
            ELSE 'maintain_current_level'
          END as hiring_strategy_3m,
          CASE 
            WHEN projected_employees_6m > avg_employees_per_month * 1.3 THEN 'aggressive_hiring_needed'
            WHEN projected_employees_6m > avg_employees_per_month * 1.2 THEN 'moderate_hiring_needed'
            ELSE 'maintain_current_level'
          END as hiring_strategy_6m
        FROM projections, growth_rates
      `;

      return growthProjections[0];
    } catch (error) {
      logger.error('Error projecting growth:', error);
      throw error;
    }
  }

  /**
   * Identify hiring triggers
   */
  private async identifyHiringTriggers(companyId: string): Promise<any> {
    try {
      const hiringTriggers = await prisma.$queryRaw`
        WITH trigger_metrics AS (
          SELECT 
            d.name as department,
            COUNT(CASE WHEN t.status = 'overdue' THEN 1 END) as overdue_tasks,
            COUNT(CASE WHEN t.priority = 'high' THEN 1 END) as high_priority_tasks,
            AVG(t.estimated_hours) as avg_task_hours,
            COUNT(DISTINCT t.assigned_to) as employees_with_tasks,
            COUNT(t.id) as total_tasks,
            AVG(ts.hours_worked) as avg_hours_per_employee,
            COUNT(CASE WHEN e.termination_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_departures,
            COUNT(CASE WHEN e.hire_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_hires
          FROM departments d
          LEFT JOIN employees e ON d.id = e.department_id
          LEFT JOIN tasks t ON e.id = t.assigned_to
          LEFT JOIN timesheets ts ON e.id = ts.employee_id
          WHERE d.company_id = ${companyId}
          AND e.is_active = true
          GROUP BY d.id, d.name
        )
        SELECT 
          *,
          CASE 
            WHEN overdue_tasks > total_tasks * 0.25 THEN 'urgent_hiring_needed'
            WHEN overdue_tasks > total_tasks * 0.15 THEN 'hiring_recommended'
            WHEN avg_hours_per_employee > 45 THEN 'capacity_issue'
            WHEN recent_departures > recent_hires THEN 'replacement_needed'
            ELSE 'no_immediate_need'
          END as hiring_trigger,
          CASE 
            WHEN overdue_tasks > total_tasks * 0.25 THEN 90
            WHEN overdue_tasks > total_tasks * 0.15 THEN 70
            WHEN avg_hours_per_employee > 45 THEN 60
            WHEN recent_departures > recent_hires THEN 50
            ELSE 20
          END as urgency_score
        FROM trigger_metrics
        ORDER BY urgency_score DESC
      `;

      return hiringTriggers;
    } catch (error) {
      logger.error('Error identifying hiring triggers:', error);
      throw error;
    }
  }

  /**
   * Calculate hiring ROI
   */
  private async calculateHiringROI(companyId: string): Promise<any> {
    try {
      const roiAnalysis = await prisma.$queryRaw`
        WITH department_metrics AS (
          SELECT 
            d.name as department,
            COUNT(e.id) as current_headcount,
            AVG(e.salary) as avg_salary,
            SUM(e.salary) as total_salary_cost,
            COUNT(CASE WHEN e.hire_date >= CURRENT_DATE - INTERVAL '12 months' THEN 1 END) as hires_last_year,
            AVG(ts.efficiency_score) as avg_efficiency,
            COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
            COUNT(CASE WHEN t.status = 'overdue' THEN 1 END) as overdue_tasks
          FROM departments d
          LEFT JOIN employees e ON d.id = e.department_id
          LEFT JOIN timesheets ts ON e.id = ts.employee_id
          LEFT JOIN tasks t ON e.id = t.assigned_to
          WHERE d.company_id = ${companyId}
          AND e.is_active = true
          GROUP BY d.id, d.name
        ),
        revenue_metrics AS (
          SELECT 
            d.name as department,
            SUM(t.amount) as department_revenue,
            COUNT(DISTINCT t.customer_id) as customers_served,
            AVG(t.amount) as avg_transaction_value
          FROM departments d
          LEFT JOIN employees e ON d.id = e.department_id
          LEFT JOIN transactions t ON e.id = t.employee_id
          WHERE d.company_id = ${companyId}
          AND t.created_at >= CURRENT_DATE - INTERVAL '12 months'
          GROUP BY d.id, d.name
        )
        SELECT 
          dm.department,
          dm.current_headcount,
          dm.avg_salary,
          dm.total_salary_cost,
          dm.avg_efficiency,
          dm.completed_tasks,
          dm.overdue_tasks,
          COALESCE(rm.department_revenue, 0) as department_revenue,
          COALESCE(rm.customers_served, 0) as customers_served,
          COALESCE(rm.avg_transaction_value, 0) as avg_transaction_value,
          CASE 
            WHEN dm.avg_efficiency > 0 THEN COALESCE(rm.department_revenue, 0) / dm.total_salary_cost
            ELSE 0
          END as revenue_per_salary_dollar,
          CASE 
            WHEN dm.current_headcount > 0 THEN COALESCE(rm.department_revenue, 0) / dm.current_headcount
            ELSE 0
          END as revenue_per_employee,
          CASE 
            WHEN dm.avg_salary > 0 THEN COALESCE(rm.department_revenue, 0) / dm.avg_salary
            ELSE 0
          END as revenue_per_salary_unit,
          CASE 
            WHEN dm.overdue_tasks > dm.completed_tasks * 0.2 THEN 'high_roi_potential'
            WHEN dm.overdue_tasks > dm.completed_tasks * 0.1 THEN 'medium_roi_potential'
            ELSE 'low_roi_potential'
          END as hiring_roi_potential
        FROM department_metrics dm
        LEFT JOIN revenue_metrics rm ON dm.department = rm.department
        ORDER BY revenue_per_salary_dollar DESC
      `;

      return roiAnalysis;
    } catch (error) {
      logger.error('Error calculating hiring ROI:', error);
      throw error;
    }
  }

  /**
   * Generate hiring recommendations
   */
  private generateHiringRecommendations(analysis: any): any[] {
    const recommendations = [];

    // Analyze bottlenecks
    if (analysis.bottleneckAnalysis) {
      for (const bottleneck of analysis.bottleneckAnalysis) {
        if (bottleneck.bottleneck_severity === 'high') {
          recommendations.push({
            type: 'urgent_hiring',
            department: bottleneck.department,
            priority: 'high',
            reason: `High bottleneck severity with ${bottleneck.overdue_tasks} overdue tasks`,
            action: `Hire immediately for ${bottleneck.department}`,
            estimatedImpact: 'High - will reduce bottlenecks significantly'
          });
        }
      }
    }

    // Analyze capacity
    if (analysis.capacityAnalysis) {
      for (const capacity of analysis.capacityAnalysis) {
        if (capacity.hiring_recommendation === 'needs_hiring') {
          recommendations.push({
            type: 'capacity_hiring',
            department: capacity.department,
            priority: 'medium',
            reason: `${capacity.overloaded_employees} overloaded employees in ${capacity.department}`,
            action: `Hire 1-2 additional employees for ${capacity.department}`,
            estimatedImpact: 'Medium - will improve workload distribution'
          });
        }
      }
    }

    // Analyze growth projections
    if (analysis.growthProjections) {
      const projections = analysis.growthProjections;
      if (projections.hiring_strategy_3m === 'aggressive_hiring_needed') {
        recommendations.push({
          type: 'growth_hiring',
          department: 'All',
          priority: 'high',
          reason: 'Aggressive growth projected in next 3 months',
          action: 'Scale hiring across all departments',
          estimatedImpact: 'High - will support projected growth'
        });
      }
    }

    // Analyze hiring triggers
    if (analysis.hiringTriggers) {
      for (const trigger of analysis.hiringTriggers) {
        if (trigger.hiring_trigger === 'urgent_hiring_needed') {
          recommendations.push({
            type: 'trigger_hiring',
            department: trigger.department,
            priority: 'high',
            reason: `Urgent hiring trigger: ${trigger.overdue_tasks} overdue tasks`,
            action: `Immediate hiring for ${trigger.department}`,
            estimatedImpact: 'High - will address urgent capacity issues'
          });
        }
      }
    }

    return recommendations;
  }

  /**
   * Get hiring prediction dashboard
   */
  async getHiringDashboard(companyId: string): Promise<any> {
    try {
      const [
        hiringStats,
        recentAnalyses,
        departmentAnalysis,
        trendAnalysis
      ] = await Promise.all([
        this.getHiringStats(companyId),
        this.getRecentAnalyses(companyId),
        this.getDepartmentAnalysis(companyId),
        this.getTrendAnalysis(companyId)
      ]);

      return {
        hiringStats,
        recentAnalyses,
        departmentAnalysis,
        trendAnalysis
      };
    } catch (error) {
      logger.error('Error getting hiring dashboard:', error);
      throw error;
    }
  }

  /**
   * Get hiring statistics
   */
  private async getHiringStats(companyId: string): Promise<any> {
    try {
      const stats = await prisma.$queryRaw`
        SELECT 
          COUNT(*) as total_employees,
          COUNT(CASE WHEN hire_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_hires,
          COUNT(CASE WHEN hire_date >= CURRENT_DATE - INTERVAL '90 days' THEN 1 END) as hires_last_quarter,
          COUNT(CASE WHEN termination_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_departures,
          AVG(salary) as avg_salary,
          SUM(salary) as total_salary_cost,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_employees,
          COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_employees
        FROM employees
        WHERE company_id = ${companyId}
      `;

      return stats[0];
    } catch (error) {
      logger.error('Error getting hiring stats:', error);
      throw error;
    }
  }

  /**
   * Get recent analyses
   */
  private async getRecentAnalyses(companyId: string): Promise<any> {
    try {
      const analyses = await prisma.hiringAnalysis.findMany({
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
   * Get department analysis
   */
  private async getDepartmentAnalysis(companyId: string): Promise<any> {
    try {
      const analysis = await prisma.$queryRaw`
        SELECT 
          d.name as department,
          COUNT(e.id) as employee_count,
          AVG(e.salary) as avg_salary,
          SUM(e.salary) as total_salary_cost,
          COUNT(CASE WHEN e.hire_date >= CURRENT_DATE - INTERVAL '90 days' THEN 1 END) as recent_hires,
          COUNT(CASE WHEN e.termination_date >= CURRENT_DATE - INTERVAL '90 days' THEN 1 END) as recent_departures,
          AVG(ts.efficiency_score) as avg_efficiency
        FROM departments d
        LEFT JOIN employees e ON d.id = e.department_id
        LEFT JOIN timesheets ts ON e.id = ts.employee_id
        WHERE d.company_id = ${companyId}
        GROUP BY d.id, d.name
        ORDER BY employee_count DESC
      `;

      return analysis;
    } catch (error) {
      logger.error('Error getting department analysis:', error);
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
          DATE_TRUNC('month', hire_date) as month,
          COUNT(*) as hires,
          AVG(salary) as avg_salary,
          SUM(salary) as total_salary_cost
        FROM employees
        WHERE company_id = ${companyId}
        AND hire_date >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', hire_date)
        ORDER BY month DESC
      `;

      return trends;
    } catch (error) {
      logger.error('Error getting trend analysis:', error);
      throw error;
    }
  }

  /**
   * Save hiring analysis
   */
  async saveHiringAnalysis(companyId: string, analysisData: any): Promise<any> {
    try {
      const analysis = await prisma.hiringAnalysis.create({
        data: {
          companyId,
          analysisType: analysisData.type,
          analysisData: JSON.stringify(analysisData),
          recommendations: JSON.stringify(analysisData.recommendations || []),
          confidenceScore: analysisData.confidenceScore || 0,
          analyzedAt: new Date()
        }
      });

      return analysis;
    } catch (error) {
      logger.error('Error saving hiring analysis:', error);
      throw error;
    }
  }

  /**
   * Get hiring scenarios
   */
  async getHiringScenarios(companyId: string): Promise<any> {
    try {
      const scenarios = [
        {
          name: 'Hire Now',
          description: 'Immediate hiring to address current bottlenecks',
          timeline: '0-30 days',
          cost: await this.calculateHiringCost(companyId, 'immediate'),
          benefits: await this.calculateHiringBenefits(companyId, 'immediate'),
          risks: ['High upfront cost', 'Potential overstaffing']
        },
        {
          name: 'Hire in 3 Months',
          description: 'Delayed hiring based on growth projections',
          timeline: '90 days',
          cost: await this.calculateHiringCost(companyId, 'delayed'),
          benefits: await this.calculateHiringBenefits(companyId, 'delayed'),
          risks: ['Continued bottlenecks', 'Missed growth opportunities']
        },
        {
          name: 'Hire Gradually',
          description: 'Phased hiring approach over 6 months',
          timeline: '180 days',
          cost: await this.calculateHiringCost(companyId, 'gradual'),
          benefits: await this.calculateHiringBenefits(companyId, 'gradual'),
          risks: ['Slower capacity building', 'Complex planning']
        }
      ];

      return scenarios;
    } catch (error) {
      logger.error('Error getting hiring scenarios:', error);
      throw error;
    }
  }

  /**
   * Calculate hiring cost
   */
  private async calculateHiringCost(companyId: string, scenario: string): Promise<number> {
    try {
      const avgSalary = await prisma.$queryRaw`
        SELECT AVG(salary) as avg_salary
        FROM employees
        WHERE company_id = ${companyId}
        AND is_active = true
      `;

      const baseSalary = (avgSalary[0] as any).avg_salary || 75000;
      const hiringCost = baseSalary * 0.3; // 30% of salary for hiring costs
      const onboardingCost = baseSalary * 0.1; // 10% for onboarding

      switch (scenario) {
        case 'immediate':
          return (baseSalary + hiringCost + onboardingCost) * 1.2; // 20% premium for urgency
        case 'delayed':
          return (baseSalary + hiringCost + onboardingCost) * 0.9; // 10% discount for planning
        case 'gradual':
          return (baseSalary + hiringCost + onboardingCost) * 0.95; // 5% discount for phased approach
        default:
          return baseSalary + hiringCost + onboardingCost;
      }
    } catch (error) {
      logger.error('Error calculating hiring cost:', error);
      return 100000; // Default cost
    }
  }

  /**
   * Calculate hiring benefits
   */
  private async calculateHiringBenefits(companyId: string, scenario: string): Promise<string[]> {
    const benefits = [
      'Increased capacity and productivity',
      'Reduced bottlenecks and delays',
      'Improved employee satisfaction',
      'Better customer service',
      'Enhanced team capabilities'
    ];

    if (scenario === 'immediate') {
      benefits.push('Immediate bottleneck relief');
      benefits.push('Faster time to value');
    } else if (scenario === 'delayed') {
      benefits.push('Better planning and preparation');
      benefits.push('Lower risk of overstaffing');
    } else if (scenario === 'gradual') {
      benefits.push('Smooth capacity building');
      benefits.push('Better cultural integration');
    }

    return benefits;
  }
}