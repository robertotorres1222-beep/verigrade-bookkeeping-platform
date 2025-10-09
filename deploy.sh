#!/bin/bash

# VeriGrade Deployment Script
# This script deploys the entire platform to production

set -e

echo "🚀 Starting VeriGrade Deployment..."

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

# Check if required environment variables are set
check_env_vars() {
    print_status "Checking environment variables..."
    
    required_vars=(
        "DATABASE_URL"
        "JWT_SECRET"
        "STRIPE_SECRET_KEY"
        "OPENAI_API_KEY"
        "POSTHOG_KEY"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_error "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    print_success "All required environment variables are set"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Root dependencies
    npm install
    
    # Backend dependencies
    cd backend
    npm install
    cd ..
    
    # Frontend dependencies
    cd frontend-new
    npm install
    cd ..
    
    # Shared dependencies
    cd shared
    npm install
    cd ..
    
    print_success "Dependencies installed successfully"
}

# Build the application
build_application() {
    print_status "Building application..."
    
    # Build shared package
    cd shared
    npm run build
    cd ..
    
    # Build backend
    cd backend
    npm run build
    cd ..
    
    # Build frontend
    cd frontend-new
    npm run build
    cd ..
    
    print_success "Application built successfully"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    cd backend
    npx prisma migrate deploy
    npx prisma generate
    cd ..
    
    print_success "Database migrations completed"
}

# Start services
start_services() {
    print_status "Starting services..."
    
    # Start backend in background
    cd backend
    npm start &
    BACKEND_PID=$!
    cd ..
    
    # Start frontend in background
    cd frontend-new
    npm start &
    FRONTEND_PID=$!
    cd ..
    
    # Wait for services to start
    sleep 10
    
    print_success "Services started successfully"
    print_status "Backend PID: $BACKEND_PID"
    print_status "Frontend PID: $FRONTEND_PID"
}

# Health check
health_check() {
    print_status "Performing health checks..."
    
    # Check backend health
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        print_success "Backend health check passed"
    else
        print_error "Backend health check failed"
        exit 1
    fi
    
    # Check frontend health
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend health check passed"
    else
        print_error "Frontend health check failed"
        exit 1
    fi
    
    print_success "All health checks passed"
}

# Main deployment function
main() {
    print_status "Starting VeriGrade deployment process..."
    
    check_env_vars
    install_dependencies
    build_application
    run_migrations
    start_services
    health_check
    
    print_success "🎉 VeriGrade deployment completed successfully!"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend: http://localhost:3001"
    print_status "API Docs: http://localhost:3001/api"
}

# Run main function
main "$@"