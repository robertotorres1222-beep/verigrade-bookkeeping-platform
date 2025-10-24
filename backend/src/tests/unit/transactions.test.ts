import request from 'supertest';
import { app } from '../../index';
import { prisma } from '../setup';

describe('Transactions', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Register and login to get token
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      });

    authToken = registerResponse.body.data.token;
    userId = registerResponse.body.data.user.id;
  });

  describe('POST /api/transactions', () => {
    it('should create a new transaction', async () => {
      const transactionData = {
        amount: 100.50,
        description: 'Test transaction',
        type: 'income',
        category: 'sales',
        date: new Date().toISOString(),
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.amount).toBe(transactionData.amount);
      expect(response.body.data.description).toBe(transactionData.description);
      expect(response.body.data.userId).toBe(userId);
    });

    it('should not create transaction without authentication', async () => {
      const transactionData = {
        amount: 100.50,
        description: 'Test transaction',
        type: 'income',
        category: 'sales',
        date: new Date().toISOString(),
      };

      const response = await request(app)
        .post('/api/transactions')
        .send(transactionData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('token');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });
  });

  describe('GET /api/transactions', () => {
    beforeEach(async () => {
      // Create test transactions
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 100.50,
          description: 'Test transaction 1',
          type: 'income',
          category: 'sales',
          date: new Date().toISOString(),
        });

      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 50.25,
          description: 'Test transaction 2',
          type: 'expense',
          category: 'office',
          date: new Date().toISOString(),
        });
    });

    it('should get all transactions for user', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transactions).toHaveLength(2);
    });

    it('should filter transactions by type', async () => {
      const response = await request(app)
        .get('/api/transactions?type=income')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transactions).toHaveLength(1);
      expect(response.body.data.transactions[0].type).toBe('income');
    });

    it('should filter transactions by category', async () => {
      const response = await request(app)
        .get('/api/transactions?category=sales')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transactions).toHaveLength(1);
      expect(response.body.data.transactions[0].category).toBe('sales');
    });

    it('should paginate transactions', async () => {
      const response = await request(app)
        .get('/api/transactions?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transactions).toHaveLength(1);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.totalPages).toBe(2);
    });
  });

  describe('GET /api/transactions/:id', () => {
    let transactionId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 100.50,
          description: 'Test transaction',
          type: 'income',
          category: 'sales',
          date: new Date().toISOString(),
        });

      transactionId = response.body.data.id;
    });

    it('should get transaction by ID', async () => {
      const response = await request(app)
        .get(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(transactionId);
      expect(response.body.data.amount).toBe(100.50);
    });

    it('should not get transaction with invalid ID', async () => {
      const response = await request(app)
        .get('/api/transactions/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PUT /api/transactions/:id', () => {
    let transactionId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 100.50,
          description: 'Test transaction',
          type: 'income',
          category: 'sales',
          date: new Date().toISOString(),
        });

      transactionId = response.body.data.id;
    });

    it('should update transaction', async () => {
      const updateData = {
        amount: 150.75,
        description: 'Updated transaction',
        category: 'services',
      };

      const response = await request(app)
        .put(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.amount).toBe(updateData.amount);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.category).toBe(updateData.category);
    });

    it('should not update transaction with invalid ID', async () => {
      const updateData = {
        amount: 150.75,
        description: 'Updated transaction',
      };

      const response = await request(app)
        .put('/api/transactions/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('DELETE /api/transactions/:id', () => {
    let transactionId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 100.50,
          description: 'Test transaction',
          type: 'income',
          category: 'sales',
          date: new Date().toISOString(),
        });

      transactionId = response.body.data.id;
    });

    it('should delete transaction', async () => {
      const response = await request(app)
        .delete(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');
    });

    it('should not delete transaction with invalid ID', async () => {
      const response = await request(app)
        .delete('/api/transactions/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });
});



