# ⚡ QUICK SUPABASE SETUP - 5 MINUTES!

## **🎯 FAST SETUP STEPS:**

### **1. Create Supabase Account (2 minutes)**
- Go to: **https://supabase.com**
- Click **"Start your project"**
- Sign up with GitHub/Google/Email

### **2. Create Project (1 minute)**
- Click **"New Project"**
- **Name**: `verigrade-bookkeeping`
- **Password**: Create strong password (save it!)
- **Region**: Choose closest
- Click **"Create new project"**

### **3. Get Database URL (1 minute)**
- Wait for project to be ready (2-3 minutes)
- Go to **"Settings"** → **"Database"**
- Scroll to **"Connection string"**
- Click **"URI"** tab
- **Copy the URL** (starts with `postgresql://`)

### **4. Update Environment (30 seconds)**
- Paste URL in `backend/.env`:
```bash
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### **5. Run Prisma Setup (30 seconds)**
```bash
cd backend
npx prisma db push
npx prisma generate
```

---

## **🚀 OR USE THE SETUP SCRIPT:**

```bash
node setup-supabase.js
```

This will guide you through the process step by step!

---

## **✅ YOU'RE DONE!**

Your database will be ready in 5 minutes and your VeriGrade platform will have:
- ✅ **PostgreSQL Database** - Production-ready
- ✅ **Real-time Features** - Built-in Supabase features
- ✅ **Visual Dashboard** - Easy database management
- ✅ **Automatic Backups** - Data protection
- ✅ **Free Tier** - 500MB database, 2GB bandwidth

**Let's get your database set up now!** 🗄️🚀
