import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 10 }, // Stay at 10 users
    { duration: '2m', target: 20 }, // Ramp up to 20 users
    { duration: '5m', target: 20 }, // Stay at 20 users
    { duration: '2m', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.1'],     // Error rate must be below 10%
    error_rate: ['rate<0.1'],          // Custom error rate must be below 10%
  },
};

// Test data
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || 'test-token';
const COMPANY_ID = __ENV.COMPANY_ID || 'test-company-1';

// Test scenarios
const scenarios = [
  {
    name: 'Cash Flow Forecast',
    endpoint: `/api/analytics/companies/${COMPANY_ID}/cash-flow-forecast`,
    method: 'GET',
    params: { months: 12 }
  },
  {
    name: 'Revenue Prediction',
    endpoint: `/api/analytics/companies/${COMPANY_ID}/revenue-prediction`,
    method: 'GET',
    params: { period: 'month' }
  },
  {
    name: 'Expense Trends',
    endpoint: `/api/analytics/companies/${COMPANY_ID}/expense-trends`,
    method: 'GET',
    params: { category: 'office' }
  },
  {
    name: 'Anomaly Detection',
    endpoint: `/api/analytics/companies/${COMPANY_ID}/anomalies`,
    method: 'GET',
    params: { days: 30 }
  },
  {
    name: 'Risk Assessment',
    endpoint: `/api/analytics/companies/${COMPANY_ID}/risks`,
    method: 'GET',
    params: {}
  },
  {
    name: 'Seasonal Patterns',
    endpoint: `/api/analytics/companies/${COMPANY_ID}/seasonal-patterns`,
    method: 'GET',
    params: {}
  },
  {
    name: 'KPI Dashboard',
    endpoint: `/api/analytics/companies/${COMPANY_ID}/kpis`,
    method: 'GET',
    params: { period: 'month' }
  },
  {
    name: 'Performance Metrics',
    endpoint: `/api/analytics/companies/${COMPANY_ID}/performance-metrics`,
    method: 'GET',
    params: { period: 'month' }
  },
  {
    name: 'Executive Summary',
    endpoint: `/api/analytics/companies/${COMPANY_ID}/executive-summary`,
    method: 'GET',
    params: {}
  },
  {
    name: 'ML Models List',
    endpoint: '/api/analytics/ml-models',
    method: 'GET',
    params: {}
  }
];

// Main test function
export default function () {
  // Select a random scenario
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  
  // Prepare request
  const url = `${BASE_URL}${scenario.endpoint}`;
  const headers = {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  };
  
  let response;
  
  if (scenario.method === 'GET') {
    // Build query string
    const queryString = Object.keys(scenario.params)
      .map(key => `${key}=${scenario.params[key]}`)
      .join('&');
    
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    response = http.get(fullUrl, { headers });
  } else if (scenario.method === 'POST') {
    response = http.post(url, JSON.stringify(scenario.params), { headers });
  }
  
  // Check response
  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
    'response has success field': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.hasOwnProperty('success');
      } catch (e) {
        return false;
      }
    },
    'response has data field': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.hasOwnProperty('data');
      } catch (e) {
        return false;
      }
    }
  });
  
  // Record error rate
  errorRate.add(!success);
  
  // Log errors
  if (!success) {
    console.error(`Scenario: ${scenario.name}`);
    console.error(`Status: ${response.status}`);
    console.error(`Response: ${response.body}`);
  }
  
  // Sleep between requests
  sleep(1);
}

// Setup function (runs once at the beginning)
export function setup() {
  console.log('Starting analytics load test...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Company ID: ${COMPANY_ID}`);
  
  // Test basic connectivity
  const healthResponse = http.get(`${BASE_URL}/health`);
  if (healthResponse.status !== 200) {
    throw new Error('Health check failed');
  }
  
  console.log('Health check passed, starting load test');
  return { startTime: new Date().toISOString() };
}

// Teardown function (runs once at the end)
export function teardown(data) {
  console.log('Analytics load test completed');
  console.log(`Test started at: ${data.startTime}`);
  console.log(`Test ended at: ${new Date().toISOString()}`);
}

// Additional test scenarios for specific analytics features
export function testMLPrediction() {
  const url = `${BASE_URL}/api/analytics/ml-models/expense_categorization/predict`;
  const headers = {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  };
  
  const payload = {
    input: {
      description: 'Office supplies',
      amount: 150.00,
      vendor: 'Amazon'
    }
  };
  
  const response = http.post(url, JSON.stringify(payload), { headers });
  
  return check(response, {
    'ML prediction status is 200': (r) => r.status === 200,
    'ML prediction response time < 1s': (r) => r.timings.duration < 1000,
    'ML prediction has result': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success && body.data && body.data.prediction;
      } catch (e) {
        return false;
      }
    }
  });
}

export function testReportExecution() {
  // First create a report
  const createUrl = `${BASE_URL}/api/analytics/companies/${COMPANY_ID}/reports`;
  const headers = {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  };
  
  const reportData = {
    name: 'Load Test Report',
    description: 'Report created during load test',
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
  
  const createResponse = http.post(createUrl, JSON.stringify(reportData), { headers });
  
  if (createResponse.status !== 200) {
    return false;
  }
  
  const reportId = JSON.parse(createResponse.body).data.id;
  
  // Execute the report
  const executeUrl = `${BASE_URL}/api/analytics/reports/${reportId}/execute`;
  const executeResponse = http.post(executeUrl, JSON.stringify({ parameters: {} }), { headers });
  
  return check(executeResponse, {
    'Report execution status is 200': (r) => r.status === 200,
    'Report execution response time < 5s': (r) => r.timings.duration < 5000,
    'Report execution has execution ID': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success && body.data && body.data.id;
      } catch (e) {
        return false;
      }
    }
  });
}









