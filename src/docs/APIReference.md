# VeriGrade Platform - API Reference

## Base URL
- **Development**: `http://localhost:3001/api`
- **Production**: `https://verigrade-backend.vercel.app/api`

## Authentication
All API endpoints require authentication except:
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`

### Headers
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

## Response Format
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

## Error Handling
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

## Rate Limiting
- **Authentication**: 10 requests per 15 minutes
- **General API**: 1000 requests per hour
- **File Upload**: 5 requests per 30 minutes

---

## Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "company": "Acme Corp",
  "phone": "+1-555-0123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "emailVerified": false,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "organization": {
      "id": "org_123",
      "name": "Acme Corp",
      "slug": "acme-corp"
    }
  }
}
```

### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "emailVerified": true
    },
    "organization": {
      "id": "org_123",
      "name": "Acme Corp"
    }
  }
}
```

### Refresh Token
```http
POST /auth/refresh
```

**Headers:**
```http
Authorization: Bearer <refresh-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Current User
```http
GET /auth/me
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isActive": true,
      "emailVerified": true,
      "lastLoginAt": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "organization": {
      "id": "org_123",
      "name": "Acme Corp",
      "slug": "acme-corp"
    },
    "role": "OWNER"
  }
}
```

### Logout
```http
POST /auth/logout
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## User Management

### Get All Users
```http
GET /users?page=1&limit=20&search=john
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search term for name or email

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_123",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

### Create User
```http
POST /users
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "role": "MANAGER"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "user_456",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "role": "MANAGER",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get User by ID
```http
GET /users/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "isActive": true,
    "emailVerified": true,
    "lastLoginAt": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Update User
```http
PUT /users/:id
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1-555-0123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "user_123",
    "firstName": "John",
    "lastName": "Smith",
    "email": "john@example.com",
    "phone": "+1-555-0123",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Delete User
```http
DELETE /users/:id
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Organization Management

### Get All Organizations
```http
GET /organizations
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "org_123",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "description": "Technology company",
      "industry": "Technology",
      "size": "50-100",
      "currency": "USD",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Create Organization
```http
POST /organizations
```

**Request Body:**
```json
{
  "name": "Tech Startup",
  "description": "Innovative technology startup",
  "industry": "Technology",
  "size": "10-50",
  "currency": "USD"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Organization created successfully",
  "data": {
    "id": "org_456",
    "name": "Tech Startup",
    "slug": "tech-startup",
    "description": "Innovative technology startup",
    "industry": "Technology",
    "size": "10-50",
    "currency": "USD",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## Transaction Management

### Get All Transactions
```http
GET /transactions?page=1&limit=20&category=Revenue&startDate=2024-01-01&endDate=2024-01-31
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `category` (optional): Filter by category
- `startDate` (optional): Start date filter
- `endDate` (optional): End date filter

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "txn_123",
        "amount": 1500.00,
        "description": "Office supplies",
        "category": "Expense",
        "date": "2024-01-15T00:00:00Z",
        "status": "COMPLETED",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

### Create Transaction
```http
POST /transactions
```

**Request Body:**
```json
{
  "amount": 2500.00,
  "description": "Software license",
  "category": "Expense",
  "date": "2024-01-15",
  "metadata": {
    "vendor": "Microsoft",
    "invoiceNumber": "INV-001"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "id": "txn_456",
    "amount": 2500.00,
    "description": "Software license",
    "category": "Expense",
    "date": "2024-01-15T00:00:00Z",
    "status": "PENDING",
    "metadata": {
      "vendor": "Microsoft",
      "invoiceNumber": "INV-001"
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Update Transaction
```http
PUT /transactions/:id
```

**Request Body:**
```json
{
  "amount": 2000.00,
  "description": "Updated software license",
  "status": "COMPLETED"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction updated successfully",
  "data": {
    "id": "txn_456",
    "amount": 2000.00,
    "description": "Updated software license",
    "category": "Expense",
    "status": "COMPLETED",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Delete Transaction
```http
DELETE /transactions/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction deleted successfully"
}
```

---

## Client Management

### Get All Clients
```http
GET /clients?page=1&limit=20&status=active
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status
- `industry` (optional): Filter by industry

**Response:**
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "id": "client_123",
        "name": "Acme Corporation",
        "email": "contact@acme.com",
        "phone": "+1-555-0123",
        "industry": "Technology",
        "status": "active",
        "revenue": 50000,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

### Create Client
```http
POST /clients
```

**Request Body:**
```json
{
  "name": "Tech Startup Inc",
  "email": "info@techstartup.com",
  "phone": "+1-555-0456",
  "industry": "Technology",
  "address": {
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94105"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Client created successfully",
  "data": {
    "id": "client_456",
    "name": "Tech Startup Inc",
    "email": "info@techstartup.com",
    "phone": "+1-555-0456",
    "industry": "Technology",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## AI Assistant

### Get All Prompts
```http
GET /prompts?category=Analysis&search=financial
```

**Query Parameters:**
- `category` (optional): Filter by category
- `search` (optional): Search term

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prompt_123",
      "title": "Financial Analysis",
      "description": "Analyze financial data and provide insights",
      "category": "Analysis",
      "fields": [
        {
          "name": "company",
          "label": "Company Name",
          "type": "text",
          "required": true
        },
        {
          "name": "period",
          "label": "Analysis Period",
          "type": "select",
          "options": ["Q1", "Q2", "Q3", "Q4"],
          "required": true
        }
      ],
      "isActive": true
    }
  ]
}
```

### Get Prompt by ID
```http
GET /prompts/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "prompt_123",
    "title": "Financial Analysis",
    "description": "Analyze financial data and provide insights",
    "category": "Analysis",
    "template": "Analyze the financial data for {company} in {period}",
    "fields": [
      {
        "name": "company",
        "label": "Company Name",
        "type": "text",
        "required": true,
        "autoFill": "organization.name"
      }
    ],
    "populatedData": {
      "company": "Acme Corp"
    }
  }
}
```

### Execute Prompt
```http
POST /prompts/:id/execute
```

**Request Body:**
```json
{
  "inputData": {
    "company": "Acme Corp",
    "period": "Q4 2023"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Prompt executed successfully",
  "data": {
    "executionId": "exec_123",
    "result": "Based on the financial data for Acme Corp in Q4 2023, the company shows strong revenue growth of 15% compared to the previous quarter...",
    "executedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get Prompt Categories
```http
GET /prompts/categories
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "Analysis",
      "count": 8,
      "description": "Financial analysis prompts"
    },
    {
      "name": "Tax",
      "count": 6,
      "description": "Tax planning and compliance prompts"
    },
    {
      "name": "Reporting",
      "count": 5,
      "description": "Report generation prompts"
    }
  ]
}
```

### Get Execution History
```http
GET /prompts/history/executions?page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "executions": [
      {
        "id": "exec_123",
        "promptId": "prompt_123",
        "promptTitle": "Financial Analysis",
        "inputData": {
          "company": "Acme Corp",
          "period": "Q4 2023"
        },
        "status": "COMPLETED",
        "executedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

---

## Practice Management

### Get Practice Dashboard
```http
GET /practice/:practiceId/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "practice": {
      "id": "practice_123",
      "name": "Doe Accounting",
      "clients": 25,
      "staff": 5,
      "revenue": 150000
    },
    "metrics": {
      "totalClients": 25,
      "activeClients": 23,
      "newClients": 3,
      "totalRevenue": 150000,
      "monthlyGrowth": 12.5
    },
    "recentActivity": [
      {
        "id": "activity_123",
        "type": "client_added",
        "description": "New client added: Tech Startup Inc",
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### Get All Clients
```http
GET /practice/:practiceId/clients
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "client_123",
      "name": "Acme Corporation",
      "email": "contact@acme.com",
      "industry": "Technology",
      "status": "active",
      "healthScore": 85,
      "revenue": 50000,
      "lastActivity": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Add Client to Practice
```http
POST /practice/:practiceId/clients
```

**Request Body:**
```json
{
  "name": "New Client Corp",
  "email": "contact@newclient.com",
  "phone": "+1-555-0789",
  "industry": "Healthcare"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Client added to practice successfully",
  "data": {
    "id": "client_456",
    "name": "New Client Corp",
    "email": "contact@newclient.com",
    "phone": "+1-555-0789",
    "industry": "Healthcare",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## Client Portal

### Get Client Portal Dashboard
```http
GET /client-portal/:organizationId/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "organization": {
      "id": "org_123",
      "name": "Acme Corp",
      "logo": "https://example.com/logo.png"
    },
    "metrics": {
      "totalRevenue": 50000,
      "monthlyExpenses": 30000,
      "netProfit": 20000,
      "growthRate": 15.5
    },
    "recentTransactions": [
      {
        "id": "txn_123",
        "amount": 1500.00,
        "description": "Office supplies",
        "date": "2024-01-15T00:00:00Z",
        "status": "COMPLETED"
      }
    ]
  }
}
```

### Get Client Documents
```http
GET /client-portal/:organizationId/documents
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "doc_123",
      "name": "Financial Report Q4 2023",
      "type": "PDF",
      "size": 1024000,
      "uploadedAt": "2024-01-15T10:30:00Z",
      "status": "approved"
    }
  ]
}
```

### Approve Transaction
```http
POST /client-portal/:organizationId/approve-transaction
```

**Request Body:**
```json
{
  "transactionId": "txn_123",
  "approved": true,
  "notes": "Approved for payment"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction approval updated successfully",
  "data": {
    "transactionId": "txn_123",
    "approved": true,
    "approvedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `AUTHENTICATION_ERROR` | Authentication failed |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `DUPLICATE_ERROR` | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded |
| `SERVER_ERROR` | Internal server error |

---

## SDK Examples

### JavaScript/TypeScript
```typescript
import { VeriGradeAPI } from '@verigrade/api-client';

const api = new VeriGradeAPI({
  baseURL: 'https://verigrade-backend.vercel.app/api',
  token: 'your-jwt-token'
});

// Get all transactions
const transactions = await api.transactions.getAll({
  page: 1,
  limit: 20,
  category: 'Revenue'
});

// Create new transaction
const newTransaction = await api.transactions.create({
  amount: 1500.00,
  description: 'Office supplies',
  category: 'Expense',
  date: '2024-01-15'
});
```

### Python
```python
import requests

class VeriGradeAPI:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def get_transactions(self, page=1, limit=20):
        response = requests.get(
            f'{self.base_url}/transactions',
            headers=self.headers,
            params={'page': page, 'limit': limit}
        )
        return response.json()
    
    def create_transaction(self, data):
        response = requests.post(
            f'{self.base_url}/transactions',
            headers=self.headers,
            json=data
        )
        return response.json()

# Usage
api = VeriGradeAPI('https://verigrade-backend.vercel.app/api', 'your-token')
transactions = api.get_transactions()
```

---

*This API reference is regularly updated. For the latest version, visit our developer documentation.*

