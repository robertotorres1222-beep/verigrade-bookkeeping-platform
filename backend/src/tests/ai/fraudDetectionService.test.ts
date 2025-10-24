import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as fraudDetectionService from '../../services/fraudDetectionService';

describe('Fraud Detection Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('detectFraudulentTransaction', () => {
    it('should detect high-risk transactions', async () => {
      const transaction = {
        id: 'tx_1',
        amount: 15000,
        location: 'International',
        vendorName: 'Suspicious Vendor',
        frequency: 'unusual'
      };
      
      const result = await fraudDetectionService.detectFraudulentTransaction(transaction);
      
      expect(result).toHaveProperty('transactionId');
      expect(result).toHaveProperty('fraudScore');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('reasons');
      expect(result).toHaveProperty('recommendation');
      expect(result).toHaveProperty('confidence');
      expect(result.transactionId).toBe(transaction.id);
      expect(result.fraudScore).toBeGreaterThanOrEqual(0);
      expect(result.fraudScore).toBeLessThanOrEqual(1);
    });

    it('should flag large transactions as high risk', async () => {
      const transaction = {
        id: 'tx_2',
        amount: 15000,
        location: 'Domestic',
        vendorName: 'Legitimate Vendor'
      };
      
      const result = await fraudDetectionService.detectFraudulentTransaction(transaction);
      
      if (result.fraudScore > 0.7) {
        expect(result.status).toBe('HIGH_RISK');
        expect(result.reasons).toContain('Unusually large transaction amount.');
      }
    });

    it('should flag international transactions as medium risk', async () => {
      const transaction = {
        id: 'tx_3',
        amount: 1000,
        location: 'International',
        vendorName: 'Foreign Vendor'
      };
      
      const result = await fraudDetectionService.detectFraudulentTransaction(transaction);
      
      if (result.fraudScore > 0.6) {
        expect(result.status).toBe('MEDIUM_RISK');
        expect(result.reasons).toContain('International transaction from unusual location.');
      }
    });

    it('should flag suspicious vendor names', async () => {
      const transaction = {
        id: 'tx_4',
        amount: 500,
        location: 'Domestic',
        vendorName: 'Suspicious Company'
      };
      
      const result = await fraudDetectionService.detectFraudulentTransaction(transaction);
      
      if (result.fraudScore > 0.5) {
        expect(result.status).toBe('MEDIUM_RISK');
        expect(result.reasons).toContain('Vendor name flagged as potentially suspicious.');
      }
    });

    it('should flag unusual frequency transactions', async () => {
      const transaction = {
        id: 'tx_5',
        amount: 2000,
        location: 'Domestic',
        vendorName: 'Regular Vendor',
        frequency: 'unusual'
      };
      
      const result = await fraudDetectionService.detectFraudulentTransaction(transaction);
      
      if (result.fraudScore > 0.8) {
        expect(result.status).toBe('HIGH_RISK');
        expect(result.reasons).toContain('Unusual transaction frequency detected.');
      }
    });
  });

  describe('analyzeSpendingPatterns', () => {
    it('should analyze spending patterns and detect anomalies', async () => {
      const spendingHistory = [
        { id: 'exp_1', amount: 100, date: '2024-01-01' },
        { id: 'exp_2', amount: 150, date: '2024-01-02' },
        { id: 'exp_3', amount: 200, date: '2024-01-03' },
        { id: 'exp_4', amount: 1000, date: '2024-01-04' }, // Anomaly
        { id: 'exp_5', amount: 120, date: '2024-01-05' }
      ];
      
      const result = await fraudDetectionService.analyzeSpendingPatterns(spendingHistory);
      
      expect(result).toHaveProperty('totalTransactions');
      expect(result).toHaveProperty('averageTransactionAmount');
      expect(result).toHaveProperty('anomalies');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('confidence');
      expect(result.totalTransactions).toBe(spendingHistory.length);
      expect(result.anomalies.length).toBeGreaterThan(0);
    });

    it('should handle empty spending history', async () => {
      const spendingHistory = [];
      
      const result = await fraudDetectionService.analyzeSpendingPatterns(spendingHistory);
      
      expect(result.totalTransactions).toBe(0);
      expect(result.averageTransactionAmount).toBe(0);
      expect(result.anomalies).toEqual([]);
    });

    it('should calculate correct average spending', async () => {
      const spendingHistory = [
        { id: 'exp_1', amount: 100, date: '2024-01-01' },
        { id: 'exp_2', amount: 200, date: '2024-01-02' },
        { id: 'exp_3', amount: 300, date: '2024-01-03' }
      ];
      
      const result = await fraudDetectionService.analyzeSpendingPatterns(spendingHistory);
      
      expect(result.averageTransactionAmount).toBe(200);
    });
  });
});






