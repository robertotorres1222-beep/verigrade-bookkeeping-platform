import request from 'supertest';
import { app } from '../../index';
import { prisma } from '../setup';

describe('API Integration Tests', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Register and login to get token
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'integration@example.com',
        password: 'password123',
        firstName: 'Integration',
        lastName: 'Test',
      });

    authToken = registerResponse.body.data.token;
    userId = registerResponse.body.data.user.id;
  });

  describe('Complete Transaction Flow', () => {
    it('should create, read, update, and delete a transaction', async () => {
      // Create transaction
      const createResponse = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 250.75,
          description: 'Integration test transaction',
          type: 'income',
          category: 'sales',
          date: new Date().toISOString(),
        })
        .expect(201);

      const transactionId = createResponse.body.data.id;
      expect(createResponse.body.success).toBe(true);

      // Read transaction
      const readResponse = await request(app)
        .get(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(readResponse.body.data.amount).toBe(250.75);
      expect(readResponse.body.data.description).toBe('Integration test transaction');

      // Update transaction
      const updateResponse = await request(app)
        .put(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 300.00,
          description: 'Updated integration test transaction',
          category: 'services',
        })
        .expect(200);

      expect(updateResponse.body.data.amount).toBe(300.00);
      expect(updateResponse.body.data.description).toBe('Updated integration test transaction');

      // Delete transaction
      const deleteResponse = await request(app)
        .delete(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);
    });
  });

  describe('Complete Invoice Flow', () => {
    it('should create, read, update, and delete an invoice', async () => {
      // Create invoice
      const createResponse = await request(app)
        .post('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerName: 'Test Customer',
          customerEmail: 'customer@example.com',
          items: [
            {
              description: 'Test Item',
              quantity: 1,
              price: 100.00,
            },
          ],
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .expect(201);

      const invoiceId = createResponse.body.data.id;
      expect(createResponse.body.success).toBe(true);

      // Read invoice
      const readResponse = await request(app)
        .get(`/api/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(readResponse.body.data.customerName).toBe('Test Customer');
      expect(readResponse.body.data.total).toBe(100.00);

      // Update invoice
      const updateResponse = await request(app)
        .put(`/api/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerName: 'Updated Test Customer',
          status: 'sent',
        })
        .expect(200);

      expect(updateResponse.body.data.customerName).toBe('Updated Test Customer');
      expect(updateResponse.body.data.status).toBe('sent');

      // Delete invoice
      const deleteResponse = await request(app)
        .delete(`/api/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);
    });
  });

  describe('Complete Expense Flow', () => {
    it('should create, read, update, and delete an expense', async () => {
      // Create expense
      const createResponse = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 75.50,
          description: 'Integration test expense',
          category: 'office',
          date: new Date().toISOString(),
          receipt: 'test-receipt.jpg',
        })
        .expect(201);

      const expenseId = createResponse.body.data.id;
      expect(createResponse.body.success).toBe(true);

      // Read expense
      const readResponse = await request(app)
        .get(`/api/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(readResponse.body.data.amount).toBe(75.50);
      expect(readResponse.body.data.description).toBe('Integration test expense');

      // Update expense
      const updateResponse = await request(app)
        .put(`/api/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 85.00,
          description: 'Updated integration test expense',
          category: 'travel',
        })
        .expect(200);

      expect(updateResponse.body.data.amount).toBe(85.00);
      expect(updateResponse.body.data.description).toBe('Updated integration test expense');

      // Delete expense
      const deleteResponse = await request(app)
        .delete(`/api/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);
    });
  });

  describe('Authentication Flow', () => {
    it('should handle complete authentication flow', async () => {
      // Register new user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'authflow@example.com',
          password: 'password123',
          firstName: 'Auth',
          lastName: 'Flow',
        })
        .expect(201);

      expect(registerResponse.body.success).toBe(true);
      expect(registerResponse.body.data.token).toBeDefined();

      const token = registerResponse.body.data.token;

      // Get current user
      const meResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(meResponse.body.data.user.email).toBe('authflow@example.com');

      // Logout
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(logoutResponse.body.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid routes', async () => {
      const response = await request(app)
        .get('/api/invalid-route')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should handle server errors gracefully', async () => {
      // This would test error handling in a real scenario
      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('token');
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across operations', async () => {
      // Create multiple transactions
      const transactions = [];
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .post('/api/transactions')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            amount: 100 + i * 10,
            description: `Test transaction ${i + 1}`,
            type: 'income',
            category: 'sales',
            date: new Date().toISOString(),
          })
          .expect(201);

        transactions.push(response.body.data);
      }

      // Verify all transactions were created
      const listResponse = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(listResponse.body.data.transactions).toHaveLength(5);

      // Verify total amount calculation
      const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
      expect(totalAmount).toBe(600); // 100 + 110 + 120 + 130 + 140
    });
  });
});



