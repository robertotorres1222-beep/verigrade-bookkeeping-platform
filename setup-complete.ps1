# PowerShell script for Windows
Write-Host "🚀 Setting up VeriGrade Complete Platform..." -ForegroundColor Green

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Install frontend dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
cd frontend-new
npm install
cd ..

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
cd backend
npm install
cd ..

# Install Perplexity MCP dependencies
Write-Host "📦 Installing Perplexity MCP dependencies..." -ForegroundColor Yellow
cd perplexity-mcp
npm install
cd ..

# Generate Prisma client
Write-Host "🗄️ Generating Prisma client..." -ForegroundColor Yellow
cd frontend-new
npx prisma generate
cd ..

# Build Perplexity MCP
Write-Host "🔧 Building Perplexity MCP..." -ForegroundColor Yellow
cd perplexity-mcp
npx tsc
cd ..

# Create environment files if they don't exist
Write-Host "⚙️ Setting up environment files..." -ForegroundColor Yellow

if (!(Test-Path "backend/.env")) {
    @"
# Backend Configuration
PORT=3001
NODE_ENV=development
JWT_SECRET=your-jwt-secret-change-in-production

# Database (Optional - will use mock data if not set)
# DATABASE_URL="postgresql://username:password@localhost:5432/verigrade"

# Perplexity MCP (Optional - will use mock responses if not set)
# PERPLEXITY_API_KEY=your_perplexity_api_key_here
"@ | Out-File -FilePath "backend/.env" -Encoding UTF8
    Write-Host "✅ Created backend/.env" -ForegroundColor Green
}

if (!(Test-Path "frontend-new/.env.local")) {
    @"
# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Database (Optional)
# DATABASE_URL="postgresql://username:password@localhost:5432/verigrade"
"@ | Out-File -FilePath "frontend-new/.env.local" -Encoding UTF8
    Write-Host "✅ Created frontend-new/.env.local" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 What's been added:" -ForegroundColor Cyan
Write-Host "✅ PWA features (installable app)" -ForegroundColor White
Write-Host "✅ Authentication middleware" -ForegroundColor White
Write-Host "✅ Rate limiting" -ForegroundColor White
Write-Host "✅ Comprehensive testing setup" -ForegroundColor White
Write-Host "✅ Database integration with Prisma" -ForegroundColor White
Write-Host "✅ Performance optimizations" -ForegroundColor White
Write-Host "✅ Advanced Next.js features" -ForegroundColor White
Write-Host "✅ API routes for analytics" -ForegroundColor White
Write-Host "✅ Security headers" -ForegroundColor White
Write-Host "✅ Bundle optimization" -ForegroundColor White
Write-Host ""
Write-Host "🚀 To start the platform:" -ForegroundColor Cyan
Write-Host "   npm run dev:simple" -ForegroundColor White
Write-Host ""
Write-Host "🧪 To run tests:" -ForegroundColor Cyan
Write-Host "   cd frontend-new && npm test" -ForegroundColor White
Write-Host ""
Write-Host "🗄️ To set up database:" -ForegroundColor Cyan
Write-Host "   cd frontend-new && npx prisma db push" -ForegroundColor White
Write-Host ""
Write-Host "📱 PWA features:" -ForegroundColor Cyan
Write-Host "   - App can be installed on mobile/desktop" -ForegroundColor White
Write-Host "   - Offline functionality" -ForegroundColor White
Write-Host "   - Push notifications ready" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Optional: Add Perplexity API key to backend/.env for real AI responses" -ForegroundColor Yellow
Write-Host ""
