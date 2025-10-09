const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS for all origins
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'VeriGrade Backend API is running',
    timestamp: new Date().toISOString(),
    environment: 'production',
  });
});

// Mock authentication endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple mock authentication
  if (email === 'robertotorres1222@gmail.com' && password === 'password123') {
    const token = 'mock-jwt-token-' + Date.now();
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: '1',
          email: 'robertotorres1222@gmail.com',
          firstName: 'Roberto',
          lastName: 'Torres',
          organizationId: 'org-1',
          organization: {
            id: 'org-1',
            name: 'Torres Enterprises',
            slug: 'torres-enterprises'
          }
        },
        token: token
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  // Simple mock registration
  const token = 'mock-jwt-token-' + Date.now();
  res.json({
    success: true,
    message: 'Registration successful',
    data: {
      user: {
        id: Date.now().toString(),
        email,
        firstName,
        lastName,
        organizationId: 'org-1',
        organization: {
          id: 'org-1',
          name: 'New Organization',
          slug: 'new-organization'
        }
      },
      token: token
    }
  });
});

// Mock API endpoints
app.get('/api/invoices', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Invoices endpoint ready'
  });
});

app.get('/api/expenses', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Expenses endpoint ready'
  });
});

app.get('/api/customers', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Customers endpoint ready'
  });
});

app.get('/api/dashboard/overview', (req, res) => {
  res.json({
    success: true,
    data: {
      totalRevenue: 50000,
      totalExpenses: 30000,
      profit: 20000,
      activeCustomers: 25,
      pendingInvoices: 5
    },
    message: 'Dashboard data ready'
  });
});

// Catch-all handler for other routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

module.exports = app;
