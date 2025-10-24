# Verigrade Bookkeeping Platform - API Endpoints

## Overview
This document provides a comprehensive list of all API endpoints available in the Verigrade bookkeeping platform.

## Base URL
- **Development**: `http://localhost:3001/api`
- **Production**: `https://api.verigrade.com/api`

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Core Features

### 1. User Management
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile
- `POST /auth/forgot-password` - Forgot password
- `POST /auth/reset-password` - Reset password

### 2. Company Management
- `GET /companies` - Get user companies
- `POST /companies` - Create company
- `GET /companies/:id` - Get company details
- `PUT /companies/:id` - Update company
- `DELETE /companies/:id` - Delete company
- `POST /companies/:id/switch` - Switch active company

### 3. Chart of Accounts
- `GET /chart-of-accounts` - Get chart of accounts
- `POST /chart-of-accounts` - Create account
- `GET /chart-of-accounts/:id` - Get account details
- `PUT /chart-of-accounts/:id` - Update account
- `DELETE /chart-of-accounts/:id` - Delete account

### 4. Transactions
- `GET /transactions` - Get transactions
- `POST /transactions` - Create transaction
- `GET /transactions/:id` - Get transaction details
- `PUT /transactions/:id` - Update transaction
- `DELETE /transactions/:id` - Delete transaction
- `POST /transactions/bulk` - Bulk operations

### 5. Invoices
- `GET /invoices` - Get invoices
- `POST /invoices` - Create invoice
- `GET /invoices/:id` - Get invoice details
- `PUT /invoices/:id` - Update invoice
- `DELETE /invoices/:id` - Delete invoice
- `POST /invoices/:id/send` - Send invoice
- `POST /invoices/:id/pay` - Mark as paid

### 6. Expenses
- `GET /expenses` - Get expenses
- `POST /expenses` - Create expense
- `GET /expenses/:id` - Get expense details
- `PUT /expenses/:id` - Update expense
- `DELETE /expenses/:id` - Delete expense
- `POST /expenses/:id/approve` - Approve expense
- `POST /expenses/:id/reject` - Reject expense

## Advanced Features

### 7. SaaS Metrics
- `GET /saas-metrics/dashboard/:userId` - Get SaaS metrics dashboard
- `GET /saas-metrics/mrr/:userId` - Get MRR data
- `GET /saas-metrics/arr/:userId` - Get ARR data
- `GET /saas-metrics/churn/:userId` - Get churn analysis
- `GET /saas-metrics/ltv/:userId` - Get LTV analysis

### 8. Revenue Recognition
- `GET /revenue-recognition/contracts/:userId` - Get revenue contracts
- `POST /revenue-recognition/recognize/:userId` - Recognize revenue
- `GET /revenue-recognition/deferred/:userId` - Get deferred revenue
- `POST /revenue-recognition/modify/:userId` - Modify contract

### 9. Cohort Analysis
- `GET /cohort-analysis/retention/:userId` - Get retention cohorts
- `GET /cohort-analysis/revenue/:userId` - Get revenue cohorts
- `GET /cohort-analysis/expansion/:userId` - Get expansion cohorts
- `GET /cohort-analysis/churn/:userId` - Get churn cohorts

### 10. Cash Flow Forecasting
- `GET /cash-flow-forecast/30/:userId` - 30-day forecast
- `GET /cash-flow-forecast/60/:userId` - 60-day forecast
- `GET /cash-flow-forecast/90/:userId` - 90-day forecast
- `GET /cash-flow-forecast/180/:userId` - 180-day forecast
- `POST /cash-flow-forecast/scenario/:userId` - Create scenario

### 11. Predictive Analytics
- `GET /predictive-engine/churn/:userId` - Get churn predictions
- `GET /predictive-engine/expansion/:userId` - Get expansion opportunities
- `GET /predictive-engine/payment-failure/:userId` - Get payment failure predictions
- `GET /predictive-engine/ltv/:userId` - Get LTV predictions

### 12. Smart Insights
- `GET /smart-insights/dashboard/:userId` - Get insights dashboard
- `GET /smart-insights/trends/:userId` - Get trend insights
- `GET /smart-insights/recommendations/:userId` - Get recommendations
- `GET /smart-insights/benchmarks/:userId` - Get benchmark insights

## Machine Learning & AI

### 13. ML Categorization
- `POST /ml-categorization/categorize/:userId` - Categorize transactions
- `GET /ml-categorization/confidence/:userId` - Get confidence scores
- `POST /ml-categorization/feedback/:userId` - Provide feedback
- `GET /ml-categorization/patterns/:userId` - Get pattern recognition

### 14. NLP Queries
- `POST /nlp-query/process/:userId` - Process natural language query
- `GET /nlp-query/intent/:userId` - Get intent classification
- `POST /nlp-query/conversation/:userId` - Start conversation
- `GET /nlp-query/history/:userId` - Get query history

## Tax & Compliance

### 15. Global Tax
- `GET /global-tax/nexus/:userId` - Get economic nexus status
- `POST /global-tax/calculate/:userId` - Calculate global tax
- `GET /global-tax/compliance/:userId` - Get compliance status
- `POST /global-tax/optimize/:userId` - Get tax optimization

### 16. Payroll Tax
- `GET /payroll-tax/calculations/:userId` - Get payroll tax calculations
- `POST /payroll-tax/withhold/:userId` - Calculate withholding
- `GET /payroll-tax/forms/:userId` - Get tax forms
- `POST /payroll-tax/generate-w2/:userId` - Generate W-2

### 17. Compliance Automation
- `GET /compliance/status/:userId` - Get compliance status
- `POST /compliance/check/:userId` - Run compliance check
- `GET /compliance/reports/:userId` - Get compliance reports
- `POST /compliance/audit/:userId` - Prepare audit

## Banking & Payments

### 18. Bank Reconciliation 2.0
- `GET /bank-reconciliation-2/accounts/:userId` - Get bank accounts
- `POST /bank-reconciliation-2/match/:userId` - Match transactions
- `GET /bank-reconciliation-2/discrepancies/:userId` - Get discrepancies
- `POST /bank-reconciliation-2/resolve/:userId` - Resolve discrepancies

### 19. Payment Processor Hub
- `GET /payment-processor-hub/processors/:userId` - Get payment processors
- `POST /payment-processor-hub/process/:userId` - Process payment
- `GET /payment-processor-hub/fees/:userId` - Get fee breakdown
- `POST /payment-processor-hub/reconcile/:userId` - Reconcile payments

## Scenario Modeling & Planning

### 20. Scenario Modeling
- `POST /scenario-modeling/what-if/:userId` - Run what-if scenario
- `POST /scenario-modeling/price-increase/:userId` - Model price increase
- `POST /scenario-modeling/churn-reduction/:userId` - Model churn reduction
- `POST /scenario-modeling/funding-runway/:userId` - Calculate funding runway
- `POST /scenario-modeling/break-even/:userId` - Project break-even

### 21. Budget vs Actual
- `GET /budget-actual/dashboard/:userId` - Get budget dashboard
- `POST /budget-actual/create/:userId` - Create budget
- `POST /budget-actual/analyze-variance/:userId/:budgetId` - Analyze variance
- `GET /budget-actual/templates` - Get budget templates

## Core Business Features

### 22. Expense Approval
- `POST /expense-approval/workflow/:userId` - Create approval workflow
- `POST /expense-approval/approve/:userId/:expenseId` - Approve expense
- `POST /expense-approval/delegate/:userId/:approvalId` - Delegate approval
- `POST /expense-approval/enforce-policy/:userId/:expenseId` - Enforce policy

### 23. Purchase Orders
- `POST /purchase-order/create/:userId` - Create purchase order
- `POST /purchase-order/submit-approval/:poId` - Submit for approval
- `POST /purchase-order/match-bill/:poId/:billId` - Match PO to bill
- `POST /purchase-order/three-way-match/:poId/:receiptId/:billId` - Three-way matching

### 24. Vendor Bills
- `POST /vendor-bill/capture/:userId` - Capture bill
- `POST /vendor-bill/submit-approval/:billId` - Submit for approval
- `POST /vendor-bill/schedule-payment/:billId` - Schedule payment
- `GET /vendor-bill/payment-history/:vendorId` - Get payment history

### 25. Sales Tax
- `POST /sales-tax/calculate/:userId` - Calculate sales tax
- `POST /sales-tax/rates-by-address` - Get tax rates by address
- `GET /sales-tax/product-rules/:productId` - Get product taxability rules
- `POST /sales-tax/exemption/:userId` - Process tax exemption

## Mobile Features

### 26. GPS Mileage
- `POST /mileage/start-trip/:userId` - Start trip
- `POST /mileage/stop-trip/:tripId` - Stop trip
- `GET /mileage/dashboard/:userId` - Get mileage dashboard
- `GET /mileage/irs-report/:userId` - Generate IRS report

### 27. Voice Notes
- `POST /voice-notes/transcribe/:userId` - Transcribe voice note
- `POST /voice-notes/command/:userId` - Process voice command
- `POST /voice-notes/attach/:transactionId` - Attach voice memo
- `GET /voice-notes/dashboard/:userId` - Get voice notes dashboard

### 28. Apple Watch
- `POST /apple-watch/complications/:userId` - Setup complications
- `POST /apple-watch/expense/:userId` - Create expense from watch
- `POST /apple-watch/time-tracking/:userId` - Start/stop time tracking
- `GET /apple-watch/dashboard/:userId` - Get watch dashboard

## File Management

### 29. File Upload
- `POST /files/upload/:userId` - Upload file
- `GET /files/:id` - Get file
- `DELETE /files/:id` - Delete file
- `POST /files/ocr/:id` - Process OCR

### 30. Document Viewer
- `GET /document-viewer/:id` - View document
- `POST /document-viewer/annotate/:id` - Add annotation
- `GET /document-viewer/export/:id` - Export document

## Reporting

### 31. Reports
- `GET /reports/templates` - Get report templates
- `POST /reports/generate/:userId` - Generate report
- `GET /reports/:id` - Get report
- `POST /reports/schedule/:userId` - Schedule report

### 32. Analytics
- `GET /analytics/dashboard/:userId` - Get analytics dashboard
- `GET /analytics/trends/:userId` - Get trend analytics
- `GET /analytics/benchmarks/:userId` - Get benchmark analytics

## Integration

### 33. Third-Party Integrations
- `GET /integrations/quickbooks/:userId` - QuickBooks integration
- `GET /integrations/xero/:userId` - Xero integration
- `GET /integrations/shopify/:userId` - Shopify integration
- `GET /integrations/salesforce/:userId` - Salesforce integration

## Enterprise Features

### 34. Multi-Company
- `GET /multi-company/companies/:userId` - Get user companies
- `POST /multi-company/switch/:userId` - Switch company
- `GET /multi-company/permissions/:userId` - Get permissions

### 35. SSO
- `POST /sso/saml/:userId` - SAML authentication
- `POST /sso/oauth/:userId` - OAuth authentication
- `GET /sso/providers/:userId` - Get SSO providers

## Client Portal

### 36. Client Dashboard
- `GET /client-portal/dashboard/:clientId` - Get client dashboard
- `GET /client-portal/invoices/:clientId` - Get client invoices
- `POST /client-portal/payment/:clientId` - Process payment
- `GET /client-portal/documents/:clientId` - Get client documents

## Security & Compliance

### 37. Security
- `GET /security/audit-log/:userId` - Get audit log
- `POST /security/penetration-test/:userId` - Run penetration test
- `GET /security/compliance/:userId` - Get compliance status

### 38. GDPR
- `GET /gdpr/data/:userId` - Get user data
- `POST /gdpr/export/:userId` - Export user data
- `DELETE /gdpr/delete/:userId` - Delete user data

## Performance & Monitoring

### 39. Performance
- `GET /performance/metrics/:userId` - Get performance metrics
- `GET /performance/cache/:userId` - Get cache status
- `POST /performance/optimize/:userId` - Optimize performance

### 40. Monitoring
- `GET /monitoring/health` - Health check
- `GET /monitoring/metrics` - System metrics
- `GET /monitoring/logs` - System logs

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

## Rate Limiting

- **Standard endpoints**: 1000 requests per hour
- **Heavy endpoints**: 100 requests per hour
- **Authentication endpoints**: 10 requests per minute

## Response Format

All successful responses follow this format:

```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

## Pagination

List endpoints support pagination:

```
GET /endpoint?page=1&limit=20&sort=createdAt&order=desc
```

## Filtering

Many endpoints support filtering:

```
GET /endpoint?filter[status]=active&filter[date_from]=2024-01-01
```

## Sorting

List endpoints support sorting:

```
GET /endpoint?sort=createdAt&order=desc
```

## Search

Search endpoints support full-text search:

```
GET /endpoint?search=keyword&fields=name,description
```

## Webhooks

Webhook endpoints for real-time updates:

- `POST /webhooks/transactions` - Transaction updates
- `POST /webhooks/invoices` - Invoice updates
- `POST /webhooks/payments` - Payment updates
- `POST /webhooks/expenses` - Expense updates

## SDKs

Official SDKs available for:
- JavaScript/TypeScript
- Python
- PHP
- Ruby
- Go
- Java

## Support

For API support:
- **Email**: api-support@verigrade.com
- **Documentation**: https://docs.verigrade.com
- **Status Page**: https://status.verigrade.com







