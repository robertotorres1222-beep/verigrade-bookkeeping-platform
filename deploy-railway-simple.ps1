# Deploy VeriGrade Backend to Railway
Write-Host "🚀 Deploying VeriGrade Backend to Railway..." -ForegroundColor Green

# Copy simple files to root
Copy-Item "deploy-simple.js" "server.js" -Force
Copy-Item "package-simple.json" "package.json" -Force
Copy-Item "railway-simple.json" "railway.json" -Force

Write-Host "✅ Files prepared for deployment" -ForegroundColor Green

# Deploy to Railway
Write-Host "🚀 Deploying to Railway..." -ForegroundColor Yellow
railway up --detach

Write-Host "✅ Deployment initiated!" -ForegroundColor Green
Write-Host "📊 Check your Railway dashboard for deployment status" -ForegroundColor Cyan





