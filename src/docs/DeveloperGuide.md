# VeriGrade Platform - Developer Guide

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [API Documentation](#api-documentation)
3. [Database Schema](#database-schema)
4. [Frontend Development](#frontend-development)
5. [Backend Development](#backend-development)
6. [Deployment Guide](#deployment-guide)
7. [Testing Guide](#testing-guide)
8. [Contributing](#contributing)

## Architecture Overview

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (Express.js)  │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel CDN    │    │   Vercel API    │    │   Supabase      │
│   (Static)      │    │   (Serverless)  │    │   (Managed)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js, TypeScript, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Deployment**: Vercel (Frontend & Backend)
- **Authentication**: JWT with refresh tokens
- **File Storage**: Vercel Blob Storage
- **Email**: Resend API
- **Payments**: Stripe API

## API Documentation

### Base URL
- **Development**: `http://localhost:3001/api`
- **Production**: `https://verigrade-backend.vercel.app/api`

### Authentication
All API endpoints require authentication except:
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`

#### Headers
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

### Core Endpoints

#### Authentication
```http
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
GET  /auth/me
```

#### Users
```http
GET    /users
POST   /users
GET    /users/:id
PUT    /users/:id
DELETE /users/:id
```

#### Organizations
```http
GET    /organizations
POST   /organizations
GET    /organizations/:id
PUT    /organizations/:id
DELETE /organizations/:id
```

#### Transactions
```http
GET    /transactions
POST   /transactions
GET    /transactions/:id
PUT    /transactions/:id
DELETE /transactions/:id
```

#### Clients
```http
GET    /clients
POST   /clients
GET    /clients/:id
PUT    /clients/:id
DELETE /clients/:id
```

#### AI Assistant
```http
GET    /prompts
GET    /prompts/:id
POST   /prompts/:id/execute
GET    /prompts/categories
GET    /prompts/history/executions
```

### Response Format
All API responses follow this format:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  },
  "error": null
}
```

### Error Handling
```json
{
  "success": false,
  "message": "Error message",
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Rate Limiting
- **Authentication**: 10 requests per 15 minutes
- **General API**: 1000 requests per hour
- **File Upload**: 5 requests per 30 minutes

## Database Schema

### Core Models

#### User
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  firstName     String
  lastName      String
  passwordHash  String
  avatar        String?
  phone         String?
  isActive      Boolean   @default(true)
  emailVerified Boolean   @default(false)
  twoFactorEnabled Boolean @default(false)
  mfaEnabled     Boolean   @default(false)
  stripeCustomerId String?
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relationships
  organizationMemberships OrganizationMember[]
  ownedOrganizations      Organization[]
  sessions                Session[]
  transactions            Transaction[]
  // ... more relationships
}
```

#### Organization
```prisma
model Organization {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  logo        String?
  website     String?
  industry    String?
  size        String?
  currency    String   @default("USD")
  timezone    String   @default("UTC")
  address     Json?
  settings    Json?
  isActive    Boolean  @default(true)
  ownerId     String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relationships
  owner      User                   @relation("OrganizationOwner", fields: [ownerId], references: [id])
  members    OrganizationMember[]
  transactions Transaction[]
  // ... more relationships
}
```

#### Transaction
```prisma
model Transaction {
  id          String   @id @default(cuid())
  amount      Decimal
  description String
  category    String
  date        DateTime
  status      TransactionStatus @default(PENDING)
  metadata    Json?
  organizationId String
  userId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relationships
  organization Organization @relation(fields: [organizationId], references: [id])
  user        User         @relation(fields: [userId], references: [id])
}
```

### Practice Management Models

#### Practice
```prisma
model Practice {
  id          String   @id @default(cuid())
  name        String
  description String?
  logo        String?
  website     String?
  address     Json?
  settings    Json?
  branding    Json?
  ownerId     String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relationships
  owner      User                   @relation("PracticeOwner", fields: [ownerId], references: [id])
  staff      PracticeStaffMember[]
  clients    ClientOrganization[]
  engagements ClientEngagement[]
}
```

#### ClientOrganization
```prisma
model ClientOrganization {
  id          String   @id @default(cuid())
  name        String
  email       String
  phone       String?
  industry    String?
  address     Json?
  settings    Json?
  practiceId  String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relationships
  practice   Practice            @relation(fields: [practiceId], references: [id])
  engagement ClientEngagement?
  portalAccess ClientPortalAccess?
}
```

### AI Assistant Models

#### PromptTemplate
```prisma
model PromptTemplate {
  id          String   @id @default(cuid())
  title       String
  description String
  category    String
  template    String
  fields      Json
  metadata    Json?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relationships
  executions PromptExecution[]
}
```

#### PromptExecution
```prisma
model PromptExecution {
  id          String   @id @default(cuid())
  promptId    String
  userId      String
  organizationId String
  inputData   Json
  outputData  Json?
  status      PromptExecutionStatus @default(PENDING)
  executedAt  DateTime?
  createdAt   DateTime @default(now())
  
  // Relationships
  prompt      PromptTemplate @relation(fields: [promptId], references: [id])
  user        User           @relation(fields: [userId], references: [id])
  organization Organization  @relation(fields: [organizationId], references: [id])
}
```

## Frontend Development

### Project Structure
```
frontend-new/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── dashboard/       # Dashboard pages
│   │   ├── practice/       # Practice management
│   │   ├── ai-assistant/   # AI Assistant
│   │   └── client-portal/   # Client portal
│   ├── components/         # React components
│   │   ├── ui/            # UI components
│   │   ├── charts/        # Chart components
│   │   └── forms/         # Form components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript types
├── public/                # Static assets
├── tailwind.config.js     # Tailwind configuration
└── next.config.js         # Next.js configuration
```

### Component Development

#### Creating a New Component
```typescript
// components/ui/Button.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        loading && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={loading}
      {...props}
    >
      {loading && <Spinner className="mr-2" />}
      {children}
    </button>
  );
};
```

#### Using Components
```typescript
// pages/dashboard.tsx
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function Dashboard() {
  return (
    <div className="p-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <Button variant="primary" size="lg">
          Get Started
        </Button>
      </Card>
    </div>
  );
}
```

### State Management
```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.data);
      } else {
        localStorage.removeItem('token');
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, setUser };
}
```

### API Integration
```typescript
// services/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
```

## Backend Development

### Project Structure
```
backend/
├── src/
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Express middleware
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/           # Utility functions
│   └── config/          # Configuration
├── prisma/
│   └── schema.prisma    # Database schema
├── logs/                # Application logs
└── package.json
```

### Controller Development
```typescript
// controllers/userController.ts
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { ResponseHandler } from '../utils/response';
import { asyncHandler, AppError } from '../middleware/errorHandler';

export const userController = {
  // Get all users
  getAllUsers: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { page = 1, limit = 20, search } = req.query;
    
    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search as string } },
        { lastName: { contains: search as string } },
        { email: { contains: search as string } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
        createdAt: true
      }
    });

    const total = await prisma.user.count({ where });

    return ResponseHandler.success(res, {
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  }),

  // Create user
  createUser: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { firstName, lastName, email, role } = req.body;

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash: 'temp-password', // Should be hashed
        role
      }
    });

    return ResponseHandler.created(res, user);
  })
};
```

### Middleware Development
```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    organizationId: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { organizationMemberships: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      organizationId: user.organizationMemberships[0]?.organizationId || ''
    };

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};
```

### Service Development
```typescript
// services/emailService.ts
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      });
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
    const html = `
      <h1>Welcome to VeriGrade!</h1>
      <p>Hi ${userName},</p>
      <p>Welcome to VeriGrade! Your account has been created successfully.</p>
      <p>Get started by exploring the dashboard and setting up your organization.</p>
    `;

    await this.sendEmail({
      to: userEmail,
      subject: 'Welcome to VeriGrade',
      html
    });
  }
}

export const emailService = new EmailService();
```

## Deployment Guide

### Environment Setup

#### Development
```bash
# Clone repository
git clone https://github.com/your-org/verigrade-platform.git
cd verigrade-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

#### Production
```bash
# Build application
npm run build

# Run database migrations
npx prisma migrate deploy

# Start production server
npm start
```

### Vercel Deployment

#### Frontend Deployment
1. **Connect Repository**: Connect your GitHub repository to Vercel
2. **Configure Build**: Set build command to `npm run build`
3. **Set Environment Variables**: Add all required environment variables
4. **Deploy**: Deploy automatically on push to main branch

#### Backend Deployment
1. **Create Vercel Project**: Create new Vercel project for backend
2. **Configure API Routes**: Set up API routes in `api/` directory
3. **Set Environment Variables**: Add database and service credentials
4. **Deploy**: Deploy serverless functions

### Environment Variables

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://verigrade-backend.vercel.app/api
NEXT_PUBLIC_APP_URL=https://verigrade.vercel.app
```

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
FROM_EMAIL=noreply@verigrade.com
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Database Setup

#### Supabase Setup
1. **Create Project**: Create new Supabase project
2. **Get Connection String**: Copy database connection string
3. **Run Migrations**: Execute Prisma migrations
4. **Seed Data**: Run seed scripts if needed

#### Prisma Commands
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Deploy migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# View database
npx prisma studio
```

## Testing Guide

### Running Tests
```bash
# Run all tests
npm test

# Run specific test suite
npm run test:api
npm run test:ui
npm run test:performance
npm run test:integration

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Structure
```
tests/
├── api.test.ts           # API endpoint tests
├── ui.test.ts            # UI component tests
├── performance.test.ts   # Performance tests
├── integration.test.ts  # Integration tests
└── testRunner.ts         # Master test runner
```

### Writing Tests
```typescript
// Example API test
describe('User API', () => {
  test('should create user', async () => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    };

    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.firstName).toBe('John');
  });
});
```

## Contributing

### Development Workflow
1. **Fork Repository**: Fork the repository on GitHub
2. **Create Branch**: Create feature branch from main
3. **Make Changes**: Implement your changes
4. **Write Tests**: Add tests for new functionality
5. **Run Tests**: Ensure all tests pass
6. **Submit PR**: Create pull request with description

### Code Standards
- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow ESLint configuration
- **Prettier**: Use Prettier for code formatting
- **Commits**: Use conventional commit messages
- **Documentation**: Document all public APIs

### Pull Request Process
1. **Description**: Provide clear description of changes
2. **Tests**: Include tests for new functionality
3. **Documentation**: Update documentation if needed
4. **Review**: Request review from maintainers
5. **Merge**: Merge after approval and CI passes

---

*This guide is regularly updated. For the latest version, visit our developer documentation.*

