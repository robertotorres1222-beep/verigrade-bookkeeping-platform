// Vercel serverless function for the backend API
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// Logging
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Mock API endpoints
app.get('/api/v1/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      totalRevenue: 125000,
      totalExpenses: 75000,
      netProfit: 50000,
      monthlyGrowth: 12.5,
      recentTransactions: [
        { id: 1, description: 'Client Payment', amount: 5000, date: '2023-10-01' },
        { id: 2, description: 'Office Rent', amount: -2500, date: '2023-10-01' }
      ]
    }
  });
});

app.get('/api/v1/transactions', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, description: 'Client Payment', amount: 5000, date: '2023-10-01', type: 'income' },
      { id: 2, description: 'Office Rent', amount: -2500, date: '2023-10-01', type: 'expense' },
      { id: 3, description: 'Software Subscription', amount: -99, date: '2023-09-30', type: 'expense' }
    ]
  });
});

app.post('/api/v1/transactions', (req, res) => {
  res.json({
    success: true,
    data: {
      id: Date.now(),
      ...req.body,
      createdAt: new Date().toISOString()
    }
  });
});

app.get('/api/v1/invoices', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, client: 'ABC Corp', amount: 5000, status: 'paid', dueDate: '2023-10-15' },
      { id: 2, client: 'XYZ Ltd', amount: 3000, status: 'pending', dueDate: '2023-10-20' }
    ]
  });
});

app.get('/api/v1/expenses', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, description: 'Office Rent', amount: 2500, category: 'Rent', date: '2023-10-01' },
      { id: 2, description: 'Software License', amount: 99, category: 'Software', date: '2023-09-30' }
    ]
  });
});

// Catch-all handler
app.get('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

module.exports = app;
