# VeriGrade Bookkeeping Platform

A comprehensive AI-powered SaaS bookkeeping platform with MCP integration, designed for modern businesses and accounting professionals.

## 🚀 Features

### Core Features
- **Multi-tenant Architecture**: Company/organization accounts with role-based access control
- **User Authentication**: SSO integration, 2FA, and secure account management
- **Real-time Dashboard**: Financial overview with interactive charts and KPIs
- **Invoice Management**: Professional invoices with recurring automation
- **Expense Tracking**: OCR integration with AI categorization
- **Bank Integration**: Plaid API for automatic transaction import
- **AI-Powered Insights**: MCP integration for smart categorization and predictions
- **Comprehensive Reporting**: Customizable financial reports and tax compliance
- **Mobile Experience**: PWA with offline capabilities

### AI/MCP Features
- Intelligent transaction categorization
- Smart expense predictions
- Natural language query interface
- Anomaly detection
- Automated report generation
- Predictive cash flow analysis

## 🏗️ Architecture

```
verigrade-bookkeeping-platform/
├── frontend/          # React 18 + TypeScript + Tailwind CSS
├── backend/           # Node.js + Express + PostgreSQL + Prisma
├── shared/            # Shared types and utilities
├── docs/              # Documentation and API specs
├── docker-compose.yml # Development environment
└── package.json       # Root package configuration
```

## 🛠️ Tech Stack

### Frontend
- React 18+ with TypeScript
- Tailwind CSS for styling
- Redux Toolkit for state management
- React Query for API calls
- Framer Motion for animations
- Recharts for data visualization

### Backend
- Node.js with Express
- PostgreSQL with Prisma ORM
- Redis for caching
- Bull for job queuing
- JWT authentication
- OpenAI API for MCP features

### Infrastructure
- Docker containerization
- AWS/GCP/Azure hosting
- CDN for static assets
- SSL/TLS encryption

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- PostgreSQL 14+
- Redis 6+

### Quick Start

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd verigrade-bookkeeping-platform
   npm run setup
   ```

2. **Environment Configuration**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

3. **Database Setup**
   ```bash
   npm run db:setup
   npm run db:migrate
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

5. **Docker Development**
   ```bash
   npm run docker:dev
   ```

## 📁 Project Structure

### Backend (`/backend`)
- `src/controllers/` - API route handlers
- `src/models/` - Database models and schemas
- `src/services/` - Business logic and external integrations
- `src/middleware/` - Authentication, validation, etc.
- `src/utils/` - Helper functions and utilities
- `src/ai/` - MCP integration and AI services

### Frontend (`/frontend`)
- `src/components/` - Reusable UI components
- `src/pages/` - Page components and routes
- `src/store/` - Redux store and slices
- `src/hooks/` - Custom React hooks
- `src/services/` - API client and external services
- `src/utils/` - Helper functions and utilities

### Shared (`/shared`)
- `types/` - TypeScript type definitions
- `constants/` - Shared constants
- `utils/` - Shared utility functions

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only

# Building
npm run build            # Build all packages
npm run build:frontend   # Build frontend
npm run build:backend    # Build backend

# Testing
npm run test             # Run all tests
npm run test:frontend    # Run frontend tests
npm run test:backend     # Run backend tests

# Database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with sample data
```

## 🔐 Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/verigrade"

# Authentication
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"

# Redis
REDIS_URL="redis://localhost:6379"

# External APIs
OPENAI_API_KEY="your-openai-api-key"
PLAID_CLIENT_ID="your-plaid-client-id"
PLAID_SECRET="your-plaid-secret"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# File Storage
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_S3_BUCKET="your-bucket-name"
```

## 📊 API Documentation

API documentation is available at `/docs/api` when running the backend in development mode.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up
```

## 📈 Performance Requirements

- Page load time < 3 seconds
- API response time < 200ms
- 99.9% uptime SLA
- Support for 10,000+ concurrent users

## 🔒 Security

- End-to-end encryption for sensitive data
- PCI DSS compliance for payment handling
- GDPR/CCPA compliance
- Regular security audits
- Activity logging and monitoring

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

- Documentation: `/docs`
- Issues: GitHub Issues
- Email: support@verigrade.com
