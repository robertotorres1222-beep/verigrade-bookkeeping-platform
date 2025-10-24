import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class BankFeedProcessingService {
  /**
   * Process bank feed transactions
   */
  async processBankFeed(companyId: string, feedData: any): Promise<any> {
    try {
      const processingResult = {
        totalTransactions: 0,
        processedTransactions: 0,
        duplicateTransactions: 0,
        errorTransactions: 0,
        newTransactions: 0,
        updatedTransactions: 0,
        processingErrors: []
      };

      for (const transaction of feedData.transactions) {
        try {
          processingResult.totalTransactions++;
          
          // Check for duplicates
          const isDuplicate = await this.checkForDuplicate(transaction, companyId);
          if (isDuplicate) {
            processingResult.duplicateTransactions++;
            continue;
          }

          // Apply processing rules
          const processedTransaction = await this.applyProcessingRules(transaction, companyId);
          
          // Save or update transaction
          const savedTransaction = await this.saveOrUpdateTransaction(processedTransaction, companyId);
          
          if (savedTransaction.isNew) {
            processingResult.newTransactions++;
          } else {
            processingResult.updatedTransactions++;
          }
          
          processingResult.processedTransactions++;
        } catch (error) {
          logger.error('Error processing transaction:', error);
          processingResult.errorTransactions++;
          processingResult.processingErrors.push({
            transaction: transaction,
            error: error.message
          });
        }
      }

      // Save processing log
      await this.saveProcessingLog(companyId, processingResult);

      return processingResult;
    } catch (error) {
      logger.error('Error processing bank feed:', error);
      throw error;
    }
  }

  /**
   * Check for duplicate transactions
   */
  private async checkForDuplicate(transaction: any, companyId: string): Promise<boolean> {
    try {
      const duplicate = await prisma.transaction.findFirst({
        where: {
          companyId,
          amount: transaction.amount,
          description: transaction.description,
          transactionDate: new Date(transaction.date),
          // Check for similar transactions within a time window
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });

      return !!duplicate;
    } catch (error) {
      logger.error('Error checking for duplicate:', error);
      return false;
    }
  }

  /**
   * Apply processing rules to transaction
   */
  private async applyProcessingRules(transaction: any, companyId: string): Promise<any> {
    try {
      const rules = await prisma.bankFeedRule.findMany({
        where: { 
          companyId,
          isActive: true
        },
        orderBy: { priority: 'desc' }
      });

      let processedTransaction = { ...transaction };

      for (const rule of rules) {
        if (this.evaluateRule(processedTransaction, rule)) {
          processedTransaction = this.applyRule(processedTransaction, rule);
        }
      }

      return processedTransaction;
    } catch (error) {
      logger.error('Error applying processing rules:', error);
      return transaction;
    }
  }

  /**
   * Evaluate processing rule
   */
  private evaluateRule(transaction: any, rule: any): boolean {
    try {
      const conditions = rule.conditions;
      
      for (const condition of conditions) {
        const field = condition.field;
        const operator = condition.operator;
        const value = condition.value;
        
        let transactionValue;
        switch (field) {
          case 'amount':
            transactionValue = transaction.amount;
            break;
          case 'description':
            transactionValue = transaction.description || '';
            break;
          case 'type':
            transactionValue = transaction.type;
            break;
          case 'merchant':
            transactionValue = transaction.merchant || '';
            break;
          default:
            continue;
        }
        
        if (!this.evaluateCondition(transactionValue, operator, value)) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      logger.error('Error evaluating rule:', error);
      return false;
    }
  }

  /**
   * Evaluate single condition
   */
  private evaluateCondition(transactionValue: any, operator: string, ruleValue: any): boolean {
    switch (operator) {
      case 'equals':
        return transactionValue === ruleValue;
      case 'not_equals':
        return transactionValue !== ruleValue;
      case 'contains':
        return (transactionValue || '').toLowerCase().includes(ruleValue.toLowerCase());
      case 'not_contains':
        return !(transactionValue || '').toLowerCase().includes(ruleValue.toLowerCase());
      case 'greater_than':
        return Number(transactionValue) > Number(ruleValue);
      case 'less_than':
        return Number(transactionValue) < Number(ruleValue);
      case 'greater_than_or_equal':
        return Number(transactionValue) >= Number(ruleValue);
      case 'less_than_or_equal':
        return Number(transactionValue) <= Number(ruleValue);
      case 'starts_with':
        return (transactionValue || '').toLowerCase().startsWith(ruleValue.toLowerCase());
      case 'ends_with':
        return (transactionValue || '').toLowerCase().endsWith(ruleValue.toLowerCase());
      case 'regex':
        try {
          const regex = new RegExp(ruleValue, 'i');
          return regex.test(transactionValue || '');
        } catch {
          return false;
        }
      default:
        return false;
    }
  }

  /**
   * Apply rule to transaction
   */
  private applyRule(transaction: any, rule: any): any {
    const processedTransaction = { ...transaction };

    if (rule.actions) {
      for (const action of rule.actions) {
        switch (action.type) {
          case 'set_category':
            processedTransaction.category = action.value;
            break;
          case 'set_type':
            processedTransaction.type = action.value;
            break;
          case 'set_description':
            processedTransaction.description = action.value;
            break;
          case 'set_vendor':
            processedTransaction.vendorId = action.value;
            break;
          case 'set_customer':
            processedTransaction.customerId = action.value;
            break;
          case 'set_employee':
            processedTransaction.employeeId = action.value;
            break;
          case 'set_department':
            processedTransaction.departmentId = action.value;
            break;
          case 'set_project':
            processedTransaction.projectId = action.value;
            break;
          case 'set_tags':
            processedTransaction.tags = action.value;
            break;
          case 'set_notes':
            processedTransaction.notes = action.value;
            break;
          case 'set_recurring':
            processedTransaction.isRecurring = action.value;
            break;
          case 'set_billable':
            processedTransaction.isBillable = action.value;
            break;
          case 'set_taxable':
            processedTransaction.isTaxable = action.value;
            break;
          case 'set_approved':
            processedTransaction.isApproved = action.value;
            break;
          case 'set_reconciled':
            processedTransaction.isReconciled = action.value;
            break;
        }
      }
    }

    return processedTransaction;
  }

  /**
   * Save or update transaction
   */
  private async saveOrUpdateTransaction(transaction: any, companyId: string): Promise<any> {
    try {
      // Check if transaction already exists
      const existingTransaction = await prisma.transaction.findFirst({
        where: {
          companyId,
          externalId: transaction.externalId
        }
      });

      if (existingTransaction) {
        // Update existing transaction
        const updatedTransaction = await prisma.transaction.update({
          where: { id: existingTransaction.id },
          data: {
            amount: transaction.amount,
            description: transaction.description,
            type: transaction.type,
            category: transaction.category,
            vendorId: transaction.vendorId,
            customerId: transaction.customerId,
            employeeId: transaction.employeeId,
            departmentId: transaction.departmentId,
            projectId: transaction.projectId,
            tags: transaction.tags,
            notes: transaction.notes,
            isRecurring: transaction.isRecurring,
            isBillable: transaction.isBillable,
            isTaxable: transaction.isTaxable,
            isApproved: transaction.isApproved,
            isReconciled: transaction.isReconciled,
            updatedAt: new Date()
          }
        });

        return { ...updatedTransaction, isNew: false };
      } else {
        // Create new transaction
        const newTransaction = await prisma.transaction.create({
          data: {
            companyId,
            externalId: transaction.externalId,
            amount: transaction.amount,
            description: transaction.description,
            type: transaction.type,
            category: transaction.category,
            vendorId: transaction.vendorId,
            customerId: transaction.customerId,
            employeeId: transaction.employeeId,
            departmentId: transaction.departmentId,
            projectId: transaction.projectId,
            tags: transaction.tags,
            notes: transaction.notes,
            isRecurring: transaction.isRecurring,
            isBillable: transaction.isBillable,
            isTaxable: transaction.isTaxable,
            isApproved: transaction.isApproved,
            isReconciled: transaction.isReconciled,
            transactionDate: new Date(transaction.date),
            createdAt: new Date()
          }
        });

        return { ...newTransaction, isNew: true };
      }
    } catch (error) {
      logger.error('Error saving or updating transaction:', error);
      throw error;
    }
  }

  /**
   * Save processing log
   */
  private async saveProcessingLog(companyId: string, processingResult: any): Promise<any> {
    try {
      const log = await prisma.bankFeedProcessingLog.create({
        data: {
          companyId,
          totalTransactions: processingResult.totalTransactions,
          processedTransactions: processingResult.processedTransactions,
          duplicateTransactions: processingResult.duplicateTransactions,
          errorTransactions: processingResult.errorTransactions,
          newTransactions: processingResult.newTransactions,
          updatedTransactions: processingResult.updatedTransactions,
          processingErrors: JSON.stringify(processingResult.processingErrors),
          processedAt: new Date()
        }
      });

      return log;
    } catch (error) {
      logger.error('Error saving processing log:', error);
      throw error;
    }
  }

  /**
   * Get bank feed processing dashboard
   */
  async getBankFeedProcessingDashboard(companyId: string): Promise<any> {
    try {
      const [
        processingStats,
        recentLogs,
        ruleStats,
        errorAnalysis
      ] = await Promise.all([
        this.getProcessingStats(companyId),
        this.getRecentLogs(companyId),
        this.getRuleStats(companyId),
        this.getErrorAnalysis(companyId)
      ]);

      return {
        processingStats,
        recentLogs,
        ruleStats,
        errorAnalysis
      };
    } catch (error) {
      logger.error('Error getting bank feed processing dashboard:', error);
      throw error;
    }
  }

  /**
   * Get processing statistics
   */
  private async getProcessingStats(companyId: string): Promise<any> {
    try {
      const stats = await prisma.$queryRaw`
        SELECT 
          COUNT(*) as total_logs,
          SUM(total_transactions) as total_transactions,
          SUM(processed_transactions) as processed_transactions,
          SUM(duplicate_transactions) as duplicate_transactions,
          SUM(error_transactions) as error_transactions,
          SUM(new_transactions) as new_transactions,
          SUM(updated_transactions) as updated_transactions,
          AVG(processed_transactions::float / NULLIF(total_transactions, 0)) as success_rate,
          COUNT(CASE WHEN processed_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as recent_logs
        FROM bank_feed_processing_logs
        WHERE company_id = ${companyId}
        AND processed_at >= CURRENT_DATE - INTERVAL '30 days'
      `;

      return stats[0];
    } catch (error) {
      logger.error('Error getting processing stats:', error);
      throw error;
    }
  }

  /**
   * Get recent processing logs
   */
  private async getRecentLogs(companyId: string): Promise<any> {
    try {
      const logs = await prisma.bankFeedProcessingLog.findMany({
        where: { companyId },
        orderBy: { processedAt: 'desc' },
        take: 10
      });

      return logs;
    } catch (error) {
      logger.error('Error getting recent logs:', error);
      return [];
    }
  }

  /**
   * Get rule statistics
   */
  private async getRuleStats(companyId: string): Promise<any> {
    try {
      const stats = await prisma.$queryRaw`
        SELECT 
          COUNT(*) as total_rules,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_rules,
          COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_rules,
          AVG(priority) as avg_priority
        FROM bank_feed_rules
        WHERE company_id = ${companyId}
      `;

      return stats[0];
    } catch (error) {
      logger.error('Error getting rule stats:', error);
      throw error;
    }
  }

  /**
   * Get error analysis
   */
  private async getErrorAnalysis(companyId: string): Promise<any> {
    try {
      const errors = await prisma.$queryRaw`
        SELECT 
          error_message,
          COUNT(*) as error_count,
          MAX(processed_at) as last_occurrence
        FROM bank_feed_processing_logs
        WHERE company_id = ${companyId}
        AND error_transactions > 0
        AND processed_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY error_message
        ORDER BY error_count DESC
        LIMIT 10
      `;

      return errors;
    } catch (error) {
      logger.error('Error getting error analysis:', error);
      return [];
    }
  }

  /**
   * Get bank feed connections
   */
  async getBankFeedConnections(companyId: string): Promise<any> {
    try {
      const connections = await prisma.bankFeedConnection.findMany({
        where: { companyId },
        include: {
          bank: true
        }
      });

      return connections;
    } catch (error) {
      logger.error('Error getting bank feed connections:', error);
      throw error;
    }
  }

  /**
   * Create bank feed connection
   */
  async createBankFeedConnection(companyId: string, connectionData: any): Promise<any> {
    try {
      const connection = await prisma.bankFeedConnection.create({
        data: {
          companyId,
          bankId: connectionData.bankId,
          accountNumber: connectionData.accountNumber,
          accountType: connectionData.accountType,
          connectionStatus: 'pending',
          lastSyncAt: null,
          createdAt: new Date()
        }
      });

      return connection;
    } catch (error) {
      logger.error('Error creating bank feed connection:', error);
      throw error;
    }
  }

  /**
   * Update bank feed connection
   */
  async updateBankFeedConnection(connectionId: string, companyId: string, updateData: any): Promise<any> {
    try {
      const connection = await prisma.bankFeedConnection.update({
        where: { 
          id: connectionId,
          companyId 
        },
        data: {
          ...updateData,
          updatedAt: new Date()
        }
      });

      return connection;
    } catch (error) {
      logger.error('Error updating bank feed connection:', error);
      throw error;
    }
  }

  /**
   * Delete bank feed connection
   */
  async deleteBankFeedConnection(connectionId: string, companyId: string): Promise<any> {
    try {
      const connection = await prisma.bankFeedConnection.delete({
        where: { 
          id: connectionId,
          companyId 
        }
      });

      return connection;
    } catch (error) {
      logger.error('Error deleting bank feed connection:', error);
      throw error;
    }
  }

  /**
   * Get bank feed rules
   */
  async getBankFeedRules(companyId: string): Promise<any> {
    try {
      const rules = await prisma.bankFeedRule.findMany({
        where: { companyId },
        orderBy: { priority: 'desc' }
      });

      return rules;
    } catch (error) {
      logger.error('Error getting bank feed rules:', error);
      throw error;
    }
  }

  /**
   * Create bank feed rule
   */
  async createBankFeedRule(companyId: string, ruleData: any): Promise<any> {
    try {
      const rule = await prisma.bankFeedRule.create({
        data: {
          companyId,
          ruleName: ruleData.ruleName,
          ruleDescription: ruleData.ruleDescription,
          conditions: JSON.stringify(ruleData.conditions),
          actions: JSON.stringify(ruleData.actions),
          priority: ruleData.priority || 0,
          isActive: ruleData.isActive !== false,
          createdBy: ruleData.createdBy,
          createdAt: new Date()
        }
      });

      return rule;
    } catch (error) {
      logger.error('Error creating bank feed rule:', error);
      throw error;
    }
  }

  /**
   * Update bank feed rule
   */
  async updateBankFeedRule(ruleId: string, companyId: string, updateData: any): Promise<any> {
    try {
      const rule = await prisma.bankFeedRule.update({
        where: { 
          id: ruleId,
          companyId 
        },
        data: {
          ...updateData,
          updatedAt: new Date()
        }
      });

      return rule;
    } catch (error) {
      logger.error('Error updating bank feed rule:', error);
      throw error;
    }
  }

  /**
   * Delete bank feed rule
   */
  async deleteBankFeedRule(ruleId: string, companyId: string): Promise<any> {
    try {
      const rule = await prisma.bankFeedRule.delete({
        where: { 
          id: ruleId,
          companyId 
        }
      });

      return rule;
    } catch (error) {
      logger.error('Error deleting bank feed rule:', error);
      throw error;
    }
  }

  /**
   * Test bank feed rule
   */
  async testBankFeedRule(companyId: string, ruleData: any, testTransaction: any): Promise<any> {
    try {
      const rule = {
        conditions: ruleData.conditions,
        actions: ruleData.actions
      };

      const isMatch = this.evaluateRule(testTransaction, rule);
      const processedTransaction = isMatch ? this.applyRule(testTransaction, rule) : testTransaction;

      return {
        isMatch,
        originalTransaction: testTransaction,
        processedTransaction,
        appliedActions: isMatch ? ruleData.actions : []
      };
    } catch (error) {
      logger.error('Error testing bank feed rule:', error);
      throw error;
    }
  }
}