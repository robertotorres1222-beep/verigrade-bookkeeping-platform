#!/usr/bin/env node

const stripe = require('stripe');
require('dotenv').config();

console.log('💳 TESTING STRIPE CONNECTION...
');

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
    console.log(`✅ Account ID: ${account.id}`);
    console.log(`✅ Country: ${account.country}`);
    console.log(`✅ Currency: ${account.default_currency}`);
    
    // Test products
    const products = await stripeClient.products.list({ limit: 5 });
    console.log(`✅ Products accessible (found ${products.data.length} products)`);
    
    // Test prices
    const prices = await stripeClient.prices.list({ limit: 5 });
    console.log(`✅ Prices accessible (found ${prices.data.length} prices)`);
    
    console.log('
🎉 STRIPE IS READY FOR PAYMENTS!');
    
  } catch (error) {
    console.error('❌ Stripe connection failed:', error.message);
    
    if (error.message.includes('Invalid API Key')) {
      console.log('
🔧 TROUBLESHOOTING:');
      console.log('1. Check your STRIPE_SECRET_KEY in .env file');
      console.log('2. Make sure you're using the correct key (test vs live)');
      console.log('3. Verify your Stripe account is active');
    }
    
    process.exit(1);
  }
}

testStripeConnection();
