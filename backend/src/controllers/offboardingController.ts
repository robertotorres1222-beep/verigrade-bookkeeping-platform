import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../config/database';

export const offboardingController = {
  // Start client offboarding
  async startClientOffboarding(req: AuthenticatedRequest, res: Response) {
    try {
      const { clientId, reason, effectiveDate, notes } = req.body;

      if (!clientId || !reason || !effectiveDate) {
        return res.status(400).json({ error: 'Client ID, reason, and effective date are required' });
      }

      const offboarding = await prisma.clientOffboarding.create({
        data: {
          organizationId: req.user!.organizationId,
          practiceId: req.body.practiceId,
          clientId,
          reason,
          effectiveDate: new Date(effectiveDate),
          notes,
          status: 'IN_PROGRESS',
          startedAt: new Date(),
          initiatedBy: req.user!.id,
        },
      });

      return res.status(201).json({
        message: 'Client offboarding started',
        offboarding,
      });
    } catch (error: any) {
      console.error('Start client offboarding error:', error);
      return res.status(500).json({ error: 'Failed to start client offboarding' });
    }
  },

  // Get offboarding processes
  async getOffboardingProcesses(req: AuthenticatedRequest, res: Response) {
    try {
      const { status, reason, page = 1, limit = 20 } = req.query;

      const where: any = {
        organizationId: req.user!.organizationId,
      };

      if (status) {
        where.status = status;
      }

      if (reason) {
        where.reason = reason;
      }

      // Mock offboarding processes
      const mockOffboardings = [
        {
          id: 'offboard-1',
          clientId: 'client-1',
          clientName: 'TechStart Inc',
          reason: 'CLIENT_REQUEST',
          effectiveDate: '2024-02-15',
          status: 'IN_PROGRESS',
          progress: 60,
          startedAt: '2024-01-20T10:00:00Z',
          initiatedBy: 'Sarah Johnson',
          tasksCompleted: 6,
          totalTasks: 10,
        },
        {
          id: 'offboard-2',
          clientId: 'client-2',
          clientName: 'ABC Consulting',
          reason: 'NON_PAYMENT',
          effectiveDate: '2024-01-31',
          status: 'COMPLETED',
          progress: 100,
          startedAt: '2024-01-15T14:30:00Z',
          completedAt: '2024-01-25T16:45:00Z',
          initiatedBy: 'Mike Chen',
          tasksCompleted: 8,
          totalTasks: 8,
        },
        {
          id: 'offboard-3',
          clientId: 'client-3',
          clientName: 'XYZ Corp',
          reason: 'SERVICE_TERMINATION',
          effectiveDate: '2024-03-01',
          status: 'PENDING',
          progress: 0,
          startedAt: '2024-01-22T09:15:00Z',
          initiatedBy: 'Sarah Johnson',
          tasksCompleted: 0,
          totalTasks: 12,
        },
      ];

      const filteredOffboardings = mockOffboardings.filter(offboard => {
        if (status && offboard.status !== status) return false;
        if (reason && offboard.reason !== reason) return false;
        return true;
      });

      return res.json({
        offboardings: filteredOffboardings,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: filteredOffboardings.length,
          pages: Math.ceil(filteredOffboardings.length / Number(limit)),
        },
      });
    } catch (error: any) {
      console.error('Get offboarding processes error:', error);
      return res.status(500).json({ error: 'Failed to get offboarding processes' });
    }
  },

  // Update offboarding task
  async updateOffboardingTask(req: AuthenticatedRequest, res: Response) {
    try {
      const { offboardingId, taskId } = req.params;
      const { completed, notes, attachments = [] } = req.body;

      const offboarding = await prisma.clientOffboarding.findUnique({
        where: { id: offboardingId },
      });

      if (!offboarding) {
        return res.status(404).json({ error: 'Offboarding process not found' });
      }

      const updatedOffboarding = await prisma.clientOffboarding.update({
        where: { id: offboardingId },
        data: {
          taskProgress: {
            ...offboarding.taskProgress,
            [taskId]: { completed, notes, attachments, completedAt: completed ? new Date() : null },
          },
          updatedAt: new Date(),
        },
      });

      return res.json({
        message: 'Offboarding task updated',
        offboarding: updatedOffboarding,
      });
    } catch (error: any) {
      console.error('Update offboarding task error:', error);
      return res.status(500).json({ error: 'Failed to update offboarding task' });
    }
  },

  // Complete offboarding
  async completeOffboarding(req: AuthenticatedRequest, res: Response) {
    try {
      const { offboardingId } = req.params;
      const { completionNotes, finalDocuments = [] } = req.body;

      const offboarding = await prisma.clientOffboarding.update({
        where: { id: offboardingId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          completionNotes,
          finalDocuments,
        },
      });

      return res.json({
        message: 'Offboarding completed successfully',
        offboarding,
      });
    } catch (error: any) {
      console.error('Complete offboarding error:', error);
      return res.status(500).json({ error: 'Failed to complete offboarding' });
    }
  },

  // Get offboarding templates
  async getOffboardingTemplates(req: AuthenticatedRequest, res: Response) {
    try {
      const { reason, isActive } = req.query;

      const where: any = {};

      if (reason) {
        where.reason = reason;
      }

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      // Mock offboarding templates
      const mockTemplates = [
        {
          id: 'template-1',
          name: 'Standard Client Offboarding',
          reason: 'CLIENT_REQUEST',
          description: 'Standard offboarding process for client-initiated termination',
          tasks: [
            { id: 1, name: 'Final invoice generation', required: true, estimatedTime: 30 },
            { id: 2, name: 'Data backup and export', required: true, estimatedTime: 60 },
            { id: 3, name: 'Client notification', required: true, estimatedTime: 15 },
            { id: 4, name: 'File transfer to client', required: true, estimatedTime: 45 },
            { id: 5, name: 'System access revocation', required: true, estimatedTime: 15 },
            { id: 6, name: 'Final reconciliation', required: true, estimatedTime: 90 },
            { id: 7, name: 'Documentation handover', required: true, estimatedTime: 30 },
            { id: 8, name: 'Client satisfaction survey', required: false, estimatedTime: 10 },
          ],
          estimatedDuration: 285, // minutes
          isActive: true,
        },
        {
          id: 'template-2',
          name: 'Non-Payment Offboarding',
          reason: 'NON_PAYMENT',
          description: 'Offboarding process for clients with outstanding balances',
          tasks: [
            { id: 1, name: 'Outstanding balance review', required: true, estimatedTime: 30 },
            { id: 2, name: 'Final collection attempt', required: true, estimatedTime: 45 },
            { id: 3, name: 'Data backup and export', required: true, estimatedTime: 60 },
            { id: 4, name: 'Legal notice preparation', required: true, estimatedTime: 60 },
            { id: 5, name: 'System access revocation', required: true, estimatedTime: 15 },
            { id: 6, name: 'Collection agency handover', required: false, estimatedTime: 30 },
          ],
          estimatedDuration: 240, // minutes
          isActive: true,
        },
        {
          id: 'template-3',
          name: 'Service Termination Offboarding',
          reason: 'SERVICE_TERMINATION',
          description: 'Offboarding process for practice-initiated termination',
          tasks: [
            { id: 1, name: 'Termination notice preparation', required: true, estimatedTime: 30 },
            { id: 2, name: 'Client notification', required: true, estimatedTime: 15 },
            { id: 3, name: 'Final invoice generation', required: true, estimatedTime: 30 },
            { id: 4, name: 'Data backup and export', required: true, estimatedTime: 60 },
            { id: 5, name: 'File transfer to client', required: true, estimatedTime: 45 },
            { id: 6, name: 'System access revocation', required: true, estimatedTime: 15 },
            { id: 7, name: 'Final reconciliation', required: true, estimatedTime: 90 },
            { id: 8, name: 'Documentation handover', required: true, estimatedTime: 30 },
            { id: 9, name: 'Transition support (30 days)', required: false, estimatedTime: 120 },
          ],
          estimatedDuration: 435, // minutes
          isActive: true,
        },
      ];

      const filteredTemplates = mockTemplates.filter(template => {
        if (reason && template.reason !== reason) return false;
        if (isActive !== undefined && template.isActive !== (isActive === 'true')) return false;
        return true;
      });

      return res.json({ templates: filteredTemplates });
    } catch (error: any) {
      console.error('Get offboarding templates error:', error);
      return res.status(500).json({ error: 'Failed to get offboarding templates' });
    }
  },

  // Get offboarding statistics
  async getOffboardingStatistics(req: AuthenticatedRequest, res: Response) {
    try {
      const { practiceId, startDate, endDate } = req.query;

      // Mock statistics
      const statistics = {
        totalOffboardings: 25,
        completedOffboardings: 20,
        inProgressOffboardings: 3,
        pendingOffboardings: 2,
        averageCompletionTime: 3.5, // days
        offboardingsByReason: {
          'CLIENT_REQUEST': 15,
          'NON_PAYMENT': 5,
          'SERVICE_TERMINATION': 3,
          'CONTRACT_EXPIRATION': 2,
        },
        offboardingsByStatus: {
          'COMPLETED': 20,
          'IN_PROGRESS': 3,
          'PENDING': 2,
        },
        averageTasksPerOffboarding: 8.5,
        completionRate: 80.0, // percentage
        topPerformingStaff: [
          {
            userId: 'user-1',
            name: 'Sarah Johnson',
            offboardings: 12,
            avgTime: 3.2,
          },
          {
            userId: 'user-2',
            name: 'Mike Chen',
            offboardings: 8,
            avgTime: 3.8,
          },
        ],
      };

      return res.json({ statistics });
    } catch (error: any) {
      console.error('Get offboarding statistics error:', error);
      return res.status(500).json({ error: 'Failed to get offboarding statistics' });
    }
  },
};

