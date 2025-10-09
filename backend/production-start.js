#!/usr/bin/env node

console.log('🚀 STARTING VERIGRADE PRODUCTION BACKEND...');

// Load environment variables first
require('dotenv').config();

console.log('✅ Environment variables loaded');

// Verify critical environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'DATABASE_URL',
  'SMTP_PASS'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
  console.log(`✅ ${envVar} is configured`);
}

console.log('🎯 All environment variables verified');

try {
  // Import and start the application
  console.log('📦 Starting Express application...');
  
  const express = require('express');
  const cors = require('cors');
  const helmet = require('helmet');
  const compression = require('compression');
  const rateLimit = require('express-rate-limit');
  
  const app = express();
  const PORT = process.env.PORT || 3001;
  
  // Middleware
  app.use(cors());
  app.use(helmet());
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  
  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // limit each IP to 1000 requests per windowMs
  });
  app.use('/api/', limiter);
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      message: 'VeriGrade Backend is healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });
  
  // Email test endpoint
  app.get('/test-email', async (req, res) => {
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'verigradebookkeeping@gmail.com',
          pass: process.env.SMTP_PASS
        }
      });
      
      const info = await transporter.sendMail({
        from: 'verigradebookkeeping@gmail.com',
        to: 'test@example.com',
        subject: 'VeriGrade Production Email Test',
        html: `
          <h1>🎉 VeriGrade Production Email Test</h1>
          <p>This email confirms that your VeriGrade backend email service is working in production!</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Environment:</strong> Production</p>
          <hr>
          <p><em>VeriGrade Bookkeeping Platform - Professional Email Service</em></p>
        `
      });
      
      res.json({
        success: true,
        message: 'Email sent successfully',
        messageId: info.messageId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // API routes placeholder
  app.get('/api/v1/status', (req, res) => {
    res.json({
      success: true,
      message: 'VeriGrade API is running',
      endpoints: {
        health: '/health',
        emailTest: '/test-email',
        apiStatus: '/api/v1/status'
      },
      timestamp: new Date().toISOString()
    });
  });
  
  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint not found',
      path: req.originalUrl,
      timestamp: new Date().toISOString()
    });
  });
  
  // Error handler
  app.use((error, req, res, next) => {
    console.error('Application Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  });
  
  // Start server
  const server = app.listen(PORT, () => {
    console.log('🎉 VeriGrade Backend started successfully!');
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`📧 Email test: http://localhost:${PORT}/test-email`);
    console.log(`📊 API status: http://localhost:${PORT}/api/v1/status`);
    console.log('');
    console.log('🚀 VeriGrade is ready for production!');
    console.log('📨 Email service: Gmail SMTP configured');
    console.log('🔐 Security: CORS, Helmet, Rate limiting enabled');
    console.log('📈 Monitoring: Health checks and error handling ready');
  });
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    server.close(() => {
      console.log('✅ Server closed successfully');
      process.exit(0);
    });
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    server.close(() => {
      console.log('✅ Server closed successfully');
      process.exit(0);
    });
  });
  
} catch (error) {
  console.error('❌ Failed to start VeriGrade backend:', error.message);
  process.exit(1);
}

