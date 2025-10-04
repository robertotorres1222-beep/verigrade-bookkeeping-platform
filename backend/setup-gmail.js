#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📧 GMAIL SETUP SCRIPT');
console.log('====================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
  console.log('Creating .env file from env.example...');
  
  if (fs.existsSync(envExamplePath)) {
    const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
    fs.writeFileSync(envPath, envExampleContent);
    console.log('✅ .env file created!\n');
  } else {
    console.log('❌ env.example file not found. Creating basic .env file...');
    
    const basicEnvContent = `# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/verigrade_dev"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_SECRET="your-refresh-token-secret"
REFRESH_TOKEN_EXPIRES_IN="30d"

# Redis
REDIS_URL="redis://localhost:6379"

# Server Configuration
NODE_ENV="development"
PORT=3001
API_VERSION="v1"

# External APIs
OPENAI_API_KEY="your-openai-api-key"
PLAID_CLIENT_ID="your-plaid-client-id"
PLAID_SECRET="your-plaid-secret"
PLAID_ENVIRONMENT="sandbox"

# Payment Processing
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"

# Email Configuration - GMAIL SETUP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@verigrade.com"
CONTACT_EMAIL="support@verigrade.com"
BANKING_EMAIL="banking@verigrade.com"
TAX_EMAIL="tax@verigrade.com"

# File Storage
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="verigrade-uploads"
AWS_CLOUDFRONT_DOMAIN="your-cloudfront-domain"

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET="your-session-secret"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN="http://localhost:3000"

# Logging
LOG_LEVEL="info"
LOG_FILE="logs/app.log"

# Feature Flags
ENABLE_AI_FEATURES=true
ENABLE_PLAID_INTEGRATION=true
ENABLE_STRIPE_INTEGRATION=true
ENABLE_EMAIL_NOTIFICATIONS=true

# Monitoring
SENTRY_DSN="your-sentry-dsn"
`;
    
    fs.writeFileSync(envPath, basicEnvContent);
    console.log('✅ Basic .env file created!\n');
  }
}

// Read current .env content
const envContent = fs.readFileSync(envPath, 'utf8');

// Update Gmail credentials
console.log('🔧 Updating Gmail credentials...');

// Get Gmail credentials from command line arguments
const gmailUser = process.argv[2];
const gmailPassword = process.argv[3];

if (!gmailUser || !gmailPassword) {
  console.log('❌ Missing Gmail credentials!');
  console.log('\nUsage: node setup-gmail.js "your-email@gmail.com" "your-app-password"');
  console.log('\nExample:');
  console.log('node setup-gmail.js "robert@verigrade.com" "aaou miyq zdik uanp"');
  process.exit(1);
}

// Update the .env content
let updatedContent = envContent
  .replace(/SMTP_USER="[^"]*"/, `SMTP_USER="${gmailUser}"`)
  .replace(/SMTP_PASS="[^"]*"/, `SMTP_PASS="${gmailPassword}"`);

// Write updated content
fs.writeFileSync(envPath, updatedContent);

console.log('✅ Gmail credentials updated!');
console.log(`📧 SMTP User: ${gmailUser}`);
console.log(`🔐 SMTP Password: ${gmailPassword.replace(/./g, '*')}`);
console.log('\n🎯 Your email service is now configured!');
console.log('\n📋 Next steps:');
console.log('1. Start your backend: npm run dev');
console.log('2. Test email sending');
console.log('3. Check logs for any email errors');
console.log('\n🚀 Your VeriGrade platform now has professional email capabilities!');
