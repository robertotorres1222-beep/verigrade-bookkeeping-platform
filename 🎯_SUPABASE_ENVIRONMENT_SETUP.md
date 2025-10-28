# 🎯 Supabase Environment Variables Setup

## 📋 Required Environment Variables

### Backend (Railway) Environment Variables

Add these environment variables to your Railway project:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.your-project-id.supabase.co:5432/postgres

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@verigrade.com

# Stripe Configuration (Optional)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Frontend (Vercel) Environment Variables

Add these environment variables to your Vercel project:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API Configuration
NEXT_PUBLIC_API_URL=https://verigrade-backend-production.up.railway.app

# Stripe Configuration (Optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 🔧 How to Add Environment Variables

### Railway (Backend)

1. Go to your Railway project dashboard
2. Click on your service
3. Go to **Variables** tab
4. Click **+ New Variable**
5. Add each variable with its value
6. Click **Deploy** to apply changes

### Vercel (Frontend)

1. Go to your Vercel project dashboard
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add each variable with its value
6. Redeploy your project

## 🧪 Testing Environment Variables

### Backend Test
```bash
curl https://verigrade-backend-production.up.railway.app/api/test-db
```

Expected response:
```json
{
  "success": true,
  "message": "Database connection test endpoint ready",
  "supabase_url": "https://your-project-id.supabase.co",
  "timestamp": "2025-01-23T..."
}
```

### Frontend Test
Add this to your frontend code to test:
```javascript
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)
```

## 🔐 Security Notes

- **Never commit** `.env` files to version control
- **Service Role Key** should only be used on the backend
- **Anon Key** is safe to use on the frontend
- **JWT Secret** should be a strong, random string
- **Database URL** contains sensitive credentials

## 📊 Environment Variable Sources

### Supabase Dashboard
1. Go to **Settings** → **API**
2. Copy **Project URL** → `SUPABASE_URL`
3. Copy **anon public** → `SUPABASE_ANON_KEY`
4. Copy **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### Supabase Database
1. Go to **Settings** → **Database**
2. Copy **Connection string** → `DATABASE_URL`

## 🚨 Troubleshooting

### Common Issues:

1. **"Supabase not configured"**
   - Check if `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set
   - Verify the values are correct

2. **"Database connection failed"**
   - Check `DATABASE_URL` format
   - Verify password is correct
   - Ensure project is not paused

3. **"Authentication failed"**
   - Check `JWT_SECRET` is set
   - Verify Supabase keys are correct

4. **CORS errors**
   - Add your frontend URL to Supabase auth settings
   - Check `NEXT_PUBLIC_API_URL` is correct

## ✅ Verification Checklist

- [ ] All environment variables added to Railway
- [ ] All environment variables added to Vercel
- [ ] Backend test endpoint returns success
- [ ] Frontend can connect to backend
- [ ] Database connection working
- [ ] Authentication working (if configured)

---

**Next Steps:** After environment variables are set, test the full integration and configure N8N automation.



