# PowerShell script to deploy backend to Railway
# Run this script from the project root directory

Write-Host "🚀 Deploying VeriGrade Backend to Railway..." -ForegroundColor Green

# Navigate to backend directory
Set-Location "backend"

# Check if Railway CLI is installed
try {
    $railwayVersion = railway --version
    Write-Host "✅ Railway CLI found: $railwayVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "npm install -g @railway/cli" -ForegroundColor Yellow
    exit 1
}

# Check if logged in
Write-Host "🔐 Checking Railway login status..." -ForegroundColor Blue
try {
    railway status
    Write-Host "✅ Already logged in to Railway" -ForegroundColor Green
} catch {
    Write-Host "🔑 Please login to Railway first:" -ForegroundColor Yellow
    Write-Host "railway login" -ForegroundColor Yellow
    exit 1
}

# Deploy to Railway
Write-Host "🚀 Deploying backend to Railway..." -ForegroundColor Blue
try {
    railway up
    Write-Host "✅ Backend deployed successfully!" -ForegroundColor Green
    Write-Host "🌐 Your backend URL will be shown above" -ForegroundColor Green
} catch {
    Write-Host "❌ Deployment failed. Check the error above." -ForegroundColor Red
    Write-Host "💡 Try running 'railway up' manually to see detailed logs" -ForegroundColor Yellow
}

# Return to project root
Set-Location ".."

Write-Host "🎉 Backend deployment script completed!" -ForegroundColor Green
Write-Host "📋 Next steps:" -ForegroundColor Blue
Write-Host "1. Set up environment variables in Railway dashboard" -ForegroundColor White
Write-Host "2. Configure Supabase database connection" -ForegroundColor White
Write-Host "3. Update frontend API URL in Vercel" -ForegroundColor White



