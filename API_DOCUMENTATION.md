# 📚 VeriGrade API Documentation

## Base URL
- **Development:** `http://localhost:3001`
- **Production:** `https://your-backend-url.railway.app`

## Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### Register New User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "organizationName": "Acme Corp"
}
```

**Response:**
```json
{
  "user": {
    "id": "clxxx",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "organization": {
    "id": "clxxx",
    "name": "Acme Corp"
  }
}
```

### Login
**POST** `/api/auth/login`

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
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400
}
```

### Get Current User
**GET** `/api/auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "id": "clxxx",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "emailVerified": true
  },
  "organization": { ... },
  "role": "OWNER"
}
```

---

## 📄 Invoice Endpoints

### Create Invoice
**POST** `/api/invoices`

**Request Body:**
```json
{
  "clientName": "ABC Corp",
  "clientEmail": "billing@abc.com",
  "invoiceNumber": "INV-001",
  "issueDate": "2024-01-15",
  "dueDate": "2024-02-15",
  "currency": "USD",
  "items": [
    {
      "description": "Consulting Services",
      "quantity": 10,
      "unitPrice": 150.00,
      "total": 1500.00
    }
  ],
  "subtotal": 1500.00,
  "taxAmount": 150.00,
  "total": 1650.00,
  "notes": "Payment due in 30 days"
}
```

**Response:**
```json
{
  "id": "clxxx",
  "invoiceNumber": "INV-001",
  "status": "draft",
  "total": 1650.00,
  ...
}
```

### Get All Invoices
**GET** `/api/invoices?status=sent&limit=50`

**Query Parameters:**
- `status` - Filter by status (draft, sent, paid, overdue, cancelled)
- `limit` - Number of results (default: 50)
- `offset` - Pagination offset
- `startDate` - Filter by issue date (YYYY-MM-DD)
- `endDate` - Filter by issue date (YYYY-MM-DD)

### Get Invoice by ID
**GET** `/api/invoices/:id`

### Update Invoice
**PUT** `/api/invoices/:id`

### Delete Invoice
**DELETE** `/api/invoices/:id`

### Generate PDF
**GET** `/api/invoices/:id/pdf`

Returns PDF file for download.

### Send Invoice
**POST** `/api/invoices/:id/send`

Sends invoice email to client.

---

## 💰 Transaction Endpoints

### Create Transaction
**POST** `/api/transactions`

**Request Body:**
```json
{
  "type": "EXPENSE",
  "amount": 245.00,
  "description": "Office Supplies",
  "category": "Office Supplies",
  "date": "2024-01-15",
  "reference": "PO-12345",
  "merchant": "Staples",
  "metadata": {
    "paymentMethod": "Credit Card"
  }
}
```

### Get All Transactions
**GET** `/api/transactions?type=EXPENSE&category=Office%20Supplies`

**Query Parameters:**
- `type` - INCOME, EXPENSE, TRANSFER, ADJUSTMENT
- `category` - Transaction category
- `startDate` - Date range start
- `endDate` - Date range end
- `limit` - Results per page
- `offset` - Pagination offset

### AI Categorize Transaction
**POST** `/api/transactions/categorize`

**Request Body:**
```json
{
  "transactionId": "clxxx",
  "amount": 45.99,
  "description": "Coffee shop purchase",
  "merchant": "Starbucks"
}
```

Enqueues transaction for AI categorization. Returns immediately with job ID.

### Get Category Suggestions
**GET** `/api/transactions/suggestions/:id`

Returns AI-suggested categories for a transaction.

---

## 📊 Expense Endpoints

### Create Expense
**POST** `/api/expenses`

**Request Body (multipart/form-data):**
```
description: "Client Dinner"
amount: 150.00
date: 2024-01-15
category: "Meals & Entertainment"
receipt: <file>
isTaxDeductible: true
isReimbursable: false
```

### OCR Receipt Processing
**POST** `/api/receipts/process`

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "merchant": "Starbucks",
    "amount": 5.75,
    "date": "2024-01-15",
    "category": "Meals & Entertainment",
    "confidence": 0.95
  }
}
```

---

## 📈 Reports Endpoints

### Get Dashboard Overview
**GET** `/api/dashboard/overview`

**Response:**
```json
{
  "totalIncome": 50000.00,
  "totalExpenses": 35000.00,
  "netProfit": 15000.00,
  "invoiceStats": {
    "total": 45,
    "paid": 30,
    "pending": 10,
    "overdue": 5
  },
  "recentTransactions": [ ... ],
  "topCategories": [ ... ]
}
```

### Export Data
**GET** `/api/export/transactions?format=csv&startDate=2024-01-01&endDate=2024-12-31`

**Query Parameters:**
- `format` - csv, excel, quickbooks, xero
- `dataType` - transactions, invoices, expenses
- `startDate` - Start date
- `endDate` - End date

Returns file download.

---

## 💳 Subscription Endpoints

### Get Available Plans
**GET** `/api/subscriptions/plans`

**Response:**
```json
{
  "plans": [
    {
      "id": "free",
      "name": "Free",
      "price": 0,
      "features": { ... }
    },
    {
      "id": "starter",
      "name": "Starter",
      "price": 19,
      "features": { ... }
    }
  ]
}
```

### Create Subscription
**POST** `/api/subscriptions`

**Request Body:**
```json
{
  "priceId": "price_starter"
}
```

### Cancel Subscription
**DELETE** `/api/subscriptions/current`

### Update Subscription (Upgrade/Downgrade)
**PUT** `/api/subscriptions/current`

**Request Body:**
```json
{
  "newPriceId": "price_professional"
}
```

---

## 🏦 Bank Integration (Plaid)

### Create Link Token
**POST** `/api/plaid/create-link-token`

**Response:**
```json
{
  "link_token": "link-sandbox-abc123..."
}
```

### Exchange Public Token
**POST** `/api/plaid/exchange-token`

**Request Body:**
```json
{
  "public_token": "public-sandbox-abc123..."
}
```

### Get Accounts
**GET** `/api/plaid/accounts`

### Get Transactions
**GET** `/api/plaid/transactions?startDate=2024-01-01&endDate=2024-01-31`

### Sync Transactions
**POST** `/api/plaid/sync`

Syncs latest transactions from connected bank accounts.

---

## ⚙️ Webhooks

### Stripe Webhook
**POST** `/webhooks/stripe`

Handles Stripe subscription events.

### Plaid Webhook
**POST** `/webhooks/plaid`

Handles bank account updates.

---

## 📝 Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "email",
      "message": "Invalid email format"
    }
  }
}
```

### Common Error Codes
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## 🔒 Rate Limits

- **Default:** 120 requests per minute per IP
- **Authenticated:** 300 requests per minute per user
- **Webhooks:** Unlimited

---

## 🧪 Testing

### Test Credit Cards (Stripe)
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires 3D Secure: `4000 0025 0000 3155`

### Test Bank Accounts (Plaid Sandbox)
- User: `user_good`
- Password: `pass_good`

---

## 📦 Postman Collection

Import our Postman collection:
```
https://api.verigrade.com/postman-collection.json
```

---

## 🆘 Support

- **Email:** support@verigrade.com
- **Docs:** https://docs.verigrade.com
- **Status:** https://status.verigrade.com

---

**Last Updated:** January 2025  
**API Version:** v1.0.0

