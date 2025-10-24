import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface TimeEntry {
  id: string;
  userId: string;
  organizationId: string;
  projectId: string;
  taskId?: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  billable: boolean;
  billableRate?: number;
  billableAmount?: number;
  status: 'active' | 'paused' | 'completed' | 'approved' | 'rejected';
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  device?: string;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
}

export interface Project {
  id: string;
  name: string;
  organizationId: string;
  clientId?: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budget?: number;
  actualCost?: number;
  estimatedHours?: number;
  actualHours?: number;
  startDate?: Date;
  endDate?: Date;
  deadline?: Date;
  managerId: string;
  teamMembers: string[];
  billableRate?: number;
  billingMethod: 'hourly' | 'fixed' | 'milestone';
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours?: number;
  actualHours?: number;
  assignedTo?: string;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Timesheet {
  id: string;
  userId: string;
  organizationId: string;
  weekStarting: Date;
  weekEnding: Date;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  totalAmount: number;
  entries: TimeEntry[];
  submittedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResourceUtilization {
  userId: string;
  userName: string;
  totalHours: number;
  billableHours: number;
  utilizationRate: number;
  projects: {
    projectId: string;
    projectName: string;
    hours: number;
    percentage: number;
  }[];
  period: {
    start: Date;
    end: Date;
  };
}

export interface ProjectCosting {
  projectId: string;
  projectName: string;
  budget: number;
  actualCost: number;
  variance: number;
  variancePercentage: number;
  earnedValue: number;
  plannedValue: number;
  scheduleVariance: number;
  costVariance: number;
  cpi: number; // Cost Performance Index
  spi: number; // Schedule Performance Index
  etc: number; // Estimate to Complete
  eac: number; // Estimate at Completion
  period: {
    start: Date;
    end: Date;
  };
}

class AdvancedTimeTrackingService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Start time tracking
   */
  async startTracking(
    userId: string,
    organizationId: string,
    projectId: string,
    taskId: string | undefined,
    description: string,
    billable: boolean = true,
    billableRate?: number,
    location?: { latitude: number; longitude: number; address?: string },
    device?: string,
    ipAddress?: string
  ): Promise<TimeEntry> {
    try {
      // Check if user already has an active time entry
      const activeEntry = await this.prisma.timeEntry.findFirst({
        where: {
          userId,
          organizationId,
          status: 'active',
        },
      });

      if (activeEntry) {
        throw new Error('User already has an active time entry. Please stop the current entry first.');
      }

      // Validate project exists and user has access
      const project = await this.prisma.project.findFirst({
        where: {
          id: projectId,
          organizationId,
          OR: [
            { managerId: userId },
            { teamMembers: { has: userId } },
          ],
        },
      });

      if (!project) {
        throw new Error('Project not found or access denied');
      }

      // Validate task if provided
      if (taskId) {
        const task = await this.prisma.task.findFirst({
          where: {
            id: taskId,
            projectId,
          },
        });

        if (!task) {
          throw new Error('Task not found');
        }
      }

      const timeEntry = await this.prisma.timeEntry.create({
        data: {
          id: uuidv4(),
          userId,
          organizationId,
          projectId,
          taskId,
          description,
          startTime: new Date(),
          duration: 0,
          billable,
          billableRate: billable ? billableRate : undefined,
          billableAmount: 0,
          status: 'active',
          location: location ? JSON.stringify(location) : undefined,
          device,
          ipAddress,
        },
      });

      logger.info(`[AdvancedTimeTrackingService] Started tracking for user ${userId} on project ${projectId}`);
      return timeEntry;
    } catch (error) {
      logger.error('[AdvancedTimeTrackingService] Failed to start tracking:', error);
      throw new Error(`Failed to start tracking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Stop time tracking
   */
  async stopTracking(
    userId: string,
    organizationId: string,
    timeEntryId?: string
  ): Promise<TimeEntry> {
    try {
      let timeEntry: TimeEntry | null = null;

      if (timeEntryId) {
        timeEntry = await this.prisma.timeEntry.findFirst({
          where: {
            id: timeEntryId,
            userId,
            organizationId,
            status: 'active',
          },
        });
      } else {
        timeEntry = await this.prisma.timeEntry.findFirst({
          where: {
            userId,
            organizationId,
            status: 'active',
          },
          orderBy: { startTime: 'desc' },
        });
      }

      if (!timeEntry) {
        throw new Error('No active time entry found');
      }

      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - timeEntry.startTime.getTime()) / (1000 * 60)); // in minutes

      const updatedEntry = await this.prisma.timeEntry.update({
        where: { id: timeEntry.id },
        data: {
          endTime,
          duration,
          billableAmount: timeEntry.billable && timeEntry.billableRate 
            ? (duration / 60) * timeEntry.billableRate 
            : 0,
          status: 'completed',
          updatedAt: new Date(),
        },
      });

      logger.info(`[AdvancedTimeTrackingService] Stopped tracking for user ${userId}: ${duration} minutes`);
      return updatedEntry;
    } catch (error) {
      logger.error('[AdvancedTimeTrackingService] Failed to stop tracking:', error);
      throw new Error(`Failed to stop tracking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Pause time tracking
   */
  async pauseTracking(
    userId: string,
    organizationId: string,
    timeEntryId?: string
  ): Promise<TimeEntry> {
    try {
      let timeEntry: TimeEntry | null = null;

      if (timeEntryId) {
        timeEntry = await this.prisma.timeEntry.findFirst({
          where: {
            id: timeEntryId,
            userId,
            organizationId,
            status: 'active',
          },
        });
      } else {
        timeEntry = await this.prisma.timeEntry.findFirst({
          where: {
            userId,
            organizationId,
            status: 'active',
          },
          orderBy: { startTime: 'desc' },
        });
      }

      if (!timeEntry) {
        throw new Error('No active time entry found');
      }

      const updatedEntry = await this.prisma.timeEntry.update({
        where: { id: timeEntry.id },
        data: {
          status: 'paused',
          updatedAt: new Date(),
        },
      });

      logger.info(`[AdvancedTimeTrackingService] Paused tracking for user ${userId}`);
      return updatedEntry;
    } catch (error) {
      logger.error('[AdvancedTimeTrackingService] Failed to pause tracking:', error);
      throw new Error(`Failed to pause tracking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Resume time tracking
   */
  async resumeTracking(
    userId: string,
    organizationId: string,
    timeEntryId: string
  ): Promise<TimeEntry> {
    try {
      const timeEntry = await this.prisma.timeEntry.findFirst({
        where: {
          id: timeEntryId,
          userId,
          organizationId,
          status: 'paused',
        },
      });

      if (!timeEntry) {
        throw new Error('No paused time entry found');
      }

      const updatedEntry = await this.prisma.timeEntry.update({
        where: { id: timeEntryId },
        data: {
          status: 'active',
          updatedAt: new Date(),
        },
      });

      logger.info(`[AdvancedTimeTrackingService] Resumed tracking for user ${userId}`);
      return updatedEntry;
    } catch (error) {
      logger.error('[AdvancedTimeTrackingService] Failed to resume tracking:', error);
      throw new Error(`Failed to resume tracking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get time entries for user
   */
  async getTimeEntries(
    userId: string,
    organizationId: string,
    filters: {
      projectId?: string;
      taskId?: string;
      status?: string;
      dateFrom?: Date;
      dateTo?: Date;
      billable?: boolean;
    } = {},
    pagination: {
      page: number;
      limit: number;
    } = { page: 1, limit: 20 }
  ): Promise<{ data: TimeEntry[]; total: number; page: number; limit: number }> {
    try {
      const where: any = {
        userId,
        organizationId,
      };

      if (filters.projectId) {
        where.projectId = filters.projectId;
      }

      if (filters.taskId) {
        where.taskId = filters.taskId;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.dateFrom || filters.dateTo) {
        where.startTime = {};
        if (filters.dateFrom) {
          where.startTime.gte = filters.dateFrom;
        }
        if (filters.dateTo) {
          where.startTime.lte = filters.dateTo;
        }
      }

      if (filters.billable !== undefined) {
        where.billable = filters.billable;
      }

      const [data, total] = await Promise.all([
        this.prisma.timeEntry.findMany({
          where,
          orderBy: { startTime: 'desc' },
          skip: (pagination.page - 1) * pagination.limit,
          take: pagination.limit,
        }),
        this.prisma.timeEntry.count({ where }),
      ]);

      return {
        data,
        total,
        page: pagination.page,
        limit: pagination.limit,
      };
    } catch (error) {
      logger.error('[AdvancedTimeTrackingService] Failed to get time entries:', error);
      throw new Error(`Failed to get time entries: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create or update timesheet
   */
  async createOrUpdateTimesheet(
    userId: string,
    organizationId: string,
    weekStarting: Date,
    entries: Omit<TimeEntry, 'id' | 'userId' | 'organizationId' | 'createdAt' | 'updatedAt'>[]
  ): Promise<Timesheet> {
    try {
      const weekEnding = new Date(weekStarting);
      weekEnding.setDate(weekEnding.getDate() + 6);

      // Check if timesheet already exists
      let timesheet = await this.prisma.timesheet.findFirst({
        where: {
          userId,
          organizationId,
          weekStarting,
        },
      });

      const totalHours = entries.reduce((sum, entry) => sum + (entry.duration / 60), 0);
      const billableHours = entries
        .filter(entry => entry.billable)
        .reduce((sum, entry) => sum + (entry.duration / 60), 0);
      const nonBillableHours = totalHours - billableHours;
      const totalAmount = entries
        .filter(entry => entry.billable && entry.billableAmount)
        .reduce((sum, entry) => sum + (entry.billableAmount || 0), 0);

      if (timesheet) {
        // Update existing timesheet
        timesheet = await this.prisma.timesheet.update({
          where: { id: timesheet.id },
          data: {
            totalHours,
            billableHours,
            nonBillableHours,
            totalAmount,
            updatedAt: new Date(),
          },
        });

        // Update entries
        await this.prisma.timeEntry.deleteMany({
          where: { timesheetId: timesheet.id },
        });

        await Promise.all(
          entries.map(entry =>
            this.prisma.timeEntry.create({
              data: {
                ...entry,
                id: uuidv4(),
                userId,
                organizationId,
                timesheetId: timesheet.id,
              },
            })
          )
        );
      } else {
        // Create new timesheet
        timesheet = await this.prisma.timesheet.create({
          data: {
            id: uuidv4(),
            userId,
            organizationId,
            weekStarting,
            weekEnding,
            status: 'draft',
            totalHours,
            billableHours,
            nonBillableHours,
            totalAmount,
          },
        });

        // Create entries
        await Promise.all(
          entries.map(entry =>
            this.prisma.timeEntry.create({
              data: {
                ...entry,
                id: uuidv4(),
                userId,
                organizationId,
                timesheetId: timesheet.id,
              },
            })
          )
        );
      }

      // Get updated timesheet with entries
      const updatedTimesheet = await this.prisma.timesheet.findUnique({
        where: { id: timesheet.id },
        include: { entries: true },
      });

      logger.info(`[AdvancedTimeTrackingService] Created/updated timesheet for user ${userId}: ${totalHours} hours`);
      return updatedTimesheet!;
    } catch (error) {
      logger.error('[AdvancedTimeTrackingService] Failed to create/update timesheet:', error);
      throw new Error(`Failed to create/update timesheet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Submit timesheet for approval
   */
  async submitTimesheet(
    timesheetId: string,
    organizationId: string
  ): Promise<Timesheet> {
    try {
      const timesheet = await this.prisma.timesheet.update({
        where: {
          id: timesheetId,
          organizationId,
        },
        data: {
          status: 'submitted',
          submittedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Send notification to manager
      await this.notifyManager(timesheet);

      logger.info(`[AdvancedTimeTrackingService] Submitted timesheet ${timesheetId} for approval`);
      return timesheet;
    } catch (error) {
      logger.error('[AdvancedTimeTrackingService] Failed to submit timesheet:', error);
      throw new Error(`Failed to submit timesheet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Approve timesheet
   */
  async approveTimesheet(
    timesheetId: string,
    organizationId: string,
    approvedBy: string
  ): Promise<Timesheet> {
    try {
      const timesheet = await this.prisma.timesheet.update({
        where: {
          id: timesheetId,
          organizationId,
        },
        data: {
          status: 'approved',
          approvedBy,
          approvedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Update time entries status
      await this.prisma.timeEntry.updateMany({
        where: { timesheetId },
        data: { status: 'approved' },
      });

      logger.info(`[AdvancedTimeTrackingService] Approved timesheet ${timesheetId}`);
      return timesheet;
    } catch (error) {
      logger.error('[AdvancedTimeTrackingService] Failed to approve timesheet:', error);
      throw new Error(`Failed to approve timesheet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Reject timesheet
   */
  async rejectTimesheet(
    timesheetId: string,
    organizationId: string,
    rejectedBy: string,
    rejectionReason: string
  ): Promise<Timesheet> {
    try {
      const timesheet = await this.prisma.timesheet.update({
        where: {
          id: timesheetId,
          organizationId,
        },
        data: {
          status: 'rejected',
          rejectedBy,
          rejectedAt: new Date(),
          rejectionReason,
          updatedAt: new Date(),
        },
      });

      // Update time entries status
      await this.prisma.timeEntry.updateMany({
        where: { timesheetId },
        data: { status: 'rejected' },
      });

      logger.info(`[AdvancedTimeTrackingService] Rejected timesheet ${timesheetId}: ${rejectionReason}`);
      return timesheet;
    } catch (error) {
      logger.error('[AdvancedTimeTrackingService] Failed to reject timesheet:', error);
      throw new Error(`Failed to reject timesheet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get resource utilization
   */
  async getResourceUtilization(
    organizationId: string,
    userId?: string,
    dateFrom: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    dateTo: Date = new Date()
  ): Promise<ResourceUtilization[]> {
    try {
      const where: any = {
        organizationId,
        startTime: {
          gte: dateFrom,
          lte: dateTo,
        },
        status: 'completed',
      };

      if (userId) {
        where.userId = userId;
      }

      const timeEntries = await this.prisma.timeEntry.findMany({
        where,
        include: {
          project: true,
          user: {
            select: { firstName: true, lastName: true },
          },
        },
      });

      // Group by user
      const userMap = new Map<string, ResourceUtilization>();

      for (const entry of timeEntries) {
        const userId = entry.userId;
        const userName = `${entry.user.firstName} ${entry.user.lastName}`;

        if (!userMap.has(userId)) {
          userMap.set(userId, {
            userId,
            userName,
            totalHours: 0,
            billableHours: 0,
            utilizationRate: 0,
            projects: [],
            period: { start: dateFrom, end: dateTo },
          });
        }

        const utilization = userMap.get(userId)!;
        const hours = entry.duration / 60;

        utilization.totalHours += hours;
        if (entry.billable) {
          utilization.billableHours += hours;
        }

        // Add to project breakdown
        const existingProject = utilization.projects.find(p => p.projectId === entry.projectId);
        if (existingProject) {
          existingProject.hours += hours;
        } else {
          utilization.projects.push({
            projectId: entry.projectId,
            projectName: entry.project.name,
            hours,
            percentage: 0,
          });
        }
      }

      // Calculate percentages and utilization rates
      const results = Array.from(userMap.values());
      const workingDays = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24));
      const standardHoursPerDay = 8;
      const totalStandardHours = workingDays * standardHoursPerDay;

      for (const utilization of results) {
        utilization.utilizationRate = totalStandardHours > 0 
          ? (utilization.totalHours / totalStandardHours) * 100 
          : 0;

        // Calculate project percentages
        for (const project of utilization.projects) {
          project.percentage = utilization.totalHours > 0 
            ? (project.hours / utilization.totalHours) * 100 
            : 0;
        }
      }

      logger.info(`[AdvancedTimeTrackingService] Generated resource utilization for ${results.length} users`);
      return results;
    } catch (error) {
      logger.error('[AdvancedTimeTrackingService] Failed to get resource utilization:', error);
      throw new Error(`Failed to get resource utilization: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get project costing analysis
   */
  async getProjectCosting(
    projectId: string,
    organizationId: string,
    dateFrom: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    dateTo: Date = new Date()
  ): Promise<ProjectCosting> {
    try {
      const project = await this.prisma.project.findFirst({
        where: {
          id: projectId,
          organizationId,
        },
      });

      if (!project) {
        throw new Error('Project not found');
      }

      // Get time entries for the project
      const timeEntries = await this.prisma.timeEntry.findMany({
        where: {
          projectId,
          organizationId,
          startTime: {
            gte: dateFrom,
            lte: dateTo,
          },
          status: 'completed',
        },
      });

      // Calculate actual costs
      const actualCost = timeEntries.reduce((sum, entry) => {
        if (entry.billable && entry.billableAmount) {
          return sum + entry.billableAmount;
        }
        return sum;
      }, 0);

      // Calculate planned value (budget for the period)
      const totalBudget = project.budget || 0;
      const totalDays = Math.ceil((project.endDate?.getTime() || Date.now() - project.startDate?.getTime() || 0) / (1000 * 60 * 60 * 24));
      const periodDays = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24));
      const plannedValue = totalDays > 0 ? (totalBudget * periodDays) / totalDays : 0;

      // Calculate earned value (based on completed work)
      const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.duration / 60), 0);
      const estimatedHours = project.estimatedHours || 0;
      const earnedValue = estimatedHours > 0 ? (totalBudget * totalHours) / estimatedHours : 0;

      // Calculate variances
      const scheduleVariance = earnedValue - plannedValue;
      const costVariance = earnedValue - actualCost;

      // Calculate performance indices
      const cpi = actualCost > 0 ? earnedValue / actualCost : 0;
      const spi = plannedValue > 0 ? earnedValue / plannedValue : 0;

      // Calculate ETC and EAC
      const etc = cpi > 0 ? (totalBudget - earnedValue) / cpi : 0;
      const eac = actualCost + etc;

      const costing: ProjectCosting = {
        projectId,
        projectName: project.name,
        budget: totalBudget,
        actualCost,
        variance: actualCost - totalBudget,
        variancePercentage: totalBudget > 0 ? ((actualCost - totalBudget) / totalBudget) * 100 : 0,
        earnedValue,
        plannedValue,
        scheduleVariance,
        costVariance,
        cpi,
        spi,
        etc,
        eac,
        period: { start: dateFrom, end: dateTo },
      };

      logger.info(`[AdvancedTimeTrackingService] Generated project costing for ${project.name}: $${actualCost} actual vs $${totalBudget} budget`);
      return costing;
    } catch (error) {
      logger.error('[AdvancedTimeTrackingService] Failed to get project costing:', error);
      throw new Error(`Failed to get project costing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private helper methods
  private async notifyManager(timesheet: Timesheet): Promise<void> {
    // Implementation for sending notification to manager
    // This could integrate with email, Slack, or other notification systems
    logger.info(`[AdvancedTimeTrackingService] Notifying manager for timesheet ${timesheet.id}`);
  }
}

export default new AdvancedTimeTrackingService();





