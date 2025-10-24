import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';

const prisma = new PrismaClient();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface FraudAlert {
  id: string;
  transactionId: string;
  userId: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  fraudType: string;
  description: string;
  indicators: string[];
  confidence: number;
  createdAt: Date;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
}

export interface TransactionPattern {
  userId: string;
  averageAmount: number;
  typicalMerchants: string[];
  usualTimes: string[];
  commonCategories: string[];
  spendingVelocity: number;
  geographicPatterns: string[];
}

export interface FraudRule {
  id: string;
  name: string;
  description: string;
  conditions: any[];
  riskScore: number;
  isActive: boolean;
  createdAt: Date;
}

export class FraudDetectionService {
  private fraudRules: FraudRule[] = [];
  private userPatterns: Map<string, TransactionPattern> = new Map();

  constructor() {
    this.initializeFraudRules();
  }

  /**
   * Analyze transaction for fraud indicators
   */
  async analyzeTransaction(
    userId: string,
    transaction: {
      id: string;
      amount: number;
      merchant: string;
      category: string;
      date: Date;
      location?: string;
      paymentMethod?: string;
      description?: string;
    }
  ): Promise<FraudAlert | null> {
    try {
      const riskScore = await this.calculateRiskScore(userId, transaction);
      
      if (riskScore < 30) {
        return null; // Low risk, no alert
      }

      const fraudType = this.determineFraudType(transaction, riskScore);
      const indicators = this.getFraudIndicators(transaction, riskScore);
      const riskLevel = this.getRiskLevel(riskScore);

      const alert: FraudAlert = {
        id: `fraud_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        transactionId: transaction.id,
        userId,
        riskScore,
        riskLevel,
        fraudType,
        description: this.generateFraudDescription(fraudType, indicators),
        indicators,
        confidence: riskScore / 100,
        createdAt: new Date(),
        status: 'active'
      };

      // Store alert in database
      await this.storeFraudAlert(alert);

      return alert;

    } catch (error) {
      console.error('Error analyzing transaction for fraud:', error);
      throw new Error('Failed to analyze transaction for fraud');
    }
  }

  /**
   * Calculate risk score for transaction
   */
  private async calculateRiskScore(
    userId: string, 
    transaction: any
  ): Promise<number> {
    let riskScore = 0;
    let factors = 0;

    // Get user's transaction patterns
    const userPattern = await this.getUserTransactionPattern(userId);

    // Amount-based risk factors
    const amountRisk = this.calculateAmountRisk(transaction.amount, userPattern);
    riskScore += amountRisk.score;
    factors += amountRisk.factors;

    // Merchant-based risk factors
    const merchantRisk = this.calculateMerchantRisk(transaction.merchant, userPattern);
    riskScore += merchantRisk.score;
    factors += merchantRisk.factors;

    // Time-based risk factors
    const timeRisk = this.calculateTimeRisk(transaction.date, userPattern);
    riskScore += timeRisk.score;
    factors += timeRisk.factors;

    // Location-based risk factors
    if (transaction.location) {
      const locationRisk = this.calculateLocationRisk(transaction.location, userPattern);
      riskScore += locationRisk.score;
      factors += locationRisk.factors;
    }

    // Category-based risk factors
    const categoryRisk = this.calculateCategoryRisk(transaction.category, userPattern);
    riskScore += categoryRisk.score;
    factors += categoryRisk.factors;

    // Payment method risk factors
    if (transaction.paymentMethod) {
      const paymentMethodRisk = this.calculatePaymentMethodRisk(transaction.paymentMethod);
      riskScore += paymentMethodRisk.score;
      factors += paymentMethodRisk.factors;
    }

    // Round dollar amount risk (common fraud indicator)
    const roundDollarRisk = this.calculateRoundDollarRisk(transaction.amount);
    riskScore += roundDollarRisk.score;
    factors += roundDollarRisk.factors;

    // Velocity risk (too many transactions)
    const velocityRisk = await this.calculateVelocityRisk(userId, transaction.date);
    riskScore += velocityRisk.score;
    factors += velocityRisk.factors;

    return factors > 0 ? Math.min(riskScore / factors, 100) : 0;
  }

  /**
   * Calculate amount-based risk
   */
  private calculateAmountRisk(amount: number, userPattern: TransactionPattern): { score: number; factors: number } {
    let score = 0;
    let factors = 0;

    // Unusually high amount
    if (amount > userPattern.averageAmount * 5) {
      score += 30;
      factors++;
    } else if (amount > userPattern.averageAmount * 3) {
      score += 15;
      factors++;
    }

    // Round dollar amounts (fraud indicator)
    if (amount % 100 === 0 && amount > 100) {
      score += 10;
      factors++;
    }

    // Very small amounts (potential testing)
    if (amount < 1) {
      score += 5;
      factors++;
    }

    return { score, factors };
  }

  /**
   * Calculate merchant-based risk
   */
  private calculateMerchantRisk(merchant: string, userPattern: TransactionPattern): { score: number; factors: number } {
    let score = 0;
    let factors = 0;

    // Unknown merchant
    if (!userPattern.typicalMerchants.includes(merchant)) {
      score += 10;
      factors++;
    }

    // High-risk merchant categories
    const highRiskMerchants = ['casino', 'gambling', 'adult', 'crypto', 'bitcoin'];
    if (highRiskMerchants.some(risk => merchant.toLowerCase().includes(risk))) {
      score += 25;
      factors++;
    }

    // Generic merchant names (potential fraud)
    const genericNames = ['store', 'merchant', 'payment', 'transaction'];
    if (genericNames.some(generic => merchant.toLowerCase().includes(generic))) {
      score += 15;
      factors++;
    }

    return { score, factors };
  }

  /**
   * Calculate time-based risk
   */
  private calculateTimeRisk(date: Date, userPattern: TransactionPattern): { score: number; factors: number } {
    let score = 0;
    let factors = 0;

    const hour = date.getHours();
    const dayOfWeek = date.getDay();

    // Unusual time patterns
    if (hour < 6 || hour > 22) {
      score += 10;
      factors++;
    }

    // Weekend transactions (if not typical for user)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      score += 5;
      factors++;
    }

    return { score, factors };
  }

  /**
   * Calculate location-based risk
   */
  private calculateLocationRisk(location: string, userPattern: TransactionPattern): { score: number; factors: number } {
    let score = 0;
    let factors = 0;

    // Unknown location
    if (!userPattern.geographicPatterns.includes(location)) {
      score += 15;
      factors++;
    }

    // International transactions (if not typical)
    if (location.includes('International') || location.includes('Foreign')) {
      score += 20;
      factors++;
    }

    return { score, factors };
  }

  /**
   * Calculate category-based risk
   */
  private calculateCategoryRisk(category: string, userPattern: TransactionPattern): { score: number; factors: number } {
    let score = 0;
    let factors = 0;

    // Unusual category for user
    if (!userPattern.commonCategories.includes(category)) {
      score += 10;
      factors++;
    }

    // High-risk categories
    const highRiskCategories = ['Gambling', 'Adult', 'Crypto', 'Investment'];
    if (highRiskCategories.includes(category)) {
      score += 20;
      factors++;
    }

    return { score, factors };
  }

  /**
   * Calculate payment method risk
   */
  private calculatePaymentMethodRisk(paymentMethod: string): { score: number; factors: number } {
    let score = 0;
    let factors = 0;

    // High-risk payment methods
    const highRiskMethods = ['cryptocurrency', 'prepaid', 'gift card'];
    if (highRiskMethods.some(method => paymentMethod.toLowerCase().includes(method))) {
      score += 25;
      factors++;
    }

    return { score, factors };
  }

  /**
   * Calculate round dollar risk
   */
  private calculateRoundDollarRisk(amount: number): { score: number; factors: number } {
    let score = 0;
    let factors = 0;

    // Round dollar amounts are common in fraud
    if (amount % 100 === 0 && amount >= 100) {
      score += 15;
      factors++;
    }

    // Exact dollar amounts
    if (amount % 1 === 0 && amount >= 10) {
      score += 5;
      factors++;
    }

    return { score, factors };
  }

  /**
   * Calculate velocity risk (too many transactions)
   */
  private async calculateVelocityRisk(userId: string, transactionDate: Date): Promise<{ score: number; factors: number }> {
    try {
      const startOfDay = new Date(transactionDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(transactionDate);
      endOfDay.setHours(23, 59, 59, 999);

      const transactionCount = await prisma.expense.count({
        where: {
          userId,
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });

      let score = 0;
      let factors = 0;

      // Too many transactions in one day
      if (transactionCount > 20) {
        score += 30;
        factors++;
      } else if (transactionCount > 10) {
        score += 15;
        factors++;
      }

      return { score, factors };

    } catch (error) {
      console.error('Error calculating velocity risk:', error);
      return { score: 0, factors: 0 };
    }
  }

  /**
   * Get user's transaction patterns
   */
  private async getUserTransactionPattern(userId: string): Promise<TransactionPattern> {
    try {
      // Check if pattern is cached
      if (this.userPatterns.has(userId)) {
        return this.userPatterns.get(userId)!;
      }

      // Get user's transaction history
      const transactions = await prisma.expense.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 100
      });

      if (transactions.length === 0) {
        return {
          userId,
          averageAmount: 0,
          typicalMerchants: [],
          usualTimes: [],
          commonCategories: [],
          spendingVelocity: 0,
          geographicPatterns: []
        };
      }

      // Calculate patterns
      const averageAmount = transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length;
      
      const merchantCounts = transactions.reduce((acc, t) => {
        acc[t.merchant] = (acc[t.merchant] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const typicalMerchants = Object.entries(merchantCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([merchant]) => merchant);

      const categoryCounts = transactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const commonCategories = Object.entries(categoryCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([category]) => category);

      const pattern: TransactionPattern = {
        userId,
        averageAmount,
        typicalMerchants,
        usualTimes: [], // Would be calculated from transaction times
        commonCategories,
        spendingVelocity: transactions.length / 30, // transactions per day
        geographicPatterns: [] // Would be calculated from location data
      };

      // Cache the pattern
      this.userPatterns.set(userId, pattern);
      
      return pattern;

    } catch (error) {
      console.error('Error getting user transaction pattern:', error);
      return {
        userId,
        averageAmount: 0,
        typicalMerchants: [],
        usualTimes: [],
        commonCategories: [],
        spendingVelocity: 0,
        geographicPatterns: []
      };
    }
  }

  /**
   * Determine fraud type based on indicators
   */
  private determineFraudType(transaction: any, riskScore: number): string {
    if (riskScore >= 80) {
      return 'High Risk Transaction';
    } else if (riskScore >= 60) {
      return 'Suspicious Activity';
    } else if (riskScore >= 40) {
      return 'Unusual Pattern';
    } else {
      return 'Low Risk Alert';
    }
  }

  /**
   * Get fraud indicators
   */
  private getFraudIndicators(transaction: any, riskScore: number): string[] {
    const indicators: string[] = [];

    if (transaction.amount > 1000) {
      indicators.push('High amount transaction');
    }

    if (transaction.amount % 100 === 0) {
      indicators.push('Round dollar amount');
    }

    if (transaction.amount < 1) {
      indicators.push('Very small amount (potential testing)');
    }

    // Add more indicators based on transaction data
    if (riskScore >= 70) {
      indicators.push('Multiple risk factors detected');
    }

    return indicators;
  }

  /**
   * Get risk level from score
   */
  private getRiskLevel(riskScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }

  /**
   * Generate fraud description
   */
  private generateFraudDescription(fraudType: string, indicators: string[]): string {
    return `${fraudType}: ${indicators.join(', ')}`;
  }

  /**
   * Store fraud alert
   */
  private async storeFraudAlert(alert: FraudAlert): Promise<void> {
    try {
      // In a real implementation, this would store in database
      console.log('Fraud alert stored:', alert);
    } catch (error) {
      console.error('Error storing fraud alert:', error);
    }
  }

  /**
   * Initialize fraud detection rules
   */
  private initializeFraudRules(): void {
    this.fraudRules = [
      {
        id: 'high_amount',
        name: 'High Amount Transaction',
        description: 'Transaction amount exceeds normal threshold',
        conditions: [{ field: 'amount', operator: '>', value: 5000 }],
        riskScore: 30,
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'round_dollar',
        name: 'Round Dollar Amount',
        description: 'Transaction amount is a round dollar figure',
        conditions: [{ field: 'amount', operator: '%', value: 100 }],
        riskScore: 15,
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'unusual_merchant',
        name: 'Unusual Merchant',
        description: 'Transaction with merchant not in user history',
        conditions: [{ field: 'merchant', operator: 'not_in', value: 'user_history' }],
        riskScore: 20,
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'velocity_high',
        name: 'High Transaction Velocity',
        description: 'Too many transactions in short time period',
        conditions: [{ field: 'count', operator: '>', value: 10, period: '1_hour' }],
        riskScore: 25,
        isActive: true,
        createdAt: new Date()
      }
    ];
  }

  /**
   * Get fraud alerts for user
   */
  async getFraudAlerts(userId: string, limit: number = 20): Promise<FraudAlert[]> {
    try {
      // In a real implementation, this would query the database
      return [];

    } catch (error) {
      console.error('Error getting fraud alerts:', error);
      return [];
    }
  }

  /**
   * Update fraud alert status
   */
  async updateFraudAlertStatus(alertId: string, status: string): Promise<void> {
    try {
      // In a real implementation, this would update the database
      console.log(`Fraud alert ${alertId} status updated to ${status}`);

    } catch (error) {
      console.error('Error updating fraud alert status:', error);
      throw new Error('Failed to update fraud alert status');
    }
  }

  /**
   * Get fraud statistics
   */
  async getFraudStatistics(userId: string): Promise<{
    totalAlerts: number;
    activeAlerts: number;
    resolvedAlerts: number;
    falsePositives: number;
    averageRiskScore: number;
  }> {
    try {
      // In a real implementation, this would calculate from database
      return {
        totalAlerts: 0,
        activeAlerts: 0,
        resolvedAlerts: 0,
        falsePositives: 0,
        averageRiskScore: 0
      };

    } catch (error) {
      console.error('Error getting fraud statistics:', error);
      return {
        totalAlerts: 0,
        activeAlerts: 0,
        resolvedAlerts: 0,
        falsePositives: 0,
        averageRiskScore: 0
      };
    }
  }
}

export default FraudDetectionService;






