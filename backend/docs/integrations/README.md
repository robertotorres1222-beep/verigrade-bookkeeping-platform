# Third-Party Integrations

This document describes the comprehensive third-party integration system built for the VeriGrade Bookkeeping Platform.

## Overview

The integration system provides a unified framework for connecting with external services including accounting software, e-commerce platforms, CRM systems, and communication tools. It supports OAuth 2.0 authentication, webhook processing, rate limiting, and bidirectional data synchronization.

## Supported Integrations

### Accounting Software
- **QuickBooks Online** - Customer, invoice, payment, and item synchronization
- **Xero** - Contact, invoice, payment, and item management

### E-commerce Platforms
- **Shopify** - Order, product, and customer data synchronization

### CRM Systems
- **Salesforce** - Account, contact, opportunity, and lead management

### Communication Tools
- **Slack** - Notifications, messaging, and business alerts

## Architecture

### Integration Framework
The core integration framework (`IntegrationFramework.ts`) provides:
- OAuth 2.0 flow handling
- Token management and refresh
- Rate limiting per integration
- Webhook signature verification
- Connection management
- Sync job tracking

### Service Layer
Each integration has a dedicated service class:
- `QuickBooksService.ts` - QuickBooks Online API integration
- `XeroService.ts` - Xero API integration
- `ShopifyService.ts` - Shopify API integration
- `SalesforceService.ts` - Salesforce API integration
- `SlackService.ts` - Slack API integration

### Controller Layer
- `integrationController.ts` - General integration management
- `quickbooksController.ts` - QuickBooks-specific operations
- `slackController.ts` - Slack-specific operations
- `webhookController.ts` - Webhook event processing

## API Endpoints

### General Integration Management
```
GET /api/integrations - List available integrations
GET /api/integrations/:integrationId/auth-url - Get OAuth authorization URL
GET /api/integrations/:integrationId/callback - Handle OAuth callback
GET /api/integrations/connections - Get user's connected integrations
DELETE /api/integrations/connections/:connectionId - Disconnect integration
POST /api/integrations/connections/:connectionId/sync - Start sync job
GET /api/integrations/sync/:jobId - Get sync job status
```

### QuickBooks Integration
```
GET /api/integrations/quickbooks/connections/:connectionId/sync/customers - Sync customers
GET /api/integrations/quickbooks/connections/:connectionId/sync/invoices - Sync invoices
GET /api/integrations/quickbooks/connections/:connectionId/sync/payments - Sync payments
GET /api/integrations/quickbooks/connections/:connectionId/sync/items - Sync items
POST /api/integrations/quickbooks/connections/:connectionId/sync/full - Full sync
POST /api/integrations/quickbooks/connections/:connectionId/customers - Create customer
POST /api/integrations/quickbooks/connections/:connectionId/invoices - Create invoice
```

### Slack Integration
```
GET /api/integrations/slack/connections/:connectionId/channels - Get channels
GET /api/integrations/slack/connections/:connectionId/users - Get users
GET /api/integrations/slack/connections/:connectionId/channels/:channelId/messages - Get messages
POST /api/integrations/slack/connections/:connectionId/messages - Send message
POST /api/integrations/slack/connections/:connectionId/notifications/invoice-created - Invoice notification
POST /api/integrations/slack/connections/:connectionId/notifications/payment-received - Payment notification
POST /api/integrations/slack/connections/:connectionId/notifications/low-stock - Low stock notification
POST /api/integrations/slack/connections/:connectionId/notifications/overdue-invoices - Overdue notification
POST /api/integrations/slack/connections/:connectionId/webhook - Setup webhook
```

### Webhook Endpoints
```
POST /api/webhooks/:integrationId - Generic webhook handler
POST /api/webhooks/quickbooks - QuickBooks webhook
POST /api/webhooks/xero - Xero webhook
POST /api/webhooks/shopify - Shopify webhook
POST /api/webhooks/salesforce - Salesforce webhook
POST /api/webhooks/slack - Slack webhook
```

## Configuration

### Environment Variables
```bash
# QuickBooks
QUICKBOOKS_CLIENT_ID=your_client_id
QUICKBOOKS_CLIENT_SECRET=your_client_secret

# Xero
XERO_CLIENT_ID=your_client_id
XERO_CLIENT_SECRET=your_client_secret

# Shopify
SHOPIFY_CLIENT_ID=your_client_id
SHOPIFY_CLIENT_SECRET=your_client_secret

# Salesforce
SALESFORCE_CLIENT_ID=your_client_id
SALESFORCE_CLIENT_SECRET=your_client_secret

# Slack
SLACK_CLIENT_ID=your_client_id
SLACK_CLIENT_SECRET=your_client_secret

# API Base URL for OAuth callbacks
API_BASE_URL=https://your-domain.com
```

## Usage Examples

### Connecting QuickBooks
1. Get authorization URL:
```javascript
const response = await fetch('/api/integrations/quickbooks/auth-url', {
  headers: { Authorization: `Bearer ${token}` }
});
const { authorizationUrl } = await response.json();
```

2. Redirect user to authorization URL
3. Handle callback:
```javascript
const response = await fetch('/api/integrations/quickbooks/callback?code=...', {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Syncing Data
```javascript
// Start full sync
const response = await fetch('/api/integrations/quickbooks/connections/conn123/sync/full', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` }
});

// Check sync status
const statusResponse = await fetch('/api/integrations/sync/job456', {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Sending Slack Notifications
```javascript
// Send invoice notification
await fetch('/api/integrations/slack/connections/conn123/notifications/invoice-created', {
  method: 'POST',
  headers: { 
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    channelId: 'C1234567890',
    invoiceData: {
      invoiceNumber: 'INV-001',
      customerName: 'Acme Corp',
      amount: 1000,
      dueDate: '2024-01-15',
      invoiceUrl: 'https://app.verigrade.com/invoices/123'
    }
  })
});
```

## Rate Limiting

Each integration has configurable rate limits:
- **QuickBooks**: 500 requests/hour
- **Xero**: 1000 requests/hour
- **Shopify**: 40 requests/second
- **Salesforce**: 1000 requests/hour
- **Slack**: 1 request/second

The framework automatically handles rate limiting with exponential backoff.

## Webhook Processing

Webhooks are processed asynchronously with signature verification:
- QuickBooks: `x-intuit-signature`
- Xero: `x-xero-signature`
- Shopify: `x-shopify-hmac-sha256`
- Salesforce: `x-salesforce-signature`
- Slack: `x-slack-signature`

## Error Handling

The integration system includes comprehensive error handling:
- Token refresh on 401 errors
- Exponential backoff for rate limits
- Webhook signature verification
- Connection status tracking
- Sync job error reporting

## Testing

Run integration tests:
```bash
npm test -- --testPathPattern=integrations
```

## Security Considerations

- All OAuth tokens are encrypted at rest
- Webhook signatures are verified
- Rate limiting prevents abuse
- Connection access is user-scoped
- Audit logging for all operations

## Monitoring

Integration health is monitored through:
- Connection status tracking
- Sync job monitoring
- Error rate alerting
- Performance metrics
- Webhook processing logs

## Future Enhancements

- Additional integrations (Stripe, PayPal, etc.)
- Advanced conflict resolution
- Real-time sync capabilities
- Custom field mapping
- Integration marketplace










