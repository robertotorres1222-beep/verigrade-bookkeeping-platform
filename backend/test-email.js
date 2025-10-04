#!/usr/bin/env node

const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('📧 TESTING GMAIL EMAIL SERVICE');
console.log('==============================\n');

// Test Gmail configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'veragradebookkeeping@gmail.com',
    pass: process.env.SMTP_PASS || 'aaou miyq zdik uanp'
  }
});

console.log('🔧 Email Configuration:');
console.log(`📧 SMTP Host: smtp.gmail.com:587`);
console.log(`👤 SMTP User: ${process.env.SMTP_USER || 'veragradebookkeeping@gmail.com'}`);
console.log(`🔐 SMTP Pass: ${process.env.SMTP_PASS ? '***configured***' : 'NOT SET'}`);
console.log(`📨 From Email: ${process.env.FROM_EMAIL || 'noreply@verigrade.com'}\n`);

// Test email sending
const testEmail = {
  from: process.env.FROM_EMAIL || 'noreply@verigrade.com',
  to: 'test@example.com',
  subject: 'VeriGrade Email Service Test',
  html: `
    <h1>🎉 VeriGrade Email Service Test</h1>
    <p>This is a test email from your VeriGrade bookkeeping platform!</p>
    <p><strong>Email Service:</strong> Gmail SMTP</p>
    <p><strong>Status:</strong> ✅ Working</p>
    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    <hr>
    <p><em>This email was sent automatically by your VeriGrade platform.</em></p>
  `
};

console.log('📤 Sending test email...');

transporter.sendMail(testEmail, (error, info) => {
  if (error) {
    console.log('❌ Email test failed:');
    console.log('Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your Gmail app password');
    console.log('2. Verify 2-factor authentication is enabled');
    console.log('3. Ensure SMTP credentials are correct');
  } else {
    console.log('✅ Email test successful!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📤 Response:', info.response);
    console.log('\n🎯 Your email service is working perfectly!');
    console.log('📨 Professional emails are ready for your customers!');
  }
});

// Test connection
console.log('\n🔗 Testing SMTP connection...');
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ SMTP connection failed:');
    console.log('Error:', error.message);
  } else {
    console.log('✅ SMTP connection successful!');
    console.log('🚀 Your Gmail email service is ready for production!');
  }
});
