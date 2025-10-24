import { Request, Response } from 'express';
import { automationService } from '../services/automationService';
import logger from '../utils/logger';

export class AutomationController {
  // ML Categorization
  async categorizeTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { transactionData } = req.body;
      const category = await automationService.categorizeTransaction(transactionData);

      res.json({
        success: true,
        data: { category },
        message: 'Transaction categorized successfully',
      });
    } catch (error) {
      logger.error('Error categorizing transaction', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to categorize transaction',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await automationService.getCategories();

      res.json({
        success: true,
        data: categories,
        message: 'Categories retrieved successfully',
      });
    } catch (error) {
      logger.error('Error retrieving categories', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve categories',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async submitFeedback(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId, category, isCorrect } = req.body;
      await automationService.submitFeedback(transactionId, category, isCorrect);

      res.json({
        success: true,
        message: 'Feedback submitted successfully',
      });
    } catch (error) {
      logger.error('Error submitting feedback', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to submit feedback',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Bank Feed Processing
  async processBankFeed(req: Request, res: Response): Promise<void> {
    try {
      const { feedData } = req.body;
      await automationService.processBankFeed(feedData);

      res.json({
        success: true,
        message: 'Bank feed processed successfully',
      });
    } catch (error) {
      logger.error('Error processing bank feed', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to process bank feed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getBankFeedStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await automationService.getBankFeedStatus();

      res.json({
        success: true,
        data: status,
        message: 'Bank feed status retrieved successfully',
      });
    } catch (error) {
      logger.error('Error retrieving bank feed status', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve bank feed status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Recurring Invoices
  async createRecurringInvoice(req: Request, res: Response): Promise<void> {
    try {
      const recurringInvoice = await automationService.createRecurringInvoice(req.body);

      res.status(201).json({
        success: true,
        data: recurringInvoice,
        message: 'Recurring invoice created successfully',
      });
    } catch (error) {
      logger.error('Error creating recurring invoice', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to create recurring invoice',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getRecurringInvoices(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10 } = req.query;
      const recurringInvoices = await automationService.getRecurringInvoices({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });

      res.json({
        success: true,
        data: recurringInvoices,
        message: 'Recurring invoices retrieved successfully',
      });
    } catch (error) {
      logger.error('Error retrieving recurring invoices', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve recurring invoices',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updateRecurringInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const recurringInvoice = await automationService.updateRecurringInvoice(id, req.body);

      res.json({
        success: true,
        data: recurringInvoice,
        message: 'Recurring invoice updated successfully',
      });
    } catch (error) {
      logger.error('Error updating recurring invoice', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to update recurring invoice',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async deleteRecurringInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await automationService.deleteRecurringInvoice(id);

      res.json({
        success: true,
        message: 'Recurring invoice deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting recurring invoice', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to delete recurring invoice',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Approval Workflows
  async createWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const workflow = await automationService.createApprovalWorkflow(req.body);

      res.status(201).json({
        success: true,
        data: workflow,
        message: 'Workflow created successfully',
      });
    } catch (error) {
      logger.error('Error creating workflow', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to create workflow',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getWorkflows(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10 } = req.query;
      const workflows = await automationService.getWorkflows({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });

      res.json({
        success: true,
        data: workflows,
        message: 'Workflows retrieved successfully',
      });
    } catch (error) {
      logger.error('Error retrieving workflows', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve workflows',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async executeWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { data } = req.body;
      const result = await automationService.executeWorkflow(id, data);

      res.json({
        success: true,
        data: result,
        message: 'Workflow executed successfully',
      });
    } catch (error) {
      logger.error('Error executing workflow', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to execute workflow',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const automationController = new AutomationController();