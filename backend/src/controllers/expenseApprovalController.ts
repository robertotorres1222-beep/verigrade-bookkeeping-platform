import { Request, Response } from 'express';
import expenseApprovalService from '../services/expenseApprovalService';

export class ExpenseApprovalController {
  // Create Approval Workflow
  async createApprovalWorkflow(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const workflowData = req.body;

      const result = await expenseApprovalService.createApprovalWorkflow(
        userId,
        workflowData
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Process Expense Approval
  async processExpenseApproval(req: Request, res: Response) {
    try {
      const { userId, expenseId } = req.params;
      const approvalData = req.body;

      const result = await expenseApprovalService.processExpenseApproval(
        userId,
        expenseId,
        approvalData
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Delegate Approval
  async delegateApproval(req: Request, res: Response) {
    try {
      const { userId, approvalId } = req.params;
      const delegationData = req.body;

      const result = await expenseApprovalService.delegateApproval(
        userId,
        approvalId,
        delegationData
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Enforce Expense Policy
  async enforceExpensePolicy(req: Request, res: Response) {
    try {
      const { userId, expenseId } = req.params;

      const result = await expenseApprovalService.enforceExpensePolicy(
        userId,
        expenseId
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Send Approval Notifications
  async sendApprovalNotifications(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { approval } = req.body;

      const result = await expenseApprovalService.sendApprovalNotifications(
        approval
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Reject Expense
  async rejectExpense(req: Request, res: Response) {
    try {
      const { approvalId } = req.params;
      const rejectionData = req.body;

      const result = await expenseApprovalService.rejectExpense(
        approvalId,
        rejectionData
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get Approval Dashboard
  async getApprovalDashboard(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const result = await expenseApprovalService.getApprovalDashboard(userId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Bulk Approve Expenses
  async bulkApproveExpenses(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { expenseIds, approvalData } = req.body;

      const result = await expenseApprovalService.bulkApproveExpenses(
        userId,
        expenseIds,
        approvalData
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get Approval Analytics
  async getApprovalAnalytics(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { period } = req.query;

      const result = await expenseApprovalService.getApprovalAnalytics(
        userId,
        period as any
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new ExpenseApprovalController();







