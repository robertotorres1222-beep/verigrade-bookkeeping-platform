# 🚀 Complete Deployment Guide

## Current Status:
- ✅ **Frontend**: Successfully deployed to Vercel
- ⏳ **Backend**: Needs Railway deployment
- ⏳ **Database**: Needs Supabase setup
- ⏳ **Automation**: Needs N8N setup

## 🎯 Step-by-Step Deployment Instructions

### 1. Backend Deployment to Railway

#### Option A: Manual Railway Deployment
1. Go to [Railway.app](https://railway.app)
2. Login to your account
3. Click "New Project"
4. Choose "Deploy from GitHub repo"
5. Select your `verigrade-bookkeeping-platform` repository
6. Choose the `backend` folder
7. Railway will automatically detect it's a Node.js project
8. Set environment variables (see below)

#### Option B: Railway CLI (if you prefer command line)
```bash
# Navigate to backend folder
cd backend

# Login to Railway (if not already logged in)
railway login

# Link to existing project or create new one
railway link

# Deploy
railway up
```

### 2. Environment Variables for Backend

Set these in Railway dashboard or via CLI:

```bash
# Database
DATABASE_URL=your_supabase_connection_string
DIRECT_URL=your_supabase_direct_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# API Keys
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox

# File Storage
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket_name

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Redis (optional)
REDIS_URL=your_redis_url

# Sentry (optional)
SENTRY_DSN=your_sentry_dsn

# Environment
NODE_ENV=production
PORT=3000
```

### 3. Supabase Database Setup

1. Go to [Supabase.com](https://supabase.com)
2. Create a new project
3. Get your connection strings from Settings > Database
4. Run Prisma migrations:

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### 4. N8N Automation Setup

#### Option A: Railway N8N Template
1. In Railway dashboard, click "New Project"
2. Choose "Deploy from Template"
3. Search for "N8N"
4. Deploy the template
5. Set environment variables:
   - `N8N_BASIC_AUTH_ACTIVE=true`
   - `N8N_BASIC_AUTH_USER=admin`
   - `N8N_BASIC_AUTH_PASSWORD=your_password`
   - `N8N_WEBHOOK_URL=your_railway_n8n_url`

#### Option B: Docker Deployment
```bash
# Create docker-compose.yml for N8N
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your_password
      - WEBHOOK_URL=your_webhook_url
```

### 5. Frontend Environment Variables

Update your Vercel deployment with these environment variables:

```bash
NEXT_PUBLIC_API_URL=https://your-railway-backend-url.railway.app
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🔧 Quick Setup Scripts

### Backend Setup Script
```bash
# Install dependencies
cd backend
npm install

# Generate Prisma client
npx prisma generate

# Run migrations (after setting DATABASE_URL)
npx prisma migrate deploy

# Start development server
npm run dev
```

### Database Migration Script
```bash
cd backend
npx prisma db push
npx prisma db seed
```

## 🌐 URLs After Deployment

- **Frontend**: https://frontend-m50gmqvfz-robertotos-projects.vercel.app
- **Backend**: https://your-railway-backend-url.railway.app
- **Database**: Your Supabase dashboard
- **N8N**: https://your-n8n-url.railway.app

## 🚨 Common Issues & Solutions

### 1. Railway Deployment Issues
- Make sure you're in the correct directory
- Check that `package.json` exists in backend folder
- Verify environment variables are set

### 2. Database Connection Issues
- Double-check your Supabase connection string
- Ensure database is accessible from Railway
- Run `npx prisma db push` to sync schema

### 3. Frontend API Connection
- Update `NEXT_PUBLIC_API_URL` in Vercel
- Check CORS settings in backend
- Verify API endpoints are working

## 📞 Need Help?

If you run into issues:
1. Check Railway logs: `railway logs`
2. Check Vercel logs in dashboard
3. Verify environment variables
4. Test API endpoints manually

## 🎯 Next Steps After Deployment

1. Test all API endpoints
2. Verify database connections
3. Set up N8N workflows
4. Configure webhooks
5. Test full integration

Would you like me to help you with any specific step?



