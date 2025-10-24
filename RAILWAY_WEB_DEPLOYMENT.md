# 🌐 Railway Web Deployment Guide

Since the CLI requires interactive login, let's use the Railway web interface instead!

## 📋 **Step-by-Step Web Deployment:**

### 1. **Go to Railway Dashboard**
- Visit: https://railway.app/dashboard
- Sign in with your account

### 2. **Create New Project**
- Click "New Project"
- Choose "Deploy from GitHub repo"
- Select your `verigrade-bookkeeping-platform` repository
- Choose the root directory

### 3. **Configure Deployment**
- **Root Directory:** `./` (root of repository)
- **Build Command:** `npm install`
- **Start Command:** `node index.js`
- **Health Check Path:** `/health`

### 4. **Set Environment Variables**
In the Railway dashboard, go to Variables tab and add:
```
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 5. **Deploy**
- Click "Deploy"
- Wait for build to complete
- Get your deployment URL

## 🎯 **Alternative: Use Railway CLI with Token**

### 1. **Get Railway Token**
- Go to Railway dashboard
- Go to Account Settings
- Generate a new token

### 2. **Use Token for Login**
```bash
railway login --token YOUR_TOKEN_HERE
```

### 3. **Then Deploy**
```bash
railway project new verigrade-backend
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
railway up
railway domain
```

## 📞 **Which Method Do You Prefer?**

1. **Web Dashboard** (easiest)
2. **CLI with Token** (more control)

**Let me know which you'd like to try!** 🚀
