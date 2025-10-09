# 🚂 **RAILWAY DEPLOYMENT GUIDE - VERIGRADE BACKEND**

## **✅ RAILWAY CLI INSTALLED!**

The Railway CLI has been successfully installed. Now let's deploy your VeriGrade backend!

---

## **🚀 STEP-BY-STEP RAILWAY DEPLOYMENT:**

### **Step 1: Login to Railway**
Open PowerShell and run:
```bash
railway login
```
- This will open a browser window
- Sign in with your GitHub, Google, or email account
- Complete the authentication process

### **Step 2: Initialize Railway Project**
```bash
cd backend
railway init
```
- Choose "Create new project"
- Name your project: `verigrade-backend`

### **Step 3: Deploy to Railway**
```bash
railway deploy
```
- This will build and deploy your backend
- Wait for the deployment to complete
- Note the generated URL (e.g., `https://verigrade-backend-production.up.railway.app`)

### **Step 4: Set Environment Variables**
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
```

### **Step 5: Configure CORS**
```bash
railway variables set CORS_ORIGIN="*"
```

### **Step 6: Restart Deployment**
```bash
railway redeploy
```

---

## **🔧 ALTERNATIVE METHOD - RAILWAY DASHBOARD:**

### **Step 1: Create New Project**
1. Go to [https://railway.app](https://railway.app)
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your repository
5. Choose the `backend` folder

### **Step 2: Configure Environment Variables**
In the Railway dashboard:
1. Go to your project
2. Click on "Variables"
3. Add these variables:

```
NODE_ENV=production
DATABASE_URL=postgresql://postgres:atCv6BFZ1YQ3bdvK@db.krdwxeeaxldgnhymukyb.supabase.co:5432/postgres
JWT_SECRET=verigrade-super-secure-jwt-secret-key-2024-production
STRIPE_PUBLISHABLE_KEY=pk_live_51SB00GFjFAJQwUPDaTEvzGmZswYvt024Sv9yhTkWByTUw8kP5YoBLhTqJcUXdJToKQy6uUFXFRn866xKUlQTZrcd007KhHxn6K
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZHd4ZWVheGxkZ25oeW11a3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NTUwOTYsImV4cCI6MjA3NTEzMTA5Nn0.yYj9Fvi4THZC0KBk_EdoUMLm27C_rs3B8c2PeOX6EXI
SMTP_USER=verigradebookkeeping@gmail.com
SMTP_PASS=jxxy spfm ejyk nxxh
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
FROM_EMAIL=verigradebookkeeping+noreply@gmail.com
CORS_ORIGIN=*
```

### **Step 3: Deploy**
1. Railway will automatically detect your Node.js project
2. It will build and deploy your backend
3. Wait for the deployment to complete

---

## **🧪 TESTING YOUR DEPLOYMENT:**

### **Health Check**
Once deployed, test your backend:
```bash
curl https://your-railway-url.railway.app/health
```

### **Expected Response:**
```json
{
  "success": true,
  "message": "VeriGrade Backend is running",
  "timestamp": "2024-01-XX...",
  "database": "connected"
}
```

---

## **📋 DEPLOYMENT CHECKLIST:**

### **✅ Railway Setup:**
- [ ] Railway CLI installed
- [ ] Logged into Railway
- [ ] Project initialized
- [ ] Backend deployed
- [ ] Environment variables set
- [ ] Health check passing

### **✅ Backend Configuration:**
- [ ] Database connection working
- [ ] JWT authentication configured
- [ ] Email service configured
- [ ] Stripe integration ready
- [ ] Supabase connection working
- [ ] CORS configured

---

## **🎯 NEXT STEPS AFTER RAILWAY DEPLOYMENT:**

### **1. Get Your Backend URL**
- Copy your Railway deployment URL
- It will look like: `https://verigrade-backend-production.up.railway.app`

### **2. Update Frontend Configuration**
- Update your frontend to use the Railway backend URL
- Deploy frontend to Vercel with the new backend URL

### **3. Test Complete Platform**
- Test user registration
- Test user login
- Test invoice creation
- Test expense tracking
- Test email notifications

---

## **🎉 YOUR VERIGRADE BACKEND IS READY!**

### **✅ Production Features:**
- Scalable cloud infrastructure
- Automatic deployments
- Environment variable management
- Health monitoring
- SSL encryption
- Global CDN

### **✅ Ready for:**
- User authentication
- Invoice management
- Expense tracking
- Tax calculations
- File uploads
- Email notifications
- Payment processing

## **🚀 READY TO DEPLOY!**

Follow these steps to deploy your VeriGrade backend to Railway and get it live in production!

**Your backend will be accessible worldwide once deployed!** 🎉
