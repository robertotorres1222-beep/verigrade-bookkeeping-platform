# 🔐 n8n JWT Integration with VeriGrade - Complete Guide

## 🎯 **Your n8n Authentication Token**

**JWT Token**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNjg3YWI3My04N2JiLTQzMmUtOGJlNC0wOWE0NzI2NzQzMGEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU5OTEyNjIwfQ.MKB7JUXYs6csm7iBBftgo7sWsidq4ynvO2kn-2p8k5c`

**User ID**: `2687ab73-87bb-432e-8be4-09a47267430a`

## 🚀 **How to Use This Token with VeriGrade**

### **1. API Authentication**
Use this token to authenticate with n8n's REST API:

```bash
# Get your workflows
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNjg3YWI3My04N2JiLTQzMmUtOGJlNC0wOWE0NzI2NzQzMGEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU5OTEyNjIwfQ.MKB7JUXYs6csm7iBBftgo7sWsidq4ynvO2kn-2p8k5c" \
  http://localhost:5678/rest/workflows

# Execute a workflow
curl -X POST \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNjg3YWI3My04N2JiLTQzMmUtOGJlNC0wOWE0NzI2NzQzMGEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU5OTEyNjIwfQ.MKB7JUXYs6csm7iBBftgo7sWsidq4ynvO2kn-2p8k5c" \
  -H "Content-Type: application/json" \
  -d '{"workflowId": "your-workflow-id"}' \
  http://localhost:5678/rest/executions
```

### **2. Webhook Authentication**
When creating webhooks in n8n, use this token for authentication:

```javascript
// In your VeriGrade backend, call n8n webhooks
const response = await fetch('http://localhost:5678/webhook/your-webhook-id', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNjg3YWI3My04N2JiLTQzMmUtOGJlNC0wOWE0NzI2NzQzMGEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU5OTEyNjIwfQ.MKB7JUXYs6csm7iBBftgo7sWsidq4ynvO2kn-2p8k5c',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    invoiceData: {
      customerName: 'John Doe',
      amount: 1500.00,
      dueDate: '2025-11-08'
    }
  })
});
```

### **3. VeriGrade Backend Integration**
Add this token to your VeriGrade backend for n8n integration:

```javascript
// Add to your backend/server.js
const N8N_JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNjg3YWI3My04N2JiLTQzMmUtOGJlNC0wOWE0NzI2NzQzMGEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU5OTEyNjIwfQ.MKB7JUXYs6csm7iBBftgo7sWsidq4ynvO2kn-2p8k5c';

// Function to trigger n8n workflows
async function triggerN8nWorkflow(workflowId, data) {
  try {
    const response = await fetch(`http://localhost:5678/rest/executions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${N8N_JWT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        workflowId,
        data
      })
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error triggering n8n workflow:', error);
    throw error;
  }
}
```

## 🔧 **Sample Integration Workflows**

### **1. Invoice Processing Workflow**
```javascript
// When a new invoice is created in VeriGrade
app.post('/api/invoices', async (req, res) => {
  const invoice = req.body;
  
  // Save invoice to database
  const savedInvoice = await saveInvoice(invoice);
  
  // Trigger n8n workflow for processing
  await triggerN8nWorkflow('invoice-processing-workflow-id', {
    invoice: savedInvoice,
    action: 'created'
  });
  
  res.json({ success: true, invoice: savedInvoice });
});
```

### **2. Customer Onboarding Workflow**
```javascript
// When a new customer is registered
app.post('/api/customers', async (req, res) => {
  const customer = req.body;
  
  // Save customer to database
  const savedCustomer = await saveCustomer(customer);
  
  // Trigger n8n workflow for onboarding
  await triggerN8nWorkflow('customer-onboarding-workflow-id', {
    customer: savedCustomer,
    action: 'registered'
  });
  
  res.json({ success: true, customer: savedCustomer });
});
```

### **3. Bank Reconciliation Workflow**
```javascript
// When bank transactions are imported
app.post('/api/bank/import', async (req, res) => {
  const transactions = req.body.transactions;
  
  // Process transactions
  const processedTransactions = await processTransactions(transactions);
  
  // Trigger n8n workflow for reconciliation
  await triggerN8nWorkflow('bank-reconciliation-workflow-id', {
    transactions: processedTransactions,
    action: 'imported'
  });
  
  res.json({ success: true, processed: processedTransactions });
});
```

## 🎯 **Available n8n API Endpoints**

With your JWT token, you can access:

### **Workflows**
```bash
GET    /rest/workflows              # List all workflows
POST   /rest/workflows              # Create workflow
GET    /rest/workflows/{id}         # Get specific workflow
PUT    /rest/workflows/{id}         # Update workflow
DELETE /rest/workflows/{id}         # Delete workflow
```

### **Executions**
```bash
GET    /rest/executions             # List executions
POST   /rest/executions             # Execute workflow
GET    /rest/executions/{id}        # Get execution details
DELETE /rest/executions/{id}        # Delete execution
```

### **Webhooks**
```bash
GET    /rest/webhook-test/{webhookId} # Test webhook
POST   /rest/webhook/{webhookId}      # Trigger webhook
```

### **Credentials**
```bash
GET    /rest/credentials            # List credentials
POST   /rest/credentials            # Create credential
GET    /rest/credentials/{id}       # Get credential
PUT    /rest/credentials/{id}       # Update credential
DELETE /rest/credentials/{id}       # Delete credential
```

## 🔐 **Security Best Practices**

### **1. Environment Variables**
Store your JWT token in environment variables:

```bash
# Add to your .env file
N8N_JWT_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNjg3YWI3My04N2JiLTQzMmUtOGJlNC0wOWE0NzI2NzQzMGEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU5OTEyNjIwfQ.MKB7JUXYs6csm7iBBftgo7sWsidq4ynvO2kn-2p8k5c
N8N_BASE_URL=http://localhost:5678
```

### **2. Token Validation**
```javascript
// Validate token before use
function validateN8nToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    // Check if token is not expired (if exp claim exists)
    if (payload.exp && payload.exp < now) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}
```

## 🚀 **Quick Start Integration**

### **Step 1: Test Your Token**
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNjg3YWI3My04N2JiLTQzMmUtOGJlNC0wOWE0NzI2NzQzMGEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU5OTEyNjIwfQ.MKB7JUXYs6csm7iBBftgo7sWsidq4ynvO2kn-2p8k5c" \
  http://localhost:5678/rest/workflows
```

### **Step 2: Create Your First Workflow**
1. Go to http://localhost:5678
2. Create a new workflow
3. Add webhook trigger
4. Add HTTP request node to call VeriGrade APIs
5. Save and activate

### **Step 3: Test Integration**
```bash
# Trigger your webhook
curl -X POST http://localhost:5678/webhook/your-webhook-id \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## 🎉 **You're Ready to Integrate!**

Your n8n JWT token is now ready for use with your VeriGrade platform. You can:

- ✅ **Access n8n APIs** with full authentication
- ✅ **Create automated workflows** for your bookkeeping platform
- ✅ **Trigger workflows** from your VeriGrade backend
- ✅ **Build powerful integrations** between systems

**Start building your automation workflows now!** 🚀






