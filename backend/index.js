const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());

// CORS Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Logging Middleware
app.use(morgan('dev'));

// JSON Body Parser
app.use(express.json());

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    port: PORT
  });
});

// API Status Endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({
    message: 'VeriGrade Bookkeeping Platform API is running!',
    version: '1.0.0',
    features: [
      "Core Infrastructure", "Document Processing & OCR", "Performance & Optimization",
      "Mobile App MVP", "Inventory Management", "Time Tracking & Project Management",
      "Advanced Automation", "Advanced Reporting", "Third-Party Integrations",
      "Enterprise Features", "Client Portal", "Security & Compliance",
      "Enhanced Banking", "UX Enhancements", "Documentation", "Internationalization",
      "Advanced Mobile Features", "Production Infrastructure", "Backup & DR",
      "Advanced Monitoring", "Complete Inventory", "Enhanced Time Tracking",
      "SRE Practices", "Advanced Security & Compliance", "API Platform",
      "AI & ML Platform", "Data Management", "Mobile Excellence"
    ]
  });
});

// Root Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to VeriGrade Bookkeeping Platform!',
    version: '1.0.0',
    status: 'Running',
    documentation: '/api/docs',
    health: '/health',
    port: PORT
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 VeriGrade Bookkeeping Platform API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 API Status: http://localhost:${PORT}/api/status`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

