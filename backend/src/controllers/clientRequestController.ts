import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../config/database';

export const clientRequestController = {
  // Create client request
  async createRequest(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        organizationId,
        practiceId,
        title,
        description,
        type,
        priority = 'MEDIUM',
        dueDate,
        metadata = {},
      } = req.body;

      if (!title || !description || !type) {
        return res.status(400).json({ error: 'Title, description, and type are required' });
      }

      const request = await prisma.clientRequest.create({
        data: {
          organizationId,
          practiceId,
          requestedBy: req.user!.id,
          assignedTo: req.body.assignedTo,
          title,
          description,
          type,
          priority,
          dueDate: dueDate ? new Date(dueDate) : null,
          metadata,
        },
        include: {
          requestedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          assignedUser: {
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
        message: 'Request created successfully',
        request,
      });
    } catch (error: any) {
      console.error('Create client request error:', error);
      return res.status(500).json({ error: 'Failed to create request' });
    }
  },

  // Get client requests
  async getRequests(req: AuthenticatedRequest, res: Response) {
    try {
      const { organizationId, practiceId, status, type, priority, page = 1, limit = 20 } = req.query;

      const where: any = {};

      if (organizationId) {
        where.organizationId = organizationId;
      }

      if (practiceId) {
        where.practiceId = practiceId;
      }

      if (status) {
        where.status = status;
      }

      if (type) {
        where.type = type;
      }

      if (priority) {
        where.priority = priority;
      }

      const requests = await prisma.clientRequest.findMany({
        where,
        include: {
          requestedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          assignedUser: {
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

      const total = await prisma.clientRequest.count({ where });

      return res.json({
        requests,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error: any) {
      console.error('Get client requests error:', error);
      return res.status(500).json({ error: 'Failed to get requests' });
    }
  },

  // Update request
  async updateRequest(req: AuthenticatedRequest, res: Response) {
    try {
      const { requestId } = req.params;
      const updateData = req.body;

      const request = await prisma.clientRequest.update({
        where: { id: requestId },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        include: {
          requestedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          assignedUser: {
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
        message: 'Request updated successfully',
        request,
      });
    } catch (error: any) {
      console.error('Update request error:', error);
      return res.status(500).json({ error: 'Failed to update request' });
    }
  },

  // Assign request
  async assignRequest(req: AuthenticatedRequest, res: Response) {
    try {
      const { requestId } = req.params;
      const { assignedTo } = req.body;

      if (!assignedTo) {
        return res.status(400).json({ error: 'Assigned user is required' });
      }

      const request = await prisma.clientRequest.update({
        where: { id: requestId },
        data: {
          assignedTo,
          status: 'IN_PROGRESS',
        },
        include: {
          requestedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          assignedUser: {
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
        message: 'Request assigned successfully',
        request,
      });
    } catch (error: any) {
      console.error('Assign request error:', error);
      return res.status(500).json({ error: 'Failed to assign request' });
    }
  },

  // Complete request
  async completeRequest(req: AuthenticatedRequest, res: Response) {
    try {
      const { requestId } = req.params;
      const { response } = req.body;

      const request = await prisma.clientRequest.update({
        where: { id: requestId },
        data: {
          status: 'COMPLETED',
          response,
          completedAt: new Date(),
        },
        include: {
          requestedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          assignedUser: {
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
        message: 'Request completed successfully',
        request,
      });
    } catch (error: any) {
      console.error('Complete request error:', error);
      return res.status(500).json({ error: 'Failed to complete request' });
    }
  },

  // Get request statistics
  async getRequestStatistics(req: AuthenticatedRequest, res: Response) {
    try {
      const { practiceId, startDate, endDate } = req.query;

      const where: any = {};

      if (practiceId) {
        where.practiceId = practiceId;
      }

      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        };
      }

      const [
        totalRequests,
        openRequests,
        inProgressRequests,
        completedRequests,
        overdueRequests,
      ] = await Promise.all([
        prisma.clientRequest.count({ where }),
        prisma.clientRequest.count({ where: { ...where, status: 'OPEN' } }),
        prisma.clientRequest.count({ where: { ...where, status: 'IN_PROGRESS' } }),
        prisma.clientRequest.count({ where: { ...where, status: 'COMPLETED' } }),
        prisma.clientRequest.count({
          where: {
            ...where,
            status: { not: 'COMPLETED' },
            dueDate: { lt: new Date() },
          },
        }),
      ]);

      const completionRate = totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0;

      return res.json({
        statistics: {
          totalRequests,
          openRequests,
          inProgressRequests,
          completedRequests,
          overdueRequests,
          completionRate: Math.round(completionRate * 100) / 100,
        },
      });
    } catch (error: any) {
      console.error('Get request statistics error:', error);
      return res.status(500).json({ error: 'Failed to get request statistics' });
    }
  },
};

