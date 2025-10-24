# 🚀 VeriGrade Complete Deployment Guide

## 🎯 **What You'll Deploy**

1. ✅ **Backend API** → Railway or Vercel
2. ✅ **Frontend App** → Vercel (already deployed!)
3. ✅ **Database** → Supabase (already connected!)
4. ✅ **File Storage** → AWS S3 or Vercel Blob
5. ✅ **Background Jobs** → Railway worker process
6. ✅ **Monitoring** → Sentry (error tracking)

---

## 📋 **Prerequisites**

- [x] GitHub account
- [x] Vercel account
- [ ] Railway account (sign up at railway.app)
- [ ] Stripe account (for payments)
- [ ] OpenAI API key (for AI features)
- [ ] Sentry account (for monitoring)

---

## 🚂 **Option 1: Deploy Backend to Railway (RECOMMENDED)**

### **Why Railway?**
- ✅ Free $5/month credit
- ✅ PostgreSQL included
- ✅ Easy deployment
- ✅ Auto-scaling
- ✅ Background workers supported
- ✅ Environment variables management

### **Step-by-Step:**

#### **1. Install Railway CLI**
```powershell
npm install -g @railway/cli
```

#### **2. Login to Railway**
```powershell
railway login
```
*A browser window will open for authentication*

#### **3. Create New Project**
Go to https://railway.app/new and create a new project

#### **4. Deploy Backend**
```powershell
# Navigate to backend directory
cd backend

# Link to Railway project
railway link

# Set environment variables
railway variables --set NODE_ENV=production
railway variables --set PORT=3001
railway variables --set DATABASE_URL=postgresql://postgres:atCv6BFZ1YQ3bdvK@db.krdwxeeaxldgnhymukyb.supabase.co:5432/postgres
railway variables --set JWT_SECRET=verigrade-super-secure-jwt-secret-key-2024-production
railway variables --set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZHd4ZWVheGxkZ25oeW11a3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NTUwOTYsImV4cCI6MjA3NTEzMTA5Nn0.yYj9Fvi4THZC0KBk_EdoUMLm27C_rs3B8c2PeOX6EXI

# Deploy!
railway up
```

#### **5. Get Your Backend URL**
After deployment:
- Go to Railway dashboard
- Click on your service
- Copy the deployment URL (e.g., `https://verigrade-backend.railway.app`)

#### **6. Connect Frontend to Backend**
Go to Vercel:
- Project Settings → Environment Variables
- Add: `NEXT_PUBLIC_API_URL = https://verigrade-backend.railway.app`
- Redeploy frontend

---

## ☁️ **Option 2: Deploy Backend to Vercel (Serverless)**

### **Pros:**
- Same platform as frontend
- Simple deployment
- Auto-scaling

### **Cons:**
- No always-on background workers
- 10-second timeout limit
- More complex for long-running tasks

### **Steps:**

#### **1. Create vercel.json in backend/**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/dist/index.js"
    }
  ]
}
```

#### **2. Deploy**
```powershell
cd backend
vercel
```

#### **3. Set Environment Variables**
In Vercel dashboard for backend project

#### **4. Connect Frontend**
Add `NEXT_PUBLIC_API_URL` to frontend Vercel project

---

## 📦 **Deploy Background Worker (For AI Features)**

If you want AI transaction categorization:

### **Railway Worker:**
```powershell
cd backend
railway link
railway up --service worker
```

### **Separate Vercel Function:**
Create `api/worker.js`:
```javascript
import { categorizerQueue } from '../dist/queue/categorizerWorker';

export default async function handler(req, res) {
  // Process job queue
  // Return status
}
```

---

## 🗄️ **Setup File Storage**

### **Option A: AWS S3**

1. Create S3 bucket at aws.amazon.com
2. Get Access Key and Secret
3. Add to backend environment:
```
S3_BUCKET=verigrade-files
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=AKIA...
S3_SECRET_ACCESS_KEY=...
```

### **Option B: Vercel Blob Storage**

1. Enable in Vercel project
2. Add environment variable:
```
BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

---

## 🔍 **Setup Monitoring (Sentry)**

### **1. Create Sentry Account**
Sign up at sentry.io (free tier available)

### **2. Create New Project**
- Choose Node.js for backend
- Choose Next.js for frontend

### **3. Get DSN**
Copy your Sentry DSN from project settings

### **4. Add to Environment Variables**

**Backend (Railway/Vercel):**
```
SENTRY_DSN=https://xxx@yyy.ingest.sentry.io/zzz
```

**Frontend (Vercel):**
```
NEXT_PUBLIC_SENTRY_DSN=https://xxx@yyy.ingest.sentry.io/zzz
```

### **5. Initialize in Code**
Already done! Check `backend/src/config/sentry.ts`

---

## 💳 **Setup Stripe Subscriptions**

### **1. Create Products in Stripe Dashboard**

Go to https://dashboard.stripe.com/products

#### **Free Plan** (Handled in code, no Stripe product needed)

#### **Starter Plan - $19/month**
- Create product
- Add recurring price: $19/month
- Copy Price ID (e.g., `price_1234567890`)

#### **Professional Plan - $49/month**
- Create product
- Add recurring price: $49/month
- Copy Price ID

### **2. Update Code**
Edit `backend/src/services/subscriptionService.ts`:
```typescript
STARTER: {
  id: 'price_YOUR_ACTUAL_PRICE_ID', // Replace this
  name: 'Starter',
  price: 19,
  ...
},
```

### **3. Setup Webhook**

1. Go to Stripe → Developers → Webhooks
2. Add endpoint: `https://your-backend-url.railway.app/webhooks/stripe`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Copy webhook secret
5. Add to backend env: `STRIPE_WEBHOOK_SECRET=whsec_...`

---

## 🤖 **Setup AI Features (Optional)**

### **1. Get OpenAI API Key**
- Go to platform.openai.com
- Create API key
- Add $5-10 credit

### **2. Add to Environment**
```
OPENAI_API_KEY=sk-...
```

### **3. Setup Redis (for job queue)**

**Option A: Railway Redis**
```powershell
railway add redis
# Copy connection URL
railway variables --set REDIS_URL=redis://...
```

**Option B: Upstash (Free tier)**
- Sign up at upstash.com
- Create Redis database
- Copy connection URL
- Add to environment

---

## ✅ **Post-Deployment Checklist**

### **Backend**
- [ ] Backend deployed and accessible
- [ ] Health check works: `https://your-backend-url/health`
- [ ] Database migrations run
- [ ] Environment variables set
- [ ] Sentry receiving errors
- [ ] Stripe webhook active

### **Frontend**
- [ ] Frontend deployed
- [ ] Connected to backend
- [ ] Can register new user
- [ ] Can login
- [ ] Can create invoice
- [ ] Public (deployment protection disabled)

### **Features**
- [ ] Email sending works
- [ ] File uploads work
- [ ] Bank integration (Plaid) works
- [ ] Stripe payments work
- [ ] AI categorization works (if enabled)
- [ ] PDF generation works (if S3 configured)

### **Monitoring**
- [ ] Sentry catching errors
- [ ] Analytics tracking users
- [ ] Uptime monitoring active
- [ ] Database backups enabled

---

## 🧪 **Testing Production**

### **1. Test Authentication**
```bash
# Register
curl -X POST https://your-backend-url/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "firstName": "Test",
    "lastName": "User",
    "organizationName": "Test Org"
  }'

# Login
curl -X POST https://your-backend-url/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### **2. Test Invoice Creation**
Use Postman or frontend UI

### **3. Test Stripe Payment**
Use test card: `4242 4242 4242 4242`

---

## 🚨 **Troubleshooting**

### **Backend Not Responding**
1. Check Railway/Vercel logs
2. Verify environment variables
3. Check database connection
4. Test health endpoint

### **Frontend Can't Connect to Backend**
1. Verify `NEXT_PUBLIC_API_URL` is set
2. Check CORS settings in backend
3. Verify backend is deployed
4. Check browser console for errors

### **Database Errors**
1. Check `DATABASE_URL` format
2. Verify database is accessible
3. Run migrations: `npx prisma migrate deploy`
4. Check Supabase dashboard

### **Stripe Errors**
1. Verify webhook secret is correct
2. Check webhook endpoint is accessible
3. Test with Stripe CLI: `stripe listen --forward-to localhost:3001/webhooks/stripe`

---

## 📊 **Monitoring & Maintenance**

### **Daily**
- Check Sentry for errors
- Monitor uptime
- Review failed payments

### **Weekly**
- Check database size
- Review API usage
- Check backup status
- Monitor performance metrics

### **Monthly**
- Database backups verification
- Security updates
- Dependency updates
- Performance optimization

---

## 🎯 **Deployment Automation**

### **GitHub Actions (Already Created!)**

`.github/workflows/ci.yml` will:
- ✅ Run tests on every push
- ✅ Check for security issues
- ✅ Auto-deploy to production on main branch

### **Enable GitHub Actions:**
1. Go to repository → Settings → Actions
2. Enable workflows
3. Push to main branch
4. Watch automatic deployment!

---

## 📞 **Support & Resources**

- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Stripe Docs:** https://stripe.com/docs
- **Sentry Docs:** https://docs.sentry.io

---

## 🎉 **You're Done!**

Your VeriGrade platform is now:
- ✅ Fully deployed
- ✅ Production-ready
- ✅ Monitored
- ✅ Scalable
- ✅ Secure

**Now go get customers!** 🚀

---

**Last Updated:** January 2025  
**Version:** 1.0.0








