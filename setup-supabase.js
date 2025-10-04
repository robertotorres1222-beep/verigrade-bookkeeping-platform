#!/usr/bin/env node

/**
 * VeriGrade Supabase Setup Script
 * This script helps you configure your Supabase database
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🗄️ VeriGrade Supabase Database Setup');
console.log('====================================\n');

console.log('📋 STEP-BY-STEP INSTRUCTIONS:\n');

console.log('1. 🌐 Go to Supabase:');
console.log('   https://supabase.com\n');

console.log('2. 🆕 Create Account:');
console.log('   Click "Start your project" and sign up\n');

console.log('3. 🏗️ Create New Project:');
console.log('   - Project Name: verigrade-bookkeeping');
console.log('   - Database Password: [create strong password]');
console.log('   - Region: [choose closest to your users]');
console.log('   - Click "Create new project"\n');

console.log('4. ⏳ Wait for Setup:');
console.log('   Wait for "Project is ready" message (2-3 minutes)\n');

console.log('5. 🔗 Get Database URL:');
console.log('   - Go to "Settings" → "Database"');
console.log('   - Scroll to "Connection string"');
console.log('   - Click "URI" tab');
console.log('   - Copy the connection string\n');

console.log('6. 📝 Update Environment:');
console.log('   Paste your database URL below\n');

rl.question('📋 Paste your Supabase database URL here: ', (databaseUrl) => {
  if (databaseUrl && databaseUrl.startsWith('postgresql://')) {
    console.log('\n✅ Perfect! Now updating your backend/.env file...\n');
    
    const envPath = path.join(__dirname, 'backend', '.env');
    
    try {
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      // Replace the database URL placeholder
      envContent = envContent.replace(
        'DATABASE_URL="postgresql://verigrade_user:CHANGE_THIS_PASSWORD@localhost:5432/verigrade_db"',
        `DATABASE_URL="${databaseUrl}"`
      );
      
      fs.writeFileSync(envPath, envContent);
      
      console.log('🎉 SUCCESS! Your database URL has been added to backend/.env');
      console.log('\n📋 Your database is now configured:');
      console.log('   URL: ' + databaseUrl.substring(0, 50) + '...');
      
      console.log('\n🚀 NEXT STEPS:');
      console.log('   1. Run: cd backend && npx prisma db push');
      console.log('   2. Run: npx prisma generate');
      console.log('   3. Start your backend: npm run dev');
      console.log('   4. Check Supabase dashboard for your tables');
      console.log('   5. Deploy to production!');
      
      console.log('\n✅ Your VeriGrade database is ready!');
      
    } catch (error) {
      console.error('❌ Error updating .env file:', error.message);
      console.log('\n📝 Please manually update backend/.env with:');
      console.log(`   DATABASE_URL="${databaseUrl}"`);
    }
    
  } else {
    console.log('\n❌ Invalid database URL. It should start with "postgresql://"');
    console.log('\n📝 Please manually update backend/.env with your Supabase database URL:');
    console.log('   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"');
  }
  
  rl.close();
});

console.log('\n💡 TIP: You can also manually update backend/.env with your Supabase database URL!');
console.log('\n🔍 Make sure your URL looks like this:');
console.log('   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres');
