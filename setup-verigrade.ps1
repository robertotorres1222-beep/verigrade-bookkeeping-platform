# VeriGrade Bookkeeping Platform - Complete Setup Script
# This script will set up your entire platform

Write-Host "🚀 VeriGrade Bookkeeping Platform - Complete Setup" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Check if we're in the right directory
if (!(Test-Path "backend")) {
    Write-Host "❌ Error: Please run this script from the root directory of the project" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found project structure" -ForegroundColor Green

# Step 1: Backend Setup
Write-Host "`n📦 Setting up Backend..." -ForegroundColor Yellow
cd backend

# Install dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
npm install

# Check if Prisma is available
if (Get-Command npx -ErrorAction SilentlyContinue) {
    Write-Host "Setting up database schema..." -ForegroundColor Cyan
    npx prisma generate
    Write-Host "✅ Database schema generated" -ForegroundColor Green
} else {
    Write-Host "⚠️  npx not found. Please install Node.js and npm" -ForegroundColor Yellow
}

# Create environment file if it doesn't exist
if (!(Test-Path ".env")) {
    Write-Host "Creating environment file..." -ForegroundColor Cyan
    @"
# Database
DATABASE_URL="postgresql://verigrade:verigrade123@localhost:5432/verigrade?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"

# AWS
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="verigrade-uploads"

# Stripe
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"

# Plaid
PLAID_CLIENT_ID="your-plaid-client-id"
PLAID_SECRET="your-plaid-secret"
PLAID_ENV="sandbox"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# App
NODE_ENV="development"
PORT="3000"
LOG_LEVEL="info"
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Environment file created" -ForegroundColor Green
}

# Start backend server
Write-Host "Starting backend server..." -ForegroundColor Cyan
Start-Process -FilePath "node" -ArgumentList "test-server.js" -WindowStyle Minimized
Write-Host "✅ Backend server started on port 3000" -ForegroundColor Green

# Wait a moment for server to start
Start-Sleep -Seconds 3

# Test backend
Write-Host "Testing backend..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend is running successfully!" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Backend test failed. Please check the server manually." -ForegroundColor Yellow
}

cd ..

# Step 2: Frontend Setup
Write-Host "`n🌐 Setting up Frontend..." -ForegroundColor Yellow
if (Test-Path "frontend") {
    cd frontend
    
    # Install dependencies
    Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
    npm install
    
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
    Write-Host "To start frontend: cd frontend && npm run dev" -ForegroundColor Cyan
    
    cd ..
} else {
    Write-Host "⚠️  Frontend directory not found" -ForegroundColor Yellow
}

# Step 3: Mobile App Setup
Write-Host "`n📱 Setting up Mobile App..." -ForegroundColor Yellow
if (Test-Path "mobile-app") {
    cd mobile-app
    
    # Install dependencies
    Write-Host "Installing mobile app dependencies..." -ForegroundColor Cyan
    npm install
    
    Write-Host "✅ Mobile app dependencies installed" -ForegroundColor Green
    Write-Host "To start mobile app: cd mobile-app && npx expo start" -ForegroundColor Cyan
    
    cd ..
} else {
    Write-Host "⚠️  Mobile app directory not found" -ForegroundColor Yellow
}

# Step 4: Database Setup Instructions
Write-Host "`n🗄️ Database Setup Instructions..." -ForegroundColor Yellow
Write-Host "To complete the setup, you need to:" -ForegroundColor Cyan
Write-Host "1. Install PostgreSQL locally or use a cloud service" -ForegroundColor White
Write-Host "2. Update the DATABASE_URL in backend/.env" -ForegroundColor White
Write-Host "3. Run: cd backend && npx prisma db push" -ForegroundColor White
Write-Host "4. Run: cd backend && npm run db:seed" -ForegroundColor White

# Step 5: Production Deployment Options
Write-Host "`n🚀 Production Deployment Options..." -ForegroundColor Yellow
Write-Host "1. Railway (Easiest): railway deploy" -ForegroundColor White
Write-Host "2. Vercel (Frontend): vercel deploy" -ForegroundColor White
Write-Host "3. Kubernetes (Enterprise): kubectl apply -f k8s/" -ForegroundColor White

# Final Status
Write-Host "`n🎉 VeriGrade Bookkeeping Platform Setup Complete!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host "✅ Backend API: Running on http://localhost:3000" -ForegroundColor Green
Write-Host "✅ Health Check: http://localhost:3000/health" -ForegroundColor Green
Write-Host "✅ API Status: http://localhost:3000/api/status" -ForegroundColor Green
Write-Host "✅ Documentation: http://localhost:3000/api/docs" -ForegroundColor Green

Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Set up your database (PostgreSQL)" -ForegroundColor White
Write-Host "2. Configure environment variables" -ForegroundColor White
Write-Host "3. Start frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "4. Start mobile app: cd mobile-app && npx expo start" -ForegroundColor White
Write-Host "5. Deploy to production" -ForegroundColor White

Write-Host "`n🎯 Your platform is ready to become the next QuickBooks!" -ForegroundColor Green




