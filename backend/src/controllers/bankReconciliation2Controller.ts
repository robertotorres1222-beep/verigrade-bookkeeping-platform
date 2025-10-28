import { Request, Response } from 'express';
import bankReconciliation2Service from '../services/bankReconciliation2Service';

export class BankReconciliation2Controller {
  // Reconcile Transactions
  async reconcileTransactions(req: Request, res: Response) {
    try {
      const { userId, bankAccountId } = req.params;
      const reconciliationData = req.body;

      const result = await bankReconciliation2Service.reconcileTransactions(
        userId,
        bankAccountId,
        reconciliationData
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

  // Detect Timing Differences
  async detectTimingDifferences(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { period } = req.body;

      const result = await bankReconciliation2Service.detectTimingDifferences(
        userId,
        period
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

  // Identify Suspicious Activity
  async identifySuspiciousActivity(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { bankTransactions, bookTransactions } = req.body;

      const result = await bankReconciliation2Service.identifySuspiciousActivity(
        bankTransactions,
        bookTransactions
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

  // Breakout Payment Processor Fees
  async breakoutPaymentProcessorFees(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { transactions } = req.body;

      const result = await bankReconciliation2Service.breakoutPaymentProcessorFees(
        userId,
        transactions
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

  // Calculate Match Confidence
  async calculateMatchConfidence(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { bankTransaction, bookTransaction } = req.body;

      const result = await bankReconciliation2Service.calculateMatchConfidence(
        bankTransaction,
        bookTransaction
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

  // Batch Reconcile Transactions
  async batchReconcileTransactions(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { reconciliationBatch } = req.body;

      const result = await bankReconciliation2Service.batchReconcileTransactions(
        userId,
        reconciliationBatch
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

  // Handle Reconciliation Exceptions
  async handleReconciliationExceptions(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { exceptions } = req.body;

      const result = await bankReconciliation2Service.handleReconciliationExceptions(
        userId,
        exceptions
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

  // Get Reconciliation Dashboard
  async getReconciliationDashboard(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const result = await bankReconciliation2Service.getReconciliationDashboard(userId);

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

export default new BankReconciliation2Controller();










