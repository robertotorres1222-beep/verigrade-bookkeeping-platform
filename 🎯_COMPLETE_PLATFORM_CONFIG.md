# 🚀 Complete Platform Configuration Guide

## ✅ **Supabase Database Setup Complete!**

Your Supabase database is ready with all tables and sample data. Now let's configure Railway and Vercel.

---

## 🔧 **Railway Backend Configuration**

### **Step 1: Add Environment Variables to Railway**

1. Go to your Railway project dashboard
2. Click on your backend service
3. Go to **Variables** tab
4. Add these environment variables:

```bash
# Database Configuration
DATABASE_URL=postgres://postgres.acsftcjydhuowkqgrllo:hCXUlNs9o8MbS4cS@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
POSTGRES_URL=postgres://postgres.acsftcjydhuowkqgrllo:hCXUlNs9o8MbS4cS@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
POSTGRES_USER=postgres
POSTGRES_HOST=db.acsftcjydhuowkqgrllo.supabase.co
POSTGRES_PASSWORD=hCXUlNs9o8MbS4cS
POSTGRES_DATABASE=postgres
POSTGRES_URL_NON_POOLING=postgres://postgres.acsftcjydhuowkqgrllo:hCXUlNs9o8MbS4cS@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require

# Supabase Configuration
SUPABASE_URL=https://acsftcjydhuowkqgrllo.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjc2Z0Y2p5ZGh1b3drcWdybGxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MTM3NDUsImV4cCI6MjA3NzA4OTc0NX0.hBpnuWBJJh_Ob99yeRsCe6xSWBhw25vzrLnbrCCpj9Q
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjc2Z0Y2p5ZGh1b3drcWdybGxvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTUxMzc0NSwiZXhwIjoyMDc3MDg5NzQ1fQ.nZdadhKFTYPjNbJ-P3udg_vkseC0XwvTDx1Hwb3QfQg
SUPABASE_JWT_SECRET=+VYRhNHcL94koUEEHt9B1EbfgB1JgCy3YuRb7Q4Htwdn0uoGStxmLQM3lUqFe0LfiC+9UXbIDAscWQghkI5hag==

# Application Configuration
NODE_ENV=production
PORT=3001
JWT_SECRET=your-jwt-secret-here
CORS_ORIGIN=https://your-vercel-app.vercel.app

# Optional: Add your Vercel frontend URL
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### **Step 2: Redeploy Railway Service**

1. After adding all environment variables
2. Click **Deploy** or trigger a new deployment
3. Wait for deployment to complete

---

## 🌐 **Vercel Frontend Configuration**

### **Step 1: Add Environment Variables to Vercel**

1. Go to your Vercel project dashboard
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Add these environment variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://acsftcjydhuowkqgrllo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjc2Z0Y2p5ZGh1b3drcWdybGxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MTM3NDUsImV4cCI6MjA3NzA4OTc0NX0.hBpnuWBJJh_Ob99yeRsCe6xSWBhw25vzrLnbrCCpj9Q

# Backend API Configuration
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app
API_URL=https://your-railway-app.railway.app

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=VeriGrade
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### **Step 2: Redeploy Vercel Project**

1. After adding all environment variables
2. Go to **Deployments** tab
3. Click **Redeploy** on the latest deployment
4. Wait for deployment to complete

---

## 🧪 **Testing Your Configuration**

### **Step 1: Test Railway Backend**

```bash
# Test health endpoint
curl https://your-railway-app.railway.app/api/health

# Expected response:
# {"status":"ok","timestamp":"2025-01-27T...","uptime":123.456}
```

### **Step 2: Test Vercel Frontend**

1. Visit your Vercel app URL
2. Check browser console for any errors
3. Verify Supabase connection is working

### **Step 3: Test Full Integration**

```bash
# Test database connection through backend
curl https://your-railway-app.railway.app/api/companies

# Expected response: Array of companies from your sample data
```

---

## 🔍 **Troubleshooting**

### **Railway Issues:**

1. **Environment Variables Not Loading:**
   - Check variable names are exact (case-sensitive)
   - Redeploy after adding variables
   - Check Railway logs for errors

2. **Database Connection Errors:**
   - Verify DATABASE_URL is correct
   - Check Supabase project is active
   - Ensure SSL mode is set to require

3. **CORS Errors:**
   - Add your Vercel URL to CORS_ORIGIN
   - Check frontend is using correct API URL

### **Vercel Issues:**

1. **Supabase Connection Errors:**
   - Verify NEXT_PUBLIC_SUPABASE_URL is correct
   - Check NEXT_PUBLIC_SUPABASE_ANON_KEY is valid
   - Ensure environment variables are public (NEXT_PUBLIC_)

2. **API Connection Errors:**
   - Verify NEXT_PUBLIC_API_URL points to Railway
   - Check Railway service is running
   - Test API endpoints directly

---

## 📋 **Quick Checklist**

### **Railway Backend:**
- [ ] All environment variables added
- [ ] Service redeployed
- [ ] Health endpoint responding
- [ ] Database connection working

### **Vercel Frontend:**
- [ ] All environment variables added
- [ ] Project redeployed
- [ ] Supabase connection working
- [ ] API calls to Railway working

### **Full Integration:**
- [ ] Frontend can connect to backend
- [ ] Backend can connect to Supabase
- [ ] Sample data visible in frontend
- [ ] No console errors

---

## 🎯 **Next Steps After Success**

1. **Test Core Features:**
   - User authentication
   - Company management
   - Transaction creation
   - Invoice generation

2. **Monitor Performance:**
   - Check Railway logs
   - Monitor Vercel analytics
   - Test response times

3. **Add Custom Features:**
   - Custom business logic
   - Additional integrations
   - Advanced reporting

---

**🎉 Your VeriGrade platform should now be fully operational!**

**Railway Dashboard:** https://railway.app/dashboard
**Vercel Dashboard:** https://vercel.com/dashboard
**Supabase Dashboard:** https://supabase.com/dashboard/project/krdwxeeaxldgnhymukyb


