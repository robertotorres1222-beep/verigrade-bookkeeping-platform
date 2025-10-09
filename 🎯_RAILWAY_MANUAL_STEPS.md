# 🚀 **RAILWAY DEPLOYMENT - MANUAL STEPS**

## **✅ CURRENT STATUS:**
- ✅ Railway project created: `verigrade-backend`
- ✅ Project URL: https://railway.com/project/8c3e811e-39c1-4631-be6f-8662f01c08f3
- ❌ Need to link project and set variables

---

## **🎯 MANUAL STEPS TO COMPLETE:**

### **Step 1: Link the Project**
Open a new terminal/command prompt and run:
```bash
cd C:\verigrade-bookkeeping-platform\backend
railway link
```
**When prompted, select:** `verigrade-backend`

### **Step 2: Set Environment Variables**
Run these commands one by one:

```bash
railway variables --set "NODE_ENV=production"
railway variables --set "DATABASE_URL=postgresql://postgres:atCv6BFZ1YQ3bdvK@db.krdwxeeaxldgnhymukyb.supabase.co:5432/postgres"
railway variables --set "JWT_SECRET=verigrade-super-secure-jwt-secret-key-2024-production"
railway variables --set "STRIPE_PUBLISHABLE_KEY=pk_live_51SB00GFjFAJQwUPDaTEvzGmZswYvt024Sv9yhTkWByTUw8kP5YoBLhTqJcUXdJToKQy6uUFXFRn866xKUlQTZrcd007KhHxn6K"
railway variables --set "SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZHd4ZWVheGxkZ25oeW11a3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NTUwOTYsImV4cCI6MjA3NTEzMTA5Nn0.yYj9Fvi4THZC0KBk_EdoUMLm27C_rs3B8c2PeOX6EXI"
railway variables --set "SMTP_USER=verigradebookkeeping@gmail.com"
railway variables --set "SMTP_PASS=jxxy spfm ejyk nxxh"
railway variables --set "SMTP_HOST=smtp.gmail.com"
railway variables --set "SMTP_PORT=587"
railway variables --set "FROM_EMAIL=verigradebookkeeping+noreply@gmail.com"
railway variables --set "PORT=3001"
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

## **🌐 ALTERNATIVE: Use Railway Web Dashboard**

**EASIER OPTION:** Go to your Railway project dashboard:
1. **Visit:** https://railway.com/project/8c3e811e-39c1-4631-be6f-8662f01c08f3
2. **Click "Variables" tab**
3. **Add these environment variables:**
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = `postgresql://postgres:atCv6BFZ1YQ3bdvK@db.krdwxeeaxldgnhymukyb.supabase.co:5432/postgres`
   - `JWT_SECRET` = `verigrade-super-secure-jwt-secret-key-2024-production`
   - `STRIPE_PUBLISHABLE_KEY` = `pk_live_51SB00GFjFAJQwUPDaTEvzGmZswYvt024Sv9yhTkWByTUw8kP5YoBLhTqJcUXdJToKQy6uUFXFRn866xKUlQTZrcd007KhHxn6K`
   - `SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZHd4ZWVheGxkZ25oeW11a3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NTUwOTYsImV4cCI6MjA3NTEzMTA5Nn0.yYj9Fvi4THZC0KBk_EdoUMLm27C_rs3B8c2PeOX6EXI`
   - `SMTP_USER` = `verigradebookkeeping@gmail.com`
   - `SMTP_PASS` = `jxxy spfm ejyk nxxh`
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `587`
   - `FROM_EMAIL` = `verigradebookkeeping+noreply@gmail.com`
   - `PORT` = `3001`
4. **Click "Deploy"**

---

## **🎯 RECOMMENDATION:**

**Use the Railway web dashboard** - it's much easier than the CLI for setting environment variables!

**Go to:** https://railway.com/project/8c3e811e-39c1-4631-be6f-8662f01c08f3

---

## **✅ AFTER DEPLOYMENT:**

Your VeriGrade backend will be live at:
- **Health Check:** `https://your-app.railway.app/health`
- **API Base:** `https://your-app.railway.app/api/v1`

**Copy the URL and update your frontend!** 🚀
