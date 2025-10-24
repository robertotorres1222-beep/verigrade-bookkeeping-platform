import { Request, Response } from 'express';
import { ApprovalWorkflowService } from '../services/approvalWorkflowService';
import { logger } from '../utils/logger';

const approvalWorkflowService = new ApprovalWorkflowService();

export class ApprovalWorkflowController {
  /**
   * Create approval workflow
   */
  async createApprovalWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const workflowData = req.body;

      if (!workflowData.workflowName || !workflowData.workflowType || !workflowData.workflowSteps) {
        res.status(400).json({
          success: false,
          message: 'Workflow name, type, and steps are required'
        });
        return;
      }

      const workflow = await approvalWorkflowService.createApprovalWorkflow(companyId, workflowData);

      res.json({
        success: true,
        data: workflow
      });
    } catch (error) {
      logger.error('Error creating approval workflow:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating approval workflow',
        error: error.message
      });
    }
  }

  /**
   * Update approval workflow
   */
  async updateApprovalWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { workflowId } = req.params;
      const updateData = req.body;

      if (!workflowId) {
        res.status(400).json({
          success: false,
          message: 'Workflow ID is required'
        });
        return;
      }

      const workflow = await approvalWorkflowService.updateApprovalWorkflow(workflowId, companyId, updateData);

      res.json({
        success: true,
        data: workflow
      });
    } catch (error) {
      logger.error('Error updating approval workflow:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating approval workflow',
        error: error.message
      });
    }
  }

  /**
   * Delete approval workflow
   */
  async deleteApprovalWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { workflowId } = req.params;

      if (!workflowId) {
        res.status(400).json({
          success: false,
          message: 'Workflow ID is required'
        });
        return;
      }

      const workflow = await approvalWorkflowService.deleteApprovalWorkflow(workflowId, companyId);

      res.json({
        success: true,
        data: workflow
      });
    } catch (error) {
      logger.error('Error deleting approval workflow:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting approval workflow',
        error: error.message
      });
    }
  }

  /**
   * Get approval workflows
   */
  async getApprovalWorkflows(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const workflows = await approvalWorkflowService.getApprovalWorkflows(companyId);

      res.json({
        success: true,
        data: workflows
      });
    } catch (error) {
      logger.error('Error getting approval workflows:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting approval workflows',
        error: error.message
      });
    }
  }

  /**
   * Create approval request
   */
  async createApprovalRequest(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const requestData = req.body;

      if (!requestData.requestType || !requestData.requestData) {
        res.status(400).json({
          success: false,
          message: 'Request type and data are required'
        });
        return;
      }

      const request = await approvalWorkflowService.createApprovalRequest(companyId, requestData);

      res.json({
        success: true,
        data: request
      });
    } catch (error) {
      logger.error('Error creating approval request:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating approval request',
        error: error.message
      });
    }
  }

  /**
   * Get approval requests
   */
  async getApprovalRequests(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { status, requestType, requestorId } = req.query;

      const filters = {
        status,
        requestType,
        requestorId
      };

      const requests = await approvalWorkflowService.getApprovalRequests(companyId, filters);

      res.json({
        success: true,
        data: requests
      });
    } catch (error) {
      logger.error('Error getting approval requests:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting approval requests',
        error: error.message
      });
    }
  }

  /**
   * Approve step
   */
  async approveStep(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { stepId } = req.params;
      const approvalData = req.body;

      if (!stepId) {
        res.status(400).json({
          success: false,
          message: 'Step ID is required'
        });
        return;
      }

      const step = await approvalWorkflowService.approveStep(stepId, companyId, approvalData);

      res.json({
        success: true,
        data: step
      });
    } catch (error) {
      logger.error('Error approving step:', error);
      res.status(500).json({
        success: false,
        message: 'Error approving step',
        error: error.message
      });
    }
  }

  /**
   * Reject step
   */
  async rejectStep(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { stepId } = req.params;
      const rejectionData = req.body;

      if (!stepId) {
        res.status(400).json({
          success: false,
          message: 'Step ID is required'
        });
        return;
      }

      const step = await approvalWorkflowService.rejectStep(stepId, companyId, rejectionData);

      res.json({
        success: true,
        data: step
      });
    } catch (error) {
      logger.error('Error rejecting step:', error);
      res.status(500).json({
        success: false,
        message: 'Error rejecting step',
        error: error.message
      });
    }
  }

  /**
   * Get approval dashboard
   */
  async getApprovalDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await approvalWorkflowService.getApprovalDashboard(companyId);

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      logger.error('Error getting approval dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting approval dashboard',
        error: error.message
      });
    }
  }

  /**
   * Get request statistics
   */
  async getRequestStats(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await approvalWorkflowService.getApprovalDashboard(companyId);
      const requestStats = dashboard.requestStats;

      res.json({
        success: true,
        data: requestStats
      });
    } catch (error) {
      logger.error('Error getting request stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting request stats',
        error: error.message
      });
    }
  }

  /**
   * Get recent requests
   */
  async getRecentRequests(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { limit = '10' } = req.query;

      const dashboard = await approvalWorkflowService.getApprovalDashboard(companyId);
      const recentRequests = dashboard.recentRequests;

      res.json({
        success: true,
        data: recentRequests
      });
    } catch (error) {
      logger.error('Error getting recent requests:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting recent requests',
        error: error.message
      });
    }
  }

  /**
   * Get pending approvals
   */
  async getPendingApprovals(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await approvalWorkflowService.getApprovalDashboard(companyId);
      const pendingApprovals = dashboard.pendingApprovals;

      res.json({
        success: true,
        data: pendingApprovals
      });
    } catch (error) {
      logger.error('Error getting pending approvals:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting pending approvals',
        error: error.message
      });
    }
  }

  /**
   * Get workflow statistics
   */
  async getWorkflowStats(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await approvalWorkflowService.getApprovalDashboard(companyId);
      const workflowStats = dashboard.workflowStats;

      res.json({
        success: true,
        data: workflowStats
      });
    } catch (error) {
      logger.error('Error getting workflow stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting workflow stats',
        error: error.message
      });
    }
  }

  /**
   * Get approval analytics
   */
  async getApprovalAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const analytics = await approvalWorkflowService.getApprovalAnalytics(companyId);

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('Error getting approval analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting approval analytics',
        error: error.message
      });
    }
  }

  /**
   * Get approval insights
   */
  async getApprovalInsights(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await approvalWorkflowService.getApprovalDashboard(companyId);
      const insights = this.generateApprovalInsights(dashboard);

      res.json({
        success: true,
        data: insights
      });
    } catch (error) {
      logger.error('Error getting approval insights:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting approval insights',
        error: error.message
      });
    }
  }

  /**
   * Generate approval insights
   */
  private generateApprovalInsights(dashboard: any): any[] {
    const insights = [];

    // Pending requests insight
    if (dashboard.requestStats.pending_requests > 10) {
      insights.push({
        type: 'pending_requests',
        priority: 'high',
        title: 'High Number of Pending Requests',
        description: `${dashboard.requestStats.pending_requests} requests are pending approval. Consider reviewing and processing them.`,
        action: 'Review and process pending approval requests',
        impact: 'High - affects business operations and cash flow'
      });
    }

    // Rejection rate insight
    const totalProcessed = dashboard.requestStats.approved_requests + dashboard.requestStats.rejected_requests;
    if (totalProcessed > 0) {
      const rejectionRate = (dashboard.requestStats.rejected_requests / totalProcessed) * 100;
      if (rejectionRate > 30) {
        insights.push({
          type: 'rejection_rate',
          priority: 'medium',
          title: 'High Rejection Rate',
          description: `${rejectionRate.toFixed(1)}% of requests are being rejected. Consider reviewing approval criteria.`,
          action: 'Review approval criteria and workflow configurations',
          impact: 'Medium - affects approval efficiency'
        });
      }
    }

    // Workflow efficiency insight
    if (dashboard.workflowStats.active_workflows < dashboard.workflowStats.total_workflows) {
      insights.push({
        type: 'workflow_efficiency',
        priority: 'low',
        title: 'Inactive Workflows Detected',
        description: `${dashboard.workflowStats.inactive_workflows} workflows are inactive. Consider cleaning up unused workflows.`,
        action: 'Review and clean up inactive workflows',
        impact: 'Low - affects workflow management efficiency'
      });
    }

    // Request type distribution insight
    const totalRequests = dashboard.requestStats.total_requests;
    if (totalRequests > 0) {
      const invoicePercentage = (dashboard.requestStats.invoice_requests / totalRequests) * 100;
      if (invoicePercentage > 70) {
        insights.push({
          type: 'request_distribution',
          priority: 'low',
          title: 'High Invoice Request Percentage',
          description: `${invoicePercentage.toFixed(1)}% of requests are invoices. Consider optimizing invoice approval workflows.`,
          action: 'Review and optimize invoice approval workflows',
          impact: 'Low - affects workflow optimization'
        });
      }
    }

    return insights;
  }
}