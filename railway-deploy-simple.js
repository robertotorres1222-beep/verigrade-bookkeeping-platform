#!/usr/bin/env node

/**
 * 🚀 SIMPLE RAILWAY DEPLOYMENT SCRIPT
 * This script will help you deploy to Railway step by step
 */

const { execSync } = require('child_process');

console.log('🚀 VERIGRADE RAILWAY DEPLOYMENT');
console.log('================================\n');

// Check if we're in the right directory
console.log('📁 Current directory:', process.cwd());

// Check Railway status
try {
    console.log('🔍 Checking Railway status...');
    const whoami = execSync('railway whoami', { encoding: 'utf8' });
    console.log('✅', whoami.trim());
} catch (error) {
    console.log('❌ Not logged in to Railway');
    console.log('Please run: railway login');
    process.exit(1);
}

console.log('\n🎯 RAILWAY DEPLOYMENT STEPS:');
console.log('============================');

console.log('\n1️⃣  Initialize Railway project:');
console.log('   railway init');
console.log('   (Name it: verigrade-backend)');

console.log('\n2️⃣  Set environment variables:');
console.log('   railway variables set NODE_ENV=production');
console.log('   railway variables set DATABASE_URL="postgresql://postgres:atCv6BFZ1YQ3bdvK@db.krdwxeeaxldgnhymukyb.supabase.co:5432/postgres"');
console.log('   railway variables set JWT_SECRET="verigrade-super-secure-jwt-secret-key-2024-production"');
console.log('   railway variables set STRIPE_PUBLISHABLE_KEY="pk_live_51SB00GFjFAJQwUPDaTEvzGmZswYvt024Sv9yhTkWByTUw8kP5YoBLhTqJcUXdJToKQy6uUFXFRn866xKUlQTZrcd007KhHxn6K"');
console.log('   railway variables set SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZHd4ZWVheGxkZ25oeW11a3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NTUwOTYsImV4cCI6MjA3NTEzMTA5Nn0.yYj9Fvi4THZC0KBk_EdoUMLm27C_rs3B8c2PeOX6EXI"');
console.log('   railway variables set SMTP_USER="verigradebookkeeping@gmail.com"');
console.log('   railway variables set SMTP_PASS="jxxy spfm ejyk nxxh"');
console.log('   railway variables set SMTP_HOST="smtp.gmail.com"');
console.log('   railway variables set SMTP_PORT="587"');
console.log('   railway variables set FROM_EMAIL="verigradebookkeeping+noreply@gmail.com"');
console.log('   railway variables set PORT="3001"');

console.log('\n3️⃣  Deploy:');
console.log('   railway up');

console.log('\n4️⃣  Get URL:');
console.log('   railway status');

console.log('\n🎉 Your VeriGrade backend will be live on Railway!');
console.log('\n📋 Copy and paste these commands one by one:');
