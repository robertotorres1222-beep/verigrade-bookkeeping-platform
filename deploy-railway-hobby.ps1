# Deploy to Railway with Hobby Plan
Write-Host "🚀 Deploying to Railway with Hobby Plan..." -ForegroundColor Green

# Check if Railway CLI is installed
try {
    $railwayVersion = railway --version
    Write-Host "✅ Railway CLI found: $railwayVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI not found. Installing..." -ForegroundColor Red
    npm install -g @railway/cli
}

# Login to Railway
Write-Host "🔐 Logging into Railway..." -ForegroundColor Yellow
railway login

# Create new project
Write-Host "📦 Creating Railway project..." -ForegroundColor Yellow
railway project new verigrade-backend

# Set environment variables
Write-Host "🔧 Setting environment variables..." -ForegroundColor Yellow
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Deploy the application
Write-Host "🚀 Deploying application..." -ForegroundColor Yellow
railway up

# Get the deployment URL
Write-Host "🌐 Getting deployment URL..." -ForegroundColor Yellow
$deploymentUrl = railway domain
Write-Host "✅ Deployment URL: $deploymentUrl" -ForegroundColor Green

# Test the deployment
Write-Host "🧪 Testing deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
try {
    $response = Invoke-WebRequest -Uri "$deploymentUrl/health" -Method GET -TimeoutSec 30
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Health check passed!" -ForegroundColor Green
        Write-Host "🎉 Deployment successful!" -ForegroundColor Green
        Write-Host "🔗 Backend URL: $deploymentUrl" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Health check failed with status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Update your frontend to use: $deploymentUrl" -ForegroundColor White
Write-Host "2. Set up Supabase database" -ForegroundColor White
Write-Host "3. Configure N8N automation" -ForegroundColor White
