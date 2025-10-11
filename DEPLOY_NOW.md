# 🚀 VeriGrade Platform - Deployment Guide

## ✅ Pre-Deployment Checklist

Your platform is now ready to deploy! Here's what's been configured:

### 📦 What's Ready

1. **Backend (`ai-features-server.js`)**
   - ✅ Express server with all API routes
   - ✅ AI categorization (OpenAI)
   - ✅ PDF invoice generation
   - ✅ Health check endpoint
   - ✅ CORS properly configured
   - ✅ Security headers (Helmet)
   - ✅ Compression enabled

2. **Frontend (Next.js)**
   - ✅ Modern React components
   - ✅ API service layer
   - ✅ Environment variable support
   - ✅ Responsive design
   - ✅ Error handling

3. **Configuration**
   - ✅ Vercel deployment configs
   - ✅ API proxy setup
   - ✅ Environment variables template

---

## 🔐 Required Environment Variables

### For Vercel Backend Deployment

Go to your **backend** Vercel project settings and add these:

```env
# Database (Required)
DATABASE_URL=your_supabase_or_postgres_url

# JWT (Required)
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# Stripe (Required if using payments)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI (Required for AI features)
OPENAI_API_KEY=sk-...

# Redis (Optional - for background jobs)
REDIS_URL=redis://...

# AWS S3 (Optional - for file storage)
S3_BUCKET=your-bucket
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=AKIA...
S3_SECRET_ACCESS_KEY=...

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_app_password

# Other
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://verigrade-bookkeeping-platform.vercel.app
```

### For Vercel Frontend Deployment

Go to your **main project** (frontend) Vercel settings and add:

```env
NEXT_PUBLIC_API_URL=https://verigrade-bookkeeping-platform.vercel.app
```

---

## 📝 Step-by-Step Deployment

### Option 1: Deploy from Main Repository (Recommended)

This deploys everything from one place - your main repo:

1. **Commit all changes:**
   ```bash
   git add .
   git commit -m "feat: Production-ready deployment with backend and frontend"
   git push origin main
   ```

2. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Click on your project: `verigrade-bookkeeping-platform`

3. **Configure Environment Variables:**
   - Go to Settings → Environment Variables
   - Add all the variables listed above
   - Make sure to select "Production" environment

4. **Redeploy:**
   - Go to Deployments tab
   - Click "Redeploy" on the latest deployment
   - Or trigger a new deployment by pushing to main

5. **Verify Deployment:**
   - Wait for build to complete
   - Visit: `https://verigrade-bookkeeping-platform.vercel.app`
   - Check: `https://verigrade-bookkeeping-platform.vercel.app/api/health`

### Option 2: Separate Backend Deployment

If you want to deploy backend separately:

1. **Create new Vercel project for backend:**
   ```bash
   cd backend
   vercel
   ```

2. **Link to Git:**
   - Connect the backend folder
   - Set Root Directory to `backend`
   - Add all backend environment variables

3. **Update frontend configuration:**
   - Update `NEXT_PUBLIC_API_URL` to point to your backend URL
   - Or keep using API proxy (recommended)

---

## 🧪 Testing Your Deployment

### 1. Test Backend Health
```bash
curl https://verigrade-bookkeeping-platform.vercel.app/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "VeriGrade AI Features Backend API is running",
  "environment": "production"
}
```

### 2. Test Frontend
Visit: https://verigrade-bookkeeping-platform.vercel.app

### 3. Test API Integration
- Login/Register
- Create a transaction
- Generate an invoice
- Test AI categorization (if OpenAI key is set)

---

## 🔧 Post-Deployment Configuration

### 1. Disable Deployment Protection
If your site requires login to access:

1. Go to Vercel Project Settings
2. Click "Deployment Protection"
3. Select "Disabled" or "Only Production Deployments"
4. Save changes

### 2. Custom Domain (Optional)
1. Go to Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `FRONTEND_URL` environment variable

### 3. Enable Vercel Analytics (Optional)
1. Go to Analytics tab
2. Click "Enable Analytics"
3. Free for hobby tier

---

## 🐛 Troubleshooting

### Build Fails
- **Check build logs** in Vercel dashboard
- **Verify all dependencies** are in package.json
- **Check TypeScript errors**: `npm run type-check`

### API Calls Fail
- **Verify environment variables** are set in Vercel
- **Check CORS settings** in backend
- **Test backend health** endpoint directly
- **Check browser console** for errors

### Database Connection Issues
- **Verify DATABASE_URL** is correct
- **Check IP whitelist** on your database (e.g., Supabase)
- **Enable Vercel IP** in database firewall

### OpenAI Errors
- **Verify OPENAI_API_KEY** is set
- **Check API quota** on OpenAI dashboard
- **Ensure model access** (gpt-4o-mini)

---

## 🎯 Quick Commands

### Local Testing
```bash
# Start backend
cd backend && node ai-features-server.js

# Start frontend (new terminal)
cd frontend-new && npm run dev
```

### Commit & Deploy
```bash
git add .
git commit -m "your message"
git push origin main
```

### Check Deployment Status
```bash
vercel ls
```

### View Logs
```bash
vercel logs [deployment-url]
```

---

## 🌐 Your Live URLs

Once deployed, your platform will be available at:

- **Main App**: https://verigrade-bookkeeping-platform.vercel.app
- **API Health**: https://verigrade-bookkeeping-platform.vercel.app/api/health
- **Vercel Dashboard**: https://vercel.com/robertotos-projects/verigrade-bookkeeping-platform

---

## 📞 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Check Logs**: Vercel Dashboard → Deployments → Click deployment → View logs

---

## ✅ Deployment Checklist

- [ ] All environment variables configured
- [ ] Code committed and pushed to GitHub
- [ ] Vercel deployment triggered
- [ ] Build completed successfully
- [ ] Health endpoint returns 200
- [ ] Frontend loads correctly
- [ ] API calls work from frontend
- [ ] Database connection works
- [ ] Deployment protection disabled (if needed)
- [ ] Custom domain configured (optional)

---

**🎉 Your platform is ready to go live!**

Simply push your code and Vercel will automatically deploy it.



