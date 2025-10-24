import { Request, Response } from 'express';
import { BankFeedProcessingService } from '../services/bankFeedProcessingService';
import { logger } from '../utils/logger';

const bankFeedProcessingService = new BankFeedProcessingService();

export class BankFeedProcessingController {
  /**
   * Process bank feed
   */
  async processBankFeed(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const feedData = req.body;

      if (!feedData.transactions || !Array.isArray(feedData.transactions)) {
        res.status(400).json({
          success: false,
          message: 'Feed data with transactions array is required'
        });
        return;
      }

      const processingResult = await bankFeedProcessingService.processBankFeed(companyId, feedData);

      res.json({
        success: true,
        data: processingResult
      });
    } catch (error) {
      logger.error('Error processing bank feed:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing bank feed',
        error: error.message
      });
    }
  }

  /**
   * Get bank feed processing dashboard
   */
  async getBankFeedProcessingDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await bankFeedProcessingService.getBankFeedProcessingDashboard(companyId);

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      logger.error('Error getting bank feed processing dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting bank feed processing dashboard',
        error: error.message
      });
    }
  }

  /**
   * Get bank feed connections
   */
  async getBankFeedConnections(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const connections = await bankFeedProcessingService.getBankFeedConnections(companyId);

      res.json({
        success: true,
        data: connections
      });
    } catch (error) {
      logger.error('Error getting bank feed connections:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting bank feed connections',
        error: error.message
      });
    }
  }

  /**
   * Create bank feed connection
   */
  async createBankFeedConnection(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const connectionData = req.body;

      if (!connectionData.bankId || !connectionData.accountNumber) {
        res.status(400).json({
          success: false,
          message: 'Bank ID and account number are required'
        });
        return;
      }

      const connection = await bankFeedProcessingService.createBankFeedConnection(companyId, connectionData);

      res.json({
        success: true,
        data: connection
      });
    } catch (error) {
      logger.error('Error creating bank feed connection:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating bank feed connection',
        error: error.message
      });
    }
  }

  /**
   * Update bank feed connection
   */
  async updateBankFeedConnection(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { connectionId } = req.params;
      const updateData = req.body;

      if (!connectionId) {
        res.status(400).json({
          success: false,
          message: 'Connection ID is required'
        });
        return;
      }

      const connection = await bankFeedProcessingService.updateBankFeedConnection(connectionId, companyId, updateData);

      res.json({
        success: true,
        data: connection
      });
    } catch (error) {
      logger.error('Error updating bank feed connection:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating bank feed connection',
        error: error.message
      });
    }
  }

  /**
   * Delete bank feed connection
   */
  async deleteBankFeedConnection(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { connectionId } = req.params;

      if (!connectionId) {
        res.status(400).json({
          success: false,
          message: 'Connection ID is required'
        });
        return;
      }

      const connection = await bankFeedProcessingService.deleteBankFeedConnection(connectionId, companyId);

      res.json({
        success: true,
        data: connection
      });
    } catch (error) {
      logger.error('Error deleting bank feed connection:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting bank feed connection',
        error: error.message
      });
    }
  }

  /**
   * Get bank feed rules
   */
  async getBankFeedRules(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const rules = await bankFeedProcessingService.getBankFeedRules(companyId);

      res.json({
        success: true,
        data: rules
      });
    } catch (error) {
      logger.error('Error getting bank feed rules:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting bank feed rules',
        error: error.message
      });
    }
  }

  /**
   * Create bank feed rule
   */
  async createBankFeedRule(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const ruleData = req.body;

      if (!ruleData.ruleName || !ruleData.conditions || !ruleData.actions) {
        res.status(400).json({
          success: false,
          message: 'Rule name, conditions, and actions are required'
        });
        return;
      }

      const rule = await bankFeedProcessingService.createBankFeedRule(companyId, ruleData);

      res.json({
        success: true,
        data: rule
      });
    } catch (error) {
      logger.error('Error creating bank feed rule:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating bank feed rule',
        error: error.message
      });
    }
  }

  /**
   * Update bank feed rule
   */
  async updateBankFeedRule(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { ruleId } = req.params;
      const updateData = req.body;

      if (!ruleId) {
        res.status(400).json({
          success: false,
          message: 'Rule ID is required'
        });
        return;
      }

      const rule = await bankFeedProcessingService.updateBankFeedRule(ruleId, companyId, updateData);

      res.json({
        success: true,
        data: rule
      });
    } catch (error) {
      logger.error('Error updating bank feed rule:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating bank feed rule',
        error: error.message
      });
    }
  }

  /**
   * Delete bank feed rule
   */
  async deleteBankFeedRule(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { ruleId } = req.params;

      if (!ruleId) {
        res.status(400).json({
          success: false,
          message: 'Rule ID is required'
        });
        return;
      }

      const rule = await bankFeedProcessingService.deleteBankFeedRule(ruleId, companyId);

      res.json({
        success: true,
        data: rule
      });
    } catch (error) {
      logger.error('Error deleting bank feed rule:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting bank feed rule',
        error: error.message
      });
    }
  }

  /**
   * Test bank feed rule
   */
  async testBankFeedRule(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { ruleData, testTransaction } = req.body;

      if (!ruleData || !testTransaction) {
        res.status(400).json({
          success: false,
          message: 'Rule data and test transaction are required'
        });
        return;
      }

      const testResult = await bankFeedProcessingService.testBankFeedRule(companyId, ruleData, testTransaction);

      res.json({
        success: true,
        data: testResult
      });
    } catch (error) {
      logger.error('Error testing bank feed rule:', error);
      res.status(500).json({
        success: false,
        message: 'Error testing bank feed rule',
        error: error.message
      });
    }
  }

  /**
   * Get processing statistics
   */
  async getProcessingStats(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await bankFeedProcessingService.getBankFeedProcessingDashboard(companyId);
      const processingStats = dashboard.processingStats;

      res.json({
        success: true,
        data: processingStats
      });
    } catch (error) {
      logger.error('Error getting processing stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting processing stats',
        error: error.message
      });
    }
  }

  /**
   * Get recent processing logs
   */
  async getRecentLogs(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;
      const { limit = '10' } = req.query;

      const dashboard = await bankFeedProcessingService.getBankFeedProcessingDashboard(companyId);
      const recentLogs = dashboard.recentLogs;

      res.json({
        success: true,
        data: recentLogs
      });
    } catch (error) {
      logger.error('Error getting recent logs:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting recent logs',
        error: error.message
      });
    }
  }

  /**
   * Get rule statistics
   */
  async getRuleStats(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await bankFeedProcessingService.getBankFeedProcessingDashboard(companyId);
      const ruleStats = dashboard.ruleStats;

      res.json({
        success: true,
        data: ruleStats
      });
    } catch (error) {
      logger.error('Error getting rule stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting rule stats',
        error: error.message
      });
    }
  }

  /**
   * Get error analysis
   */
  async getErrorAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await bankFeedProcessingService.getBankFeedProcessingDashboard(companyId);
      const errorAnalysis = dashboard.errorAnalysis;

      res.json({
        success: true,
        data: errorAnalysis
      });
    } catch (error) {
      logger.error('Error getting error analysis:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting error analysis',
        error: error.message
      });
    }
  }

  /**
   * Get processing insights
   */
  async getProcessingInsights(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.user;

      const dashboard = await bankFeedProcessingService.getBankFeedProcessingDashboard(companyId);
      const insights = this.generateProcessingInsights(dashboard);

      res.json({
        success: true,
        data: insights
      });
    } catch (error) {
      logger.error('Error getting processing insights:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting processing insights',
        error: error.message
      });
    }
  }

  /**
   * Generate processing insights
   */
  private generateProcessingInsights(dashboard: any): any[] {
    const insights = [];

    // Success rate insight
    if (dashboard.processingStats.success_rate < 0.8) {
      insights.push({
        type: 'success_rate',
        priority: 'high',
        title: 'Low Processing Success Rate',
        description: `Current success rate is ${(dashboard.processingStats.success_rate * 100).toFixed(1)}%. Consider reviewing processing rules and error handling.`,
        action: 'Review processing rules and improve error handling',
        impact: 'High - affects data accuracy and processing efficiency'
      });
    }

    // Error rate insight
    if (dashboard.processingStats.error_transactions > 0) {
      insights.push({
        type: 'error_rate',
        priority: 'medium',
        title: 'Processing Errors Detected',
        description: `${dashboard.processingStats.error_transactions} transactions failed to process. Review error logs for details.`,
        action: 'Review error logs and fix processing issues',
        impact: 'Medium - affects data completeness'
      });
    }

    // Duplicate rate insight
    if (dashboard.processingStats.duplicate_transactions > 0) {
      insights.push({
        type: 'duplicate_rate',
        priority: 'low',
        title: 'Duplicate Transactions Detected',
        description: `${dashboard.processingStats.duplicate_transactions} duplicate transactions were filtered out.`,
        action: 'Review duplicate detection logic if needed',
        impact: 'Low - normal operation'
      });
    }

    // Rule efficiency insight
    if (dashboard.ruleStats.total_rules > 0 && dashboard.ruleStats.active_rules < dashboard.ruleStats.total_rules) {
      insights.push({
        type: 'rule_efficiency',
        priority: 'low',
        title: 'Inactive Rules Detected',
        description: `${dashboard.ruleStats.inactive_rules} rules are inactive. Consider cleaning up unused rules.`,
        action: 'Review and clean up inactive rules',
        impact: 'Low - affects rule management efficiency'
      });
    }

    return insights;
  }
}