import { Request, Response } from 'express';
import ReconciliationService from '../services/reconciliationService';
import logger from '../utils/logger';

export const createReconciliationSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { accountId, startDate, endDate } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    if (!accountId || !startDate || !endDate) {
      res.status(400).json({
        success: false,
        message: 'Account ID, start date, and end date are required'
      });
      return;
    }

    const session = await ReconciliationService.createReconciliationSession(
      accountId,
      userId,
      new Date(startDate),
      new Date(endDate)
    );

    res.status(201).json({
      success: true,
      message: 'Reconciliation session created successfully',
      session
    });
  } catch (error: any) {
    logger.error('Error creating reconciliation session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create reconciliation session',
      error: error.message
    });
  }
};

export const performAutomatedReconciliation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const result = await ReconciliationService.performAutomatedReconciliation(sessionId, userId);

    res.status(200).json({
      success: true,
      message: 'Automated reconciliation completed successfully',
      result
    });
  } catch (error: any) {
    logger.error('Error performing automated reconciliation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform automated reconciliation',
      error: error.message
    });
  }
};

export const createManualMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { bankTransactionId, bookTransactionId, notes } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    if (!bankTransactionId || !bookTransactionId) {
      res.status(400).json({
        success: false,
        message: 'Bank transaction ID and book transaction ID are required'
      });
      return;
    }

    const match = await ReconciliationService.createManualMatch(
      sessionId,
      bankTransactionId,
      bookTransactionId,
      userId,
      notes
    );

    res.status(201).json({
      success: true,
      message: 'Manual match created successfully',
      match
    });
  } catch (error: any) {
    logger.error('Error creating manual match:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create manual match',
      error: error.message
    });
  }
};

export const createReconciliationRule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, conditions, actions, priority } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    if (!name || !description || !conditions || !actions) {
      res.status(400).json({
        success: false,
        message: 'Name, description, conditions, and actions are required'
      });
      return;
    }

    const rule = await ReconciliationService.createReconciliationRule(
      userId,
      name,
      description,
      conditions,
      actions,
      priority
    );

    res.status(201).json({
      success: true,
      message: 'Reconciliation rule created successfully',
      rule
    });
  } catch (error: any) {
    logger.error('Error creating reconciliation rule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create reconciliation rule',
      error: error.message
    });
  }
};

export const applyReconciliationRules = async (req: Request, res: Response): Promise<void> => {
  try {
    const { transactionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const result = await ReconciliationService.applyReconciliationRules(transactionId, userId);

    res.status(200).json({
      success: true,
      message: 'Reconciliation rules applied successfully',
      result
    });
  } catch (error: any) {
    logger.error('Error applying reconciliation rules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply reconciliation rules',
      error: error.message
    });
  }
};

export const generateReconciliationReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const report = await ReconciliationService.generateReconciliationReport(sessionId, userId);

    res.status(200).json({
      success: true,
      report
    });
  } catch (error: any) {
    logger.error('Error generating reconciliation report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate reconciliation report',
      error: error.message
    });
  }
};

export const getReconciliationSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { accountId, limit = 50, offset = 0 } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const sessions = await ReconciliationService.getReconciliationSessions(
      userId,
      accountId as string,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.status(200).json({
      success: true,
      sessions
    });
  } catch (error: any) {
    logger.error('Error getting reconciliation sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reconciliation sessions',
      error: error.message
    });
  }
};










