import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export interface Project {
  id: string;
  name: string;
  description?: string;
  clientId?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'ON_HOLD';
  budget: number;
  hourlyRate: number;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedHours: number;
  actualHours: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  taskId?: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  billable: boolean;
  hourlyRate: number;
  totalAmount: number;
  status: 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'APPROVED' | 'REJECTED';
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Timesheet {
  id: string;
  userId: string;
  weekStartDate: Date;
  weekEndDate: Date;
  totalHours: number;
  billableHours: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  submittedAt?: Date;
  approvedAt?: Date;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Resource {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  hourlyRate: number;
  skills: string[];
  availability: {
    monday: { start: string; end: string; available: boolean };
    tuesday: { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday: { start: string; end: string; available: boolean };
    friday: { start: string; end: string; available: boolean };
    saturday: { start: string; end: string; available: boolean };
    sunday: { start: string; end: string; available: boolean };
  };
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectCosting {
  id: string;
  projectId: string;
  budget: number;
  actualCost: number;
  estimatedHours: number;
  actualHours: number;
  hourlyRate: number;
  profitMargin: number;
  status: 'ON_TRACK' | 'OVER_BUDGET' | 'UNDER_BUDGET' | 'COMPLETED';
  createdAt: Date;
  updatedAt: Date;
}

export interface IdleDetection {
  id: string;
  timeEntryId: string;
  idleStartTime: Date;
  idleEndTime?: Date;
  duration: number; // in minutes
  reason: 'USER_INACTIVE' | 'SYSTEM_LOCKED' | 'APPLICATION_MINIMIZED';
  status: 'ACTIVE' | 'RESOLVED';
  createdAt: Date;
}

export interface GPSTracking {
  id: string;
  timeEntryId: string;
  latitude: number;
  longitude: number;
  address: string;
  accuracy: number;
  timestamp: Date;
  createdAt: Date;
}

export class EnhancedTimeTrackingService {
  // Project Management
  async createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    try {
      const project = await prisma.project.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      logger.info('Project created successfully', { projectId: project.id });
      return project as Project;
    } catch (error) {
      logger.error('Error creating project', { error, data });
      throw error;
    }
  }

  async getProjects(filters?: {
    status?: string;
    clientId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ projects: Project[]; total: number; page: number; totalPages: number }> {
    try {
      const { status, clientId, search, page = 1, limit = 10 } = filters || {};
      const skip = (page - 1) * limit;

      const where: any = {};
      if (status) where.status = status;
      if (clientId) where.clientId = clientId;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [projects, total] = await Promise.all([
        prisma.project.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.project.count({ where }),
      ]);

      return {
        projects: projects as Project[],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error fetching projects', { error, filters });
      throw error;
    }
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    try {
      const project = await prisma.project.update({
        where: { id },
        data: { ...data, updatedAt: new Date() },
      });

      logger.info('Project updated successfully', { projectId: id });
      return project as Project;
    } catch (error) {
      logger.error('Error updating project', { error, projectId: id, data });
      throw error;
    }
  }

  // Task Management
  async createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    try {
      const task = await prisma.task.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      logger.info('Task created successfully', { taskId: task.id });
      return task as Task;
    } catch (error) {
      logger.error('Error creating task', { error, data });
      throw error;
    }
  }

  async getTasks(projectId: string): Promise<Task[]> {
    try {
      const tasks = await prisma.task.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
      });

      return tasks as Task[];
    } catch (error) {
      logger.error('Error fetching tasks', { error, projectId });
      throw error;
    }
  }

  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    try {
      const task = await prisma.task.update({
        where: { id },
        data: { ...data, updatedAt: new Date() },
      });

      logger.info('Task updated successfully', { taskId: id });
      return task as Task;
    } catch (error) {
      logger.error('Error updating task', { error, taskId: id, data });
      throw error;
    }
  }

  // Time Entry Management
  async startTimeEntry(data: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt' | 'endTime' | 'duration' | 'totalAmount'>): Promise<TimeEntry> {
    try {
      const timeEntry = await prisma.timeEntry.create({
        data: {
          ...data,
          status: 'RUNNING',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      logger.info('Time entry started successfully', { timeEntryId: timeEntry.id });
      return timeEntry as TimeEntry;
    } catch (error) {
      logger.error('Error starting time entry', { error, data });
      throw error;
    }
  }

  async stopTimeEntry(id: string): Promise<TimeEntry> {
    try {
      const timeEntry = await prisma.timeEntry.findUnique({
        where: { id },
      });

      if (!timeEntry) {
        throw new Error('Time entry not found');
      }

      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - timeEntry.startTime.getTime()) / (1000 * 60)); // in minutes
      const totalAmount = (duration / 60) * timeEntry.hourlyRate;

      const updatedTimeEntry = await prisma.timeEntry.update({
        where: { id },
        data: {
          endTime,
          duration,
          totalAmount,
          status: 'COMPLETED',
          updatedAt: new Date(),
        },
      });

      logger.info('Time entry stopped successfully', { timeEntryId: id, duration, totalAmount });
      return updatedTimeEntry as TimeEntry;
    } catch (error) {
      logger.error('Error stopping time entry', { error, timeEntryId: id });
      throw error;
    }
  }

  async pauseTimeEntry(id: string): Promise<TimeEntry> {
    try {
      const timeEntry = await prisma.timeEntry.update({
        where: { id },
        data: {
          status: 'PAUSED',
          updatedAt: new Date(),
        },
      });

      logger.info('Time entry paused successfully', { timeEntryId: id });
      return timeEntry as TimeEntry;
    } catch (error) {
      logger.error('Error pausing time entry', { error, timeEntryId: id });
      throw error;
    }
  }

  async resumeTimeEntry(id: string): Promise<TimeEntry> {
    try {
      const timeEntry = await prisma.timeEntry.update({
        where: { id },
        data: {
          status: 'RUNNING',
          updatedAt: new Date(),
        },
      });

      logger.info('Time entry resumed successfully', { timeEntryId: id });
      return timeEntry as TimeEntry;
    } catch (error) {
      logger.error('Error resuming time entry', { error, timeEntryId: id });
      throw error;
    }
  }

  async getTimeEntries(filters?: {
    userId?: string;
    projectId?: string;
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ timeEntries: TimeEntry[]; total: number; page: number; totalPages: number }> {
    try {
      const { userId, projectId, status, dateFrom, dateTo, page = 1, limit = 10 } = filters || {};
      const skip = (page - 1) * limit;

      const where: any = {};
      if (userId) where.userId = userId;
      if (projectId) where.projectId = projectId;
      if (status) where.status = status;
      if (dateFrom || dateTo) {
        where.startTime = {};
        if (dateFrom) where.startTime.gte = dateFrom;
        if (dateTo) where.startTime.lte = dateTo;
      }

      const [timeEntries, total] = await Promise.all([
        prisma.timeEntry.findMany({
          where,
          skip,
          take: limit,
          orderBy: { startTime: 'desc' },
        }),
        prisma.timeEntry.count({ where }),
      ]);

      return {
        timeEntries: timeEntries as TimeEntry[],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error fetching time entries', { error, filters });
      throw error;
    }
  }

  // Timesheet Management
  async createTimesheet(data: Omit<Timesheet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Timesheet> {
    try {
      const timesheet = await prisma.timesheet.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      logger.info('Timesheet created successfully', { timesheetId: timesheet.id });
      return timesheet as Timesheet;
    } catch (error) {
      logger.error('Error creating timesheet', { error, data });
      throw error;
    }
  }

  async getTimesheets(userId: string, filters?: {
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ timesheets: Timesheet[]; total: number; page: number; totalPages: number }> {
    try {
      const { status, dateFrom, dateTo, page = 1, limit = 10 } = filters || {};
      const skip = (page - 1) * limit;

      const where: any = { userId };
      if (status) where.status = status;
      if (dateFrom || dateTo) {
        where.weekStartDate = {};
        if (dateFrom) where.weekStartDate.gte = dateFrom;
        if (dateTo) where.weekStartDate.lte = dateTo;
      }

      const [timesheets, total] = await Promise.all([
        prisma.timesheet.findMany({
          where,
          skip,
          take: limit,
          orderBy: { weekStartDate: 'desc' },
        }),
        prisma.timesheet.count({ where }),
      ]);

      return {
        timesheets: timesheets as Timesheet[],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error fetching timesheets', { error, userId, filters });
      throw error;
    }
  }

  async submitTimesheet(id: string): Promise<Timesheet> {
    try {
      const timesheet = await prisma.timesheet.update({
        where: { id },
        data: {
          status: 'SUBMITTED',
          submittedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      logger.info('Timesheet submitted successfully', { timesheetId: id });
      return timesheet as Timesheet;
    } catch (error) {
      logger.error('Error submitting timesheet', { error, timesheetId: id });
      throw error;
    }
  }

  async approveTimesheet(id: string, approvedBy: string): Promise<Timesheet> {
    try {
      const timesheet = await prisma.timesheet.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          approvedBy,
          updatedAt: new Date(),
        },
      });

      logger.info('Timesheet approved successfully', { timesheetId: id, approvedBy });
      return timesheet as Timesheet;
    } catch (error) {
      logger.error('Error approving timesheet', { error, timesheetId: id, approvedBy });
      throw error;
    }
  }

  // Resource Management
  async createResource(data: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>): Promise<Resource> {
    try {
      const resource = await prisma.resource.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      logger.info('Resource created successfully', { resourceId: resource.id });
      return resource as Resource;
    } catch (error) {
      logger.error('Error creating resource', { error, data });
      throw error;
    }
  }

  async getResources(filters?: {
    status?: string;
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ resources: Resource[]; total: number; page: number; totalPages: number }> {
    try {
      const { status, role, search, page = 1, limit = 10 } = filters || {};
      const skip = (page - 1) * limit;

      const where: any = {};
      if (status) where.status = status;
      if (role) where.role = role;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [resources, total] = await Promise.all([
        prisma.resource.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.resource.count({ where }),
      ]);

      return {
        resources: resources as Resource[],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error fetching resources', { error, filters });
      throw error;
    }
  }

  async updateResource(id: string, data: Partial<Resource>): Promise<Resource> {
    try {
      const resource = await prisma.resource.update({
        where: { id },
        data: { ...data, updatedAt: new Date() },
      });

      logger.info('Resource updated successfully', { resourceId: id });
      return resource as Resource;
    } catch (error) {
      logger.error('Error updating resource', { error, resourceId: id, data });
      throw error;
    }
  }

  // Project Costing
  async getProjectCosting(projectId: string): Promise<ProjectCosting> {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new Error('Project not found');
      }

      // Calculate actual costs and hours
      const timeEntries = await prisma.timeEntry.findMany({
        where: { projectId, status: 'COMPLETED' },
      });

      const actualCost = timeEntries.reduce((sum, entry) => sum + entry.totalAmount, 0);
      const actualHours = timeEntries.reduce((sum, entry) => sum + (entry.duration / 60), 0);
      const profitMargin = ((project.budget - actualCost) / project.budget) * 100;

      let status: 'ON_TRACK' | 'OVER_BUDGET' | 'UNDER_BUDGET' | 'COMPLETED' = 'ON_TRACK';
      if (actualCost > project.budget) {
        status = 'OVER_BUDGET';
      } else if (actualCost < project.budget * 0.8) {
        status = 'UNDER_BUDGET';
      } else if (project.status === 'COMPLETED') {
        status = 'COMPLETED';
      }

      const projectCosting: ProjectCosting = {
        id: `costing-${projectId}`,
        projectId,
        budget: project.budget,
        actualCost,
        estimatedHours: project.budget / project.hourlyRate,
        actualHours,
        hourlyRate: project.hourlyRate,
        profitMargin,
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      logger.info('Project costing calculated successfully', { projectId, actualCost, actualHours, profitMargin });
      return projectCosting;
    } catch (error) {
      logger.error('Error calculating project costing', { error, projectId });
      throw error;
    }
  }

  // Idle Detection
  async createIdleDetection(data: Omit<IdleDetection, 'id' | 'createdAt'>): Promise<IdleDetection> {
    try {
      const idleDetection = await prisma.idleDetection.create({
        data: {
          ...data,
          createdAt: new Date(),
        },
      });

      logger.info('Idle detection created successfully', { idleDetectionId: idleDetection.id });
      return idleDetection as IdleDetection;
    } catch (error) {
      logger.error('Error creating idle detection', { error, data });
      throw error;
    }
  }

  async resolveIdleDetection(id: string): Promise<IdleDetection> {
    try {
      const idleDetection = await prisma.idleDetection.update({
        where: { id },
        data: {
          status: 'RESOLVED',
          idleEndTime: new Date(),
        },
      });

      logger.info('Idle detection resolved successfully', { idleDetectionId: id });
      return idleDetection as IdleDetection;
    } catch (error) {
      logger.error('Error resolving idle detection', { error, idleDetectionId: id });
      throw error;
    }
  }

  // GPS Tracking
  async createGPSTracking(data: Omit<GPSTracking, 'id' | 'createdAt'>): Promise<GPSTracking> {
    try {
      const gpsTracking = await prisma.gpsTracking.create({
        data: {
          ...data,
          createdAt: new Date(),
        },
      });

      logger.info('GPS tracking created successfully', { gpsTrackingId: gpsTracking.id });
      return gpsTracking as GPSTracking;
    } catch (error) {
      logger.error('Error creating GPS tracking', { error, data });
      throw error;
    }
  }

  async getGPSTracking(timeEntryId: string): Promise<GPSTracking[]> {
    try {
      const gpsTracking = await prisma.gpsTracking.findMany({
        where: { timeEntryId },
        orderBy: { timestamp: 'asc' },
      });

      return gpsTracking as GPSTracking[];
    } catch (error) {
      logger.error('Error fetching GPS tracking', { error, timeEntryId });
      throw error;
    }
  }

  // Analytics and Reporting
  async getTimeTrackingAnalytics(userId?: string, projectId?: string): Promise<{
    totalHours: number;
    billableHours: number;
    totalRevenue: number;
    averageHourlyRate: number;
    productivityScore: number;
    topProjects: Array<{ projectId: string; name: string; hours: number; revenue: number }>;
    weeklyTrend: Array<{ week: string; hours: number; revenue: number }>;
    resourceUtilization: Array<{ resourceId: string; name: string; utilization: number; hours: number }>;
  }> {
    try {
      const where: any = {};
      if (userId) where.userId = userId;
      if (projectId) where.projectId = projectId;

      const timeEntries = await prisma.timeEntry.findMany({
        where: { ...where, status: 'COMPLETED' },
        include: { project: true },
      });

      const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.duration / 60), 0);
      const billableHours = timeEntries
        .filter(entry => entry.billable)
        .reduce((sum, entry) => sum + (entry.duration / 60), 0);
      const totalRevenue = timeEntries
        .filter(entry => entry.billable)
        .reduce((sum, entry) => sum + entry.totalAmount, 0);
      const averageHourlyRate = billableHours > 0 ? totalRevenue / billableHours : 0;

      // Calculate productivity score (billable hours / total hours)
      const productivityScore = totalHours > 0 ? (billableHours / totalHours) * 100 : 0;

      // Top projects by hours
      const projectHours = timeEntries.reduce((acc, entry) => {
        const projectId = entry.projectId;
        if (!acc[projectId]) {
          acc[projectId] = { projectId, name: entry.project?.name || 'Unknown', hours: 0, revenue: 0 };
        }
        acc[projectId].hours += entry.duration / 60;
        if (entry.billable) {
          acc[projectId].revenue += entry.totalAmount;
        }
        return acc;
      }, {} as Record<string, any>);

      const topProjects = Object.values(projectHours)
        .sort((a: any, b: any) => b.hours - a.hours)
        .slice(0, 5);

      // Weekly trend (last 12 weeks)
      const weeklyTrend = this.calculateWeeklyTrend(timeEntries);

      // Resource utilization
      const resourceUtilization = await this.calculateResourceUtilization();

      return {
        totalHours,
        billableHours,
        totalRevenue,
        averageHourlyRate,
        productivityScore,
        topProjects,
        weeklyTrend,
        resourceUtilization,
      };
    } catch (error) {
      logger.error('Error calculating time tracking analytics', { error, userId, projectId });
      throw error;
    }
  }

  // Helper methods
  private calculateWeeklyTrend(timeEntries: any[]): Array<{ week: string; hours: number; revenue: number }> {
    const weeklyData: Record<string, { hours: number; revenue: number }> = {};

    timeEntries.forEach(entry => {
      const weekStart = new Date(entry.startTime);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { hours: 0, revenue: 0 };
      }

      weeklyData[weekKey].hours += entry.duration / 60;
      if (entry.billable) {
        weeklyData[weekKey].revenue += entry.totalAmount;
      }
    });

    return Object.entries(weeklyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([week, data]) => ({ week, ...data }));
  }

  private async calculateResourceUtilization(): Promise<Array<{ resourceId: string; name: string; utilization: number; hours: number }>> {
    try {
      const resources = await prisma.resource.findMany({
        where: { status: 'ACTIVE' },
      });

      const utilization = await Promise.all(
        resources.map(async (resource) => {
          const timeEntries = await prisma.timeEntry.findMany({
            where: {
              userId: resource.userId,
              status: 'COMPLETED',
              startTime: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
              },
            },
          });

          const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.duration / 60), 0);
          const expectedHours = 160; // 40 hours/week * 4 weeks
          const utilization = expectedHours > 0 ? (totalHours / expectedHours) * 100 : 0;

          return {
            resourceId: resource.id,
            name: resource.name,
            utilization: Math.min(utilization, 100),
            hours: totalHours,
          };
        })
      );

      return utilization;
    } catch (error) {
      logger.error('Error calculating resource utilization', { error });
      return [];
    }
  }
}

export const enhancedTimeTrackingService = new EnhancedTimeTrackingService();







