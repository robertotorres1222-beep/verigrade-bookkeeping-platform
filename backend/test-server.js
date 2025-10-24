const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    message: 'VeriGrade Bookkeeping Platform API is running!',
    version: '1.0.0',
    features: [
      'Core Infrastructure',
      'Document Processing & OCR',
      'Performance & Optimization',
      'Mobile App MVP',
      'Inventory Management',
      'Time Tracking & Project Management',
      'Advanced Automation',
      'Advanced Reporting',
      'Third-Party Integrations',
      'Enterprise Features',
      'Client Portal',
      'Security & Compliance',
      'Enhanced Banking',
      'UX Enhancements',
      'Documentation',
      'Internationalization',
      'Advanced Mobile Features',
      'Production Infrastructure',
      'Backup & DR',
      'Advanced Monitoring',
      'Complete Inventory',
      'Enhanced Time Tracking',
      'SRE Practices',
      'Advanced Security & Compliance',
      'API Platform',
      'AI & ML Platform',
      'Data Management',
      'Mobile Excellence'
    ],
    endpoints: {
      health: '/health',
      status: '/api/status',
      docs: '/api/docs'
    }
  });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'VeriGrade Bookkeeping Platform API',
    version: '1.0.0',
    description: 'Enterprise-grade SaaS bookkeeping platform with comprehensive features',
    endpoints: {
      health: {
        method: 'GET',
        path: '/health',
        description: 'Health check endpoint'
      },
      status: {
        method: 'GET',
        path: '/api/status',
        description: 'API status and feature list'
      },
      docs: {
        method: 'GET',
        path: '/api/docs',
        description: 'API documentation'
      }
    },
    features: {
      core: [
        'User Management',
        'Transaction Processing',
        'Invoice Management',
        'Expense Tracking',
        'Financial Reporting'
      ],
      advanced: [
        'AI-Powered Categorization',
        'Document OCR Processing',
        'Bank Feed Integration',
        'Predictive Analytics',
        'Fraud Detection',
        'Mobile App',
        'Inventory Management',
        'Time Tracking',
        'Project Management',
        'Enterprise Features',
        'Client Portal',
        'Security & Compliance'
      ],
      integrations: [
        'QuickBooks',
        'Xero',
        'Shopify',
        'Salesforce',
        'HubSpot',
        'Mailchimp',
        'Slack',
        'Plaid Banking',
        'Stripe Payments'
      ]
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to VeriGrade Bookkeeping Platform!',
    version: '1.0.0',
    status: 'Running',
    documentation: '/api/docs',
    health: '/health'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    availableEndpoints: ['/health', '/api/status', '/api/docs']
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 VeriGrade Bookkeeping Platform API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 API Status: http://localhost:${PORT}/api/status`);
  console.log(`📚 Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;



