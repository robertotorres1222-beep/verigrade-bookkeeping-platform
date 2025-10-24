import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../config/database';

export const collaborationController = {
  // Add note to transaction
  async addTransactionNote(req: AuthenticatedRequest, res: Response) {
    try {
      const { organizationId, transactionId } = req.params;
      const { content, isInternal = true, mentions = [] } = req.body;

      if (!content) {
        return res.status(400).json({ error: 'Note content is required' });
      }

      const note = await prisma.transactionNote.create({
        data: {
          organizationId,
          transactionId,
          userId: req.user!.id,
          content,
          isInternal,
          mentions,
        },
        include: {
          user: {
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
        message: 'Note added successfully',
        note,
      });
    } catch (error: any) {
      console.error('Add transaction note error:', error);
      return res.status(500).json({ error: 'Failed to add note' });
    }
  },

  // Get notes for transaction
  async getTransactionNotes(req: AuthenticatedRequest, res: Response) {
    try {
      const { organizationId, transactionId } = req.params;

      const notes = await prisma.transactionNote.findMany({
        where: {
          organizationId,
          transactionId,
        },
        include: {
          user: {
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
      console.error('Get transaction notes error:', error);
      return res.status(500).json({ error: 'Failed to get notes' });
    }
  },

  // Add annotation to document
  async addDocumentAnnotation(req: AuthenticatedRequest, res: Response) {
    try {
      const { organizationId, documentId } = req.params;
      const { content, position, isInternal = true } = req.body;

      if (!content) {
        return res.status(400).json({ error: 'Annotation content is required' });
      }

      const annotation = await prisma.documentAnnotation.create({
        data: {
          organizationId,
          documentId,
          userId: req.user!.id,
          content,
          position,
          isInternal,
        },
        include: {
          user: {
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
        message: 'Annotation added successfully',
        annotation,
      });
    } catch (error: any) {
      console.error('Add document annotation error:', error);
      return res.status(500).json({ error: 'Failed to add annotation' });
    }
  },

  // Get document annotations
  async getDocumentAnnotations(req: AuthenticatedRequest, res: Response) {
    try {
      const { organizationId, documentId } = req.params;

      const annotations = await prisma.documentAnnotation.findMany({
        where: {
          organizationId,
          documentId,
        },
        include: {
          user: {
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

      return res.json({ annotations });
    } catch (error: any) {
      console.error('Get document annotations error:', error);
      return res.status(500).json({ error: 'Failed to get annotations' });
    }
  },

  // Update review status
  async updateReviewStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { organizationId, transactionId } = req.params;
      const { status, comments } = req.body;

      if (!['PENDING', 'REVIEWED', 'APPROVED', 'REJECTED', 'NEEDS_ATTENTION'].includes(status)) {
        return res.status(400).json({ error: 'Invalid review status' });
      }

      const reviewStatus = await prisma.reviewStatus.upsert({
        where: {
          organizationId_transactionId_userId: {
            organizationId,
            transactionId,
            userId: req.user!.id,
          },
        },
        update: {
          status,
          comments,
          reviewedAt: status !== 'PENDING' ? new Date() : null,
        },
        create: {
          organizationId,
          transactionId,
          userId: req.user!.id,
          status,
          comments,
          reviewedAt: status !== 'PENDING' ? new Date() : null,
        },
        include: {
          user: {
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
        message: 'Review status updated successfully',
        reviewStatus,
      });
    } catch (error: any) {
      console.error('Update review status error:', error);
      return res.status(500).json({ error: 'Failed to update review status' });
    }
  },

  // Get review status
  async getReviewStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { organizationId, transactionId } = req.params;

      const reviewStatus = await prisma.reviewStatus.findMany({
        where: {
          organizationId,
          transactionId,
        },
        include: {
          user: {
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

      return res.json({ reviewStatus });
    } catch (error: any) {
      console.error('Get review status error:', error);
      return res.status(500).json({ error: 'Failed to get review status' });
    }
  },

  // Mention team member
  async mentionTeamMember(req: AuthenticatedRequest, res: Response) {
    try {
      const { organizationId } = req.params;
      const { mentionedUserId, message, context } = req.body;

      if (!mentionedUserId || !message) {
        return res.status(400).json({ error: 'Mentioned user ID and message are required' });
      }

      // Create notification for mentioned user
      const notification = await prisma.auditLog.create({
        data: {
          organizationId,
          userId: mentionedUserId,
          action: 'MENTION',
          resource: 'Collaboration',
          changes: {
            mentionedBy: req.user!.id,
            message,
            context,
          },
        },
      });

      return res.status(201).json({
        message: 'Team member mentioned successfully',
        notification,
      });
    } catch (error: any) {
      console.error('Mention team member error:', error);
      return res.status(500).json({ error: 'Failed to mention team member' });
    }
  },

  // Get collaboration activity
  async getCollaborationActivity(req: AuthenticatedRequest, res: Response) {
    try {
      const { organizationId } = req.params;
      const { type, limit = 50 } = req.query;

      const where: any = { organizationId };

      if (type) {
        where.resource = type;
      }

      const activity = await prisma.auditLog.findMany({
        where: {
          ...where,
          action: {
            in: ['MENTION', 'NOTE_ADDED', 'ANNOTATION_ADDED', 'REVIEW_STATUS_UPDATED'],
          },
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
      });

      return res.json({ activity });
    } catch (error: any) {
      console.error('Get collaboration activity error:', error);
      return res.status(500).json({ error: 'Failed to get collaboration activity' });
    }
  },
};

