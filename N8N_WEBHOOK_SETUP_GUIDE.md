# 🔧 **N8N WEBHOOK SETUP GUIDE**

## ❌ **CURRENT ISSUE:**
Your N8N cloud webhook is returning "Application not found" (404 error) because the webhook endpoint needs to be properly configured in your N8N workflow.

---

## ✅ **SOLUTION: CREATE WEBHOOK NODE IN N8N**

### **Step 1: Access Your N8N Cloud Dashboard**
1. **Visit:** https://robbie313.app.n8n.cloud
2. **Login** with your N8N cloud credentials
3. **Go to Workflows** tab

### **Step 2: Create a New Workflow**
1. **Click "New Workflow"**
2. **Add a Webhook Node:**
   - Search for "Webhook" in the nodes panel
   - Drag "Webhook" node to your workflow
   - Set HTTP Method to "POST"
   - Set Path to `/verigrade-webhook`
   - **Save the workflow**

### **Step 3: Get Your Webhook URL**
After creating the webhook node, N8N will generate a URL like:
```
https://robbie313.app.n8n.cloud/webhook/verigrade/[unique-id]
```

### **Step 4: Update VeriGrade Backend**
Replace the webhook URL in your backend with the new URL from Step 3.

---

## 🔄 **ALTERNATIVE: USE EXISTING WEBHOOK**

If you already have a webhook node, you need to:

### **Check Your Current Workflow:**
1. **Open your workflow** in N8N cloud
2. **Find the Webhook node**
3. **Copy the exact webhook URL**
4. **Make sure the workflow is active**

### **Common Webhook URL Patterns:**
```
https://robbie313.app.n8n.cloud/webhook/[workflow-name]/[node-id]
https://robbie313.app.n8n.cloud/webhook-test/[unique-id]
```

---

## 🛠️ **QUICK FIX: UPDATE BACKEND**

Once you have the correct webhook URL, update your backend:

### **Edit:** `backend/ai-features-server.js`
Find these lines:
```javascript
const n8nCloudUrl = 'https://robbie313.app.n8n.cloud/webhook-test/56e8e602-4918-4292-b624-19e4b2fd389d';
```

Replace with your actual webhook URL:
```javascript
const n8nCloudUrl = 'https://robbie313.app.n8n.cloud/webhook/verigrade/[your-actual-id]';
```

---

## 🧪 **TESTING STEPS**

### **1. Test Webhook URL Directly:**
```bash
curl -X POST https://robbie313.app.n8n.cloud/webhook/[your-path] \
  -H "Content-Type: application/json" \
  -d '{"test": "ping"}'
```

### **2. Test from VeriGrade Backend:**
```bash
curl -X POST http://localhost:3001/n8n/webhook/invoice-created \
  -H "Content-Type: application/json" \
  -d '{"invoiceId": "test123", "customerEmail": "test@example.com", "amount": 100}'
```

---

## 📋 **WORKFLOW TEMPLATE**

Here's a simple workflow you can create in N8N:

### **Node 1: Webhook**
- **Method:** POST
- **Path:** `/verigrade-webhook`
- **Response:** JSON

### **Node 2: Code (Optional)**
```javascript
// Process the incoming data
const data = $input.first().json;
console.log('Received from VeriGrade:', data);

// Return success response
return [{ json: { success: true, message: 'Received' } }];
```

### **Node 3: Email (Optional)**
- **Send email notification** when invoice is created

---

## 🎯 **EXPECTED RESULT**

After proper setup, you should see:
- ✅ **Webhook URL responding** with 200 OK
- ✅ **VeriGrade backend** sending events successfully
- ✅ **N8N workflow** executing when triggered
- ✅ **Console logs** showing received data

---

## 🆘 **TROUBLESHOOTING**

### **If still getting 404:**
1. **Check workflow is active** in N8N cloud
2. **Verify webhook path** is correct
3. **Make sure webhook node** is properly configured
4. **Check N8N cloud status** at https://status.n8n.io

### **If getting 500 errors:**
1. **Check workflow logic** in N8N
2. **Verify webhook node** is connected to other nodes
3. **Test workflow manually** in N8N editor

---

## 🚀 **NEXT STEPS**

1. **Create webhook node** in N8N cloud workflow
2. **Copy the webhook URL**
3. **Update VeriGrade backend** with correct URL
4. **Test the integration**
5. **Build your automation workflows**

---

**Once you have the correct webhook URL from your N8N cloud workflow, the integration will work perfectly!** 🎉

