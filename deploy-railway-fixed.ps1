# Deploy to Railway with Fixed Configuration
Write-Host "🚀 Deploying to Railway with Fixed Configuration..." -ForegroundColor Green

# Update package-lock.json
Write-Host "📦 Updating package-lock.json..." -ForegroundColor Yellow
npm install

# Check if Railway CLI is installed
try {
    $railwayVersion = railway --version
    Write-Host "✅ Railway CLI found: $railwayVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI not found. Installing..." -ForegroundColor Red
    npm install -g @railway/cli
}

Write-Host "📋 Railway Configuration:" -ForegroundColor Cyan
Write-Host "✅ railway.json created" -ForegroundColor Green
Write-Host "✅ nixpacks.toml created" -ForegroundColor Green
Write-Host "✅ .dockerignore created" -ForegroundColor Green
Write-Host "✅ package-lock.json updated" -ForegroundColor Green

Write-Host "🌐 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Go to Railway Dashboard: https://railway.app/dashboard" -ForegroundColor White
Write-Host "2. Create new project" -ForegroundColor White
Write-Host "3. Deploy from GitHub repo" -ForegroundColor White
Write-Host "4. Select this repository" -ForegroundColor White
Write-Host "5. Set Root Directory to './' (root)" -ForegroundColor White
Write-Host "6. Set Start Command to 'node index.js'" -ForegroundColor White
Write-Host "7. Set Health Check Path to '/health'" -ForegroundColor White

Write-Host "🔧 Environment Variables to Set:" -ForegroundColor Yellow
Write-Host "NODE_ENV=production" -ForegroundColor White
Write-Host "PORT=3000" -ForegroundColor White
Write-Host "JWT_SECRET=your-super-secret-jwt-key-change-this-in-production" -ForegroundColor White

Write-Host "🎉 Configuration files are ready!" -ForegroundColor Green
Write-Host "Now deploy through the Railway web dashboard!" -ForegroundColor Cyan