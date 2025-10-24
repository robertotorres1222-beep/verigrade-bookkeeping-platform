import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../config/database';

export const approvalController = {
  // Create approval workflow
  async createWorkflow(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        name,
        description,
        workflowType,
        steps,
        triggers,
        isActive = true,
      } = req.body;

      if (!name || !workflowType || !steps) {
        return res.status(400).json({ error: 'Name, workflow type, and steps are required' });
      }

      const workflow = await prisma.approvalWorkflow.create({
        data: {
          organizationId: req.user!.organizationId,
          practiceId: req.body.practiceId,
          name,
          description,
          workflowType,
          steps,
          triggers,
          isActive,
          createdBy: req.user!.id,
        },
      });

      return res.status(201).json({
        message: 'Approval workflow created successfully',
        workflow,
      });
    } catch (error: any) {
      console.error('Create approval workflow error:', error);
      return res.status(500).json({ error: 'Failed to create approval workflow' });
    }
  },

  // Get workflows
  async getWorkflows(req: AuthenticatedRequest, res: Response) {
    try {
      const { workflowType, isActive, practiceId } = req.query;

      const where: any = {};

      if (practiceId) {
        where.practiceId = practiceId;
      } else {
        where.organizationId = req.user!.organizationId;
      }

      if (workflowType) {
        where.workflowType = workflowType;
      }

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      // Mock data for demo
      const mockWorkflows = [
        {
          id: 'workflow-1',
          name: 'Large Expense Approval',
          description: 'Approval required for expenses over $1,000',
          workflowType: 'EXPENSE_APPROVAL',
          steps: [
            { order: 1, approver: 'Manager', condition: { amount: { greaterThan: 1000 } } },
            { order: 2, approver: 'Finance Director', condition: { amount: { greaterThan: 5000 } } },
          ],
          triggers: {
            transactionType: 'EXPENSE',
            amount: { greaterThan: 1000 },
          },
          isActive: true,
          totalApprovals: 45,
          avgApprovalTime: 1.5, // days
        },
        {
          id: 'workflow-2',
          name: 'Vendor Payment Approval',
          description: 'Two-step approval for vendor payments',
          workflowType: 'PAYMENT_APPROVAL',
          steps: [
            { order: 1, approver: 'Bookkeeper', condition: {} },
            { order: 2, approver: 'Account Manager', condition: {} },
          ],
          triggers: {
            transactionType: 'PAYMENT',
            vendor: { isNew: false },
          },
          isActive: true,
          totalApprovals: 128,
          avgApprovalTime: 0.8, // days
        },
        {
          id: 'workflow-3',
          name: 'Invoice Review',
          description: 'Review and approve client invoices before sending',
          workflowType: 'INVOICE_APPROVAL',
          steps: [
            { order: 1, approver: 'Senior Accountant', condition: {} },
          ],
          triggers: {
            documentType: 'INVOICE',
            status: 'DRAFT',
          },
          isActive: true,
          totalApprovals: 67,
          avgApprovalTime: 0.3, // days
        },
      ];

      const filteredWorkflows = mockWorkflows.filter(workflow => {
        if (workflowType && workflow.workflowType !== workflowType) return false;
        if (isActive !== undefined && workflow.isActive !== (isActive === 'true')) return false;
        return true;
      });

      return res.json({ workflows: filteredWorkflows });
    } catch (error: any) {
      console.error('Get approval workflows error:', error);
      return res.status(500).json({ error: 'Failed to get approval workflows' });
    }
  },

  // Submit for approval
  async submitForApproval(req: AuthenticatedRequest, res: Response) {
    try {
      const { workflowId, itemId, itemType, metadata = {} } = req.body;

      if (!workflowId || !itemId || !itemType) {
        return res.status(400).json({ error: 'Workflow ID, item ID, and item type are required' });
      }

      const approvalRequest = await prisma.approvalRequest.create({
        data: {
          workflowId,
          itemId,
          itemType,
          metadata,
          submittedBy: req.user!.id,
          currentStep: 1,
          status: 'PENDING',
        },
        include: {
          submittedByUser: {
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
        message: 'Item submitted for approval',
        approvalRequest,
      });
    } catch (error: any) {
      console.error('Submit for approval error:', error);
      return res.status(500).json({ error: 'Failed to submit for approval' });
    }
  },

  // Approve/reject
  async processApproval(req: AuthenticatedRequest, res: Response) {
    try {
      const { approvalId } = req.params;
      const { action, comments } = req.body;

      if (!['APPROVE', 'REJECT'].includes(action)) {
        return res.status(400).json({ error: 'Action must be APPROVE or REJECT' });
      }

      const approvalRequest = await prisma.approvalRequest.findUnique({
        where: { id: approvalId },
      });

      if (!approvalRequest) {
        return res.status(404).json({ error: 'Approval request not found' });
      }

      const updateData: any = {
        updatedAt: new Date(),
      };

      if (action === 'APPROVE') {
        updateData.currentStep = approvalRequest.currentStep + 1;
        updateData.status = 'APPROVED'; // Simplified - in real impl, check if more steps
      } else {
        updateData.status = 'REJECTED';
        updateData.rejectedBy = req.user!.id;
        updateData.rejectedAt = new Date();
        updateData.rejectionComments = comments;
      }

      const updatedRequest = await prisma.approvalRequest.update({
        where: { id: approvalId },
        data: updateData,
      });

      return res.json({
        message: `Approval request ${action.toLowerCase()}d successfully`,
        approvalRequest: updatedRequest,
      });
    } catch (error: any) {
      console.error('Process approval error:', error);
      return res.status(500).json({ error: 'Failed to process approval' });
    }
  },

  // Get pending approvals
  async getPendingApprovals(req: AuthenticatedRequest, res: Response) {
    try {
      const { workflowType, itemType } = req.query;

      const where: any = {
        status: 'PENDING',
      };

      if (workflowType) {
        where.workflow = { workflowType };
      }

      if (itemType) {
        where.itemType = itemType;
      }

      // Mock data for demo
      const mockApprovals = [
        {
          id: 'approval-1',
          workflowId: 'workflow-1',
          workflowName: 'Large Expense Approval',
          itemId: 'expense-123',
          itemType: 'EXPENSE',
          submittedBy: 'John Doe',
          submittedAt: '2024-01-20T10:00:00Z',
          currentStep: 1,
          totalSteps: 2,
          status: 'PENDING',
          metadata: {
            amount: 1500,
            vendor: 'Office Depot',
            category: 'Office Supplies',
          },
        },
        {
          id: 'approval-2',
          workflowId: 'workflow-2',
          workflowName: 'Vendor Payment Approval',
          itemId: 'payment-456',
          itemType: 'PAYMENT',
          submittedBy: 'Jane Smith',
          submittedAt: '2024-01-21T14:30:00Z',
          currentStep: 1,
          totalSteps: 2,
          status: 'PENDING',
          metadata: {
            amount: 850,
            vendor: 'ABC Consulting',
            dueDate: '2024-01-25',
          },
        },
        {
          id: 'approval-3',
          workflowId: 'workflow-3',
          workflowName: 'Invoice Review',
          itemId: 'invoice-789',
          itemType: 'INVOICE',
          submittedBy: 'Mike Chen',
          submittedAt: '2024-01-22T09:15:00Z',
          currentStep: 1,
          totalSteps: 1,
          status: 'PENDING',
          metadata: {
            amount: 2500,
            client: 'TechStart Inc',
            invoiceDate: '2024-01-22',
          },
        },
      ];

      const filteredApprovals = mockApprovals.filter(approval => {
        if (itemType && approval.itemType !== itemType) return false;
        return true;
      });

      return res.json({ approvals: filteredApprovals });
    } catch (error: any) {
      console.error('Get pending approvals error:', error);
      return res.status(500).json({ error: 'Failed to get pending approvals' });
    }
  },

  // Get approval statistics
  async getApprovalStatistics(req: AuthenticatedRequest, res: Response) {
    try {
      const { practiceId, startDate, endDate } = req.query;

      // Mock statistics
      const statistics = {
        totalApprovals: 240,
        pendingApprovals: 15,
        approvedApprovals: 210,
        rejectedApprovals: 15,
        averageApprovalTime: 1.2, // days
        approvalRate: 93.3, // percentage
        approvalsByType: {
          'EXPENSE_APPROVAL': 100,
          'PAYMENT_APPROVAL': 90,
          'INVOICE_APPROVAL': 50,
        },
        topApprovers: [
          {
            userId: 'user-1',
            name: 'Sarah Johnson',
            approvals: 85,
            avgTime: 0.8,
          },
          {
            userId: 'user-2',
            name: 'Mike Chen',
            approvals: 72,
            avgTime: 1.1,
          },
        ],
      };

      return res.json({ statistics });
    } catch (error: any) {
      console.error('Get approval statistics error:', error);
      return res.status(500).json({ error: 'Failed to get approval statistics' });
    }
  },
};

