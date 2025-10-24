import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface DuplicateTransaction {
  id: string;
  userId: string;
  transactionId: string;
  duplicateTransactionId: string;
  similarityScore: number;
  matchType: 'exact' | 'fuzzy' | 'partial' | 'refund_pair';
  confidence: number;
  description: string;
  detectedAt: Date;
  status: 'pending' | 'resolved' | 'false_positive' | 'confirmed_duplicate';
}

export interface DuplicateVendor {
  id: string;
  userId: string;
  vendorName: string;
  similarVendors: Array<{
    vendorId: string;
    vendorName: string;
    similarityScore: number;
    matchType: 'exact' | 'fuzzy' | 'typo' | 'abbreviation';
  }>;
  detectedAt: Date;
  status: 'pending' | 'resolved' | 'false_positive';
}

export interface DuplicateResolution {
  id: string;
  duplicateId: string;
  action: 'merge' | 'keep_original' | 'keep_duplicate' | 'mark_false_positive';
  resolvedBy: string;
  resolvedAt: Date;
  notes?: string;
}

export class DuplicateDetectionService {
  /**
   * Detect duplicate transactions
   */
  async detectDuplicateTransactions(userId: string): Promise<DuplicateTransaction[]> {
    try {
      const duplicates: DuplicateTransaction[] = [];
      
      // Get all transactions for user
      const transactions = await prisma.expense.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 1000 // Limit for performance
      });
      
      // Compare each transaction with others
      for (let i = 0; i < transactions.length; i++) {
        for (let j = i + 1; j < transactions.length; j++) {
          const transaction1 = transactions[i];
          const transaction2 = transactions[j];
          
          const similarity = this.calculateTransactionSimilarity(transaction1, transaction2);
          
          if (similarity.score > 0.7) { // Threshold for duplicate detection
            const duplicate: DuplicateTransaction = {
              id: `duplicate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              userId,
              transactionId: transaction1.id,
              duplicateTransactionId: transaction2.id,
              similarityScore: similarity.score,
              matchType: similarity.matchType,
              confidence: similarity.confidence,
              description: this.generateDuplicateDescription(transaction1, transaction2, similarity),
              detectedAt: new Date(),
              status: 'pending'
            };
            
            duplicates.push(duplicate);
          }
        }
      }
      
      return duplicates;

    } catch (error) {
      console.error('Error detecting duplicate transactions:', error);
      return [];
    }
  }

  /**
   * Calculate similarity between two transactions
   */
  private calculateTransactionSimilarity(transaction1: any, transaction2: any): {
    score: number;
    matchType: 'exact' | 'fuzzy' | 'partial' | 'refund_pair';
    confidence: number;
  } {
    let score = 0;
    let factors = 0;
    let matchType: 'exact' | 'fuzzy' | 'partial' | 'refund_pair' = 'partial';
    
    // Amount similarity (exact match gets highest score)
    const amountDiff = Math.abs(transaction1.amount - transaction2.amount);
    const amountSimilarity = amountDiff === 0 ? 1 : Math.max(0, 1 - (amountDiff / Math.max(transaction1.amount, transaction2.amount)));
    score += amountSimilarity * 0.4;
    factors += 0.4;
    
    // Merchant similarity
    const merchantSimilarity = this.calculateStringSimilarity(transaction1.merchant, transaction2.merchant);
    score += merchantSimilarity * 0.3;
    factors += 0.3;
    
    // Date similarity (transactions within 7 days)
    const dateDiff = Math.abs(transaction1.createdAt.getTime() - transaction2.createdAt.getTime());
    const daysDiff = dateDiff / (1000 * 60 * 60 * 24);
    const dateSimilarity = daysDiff <= 7 ? Math.max(0, 1 - (daysDiff / 7)) : 0;
    score += dateSimilarity * 0.2;
    factors += 0.2;
    
    // Category similarity
    const categorySimilarity = transaction1.category === transaction2.category ? 1 : 0;
    score += categorySimilarity * 0.1;
    factors += 0.1;
    
    const finalScore = factors > 0 ? score / factors : 0;
    
    // Determine match type
    if (amountDiff === 0 && merchantSimilarity > 0.9 && dateSimilarity > 0.8) {
      matchType = 'exact';
    } else if (amountDiff === 0 && merchantSimilarity > 0.7) {
      matchType = 'fuzzy';
    } else if (Math.abs(transaction1.amount + transaction2.amount) < 0.01) {
      matchType = 'refund_pair';
    }
    
    return {
      score: finalScore,
      matchType,
      confidence: finalScore
    };
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1;
    if (!str1 || !str2) return 0;
    
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }
    
    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }
    
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
   * Generate duplicate description
   */
  private generateDuplicateDescription(transaction1: any, transaction2: any, similarity: any): string {
    const amountMatch = transaction1.amount === transaction2.amount ? 'same amount' : 'different amounts';
    const merchantMatch = similarity.matchType === 'exact' ? 'same merchant' : 'similar merchant';
    const dateDiff = Math.abs(transaction1.createdAt.getTime() - transaction2.createdAt.getTime());
    const daysDiff = Math.floor(dateDiff / (1000 * 60 * 60 * 24));
    
    return `Potential duplicate: ${amountMatch} ($${transaction1.amount} vs $${transaction2.amount}), ${merchantMatch} (${transaction1.merchant} vs ${transaction2.merchant}), ${daysDiff} days apart`;
  }

  /**
   * Detect duplicate vendors
   */
  async detectDuplicateVendors(userId: string): Promise<DuplicateVendor[]> {
    try {
      const duplicates: DuplicateVendor[] = [];
      
      // Get all vendors for user
      const vendors = await prisma.vendor.findMany({
        where: { userId },
        select: {
          id: true,
          name: true
        }
      });
      
      // Compare each vendor with others
      for (let i = 0; i < vendors.length; i++) {
        const similarVendors: Array<{
          vendorId: string;
          vendorName: string;
          similarityScore: number;
          matchType: 'exact' | 'fuzzy' | 'typo' | 'abbreviation';
        }> = [];
        
        for (let j = i + 1; j < vendors.length; j++) {
          const vendor1 = vendors[i];
          const vendor2 = vendors[j];
          
          const similarity = this.calculateVendorSimilarity(vendor1.name, vendor2.name);
          
          if (similarity.score > 0.8) {
            similarVendors.push({
              vendorId: vendor2.id,
              vendorName: vendor2.name,
              similarityScore: similarity.score,
              matchType: similarity.matchType
            });
          }
        }
        
        if (similarVendors.length > 0) {
          const duplicate: DuplicateVendor = {
            id: `vendor_duplicate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            vendorName: vendors[i].name,
            similarVendors,
            detectedAt: new Date(),
            status: 'pending'
          };
          
          duplicates.push(duplicate);
        }
      }
      
      return duplicates;

    } catch (error) {
      console.error('Error detecting duplicate vendors:', error);
      return [];
    }
  }

  /**
   * Calculate vendor similarity
   */
  private calculateVendorSimilarity(name1: string, name2: string): {
    score: number;
    matchType: 'exact' | 'fuzzy' | 'typo' | 'abbreviation';
  } {
    const similarity = this.calculateStringSimilarity(name1.toLowerCase(), name2.toLowerCase());
    
    let matchType: 'exact' | 'fuzzy' | 'typo' | 'abbreviation' = 'fuzzy';
    
    if (similarity === 1) {
      matchType = 'exact';
    } else if (similarity > 0.9) {
      matchType = 'typo';
    } else if (this.isAbbreviation(name1, name2) || this.isAbbreviation(name2, name1)) {
      matchType = 'abbreviation';
    }
    
    return {
      score: similarity,
      matchType
    };
  }

  /**
   * Check if one string is an abbreviation of another
   */
  private isAbbreviation(full: string, abbrev: string): boolean {
    if (abbrev.length >= full.length) return false;
    
    const fullWords = full.toLowerCase().split(/\s+/);
    const abbrevWords = abbrev.toLowerCase().split(/\s+/);
    
    if (abbrevWords.length !== fullWords.length) return false;
    
    return abbrevWords.every((abbrevWord, index) => {
      const fullWord = fullWords[index];
      return fullWord.startsWith(abbrevWord) || abbrevWord.split('').every(char => fullWord.includes(char));
    });
  }

  /**
   * Resolve duplicate transaction
   */
  async resolveDuplicateTransaction(
    duplicateId: string,
    action: 'merge' | 'keep_original' | 'keep_duplicate' | 'mark_false_positive',
    resolvedBy: string,
    notes?: string
  ): Promise<DuplicateResolution> {
    try {
      const resolution: DuplicateResolution = {
        id: `resolution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        duplicateId,
        action,
        resolvedBy,
        resolvedAt: new Date(),
        notes
      };
      
      // In a real implementation, this would:
      // 1. Update the duplicate status
      // 2. Perform the resolution action (merge, keep, etc.)
      // 3. Store the resolution in database
      
      console.log('Duplicate resolved:', resolution);
      
      return resolution;

    } catch (error) {
      console.error('Error resolving duplicate transaction:', error);
      throw new Error('Failed to resolve duplicate transaction');
    }
  }

  /**
   * Get duplicate detection statistics
   */
  async getDuplicateStatistics(userId: string): Promise<{
    totalDuplicates: number;
    pendingDuplicates: number;
    resolvedDuplicates: number;
    falsePositives: number;
    averageSimilarityScore: number;
  }> {
    try {
      // In a real implementation, this would query the database
      return {
        totalDuplicates: 0,
        pendingDuplicates: 0,
        resolvedDuplicates: 0,
        falsePositives: 0,
        averageSimilarityScore: 0
      };

    } catch (error) {
      console.error('Error getting duplicate statistics:', error);
      return {
        totalDuplicates: 0,
        pendingDuplicates: 0,
        resolvedDuplicates: 0,
        falsePositives: 0,
        averageSimilarityScore: 0
      };
    }
  }

  /**
   * Get duplicate detection dashboard
   */
  async getDuplicateDashboard(userId: string): Promise<{
    recentDuplicates: DuplicateTransaction[];
    duplicateVendors: DuplicateVendor[];
    statistics: any;
    recommendations: string[];
  }> {
    try {
      const recentDuplicates = await this.detectDuplicateTransactions(userId);
      const duplicateVendors = await this.detectDuplicateVendors(userId);
      const statistics = await this.getDuplicateStatistics(userId);
      
      const recommendations: string[] = [];
      
      if (recentDuplicates.length > 0) {
        recommendations.push('Review detected duplicate transactions');
      }
      
      if (duplicateVendors.length > 0) {
        recommendations.push('Consider merging duplicate vendor entries');
      }
      
      if (statistics.falsePositives > statistics.resolvedDuplicates * 0.3) {
        recommendations.push('Review duplicate detection settings - high false positive rate');
      }
      
      return {
        recentDuplicates: recentDuplicates.slice(0, 10),
        duplicateVendors,
        statistics,
        recommendations
      };

    } catch (error) {
      console.error('Error getting duplicate dashboard:', error);
      return {
        recentDuplicates: [],
        duplicateVendors: [],
        statistics: {
          totalDuplicates: 0,
          pendingDuplicates: 0,
          resolvedDuplicates: 0,
          falsePositives: 0,
          averageSimilarityScore: 0
        },
        recommendations: []
      };
    }
  }

  /**
   * Auto-resolve obvious duplicates
   */
  async autoResolveObviousDuplicates(userId: string): Promise<{
    resolved: number;
    skipped: number;
    errors: number;
  }> {
    try {
      const duplicates = await this.detectDuplicateTransactions(userId);
      let resolved = 0;
      let skipped = 0;
      let errors = 0;
      
      for (const duplicate of duplicates) {
        try {
          // Auto-resolve exact matches with high confidence
          if (duplicate.matchType === 'exact' && duplicate.confidence > 0.95) {
            await this.resolveDuplicateTransaction(
              duplicate.id,
              'keep_original',
              'system',
              'Auto-resolved exact duplicate'
            );
            resolved++;
          } else {
            skipped++;
          }
        } catch (error) {
          console.error('Error auto-resolving duplicate:', error);
          errors++;
        }
      }
      
      return { resolved, skipped, errors };

    } catch (error) {
      console.error('Error auto-resolving duplicates:', error);
      return { resolved: 0, skipped: 0, errors: 1 };
    }
  }
}

export default DuplicateDetectionService;







