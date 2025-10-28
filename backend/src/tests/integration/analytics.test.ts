import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import app from '../../index';
import { testUtils, prisma } from '../setup';

describe('Analytics API Integration Tests', () => {
  let companyId: string;
  let userId: string;
  let authToken: string;

  beforeEach(async () => {
    const company = await testUtils.createTestCompany();
    const user = await testUtils.createTestUser(company.id);
    companyId = company.id;
    userId = user.id;
    
    // Mock auth token (in real tests, you'd generate a proper JWT)
    authToken = 'test-token';
  });

  afterEach(async () => {
    await prisma.transaction.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.user.deleteMany();
    await prisma.company.deleteMany();
  });

  describe('GET /api/analytics/companies/:companyId/cash-flow-forecast', () => {
    it('should return cash flow forecast', async () => {
      // Create test data
      await testUtils.createTestTransaction(companyId, {
        amount: 1000,
        type: 'income',
        date: new Date('2024-01-01')
      });

      const response = await request(app)
        .get(`/api/analytics/companies/${companyId}/cash-flow-forecast`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ months: 6 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(6);
      expect(response.body.data[0]).toHaveProperty('date');
      expect(response.body.data[0]).toHaveProperty('predictedInflow');
      expect(response.body.data[0]).toHaveProperty('predictedOutflow');
      expect(response.body.data[0]).toHaveProperty('predictedBalance');
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .get(`/api/analytics/companies/${companyId}/cash-flow-forecast`);

      expect(response.status).toBe(401);
    });

    it('should return 500 for invalid company ID', async () => {
      const response = await request(app)
        .get('/api/analytics/companies/invalid-id/cash-flow-forecast')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/analytics/companies/:companyId/revenue-prediction', () => {
    it('should return revenue prediction', async () => {
      const response = await request(app)
        .get(`/api/analytics/companies/${companyId}/revenue-prediction`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ period: 'month' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('period');
      expect(response.body.data).toHaveProperty('predictedRevenue');
      expect(response.body.data).toHaveProperty('confidence');
      expect(response.body.data).toHaveProperty('trend');
    });
  });

  describe('GET /api/analytics/companies/:companyId/expense-trends', () => {
    it('should return expense trends', async () => {
      // Create test expense data
      await testUtils.createTestTransaction(companyId, {
        amount: -100,
        type: 'expense',
        category: 'office',
        date: new Date('2024-01-01')
      });

      const response = await request(app)
        .get(`/api/analytics/companies/${companyId}/expense-trends`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by category', async () => {
      const response = await request(app)
        .get(`/api/analytics/companies/${companyId}/expense-trends`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ category: 'office' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/analytics/companies/:companyId/anomalies', () => {
    it('should return anomalies', async () => {
      const response = await request(app)
        .get(`/api/analytics/companies/${companyId}/anomalies`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ days: 30 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/analytics/companies/:companyId/risks', () => {
    it('should return risk assessment', async () => {
      const response = await request(app)
        .get(`/api/analytics/companies/${companyId}/risks`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/analytics/companies/:companyId/seasonal-patterns', () => {
    it('should return seasonal patterns', async () => {
      const response = await request(app)
        .get(`/api/analytics/companies/${companyId}/seasonal-patterns`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/analytics/ml-models', () => {
    it('should return ML models', async () => {
      const response = await request(app)
        .get('/api/analytics/ml-models')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/analytics/ml-models/:modelId/predict', () => {
    it('should make ML prediction', async () => {
      const response = await request(app)
        .post('/api/analytics/ml-models/expense_categorization/predict')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          input: {
            description: 'Office supplies',
            amount: 150.00,
            vendor: 'Amazon'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('modelId');
      expect(response.body.data).toHaveProperty('prediction');
      expect(response.body.data).toHaveProperty('confidence');
    });
  });

  describe('GET /api/analytics/companies/:companyId/kpis', () => {
    it('should return KPIs', async () => {
      const response = await request(app)
        .get(`/api/analytics/companies/${companyId}/kpis`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ period: 'month' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/analytics/companies/:companyId/dashboards', () => {
    it('should create dashboard', async () => {
      const dashboardData = {
        name: 'Test Dashboard',
        description: 'Test dashboard description',
        widgets: [
          {
            type: 'kpi',
            title: 'Revenue',
            data: { metric: 'revenue' },
            position: { x: 0, y: 0, width: 6, height: 4 }
          }
        ],
        layout: {
          columns: 12,
          rows: 8,
          gap: 16,
          padding: 16
        },
        filters: []
      };

      const response = await request(app)
        .post(`/api/analytics/companies/${companyId}/dashboards`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(dashboardData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', 'Test Dashboard');
    });
  });

  describe('GET /api/analytics/companies/:companyId/dashboards', () => {
    it('should return dashboards', async () => {
      const response = await request(app)
        .get(`/api/analytics/companies/${companyId}/dashboards`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/analytics/companies/:companyId/performance-metrics', () => {
    it('should return performance metrics', async () => {
      const response = await request(app)
        .get(`/api/analytics/companies/${companyId}/performance-metrics`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ period: 'month' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/analytics/companies/:companyId/benchmarks', () => {
    it('should return benchmarks', async () => {
      const response = await request(app)
        .get(`/api/analytics/companies/${companyId}/benchmarks`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ industry: 'technology' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/analytics/companies/:companyId/market-insights', () => {
    it('should return market insights', async () => {
      const response = await request(app)
        .get(`/api/analytics/companies/${companyId}/market-insights`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ industry: 'technology' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/analytics/companies/:companyId/competitive-analysis', () => {
    it('should return competitive analysis', async () => {
      const response = await request(app)
        .get(`/api/analytics/companies/${companyId}/competitive-analysis`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ industry: 'technology' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/analytics/companies/:companyId/executive-summary', () => {
    it('should return executive summary', async () => {
      const response = await request(app)
        .get(`/api/analytics/companies/${companyId}/executive-summary`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('overview');
      expect(response.body.data).toHaveProperty('keyMetrics');
      expect(response.body.data).toHaveProperty('trends');
      expect(response.body.data).toHaveProperty('recommendations');
    });
  });

  describe('POST /api/analytics/companies/:companyId/reports', () => {
    it('should create report', async () => {
      const reportData = {
        name: 'Test Report',
        description: 'Test report description',
        type: 'financial',
        template: {
          sections: [
            {
              type: 'chart',
              title: 'Revenue Trend',
              data: { source: 'revenue_data' },
              config: { chartType: 'line' }
            }
          ]
        },
        data: {
          source: 'transactions',
          query: 'SELECT * FROM transactions WHERE date >= ?',
          parameters: { startDate: '2024-01-01' }
        },
        filters: []
      };

      const response = await request(app)
        .post(`/api/analytics/companies/${companyId}/reports`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', 'Test Report');
    });
  });

  describe('GET /api/analytics/companies/:companyId/reports', () => {
    it('should return reports', async () => {
      const response = await request(app)
        .get(`/api/analytics/companies/${companyId}/reports`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/analytics/reports/:reportId/execute', () => {
    it('should execute report', async () => {
      // First create a report
      const reportData = {
        name: 'Test Report',
        description: 'Test report description',
        type: 'financial',
        template: { sections: [] },
        data: { source: 'transactions', query: 'SELECT * FROM transactions' },
        filters: []
      };

      const createResponse = await request(app)
        .post(`/api/analytics/companies/${companyId}/reports`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportData);

      const reportId = createResponse.body.data.id;

      const response = await request(app)
        .post(`/api/analytics/reports/${reportId}/execute`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ parameters: {} });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('reportId');
      expect(response.body.data).toHaveProperty('status');
    });
  });

  describe('GET /api/analytics/report-templates', () => {
    it('should return report templates', async () => {
      const response = await request(app)
        .get('/api/analytics/report-templates')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});









