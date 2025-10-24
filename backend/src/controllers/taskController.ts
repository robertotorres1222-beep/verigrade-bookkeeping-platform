import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { ResponseHandler } from '../utils/response';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { validateTask } from '../middleware/validation';

export const taskController = {
  // Create task
  createTask: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      title,
      description,
      priority = 'MEDIUM',
      dueDate,
      clientId,
      category,
      tags = [],
      metadata = {},
      assignedTo,
    } = req.body;

    if (!title || !assignedTo) {
      throw new AppError('Title and assigned user are required', 400);
    }

    const task = await prisma.task.create({
      data: {
        organizationId: req.user!.organizationId,
        practiceId: req.body.practiceId,
        assignedTo,
        createdBy: req.user!.id,
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        clientId,
        category,
        tags,
        metadata,
      },
      include: {
        assignedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return ResponseHandler.created(res, task, 'Task created successfully');
  }),

  // Get tasks
  async getTasks(req: AuthenticatedRequest, res: Response) {
    try {
      const { status, priority, assignedTo, clientId, page = 1, limit = 20 } = req.query;

      const where: any = {
        OR: [
          { organizationId: req.user!.organizationId },
          { practiceId: req.body.practiceId },
        ],
      };

      if (status) {
        where.status = status;
      }

      if (priority) {
        where.priority = priority;
      }

      if (assignedTo) {
        where.assignedTo = assignedTo;
      }

      if (clientId) {
        where.clientId = clientId;
      }

      const tasks = await prisma.task.findMany({
        where,
        include: {
          assignedUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          createdByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      });

      const total = await prisma.task.count({ where });

      return res.json({
        tasks,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error: any) {
      console.error('Get tasks error:', error);
      return res.status(500).json({ error: 'Failed to get tasks' });
    }
  },

  // Update task
  async updateTask(req: AuthenticatedRequest, res: Response) {
    try {
      const { taskId } = req.params;
      const updateData = req.body;

      const task = await prisma.task.update({
        where: { id: taskId },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        include: {
          assignedUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          createdByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return res.json({
        message: 'Task updated successfully',
        task,
      });
    } catch (error: any) {
      console.error('Update task error:', error);
      return res.status(500).json({ error: 'Failed to update task' });
    }
  },

  // Complete task
  async completeTask(req: AuthenticatedRequest, res: Response) {
    try {
      const { taskId } = req.params;
      const { notes } = req.body;

      const task = await prisma.task.update({
        where: { id: taskId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          metadata: {
            ...req.body.metadata,
            completionNotes: notes,
          },
        },
        include: {
          assignedUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          createdByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return res.json({
        message: 'Task completed successfully',
        task,
      });
    } catch (error: any) {
      console.error('Complete task error:', error);
      return res.status(500).json({ error: 'Failed to complete task' });
    }
  },

  // Get task templates
  async getTaskTemplates(req: AuthenticatedRequest, res: Response) {
    try {
      const { category } = req.query;

      const where: any = { isActive: true };

      if (category) {
        where.category = category;
      }

      const templates = await prisma.taskTemplate.findMany({
        where,
        orderBy: { name: 'asc' },
      });

      return res.json({ templates });
    } catch (error: any) {
      console.error('Get task templates error:', error);
      return res.status(500).json({ error: 'Failed to get task templates' });
    }
  },

  // Create task from template
  async createTaskFromTemplate(req: AuthenticatedRequest, res: Response) {
    try {
      const { templateId } = req.params;
      const { assignedTo, dueDate, clientId } = req.body;

      if (!assignedTo) {
        return res.status(400).json({ error: 'Assigned user is required' });
      }

      const template = await prisma.taskTemplate.findUnique({
        where: { id: templateId },
      });

      if (!template) {
        return res.status(404).json({ error: 'Task template not found' });
      }

      const task = await prisma.task.create({
        data: {
          organizationId: req.user!.organizationId,
          practiceId: req.body.practiceId,
          assignedTo,
          createdBy: req.user!.id,
          title: template.name,
          description: template.description,
          category: template.category,
          dueDate: dueDate ? new Date(dueDate) : null,
          clientId,
          metadata: {
            templateId: template.id,
            checklist: template.checklist,
          },
        },
        include: {
          assignedUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          createdByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return res.status(201).json({
        message: 'Task created from template successfully',
        task,
      });
    } catch (error: any) {
      console.error('Create task from template error:', error);
      return res.status(500).json({ error: 'Failed to create task from template' });
    }
  },

  // Get task statistics
  async getTaskStatistics(req: AuthenticatedRequest, res: Response) {
    try {
      const { practiceId, userId, startDate, endDate } = req.query;

      const where: any = {};

      if (practiceId) {
        where.practiceId = practiceId;
      }

      if (userId) {
        where.assignedTo = userId;
      }

      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        };
      }

      const [
        totalTasks,
        completedTasks,
        overdueTasks,
        pendingTasks,
      ] = await Promise.all([
        prisma.task.count({ where }),
        prisma.task.count({ where: { ...where, status: 'COMPLETED' } }),
        prisma.task.count({
          where: {
            ...where,
            status: { not: 'COMPLETED' },
            dueDate: { lt: new Date() },
          },
        }),
        prisma.task.count({ where: { ...where, status: 'PENDING' } }),
      ]);

      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      return res.json({
        statistics: {
          totalTasks,
          completedTasks,
          overdueTasks,
          pendingTasks,
          completionRate: Math.round(completionRate * 100) / 100,
        },
      });
    } catch (error: any) {
      console.error('Get task statistics error:', error);
      return res.status(500).json({ error: 'Failed to get task statistics' });
    }
  },
};
