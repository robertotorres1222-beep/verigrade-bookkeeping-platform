# Quick Supabase Setup for VeriGrade
# Project ID: krdwxeeaxldgnhymukyb

## 🚀 Step 1: Get Your Credentials

1. Go to https://supabase.com/dashboard/project/krdwxeeaxldgnhymukyb
2. Go to Settings → API
3. Copy these values:
   - Project URL: https://krdwxeeaxldgnhymukyb.supabase.co
   - anon public key: (copy from dashboard)
   - service_role secret key: (copy from dashboard)

4. Go to Settings → Database
5. Copy the Connection string and replace [YOUR_PASSWORD] with your database password

## 🚂 Step 2: Configure Railway (Backend)

1. Go to https://railway.app
2. Open your project
3. Go to Variables tab
4. Add these variables:
   - SUPABASE_URL=https://krdwxeeaxldgnhymukyb.supabase.co
   - SUPABASE_ANON_KEY=(your anon key)
   - SUPABASE_SERVICE_ROLE_KEY=(your service role key)
   - DATABASE_URL=(your database connection string)
   - JWT_SECRET=(generate a random string)

5. Click Deploy to apply changes

## ▲ Step 3: Configure Vercel (Frontend)

1. Go to https://vercel.com
2. Open your project
3. Go to Settings → Environment Variables
4. Add these variables:
   - NEXT_PUBLIC_SUPABASE_URL=https://krdwxeeaxldgnhymukyb.supabase.co
   - NEXT_PUBLIC_SUPABASE_ANON_KEY=(your anon key)
   - NEXT_PUBLIC_API_URL=https://verigrade-backend-production.up.railway.app

5. Redeploy your project

## 🗄️ Step 4: Set Up Database Schema

1. Go to https://supabase.com/dashboard/project/krdwxeeaxldgnhymukyb/sql
2. Copy the contents of supabase/schema.sql
3. Paste it into the SQL Editor
4. Click Run to execute

5. (Optional) Add sample data:
   - Copy contents of supabase/sample-data.sql
   - Paste and run in SQL Editor

## 🧪 Step 5: Test Everything

1. Test backend: https://verigrade-backend-production.up.railway.app/api/test-db
2. Test locally: node test-supabase-with-credentials.js
3. Test frontend: Check if it can connect to backend

## ✅ Success Checklist

- [ ] Supabase project accessible
- [ ] Environment variables set in Railway
- [ ] Environment variables set in Vercel
- [ ] Database schema created
- [ ] Backend test endpoint working
- [ ] Frontend can connect to backend

## 🆘 Need Help?

- Check Railway logs: railway logs
- Check Supabase logs: Dashboard → Logs
- Test locally: node test-supabase-simple.js
- Full guide: 🎯_SUPABASE_SETUP_GUIDE.md