# Stripe Integration Setup Guide

Your VeriGrade platform now has complete Stripe integration for all payment processing needs. Follow these steps to set up your Stripe account and configure the platform.

## 🚀 **What's Included**

### **Backend Features:**
- ✅ Customer management
- ✅ Subscription billing
- ✅ Advisor session payments
- ✅ Tax filing payments
- ✅ Banking setup fees
- ✅ Payment method management
- ✅ Webhook handling
- ✅ Checkout sessions

### **Frontend Components:**
- ✅ Stripe provider wrapper
- ✅ Payment form component
- ✅ Subscription checkout
- ✅ Card element integration

## 📋 **Setup Steps**

### **1. Create Stripe Account**
1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete business verification
3. Get your API keys from the Dashboard

### **2. Get Your Stripe Keys**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers > API Keys**
3. Copy your keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

### **3. Set Up Webhooks**
1. Go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL to: `https://yourdomain.com/api/v1/stripe/webhook`
4. Select these events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)

### **4. Configure Environment Variables**

#### **Backend (.env file):**
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@verigrade.com
CONTACT_EMAIL=support@verigrade.com
BANKING_EMAIL=banking@verigrade.com
TAX_EMAIL=tax@verigrade.com
```

#### **Frontend (.env file):**
```bash
# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# API Configuration
REACT_APP_API_URL=http://localhost:3001/api/v1
```

### **5. Create Stripe Products & Prices**

#### **Subscription Plans:**
```bash
# Starter Plan
Product: "VeriGrade Starter"
Price: $349/month or $299/year

# Growth Plan  
Product: "VeriGrade Growth"
Price: $649/month or $549/year

# Enterprise Plan
Product: "VeriGrade Enterprise"
Price: $1299/month or $1199/year
```

#### **One-time Services:**
```bash
# Advisor Sessions
Product: "Expert Advisor Session"
Price: $200-300/hour

# Tax Filing
Product: "Tax Filing Service"
Price: $500-2000 (varies by complexity)

# Banking Setup
Product: "Business Banking Setup"
Price: $0 (free setup)
```

### **6. Test the Integration**

#### **Test Cards:**
```bash
# Successful payment
4242 4242 4242 4242

# Declined payment
4000 0000 0000 0002

# Requires authentication
4000 0025 0000 3155
```

#### **Test Flow:**
1. Start your backend: `npm run dev`
2. Start your frontend: `npm start`
3. Go to `/pricing` page
4. Click "Start Free Trial" on any plan
5. Use test card: `4242 4242 4242 4242`
6. Use any future expiry date and any 3-digit CVC

## 🔧 **API Endpoints**

### **Customer Management:**
- `POST /api/v1/stripe/customer` - Create/update customer
- `GET /api/v1/stripe/payment-methods` - Get saved payment methods

### **Subscriptions:**
- `POST /api/v1/stripe/subscription` - Create subscription
- `POST /api/v1/stripe/checkout-session` - Create checkout session

### **One-time Payments:**
- `POST /api/v1/stripe/advisor-payment` - Pay for advisor session
- `POST /api/v1/stripe/tax-payment` - Pay for tax filing
- `POST /api/v1/stripe/banking-payment` - Banking setup payment

### **Webhooks:**
- `POST /api/v1/stripe/webhook` - Handle Stripe events

## 💰 **Pricing Configuration**

Update your pricing in the frontend to match your Stripe price IDs:

```typescript
// In PricingPage.tsx
const pricingTiers = [
  {
    id: 'starter',
    priceId: 'price_starter_monthly', // Your actual Stripe price ID
    name: 'Starter',
    price: 349,
    // ... rest of config
  },
  // ... other plans
];
```

## 🚀 **Go Live Checklist**

### **Before Going Live:**
- [ ] Switch to live Stripe keys
- [ ] Update webhook URL to production domain
- [ ] Test all payment flows with real cards
- [ ] Set up monitoring and alerts
- [ ] Configure email notifications
- [ ] Test webhook handling
- [ ] Set up proper error handling
- [ ] Configure rate limiting

### **Production Environment Variables:**
```bash
# Use live keys
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret

# Production URLs
REACT_APP_API_URL=https://api.verigrade.com/api/v1
```

## 📊 **Monitoring & Analytics**

### **Stripe Dashboard:**
- Monitor payments, subscriptions, and refunds
- View customer data and payment methods
- Track revenue and growth metrics
- Handle disputes and chargebacks

### **Custom Analytics:**
- Track subscription conversions
- Monitor advisor session bookings
- Analyze tax filing completion rates
- Measure banking application success

## 🆘 **Support & Troubleshooting**

### **Common Issues:**
1. **Webhook not receiving events**: Check URL and signing secret
2. **Payment failing**: Verify card details and Stripe keys
3. **CORS errors**: Ensure frontend URL is in CORS settings
4. **Email not sending**: Check SMTP configuration

### **Debug Mode:**
Enable Stripe test mode and check logs:
```bash
# Backend logs
npm run dev

# Stripe CLI for webhook testing
stripe listen --forward-to localhost:3001/api/v1/stripe/webhook
```

## 🎯 **Next Steps**

1. **Add your Stripe keys** to environment files
2. **Create products and prices** in Stripe Dashboard
3. **Test payment flows** with test cards
4. **Set up webhooks** for production
5. **Configure email templates** for notifications
6. **Go live** with live Stripe keys

Your VeriGrade platform is now ready to process payments for all services! 🚀
