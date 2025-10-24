import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface BankAccount {
  id: string;
  userId: string;
  accountId: string;
  accountName: string;
  accountType: 'checking' | 'savings' | 'credit' | 'investment';
  bankName: string;
  lastFourDigits: string;
  isActive: boolean;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankTransaction {
  id: string;
  accountId: string;
  externalId: string;
  amount: number;
  description: string;
  date: Date;
  type: 'debit' | 'credit';
  category?: string;
  subcategory?: string;
  merchant?: string;
  location?: string;
  isPending: boolean;
  isReconciled: boolean;
  isDuplicate: boolean;
  confidence: number;
  rawData: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankFeedRule {
  id: string;
  userId: string;
  name: string;
  description: string;
  conditions: Array<{
    field: string;
    operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than';
    value: string | number;
  }>;
  actions: Array<{
    type: 'categorize' | 'tag' | 'flag' | 'skip';
    value: string;
  }>;
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncResult {
  success: boolean;
  transactionsImported: number;
  transactionsUpdated: number;
  transactionsSkipped: number;
  errors: string[];
  lastSyncAt: Date;
  nextSyncAt: Date;
}

export interface DeduplicationResult {
  duplicates: Array<{
    transactionId: string;
    duplicateOf: string;
    confidence: number;
  }>;
  unique: string[];
  total: number;
}

class BankFeedService {
  private syncJobs: Map<string, any> = new Map();
  private rules: Map<string, BankFeedRule[]> = new Map();

  constructor() {
    this.initializeSyncScheduler();
  }

  /**
   * Initialize the sync scheduler
   */
  private initializeSyncScheduler(): void {
    // In production, this would use a proper job scheduler like Bull or Agenda
    logger.info('Initializing bank feed sync scheduler...');
    
    // Simulate scheduler setup
    setInterval(() => {
      this.processScheduledSyncs();
    }, 60000); // Check every minute
  }

  /**
   * Connect a bank account
   */
  public async connectAccount(
    userId: string,
    bankName: string,
    credentials: any
  ): Promise<BankAccount> {
    try {
      logger.info(`Connecting bank account for user ${userId} with ${bankName}`);
      
      // In production, this would use Plaid, Yodlee, or similar service
      // For now, we'll simulate the connection
      
      const account: BankAccount = {
        id: uuidv4(),
        userId,
        accountId: `acc_${Date.now()}`,
        accountName: `${bankName} Checking`,
        accountType: 'checking',
        bankName,
        lastFourDigits: '1234',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Schedule initial sync
      await this.scheduleSync(account.id, 'immediate');
      
      logger.info(`Bank account connected successfully: ${account.id}`);
      return account;
    } catch (error) {
      logger.error('Error connecting bank account:', error);
      throw error;
    }
  }

  /**
   * Sync transactions from bank
   */
  public async syncTransactions(accountId: string): Promise<SyncResult> {
    try {
      logger.info(`Syncing transactions for account ${accountId}`);
      
      const startTime = new Date();
      const result: SyncResult = {
        success: true,
        transactionsImported: 0,
        transactionsUpdated: 0,
        transactionsSkipped: 0,
        errors: [],
        lastSyncAt: startTime,
        nextSyncAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next day
      };

      // Simulate fetching transactions from bank
      const bankTransactions = await this.fetchTransactionsFromBank(accountId);
      
      for (const bankTx of bankTransactions) {
        try {
          // Check for duplicates
          const isDuplicate = await this.checkForDuplicates(bankTx);
          if (isDuplicate) {
            result.transactionsSkipped++;
            continue;
          }

          // Apply rules
          const processedTx = await this.applyRules(bankTx);
          
          // Save transaction
          await this.saveTransaction(processedTx);
          result.transactionsImported++;
          
        } catch (error) {
          logger.error(`Error processing transaction:`, error);
          result.errors.push(`Transaction processing failed: ${error}`);
        }
      }

      // Update account sync time
      await this.updateAccountSyncTime(accountId, startTime);
      
      logger.info(`Sync completed: ${result.transactionsImported} imported, ${result.transactionsSkipped} skipped`);
      return result;
    } catch (error) {
      logger.error('Error syncing transactions:', error);
      throw error;
    }
  }

  /**
   * Fetch transactions from bank (simulated)
   */
  private async fetchTransactionsFromBank(accountId: string): Promise<any[]> {
    // In production, this would use Plaid API or similar
    // For now, we'll simulate some transactions
    
    const transactions = [
      {
        id: `tx_${Date.now()}_1`,
        amount: -25.99,
        description: 'STARBUCKS COFFEE #1234',
        date: new Date(),
        type: 'debit',
        merchant: 'Starbucks',
        location: 'New York, NY',
        isPending: false,
      },
      {
        id: `tx_${Date.now()}_2`,
        amount: -150.00,
        description: 'OFFICE DEPOT #5678',
        date: new Date(),
        type: 'debit',
        merchant: 'Office Depot',
        location: 'New York, NY',
        isPending: false,
      },
      {
        id: `tx_${Date.now()}_3`,
        amount: 5000.00,
        description: 'CLIENT PAYMENT - ABC CORP',
        date: new Date(),
        type: 'credit',
        merchant: 'ABC Corp',
        isPending: false,
      },
    ];

    return transactions;
  }

  /**
   * Check for duplicate transactions
   */
  private async checkForDuplicates(transaction: any): Promise<boolean> {
    // In production, this would check against existing transactions
    // using fuzzy matching on amount, date, and description
    
    // Simulate duplicate check
    return Math.random() < 0.1; // 10% chance of being a duplicate
  }

  /**
   * Apply rules to transaction
   */
  private async applyRules(transaction: any): Promise<BankTransaction> {
    const processedTx: BankTransaction = {
      id: uuidv4(),
      accountId: transaction.accountId || 'default',
      externalId: transaction.id,
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date,
      type: transaction.type,
      merchant: transaction.merchant,
      location: transaction.location,
      isPending: transaction.isPending,
      isReconciled: false,
      isDuplicate: false,
      confidence: 0.8,
      rawData: transaction,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Apply categorization rules
    if (transaction.description.toLowerCase().includes('starbucks')) {
      processedTx.category = 'Meals';
      processedTx.subcategory = 'Coffee & Snacks';
    } else if (transaction.description.toLowerCase().includes('office')) {
      processedTx.category = 'Office Supplies';
    } else if (transaction.description.toLowerCase().includes('client')) {
      processedTx.category = 'Revenue';
    }

    return processedTx;
  }

  /**
   * Save transaction to database
   */
  private async saveTransaction(transaction: BankTransaction): Promise<void> {
    // In production, this would save to the database
    logger.info(`Saving transaction: ${transaction.description} - $${transaction.amount}`);
  }

  /**
   * Update account sync time
   */
  private async updateAccountSyncTime(accountId: string, syncTime: Date): Promise<void> {
    // In production, this would update the database
    logger.info(`Updated sync time for account ${accountId}: ${syncTime}`);
  }

  /**
   * Schedule sync for account
   */
  public async scheduleSync(accountId: string, when: 'immediate' | 'daily' | 'weekly'): Promise<void> {
    try {
      const syncTime = when === 'immediate' 
        ? new Date() 
        : when === 'daily' 
          ? new Date(Date.now() + 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      this.syncJobs.set(accountId, {
        accountId,
        nextSync: syncTime,
        frequency: when,
        isActive: true,
      });

      logger.info(`Scheduled sync for account ${accountId}: ${syncTime}`);
    } catch (error) {
      logger.error('Error scheduling sync:', error);
      throw error;
    }
  }

  /**
   * Process scheduled syncs
   */
  private async processScheduledSyncs(): Promise<void> {
    const now = new Date();
    
    for (const [accountId, job] of this.syncJobs) {
      if (job.isActive && job.nextSync <= now) {
        try {
          await this.syncTransactions(accountId);
          
          // Reschedule next sync
          const nextSync = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          job.nextSync = nextSync;
          this.syncJobs.set(accountId, job);
          
        } catch (error) {
          logger.error(`Error in scheduled sync for account ${accountId}:`, error);
        }
      }
    }
  }

  /**
   * Create bank feed rule
   */
  public async createRule(
    userId: string,
    ruleData: Omit<BankFeedRule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<BankFeedRule> {
    try {
      const rule: BankFeedRule = {
        id: uuidv4(),
        ...ruleData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store rule
      if (!this.rules.has(userId)) {
        this.rules.set(userId, []);
      }
      this.rules.get(userId)!.push(rule);

      logger.info(`Created bank feed rule: ${rule.name}`);
      return rule;
    } catch (error) {
      logger.error('Error creating bank feed rule:', error);
      throw error;
    }
  }

  /**
   * Apply rules to transaction
   */
  public async applyRulesToTransaction(
    transaction: BankTransaction,
    userId: string
  ): Promise<BankTransaction> {
    try {
      const userRules = this.rules.get(userId) || [];
      let processedTx = { ...transaction };

      for (const rule of userRules) {
        if (!rule.isActive) continue;

        const matches = rule.conditions.every(condition => {
          const fieldValue = this.getFieldValue(processedTx, condition.field);
          return this.evaluateCondition(fieldValue, condition.operator, condition.value);
        });

        if (matches) {
          for (const action of rule.actions) {
            processedTx = this.applyAction(processedTx, action);
          }
        }
      }

      return processedTx;
    } catch (error) {
      logger.error('Error applying rules to transaction:', error);
      throw error;
    }
  }

  /**
   * Get field value from transaction
   */
  private getFieldValue(transaction: BankTransaction, field: string): any {
    const fieldMap: Record<string, string> = {
      'description': 'description',
      'amount': 'amount',
      'merchant': 'merchant',
      'type': 'type',
    };

    const actualField = fieldMap[field] || field;
    return (transaction as any)[actualField];
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(fieldValue: any, operator: string, value: any): boolean {
    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
      case 'starts_with':
        return String(fieldValue).toLowerCase().startsWith(String(value).toLowerCase());
      case 'ends_with':
        return String(fieldValue).toLowerCase().endsWith(String(value).toLowerCase());
      case 'greater_than':
        return Number(fieldValue) > Number(value);
      case 'less_than':
        return Number(fieldValue) < Number(value);
      default:
        return false;
    }
  }

  /**
   * Apply action to transaction
   */
  private applyAction(transaction: BankTransaction, action: any): BankTransaction {
    switch (action.type) {
      case 'categorize':
        transaction.category = action.value;
        break;
      case 'tag':
        if (!transaction.tags) transaction.tags = [];
        transaction.tags.push(action.value);
        break;
      case 'flag':
        // Add flag to transaction
        break;
      case 'skip':
        // Mark for skipping
        break;
    }
    return transaction;
  }

  /**
   * Get deduplication results
   */
  public async getDeduplicationResults(transactions: BankTransaction[]): Promise<DeduplicationResult> {
    const duplicates: Array<{ transactionId: string; duplicateOf: string; confidence: number }> = [];
    const unique: string[] = [];
    
    // Simple deduplication logic
    const seen = new Set<string>();
    
    for (const tx of transactions) {
      const key = `${tx.amount}_${tx.date.getTime()}_${tx.description}`;
      
      if (seen.has(key)) {
        duplicates.push({
          transactionId: tx.id,
          duplicateOf: unique[unique.length - 1],
          confidence: 0.9,
        });
      } else {
        seen.add(key);
        unique.push(tx.id);
      }
    }

    return {
      duplicates,
      unique,
      total: transactions.length,
    };
  }

  /**
   * Get sync status for account
   */
  public async getSyncStatus(accountId: string): Promise<{
    isActive: boolean;
    lastSyncAt?: Date;
    nextSyncAt?: Date;
    frequency: string;
  }> {
    const job = this.syncJobs.get(accountId);
    
    if (!job) {
      return {
        isActive: false,
        frequency: 'none',
      };
    }

    return {
      isActive: job.isActive,
      lastSyncAt: job.lastSync,
      nextSyncAt: job.nextSync,
      frequency: job.frequency,
    };
  }

  /**
   * Disconnect bank account
   */
  public async disconnectAccount(accountId: string): Promise<void> {
    try {
      // Remove from sync jobs
      this.syncJobs.delete(accountId);
      
      // In production, this would also revoke the bank connection
      logger.info(`Disconnected bank account: ${accountId}`);
    } catch (error) {
      logger.error('Error disconnecting bank account:', error);
      throw error;
    }
  }
}

export default new BankFeedService();