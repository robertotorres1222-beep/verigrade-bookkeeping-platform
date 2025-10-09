# 🚀 **FINAL RAILWAY DEPLOYMENT STEPS**

## **✅ CURRENT STATUS:**
- ✅ Railway CLI installed (v4.10.0)
- ✅ Logged in as robertotorres1222@gmail.com
- ✅ In backend directory
- ❌ No Railway project linked yet

---

## **🎯 STEP-BY-STEP DEPLOYMENT:**

### **Step 1: Initialize Railway Project**
```bash
railway init
```
**When prompted:**
- Project name: `verigrade-backend`
- Select your workspace: `robertotorres1222-beep's Projects`

### **Step 2: Set Environment Variables**
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

### **Step 3: Deploy**
```bash
railway up
```

### **Step 4: Get Your URL**
```bash
railway status
```

---

## **🎯 QUICK COPY-PASTE COMMANDS:**

```bash
# 1. Initialize project
railway init

# 2. Set environment variables
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

# 3. Deploy
railway up

# 4. Get URL
railway status
```

---

## **🎉 AFTER DEPLOYMENT:**

Your VeriGrade backend will be live at:
- **Health Check:** `https://your-app.railway.app/health`
- **API Base:** `https://your-app.railway.app/api/v1`
- **Email Test:** `https://your-app.railway.app/test-email`

---

## **📋 NEXT STEPS:**
1. **Copy your Railway backend URL**
2. **Update frontend API_URL**
3. **Deploy frontend to Vercel**
4. **Test complete platform**

**Ready to deploy! Copy and paste the commands above.** 🚀
