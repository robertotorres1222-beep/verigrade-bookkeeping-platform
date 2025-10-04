# VeriGrade Bookkeeping Platform - Setup Guide

This guide will help you set up the VeriGrade bookkeeping platform for development and production.

## Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- PostgreSQL 14+ (for local development)
- Redis 6+ (for local development)
- Git

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd verigrade-bookkeeping-platform
npm run setup
```

### 2. Environment Configuration

Copy the environment example file and configure your settings:

```bash
cp backend/env.example backend/.env
```

Edit `backend/.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/verigrade_dev"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# External APIs
OPENAI_API_KEY="your-openai-api-key"
PLAID_CLIENT_ID="your-plaid-client-id"
PLAID_SECRET="your-plaid-secret"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed
```

### 4. Start Development

```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:frontend  # Frontend only (port 3000)
npm run dev:backend   # Backend only (port 3001)
```

### 5. Docker Development (Alternative)

```bash
# Start all services with Docker
npm run docker:dev

# Stop services
docker-compose -f docker-compose.dev.yml down
```

## Development Commands

### Root Level Commands

```bash
npm run dev              # Start both frontend and backend
npm run build            # Build all packages
npm run test             # Run all tests
npm run docker:dev       # Start Docker development environment
npm run docker:prod      # Start Docker production environment
```

### Backend Commands

```bash
cd backend

npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run test             # Run tests
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio
```

### Frontend Commands

```bash
cd frontend

npm run dev              # Start development server
npm run build            # Build for production
npm run test             # Run tests
npm run eject            # Eject from Create React App
```

### Shared Package Commands

```bash
cd shared

npm run build            # Build TypeScript
npm run dev              # Watch mode
npm run clean            # Clean build files
```

## Project Structure

```
verigrade-bookkeeping-platform/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Redux store and slices
│   │   ├── services/        # API services
│   │   ├── hooks/           # Custom React hooks
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── routes/          # API routes
│   ├── prisma/              # Database schema and migrations
│   └── package.json
├── shared/                  # Shared types and utilities
│   ├── src/
│   │   ├── types/           # TypeScript type definitions
│   │   ├── constants/       # Shared constants
│   │   └── utils/           # Utility functions
│   └── package.json
├── docs/                    # Documentation
├── docker-compose.dev.yml   # Development Docker setup
├── docker-compose.prod.yml  # Production Docker setup
└── package.json             # Root package configuration
```

## API Documentation

When running the backend in development mode, API documentation is available at:
- Swagger UI: `http://localhost:3001/docs`
- Health Check: `http://localhost:3001/health`

## Database Schema

The application uses PostgreSQL with Prisma ORM. Key entities include:

- **Users**: Authentication and profile information
- **Organizations**: Multi-tenant organization management
- **Transactions**: Financial transaction records
- **Invoices**: Invoice management and tracking
- **Expenses**: Expense tracking and approval
- **Reports**: Generated financial reports
- **Categories**: Transaction categorization

## Authentication

The application uses JWT-based authentication with:

- Access tokens (7-day expiry)
- Refresh tokens (30-day expiry)
- Role-based access control (Owner, Admin, Accountant, Viewer)
- Optional two-factor authentication

## Features Implemented

### ✅ Core Features
- [x] User authentication and registration
- [x] Multi-tenant organization management
- [x] JWT-based authentication
- [x] Role-based access control
- [x] Responsive dashboard
- [x] Modern UI with Tailwind CSS
- [x] Redux state management
- [x] TypeScript throughout
- [x] Docker containerization
- [x] Database schema with Prisma

### 🚧 In Development
- [ ] Invoice management
- [ ] Expense tracking
- [ ] Bank integration (Plaid)
- [ ] AI-powered categorization
- [ ] Financial reporting
- [ ] Email notifications

### 📋 Planned Features
- [ ] Mobile app (PWA)
- [ ] Advanced analytics
- [ ] Tax compliance tools
- [ ] API marketplace
- [ ] Advanced integrations

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/database"

# Authentication
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_SECRET="your-refresh-secret"
REFRESH_TOKEN_EXPIRES_IN="30d"

# Redis
REDIS_URL="redis://localhost:6379"

# Server
NODE_ENV="development"
PORT=3001

# External APIs
OPENAI_API_KEY="your-openai-key"
PLAID_CLIENT_ID="your-plaid-client-id"
PLAID_SECRET="your-plaid-secret"
STRIPE_SECRET_KEY="your-stripe-key"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# File Storage
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_S3_BUCKET="your-bucket"

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:3001/api/v1
REACT_APP_ENVIRONMENT=development
```

## Testing

### Backend Tests

```bash
cd backend
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Frontend Tests

```bash
cd frontend
npm test                   # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

## Production Deployment

### Docker Production

```bash
# Build and start production containers
npm run docker:prod

# Scale services
docker-compose -f docker-compose.prod.yml up --scale backend=3
```

### Manual Production Build

```bash
# Build all packages
npm run build

# Start production servers
cd backend && npm start
cd frontend && npm start
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check PostgreSQL is running
   pg_isready
   
   # Reset database
   npm run db:reset
   ```

2. **Port Conflicts**
   ```bash
   # Check what's using port 3000/3001
   lsof -i :3000
   lsof -i :3001
   ```

3. **Docker Issues**
   ```bash
   # Clean up Docker
   docker system prune -a
   
   # Rebuild containers
   docker-compose -f docker-compose.dev.yml build --no-cache
   ```

4. **Node Modules Issues**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Performance Optimization

1. **Database Indexing**: Ensure proper indexes on frequently queried fields
2. **Caching**: Use Redis for session storage and API response caching
3. **CDN**: Use a CDN for static assets in production
4. **Monitoring**: Implement logging and monitoring (Sentry, DataDog)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Support

- Documentation: `/docs`
- Issues: GitHub Issues
- Email: support@verigrade.com

## License

MIT License - see LICENSE file for details.
