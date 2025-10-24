import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface Resource {
  id: string;
  organizationId: string;
  userId: string;
  name: string;
  type: 'employee' | 'contractor' | 'equipment' | 'room' | 'vehicle';
  skills: string[];
  hourlyRate?: number;
  availability: {
    monday: { start: string; end: string; available: boolean };
    tuesday: { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday: { start: string; end: string; available: boolean };
    friday: { start: string; end: string; available: boolean };
    saturday: { start: string; end: string; available: boolean };
    sunday: { start: string; end: string; available: boolean };
  };
  maxHoursPerWeek: number;
  currentHoursPerWeek: number;
  status: 'available' | 'busy' | 'unavailable' | 'on_leave';
  location?: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResourceAllocation {
  id: string;
  organizationId: string;
  resourceId: string;
  projectId: string;
  taskId?: string;
  startDate: Date;
  endDate: Date;
  allocatedHours: number;
  actualHours?: number;
  status: 'planned' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CapacityPlan {
  id: string;
  organizationId: string;
  resourceId: string;
  weekStarting: Date;
  plannedHours: number;
  availableHours: number;
  utilizationPercentage: number;
  projects: {
    projectId: string;
    projectName: string;
    allocatedHours: number;
    priority: string;
  }[];
  conflicts: {
    type: 'overallocation' | 'skill_mismatch' | 'availability_conflict';
    description: string;
    severity: 'low' | 'medium' | 'high';
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkloadBalance {
  resourceId: string;
  resourceName: string;
  currentWorkload: number;
  maxWorkload: number;
  utilizationPercentage: number;
  projects: number;
  overdueTasks: number;
  upcomingDeadlines: number;
  recommendations: string[];
}

class ResourceSchedulingService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Create resource
   */
  async createResource(data: {
    organizationId: string;
    userId: string;
    name: string;
    type: 'employee' | 'contractor' | 'equipment' | 'room' | 'vehicle';
    skills: string[];
    hourlyRate?: number;
    availability: {
      monday: { start: string; end: string; available: boolean };
      tuesday: { start: string; end: string; available: boolean };
      wednesday: { start: string; end: string; available: boolean };
      thursday: { start: string; end: string; available: boolean };
      friday: { start: string; end: string; available: boolean };
      saturday: { start: string; end: string; available: boolean };
      sunday: { start: string; end: string; available: boolean };
    };
    maxHoursPerWeek: number;
    location?: string;
    timezone: string;
  }): Promise<Resource> {
    try {
      const resource = await this.prisma.resource.create({
        data: {
          id: uuidv4(),
          organizationId: data.organizationId,
          userId: data.userId,
          name: data.name,
          type: data.type,
          skills: data.skills,
          hourlyRate: data.hourlyRate,
          availability: data.availability,
          maxHoursPerWeek: data.maxHoursPerWeek,
          currentHoursPerWeek: 0,
          status: 'available',
          location: data.location,
          timezone: data.timezone,
        },
      });

      logger.info(`[ResourceSchedulingService] Created resource: ${data.name}`);
      return resource;
    } catch (error) {
      logger.error('[ResourceSchedulingService] Failed to create resource:', error);
      throw new Error(`Failed to create resource: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Allocate resource to project
   */
  async allocateResource(data: {
    organizationId: string;
    resourceId: string;
    projectId: string;
    taskId?: string;
    startDate: Date;
    endDate: Date;
    allocatedHours: number;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    notes?: string;
    createdBy: string;
  }): Promise<ResourceAllocation> {
    try {
      // Check resource availability
      const availability = await this.checkResourceAvailability(
        data.resourceId,
        data.startDate,
        data.endDate,
        data.allocatedHours
      );

      if (!availability.available) {
        throw new Error(`Resource not available: ${availability.reason}`);
      }

      const allocation = await this.prisma.resourceAllocation.create({
        data: {
          id: uuidv4(),
          organizationId: data.organizationId,
          resourceId: data.resourceId,
          projectId: data.projectId,
          taskId: data.taskId,
          startDate: data.startDate,
          endDate: data.endDate,
          allocatedHours: data.allocatedHours,
          status: 'planned',
          priority: data.priority,
          notes: data.notes,
          createdBy: data.createdBy,
        },
      });

      // Update resource current hours
      await this.updateResourceCurrentHours(data.resourceId);

      logger.info(`[ResourceSchedulingService] Allocated resource to project: ${data.projectId}`);
      return allocation;
    } catch (error) {
      logger.error('[ResourceSchedulingService] Failed to allocate resource:', error);
      throw new Error(`Failed to allocate resource: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check resource availability
   */
  async checkResourceAvailability(
    resourceId: string,
    startDate: Date,
    endDate: Date,
    requestedHours: number
  ): Promise<{ available: boolean; reason?: string; conflicts?: any[] }> {
    try {
      const resource = await this.prisma.resource.findFirst({
        where: { id: resourceId },
      });

      if (!resource) {
        return { available: false, reason: 'Resource not found' };
      }

      if (resource.status !== 'available') {
        return { available: false, reason: `Resource is ${resource.status}` };
      }

      // Check existing allocations for the period
      const existingAllocations = await this.prisma.resourceAllocation.findMany({
        where: {
          resourceId,
          status: { in: ['planned', 'confirmed', 'in_progress'] },
          OR: [
            {
              startDate: { lte: endDate },
              endDate: { gte: startDate },
            },
          ],
        },
      });

      // Calculate total allocated hours for the period
      const totalAllocatedHours = existingAllocations.reduce((sum, allocation) => {
        const overlapStart = new Date(Math.max(allocation.startDate.getTime(), startDate.getTime()));
        const overlapEnd = new Date(Math.min(allocation.endDate.getTime(), endDate.getTime()));
        const overlapDays = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24));
        const dailyHours = allocation.allocatedHours / Math.ceil((allocation.endDate.getTime() - allocation.startDate.getTime()) / (1000 * 60 * 60 * 24));
        return sum + (overlapDays * dailyHours);
      }, 0);

      // Check if adding requested hours would exceed weekly limit
      const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const dailyHours = requestedHours / periodDays;
      const weeklyHours = dailyHours * 7;

      if (resource.currentHoursPerWeek + weeklyHours > resource.maxHoursPerWeek) {
        return {
          available: false,
          reason: `Would exceed weekly hour limit (${resource.maxHoursPerWeek}h)`,
        };
      }

      // Check availability for each day in the period
      const conflicts = [];
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'lowercase' }) as keyof typeof resource.availability;
        const dayAvailability = resource.availability[dayOfWeek];

        if (!dayAvailability.available) {
          conflicts.push({
            date: new Date(currentDate),
            reason: 'Resource not available on this day',
          });
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (conflicts.length > 0) {
        return {
          available: false,
          reason: 'Resource not available on some days',
          conflicts,
        };
      }

      return { available: true };
    } catch (error) {
      logger.error('[ResourceSchedulingService] Failed to check resource availability:', error);
      throw new Error(`Failed to check resource availability: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate capacity plan for resource
   */
  async generateCapacityPlan(
    resourceId: string,
    organizationId: string,
    weekStarting: Date
  ): Promise<CapacityPlan> {
    try {
      const resource = await this.prisma.resource.findFirst({
        where: { id: resourceId, organizationId },
      });

      if (!resource) {
        throw new Error('Resource not found');
      }

      const weekEnding = new Date(weekStarting);
      weekEnding.setDate(weekEnding.getDate() + 6);

      // Get allocations for the week
      const allocations = await this.prisma.resourceAllocation.findMany({
        where: {
          resourceId,
          organizationId,
          startDate: { lte: weekEnding },
          endDate: { gte: weekStarting },
          status: { in: ['planned', 'confirmed', 'in_progress'] },
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Calculate planned hours
      const plannedHours = allocations.reduce((sum, allocation) => {
        const overlapStart = new Date(Math.max(allocation.startDate.getTime(), weekStarting.getTime()));
        const overlapEnd = new Date(Math.min(allocation.endDate.getTime(), weekEnding.getTime()));
        const overlapDays = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24));
        const dailyHours = allocation.allocatedHours / Math.ceil((allocation.endDate.getTime() - allocation.startDate.getTime()) / (1000 * 60 * 60 * 24));
        return sum + (overlapDays * dailyHours);
      }, 0);

      // Calculate available hours based on availability
      let availableHours = 0;
      const currentDate = new Date(weekStarting);
      while (currentDate <= weekEnding) {
        const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'lowercase' }) as keyof typeof resource.availability;
        const dayAvailability = resource.availability[dayOfWeek];

        if (dayAvailability.available) {
          const startTime = new Date(`2000-01-01T${dayAvailability.start}`);
          const endTime = new Date(`2000-01-01T${dayAvailability.end}`);
          const dayHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
          availableHours += dayHours;
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      const utilizationPercentage = availableHours > 0 ? (plannedHours / availableHours) * 100 : 0;

      // Group projects
      const projects = allocations.reduce((acc, allocation) => {
        const existing = acc.find(p => p.projectId === allocation.projectId);
        if (existing) {
          existing.allocatedHours += allocation.allocatedHours;
        } else {
          acc.push({
            projectId: allocation.projectId,
            projectName: allocation.project.name,
            allocatedHours: allocation.allocatedHours,
            priority: allocation.priority,
          });
        }
        return acc;
      }, [] as any[]);

      // Check for conflicts
      const conflicts = [];
      if (plannedHours > availableHours) {
        conflicts.push({
          type: 'overallocation',
          description: `Planned hours (${plannedHours.toFixed(1)}) exceed available hours (${availableHours.toFixed(1)})`,
          severity: 'high' as const,
        });
      }

      if (utilizationPercentage > 100) {
        conflicts.push({
          type: 'overallocation',
          description: `Utilization exceeds 100% (${utilizationPercentage.toFixed(1)}%)`,
          severity: 'high' as const,
        });
      }

      const capacityPlan = await this.prisma.capacityPlan.create({
        data: {
          id: uuidv4(),
          organizationId,
          resourceId,
          weekStarting,
          plannedHours,
          availableHours,
          utilizationPercentage,
          projects,
          conflicts,
        },
      });

      logger.info(`[ResourceSchedulingService] Generated capacity plan for resource: ${resourceId}`);
      return capacityPlan;
    } catch (error) {
      logger.error('[ResourceSchedulingService] Failed to generate capacity plan:', error);
      throw new Error(`Failed to generate capacity plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get workload balance for all resources
   */
  async getWorkloadBalance(organizationId: string): Promise<WorkloadBalance[]> {
    try {
      const resources = await this.prisma.resource.findMany({
        where: { organizationId },
        include: {
          allocations: {
            where: {
              status: { in: ['planned', 'confirmed', 'in_progress'] },
            },
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                  deadline: true,
                },
              },
            },
          },
        },
      });

      const workloadBalance = resources.map(resource => {
        const currentWorkload = resource.allocations.reduce((sum, allocation) => {
          const now = new Date();
          const startDate = new Date(allocation.startDate);
          const endDate = new Date(allocation.endDate);
          
          if (now >= startDate && now <= endDate) {
            const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const dailyHours = allocation.allocatedHours / totalDays;
            return sum + dailyHours;
          }
          return sum;
        }, 0);

        const projects = new Set(resource.allocations.map(a => a.projectId)).size;
        
        const overdueTasks = resource.allocations.filter(allocation => {
          const project = allocation.project;
          return project.deadline && new Date(project.deadline) < new Date() && allocation.status !== 'completed';
        }).length;

        const upcomingDeadlines = resource.allocations.filter(allocation => {
          const project = allocation.project;
          const deadline = new Date(project.deadline || '');
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          return project.deadline && deadline <= nextWeek && allocation.status !== 'completed';
        }).length;

        const utilizationPercentage = resource.maxHoursPerWeek > 0 ? (currentWorkload / resource.maxHoursPerWeek) * 100 : 0;

        const recommendations = [];
        if (utilizationPercentage > 90) {
          recommendations.push('Consider redistributing workload - resource is overutilized');
        } else if (utilizationPercentage < 50) {
          recommendations.push('Resource has available capacity for additional work');
        }
        if (overdueTasks > 0) {
          recommendations.push(`${overdueTasks} overdue tasks need attention`);
        }
        if (upcomingDeadlines > 0) {
          recommendations.push(`${upcomingDeadlines} deadlines approaching`);
        }

        return {
          resourceId: resource.id,
          resourceName: resource.name,
          currentWorkload,
          maxWorkload: resource.maxHoursPerWeek,
          utilizationPercentage,
          projects,
          overdueTasks,
          upcomingDeadlines,
          recommendations,
        };
      });

      return workloadBalance;
    } catch (error) {
      logger.error('[ResourceSchedulingService] Failed to get workload balance:', error);
      throw new Error(`Failed to get workload balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update resource current hours
   */
  private async updateResourceCurrentHours(resourceId: string): Promise<void> {
    try {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const allocations = await this.prisma.resourceAllocation.findMany({
        where: {
          resourceId,
          startDate: { lte: weekEnd },
          endDate: { gte: weekStart },
          status: { in: ['planned', 'confirmed', 'in_progress'] },
        },
      });

      const currentHours = allocations.reduce((sum, allocation) => {
        const overlapStart = new Date(Math.max(allocation.startDate.getTime(), weekStart.getTime()));
        const overlapEnd = new Date(Math.min(allocation.endDate.getTime(), weekEnd.getTime()));
        const overlapDays = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24));
        const dailyHours = allocation.allocatedHours / Math.ceil((allocation.endDate.getTime() - allocation.startDate.getTime()) / (1000 * 60 * 60 * 24));
        return sum + (overlapDays * dailyHours);
      }, 0);

      await this.prisma.resource.update({
        where: { id: resourceId },
        data: { currentHoursPerWeek: currentHours },
      });
    } catch (error) {
      logger.error('[ResourceSchedulingService] Failed to update resource current hours:', error);
    }
  }

  /**
   * Get resource allocations
   */
  async getResourceAllocations(
    resourceId: string,
    organizationId: string,
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<{ data: ResourceAllocation[]; total: number; page: number; limit: number }> {
    try {
      const where = {
        resourceId,
        organizationId,
      };

      const [data, total] = await Promise.all([
        this.prisma.resourceAllocation.findMany({
          where,
          include: {
            project: {
              select: {
                id: true,
                name: true,
              },
            },
            task: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { startDate: 'desc' },
          skip: (pagination.page - 1) * pagination.limit,
          take: pagination.limit,
        }),
        this.prisma.resourceAllocation.count({ where }),
      ]);

      return {
        data,
        total,
        page: pagination.page,
        limit: pagination.limit,
      };
    } catch (error) {
      logger.error('[ResourceSchedulingService] Failed to get resource allocations:', error);
      throw new Error(`Failed to get resource allocations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update allocation status
   */
  async updateAllocationStatus(
    allocationId: string,
    organizationId: string,
    status: 'planned' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled',
    actualHours?: number
  ): Promise<ResourceAllocation> {
    try {
      const allocation = await this.prisma.resourceAllocation.findFirst({
        where: {
          id: allocationId,
          organizationId,
        },
      });

      if (!allocation) {
        throw new Error('Allocation not found');
      }

      const updated = await this.prisma.resourceAllocation.update({
        where: { id: allocationId },
        data: {
          status,
          actualHours,
        },
      });

      // Update resource current hours
      await this.updateResourceCurrentHours(allocation.resourceId);

      logger.info(`[ResourceSchedulingService] Updated allocation status: ${allocationId}`);
      return updated;
    } catch (error) {
      logger.error('[ResourceSchedulingService] Failed to update allocation status:', error);
      throw new Error(`Failed to update allocation status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get resource analytics
   */
  async getResourceAnalytics(organizationId: string, dateFrom: Date, dateTo: Date) {
    try {
      const [
        totalResources,
        activeResources,
        totalAllocations,
        completedAllocations,
        averageUtilization,
        topResources,
      ] = await Promise.all([
        // Total resources
        this.prisma.resource.count({
          where: {
            organizationId,
            createdAt: {
              gte: dateFrom,
              lte: dateTo,
            },
          },
        }),

        // Active resources
        this.prisma.resource.count({
          where: {
            organizationId,
            status: 'available',
          },
        }),

        // Total allocations
        this.prisma.resourceAllocation.count({
          where: {
            organizationId,
            createdAt: {
              gte: dateFrom,
              lte: dateTo,
            },
          },
        }),

        // Completed allocations
        this.prisma.resourceAllocation.count({
          where: {
            organizationId,
            status: 'completed',
            createdAt: {
              gte: dateFrom,
              lte: dateTo,
            },
          },
        }),

        // Average utilization
        this.prisma.resource.aggregate({
          where: {
            organizationId,
            maxHoursPerWeek: { gt: 0 },
          },
          _avg: {
            currentHoursPerWeek: true,
            maxHoursPerWeek: true,
          },
        }),

        // Top resources by utilization
        this.prisma.resource.findMany({
          where: {
            organizationId,
            maxHoursPerWeek: { gt: 0 },
          },
          select: {
            id: true,
            name: true,
            currentHoursPerWeek: true,
            maxHoursPerWeek: true,
          },
          orderBy: {
            currentHoursPerWeek: 'desc',
          },
          take: 10,
        }),
      ]);

      const averageUtilizationPercentage = averageUtilization._avg.currentHoursPerWeek && averageUtilization._avg.maxHoursPerWeek
        ? (averageUtilization._avg.currentHoursPerWeek / averageUtilization._avg.maxHoursPerWeek) * 100
        : 0;

      return {
        resources: {
          total: totalResources,
          active: activeResources,
          inactive: totalResources - activeResources,
        },
        allocations: {
          total: totalAllocations,
          completed: completedAllocations,
          pending: totalAllocations - completedAllocations,
        },
        utilization: {
          average: Math.round(averageUtilizationPercentage * 100) / 100,
        },
        topResources: topResources.map(resource => ({
          id: resource.id,
          name: resource.name,
          utilization: resource.maxHoursPerWeek > 0 
            ? Math.round((resource.currentHoursPerWeek / resource.maxHoursPerWeek) * 100 * 100) / 100
            : 0,
        })),
      };
    } catch (error) {
      logger.error('[ResourceSchedulingService] Failed to get resource analytics:', error);
      throw new Error(`Failed to get resource analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default new ResourceSchedulingService();





