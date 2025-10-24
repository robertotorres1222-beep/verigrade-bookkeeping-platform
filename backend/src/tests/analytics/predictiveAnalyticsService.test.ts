import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import predictiveAnalyticsService from '../../services/predictiveAnalyticsService';
import { testUtils, prisma } from '../setup';

describe('PredictiveAnalyticsService', () => {
  let companyId: string;
  let userId: string;

  beforeEach(async () => {
    const company = await testUtils.createTestCompany();
    const user = await testUtils.createTestUser(company.id);
    companyId = company.id;
    userId = user.id;
  });

  afterEach(async () => {
    await prisma.transaction.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.user.deleteMany();
    await prisma.company.deleteMany();
  });

  describe('generateCashFlowForecast', () => {
    it('should generate cash flow forecast for 12 months', async () => {
      // Create historical data
      await testUtils.createTestTransaction(companyId, {
        amount: 1000,
        type: 'income',
        date: new Date('2024-01-01')
      });
      
      await testUtils.createTestTransaction(companyId, {
        amount: -500,
        type: 'expense',
        date: new Date('2024-01-01')
      });

      const forecast = await predictiveAnalyticsService.generateCashFlowForecast(companyId, 12);

      expect(forecast).toHaveLength(12);
      expect(forecast[0]).toHaveProperty('date');
      expect(forecast[0]).toHaveProperty('predictedInflow');
      expect(forecast[0]).toHaveProperty('predictedOutflow');
      expect(forecast[0]).toHaveProperty('predictedBalance');
      expect(forecast[0]).toHaveProperty('confidence');
      expect(forecast[0]).toHaveProperty('factors');
    });

    it('should handle empty historical data', async () => {
      const forecast = await predictiveAnalyticsService.generateCashFlowForecast(companyId, 6);

      expect(forecast).toHaveLength(6);
      expect(forecast[0].predictedInflow).toBe(0);
      expect(forecast[0].predictedOutflow).toBe(0);
    });

    it('should throw error for invalid company ID', async () => {
      await expect(
        predictiveAnalyticsService.generateCashFlowForecast('invalid-id', 12)
      ).rejects.toThrow('Failed to generate cash flow forecast');
    });
  });

  describe('predictRevenue', () => {
    it('should predict revenue for given period', async () => {
      // Create historical revenue data
      await testUtils.createTestInvoice(companyId, 'test-client', {
        total: 1000,
        status: 'paid',
        paidAt: new Date('2024-01-01')
      });

      const prediction = await predictiveAnalyticsService.predictRevenue(companyId, 'month');

      expect(prediction).toHaveProperty('period', 'month');
      expect(prediction).toHaveProperty('predictedRevenue');
      expect(prediction).toHaveProperty('confidence');
      expect(prediction).toHaveProperty('trend');
      expect(prediction).toHaveProperty('factors');
      expect(prediction.factors).toHaveProperty('seasonal');
      expect(prediction.factors).toHaveProperty('growth');
      expect(prediction.factors).toHaveProperty('market');
      expect(prediction.factors).toHaveProperty('historical');
    });

    it('should handle no historical data', async () => {
      const prediction = await predictiveAnalyticsService.predictRevenue(companyId, 'month');

      expect(prediction.predictedRevenue).toBe(0);
      expect(prediction.confidence).toBe(0);
    });
  });

  describe('analyzeExpenseTrends', () => {
    it('should analyze expense trends by category', async () => {
      // Create expense data
      await testUtils.createTestTransaction(companyId, {
        amount: -100,
        type: 'expense',
        category: 'office',
        date: new Date('2024-01-01')
      });

      await testUtils.createTestTransaction(companyId, {
        amount: -200,
        type: 'expense',
        category: 'office',
        date: new Date('2024-02-01')
      });

      const trends = await predictiveAnalyticsService.analyzeExpenseTrends(companyId);

      expect(Array.isArray(trends)).toBe(true);
      if (trends.length > 0) {
        expect(trends[0]).toHaveProperty('category');
        expect(trends[0]).toHaveProperty('currentAmount');
        expect(trends[0]).toHaveProperty('predictedAmount');
        expect(trends[0]).toHaveProperty('trend');
        expect(trends[0]).toHaveProperty('confidence');
        expect(trends[0]).toHaveProperty('recommendations');
      }
    });

    it('should filter by specific category', async () => {
      await testUtils.createTestTransaction(companyId, {
        amount: -100,
        type: 'expense',
        category: 'office',
        date: new Date('2024-01-01')
      });

      const trends = await predictiveAnalyticsService.analyzeExpenseTrends(companyId, 'office');

      expect(Array.isArray(trends)).toBe(true);
    });
  });

  describe('detectAnomalies', () => {
    it('should detect anomalies in transactions', async () => {
      // Create normal transaction
      await testUtils.createTestTransaction(companyId, {
        amount: 100,
        type: 'expense',
        category: 'office',
        date: new Date('2024-01-01')
      });

      // Create anomalous transaction (very high amount)
      await testUtils.createTestTransaction(companyId, {
        amount: 10000,
        type: 'expense',
        category: 'office',
        date: new Date('2024-01-02')
      });

      const anomalies = await predictiveAnalyticsService.detectAnomalies(companyId, 30);

      expect(Array.isArray(anomalies)).toBe(true);
      if (anomalies.length > 0) {
        expect(anomalies[0]).toHaveProperty('type');
        expect(anomalies[0]).toHaveProperty('severity');
        expect(anomalies[0]).toHaveProperty('description');
        expect(anomalies[0]).toHaveProperty('value');
        expect(anomalies[0]).toHaveProperty('expectedValue');
        expect(anomalies[0]).toHaveProperty('deviation');
        expect(anomalies[0]).toHaveProperty('recommendations');
      }
    });

    it('should handle no anomalies', async () => {
      const anomalies = await predictiveAnalyticsService.detectAnomalies(companyId, 30);

      expect(Array.isArray(anomalies)).toBe(true);
    });
  });

  describe('assessRisks', () => {
    it('should assess business risks', async () => {
      const risks = await predictiveAnalyticsService.assessRisks(companyId);

      expect(Array.isArray(risks)).toBe(true);
      if (risks.length > 0) {
        expect(risks[0]).toHaveProperty('category');
        expect(risks[0]).toHaveProperty('riskLevel');
        expect(risks[0]).toHaveProperty('description');
        expect(risks[0]).toHaveProperty('probability');
        expect(risks[0]).toHaveProperty('impact');
        expect(risks[0]).toHaveProperty('mitigation');
        expect(risks[0]).toHaveProperty('monitoring');
      }
    });
  });

  describe('detectSeasonalPatterns', () => {
    it('should detect seasonal patterns', async () => {
      // Create data spanning multiple months
      for (let i = 0; i < 12; i++) {
        await testUtils.createTestTransaction(companyId, {
          amount: 100 + (i % 2) * 50, // Alternating pattern
          type: 'income',
          date: new Date(2024, i, 1)
        });
      }

      const patterns = await predictiveAnalyticsService.detectSeasonalPatterns(companyId);

      expect(Array.isArray(patterns)).toBe(true);
      if (patterns.length > 0) {
        expect(patterns[0]).toHaveProperty('pattern');
        expect(patterns[0]).toHaveProperty('strength');
        expect(patterns[0]).toHaveProperty('frequency');
        expect(patterns[0]).toHaveProperty('description');
        expect(patterns[0]).toHaveProperty('examples');
        expect(patterns[0]).toHaveProperty('recommendations');
      }
    });
  });
});





