#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

console.log('🧪 TESTING DATABASE CONNECTION...
');

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  try {
    console.log('📡 Testing connection to:', process.env.DATABASE_URL?.replace(///.*@/, '//***:***@'));
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test user table
    const userCount = await prisma.user.count();
    console.log(`✅ User table accessible (count: ${userCount})`);
    
    // Test organization table
    const orgCount = await prisma.organization.count();
    console.log(`✅ Organization table accessible (count: ${orgCount})`);
    
    // Test transaction table
    const transactionCount = await prisma.transaction.count();
    console.log(`✅ Transaction table accessible (count: ${transactionCount})`);
    
    console.log('
🎉 DATABASE IS READY FOR PRODUCTION!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('
🔧 TROUBLESHOOTING:');
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
