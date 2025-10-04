#!/bin/bash

# VeriGrade Production Deployment Script
# This script sets up and deploys your VeriGrade platform to production

set -e  # Exit on any error

echo "🚀 VeriGrade Production Deployment"
echo "=================================="

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

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    print_success "All requirements met!"
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    if [ ! -f "backend/.env" ]; then
        print_warning "backend/.env not found. Creating from template..."
        cat > backend/.env << EOF
# Database Configuration
DATABASE_URL="postgresql://verigrade_user:CHANGE_THIS_PASSWORD@localhost:5432/verigrade_db"
REDIS_URL="redis://localhost:6379"

# JWT Configuration
JWT_SECRET="CHANGE_THIS_JWT_SECRET_MAKE_IT_LONG_AND_RANDOM"
JWT_REFRESH_SECRET="CHANGE_THIS_REFRESH_SECRET_MAKE_IT_LONG_AND_RANDOM"

# Email Configuration
EMAIL_SERVICE="gmail"
GMAIL_USER="your-gmail@gmail.com"
GMAIL_APP_PASSWORD="your-gmail-app-password"
FROM_EMAIL="noreply@yourdomain.com"

# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_YOUR_STRIPE_SECRET_KEY_HERE"
STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE"
STRIPE_WEBHOOK_SECRET="whsec_YOUR_WEBHOOK_SECRET_HERE"

# OpenAI Configuration
OPENAI_API_KEY="sk-YOUR_OPENAI_API_KEY_HERE"

# Server Configuration
PORT=3001
NODE_ENV="production"
FRONTEND_URL="https://yourdomain.com"

# Team Emails
BANKING_EMAIL="banking@yourdomain.com"
TAX_EMAIL="tax@yourdomain.com"
ADVISOR_EMAIL="advisors@yourdomain.com"
EOF
        print_warning "Please edit backend/.env with your actual values!"
    fi
    
    if [ ! -f "frontend/.env" ]; then
        print_warning "frontend/.env not found. Creating from template..."
        cat > frontend/.env << EOF
# Frontend Environment Variables
REACT_APP_API_URL="http://localhost:3001/api/v1"
REACT_APP_STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE"
EOF
        print_warning "Please edit frontend/.env with your actual values!"
    fi
    
    print_success "Environment files created!"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Backend dependencies
    print_status "Installing backend dependencies..."
    cd backend && npm install && cd ..
    
    # Frontend dependencies
    print_status "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    
    print_success "Dependencies installed!"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Start PostgreSQL and Redis
    docker-compose -f docker-compose.prod.yml up -d postgres redis
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10
    
    # Run Prisma migrations
    print_status "Running database migrations..."
    cd backend && npx prisma db push && cd ..
    
    print_success "Database setup complete!"
}

# Build and deploy
deploy() {
    print_status "Building and deploying application..."
    
    # Build frontend
    print_status "Building frontend..."
    cd frontend && npm run build && cd ..
    
    # Build and start all services
    print_status "Starting all services..."
    docker-compose -f docker-compose.prod.yml up -d --build
    
    print_success "Deployment complete!"
}

# Health check
health_check() {
    print_status "Performing health check..."
    
    # Wait for services to start
    sleep 30
    
    # Check backend health
    if curl -f http://localhost:3001/api/v1/health > /dev/null 2>&1; then
        print_success "Backend is healthy!"
    else
        print_error "Backend health check failed!"
        return 1
    fi
    
    # Check frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend is healthy!"
    else
        print_error "Frontend health check failed!"
        return 1
    fi
    
    print_success "All services are healthy!"
}

# Main deployment function
main() {
    echo "Starting VeriGrade deployment..."
    echo ""
    
    check_requirements
    setup_environment
    install_dependencies
    setup_database
    deploy
    health_check
    
    echo ""
    print_success "🎉 VeriGrade deployment completed successfully!"
    echo ""
    echo "Your application is now running at:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:3001"
    echo ""
    echo "Next steps:"
    echo "1. Configure your domain and SSL certificates"
    echo "2. Set up your Stripe keys in the environment files"
    echo "3. Configure your email service"
    echo "4. Set up monitoring and backups"
    echo "5. Start marketing and acquiring customers!"
    echo ""
    echo "For detailed setup instructions, see PRODUCTION_SETUP.md"
}

# Run main function
main "$@"