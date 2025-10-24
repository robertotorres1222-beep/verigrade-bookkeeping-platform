# Deploy VeriGrade Frontend to Vercel
Write-Host "🚀 Deploying VeriGrade Frontend to Vercel..." -ForegroundColor Green
Write-Host ""

# Check if Vercel CLI is installed
if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Login to Vercel
Write-Host "🔐 Please login to Vercel in your browser..." -ForegroundColor Yellow
vercel login

# Navigate to frontend directory
Write-Host "📂 Navigating to frontend directory..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\frontend"

# Deploy to Vercel
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Yellow
Write-Host "This will deploy your frontend to production." -ForegroundColor Cyan
vercel deploy --prod

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your frontend is now live on Vercel!" -ForegroundColor Cyan
Write-Host "📋 Check your Vercel dashboard for the production URL" -ForegroundColor White
Write-Host ""

# Return to root directory
Set-Location -Path $PSScriptRoot


