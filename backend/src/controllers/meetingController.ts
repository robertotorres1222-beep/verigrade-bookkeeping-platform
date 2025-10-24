import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../config/database';

export const meetingController = {
  // Create meeting
  async createMeeting(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        title,
        description,
        clientId,
        scheduledAt,
        duration,
        type,
        agenda,
        attendees,
        location,
        isRecurring = false,
        recurrencePattern,
      } = req.body;

      if (!title || !scheduledAt) {
        return res.status(400).json({ error: 'Title and scheduled time are required' });
      }

      const meeting = await prisma.meeting.create({
        data: {
          organizationId: req.user!.organizationId,
          practiceId: req.body.practiceId,
          clientId,
          title,
          description,
          scheduledAt: new Date(scheduledAt),
          duration,
          type,
          agenda,
          attendees,
          location,
          isRecurring,
          recurrencePattern,
          createdBy: req.user!.id,
        },
        include: {
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
        message: 'Meeting created successfully',
        meeting,
      });
    } catch (error: any) {
      console.error('Create meeting error:', error);
      return res.status(500).json({ error: 'Failed to create meeting' });
    }
  },

  // Get meetings
  async getMeetings(req: AuthenticatedRequest, res: Response) {
    try {
      const { practiceId, clientId, type, startDate, endDate, page = 1, limit = 20 } = req.query;

      const where: any = {};

      if (practiceId) {
        where.practiceId = practiceId;
      } else {
        where.organizationId = req.user!.organizationId;
      }

      if (clientId) {
        where.clientId = clientId;
      }

      if (type) {
        where.type = type;
      }

      if (startDate && endDate) {
        where.scheduledAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        };
      }

      const meetings = await prisma.meeting.findMany({
        where,
        include: {
          createdByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { scheduledAt: 'asc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      });

      const total = await prisma.meeting.count({ where });

      return res.json({
        meetings,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error: any) {
      console.error('Get meetings error:', error);
      return res.status(500).json({ error: 'Failed to get meetings' });
    }
  },

  // Add meeting notes
  async addMeetingNotes(req: AuthenticatedRequest, res: Response) {
    try {
      const { meetingId } = req.params;
      const { notes, actionItems, decisions, nextSteps } = req.body;

      if (!notes) {
        return res.status(400).json({ error: 'Notes are required' });
      }

      const meetingNotes = await prisma.meetingNotes.create({
        data: {
          meetingId,
          notes,
          actionItems,
          decisions,
          nextSteps,
          createdBy: req.user!.id,
        },
        include: {
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
        message: 'Meeting notes added successfully',
        meetingNotes,
      });
    } catch (error: any) {
      console.error('Add meeting notes error:', error);
      return res.status(500).json({ error: 'Failed to add meeting notes' });
    }
  },

  // Get meeting notes
  async getMeetingNotes(req: AuthenticatedRequest, res: Response) {
    try {
      const { meetingId } = req.params;

      const notes = await prisma.meetingNotes.findMany({
        where: { meetingId },
        include: {
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
      });

      return res.json({ notes });
    } catch (error: any) {
      console.error('Get meeting notes error:', error);
      return res.status(500).json({ error: 'Failed to get meeting notes' });
    }
  },

  // Update meeting
  async updateMeeting(req: AuthenticatedRequest, res: Response) {
    try {
      const { meetingId } = req.params;
      const updateData = req.body;

      const meeting = await prisma.meeting.update({
        where: { id: meetingId },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        include: {
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
        message: 'Meeting updated successfully',
        meeting,
      });
    } catch (error: any) {
      console.error('Update meeting error:', error);
      return res.status(500).json({ error: 'Failed to update meeting' });
    }
  },

  // Cancel meeting
  async cancelMeeting(req: AuthenticatedRequest, res: Response) {
    try {
      const { meetingId } = req.params;
      const { reason } = req.body;

      const meeting = await prisma.meeting.update({
        where: { id: meetingId },
        data: {
          status: 'CANCELLED',
          cancellationReason: reason,
          cancelledAt: new Date(),
        },
        include: {
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
        message: 'Meeting cancelled successfully',
        meeting,
      });
    } catch (error: any) {
      console.error('Cancel meeting error:', error);
      return res.status(500).json({ error: 'Failed to cancel meeting' });
    }
  },

  // Get meeting statistics
  async getMeetingStatistics(req: AuthenticatedRequest, res: Response) {
    try {
      const { practiceId, startDate, endDate } = req.query;

      const where: any = {};

      if (practiceId) {
        where.practiceId = practiceId;
      } else {
        where.organizationId = req.user!.organizationId;
      }

      if (startDate && endDate) {
        where.scheduledAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        };
      }

      const [
        totalMeetings,
        completedMeetings,
        cancelledMeetings,
        upcomingMeetings,
      ] = await Promise.all([
        prisma.meeting.count({ where }),
        prisma.meeting.count({ where: { ...where, status: 'COMPLETED' } }),
        prisma.meeting.count({ where: { ...where, status: 'CANCELLED' } }),
        prisma.meeting.count({
          where: {
            ...where,
            status: 'SCHEDULED',
            scheduledAt: { gte: new Date() },
          },
        }),
      ]);

      const completionRate = totalMeetings > 0 ? (completedMeetings / totalMeetings) * 100 : 0;

      return res.json({
        statistics: {
          totalMeetings,
          completedMeetings,
          cancelledMeetings,
          upcomingMeetings,
          completionRate: Math.round(completionRate * 100) / 100,
        },
      });
    } catch (error: any) {
      console.error('Get meeting statistics error:', error);
      return res.status(500).json({ error: 'Failed to get meeting statistics' });
    }
  },
};

