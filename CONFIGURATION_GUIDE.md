# VeriGrade Configuration Guide

## 🚀 Making Your Platform 100% Functional

### Step 1: Database Setup

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL (if not already installed)
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql

# Start PostgreSQL service
# macOS: brew services start postgresql
# Ubuntu: sudo systemctl start postgresql

# Create database
createdb verigrade

# Set up Prisma
cd backend
npx prisma generate
npx prisma db push
```

#### Option B: Cloud Database (Recommended)
- **Neon** (Free PostgreSQL): https://neon.tech
- **Supabase** (Free PostgreSQL): https://supabase.com
- **Railway** (Free PostgreSQL): https://railway.app

### Step 2: Environment Configuration

Create a `.env` file in the `backend` directory with:

```env
# Database Configuration
DATABASE_URL="your-database-url-here"

# Server Configuration
NODE_ENV="production"
PORT=3001
API_VERSION="v1"
CORS_ORIGIN="https://your-domain.com"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Email Configuration (Gmail example)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@verigrade.com"
ADMIN_EMAIL="admin@verigrade.com"
SALES_EMAIL="sales@verigrade.com"
CONTACT_EMAIL="support@verigrade.com"

# OpenAI Configuration (for AI features)
OPENAI_API_KEY="your-openai-api-key-here"

# Plaid Configuration (for bank integration)
PLAID_CLIENT_ID="your-plaid-client-id"
PLAID_SECRET="your-plaid-secret"
PLAID_ENVIRONMENT="sandbox"

# Redis Configuration (optional for caching)
REDIS_URL="redis://localhost:6379"

# Rate Limiting
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX_REQUESTS="100"
```

### Step 3: API Keys Setup

#### 1. OpenAI API Key (for AI features)
- Go to: https://platform.openai.com/api-keys
- Create a new API key
- Add to your `.env` file

#### 2. Plaid API Keys (for bank integration)
- Go to: https://dashboard.plaid.com
- Create a new application
- Get your Client ID and Secret
- Add to your `.env` file

#### 3. Email Configuration
- **Gmail**: Use App Passwords (recommended)
- **SendGrid**: Professional email service
- **Resend**: Modern email API
- **AWS SES**: Enterprise email service

### Step 4: Stripe Integration (Real Payments)

Add Stripe to your backend:

```bash
cd backend
npm install stripe
```

Add to your `.env`:
```env
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"
```

Update your payment route to use real Stripe:

```typescript
// In backend/src/routes/payments.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Replace the mock payment with real Stripe integration
```

### Step 5: Production Deployment

#### Option A: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy backend
cd backend
vercel

# Deploy frontend
cd ../frontend
vercel
```

#### Option B: Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### Option C: DigitalOcean App Platform
- Connect your GitHub repository
- Configure environment variables
- Deploy automatically

### Step 6: Testing Your System

#### 1. Test Database Connection
```bash
cd backend
npm run dev
# Should show: "Database connected successfully"
```

#### 2. Test Email System
- Submit a contact form
- Check if emails are sent
- Verify auto-replies work

#### 3. Test Payment System
- Try the payment form
- Check Stripe dashboard for payments
- Verify confirmation emails

#### 4. Test Dashboard
- Login with demo credentials
- Add/edit transactions
- Check AI categorization (if OpenAI key configured)

### Step 7: Production Checklist

- [ ] Database configured and migrated
- [ ] Environment variables set
- [ ] Email service working
- [ ] OpenAI API key configured
- [ ] Plaid API keys configured
- [ ] Stripe payment processing working
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] Backup system in place
- [ ] Monitoring setup

### Step 8: Advanced Features

#### Add Real Banking
- Configure Plaid webhooks
- Set up account verification
- Implement transaction sync

#### Add Human Advisors
- Create advisor portal
- Implement booking system
- Add video call integration

#### Add Tax Services
- Integrate with tax APIs
- Add tax calculation engine
- Implement filing workflows

### Support

If you need help with any of these steps:
1. Check the logs for errors
2. Verify all environment variables
3. Test each component individually
4. Contact support if needed

Your VeriGrade platform is now ready to compete with Zeni! 🚀
