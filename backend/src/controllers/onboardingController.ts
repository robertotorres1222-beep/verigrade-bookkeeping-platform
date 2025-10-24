import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../config/database';

export const onboardingController = {
  // Create onboarding workflow
  async createOnboardingWorkflow(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        name,
        description,
        steps,
        estimatedDuration,
        isActive = true,
      } = req.body;

      if (!name || !steps) {
        return res.status(400).json({ error: 'Name and steps are required' });
      }

      const workflow = await prisma.onboardingWorkflow.create({
        data: {
          organizationId: req.user!.organizationId,
          practiceId: req.body.practiceId,
          name,
          description,
          steps,
          estimatedDuration,
          isActive,
          createdBy: req.user!.id,
        },
      });

      return res.status(201).json({
        message: 'Onboarding workflow created successfully',
        workflow,
      });
    } catch (error: any) {
      console.error('Create onboarding workflow error:', error);
      return res.status(500).json({ error: 'Failed to create onboarding workflow' });
    }
  },

  // Start client onboarding
  async startClientOnboarding(req: AuthenticatedRequest, res: Response) {
    try {
      const { clientId, workflowId } = req.body;

      if (!clientId || !workflowId) {
        return res.status(400).json({ error: 'Client ID and workflow ID are required' });
      }

      const onboarding = await prisma.clientOnboarding.create({
        data: {
          organizationId: req.user!.organizationId,
          practiceId: req.body.practiceId,
          clientId,
          workflowId,
          status: 'IN_PROGRESS',
          startedAt: new Date(),
          assignedTo: req.user!.id,
        },
      });

      return res.status(201).json({
        message: 'Client onboarding started',
        onboarding,
      });
    } catch (error: any) {
      console.error('Start client onboarding error:', error);
      return res.status(500).json({ error: 'Failed to start client onboarding' });
    }
  },

  // Update onboarding step
  async updateOnboardingStep(req: AuthenticatedRequest, res: Response) {
    try {
      const { onboardingId, stepId } = req.params;
      const { completed, notes, attachments = [] } = req.body;

      const onboarding = await prisma.clientOnboarding.findUnique({
        where: { id: onboardingId },
      });

      if (!onboarding) {
        return res.status(404).json({ error: 'Onboarding not found' });
      }

      const updatedOnboarding = await prisma.clientOnboarding.update({
        where: { id: onboardingId },
        data: {
          stepProgress: {
            ...onboarding.stepProgress,
            [stepId]: { completed, notes, attachments, completedAt: completed ? new Date() : null },
          },
          updatedAt: new Date(),
        },
      });

      return res.json({
        message: 'Onboarding step updated',
        onboarding: updatedOnboarding,
      });
    } catch (error: any) {
      console.error('Update onboarding step error:', error);
      return res.status(500).json({ error: 'Failed to update onboarding step' });
    }
  },

  // Complete onboarding
  async completeOnboarding(req: AuthenticatedRequest, res: Response) {
    try {
      const { onboardingId } = req.params;
      const { completionNotes } = req.body;

      const onboarding = await prisma.clientOnboarding.update({
        where: { id: onboardingId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          completionNotes,
        },
      });

      return res.json({
        message: 'Onboarding completed successfully',
        onboarding,
      });
    } catch (error: any) {
      console.error('Complete onboarding error:', error);
      return res.status(500).json({ error: 'Failed to complete onboarding' });
    }
  },

  // Get onboarding templates
  async getOnboardingTemplates(req: AuthenticatedRequest, res: Response) {
    try {
      const { category } = req.query;

      const where: any = { isActive: true };

      if (category) {
        where.category = category;
      }

      // Mock onboarding templates
      const mockTemplates = [
        {
          id: 'template-1',
          name: 'New Business Setup',
          category: 'BUSINESS_SETUP',
          description: 'Complete onboarding for new business clients',
          steps: [
            { id: 1, name: 'Initial consultation', required: true, estimatedTime: 60 },
            { id: 2, name: 'Document collection', required: true, estimatedTime: 30 },
            { id: 3, name: 'Chart of accounts setup', required: true, estimatedTime: 45 },
            { id: 4, name: 'Bank account integration', required: true, estimatedTime: 30 },
            { id: 5, name: 'First month reconciliation', required: true, estimatedTime: 90 },
            { id: 6, name: 'Client training session', required: false, estimatedTime: 60 },
          ],
          estimatedDuration: 315, // minutes
          isActive: true,
        },
        {
          id: 'template-2',
          name: 'Tax Client Onboarding',
          category: 'TAX_CLIENT',
          description: 'Onboarding for tax-only clients',
          steps: [
            { id: 1, name: 'Tax organizer completion', required: true, estimatedTime: 45 },
            { id: 2, name: 'Document gathering', required: true, estimatedTime: 30 },
            { id: 3, name: 'Prior year review', required: true, estimatedTime: 60 },
            { id: 4, name: 'Tax return preparation', required: true, estimatedTime: 120 },
            { id: 5, name: 'Client review and approval', required: true, estimatedTime: 30 },
            { id: 6, name: 'Filing and payment', required: true, estimatedTime: 15 },
          ],
          estimatedDuration: 300, // minutes
          isActive: true,
        },
        {
          id: 'template-3',
          name: 'QuickBooks Migration',
          category: 'DATA_MIGRATION',
          description: 'Migrating client from QuickBooks to new system',
          steps: [
            { id: 1, name: 'Data export from QuickBooks', required: true, estimatedTime: 30 },
            { id: 2, name: 'Data validation and cleanup', required: true, estimatedTime: 90 },
            { id: 3, name: 'Import to new system', required: true, estimatedTime: 45 },
            { id: 4, name: 'Reconciliation verification', required: true, estimatedTime: 60 },
            { id: 5, name: 'Client training on new system', required: true, estimatedTime: 90 },
          ],
          estimatedDuration: 315, // minutes
          isActive: true,
        },
      ];

      const filteredTemplates = mockTemplates.filter(template => {
        if (category && template.category !== category) return false;
        return true;
      });

      return res.json({ templates: filteredTemplates });
    } catch (error: any) {
      console.error('Get onboarding templates error:', error);
      return res.status(500).json({ error: 'Failed to get onboarding templates' });
    }
  },

  // Get onboarding statistics
  async getOnboardingStatistics(req: AuthenticatedRequest, res: Response) {
    try {
      const { practiceId, startDate, endDate } = req.query;

      // Mock statistics
      const statistics = {
        totalOnboardings: 45,
        completedOnboardings: 38,
        inProgressOnboardings: 5,
        pendingOnboardings: 2,
        averageCompletionTime: 4.2, // days
        completionRate: 84.4, // percentage
        onboardingsByTemplate: {
          'BUSINESS_SETUP': 20,
          'TAX_CLIENT': 15,
          'DATA_MIGRATION': 10,
        },
        onboardingsByStatus: {
          'COMPLETED': 38,
          'IN_PROGRESS': 5,
          'PENDING': 2,
        },
        topPerformers: [
          {
            userId: 'user-1',
            name: 'Sarah Johnson',
            onboardings: 15,
            avgTime: 3.8,
          },
          {
            userId: 'user-2',
            name: 'Mike Chen',
            onboardings: 12,
            avgTime: 4.1,
          },
        ],
      };

      return res.json({ statistics });
    } catch (error: any) {
      console.error('Get onboarding statistics error:', error);
      return res.status(500).json({ error: 'Failed to get onboarding statistics' });
    }
  },
};

