# 🔧 Railway CLI Troubleshooting Guide

## 🚨 **Common Railway CLI Issues:**

### **Issue 1: Login Session Expired**
**Symptoms:** `railway link` fails with "Unauthorized" error
**Solution:**
```bash
railway logout
railway login
```

### **Issue 2: CLI Version Conflicts**
**Symptoms:** Commands work inconsistently
**Solution:**
```bash
npm uninstall -g @railway/cli
npm install -g @railway/cli@latest
```

### **Issue 3: Project Linking Issues**
**Symptoms:** `railway link` fails or doesn't work
**Solutions:**

#### **Option A: Fresh Login**
```bash
railway logout
railway login
railway link -p 1d1d4b98-0383-47a4-af6c-df6c340ca52c
```

#### **Option B: Manual Project Selection**
```bash
railway link
# Then select your project from the list
```

#### **Option C: Use Web Dashboard**
1. Go to https://railway.app/dashboard
2. Find your project: `1d1d4b98-0383-47a4-af6c-df6c340ca52c`
3. Use the web interface to deploy

### **Issue 4: Permission Errors**
**Symptoms:** EPERM errors during installation
**Solution:**
```bash
# Run as Administrator
npm install -g @railway/cli --force
```

## 🎯 **Step-by-Step Fix:**

### **1. Clean Slate Approach**
```bash
railway logout
npm uninstall -g @railway/cli
npm install -g @railway/cli@latest
railway login
```

### **2. Test Connection**
```bash
railway whoami
railway projects
```

### **3. Link to Project**
```bash
railway link -p 1d1d4b98-0383-47a4-af6c-df6c340ca52c
```

### **4. Deploy**
```bash
railway up
```

## 🌐 **Alternative: Web Dashboard Deployment**

If CLI continues to fail:

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

## 📞 **What Error Are You Getting?**

**Tell me:**
1. **What's the exact error message?**
2. **Did `railway whoami` work?**
3. **What happens when you run `railway projects`?**

**I'll help you fix the specific issue!** 🔧
