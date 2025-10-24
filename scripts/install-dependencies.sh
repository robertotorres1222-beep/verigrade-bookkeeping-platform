#!/bin/bash

# VeriGrade Bookkeeping Platform - Dependency Installation Script
# This script installs all missing dependencies and sets up the development environment

set -e

echo "🚀 VeriGrade Bookkeeping Platform - Dependency Installation"
echo "============================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_success "npm version: $(npm -v)"

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend

# Install missing dependencies
print_status "Installing missing dependencies..."
npm install aws-sdk saml2-js csv-parser swagger-jsdoc swagger-ui-express @playwright/test @newrelic/apollo-server-plugin

# Install all dependencies
print_status "Installing all backend dependencies..."
npm install

print_success "Backend dependencies installed successfully!"

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd ../frontend
npm install

print_success "Frontend dependencies installed successfully!"

# Install mobile app dependencies
print_status "Installing mobile app dependencies..."
cd ../mobile-app
npm install

print_success "Mobile app dependencies installed successfully!"

# Go back to root
cd ..

# Install global dependencies
print_status "Installing global dependencies..."

# Install Prisma CLI globally
if ! command -v prisma &> /dev/null; then
    print_status "Installing Prisma CLI globally..."
    npm install -g prisma
    print_success "Prisma CLI installed successfully!"
else
    print_success "Prisma CLI already installed: $(prisma --version)"
fi

# Install Docker (if not installed)
if ! command -v docker &> /dev/null; then
    print_warning "Docker is not installed. Please install Docker for containerization."
else
    print_success "Docker is installed: $(docker --version)"
fi

# Install kubectl (if not installed)
if ! command -v kubectl &> /dev/null; then
    print_warning "kubectl is not installed. Please install kubectl for Kubernetes management."
else
    print_success "kubectl is installed: $(kubectl version --client --short)"
fi

# Install Helm (if not installed)
if ! command -v helm &> /dev/null; then
    print_warning "Helm is not installed. Please install Helm for Kubernetes package management."
else
    print_success "Helm is installed: $(helm version --short)"
fi

# Setup environment files
print_status "Setting up environment files..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    print_status "Creating backend .env file..."
    cat > backend/.env << EOF
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
EOF
    print_success "Backend .env file created!"
else
    print_success "Backend .env file already exists!"
fi

# Frontend .env
if [ ! -f "frontend/.env.local" ]; then
    print_status "Creating frontend .env.local file..."
    cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
NEXT_PUBLIC_APP_NAME="VeriGrade Bookkeeping"
NEXT_PUBLIC_APP_VERSION="1.0.0"
EOF
    print_success "Frontend .env.local file created!"
else
    print_success "Frontend .env.local file already exists!"
fi

# Mobile app .env
if [ ! -f "mobile-app/.env" ]; then
    print_status "Creating mobile app .env file..."
    cat > mobile-app/.env << EOF
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_APP_NAME="VeriGrade"
EXPO_PUBLIC_APP_VERSION="1.0.0"
EOF
    print_success "Mobile app .env file created!"
else
    print_success "Mobile app .env file already exists!"
fi

# Generate Prisma client
print_status "Generating Prisma client..."
cd backend
npx prisma generate
print_success "Prisma client generated successfully!"

# Run database migrations (if database is available)
print_status "Checking database connection..."
if npx prisma db push --accept-data-loss 2>/dev/null; then
    print_success "Database migrations completed successfully!"
else
    print_warning "Database connection failed. Please ensure PostgreSQL is running and update DATABASE_URL in backend/.env"
fi

cd ..

# Fix logger imports
print_status "Fixing logger import issues..."
if [ -f "scripts/fix-logger-imports.js" ]; then
    node scripts/fix-logger-imports.js
    print_success "Logger imports fixed successfully!"
else
    print_warning "Logger import fix script not found. Please run manually."
fi

# Run linting
print_status "Running linting..."
cd backend
if npm run lint 2>/dev/null; then
    print_success "Backend linting passed!"
else
    print_warning "Backend linting found issues. Please review and fix."
fi

cd ../frontend
if npm run lint 2>/dev/null; then
    print_success "Frontend linting passed!"
else
    print_warning "Frontend linting found issues. Please review and fix."
fi

cd ..

# Create development scripts
print_status "Creating development scripts..."

# Start all services script
cat > start-dev.sh << 'EOF'
#!/bin/bash

# Start all services in development mode
echo "🚀 Starting VeriGrade Bookkeeping Platform in development mode..."

# Start backend
echo "Starting backend server..."
cd backend && npm run dev &
BACKEND_PID=$!

# Start frontend
echo "Starting frontend server..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

# Start mobile app (if needed)
# echo "Starting mobile app..."
# cd ../mobile-app && npm start &
# MOBILE_PID=$!

echo "✅ All services started!"
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:3001"
echo "Mobile: http://localhost:19006"

# Wait for user to stop
echo "Press Ctrl+C to stop all services"
wait
EOF

chmod +x start-dev.sh
print_success "Development start script created!"

# Stop all services script
cat > stop-dev.sh << 'EOF'
#!/bin/bash

# Stop all development services
echo "🛑 Stopping all development services..."

# Kill all Node.js processes
pkill -f "npm run dev"
pkill -f "node.*dev"

echo "✅ All services stopped!"
EOF

chmod +x stop-dev.sh
print_success "Development stop script created!"

# Create production build script
cat > build-prod.sh << 'EOF'
#!/bin/bash

# Build all services for production
echo "🏗️ Building VeriGrade Bookkeeping Platform for production..."

# Build backend
echo "Building backend..."
cd backend
npm run build
cd ..

# Build frontend
echo "Building frontend..."
cd frontend
npm run build
cd ..

# Build mobile app
echo "Building mobile app..."
cd mobile-app
npm run build
cd ..

echo "✅ Production build completed!"
EOF

chmod +x build-prod.sh
print_success "Production build script created!"

# Summary
echo ""
echo "🎉 VeriGrade Bookkeeping Platform Setup Complete!"
echo "=================================================="
echo ""
echo "📋 Next Steps:"
echo "1. Update environment variables in .env files"
echo "2. Start PostgreSQL and Redis services"
echo "3. Run: ./start-dev.sh to start all services"
echo "4. Visit: http://localhost:3001 to access the application"
echo ""
echo "🔧 Available Scripts:"
echo "- ./start-dev.sh - Start all services in development"
echo "- ./stop-dev.sh - Stop all development services"
echo "- ./build-prod.sh - Build for production"
echo ""
echo "📚 Documentation:"
echo "- Architecture: docs/architecture-diagram.md"
echo "- Deployment: docs/deployment-guide.md"
echo "- Code Audit: docs/code-audit-report.md"
echo ""
echo "⚠️  Important Notes:"
echo "- Fix remaining linter errors before production"
echo "- Update Prisma schema with missing models"
echo "- Configure monitoring and security scanning"
echo "- Set up CI/CD pipeline"
echo ""
print_success "Setup completed successfully! 🚀"



