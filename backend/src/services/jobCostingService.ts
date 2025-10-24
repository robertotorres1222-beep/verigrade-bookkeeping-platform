import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface JobCostingData {
  projectId: string;
  projectName: string;
  clientId: string;
  startDate: Date;
  endDate?: Date;
  budget: number;
  hourlyRate?: number;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  description?: string;
  tags?: string[];
}

export interface TimeEntryData {
  projectId: string;
  userId: string;
  date: Date;
  hours: number;
  description: string;
  billable: boolean;
  hourlyRate?: number;
}

export interface ExpenseEntryData {
  projectId: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
  billable: boolean;
  receiptUrl?: string;
}

export interface ProfitabilityAnalysis {
  projectId: string;
  totalRevenue: number;
  totalCosts: number;
  grossProfit: number;
  grossMargin: number;
  billableHours: number;
  nonBillableHours: number;
  averageHourlyRate: number;
  costPerHour: number;
  profitabilityScore: number;
  recommendations: string[];
}

export class JobCostingService {
  // Project Management
  async createProject(data: JobCostingData, userId: string) {
    return await prisma.project.create({
      data: {
        ...data,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  }

  async updateProject(projectId: string, data: Partial<JobCostingData>, userId: string) {
    return await prisma.project.update({
      where: { id: projectId },
      data: {
        ...data,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });
  }

  async getProject(projectId: string) {
    return await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: true,
        timeEntries: {
          include: { user: true },
          orderBy: { date: 'desc' },
        },
        expenses: {
          orderBy: { date: 'desc' },
        },
        createdByUser: true,
        updatedByUser: true,
      },
    });
  }

  async getProjectsByUser(userId: string, filters?: {
    status?: string;
    clientId?: string;
    dateRange?: { start: Date; end: Date };
  }) {
    const where: any = {
      OR: [
        { createdBy: userId },
        { assignedUsers: { some: { userId } } },
      ],
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.clientId) {
      where.clientId = filters.clientId;
    }

    if (filters?.dateRange) {
      where.startDate = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end,
      };
    }

    return await prisma.project.findMany({
      where,
      include: {
        client: true,
        timeEntries: true,
        expenses: true,
        createdByUser: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Time Tracking
  async createTimeEntry(data: TimeEntryData, userId: string) {
    return await prisma.timeEntry.create({
      data: {
        ...data,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  }

  async updateTimeEntry(entryId: string, data: Partial<TimeEntryData>, userId: string) {
    return await prisma.timeEntry.update({
      where: { id: entryId },
      data: {
        ...data,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });
  }

  async getTimeEntries(projectId: string, filters?: {
    userId?: string;
    dateRange?: { start: Date; end: Date };
    billable?: boolean;
  }) {
    const where: any = { projectId };

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.dateRange) {
      where.date = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end,
      };
    }

    if (filters?.billable !== undefined) {
      where.billable = filters.billable;
    }

    return await prisma.timeEntry.findMany({
      where,
      include: { user: true },
      orderBy: { date: 'desc' },
    });
  }

  // Expense Tracking
  async createExpense(data: ExpenseEntryData, userId: string) {
    return await prisma.projectExpense.create({
      data: {
        ...data,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  }

  async updateExpense(expenseId: string, data: Partial<ExpenseEntryData>, userId: string) {
    return await prisma.projectExpense.update({
      where: { id: expenseId },
      data: {
        ...data,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });
  }

  async getExpenses(projectId: string, filters?: {
    category?: string;
    dateRange?: { start: Date; end: Date };
    billable?: boolean;
  }) {
    const where: any = { projectId };

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.dateRange) {
      where.date = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end,
      };
    }

    if (filters?.billable !== undefined) {
      where.billable = filters.billable;
    }

    return await prisma.projectExpense.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  // Profitability Analysis
  async calculateProfitability(projectId: string): Promise<ProfitabilityAnalysis> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        timeEntries: true,
        expenses: true,
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Calculate revenue (from time entries and project budget)
    const billableTimeEntries = project.timeEntries.filter(entry => entry.billable);
    const totalBillableHours = billableTimeEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const averageHourlyRate = project.hourlyRate || 0;
    const timeBasedRevenue = totalBillableHours * averageHourlyRate;
    const totalRevenue = Math.max(project.budget, timeBasedRevenue);

    // Calculate costs
    const totalTimeCosts = project.timeEntries.reduce((sum, entry) => {
      const rate = entry.hourlyRate || averageHourlyRate;
      return sum + (entry.hours * rate);
    }, 0);

    const totalExpenseCosts = project.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalCosts = totalTimeCosts + totalExpenseCosts;

    // Calculate profitability metrics
    const grossProfit = totalRevenue - totalCosts;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const costPerHour = totalBillableHours > 0 ? totalCosts / totalBillableHours : 0;
    const profitabilityScore = Math.max(0, Math.min(100, grossMargin));

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (grossMargin < 20) {
      recommendations.push('Consider increasing hourly rates or reducing project costs');
    }
    
    if (totalBillableHours < project.timeEntries.reduce((sum, entry) => sum + entry.hours, 0) * 0.8) {
      recommendations.push('Increase billable hours ratio to improve profitability');
    }
    
    if (costPerHour > averageHourlyRate * 0.7) {
      recommendations.push('Review and optimize project costs');
    }

    if (grossMargin > 50) {
      recommendations.push('Excellent profitability - consider expanding similar projects');
    }

    return {
      projectId,
      totalRevenue,
      totalCosts,
      grossProfit,
      grossMargin,
      billableHours: totalBillableHours,
      nonBillableHours: project.timeEntries.reduce((sum, entry) => sum + entry.hours, 0) - totalBillableHours,
      averageHourlyRate,
      costPerHour,
      profitabilityScore,
      recommendations,
    };
  }

  // Dashboard Analytics
  async getProjectDashboard(userId: string) {
    const projects = await this.getProjectsByUser(userId);
    
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const totalRevenue = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    
    // Calculate average profitability
    const profitabilityAnalyses = await Promise.all(
      projects.map(p => this.calculateProfitability(p.id).catch(() => null))
    );
    
    const validAnalyses = profitabilityAnalyses.filter(a => a !== null) as ProfitabilityAnalysis[];
    const averageProfitability = validAnalyses.length > 0 
      ? validAnalyses.reduce((sum, a) => sum + a.grossMargin, 0) / validAnalyses.length 
      : 0;

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalBudget,
      totalRevenue,
      averageProfitability,
      topPerformingProjects: validAnalyses
        .sort((a, b) => b.grossMargin - a.grossMargin)
        .slice(0, 5)
        .map(a => ({
          projectId: a.projectId,
          grossMargin: a.grossMargin,
          grossProfit: a.grossProfit,
        })),
    };
  }

  // Resource Allocation
  async assignUserToProject(projectId: string, userId: string, role: string) {
    return await prisma.projectAssignment.create({
      data: {
        projectId,
        userId,
        role,
        assignedAt: new Date(),
      },
    });
  }

  async removeUserFromProject(projectId: string, userId: string) {
    return await prisma.projectAssignment.deleteMany({
      where: {
        projectId,
        userId,
      },
    });
  }

  async getProjectTeam(projectId: string) {
    return await prisma.projectAssignment.findMany({
      where: { projectId },
      include: { user: true },
    });
  }
}

export default new JobCostingService();

