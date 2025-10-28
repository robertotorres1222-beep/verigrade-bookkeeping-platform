# Railway Deployment Script
Write-Host "🚀 Railway Deployment Configuration" -ForegroundColor Green

Write-Host "📦 Updating package-lock.json..." -ForegroundColor Yellow
npm install

Write-Host "📋 Configuration files created:" -ForegroundColor Cyan
Write-Host "✅ railway.json" -ForegroundColor Green
Write-Host "✅ nixpacks.toml" -ForegroundColor Green
Write-Host "✅ .dockerignore" -ForegroundColor Green

Write-Host "🌐 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Go to Railway Dashboard: https://railway.app/dashboard" -ForegroundColor White
Write-Host "2. Create new project" -ForegroundColor White
Write-Host "3. Deploy from GitHub repo" -ForegroundColor White
Write-Host "4. Select this repository" -ForegroundColor White
Write-Host "5. Set Root Directory to './' (root)" -ForegroundColor White
Write-Host "6. Set Start Command to 'node index.js'" -ForegroundColor White
Write-Host "7. Set Health Check Path to '/health'" -ForegroundColor White

Write-Host "🔧 Environment Variables:" -ForegroundColor Yellow
Write-Host "NODE_ENV=production" -ForegroundColor White
Write-Host "PORT=3000" -ForegroundColor White
Write-Host "JWT_SECRET=your-super-secret-jwt-key-change-this-in-production" -ForegroundColor White

Write-Host "🎉 Ready to deploy!" -ForegroundColor Green




