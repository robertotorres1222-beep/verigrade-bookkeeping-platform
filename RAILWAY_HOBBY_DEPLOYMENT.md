# 🚀 Railway Hobby Plan Deployment Guide

## 📋 **Step-by-Step Deployment Instructions**

### 1. **Login to Railway**
```bash
railway login
```
- This will open your browser for authentication
- Complete the login process

### 2. **Create New Project**
```bash
railway project new verigrade-backend
```
- Choose a unique project name
- Select your Hobby plan

### 3. **Set Environment Variables**
```bash
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 4. **Deploy Application**
```bash
railway up
```
- This will build and deploy your application
- Railway will automatically detect it's a Node.js project

### 5. **Get Deployment URL**
```bash
railway domain
```
- This will show your deployment URL
- Save this URL for your frontend configuration

## 🔧 **Configuration Files**

### `railway-hobby.json` (Already Created)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node index.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

## 📁 **Project Structure**
```
C:\verigrade-bookkeeping-platform\
├── index.js                 # Main server file
├── package.json            # Dependencies
├── railway-hobby.json      # Railway configuration
└── deploy-railway-hobby.ps1 # Deployment script
```

## 🎯 **Expected Results**

After deployment, you should have:
- ✅ Backend API running on Railway
- ✅ Health check endpoint working
- ✅ Automatic HTTPS
- ✅ Custom domain (optional)

## 🔗 **Next Steps**

1. **Update Frontend**: Point your Vercel frontend to the new Railway backend URL
2. **Set up Supabase**: Configure your database
3. **Configure N8N**: Set up automation workflows

## 🆘 **Troubleshooting**

### If deployment fails:
1. Check Railway logs: `railway logs`
2. Verify environment variables: `railway variables`
3. Check project status: `railway status`

### Common Issues:
- **Build failures**: Check `package.json` dependencies
- **Runtime errors**: Check environment variables
- **Health check failures**: Verify `/health` endpoint

## 📞 **Support**

If you encounter issues:
1. Check Railway dashboard
2. Review deployment logs
3. Verify all environment variables are set
4. Ensure `index.js` is in the root directory

---

**Ready to deploy? Run the commands above in your terminal!** 🚀
