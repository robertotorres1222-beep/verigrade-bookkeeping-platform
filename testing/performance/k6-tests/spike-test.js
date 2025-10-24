import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');
const responseTime = new Trend('response_time');

// Test configuration - Spike test
export const options = {
  stages: [
    { duration: '1m', target: 100 },   // Normal load
    { duration: '30s', target: 1000 }, // Sudden spike
    { duration: '1m', target: 1000 },  // Sustained spike
    { duration: '30s', target: 100 },  // Back to normal
    { duration: '1m', target: 100 },   // Recovery period
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'],
    http_req_failed: ['rate<0.3'],
    error_rate: ['rate<0.25'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function() {
  const user = { email: 'user1@test.com', password: 'password123' };
  
  // Login
  const loginResponse = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  const loginSuccess = check(loginResponse, {
    'login status is 200': (r) => r.status === 200,
    'login response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  errorRate.add(!loginSuccess);
  responseTime.add(loginResponse.timings.duration);

  if (loginSuccess) {
    const token = JSON.parse(loginResponse.body).token;
    
    // Test API endpoints
    const endpoints = [
      '/api/invoices?organizationId=org-1',
      '/api/expenses?organizationId=org-1',
      '/api/inventory/products?organizationId=org-1',
      '/api/analytics/dashboard?organizationId=org-1',
    ];
    
    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    const response = http.get(`${BASE_URL}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    const success = check(response, {
      'API status is 200': (r) => r.status === 200,
      'API response time < 3000ms': (r) => r.timings.duration < 3000,
    });

    errorRate.add(!success);
    responseTime.add(response.timings.duration);
  }

  sleep(1);
}






