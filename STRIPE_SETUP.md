# 💳 STRIPE PAYMENT INTEGRATION SETUP

## Step 1: Get Your Stripe Keys

1. Go to https://dashboard.stripe.com/
2. Get your API keys:
   - Publishable key (starts with pk_test_ or pk_live_)
   - Secret key (starts with sk_test_ or sk_live_)
   - Webhook secret (for webhook endpoints)

## Step 2: Update Your .env File

Add these to your backend/.env file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your_secret_key_here"
STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
```

## Step 3: Test Stripe Integration

```bash
cd backend
node test-stripe-connection.js
```

## Step 4: Create Products and Prices

You'll need to create products in your Stripe dashboard:
- Basic Plan: $29/month
- Professional Plan: $79/month  
- Enterprise Plan: $199/month

Your Stripe integration will be ready for payments!
