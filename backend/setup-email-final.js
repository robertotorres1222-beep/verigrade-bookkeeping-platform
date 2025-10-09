#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📧 SETTING UP YOUR EMAIL SERVICE');
console.log('==================================\n');

// Email configuration
const emailConfig = {
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: 587,
  SMTP_SECURE: false,
  SMTP_USER: 'verigradebookkeeping@gmail.com',
  SMTP_PASS: 'aaou miyq zdik uanp',
  FROM_EMAIL: 'verigradebookkeeping+noreply@gmail.com',
  CONTACT_EMAIL: 'verigradebookkeeping+hello@gmail.com',
  SUPPORT_EMAIL: 'verigradebookkeeping+support@gmail.com',
  SECURITY_EMAIL: 'verigradebookkeeping+security@gmail.com',
  BANKING_EMAIL: 'verigradebookkeeping+banking@gmail.com',
  TAX_EMAIL: 'verigradebookkeeping+tax@gmail.com'
};

// Read the current env.example
const envExamplePath = path.join(__dirname, 'env.example');
const envPath = path.join(__dirname, '.env');

console.log('📝 Reading environment configuration...');

if (!fs.existsSync(envExamplePath)) {
  console.log('❌ env.example file not found!');
  process.exit(1);
}

let envContent = fs.readFileSync(envExamplePath, 'utf8');

// Update email configuration
console.log('🔧 Updating email configuration...');

Object.entries(emailConfig).forEach(([key, value]) => {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(envContent)) {
    envContent = envContent.replace(regex, `${key}="${value}"`);
    console.log(`✅ Updated ${key}`);
  } else {
    envContent += `\n${key}="${value}"`;
    console.log(`➕ Added ${key}`);
  }
});

// Write the .env file
fs.writeFileSync(envPath, envContent);

console.log('\n🎉 EMAIL SETUP COMPLETE!');
console.log('========================');
console.log('✅ Gmail SMTP configured');
console.log('✅ App password set');
console.log('✅ Professional email aliases ready');
console.log('✅ .env file created');

console.log('\n📧 Your Email Addresses:');
console.log(`📨 Contact: ${emailConfig.CONTACT_EMAIL}`);
console.log(`🔒 Security: ${emailConfig.SECURITY_EMAIL}`);
console.log(`🏦 Banking: ${emailConfig.BANKING_EMAIL}`);
console.log(`📊 Tax: ${emailConfig.TAX_EMAIL}`);
console.log(`📧 Support: ${emailConfig.SUPPORT_EMAIL}`);

console.log('\n🚀 NEXT STEPS:');
console.log('1. Run: npm run dev (to start your backend)');
console.log('2. Test email: node test-email.js');
console.log('3. Your website email service is ready!');

console.log('\n🎯 Your VeriGrade platform now has professional email capabilities!');

