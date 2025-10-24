# 🎯 Railway Backend Setup with Supabase

## 🚀 Quick Railway Configuration (3 minutes)

### Step 1: Access Railway Dashboard
1. Go to: https://railway.app
2. Sign in to your account
3. Open your VeriGrade project
4. Click on your backend service

### Step 2: Add Environment Variables
1. Go to the **Variables** tab
2. Click **+ New Variable**
3. Add each variable one by one:

```bash
# Supabase Configuration
SUPABASE_URL=https://krdwxeeaxldgnhymukyb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZHd4ZWVheGxkZ25oeW11a3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NTUwOTYsImV4cCI6MjA3NTEzMTA5Nn0.yYj9Fvi4THZC0KBk_EdoUMLm27C_rs3B8c2PeOX6EXI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZHd4ZWVheGxkZ25oeW11a3liIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTU1NTA5NiwiZXhwIjoyMDc1MTMxMDk2fQ.6_mFjsYtT6KxVdbC-6PevKmUJ3MTDwh3hlj8lbGEvOY
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.krdwxeeaxldgnhymukyb.supabase.co:5432/postgres

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Optional Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@verigrade.com
```

### Step 3: Deploy Changes
1. Click **Deploy** to apply the new variables
2. Wait for deployment to complete (2-3 minutes)
3. Check the deployment logs for any errors

### Step 4: Test the Backend
1. Test the health endpoint:
   ```bash
   curl https://verigrade-backend-production.up.railway.app/health
   ```

2. Test the database connection:
   ```bash
   curl https://verigrade-backend-production.up.railway.app/api/test-db
   ```

## 📋 Environment Variables Reference

### Required Variables:
- **SUPABASE_URL**: Your Supabase project URL
- **SUPABASE_ANON_KEY**: Public anon key for client operations
- **SUPABASE_SERVICE_ROLE_KEY**: Service role key for admin operations
- **DATABASE_URL**: PostgreSQL connection string
- **JWT_SECRET**: Secret key for JWT tokens

### Optional Variables:
- **SMTP_HOST**: Email server hostname
- **SMTP_PORT**: Email server port
- **SMTP_USER**: Email username
- **SMTP_PASS**: Email password
- **FROM_EMAIL**: Default sender email

## 🔧 Railway Configuration Details

### Service Settings:
- **Build Command**: `npm install --production`
- **Start Command**: `node server.js`
- **Health Check**: `/health`
- **Port**: Auto-assigned by Railway

### Environment:
- **Node.js Version**: 18+ (auto-detected)
- **NPM Version**: Latest
- **Platform**: Railway

## 🧪 Testing Your Backend

### Test 1: Health Check
```bash
curl https://verigrade-backend-production.up.railway.app/health
```
Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-23T...",
  "uptime": 123.45,
  "environment": "production",
  "service": "VeriGrade Backend API",
  "supabase": "configured"
}
```

### Test 2: Database Connection
```bash
curl https://verigrade-backend-production.up.railway.app/api/test-db
```
Expected response:
```json
{
  "success": true,
  "message": "Database connection test endpoint ready",
  "supabase_url": "https://krdwxeeaxldgnhymukyb.supabase.co",
  "timestamp": "2025-01-23T..."
}
```

### Test 3: API Endpoints
```bash
# Test companies endpoint
curl https://verigrade-backend-production.up.railway.app/api/companies

# Test customers endpoint
curl https://verigrade-backend-production.up.railway.app/api/customers

# Test vendors endpoint
curl https://verigrade-backend-production.up.railway.app/api/vendors
```

## 🚨 Troubleshooting

### Common Issues:

1. **"Application not found"**
   - Check if your Railway service is running
   - Verify the service URL is correct
   - Check Railway logs for errors

2. **"Supabase not configured"**
   - Verify all environment variables are set
   - Check variable names are spelled correctly
   - Redeploy after adding variables

3. **"Database connection failed"**
   - Check DATABASE_URL format
   - Verify password is correct
   - Ensure Supabase project is not paused

4. **"Authentication failed"**
   - Check Supabase keys are correct
   - Verify JWT_SECRET is set
   - Check Supabase project status

### Debug Commands:

```bash
# Check Railway logs
railway logs

# Check environment variables
railway variables

# Test locally with Railway environment
railway run node test-supabase-now.js
```

## 📊 Monitoring Your Backend

### Railway Dashboard:
- **Metrics**: CPU, Memory, Network usage
- **Logs**: Real-time application logs
- **Deployments**: Deployment history
- **Variables**: Environment variable management

### Health Monitoring:
- **Health Check**: `/health` endpoint
- **Database Status**: `/api/test-db` endpoint
- **API Status**: Individual endpoint testing

## ✅ Success Checklist

- [ ] All environment variables added to Railway
- [ ] Railway service deployed successfully
- [ ] Health endpoint returning success
- [ ] Database test endpoint working
- [ ] API endpoints responding
- [ ] No errors in Railway logs

## 🎯 Next Steps

After successful Railway setup:

1. **Configure Vercel Frontend:**
   - Add environment variables to Vercel
   - Update API URL to point to Railway

2. **Test Full Integration:**
   - Test frontend-backend connection
   - Verify all features working

3. **Set up N8N Automation:**
   - Configure automation workflows
   - Test end-to-end processes

---

**Your Railway Backend:**
- **Dashboard**: https://railway.app
- **Service URL**: https://verigrade-backend-production.up.railway.app
- **Health Check**: https://verigrade-backend-production.up.railway.app/health
- **Database Test**: https://verigrade-backend-production.up.railway.app/api/test-db
