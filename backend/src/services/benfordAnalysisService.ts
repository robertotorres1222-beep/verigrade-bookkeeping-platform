import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class BenfordAnalysisService {
  /**
   * Perform Benford's Law analysis on financial data
   */
  async performBenfordAnalysis(companyId: string, dataType: string): Promise<any> {
    try {
      const data = await this.getFinancialData(companyId, dataType);
      const benfordDistribution = this.calculateBenfordDistribution(data);
      const actualDistribution = this.calculateActualDistribution(data);
      const chiSquareTest = this.performChiSquareTest(actualDistribution, benfordDistribution);
      const anomalies = this.detectAnomalies(actualDistribution, benfordDistribution);

      const analysis = await prisma.benfordAnalysis.create({
        data: {
          companyId,
          dataType,
          totalRecords: data.length,
          benfordDistribution: JSON.stringify(benfordDistribution),
          actualDistribution: JSON.stringify(actualDistribution),
          chiSquareStatistic: chiSquareTest.chiSquare,
          pValue: chiSquareTest.pValue,
          isSignificant: chiSquareTest.isSignificant,
          anomalies: JSON.stringify(anomalies),
          confidenceLevel: 0.95,
          analyzedAt: new Date()
        }
      });

      return {
        analysis,
        benfordDistribution,
        actualDistribution,
        chiSquareTest,
        anomalies
      };
    } catch (error) {
      logger.error('Error performing Benford analysis:', error);
      throw error;
    }
  }

  /**
   * Get financial data for analysis
   */
  private async getFinancialData(companyId: string, dataType: string): Promise<any[]> {
    try {
      let data = [];
      
      switch (dataType) {
        case 'transactions':
          data = await prisma.transaction.findMany({
            where: { 
              companyId,
              amount: { gt: 0 }
            },
            select: { amount: true }
          });
          break;
        case 'expenses':
          data = await prisma.expense.findMany({
            where: { 
              companyId,
              amount: { gt: 0 }
            },
            select: { amount: true }
          });
          break;
        case 'invoices':
          data = await prisma.invoice.findMany({
            where: { 
              companyId,
              amount: { gt: 0 }
            },
            select: { amount: true }
          });
          break;
        case 'payments':
          data = await prisma.payment.findMany({
            where: { 
              companyId,
              amount: { gt: 0 }
            },
            select: { amount: true }
          });
          break;
        default:
          throw new Error(`Unsupported data type: ${dataType}`);
      }

      return data.map(item => item.amount);
    } catch (error) {
      logger.error('Error getting financial data:', error);
      throw error;
    }
  }

  /**
   * Calculate Benford's Law distribution
   */
  private calculateBenfordDistribution(data: number[]): number[] {
    const benfordDistribution = [];
    
    for (let digit = 1; digit <= 9; digit++) {
      const probability = Math.log10(1 + 1 / digit);
      benfordDistribution.push(probability);
    }
    
    return benfordDistribution;
  }

  /**
   * Calculate actual distribution of first digits
   */
  private calculateActualDistribution(data: number[]): number[] {
    const digitCounts = new Array(9).fill(0);
    let totalCount = 0;
    
    for (const amount of data) {
      const firstDigit = this.getFirstDigit(amount);
      if (firstDigit >= 1 && firstDigit <= 9) {
        digitCounts[firstDigit - 1]++;
        totalCount++;
      }
    }
    
    return digitCounts.map(count => count / totalCount);
  }

  /**
   * Get first digit of a number
   */
  private getFirstDigit(number: number): number {
    const str = Math.abs(number).toString();
    const firstChar = str.charAt(0);
    return parseInt(firstChar);
  }

  /**
   * Perform chi-square test
   */
  private performChiSquareTest(actual: number[], expected: number[]): any {
    let chiSquare = 0;
    const totalRecords = actual.reduce((sum, freq) => sum + freq, 0);
    
    for (let i = 0; i < 9; i++) {
      const observed = actual[i] * totalRecords;
      const expectedFreq = expected[i] * totalRecords;
      
      if (expectedFreq > 0) {
        chiSquare += Math.pow(observed - expectedFreq, 2) / expectedFreq;
      }
    }
    
    // Degrees of freedom = 9 - 1 = 8
    const degreesOfFreedom = 8;
    const pValue = this.calculatePValue(chiSquare, degreesOfFreedom);
    const isSignificant = pValue < 0.05;
    
    return {
      chiSquare,
      degreesOfFreedom,
      pValue,
      isSignificant
    };
  }

  /**
   * Calculate p-value for chi-square test
   */
  private calculatePValue(chiSquare: number, degreesOfFreedom: number): number {
    // Simplified p-value calculation
    // In a real implementation, you would use a proper chi-square distribution table
    if (chiSquare < 2.73) return 0.95;
    if (chiSquare < 5.31) return 0.90;
    if (chiSquare < 7.78) return 0.80;
    if (chiSquare < 9.49) return 0.70;
    if (chiSquare < 11.07) return 0.60;
    if (chiSquare < 12.59) return 0.50;
    if (chiSquare < 14.07) return 0.40;
    if (chiSquare < 15.51) return 0.30;
    if (chiSquare < 16.92) return 0.20;
    if (chiSquare < 18.31) return 0.10;
    if (chiSquare < 19.68) return 0.05;
    if (chiSquare < 21.03) return 0.02;
    if (chiSquare < 22.36) return 0.01;
    return 0.001;
  }

  /**
   * Detect anomalies in distribution
   */
  private detectAnomalies(actual: number[], expected: number[]): any[] {
    const anomalies = [];
    const threshold = 0.1; // 10% deviation threshold
    
    for (let i = 0; i < 9; i++) {
      const deviation = Math.abs(actual[i] - expected[i]);
      const percentageDeviation = (deviation / expected[i]) * 100;
      
      if (percentageDeviation > threshold * 100) {
        anomalies.push({
          digit: i + 1,
          expected: expected[i],
          actual: actual[i],
          deviation: deviation,
          percentageDeviation: percentageDeviation,
          severity: this.getAnomalySeverity(percentageDeviation)
        });
      }
    }
    
    return anomalies;
  }

  /**
   * Get anomaly severity
   */
  private getAnomalySeverity(percentageDeviation: number): string {
    if (percentageDeviation > 50) return 'high';
    if (percentageDeviation > 25) return 'medium';
    return 'low';
  }

  /**
   * Get Benford analysis dashboard
   */
  async getBenfordDashboard(companyId: string): Promise<any> {
    try {
      const [
        analysisStats,
        recentAnalyses,
        dataTypeAnalysis,
        anomalySummary
      ] = await Promise.all([
        this.getBenfordStats(companyId),
        this.getRecentAnalyses(companyId),
        this.getDataTypeAnalysis(companyId),
        this.getAnomalySummary(companyId)
      ]);

      return {
        analysisStats,
        recentAnalyses,
        dataTypeAnalysis,
        anomalySummary
      };
    } catch (error) {
      logger.error('Error getting Benford dashboard:', error);
      throw error;
    }
  }

  /**
   * Get Benford analysis statistics
   */
  private async getBenfordStats(companyId: string): Promise<any> {
    try {
      const stats = await prisma.$queryRaw`
        SELECT 
          COUNT(*) as total_analyses,
          COUNT(CASE WHEN is_significant THEN 1 END) as significant_analyses,
          COUNT(CASE WHEN NOT is_significant THEN 1 END) as non_significant_analyses,
          AVG(chi_square_statistic) as avg_chi_square,
          AVG(p_value) as avg_p_value,
          COUNT(CASE WHEN data_type = 'transactions' THEN 1 END) as transaction_analyses,
          COUNT(CASE WHEN data_type = 'expenses' THEN 1 END) as expense_analyses,
          COUNT(CASE WHEN data_type = 'invoices' THEN 1 END) as invoice_analyses,
          COUNT(CASE WHEN data_type = 'payments' THEN 1 END) as payment_analyses
        FROM benford_analyses
        WHERE company_id = ${companyId}
        AND analyzed_at >= CURRENT_DATE - INTERVAL '30 days'
      `;

      return stats[0];
    } catch (error) {
      logger.error('Error getting Benford stats:', error);
      throw error;
    }
  }

  /**
   * Get recent analyses
   */
  private async getRecentAnalyses(companyId: string): Promise<any> {
    try {
      const analyses = await prisma.benfordAnalysis.findMany({
        where: { companyId },
        orderBy: { analyzedAt: 'desc' },
        take: 20
      });

      return analyses;
    } catch (error) {
      logger.error('Error getting recent analyses:', error);
      throw error;
    }
  }

  /**
   * Get data type analysis
   */
  private async getDataTypeAnalysis(companyId: string): Promise<any> {
    try {
      const analysis = await prisma.$queryRaw`
        SELECT 
          data_type,
          COUNT(*) as analysis_count,
          AVG(chi_square_statistic) as avg_chi_square,
          AVG(p_value) as avg_p_value,
          COUNT(CASE WHEN is_significant THEN 1 END) as significant_count,
          MAX(analyzed_at) as last_analysis
        FROM benford_analyses
        WHERE company_id = ${companyId}
        AND analyzed_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY data_type
        ORDER BY analysis_count DESC
      `;

      return analysis;
    } catch (error) {
      logger.error('Error getting data type analysis:', error);
      throw error;
    }
  }

  /**
   * Get anomaly summary
   */
  private async getAnomalySummary(companyId: string): Promise<any> {
    try {
      const summary = await prisma.$queryRaw`
        SELECT 
          data_type,
          COUNT(*) as total_analyses,
          COUNT(CASE WHEN JSON_ARRAY_LENGTH(anomalies) > 0 THEN 1 END) as analyses_with_anomalies,
          AVG(JSON_ARRAY_LENGTH(anomalies)) as avg_anomalies_per_analysis,
          MAX(JSON_ARRAY_LENGTH(anomalies)) as max_anomalies
        FROM benford_analyses
        WHERE company_id = ${companyId}
        AND analyzed_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY data_type
        ORDER BY analyses_with_anomalies DESC
      `;

      return summary;
    } catch (error) {
      logger.error('Error getting anomaly summary:', error);
      throw error;
    }
  }

  /**
   * Get Benford trends
   */
  async getBenfordTrends(companyId: string, days: number = 30): Promise<any> {
    try {
      const trends = await prisma.$queryRaw`
        SELECT 
          DATE(analyzed_at) as analysis_date,
          data_type,
          COUNT(*) as analyses_count,
          AVG(chi_square_statistic) as avg_chi_square,
          AVG(p_value) as avg_p_value,
          COUNT(CASE WHEN is_significant THEN 1 END) as significant_count
        FROM benford_analyses
        WHERE company_id = ${companyId}
        AND analyzed_at >= CURRENT_DATE - INTERVAL '${days} days'
        GROUP BY DATE(analyzed_at), data_type
        ORDER BY analysis_date DESC, data_type
      `;

      return trends;
    } catch (error) {
      logger.error('Error getting Benford trends:', error);
      throw error;
    }
  }

  /**
   * Run comprehensive Benford analysis
   */
  async runComprehensiveBenfordAnalysis(companyId: string): Promise<any> {
    try {
      const dataTypes = ['transactions', 'expenses', 'invoices', 'payments'];
      const results = {};

      for (const dataType of dataTypes) {
        try {
          const analysis = await this.performBenfordAnalysis(companyId, dataType);
          results[dataType] = analysis;
        } catch (error) {
          logger.error(`Error analyzing ${dataType}:`, error);
          results[dataType] = { error: error.message };
        }
      }

      return results;
    } catch (error) {
      logger.error('Error running comprehensive Benford analysis:', error);
      throw error;
    }
  }

  /**
   * Get Benford analysis report
   */
  async getBenfordAnalysisReport(companyId: string, analysisId: string): Promise<any> {
    try {
      const analysis = await prisma.benfordAnalysis.findUnique({
        where: { 
          id: analysisId,
          companyId 
        }
      });

      if (!analysis) {
        throw new Error('Benford analysis not found');
      }

      const benfordDistribution = JSON.parse(analysis.benfordDistribution);
      const actualDistribution = JSON.parse(analysis.actualDistribution);
      const anomalies = JSON.parse(analysis.anomalies);

      return {
        analysis,
        benfordDistribution,
        actualDistribution,
        anomalies,
        interpretation: this.interpretResults(analysis)
      };
    } catch (error) {
      logger.error('Error getting Benford analysis report:', error);
      throw error;
    }
  }

  /**
   * Interpret Benford analysis results
   */
  private interpretResults(analysis: any): any {
    const interpretation = {
      overallAssessment: '',
      riskLevel: '',
      recommendations: []
    };

    if (analysis.isSignificant) {
      interpretation.overallAssessment = 'Significant deviation from Benford\'s Law detected';
      interpretation.riskLevel = 'high';
      interpretation.recommendations.push('Investigate potential data manipulation');
      interpretation.recommendations.push('Review data entry processes');
      interpretation.recommendations.push('Consider additional fraud detection measures');
    } else {
      interpretation.overallAssessment = 'Data follows Benford\'s Law distribution';
      interpretation.riskLevel = 'low';
      interpretation.recommendations.push('Continue monitoring for changes');
      interpretation.recommendations.push('Maintain current data quality standards');
    }

    if (analysis.pValue < 0.01) {
      interpretation.riskLevel = 'critical';
      interpretation.recommendations.push('Immediate investigation required');
    }

    return interpretation;
  }
}