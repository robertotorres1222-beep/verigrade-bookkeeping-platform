# 🚀 Railway Deployment - Step by Step

## 📋 **Run These Commands ONE BY ONE in Your Terminal:**

### Step 1: Login to Railway
```bash
railway login
```
- This will open your browser
- Complete the authentication
- Come back to terminal when done

### Step 2: Create New Project
```bash
railway project new verigrade-backend
```
- Choose a unique project name
- Select your Hobby plan

### Step 3: Set Environment Variables (Run each command separately)
```bash
railway variables set NODE_ENV=production
```
```bash
railway variables set PORT=3000
```
```bash
railway variables set JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Step 4: Deploy Application
```bash
railway up
```
- This will build and deploy
- Wait for it to complete

### Step 5: Get Your URL
```bash
railway domain
```
- This shows your deployment URL
- Save this URL!

## 🎯 **Important Notes:**

1. **Run each command separately** (not all on one line)
2. **Wait for each command to complete** before running the next
3. **The login will open your browser** - complete it there
4. **Save your deployment URL** when you get it

## 📞 **After You're Done:**

**Tell me:**
1. **What's your Railway deployment URL?**
2. **Did all commands work?**
3. **Any errors?**

**I'll help you connect everything together!** 🔧
