# 🚀 Railway Manual Link and Deploy Guide

## 📋 **Step-by-Step Instructions:**

### 1. **Login to Railway**
Run this command in your terminal:
```bash
railway login
```
- This will open your browser for authentication
- Complete the login process
- Come back to terminal when done

### 2. **Link to Your Project**
After logging in, run:
```bash
railway link -p 1d1d4b98-0383-47a4-af6c-df6c340ca52c
```

### 3. **Set Environment Variables**
```bash
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 4. **Deploy Your Backend**
```bash
railway up
```

### 5. **Get Your Deployment URL**
```bash
railway domain
```

## 🎯 **Alternative: Use Railway Web Dashboard**

If CLI doesn't work, use the web dashboard:

1. **Go to Railway Dashboard:**
   - Visit: https://railway.app/dashboard
   - Find your project: `1d1d4b98-0383-47a4-af6c-df6c340ca52c`

2. **Configure Settings:**
   - **Root Directory:** `./backend`
   - **Start Command:** `node index.js`
   - **Health Check Path:** `/health`

3. **Set Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3000
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

4. **Deploy:**
   - Click "Deploy" or "Redeploy"
   - Wait for build to complete

## 📞 **After Deployment:**

**Tell me:**
1. **What's your Railway deployment URL?**
2. **Did the deployment succeed?**
3. **Any errors in the logs?**

**The configuration files are ready - just need to link and deploy!** 🚀

