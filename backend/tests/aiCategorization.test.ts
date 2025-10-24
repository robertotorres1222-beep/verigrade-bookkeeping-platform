import request from 'supertest';
import { app } from '../src/index.enhanced';
import { categorizeTransaction, getCategorySuggestions } from '../src/services/aiCategorizerService';

// Mock OpenAI to avoid API calls in tests
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: JSON.stringify({
                  category: 'Office Supplies',
                  confidence: 0.9,
                  reasoning: 'Office Depot purchase clearly indicates office supplies'
                })
              }
            }]
          })
        }
      }
    }))
  };
});

describe('AI Categorization Service', () => {
  describe('categorizeTransaction', () => {
    it('should categorize office supply transactions correctly', async () => {
      const result = await categorizeTransaction({
        amount: 45.99,
        description: 'Office Depot - Printer Paper',
        merchant: 'Office Depot'
      });

      expect(result.category).toBe('Office Supplies');
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.reasoning).toBeDefined();
    });

    it('should categorize software subscriptions correctly', async () => {
      const result = await categorizeTransaction({
        amount: 29.99,
        description: 'Adobe Creative Cloud Monthly Subscription',
        merchant: 'Adobe'
      });

      expect(result.category).toBe('Software & SaaS');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should handle missing OpenAI API key gracefully', async () => {
      const originalApiKey = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      const result = await categorizeTransaction({
        amount: 100,
        description: 'Test transaction'
      });

      expect(result.category).toBe('Other');
      expect(result.confidence).toBe(0);
      expect(result.reasoning).toContain('OpenAI API key not configured');

      process.env.OPENAI_API_KEY = originalApiKey;
    });
  });

  describe('getCategorySuggestions', () => {
    it('should suggest office supplies for office-related descriptions', () => {
      const suggestions = getCategorySuggestions('Office Depot purchase for printer paper');
      expect(suggestions).toContain('Office Supplies');
    });

    it('should suggest software for subscription descriptions', () => {
      const suggestions = getCategorySuggestions('Adobe Creative Cloud subscription');
      expect(suggestions).toContain('Software & SaaS');
    });

    it('should suggest meals for food-related descriptions', () => {
      const suggestions = getCategorySuggestions('Business lunch with client');
      expect(suggestions).toContain('Meals & Entertainment');
    });

    it('should suggest travel for hotel descriptions', () => {
      const suggestions = getCategorySuggestions('Hotel accommodation for business trip');
      expect(suggestions).toContain('Travel');
    });
  });
});

describe('Transaction API Endpoints', () => {
  let authToken: string;

  beforeAll(async () => {
    // Mock authentication - in real tests you'd create a test user
    authToken = 'mock-jwt-token';
  });

  describe('POST /api/transactions/categorize', () => {
    it('should enqueue a categorization job', async () => {
      const response = await request(app)
        .post('/api/transactions/categorize')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          transactionId: 'test-transaction-id',
          amount: 45.99,
          description: 'Office Depot - Printer Paper'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('jobId');
      expect(response.body.data).toHaveProperty('transactionId');
      expect(response.body.data).toHaveProperty('status', 'queued');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/transactions/categorize')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing transactionId
          amount: 45.99,
          description: 'Test transaction'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Invalid input data');
    });
  });

  describe('POST /api/transactions/bulk-categorize', () => {
    it('should enqueue multiple categorization jobs', async () => {
      const response = await request(app)
        .post('/api/transactions/bulk-categorize')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          transactionIds: ['transaction-1', 'transaction-2', 'transaction-3']
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('queuedTransactions', 3);
    });

    it('should limit bulk operations to 50 transactions', async () => {
      const transactionIds = Array.from({ length: 51 }, (_, i) => `transaction-${i}`);
      
      const response = await request(app)
        .post('/api/transactions/bulk-categorize')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ transactionIds });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/transactions/suggestions/:id', () => {
    it('should return category suggestions for a transaction', async () => {
      const response = await request(app)
        .get('/api/transactions/suggestions/test-transaction-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('suggestions');
      expect(Array.isArray(response.body.data.suggestions)).toBe(true);
    });
  });
});

describe('Queue Worker Status', () => {
  describe('GET /api/queue/status', () => {
    it('should return queue status when Redis is configured', async () => {
      const originalRedisUrl = process.env.REDIS_URL;
      process.env.REDIS_URL = 'redis://localhost:6379/0';

      const response = await request(app)
        .get('/api/queue/status')
        .set('Authorization', `Bearer mock-jwt-token`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('status');

      process.env.REDIS_URL = originalRedisUrl;
    });

    it('should return disabled status when Redis is not configured', async () => {
      const originalRedisUrl = process.env.REDIS_URL;
      delete process.env.REDIS_URL;

      const response = await request(app)
        .get('/api/queue/status')
        .set('Authorization', `Bearer mock-jwt-token`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('disabled');

      process.env.REDIS_URL = originalRedisUrl;
    });
  });
});

describe('System Status', () => {
  describe('GET /api/system/status', () => {
    it('should return system status information', async () => {
      const response = await request(app)
        .get('/api/system/status')
        .set('Authorization', `Bearer mock-jwt-token`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('database');
      expect(response.body.data).toHaveProperty('redis');
      expect(response.body.data).toHaveProperty('openai');
      expect(response.body.data).toHaveProperty('s3');
    });
  });
});












