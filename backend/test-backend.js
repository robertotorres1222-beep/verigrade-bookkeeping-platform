#!/usr/bin/env node

console.log('🚀 TESTING BACKEND STARTUP...');

try {
  // Test basic imports
  console.log('📦 Testing imports...');
  const express = require('express');
  const cors = require('cors');
  const helmet = require('helmet');
  console.log('✅ Basic imports successful');

  // Test environment variables
  console.log('🔧 Testing environment...');
  require('dotenv').config();
  console.log('✅ Environment loaded');

  // Test database connection
  console.log('🗄️ Testing database...');
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  console.log('✅ Database client created');

  // Test email service
  console.log('📧 Testing email service...');
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'verigradebookkeeping@gmail.com',
      pass: 'jxxy spfm ejyk nxxh'
    }
  });
  console.log('✅ Email service configured');

  // Test basic Express app
  console.log('🌐 Creating Express app...');
  const app = express();
  app.use(cors());
  app.use(helmet());
  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Backend is healthy' });
  });

  app.get('/test-email', async (req, res) => {
    try {
      const info = await transporter.sendMail({
        from: 'verigradebookkeeping@gmail.com',
        to: 'test@example.com',
        subject: 'Test Email',
        text: 'This is a test email from VeriGrade backend'
      });
      res.json({ success: true, messageId: info.messageId });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  const PORT = process.env.PORT || 3001;
  const server = app.listen(PORT, () => {
    console.log(`🎉 Backend started successfully on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`📧 Email test: http://localhost:${PORT}/test-email`);
    console.log('🚀 Your VeriGrade backend is ready for deployment!');
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    server.close(() => {
      prisma.$disconnect();
      console.log('✅ Shutdown complete');
      process.exit(0);
    });
  });

} catch (error) {
  console.error('❌ Backend startup failed:', error.message);
  process.exit(1);
}
