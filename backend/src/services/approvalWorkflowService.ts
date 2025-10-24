import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class ApprovalWorkflowService {
  /**
   * Create approval workflow
   */
  async createApprovalWorkflow(companyId: string, workflowData: any): Promise<any> {
    try {
      const workflow = await prisma.approvalWorkflow.create({
        data: {
          companyId,
          workflowName: workflowData.workflowName,
          workflowDescription: workflowData.workflowDescription,
          workflowType: workflowData.workflowType, // 'invoice', 'expense', 'payment', 'purchase_order'
          workflowSteps: JSON.stringify(workflowData.workflowSteps),
          conditions: JSON.stringify(workflowData.conditions || []),
          isActive: workflowData.isActive !== false,
          createdBy: workflowData.createdBy,
          createdAt: new Date()
        }
      });

      return workflow;
    } catch (error) {
      logger.error('Error creating approval workflow:', error);
      throw error;
    }
  }

  /**
   * Update approval workflow
   */
  async updateApprovalWorkflow(workflowId: string, companyId: string, updateData: any): Promise<any> {
    try {
      const workflow = await prisma.approvalWorkflow.update({
        where: { 
          id: workflowId,
          companyId 
        },
        data: {
          ...updateData,
          updatedAt: new Date()
        }
      });

      return workflow;
    } catch (error) {
      logger.error('Error updating approval workflow:', error);
      throw error;
    }
  }

  /**
   * Delete approval workflow
   */
  async deleteApprovalWorkflow(workflowId: string, companyId: string): Promise<any> {
    try {
      const workflow = await prisma.approvalWorkflow.delete({
        where: { 
          id: workflowId,
          companyId 
        }
      });

      return workflow;
    } catch (error) {
      logger.error('Error deleting approval workflow:', error);
      throw error;
    }
  }

  /**
   * Get approval workflows
   */
  async getApprovalWorkflows(companyId: string): Promise<any> {
    try {
      const workflows = await prisma.approvalWorkflow.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' }
      });

      return workflows;
    } catch (error) {
      logger.error('Error getting approval workflows:', error);
      throw error;
    }
  }

  /**
   * Create approval request
   */
  async createApprovalRequest(companyId: string, requestData: any): Promise<any> {
    try {
      // Find applicable workflow
      const workflow = await this.findApplicableWorkflow(companyId, requestData);
      
      if (!workflow) {
        throw new Error('No applicable workflow found');
      }

      // Create approval request
      const request = await prisma.approvalRequest.create({
        data: {
          companyId,
          workflowId: workflow.id,
          requestType: requestData.requestType,
          requestData: JSON.stringify(requestData.requestData),
          requestorId: requestData.requestorId,
          status: 'pending',
          currentStep: 0,
          totalSteps: JSON.parse(workflow.workflowSteps).length,
          priority: requestData.priority || 'medium',
          dueDate: requestData.dueDate ? new Date(requestData.dueDate) : null,
          createdAt: new Date()
        }
      });

      // Process first step
      await this.processWorkflowStep(request.id, companyId);

      return request;
    } catch (error) {
      logger.error('Error creating approval request:', error);
      throw error;
    }
  }

  /**
   * Find applicable workflow
   */
  private async findApplicableWorkflow(companyId: string, requestData: any): Promise<any> {
    try {
      const workflows = await prisma.approvalWorkflow.findMany({
        where: { 
          companyId,
          isActive: true,
          workflowType: requestData.requestType
        }
      });

      for (const workflow of workflows) {
        const conditions = JSON.parse(workflow.conditions);
        if (this.evaluateConditions(requestData, conditions)) {
          return workflow;
        }
      }

      return null;
    } catch (error) {
      logger.error('Error finding applicable workflow:', error);
      return null;
    }
  }

  /**
   * Evaluate workflow conditions
   */
  private evaluateConditions(requestData: any, conditions: any[]): boolean {
    try {
      for (const condition of conditions) {
        const field = condition.field;
        const operator = condition.operator;
        const value = condition.value;
        
        let requestValue;
        switch (field) {
          case 'amount':
            requestValue = requestData.requestData.amount;
            break;
          case 'department':
            requestValue = requestData.requestData.departmentId;
            break;
          case 'vendor':
            requestValue = requestData.requestData.vendorId;
            break;
          case 'category':
            requestValue = requestData.requestData.category;
            break;
          default:
            continue;
        }
        
        if (!this.evaluateCondition(requestValue, operator, value)) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      logger.error('Error evaluating conditions:', error);
      return false;
    }
  }

  /**
   * Evaluate single condition
   */
  private evaluateCondition(requestValue: any, operator: string, ruleValue: any): boolean {
    switch (operator) {
      case 'equals':
        return requestValue === ruleValue;
      case 'not_equals':
        return requestValue !== ruleValue;
      case 'greater_than':
        return Number(requestValue) > Number(ruleValue);
      case 'less_than':
        return Number(requestValue) < Number(ruleValue);
      case 'greater_than_or_equal':
        return Number(requestValue) >= Number(ruleValue);
      case 'less_than_or_equal':
        return Number(requestValue) <= Number(ruleValue);
      case 'contains':
        return (requestValue || '').toLowerCase().includes(ruleValue.toLowerCase());
      case 'not_contains':
        return !(requestValue || '').toLowerCase().includes(ruleValue.toLowerCase());
      default:
        return false;
    }
  }

  /**
   * Process workflow step
   */
  private async processWorkflowStep(requestId: string, companyId: string): Promise<void> {
    try {
      const request = await prisma.approvalRequest.findFirst({
        where: { id: requestId, companyId },
        include: { workflow: true }
      });

      if (!request) {
        throw new Error('Approval request not found');
      }

      const workflowSteps = JSON.parse(request.workflow.workflowSteps);
      const currentStep = workflowSteps[request.currentStep];

      if (!currentStep) {
        // Workflow completed
        await prisma.approvalRequest.update({
          where: { id: requestId },
          data: { 
            status: 'approved',
            completedAt: new Date()
          }
        });
        return;
      }

      // Create approval step
      const approvalStep = await prisma.approvalStep.create({
        data: {
          requestId,
          stepNumber: request.currentStep + 1,
          stepName: currentStep.stepName,
          approverId: currentStep.approverId,
          approverType: currentStep.approverType, // 'user', 'role', 'department'
          isRequired: currentStep.isRequired !== false,
          dueDate: currentStep.dueDate ? new Date(currentStep.dueDate) : null,
          status: 'pending',
          createdAt: new Date()
        }
      });

      // Send notification to approver
      await this.sendApprovalNotification(approvalStep.id, companyId);

    } catch (error) {
      logger.error('Error processing workflow step:', error);
      throw error;
    }
  }

  /**
   * Send approval notification
   */
  private async sendApprovalNotification(stepId: string, companyId: string): Promise<void> {
    try {
      // This would integrate with notification service
      // For now, just log the notification
      logger.info(`Approval notification sent for step ${stepId}`);
    } catch (error) {
      logger.error('Error sending approval notification:', error);
    }
  }

  /**
   * Approve step
   */
  async approveStep(stepId: string, companyId: string, approvalData: any): Promise<any> {
    try {
      const step = await prisma.approvalStep.findFirst({
        where: { id: stepId },
        include: { request: true }
      });

      if (!step) {
        throw new Error('Approval step not found');
      }

      // Update step
      const updatedStep = await prisma.approvalStep.update({
        where: { id: stepId },
        data: {
          status: 'approved',
          approvedAt: new Date(),
          approvedBy: approvalData.approvedBy,
          approvalNotes: approvalData.approvalNotes
        }
      });

      // Process next step
      await this.processNextStep(step.requestId, companyId);

      return updatedStep;
    } catch (error) {
      logger.error('Error approving step:', error);
      throw error;
    }
  }

  /**
   * Reject step
   */
  async rejectStep(stepId: string, companyId: string, rejectionData: any): Promise<any> {
    try {
      const step = await prisma.approvalStep.findFirst({
        where: { id: stepId },
        include: { request: true }
      });

      if (!step) {
        throw new Error('Approval step not found');
      }

      // Update step
      const updatedStep = await prisma.approvalStep.update({
        where: { id: stepId },
        data: {
          status: 'rejected',
          rejectedAt: new Date(),
          rejectedBy: rejectionData.rejectedBy,
          rejectionReason: rejectionData.rejectionReason
        }
      });

      // Update request status
      await prisma.approvalRequest.update({
        where: { id: step.requestId },
        data: { 
          status: 'rejected',
          completedAt: new Date()
        }
      });

      return updatedStep;
    } catch (error) {
      logger.error('Error rejecting step:', error);
      throw error;
    }
  }

  /**
   * Process next step
   */
  private async processNextStep(requestId: string, companyId: string): Promise<void> {
    try {
      const request = await prisma.approvalRequest.findFirst({
        where: { id: requestId, companyId },
        include: { workflow: true }
      });

      if (!request) {
        throw new Error('Approval request not found');
      }

      // Update current step
      const updatedRequest = await prisma.approvalRequest.update({
        where: { id: requestId },
        data: { currentStep: request.currentStep + 1 }
      });

      // Process next step
      await this.processWorkflowStep(requestId, companyId);

    } catch (error) {
      logger.error('Error processing next step:', error);
      throw error;
    }
  }

  /**
   * Get approval requests
   */
  async getApprovalRequests(companyId: string, filters: any = {}): Promise<any> {
    try {
      const whereClause: any = { companyId };
      
      if (filters.status) {
        whereClause.status = filters.status;
      }
      
      if (filters.requestType) {
        whereClause.requestType = filters.requestType;
      }
      
      if (filters.requestorId) {
        whereClause.requestorId = filters.requestorId;
      }

      const requests = await prisma.approvalRequest.findMany({
        where: whereClause,
        include: {
          workflow: true,
          steps: {
            orderBy: { stepNumber: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return requests;
    } catch (error) {
      logger.error('Error getting approval requests:', error);
      throw error;
    }
  }

  /**
   * Get approval dashboard
   */
  async getApprovalDashboard(companyId: string): Promise<any> {
    try {
      const [
        requestStats,
        recentRequests,
        pendingApprovals,
        workflowStats
      ] = await Promise.all([
        this.getRequestStats(companyId),
        this.getRecentRequests(companyId),
        this.getPendingApprovals(companyId),
        this.getWorkflowStats(companyId)
      ]);

      return {
        requestStats,
        recentRequests,
        pendingApprovals,
        workflowStats
      };
    } catch (error) {
      logger.error('Error getting approval dashboard:', error);
      throw error;
    }
  }

  /**
   * Get request statistics
   */
  private async getRequestStats(companyId: string): Promise<any> {
    try {
      const stats = await prisma.$queryRaw`
        SELECT 
          COUNT(*) as total_requests,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_requests,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_requests,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_requests,
          COUNT(CASE WHEN request_type = 'invoice' THEN 1 END) as invoice_requests,
          COUNT(CASE WHEN request_type = 'expense' THEN 1 END) as expense_requests,
          COUNT(CASE WHEN request_type = 'payment' THEN 1 END) as payment_requests,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_requests
        FROM approval_requests
        WHERE company_id = ${companyId}
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      `;

      return stats[0];
    } catch (error) {
      logger.error('Error getting request stats:', error);
      throw error;
    }
  }

  /**
   * Get recent requests
   */
  private async getRecentRequests(companyId: string): Promise<any> {
    try {
      const requests = await prisma.approvalRequest.findMany({
        where: { companyId },
        include: {
          workflow: true,
          steps: {
            orderBy: { stepNumber: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      return requests;
    } catch (error) {
      logger.error('Error getting recent requests:', error);
      return [];
    }
  }

  /**
   * Get pending approvals
   */
  private async getPendingApprovals(companyId: string): Promise<any> {
    try {
      const approvals = await prisma.approvalStep.findMany({
        where: { 
          status: 'pending',
          request: { companyId }
        },
        include: {
          request: {
            include: {
              workflow: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return approvals;
    } catch (error) {
      logger.error('Error getting pending approvals:', error);
      return [];
    }
  }

  /**
   * Get workflow statistics
   */
  private async getWorkflowStats(companyId: string): Promise<any> {
    try {
      const stats = await prisma.$queryRaw`
        SELECT 
          COUNT(*) as total_workflows,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_workflows,
          COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_workflows,
          COUNT(CASE WHEN workflow_type = 'invoice' THEN 1 END) as invoice_workflows,
          COUNT(CASE WHEN workflow_type = 'expense' THEN 1 END) as expense_workflows,
          COUNT(CASE WHEN workflow_type = 'payment' THEN 1 END) as payment_workflows
        FROM approval_workflows
        WHERE company_id = ${companyId}
      `;

      return stats[0];
    } catch (error) {
      logger.error('Error getting workflow stats:', error);
      throw error;
    }
  }

  /**
   * Get approval analytics
   */
  async getApprovalAnalytics(companyId: string): Promise<any> {
    try {
      const analytics = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('week', created_at) as week,
          COUNT(*) as total_requests,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_requests,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_requests,
          AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/3600) as avg_processing_hours
        FROM approval_requests
        WHERE company_id = ${companyId}
        AND created_at >= CURRENT_DATE - INTERVAL '12 weeks'
        GROUP BY DATE_TRUNC('week', created_at)
        ORDER BY week DESC
      `;

      return analytics;
    } catch (error) {
      logger.error('Error getting approval analytics:', error);
      return [];
    }
  }
}