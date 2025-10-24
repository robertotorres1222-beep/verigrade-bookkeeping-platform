// Authentication Tests
import request from 'supertest';
import { app } from '../src/index';
import { prisma } from '../src/config/database';

describe('Authentication API', () => {
  beforeAll(async () => {
    // Setup test database
    await prisma.$connect();
  });

  afterAll(async () => {
    // Cleanup
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: `test${Date.now()}@example.com`,
          password: 'Test123!@#',
          firstName: 'Test',
          lastName: 'User',
          organizationName: 'Test Org'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toContain('@example.com');
    });

    it('should reject weak passwords', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '123',
          firstName: 'Test',
          lastName: 'User',
          organizationName: 'Test Org'
        });

      expect(res.status).toBe(400);
    });

    it('should reject duplicate emails', async () => {
      const email = `duplicate${Date.now()}@example.com`;
      
      await request(app)
        .post('/api/auth/register')
        .send({
          email,
          password: 'Test123!@#',
          firstName: 'Test',
          lastName: 'User',
          organizationName: 'Test Org'
        });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email,
          password: 'Test123!@#',
          firstName: 'Test',
          lastName: 'User',
          organizationName: 'Test Org'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    const testEmail = `login${Date.now()}@example.com`;
    const testPassword = 'Test123!@#';

    beforeAll(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          firstName: 'Test',
          lastName: 'User',
          organizationName: 'Test Org'
        });
    });

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
    });

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword123'
        });

      expect(res.status).toBe(401);
    });

    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testPassword
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    let token: string;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: `me${Date.now()}@example.com`,
          password: 'Test123!@#',
          firstName: 'Test',
          lastName: 'User',
          organizationName: 'Test Org'
        });

      token = res.body.token;
    });

    it('should get current user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email');
    });

    it('should reject request without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
    });

    it('should reject request with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });
  });
});








