# N8N Integration Guide for VeriGrade

## 🚀 Quick Start

1. **Start N8N:**
   ```bash
   .\start-n8n.ps1
   ```

2. **Access N8N Interface:**
   - Open: http://localhost:5678
   - Create account on first visit

3. **Configure VeriGrade Integration:**
   - Go to Settings > Credentials
   - Add "VeriGrade API" credentials
   - Set API URL: http://localhost:3001
   - Set API Key: (get from VeriGrade backend)

## 🔧 Workflow Examples

### Invoice Processing Workflow
- **Trigger:** Webhook when invoice created
- **Actions:** 
  - Process invoice data
  - Send email notification
  - Update customer records

### Transaction Categorization
- **Trigger:** Scheduled (hourly)
- **Actions:**
  - Get uncategorized transactions
  - Use AI to categorize
  - Update transaction records

### Email Automation
- **Trigger:** Various conditions
- **Actions:**
  - Send invoice reminders
  - Notify of overdue payments
  - Send monthly reports

## 📊 Available Webhooks

### From VeriGrade to N8N:
- `/webhook/invoice-created` - New invoice created
- `/webhook/transaction-added` - New transaction added
- `/webhook/payment-received` - Payment received
- `/webhook/user-registered` - New user registered

### From N8N to VeriGrade:
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `POST /api/invoices` - Create invoice
- `POST /api/notifications` - Send notification

## 🎯 Business Process Automation

### Daily Tasks:
- Categorize new transactions
- Send invoice reminders
- Generate daily reports
- Sync bank data

### Weekly Tasks:
- Send weekly summaries
- Process recurring invoices
- Update customer records
- Generate analytics

### Monthly Tasks:
- Send monthly statements
- Process payroll
- Generate tax reports
- Archive old data

## 🔐 Security

- N8N runs on localhost:5678
- Uses VeriGrade JWT tokens
- Encrypted credentials storage
- Secure webhook endpoints

## 📈 Monitoring

- Check workflow executions
- Monitor webhook performance
- Review error logs
- Track automation metrics

## 🆘 Troubleshooting

### Common Issues:
1. **N8N won't start:** Check port 5678 availability
2. **Webhook not working:** Verify VeriGrade backend is running
3. **Credentials error:** Check API keys and URLs
4. **Workflow fails:** Check node configurations

### Support:
- N8N Documentation: https://docs.n8n.io
- VeriGrade API Docs: http://localhost:3001/api
- GitHub Issues: Create issue in repository

## 🚀 Next Steps

1. Create your first workflow
2. Test with sample data
3. Set up monitoring
4. Scale to production
5. Add more integrations

Happy automating! 🤖
