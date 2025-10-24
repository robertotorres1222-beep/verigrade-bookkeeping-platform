import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');
const responseTime = new Trend('response_time');
const throughput = new Trend('throughput');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '2m', target: 200 },  // Ramp up to 200 users
    { duration: '2m', target: 500 },  // Ramp up to 500 users
    { duration: '2m', target: 1000 }, // Ramp up to 1000 users
    { duration: '5m', target: 1000 }, // Stay at 1000 users
    { duration: '2m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 95% of requests must complete below 5s
    http_req_failed: ['rate<0.2'],     // Error rate must be below 20%
    error_rate: ['rate<0.15'],         // Custom error rate below 15%
    throughput: ['rate>100'],          // Throughput must be above 100 req/s
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
  { email: 'user6@test.com', password: 'password123' },
  { email: 'user7@test.com', password: 'password123' },
  { email: 'user8@test.com', password: 'password123' },
  { email: 'user9@test.com', password: 'password123' },
  { email: 'user10@test.com', password: 'password123' },
];

const testOrganizations = [
  'org-1', 'org-2', 'org-3', 'org-4', 'org-5',
  'org-6', 'org-7', 'org-8', 'org-9', 'org-10'
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

// Stress test for authentication
export function testAuthenticationStress() {
  const user = getRandomUser();
  
  const loginPayload = {
    email: user.email,
    password: user.password,
  };

  const response = makeAuthenticatedRequest('POST', `${BASE_URL}/api/auth/login`, loginPayload);
  
  const success = check(response, {
    'login status is 200': (r) => r.status === 200,
    'login response has token': (r) => JSON.parse(r.body).token !== undefined,
    'login response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  throughput.add(1);

  if (success) {
    return JSON.parse(response.body).token;
  }
  
  return null;
}

// Stress test for invoice operations
export function testInvoiceStress(token) {
  const orgId = getRandomOrg();
  
  // Test concurrent invoice creation
  const invoicePayload = {
    organizationId: orgId,
    customerId: `customer-${Math.floor(Math.random() * 1000)}`,
    invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        description: `Test Item ${Math.floor(Math.random() * 1000)}`,
        quantity: Math.floor(Math.random() * 10) + 1,
        unitPrice: Math.floor(Math.random() * 1000) + 10,
        total: 0,
      },
    ],
    subtotal: 0,
    tax: 0,
    total: 0,
  };

  // Calculate totals
  invoicePayload.items[0].total = invoicePayload.items[0].quantity * invoicePayload.items[0].unitPrice;
  invoicePayload.subtotal = invoicePayload.items[0].total;
  invoicePayload.tax = invoicePayload.subtotal * 0.1;
  invoicePayload.total = invoicePayload.subtotal + invoicePayload.tax;

  const createResponse = makeAuthenticatedRequest('POST', `${BASE_URL}/api/invoices`, invoicePayload, token);
  
  const createSuccess = check(createResponse, {
    'invoice create status is 201': (r) => r.status === 201,
    'invoice create response time < 3000ms': (r) => r.timings.duration < 3000,
  });

  errorRate.add(!createSuccess);
  responseTime.add(createResponse.timings.duration);
  throughput.add(1);

  if (createSuccess) {
    const invoiceId = JSON.parse(createResponse.body).id;
    
    // Test concurrent invoice updates
    const updatePayload = {
      ...invoicePayload,
      status: 'sent',
      sentDate: new Date().toISOString(),
    };

    const updateResponse = makeAuthenticatedRequest('PUT', `${BASE_URL}/api/invoices/${invoiceId}`, updatePayload, token);
    
    const updateSuccess = check(updateResponse, {
      'invoice update status is 200': (r) => r.status === 200,
      'invoice update response time < 2000ms': (r) => r.timings.duration < 2000,
    });

    errorRate.add(!updateSuccess);
    responseTime.add(updateResponse.timings.duration);
    throughput.add(1);
  }
}

// Stress test for expense operations
export function testExpenseStress(token) {
  const orgId = getRandomOrg();
  
  // Test concurrent expense creation
  const expensePayload = {
    organizationId: orgId,
    category: ['Office Supplies', 'Travel', 'Meals', 'Software', 'Marketing'][Math.floor(Math.random() * 5)],
    description: `Test Expense ${Math.floor(Math.random() * 1000)}`,
    amount: Math.floor(Math.random() * 1000) + 10,
    date: new Date().toISOString(),
    vendor: `Vendor ${Math.floor(Math.random() * 1000)}`,
  };

  const createResponse = makeAuthenticatedRequest('POST', `${BASE_URL}/api/expenses`, expensePayload, token);
  
  const createSuccess = check(createResponse, {
    'expense create status is 201': (r) => r.status === 201,
    'expense create response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  errorRate.add(!createSuccess);
  responseTime.add(createResponse.timings.duration);
  throughput.add(1);
}

// Stress test for inventory operations
export function testInventoryStress(token) {
  const orgId = getRandomOrg();
  
  // Test concurrent product creation
  const productPayload = {
    organizationId: orgId,
    name: `Test Product ${Math.floor(Math.random() * 1000)}`,
    sku: `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    category: ['Electronics', 'Office Supplies', 'Furniture', 'Software', 'Books'][Math.floor(Math.random() * 5)],
    description: `Test product description ${Math.floor(Math.random() * 1000)}`,
    cost: Math.floor(Math.random() * 1000) + 10,
    price: Math.floor(Math.random() * 1500) + 20,
    quantity: Math.floor(Math.random() * 100) + 1,
  };

  const createResponse = makeAuthenticatedRequest('POST', `${BASE_URL}/api/inventory/products`, productPayload, token);
  
  const createSuccess = check(createResponse, {
    'product create status is 201': (r) => r.status === 201,
    'product create response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  errorRate.add(!createSuccess);
  responseTime.add(createResponse.timings.duration);
  throughput.add(1);
}

// Stress test for banking operations
export function testBankingStress(token) {
  const orgId = getRandomOrg();
  
  // Test concurrent transaction creation
  const transactionPayload = {
    organizationId: orgId,
    accountId: `account-${Math.floor(Math.random() * 100)}`,
    amount: (Math.random() - 0.5) * 2000, // Random amount between -1000 and 1000
    description: `Test Transaction ${Math.floor(Math.random() * 1000)}`,
    date: new Date().toISOString(),
    category: ['Income', 'Expense', 'Transfer', 'Investment', 'Other'][Math.floor(Math.random() * 5)],
    type: Math.random() > 0.5 ? 'credit' : 'debit',
  };

  const createResponse = makeAuthenticatedRequest('POST', `${BASE_URL}/api/banking/transactions`, transactionPayload, token);
  
  const createSuccess = check(createResponse, {
    'transaction create status is 201': (r) => r.status === 201,
    'transaction create response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  errorRate.add(!createSuccess);
  responseTime.add(createResponse.timings.duration);
  throughput.add(1);
}

// Stress test for analytics operations
export function testAnalyticsStress(token) {
  const orgId = getRandomOrg();
  
  // Test concurrent analytics requests
  const analyticsEndpoints = [
    '/api/analytics/dashboard',
    '/api/analytics/reports',
    '/api/analytics/forecasts',
    '/api/analytics/trends',
  ];

  const endpoint = analyticsEndpoints[Math.floor(Math.random() * analyticsEndpoints.length)];
  const response = makeAuthenticatedRequest('GET', `${BASE_URL}${endpoint}?organizationId=${orgId}`, null, token);
  
  const success = check(response, {
    'analytics status is 200': (r) => r.status === 200,
    'analytics response time < 5000ms': (r) => r.timings.duration < 5000,
  });

  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  throughput.add(1);
}

// Stress test for search operations
export function testSearchStress(token) {
  const orgId = getRandomOrg();
  const searchTerms = ['invoice', 'expense', 'product', 'customer', 'vendor', 'transaction'];
  const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
  
  // Test concurrent search requests
  const response = makeAuthenticatedRequest('GET', `${BASE_URL}/api/search?q=${searchTerm}&organizationId=${orgId}`, null, token);
  
  const success = check(response, {
    'search status is 200': (r) => r.status === 200,
    'search response time < 3000ms': (r) => r.timings.duration < 3000,
  });

  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  throughput.add(1);
}

// Main test function
export default function() {
  // Authenticate user
  const token = testAuthenticationStress();
  
  if (!token) {
    console.log('Authentication failed, skipping other tests');
    return;
  }

  // Run stress tests with different probabilities
  const testType = Math.random();
  
  if (testType < 0.2) {
    testInvoiceStress(token);
  } else if (testType < 0.4) {
    testExpenseStress(token);
  } else if (testType < 0.6) {
    testInventoryStress(token);
  } else if (testType < 0.8) {
    testBankingStress(token);
  } else if (testType < 0.9) {
    testAnalyticsStress(token);
  } else {
    testSearchStress(token);
  }

  // Random sleep between 0.5 and 2 seconds
  sleep(Math.random() * 1.5 + 0.5);
}

// Setup function (runs once at the beginning)
export function setup() {
  console.log('Starting stress test...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test users: ${testUsers.length}`);
  console.log(`Test organizations: ${testOrganizations.length}`);
  console.log('This test will gradually increase load to 1000 concurrent users');
}

// Teardown function (runs once at the end)
export function teardown(data) {
  console.log('Stress test completed');
  console.log('Final error rate:', errorRate.values);
  console.log('Average response time:', responseTime.values);
  console.log('Total throughput:', throughput.values);
}





