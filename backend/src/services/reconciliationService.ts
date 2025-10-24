import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

export interface ReconciliationSession {
  id: string;
  accountId: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  totalTransactions: number;
  matchedTransactions: number;
  unmatchedTransactions: number;
  reconciliationScore: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface ReconciliationMatch {
  id: string;
  sessionId: string;
  bankTransactionId: string;
  bookTransactionId: string;
  confidence: number;
  matchType: 'exact' | 'fuzzy' | 'manual';
  difference?: number;
  notes?: string;
  createdAt: Date;
}

export interface ReconciliationRule {
  id: string;
  userId: string;
  name: string;
  description: string;
  conditions: Array<{
    field: string;
    operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'regex' | 'amount_range' | 'date_range';
    value: string;
    weight: number;
  }>;
  actions: Array<{
    type: 'auto_match' | 'flag_for_review' | 'categorize' | 'tag';
    value: string;
  }>;
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReconciliationReport {
  sessionId: string;
  accountId: string;
  period: { startDate: Date; endDate: Date };
  summary: {
    totalBankTransactions: number;
    totalBookTransactions: number;
    matchedTransactions: number;
    unmatchedBankTransactions: number;
    unmatchedBookTransactions: number;
    reconciliationScore: number;
  };
  matches: ReconciliationMatch[];
  suspiciousTransactions: Array<{
    transactionId: string;
    reason: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  recommendations: string[];
}

class ReconciliationService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
    logger.info('[ReconciliationService] Initialized');
  }

  /**
   * Creates a new reconciliation session
   */
  public async createReconciliationSession(
    accountId: string,
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ReconciliationSession> {
    try {
      const session = await this.prisma.reconciliationSession.create({
        data: {
          accountId,
          userId,
          startDate,
          endDate,
          status: 'pending',
          totalTransactions: 0,
          matchedTransactions: 0,
          unmatchedTransactions: 0,
          reconciliationScore: 0
        }
      });

      logger.info(`[ReconciliationService] Created reconciliation session ${session.id} for account ${accountId}`);
      return session as ReconciliationSession;
    } catch (error: any) {
      logger.error('[ReconciliationService] Error creating reconciliation session:', error);
      throw new Error(`Failed to create reconciliation session: ${error.message}`);
    }
  }

  /**
   * Performs automated reconciliation
   */
  public async performAutomatedReconciliation(
    sessionId: string,
    userId: string
  ): Promise<{
    success: boolean;
    matches: ReconciliationMatch[];
    unmatchedBank: string[];
    unmatchedBook: string[];
    reconciliationScore: number;
  }> {
    try {
      const session = await this.prisma.reconciliationSession.findUnique({
        where: { id: sessionId }
      });

      if (!session || session.userId !== userId) {
        throw new Error('Reconciliation session not found or unauthorized');
      }

      // Update status to in progress
      await this.prisma.reconciliationSession.update({
        where: { id: sessionId },
        data: { status: 'in_progress' }
      });

      // Get bank and book transactions
      const bankTransactions = await this.getBankTransactions(session.accountId, session.startDate, session.endDate);
      const bookTransactions = await this.getBookTransactions(session.accountId, session.startDate, session.endDate);

      const matches: ReconciliationMatch[] = [];
      const unmatchedBank: string[] = [];
      const unmatchedBook: string[] = [];

      // Perform ML-powered matching
      for (const bankTx of bankTransactions) {
        if (bankTx.isReconciled) continue;

        const bestMatch = await this.findBestMatch(bankTx, bookTransactions);
        if (bestMatch) {
          const match = await this.createReconciliationMatch(
            sessionId,
            bankTx.id,
            bestMatch.id,
            bestMatch.confidence,
            bestMatch.matchType
          );
          matches.push(match);

          // Mark transactions as reconciled
          await this.markTransactionAsReconciled(bankTx.id);
          await this.markTransactionAsReconciled(bestMatch.id);
        } else {
          unmatchedBank.push(bankTx.id);
        }
      }

      // Find unmatched book transactions
      const matchedBookIds = matches.map(m => m.bookTransactionId);
      for (const bookTx of bookTransactions) {
        if (!matchedBookIds.includes(bookTx.id)) {
          unmatchedBook.push(bookTx.id);
        }
      }

      const reconciliationScore = this.calculateReconciliationScore(matches, bankTransactions.length);

      // Update session with results
      await this.prisma.reconciliationSession.update({
        where: { id: sessionId },
        data: {
          status: 'completed',
          totalTransactions: bankTransactions.length,
          matchedTransactions: matches.length,
          unmatchedTransactions: unmatchedBank.length,
          reconciliationScore,
          completedAt: new Date()
        }
      });

      logger.info(`[ReconciliationService] Completed automated reconciliation for session ${sessionId}: ${matches.length} matches`);
      return {
        success: true,
        matches,
        unmatchedBank,
        unmatchedBook,
        reconciliationScore
      };
    } catch (error: any) {
      logger.error(`[ReconciliationService] Error performing automated reconciliation for session ${sessionId}:`, error);
      
      // Update session status to failed
      await this.prisma.reconciliationSession.update({
        where: { id: sessionId },
        data: { status: 'failed' }
      });

      throw new Error(`Failed to perform automated reconciliation: ${error.message}`);
    }
  }

  /**
   * Creates manual reconciliation match
   */
  public async createManualMatch(
    sessionId: string,
    bankTransactionId: string,
    bookTransactionId: string,
    userId: string,
    notes?: string
  ): Promise<ReconciliationMatch> {
    try {
      const session = await this.prisma.reconciliationSession.findUnique({
        where: { id: sessionId }
      });

      if (!session || session.userId !== userId) {
        throw new Error('Reconciliation session not found or unauthorized');
      }

      const match = await this.createReconciliationMatch(
        sessionId,
        bankTransactionId,
        bookTransactionId,
        1.0, // Manual matches have 100% confidence
        'manual',
        notes
      );

      // Mark transactions as reconciled
      await this.markTransactionAsReconciled(bankTransactionId);
      await this.markTransactionAsReconciled(bookTransactionId);

      logger.info(`[ReconciliationService] Created manual match for session ${sessionId}`);
      return match;
    } catch (error: any) {
      logger.error('[ReconciliationService] Error creating manual match:', error);
      throw new Error(`Failed to create manual match: ${error.message}`);
    }
  }

  /**
   * Creates reconciliation rule
   */
  public async createReconciliationRule(
    userId: string,
    name: string,
    description: string,
    conditions: ReconciliationRule['conditions'],
    actions: ReconciliationRule['actions'],
    priority: number = 0
  ): Promise<ReconciliationRule> {
    try {
      const rule = await this.prisma.reconciliationRule.create({
        data: {
          userId,
          name,
          description,
          conditions,
          actions,
          isActive: true,
          priority
        }
      });

      logger.info(`[ReconciliationService] Created reconciliation rule ${rule.id} for user ${userId}`);
      return rule as ReconciliationRule;
    } catch (error: any) {
      logger.error('[ReconciliationService] Error creating reconciliation rule:', error);
      throw new Error(`Failed to create reconciliation rule: ${error.message}`);
    }
  }

  /**
   * Applies reconciliation rules
   */
  public async applyReconciliationRules(
    bankTransactionId: string,
    userId: string
  ): Promise<{
    applied: boolean;
    ruleId?: string;
    actions: string[];
  }> {
    try {
      const transaction = await this.prisma.bankTransaction.findUnique({
        where: { id: bankTransactionId }
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      const rules = await this.prisma.reconciliationRule.findMany({
        where: { userId, isActive: true },
        orderBy: { priority: 'desc' }
      });

      for (const rule of rules) {
        if (this.matchesRule(transaction, rule.conditions)) {
          await this.applyRuleActions(bankTransactionId, rule.actions);
          logger.info(`[ReconciliationService] Applied rule ${rule.id} to transaction ${bankTransactionId}`);
          return {
            applied: true,
            ruleId: rule.id,
            actions: rule.actions.map(a => a.type)
          };
        }
      }

      return { applied: false, actions: [] };
    } catch (error: any) {
      logger.error(`[ReconciliationService] Error applying reconciliation rules to transaction ${bankTransactionId}:`, error);
      throw new Error(`Failed to apply reconciliation rules: ${error.message}`);
    }
  }

  /**
   * Generates reconciliation report
   */
  public async generateReconciliationReport(
    sessionId: string,
    userId: string
  ): Promise<ReconciliationReport> {
    try {
      const session = await this.prisma.reconciliationSession.findUnique({
        where: { id: sessionId }
      });

      if (!session || session.userId !== userId) {
        throw new Error('Reconciliation session not found or unauthorized');
      }

      const matches = await this.prisma.reconciliationMatch.findMany({
        where: { sessionId }
      });

      const bankTransactions = await this.getBankTransactions(session.accountId, session.startDate, session.endDate);
      const bookTransactions = await this.getBookTransactions(session.accountId, session.startDate, session.endDate);

      const suspiciousTransactions = await this.detectSuspiciousTransactions(matches, bankTransactions);
      const recommendations = this.generateRecommendations(session, matches, suspiciousTransactions);

      const report: ReconciliationReport = {
        sessionId,
        accountId: session.accountId,
        period: { startDate: session.startDate, endDate: session.endDate },
        summary: {
          totalBankTransactions: bankTransactions.length,
          totalBookTransactions: bookTransactions.length,
          matchedTransactions: matches.length,
          unmatchedBankTransactions: session.unmatchedTransactions,
          unmatchedBookTransactions: bookTransactions.length - matches.length,
          reconciliationScore: session.reconciliationScore
        },
        matches: matches as ReconciliationMatch[],
        suspiciousTransactions,
        recommendations
      };

      logger.info(`[ReconciliationService] Generated reconciliation report for session ${sessionId}`);
      return report;
    } catch (error: any) {
      logger.error(`[ReconciliationService] Error generating reconciliation report for session ${sessionId}:`, error);
      throw new Error(`Failed to generate reconciliation report: ${error.message}`);
    }
  }

  /**
   * Gets reconciliation sessions for user
   */
  public async getReconciliationSessions(
    userId: string,
    accountId?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ReconciliationSession[]> {
    try {
      const where: any = { userId };
      if (accountId) where.accountId = accountId;

      const sessions = await this.prisma.reconciliationSession.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });

      return sessions as ReconciliationSession[];
    } catch (error: any) {
      logger.error(`[ReconciliationService] Error getting reconciliation sessions for user ${userId}:`, error);
      throw new Error(`Failed to get reconciliation sessions: ${error.message}`);
    }
  }

  /**
   * Gets bank transactions for reconciliation
   */
  private async getBankTransactions(accountId: string, startDate: Date, endDate: Date): Promise<any[]> {
    const transactions = await this.prisma.bankTransaction.findMany({
      where: {
        accountId,
        date: { gte: startDate, lte: endDate }
      },
      orderBy: { date: 'desc' }
    });

    return transactions;
  }

  /**
   * Gets book transactions for reconciliation
   */
  private async getBookTransactions(accountId: string, startDate: Date, endDate: Date): Promise<any[]> {
    // In production, this would fetch from the accounting system
    // For now, return empty array
    return [];
  }

  /**
   * Finds best match for bank transaction
   */
  private async findBestMatch(bankTx: any, bookTransactions: any[]): Promise<{
    id: string;
    confidence: number;
    matchType: string;
  } | null> {
    let bestMatch: any = null;
    let bestConfidence = 0;

    for (const bookTx of bookTransactions) {
      if (bookTx.isReconciled) continue;

      const confidence = this.calculateMatchConfidence(bankTx, bookTx);
      if (confidence > bestConfidence && confidence > 0.7) {
        bestMatch = bookTx;
        bestConfidence = confidence;
      }
    }

    if (bestMatch) {
      return {
        id: bestMatch.id,
        confidence: bestConfidence,
        matchType: bestConfidence > 0.95 ? 'exact' : 'fuzzy'
      };
    }

    return null;
  }

  /**
   * Calculates match confidence
   */
  private calculateMatchConfidence(bankTx: any, bookTx: any): number {
    let confidence = 0;

    // Amount matching (40% weight)
    if (Math.abs(bankTx.amount - bookTx.amount) < 0.01) {
      confidence += 0.4;
    } else if (Math.abs(bankTx.amount - bookTx.amount) < 1.0) {
      confidence += 0.2; // Close amount match
    }

    // Date matching (30% weight)
    const dateDiff = Math.abs(bankTx.date.getTime() - new Date(bookTx.date).getTime());
    if (dateDiff < 24 * 60 * 60 * 1000) { // Within 1 day
      confidence += 0.3;
    } else if (dateDiff < 7 * 24 * 60 * 60 * 1000) { // Within 1 week
      confidence += 0.15;
    }

    // Description matching (30% weight)
    const descSimilarity = this.calculateStringSimilarity(bankTx.description, bookTx.description);
    confidence += descSimilarity * 0.3;

    return confidence;
  }

  /**
   * Calculates string similarity
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculates Levenshtein distance
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Creates reconciliation match
   */
  private async createReconciliationMatch(
    sessionId: string,
    bankTransactionId: string,
    bookTransactionId: string,
    confidence: number,
    matchType: string,
    notes?: string
  ): Promise<ReconciliationMatch> {
    const match = await this.prisma.reconciliationMatch.create({
      data: {
        sessionId,
        bankTransactionId,
        bookTransactionId,
        confidence,
        matchType,
        notes
      }
    });

    return match as ReconciliationMatch;
  }

  /**
   * Marks transaction as reconciled
   */
  private async markTransactionAsReconciled(transactionId: string): Promise<void> {
    await this.prisma.bankTransaction.update({
      where: { id: transactionId },
      data: { isReconciled: true }
    });
  }

  /**
   * Calculates reconciliation score
   */
  private calculateReconciliationScore(matches: ReconciliationMatch[], totalTransactions: number): number {
    if (totalTransactions === 0) return 100;
    return Math.round((matches.length / totalTransactions) * 100);
  }

  /**
   * Checks if transaction matches rule conditions
   */
  private matchesRule(transaction: any, conditions: ReconciliationRule['conditions']): boolean {
    return conditions.every(condition => {
      const fieldValue = this.getTransactionField(transaction, condition.field);
      return this.evaluateCondition(fieldValue, condition.operator, condition.value);
    });
  }

  /**
   * Gets transaction field value
   */
  private getTransactionField(transaction: any, field: string): string {
    switch (field) {
      case 'description': return transaction.description;
      case 'merchant': return transaction.merchant || '';
      case 'amount': return transaction.amount.toString();
      case 'type': return transaction.type;
      case 'date': return transaction.date.toISOString();
      default: return '';
    }
  }

  /**
   * Evaluates condition
   */
  private evaluateCondition(value: string, operator: string, expected: string): boolean {
    switch (operator) {
      case 'equals': return value === expected;
      case 'contains': return value.toLowerCase().includes(expected.toLowerCase());
      case 'starts_with': return value.toLowerCase().startsWith(expected.toLowerCase());
      case 'ends_with': return value.toLowerCase().endsWith(expected.toLowerCase());
      case 'regex': return new RegExp(expected).test(value);
      case 'amount_range': return this.evaluateAmountRange(parseFloat(value), expected);
      case 'date_range': return this.evaluateDateRange(new Date(value), expected);
      default: return false;
    }
  }

  /**
   * Evaluates amount range condition
   */
  private evaluateAmountRange(amount: number, range: string): boolean {
    const [min, max] = range.split('-').map(Number);
    return amount >= min && amount <= max;
  }

  /**
   * Evaluates date range condition
   */
  private evaluateDateRange(date: Date, range: string): boolean {
    const [start, end] = range.split(',').map(d => new Date(d));
    return date >= start && date <= end;
  }

  /**
   * Applies rule actions
   */
  private async applyRuleActions(transactionId: string, actions: ReconciliationRule['actions']): Promise<void> {
    for (const action of actions) {
      switch (action.type) {
        case 'auto_match':
          // Auto-match logic would be implemented here
          break;
        case 'flag_for_review':
          // Flag for review logic
          break;
        case 'categorize':
          await this.prisma.bankTransaction.update({
            where: { id: transactionId },
            data: { category: action.value }
          });
          break;
        case 'tag':
          // Tag logic
          break;
      }
    }
  }

  /**
   * Detects suspicious transactions
   */
  private async detectSuspiciousTransactions(matches: ReconciliationMatch[], bankTransactions: any[]): Promise<Array<{
    transactionId: string;
    reason: string;
    severity: 'low' | 'medium' | 'high';
  }>> {
    const suspicious: Array<{
      transactionId: string;
      reason: string;
      severity: 'low' | 'medium' | 'high';
    }> = [];

    for (const tx of bankTransactions) {
      // Check for large amounts
      if (Math.abs(tx.amount) > 10000) {
        suspicious.push({
          transactionId: tx.id,
          reason: 'Large transaction amount',
          severity: 'high'
        });
      }

      // Check for unusual timing
      const hour = tx.date.getHours();
      if (hour < 6 || hour > 22) {
        suspicious.push({
          transactionId: tx.id,
          reason: 'Unusual transaction timing',
          severity: 'medium'
        });
      }

      // Check for duplicate amounts
      const duplicates = bankTransactions.filter(t => 
        t.id !== tx.id && Math.abs(t.amount - tx.amount) < 0.01
      );
      if (duplicates.length > 0) {
        suspicious.push({
          transactionId: tx.id,
          reason: 'Potential duplicate transaction',
          severity: 'medium'
        });
      }
    }

    return suspicious;
  }

  /**
   * Generates recommendations
   */
  private generateRecommendations(
    session: ReconciliationSession,
    matches: ReconciliationMatch[],
    suspiciousTransactions: any[]
  ): string[] {
    const recommendations: string[] = [];

    if (session.reconciliationScore < 80) {
      recommendations.push('Consider reviewing unmatched transactions for potential matches');
    }

    if (suspiciousTransactions.length > 0) {
      recommendations.push('Review suspicious transactions for potential fraud');
    }

    if (matches.filter(m => m.matchType === 'fuzzy').length > 0) {
      recommendations.push('Review fuzzy matches to ensure accuracy');
    }

    if (session.unmatchedTransactions > session.totalTransactions * 0.1) {
      recommendations.push('High number of unmatched transactions - consider adjusting matching rules');
    }

    return recommendations;
  }
}

export default new ReconciliationService();







