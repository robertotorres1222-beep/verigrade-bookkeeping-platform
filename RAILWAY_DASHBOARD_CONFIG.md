# Railway Dashboard Configuration Instructions

## Manual Configuration Steps

### 1. Go to Railway Dashboard
- Visit: https://railway.app/dashboard
- Find your project: `1d1d4b98-0383-47a4-af6c-df6c340ca52c`

### 2. Update Service Settings
In your Railway project dashboard:

**Root Directory:**
- Set to `./` (root directory) or leave empty

**Build Command:**
- Leave empty (Nixpacks will handle the build automatically)

**Start Command:**
- Set to: `node server.js`

**Health Check Path:**
- Set to: `/health`

### 3. Environment Variables
Go to the Variables tab and ensure these are set:

```
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 4. Force Clean Deployment
1. Go to Settings → Danger Zone
2. Click "Redeploy" to trigger a fresh build
3. Wait for the build to complete

## Expected Results

After these changes:
- Railway will use NIXPACKS builder (not Dockerfile)
- Dependencies will be installed from root package.json
- Server will start with `node server.js`
- Health check at `/health` should return 200 status
- Your backend will be available at your Railway URL

## Troubleshooting

If Railway still uses Dockerfile:
1. Check that `.railwayignore` file is committed
2. Verify no Dockerfile exists in root directory
3. Try deleting and recreating the service
4. Check Railway logs for build process details




