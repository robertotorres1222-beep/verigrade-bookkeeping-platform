# Deploy Backend to Railway
Write-Host "🚀 Deploying VeriGrade Backend to Railway..." -ForegroundColor Green

# Install Railway CLI if not installed
if (!(Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing Railway CLI..." -ForegroundColor Yellow
    npm install -g @railway/cli
}

# Login to Railway
Write-Host "🔐 Logging into Railway..." -ForegroundColor Yellow
railway login

# Deploy to Railway
Write-Host "🚀 Deploying to Railway..." -ForegroundColor Yellow
cd backend
railway deploy

Write-Host "✅ Backend deployed to Railway!" -ForegroundColor Green
Write-Host "🌐 Your backend will be available at: https://your-app.railway.app" -ForegroundColor Cyan
