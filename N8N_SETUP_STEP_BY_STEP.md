# 🔧 n8n Setup - Step by Step Guide

## 🎯 **IMMEDIATE STEPS TO FIX N8N:**

### **Step 1: Access n8n Interface**
1. **Open your browser**
2. **Go to**: http://localhost:5678
3. **You'll see the n8n setup page**

### **Step 2: Create Admin Account**
1. **Fill in the form**:
   - **Email**: `admin@verigrade.com`
   - **Password**: `verigrade123`
   - **First Name**: `Admin`
   - **Last Name**: `User`
2. **Click "Create Account"**

### **Step 3: Import Workflow**
1. **Click the "+" button** to create new workflow
2. **Click "Import from file"**
3. **Upload**: `simple-verigrade-workflow.json`
4. **The workflow will be imported**

### **Step 4: Activate Workflow**
1. **Click the toggle switch** to activate the workflow
2. **The workflow is now running**

### **Step 5: Test Integration**
1. **Go back to**: http://localhost:3000/dashboard
2. **Click "Run Analysis"** in the MCP Integration section
3. **It should now work with n8n!**

## 🔧 **ALTERNATIVE: Direct Setup via API**

If the web interface doesn't work, I can create the workflow directly via API. Just let me know!

## 🎯 **WHAT YOU'LL SEE AFTER SETUP:**

### **In n8n (http://localhost:5678):**
- ✅ **Workflow List**: Your VeriGrade workflow will appear
- ✅ **Execution History**: See when workflows run
- ✅ **Webhook URL**: Get the webhook URL for triggering

### **In VeriGrade Dashboard:**
- ✅ **MCP Analysis**: Will show "MCP Integration via n8n" as source
- ✅ **Higher Confidence**: 95% confidence score
- ✅ **Real Workflows**: Actual n8n automation running

## 🚀 **EXPECTED RESULTS:**

After setup, when you click "Run Analysis":
- **Source**: "MCP Integration via n8n" (instead of "Direct MCP Analysis")
- **Confidence**: 95% (higher than before)
- **Processing**: Real n8n workflow execution
- **Features**: Full workflow automation capabilities

## 🔧 **TROUBLESHOOTING:**

### **If n8n won't load:**
1. **Check**: http://localhost:5678
2. **Refresh** the page
3. **Clear browser cache**

### **If workflow won't import:**
1. **Use the simple workflow**: `simple-verigrade-workflow.json`
2. **Make sure n8n is activated**
3. **Check the webhook URL**

### **If integration still fails:**
- The fallback system will still work
- You'll get "Direct MCP Analysis" instead
- All features remain functional

## 🎉 **YOU'RE ALMOST THERE!**

**Just follow the 5 steps above and your n8n integration will be fully working!**

**The workflow file `simple-verigrade-workflow.json` is ready to import.** 🚀






