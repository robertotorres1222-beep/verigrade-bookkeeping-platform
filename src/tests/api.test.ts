import { testUtils, testConfig, TestRunner } from '../utils/testUtils';

// API Testing Suite
export class ApiTestSuite {
  private runner = new TestRunner();

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting API Test Suite...');

    // Authentication Tests
    await this.testAuthentication();
    
    // User Management Tests
    await this.testUserManagement();
    
    // Transaction Tests
    await this.testTransactions();
    
    // Client Management Tests
    await this.testClientManagement();
    
    // Data Validation Tests
    await this.testDataValidation();
    
    // Error Handling Tests
    await this.testErrorHandling();
    
    // Performance Tests
    await this.testPerformance();
    
    // Security Tests
    await this.testSecurity();

    // Print results
    const results = this.runner.getResults();
    this.printResults(results);
  }

  private async testAuthentication(): Promise<void> {
    console.log('🔐 Testing Authentication...');

    await this.runner.runTest('Login with valid credentials', async () => {
      const response = await fetch(`${testConfig.api.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status}`);
      }

      const data = await response.json();
      if (!data.token) {
        throw new Error('No token returned');
      }
    });

    await this.runner.runTest('Login with invalid credentials', async () => {
      const response = await fetch(`${testConfig.api.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'invalid@example.com',
          password: 'wrongpassword'
        })
      });

      if (response.ok) {
        throw new Error('Login should have failed with invalid credentials');
      }
    });

    await this.runner.runTest('Register new user', async () => {
      const response = await fetch(`${testConfig.api.baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'newuser@example.com',
          password: 'password123',
          firstName: 'New',
          lastName: 'User'
        })
      });

      if (!response.ok) {
        throw new Error(`Registration failed: ${response.status}`);
      }
    });

    await this.runner.runTest('Token refresh', async () => {
      // First login to get token
      const loginResponse = await fetch(`${testConfig.api.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });

      const loginData = await loginResponse.json();
      
      // Test token refresh
      const refreshResponse = await fetch(`${testConfig.api.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.token}`
        }
      });

      if (!refreshResponse.ok) {
        throw new Error(`Token refresh failed: ${refreshResponse.status}`);
      }
    });
  }

  private async testUserManagement(): Promise<void> {
    console.log('👥 Testing User Management...');

    let authToken: string;

    // Get auth token first
    await this.runner.runTest('Get auth token for user tests', async () => {
      const response = await fetch(`${testConfig.api.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });

      const data = await response.json();
      authToken = data.token;
    });

    await this.runner.runTest('Get users list', async () => {
      const response = await fetch(`${testConfig.api.baseUrl}/users`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (!response.ok) {
        throw new Error(`Get users failed: ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Users should be an array');
      }
    });

    await this.runner.runTest('Create new user', async () => {
      const response = await fetch(`${testConfig.api.baseUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          firstName: 'Test',
          lastName: 'User',
          email: 'testuser@example.com',
          role: 'user'
        })
      });

      if (!response.ok) {
        throw new Error(`Create user failed: ${response.status}`);
      }
    });

    await this.runner.runTest('Update user', async () => {
      const response = await fetch(`${testConfig.api.baseUrl}/users/1`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          firstName: 'Updated',
          lastName: 'User'
        })
      });

      if (!response.ok) {
        throw new Error(`Update user failed: ${response.status}`);
      }
    });

    await this.runner.runTest('Delete user', async () => {
      const response = await fetch(`${testConfig.api.baseUrl}/users/1`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (!response.ok) {
        throw new Error(`Delete user failed: ${response.status}`);
      }
    });
  }

  private async testTransactions(): Promise<void> {
    console.log('💰 Testing Transactions...');

    let authToken: string;

    await this.runner.runTest('Get auth token for transaction tests', async () => {
      const response = await fetch(`${testConfig.api.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });

      const data = await response.json();
      authToken = data.token;
    });

    await this.runner.runTest('Get transactions list', async () => {
      const response = await fetch(`${testConfig.api.baseUrl}/transactions`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (!response.ok) {
        throw new Error(`Get transactions failed: ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Transactions should be an array');
      }
    });

    await this.runner.runTest('Create transaction', async () => {
      const response = await fetch(`${testConfig.api.baseUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          amount: 1500.00,
          description: 'Test transaction',
          category: 'Expense',
          date: '2024-01-15'
        })
      });

      if (!response.ok) {
        throw new Error(`Create transaction failed: ${response.status}`);
      }
    });

    await this.runner.runTest('Update transaction', async () => {
      const response = await fetch(`${testConfig.api.baseUrl}/transactions/1`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          amount: 2000.00,
          description: 'Updated transaction'
        })
      });

      if (!response.ok) {
        throw new Error(`Update transaction failed: ${response.status}`);
      }
    });

    await this.runner.runTest('Delete transaction', async () => {
      const response = await fetch(`${testConfig.api.baseUrl}/transactions/1`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (!response.ok) {
        throw new Error(`Delete transaction failed: ${response.status}`);
      }
    });
  }

  private async testClientManagement(): Promise<void> {
    console.log('🏢 Testing Client Management...');

    let authToken: string;

    await this.runner.runTest('Get auth token for client tests', async () => {
      const response = await fetch(`${testConfig.api.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });

      const data = await response.json();
      authToken = data.token;
    });

    await this.runner.runTest('Get clients list', async () => {
      const response = await fetch(`${testConfig.api.baseUrl}/clients`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (!response.ok) {
        throw new Error(`Get clients failed: ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Clients should be an array');
      }
    });

    await this.runner.runTest('Create client', async () => {
      const response = await fetch(`${testConfig.api.baseUrl}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: 'Test Client',
          email: 'client@example.com',
          phone: '+1-555-0123',
          industry: 'Technology'
        })
      });

      if (!response.ok) {
        throw new Error(`Create client failed: ${response.status}`);
      }
    });
  }

  private async testDataValidation(): Promise<void> {
    console.log('✅ Testing Data Validation...');

    await this.runner.runTest('Validate required fields', async () => {
      const response = await fetch(`${testConfig.api.baseUrl}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Missing required fields
        })
      });

      if (response.ok) {
        throw new Error('Should have failed validation for missing required fields');
      }
    });

    await this.runner.runTest('Validate email format', async () => {
      const response = await fetch(`${testConfig.api.baseUrl}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'Test',
          lastName: 'User',
          email: 'invalid-email-format',
          role: 'user'
        })
      });

      if (response.ok) {
        throw new Error('Should have failed validation for invalid email format');
      }
    });

    await this.runner.runTest('Validate numeric fields', async () => {
      const response = await fetch(`${testConfig.api.baseUrl}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 'not-a-number',
          description: 'Test transaction',
          category: 'Expense'
        })
      });

      if (response.ok) {
        throw new Error('Should have failed validation for non-numeric amount');
      }
    });
  }

  private async testErrorHandling(): Promise<void> {
    console.log('⚠️ Testing Error Handling...');

    await this.runner.runTest('Handle 404 errors', async () => {
      const response = await fetch(`${testConfig.api.baseUrl}/nonexistent-endpoint`);
      
      if (response.status !== 404) {
        throw new Error(`Expected 404, got ${response.status}`);
      }
    });

    await this.runner.runTest('Handle 401 unauthorized', async () => {
      const response = await fetch(`${testConfig.api.baseUrl}/users`);
      
      if (response.status !== 401) {
        throw new Error(`Expected 401, got ${response.status}`);
      }
    });

    await this.runner.runTest('Handle 500 server errors', async () => {
      const response = await fetch(`${testConfig.api.baseUrl}/error-endpoint`);
      
      if (response.status !== 500) {
        throw new Error(`Expected 500, got ${response.status}`);
      }
    });
  }

  private async testPerformance(): Promise<void> {
    console.log('⚡ Testing Performance...');

    await this.runner.runTest('API response time under 1 second', async () => {
      const start = performance.now();
      
      const response = await fetch(`${testConfig.api.baseUrl}/users`, {
        headers: { 'Authorization': `Bearer test-token` }
      });
      
      const duration = performance.now() - start;
      
      if (duration > testConfig.performance.maxApiResponseTime) {
        throw new Error(`API response time ${duration}ms exceeds limit of ${testConfig.performance.maxApiResponseTime}ms`);
      }
    });

    await this.runner.runTest('Concurrent requests handling', async () => {
      const promises = Array.from({ length: 10 }, () => 
        fetch(`${testConfig.api.baseUrl}/users`, {
          headers: { 'Authorization': `Bearer test-token` }
        })
      );

      const responses = await Promise.all(promises);
      
      const failedResponses = responses.filter(r => !r.ok);
      if (failedResponses.length > 0) {
        throw new Error(`${failedResponses.length} concurrent requests failed`);
      }
    });

    await this.runner.runTest('Large dataset handling', async () => {
      const response = await fetch(`${testConfig.api.baseUrl}/transactions?limit=1000`, {
        headers: { 'Authorization': `Bearer test-token` }
      });

      if (!response.ok) {
        throw new Error(`Large dataset request failed: ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Large dataset should return array of transactions');
      }
    });
  }

  private async testSecurity(): Promise<void> {
    console.log('🔒 Testing Security...');

    await this.runner.runTest('SQL injection protection', async () => {
      const maliciousInput = "'; DROP TABLE users; --";
      
      const response = await fetch(`${testConfig.api.baseUrl}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: maliciousInput,
          lastName: 'Test',
          email: 'test@example.com',
          role: 'user'
        })
      });

      // Should not crash the server
      if (response.status >= 500) {
        throw new Error('Server should handle malicious input gracefully');
      }
    });

    await this.runner.runTest('XSS protection', async () => {
      const xssPayload = '<script>alert("xss")</script>';
      
      const response = await fetch(`${testConfig.api.baseUrl}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: xssPayload,
          lastName: 'Test',
          email: 'test@example.com',
          role: 'user'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.firstName.includes('<script>')) {
          throw new Error('XSS payload should be sanitized');
        }
      }
    });

    await this.runner.runTest('Rate limiting', async () => {
      const promises = Array.from({ length: 100 }, () => 
        fetch(`${testConfig.api.baseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123'
          })
        })
      );

      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      
      if (rateLimitedResponses.length === 0) {
        throw new Error('Rate limiting should be enforced');
      }
    });
  }

  private printResults(results: any): void {
    console.log('\n📊 Test Results Summary:');
    console.log(`Total Tests: ${results.summary.total}`);
    console.log(`✅ Passed: ${results.summary.passed}`);
    console.log(`❌ Failed: ${results.summary.failed}`);
    console.log(`⏭️ Skipped: ${results.summary.skipped}`);
    console.log(`⏱️ Total Duration: ${results.summary.duration.toFixed(2)}ms`);
    
    if (results.summary.failed > 0) {
      console.log('\n❌ Failed Tests:');
      results.tests
        .filter((test: any) => test.status === 'fail')
        .forEach((test: any) => {
          console.log(`  - ${test.name}: ${test.error}`);
        });
    }
    
    console.log('\n🎉 API Testing Complete!');
  }
}

// Export for use in other test files
export const apiTestSuite = new ApiTestSuite();

