import { Request, Response } from 'express';
import { bankingService } from '../services/bankingService';
import logger from '../utils/logger';

export class BankingController {
  // Multi-account Management
  async getAccounts(req: Request, res: Response): Promise<void> {
    try {
      const accounts = await bankingService.getAccounts();
      res.json({ success: true, data: accounts, message: 'Accounts retrieved successfully' });
    } catch (error) {
      logger.error('Error retrieving accounts', { error });
      res.status(500).json({ success: false, message: 'Failed to retrieve accounts' });
    }
  }

  async addAccount(req: Request, res: Response): Promise<void> {
    try {
      const account = await bankingService.addAccount(req.body);
      res.status(201).json({ success: true, data: account, message: 'Account added successfully' });
    } catch (error) {
      logger.error('Error adding account', { error });
      res.status(500).json({ success: false, message: 'Failed to add account' });
    }
  }

  async updateAccount(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const account = await bankingService.updateAccount(id, req.body);
      res.json({ success: true, data: account, message: 'Account updated successfully' });
    } catch (error) {
      logger.error('Error updating account', { error });
      res.status(500).json({ success: false, message: 'Failed to update account' });
    }
  }

  // Automated Reconciliation
  async reconcileTransactions(req: Request, res: Response): Promise<void> {
    try {
      const { accountId, startDate, endDate } = req.body;
      const result = await bankingService.reconcileTransactions(accountId, startDate, endDate);
      res.json({ success: true, data: result, message: 'Transactions reconciled successfully' });
    } catch (error) {
      logger.error('Error reconciling transactions', { error });
      res.status(500).json({ success: false, message: 'Failed to reconcile transactions' });
    }
  }

  async getReconciliationStatus(req: Request, res: Response): Promise<void> {
    try {
      const { accountId } = req.query;
      const status = await bankingService.getReconciliationStatus(accountId as string);
      res.json({ success: true, data: status, message: 'Reconciliation status retrieved successfully' });
    } catch (error) {
      logger.error('Error getting reconciliation status', { error });
      res.status(500).json({ success: false, message: 'Failed to get reconciliation status' });
    }
  }

  // Bank Feed Rules
  async createFeedRule(req: Request, res: Response): Promise<void> {
    try {
      const rule = await bankingService.createFeedRule(req.body);
      res.status(201).json({ success: true, data: rule, message: 'Feed rule created successfully' });
    } catch (error) {
      logger.error('Error creating feed rule', { error });
      res.status(500).json({ success: false, message: 'Failed to create feed rule' });
    }
  }

  async getFeedRules(req: Request, res: Response): Promise<void> {
    try {
      const rules = await bankingService.getFeedRules();
      res.json({ success: true, data: rules, message: 'Feed rules retrieved successfully' });
    } catch (error) {
      logger.error('Error retrieving feed rules', { error });
      res.status(500).json({ success: false, message: 'Failed to retrieve feed rules' });
    }
  }

  async updateFeedRule(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const rule = await bankingService.updateFeedRule(id, req.body);
      res.json({ success: true, data: rule, message: 'Feed rule updated successfully' });
    } catch (error) {
      logger.error('Error updating feed rule', { error });
      res.status(500).json({ success: false, message: 'Failed to update feed rule' });
    }
  }

  // Statement Import
  async importStatement(req: Request, res: Response): Promise<void> {
    try {
      const { accountId, file } = req.body;
      const result = await bankingService.importStatement(accountId, file);
      res.json({ success: true, data: result, message: 'Statement imported successfully' });
    } catch (error) {
      logger.error('Error importing statement', { error });
      res.status(500).json({ success: false, message: 'Failed to import statement' });
    }
  }

  async getImportHistory(req: Request, res: Response): Promise<void> {
    try {
      const { accountId } = req.query;
      const history = await bankingService.getImportHistory(accountId as string);
      res.json({ success: true, data: history, message: 'Import history retrieved successfully' });
    } catch (error) {
      logger.error('Error getting import history', { error });
      res.status(500).json({ success: false, message: 'Failed to get import history' });
    }
  }
}

export const bankingController = new BankingController();