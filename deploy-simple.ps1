# VeriGrade Platform - Simple Deployment
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VeriGrade Platform Auto-Deployment   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
Write-Host "Checking Vercel CLI..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
    Write-Host "Vercel CLI installed!" -ForegroundColor Green
} else {
    Write-Host "Vercel CLI already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "Logging in to Vercel..." -ForegroundColor Yellow
Write-Host "A browser window will open for authentication" -ForegroundColor Gray
vercel login

Write-Host ""
Write-Host "Setting up project..." -ForegroundColor Yellow
Set-Location C:\verigrade-bookkeeping-platform

Write-Host ""
Write-Host "Deploying to Vercel..." -ForegroundColor Yellow
Write-Host "This will take 2-5 minutes..." -ForegroundColor Gray

# Deploy to production
vercel --prod --yes

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DEPLOYMENT COMPLETE!                  " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "IMPORTANT: Add Environment Variables" -ForegroundColor Yellow
Write-Host ""
Write-Host "Go to Vercel and add these variables:" -ForegroundColor White
Write-Host "  DATABASE_URL = your_postgres_url" -ForegroundColor Gray
Write-Host "  JWT_SECRET = your_secret_key" -ForegroundColor Gray
Write-Host "  NODE_ENV = production" -ForegroundColor Gray
Write-Host ""

Write-Host "Opening Vercel dashboard..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
Start-Process "https://vercel.com/robertotos-projects/verigrade-bookkeeping-platform"

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor White
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")









