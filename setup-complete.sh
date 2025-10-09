#!/bin/bash

echo "🚀 Setting up VeriGrade Complete Platform..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend-new && npm install && cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

# Install Perplexity MCP dependencies
echo "📦 Installing Perplexity MCP dependencies..."
cd perplexity-mcp && npm install && cd ..

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
cd frontend-new && npx prisma generate && cd ..

# Build Perplexity MCP
echo "🔧 Building Perplexity MCP..."
cd perplexity-mcp && npx tsc && cd ..

# Create environment files if they don't exist
echo "⚙️ Setting up environment files..."

if [ ! -f "backend/.env" ]; then
    cat > backend/.env << EOF
# Backend Configuration
PORT=3001
NODE_ENV=development
JWT_SECRET=your-jwt-secret-change-in-production

# Database (Optional - will use mock data if not set)
# DATABASE_URL="postgresql://username:password@localhost:5432/verigrade"

# Perplexity MCP (Optional - will use mock responses if not set)
# PERPLEXITY_API_KEY=your_perplexity_api_key_here
EOF
    echo "✅ Created backend/.env"
fi

if [ ! -f "frontend-new/.env.local" ]; then
    cat > frontend-new/.env.local << EOF
# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Database (Optional)
# DATABASE_URL="postgresql://username:password@localhost:5432/verigrade"
EOF
    echo "✅ Created frontend-new/.env.local"
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "📋 What's been added:"
echo "✅ PWA features (installable app)"
echo "✅ Authentication middleware"
echo "✅ Rate limiting"
echo "✅ Comprehensive testing setup"
echo "✅ Database integration with Prisma"
echo "✅ Performance optimizations"
echo "✅ Advanced Next.js features"
echo "✅ API routes for analytics"
echo "✅ Security headers"
echo "✅ Bundle optimization"
echo ""
echo "🚀 To start the platform:"
echo "   npm run dev:simple"
echo ""
echo "🧪 To run tests:"
echo "   cd frontend-new && npm test"
echo ""
echo "🗄️ To set up database:"
echo "   cd frontend-new && npx prisma db push"
echo ""
echo "📱 PWA features:"
echo "   - App can be installed on mobile/desktop"
echo "   - Offline functionality"
echo "   - Push notifications ready"
echo ""
echo "🔧 Optional: Add Perplexity API key to backend/.env for real AI responses"
echo ""
