# VeriGrade Backend Deployment Script
# Deploys backend to Railway in 3 steps

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🚀 VERIGRADE BACKEND DEPLOYMENT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Railway CLI is installed
Write-Host "Step 1: Checking Railway CLI..." -ForegroundColor Yellow
$railwayInstalled = Get-Command railway -ErrorAction SilentlyContinue

if (-not $railwayInstalled) {
    Write-Host "❌ Railway CLI not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installing Railway CLI..." -ForegroundColor Yellow
    npm install -g @railway/cli
    Write-Host "✅ Railway CLI installed!" -ForegroundColor Green
} else {
    Write-Host "✅ Railway CLI found!" -ForegroundColor Green
}

Write-Host ""

# Step 2: Navigate to backend
Write-Host "Step 2: Navigating to backend directory..." -ForegroundColor Yellow
cd backend
Write-Host "✅ In backend directory" -ForegroundColor Green
Write-Host ""

# Step 3: Login to Railway
Write-Host "Step 3: Logging in to Railway..." -ForegroundColor Yellow
Write-Host "(A browser window will open for authentication)" -ForegroundColor Gray
railway login

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Railway login failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Logged in to Railway!" -ForegroundColor Green
Write-Host ""

# Step 4: Link or create project
Write-Host "Step 4: Linking to Railway project..." -ForegroundColor Yellow
Write-Host "(If you don't have a project yet, create one in Railway dashboard first)" -ForegroundColor Gray
railway link

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Project linking skipped or failed" -ForegroundColor Yellow
    Write-Host "You may need to create a project first at https://railway.app" -ForegroundColor Gray
}

Write-Host ""

# Step 5: Set environment variables
Write-Host "Step 5: Setting environment variables..." -ForegroundColor Yellow

$envVars = @{
    "NODE_ENV" = "production"
    "PORT" = "3001"
    "DATABASE_URL" = "postgresql://postgres:atCv6BFZ1YQ3bdvK@db.krdwxeeaxldgnhymukyb.supabase.co:5432/postgres"
    "JWT_SECRET" = "verigrade-super-secure-jwt-secret-key-2024-production"
    "STRIPE_PUBLISHABLE_KEY" = "pk_live_51SB00GFjFAJQwUPDaTEvzGmZswYvt024Sv9yhTkWByTUw8kP5YoBLhTqJcUXdJToKQy6uUFXFRn866xKUlQTZrcd007KhHxn6K"
    "SUPABASE_ANON_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZHd4ZWVheGxkZ25oeW11a3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NTUwOTYsImV4cCI6MjA3NTEzMTA5Nn0.yYj9Fvi4THZC0KBk_EdoUMLm27C_rs3B8c2PeOX6EXI"
    "SMTP_USER" = "verigradebookkeeping@gmail.com"
    "SMTP_PASS" = "jxxy spfm ejyk nxxh"
    "SMTP_HOST" = "smtp.gmail.com"
    "SMTP_PORT" = "587"
    "FROM_EMAIL" = "verigradebookkeeping+noreply@gmail.com"
}

foreach ($key in $envVars.Keys) {
    Write-Host "  Setting $key..." -ForegroundColor Gray
    railway variables --set "$key=$($envVars[$key])" 2>&1 | Out-Null
}

Write-Host "✅ Environment variables set!" -ForegroundColor Green
Write-Host ""

# Step 6: Deploy
Write-Host "Step 6: Deploying to Railway..." -ForegroundColor Yellow
Write-Host "(This may take 3-5 minutes)" -ForegroundColor Gray
Write-Host ""

railway up

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Get your Railway backend URL:" -ForegroundColor White
    Write-Host "   Go to: https://railway.app/dashboard" -ForegroundColor Cyan
    Write-Host "   Copy the deployment URL" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Add to Vercel frontend:" -ForegroundColor White
    Write-Host "   Go to: https://vercel.com/robertotos-projects/verigrade-bookkeeping-platform/settings/environment-variables" -ForegroundColor Cyan
    Write-Host "   Add: NEXT_PUBLIC_API_URL = <your-railway-url>" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Redeploy frontend:" -ForegroundColor White
    Write-Host "   Vercel will auto-redeploy when you save the env variable!" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Test your site!" -ForegroundColor White
    Write-Host "   https://verigrade-bookkeeping-platform-ka1k357hp-robertotos-projects.vercel.app" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    
    # Open Railway dashboard
    Start-Process "https://railway.app/dashboard"
    
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ❌ DEPLOYMENT FAILED!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Make sure you created a project in Railway first" -ForegroundColor White
    Write-Host "2. Run 'railway link' manually and select your project" -ForegroundColor White
    Write-Host "3. Try running 'railway up' again" -ForegroundColor White
    Write-Host ""
}

# Return to root
cd ..

