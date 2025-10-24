import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class BottleneckAnalysisService {
  /**
   * Analyze operational bottlenecks
   */
  async analyzeBottlenecks(companyId: string): Promise<any> {
    try {
      const [
        taskBottlenecks,
        resourceBottlenecks,
        processBottlenecks,
        capacityBottlenecks
      ] = await Promise.all([
        this.analyzeTaskBottlenecks(companyId),
        this.analyzeResourceBottlenecks(companyId),
        this.analyzeProcessBottlenecks(companyId),
        this.analyzeCapacityBottlenecks(companyId)
      ]);

      return {
        taskBottlenecks,
        resourceBottlenecks,
        processBottlenecks,
        capacityBottlenecks,
        overallBottleneckScore: this.calculateOverallBottleneckScore({
          taskBottlenecks,
          resourceBottlenecks,
          processBottlenecks,
          capacityBottlenecks
        }),
        recommendations: this.generateBottleneckRecommendations({
          taskBottlenecks,
          resourceBottlenecks,
          processBottlenecks,
          capacityBottlenecks
        })
      };
    } catch (error) {
      logger.error('Error analyzing bottlenecks:', error);
      throw error;
    }
  }

  /**
   * Analyze task bottlenecks
   */
  private async analyzeTaskBottlenecks(companyId: string): Promise<any> {
    try {
      const taskBottlenecks = await prisma.$queryRaw`
        WITH task_metrics AS (
          SELECT 
            t.id,
            t.title,
            t.description,
            t.status,
            t.priority,
            t.estimated_hours,
            t.actual_hours,
            t.created_at,
            t.due_date,
            t.completed_at,
            e.name as assigned_to,
            d.name as department,
            CASE 
              WHEN t.due_date < CURRENT_DATE AND t.status != 'completed' THEN 'overdue'
              WHEN t.due_date < CURRENT_DATE + INTERVAL '3 days' AND t.status != 'completed' THEN 'due_soon'
              ELSE 'on_track'
            END as urgency_status,
            CASE 
              WHEN t.actual_hours > t.estimated_hours * 1.5 THEN 'significantly_over_estimate'
              WHEN t.actual_hours > t.estimated_hours * 1.2 THEN 'over_estimate'
              WHEN t.actual_hours < t.estimated_hours * 0.8 THEN 'under_estimate'
              ELSE 'accurate_estimate'
            END as estimation_accuracy
          FROM tasks t
          JOIN employees e ON t.assigned_to = e.id
          JOIN departments d ON e.department_id = d.id
          WHERE e.company_id = ${companyId}
          AND t.created_at >= CURRENT_DATE - INTERVAL '90 days'
        ),
        bottleneck_analysis AS (
          SELECT 
            department,
            COUNT(*) as total_tasks,
            COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_tasks,
            COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
            COUNT(CASE WHEN urgency_status = 'overdue' THEN 1 END) as urgent_tasks,
            AVG(estimated_hours) as avg_estimated_hours,
            AVG(actual_hours) as avg_actual_hours,
            AVG(CASE WHEN actual_hours > 0 THEN actual_hours / estimated_hours ELSE 1 END) as avg_time_ratio,
            COUNT(CASE WHEN estimation_accuracy = 'significantly_over_estimate' THEN 1 END) as over_estimated_tasks,
            COUNT(CASE WHEN estimation_accuracy = 'under_estimate' THEN 1 END) as under_estimated_tasks
          FROM task_metrics
          GROUP BY department
        )
        SELECT 
          *,
          CASE 
            WHEN overdue_tasks > total_tasks * 0.3 THEN 'critical'
            WHEN overdue_tasks > total_tasks * 0.2 THEN 'high'
            WHEN overdue_tasks > total_tasks * 0.1 THEN 'medium'
            ELSE 'low'
          END as bottleneck_severity,
          CASE 
            WHEN avg_time_ratio > 1.5 THEN 'poor_estimation'
            WHEN avg_time_ratio > 1.2 THEN 'estimation_issues'
            WHEN avg_time_ratio < 0.8 THEN 'under_estimation'
            ELSE 'good_estimation'
          END as estimation_quality
        FROM bottleneck_analysis
        ORDER BY overdue_tasks DESC
      `;

      return taskBottlenecks;
    } catch (error) {
      logger.error('Error analyzing task bottlenecks:', error);
      throw error;
    }
  }

  /**
   * Analyze resource bottlenecks
   */
  private async analyzeResourceBottlenecks(companyId: string): Promise<any> {
    try {
      const resourceBottlenecks = await prisma.$queryRaw`
        WITH employee_workload AS (
          SELECT 
            e.id,
            e.name,
            e.department_id,
            d.name as department,
            e.salary,
            COUNT(t.id) as assigned_tasks,
            SUM(t.estimated_hours) as total_estimated_hours,
            AVG(ts.hours_worked) as avg_hours_worked,
            AVG(ts.efficiency_score) as efficiency_score,
            COUNT(CASE WHEN t.status = 'overdue' THEN 1 END) as overdue_tasks,
            COUNT(CASE WHEN t.priority = 'high' THEN 1 END) as high_priority_tasks
          FROM employees e
          JOIN departments d ON e.department_id = d.id
          LEFT JOIN tasks t ON e.id = t.assigned_to
          LEFT JOIN timesheets ts ON e.id = ts.employee_id
          WHERE e.company_id = ${companyId}
          AND e.is_active = true
          GROUP BY e.id, e.name, e.department_id, d.name, e.salary
        ),
        resource_analysis AS (
          SELECT 
            department,
            COUNT(*) as total_employees,
            AVG(assigned_tasks) as avg_tasks_per_employee,
            AVG(total_estimated_hours) as avg_hours_per_employee,
            AVG(efficiency_score) as avg_efficiency,
            AVG(salary) as avg_salary,
            SUM(salary) as total_salary_cost,
            COUNT(CASE WHEN assigned_tasks > 10 THEN 1 END) as overloaded_employees,
            COUNT(CASE WHEN assigned_tasks < 3 THEN 1 END) as underutilized_employees,
            COUNT(CASE WHEN overdue_tasks > 0 THEN 1 END) as employees_with_overdue_tasks,
            COUNT(CASE WHEN efficiency_score < 0.7 THEN 1 END) as low_efficiency_employees
          FROM employee_workload
          GROUP BY department
        )
        SELECT 
          *,
          CASE 
            WHEN overloaded_employees > total_employees * 0.4 THEN 'critical'
            WHEN overloaded_employees > total_employees * 0.3 THEN 'high'
            WHEN overloaded_employees > total_employees * 0.2 THEN 'medium'
            ELSE 'low'
          END as resource_bottleneck_severity,
          CASE 
            WHEN avg_efficiency < 0.6 THEN 'poor_performance'
            WHEN avg_efficiency < 0.7 THEN 'below_average'
            WHEN avg_efficiency > 0.8 THEN 'good_performance'
            ELSE 'average_performance'
          END as performance_level
        FROM resource_analysis
        ORDER BY overloaded_employees DESC
      `;

      return resourceBottlenecks;
    } catch (error) {
      logger.error('Error analyzing resource bottlenecks:', error);
      throw error;
    }
  }

  /**
   * Analyze process bottlenecks
   */
  private async analyzeProcessBottlenecks(companyId: string): Promise<any> {
    try {
      const processBottlenecks = await prisma.$queryRaw`
        WITH process_metrics AS (
          SELECT 
            t.id,
            t.title,
            t.status,
            t.priority,
            t.created_at,
            t.due_date,
            t.completed_at,
            e.name as assigned_to,
            d.name as department,
            CASE 
              WHEN t.completed_at IS NOT NULL THEN 
                EXTRACT(EPOCH FROM (t.completed_at - t.created_at)) / 3600
              ELSE 
                EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - t.created_at)) / 3600
            END as hours_to_complete,
            CASE 
              WHEN t.due_date IS NOT NULL THEN 
                EXTRACT(EPOCH FROM (t.due_date - t.created_at)) / 3600
              ELSE NULL
            END as hours_allocated
          FROM tasks t
          JOIN employees e ON t.assigned_to = e.id
          JOIN departments d ON e.department_id = d.id
          WHERE e.company_id = ${companyId}
          AND t.created_at >= CURRENT_DATE - INTERVAL '90 days'
        ),
        process_analysis AS (
          SELECT 
            department,
            COUNT(*) as total_tasks,
            AVG(hours_to_complete) as avg_completion_time,
            AVG(hours_allocated) as avg_allocated_time,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
            COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_tasks,
            COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
            AVG(CASE 
              WHEN hours_allocated > 0 THEN hours_to_complete / hours_allocated 
              ELSE NULL 
            END) as time_efficiency_ratio,
            COUNT(CASE WHEN hours_to_complete > hours_allocated * 1.5 THEN 1 END) as significantly_delayed_tasks
          FROM process_metrics
          GROUP BY department
        )
        SELECT 
          *,
          CASE 
            WHEN overdue_tasks > total_tasks * 0.25 THEN 'critical'
            WHEN overdue_tasks > total_tasks * 0.15 THEN 'high'
            WHEN overdue_tasks > total_tasks * 0.1 THEN 'medium'
            ELSE 'low'
          END as process_bottleneck_severity,
          CASE 
            WHEN time_efficiency_ratio > 1.5 THEN 'poor_efficiency'
            WHEN time_efficiency_ratio > 1.2 THEN 'below_average_efficiency'
            WHEN time_efficiency_ratio < 0.8 THEN 'excellent_efficiency'
            ELSE 'good_efficiency'
          END as efficiency_level
        FROM process_analysis
        ORDER BY overdue_tasks DESC
      `;

      return processBottlenecks;
    } catch (error) {
      logger.error('Error analyzing process bottlenecks:', error);
      throw error;
    }
  }

  /**
   * Analyze capacity bottlenecks
   */
  private async analyzeCapacityBottlenecks(companyId: string): Promise<any> {
    try {
      const capacityBottlenecks = await prisma.$queryRaw`
        WITH capacity_metrics AS (
          SELECT 
            d.id as department_id,
            d.name as department,
            COUNT(e.id) as total_employees,
            COUNT(CASE WHEN e.is_active = true THEN 1 END) as active_employees,
            AVG(e.salary) as avg_salary,
            SUM(e.salary) as total_salary_cost,
            COUNT(t.id) as total_tasks,
            SUM(t.estimated_hours) as total_estimated_hours,
            AVG(ts.hours_worked) as avg_hours_per_employee,
            COUNT(CASE WHEN t.status = 'overdue' THEN 1 END) as overdue_tasks,
            COUNT(CASE WHEN t.priority = 'high' THEN 1 END) as high_priority_tasks
          FROM departments d
          LEFT JOIN employees e ON d.id = e.department_id
          LEFT JOIN tasks t ON e.id = t.assigned_to
          LEFT JOIN timesheets ts ON e.id = ts.employee_id
          WHERE d.company_id = ${companyId}
          GROUP BY d.id, d.name
        ),
        capacity_analysis AS (
          SELECT 
            *,
            CASE 
              WHEN total_estimated_hours > 0 THEN 
                (active_employees * 40 * 4) / total_estimated_hours
              ELSE 0
            END as capacity_utilization,
            CASE 
              WHEN total_estimated_hours > 0 THEN 
                total_estimated_hours / (active_employees * 40 * 4)
              ELSE 0
            END as workload_ratio,
            CASE 
              WHEN overdue_tasks > total_tasks * 0.2 THEN 'overloaded'
              WHEN overdue_tasks > total_tasks * 0.1 THEN 'near_capacity'
              WHEN overdue_tasks < total_tasks * 0.05 THEN 'underutilized'
              ELSE 'balanced'
            END as capacity_status
          FROM capacity_metrics
        )
        SELECT 
          *,
          CASE 
            WHEN capacity_status = 'overloaded' THEN 'critical'
            WHEN capacity_status = 'near_capacity' THEN 'high'
            WHEN capacity_status = 'balanced' THEN 'medium'
            ELSE 'low'
          END as capacity_bottleneck_severity,
          CASE 
            WHEN workload_ratio > 1.2 THEN 'overloaded'
            WHEN workload_ratio > 1.0 THEN 'at_capacity'
            WHEN workload_ratio < 0.8 THEN 'underutilized'
            ELSE 'balanced'
          END as workload_status
        FROM capacity_analysis
        ORDER BY overdue_tasks DESC
      `;

      return capacityBottlenecks;
    } catch (error) {
      logger.error('Error analyzing capacity bottlenecks:', error);
      throw error;
    }
  }

  /**
   * Calculate overall bottleneck score
   */
  private calculateOverallBottleneckScore(analysis: any): number {
    let totalScore = 0;
    let weightSum = 0;

    // Task bottlenecks (weight: 0.3)
    if (analysis.taskBottlenecks && analysis.taskBottlenecks.length > 0) {
      const taskScore = analysis.taskBottlenecks.reduce((sum: number, bottleneck: any) => {
        const severityScore = bottleneck.bottleneck_severity === 'critical' ? 100 :
                            bottleneck.bottleneck_severity === 'high' ? 75 :
                            bottleneck.bottleneck_severity === 'medium' ? 50 : 25;
        return sum + severityScore;
      }, 0) / analysis.taskBottlenecks.length;
      totalScore += taskScore * 0.3;
      weightSum += 0.3;
    }

    // Resource bottlenecks (weight: 0.3)
    if (analysis.resourceBottlenecks && analysis.resourceBottlenecks.length > 0) {
      const resourceScore = analysis.resourceBottlenecks.reduce((sum: number, bottleneck: any) => {
        const severityScore = bottleneck.resource_bottleneck_severity === 'critical' ? 100 :
                            bottleneck.resource_bottleneck_severity === 'high' ? 75 :
                            bottleneck.resource_bottleneck_severity === 'medium' ? 50 : 25;
        return sum + severityScore;
      }, 0) / analysis.resourceBottlenecks.length;
      totalScore += resourceScore * 0.3;
      weightSum += 0.3;
    }

    // Process bottlenecks (weight: 0.2)
    if (analysis.processBottlenecks && analysis.processBottlenecks.length > 0) {
      const processScore = analysis.processBottlenecks.reduce((sum: number, bottleneck: any) => {
        const severityScore = bottleneck.process_bottleneck_severity === 'critical' ? 100 :
                            bottleneck.process_bottleneck_severity === 'high' ? 75 :
                            bottleneck.process_bottleneck_severity === 'medium' ? 50 : 25;
        return sum + severityScore;
      }, 0) / analysis.processBottlenecks.length;
      totalScore += processScore * 0.2;
      weightSum += 0.2;
    }

    // Capacity bottlenecks (weight: 0.2)
    if (analysis.capacityBottlenecks && analysis.capacityBottlenecks.length > 0) {
      const capacityScore = analysis.capacityBottlenecks.reduce((sum: number, bottleneck: any) => {
        const severityScore = bottleneck.capacity_bottleneck_severity === 'critical' ? 100 :
                            bottleneck.capacity_bottleneck_severity === 'high' ? 75 :
                            bottleneck.capacity_bottleneck_severity === 'medium' ? 50 : 25;
        return sum + severityScore;
      }, 0) / analysis.capacityBottlenecks.length;
      totalScore += capacityScore * 0.2;
      weightSum += 0.2;
    }

    return weightSum > 0 ? Math.round(totalScore / weightSum) : 0;
  }

  /**
   * Generate bottleneck recommendations
   */
  private generateBottleneckRecommendations(analysis: any): any[] {
    const recommendations = [];

    // Task bottleneck recommendations
    if (analysis.taskBottlenecks) {
      for (const bottleneck of analysis.taskBottlenecks) {
        if (bottleneck.bottleneck_severity === 'critical' || bottleneck.bottleneck_severity === 'high') {
          recommendations.push({
            type: 'task_bottleneck',
            department: bottleneck.department,
            priority: bottleneck.bottleneck_severity,
            issue: `${bottleneck.overdue_tasks} overdue tasks in ${bottleneck.department}`,
            recommendation: `Hire additional staff for ${bottleneck.department} or redistribute workload`,
            impact: 'High - will reduce task delays and improve delivery times'
          });
        }
      }
    }

    // Resource bottleneck recommendations
    if (analysis.resourceBottlenecks) {
      for (const bottleneck of analysis.resourceBottlenecks) {
        if (bottleneck.resource_bottleneck_severity === 'critical' || bottleneck.resource_bottleneck_severity === 'high') {
          recommendations.push({
            type: 'resource_bottleneck',
            department: bottleneck.department,
            priority: bottleneck.resource_bottleneck_severity,
            issue: `${bottleneck.overloaded_employees} overloaded employees in ${bottleneck.department}`,
            recommendation: `Hire ${Math.ceil(bottleneck.overloaded_employees / 2)} additional employees for ${bottleneck.department}`,
            impact: 'High - will reduce employee burnout and improve productivity'
          });
        }
      }
    }

    // Process bottleneck recommendations
    if (analysis.processBottlenecks) {
      for (const bottleneck of analysis.processBottlenecks) {
        if (bottleneck.process_bottleneck_severity === 'critical' || bottleneck.process_bottleneck_severity === 'high') {
          recommendations.push({
            type: 'process_bottleneck',
            department: bottleneck.department,
            priority: bottleneck.process_bottleneck_severity,
            issue: `Poor process efficiency in ${bottleneck.department} (${bottleneck.overdue_tasks} overdue tasks)`,
            recommendation: `Review and optimize processes in ${bottleneck.department}, consider hiring process improvement specialist`,
            impact: 'Medium - will improve process efficiency and reduce delays'
          });
        }
      }
    }

    // Capacity bottleneck recommendations
    if (analysis.capacityBottlenecks) {
      for (const bottleneck of analysis.capacityBottlenecks) {
        if (bottleneck.capacity_bottleneck_severity === 'critical' || bottleneck.capacity_bottleneck_severity === 'high') {
          recommendations.push({
            type: 'capacity_bottleneck',
            department: bottleneck.department,
            priority: bottleneck.capacity_bottleneck_severity,
            issue: `Capacity overload in ${bottleneck.department} (${bottleneck.overdue_tasks} overdue tasks)`,
            recommendation: `Increase capacity for ${bottleneck.department} through hiring or process optimization`,
            impact: 'High - will address capacity constraints and improve delivery'
          });
        }
      }
    }

    return recommendations;
  }

  /**
   * Get bottleneck dashboard
   */
  async getBottleneckDashboard(companyId: string): Promise<any> {
    try {
      const [
        bottleneckStats,
        recentAnalyses,
        departmentAnalysis,
        trendAnalysis
      ] = await Promise.all([
        this.getBottleneckStats(companyId),
        this.getRecentAnalyses(companyId),
        this.getDepartmentAnalysis(companyId),
        this.getTrendAnalysis(companyId)
      ]);

      return {
        bottleneckStats,
        recentAnalyses,
        departmentAnalysis,
        trendAnalysis
      };
    } catch (error) {
      logger.error('Error getting bottleneck dashboard:', error);
      throw error;
    }
  }

  /**
   * Get bottleneck statistics
   */
  private async getBottleneckStats(companyId: string): Promise<any> {
    try {
      const stats = await prisma.$queryRaw`
        SELECT 
          COUNT(*) as total_tasks,
          COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_tasks,
          COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
          AVG(estimated_hours) as avg_estimated_hours,
          AVG(actual_hours) as avg_actual_hours,
          COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_tasks,
          COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_priority_tasks,
          COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_priority_tasks
        FROM tasks t
        JOIN employees e ON t.assigned_to = e.id
        WHERE e.company_id = ${companyId}
        AND t.created_at >= CURRENT_DATE - INTERVAL '30 days'
      `;

      return stats[0];
    } catch (error) {
      logger.error('Error getting bottleneck stats:', error);
      throw error;
    }
  }

  /**
   * Get recent analyses
   */
  private async getRecentAnalyses(companyId: string): Promise<any> {
    try {
      const analyses = await prisma.bottleneckAnalysis.findMany({
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
          COUNT(t.id) as total_tasks,
          COUNT(CASE WHEN t.status = 'overdue' THEN 1 END) as overdue_tasks,
          COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as in_progress_tasks,
          AVG(t.estimated_hours) as avg_estimated_hours,
          AVG(t.actual_hours) as avg_actual_hours,
          COUNT(e.id) as total_employees,
          AVG(e.salary) as avg_salary
        FROM departments d
        LEFT JOIN employees e ON d.id = e.department_id
        LEFT JOIN tasks t ON e.id = t.assigned_to
        WHERE d.company_id = ${companyId}
        GROUP BY d.id, d.name
        ORDER BY overdue_tasks DESC
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
          DATE_TRUNC('week', created_at) as week,
          COUNT(*) as total_tasks,
          COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_tasks,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
          AVG(estimated_hours) as avg_estimated_hours,
          AVG(actual_hours) as avg_actual_hours
        FROM tasks t
        JOIN employees e ON t.assigned_to = e.id
        WHERE e.company_id = ${companyId}
        AND t.created_at >= CURRENT_DATE - INTERVAL '12 weeks'
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
   * Save bottleneck analysis
   */
  async saveBottleneckAnalysis(companyId: string, analysisData: any): Promise<any> {
    try {
      const analysis = await prisma.bottleneckAnalysis.create({
        data: {
          companyId,
          analysisType: analysisData.type,
          analysisData: JSON.stringify(analysisData),
          recommendations: JSON.stringify(analysisData.recommendations || []),
          bottleneckScore: analysisData.overallBottleneckScore || 0,
          analyzedAt: new Date()
        }
      });

      return analysis;
    } catch (error) {
      logger.error('Error saving bottleneck analysis:', error);
      throw error;
    }
  }
}