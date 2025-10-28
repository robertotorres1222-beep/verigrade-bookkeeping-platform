# VeriGrade API Documentation

Welcome to the VeriGrade API documentation. This comprehensive guide provides everything you need to integrate with the VeriGrade bookkeeping platform.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Webhooks](#webhooks)
8. [SDKs & Examples](#sdks--examples)
9. [Changelog](#changelog)

## Getting Started

### Base URL

```
Production: https://api.verigrade.com
Staging: https://staging-api.verigrade.com
Development: http://localhost:3000
```

### API Versioning

The VeriGrade API uses URL-based versioning:

```
https://api.verigrade.com/v1/
```

### Content Type

All requests must include the `Content-Type: application/json` header.

### Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  },
  "pagination": {
    // Pagination info (when applicable)
  }
}
```

## Authentication

### API Keys

For programmatic access, use API keys:

```bash
curl -H "X-API-Key: your-api-key" \
     https://api.verigrade.com/v1/invoices
```

### JWT Tokens

For user authentication, use JWT tokens:

```bash
curl -H "Authorization: Bearer your-jwt-token" \
     https://api.verigrade.com/v1/invoices
```

### OAuth 2.0

For third-party integrations, use OAuth 2.0:

```bash
# Authorization URL
https://api.verigrade.com/oauth/authorize?client_id=your-client-id&redirect_uri=your-redirect-uri&response_type=code&scope=read write

# Token Exchange
curl -X POST https://api.verigrade.com/oauth/token \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "grant_type=authorization_code&code=authorization-code&client_id=your-client-id&client_secret=your-client-secret"
```

## API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /v1/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "companyName": "Acme Corporation",
  "businessType": "LLC"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

#### Login User
```http
POST /v1/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "rememberMe": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

### Invoice Endpoints

#### Get All Invoices
```http
GET /v1/invoices
```

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 50, max: 100)
- `status` (string, optional): Filter by status (draft, sent, paid, overdue, cancelled)
- `clientId` (string, optional): Filter by client ID
- `startDate` (string, optional): Filter from date (YYYY-MM-DD)
- `endDate` (string, optional): Filter to date (YYYY-MM-DD)
- `search` (string, optional): Search in invoice number or client name

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "invoice-123",
      "invoiceNumber": "INV-001",
      "clientId": "client-123",
      "status": "sent",
      "totalAmount": 1000.00,
      "dueDate": "2024-02-15",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Create Invoice
```http
POST /v1/invoices
```

**Request Body:**
```json
{
  "clientId": "client-123",
  "invoiceNumber": "INV-001",
  "dueDate": "2024-02-15",
  "notes": "Thank you for your business!",
  "lineItems": [
    {
      "description": "Web Development Services",
      "quantity": 10,
      "unitPrice": 100.00,
      "taxRate": 0.08
    }
  ],
  "status": "draft"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invoice created successfully",
  "data": {
    "id": "invoice-123",
    "invoiceNumber": "INV-001",
    "clientId": "client-123",
    "status": "draft",
    "totalAmount": 1080.00,
    "dueDate": "2024-02-15",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Get Invoice by ID
```http
GET /v1/invoices/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "invoice-123",
    "invoiceNumber": "INV-001",
    "clientId": "client-123",
    "status": "sent",
    "totalAmount": 1080.00,
    "dueDate": "2024-02-15",
    "lineItems": [
      {
        "id": "line-item-123",
        "description": "Web Development Services",
        "quantity": 10,
        "unitPrice": 100.00,
        "taxRate": 0.08,
        "lineTotal": 1080.00
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Update Invoice
```http
PUT /v1/invoices/{id}
```

**Request Body:**
```json
{
  "clientId": "client-123",
  "dueDate": "2024-02-20",
  "notes": "Updated notes",
  "status": "sent"
}
```

#### Delete Invoice
```http
DELETE /v1/invoices/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "Invoice deleted successfully"
}
```

### Client Endpoints

#### Get All Clients
```http
GET /v1/clients
```

**Query Parameters:**
- `page` (integer, optional): Page number
- `limit` (integer, optional): Items per page
- `search` (string, optional): Search in name or email
- `status` (string, optional): Filter by status (active, inactive)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "client-123",
      "name": "Acme Corporation",
      "email": "contact@acme.com",
      "phone": "+1-555-0123",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "US"
      },
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Create Client
```http
POST /v1/clients
```

**Request Body:**
```json
{
  "name": "Acme Corporation",
  "email": "contact@acme.com",
  "phone": "+1-555-0123",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "US"
  }
}
```

### Expense Endpoints

#### Get All Expenses
```http
GET /v1/expenses
```

**Query Parameters:**
- `page` (integer, optional): Page number
- `limit` (integer, optional): Items per page
- `category` (string, optional): Filter by category
- `startDate` (string, optional): Filter from date
- `endDate` (string, optional): Filter to date
- `status` (string, optional): Filter by status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "expense-123",
      "description": "Office supplies",
      "amount": 150.00,
      "category": "Office Expenses",
      "date": "2024-01-15",
      "vendor": "Office Depot",
      "isReimbursable": true,
      "status": "approved",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Create Expense
```http
POST /v1/expenses
```

**Request Body:**
```json
{
  "description": "Office supplies",
  "amount": 150.00,
  "category": "Office Expenses",
  "date": "2024-01-15",
  "vendor": "Office Depot",
  "isReimbursable": true,
  "receipt": "base64-encoded-receipt-data"
}
```

### Banking Endpoints

#### Get Bank Accounts
```http
GET /v1/banking/accounts
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "account-123",
      "accountName": "Business Checking",
      "accountNumber": "****1234",
      "bankName": "Chase Bank",
      "accountType": "checking",
      "balance": 5000.00,
      "currency": "USD",
      "isActive": true,
      "lastSyncAt": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Get Transactions
```http
GET /v1/banking/transactions
```

**Query Parameters:**
- `accountId` (string, optional): Filter by account ID
- `startDate` (string, optional): Filter from date
- `endDate` (string, optional): Filter to date
- `category` (string, optional): Filter by category

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "transaction-123",
      "accountId": "account-123",
      "description": "Office Depot Purchase",
      "amount": -150.00,
      "date": "2024-01-15",
      "category": "Office Expenses",
      "status": "posted",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Report Endpoints

#### Get Financial Reports
```http
GET /v1/reports/financial
```

**Query Parameters:**
- `type` (string, required): Report type (profit-loss, balance-sheet, cash-flow)
- `startDate` (string, required): Report start date
- `endDate` (string, required): Report end date
- `format` (string, optional): Response format (json, pdf, excel)

**Response:**
```json
{
  "success": true,
  "data": {
    "reportType": "profit-loss",
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    },
    "revenue": {
      "total": 10000.00,
      "breakdown": {
        "sales": 8000.00,
        "services": 2000.00
      }
    },
    "expenses": {
      "total": 6000.00,
      "breakdown": {
        "office": 2000.00,
        "marketing": 1500.00,
        "utilities": 1000.00,
        "other": 1500.00
      }
    },
    "netIncome": 4000.00
  }
}
```

## Data Models

### User Model
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'viewer';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Invoice Model
```typescript
interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  totalAmount: number;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  createdAt: string;
  updatedAt: string;
}

interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineTotal: number;
}
```

### Client Model
```typescript
interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: Address;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}
```

### Expense Model
```typescript
interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  vendor: string;
  isReimbursable: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  createdAt: string;
  updatedAt: string;
}
```

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "validation error details"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Access denied |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `SERVER_ERROR` | 500 | Internal server error |

### Error Examples

**Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Invalid input data",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}
```

**Unauthorized Error:**
```json
{
  "success": false,
  "message": "Unauthorized access",
  "error": "Invalid or expired token",
  "code": "UNAUTHORIZED"
}
```

## Rate Limiting

### Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Authentication | 10 requests | 1 minute |
| General API | 1000 requests | 1 hour |
| File Upload | 100 requests | 1 hour |
| Webhooks | 1000 requests | 1 hour |

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

### Rate Limit Exceeded Response
```json
{
  "success": false,
  "message": "Rate limit exceeded",
  "error": "Too many requests",
  "code": "RATE_LIMITED",
  "retryAfter": 3600
}
```

## Webhooks

### Webhook Events

| Event | Description | Data |
|-------|-------------|------|
| `invoice.created` | Invoice created | Invoice object |
| `invoice.updated` | Invoice updated | Invoice object |
| `invoice.paid` | Invoice paid | Invoice object |
| `expense.created` | Expense created | Expense object |
| `expense.approved` | Expense approved | Expense object |
| `client.created` | Client created | Client object |
| `payment.received` | Payment received | Payment object |

### Webhook Payload
```json
{
  "id": "webhook-123",
  "event": "invoice.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "id": "invoice-123",
    "invoiceNumber": "INV-001",
    "clientId": "client-123",
    "status": "draft",
    "totalAmount": 1000.00
  }
}
```

### Webhook Security
Webhooks include a signature header for verification:

```http
X-Verigrade-Signature: sha256=signature
```

## SDKs & Examples

### JavaScript/Node.js
```javascript
const VerigradeAPI = require('@verigrade/api-client');

const client = new VerigradeAPI({
  apiKey: 'your-api-key',
  baseURL: 'https://api.verigrade.com/v1'
});

// Create invoice
const invoice = await client.invoices.create({
  clientId: 'client-123',
  lineItems: [
    {
      description: 'Web Development',
      quantity: 10,
      unitPrice: 100.00
    }
  ]
});
```

### Python
```python
from verigrade import VerigradeAPI

client = VerigradeAPI(
    api_key='your-api-key',
    base_url='https://api.verigrade.com/v1'
)

# Create invoice
invoice = client.invoices.create({
    'clientId': 'client-123',
    'lineItems': [
        {
            'description': 'Web Development',
            'quantity': 10,
            'unitPrice': 100.00
        }
    ]
})
```

### PHP
```php
<?php
use Verigrade\VerigradeAPI;

$client = new VerigradeAPI([
    'api_key' => 'your-api-key',
    'base_url' => 'https://api.verigrade.com/v1'
]);

// Create invoice
$invoice = $client->invoices->create([
    'clientId' => 'client-123',
    'lineItems' => [
        [
            'description' => 'Web Development',
            'quantity' => 10,
            'unitPrice' => 100.00
        ]
    ]
]);
?>
```

## Changelog

### Version 1.0.0 (2024-01-15)
- Initial API release
- Authentication endpoints
- Invoice management
- Client management
- Expense tracking
- Banking integration
- Report generation

### Version 1.1.0 (2024-02-01)
- Added webhook support
- Enhanced error handling
- Rate limiting implementation
- SDK releases

### Version 1.2.0 (2024-03-01)
- Advanced search endpoints
- Bulk operations support
- Enhanced reporting
- Mobile API optimizations

---

For more information, visit our [API Documentation](https://api.verigrade.com/api-docs) or contact our support team at api-support@verigrade.com.










