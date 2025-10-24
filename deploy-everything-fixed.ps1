# Deploy VeriGrade Platform to Production
Write-Host "🚀 Deploying VeriGrade Bookkeeping Platform to Production..." -ForegroundColor Green
Write-Host ""

# Step 1: Deploy Backend to Railway
Write-Host "📦 Step 1: Deploying Backend to Railway..." -ForegroundColor Yellow
Write-Host "Installing Railway CLI..." -ForegroundColor Gray
npm install -g @railway/cli

Write-Host "Logging into Railway..." -ForegroundColor Gray
railway login

Write-Host "Deploying backend..." -ForegroundColor Gray
cd backend
railway deploy
cd ..

Write-Host "✅ Backend deployed to Railway!" -ForegroundColor Green
Write-Host ""

# Step 2: Deploy Frontend to Vercel
Write-Host "🌐 Step 2: Deploying Frontend to Vercel..." -ForegroundColor Yellow
Write-Host "Installing Vercel CLI..." -ForegroundColor Gray
npm install -g vercel

Write-Host "Logging into Vercel..." -ForegroundColor Gray
vercel login

Write-Host "Deploying frontend..." -ForegroundColor Gray
cd frontend
vercel deploy --prod
cd ..

Write-Host "✅ Frontend deployed to Vercel!" -ForegroundColor Green
Write-Host ""

# Step 3: Deploy Mobile App to Expo
Write-Host "📱 Step 3: Deploying Mobile App to Expo..." -ForegroundColor Yellow
Write-Host "Installing Expo CLI..." -ForegroundColor Gray
npm install -g @expo/cli

Write-Host "Logging into Expo..." -ForegroundColor Gray
expo login

Write-Host "Building mobile app..." -ForegroundColor Gray
cd mobile-app
npx expo build:android
npx expo build:ios
cd ..

Write-Host "✅ Mobile app built for production!" -ForegroundColor Green
Write-Host ""

# Step 4: Create deployment summary
Write-Host "🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Your Production URLs:" -ForegroundColor Cyan
Write-Host "Backend API: https://your-backend.railway.app" -ForegroundColor White
Write-Host "Frontend App: https://your-frontend.vercel.app" -ForegroundColor White
Write-Host "Mobile App: Ready for app stores" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Test your platform:" -ForegroundColor Cyan
Write-Host "Backend Health: https://your-backend.railway.app/health" -ForegroundColor White
Write-Host "API Status: https://your-backend.railway.app/api/status" -ForegroundColor White
Write-Host "Frontend Dashboard: https://your-frontend.vercel.app" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Your VeriGrade Platform is now live in production!" -ForegroundColor Green
