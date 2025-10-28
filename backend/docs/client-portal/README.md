# Client Portal Documentation

This document describes the comprehensive client portal system implemented in the VeriGrade Bookkeeping Platform, providing clients with self-service capabilities for invoice management, document sharing, payment processing, and communication.

## Overview

The client portal provides a secure, user-friendly interface for clients to manage their financial interactions with your business. It includes dashboard analytics, invoice viewing and payment, document management, messaging system, and activity tracking.

## Key Features

### Client Dashboard
- **Financial Overview**: Outstanding balances, total paid amounts, recent activity
- **Quick Actions**: Easy access to invoices, documents, and messages
- **Activity Timeline**: Real-time updates on account activity
- **Notification Center**: Unread message and system notifications

### Invoice Management
- **Invoice Viewing**: Detailed invoice information with line items
- **Payment Processing**: Secure online payment with multiple payment methods
- **Payment History**: Complete payment tracking and receipts
- **Status Tracking**: Real-time invoice status updates

### Document Management
- **Document Upload**: Secure file upload with categorization
- **Document Library**: Organized document repository with search
- **File Sharing**: Controlled access to business documents
- **Version Control**: Document history and updates

### Communication Center
- **Messaging System**: Direct communication with your team
- **Message Threading**: Organized conversation history
- **File Attachments**: Share documents within messages
- **Urgent Notifications**: Priority message handling

## API Endpoints

### Client Dashboard
```
GET /api/client-portal/:clientId/dashboard
```
Returns comprehensive dashboard data including recent invoices, documents, messages, activity, and financial summaries.

### Invoice Management
```
GET /api/client-portal/:clientId/invoices
GET /api/client-portal/:clientId/invoices/:invoiceId
POST /api/client-portal/:clientId/invoices/:invoiceId/pay
```
- List client invoices with filtering options
- View detailed invoice information
- Process invoice payments

### Document Management
```
GET /api/client-portal/:clientId/documents
POST /api/client-portal/:clientId/documents
```
- List client documents with type filtering
- Upload new documents with metadata

### Communication
```
GET /api/client-portal/:clientId/messages
POST /api/client-portal/:clientId/messages
```
- Retrieve client messages with threading support
- Send messages to clients with attachments

### Activity & Notifications
```
GET /api/client-portal/:clientId/activity
GET /api/client-portal/:clientId/notifications
PUT /api/client-portal/:clientId/notifications/:notificationId/read
```
- Track client activity and interactions
- Manage notifications and read status

### Client Preferences
```
PUT /api/client-portal/:clientPortalUserId/preferences
```
- Update client portal preferences and settings

## Payment Processing

### Payment Methods
```
POST /api/payments/:clientId/payment-methods
GET /api/payments/:clientId/payment-methods
PUT /api/payments/:clientId/payment-methods/:paymentMethodId/default
DELETE /api/payments/:clientId/payment-methods/:paymentMethodId
```
- Manage client payment methods (credit cards, bank accounts)
- Set default payment methods
- Secure payment method storage

### Payment Processing
```
POST /api/payments/:clientId/payment-intents
POST /api/payments/payment-intents/:paymentIntentId/process
GET /api/payments/payment-intents/:paymentIntentId
```
- Create payment intents for invoices
- Process payments with multiple processors
- Track payment status and history

### Payment Webhooks
```
POST /api/payments/webhooks/:processorId
```
- Handle payment processor webhooks
- Update payment status automatically
- Process refunds and disputes

## Data Models

### ClientPortalUser
```typescript
interface ClientPortalUser {
  id: string;
  clientId: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLoginAt?: Date;
  preferences: ClientPreferences;
  createdAt: Date;
  updatedAt: Date;
}
```

### ClientPreferences
```typescript
interface ClientPreferences {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  dashboard: {
    defaultView: 'overview' | 'invoices' | 'documents' | 'activity';
    itemsPerPage: number;
    showRecentActivity: boolean;
  };
  privacy: {
    showPaymentHistory: boolean;
    allowDocumentDownload: boolean;
    shareContactInfo: boolean;
  };
  language: string;
  timezone: string;
}
```

### ClientInvoice
```typescript
interface ClientInvoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  amount: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  issueDate: Date;
  paidDate?: Date;
  description?: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  paymentMethods: PaymentMethod[];
  notes?: string;
  attachments: Document[];
  createdAt: Date;
  updatedAt: Date;
}
```

### PaymentMethod
```typescript
interface PaymentMethod {
  id: string;
  clientId: string;
  type: 'credit_card' | 'bank_account' | 'paypal' | 'stripe';
  processorId: string;
  processorToken: string;
  lastFour: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  isActive: boolean;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}
```

### Document
```typescript
interface Document {
  id: string;
  clientId: string;
  name: string;
  type: 'invoice' | 'receipt' | 'contract' | 'statement' | 'other';
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  isPublic: boolean;
  downloadCount: number;
  tags: string[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### ClientMessage
```typescript
interface ClientMessage {
  id: string;
  clientId: string;
  fromUserId?: string;
  fromClientId?: string;
  subject: string;
  content: string;
  isRead: boolean;
  isUrgent: boolean;
  attachments: Document[];
  threadId?: string;
  parentMessageId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Frontend Components

### Dashboard Component
- **Location**: `frontend/src/pages/portal/dashboard.tsx`
- **Features**: Financial overview, recent activity, quick actions
- **Responsive**: Mobile-friendly design with Material-UI components

### Invoice Management
- **Location**: `frontend/src/pages/portal/invoices.tsx`
- **Features**: Invoice listing, detailed view, payment processing
- **Payment Integration**: Secure payment form with validation

### Document Management
- **Location**: `frontend/src/pages/portal/documents.tsx`
- **Features**: Document upload, categorization, search
- **File Handling**: Drag-and-drop upload with progress indicators

### Communication Center
- **Location**: `frontend/src/pages/portal/messages.tsx`
- **Features**: Message threading, file attachments, urgent notifications
- **Real-time**: Live message updates and read status

## Security Features

### Authentication
- **JWT Tokens**: Secure authentication with token expiration
- **Session Management**: Proper session handling and logout
- **Multi-Factor Authentication**: Optional MFA support

### Data Protection
- **Client Isolation**: Complete data separation between clients
- **File Security**: Secure file upload and download with access controls
- **Payment Security**: PCI-compliant payment processing

### Access Control
- **Role-Based Access**: Client-specific permissions
- **Resource Scoping**: All data scoped to client ID
- **Audit Logging**: Comprehensive activity tracking

## Payment Integration

### Supported Processors
- **Stripe**: Credit card and ACH processing
- **PayPal**: PayPal and credit card payments
- **Square**: Point-of-sale integration
- **Braintree**: PayPal and credit card processing

### Payment Features
- **Multiple Payment Methods**: Store and manage various payment options
- **Recurring Payments**: Automatic payment processing
- **Payment History**: Complete transaction tracking
- **Refund Processing**: Automated refund handling

### Security
- **PCI Compliance**: Secure payment data handling
- **Tokenization**: Secure payment method storage
- **Fraud Detection**: Built-in fraud prevention
- **Audit Trails**: Complete payment audit logs

## Usage Examples

### Creating Client Portal User
```javascript
const response = await fetch('/api/client-portal', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    clientId: 'client-123',
    email: 'client@example.com',
    firstName: 'John',
    lastName: 'Doe',
    preferences: {
      notifications: { email: true, sms: false, push: true },
      dashboard: { defaultView: 'overview', itemsPerPage: 10 },
      privacy: { showPaymentHistory: true, allowDocumentDownload: true }
    }
  })
});
```

### Processing Invoice Payment
```javascript
const response = await fetch(`/api/client-portal/${clientId}/invoices/${invoiceId}/pay`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    paymentMethodId: 'pm-123',
    amount: 1000,
    paymentData: {
      billingAddress: { /* address data */ }
    }
  })
});
```

### Uploading Document
```javascript
const formData = new FormData();
formData.append('file', file);
formData.append('type', 'invoice');
formData.append('description', 'Monthly invoice');

const response = await fetch(`/api/client-portal/${clientId}/documents`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Sending Message
```javascript
const response = await fetch(`/api/client-portal/${clientId}/messages`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    subject: 'Invoice Payment Reminder',
    content: 'Your invoice is due in 3 days.',
    isUrgent: false,
    attachments: ['doc-123']
  })
});
```

## Configuration

### Environment Variables
```bash
# Payment Processors
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_ENVIRONMENT=sandbox

# File Storage
FILE_STORAGE_ENDPOINT=https://your-storage.com
FILE_STORAGE_ACCESS_KEY=your-access-key
FILE_STORAGE_SECRET_KEY=your-secret-key
FILE_STORAGE_BUCKET=your-bucket

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h
```

### Database Schema
The client portal requires the following database tables:
- `client_portal_users` - Client portal user accounts
- `client_invoices` - Client invoice data
- `documents` - Document storage metadata
- `client_messages` - Message system
- `client_activity` - Activity tracking
- `client_notifications` - Notification system
- `payment_methods` - Payment method storage
- `payment_intents` - Payment processing

## Monitoring & Analytics

### Client Activity Tracking
- **Login Tracking**: User authentication events
- **Page Views**: Dashboard and feature usage
- **Payment Events**: Payment processing analytics
- **Document Activity**: Upload and download tracking

### Performance Metrics
- **Response Times**: API endpoint performance
- **Error Rates**: Failed request tracking
- **Usage Patterns**: Feature adoption analytics
- **Payment Success**: Payment processing rates

### Business Intelligence
- **Client Engagement**: Portal usage analytics
- **Payment Trends**: Payment method preferences
- **Document Usage**: Most accessed documents
- **Communication Patterns**: Message frequency and response times

## Best Practices

### Security
- Implement proper authentication and authorization
- Use HTTPS for all communications
- Encrypt sensitive data at rest and in transit
- Regular security audits and penetration testing

### Performance
- Implement caching for frequently accessed data
- Use CDN for static assets
- Optimize database queries
- Monitor and alert on performance issues

### User Experience
- Provide clear navigation and intuitive interface
- Implement responsive design for mobile devices
- Use progressive enhancement for core functionality
- Regular usability testing and feedback collection

### Maintenance
- Regular security updates and patches
- Monitor system health and performance
- Backup data regularly
- Document all changes and updates

## Troubleshooting

### Common Issues
- **Authentication Failures**: Check JWT token validity and expiration
- **Payment Processing Errors**: Verify payment processor configuration
- **File Upload Issues**: Check file size limits and storage configuration
- **Message Delivery Problems**: Verify notification service configuration

### Debugging
- Enable detailed logging for client portal operations
- Monitor API response times and error rates
- Check database connection and query performance
- Verify external service integrations (payment processors, file storage)

## Future Enhancements

### Planned Features
- **Mobile App**: Native mobile application for client portal
- **Advanced Analytics**: Enhanced reporting and insights
- **API Integration**: Third-party service integrations
- **Automation**: Workflow automation and triggers

### Integration Opportunities
- **CRM Systems**: Customer relationship management integration
- **Accounting Software**: Direct integration with accounting platforms
- **Communication Tools**: Slack, Teams, and other communication platforms
- **Business Intelligence**: Advanced analytics and reporting tools










