import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface ProjectCost {
  id: string;
  organizationId: string;
  projectId: string;
  costType: 'labor' | 'materials' | 'equipment' | 'overhead' | 'travel' | 'other';
  category: string;
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  actualQuantity?: number;
  actualUnitCost?: number;
  actualTotalCost?: number;
  variance: number;
  variancePercentage: number;
  date: Date;
  resourceId?: string;
  vendorId?: string;
  invoiceId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EarnedValue {
  id: string;
  organizationId: string;
  projectId: string;
  period: Date;
  plannedValue: number; // PV - Budgeted Cost of Work Scheduled
  earnedValue: number; // EV - Budgeted Cost of Work Performed
  actualCost: number; // AC - Actual Cost of Work Performed
  budgetAtCompletion: number; // BAC - Total project budget
  estimateAtCompletion: number; // EAC - Estimated cost at completion
  estimateToComplete: number; // ETC - Estimated cost to complete
  scheduleVariance: number; // SV = EV - PV
  costVariance: number; // CV = EV - AC
  schedulePerformanceIndex: number; // SPI = EV / PV
  costPerformanceIndex: number; // CPI = EV / AC
  varianceAtCompletion: number; // VAC = BAC - EAC
  toCompletePerformanceIndex: number; // TCPI = (BAC - EV) / (BAC - AC)
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectBudget {
  id: string;
  organizationId: string;
  projectId: string;
  phase: string;
  category: string;
  budgetedAmount: number;
  actualAmount: number;
  committedAmount: number;
  remainingBudget: number;
  variance: number;
  variancePercentage: number;
  status: 'on_track' | 'at_risk' | 'over_budget';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CostAnalysis {
  projectId: string;
  projectName: string;
  totalBudget: number;
  totalActual: number;
  totalCommitted: number;
  remainingBudget: number;
  overallVariance: number;
  overallVariancePercentage: number;
  status: 'on_track' | 'at_risk' | 'over_budget';
  phases: {
    phase: string;
    budgeted: number;
    actual: number;
    variance: number;
    variancePercentage: number;
    status: string;
  }[];
  categories: {
    category: string;
    budgeted: number;
    actual: number;
    variance: number;
    variancePercentage: number;
    status: string;
  }[];
  trends: {
    period: string;
    planned: number;
    actual: number;
    earned: number;
  }[];
  recommendations: string[];
}

class ProjectCostingService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Record project cost
   */
  async recordProjectCost(data: {
    organizationId: string;
    projectId: string;
    costType: 'labor' | 'materials' | 'equipment' | 'overhead' | 'travel' | 'other';
    category: string;
    description: string;
    quantity: number;
    unitCost: number;
    date: Date;
    resourceId?: string;
    vendorId?: string;
    invoiceId?: string;
    notes?: string;
  }): Promise<ProjectCost> {
    try {
      const totalCost = data.quantity * data.unitCost;

      const projectCost = await this.prisma.projectCost.create({
        data: {
          id: uuidv4(),
          organizationId: data.organizationId,
          projectId: data.projectId,
          costType: data.costType,
          category: data.category,
          description: data.description,
          quantity: data.quantity,
          unitCost: data.unitCost,
          totalCost,
          actualQuantity: data.quantity,
          actualUnitCost: data.unitCost,
          actualTotalCost: totalCost,
          variance: 0,
          variancePercentage: 0,
          date: data.date,
          resourceId: data.resourceId,
          vendorId: data.vendorId,
          invoiceId: data.invoiceId,
          notes: data.notes,
        },
      });

      // Update project budget
      await this.updateProjectBudget(data.projectId, data.organizationId);

      logger.info(`[ProjectCostingService] Recorded project cost: ${data.description}`);
      return projectCost;
    } catch (error) {
      logger.error('[ProjectCostingService] Failed to record project cost:', error);
      throw new Error(`Failed to record project cost: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate earned value metrics
   */
  async calculateEarnedValue(
    projectId: string,
    organizationId: string,
    period: Date
  ): Promise<EarnedValue> {
    try {
      // Get project budget
      const project = await this.prisma.project.findFirst({
        where: { id: projectId, organizationId },
        select: { budget: true, startDate: true, endDate: true },
      });

      if (!project) {
        throw new Error('Project not found');
      }

      const budgetAtCompletion = project.budget || 0;

      // Calculate planned value (PV) - budgeted cost of work scheduled
      const plannedValue = await this.calculatePlannedValue(projectId, period);

      // Calculate earned value (EV) - budgeted cost of work performed
      const earnedValue = await this.calculateEarnedValueAmount(projectId, period);

      // Calculate actual cost (AC) - actual cost of work performed
      const actualCost = await this.calculateActualCost(projectId, period);

      // Calculate variances
      const scheduleVariance = earnedValue - plannedValue;
      const costVariance = earnedValue - actualCost;

      // Calculate performance indices
      const schedulePerformanceIndex = plannedValue > 0 ? earnedValue / plannedValue : 0;
      const costPerformanceIndex = actualCost > 0 ? earnedValue / actualCost : 0;

      // Calculate estimates
      const estimateAtCompletion = costPerformanceIndex > 0 ? budgetAtCompletion / costPerformanceIndex : budgetAtCompletion;
      const estimateToComplete = estimateAtCompletion - actualCost;
      const varianceAtCompletion = budgetAtCompletion - estimateAtCompletion;
      const toCompletePerformanceIndex = (budgetAtCompletion - earnedValue) / (budgetAtCompletion - actualCost);

      const earnedValueRecord = await this.prisma.earnedValue.create({
        data: {
          id: uuidv4(),
          organizationId,
          projectId,
          period,
          plannedValue,
          earnedValue,
          actualCost,
          budgetAtCompletion,
          estimateAtCompletion,
          estimateToComplete,
          scheduleVariance,
          costVariance,
          schedulePerformanceIndex,
          costPerformanceIndex,
          varianceAtCompletion,
          toCompletePerformanceIndex,
        },
      });

      logger.info(`[ProjectCostingService] Calculated earned value for project: ${projectId}`);
      return earnedValueRecord;
    } catch (error) {
      logger.error('[ProjectCostingService] Failed to calculate earned value:', error);
      throw new Error(`Failed to calculate earned value: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate planned value
   */
  private async calculatePlannedValue(projectId: string, period: Date): Promise<number> {
    try {
      // Get project budget by phase/category
      const budgets = await this.prisma.projectBudget.findMany({
        where: {
          projectId,
          status: { in: ['on_track', 'at_risk', 'over_budget'] },
        },
      });

      // Calculate percentage of project completion based on time
      const project = await this.prisma.project.findFirst({
        where: { id: projectId },
        select: { startDate: true, endDate: true },
      });

      if (!project || !project.startDate || !project.endDate) {
        return 0;
      }

      const totalDuration = project.endDate.getTime() - project.startDate.getTime();
      const elapsedDuration = period.getTime() - project.startDate.getTime();
      const plannedProgress = Math.min(Math.max(elapsedDuration / totalDuration, 0), 1);

      const totalBudget = budgets.reduce((sum, budget) => sum + budget.budgetedAmount, 0);
      return totalBudget * plannedProgress;
    } catch (error) {
      logger.error('[ProjectCostingService] Failed to calculate planned value:', error);
      return 0;
    }
  }

  /**
   * Calculate earned value amount
   */
  private async calculateEarnedValueAmount(projectId: string, period: Date): Promise<number> {
    try {
      // Get completed tasks and their budgeted costs
      const completedTasks = await this.prisma.task.findMany({
        where: {
          projectId,
          status: 'completed',
          completedAt: { lte: period },
        },
        select: {
          id: true,
          budgetedCost: true,
        },
      });

      return completedTasks.reduce((sum, task) => sum + (task.budgetedCost || 0), 0);
    } catch (error) {
      logger.error('[ProjectCostingService] Failed to calculate earned value amount:', error);
      return 0;
    }
  }

  /**
   * Calculate actual cost
   */
  private async calculateActualCost(projectId: string, period: Date): Promise<number> {
    try {
      const costs = await this.prisma.projectCost.findMany({
        where: {
          projectId,
          date: { lte: period },
        },
        select: {
          actualTotalCost: true,
        },
      });

      return costs.reduce((sum, cost) => sum + (cost.actualTotalCost || 0), 0);
    } catch (error) {
      logger.error('[ProjectCostingService] Failed to calculate actual cost:', error);
      return 0;
    }
  }

  /**
   * Create project budget
   */
  async createProjectBudget(data: {
    organizationId: string;
    projectId: string;
    phase: string;
    category: string;
    budgetedAmount: number;
    notes?: string;
  }): Promise<ProjectBudget> {
    try {
      const budget = await this.prisma.projectBudget.create({
        data: {
          id: uuidv4(),
          organizationId: data.organizationId,
          projectId: data.projectId,
          phase: data.phase,
          category: data.category,
          budgetedAmount: data.budgetedAmount,
          actualAmount: 0,
          committedAmount: 0,
          remainingBudget: data.budgetedAmount,
          variance: 0,
          variancePercentage: 0,
          status: 'on_track',
          notes: data.notes,
        },
      });

      logger.info(`[ProjectCostingService] Created project budget: ${data.phase} - ${data.category}`);
      return budget;
    } catch (error) {
      logger.error('[ProjectCostingService] Failed to create project budget:', error);
      throw new Error(`Failed to create project budget: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update project budget
   */
  private async updateProjectBudget(projectId: string, organizationId: string): Promise<void> {
    try {
      const budgets = await this.prisma.projectBudget.findMany({
        where: { projectId, organizationId },
      });

      for (const budget of budgets) {
        // Calculate actual amount from project costs
        const actualAmount = await this.prisma.projectCost.aggregate({
          where: {
            projectId,
            organizationId,
            category: budget.category,
          },
          _sum: {
            actualTotalCost: true,
          },
        });

        // Calculate committed amount from purchase orders
        const committedAmount = await this.prisma.purchaseOrder.aggregate({
          where: {
            projectId,
            organizationId,
            status: { in: ['ordered', 'received'] },
          },
          _sum: {
            totalAmount: true,
          },
        });

        const actual = actualAmount._sum.actualTotalCost || 0;
        const committed = committedAmount._sum.totalAmount || 0;
        const remaining = budget.budgetedAmount - actual - committed;
        const variance = budget.budgetedAmount - actual;
        const variancePercentage = budget.budgetedAmount > 0 ? (variance / budget.budgetedAmount) * 100 : 0;

        let status: 'on_track' | 'at_risk' | 'over_budget' = 'on_track';
        if (variancePercentage < -10) {
          status = 'over_budget';
        } else if (variancePercentage < -5) {
          status = 'at_risk';
        }

        await this.prisma.projectBudget.update({
          where: { id: budget.id },
          data: {
            actualAmount: actual,
            committedAmount: committed,
            remainingBudget: remaining,
            variance,
            variancePercentage,
            status,
          },
        });
      }
    } catch (error) {
      logger.error('[ProjectCostingService] Failed to update project budget:', error);
    }
  }

  /**
   * Get cost analysis for project
   */
  async getCostAnalysis(projectId: string, organizationId: string): Promise<CostAnalysis> {
    try {
      const project = await this.prisma.project.findFirst({
        where: { id: projectId, organizationId },
        select: { name: true, budget: true },
      });

      if (!project) {
        throw new Error('Project not found');
      }

      // Get budget data
      const budgets = await this.prisma.projectBudget.findMany({
        where: { projectId, organizationId },
      });

      // Get actual costs
      const costs = await this.prisma.projectCost.findMany({
        where: { projectId, organizationId },
      });

      const totalBudget = budgets.reduce((sum, budget) => sum + budget.budgetedAmount, 0);
      const totalActual = costs.reduce((sum, cost) => sum + (cost.actualTotalCost || 0), 0);
      const totalCommitted = budgets.reduce((sum, budget) => sum + budget.committedAmount, 0);
      const remainingBudget = totalBudget - totalActual - totalCommitted;
      const overallVariance = totalBudget - totalActual;
      const overallVariancePercentage = totalBudget > 0 ? (overallVariance / totalBudget) * 100 : 0;

      let status: 'on_track' | 'at_risk' | 'over_budget' = 'on_track';
      if (overallVariancePercentage < -10) {
        status = 'over_budget';
      } else if (overallVariancePercentage < -5) {
        status = 'at_risk';
      }

      // Group by phases
      const phases = budgets.reduce((acc, budget) => {
        const existing = acc.find(p => p.phase === budget.phase);
        if (existing) {
          existing.budgeted += budget.budgetedAmount;
          existing.actual += budget.actualAmount;
        } else {
          acc.push({
            phase: budget.phase,
            budgeted: budget.budgetedAmount,
            actual: budget.actualAmount,
            variance: budget.variance,
            variancePercentage: budget.variancePercentage,
            status: budget.status,
          });
        }
        return acc;
      }, [] as any[]);

      // Group by categories
      const categories = costs.reduce((acc, cost) => {
        const existing = acc.find(c => c.category === cost.category);
        if (existing) {
          existing.actual += cost.actualTotalCost || 0;
        } else {
          const budget = budgets.find(b => b.category === cost.category);
          acc.push({
            category: cost.category,
            budgeted: budget?.budgetedAmount || 0,
            actual: cost.actualTotalCost || 0,
            variance: (budget?.budgetedAmount || 0) - (cost.actualTotalCost || 0),
            variancePercentage: budget?.budgetedAmount && budget.budgetedAmount > 0 
              ? ((budget.budgetedAmount - (cost.actualTotalCost || 0)) / budget.budgetedAmount) * 100 
              : 0,
            status: budget?.status || 'on_track',
          });
        }
        return acc;
      }, [] as any[]);

      // Calculate trends (monthly)
      const trends = [];
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 11); // Last 12 months

      for (let i = 0; i < 12; i++) {
        const monthStart = new Date(startDate);
        monthStart.setMonth(monthStart.getMonth() + i);
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);

        const planned = await this.calculatePlannedValue(projectId, monthEnd);
        const actual = await this.calculateActualCost(projectId, monthEnd);
        const earned = await this.calculateEarnedValueAmount(projectId, monthEnd);

        trends.push({
          period: monthStart.toISOString().substring(0, 7),
          planned,
          actual,
          earned,
        });
      }

      // Generate recommendations
      const recommendations = [];
      if (overallVariancePercentage < -10) {
        recommendations.push('Project is significantly over budget. Review costs and consider scope reduction.');
      } else if (overallVariancePercentage < -5) {
        recommendations.push('Project is at risk of going over budget. Monitor costs closely.');
      }
      if (remainingBudget < totalBudget * 0.1) {
        recommendations.push('Less than 10% budget remaining. Consider additional funding or scope reduction.');
      }
      if (phases.some(p => p.variancePercentage < -20)) {
        recommendations.push('Some phases are significantly over budget. Review phase planning.');
      }

      return {
        projectId,
        projectName: project.name,
        totalBudget,
        totalActual,
        totalCommitted,
        remainingBudget,
        overallVariance,
        overallVariancePercentage,
        status,
        phases,
        categories,
        trends,
        recommendations,
      };
    } catch (error) {
      logger.error('[ProjectCostingService] Failed to get cost analysis:', error);
      throw new Error(`Failed to get cost analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get project costs
   */
  async getProjectCosts(
    projectId: string,
    organizationId: string,
    filters: {
      costType?: string;
      category?: string;
      dateFrom?: Date;
      dateTo?: Date;
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<{ data: ProjectCost[]; total: number; page: number; limit: number }> {
    try {
      const where = {
        projectId,
        organizationId,
        ...(filters.costType && { costType: filters.costType as any }),
        ...(filters.category && { category: filters.category }),
        ...(filters.dateFrom && filters.dateTo && {
          date: {
            gte: filters.dateFrom,
            lte: filters.dateTo,
          },
        }),
      };

      const [data, total] = await Promise.all([
        this.prisma.projectCost.findMany({
          where,
          orderBy: { date: 'desc' },
          skip: (pagination.page - 1) * pagination.limit,
          take: pagination.limit,
        }),
        this.prisma.projectCost.count({ where }),
      ]);

      return {
        data,
        total,
        page: pagination.page,
        limit: pagination.limit,
      };
    } catch (error) {
      logger.error('[ProjectCostingService] Failed to get project costs:', error);
      throw new Error(`Failed to get project costs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get earned value history
   */
  async getEarnedValueHistory(
    projectId: string,
    organizationId: string,
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<{ data: EarnedValue[]; total: number; page: number; limit: number }> {
    try {
      const where = {
        projectId,
        organizationId,
      };

      const [data, total] = await Promise.all([
        this.prisma.earnedValue.findMany({
          where,
          orderBy: { period: 'desc' },
          skip: (pagination.page - 1) * pagination.limit,
          take: pagination.limit,
        }),
        this.prisma.earnedValue.count({ where }),
      ]);

      return {
        data,
        total,
        page: pagination.page,
        limit: pagination.limit,
      };
    } catch (error) {
      logger.error('[ProjectCostingService] Failed to get earned value history:', error);
      throw new Error(`Failed to get earned value history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get project costing analytics
   */
  async getProjectCostingAnalytics(organizationId: string, dateFrom: Date, dateTo: Date) {
    try {
      const [
        totalProjects,
        overBudgetProjects,
        onTrackProjects,
        totalBudget,
        totalActual,
        averageVariance,
        topCostCategories,
      ] = await Promise.all([
        // Total projects
        this.prisma.project.count({
          where: {
            organizationId,
            createdAt: {
              gte: dateFrom,
              lte: dateTo,
            },
          },
        }),

        // Over budget projects
        this.prisma.projectBudget.count({
          where: {
            organizationId,
            status: 'over_budget',
            createdAt: {
              gte: dateFrom,
              lte: dateTo,
            },
          },
        }),

        // On track projects
        this.prisma.projectBudget.count({
          where: {
            organizationId,
            status: 'on_track',
            createdAt: {
              gte: dateFrom,
              lte: dateTo,
            },
          },
        }),

        // Total budget
        this.prisma.projectBudget.aggregate({
          where: {
            organizationId,
            createdAt: {
              gte: dateFrom,
              lte: dateTo,
            },
          },
          _sum: {
            budgetedAmount: true,
          },
        }),

        // Total actual
        this.prisma.projectCost.aggregate({
          where: {
            organizationId,
            date: {
              gte: dateFrom,
              lte: dateTo,
            },
          },
          _sum: {
            actualTotalCost: true,
          },
        }),

        // Average variance
        this.prisma.projectBudget.aggregate({
          where: {
            organizationId,
            createdAt: {
              gte: dateFrom,
              lte: dateTo,
            },
          },
          _avg: {
            variancePercentage: true,
          },
        }),

        // Top cost categories
        this.prisma.projectCost.groupBy({
          by: ['category'],
          where: {
            organizationId,
            date: {
              gte: dateFrom,
              lte: dateTo,
            },
          },
          _sum: {
            actualTotalCost: true,
          },
          orderBy: {
            _sum: {
              actualTotalCost: 'desc',
            },
          },
          take: 10,
        }),
      ]);

      return {
        projects: {
          total: totalProjects,
          overBudget: overBudgetProjects,
          onTrack: onTrackProjects,
          atRisk: totalProjects - overBudgetProjects - onTrackProjects,
        },
        budget: {
          total: totalBudget._sum.budgetedAmount || 0,
          actual: totalActual._sum.actualTotalCost || 0,
          variance: (totalBudget._sum.budgetedAmount || 0) - (totalActual._sum.actualTotalCost || 0),
          variancePercentage: totalBudget._sum.budgetedAmount && totalBudget._sum.budgetedAmount > 0
            ? ((totalBudget._sum.budgetedAmount - (totalActual._sum.actualTotalCost || 0)) / totalBudget._sum.budgetedAmount) * 100
            : 0,
        },
        performance: {
          averageVariance: averageVariance._avg.variancePercentage || 0,
        },
        topCostCategories: topCostCategories.map(category => ({
          category: category.category,
          amount: category._sum.actualTotalCost || 0,
        })),
      };
    } catch (error) {
      logger.error('[ProjectCostingService] Failed to get project costing analytics:', error);
      throw new Error(`Failed to get project costing analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default new ProjectCostingService();






