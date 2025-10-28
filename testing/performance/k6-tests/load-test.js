import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');
const responseTime = new Trend('response_time');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.1'],     // Error rate must be below 10%
    error_rate: ['rate<0.05'],         // Custom error rate below 5%
  },
};

// Base URL
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Test data
const testUsers = [
  { email: 'user1@test.com', password: 'password123' },
  { email: 'user2@test.com', password: 'password123' },
  { email: 'user3@test.com', password: 'password123' },
  { email: 'user4@test.com', password: 'password123' },
  { email: 'user5@test.com', password: 'password123' },
];

const testOrganizations = [
  'org-1', 'org-2', 'org-3', 'org-4', 'org-5'
];

// Helper function to get random test data
function getRandomUser() {
  return testUsers[Math.floor(Math.random() * testUsers.length)];
}

function getRandomOrg() {
  return testOrganizations[Math.floor(Math.random() * testOrganizations.length)];
}

// Helper function to make authenticated request
function makeAuthenticatedRequest(method, url, payload = null, token = null) {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  };

  let response;
  if (method === 'GET') {
    response = http.get(url, params);
  } else if (method === 'POST') {
    response = http.post(url, JSON.stringify(payload), params);
  } else if (method === 'PUT') {
    response = http.put(url, JSON.stringify(payload), params);
  } else if (method === 'DELETE') {
    response = http.del(url, null, params);
  }

  return response;
}

// Authentication test
export function testAuthentication() {
  const user = getRandomUser();
  
  const loginPayload = {
    email: user.email,
    password: user.password,
  };

  const response = makeAuthenticatedRequest('POST', `${BASE_URL}/api/auth/login`, loginPayload);
  
  const success = check(response, {
    'login status is 200': (r) => r.status === 200,
    'login response has token': (r) => JSON.parse(r.body).token !== undefined,
    'login response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  errorRate.add(!success);
  responseTime.add(response.timings.duration);

  if (success) {
    return JSON.parse(response.body).token;
  }
  
  return null;
}

// API endpoint tests
export function testInvoicesAPI(token) {
  const orgId = getRandomOrg();
  
  // Test GET /api/invoices
  const listResponse = makeAuthenticatedRequest('GET', `${BASE_URL}/api/invoices?organizationId=${orgId}`, null, token);
  
  const listSuccess = check(listResponse, {
    'invoices list status is 200': (r) => r.status === 200,
    'invoices list response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  errorRate.add(!listSuccess);
  responseTime.add(listResponse.timings.duration);

  // Test POST /api/invoices
  const invoicePayload = {
    organizationId: orgId,
    customerId: 'customer-1',
    invoiceNumber: `INV-${Date.now()}`,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        description: 'Test Item',
        quantity: 1,
        unitPrice: 100,
        total: 100,
      },
    ],
    subtotal: 100,
    tax: 10,
    total: 110,
  };

  const createResponse = makeAuthenticatedRequest('POST', `${BASE_URL}/api/invoices`, invoicePayload, token);
  
  const createSuccess = check(createResponse, {
    'invoice create status is 201': (r) => r.status === 201,
    'invoice create response time < 1500ms': (r) => r.timings.duration < 1500,
  });

  errorRate.add(!createSuccess);
  responseTime.add(createResponse.timings.duration);

  return createSuccess ? JSON.parse(createResponse.body).id : null;
}

export function testExpensesAPI(token) {
  const orgId = getRandomOrg();
  
  // Test GET /api/expenses
  const listResponse = makeAuthenticatedRequest('GET', `${BASE_URL}/api/expenses?organizationId=${orgId}`, null, token);
  
  const listSuccess = check(listResponse, {
    'expenses list status is 200': (r) => r.status === 200,
    'expenses list response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  errorRate.add(!listSuccess);
  responseTime.add(listResponse.timings.duration);

  // Test POST /api/expenses
  const expensePayload = {
    organizationId: orgId,
    category: 'Office Supplies',
    description: 'Test Expense',
    amount: 50,
    date: new Date().toISOString(),
    vendor: 'Test Vendor',
  };

  const createResponse = makeAuthenticatedRequest('POST', `${BASE_URL}/api/expenses`, expensePayload, token);
  
  const createSuccess = check(createResponse, {
    'expense create status is 201': (r) => r.status === 201,
    'expense create response time < 1500ms': (r) => r.timings.duration < 1500,
  });

  errorRate.add(!createSuccess);
  responseTime.add(createResponse.timings.duration);

  return createSuccess ? JSON.parse(createResponse.body).id : null;
}

export function testBankingAPI(token) {
  const orgId = getRandomOrg();
  
  // Test GET /api/banking/accounts
  const accountsResponse = makeAuthenticatedRequest('GET', `${BASE_URL}/api/banking/accounts?organizationId=${orgId}`, null, token);
  
  const accountsSuccess = check(accountsResponse, {
    'banking accounts status is 200': (r) => r.status === 200,
    'banking accounts response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  errorRate.add(!accountsSuccess);
  responseTime.add(accountsResponse.timings.duration);

  // Test GET /api/banking/transactions
  const transactionsResponse = makeAuthenticatedRequest('GET', `${BASE_URL}/api/banking/transactions?organizationId=${orgId}`, null, token);
  
  const transactionsSuccess = check(transactionsResponse, {
    'banking transactions status is 200': (r) => r.status === 200,
    'banking transactions response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  errorRate.add(!transactionsSuccess);
  responseTime.add(transactionsResponse.timings.duration);
}

export function testInventoryAPI(token) {
  const orgId = getRandomOrg();
  
  // Test GET /api/inventory/products
  const productsResponse = makeAuthenticatedRequest('GET', `${BASE_URL}/api/inventory/products?organizationId=${orgId}`, null, token);
  
  const productsSuccess = check(productsResponse, {
    'inventory products status is 200': (r) => r.status === 200,
    'inventory products response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  errorRate.add(!productsSuccess);
  responseTime.add(productsResponse.timings.duration);

  // Test GET /api/inventory/warehouses
  const warehousesResponse = makeAuthenticatedRequest('GET', `${BASE_URL}/api/inventory/warehouses?organizationId=${orgId}`, null, token);
  
  const warehousesSuccess = check(warehousesResponse, {
    'inventory warehouses status is 200': (r) => r.status === 200,
    'inventory warehouses response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  errorRate.add(!warehousesSuccess);
  responseTime.add(warehousesResponse.timings.duration);
}

export function testAnalyticsAPI(token) {
  const orgId = getRandomOrg();
  
  // Test GET /api/analytics/dashboard
  const dashboardResponse = makeAuthenticatedRequest('GET', `${BASE_URL}/api/analytics/dashboard?organizationId=${orgId}`, null, token);
  
  const dashboardSuccess = check(dashboardResponse, {
    'analytics dashboard status is 200': (r) => r.status === 200,
    'analytics dashboard response time < 3000ms': (r) => r.timings.duration < 3000,
  });

  errorRate.add(!dashboardSuccess);
  responseTime.add(dashboardResponse.timings.duration);

  // Test GET /api/analytics/reports
  const reportsResponse = makeAuthenticatedRequest('GET', `${BASE_URL}/api/analytics/reports?organizationId=${orgId}`, null, token);
  
  const reportsSuccess = check(reportsResponse, {
    'analytics reports status is 200': (r) => r.status === 200,
    'analytics reports response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  errorRate.add(!reportsSuccess);
  responseTime.add(reportsResponse.timings.duration);
}

// Main test function
export default function() {
  // Authenticate user
  const token = testAuthentication();
  
  if (!token) {
    console.log('Authentication failed, skipping other tests');
    return;
  }

  // Run API tests
  testInvoicesAPI(token);
  testExpensesAPI(token);
  testBankingAPI(token);
  testInventoryAPI(token);
  testAnalyticsAPI(token);

  // Wait between requests
  sleep(1);
}

// Setup function (runs once at the beginning)
export function setup() {
  console.log('Starting load test...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test users: ${testUsers.length}`);
  console.log(`Test organizations: ${testOrganizations.length}`);
}

// Teardown function (runs once at the end)
export function teardown(data) {
  console.log('Load test completed');
  console.log('Final error rate:', errorRate.values);
  console.log('Average response time:', responseTime.values);
}









