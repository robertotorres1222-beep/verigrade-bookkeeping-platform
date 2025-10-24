const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'VeriGrade Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// API status endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'VeriGrade Bookkeeping Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/v1',
      docs: '/api/docs'
    },
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Basic API routes
app.get('/api/v1/status', (req, res) => {
  res.json({
    status: 'success',
    message: 'API is operational',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Test endpoint
app.get('/api/v1/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Backend is working perfectly!',
    timestamp: new Date().toISOString(),
    data: {
      server: 'VeriGrade Backend',
      status: 'online',
      uptime: process.uptime()
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 VeriGrade Backend API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 API Status: http://localhost:${PORT}/`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/v1/test`);
});

module.exports = app;


