# 🚀 **RAILWAY DEPLOYMENT GUIDE - VERIGRADE BACKEND**

## **Step-by-Step Railway Deployment**

### **Step 1: Install Railway CLI**
```bash
npm install -g @railway/cli
```

### **Step 2: Login to Railway**
```bash
railway login
```
- This will open your browser to authenticate with Railway
- Follow the authentication process

### **Step 3: Navigate to Backend Directory**
```bash
cd backend
```

### **Step 4: Initialize Railway Project**
```bash
railway init
```
- Choose "Create new project"
- Name your project: `verigrade-backend`
- Select your team/account

### **Step 5: Set Environment Variables**
Run these commands one by one:

```bash
railway variables set NODE_ENV=production
railway variables set DATABASE_URL="postgresql://postgres:atCv6BFZ1YQ3bdvK@db.krdwxeeaxldgnhymukyb.supabase.co:5432/postgres"
railway variables set JWT_SECRET="verigrade-super-secure-jwt-secret-key-2024-production"
railway variables set STRIPE_PUBLISHABLE_KEY="pk_live_51SB00GFjFAJQwUPDaTEvzGmZswYvt024Sv9yhTkWByTUw8kP5YoBLhTqJcUXdJToKQy6uUFXFRn866xKUlQTZrcd007KhHxn6K"
railway variables set SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZHd4ZWVheGxkZ25oeW11a3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NTUwOTYsImV4cCI6MjA3NTEzMTA5Nn0.yYj9Fvi4THZC0KBk_EdoUMLm27C_rs3B8c2PeOX6EXI"
railway variables set SMTP_USER="verigradebookkeeping@gmail.com"
railway variables set SMTP_PASS="jxxy spfm ejyk nxxh"
railway variables set SMTP_HOST="smtp.gmail.com"
railway variables set SMTP_PORT="587"
railway variables set FROM_EMAIL="verigradebookkeeping+noreply@gmail.com"
railway variables set PORT="3001"
```

### **Step 6: Deploy to Railway**
```bash
railway up
```

### **Step 7: Get Your Backend URL**
```bash
railway status
```
- Copy the URL (it will look like: `https://your-app-name.railway.app`)

### **Step 8: Test Your Deployment**
Visit: `https://your-app-name.railway.app/health`

---

## **🎯 QUICK DEPLOYMENT COMMANDS**

Copy and paste these commands one by one:

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login (opens browser)
railway login

# 3. Go to backend directory
cd backend

# 4. Initialize project
railway init

# 5. Set all environment variables
railway variables set NODE_ENV=production
railway variables set DATABASE_URL="postgresql://postgres:atCv6BFZ1YQ3bdvK@db.krdwxeeaxldgnhymukyb.supabase.co:5432/postgres"
railway variables set JWT_SECRET="verigrade-super-secure-jwt-secret-key-2024-production"
railway variables set STRIPE_PUBLISHABLE_KEY="pk_live_51SB00GFjFAJQwUPDaTEvzGmZswYvt024Sv9yhTkWByTUw8kP5YoBLhTqJcUXdJToKQy6uUFXFRn866xKUlQTZrcd007KhHxn6K"
railway variables set SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZHd4ZWVheGxkZ25oeW11a3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NTUwOTYsImV4cCI6MjA3NTEzMTA5Nn0.yYj9Fvi4THZC0KBk_EdoUMLm27C_rs3B8c2PeOX6EXI"
railway variables set SMTP_USER="verigradebookkeeping@gmail.com"
railway variables set SMTP_PASS="jxxy spfm ejyk nxxh"
railway variables set SMTP_HOST="smtp.gmail.com"
railway variables set SMTP_PORT="587"
railway variables set FROM_EMAIL="verigradebookkeeping+noreply@gmail.com"
railway variables set PORT="3001"

# 6. Deploy
railway up

# 7. Get URL
railway status
```

---

## **✅ AFTER DEPLOYMENT**

### **Your Backend Will Be Available At:**
- **Health Check:** `https://your-app.railway.app/health`
- **API Base:** `https://your-app.railway.app/api/v1`
- **Email Test:** `https://your-app.railway.app/test-email`

### **Next Steps:**
1. **Copy your Railway backend URL**
2. **Update frontend API_URL** in Vercel dashboard
3. **Deploy frontend to Vercel**
4. **Test complete platform**

---

## **🎉 VERIGRADE BACKEND DEPLOYED!**

Your VeriGrade backend is now live on Railway with:
- ✅ Production database (Supabase)
- ✅ Email service (Gmail SMTP)
- ✅ Payment processing (Stripe)
- ✅ Authentication (JWT)
- ✅ File uploads
- ✅ All business logic

**Ready to serve customers!** 🚀
