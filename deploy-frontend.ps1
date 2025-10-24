# Deploy Frontend to Vercel
Write-Host "🌐 Deploying VeriGrade Frontend to Vercel..." -ForegroundColor Green

# Install Vercel CLI if not installed
if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Login to Vercel
Write-Host "🔐 Logging into Vercel..." -ForegroundColor Yellow
vercel login

# Deploy to Vercel
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Yellow
cd frontend
vercel deploy --prod

Write-Host "✅ Frontend deployed to Vercel!" -ForegroundColor Green
Write-Host "🌐 Your frontend will be available at: https://your-app.vercel.app" -ForegroundColor Cyan
