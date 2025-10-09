#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 SETTING UP PRODUCTION FEATURES FOR VERIGRADE');
console.log('================================================\n');

// Function to update .env file
function updateEnvFile(key, value) {
  const envPath = path.join(__dirname, 'backend', '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found in backend directory');
    return false;
  }

  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check if key exists
  const keyRegex = new RegExp(`^${key}=.*$`, 'm');
  
  if (keyRegex.test(envContent)) {
    // Update existing key
    envContent = envContent.replace(keyRegex, `${key}="${value}"`);
    console.log(`✅ Updated ${key} in .env file`);
  } else {
    // Add new key
    envContent += `\n${key}="${value}"`;
    console.log(`✅ Added ${key} to .env file`);
  }
  
  fs.writeFileSync(envPath, envContent);
  return true;
}

// Function to create Supabase setup instructions
function createSupabaseSetup() {
  const setupContent = `# 🗄️ SUPABASE DATABASE SETUP

## Step 1: Get Your Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Create a new project or select existing project
3. Go to Settings → Database
4. Copy your database URL (it looks like: postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres)

## Step 2: Update Your .env File

Replace the DATABASE_URL in backend/.env with your Supabase URL:

\`\`\`bash
DATABASE_URL="postgresql://postgres:[your-password]@db.[project-ref].supabase.co:5432/postgres"
\`\`\`

## Step 3: Run Database Migrations

\`\`\`bash
cd backend
npx prisma db push
npx prisma generate
\`\`\`

## Step 4: Verify Connection

\`\`\`bash
node test-database-connection.js
\`\`\`

Your Supabase database will be ready for production use!
`;

  fs.writeFileSync('SUPABASE_SETUP.md', setupContent);
  console.log('✅ Created SUPABASE_SETUP.md with instructions');
}

// Function to create Stripe setup instructions
function createStripeSetup() {
  const setupContent = `# 💳 STRIPE PAYMENT INTEGRATION SETUP

## Step 1: Get Your Stripe Keys

1. Go to https://dashboard.stripe.com/
2. Get your API keys:
   - Publishable key (starts with pk_test_ or pk_live_)
   - Secret key (starts with sk_test_ or sk_live_)
   - Webhook secret (for webhook endpoints)

## Step 2: Update Your .env File

Add these to your backend/.env file:

\`\`\`bash
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your_secret_key_here"
STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
\`\`\`

## Step 3: Test Stripe Integration

\`\`\`bash
cd backend
node test-stripe-connection.js
\`\`\`

## Step 4: Create Products and Prices

You'll need to create products in your Stripe dashboard:
- Basic Plan: $29/month
- Professional Plan: $79/month  
- Enterprise Plan: $199/month

Your Stripe integration will be ready for payments!
`;

  fs.writeFileSync('STRIPE_SETUP.md', setupContent);
  console.log('✅ Created STRIPE_SETUP.md with instructions');
}

// Function to create database connection test
function createDatabaseTest() {
  const testContent = `#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

console.log('🧪 TESTING DATABASE CONNECTION...\n');

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  try {
    console.log('📡 Testing connection to:', process.env.DATABASE_URL?.replace(/\/\/.*@/, '//***:***@'));
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test user table
    const userCount = await prisma.user.count();
    console.log(\`✅ User table accessible (count: \${userCount})\`);
    
    // Test organization table
    const orgCount = await prisma.organization.count();
    console.log(\`✅ Organization table accessible (count: \${orgCount})\`);
    
    // Test transaction table
    const transactionCount = await prisma.transaction.count();
    console.log(\`✅ Transaction table accessible (count: \${transactionCount})\`);
    
    console.log('\n🎉 DATABASE IS READY FOR PRODUCTION!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 TROUBLESHOOTING:');
      console.log('1. Check your DATABASE_URL in .env file');
      console.log('2. Make sure your Supabase project is running');
      console.log('3. Verify your database credentials');
      console.log('4. Check if your IP is whitelisted in Supabase');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();
`;

  fs.writeFileSync('backend/test-database-connection.js', testContent);
  console.log('✅ Created database connection test');
}

// Function to create Stripe test
function createStripeTest() {
  const testContent = `#!/usr/bin/env node

const stripe = require('stripe');
require('dotenv').config();

console.log('💳 TESTING STRIPE CONNECTION...\n');

async function testStripeConnection() {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY not found in environment variables');
    }

    const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);
    
    console.log('📡 Testing Stripe API connection...');
    
    // Test API connection
    const account = await stripeClient.accounts.retrieve();
    console.log('✅ Stripe API connection successful!');
    console.log(\`✅ Account ID: \${account.id}\`);
    console.log(\`✅ Country: \${account.country}\`);
    console.log(\`✅ Currency: \${account.default_currency}\`);
    
    // Test products
    const products = await stripeClient.products.list({ limit: 5 });
    console.log(\`✅ Products accessible (found \${products.data.length} products)\`);
    
    // Test prices
    const prices = await stripeClient.prices.list({ limit: 5 });
    console.log(\`✅ Prices accessible (found \${prices.data.length} prices)\`);
    
    console.log('\n🎉 STRIPE IS READY FOR PAYMENTS!');
    
  } catch (error) {
    console.error('❌ Stripe connection failed:', error.message);
    
    if (error.message.includes('Invalid API Key')) {
      console.log('\n🔧 TROUBLESHOOTING:');
      console.log('1. Check your STRIPE_SECRET_KEY in .env file');
      console.log('2. Make sure you\'re using the correct key (test vs live)');
      console.log('3. Verify your Stripe account is active');
    }
    
    process.exit(1);
  }
}

testStripeConnection();
`;

  fs.writeFileSync('backend/test-stripe-connection.js', testContent);
  console.log('✅ Created Stripe connection test');
}

// Main setup function
async function main() {
  console.log('🔧 Setting up production features...\n');
  
  // Create setup instructions
  createSupabaseSetup();
  createStripeSetup();
  
  // Create test scripts
  createDatabaseTest();
  createStripeTest();
  
  // Update package.json to include new scripts
  const packagePath = path.join(__dirname, 'backend', 'package.json');
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts['test:db'] = 'node test-database-connection.js';
    packageJson.scripts['test:stripe'] = 'node test-stripe-connection.js';
    packageJson.scripts['setup:prod'] = 'node ../setup-production-features.js';
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json with test scripts');
  }
  
  console.log('\n🎯 SETUP COMPLETE!');
  console.log('==================');
  console.log('✅ Created Supabase setup instructions');
  console.log('✅ Created Stripe setup instructions');
  console.log('✅ Created database connection test');
  console.log('✅ Created Stripe connection test');
  console.log('✅ Updated package.json scripts');
  
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Follow SUPABASE_SETUP.md to connect your database');
  console.log('2. Follow STRIPE_SETUP.md to set up payments');
  console.log('3. Run: cd backend && npm run test:db');
  console.log('4. Run: cd backend && npm run test:stripe');
  console.log('5. Update your .env file with real credentials');
  
  console.log('\n🚀 Your VeriGrade platform will be production-ready!');
}

main().catch(console.error);


