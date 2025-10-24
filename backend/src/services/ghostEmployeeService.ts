import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class GhostEmployeeService {
  /**
   * Detect ghost employees with advanced analysis
   */
  async detectGhostEmployees(companyId: string): Promise<any> {
    try {
      const ghostEmployees = await this.analyzeEmployeeActivity(companyId);
      
      // Create detailed ghost employee reports
      for (const employee of ghostEmployees) {
        await this.createGhostEmployeeReport(companyId, employee);
      }

      return ghostEmployees;
    } catch (error) {
      logger.error('Error detecting ghost employees:', error);
      throw error;
    }
  }

  /**
   * Analyze employee activity patterns
   */
  private async analyzeEmployeeActivity(companyId: string): Promise<any> {
    try {
      const activityAnalysis = await prisma.$queryRaw`
        WITH employee_activity AS (
          SELECT 
            e.id,
            e.name,
            e.email,
            e.hire_date,
            e.department,
            e.position,
            e.salary,
            e.is_active,
            COUNT(DISTINCT exp.id) as expense_count,
            COUNT(DISTINCT ts.id) as timesheet_count,
            COUNT(DISTINCT comm.id) as communication_count,
            COUNT(DISTINCT proj.id) as project_count,
            COUNT(DISTINCT task.id) as task_count,
            SUM(exp.amount) as total_expenses,
            SUM(ts.hours_worked) as total_hours,
            MAX(exp.created_at) as last_expense,
            MAX(ts.created_at) as last_timesheet,
            MAX(comm.created_at) as last_communication,
            MAX(proj.created_at) as last_project,
            MAX(task.created_at) as last_task
          FROM employees e
          LEFT JOIN expenses exp ON e.id = exp.employee_id
          LEFT JOIN timesheets ts ON e.id = ts.employee_id
          LEFT JOIN communications comm ON e.id = comm.employee_id
          LEFT JOIN project_assignments pa ON e.id = pa.employee_id
          LEFT JOIN projects proj ON pa.project_id = proj.id
          LEFT JOIN tasks task ON e.id = task.assigned_to
          WHERE e.company_id = ${companyId}
          AND e.is_active = true
          GROUP BY e.id, e.name, e.email, e.hire_date, e.department, e.position, e.salary, e.is_active
        )
        SELECT 
          *,
          CASE 
            WHEN expense_count = 0 AND timesheet_count = 0 AND communication_count = 0 THEN 'no_activity'
            WHEN expense_count = 0 AND timesheet_count = 0 AND communication_count < 5 THEN 'minimal_activity'
            WHEN (last_expense < CURRENT_DATE - INTERVAL '90 days' OR last_expense IS NULL)
                 AND (last_timesheet < CURRENT_DATE - INTERVAL '90 days' OR last_timesheet IS NULL)
                 AND (last_communication < CURRENT_DATE - INTERVAL '90 days' OR last_communication IS NULL) THEN 'inactive_90_days'
            WHEN (last_expense < CURRENT_DATE - INTERVAL '180 days' OR last_expense IS NULL)
                 AND (last_timesheet < CURRENT_DATE - INTERVAL '180 days' OR last_timesheet IS NULL)
                 AND (last_communication < CURRENT_DATE - INTERVAL '180 days' OR last_communication IS NULL) THEN 'inactive_180_days'
            ELSE 'active'
          END as activity_status
        FROM employee_activity
        WHERE activity_status != 'active'
        ORDER BY 
          CASE activity_status
            WHEN 'no_activity' THEN 1
            WHEN 'minimal_activity' THEN 2
            WHEN 'inactive_90_days' THEN 3
            WHEN 'inactive_180_days' THEN 4
          END,
          total_expenses DESC
      `;

      return activityAnalysis;
    } catch (error) {
      logger.error('Error analyzing employee activity:', error);
      throw error;
    }
  }

  /**
   * Create detailed ghost employee report
   */
  private async createGhostEmployeeReport(companyId: string, employee: any): Promise<any> {
    try {
      const riskScore = this.calculateGhostEmployeeRiskScore(employee);
      const recommendations = this.generateGhostEmployeeRecommendations(employee);

      const report = await prisma.ghostEmployeeReport.create({
        data: {
          companyId,
          employeeId: employee.id,
          employeeName: employee.name,
          employeeEmail: employee.email,
          department: employee.department,
          position: employee.position,
          salary: employee.salary,
          hireDate: employee.hire_date,
          activityStatus: employee.activity_status,
          riskScore,
          totalExpenses: employee.total_expenses || 0,
          totalHours: employee.total_hours || 0,
          expenseCount: employee.expense_count || 0,
          timesheetCount: employee.timesheet_count || 0,
          communicationCount: employee.communication_count || 0,
          projectCount: employee.project_count || 0,
          taskCount: employee.task_count || 0,
          lastExpense: employee.last_expense,
          lastTimesheet: employee.last_timesheet,
          lastCommunication: employee.last_communication,
          lastProject: employee.last_project,
          lastTask: employee.last_task,
          recommendations: JSON.stringify(recommendations),
          detectedAt: new Date(),
          isResolved: false
        }
      });

      return report;
    } catch (error) {
      logger.error('Error creating ghost employee report:', error);
      throw error;
    }
  }

  /**
   * Calculate ghost employee risk score
   */
  private calculateGhostEmployeeRiskScore(employee: any): number {
    let riskScore = 0;
    
    // No activity at all
    if (employee.activity_status === 'no_activity') {
      riskScore += 50;
    }
    
    // Minimal activity
    if (employee.activity_status === 'minimal_activity') {
      riskScore += 30;
    }
    
    // Inactive for 90+ days
    if (employee.activity_status === 'inactive_90_days') {
      riskScore += 40;
    }
    
    // Inactive for 180+ days
    if (employee.activity_status === 'inactive_180_days') {
      riskScore += 60;
    }
    
    // High salary with no activity
    if (employee.salary && employee.salary > 100000 && employee.expense_count === 0) {
      riskScore += 20;
    }
    
    // No expenses but high salary
    if (employee.salary && employee.salary > 50000 && employee.expense_count === 0) {
      riskScore += 15;
    }
    
    // No timesheets
    if (employee.timesheet_count === 0) {
      riskScore += 10;
    }
    
    // No communications
    if (employee.communication_count === 0) {
      riskScore += 10;
    }
    
    // No projects
    if (employee.project_count === 0) {
      riskScore += 5;
    }
    
    // No tasks
    if (employee.task_count === 0) {
      riskScore += 5;
    }
    
    return Math.min(riskScore, 100);
  }

  /**
   * Generate ghost employee recommendations
   */
  private generateGhostEmployeeRecommendations(employee: any): string[] {
    const recommendations = [];
    
    if (employee.activity_status === 'no_activity') {
      recommendations.push('Immediate investigation required - no activity detected');
      recommendations.push('Verify employee status with HR department');
      recommendations.push('Check if employee is on leave or terminated');
    }
    
    if (employee.activity_status === 'minimal_activity') {
      recommendations.push('Schedule check-in with employee');
      recommendations.push('Verify work assignments and expectations');
      recommendations.push('Review communication channels');
    }
    
    if (employee.activity_status === 'inactive_90_days') {
      recommendations.push('90-day inactivity review required');
      recommendations.push('Contact employee to verify status');
      recommendations.push('Review project assignments and workload');
    }
    
    if (employee.activity_status === 'inactive_180_days') {
      recommendations.push('180-day inactivity - termination review');
      recommendations.push('Verify employee termination status');
      recommendations.push('Update HR records and payroll');
    }
    
    if (employee.salary && employee.salary > 100000 && employee.expense_count === 0) {
      recommendations.push('High-salary employee with no expenses - verify status');
    }
    
    if (employee.timesheet_count === 0) {
      recommendations.push('No timesheets submitted - verify time tracking requirements');
    }
    
    if (employee.communication_count === 0) {
      recommendations.push('No communications recorded - verify communication channels');
    }
    
    return recommendations;
  }

  /**
   * Get ghost employee dashboard
   */
  async getGhostEmployeeDashboard(companyId: string): Promise<any> {
    try {
      const [
        ghostStats,
        recentReports,
        departmentAnalysis,
        riskAnalysis
      ] = await Promise.all([
        this.getGhostEmployeeStats(companyId),
        this.getRecentGhostEmployeeReports(companyId),
        this.getDepartmentAnalysis(companyId),
        this.getRiskAnalysis(companyId)
      ]);

      return {
        ghostStats,
        recentReports,
        departmentAnalysis,
        riskAnalysis
      };
    } catch (error) {
      logger.error('Error getting ghost employee dashboard:', error);
      throw error;
    }
  }

  /**
   * Get ghost employee statistics
   */
  private async getGhostEmployeeStats(companyId: string): Promise<any> {
    try {
      const stats = await prisma.$queryRaw`
        SELECT 
          COUNT(*) as total_ghost_employees,
          COUNT(CASE WHEN activity_status = 'no_activity' THEN 1 END) as no_activity,
          COUNT(CASE WHEN activity_status = 'minimal_activity' THEN 1 END) as minimal_activity,
          COUNT(CASE WHEN activity_status = 'inactive_90_days' THEN 1 END) as inactive_90_days,
          COUNT(CASE WHEN activity_status = 'inactive_180_days' THEN 1 END) as inactive_180_days,
          COUNT(CASE WHEN risk_score >= 80 THEN 1 END) as high_risk,
          COUNT(CASE WHEN risk_score >= 60 AND risk_score < 80 THEN 1 END) as medium_risk,
          COUNT(CASE WHEN risk_score < 60 THEN 1 END) as low_risk,
          COUNT(CASE WHEN is_resolved THEN 1 END) as resolved,
          COUNT(CASE WHEN NOT is_resolved THEN 1 END) as unresolved,
          AVG(risk_score) as avg_risk_score,
          SUM(salary) as total_salary_at_risk
        FROM ghost_employee_reports
        WHERE company_id = ${companyId}
        AND detected_at >= CURRENT_DATE - INTERVAL '30 days'
      `;

      return stats[0];
    } catch (error) {
      logger.error('Error getting ghost employee stats:', error);
      throw error;
    }
  }

  /**
   * Get recent ghost employee reports
   */
  private async getRecentGhostEmployeeReports(companyId: string): Promise<any> {
    try {
      const reports = await prisma.ghostEmployeeReport.findMany({
        where: { companyId },
        orderBy: { detectedAt: 'desc' },
        take: 20
      });

      return reports;
    } catch (error) {
      logger.error('Error getting recent ghost employee reports:', error);
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
          department,
          COUNT(*) as ghost_count,
          AVG(risk_score) as avg_risk_score,
          SUM(salary) as total_salary_at_risk,
          COUNT(CASE WHEN activity_status = 'no_activity' THEN 1 END) as no_activity_count,
          COUNT(CASE WHEN activity_status = 'inactive_90_days' THEN 1 END) as inactive_90_count,
          COUNT(CASE WHEN activity_status = 'inactive_180_days' THEN 1 END) as inactive_180_count
        FROM ghost_employee_reports
        WHERE company_id = ${companyId}
        AND detected_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY department
        ORDER BY ghost_count DESC
      `;

      return analysis;
    } catch (error) {
      logger.error('Error getting department analysis:', error);
      throw error;
    }
  }

  /**
   * Get risk analysis
   */
  private async getRiskAnalysis(companyId: string): Promise<any> {
    try {
      const analysis = await prisma.$queryRaw`
        SELECT 
          DATE(detected_at) as detection_date,
          COUNT(*) as ghost_employees_detected,
          COUNT(CASE WHEN risk_score >= 80 THEN 1 END) as high_risk,
          COUNT(CASE WHEN risk_score >= 60 AND risk_score < 80 THEN 1 END) as medium_risk,
          COUNT(CASE WHEN risk_score < 60 THEN 1 END) as low_risk,
          AVG(risk_score) as avg_risk_score
        FROM ghost_employee_reports
        WHERE company_id = ${companyId}
        AND detected_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(detected_at)
        ORDER BY detection_date DESC
      `;

      return analysis;
    } catch (error) {
      logger.error('Error getting risk analysis:', error);
      throw error;
    }
  }

  /**
   * Resolve ghost employee report
   */
  async resolveGhostEmployeeReport(companyId: string, reportId: string, resolution: any): Promise<any> {
    try {
      const updatedReport = await prisma.ghostEmployeeReport.update({
        where: { 
          id: reportId,
          companyId 
        },
        data: {
          isResolved: true,
          resolvedAt: new Date(),
          resolutionNotes: resolution.notes,
          resolutionType: resolution.type
        }
      });

      return updatedReport;
    } catch (error) {
      logger.error('Error resolving ghost employee report:', error);
      throw error;
    }
  }

  /**
   * Get ghost employee trends
   */
  async getGhostEmployeeTrends(companyId: string, days: number = 30): Promise<any> {
    try {
      const trends = await prisma.$queryRaw`
        SELECT 
          DATE(detected_at) as date,
          COUNT(*) as ghost_employees_detected,
          COUNT(CASE WHEN activity_status = 'no_activity' THEN 1 END) as no_activity,
          COUNT(CASE WHEN activity_status = 'minimal_activity' THEN 1 END) as minimal_activity,
          COUNT(CASE WHEN activity_status = 'inactive_90_days' THEN 1 END) as inactive_90_days,
          COUNT(CASE WHEN activity_status = 'inactive_180_days' THEN 1 END) as inactive_180_days,
          AVG(risk_score) as avg_risk_score,
          SUM(salary) as total_salary_at_risk
        FROM ghost_employee_reports
        WHERE company_id = ${companyId}
        AND detected_at >= CURRENT_DATE - INTERVAL '${days} days'
        GROUP BY DATE(detected_at)
        ORDER BY date DESC
      `;

      return trends;
    } catch (error) {
      logger.error('Error getting ghost employee trends:', error);
      throw error;
    }
  }
}