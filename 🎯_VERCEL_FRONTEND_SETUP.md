# 🎯 Vercel Frontend Setup with Supabase

## 🚀 Quick Vercel Configuration (3 minutes)

### Step 1: Access Vercel Dashboard
1. Go to: https://vercel.com
2. Sign in to your account
3. Open your VeriGrade project
4. Go to Settings → Environment Variables

### Step 2: Add Environment Variables
1. Click **Add New**
2. Add each variable one by one:

```bash
# Supabase Configuration (Frontend)
NEXT_PUBLIC_SUPABASE_URL=https://krdwxeeaxldgnhymukyb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZHd4ZWVheGxkZ25oeW11a3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NTUwOTYsImV4cCI6MjA3NTEzMTA5Nn0.yYj9Fvi4THZC0KBk_EdoUMLm27C_rs3B8c2PeOX6EXI

# Backend API Configuration
NEXT_PUBLIC_API_URL=https://verigrade-backend-production.up.railway.app

# Optional Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Step 3: Deploy Changes
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Wait for deployment to complete (2-3 minutes)

### Step 4: Test the Frontend
1. Visit your Vercel deployment URL
2. Check browser console for any errors
3. Test Supabase connection

## 📋 Environment Variables Reference

### Required Variables:
- **NEXT_PUBLIC_SUPABASE_URL**: Your Supabase project URL
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Public anon key for client operations
- **NEXT_PUBLIC_API_URL**: Your Railway backend URL

### Optional Variables:
- **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**: Stripe publishable key for payments
- **NEXT_PUBLIC_APP_URL**: Your Vercel deployment URL
- **NEXT_PUBLIC_APP_NAME**: Application name (default: VeriGrade)

## 🔧 Vercel Configuration Details

### Build Settings:
- **Framework**: Next.js (auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Environment:
- **Node.js Version**: 18+ (auto-detected)
- **NPM Version**: Latest
- **Platform**: Vercel

## 🧪 Testing Your Frontend

### Test 1: Basic Connection
```bash
# Test your Vercel deployment
curl https://your-vercel-url.vercel.app
```

Expected response:
- HTML page loads successfully
- No console errors

### Test 2: Supabase Connection
1. Open your Vercel deployment in browser
2. Open browser developer tools (F12)
3. Check Console tab for errors
4. Look for Supabase connection messages

### Test 3: Backend API Connection
1. Check if frontend can reach backend
2. Look for API calls in Network tab
3. Verify no CORS errors

## 🚨 Troubleshooting

### Common Issues:

1. **"Supabase not configured"**
   - Check environment variables are set correctly
   - Verify variable names start with `NEXT_PUBLIC_`
   - Redeploy after adding variables

2. **"Backend API not reachable"**
   - Check Railway backend is running
   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Check for CORS issues

3. **"Build failed"**
   - Check build logs in Vercel dashboard
   - Verify all dependencies are installed
   - Check for TypeScript errors

4. **"Environment variables not loading"**
   - Ensure variables are prefixed with `NEXT_PUBLIC_`
   - Redeploy after adding variables
   - Check variable names are spelled correctly

### Debug Commands:

```bash
# Check Vercel deployment status
vercel ls

# Check environment variables
vercel env ls

# Test locally with Vercel environment
vercel dev
```

## 📊 Monitoring Your Frontend

### Vercel Dashboard:
- **Analytics**: Page views, performance metrics
- **Functions**: Serverless function logs
- **Deployments**: Deployment history and status
- **Environment**: Environment variable management

### Health Monitoring:
- **Page Load**: Check deployment URL loads
- **Console Errors**: Monitor browser console
- **API Calls**: Check Network tab for backend calls

## ✅ Success Checklist

- [ ] All environment variables added to Vercel
- [ ] Vercel deployment successful
- [ ] Frontend loads without errors
- [ ] Supabase connection working
- [ ] Backend API connection working
- [ ] No console errors in browser

## 🎯 Next Steps

After successful Vercel setup:

1. **Test Full Integration:**
   - Test frontend-backend connection
   - Verify Supabase integration
   - Check all features working

2. **Set up N8N Automation:**
   - Configure automation workflows
   - Test end-to-end processes

3. **Monitor Performance:**
   - Check Vercel analytics
   - Monitor error rates
   - Optimize performance

## 🔗 Quick Links

- **Vercel Dashboard**: https://vercel.com
- **Environment Variables**: https://vercel.com/[your-project]/settings/environment-variables
- **Deployments**: https://vercel.com/[your-project]/deployments
- **Analytics**: https://vercel.com/[your-project]/analytics

---

**Your Vercel Frontend:**
- **Dashboard**: https://vercel.com
- **Deployment URL**: https://your-vercel-url.vercel.app
- **Environment Variables**: Add the variables above
- **Redeploy**: After adding variables
