#!/usr/bin/env node

/**
 * VeriGrade Stripe Webhook Setup Script
 * This script helps you set up your Stripe webhook endpoint
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔗 VeriGrade Stripe Webhook Setup');
console.log('================================\n');

console.log('📋 STEP-BY-STEP INSTRUCTIONS:\n');

console.log('1. 🌐 Go to Stripe Dashboard:');
console.log('   https://dashboard.stripe.com\n');

console.log('2. 🛠️ Navigate to Webhooks:');
console.log('   Click "Developers" → "Webhooks" → "Add endpoint"\n');

console.log('3. 🔗 Configure Your Endpoint:');
console.log('   Endpoint URL: https://yourdomain.com/api/v1/stripe/webhook');
console.log('   Description: VeriGrade Bookkeeping Platform Webhooks\n');

console.log('4. 📝 Select These Events:');
const events = [
  'payment_intent.succeeded',
  'payment_intent.payment_failed', 
  'payment_intent.canceled',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.created',
  'customer.updated',
  'checkout.session.completed',
  'setup_intent.succeeded'
];

events.forEach(event => {
  console.log(`   ✅ ${event}`);
});

console.log('\n5. 💾 Copy the Webhook Secret:');
console.log('   After creating the endpoint, copy the "Signing secret"');
console.log('   (starts with "whsec_...")\n');

rl.question('📋 Paste your webhook secret here: ', (webhookSecret) => {
  if (webhookSecret && webhookSecret.startsWith('whsec_')) {
    console.log('\n✅ Perfect! Now updating your backend/.env file...\n');
    
    const fs = require('fs');
    const path = require('path');
    
    const envPath = path.join(__dirname, 'backend', '.env');
    
    try {
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      // Replace the webhook secret placeholder
      envContent = envContent.replace(
        'STRIPE_WEBHOOK_SECRET="whsec_YOUR_WEBHOOK_SECRET_HERE"',
        `STRIPE_WEBHOOK_SECRET="${webhookSecret}"`
      );
      
      fs.writeFileSync(envPath, envContent);
      
      console.log('🎉 SUCCESS! Your webhook secret has been added to backend/.env');
      console.log('\n📋 Your webhook endpoint is now configured:');
      console.log('   URL: https://yourdomain.com/api/v1/stripe/webhook');
      console.log('   Secret: ' + webhookSecret.substring(0, 20) + '...');
      
      console.log('\n🚀 NEXT STEPS:');
      console.log('   1. Deploy your application to production');
      console.log('   2. Update the webhook URL with your actual domain');
      console.log('   3. Test with a small payment');
      console.log('   4. Start accepting real payments!');
      
    } catch (error) {
      console.error('❌ Error updating .env file:', error.message);
      console.log('\n📝 Please manually update backend/.env with:');
      console.log(`   STRIPE_WEBHOOK_SECRET="${webhookSecret}"`);
    }
    
  } else {
    console.log('\n❌ Invalid webhook secret. It should start with "whsec_"');
    console.log('\n📝 Please manually update backend/.env with your webhook secret:');
    console.log('   STRIPE_WEBHOOK_SECRET="whsec_YOUR_ACTUAL_SECRET_HERE"');
  }
  
  rl.close();
});

console.log('\n💡 TIP: You can also manually update backend/.env with your webhook secret!');
